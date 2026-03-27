import { HttpStatusCode } from "axios";
import QueryOperators from "../../core/enums/queryOperators";
import { Utils } from "../../utils/utils";
import QueryOperationTypes from "../../core/enums/queryOperationTypes";
import UserRoles from "../../core/enums/userRoles";
import { ObjectId } from "mongodb";
import { IPermissions } from "../permissions/permissionsInterface";
import { CustomError } from "../../core/errors/custom";
import IJWTPayload from "../../core/interfaces/jwt";
import PermissionsRepository from "../permissions/permissionsRepository";
import { IListRolesDTO, optimizedRoleResponseFields, IRoles, IAssignPermissionsToRoleDTO } from "./rolesInterface";
import RolesRepository from "./rolesRepositories";

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



    public async listRoles(data: IListRolesDTO, loggedInUser: IJWTPayload) {
        //TODO: Make roles per tenant wise
        const getRolesConditions: any = [
            ...(data.searchText ? [{ param: 'name', value: data.searchText, operator: QueryOperators.AND, operationType: QueryOperationTypes.CONTAINS }] : []),
            {
                param: 'name',
                value: [UserRoles.PLATFORM_ADMIN, UserRoles.SUPER_ADMINISTRATOR],
                operator: QueryOperators.AND,
                operationType: QueryOperationTypes.NOT_IN
            }
        ];

        const columnsToRetrieve: string[] = data.fields.length ? data.fields.split(',') : optimizedRoleResponseFields;
        const roles: Partial<IRoles>[] = await RolesRepository.getInstance().GetAll(getRolesConditions, false, null, 0, { createdAt: 1 }, columnsToRetrieve);
        return { roles }
    }


    public async assignPermissionsToRole(data: IAssignPermissionsToRoleDTO, loggedInUser: IJWTPayload) {
        const countRoleConditions: any = [
            {
                param: '_id',
                value: new ObjectId(data.roleId),
                operator: QueryOperators.AND
            }
        ];

        const role = await RolesRepository.getInstance().Count(countRoleConditions);

        if (!role) throw new CustomError(HttpStatusCode.NotFound, 'Role not found');

        const getPermissions: Record<string, any> = await this.retrievePermissions({ permissions: data.permissions });

        const dataToUpdate: Partial<IRoles> = {
            permissions: getPermissions?.permissions || []
        }

        return RolesRepository.getInstance().Update(new ObjectId(data.roleId), dataToUpdate, optimizedRoleResponseFields);
    }

    
    public async getPermissionsByRoleName(roleName: string) {
        return RolesRepository.getInstance().GetOneByParam({ param: 'name', value: roleName }, ['permissions']);
    }


    /*
   * ╔═══════════════════════════════════╗
   * ║          PRIVATE METHODS          ║
   * ╚═══════════════════════════════════╝
    */


    private async retrievePermissions(requestedPermissions: any) {
        const pipeline = [
            { $limit: 1 },

            // 0. Inject the payload
            { $replaceWith: requestedPermissions },

            // 1. Turn each menu‐permissions object into its own doc
            { $unwind: "$permissions" },

            // 2. Find the menu by slug, drop if not found
            {
                $lookup: {
                    from: "menus",
                    localField: "permissions.menuSlug",
                    foreignField: "slug",
                    as: "menu"
                }
            },
            { $unwind: { path: "$menu", preserveNullAndEmptyArrays: false } },

            // 3. Find matching permission docs
            {
                $lookup: {
                    from: "permissions",
                    let: {
                        menuSlug: "$menu.slug",
                        wantedSlugs: "$permissions.permissions"
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$menuSlug", "$$menuSlug"] },
                                        { $in: ["$slug", "$$wantedSlugs"] }
                                    ]
                                }
                            }
                        },
                        {
                            // shape each permission sub‐doc as { permissionSlug, apiSlug }
                            $project: {
                                _id: 0,
                                permissionSlug: "$slug",
                                apiSlug: 1
                            }
                        }
                    ],
                    as: "matchedPermissions"
                }
            },

            // 4. If none of the user’s permission slugs were valid, drop this menu
            { $match: { matchedPermissions: { $ne: [] } } },

            // 5. Project exactly the shape you asked for
            {
                $project: {
                    _id: 0,
                    menuSlug: "$menu.slug",
                    menuUri: "$menu.uri",
                    menuPermissions: "$matchedPermissions"
                }
            },

            // 6. Re‐group into one array
            {
                $group: {
                    _id: null,
                    permissions: {
                        $push: {
                            menuSlug: "$menuSlug",
                            menuUri: "$menuUri",
                            menuPermissions: "$menuPermissions"
                        }
                    }
                }
            },

            // 7. Final output cleanup
            { $project: { _id: 0, permissions: 1 } }
        ]

        const permissions = await PermissionsRepository.getInstance().customAggregator(pipeline);
        return permissions[0];
    }

}

export default new PermissionsService();