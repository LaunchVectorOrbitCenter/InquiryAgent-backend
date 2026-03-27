import { ObjectId } from "mongodb";
import EmailQueriesRepository from "./emailQueriesRepository";
import QueryOperators from "../../core/enums/queryOperators";
import { HttpStatusCode } from "axios";
import QueryOperationTypes from "../../core/enums/queryOperationTypes";
import { CustomError } from "../../core/errors/custom";
import IJWTPayload from "../../core/interfaces/jwt";
import { IListEmailQueriesDTO, listEmailQueriesResponseFields, IGetEmailQueryByIdDTO, viewEmailQueryResponseFields, IChangeEmailQueryStatusDTO, IEmailQueries } from "./emailQueriesInterface";
import { Utils } from "../../utils/utils";
import StoresRepository from "../stores/storesRepository";
import GmailManager from "../../integration/gmailManager";
import {google} from "googleapis";
import { log } from "console";

class EmailsService {


    public async listEmails(data: IListEmailQueriesDTO, loggedInUser: IJWTPayload) {
        let getEmailQueriesConditions: any = [
            ...(Utils.checkUserRole(loggedInUser.role) ? [] : [{
                param: 'tenantId',
                value: loggedInUser.tenantId,
                operator: QueryOperators.AND
            }]),
            {
                param: 'queryType',
                value: data.queryType,
                operator: QueryOperators.AND
            },
            {
                param: 'storeInfo.storeId',
                value: data.storeId,
                operator: QueryOperators.AND
            }
        ];


        if (data.queryStatus) {
            getEmailQueriesConditions.push({
                param: 'queryStatus',
                value: data.queryStatus,
                operator: QueryOperators.AND
            });
        }


        if (data.queryCategory) {
            getEmailQueriesConditions.push({
                param: 'queryCategory',
                value: data.queryCategory,
                operator: QueryOperators.AND
            });
        }

        // const result: Record<string, any> = await EmailQueriesRepository.getInstance().GetAll(getEmailQueriesConditions, true, data.continuationToken, data.pageSize, { createdAt: -1 }, listEmailQueriesResponseFields);

        const result: Record<string, any> = await EmailQueriesRepository.getInstance().GetAll(getEmailQueriesConditions, false, null, 0, { createdAt: -1 }, listEmailQueriesResponseFields);

        // const paginatedData = Utils.pagination(!result.continuationToken, result.data, result.continuationToken, result.data.length);

        return { emailQueries: result };
    }



    public async getEmailQueryById(data: IGetEmailQueryByIdDTO, loggedInUser: IJWTPayload) {
        const getEmailQueryConditions: any = [
            {
                param: '_id',
                value: new ObjectId(data.id),
                operator: QueryOperators.AND
            },
            ...(Utils.checkUserRole(loggedInUser.role) ? [] : [{
                param: 'tenantId',
                value: loggedInUser.tenantId,
                operator: QueryOperators.AND
            }])
        ];

        const emailQuery = await EmailQueriesRepository.getInstance().GetOneByParams(getEmailQueryConditions, viewEmailQueryResponseFields);

        if (!emailQuery) throw new CustomError(HttpStatusCode.NotFound, 'Unfortunately, the email query you are looking for does not exist');

        return emailQuery
    }



    public async changeEmailQueryStatus(data: IChangeEmailQueryStatusDTO, loggedInUser: IJWTPayload) {
        const getEmailQueryConditions: any = [
            {
                param: '_id',
                value: new ObjectId(data.id),
                operator: QueryOperators.AND
            },
            ...(Utils.checkUserRole(loggedInUser.role) ? [] : [{
                param: 'tenantId',
                value: loggedInUser.tenantId,
                operator: QueryOperators.AND
            }]),
            {
                param: 'queryStatus',
                value: data.status,
                operator: QueryOperators.AND,
                operationType: QueryOperationTypes.NOT_EQUALS,
            }
        ];


        const emailQuery: Partial<IEmailQueries> = await EmailQueriesRepository.getInstance().GetOneByParams(getEmailQueryConditions, ['_id']);

        if (!emailQuery) throw new CustomError(HttpStatusCode.NotFound, 'Unfortunately, the email query you are looking for does not exist');

        return EmailQueriesRepository.getInstance().Update(new ObjectId(emailQuery._id), { queryStatus: data.status }, viewEmailQueryResponseFields);
    }

