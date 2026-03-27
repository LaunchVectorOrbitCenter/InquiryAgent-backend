import Joi from 'joi';




export const createPermissionValidator = Joi.object().keys({
    name: Joi.string().trim().required().label('Permission name'),
    description: Joi.string().trim().optional().allow(null).label('Permission description'),
    menuSlug: Joi.string().trim().required().label('Menu Slug'),
    apiSlug: Joi.string().trim().optional().allow(null).label('API Slug')
})

export const listPermissionsValidator = Joi.object().keys({
    menuSlug: Joi.string().optional().allow('').label('Menu Slug')
});