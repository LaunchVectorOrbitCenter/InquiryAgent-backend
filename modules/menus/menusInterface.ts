import FillableField from "../../core/interfaces/fillableFields"
import { GeneralFillables } from "../../core/interfaces/generalInterface"

export interface IMenus {
    _id: string,
    name: string,
    slug: string,
    parentSlug: string,
    description: string,
    uri: string,
    createdAt: string,
    updatedAt: string,
    createdBy: string,
    updatedBy: string,
    deletedAt: string
}



export interface ICreateMenuDTO {
    name: string,
    description: string,
    uri: string
}



export interface IListMenusDTO {
    searchText: string,
    continuationToken?: number,
    pageSize?: number
}



export const MenuFillableFields: FillableField[] = [
    { column: 'name', columnDataType: 'string' },
    { column: 'slug', columnDataType: 'string' },
    { column: 'parentSlug', columnDataType: 'string' },
    { column: 'description', columnDataType: 'string' },
    { column: 'uri', columnDataType: 'string' },
    ...GeneralFillables
]




export const optimizedMenusReponseFields = [
    '_id',
    'name',
    'slug',
    'parentSlug',
    'description',
    'uri'
]