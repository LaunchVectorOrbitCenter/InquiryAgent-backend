import BaseRepository from '../../core/repositories/baseRepository';
import { MONGODB_COLLECTIONS } from '../../utils/constants';


class EmailThreadsRepository extends BaseRepository {
    private static instance: EmailThreadsRepository;

    private constructor() {
        super(MONGODB_COLLECTIONS.EMAIL_THREADS, []);
    }

    public static getInstance(): EmailThreadsRepository {
        if (!EmailThreadsRepository.instance) {
            EmailThreadsRepository.instance = new EmailThreadsRepository();
        }
        return EmailThreadsRepository.instance;
    }

    public async INIT() {
        await super.INIT();
        // await this.collection.updateMany(
        //     { storeId: { $type: "objectId" } },
        //     [
        //         {
        //             $set: {
        //                 storeId: { $toString: "$storeId" }
        //             }
        //         }
        //     ]
        // )
    }



    //* -------------------------------------------------------------------------- */
    //*                         GET CUSTOMER EMAIL THREADS                         */
    //* -------------------------------------------------------------------------- */

    public async getCustomerEmailThreads(threadId: string, tenantId: string) {
        const pipeline = [
            {
                $match: {
                    threadId: threadId,
                    deletedAt: null
                }
            },
            {
                $addFields: {
                    _storeIdStr: { $toString: "$storeId" }
                }
            },
            {
                $lookup: {
                    from: MONGODB_COLLECTIONS.STORES,
                    let: { storeIdStr: "$_storeIdStr" },
                    pipeline: [
                        { $addFields: { _idStr: { $toString: "$_id" } } },
                        { $match: { $expr: { $eq: ["$_idStr", "$$storeIdStr"] } } },
                        { $project: { tenantId: 1 } }
                    ],
                    as: "store"
                }
            },
            { $unwind: "$store" },
            {
                $match: {
                    "store.tenantId": tenantId
                }
            },
            { $sort: { createdAt: 1 } },
            {
                $project: {
                    store: 0,
                    _storeIdStr: 0
                }
            }
        ];

        const emailThreads = await this.customAggregator(pipeline);
        return emailThreads;
    }
}



export default EmailThreadsRepository;
