import FillableField from "../../core/interfaces/fillableFields";
import BaseModel from "../../core/models/baseModel";
import { IPermissions, PermissionFillableFields } from "./permissionsInterface";

abstract class PermissionsModel extends BaseModel<IPermissions> {

    protected static getFillable(): FillableField[] {
        return PermissionFillableFields;
    }


    public static create(data: Partial<IPermissions>): IPermissions {
        const fillables = this.getFillable();
        return this.fill(data, fillables);
    }

}


export default PermissionsModel;