    /**
     * Fetch unread emails for a store between startDate and endDate, analyze & reply
     */
    public async fetchAndProcessEmails(storeId: string, startDate: string, endDate: string) {
        // 🏪 Fetch store and verify Gmail connection
        const filter: any = [{ param: '_id', value: new ObjectId(storeId), operator: QueryOperators.AND }]
        const store: any = await StoresRepository.getInstance().GetOneByParams(
            filter
        );
        
        if (!store || !store.isSupportEmailConnected) {
            throw new Error('Store email not connected or store not found.');
        }

        // ⏰ Normalize date times
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0); // start of day

        const end = new Date(endDate);
        end.setHours(23, 59, 0, 0); // one minute before midnight

        // 🔄 Reconnect email (refresh token or reinitialize)
        const gmailManager = GmailManager.getInstance();
        const oAuth2Client = gmailManager.oAuth2Client;
        oAuth2Client.setCredentials({
            access_token: store.supportEmail.accessToken,
            refresh_token: store.supportEmail.refreshToken,
        });

        // 🔁 Run Gmail Watch to ensure notifications are active
        try {
            await gmailManager.watchGmailInbox(
                store.supportEmail.accessToken,
                store.supportEmail.refreshToken
            );
            console.log(`📡 Gmail Watch reconnected for ${store.supportEmail.email}`);
        } catch (err) {
            console.warn(`⚠️ Failed to reconnect Gmail Watch: ${err.message}`);
        }

        // 📆 Convert dates to UNIX timestamps
        const after = Math.floor(start.getTime() / 1000);
        const before = Math.floor(end.getTime() / 1000);

        const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

        const messageIds: string[] = [];
        let nextPageToken: string | undefined = undefined;

        try {
            do {
                const res = await gmail.users.messages.list({
                    userId: 'me',
                    q: `is:unread after:${after} before:${before}`,
                    pageToken: nextPageToken,
                    maxResults: 500 // Gmail allows up to 500
                });

                if (res?.data?.messages?.length) {
                    for (const m of res.data.messages) {
                        if (m?.id) messageIds.push(m.id);
                    }
                }

                nextPageToken = res?.data?.nextPageToken;
            } while (nextPageToken);
        } catch (err: any) {
            log(`Failed listing messages: ${err?.message || err}`, 'error');
            throw err;
        }

        console.log(`Found ${messageIds.length} unread messages to process`, 'info');

        // 🔍 Filter out already processed messages
        const unprocessedMessageIds: string[] = [];
        for (const msgId of messageIds) {
            const existingQuery: any = await EmailQueriesRepository.getInstance().GetOneByParams([
                { param: 'messageId', value: msgId, operator: QueryOperators.AND }
            ], ['_id']);

            if (!existingQuery?._id) {
                unprocessedMessageIds.push(msgId);
            }
        }

        console.log(`${unprocessedMessageIds.length} new messages to process (${messageIds.length - unprocessedMessageIds.length} already processed)`, 'info');

        const concurrency = 5;
        const results: Array<{ messageId: string; result: any }> = [];

        for (let i = 0; i < unprocessedMessageIds.length; i += concurrency) {
            const chunk = unprocessedMessageIds.slice(i, i + concurrency);
            const promises = chunk.map(async (msgId) => {
                try {
                    const r = await GmailManager.getInstance().processSingleMessage(gmail, store, msgId);
                    return { messageId: msgId, result: r };
                } catch (err: any) {
                    console.log(`Error processing message ${msgId}: ${err?.message || err}`, 'error');
                    return { messageId: msgId, result: { processed: false, error: err?.message || err } };
                }
            });

            const settled = await Promise.all(promises);
            results.push(...(settled as any));
        }

        console.log(`Completed processing ${results.length} messages for store ${store.storeName}`, 'info');

        return results;
    }

}


export default new EmailsService();