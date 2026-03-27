import express, { Request, Response } from 'express';
import { Utils } from '../../utils/utils';
import { HttpStatusCode } from 'axios';
import { authMiddleware } from '../../middlewares/authMiddleware';
import { validateRequestBodyViaMiddleware, validateRequestQueryViaMiddleware, validateRequestParamsViaMiddleware } from '../../core/validators/globalValidators';
import AiPlaygroundChatroomsService from './aiPlaygroundChatroomsService';
import { ICreateAiPlaygroundChatroomDTO, IListAiPlaygroundChatroomsDTO } from './aiPlaygroundChatroomsInterface';
import { ISendAiPlaygroundMessageDTO } from '../aiPlaygroundChatroomConversations/aiPlaygroundChatroomConversationsInterface';
import { createAiPlaygroundChatroomValidator, listAiPlaygroundChatroomsValidator, chatroomIdParamsValidator } from './aiPlaygroundChatroomsValidator';
import { sendAiPlaygroundMessageValidator } from '../aiPlaygroundChatroomConversations/aiPlaygroundChatroomConversationsValidator';
import { PAGE, PER_PAGE } from '../../utils/constants';

const routes = express.Router();


//* API TO CHAT IN PLAYGROUND CHATROOM
routes.post('/:chatroomId/chat', authMiddleware, validateRequestParamsViaMiddleware(chatroomIdParamsValidator), validateRequestBodyViaMiddleware(sendAiPlaygroundMessageValidator), async (req: Request, res: Response) => {
    const data: ISendAiPlaygroundMessageDTO = {
        chatroomId: req.validatedParams.chatroomId,
        ...req.validatedBody
    };
    const result = await AiPlaygroundChatroomsService.sendMessage(data, req.user);
    Utils.apiResponse({
        res,
        code: HttpStatusCode.Ok,
        status: true,
        responseCode: '200',
        responseDescription: 'Message processed successfully',
        data: result
    });
});


//* API TO CREATE PLAYGROUND CHATROOM
routes.post('/', authMiddleware, validateRequestBodyViaMiddleware(createAiPlaygroundChatroomValidator), async (req: Request, res: Response) => {
    const data: ICreateAiPlaygroundChatroomDTO = req.validatedBody;
    const result = await AiPlaygroundChatroomsService.createChatroom(data, req.user);
    Utils.apiResponse({
        res,
        code: HttpStatusCode.Ok,
        status: true,
        responseCode: '200',
        responseDescription: 'Chatroom created successfully',
        data: result
    });
});


//* API TO LIST PLAYGROUND CHATROOMS
routes.get('/', authMiddleware, validateRequestQueryViaMiddleware(listAiPlaygroundChatroomsValidator), async (req: Request, res: Response) => {
    const data: IListAiPlaygroundChatroomsDTO = {
        continuationToken: req.validatedQuery?.continuationToken || PAGE,
        pageSize: req.validatedQuery?.pageSize || PER_PAGE
    };
    const result = await AiPlaygroundChatroomsService.listChatrooms(data, req.user);
    Utils.apiResponse({
        res,
        code: HttpStatusCode.Ok,
        status: true,
        responseCode: '200',
        responseDescription: result.searchResult.length ? 'Chatrooms fetched successfully' : 'No chatrooms found',
        data: result
    });
});


export default routes;