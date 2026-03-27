import { HttpStatusCode } from "axios";
import QueryOperators from "../../core/enums/queryOperators";
import { Utils } from "../../utils/utils";
import StoresModel from "./storesModel";
import { ObjectId } from "mongodb";
import GmailManager from "../../integration/gmailManager";
import ShopifyManager from "../../integration/shopifyManager";
import DisconnectableEntities from "../../core/enums/disconnectableEntities";
import QueryOperationTypes from "../../core/enums/queryOperationTypes";
import FrontendViews from "../../core/enums/frontendViews";
import UserRoles from "../../core/enums/userRoles";
import { CustomError } from "../../core/errors/custom";
import IJWTPayload from "../../core/interfaces/jwt";
import StoresRepository from "./storesRepository";
import { IStores, ICreateStoreDTO, optimizedStoreResponseFields, IListStoresDTO, IGetStoreByIdDTO, IUpdateStoreDTO, IDisconnectStoreDTO, IConnectShopifyDTO, IDeleteStoreDTO } from "./storesInterface";




class StoresService {

    /*
    * ╔══════════════════════════════════════╗
    * ║          PROTECTED METHODS           ║
    * ╚══════════════════════════════════════╝
    */

    protected attachMetaData(data: Partial<IStores>, loggedInUser: IJWTPayload) {
        data.isShopifyConnected = false;
        data.isSupportEmailConnected = false;
        data.tenantId = loggedInUser.tenantId;
        data.createdAt = Utils.getCurrentDate();
        data.createdBy = loggedInUser.id;
    }


    /*
   * ╔═══════════════════════════════════╗
   * ║          PUBLIC METHODS           ║
   * ╚═══════════════════════════════════╝
    */

    public async createStore(data: ICreateStoreDTO, loggedInUser: IJWTPayload) {
        const slug = Utils.generateSlug(data.storeName);
        await this.validateStoreUniqueness(slug);
        data['slug'] = slug;
        this.attachMetaData(data, loggedInUser);
        const newStore = StoresModel.create(data);
        return StoresRepository.getInstance().Add(newStore, optimizedStoreResponseFields);
    }


    public async listStores(data: IListStoresDTO, loggedInUser: IJWTPayload) {
        const listStoresConditions: any = [
            ...(loggedInUser.role !== UserRoles.PLATFORM_ADMIN ? [
                {
                    param: 'tenantId',
                    value: loggedInUser.tenantId,
                    operator: QueryOperators.AND
                }
            ] : []),
            ...(data.view === FrontendViews.EMAIL_QUERIES ? [
                {
                    param: 'maskedName',
                    value: null,
                    operator: QueryOperators.AND,
                    operationType: QueryOperationTypes.NOT_EQUALS
                }
            ] : []),
            ...(
                loggedInUser.role !== UserRoles.PLATFORM_ADMIN &&
                    Array.isArray(loggedInUser?.allowedStores) &&
                    loggedInUser.allowedStores[0] !== '*'
                    ? [
                        {
                            param: '_id',
                            value: loggedInUser.allowedStores.map((storeId: string) => new ObjectId(storeId)),
                            operator: QueryOperators.AND,
                            operationType: QueryOperationTypes.IN
                        }
                    ]
                    : []
            )
        ];

        const columnsToRetrieve = data.fields ? data.fields.split(',') : optimizedStoreResponseFields;

        // const result: Record<string, any> = await StoresRepository.getInstance().GetAll(listStoresConditions, data.paginate, data.continuationToken, data.pageSize, { createdAt: -1 }, columnsToRetrieve);

        const result: Record<string, any> = await StoresRepository.getInstance().GetAll(listStoresConditions, false, null, 0, { createdAt: -1 }, columnsToRetrieve);

        // const paginatedData = Utils.pagination(!result.continuationToken, result.data, result.continuationToken, result.data.length);

        return { stores: result };
    }


    public async getStoreById(data: IGetStoreByIdDTO, loggedInUser: IJWTPayload) {
        if (loggedInUser.allowedStores[0] !== '*' && !loggedInUser.allowedStores.includes(data.storeId)) throw new CustomError(HttpStatusCode.Forbidden, 'You are not allowed to access this store');
        const getStoreConditions: any = [
            {
                param: '_id',
                value: new ObjectId(data.storeId),
                operator: QueryOperators.AND
            },
            {
                param: 'tenantId',
                value: loggedInUser.tenantId,
                operator: QueryOperators.AND
            }
        ];


        const store = await StoresRepository.getInstance().GetOneByParams(getStoreConditions, optimizedStoreResponseFields);

        if (!store) {
            throw new CustomError(HttpStatusCode.NotFound, 'The requested store does not exist');
        }

        return store;
    }


    public async updateStore(data: IUpdateStoreDTO, loggedInUser: IJWTPayload) {
        const { storeId, ...storeDetails } = data;
        const getStoreConditions: any = [
            {
                param: '_id',
                value: new ObjectId(storeId),
                operator: QueryOperators.AND
            },
            {
                param: 'tenantId',
                value: loggedInUser.tenantId,
                operator: QueryOperators.AND
            }
        ];

        const store = await StoresRepository.getInstance().Count(getStoreConditions);

        if (!store) throw new CustomError(HttpStatusCode.NotFound, 'The requested store does not exist');

        const dataToUpdate = {
            ...storeDetails,
            slug: Utils.generateSlug(data.storeName)
        }

        return StoresRepository.getInstance().Update(new ObjectId(data.storeId), dataToUpdate, optimizedStoreResponseFields);
    }


