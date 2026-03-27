import { DBConfigMongo } from '../../configurations/database';

export interface AESEncryption {
    key: string,
    iv: string
}

export interface AESEncryptionModes {
    gmc: AESEncryption
}

export interface DB {
    mongodb: {
        configuration: DBConfigMongo
    }
}


export interface Notification {
    token?: string,
    serviceUrl: string
}

export interface JWT {
    api: string
}


export interface API {
    trackAuth: boolean,
    trackApi: boolean
}


export interface NodemailerSMTP {
    host: string;
    port: number;
    service: string;
    secureConnection: string;
    auth: {
        user: string;
        pass: string;
    }
}


export interface Email {
    nodeMailer: NodemailerSMTP
}


export interface AzureGPT {
    endpoint: string,
    deploymentName: string,
    apiVersion: string,
    apiKey: string
}


export interface OpenAIGPT {
    deploymentName: string,
    apiKey: string
}


export interface LLM {
    aiModelProvider: string,
    azureGPT?: AzureGPT,
    openAIGPT?: OpenAIGPT
}

export interface Services {
    email: Email,
    redis: Redis,
    llm: LLM
}


export interface ServiceBus {
    conntections: {
        primary: string,
        secondary: string
    },
    topics: Record<string, string>,
    queues?: Record<string, string>
}

export interface AsymmetricEncryption {
    api: {
        publicKey: string,
        privateKey: string,
        passphrase: string
    }
}


export interface Encryption {
    jwt: AsymmetricEncryption,
    aesEncryption?: AESEncryptionModes
}


export interface Redis {
    url: string
}


export interface GoogleOAuth {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    projectId: string;
    oAuthScopes: string[];
    topicName: string;
}


export interface ShopifyAuth {
    shopifyStore: string,
    shopifyAccessToken: string,
    shopifyApiKey: string
    shopifyApiSecret: string,
    shopifyAppClientId: string,
    shopifyAppClientSecret: string
}



export interface SeventeenTrackAuth {
    apiToken: string
}


export interface Urls {
    frontendBaseUrl: string
}


export interface IAppConfig {
    PORT: number,
    ENV: string,
    DB: DB,
    URLS: Urls,
    ENCRYPTION: Encryption,
    GOOGLE_OAUTH: GoogleOAuth,
    SEVENTEEN_TRACK_AUTH: SeventeenTrackAuth,
    SERVICES: Services,
    CLIENT_URL: string
    // SHOPIFY_AUTH: ShopifyAuth,
}

