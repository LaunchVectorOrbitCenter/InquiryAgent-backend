import FillableField from "../../core/interfaces/fillableFields";
import { GeneralFillables } from "../../core/interfaces/generalInterface";

export interface ITrackingNumbers {
    _id: string,
    trackingNumber: string;
    tenantId: string,
    storeSlug: string,
    createdAt: string,
    updatedAt: string,
    createdBy: string,
    updatedBy: string,
    deletedAt: string
}




export const TrackingNumberFillableFields: FillableField[] = [
    { column: 'trackingNumber', columnDataType: 'string' },
    { column: 'tenantId', columnDataType: 'string' },
    { column: 'storeSlug', columnDataType: 'string' },
    ...GeneralFillables
];



export interface IRegisterTrackingNumberDTO {
    storeId: string,
    trackingNumber: string;
    tenantId: string;
    storeSlug: string;
}



export const optimizedTrackingNumberResponseFields = ['_id', 'trackingNumber', 'tenantId', 'storeSlug', 'createdAt'];