    public async disconnectStore(data: IDisconnectStoreDTO, loggedInUser: IJWTPayload) {
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

        const store: Partial<IStores> = await StoresRepository.getInstance().GetOneByParams(getStoreConditions, ['_id', 'isSupportEmailConnected', 'supportEmail', 'isShopifyConnected']);

        if (!store) throw new CustomError(HttpStatusCode.NotFound, 'The requested store does not exist');


        if (data.disconnectingEntity === DisconnectableEntities.EMAIL) {
            await this.handleSupportEmailDisconnectivity(store, loggedInUser);
        }
        else {
            await this.handleShopifyDisconnectivity(store, loggedInUser);
        }
    }


    public async connectShopify(data: IConnectShopifyDTO, loggedInUser: IJWTPayload) {
        const getStoreByParams: any = [
            {
                param: 'tenantId',
                value: loggedInUser.tenantId,
                operator: QueryOperators.AND
            },
            {
                param: 'slug',
                value: data.storeSlug,
                operator: QueryOperators.AND
            }
        ];

        const store: Partial<IStores> = await StoresRepository.getInstance().GetOneByParams(getStoreByParams, ['_id']);
        if (!store) throw new CustomError(HttpStatusCode.NotFound, 'Store not found');

        const shopifyDomainName: string = await ShopifyManager.getInstance().pullShopifyDomainName(data.storeSlug, data.adminApiKey);

        if (!shopifyDomainName) throw new CustomError(HttpStatusCode.BadRequest, 'The domain name set in the shopify store is not valid');

        const dataToUpdate: Partial<IStores> = {
            maskedName: shopifyDomainName,
            shopifyStore: {
                accessToken: data.adminApiKey
            },
            isShopifyConnected: true
        }
        await StoresRepository.getInstance().Update(new ObjectId(store._id), dataToUpdate);
    }


    public async deleteStore(data: IDeleteStoreDTO, loggedInUser: IJWTPayload) {
        const getStoreConditions: any = [
            {
                param: 'slug',
                value: data.storeSlug,
                operator: QueryOperators.AND
            },
            {
                param: 'tenantId',
                value: loggedInUser.tenantId,
                operator: QueryOperators.AND
            }
        ];

        const store: Partial<IStores> = await StoresRepository.getInstance().GetOneByParams(getStoreConditions, ['_id', 'supportEmail', 'isSupportEmailConnected']);

        if (!store) {
            throw new CustomError(HttpStatusCode.NotFound, 'The requested store does not exist');
        }

        await StoresRepository.getInstance().Update(new ObjectId(store._id), { deletedAt: Utils.getCurrentDate(), isSupportEmailConnected: false, isShopifyConnected: false });
        if (store.isSupportEmailConnected) {
            await GmailManager.getInstance().stopGmailInboxWatch(store.supportEmail.accessToken, store.supportEmail.refreshToken);
            await GmailManager.getInstance().revokeTokens(store.supportEmail.accessToken, store.supportEmail.refreshToken);
        }
    }


    /*
   * ╔═══════════════════════════════════╗
   * ║          PRIVATE METHODS          ║
   * ╚═══════════════════════════════════╝
    */



    private async validateStoreUniqueness(slug: string) {
        const countExistingStoreConditions: any = [
            {
                param: 'slug',
                value: slug,
                operator: QueryOperators.AND
            }
        ];

        const storeAlreadyExists: number = await StoresRepository.getInstance().Count(countExistingStoreConditions);

        if (storeAlreadyExists) {
            throw new CustomError(HttpStatusCode.Conflict, `A store with this name already exists`);
        }
    }


    private async handleSupportEmailDisconnectivity(store: Partial<IStores>, loggedInUser: IJWTPayload) {
        if (!store.isSupportEmailConnected) throw new CustomError(HttpStatusCode.BadRequest, `The requested store support email is not connected to a support email`);

        await GmailManager.getInstance().stopGmailInboxWatch(store.supportEmail.accessToken, store.supportEmail.refreshToken);
        await GmailManager.getInstance().revokeTokens(store.supportEmail.accessToken, store.supportEmail.refreshToken);

        const dataToUpdate = {
            isSupportEmailConnected: false,
            supportEmail: null,
            updatedAt: Utils.getCurrentDate(),
            updatedBy: loggedInUser.id
        }

        await StoresRepository.getInstance().Update(new ObjectId(store._id), dataToUpdate);
    }


    private async handleShopifyDisconnectivity(store: Partial<IStores>, loggedInUser: IJWTPayload) {
        if (!store.isShopifyConnected) throw new CustomError(HttpStatusCode.BadRequest, `The requested store shopify account is not connected`);

        const dataToUpdate = {
            isShopifyConnected: false,
            shopifyStore: null,
            updatedAt: Utils.getCurrentDate(),
            updatedBy: loggedInUser.id
        }

        await StoresRepository.getInstance().Update(new ObjectId(store._id), dataToUpdate);
    }

}

export default new StoresService();