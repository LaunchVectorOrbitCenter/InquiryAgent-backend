import Joi from 'joi';
import EmailQueryTypes from '../../core/enums/emailQueryTypes';
import StatusTypes from '../../core/enums/statusTypes';
import { idsValidator, pageSizeValidator, continuationTokenValidator } from '../../core/validators/generalValidators';
import EmailQueryCategories from '../../core/enums/queryCategories';




export const emailQueriesValidator = Joi.object().keys({
    storeId: idsValidator.required().label('Store Id'),
    queryType: Joi.string().trim().valid(...Object.values(EmailQueryTypes)).required().label('Query Type'),
    queryStatus: Joi.string().trim().valid(StatusTypes.PROCESSED, StatusTypes.PENDING, StatusTypes.RESOLVED).optional().allow('').label('Query Status'),
    queryCategory: Joi.string().trim().valid(...Object.values(EmailQueryCategories)).optional().allow('').label('Query Category'),
    pageSize: pageSizeValidator,
    continuationToken: continuationTokenValidator
});



export const changeEmailQueryStatusValidator = Joi.object().keys({
    status: Joi.string().trim().valid(StatusTypes.PROCESSED, StatusTypes.PENDING, StatusTypes.RESOLVED).required().label('Status')
});


export const getEmailQueryByIdValidator = Joi.object().keys({
    id: idsValidator.required().label('Query ID')
});