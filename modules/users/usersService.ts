import { HttpStatusCode } from "axios";
import QueryOperators from "../../core/enums/queryOperators";
import UserRoles from "../../core/enums/userRoles";
import { Utils } from "../../utils/utils";
import UsersModel from "./usersModel";
import SecurityManager from "../../utils/helpers/securityManager";
import JwtTypes from "../../core/enums/jwtTypes";
import StatusTypes from "../../core/enums/statusTypes";
import { ObjectId } from "mongodb";
import EmailTemplateTypes from "../../core/enums/emailTemplateTypes";
import QueryOperationTypes from "../../core/enums/queryOperationTypes";
import { CustomError } from "../../core/errors/custom";
import IJWTPayload from "../../core/interfaces/jwt";
import StoresRepository from "../stores/storesRepository";
import { IUsers, IAddUserPartner, optimizedUserResponseFields, ICreateUserDTO, IUpdateUserDTO, listUsersResponseFields, IListUsersDTO } from "./usersInterface";
import UsersRepository from "./usersRepository";



class UsersService {

    /*
    * ╔══════════════════════════════════════╗
    * ║          PROTECTED METHODS           ║
    * ╚══════════════════════════════════════╝
    */

    protected attachMetaData(data: Partial<IUsers>, loggedInUser: IJWTPayload) {
        data.accountStatus = StatusTypes.ACTIVE;
        data.createdAt = Utils.getCurrentDate();
        data.createdBy = loggedInUser.id;
        data.isActive = true;
    }


    /*
   * ╔═══════════════════════════════════╗
   * ║          PUBLIC METHODS           ║
   * ╚═══════════════════════════════════╝
    */

    public async addUserPartner(data: IAddUserPartner, loggedInUser: IJWTPayload) {
        const getUserConditions: any = [
            {
                param: 'email',
                value: data.email,
                operator: QueryOperators.AND
            }
        ];
        await this.validateUserEmailUniqueness(getUserConditions);
        this.attachMetaData(data, loggedInUser);
        data['role'] = UserRoles.MANUFACTURER;
        data['tenantId'] = Utils.UUIDGenerator();
        const newUser = UsersModel.create(data);
        return UsersRepository.getInstance().Add(newUser, optimizedUserResponseFields);
    }


    public async createUser(data: ICreateUserDTO, loggedInUser: IJWTPayload) {
        const getUserConditions: any = [
            {
                param: 'email',
                value: data.email,
                operator: QueryOperators.AND
            },
            {
                param: 'tenantId',
                value: loggedInUser.tenantId,
                operator: QueryOperators.AND
            }
        ];

        await this.validateUserEmailUniqueness(getUserConditions);

        this.attachMetaData(data, loggedInUser);

        const password = Utils.generateRandomPassword();

        const hashedPassword = await SecurityManager.hashPassword(password);

        data['password'] = hashedPassword;
        data['tenantId'] = loggedInUser.tenantId;

        if (data.allowedStores[0] !== '*') {
            await this.assignStores(data, loggedInUser.tenantId);
        }

        const newUser = UsersModel.create(data);

        const result = UsersRepository.getInstance().Add(newUser, optimizedUserResponseFields);

        const emailData = {
            username: data.username,
            email: data.email,
            password
        }

        await Utils.sendMail(data.email, EmailTemplateTypes.ACCOUNT_CREATED, emailData);

        return result;
    }


    public async listUsers(data: IListUsersDTO, loggedInUser: IJWTPayload) {
        const columnsToRetrieve = data.fields ? data.fields.split(',') : listUsersResponseFields;
        const projection: Record<string, number> = {};
        columnsToRetrieve.forEach((field) => {
            projection[field.trim()] = 1;
        });
        const pipeline = [
            {
                $match: {
                    role: { $ne: UserRoles.PLATFORM_ADMIN },
                    email: { $ne: loggedInUser.email },
                    deletedAt: null,
                    ...(data.searchText ? { $or: [{ username: { $regex: data.searchText, $options: 'i' } }, { email: { $regex: data.searchText, $options: 'i' } }] } : {}),
                    ...(loggedInUser.role !== UserRoles.PLATFORM_ADMIN ? { tenantId: loggedInUser.tenantId } : {}),
                },
            },
            {
                $sort: { createdAt: -1 },
            },
            {
                $project: projection
            }
        ];

        // $limit: data.pageSize || 10,
        // $skip: data.continuationToken || 0,

        const result = await UsersRepository.getInstance().customAggregator(pipeline);

        return { users: result };
    }


