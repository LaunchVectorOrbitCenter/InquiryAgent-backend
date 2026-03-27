import { GeneralFillables } from "../../core/interfaces/generalInterface";

export interface IStoreKnowledgeBase {
    _id: string,
    storeId: string,
    tenantId: string,
    knowledgeBase: KnowledgeBaseStructure[],

    createdAt: string,
    createdBy: string,
    updatedAt: string,
    updatedBy: string
    deletedAt?: string
}




export interface KnowledgeBaseStructure {
    instruction_id: string,
    intent: string,
    instruction: string,
    agentShouldRespond: boolean,
    instructionStatus: string
}




export const optimizedStoreKnowledgeBaseResponseFields = ['_id', 'storeId', 'knowledgeBase', 'createdAt', 'createdBy', 'updatedAt', 'updatedBy'];



export interface ICreateStoreKnowledgeBaseInstructionDTO {
    storeId: string,
    intent: string,
    instruction: string,
    agentShouldRespond: boolean
}

export interface IUpdateStoreKnowledgeBaseInstructionDTO {
    instructionId: string,
    intent: string,
    instruction: string,
    agentShouldRespond: boolean
}


export interface IGetStoreKnowledgeBaseByStoreIdDTO {
    storeId: string
}

export interface IChangeStoreKnowledgeBaseInstructionStatusDTO {
    instructionId: string,
    instructionStatus: string
}

export interface IDeleteStoreKnowledgeBaseInstructionDTO {
    instructionId: string
}



export const StoreKnowledgeBaseFillableFields = [
    { column: 'storeId', columnDataType: 'string' },
    { column: 'tenantId', columnDataType: 'string' },
    { column: 'knowledgeBase', columnDataType: 'array' },
    ...GeneralFillables
];