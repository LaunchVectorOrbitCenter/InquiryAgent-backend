import Joi from 'joi';
import { pageSizeValidator, continuationTokenValidator } from '../../core/validators/generalValidators';


export const sendAiPlaygroundMessageValidator = Joi.object().keys({
    subject: Joi.string().trim().required().label('Subject'),
    body: Joi.string().trim().required().label('Body')
});


export const getAiPlaygroundChatroomConversationsValidator = Joi.object().keys({
    chatroomId: Joi.string().trim().required().label('Chatroom ID')
});


export const listAiPlaygroundChatroomConversationsValidator = Joi.object().keys({
    continuationToken: continuationTokenValidator,
    pageSize: pageSizeValidator
});
