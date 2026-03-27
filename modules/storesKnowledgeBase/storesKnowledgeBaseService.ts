import { HttpStatusCode } from "axios";
import QueryOperators from "../../core/enums/queryOperators";
import StatusTypes from "../../core/enums/statusTypes";
import { Utils } from "../../utils/utils";
import { ObjectId } from "mongodb";
import { CustomError } from "../../core/errors/custom";
import IJWTPayload from "../../core/interfaces/jwt";
import { IChangeStoreKnowledgeBaseInstructionStatusDTO, ICreateStoreKnowledgeBaseInstructionDTO, IDeleteStoreKnowledgeBaseInstructionDTO, IGetStoreKnowledgeBaseByStoreIdDTO, IStoreKnowledgeBase, IUpdateStoreKnowledgeBaseInstructionDTO, optimizedStoreKnowledgeBaseResponseFields } from "./storesKnowledgeBaseInterface";
import StoresKnowledgeBaseRepository from "./storesKnowledgeBaseRepository";
import StoresRepository from "../stores/storesRepository";




class StoresKnowledgeBaseService {

    /*
    * ╔══════════════════════════════════════╗
    * ║          PROTECTED METHODS           ║
    * ╚══════════════════════════════════════╝
    */

    protected attachMetaData(data: Partial<IStoreKnowledgeBase>, loggedInUser: IJWTPayload, includeCreated: boolean = true) {
        data.updatedAt = Utils.getCurrentDate();
        data.updatedBy = loggedInUser.id;

        if (includeCreated) {
            data.createdAt = Utils.getCurrentDate();
            data.createdBy = loggedInUser.id;
        }
    }


    /*
   * ╔═══════════════════════════════════╗
   * ║          PUBLIC METHODS           ║
   * ╚═══════════════════════════════════╝
    */



    //* -------------------------------------------------------------------------- */
    //*                       CREATE KNOWLEDGE BASE INSTRUCTION                    */
    //* -------------------------------------------------------------------------- */
    public async createInstruction(data: ICreateStoreKnowledgeBaseInstructionDTO, loggedInUser: IJWTPayload) {
        await this.checkStoreOwnership(data.storeId, loggedInUser.tenantId);

        const newInstruction = {
            instruction_id: Utils.UUIDGenerator(),
            intent: data.intent,
            instruction: data.instruction,
            agentShouldRespond: data.agentShouldRespond,
            instructionStatus: StatusTypes.UNPUBLISHED
        };

        const now = Utils.getCurrentDate();
        const docMeta = {
            createdAt: now,
            createdBy: loggedInUser.id,
            updatedAt: now,
            updatedBy: loggedInUser.id
        };

        return StoresKnowledgeBaseRepository.getInstance().pushInstruction(
            data.storeId,
            loggedInUser.tenantId,
            newInstruction,
            docMeta,
            optimizedStoreKnowledgeBaseResponseFields
        );
    }


    //* -------------------------------------------------------------------------- */
    //*                       UPDATE KNOWLEDGE BASE INSTRUCTION                    */
    //* -------------------------------------------------------------------------- */
    public async updateInstruction(data: IUpdateStoreKnowledgeBaseInstructionDTO, loggedInUser: IJWTPayload) {
        await this.getStoreKbDocByInstructionId(data.instructionId, loggedInUser.tenantId);

        const docMeta = { updatedAt: Utils.getCurrentDate(), updatedBy: loggedInUser.id };

        return StoresKnowledgeBaseRepository.getInstance().updateInstruction(
            loggedInUser.tenantId,
            data.instructionId,
            { intent: data.intent, instruction: data.instruction, agentShouldRespond: data.agentShouldRespond },
            docMeta,
            optimizedStoreKnowledgeBaseResponseFields
        );
    }




