import express, { Request, Response } from 'express';
import { Utils } from '../../utils/utils';
import { HttpStatusCode } from 'axios';
import { authMiddleware } from '../../middlewares/authMiddleware';
import { validateRequestParamsViaMiddleware, validateRequestQueryViaMiddleware } from '../../core/validators/globalValidators';
import AiPlaygroundChatroomConversationsService from './aiPlaygroundChatroomConversationsService';
import { IGetAiPlaygroundChatroomConversationsDTO } from './aiPlaygroundChatroomConversationsInterface';
import { getAiPlaygroundChatroomConversationsValidator, listAiPlaygroundChatroomConversationsValidator } from './aiPlaygroundChatroomConversationsValidator';
import { PAGE, PER_PAGE } from '../../utils/constants';

const routes = express.Router();


//* API TO GET PLAYGROUND CHATROOM CONVERSATIONS
routes.get('/:chatroomId', authMiddleware, validateRequestParamsViaMiddleware(getAiPlaygroundChatroomConversationsValidator), validateRequestQueryViaMiddleware(listAiPlaygroundChatroomConversationsValidator), async (req: Request, res: Response) => {
    const data: IGetAiPlaygroundChatroomConversationsDTO = {
        chatroomId: req.validatedParams.chatroomId,
        continuationToken: req.validatedQuery?.continuationToken || PAGE,
        pageSize: req.validatedQuery?.pageSize || PER_PAGE
    };
    const result = await AiPlaygroundChatroomConversationsService.getChatroomConversations(data, req.user);
    Utils.apiResponse({
        res,
        code: HttpStatusCode.Ok,
        status: true,
        responseCode: '200',
        responseDescription: result.searchResult.length ? 'Conversations fetched successfully' : 'No conversations found',
        data: result
    });
});



export default routes;