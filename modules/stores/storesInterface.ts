import FillableField from "../../core/interfaces/fillableFields"
import { GeneralFillables } from "../../core/interfaces/generalInterface"

export interface IStores {
    _id: string,
    storeName: string,   //* Store name is the one set in the {{storeName}}.myshopify.com
    maskedName: string,  //* Masked name is the one exposed to public
    slug: string,
    refundPolicy: string,
    tenantId: string,
    alertId: string,
    isShopifyConnected: boolean,
    isSupportEmailConnected: boolean,
    shopifyStore: IShopifyStoreStructure,
    supportEmail: ISupportEmailStructure,
    subscriptionPortalUrl: string,
    lastHistoryId: string,
    watchExpiration: string,

    createdAt: string,
    updatedAt: string,
    createdBy: string,
    updatedBy: string,
    deletedAt: string
}



export interface ISupportEmailStructure {
    email: string,
    accessToken: string,
    refreshToken: string
}

export interface IShopifyStoreStructure {
    accessToken: string
}


export interface ICreateStoreDTO {
    storeName: string,
    refundPolicy: string,
    subscriptionPortalUrl?: string
}


export interface IListStoresDTO {
    pageSize: number,
    continuationToken: string,
    fields: string,
    paginate: boolean,
    view: string
}


export interface IGetStoreByIdDTO {
    storeId: string
}


export interface IUpdateStoreDTO {
    storeId: string,
    storeName: string,
    subscriptionPortalUrl?: string
}



export interface IDeleteStoreDTO {
    storeSlug: string
}



export interface IDisconnectStoreDTO {
    slug: string,
    disconnectingEntity: string
}


export interface IConnectShopifyDTO {
    adminApiKey: string,
    storeSlug: string
}


export const StoreFillableFields: FillableField[] = [
    { column: 'storeName', columnDataType: 'string' },
    { column: 'slug', columnDataType: 'string' },
    { column: 'maskedName', columnDataType: 'string' },
    { column: 'refundPolicy', columnDataType: 'string' },
    { column: 'tenantId', columnDataType: 'string' },
    { column: 'alertId', columnDataType: 'string' },
    { column: 'isShopifyConnected', columnDataType: 'boolean' },
    { column: 'isSupportEmailConnected', columnDataType: 'boolean' },
    { column: 'shopifyStore', columnDataType: 'object' },
    { column: 'supportEmail', columnDataType: 'object' },
    { column: 'lastHistoryId', columnDataType: 'string' },
    { column: 'watchExpiration', columnDataType: 'string' },
    { column: 'subscriptionPortalUrl', columnDataType: 'string' },
    ...GeneralFillables
]



export const optimizedStoreResponseFields = [
    '_id',
    'storeName',
    'maskedName',
    'slug',
    'refundPolicy',
    'tenantId',
    'isShopifyConnected',
    'isSupportEmailConnected',
    'watchExpiration',
    'subscriptionPortalUrl',
    'createdAt'
]



export const processEmailStoreResponseFields = [
    '_id',
    'supportEmail',
    'isSupportEmailConnected',
    'storeName',
    'maskedName',
    'lastHistoryId',
    'shopifyStore',
    'slug',
    'tenantId',
    'refundPolicy',
    'subscriptionPortalUrl'
]