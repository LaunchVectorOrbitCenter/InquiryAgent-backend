import FillableField from "../../core/interfaces/fillableFields"
import { GeneralFillables } from "../../core/interfaces/generalInterface"

export interface IEmailQueries {
    _id: string,
    queryCategory: string,
    queryType: string,
    queryStatus: string,
    userQuerySubject: string,
    userQueryBody: string,
    aiResponseSubject: string,
    aiResponseBody: string,
    senderEmail: string,
    recipientEmail: string,
    storeInfo: StoreInfoSnapshot,
    orderDetails: OrderDetailsSnapshot,
    tenantId: string,
    threadId: string,
    messageId: string,
    createdAt: string,
    updatedAt: string,
    createdBy: string,
    updatedBy: string,
    deletedAt: string
}


export interface OrderDetailsSnapshot {
    trackingNumber: string,
    orderId: string
}

export interface StoreInfoSnapshot {
    storeId: string,
    name: string,
    slug: string
}




export interface IStoreEmailQueries {
    queryType: string,
    queryStatus: string,
    queryCategory: string,
    userQuerySubject: string,
    userQueryBody: string,
    aiResponseSubject: string,
    aiResponseBody: string,
    senderEmail: string,
    recipientEmail: string,
    storeInfo: StoreInfoSnapshot,
    orderDetails: OrderDetailsSnapshot,
    threadId: string,
    messageId: string,
    tenantId: string,
    createdAt: string
}


export interface IListEmailQueriesDTO {
    storeId: string,
    queryType: string,
    queryStatus?: string,
    queryCategory?: string,
    pageSize: number,
    continuationToken: number
}




export interface IGetEmailQueryByIdDTO {
    id: string
}


export interface IChangeEmailQueryStatusDTO {
    id: string,
    status: string
}

export const EmailQueryFillableFields: FillableField[] = [
    { column: 'queryType', columnDataType: 'string' },
    { column: 'queryStatus', columnDataType: 'string' },
    { column: 'queryCategory', columnDataType: 'string' },
    { column: 'userQuerySubject', columnDataType: 'string' },
    { column: 'userQueryBody', columnDataType: 'string' },
    { column: 'aiResponseSubject', columnDataType: 'string' },
    { column: 'aiResponseBody', columnDataType: 'string' },
    { column: 'senderEmail', columnDataType: 'string' },
    { column: 'recipientEmail', columnDataType: 'string' },
    { column: 'storeInfo', columnDataType: 'object' },
    { column: 'orderDetails', columnDataType: 'object' },
    { column: 'tenantId', columnDataType: 'string' },
    { column: 'threadId', columnDataType: 'string' },
    { column: 'messageId', columnDataType: 'string' },
    ...GeneralFillables
];




export const listEmailQueriesResponseFields = [
    '_id',
    'queryType',
    'queryStatus',
    'senderEmail',
    'recipientEmail',
    'storeInfo',
    'queryCategory',
    'createdAt',
    'threadId',
    'messageId'
];


export const viewEmailQueryResponseFields = [
    '_id',
    'queryType',
    'queryStatus',
    'queryCategory',
    'senderEmail',
    'recipientEmail',
    'userQuerySubject',
    'userQueryBody',
    'aiResponseSubject',
    'aiResponseBody',
    'storeInfo',
    'tenantId',
    'threadId',
    'messageId',
    'createdAt',
    'orderDetails'
];




export interface EmailAnalysisJobMetaData {
    emailAddress: string,
    historyId: string
}

export interface EmailsProcessingJobMetaData {
    storeId: string,
    startDate: string,
    endDate: string
}