import FillableField from "../../core/interfaces/fillableFields"
import { GeneralFillables } from "../../core/interfaces/generalInterface"

export interface IUsers {
    _id: string,
    email: string,
    role: string,
    tenantId: string,
    username: string,
    password: string,
    isActive: boolean,
    accountStatus: string,
    profilePicImage: string
    allowedStores: string[]

    createdAt: string,
    createdBy: string,
    updatedAt: string,
    updatedBy: string,
    deletedAt: string
}



export const UserFillableFields: FillableField[] = [
    { column: 'email', columnDataType: 'string' },
    { column: 'role', columnDataType: 'string' },
    { column: 'profilePicImage', columnDataType: 'string' },
    { column: 'tenantId', columnDataType: 'string' },
    { column: 'username', columnDataType: 'string' },
    { column: 'password', columnDataType: 'string' },
    { column: 'isActive', columnDataType: 'boolean' },
    { column: 'accountStatus', columnDataType: 'string' },
    { column: 'allowedStores', columnDataType: 'array' },
    ...GeneralFillables
]


export interface IAddUserPartner {
    email: string,
    username: string
}


export interface ILoginDTO {
    email: string,
    password: string
}


export interface ICreateUserDTO {
    email: string,
    username: string,
    role: string,
    allowedStores: string[]
}

export interface ISocialLoginDTO {
    authToken: string
}


export interface IForgotPasswordDTO {
    email: string
}


export interface IResetPasswordDTO {
    reasonGUID: string,
    password: string,
    token: string
}


export interface IListUsersDTO {
    searchText: string,
    continuationToken: number,
    pageSize: number,
    fields: string
}


export interface IUpdateUserDTO {
    userId: string,
    email: string,
    username: string,
    role: string,
    accountStatus: string,
    allowedStores: string[]
}


export const listUsersResponseFields = [
    '_id',
    'email',
    'role',
    'username',
    'profilePicImage',
    'isActive',
    'accountStatus',
    'createdAt',
    'allowedStores'
]


export const optimizedUserResponseFields = [
    '_id',
    'email',
    'role',
    'tenantId',
    'username',
    'profilePicImage',
    'isActive',
    'accountStatus',
    'createdAt',
    'allowedStores'
]