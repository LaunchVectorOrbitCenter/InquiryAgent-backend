import FillableField from "../../core/interfaces/fillableFields";
import BaseModel from "../../core/models/baseModel";
import { IMenus, MenuFillableFields } from "./menusInterface";

abstract class MenusModel extends BaseModel<IMenus> {

    protected static getFillable(): FillableField[] {
        return MenuFillableFields;
    }


    public static create(data: Partial<IMenus>): IMenus {
        const fillables = this.getFillable();
        return this.fill(data, fillables);
    }

}


export default MenusModel;