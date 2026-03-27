import { ObjectId } from 'mongodb';
import cron from 'node-cron';
import GmailManager from '../../integration/gmailManager';
import { Logger } from '../../utils/helpers/logger';
import StoresRepository from '../../modules/stores/storesRepository';

export const startCronJobs = () => {
    cron.schedule('0 */12 * * *', async () => {
        console.log('Running a daily job at midnight');
        await processRefreshGoogleWatchJob();
    });

    Logger.Console(`Cron jobs initialized`, 'info');
};

async function processRefreshGoogleWatchJob() {
    try {

        const twelveHoursMs = 12 * 60 * 60 * 1000;
        const now = Date.now();

        const pipeline = [
            {
                "$match": {
                    "deletedAt": null,
                    "isSupportEmailConnected": true,
                    "$expr": {
                        "$lte": [
                            { "$subtract": [{ "$toLong": "$watchExpiration" }, now] },
                            twelveHoursMs
                        ]
                    }
                }
            },
            {
                "$project": {
                    "_id": { "$toString": "$_id" },
                    "supportEmail": 1
                }
            }
        ];

        const storesToRefreshGoogleWatch = await StoresRepository.getInstance().customAggregator(pipeline);

        if (storesToRefreshGoogleWatch.length) {

            for (const store of storesToRefreshGoogleWatch) {

                const { accessToken, refreshToken } = store.supportEmail || {};

                if (accessToken && refreshToken) {

                    try {

                        const { historyId, expiration } = await GmailManager.getInstance().watchGmailInbox(accessToken, refreshToken);

                        await StoresRepository.getInstance().Update(new ObjectId(store._id), { lastHistoryId: historyId, watchExpiration: expiration });

                        console.log(`Successfully refreshed Google Watch for Store ID: ${store._id}`);

                    } catch (watchError) {
                        console.error(`Failed to refresh Google Watch for store ID: ${store._id}. Error: ${watchError}`);
                    }

                } else {
                    console.warn(`Skipping store ID: ${store._id} due to missing accessToken or refreshToken.`);
                }

            }

        } else {
            console.log("No stores require Google Watch refresh at this time.");
        }

    } catch (error) {
        console.error(`An error occurred while executing the cron job! CAUSE :: ${error}`)
    }
}