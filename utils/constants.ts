import { Application } from "../app";
import EnvironmentTypes from "../core/enums/environmentTypes";
import QueryIntents from "../core/enums/queryIntents";

export const ASC = 1;
export const DESC = -1;
export const DEFAULT_ORDER: string = 'asc';
export const DEFAULT_ROUND_OFF = 2;
export const PER_PAGE = 10;
export const PAGE = 1;
export const OTP_TTL = {
    SECONDS: 30,
    MINUTES: 5
};
export const DEFAULT_CREATED_BY = 'System'
const BYTES_IN_KILOBYTE = 1024;
const BYTES_IN_MEGABYTE = BYTES_IN_KILOBYTE * BYTES_IN_KILOBYTE;
export const RANDOM_OFFSET = 0.5;
export const FILE_SIZE_LIMIT = BYTES_IN_MEGABYTE * 8;
export const DECIMAL_PLACEHOLDER = 0;
export const AGE_LIMIT = 18;
export const JWT_CONFIGURATION = {
    apiAccessTokenExpiration: '3d',
    passwordResetTokenExpiration: '15m'
}
export const DEFAULT_OTP_LENGTH = 4;
export const DEFAULT_GUID_LENGTH = 36;
export const DEFAULT_NUMBER_MIN_LENGTH = 10;
export const DEFAULT_NUMBER_MAX_LENGTH = 15;
export const UUID_SIZE = 36;
export const ADD_HOURS = 5;
export const ALLOWED_HTTP_METHODS = ['POST', 'GET'];
export const DEFAULT_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/
export const DEFAULT_APPLICATION_PORT = 8000
export const APP_NAME = 'Inquiry Agent'
export const DEFAULT_PAYLOAD_FIELDS_SIZE = {
    MIN_LENGTH: 1,
    MAX_LENGTH: 255,
    NAMES_MAX_SIZE: 50,
    GUEST_USERNAME_SIZE: 12,
    MIN_PASSWORD_LENGTH: 8,
    MAX_PASSWORD_LENGTH: 20,
    MIN_REFUND_POLICY_LENGTH: 10
}

export const TIME_SETTINGS = {
    MIDNIGHT: 12,
    STRIP_LIMIT: 10,
    CONVERT_TO_SEC: 1000,
    CONVERT_TO_MIN: 60000,
    CONVERT_TO_HOUR: 3600000,
    MINUTE_PER_SEC: 60,
    ORDER_TRACKING_WAIT_TIME: 5 * 60 * 1000
}

export const MOBILE_NUMBER_CONFIGURATION = {
    MIN_LENGTH: 10,
    MAX_LENGTH: 15
}

export const PLATFORM_USERNAME_CONFIGURATION = {
    MIN_LENGTH: 3,
    MAX_LENGTH: 30
}

export const DATE_FORMAT_CONFIGURATION = {
    DOB: 'DD-MM-YYYY',
    BOOKINGS: 'YYYY-MM-DD'
}

