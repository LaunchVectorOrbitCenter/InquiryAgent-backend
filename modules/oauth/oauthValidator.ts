import Joi from 'joi';




export const googleOAuthLoginValidator = Joi.object().keys({
    slug: Joi.string().trim().required().label('Store Slug'),
    startDate: Joi.string().trim().optional().label('Start Date'),
    endDate: Joi.string().trim().optional().label('End Date')
});