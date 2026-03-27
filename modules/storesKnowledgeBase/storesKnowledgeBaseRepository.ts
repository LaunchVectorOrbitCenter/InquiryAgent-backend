import BaseRepository from "../../core/repositories/baseRepository";
import { MONGODB_COLLECTIONS } from "../../utils/constants";


class StoresKnowledgeBaseRepository extends BaseRepository {
    private static instance: StoresKnowledgeBaseRepository;

    private constructor() {
        super(MONGODB_COLLECTIONS.STORES_KNOWLEDGE_BASE, []);
    }

    public static getInstance(): StoresKnowledgeBaseRepository {
        if (!StoresKnowledgeBaseRepository.instance) {
            StoresKnowledgeBaseRepository.instance = new StoresKnowledgeBaseRepository();
        }
        return StoresKnowledgeBaseRepository.instance;
    }

    public async INIT() {
        await super.INIT();
    }


    //* -------------------------------------------------------------------------- */
    //*                         PUSH NEW INSTRUCTION TO ARRAY                      */
    //* -------------------------------------------------------------------------- */
    public async pushInstruction(
        storeId: string,
        tenantId: string,
        instruction: Record<string, any>,
        docMeta: { updatedAt: string; updatedBy: string; createdAt?: string; createdBy?: string },
        columns: string[] = []
    ): Promise<any> {
        try {
            const filter: Record<string, any> = { storeId, tenantId, deletedAt: null };
            const projection = columns.length ? Object.fromEntries(columns.map(col => [col, 1])) : {};

            const existing = await this.collection.findOne(filter);

            if (existing) {
                await this.collection.updateOne(
                    filter,
                    { $push: { knowledgeBase: instruction }, $set: { updatedAt: docMeta.updatedAt, updatedBy: docMeta.updatedBy } } as any
                );
            } else {
                await this.collection.insertOne({
                    storeId,
                    tenantId,
                    knowledgeBase: [instruction],
                    createdAt: docMeta.createdAt,
                    createdBy: docMeta.createdBy,
                    updatedAt: docMeta.updatedAt,
                    updatedBy: docMeta.updatedBy,
                    deletedAt: null
                } as any);
            }

            return await this.collection.findOne(filter, { projection });
        } catch (error: any) {
            console.error('An error occurred while adding instruction to knowledge base', error);
            throw new Error(error);
        }
    }


    //* -------------------------------------------------------------------------- */
    //*                      UPDATE SINGLE INSTRUCTION FIELDS                      */
    //* -------------------------------------------------------------------------- */
    public async updateInstruction(
        tenantId: string,
        instructionId: string,
        fields: { intent: string; instruction: string; agentShouldRespond: boolean },
        docMeta: { updatedAt: string; updatedBy: string },
        columns: string[] = []
    ): Promise<any> {
        try {
            const filter: Record<string, any> = {
                tenantId,
                'knowledgeBase.instruction_id': instructionId,
                deletedAt: null
            };

            await this.collection.updateOne(
                filter,
                {
                    $set: {
                        'knowledgeBase.$[elem].intent': fields.intent,
                        'knowledgeBase.$[elem].instruction': fields.instruction,
                        'knowledgeBase.$[elem].agentShouldRespond': fields.agentShouldRespond,
                        'knowledgeBase.$[elem].instructionStatus': 'unpublished',
                        updatedAt: docMeta.updatedAt,
                        updatedBy: docMeta.updatedBy
                    }
                },
                { arrayFilters: [{ 'elem.instruction_id': instructionId }] }
            );

            const projection = columns.length ? Object.fromEntries(columns.map(col => [col, 1])) : {};
            return await this.collection.findOne(filter, { projection });
        } catch (error: any) {
            console.error('An error occurred while updating instruction', error);
            throw new Error(error);
        }
    }


    //* -------------------------------------------------------------------------- */
    //*                     UPDATE SINGLE INSTRUCTION STATUS                       */
    //* -------------------------------------------------------------------------- */
    public async updateInstructionStatus(
        tenantId: string,
        instructionId: string,
        status: string,
        docMeta: { updatedAt: string; updatedBy: string },
        columns: string[] = []
    ): Promise<any> {
        try {
            const filter: Record<string, any> = {
                tenantId,
                'knowledgeBase.instruction_id': instructionId,
                deletedAt: null
            };

            await this.collection.updateOne(
                filter,
                {
                    $set: {
                        'knowledgeBase.$[elem].instructionStatus': status,
                        updatedAt: docMeta.updatedAt,
                        updatedBy: docMeta.updatedBy
                    }
                },
                { arrayFilters: [{ 'elem.instruction_id': instructionId }] }
            );

            const projection = columns.length ? Object.fromEntries(columns.map(col => [col, 1])) : {};
            return await this.collection.findOne(filter, { projection });
        } catch (error: any) {
            console.error('An error occurred while updating instruction status', error);
            throw new Error(error);
        }
    }

    //* -------------------------------------------------------------------------- */
    //*                        REMOVE INSTRUCTION FROM ARRAY                       */
    //* -------------------------------------------------------------------------- */
    public async removeInstruction(
        tenantId: string,
        instructionId: string,
        docMeta: { updatedAt: string; updatedBy: string },
        columns: string[] = []
    ): Promise<any> {
        try {
            const filter: Record<string, any> = {
                tenantId,
                'knowledgeBase.instruction_id': instructionId,
                deletedAt: null
            };

            await this.collection.updateOne(
                filter,
                {
                    $pull: { knowledgeBase: { instruction_id: instructionId } },
                    $set: { updatedAt: docMeta.updatedAt, updatedBy: docMeta.updatedBy }
                } as any
            );

            const projection = columns.length ? Object.fromEntries(columns.map(col => [col, 1])) : {};
            return await this.collection.findOne(filter, { projection });
        } catch (error: any) {
            console.error('An error occurred while removing instruction from knowledge base', error);
            throw new Error(error);
        }
    }

}


export default StoresKnowledgeBaseRepository;