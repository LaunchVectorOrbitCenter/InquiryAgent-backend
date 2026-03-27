import { HttpStatusCode } from "axios";
import { ObjectId } from "mongodb";
import { Utils } from "../../utils/utils";
import { CustomError } from "../../core/errors/custom";
import QueryOperators from "../../core/enums/queryOperators";
import IJWTPayload from "../../core/interfaces/jwt";
import { IProcessEmailResponseDTO } from "../../core/interfaces/aiServiceInterface";
import OrchestratorAgent from "../../ai/agents/orchestratorAgent";
import ResponseFormats from "../../core/enums/responseFormats";
import StoresRepository from "../stores/storesRepository";
import { processEmailStoreResponseFields } from "../stores/storesInterface";
import AiPlaygroundChatroomsRepository from "./aiPlaygroundChatroomsRepository";
import AiPlaygroundChatroomsModel from "./aiPlaygroundChatroomsModel";
import AiPlaygroundChatroomConversationsService from "../aiPlaygroundChatroomConversations/aiPlaygroundChatroomConversationsService";
import { IAiPlaygroundChatroom, ICreateAiPlaygroundChatroomDTO, IListAiPlaygroundChatroomsDTO, optimizedAiPlaygroundChatroomResponseFields } from "./aiPlaygroundChatroomsInterface";
import { ISendAiPlaygroundMessageDTO } from "../aiPlaygroundChatroomConversations/aiPlaygroundChatroomConversationsInterface";


class AiPlaygroundChatroomsService {

    /*
    * ╔══════════════════════════════════════╗
    * ║          PROTECTED METHODS           ║
    * ╚══════════════════════════════════════╝
    */

    protected attachMetaData(data: Partial<IAiPlaygroundChatroom>, loggedInUser: IJWTPayload) {
        data.tenantId = loggedInUser.tenantId;
        data.createdAt = Utils.getCurrentDate();
        data.createdBy = loggedInUser.id;
    }


    /*
   * ╔═══════════════════════════════════╗
   * ║          PUBLIC METHODS           ║
   * ╚═══════════════════════════════════╝
    */



    //* -------------------------------------------------------------------------- */
    //*                               CREATE CHATROOM                              */
    //* -------------------------------------------------------------------------- */
    public async createChatroom(data: ICreateAiPlaygroundChatroomDTO, loggedInUser: IJWTPayload) {
        const store = await this.fetchStore(data.storeId, loggedInUser.tenantId);

        const chatroomId = new ObjectId().toString();

        const chatroomData: Partial<IAiPlaygroundChatroom> = {
            chatroomId,
            storeId: data.storeId,
            customerDetail: data.customerDetail,
            orderDetails: data.orderDetails,
            chatTitle: data.chatTitle
        };
        this.attachMetaData(chatroomData, loggedInUser);
        const newChatroom = AiPlaygroundChatroomsModel.create(chatroomData);
        await AiPlaygroundChatroomsRepository.getInstance().Add(newChatroom);

        const emailContent = `SUBJECT: ${data.initialMessage.subject}\nBODY: ${data.initialMessage.body}`;

        const dto: IProcessEmailResponseDTO = {
            emailContent,
            storeId: data.storeId,
            storeSlug: store.slug,
            storeName: store.storeName,
            maskedName: store.maskedName,
            refundPolicy: store.refundPolicy,
            subscriptionPortalUrl: store.subscriptionPortalUrl,
            tenantId: loggedInUser.tenantId,
            orderDetails: data.orderDetails,
            customerDetail: data.customerDetail,
            threadId: chatroomId,
            responseFormat: ResponseFormats.MARKDOWN
        };

        const agentResponse = await OrchestratorAgent.run(dto, emailContent, []);

        await AiPlaygroundChatroomConversationsService.persistTurn(
            chatroomId,
            data.storeId,
            loggedInUser,
            { subject: data.initialMessage.subject, content: data.initialMessage.body },
            agentResponse
        );

        return { chatroomId, chatTitle:data.chatTitle, ...agentResponse };
    }









