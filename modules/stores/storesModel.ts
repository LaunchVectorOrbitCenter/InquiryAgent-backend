import FillableField from "../../core/interfaces/fillableFields";
import BaseModel from "../../core/models/baseModel";
import { IStores, StoreFillableFields } from "./storesInterface";

abstract class StoresModel extends BaseModel<IStores> {

    protected static getFillable(): FillableField[] {
        return StoreFillableFields;
    }


    public static create(data: Partial<IStores>): IStores {
        const fillables = this.getFillable();
        return this.fill(data, fillables);
    }

}


export default StoresModel;