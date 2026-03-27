import FillableField from "../../core/interfaces/fillableFields"
import { GeneralFillables } from "../../core/interfaces/generalInterface"

export interface IEmails {
    _id: string,
    subject: string,
    body: string,
    senderEmail: string,
    recipientEmail: string,
    threadId: string,
    storeId: string,
    messageId: string,
    createdAt: string,
    updatedAt: string,
    createdBy: string,
    updatedBy: string,
    deletedAt: string
}



export interface ISendEmailDTO {
    subject: string,
    body: string,
    emailQueryId: string
}


export interface IStoreEmailDTO {
    subject: string,
    body: string,
    senderEmail: string,
    recipientEmail: string,
    threadId: string,
    storeId: string,
    tenantId: string,
    messageId: string
}


export const EmailFillableFields: FillableField[] = [
    { column: 'subject', columnDataType: 'string' },
    { column: 'body', columnDataType: 'string' },
    { column: 'senderEmail', columnDataType: 'string' },
    { column: 'recipientEmail', columnDataType: 'string' },
    { column: 'threadId', columnDataType: 'string' },
    { column: 'storeId', columnDataType: 'string' },
    { column: 'messageId', columnDataType: 'string' },
    ...GeneralFillables
] 