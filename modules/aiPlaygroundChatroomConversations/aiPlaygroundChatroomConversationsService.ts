import { HttpStatusCode } from "axios";
import { Utils } from "../../utils/utils";
import { CustomError } from "../../core/errors/custom";
import QueryOperators from "../../core/enums/queryOperators";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import IJWTPayload from "../../core/interfaces/jwt";
import AiPlaygroundChatroomsRepository from "../aiPlaygroundChatrooms/aiPlaygroundChatroomsRepository";
import AiPlaygroundChatroomConversationsRepository from "./aiPlaygroundChatroomConversationsRepository";
import AiPlaygroundChatroomConversationsModel from "./aiPlaygroundChatroomConversationsModel";
import {
    IAiPlaygroundChatroomConversation,
    IGetAiPlaygroundChatroomConversationsDTO,
    optimizedAiPlaygroundConversationResponseFields
} from "./aiPlaygroundChatroomConversationsInterface";
import { PAGE } from "../../utils/constants";


class AiPlaygroundChatroomConversationsService {

    /*
    * ╔══════════════════════════════════════╗
    * ║          PROTECTED METHODS           ║
    * ╚══════════════════════════════════════╝
    */

    protected attachMetaData(data: Partial<IAiPlaygroundChatroomConversation>, loggedInUser: IJWTPayload) {
        data.createdAt = Utils.getCurrentDate();
        data.createdBy = loggedInUser.id;
    }


    /*
   * ╔═══════════════════════════════════╗
   * ║          PUBLIC METHODS           ║
   * ╚═══════════════════════════════════╝
    */



    //* -------------------------------------------------------------------------- */
    //*                         LIST CHATROOM CONVERSATIONS                        */
    //* -------------------------------------------------------------------------- */
    public async getChatroomConversations(data: IGetAiPlaygroundChatroomConversationsDTO, loggedInUser: IJWTPayload) {
        await this.fetchChatroom(data.chatroomId, loggedInUser.tenantId);

        const conditions: any = [
            {
                param: 'chatroomId',
                value: data.chatroomId,
                operator: QueryOperators.AND
            },
            {
                param: 'tenantId',
                value: loggedInUser.tenantId,
                operator: QueryOperators.AND
            }
        ];

        const result: Record<string, any> = await AiPlaygroundChatroomConversationsRepository.getInstance().GetAll(
            conditions,
            true,
            data.continuationToken,
            data.pageSize,
            { createdAt: -1 },
            optimizedAiPlaygroundConversationResponseFields
        );

        return Utils.pagination(!result.continuationToken, result.data, result.continuationToken, result.data.length);
    }




    //* -------------------------------------------------------------------------- */
    //*                          GET CONVERSATIONAL MEMORY                         */
    //* -------------------------------------------------------------------------- */
    public async getConversationalMemory(chatroomId: string) {
        const conditions: any = [
            {
                param: 'chatroomId',
                value: chatroomId,
                operator: QueryOperators.AND
            }
        ];

        const result: Record<string, any> = await AiPlaygroundChatroomConversationsRepository.getInstance().GetAll(
            conditions,
            true,
            PAGE,
            5,
            { createdAt: -1 },
            ['userMessage', 'aiResponse']
        );

        const conversationHistory = [];

        if (result.data?.length) {
            const sorted = result.data.reverse();
            for (const turn of sorted) {
                conversationHistory.push(
                    new HumanMessage(`[PRIOR TURN — DO NOT REUSE]\nSUBJECT: ${turn.userMessage.subject}\nBODY: ${turn.userMessage.content}`)
                );
                conversationHistory.push(
                    new AIMessage(`[PRIOR TURN RESPONSE — DO NOT REUSE]\nSUBJECT: ${turn.aiResponse.subject || ''}\nBODY: ${turn.aiResponse.content || ''}\nINTENT: ${turn.aiResponse.userInquiryTone || ''}`)
                );
            }
        }

        return conversationHistory;
    }



    //* -------------------------------------------------------------------------- */
    //*                                PERSIST TURN                                */
    //* -------------------------------------------------------------------------- */
    public async persistTurn(
        chatroomId: string,
        storeId: string,
        loggedInUser: IJWTPayload,
        userMessage: { subject: string, content: string },
        agentResponse: any
    ) {
        //* Write paired turn to playground_messages only
        const conversationData: Partial<IAiPlaygroundChatroomConversation> = {
            chatroomId,
            storeId,
            tenantId: loggedInUser.tenantId,
            userMessage: {
                subject: userMessage.subject,
                content: userMessage.content
            },
            aiResponse: {
                subject: agentResponse?.subject || null,
                content: agentResponse?.body || null,
                agentShouldRespond: agentResponse?.agentShouldRespond ?? true,
                userInquiryTone: agentResponse?.userInquiryTone || '',
                isUserEligibleForCancellation: agentResponse?.isUserEligibleForCancellation ?? false,
                isUserEligibleForRefund: agentResponse?.isUserEligibleForRefund ?? false
            }
        };
        this.attachMetaData(conversationData, loggedInUser);
        const newConversation = AiPlaygroundChatroomConversationsModel.create(conversationData);
        await AiPlaygroundChatroomConversationsRepository.getInstance().Add(newConversation);
    }


    /*
   * ╔═══════════════════════════════════╗
   * ║          PRIVATE METHODS          ║
   * ╚═══════════════════════════════════╝
    */

    //* -------------------------------------------------------------------------- */
    //*                               FETCH CHATROOM                               */
    //* -------------------------------------------------------------------------- */
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


}


export default new AiPlaygroundChatroomConversationsService();