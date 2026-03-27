import { DBConfig, DBConfigMongo } from './configurations/database';
import { LoggerConf } from './configurations/logger';
import RedisConfig, { IRedisConfig } from './configurations/redis';
import MongoDatabase from './database/database';
import EmailService from './integration/emailService';
import Redis from './integration/redis';
import EmailQueriesRepository from './modules/emailQueries/emailQueriesRepository';
import { HTTPServer } from './server/http';
import GmailManager from './integration/gmailManager';
import { Logger } from './utils/helpers/logger';
import SeventeenTrackManager from './integration/seventeenTrackManager';
import ShopifyManager from './integration/shopifyManager';
import { startCronJobs } from './core/jobs/googleWatchCron';
import { Utils } from './utils/utils';
import colors from 'colors';
import { IAppConfig, AsymmetricEncryption, AESEncryptionModes } from './core/interfaces/appConfig';
import IEnvironment from './core/interfaces/environment';
import IJWTPayload from './core/interfaces/jwt';
import EmailsJobProcessor from './core/jobs/emailsJobProcessor';
import EmailsRepository from './modules/emails/emailsRepository';
import EmailTemplatesRepository from './modules/emailTemplates/emailTemplatesRepository';
import EmailThreadsRepository from './modules/emailThreads/emailThreadsRepository';
import MenusRepository from './modules/menus/menusRepository';
import PermissionsRepository from './modules/permissions/permissionsRepository';
import RolesRepository from './modules/roles/rolesRepositories';
import StoresRepository from './modules/stores/storesRepository';
import SystemAlertsRepository from './modules/systemAlerts/systemAlertsRepository';
import TrackingNumbersRepository from './modules/trackingNumbers/trackingNumbersRepository';
import UsersRepository from './modules/users/usersRepository';
import StoresKnowledgeBaseRepository from './modules/storesKnowledgeBase/storesKnowledgeBaseRepository';
import AiPlaygroundChatroomsRepository from './modules/aiPlaygroundChatrooms/aiPlaygroundChatroomsRepository';
import AiPlaygroundChatroomConversationsRepository from './modules/aiPlaygroundChatroomConversations/aiPlaygroundChatroomConversationsRepository';

declare global {
    namespace NodeJS {
        interface Global {
            __rootdir__: string;
            servicename: string;
            environment: string;
            logger: string;
            delayStart: number;
            __templateURL: string;
        }
    }
}

declare module 'express-serve-static-core' {
    interface Request {
        user?: IJWTPayload;
        token?: string;
        validatedBody: any;
        validatedQuery: any;
        validatedParams: any;
    }
}

global.__rootdir__ = process.cwd();

export class Application {

    public static conf: IAppConfig;
    public static jwtEncryption: AsymmetricEncryption;
    public static aesEncryption: AESEncryptionModes;
    public static dbConfMongo: DBConfigMongo;
    public static redisConf: IRedisConfig;
    public static started: boolean = false;

    private httpServer: HTTPServer;

    public async INIT(env: IEnvironment) {
        this.setupGlobalHandlers();
        this.setupGracefulShutdown(env.config.GracefullShutdown);

        try {
            this.initializeGlobals(env);
            await this.loadConfigurations();

            if (!env.config.VAULT) {
                await this.setupApplicationInfrastructure();
            }

            await this.delayStartIfNeeded(global.delayStart);
            this.setTemplateURL(env.config.services);

            this.httpServer = await this.initializeHTTPServer(env.config);

            Object.seal(this.httpServer);
            Application.started = true;

        } catch (error) {
            Logger.Console(error, 'error');
            Logger.Console('Error occurred while initializing application');
        }
    }

    private setupGlobalHandlers() {
        process.on('unhandledRejection', ex => {
            Logger.Log('Unhandled Rejection !!!!!', 'critical');
            Logger.Log(ex, 'critical');
        });

        process.on('uncaughtException', ex => {
            Logger.Log('Uncaught Exception !!!!!', 'critical');
            Logger.Log(ex, 'critical');
        });
    }

    private setupGracefulShutdown(enableGracefulShutdown: boolean) {
        if (!enableGracefulShutdown) return;

        process.on('SIGINT', async code => {
            await this.handleShutdown('SIGINT', code);
        });

        process.on('SIGTERM', async () => {
            await this.handleShutdown('SIGTERM');
        });
    }

