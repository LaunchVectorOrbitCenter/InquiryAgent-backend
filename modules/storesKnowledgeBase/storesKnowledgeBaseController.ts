import express, { Request, Response } from 'express';
import { Utils } from '../../utils/utils';
import { HttpStatusCode } from 'axios';
import { authMiddleware } from '../../middlewares/authMiddleware';
import { validateRequestBodyViaMiddleware, validateRequestParamsViaMiddleware } from '../../core/validators/globalValidators';
import { IChangeStoreKnowledgeBaseInstructionStatusDTO, ICreateStoreKnowledgeBaseInstructionDTO, IDeleteStoreKnowledgeBaseInstructionDTO, IGetStoreKnowledgeBaseByStoreIdDTO, IUpdateStoreKnowledgeBaseInstructionDTO } from './storesKnowledgeBaseInterface';
import StoresKnowledgeBaseService from './storesKnowledgeBaseService';
import { changeInstructionStatusBodyValidator, createKnowledgeBaseInstructionValidator, getStoreKnowledgeBasebByIdValidator, storeKnowledgeBaseInstructionIdValidator, updateKnowledgeBaseInstructionBodyValidator } from './storesKnowledgeBaseValidator';
const routes = express.Router();



//* API TO CREATE A NEW KNOWLEDGE BASE INSTRUCTION
routes.post('/', authMiddleware, validateRequestBodyViaMiddleware(createKnowledgeBaseInstructionValidator), async (req: Request, res: Response) => {
    const data: ICreateStoreKnowledgeBaseInstructionDTO = req.validatedBody;
    const result = await StoresKnowledgeBaseService.createInstruction(data, req.user);
    Utils.apiResponse({
        res,
        code: HttpStatusCode.Ok,
        status: true,
        responseCode: '200',
        responseDescription: 'Knowledge base instruction created successfully',
        data: result
    });
});




//* API TO UPDATE AN EXISTING KNOWLEDGE BASE INSTRUCTION
routes.patch('/:instructionId', authMiddleware, validateRequestParamsViaMiddleware(storeKnowledgeBaseInstructionIdValidator), validateRequestBodyViaMiddleware(updateKnowledgeBaseInstructionBodyValidator), async (req: Request, res: Response) => {
    const data: IUpdateStoreKnowledgeBaseInstructionDTO = {
        instructionId: req.validatedParams?.instructionId,
        ...req.validatedBody
    };
    const result = await StoresKnowledgeBaseService.updateInstruction(data, req.user);
    Utils.apiResponse({
        res,
        code: HttpStatusCode.Ok,
        status: true,
        responseCode: '200',
        responseDescription: 'Knowledge base instruction updated successfully',
        data: result
    });
});




//* API TO GET STORE KNOWLEDGE BASE AND INSTRUCTIONS BY STORE ID
routes.get('/:storeId', authMiddleware, validateRequestParamsViaMiddleware(getStoreKnowledgeBasebByIdValidator), async (req: Request, res: Response) => {
    const data: IGetStoreKnowledgeBaseByStoreIdDTO = {
        storeId: req.validatedParams?.storeId
    };
    const result = await StoresKnowledgeBaseService.getStoreKbById(data, req.user);
    Utils.apiResponse({
        res,
        code: HttpStatusCode.Ok,
        status: true,
        responseCode: '200',
        responseDescription:  result ? 'Store knowledge base fetched successfully': 'No store knowledge base is setup for this store',
        data: result
    });
});




//* API TO PUBLISH STORE KNOWLEDGE BASE INSTRUCTION
routes.patch('/:instructionId/status', authMiddleware, validateRequestParamsViaMiddleware(storeKnowledgeBaseInstructionIdValidator), validateRequestBodyViaMiddleware(changeInstructionStatusBodyValidator), async (req: Request, res: Response) => {
    const data: IChangeStoreKnowledgeBaseInstructionStatusDTO = {
        instructionId: req.validatedParams?.instructionId,
        instructionStatus: req.validatedBody?.instructionStatus
    };
    const result = await StoresKnowledgeBaseService.changeStoreKnowledgeBaseInstructionStatus(data, req.user);
    Utils.apiResponse({
        res,
        code: HttpStatusCode.Ok,
        status: true,
        responseCode: '200',
        responseDescription: 'Store knowledge base instruction status updated successfully',
        data: result
    });
});




//* API TO DELETE A KNOWLEDGE BASE INSTRUCTION
routes.delete('/:instructionId', authMiddleware, validateRequestParamsViaMiddleware(storeKnowledgeBaseInstructionIdValidator), async (req: Request, res: Response) => {
    const data: IDeleteStoreKnowledgeBaseInstructionDTO = {
        instructionId: req.validatedParams?.instructionId
    };
    const result = await StoresKnowledgeBaseService.deleteInstruction(data, req.user);
    Utils.apiResponse({
        res,
        code: HttpStatusCode.Ok,
        status: true,
        responseCode: '200',
        responseDescription: 'Knowledge base instruction deleted successfully',
        data: result
    });
});




export default routes;