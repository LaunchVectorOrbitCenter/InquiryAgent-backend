import Joi from 'joi'
import { REGEX } from '../../utils/constants';

export const loginValidator = Joi.object().keys({
    email: Joi.string().trim().required().label('Email'),
    password: Joi.string().trim().required().label('Password')
});



export const socialLoginValidator = Joi.object().keys({
    authToken: Joi.string().trim().required().label('Auth Token')
});


// .pattern(REGEX.SHOPIFY_API_KEY_REGEX)

export const connectShopifyValidator = Joi.object().keys({
    adminApiKey: Joi.string().trim().required().pattern(REGEX.SHOPIFY_API_KEY_REGEX).label('Admin API Key').messages({
        'string.pattern.base': "Invalid {{#label}} provided"
    }),
    storeSlug: Joi.string().trim().required().label('Store Slug')
});



export const refreshAccessTokenValidator = Joi.object().keys({
    storeSlug: Joi.string().trim().required().label('Store Slug')
});


export const forgotPasswordValidator = Joi.object().keys({
    email: Joi.string().trim().email().required().label('Email')
});


export const resetPasswordValidator = Joi.object().keys({
    reasonGUID: Joi.string().trim().pattern(REGEX.UUID_V4_REGEX).required().label('Reason GUID').messages({
        'string.pattern.base': 'Invalid {{#label}} provided'
    }),
    token: Joi.string().trim().required().label('Token'),
    password: Joi.string().trim().pattern(REGEX.PASSWORD_REGEX).required().label('Password').messages({
        'string.pattern.base': 'Password does not meet the required format'
    }),
});