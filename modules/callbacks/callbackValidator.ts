import Joi from 'joi';

export const googleCallbackValidator = Joi.object().keys({
    state: Joi.string().trim().required().label('State'),
    code: Joi.string().trim().required().label('Code'),
    scope: Joi.string().trim().required().label('Scope')
})