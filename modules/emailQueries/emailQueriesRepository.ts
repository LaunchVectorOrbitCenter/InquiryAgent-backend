import { MONGODB_COLLECTIONS } from '../../utils/constants';
import EmailQueryTypes from '../../core/enums/emailQueryTypes';
import EmailQueryCategories from '../../core/enums/queryCategories';
import StatusTypes from '../../core/enums/statusTypes';
import { IGetDashboardAnalytics, IGetDashboardInsightsRequestDTO } from '../dashboard/dashboardInterface';
import BaseRepository from '../../core/repositories/baseRepository';
import IJWTPayload from '../../core/interfaces/jwt';
import { Utils } from '../../utils/utils';


class EmailQueriesRepository extends BaseRepository {
    private static instance: EmailQueriesRepository;

    private constructor() {
        super(MONGODB_COLLECTIONS.EMAIL_QUERIES, []);
    }

    public static getInstance(): EmailQueriesRepository {
        if (!EmailQueriesRepository.instance) {
            EmailQueriesRepository.instance = new EmailQueriesRepository();
        }
        return EmailQueriesRepository.instance;
    }

    public async INIT() {
        await super.INIT();
    }



    public async fetchDashboardAnalytics(data: IGetDashboardAnalytics) {
        const { startDate, endDate, storeId } = data;

        const start = new Date(`${startDate}T00:00:00.000Z`).toISOString();
        const end = new Date(`${endDate}T23:59:59.999Z`).toISOString();

        const pipeline = [
            {
                $match: {
                    createdAt: {
                        $gte: start,
                        $lte: end,
                    },
                    'storeInfo.storeId': storeId,
                },
            },
            {
                $facet: {
                    totalEmails: [
                        { $count: 'count' }
                    ],
                    autoProcessedEmails: [
                        { $match: { queryType: EmailQueryTypes.AUTO_PROCESSED } },
                        { $count: 'count' }
                    ],
                    pendingEmails: [
                        { $match: { queryStatus: StatusTypes.PENDING } },
                        { $count: 'count' }
                    ],
                    refundEmails: [
                        { $match: { queryCategory: EmailQueryCategories.REFUND } },
                        { $count: 'count' }
                    ]
                }
            },
            {
                $project: {
                    totalEmails: { $ifNull: [{ $arrayElemAt: ['$totalEmails.count', 0] }, 0] },
                    autoProcessedEmails: { $ifNull: [{ $arrayElemAt: ['$autoProcessedEmails.count', 0] }, 0] },
                    pendingEmails: { $ifNull: [{ $arrayElemAt: ['$pendingEmails.count', 0] }, 0] },
                    refundEmails: { $ifNull: [{ $arrayElemAt: ['$refundEmails.count', 0] }, 0] },
                }
            }
        ];

        const analytics = await this.collection.aggregate(pipeline).toArray();
        return analytics[0];
    }

