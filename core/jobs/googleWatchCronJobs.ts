import { Job, Queue, Worker } from "bullmq";
import { Application } from "../../app";
import { Logger } from "../../utils/helpers/logger";
import { BackgroundJobSettings, CronJobsQueues } from "../../utils/constants";
import os from 'os';
import CronJobs from "../enums/cronJobs";
import GmailManager from "../../integration/gmailManager";
import { ObjectId } from "mongodb";
import StoresRepository from "../../modules/stores/storesRepository";
import { BullMQ } from "../interfaces/bullMQ";


class GoogleWatchCronJobs implements BullMQ {
    private static instance: GoogleWatchCronJobs | null = null;
    private queues: Record<string, Queue> = {};
    private workers: Record<string, Worker> = {};
    private readonly redisConfig = Application.redisConf;
    private workerConcurrency: number = 3;


    private constructor() { }

    private readonly queueProcessors: { [queueName: string]: (job: Job) => Promise<void> } = {
        'refreshGoogleWatch': this.processRefreshGoogleWatchJob
    };


    //* PUBLIC FUNCTIONS

    public static getInstance(): GoogleWatchCronJobs {
        if (!GoogleWatchCronJobs.instance) {
            GoogleWatchCronJobs.instance = new GoogleWatchCronJobs();
        }
        return GoogleWatchCronJobs.instance;
    }

    public async initQueues(): Promise<void> {
        const queueNames = Object.values(CronJobsQueues.GOOGLE_WATCH_CRON_JOB_QUEUES);
        for (const queueName of queueNames) {
            this.queues[queueName] = new Queue(queueName, {
                connection: { url: this.redisConfig.url },
                defaultJobOptions: {
                    removeOnComplete: true,
                },
            });
        }
        Logger.Console(`Google Watch Refresh Cron Job Queues initialized successfully`, 'info');
    }

    public async initWorkers(): Promise<void> {
        const availableCores = os.cpus().length
        this.workerConcurrency = Math.floor(availableCores / 3);

        //* Ensuring that concurrency is at least 1 (so workers can process jobs)
        if (this.workerConcurrency < 1) {
            this.workerConcurrency = 1;
        }

        Object.keys(this.queueProcessors).forEach(async (queueName) => {
            this.workers[queueName] = new Worker(queueName, this.queueProcessors[queueName], {
                connection: { url: this.redisConfig.url },
                concurrency: this.workerConcurrency,
            });

            await this.setupWorkerEventListeners(this.workers[queueName], queueName);
        });

        Logger.Console(`Workers created for Google Watch Refresh Job Queues`, 'info');
        this.monitorLoad();
    }


    //* ENQUEUE FUNCTIONS

    public async startRefreshGoogleWatchJob() {
        const queue = this.queues[CronJobsQueues.GOOGLE_WATCH_CRON_JOB_QUEUES.REFRESH_GOOGLE_WATCH];
        const existingJobs = await queue.getRepeatableJobs();
        if (existingJobs.some(job => job.name === CronJobs.GOOGLE_WATCH_REFRESH)) {
            console.log("Job is already scheduled, skipping new addition.");
            return;
        }

        await queue.add(
            CronJobs.GOOGLE_WATCH_REFRESH,
            {},
            {
                backoff: { type: BackgroundJobSettings.BACKOFF_STRATEGY.backoffType, delay: BackgroundJobSettings.BACKOFF_STRATEGY.backoffDelay },
                attempts: 0,
                removeOnFail: true,
                repeat: {
                    pattern: '0 */12 * * *'
                }
            }
        );
    }




    //* PRIVATE FUNCTIONS

    private async processRefreshGoogleWatchJob() {
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


    //* HELPER FUNCTIONS

    public async setupWorkerEventListeners(worker: Worker, queueName: string): Promise<void> {
        worker.on('completed', async (job: Job) => {
            Logger.Console(`Job completed in queue ${queueName}: ${job.id}`, 'info');
            await job.remove();
        });

        worker.on('failed', async (job: Job, err: Error) => {
            Logger.Console(`Job failed in queue ${queueName}: ${job.id} with error: ${err.message}`, 'error');
        });

        worker.on('stalled', (job) => {
            Logger.Console(`Job stalled for queue: ${queueName}`, 'warn');
        });
    }

    private async monitorLoad() {
        setInterval(async () => {
            for (const queueName of Object.keys(this.queues)) {
                const queue = this.queues[queueName];
                const queueInfo = await queue.getJobCounts();

                //* Adjust concurrency for vertical scaling
                const totalJobs = queueInfo.waiting + queueInfo.active;

                if (totalJobs > this.workerConcurrency * 2) {
                    this.workerConcurrency += 2; //& Scale up
                } else if (this.workerConcurrency > os.cpus().length && totalJobs < this.workerConcurrency) {
                    this.workerConcurrency = Math.max(1, this.workerConcurrency - 1); //& Scale down
                }

                //* Update concurrency for all workers
                const worker = this.workers[queueName];
                if (worker) {
                    worker.opts.concurrency = this.workerConcurrency;
                }

                // if (global.environment === EnvironmentTypes.LOCAL) {
                //     Logger.Console(
                //         `Queue ${queueName} - Total Jobs: ${totalJobs}, Concurrency: ${this.workerConcurrency}`,
                //         "info"
                //     );
                // }

                //* Spawn or remove workers for horizontal scaling
                const shouldSpawnWorker = totalJobs > this.workerConcurrency * 5;
                const shouldRemoveWorker = totalJobs === 0;

                if (shouldSpawnWorker) {
                    this.spawnAdditionalWorker(queueName);
                }

                if (shouldRemoveWorker) {
                    this.terminateWorker(queueName);
                }
            }
        }, 60000);
    }

    private spawnAdditionalWorker(queueName: string): void {
        const additionalWorker = new Worker(queueName, this.queueProcessors[queueName], {
            connection: { url: this.redisConfig.url },
            concurrency: this.workerConcurrency,
        });

        additionalWorker.on("completed", (job) => {
            Logger.Console(`Additional Worker completed job ${job.id} for queue ${queueName}`, "info");
        });

        additionalWorker.on("failed", (job, err) => {
            Logger.Console(`Additional Worker failed job ${job.id} for queue ${queueName} - Error: ${err.message}`, "error");
        });

        this.workers[`${queueName}-extra`] = additionalWorker;
        Logger.Console(`Spawned additional worker for queue: ${queueName}`, "info");
    }

    private async terminateWorker(queueName: string): Promise<void> {
        const workerKey = `${queueName}-extra`;
        if (this.workers[workerKey]) {
            await this.workers[workerKey].close();
            delete this.workers[workerKey];
            Logger.Console(`Terminated additional worker for queue: ${queueName}`, "info");
        }
    }

}

export default GoogleWatchCronJobs;