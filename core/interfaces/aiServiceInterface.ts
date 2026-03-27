import ResponseFormats from "../enums/responseFormats";

export interface IAnalyzeEmailDTO {
    emailContent: string,
    storeId: string,
    storeSlug: string,
    storeName: string,
    maskedName: string,
    refundPolicy: string,
    subscriptionPortalUrl: string,
    tenantId: string,
    orderDetails: OrderDetailsSnapshot[],
    customerDetail: CustomerDetailsSnapshot,
    threadId: string
}


export interface CustomerDetailsSnapshot {
    name: string
}

export interface IProcessEmailResponseDTO {
    emailContent: string,
    storeId: string,
    storeSlug: string,
    storeName: string,
    maskedName: string,
    refundPolicy: string,
    subscriptionPortalUrl: string,
    tenantId: string,
    orderDetails: OrderDetailsSnapshot[],
    customerDetail: CustomerDetailsSnapshot,
    threadId: string,
    responseFormat?: ResponseFormats,
    onlyPublishedInstructions?: boolean
}



export interface OrderDetailsSnapshot {
    trackingNumber: string,
    orderCreatedAt: string,
    trackingUrl: string,
    tags: string[],
    deliveryStatus?: {
        status: string,
        subStatus: string,
        orderDeliveredAt: string | null
    }
}