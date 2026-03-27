import Joi from 'joi';
import { idsValidator } from '../../core/validators/generalValidators';





export const sendEmailValidator = Joi.object().keys({
    emailQueryId: idsValidator.required().label('Email Query Id'),
    subject: Joi.string().trim().required().label('Subject'),
    body: Joi.string().trim().required().label('Body')
});