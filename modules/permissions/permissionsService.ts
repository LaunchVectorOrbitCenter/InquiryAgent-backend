import { HttpStatusCode } from "axios";
import PermissionsModel from "./permissionsModel";
import QueryOperators from "../../core/enums/queryOperators";
import { Utils } from "../../utils/utils";
import { CustomError } from "../../core/errors/custom";
import IJWTPayload from "../../core/interfaces/jwt";
import MenusRepository from "../menus/menusRepository";
import { IPermissions, ICreatePermissionDTO, optimizedPermissionsReponseFields, IListPermissionsDTO } from "./permissionsInterface";
import PermissionsRepository from "./permissionsRepository";

class PermissionsService {

    /*
    * ╔══════════════════════════════════════╗
    * ║          PROTECTED METHODS           ║
    * ╚══════════════════════════════════════╝
    */


    protected attachMetaData(data: Partial<IPermissions>, loggedInUser: any) {
        data.slug = Utils.generateSlug(data.name);
        data.createdAt = Utils.getCurrentDate();
        data.createdBy = loggedInUser._id;
    }


    /*
   * ╔═══════════════════════════════════╗
   * ║          PUBLIC METHODS           ║
   * ╚═══════════════════════════════════╝
    */


    public async createPermission(data: ICreatePermissionDTO, loggedInUser: IJWTPayload) {
        await this.checkMenuExistence(data.menuSlug);
        this.attachMetaData(data, loggedInUser);
        await this.checkPermissionNameUniqueness(data.name, data.menuSlug);
        //TODO: check API existence
        const newPermissions = PermissionsModel.create(data);
        return PermissionsRepository.getInstance().Add(newPermissions, optimizedPermissionsReponseFields);
    }


    public async listPermissions(data: IListPermissionsDTO) {
        const getPermissionsConditions: any = [
            ...(data.menuSlug ? [{ param: 'menuSlug', value: data.menuSlug, operator: QueryOperators.AND }] : [])
        ];

        const result: Partial<IPermissions>[] = await PermissionsRepository.getInstance().GetAll(getPermissionsConditions, false, 0, 0, { createdAt: 1 }, optimizedPermissionsReponseFields);

        const grouped = Object.values(
            result.reduce((acc, perm) => {
                const key = perm.menuSlug!;
                if (!acc[key]) {
                    acc[key] = { menuSlug: key, menuPermissions: [] };
                }
                acc[key].menuPermissions.push(perm);
                return acc;
            }, {})
        );

        return { permissions: grouped };
    }



    /*
   * ╔═══════════════════════════════════╗
   * ║          PRIVATE METHODS          ║
   * ╚═══════════════════════════════════╝
    */



    private async checkMenuExistence(menuSlug: string) {
        const getMenuConditions: any = [
            {
                param: 'slug',
                value: menuSlug,
                operator: QueryOperators.AND
            }
        ];
        const menu = await MenusRepository.getInstance().Count(getMenuConditions);
        if (!menu) throw new CustomError(HttpStatusCode.NotFound, 'Menu not found');
    }


    private async checkPermissionNameUniqueness(permissionName: string, menuSlug: string) {
        const getPermissionConditions: any = [
            {
                param: 'name',
                value: permissionName,
                operator: QueryOperators.AND
            },
            {
                param: 'menuSlug',
                value: menuSlug,
                operator: QueryOperators.AND
            }
        ];

        const permissionCount: number = await PermissionsRepository.getInstance().Count(getPermissionConditions);
        if (permissionCount) throw new CustomError(HttpStatusCode.Conflict, 'Permission name already exists for this menu');
    }


}

export default new PermissionsService();