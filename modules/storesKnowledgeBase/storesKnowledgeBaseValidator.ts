import Joi from 'joi';
import { idsValidator } from '../../core/validators/generalValidators';
import StatusTypes from '../../core/enums/statusTypes';





export const getStoreKnowledgeBasebByIdValidator = Joi.object({
    storeId: idsValidator.required().label('Store ID')
});


export const createKnowledgeBaseInstructionValidator = Joi.object({
    storeId: idsValidator.required().label('Store ID'),
    intent: Joi.string().required().label('Intent'),
    instruction: Joi.string().required().label('Instruction'),
    agentShouldRespond: Joi.boolean().required().label('Agent Should Respond')
});

export const updateKnowledgeBaseInstructionBodyValidator = Joi.object({
    intent: Joi.string().required().label('Intent'),
    instruction: Joi.string().required().label('Instruction'),
    agentShouldRespond: Joi.boolean().required().label('Agent Should Respond')
});

export const storeKnowledgeBaseInstructionIdValidator = Joi.object({
    instructionId: Joi.string().uuid().required().label('Instruction ID')
});

export const changeInstructionStatusBodyValidator = Joi.object({
    instructionStatus: Joi.string().valid(StatusTypes.PUBLISHED, StatusTypes.UNPUBLISHED).required().label('Instruction Status')
});