    public async fetchDashboardInsights(loggedInUser: IJWTPayload, data: IGetDashboardInsightsRequestDTO) {
        const { startDate, endDate } = data;
        const tenantId: string = loggedInUser.tenantId;
        const start = new Date(`${startDate}T00:00:00.000Z`).toISOString();
        const end = new Date(`${endDate}T23:59:59.999Z`).toISOString();

        const pipeline = [
            {
                $match: {
                    ...(Utils.checkUserRole(loggedInUser.role) ? {} : { tenantId: tenantId }),
                    createdAt: { $gte: start, $lte: end },
                    ...(data?.storeId ? { 'storeInfo.storeId': data.storeId } : {})
                },
            },
            {
                $facet: {
                    totalEmails: [
                        { $count: 'count' }
                    ],
                    autoProcessedEmails: [
                        { $match: { queryType: EmailQueryTypes.AUTO_PROCESSED } },
                        { $count: 'count' }
                    ],
                    manuallyProcessedEmails: [
                        { $match: { queryType: EmailQueryTypes.MANUAL_PROCESSING } },
                        { $count: 'count' }
                    ],
                    manuallyRespondedEmails: [
                        { $match: { queryType: EmailQueryTypes.MANUAL_PROCESSING, queryStatus: StatusTypes.PROCESSED } },
                        { $count: 'count' }
                    ],
                    manuallyResolvedEmails: [
                        { $match: { queryType: EmailQueryTypes.MANUAL_PROCESSING, queryStatus: StatusTypes.RESOLVED } },
                        { $count: 'count' }
                    ],
                    pendingEmails: [
                        { $match: { queryStatus: StatusTypes.PENDING } },
                        { $count: 'count' }
                    ],
                    refundEmails: [
                        { $match: { queryCategory: EmailQueryCategories.REFUND } },
                        { $count: 'count' }
                    ],
                    deliveryStatusEmails: [
                        { $match: { queryCategory: EmailQueryCategories.DELIVERY_STATUS } },
                        { $count: 'count' }
                    ],
                    subscriptionInquiryEmails: [
                        { $match: { queryCategory: EmailQueryCategories.SUBSCRIPTION_INQUIRY } },
                        { $count: 'count' }
                    ],
                    orderCancellationEmails: [
                        { $match: { queryCategory: EmailQueryCategories.ORDER_CANCELLATION } },
                        { $count: 'count' }
                    ],
                    multipleContextsEmails: [
                        { $match: { queryCategory: EmailQueryCategories.MULTIPLE_CONTEXTS } },
                        { $count: 'count' }
                    ],
                    escalationEmails: [
                        { $match: { queryCategory: EmailQueryCategories.ESCALATION } },
                        { $count: 'count' }
                    ]
                }
            },
            {
                $project: {
                    respondedEmails: { $ifNull: [{ $arrayElemAt: ['$totalEmails.count', 0] }, 0] },
                    autoProcessedEmails: { $ifNull: [{ $arrayElemAt: ['$autoProcessedEmails.count', 0] }, 0] },
                    manuallyProcessedEmails: { $ifNull: [{ $arrayElemAt: ['$manuallyProcessedEmails.count', 0] }, 0] },
                    manuallyRespondedEmails: { $ifNull: [{ $arrayElemAt: ['$manuallyRespondedEmails.count', 0] }, 0] },
                    manuallyResolvedEmails: { $ifNull: [{ $arrayElemAt: ['$manuallyResolvedEmails.count', 0] }, 0] },
                    pendingEmails: { $ifNull: [{ $arrayElemAt: ['$pendingEmails.count', 0] }, 0] },
                    refundEmails: { $ifNull: [{ $arrayElemAt: ['$refundEmails.count', 0] }, 0] },
                    deliveryStatusEmails: { $ifNull: [{ $arrayElemAt: ['$deliveryStatusEmails.count', 0] }, 0] },
                    subscriptionInquiryEmails: { $ifNull: [{ $arrayElemAt: ['$subscriptionInquiryEmails.count', 0] }, 0] },
                    orderCancellationEmails: { $ifNull: [{ $arrayElemAt: ['$orderCancellationEmails.count', 0] }, 0] },
                    multipleContextsEmails: { $ifNull: [{ $arrayElemAt: ['$multipleContextsEmails.count', 0] }, 0] },
                    escalatoryEmails: { $ifNull: [{ $arrayElemAt: ['$escalationEmails.count', 0] }, 0] },
                }
            }
        ];

        const analytics = await this.collection.aggregate(pipeline).toArray();
        return analytics[0];
    }



    public async getManuallyParkedAndRespondedEmailsCount(startDate: string, endDate: string, loggedInUser: IJWTPayload) {
        const start = new Date(`${startDate}T00:00:00.000Z`).toISOString();
        const end = new Date(`${endDate}T23:59:59.999Z`).toISOString();
        const pipeline = [
            {
                $match: {
                    createdAt: {
                        $gte: start,
                        $lte: end,
                    },
                    ...(Utils.checkUserRole(loggedInUser.role) ? {} : { tenantId: loggedInUser.tenantId }),
                }
            },
            {
                $facet: {
                    manuallyProcessedEmails: [
                        { $match: { queryType: EmailQueryTypes.MANUAL_PROCESSING } },
                        { $count: 'count' }
                    ],
                    manuallyRespondedEmails: [
                        { $match: { queryType: EmailQueryTypes.MANUAL_PROCESSING, queryStatus: StatusTypes.PROCESSED } },
                        { $count: 'count' }
                    ]
                }
            },
            {
                $project: {
                    manuallyParkedEmails: { $ifNull: [{ $arrayElemAt: ['$manuallyProcessedEmails.count', 0] }, 0] },
                    manuallyRespondedEmails: { $ifNull: [{ $arrayElemAt: ['$manuallyRespondedEmails.count', 0] }, 0] },
                }
            }
        ];

        const analytics = await this.collection.aggregate(pipeline).toArray();
        return analytics[0];
    }
}



export default EmailQueriesRepository;