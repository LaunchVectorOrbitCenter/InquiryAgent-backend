import { Job, Queue, Worker } from "bullmq";
import { Application } from "../../app";
import { Logger } from "../../utils/helpers/logger";
import BackgroundJobs from "../enums/backgroundJobs";
import { BackgroundJobSettings, BullmqQueues } from "../../utils/constants";
import os from 'os';
import GmailManager from "../../integration/gmailManager";
import {
    EmailAnalysisJobMetaData,
    EmailsProcessingJobMetaData
} from "../../modules/emailQueries/emailQueriesInterface";
import { BullMQ } from "../interfaces/bullMQ";
import EnvironmentTypes from "../enums/environmentTypes";
import EmailQueriesService from "../../modules/emailQueries/emailQueriesService";

class EmailsJobProcessor implements BullMQ {
    private static instance: EmailsJobProcessor | null = null;
    private queues: Record<string, Queue> = {};
    private workers: Record<string, Worker> = {};
    private readonly redisConfig = Application.redisConf;
    private workerConcurrency: number = 3;

    private constructor() { }

    private readonly queueProcessors: { [queueName: string]: (job: Job) => Promise<void> } = {
        'emailAnalysis': this.processEmailAnalysis,
        'processEmails': this.processEmails,
    };

    //* PUBLIC FUNCTIONS

    public static getInstance(): EmailsJobProcessor {
        if (!EmailsJobProcessor.instance) {
            EmailsJobProcessor.instance = new EmailsJobProcessor();
        }
        return EmailsJobProcessor.instance;
    }

    public async initQueues(): Promise<void> {
        const queueNames = Object.values(BullmqQueues.EMAILS_QUEUES);
        for (const queueName of queueNames) {
            this.queues[queueName] = new Queue(queueName, {
                connection: { url: this.redisConfig.url },
                defaultJobOptions: {
                    removeOnComplete: true,
                },
            });
        }
        Logger.Console(`Email Analysis Background Job Queues initialized successfully`, 'info');
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

        Logger.Console(`Workers created for User Job Queues`, 'info');
        this.monitorLoad();
    }



    //* ENQUEUE FUNCTIONS

    public enqueueEmailAnalysisJob(jobData: EmailAnalysisJobMetaData) {
        this.queues[BullmqQueues.EMAILS_QUEUES.EMAIL_ANALYSIS].add(BackgroundJobs.PROCESS_EMAIL_ANALYSIS, jobData, {
            delay: Application.conf.ENV === EnvironmentTypes.LOCAL ? 0 : BackgroundJobSettings.DEFAULT_DELAY_IN_PROCESSING,
            backoff: { type: BackgroundJobSettings.BACKOFF_STRATEGY.backoffType, delay: BackgroundJobSettings.BACKOFF_STRATEGY.backoffDelay },
            attempts: BackgroundJobSettings.MAX_RETRY,
            removeOnFail: BackgroundJobSettings.REMOVE_ON_FAIL
        });
    }

    public enqueueEmailProcessingJob(jobData: EmailsProcessingJobMetaData) {
        this.queues[BullmqQueues.EMAILS_QUEUES.PROCESS_EMAILS].add(BackgroundJobs.PROCESS_EMAILS, jobData, {
            delay: Application.conf.ENV === EnvironmentTypes.LOCAL ? 0 : BackgroundJobSettings.DEFAULT_DELAY_IN_PROCESSING,
            backoff: { type: BackgroundJobSettings.BACKOFF_STRATEGY.backoffType, delay: BackgroundJobSettings.BACKOFF_STRATEGY.backoffDelay },
            attempts: BackgroundJobSettings.MAX_RETRY,
            removeOnFail: BackgroundJobSettings.REMOVE_ON_FAIL
        });
    }



    //* PRIVATE FUNCTIONS

    private async processEmails(job: Job) {
        try {
            const { storeId, startDate, endDate } = job.data;
            console.log(`📥 Processing emails for store: ${storeId} from ${startDate} to ${endDate}`);
            await EmailQueriesService.fetchAndProcessEmails(storeId, startDate, endDate);
        } catch (error) {
            console.log(error);
        }
    }

    private async processEmailAnalysis(job: Job) {
        try {
            const data: EmailAnalysisJobMetaData = job.data;
            await GmailManager.getInstance().processIncomingEmail(data.emailAddress);
        } catch (error) {
            console.log(error);
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

export default EmailsJobProcessor;