import FillableField from "../../core/interfaces/fillableFields";
import { GeneralFillables } from "../../core/interfaces/generalInterface";


export interface IAiPlaygroundConversationUserMessage {
    subject: string,
    content: string
}


export interface IAiPlaygroundConversationAIResponse {
    subject: string | null,
    content: string | null,
    agentShouldRespond: boolean,
    userInquiryTone: string,
    isUserEligibleForCancellation: boolean,
    isUserEligibleForRefund: boolean
}


export interface IAiPlaygroundChatroomConversation {
    _id: string,
    chatroomId: string,
    storeId: string,
    tenantId: string,
    userMessage: IAiPlaygroundConversationUserMessage,
    aiResponse: IAiPlaygroundConversationAIResponse,
    createdAt: string,
    createdBy: string,
    updatedAt: string,
    updatedBy: string,
    deletedAt: string
}


export interface ISendAiPlaygroundMessageDTO {
    chatroomId: string,
    subject: string,
    body: string
}


export interface IGetAiPlaygroundChatroomConversationsDTO {
    chatroomId: string,
    continuationToken: number | string | null,
    pageSize: number
}


export const AiPlaygroundChatroomConversationFillableFields: FillableField[] = [
    { column: 'chatroomId', columnDataType: 'string' },
    { column: 'storeId', columnDataType: 'string' },
    { column: 'tenantId', columnDataType: 'string' },
    { column: 'userMessage', columnDataType: 'object' },
    { column: 'aiResponse', columnDataType: 'object' },
    ...GeneralFillables
];


export const optimizedAiPlaygroundConversationResponseFields = [
    '_id',
    'chatroomId',
    'userMessage',
    'aiResponse',
    'createdAt'
];
