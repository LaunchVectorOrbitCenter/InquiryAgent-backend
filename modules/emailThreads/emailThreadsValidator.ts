import Joi from 'joi';




export const getCustomerEmailThreadsValidator = Joi.object({
    threadId: Joi.string().trim().required().label('Thread ID')
});