    public async updateUser(data: IUpdateUserDTO, loggedInUser: IJWTPayload) {
        const { userId, ...userDetails } = data;
        const getUserConditions: any = [
            {
                param: '_id',
                value: new ObjectId(userId),
                operator: QueryOperators.AND
            },

            ...(loggedInUser.role === UserRoles.PLATFORM_ADMIN ? [] : [
                {
                    param: 'tenantId',
                    value: loggedInUser.tenantId,
                    operator: QueryOperators.AND
                }
            ]),
            {
                param: 'role',
                value: { $ne: UserRoles.PLATFORM_ADMIN },
                operator: QueryOperators.AND
            },
            {
                param: '_id',
                value: { $ne: new ObjectId(loggedInUser.id) },
                operator: QueryOperators.AND
            }
        ];

        const user: Partial<IUsers> = await UsersRepository.getInstance().GetOneByParams(getUserConditions, ['_id']);
        if (!user) throw new CustomError(HttpStatusCode.NotFound, 'User not found');

        if (data?.allowedStores?.length && data?.allowedStores[0] !== '*') await this.assignStores(data, loggedInUser.tenantId);

        if (userDetails.accountStatus === StatusTypes.DELETED) {
            userDetails['deletedAt'] = Utils.getCurrentDate();
            userDetails['isActive'] = false;
        }

        const userUpdatedDetails = await UsersRepository.getInstance().Update(new ObjectId(userId), userDetails, listUsersResponseFields);

        if (userDetails.accountStatus !== StatusTypes.DELETED) return userUpdatedDetails;

        return null;
    }


    public async validateUserAccount(email: string, requestedColumns: string[] = [], throwError: boolean = true) {
        const getUserAccountConditions: any = [
            {
                param: 'email',
                value: email,
                operator: QueryOperators.AND
            },
            {
                param: 'accountStatus',
                value: StatusTypes.ACTIVE,
                operator: QueryOperators.AND
            }
        ];

        const columnsToRetrieve = requestedColumns.length ? requestedColumns : [...optimizedUserResponseFields, 'password'];
        const user = await UsersRepository.getInstance().GetOneByParams(getUserAccountConditions, columnsToRetrieve);
        if (!user && throwError) throw new CustomError(HttpStatusCode.Unauthorized, 'Invalid credentials provided');
        return user
    }


    public async issueJwt(user: Partial<IUsers>, jwtType: JwtTypes) {
        let jwtPayload: IJWTPayload = null;
        let token = null;

        switch (jwtType) {
            case JwtTypes.API:
                jwtPayload = {
                    id: user._id.toString(),
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    allowedStores: user.allowedStores,
                    jwtType,
                    ...(user.role !== UserRoles.PLATFORM_ADMIN ? { tenantId: user.tenantId } : {})
                }
                token = await SecurityManager.generateJWT(jwtPayload, jwtType);
                return { token };

            case JwtTypes.PASSWORD_RESET:
                jwtPayload = {
                    id: user._id.toString(),
                    username: user.username,
                    email: user.email,
                    jwtType,
                    ...(user.role !== UserRoles.PLATFORM_ADMIN ? { tenantId: user.tenantId } : {})
                }
                token = await SecurityManager.generateJWT(jwtPayload, jwtType);
                const reasonGUID = Utils.UUIDGenerator();
                return { token, reasonGUID };

            default:
                throw new CustomError(HttpStatusCode.BadRequest, 'Invalid jwt type provided');
        }
    }


    public async validatePassword(password: string, passwordHash: string) {
        const isPasswordMatched = await SecurityManager.verifyPassword(password, passwordHash);
        if (!isPasswordMatched) throw new CustomError(HttpStatusCode.Unauthorized, 'Invalid credentials provided');
    }


    public async updateUserPassword(userId: string, password: string) {
        await UsersRepository.getInstance().Update(new ObjectId(userId), { password })
    }


    /*
   * ╔═══════════════════════════════════╗
   * ║          PRIVATE METHODS          ║
   * ╚═══════════════════════════════════╝
    */


    private async validateUserEmailUniqueness(parameters: any) {
        const userCount = await UsersRepository.getInstance().Count(parameters);
        if (userCount) throw new CustomError(HttpStatusCode.Conflict, 'A user already exists with the provided email');
    }


    private async assignStores(data: Partial<IUsers>, tenantId: string) {
        const storeIds = Array.from(new Set(data.allowedStores)).map((store: string) => new ObjectId(store));
        const getStoresConditions: any = [
            {
                param: 'tenantId',
                value: tenantId,
                operator: QueryOperators.AND
            },
            {
                param: '_id',
                value: storeIds,
                operator: QueryOperators.AND,
                operationType: QueryOperationTypes.IN
            }
        ];
        const stores: Record<string, any> = await StoresRepository.getInstance().GetAll(getStoresConditions, false, null, 0, null, ['_id']);
        if (!stores.length) throw new CustomError(HttpStatusCode.BadRequest, 'Invalid store(s) provided');
        data['allowedStores'] = stores.map((store: any) => store._id.toString());
    }

}


export default new UsersService;