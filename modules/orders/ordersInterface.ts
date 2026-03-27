export interface IOrders {
    _id: string,
    email: string,
    trackingNumber: string,
    deliveryStatus: Record<string, any>,
    isValid: boolean,

    createdAt: string,
    createdBy: string,
    updatedAt: string,
    updatedBy: string,
    deletedAt: string
}