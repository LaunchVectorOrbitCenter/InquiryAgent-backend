import Joi from 'joi';
import DisconnectableEntities from '../../core/enums/disconnectableEntities';
import FrontendViews from '../../core/enums/frontendViews';
import { pageSizeValidator, continuationTokenValidator } from '../../core/validators/generalValidators';
import { DEFAULT_PAYLOAD_FIELDS_SIZE, REGEX } from '../../utils/constants';





export const createStoreValidator = Joi.object().keys({
    storeName: Joi.string().trim().required().label('Store Name'),
    refundPolicy: Joi.string().trim().required().min(DEFAULT_PAYLOAD_FIELDS_SIZE.MIN_REFUND_POLICY_LENGTH).label('Refund Policy').messages({
        'string.min': '{{#label}} should be at least {{#limit}} characters long'
    }),
    subscriptionPortalUrl: Joi.string().trim().uri().optional().allow(null).label('Subscription Portal URL')
});



export const listStoresValidator = Joi.object().keys({
    pageSize: pageSizeValidator,
    continuationToken: continuationTokenValidator,
    fields: Joi.string().trim().optional().allow('').label('Fields'),
    paginate: Joi.boolean().optional().allow('').label('Paginate'),
    view: Joi.string().trim().valid(...Object.values(FrontendViews)).required().label('View')
});


export const disconnectEmailFromWatchValidator = Joi.object().keys({
    slug: Joi.string().trim().required().label('Store Slug'),
    disconnectingEntity: Joi.string().trim().valid(...Object.values(DisconnectableEntities)).required().label('Disconnecting Entity')
});


export const getStoreByIdValidator = Joi.object().keys({
    storeId: Joi.string().trim().pattern(REGEX.MONGODB_ID_REGEX).required().label('Store Id')
});


export const updateStoreNameValidator = Joi.object().keys({
    storeName: Joi.string().trim().required().label('Store Name'),
    subscriptionPortalUrl: Joi.string().trim().uri().optional().allow(null).label('Subscription Portal URL')
});


export const deleteStoreValidator = Joi.object().keys({
    storeSlug: Joi.string().trim().required().label('Store Slug')
});