    //* -------------------------------------------------------------------------- */
    //*                              CHAT IN CHATROOM                              */
    //* -------------------------------------------------------------------------- */
    public async sendMessage(data: ISendAiPlaygroundMessageDTO, loggedInUser: IJWTPayload) {
        const chatroom = await this.fetchChatroom(data.chatroomId, loggedInUser.tenantId);
        const store = await this.fetchStore(chatroom.storeId, loggedInUser.tenantId);

        const emailContent = `SUBJECT: ${data.subject}\nBODY: ${data.body}`;

        const dto: IProcessEmailResponseDTO = {
            emailContent,
            storeId: chatroom.storeId,
            storeSlug: store.slug,
            storeName: store.storeName,
            maskedName: store.maskedName,
            refundPolicy: store.refundPolicy,
            subscriptionPortalUrl: store.subscriptionPortalUrl,
            tenantId: loggedInUser.tenantId,
            orderDetails: chatroom.orderDetails,
            customerDetail: chatroom.customerDetail,
            threadId: data.chatroomId,
            responseFormat: ResponseFormats.MARKDOWN
        };

        const conversationalMemory = await AiPlaygroundChatroomConversationsService.getConversationalMemory(data.chatroomId);
        const agentResponse = await OrchestratorAgent.run(dto, emailContent, conversationalMemory);

        await AiPlaygroundChatroomConversationsService.persistTurn(
            data.chatroomId,
            chatroom.storeId,
            loggedInUser,
            { subject: data.subject, content: data.body },
            agentResponse
        );

        return agentResponse;
    }




    //* -------------------------------------------------------------------------- */
    //*                               LIST CHATROOMS                               */
    //* -------------------------------------------------------------------------- */
    public async listChatrooms(data: IListAiPlaygroundChatroomsDTO, loggedInUser: IJWTPayload) {
        const conditions: any = [
            {
                param: 'tenantId',
                value: loggedInUser.tenantId,
                operator: QueryOperators.AND
            }
        ];

        const result: Record<string, any> = await AiPlaygroundChatroomsRepository.getInstance().GetAll(
            conditions,
            true,
            data.continuationToken,
            data.pageSize,
            { createdAt: -1 },
            optimizedAiPlaygroundChatroomResponseFields
        );

        return Utils.pagination(!result.continuationToken, result.data, result.continuationToken, result.data.length);
    }


    /*
   * ╔═══════════════════════════════════╗
   * ║          PRIVATE METHODS          ║
   * ╚═══════════════════════════════════╝
    */

    private async fetchChatroom(chatroomId: string, tenantId: string) {
        const conditions: any = [
            {
                param: 'chatroomId',
                value: chatroomId,
                operator: QueryOperators.AND
            },
            {
                param: 'tenantId',
                value: tenantId,
                operator: QueryOperators.AND
            }
        ];

        const chatroom = await AiPlaygroundChatroomsRepository.getInstance().GetOneByParams(
            conditions,
            ['_id', 'chatroomId', 'storeId', 'tenantId', 'customerDetail', 'orderDetails']
        );

        if (!chatroom) throw new CustomError(HttpStatusCode.NotFound, 'The requested chatroom does not exist');
        return chatroom as any;
    }



    //* -------------------------------------------------------------------------- */
    //*                                 FETCH STORE                                */
    //* -------------------------------------------------------------------------- */
    private async fetchStore(storeId: string, tenantId: string) {
        const storeConditions: any = [
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

        const store: any = await StoresRepository.getInstance().GetOneByParams(storeConditions, processEmailStoreResponseFields);
        if (!store) throw new CustomError(HttpStatusCode.NotFound, 'The requested store does not exist');
        return store;
    }




}


export default new AiPlaygroundChatroomsService();
