import Joi from 'joi';
import { REGEX } from '../../utils/constants';
import { pageSizeValidator, continuationTokenValidator } from '../../core/validators/generalValidators';


const orderDetailsValidator = Joi.object().keys({
    trackingNumber: Joi.string().trim().allow(null, '').optional().label('Tracking Number'),
    orderCreatedAt: Joi.string().trim().isoDate().required().label('Order Created At'),
    trackingUrl: Joi.string().trim().uri().allow(null, '').optional().label('Tracking URL'),
    tags: Joi.array().items(Joi.string().trim()).default([]).label('Tags'),
    deliveryStatus: Joi.object().keys({
        status: Joi.string().trim().required().label('Status'),
        subStatus: Joi.string().trim().required().label('Sub Status'),
        orderDeliveredAt: Joi.string().trim().isoDate().allow(null, '').optional().label('Order Delivered At')
    }).optional().allow(null).label('Delivery Status')
});


export const chatroomIdParamsValidator = Joi.object().keys({
    chatroomId: Joi.string().trim().required().label('Chatroom ID')
});


export const createAiPlaygroundChatroomValidator = Joi.object().keys({
    chatTitle: Joi.string().trim().required().label('Chatroom Title'),
    storeId: Joi.string().trim().pattern(REGEX.MONGODB_ID_REGEX).required().label('Store ID'),
    customerDetail: Joi.object().keys({
        name: Joi.string().trim().required().label('Customer Name')
    }).required().label('Customer Detail'),
    orderDetails: Joi.array().items(orderDetailsValidator).min(1).required().label('Order Details'),
    initialMessage: Joi.object().keys({
        subject: Joi.string().trim().required().label('Subject'),
        body: Joi.string().trim().required().label('Body')
    }).required().label('Initial Message')
});


export const listAiPlaygroundChatroomsValidator = Joi.object().keys({
    continuationToken: continuationTokenValidator,
    pageSize: pageSizeValidator
});
