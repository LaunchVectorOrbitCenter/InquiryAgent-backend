import FillableField from "../../core/interfaces/fillableFields";
import { GeneralFillables } from "../../core/interfaces/generalInterface";
import { CustomerDetailsSnapshot, OrderDetailsSnapshot } from "../../core/interfaces/aiServiceInterface";


export interface IAiPlaygroundChatroom {
    _id: string,
    chatTitle: string,
    chatroomId: string,
    storeId: string,
    tenantId: string,
    customerDetail: CustomerDetailsSnapshot,
    orderDetails: OrderDetailsSnapshot[],
    createdAt: string,
    createdBy: string,
    updatedAt: string,
    updatedBy: string,
    deletedAt: string
}


export interface ICreateAiPlaygroundChatroomDTO {
    chatTitle: string,
    storeId: string,
    customerDetail: CustomerDetailsSnapshot,
    orderDetails: OrderDetailsSnapshot[],
    initialMessage: {
        subject: string,
        body: string
    }
}


export interface IListAiPlaygroundChatroomsDTO {
    continuationToken: number | string | null,
    pageSize: number
}


export const AiPlaygroundChatroomFillableFields: FillableField[] = [
    { column: 'chatTitle', columnDataType: 'string' },
    { column: 'chatroomId', columnDataType: 'string' },
    { column: 'storeId', columnDataType: 'string' },
    { column: 'tenantId', columnDataType: 'string' },
    { column: 'customerDetail', columnDataType: 'object' },
    { column: 'orderDetails', columnDataType: 'array' },
    ...GeneralFillables
];


export const optimizedAiPlaygroundChatroomResponseFields = [
    '_id',
    'chatTitle',
    'chatroomId',
    'storeId',
    'customerDetail',
    'orderDetails',
    'createdAt'
];