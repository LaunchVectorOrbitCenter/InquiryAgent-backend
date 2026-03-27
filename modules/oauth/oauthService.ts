import { HttpStatusCode } from "axios";
import QueryOperators from "../../core/enums/queryOperators";
import { IOauthGoogleLogin } from "./oauthInterface";
import GmailManager from "../../integration/gmailManager";
import { CustomError } from "../../core/errors/custom";
import IJWTPayload from "../../core/interfaces/jwt";
import { IStores } from "../stores/storesInterface";
import StoresRepository from "../stores/storesRepository";





class OauthService {

    /*
   * ╔═══════════════════════════════════╗
   * ║          PUBLIC METHODS           ║
   * ╚═══════════════════════════════════╝
    */

    public async googleOAuth(data: IOauthGoogleLogin, loggedInUser: IJWTPayload) {
        const getStoreConditions: any = [
            {
                param: 'slug',
                value: data.slug,
                operator: QueryOperators.AND
            },
            {
                param: 'tenantId',
                value: loggedInUser.tenantId,
                operator: QueryOperators.AND
            }
        ];

        const store: Partial<IStores> = await StoresRepository.getInstance().GetOneByParams(getStoreConditions, ['storeName']);

        if (!store) throw new CustomError(HttpStatusCode.NotFound, 'The requested store does not exist');
        console.log('Generating Google OAuth URL for store:', data.startDate, data.endDate);
        const oAuthUrl = await GmailManager.getInstance().generateOauthUrl(loggedInUser.tenantId,
            store.storeName, data?.startDate, data?.endDate);

        return { redirectUri: oAuthUrl };
    }

}


export default new OauthService();