    private async handleShutdown(signal: string, code?: string) {
        try {
            if (!Application.started) process.exit(1);
            console.log(signal, code || '');
            await HTTPServer.StopServer();
        } catch (error) {
            Logger.Log(error, 'critical');
            process.exit(1);
        }
    }

    private initializeGlobals(env: IEnvironment) {
        Logger.CreateLogger(LoggerConf.colors);
        global.servicename = env.config.ServiceName;
        global.environment = env.env;
        global.logger = env.logger;
        global.delayStart = env.delayStart;

        if (!env.config.ServiceName) {
            throw new Error('Unknown Service Name');
        }
    }

    private async loadConfigurations() {
        Application.conf = await Utils.LoadEnv();
        Application.dbConfMongo = DBConfig.GetDbConf('mongo');
        Application.redisConf = RedisConfig.GetRedisConf();
        console.log(colors.blue('################################'));
        console.log(colors.blue('SERVER AND CONFIGURATIONS DETAIL'.blue));
        console.log(colors.blue('################################'));
        console.log(colors.america(`ENVIRONMENT --> ${global.environment}`));
        console.log(colors.cyan(`DATABASE --> ${Application.dbConfMongo.dbname}\tHOST --> ${Application.dbConfMongo.host}`));
    }


    private async setupApplicationInfrastructure() {
        await this.setupDatabase();
        await this.setupRepositories();
        await this.setupServices();
        await this.setupBackgroundJobs();
        await this.setupCronJobs();
    }


    private async setupDatabase() {
        await MongoDatabase.connect(Application.dbConfMongo);
    }

    private async setupServices() {
        Application.jwtEncryption = Application.conf.ENCRYPTION.jwt;
        Application.aesEncryption = Application.conf.ENCRYPTION.aesEncryption;
        await GmailManager.getInstance().setConfig(Application.conf.GOOGLE_OAUTH);
        ShopifyManager.getInstance();
        // ShopifyManager.getInstance().setConfig(Application.conf.SHOPIFY_AUTH);
        SeventeenTrackManager.getInstance().setConfig(Application.conf.SEVENTEEN_TRACK_AUTH);
        await Redis.getInstance().init(Application.redisConf);
        await EmailService.getInstance().init(Application.conf.SERVICES.email.nodeMailer);
    }


    private async setupRepositories() {
        await UsersRepository.getInstance().INIT();
        await MenusRepository.getInstance().INIT();
        await RolesRepository.getInstance().INIT();
        await StoresRepository.getInstance().INIT();
        await EmailsRepository.getInstance().INIT();
        await PermissionsRepository.getInstance().INIT();
        await EmailQueriesRepository.getInstance().INIT();
        await EmailThreadsRepository.getInstance().INIT();
        await SystemAlertsRepository.getInstance().INIT();
        await EmailTemplatesRepository.getInstance().INIT();
        await TrackingNumbersRepository.getInstance().INIT();
        await StoresKnowledgeBaseRepository.getInstance().INIT();
        await AiPlaygroundChatroomsRepository.getInstance().INIT();
        await AiPlaygroundChatroomConversationsRepository.getInstance().INIT();
    }

    private async setupBackgroundJobs() {
        // //* EMAIL JOBS
        await EmailsJobProcessor.getInstance().initQueues();
        await EmailsJobProcessor.getInstance().initWorkers();
    }


    private async setupCronJobs() {
        // await GoogleWatchCronJobs.getInstance().initQueues();
        // await GoogleWatchCronJobs.getInstance().initWorkers();
        // GoogleWatchCronJobs.getInstance().startRefreshGoogleWatchJob();
        startCronJobs();
    }

    private async delayStartIfNeeded(delay: number) {
        if (delay) await Utils.Sleep(delay);
    }

    private setTemplateURL(services: any) {
        if (!services) return;

        const productService = services['product'];
        if (!productService) return;

        const protocol = productService.protocol;
        const host = productService.host;
        const port = productService.port ? `:${productService.port}` : '';

        global.__templateURL = `${protocol}://${host}${port}`;
    }

    private async initializeHTTPServer(config: any) {
        return HTTPServer.INIT(config);
    }

}