    //* -------------------------------------------------------------------------- */
    //*                             GET STORE KB BY ID                             */
    //* -------------------------------------------------------------------------- */
    public async getStoreKbById(data: IGetStoreKnowledgeBaseByStoreIdDTO, loggedInUser: IJWTPayload) {
        await this.checkStoreOwnership(data.storeId, loggedInUser.tenantId);

        const getStoreKbConditions: any = [
            {
                param: 'storeId',
                value: data.storeId,
                operator: QueryOperators.AND
            },
            {
                param: 'tenantId',
                value: loggedInUser.tenantId,
                operator: QueryOperators.AND
            }
        ];


        const storeKb = await StoresKnowledgeBaseRepository.getInstance().GetOneByParams(getStoreKbConditions, optimizedStoreKnowledgeBaseResponseFields);

        return storeKb;
    }




    //* -------------------------------------------------------------------------- */
    //*                    CHANGE KNOWLEDGE BASE INSTRUCTION STATUS                */
    //* -------------------------------------------------------------------------- */
    public async changeStoreKnowledgeBaseInstructionStatus(data: IChangeStoreKnowledgeBaseInstructionStatusDTO, loggedInUser: IJWTPayload) {
        const storeKb = await this.getStoreKbDocByInstructionId(data.instructionId, loggedInUser.tenantId);

        const instruction = storeKb.knowledgeBase.find(k => k.instruction_id === data.instructionId);
        if (instruction?.instructionStatus === data.instructionStatus) {
            throw new CustomError(HttpStatusCode.Conflict, `This knowledge base instruction is already ${data.instructionStatus}`);
        }

        const docMeta = { updatedAt: Utils.getCurrentDate(), updatedBy: loggedInUser.id };

        return StoresKnowledgeBaseRepository.getInstance().updateInstructionStatus(
            loggedInUser.tenantId,
            data.instructionId,
            data.instructionStatus,
            docMeta,
            optimizedStoreKnowledgeBaseResponseFields
        );
    }


    //* -------------------------------------------------------------------------- */
    //*                      DELETE KNOWLEDGE BASE INSTRUCTION                     */
    //* -------------------------------------------------------------------------- */
    public async deleteInstruction(data: IDeleteStoreKnowledgeBaseInstructionDTO, loggedInUser: IJWTPayload) {
        await this.getStoreKbDocByInstructionId(data.instructionId, loggedInUser.tenantId);

        const docMeta = { updatedAt: Utils.getCurrentDate(), updatedBy: loggedInUser.id };

        return StoresKnowledgeBaseRepository.getInstance().removeInstruction(
            loggedInUser.tenantId,
            data.instructionId,
            docMeta,
            optimizedStoreKnowledgeBaseResponseFields
        );
    }




    /*
   * ╔═══════════════════════════════════╗
   * ║          PRIVATE METHODS          ║
   * ╚═══════════════════════════════════╝
    */



    //* -------------------------------------------------------------------------- */
    //*                   GET STORE KB DOC BY INSTRUCTION UUID                     */
    //* -------------------------------------------------------------------------- */
    private async getStoreKbDocByInstructionId(instructionId: string, tenantId: string): Promise<IStoreKnowledgeBase> {
        const conditions: any = [
            {
                param: 'knowledgeBase.instruction_id',
                value: instructionId,
                operator: QueryOperators.AND
            },
            {
                param: 'tenantId',
                value: tenantId,
                operator: QueryOperators.AND
            }
        ];

        const storeKb = await StoresKnowledgeBaseRepository.getInstance().GetOneByParams<IStoreKnowledgeBase>(conditions, []);

        if (!storeKb) throw new CustomError(HttpStatusCode.NotFound, 'Store knowledge base instruction not found');

        return storeKb;
    }


    //* -------------------------------------------------------------------------- */
    //*                            CHECK STORE OWNERSHIP                           */
    //* -------------------------------------------------------------------------- */
    private async checkStoreOwnership(storeId: string, tenantId: string) {
        const checkStoreOwnershipConditions: any = [
            {
                param: '_id',
                value: new ObjectId(storeId),
                operator: QueryOperators.AND
            },
            {
                param: 'tenantId',
                value: tenantId,
                operator: QueryOperators.AND
            }
        ];

        const store = await StoresRepository.getInstance().Count(checkStoreOwnershipConditions);

        if (!store) throw new CustomError(HttpStatusCode.NotFound, 'The store for which you are trying to upsert knowledge base does not exist');
    }


}



export default new StoresKnowledgeBaseService();