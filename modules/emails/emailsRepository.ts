import IJWTPayload from "../../core/interfaces/jwt";
import BaseRepository from "../../core/repositories/baseRepository";
import { MONGODB_COLLECTIONS } from "../../utils/constants";
import { Utils } from "../../utils/utils";
import { IGetUserEmailResponsesDashboardInsightsRequestDTO } from "../dashboard/dashboardInterface";


class EmailsRepository extends BaseRepository {
    private static instance: EmailsRepository;

    private constructor() {
        super(MONGODB_COLLECTIONS.EMAILS, []);
    }

    public static getInstance(): EmailsRepository {
        if (!EmailsRepository.instance) {
            EmailsRepository.instance = new EmailsRepository();
        }
        return EmailsRepository.instance;
    }

    public async INIT() {
        await super.INIT();
    }


    public async getUsersEmailResponsesCount(
        data: IGetUserEmailResponsesDashboardInsightsRequestDTO,
        loggedInUser: IJWTPayload
    ) {
        const { startDate, endDate } = data;

        const start = new Date(`${startDate}T00:00:00.000Z`);
        const end = new Date(`${endDate}T23:59:59.999Z`);

        const pipeline = [
            {
                $facet: {
                    series: [
                        { $addFields: { _createdAt: { $toDate: "$createdAt" } } },
                        {
                            $match: {
                                ...(Utils.checkUserRole(loggedInUser.role) ? {} : { tenantId: loggedInUser.tenantId }),
                                _createdAt: { $gte: start, $lte: end },
                            }
                        },
                        {
                            $lookup: {
                                from: MONGODB_COLLECTIONS.USERS,
                                let: { createdByStr: "$createdBy" },
                                pipeline: [
                                    { $addFields: { _idStr: { $toString: "$_id" } } },
                                    { $match: { $expr: { $eq: ["$_idStr", "$$createdByStr"] } } },
                                    { $project: { username: 1 } }
                                ],
                                as: "user"
                            }
                        },
                        { $unwind: "$user" },
                        {
                            $group: {
                                _id: {
                                    date: {
                                        $dateToString: {
                                            format: "%Y-%m-%d",
                                            date: "$_createdAt",
                                            timezone: "UTC"
                                        }
                                    },
                                    userId: "$createdBy",
                                    username: "$user.username"
                                },
                                count: { $sum: 1 }
                            }
                        },
                        {
                            $project: {
                                _id: 0,
                                date: "$_id.date",
                                userId: "$_id.userId",
                                username: "$_id.username",
                                count: 1
                            }
                        },
                        { $sort: { date: 1 } }
                    ],

                    total: [
                        { $addFields: { _createdAt: { $toDate: "$createdAt" } } },
                        {
                            $match: {
                                ...(Utils.checkUserRole(loggedInUser.role) ? {} : { tenantId: loggedInUser.tenantId }),
                                _createdAt: { $gte: start, $lte: end },
                            }
                        },
                        {
                            $lookup: {
                                from: MONGODB_COLLECTIONS.USERS,
                                let: { createdByStr: "$createdBy" },
                                pipeline: [
                                    { $addFields: { _idStr: { $toString: "$_id" } } },
                                    { $match: { $expr: { $eq: ["$_idStr", "$$createdByStr"] } } },
                                    { $project: { username: 1 } }
                                ],
                                as: "user"
                            }
                        },
                        { $unwind: "$user" },
                        {
                            $group: {
                                _id: "$createdBy",
                                username: { $first: "$user.username" },
                                total: { $sum: 1 }
                            }
                        },
                        {
                            $project: {
                                _id: 0,
                                userId: "$_id",
                                username: 1,
                                total: 1
                            }
                        }
                    ]
                }
            },
            {
                $project: {
                    totalEmailRespondedByEachUser: "$total",
                    respondedEmailByEachUserByTimeSeries: "$series"
                }
            }
        ];

        const [agg = {
            totalEmailRespondedByEachUser: 0,
            respondedEmailByEachUserByTimeSeries: []
        }] = await this.customAggregator(pipeline);

        const byDay: Record<string, number> = Object.fromEntries(
            agg.respondedEmailByEachUserByTimeSeries.map((r: any) => [r.date, r.count])
        );

        const filled: Array<{ date: string; count: number }> = [];
        for (let d = new Date(start); d <= end; d = new Date(d.getTime() + 86400000)) {
            const y = d.getUTCFullYear();
            const m = String(d.getUTCMonth() + 1).padStart(2, "0");
            const day = String(d.getUTCDate()).padStart(2, "0");
            const key = `${y}-${m}-${day}`;
            filled.push({ date: key, count: byDay[key] ?? 0 });
        }

        return {
            totalEmailRespondedByEachUser: agg.totalEmailRespondedByEachUser,
            //respondedEmailByEachUserByTimeSeries: filled
        };
    }

}


export default EmailsRepository;