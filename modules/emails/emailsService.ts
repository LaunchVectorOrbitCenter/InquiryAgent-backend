import { ObjectId } from "mongodb";
import EmailQueriesRepository from "../emailQueries/emailQueriesRepository";
import { Utils } from "../../utils/utils";
import QueryOperators from "../../core/enums/queryOperators";
import { HttpStatusCode } from "axios";
import EmailsModel from "./emailsModel";
import { google } from "googleapis";
import GmailManager from "../../integration/gmailManager";
import EmailSenderTypes from "../../core/enums/emailSenderTypes";
import EmailThreadsModel from "../emailThreads/emailThreadsModel";
import StatusTypes from "../../core/enums/statusTypes";
import { CustomError } from "../../core/errors/custom";
import IJWTPayload from "../../core/interfaces/jwt";
import { IEmailQueries } from "../emailQueries/emailQueriesInterface";
import { IStoreEmailThreadDTO } from "../emailThreads/emailThreadsInterface";
import EmailThreadsRepository from "../emailThreads/emailThreadsRepository";
import { IStores } from "../stores/storesInterface";
import StoresRepository from "../stores/storesRepository";
import { IEmails, ISendEmailDTO, IStoreEmailDTO } from "./emailsInterface";
import EmailsRepository from "./emailsRepository";

class EmailsService {

    protected attachMetaData(data: Partial<IEmails>, loggedInUser: IJWTPayload) {
        data.createdAt = Utils.getCurrentDate();
        data.createdBy = loggedInUser.id;
    }


    public async sendEmail(data: ISendEmailDTO, loggedInUser: IJWTPayload) {
        const getEmailQueryConditions: any = [
            {
                param: '_id',
                value: new ObjectId(data.emailQueryId),
                operator: QueryOperators.AND

            },
            {
                param: 'tenantId',
                value: loggedInUser.tenantId,
                operator: QueryOperators.AND
            }
        ];

        const emailQuery: Partial<IEmailQueries> = await EmailQueriesRepository.getInstance().GetOneByParams(getEmailQueryConditions, ['senderEmail', 'recipientEmail', 'storeInfo', 'threadId', 'userQuerySubject', 'messageId', 'queryStatus']);

        if (!emailQuery) throw new CustomError(HttpStatusCode.NotFound, 'The requested email query does not exist');

        if (!emailQuery?.threadId) throw new CustomError(HttpStatusCode.NotFound, 'The thread id of the requested email query does not exist');

        // if (!emailQuery?.messageId) throw new CustomError(HttpStatusCode.NotFound, 'The message id of the requested email query does not exist');

        const storeDetail: Partial<IStores> = await this.checkStoreActive(emailQuery.storeInfo.storeId);

        let dataToCreate: IStoreEmailDTO = {
            subject: data.subject,
            body: data.body,
            recipientEmail: emailQuery.senderEmail,
            senderEmail: emailQuery.recipientEmail,
            storeId: emailQuery.storeInfo.storeId,
            tenantId: loggedInUser.tenantId,
            threadId: emailQuery.threadId,
            messageId: emailQuery?.messageId
        }

        this.attachMetaData(dataToCreate, loggedInUser);
        const newEmail = EmailsModel.create(dataToCreate);

        await EmailsRepository.getInstance().Add(newEmail);

        await this.replyToEmail(emailQuery.senderEmail, emailQuery.recipientEmail, emailQuery.userQuerySubject, emailQuery.messageId, data.body, emailQuery.threadId, storeDetail.supportEmail.accessToken, storeDetail.supportEmail.refreshToken);

        await this.storeEmailThread(data.body, emailQuery.threadId, data.subject, emailQuery.storeInfo.storeId);

        if (emailQuery.queryStatus === StatusTypes.PENDING) {
            await EmailQueriesRepository.getInstance().Update(new ObjectId(data.emailQueryId), { queryStatus: StatusTypes.PROCESSED });
        }
    }



    private async replyToEmail(recipientEmail: string, senderEmail: string, originalSubject: string, messageId: string, replyBody: string, threadId: string, accessToken: string, refreshToken: string) {
        try {

            GmailManager.getInstance().oAuth2Client.setCredentials({
                access_token: accessToken,
                refresh_token: refreshToken
            });

            const gmail = google.gmail({ version: 'v1', auth: GmailManager.getInstance().oAuth2Client });
            const rawMessage = [
                `MIME-Version: 1.0`,
                `Content-Type: text/html; charset="UTF-8"`,
                `Content-Transfer-Encoding: 7bit`,
                `To: ${recipientEmail}`,
                `From: ${senderEmail}`,
                `Subject: Re: ${originalSubject}`,
                `In-Reply-To: ${messageId}`,
                `References: ${messageId}`,
                '',
                replyBody
            ].join('\r\n');

            const encodedMessage = Buffer.from(rawMessage).toString('base64url');

            await gmail.users.messages.send({
                userId: 'me',
                requestBody: {
                    raw: encodedMessage,
                    threadId
                }
            });

            console.log(`✅ Reply sent to ${recipientEmail}`);
        } catch (error) {
            console.error(`❌ Error replying to email ID ${messageId}:`, error.message);
        }
    }



    private async checkStoreActive(storeId: string) {
        const checkStoreActiveConditions: any = [
            {
                param: '_id',
                value: new ObjectId(storeId),
                operator: QueryOperators.AND
            },
            {
                param: 'isShopifyConnected',
                value: true,
                operator: QueryOperators.AND
            },
            {
                param: 'isSupportEmailConnected',
                value: true,
                operator: QueryOperators.AND
            }
        ];

        const store: Partial<IStores> = await StoresRepository.getInstance().GetOneByParams(checkStoreActiveConditions, ['supportEmail']);

        if (!store) throw new CustomError(HttpStatusCode.NotFound, 'The requested store is not connected');

        return store;
    }


    private async storeEmailThread(emailContent: string, threadId: string, subject: string, storeId: string) {
        const emailThreadToStore: IStoreEmailThreadDTO = {
            emailContent,
            storeId,
            sentBy: EmailSenderTypes.ASSISTANT,
            subject,
            threadId
        }
        const newEmailThread = EmailThreadsModel.create(emailThreadToStore);
        await EmailThreadsRepository.getInstance().Add(newEmailThread);
    }


}


export default new EmailsService();