export const REGEX = {
    GENRE_SUB_GENRE_NAME_REGEX: /^[A-Za-z\s-&]+$/,
    ALPHA_ONLY_REGEX: /^[A-Za-z\s]+$/,
    NON_NUMERIC_STRING_REGEX: /^[^\d]+$/,
    NUMERIC_STRING_REGEX: /^\d*$/,
    POSITIVE_NUMERIC_STRING_REGEX: /^[1-9]\d*$/,
    PHONE_NUMBER_REGEX: new RegExp(`^\\d{${MOBILE_NUMBER_CONFIGURATION.MIN_LENGTH},${MOBILE_NUMBER_CONFIGURATION.MAX_LENGTH}}$`),
    PASSWORD_REGEX: DEFAULT_PASSWORD_REGEX,
    FILE_TYPES: /jpeg|jpg|png|doc|docx|xlsx|pdf|csv|txt/,
    REASON_GUID_REGEX: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    STRIP_ESCAPE_QUOTATION_MARKS_REGEX: /['"]/g,
    SOCIAL_LOGIN_CLIENT_ID_REGEX: /^[a-zA-Z0-9-_.]{8,128}$/,
    UUID_V4_REGEX: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    MONGODB_ID_REGEX: /^[a-f\d]{24}$/i,
    PLATFORM_USERNAME_REGEX: /^(?!.*(\.\.|__))[a-zA-Z0-9._]+$/,
    SLOT_TIME_FORMAT: /^([0-1]\d|2[0-3]):([0-5]\d)$/,
    PAGINATION_CONTINUATION_TOKEN: /^\+RID:[a-zA-Z0-9+/=~]+#RT:\d+(#TRC:\d+)?(#RTD:[a-zA-Z0-9+/=~]+)?#ISV:\d+#IEO:\d+#QCF:\d+$/,
    DATE_IN_YEAR_MONTH_DAY_FORMAT_REGEX: /^\d{4}-\d{2}-\d{2}$/,
    STRIPE_PAYMENT_METHOD_ID_REGEX: /^pm_[a-zA-Z0-9]{24}$/,
    REMOVE_TRAILING_UNDERSCORE_REGEX: /_+$/,
    SHOPIFY_API_KEY_REGEX: /^shpat_[a-f0-9]{32}$/
}


export const DATABASE_DEFAULT_CONFIGURATIONS = {
    DEFAULT_POOL_CONNECTION_SIZE: 10
}

export const DEFAULT_NUMBER_CONFIGURATIONS = {
    INVALID_INDEX: -1,
    ALLOWED_NUMBER_OF_DECIMAL_PLACES: 2
}


export const PAGINATION_CONFIGURATION = {
    DEFAULT_APPLY_PAGINATION: false,
    DEFAULT_PAGE_NUMBER: 1,
    DEFAULT_MAX_PAGE_SIZE: 50,
    DEFAULT_MIN_PAGE_SIZE: 1,
    DEFAULT_CONTINUATION_TOKEN_MIN_VALUE: 1
}

export const RANDOM_PASSWORD_FORMAT = {
    length: 8,
    numbers: true,
    symbols: true,
    lowercase: true,
    uppercase: true,
    excludeSimilarCharacters: true
}



export const SALT_ROUNDS = {
    DEFAULT: 12,
    PASSWORD_SALT_ROUND: 12
}


export const CronJobsQueues = {
    GOOGLE_WATCH_CRON_JOB_QUEUES: {
        REFRESH_GOOGLE_WATCH: 'refreshGoogleWatch'
    }
}


export const BYTE_SIZE = {
    CODE: 8,
    IV: 12,
    KEY: 16,
    SALT: 16,
    SECRET: 32
}


export const ENCRYPTION_CONFIGURATION = {
    SHA_ALGO_KEY_LENGTH: 32,
    SHA_ALGO_ITERATION: 1,
}


export const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export const DEFAULT_OPTIMIZATION_FIELDS = ['createdAt', 'updatedAt', 'deletedAt', 'createdBy', 'updatedBy', 'password']


export const MONGODB_COLLECTIONS = {
    USERS: 'users',
    MENUS: 'menus',
    ROLES: 'roles',
    STORES: 'stores',
    ORDERS: 'orders',
    EMAILS: 'emails',
    PERMISSIONS: 'permissions',
    EMAIL_QUERIES: 'email_queries',
    EMAIL_THREADS: 'email_threads',
    SYSTEM_ALERTS: 'system_alerts',
    EMAIL_TEMPLATES: 'email_templates',
    TRACKING_NUMBERS: 'tracking_numbers',
    STORES_KNOWLEDGE_BASE: 'stores_knowledge_base',
    PLAYGROUND_CHATROOMS: 'playground_chatrooms',
    PLAYGROUND_MESSAGES: 'playground_messages'
}


export const BackgroundJobSettings = {
    MAX_RETRY: 3,
    REMOVE_ON_FAIL: true,
    DEFAULT_DELAY_IN_PROCESSING: 120000,
    BACKOFF_STRATEGY: {
        backoffType: 'exponential',
        backoffDelay: 1000
    }
}



export const ShopifyUrls = {
    orders: `https://SHOPIFY_STORE.myshopify.com/admin/api/2023-10/orders.json`
}




export const SeventeenTrackMainStatuses: Record<string, string> = {
    NotFound: "Tracking number not found.",
    InfoReceived: "Carrier has received order info.",
    InTransit: "Package is in transit.",
    Expired: "Package has been in transit for too long.",
    AvailableForPickup: "Package is ready for pickup.",
    OutForDelivery: "Package is out for delivery.",
    DeliveryFailure: "Delivery attempt failed.",
    Delivered: "Package has been delivered.",
    Exception: "Package encountered an issue."
};


export const SeventeenTrackSubStatuses: Record<string, Record<string, string>> = {
    NotFound: {
        NotFound_Other: "The carrier didn't return any message",
        NotFound_InvalidCode: "The tracking number is invalid"
    },
    InfoReceived: {
        InfoReceived: "No specific breakdown of meaning, same with the main status"
    },
    InTransit: {
        InTransit_PickedUp: "The carrier has collected the package from the sender",
        InTransit_Other: "Other circumstances beyond the currently known sub- statuses",
        InTransit_Departure: "Package has left the originating country/ region's port",
        InTransit_Arrival: "Package has arrived at the destination country / region's port",
        InTransit_CustomsProcessing: "Your shipment is under the customs clearance process",
        InTransit_CustomsReleased: "Import / Export customs clearance is completed",
        InTransit_CustomsRequiringInformation: "Related information is required for clearance"
    },
    Expired: {
        Expired_Other: "Order is expired"
    },
    AvailableForPickup: {
        AvailableForPickup_Other: "Order is available for pickup",
    },
    OutForDelivery: {
        OutForDelivery_Other: "Order is out for delivery"
    },
    DeliveryFailure: {
        DeliveryFailure_Other: "Other circumstances beyond the currently known sub-statuses",
        DeliveryFailure_NoBody: "Unable to contact the recipient temporarily during the delivery process, resulting in delivery failure",
        DeliveryFailure_Security: "Package encountered security, customs clearance, or fee issues during delivery, resulting in delivery failure",
        DeliveryFailure_Rejected: "Recipient refused to accept the package for certain reasons, resulting in delivery failure",
        DeliveryFailure_InvalidAddress: "Delivery failure due to an incorrect recipient address"
    },
    Delivered: {
        Delivered_Other: "Order delivered",
    },
    Exception: {
        Exception_Other: "Other circumstances beyond the currently known sub-statuses",
        Exception_Returning: "Package is being returned to the sender",
        Exception_Returned: "Sender has successfully received the returned package",
        Exception_NoBody: "Cannot find the receipient due to the abnormal recipient information discovered before delivery",
        Exception_Security: "Abnormalities found before delivery, including security, customs clearance, or fee issues",
        Exception_Damage: "The pacakge was found damaged during the transportation process",
        Exception_Rejected: "Recipient refused to accept the package before delivery",
        Exception_Delayed: "Possible delay beyond the original scheduled transit time due to various circumstances",
        Exception_Lost: "Package lost due to various circumstances",
        Exception_Destroyed: "Package unable to be delivered for various reasons and subsequently destroyed",
        Exception_Cancel: "Shipment order was cancelled due to various circumstances"
    }
}


export const SeventeenTrackErrorCodesMap: Record<string, any>[] = [
    {
        "code": -18010001,
        "detail": "Your IP is not in the whitelist. You can set it in the dashboard."
    },
    {
        "code": -18010002,
        "detail": "Invalid security key."
    },
    {
        "code": -18010003,
        "detail": "Internal service error. Please try again later."
    },
    {
        "code": -18010004,
        "detail": "The account is disabled."
    },
    {
        "code": -18010005,
        "detail": "Unauthorized access."
    },
    {
        "code": -18010010,
        "detail": "Please provide the data {0}."
    },
    {
        "code": -18010011,
        "detail": "The value of data {0} is invalid."
    },
    {
        "code": -18010012,
        "detail": "The format of the data {0} is invalid."
    },
    {
        "code": -18010013,
        "detail": "Invalid submitted data."
    },
    {
        "code": -18010014,
        "detail": "Tracking numbers exceed 40 limit."
    },
    {
        "code": -18010015,
        "detail": "The value {0} of the field {1} is invalid."
    },
    {
        "code": -18010016,
        "detail": "Last-mile carrier can only be set for postal services."
    },
    {
        "code": -18010018,
        "detail": "The '{1}' field is required for this tracking. Please provide Alpha-2 country code and postal code. Example: '{0}'."
    },
    {
        "code": -18010019,
        "detail": "The '{1}' field is required for this tracking. Please provide postal code. Example: '{0}'."
    },
    {
        "code": -18010020,
        "detail": "The '{1}' field is required for this tracking. Please provide phone number. Example: '{0}'."
    },
    {
        "code": -18010022,
        "detail": "Additional information is needed to continue tracking your package. Example: '2024-01-01'."
    },
    {
        "code": -18010201,
        "detail": "Webhook URL is required."
    },
    {
        "code": -18010202,
        "detail": "Incorrect URL format of 'Webhook'."
    },
    {
        "code": -18010203,
        "detail": "WebHook test failed, Http status code: {0}."
    },
    {
        "code": -18010204,
        "detail": "Webhook URL not set, can't push data."
    },
    {
        "code": -18010205,
        "detail": "Incorrect IP format."
    },
    {
        "code": -18010206,
        "detail": "Push failed."
    },
    {
        "code": -18019901,
        "detail": "Tracking number {0} is already registered."
    },
    {
        "code": -18019902,
        "detail": "Tracking number {0} is not registered yet. Please register first."
    },
    {
        "code": -18019903,
        "detail": "The carrier cannot be detected, please visit https://res.17track.net/asset/carrier/info/apicarrier.all.json for the carrier code and send it as the parameter."
    },
    {
        "code": -18019904,
        "detail": "Only stopped numbers can be re-tracked."
    },
    {
        "code": -18019905,
        "detail": "Each tracking number can only be re-tracked once."
    },
    {
        "code": -18019906,
        "detail": "Only numbers being tracked can be stopped."
    },
    {
        "code": -18019907,
        "detail": "Tracking amount exceeds your daily limit."
    },
    {
        "code": -18019908,
        "detail": "Your quotas have run out."
    },
    {
        "code": -18019909,
        "detail": "No tracking info at the moment."
    },
    {
        "code": -18019910,
        "detail": "Carrier Code {0} is incorrect."
    },
    {
        "code": -18019911,
        "detail": "The tracking number of this carrier cannot be registered at the moment."
    },
    {
        "code": -18019801,
        "detail": "The tracking number is registered with multiple carriers. Please specify which tracking number you want to change the carrier code for by specifying the carrier_old parameter."
    },
    {
        "code": -18019802,
        "detail": "The parameter carrier_new {0} is incorrect."
    },
    {
        "code": -18019803,
        "detail": "The Carrier Code to be changed cannot be the same as the current one."
    },
    {
        "code": -18019804,
        "detail": "The Carrier Code to be changed must be specified to carrier_new or final_carrier_new."
    },
    {
        "code": -18019805,
        "detail": "The tracking number {1} for the specified carrier {0} is not registered, or the existing carrier parameter carrier_old is incorrect."
    },
    {
        "code": -18019806,
        "detail": "Carrier cannot be changed for stopped numbers. Please retrack the number before changing the carrier."
    },
    {
        "code": -18019807,
        "detail": "The times for changing carrier exceed limit."
    },
    {
        "code": -18019808,
        "detail": "The tracking result has not been returned after the latest registration or modification. Please wait for the tracking result to be returned before changing it."
    },
    {
        "code": -18019809,
        "detail": "The registration information of the carrier with tracking number {0} already exists and cannot be changed to a duplicate registration information."
    },
    {
        "code": -18019810,
        "detail": "Data that meet the update condition are not unique."
    },
    {
        "code": -18019811,
        "detail": "The data needed to be changed is not valid."
    },
    {
        "code": -18019818,
        "detail": "The carrier is not supported in the real-time tracking interface."
    },
    {
        "code": -18019817,
        "detail": "System error; the charge for this request was not processed."
    },
    {
        "code": -18019816,
        "detail": "The carrier interface encountered an error, and no tracking results were retrieved."
    },
    {
        "code": -18019815,
        "detail": "The carrier interface response timed out."
    },
    {
        "code": -18019912,
        "detail": "Unauthorized account access to the real-time tracking interface."
    }
]



export const BullmqQueues = {
    EMAILS_QUEUES: {
        EMAIL_ANALYSIS: 'emailAnalysis',
        PROCESS_EMAILS: 'processEmails'
    },
}


export const StoreConfigurations = {
    defaultOrderCancellationEligibilityWindowInHours: 12
}
