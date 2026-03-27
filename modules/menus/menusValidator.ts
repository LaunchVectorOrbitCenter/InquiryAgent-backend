import Joi from 'joi';
import { continuationTokenValidator, pageSizeValidator } from '../../core/validators/generalValidators';



export const createMenuValidator = Joi.object().keys({
    name: Joi.string().trim().required().label('Menu Name'),
    description: Joi.string().trim().optional().allow(null).label('Menu Description'),
    uri: Joi.string().trim().required().label('Menu URI')
});


export const listMenusValidator = Joi.object().keys({
    searchText: Joi.string().trim().optional().allow('').label('Search Text'),
    continuationToken: continuationTokenValidator,
    pageSize: pageSizeValidator
});