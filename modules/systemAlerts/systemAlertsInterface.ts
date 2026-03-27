import FillableField from "../../core/interfaces/fillableFields";
import { GeneralFillables } from "../../core/interfaces/generalInterface";

export interface ISystemAlerts {
    _id: string,
    alertDescription: string,
    storeId: string,
    tenantId: string
    isResolved: boolean,
    createdAt: string,
    createdBy: string,
    updatedAt: string,
    updatedBy: string,
    deletedAt: string
}



export const SystemAlertsFillableFields: FillableField[] = [
    { column: '_id', columnDataType: 'string' },
    { column: 'alertDescription', columnDataType: 'string' },
    { column: 'storeId', columnDataType: 'string' },
    { column: 'tenantId', columnDataType: 'string' },
    { column: 'isResolved', columnDataType: 'boolean' },
    ...GeneralFillables
];




export interface IStoreSystemAlertDTO {
    alertDescription: string,
    storeId: string,
    tenantId: string
}

