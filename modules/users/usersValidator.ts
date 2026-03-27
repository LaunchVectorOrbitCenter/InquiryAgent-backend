import Joi from 'joi';
import StatusTypes from '../../core/enums/statusTypes';
import UserRoles from '../../core/enums/userRoles';
import { idsValidator, continuationTokenValidator, pageSizeValidator } from '../../core/validators/generalValidators';




export const addUserPartnerValidator = Joi.object().keys({
    email: Joi.string().trim().email().required().label('Partner Email'),
    username: Joi.string().trim().required().label('Username')
});



export const createUserValidator = Joi.object().keys({
    email: Joi.string().trim().email().required().label('Email'),
    username: Joi.string().trim().required().label('Username'),
    role: Joi.string().valid(UserRoles.STORE_MANAGER, UserRoles.SUPPORT_AGENT).required().label('Role'),
    allowedStores: Joi.array().items(idsValidator).min(1).required().label('Allowed Stores')
});



export const listUsersValidator = Joi.object().keys({
    searchText: Joi.string().trim().optional().allow('').label('Search Text'),
    continuationToken: continuationTokenValidator,
    pageSize: pageSizeValidator,
    fields: Joi.string().trim().optional().allow('').label('Fields')
});



export const updateUserParamsValidator = Joi.object().keys({
    userId: idsValidator.required().label('User ID')
});


export const updateUserBodyValidator = Joi.object().keys({
    email: Joi.string().trim().email().optional().label('Email'),
    username: Joi.string().trim().optional().label('Username'),
    role: Joi.string().valid(UserRoles.STORE_MANAGER, UserRoles.SUPPORT_AGENT).optional().label('Role'),
    accountStatus: Joi.string().valid(StatusTypes.ACTIVE, StatusTypes.DELETED).optional().label('Account Status'),
    allowedStores: Joi.array().items(idsValidator).min(1).optional().label('Allowed Stores')
});



