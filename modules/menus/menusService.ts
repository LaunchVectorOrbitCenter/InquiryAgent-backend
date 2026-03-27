import MenusModel from "./menusModel";
import QueryOperationTypes from "../../core/enums/queryOperationTypes";
import QueryOperators from "../../core/enums/queryOperators";
import { Utils } from "../../utils/utils";
import IJWTPayload from "../../core/interfaces/jwt";
import { IMenus, ICreateMenuDTO, IListMenusDTO, optimizedMenusReponseFields } from "./menusInterface";
import MenusRepository from "./menusRepository";

class MenusService {

    /*
    * ╔══════════════════════════════════════╗
    * ║          PROTECTED METHODS           ║
    * ╚══════════════════════════════════════╝
    */


    protected attachMetaData(data: Partial<IMenus>, loggedInUser: any) {
        data.createdAt = Utils.getCurrentDate();
    }


    /*
   * ╔═══════════════════════════════════╗
   * ║          PUBLIC METHODS           ║
   * ╚═══════════════════════════════════╝
    */


    public async createMenu(data: ICreateMenuDTO, loggedInUser: IJWTPayload) {
        this.attachMetaData(data, loggedInUser);
        const newMenu = MenusModel.create(data);
        return MenusRepository.getInstance().Add(newMenu);
    }


    public async listMenus(data: IListMenusDTO) {
        const getMenusConditions: any = [
            ...(data.searchText ? [{ param: 'name', value: data.searchText, operator: QueryOperators.AND, operationType: QueryOperationTypes.CONTAINS }] : []),
        ];

        const result: Record<string, any> = await MenusRepository.getInstance().GetAll(getMenusConditions, true, data.continuationToken, data.pageSize, { createdAt: -1 }, optimizedMenusReponseFields);

        const paginatedData = Utils.pagination(!result.continuationToken, result.data, result.continuationToken, result.data.length);
        return paginatedData;
    }



    /*
   * ╔═══════════════════════════════════╗
   * ║          PRIVATE METHODS          ║
   * ╚═══════════════════════════════════╝
    */


}


export default new MenusService();