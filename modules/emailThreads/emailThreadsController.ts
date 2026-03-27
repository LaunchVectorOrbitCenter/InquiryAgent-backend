import express, { Request, Response } from 'express';
import { Utils } from '../../utils/utils';
import { HttpStatusCode } from 'axios';
import { authMiddleware } from '../../middlewares/authMiddleware';
import { validateRequestParamsViaMiddleware } from '../../core/validators/globalValidators';
import { getCustomerEmailThreadsValidator } from './emailThreadsValidator';
import { IGetCustomerEmailThreadsDTO } from './emailThreadsInterface';
import EmailThreadsService from './emailThreadsService';
const routes = express.Router();



//* API TO RETRIEVE EMAIL THREADS
routes.get('/:threadId', authMiddleware, validateRequestParamsViaMiddleware(getCustomerEmailThreadsValidator), async (req: Request, res: Response) => {
    const data: IGetCustomerEmailThreadsDTO = {
        threadId: req.validatedParams.threadId
    }
    const result = await EmailThreadsService.getCustomerEmailThreads(data, req.user);
    Utils.apiResponse({
        res,
        code: HttpStatusCode.Ok,
        status: true,
        responseCode: '200',
        responseDescription: result.emailThreads.length ? 'Email thread retrieved successfully' : 'No email thread found for the given thread ID',
        data: result
    });
});


export default routes;
