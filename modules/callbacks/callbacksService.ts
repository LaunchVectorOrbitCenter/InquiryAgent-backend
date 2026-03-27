import {HttpStatusCode} from "axios";
import QueryOperators from "../../core/enums/queryOperators";
import GmailManager from "../../integration/gmailManager";
import {IGoogleCallbackDTO} from "./callbacksInterface";
import {Utils} from "../../utils/utils";
import {ObjectId} from "mongodb";
import {CustomError} from "../../core/errors/custom";
import {IStores} from "../stores/storesInterface";
import StoresRepository from "../stores/storesRepository";
import SystemAlertsRepository from "../systemAlerts/systemAlertsRepository";
import EmailsJobProcessor from "../../core/jobs/emailsJobProcessor";


class CallbacksService {

    /*
   * ╔═══════════════════════════════════╗
   * ║          PUBLIC METHODS           ║
   * ╚═══════════════════════════════════╝
    */

    public async handleGoogleOauthCallback(data: IGoogleCallbackDTO) {
        const decodedState = JSON.parse(Buffer.from(data.state, "base64").toString());
        console.log('Decoded Google OAuth state:', decodedState);
        const {tenantId, storeName, startDate, endDate, nonce} = decodedState;
        const store: Partial<IStores> = await this.validateStore(storeName, tenantId);
        const credentials = await GmailManager.getInstance().getAccessToken(data.code);
        const userDetails = await GmailManager.getInstance().getUserInfo(credentials.access_token);
        const dataToUpdate: Partial<IStores> = {
            isSupportEmailConnected: true,
            supportEmail: {
                email: userDetails.email,
                accessToken: credentials.access_token,
                refreshToken: credentials.refresh_token
            }
        }
        console.log('Updating store with connected support email...', startDate, endDate);
        await StoresRepository.getInstance().Update(new ObjectId(store._id), dataToUpdate);
        const {
            historyId,
            expiration
        } = await GmailManager.getInstance().watchGmailInbox(credentials.access_token, credentials.refresh_token);

        if (store.alertId) {
            await SystemAlertsRepository.getInstance().Update(new ObjectId(store.alertId), {
                isResolved: true,
                updatedAt: Utils.getCurrentDate()
            });
        }

        await StoresRepository.getInstance().Update(new ObjectId(store._id), {
            lastHistoryId: historyId,
            watchExpiration: expiration,
            alertId: null
        });

        if (startDate && endDate) {
            console.log('Enqueuing email processing job for the connected support email...');
            const jobData = {storeId: store._id.toString(), startDate, endDate};
            EmailsJobProcessor.getInstance().enqueueEmailProcessingJob(jobData);
        }
    }


    // public async handleShopifyOauthCallback(data: IShopifyCallbackDTO, query: Record<string, any>) {
    //     await SecurityManager.validateShopifyCallback(query);
    //     const store: Partial<IStores> = await this.validateStore(data.shop.split('.')[0], data.state);
    //     const token = await ShopifyManager.getInstance().exchangeAccessToken(data.shop, data.code);
    //     const dataToUpdate = {
    //         shopifyStore: {
    //             accessToken: token
    //         },
    //         isShopifyConnected: true
    //     }
    //     await StoresRepository.getInstance().Update(new ObjectId(store._id), dataToUpdate);
    // }


    /*
   * ╔═══════════════════════════════════╗
   * ║          PRIVATE METHODS          ║
   * ╚═══════════════════════════════════╝
    */


    private async validateStore(storename: string, tenantId: string) {
        const slug = Utils.generateSlug(storename);
        const getStoreConditions: any = [
            {
                param: 'tenantId',
                value: tenantId,
                operator: QueryOperators.AND
            },
            {
                param: 'slug',
                value: slug,
                operator: QueryOperators.AND
            }
        ]

        const store = await StoresRepository.getInstance().GetOneByParams(getStoreConditions, ['_id', 'alertId']);
        if (!store) throw new CustomError(HttpStatusCode.BadRequest, 'The specified store is not registered in our platform');
        return store;
    }


}


export default new CallbacksService();