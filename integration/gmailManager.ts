import { google, Auth } from 'googleapis';
import { Logger } from "../utils/helpers/logger";
import axios, { HttpStatusCode } from "axios";
import securityManager from "../utils/helpers/securityManager";
import { gmail_v1 } from "googleapis/build/src/apis/gmail";
import ShopifyManager from "./shopifyManager";
import { ObjectId } from "mongodb";
import AIService from "../utils/helpers/aiServiceV2";
import StatusTypes from "../core/enums/statusTypes";
import EmailQueryTypes from "../core/enums/emailQueryTypes";
import EmailQueriesRepository from "../modules/emailQueries/emailQueriesRepository";
import QueryIntents from "../core/enums/queryIntents";
import EmailQueryCategories from "../core/enums/queryCategories";
import { Utils } from "../utils/utils";
import QueryOperators from "../core/enums/queryOperators";
import EmailTemplateTypes from "../core/enums/emailTemplateTypes";
import EmailDisconnectivityReasons from "../core/enums/emailDisconnectivityReasons";
import EmailSenderTypes from "../core/enums/emailSenderTypes";
import EmailThreadsService from "../modules/emailThreads/emailThreadsService";
import SystemAlertsService from "../modules/systemAlerts/systemAlertsService";
import { CustomError } from '../core/errors/custom';
import { IAnalyzeEmailDTO } from '../core/interfaces/aiServiceInterface';
import { GoogleOAuth } from '../core/interfaces/appConfig';
import { IStoreEmailQueries } from '../modules/emailQueries/emailQueriesInterface';
import { IStoreEmailThreadDTO } from '../modules/emailThreads/emailThreadsInterface';
import { IStores, processEmailStoreResponseFields } from '../modules/stores/storesInterface';
import StoresRepository from '../modules/stores/storesRepository';
import { IStoreSystemAlertDTO, ISystemAlerts } from '../modules/systemAlerts/systemAlertsInterface';
import EmailTemplatesRepository from '../modules/emailTemplates/emailTemplatesRepository';
import { IEmailTemplates } from '../modules/emailTemplates/emailTemplatesInterface';

class GmailManager {
    private static instance: GmailManager;
    private config: GoogleOAuth | null = null;
    public oAuth2Client: Auth.OAuth2Client | null = null;

    private constructor() { }

    public static getInstance(): GmailManager {
        if (!GmailManager.instance) {
            GmailManager.instance = new GmailManager();
        }
        return GmailManager.instance;
    }


    public async setConfig(config: GoogleOAuth) {
        this.config = config;
        this.oAuth2Client = new google.auth.OAuth2(
            this.config.clientId,
            this.config.clientSecret,
            this.config.redirectUri
        );
        Logger.Console(`Google OAuth Client configured successfully`, 'info');
    }


    public getOAuth2Client() {
        if (!this.oAuth2Client) {
            throw new Error("Google OAuth configuration is not set.");
        }
        return this.oAuth2Client;
    }


