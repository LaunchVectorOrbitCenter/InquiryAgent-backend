import Joi from 'joi';
import { idsValidator } from '../../core/validators/generalValidators';
import { REGEX } from '../../utils/constants';


export const getDashboardAnalyticsValidator = Joi.object().keys({
    startDate: Joi.string().trim().pattern(REGEX.DATE_IN_YEAR_MONTH_DAY_FORMAT_REGEX).required().label('Start Date'),
    endDate: Joi.string().trim().pattern(REGEX.DATE_IN_YEAR_MONTH_DAY_FORMAT_REGEX).required().label('End Date'),
    storeId: idsValidator.required().label('Store Id')
});


export const getDashboardInsightsValidator = Joi.object().keys({
    startDate: Joi.string().trim().pattern(REGEX.DATE_IN_YEAR_MONTH_DAY_FORMAT_REGEX).required().label('Start Date'),
    endDate: Joi.string().trim().pattern(REGEX.DATE_IN_YEAR_MONTH_DAY_FORMAT_REGEX).required().label('End Date'),
    storeId: Joi.string().trim().pattern(REGEX.MONGODB_ID_REGEX).optional().default(null).allow('').label('Store Id')
});


export const getUserEmailResponsesDashboardInsightsQueryValidator = Joi.object().keys({
    startDate: Joi.string().trim().pattern(REGEX.DATE_IN_YEAR_MONTH_DAY_FORMAT_REGEX).required().label('Start Date'),
    endDate: Joi.string().trim().pattern(REGEX.DATE_IN_YEAR_MONTH_DAY_FORMAT_REGEX).required().label('End Date'),
});