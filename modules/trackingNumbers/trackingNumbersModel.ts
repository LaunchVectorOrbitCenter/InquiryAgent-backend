import FillableField from '../../core/interfaces/fillableFields';
import BaseModel from '../../core/models/baseModel';
import { ITrackingNumbers, TrackingNumberFillableFields } from './trackingNumbersInterface';

abstract class TrackingNumbersModel extends BaseModel<ITrackingNumbers> {

    protected static getFillable(): FillableField[] {
        return TrackingNumberFillableFields;
    }


    public static create(data: Partial<ITrackingNumbers>): ITrackingNumbers {
        const fillables = this.getFillable();
        return this.fill(data, fillables);
    }

}


export default TrackingNumbersModel;