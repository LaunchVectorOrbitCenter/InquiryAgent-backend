import FillableField from "../../core/interfaces/fillableFields"
import { GeneralFillables } from "../../core/interfaces/generalInterface"

export interface IPermissions {
    _id: string,
    name: string,
    slug: string,
    menuName:string,
    menuSlug: string,
    description: string,
    apiSlug: string,
    createdAt: string,
    updatedAt: string,
    createdBy: string,
    updatedBy: string,
    deletedAt: string
}



export const PermissionFillableFields: FillableField[] = [
    { column: 'name', columnDataType: 'string' },
    { column: 'slug', columnDataType: 'string' },
    { column: 'menuName', columnDataType: 'string' },
    { column: 'menuSlug', columnDataType: 'string' },
    { column: 'description', columnDataType: 'string' },
    { column: 'apiSlug', columnDataType: 'string' },
    ...GeneralFillables
]




export interface IListPermissionsDTO {
    menuSlug: string
}


export interface ICreatePermissionDTO {
    name: string,
    description: string,
    menuSlug: string,
    apiSlug: string
}



export const optimizedPermissionsReponseFields = [
    '_id',
    'name',
    'slug',
    'menuName',
    'menuSlug',
    'description',
    'apiSlug'
]