    public async generateOauthUrl(tenantId: string, storeName: string, startDate?: string, endDate?: string) {
        const oAuth2Client = this.getOAuth2Client();
        const stateObject = {
            tenantId,
            storeName,
            startDate,
            endDate,
            nonce: securityManager.generateRandomBytes()
        }
        const state = Buffer.from(JSON.stringify(stateObject)).toString("base64");
        const authUrl = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: this.config.oAuthScopes,
            state,
            prompt: 'consent'
        });
        return authUrl;
    }


    public async getAccessToken(code: string) {
        if (!this.oAuth2Client) {
            throw new Error("Google OAuth client is not initialized.");
        }
        const { tokens } = await this.oAuth2Client.getToken(code);
        return tokens;
    }


    public async refreshAccessToken(storeId: string, accessToken: string, refreshToken: string) {
        this.oAuth2Client.setCredentials({
            access_token: accessToken,
            refresh_token: refreshToken
        });
        const { credentials } = await this.oAuth2Client.refreshAccessToken();
        const { access_token } = credentials;
        await StoresRepository.getInstance().Update(new ObjectId(storeId), { 'supportEmail.accessToken': access_token });
    }


    public async getUserInfo(accessToken: string) {
        try {
            const response = await axios.get("https://www.googleapis.com/oauth2/v2/userinfo", {
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            const { id, email } = response.data;

            return {
                clientId: id,
                email,
            };

        } catch (error: any) {
            console.log(error);
            throw new CustomError(HttpStatusCode.Unauthorized, 'Invalid or expired access token');
        }

    }


    public async revokeTokens(accessToken: string, refreshToken: string) {
        this.oAuth2Client.setCredentials({
            access_token: accessToken,
            refresh_token: refreshToken
        });


        try {
            await this.oAuth2Client.revokeToken(accessToken);
        } catch (accessTokenError) {
            console.error('Failed to revoke access token:', accessTokenError);
        }
    }


    public async watchGmailInbox(accessToken: string, refreshToken: string) {
        try {

            this.getOAuth2Client().setCredentials({
                access_token: accessToken,
                refresh_token: refreshToken
            });

            const gmailClient = google.gmail({ version: 'v1', auth: this.oAuth2Client });

            const response = await gmailClient.users.watch({
                userId: 'me',
                requestBody: {
                    labelIds: ['INBOX'],
                    topicName: `projects/${this.config.projectId}/topics/${this.config.topicName}`,
                },
            });

            Logger.Console(`Support email set to watch successfully`, 'info');
            return response.data;

        } catch (error) {
            console.log(error);
            throw new CustomError(HttpStatusCode.BadRequest, 'An error occurred while connecting your email');
        }
    }


    public async stopGmailInboxWatch(accessToken: string, refreshToken: string) {
        try {
            this.getOAuth2Client().setCredentials({
                access_token: accessToken,
                refresh_token: refreshToken
            });
            const gmailClient = google.gmail({ version: 'v1', auth: this.oAuth2Client });
            await gmailClient.users.stop({ userId: "me" });
            Logger.Console(`Support email set to unwatch successfully`, 'info');
        } catch (error) {
            console.error('Error stopping Gmail inbox watch:', error);
        }
    }


    public async processIncomingEmail(storeSupportEmail: string) {
        const getStoreConditions: any = [
            {
                param: "supportEmail.email",
                value: storeSupportEmail,
                operator: QueryOperators.AND
            }
        ];

        const store: Partial<IStores> = await StoresRepository.getInstance().GetOneByParams(getStoreConditions, processEmailStoreResponseFields);
        try {
            if (store?.isSupportEmailConnected) {
                if (store.supportEmail) {
                    this.oAuth2Client.setCredentials({
                        access_token: store.supportEmail.accessToken,
                        refresh_token: store.supportEmail.refreshToken
                    });

                    const gmail: any = google.gmail({ version: 'v1', auth: this.oAuth2Client });

                    const userId = storeSupportEmail;

                    console.log("INSIDE1");
                    let history: any = null;
                    try {
                        history = await gmail.users.history.list({
                            userId: 'me',
                            startHistoryId: store.lastHistoryId,
                            historyTypes: ['messageAdded']
                        });
                    }
                    catch (error) {
                        console.log("INSIDE2");
                        console.log(error);
                    }

                    //* UPDATE NEW HISTORY ID
                    await StoresRepository.getInstance().Update(new ObjectId(store._id), { lastHistoryId: history.data.historyId });

                    //* CHECK HISTORY CONTAINS DATA OR NOT
                    if (!history.data.history || history.data.history.length === 0) {
                        console.log('📭 No new emails');
                        return null;
                    }

                    //* GET UNIQUE MESSAGE IDS
                    const messages = history.data.history.flatMap(h => h.messages || []);
                    const uniqueMessageIds = [...new Set(messages.map(msg => msg.id))];

                    const emailDetails = [];

                    //* PROCESS EMAIL MESSAGES
                    for (const messageId of uniqueMessageIds) {
                        if (!messageId) continue;

                        const emailResponse = await gmail.users.messages.get({
                            userId: 'me',
                            id: messageId,
                            format: 'full',
                        });

                        const payload = emailResponse.data.payload;
                        let subject = '';
                        let body = '';
                        let senderEmail = null;

                        const messageIdHeader = payload.headers.find(header => header.name === 'Message-ID');
                        const actualMessageId = messageIdHeader?.value || '';


                        if (payload.headers) {
                            const subjectHeader = payload.headers.find(header => header.name === 'Subject');
                            if (subjectHeader) {
                                subject = subjectHeader.value;
                            }

                            const fromHeader = payload.headers.find(header => header.name === 'From');
                            if (fromHeader) {
                                const regex = /<(.+?)>/;
                                const match = regex.exec(fromHeader.value);
                                senderEmail = match ? match[1] : fromHeader.value;
                            }
                        }

                        body = Utils.extractCustomerReply(payload);

                        emailDetails.push({ senderEmail, subject, body, threadId: emailResponse?.data?.threadId, messageId: actualMessageId, markAsReadId: messageId });

                        console.log(`📧 New Email Received: \nFrom: ${senderEmail}`);

                        // await gmail.users.messages.modify({
                        //     userId: userId,
                        //     id: messageId,
                        //     requestBody: {
                        //         removeLabelIds: ["UNREAD"],
                        //     },
                        // });

                    }

                    if (emailDetails[0].senderEmail !== storeSupportEmail) {
                        let alreadyProcessed = false;
                        if (emailDetails[0].messageId) {
                            const existingQuery: any = await EmailQueriesRepository.getInstance().GetOneByParams([
                                { param: 'messageId', value: emailDetails[0].messageId, operator: QueryOperators.AND }
                            ], ['_id']);

                            if (existingQuery?._id) {
                                await gmail.users.messages.modify({
                                    userId: userId,
                                    id: emailDetails[0].markAsReadId,
                                    requestBody: {
                                        removeLabelIds: ["UNREAD"],
                                    },
                                });
                                alreadyProcessed = true;
                            }
                        }

                        if (alreadyProcessed) {
                            return null;
                        }

                        const userOrderDetails = await ShopifyManager.getInstance().getOrderByEmail(store.storeName, emailDetails[0].senderEmail, store.shopifyStore.accessToken);


                        let trackingNumber = null;
                        let orderCreatedAt = null;
                        let trackingUrl = null;
                        let orderId = null;

                        if (userOrderDetails.length && userOrderDetails[0].fulfillments.length) {
                            trackingNumber = userOrderDetails[0].fulfillments[0]?.tracking_number;
                            console.log("Tracking Number:", trackingNumber);
                            orderCreatedAt = userOrderDetails[0].created_at;
                            trackingUrl = userOrderDetails[0].fulfillments[0]?.tracking_url;
                            orderId = userOrderDetails[0].fulfillments[0]?.name?.split('.')[0];

                            const emailContent = `Subject: ${emailDetails[0].subject} \n\n Body: ${emailDetails[0].body}`

                            const emailAnalysisPayload: IAnalyzeEmailDTO = {
                                emailContent,
                                storeId: store._id.toString(),
                                storeSlug: store.slug,
                                storeName: store.storeName,
                                maskedName: store.maskedName,
                                refundPolicy: store.refundPolicy,
                                subscriptionPortalUrl: store?.subscriptionPortalUrl || null,
                                tenantId: store.tenantId,
                                orderDetails: [
                                    {
                                        orderCreatedAt: orderCreatedAt,
                                        trackingNumber,
                                        trackingUrl,
                                        tags: userOrderDetails[0].tags?.length ? userOrderDetails[0].tags.split(',') : [],
                                    }
                                ],
                                customerDetail: {
                                    name: `${userOrderDetails[0]?.customer?.first_name} ${userOrderDetails[0]?.customer?.last_name}` || 'Customer',
                                },
                                threadId: emailDetails[0].threadId
                            }

                            const response: Record<string, any> = await AIService.analyzeEmail(emailAnalysisPayload);

                            if (response) {

                                console.log("RESPONSE GENERATED");
                                console.log(response);

                                const intent = response.intent;
                                const emailResponse = response.emailResponse || {};
                                const agentShouldRespond = emailResponse.agentShouldRespond ?? true;
                                const orderDetailsSnapshot = { orderId, trackingNumber };

                                const storeGenericQuery = async (queryStatus: string, queryType: string, aiSubject: string | null, aiBody: string | null) => {
                                    const dataToStore: IStoreEmailQueries = {
                                        userQuerySubject: emailDetails[0].subject.trim(),
                                        userQueryBody: emailDetails[0].body.trim(),
                                        queryCategory: intent || QueryIntents.OUT_OF_CONTEXT,
                                        aiResponseSubject: aiSubject,
                                        aiResponseBody: aiBody,
                                        senderEmail: emailDetails[0].senderEmail,
                                        recipientEmail: storeSupportEmail,
                                        threadId: emailDetails[0].threadId,
                                        messageId: emailDetails[0].messageId,
                                        storeInfo: {
                                            storeId: store._id.toString(),
                                            name: store.maskedName,
                                            slug: store.slug
                                        },
                                        orderDetails: orderDetailsSnapshot,
                                        tenantId: store.tenantId,
                                        queryStatus,
                                        queryType,
                                        createdAt: Utils.getCurrentDate()
                                    }
                                    await EmailQueriesRepository.getInstance().Add(dataToStore);
                                };

                                if (intent === QueryIntents.ESCALATION) {
                                    await this.handleEscalationsInquiry(response, emailDetails, store, storeSupportEmail, orderId, trackingNumber, gmail);
                                } else if (intent === QueryIntents.OUT_OF_CONTEXT) {
                                    await gmail.users.messages.modify({
                                        userId: userId,
                                        id: emailDetails[0].markAsReadId,
                                        requestBody: {
                                            removeLabelIds: ["UNREAD"],
                                        },
                                    });
                                } else if (agentShouldRespond === false) {
                                    await storeGenericQuery(StatusTypes.PENDING, EmailQueryTypes.MANUAL_PROCESSING, null, null);
                                    await this.handleEmailThreadStorage(emailDetails[0].threadId, store._id, { subject: emailDetails[0].subject, content: emailDetails[0].body }, null);
                                } else {
                                    switch (intent) {
                                        case QueryIntents.REFUND:
                                            await this.handleRefundInquiry(response, emailDetails, store, storeSupportEmail, orderId, trackingNumber, gmail);
                                            if (!response?.emailResponse?.isUserEligibleForRefund) {
                                                await gmail.users.messages.modify({
                                                    userId: userId,
                                                    id: emailDetails[0].markAsReadId,
                                                    requestBody: {
                                                        removeLabelIds: ["UNREAD"],
                                                    },
                                                });
                                            }
                                            break;
                                        case QueryIntents.DELIVERY_STATUS:
                                            await this.handleOrderDeliveryInquiry(response, emailDetails, store, storeSupportEmail, orderId, trackingNumber, gmail);
                                            await gmail.users.messages.modify({
                                                userId: userId,
                                                id: emailDetails[0].markAsReadId,
                                                requestBody: {
                                                    removeLabelIds: ["UNREAD"],
                                                },
                                            });
                                            break;
                                        case QueryIntents.SUBSCRIPTION_INQUIRY:
                                            await this.handleSubscriptionInquiry(response, emailDetails, store, storeSupportEmail, orderId, trackingNumber, gmail);
                                            await gmail.users.messages.modify({
                                                userId: userId,
                                                id: emailDetails[0].markAsReadId,
                                                requestBody: {
                                                    removeLabelIds: ["UNREAD"],
                                                },
                                            });
                                            break;
                                        case QueryIntents.ORDER_CANCELLATION:
                                            await this.handleOrderCancellationInquiry(response, emailDetails, store, storeSupportEmail, orderId, trackingNumber, gmail);
                                            if (!response?.emailResponse?.isUserEligibleForCancellation) {
                                                await gmail.users.messages.modify({
                                                    userId: userId,
                                                    id: emailDetails[0].markAsReadId,
                                                    requestBody: {
                                                        removeLabelIds: ["UNREAD"],
                                                    },
                                                });
                                            }
                                            break;
                                        case QueryIntents.MULTIPLE_CONTEXTS:
                                            await this.handleMultipleContextsInquiry(response, emailDetails, store, storeSupportEmail, orderId, trackingNumber, gmail);
                                            await gmail.users.messages.modify({
                                                userId: userId,
                                                id: emailDetails[0].markAsReadId,
                                                requestBody: {
                                                    removeLabelIds: ["UNREAD"],
                                                },
                                            });
                                            break;
                                        default:
                                            await storeGenericQuery(StatusTypes.PROCESSED, EmailQueryTypes.AUTO_PROCESSED, emailResponse.subject, emailResponse.body);
                                            await this.replyToEmail(gmail, emailDetails[0].senderEmail, storeSupportEmail, emailDetails[0].subject, emailDetails[0].messageId, emailResponse.body, emailDetails[0].threadId);
                                            await this.handleEmailThreadStorage(
                                                emailDetails[0].threadId,
                                                store._id,
                                                { subject: emailDetails[0].subject, content: emailDetails[0].body },
                                                { subject: emailResponse.subject, content: emailResponse.body }
                                            );
                                            await gmail.users.messages.modify({
                                                userId: userId,
                                                id: emailDetails[0].markAsReadId,
                                                requestBody: {
                                                    removeLabelIds: ["UNREAD"],
                                                },
                                            });
                                            break;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        catch (error) {
            if (error.response?.data?.error === 'invalid_grant') {
                console.error('Refresh Token Expired');
                const dataToUpdate = {
                    isSupportEmailConnected: false,
                    supportEmail: null
                }
                await StoresRepository.getInstance().Update(new ObjectId(store._id), dataToUpdate);
                //TODO: Replace dynamcally with the tenant admin email
                await Utils.sendMail('zac@launchvector.co', EmailTemplateTypes.STORE_DISCONNECTED, { storeName: store.maskedName, disconnectivityReason: EmailDisconnectivityReasons.EMAIL_REFRESH_TOKEN_EXPIRED });
                await Utils.sendMail('cindey@launchvector.com', EmailTemplateTypes.STORE_DISCONNECTED, { storeName: store.maskedName, disconnectivityReason: EmailDisconnectivityReasons.EMAIL_REFRESH_TOKEN_EXPIRED });

                const systemAlert: IStoreSystemAlertDTO = {
                    storeId: store._id.toString(),
                    alertDescription: EmailDisconnectivityReasons.EMAIL_REFRESH_TOKEN_EXPIRED,
                    tenantId: store.tenantId
                }

                const systemAlertResponse: Partial<ISystemAlerts> = await SystemAlertsService.storeSystemAlert(systemAlert);
                const storeDataToUpdate = {
                    alertId: systemAlertResponse._id.toString()
                }

                await StoresRepository.getInstance().Update(new ObjectId(store._id), storeDataToUpdate);
            }
        }
    }

    /**
     * Process a single Gmail message id using existing handlers.
     * Re-uses the handler methods (handleRefundInquiry, handleOrderDeliveryInquiry, etc.)
     */
    public async processSingleMessage(gmail: gmail_v1.Gmail, store: Partial<IStores>, messageId: string) {
        try {
            const emailResponse = await gmail.users.messages.get({
                userId: 'me',
                id: messageId,
                format: 'full',
            });

            const payload = emailResponse.data.payload;
            const headers = payload.headers || [];

            const messageIdHeader = headers.find(h => h.name === 'Message-ID');
            const actualMessageId = messageIdHeader?.value || '';
            const subjectHeader = headers.find(h => h.name === 'Subject');
            const fromHeader = headers.find(h => h.name === 'From');

            const subject = subjectHeader?.value || '';
            const senderEmail = fromHeader ? (/<(.+)>/.exec(fromHeader.value)?.[1] || fromHeader.value) : null;
            const body = Utils.extractCustomerReply(payload);

            const emailDetails = [{
                senderEmail,
                subject,
                body,
                threadId: emailResponse.data.threadId,
                messageId: actualMessageId,
                markAsReadId: messageId
            }];

            if (emailDetails[0].messageId) {
                const existingQuery: any = await EmailQueriesRepository.getInstance().GetOneByParams([
                    { param: 'messageId', value: emailDetails[0].messageId, operator: QueryOperators.AND }
                ], ['_id']);

                if (existingQuery?._id) {
                    await gmail.users.messages.modify({
                        userId: 'me',
                        id: emailDetails[0].markAsReadId,
                        requestBody: { removeLabelIds: ['UNREAD'] }
                    });
                    return { processed: true, skipped: true, reason: 'already processed' };
                }
            }

            // If sender is the support email, ignore
            if (!emailDetails[0].senderEmail || emailDetails[0].senderEmail === store.supportEmail?.email) {
                return { skipped: true, reason: 'sender is support email or missing' };
            }

            // Lookup order by email
            const userOrderDetails = await ShopifyManager.getInstance().getOrderByEmail(store.storeName, emailDetails[0].senderEmail, store.shopifyStore.accessToken);

            let trackingNumber = null;
            let orderCreatedAt = null;
            let trackingUrl = null;
            let orderId = null;

            if (userOrderDetails.length && userOrderDetails[0].fulfillments.length) {
                trackingNumber = userOrderDetails[0].fulfillments[0]?.tracking_number;
                orderCreatedAt = userOrderDetails[0].created_at;
                trackingUrl = userOrderDetails[0].fulfillments[0]?.tracking_url;
                orderId = userOrderDetails[0].fulfillments[0]?.name?.split('.')[0];

                const emailContent = `Subject: ${emailDetails[0].subject} \n\n Body: ${emailDetails[0].body}`;

                const emailAnalysisPayload: IAnalyzeEmailDTO = {
                    emailContent,
                    storeId: store._id.toString(),
                    storeSlug: store.slug,
                    storeName: store.storeName,
                    maskedName: store.maskedName,
                    refundPolicy: store.refundPolicy,
                    subscriptionPortalUrl: store?.subscriptionPortalUrl || null,
                    tenantId: store.tenantId,
                    orderDetails: userOrderDetails.length ? [
                        {
                            orderCreatedAt,
                            trackingNumber,
                            trackingUrl,
                            tags: userOrderDetails[0].tags?.length ? userOrderDetails[0].tags.split(',') : [],
                        }
                    ] : [],
                    customerDetail: {
                        name: userOrderDetails[0]?.customer
                            ? `${userOrderDetails[0]?.customer?.first_name} ${userOrderDetails[0]?.customer?.last_name}`
                            : 'Customer',
                    },
                    threadId: emailDetails[0].threadId
                };


                const response: Record<string, any> = await AIService.analyzeEmail(emailAnalysisPayload);

                if (!response) {
                    // nothing to do
                    return { processed: false, reason: 'no ai response' };
                }

                // Use the same switch logic you used in processIncomingEmail
                switch (response.intent) {
                    case QueryIntents.REFUND:
                        await this.handleRefundInquiry(response, emailDetails, store, store.supportEmail?.email, orderId, trackingNumber, gmail);
                        if (!response?.emailResponse?.isUserEligibleForRefund) {
                            await gmail.users.messages.modify({
                                userId: 'me',
                                id: emailDetails[0].markAsReadId,
                                requestBody: { removeLabelIds: ['UNREAD'] }
                            });
                        }
                        break;

                    case QueryIntents.DELIVERY_STATUS:
                        await this.handleOrderDeliveryInquiry(response, emailDetails, store, store.supportEmail?.email, orderId, trackingNumber, gmail);
                        await gmail.users.messages.modify({
                            userId: 'me',
                            id: emailDetails[0].markAsReadId,
                            requestBody: { removeLabelIds: ['UNREAD'] }
                        });
                        break;

                    case QueryIntents.SUBSCRIPTION_INQUIRY:
                        await this.handleSubscriptionInquiry(response, emailDetails, store, store.supportEmail?.email, orderId, trackingNumber, gmail);
                        await gmail.users.messages.modify({
                            userId: 'me',
                            id: emailDetails[0].markAsReadId,
                            requestBody: { removeLabelIds: ['UNREAD'] }
                        });
                        break;

                    case QueryIntents.ORDER_CANCELLATION:
                        await this.handleOrderCancellationInquiry(response, emailDetails, store, store.supportEmail?.email, orderId, trackingNumber, gmail);
                        if (!response?.emailResponse?.isUserEligibleForCancellation) {
                            await gmail.users.messages.modify({
                                userId: 'me',
                                id: emailDetails[0].markAsReadId,
                                requestBody: { removeLabelIds: ['UNREAD'] }
                            });
                        }
                        break;

                    case QueryIntents.MULTIPLE_CONTEXTS:
                        await this.handleMultipleContextsInquiry(response, emailDetails, store, store.supportEmail?.email, orderId, trackingNumber, gmail);
                        await gmail.users.messages.modify({
                            userId: 'me',
                            id: emailDetails[0].markAsReadId,
                            requestBody: { removeLabelIds: ['UNREAD'] }
                        });
                        break;

                    case QueryIntents.ESCALATION:
                        await this.handleEscalationsInquiry(response, emailDetails, store, store.supportEmail?.email, orderId, trackingNumber, gmail);
                        break;

                    default:
                        // Unknown intent — store thread record and mark as unread (or as you prefer)
                        await this.handleEmailThreadStorage(emailDetails[0].threadId, store._id.toString(), { subject: emailDetails[0].subject, content: emailDetails[0].body }, null);
                        break;
                }
            }

            return { processed: true };
        } catch (err: any) {
            Logger.Console(`Error processing single message ${messageId}: ${err?.message || err}`, 'error');
            return { processed: false, error: err?.message || err };
        }
    }


    private async handleRefundInquiry(response, emailDetails, store, storeSupportEmail, orderId, trackingNumber, gmail) {
        await this.handleRefundQueryIntentResponse(response, emailDetails, store, storeSupportEmail, { orderId, trackingNumber }, gmail);

        if (!response.emailResponse.isUserEligibleForRefund) {
            //* STORE EMAIL THREAD
            await this.handleEmailThreadStorage(emailDetails[0].threadId, store._id, { subject: emailDetails[0].subject, content: emailDetails[0].body }, { subject: response.emailResponse.subject, content: response.emailResponse.body });
        } else {
            //acknowledge email and move to next step in refund process (manual processing by support team)
            const templateSlug = EmailTemplateTypes.EMAIL_ACKNOWLEDGMENT;
            const placeholders = {
                customerName: emailDetails[0].senderEmail.split('@')[0],
                storeName: store.maskedName,
                supportTeamEmail: storeSupportEmail
            };
            const emailContent = await this.prepareTemplateContent(templateSlug, placeholders);
            
            await this.replyToEmail(gmail, emailDetails[0].senderEmail, storeSupportEmail, emailContent.subject, emailDetails[0].messageId, emailContent.html, emailDetails[0].threadId);
        }
    }


    private async handleOrderDeliveryInquiry(response, emailDetails, store, storeSupportEmail, orderId, trackingNumber, gmail) {
        await this.handleOrderDeliveryStatusIntentResponse(response, emailDetails, store, storeSupportEmail, { orderId, trackingNumber });

        await this.replyToEmail(gmail, emailDetails[0].senderEmail, storeSupportEmail, emailDetails[0].subject, emailDetails[0].messageId, response.emailResponse.body, emailDetails[0].threadId);
        //* STORE EMAIL THREAD
        await this.handleEmailThreadStorage(emailDetails[0].threadId, store._id, { subject: emailDetails[0].subject, content: emailDetails[0].body }, { subject: response.emailResponse.subject, content: response.emailResponse.body });
    }


    public async handleSubscriptionInquiry(response, emailDetails, store, storeSupportEmail, orderId, trackingNumber, gmail) {
        await this.handleSubscriptionIntentResponse(response, emailDetails, store, storeSupportEmail, { orderId, trackingNumber });

        await this.replyToEmail(gmail, emailDetails[0].senderEmail, storeSupportEmail, emailDetails[0].subject, emailDetails[0].messageId, response.emailResponse.body, emailDetails[0].threadId);
        //* STORE EMAIL THREAD
        await this.handleEmailThreadStorage(emailDetails[0].threadId, store._id, { subject: emailDetails[0].subject, content: emailDetails[0].body }, { subject: response.emailResponse.subject, content: response.emailResponse.body });
    }


    public async handleOrderCancellationInquiry(response, emailDetails, store, storeSupportEmail, orderId, trackingNumber, gmail) {
        await this.handleOrderCancellationIntentResponse(response, emailDetails, store, storeSupportEmail, { orderId, trackingNumber });

        if (!response.emailResponse.isUserEligibleForCancellation) {
            await this.replyToEmail(gmail, emailDetails[0].senderEmail, storeSupportEmail, emailDetails[0].subject, emailDetails[0].messageId, response.emailResponse.body, emailDetails[0].threadId);
        }
        //* STORE EMAIL THREAD
        await this.handleEmailThreadStorage(emailDetails[0].threadId, store._id, { subject: emailDetails[0].subject, content: emailDetails[0].body }, { subject: response.emailResponse.subject, content: response.emailResponse.body });
    }


    public async handleMultipleContextsInquiry(response, emailDetails, store, storeSupportEmail, orderId, trackingNumber, gmail) {
        await this.handleMultipleContextsIntentResponse(response, emailDetails, store, storeSupportEmail, { orderId, trackingNumber });
        // await this.replyToEmail(gmail, emailDetails[0].senderEmail, storeSupportEmail, emailDetails[0].subject, emailDetails[0].messageId, response.emailResponse.body, emailDetails[0].threadId);
        await this.handleEmailThreadStorage(emailDetails[0].threadId, store._id, { subject: emailDetails[0].subject, content: emailDetails[0].body }, null);
    }



    public async handleEscalationsInquiry(response, emailDetails, store, storeSupportEmail, orderId, trackingNumber, gmail) {
        await this.handleEscalationIntentResponse(response, emailDetails, store, storeSupportEmail, { orderId, trackingNumber });
        await this.handleEmailThreadStorage(emailDetails[0].threadId, store._id, { subject: emailDetails[0].subject, content: emailDetails[0].body }, null);
        
        //acknowledge receipt of escalation and inform customer that support team will reach out soon
        const templateSlug = EmailTemplateTypes.EMAIL_ACKNOWLEDGMENT;
        const placeholders = {
            customerName: emailDetails[0].senderEmail.split('@')[0],
            storeName: store.maskedName,
            supportTeamEmail: storeSupportEmail
        };
        const emailContent = await this.prepareTemplateContent(templateSlug, placeholders);
        
        await this.replyToEmail(gmail, emailDetails[0].senderEmail, storeSupportEmail, emailContent.subject, emailDetails[0].messageId, emailContent.html, emailDetails[0].threadId);
}



    private async replyToEmail(gmail: gmail_v1.Gmail, recipientEmail: string, senderEmail: string, originalSubject: string, messageId: string, replyBody: string, threadId: string) {
        try {
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



    private async handleSubscriptionIntentResponse(response: { emailResponse: any; intent?: any; }, emailDetails: any[], store: Partial<IStores>, recipientEmail: string, orderDetails: { orderId: string, trackingNumber: string }) {
        const dataToStore: IStoreEmailQueries = {
            userQuerySubject: emailDetails[0].subject.trim(),
            userQueryBody: emailDetails[0].body.trim(),
            queryCategory: EmailQueryCategories.SUBSCRIPTION_INQUIRY,
            aiResponseSubject: response.emailResponse.subject,
            aiResponseBody: response.emailResponse.body,
            senderEmail: emailDetails[0].senderEmail,
            recipientEmail,
            threadId: emailDetails[0].threadId,
            messageId: emailDetails[0].messageId,
            storeInfo: {
                storeId: store._id.toString(),
                name: store.maskedName,
                slug: store.slug
            },
            orderDetails,
            tenantId: store.tenantId,
            queryStatus: StatusTypes.PROCESSED,
            queryType: EmailQueryTypes.AUTO_PROCESSED,
            createdAt: Utils.getCurrentDate()
        }

        await EmailQueriesRepository.getInstance().Add(dataToStore);
    }


    private async handleRefundQueryIntentResponse(response: { emailResponse: any; intent?: any; }, emailDetails: any[], store: Partial<IStores>, storeSupportEmail: string, orderDetails: { orderId: string, trackingNumber: string }, gmail: gmail_v1.Gmail) {
        if (response.emailResponse.isUserEligibleForRefund) {

            const dataToStore: IStoreEmailQueries = {
                userQuerySubject: emailDetails[0].subject.trim(),
                userQueryBody: emailDetails[0].body.trim(),
                queryCategory: EmailQueryCategories.REFUND,
                aiResponseSubject: null,
                aiResponseBody: null,
                senderEmail: emailDetails[0].senderEmail,
                recipientEmail: storeSupportEmail,
                threadId: emailDetails[0].threadId,
                messageId: emailDetails[0].messageId,
                storeInfo: {
                    storeId: store._id.toString(),
                    name: store.maskedName,
                    slug: store.slug
                },
                orderDetails,
                tenantId: store.tenantId,
                queryStatus: StatusTypes.PENDING,
                queryType: EmailQueryTypes.MANUAL_PROCESSING,
                createdAt: Utils.getCurrentDate()
            }

            await EmailQueriesRepository.getInstance().Add(dataToStore);
        }
        else {
            const dataToStore: IStoreEmailQueries = {
                userQuerySubject: emailDetails[0].subject.trim(),
                userQueryBody: emailDetails[0].body.trim(),
                queryCategory: EmailQueryCategories.REFUND,
                aiResponseSubject: response.emailResponse.subject,
                aiResponseBody: response.emailResponse.body,
                senderEmail: emailDetails[0].senderEmail,
                recipientEmail: storeSupportEmail,
                threadId: emailDetails[0].threadId,
                messageId: emailDetails[0].messageId,
                storeInfo: {
                    storeId: store._id.toString(),
                    name: store.maskedName,
                    slug: store.slug
                },
                orderDetails,
                tenantId: store.tenantId,
                queryStatus: StatusTypes.PROCESSED,
                queryType: EmailQueryTypes.AUTO_PROCESSED,
                createdAt: Utils.getCurrentDate()
            }
            await EmailQueriesRepository.getInstance().Add(dataToStore);

            await this.replyToEmail(gmail, emailDetails[0].senderEmail, storeSupportEmail, emailDetails[0].subject, emailDetails[0].messageId, response.emailResponse.body, emailDetails[0].threadId);
        }
    }


    private async handleOrderDeliveryStatusIntentResponse(response: { emailResponse: any; intent?: any; }, emailDetails: any[], store: Partial<IStores>, recipientEmail: string, orderDetails: { orderId: string, trackingNumber: string }) {
        const dataToStore: IStoreEmailQueries = {
            userQuerySubject: emailDetails[0].subject.trim(),
            userQueryBody: emailDetails[0].body.trim(),
            queryCategory: EmailQueryCategories.DELIVERY_STATUS,
            aiResponseSubject: response.emailResponse.subject,
            aiResponseBody: response.emailResponse.body,
            senderEmail: emailDetails[0].senderEmail,
            recipientEmail,
            threadId: emailDetails[0].threadId,
            messageId: emailDetails[0].messageId,
            storeInfo: {
                storeId: store._id.toString(),
                name: store.maskedName,
                slug: store.slug
            },
            orderDetails,
            tenantId: store.tenantId,
            queryStatus: StatusTypes.PROCESSED,
            queryType: EmailQueryTypes.AUTO_PROCESSED,
            createdAt: Utils.getCurrentDate()
        }

        await EmailQueriesRepository.getInstance().Add(dataToStore);
    }


    private async handleOrderCancellationIntentResponse(response: { emailResponse: any; intent?: any; }, emailDetails: any[], store: Partial<IStores>, storeSupportEmail: string, orderDetails: { orderId: string, trackingNumber: string }) {
        if (response.emailResponse.isUserEligibleForCancellation) {
            const dataToStore: IStoreEmailQueries = {
                userQuerySubject: emailDetails[0].subject.trim(),
                userQueryBody: emailDetails[0].body.trim(),
                queryCategory: EmailQueryCategories.ORDER_CANCELLATION,
                aiResponseSubject: null,
                aiResponseBody: null,
                senderEmail: emailDetails[0].senderEmail,
                recipientEmail: storeSupportEmail,
                threadId: emailDetails[0].threadId,
                messageId: emailDetails[0].messageId,
                storeInfo: {
                    storeId: store._id.toString(),
                    name: store.maskedName,
                    slug: store.slug
                },
                orderDetails,
                tenantId: store.tenantId,
                queryStatus: StatusTypes.PENDING,
                queryType: EmailQueryTypes.MANUAL_PROCESSING,
                createdAt: Utils.getCurrentDate()
            }

            await EmailQueriesRepository.getInstance().Add(dataToStore);
        }
        else {
            const dataToStore: IStoreEmailQueries = {
                userQuerySubject: emailDetails[0].subject.trim(),
                userQueryBody: emailDetails[0].body.trim(),
                queryCategory: EmailQueryCategories.ORDER_CANCELLATION,
                aiResponseSubject: response.emailResponse.subject,
                aiResponseBody: response.emailResponse.body,
                senderEmail: emailDetails[0].senderEmail,
                recipientEmail: storeSupportEmail,
                threadId: emailDetails[0].threadId,
                messageId: emailDetails[0].messageId,
                storeInfo: {
                    storeId: store._id.toString(),
                    name: store.maskedName,
                    slug: store.slug
                },
                orderDetails,
                tenantId: store.tenantId,
                queryStatus: StatusTypes.PROCESSED,
                queryType: EmailQueryTypes.AUTO_PROCESSED,
                createdAt: Utils.getCurrentDate()
            }

            await EmailQueriesRepository.getInstance().Add(dataToStore);
        }
    }


    private async handleMultipleContextsIntentResponse(response: { emailResponse: any; intent?: any; }, emailDetails: any[], store: Partial<IStores>, storeSupportEmail: string, orderDetails: { orderId: string, trackingNumber: string }) {
        const dataToStore: IStoreEmailQueries = {
            userQuerySubject: emailDetails[0].subject.trim(),
            userQueryBody: emailDetails[0].body.trim(),
            queryCategory: EmailQueryCategories.MULTIPLE_CONTEXTS,
            aiResponseSubject: null,
            aiResponseBody: null,
            senderEmail: emailDetails[0].senderEmail,
            recipientEmail: storeSupportEmail,
            threadId: emailDetails[0].threadId,
            messageId: emailDetails[0].messageId,
            storeInfo: {
                storeId: store._id.toString(),
                name: store.maskedName,
                slug: store.slug
            },
            orderDetails,
            tenantId: store.tenantId,
            queryStatus: StatusTypes.PENDING,
            queryType: EmailQueryTypes.MANUAL_PROCESSING,
            createdAt: Utils.getCurrentDate()
        }

        await EmailQueriesRepository.getInstance().Add(dataToStore);
    }



    private async handleEscalationIntentResponse(response: { emailResponse: any; intent?: any; }, emailDetails: any[], store: Partial<IStores>, storeSupportEmail: string, orderDetails: { orderId: string, trackingNumber: string }) {
        const dataToStore: IStoreEmailQueries = {
            userQuerySubject: emailDetails[0].subject.trim(),
            userQueryBody: emailDetails[0].body.trim(),
            queryCategory: EmailQueryCategories.ESCALATION,
            aiResponseSubject: null,
            aiResponseBody: null,
            senderEmail: emailDetails[0].senderEmail,
            recipientEmail: storeSupportEmail,
            threadId: emailDetails[0].threadId,
            messageId: emailDetails[0].messageId,
            storeInfo: {
                storeId: store._id.toString(),
                name: store.maskedName,
                slug: store.slug
            },
            orderDetails,
            tenantId: store.tenantId,
            queryStatus: StatusTypes.PENDING,
            queryType: EmailQueryTypes.MANUAL_PROCESSING,
            createdAt: Utils.getCurrentDate()
        }

        await EmailQueriesRepository.getInstance().Add(dataToStore);
    }


    //* TOOLS

    private async handleEmailThreadStorage(threadId: string, storeId: string, customerEmailDetail: { subject: string, content: string }, aiGeneratedResponse: { subject: string, content: string }) {
        const customerEmailDataToStore: IStoreEmailThreadDTO = {
            subject: customerEmailDetail.subject,
            emailContent: customerEmailDetail.content,
            sentBy: EmailSenderTypes.USER,
            storeId: storeId.toString(),
            threadId
        }
        await EmailThreadsService.storeEmailThreads(customerEmailDataToStore);

        if (aiGeneratedResponse) {
            const aiEmailDataToStore: IStoreEmailThreadDTO = {
                subject: aiGeneratedResponse.subject,
                emailContent: aiGeneratedResponse.content,
                sentBy: EmailSenderTypes.ASSISTANT,
                storeId: storeId.toString(),
                threadId
            }
            await EmailThreadsService.storeEmailThreads(aiEmailDataToStore);
        }
    }

    //* Helper method to prepare template content
    private async prepareTemplateContent(templateSlug: string, placeholders: Record<string, any>) {
        const emailTemplate: Partial<IEmailTemplates> = await EmailTemplatesRepository.getInstance().GetOneByParam(
            { param: 'slug', value: templateSlug },
            ['subject', 'html', 'text']
        );
        
        if (!emailTemplate) {
            throw new CustomError(HttpStatusCode.NotFound, `Email template not found: ${templateSlug}`);
        }
        
        // Replace placeholders in subject and content
        const subject = this.replacePlaceholders(emailTemplate.subject, placeholders);
        const html = this.replacePlaceholders(emailTemplate.html || emailTemplate.text, placeholders);
        
        return { subject, html };
    }

    private replacePlaceholders(content: string, placeholders: Record<string, any>): string {
        Object.keys(placeholders).forEach((key) => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            content = content.replace(regex, placeholders[key]);
        });
        return content;
    }

}


export default GmailManager;
