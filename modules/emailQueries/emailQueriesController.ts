import express, { Request, Response } from 'express';
import { Utils } from '../../utils/utils';
import { HttpStatusCode } from 'axios';
import { authMiddleware } from '../../middlewares/authMiddleware';
import {
    validateRequestBodyViaMiddleware,
    validateRequestParamsViaMiddleware,
    validateRequestQueryViaMiddleware
} from '../../core/validators/globalValidators';
import EmailQueriesService from './emailQueriesService';
import { PAGE, PER_PAGE } from '../../utils/constants';
import { IListEmailQueriesDTO, IChangeEmailQueryStatusDTO, IGetEmailQueryByIdDTO } from './emailQueriesInterface';
import {
    emailQueriesValidator,
    getEmailQueryByIdValidator,
    changeEmailQueryStatusValidator
} from './emailQueriesValidator';
import EmailsJobProcessor from "../../core/jobs/emailsJobProcessor";

const routes = express.Router();


//* API TO LIST EMAIL QUERIES
routes.get('/', authMiddleware, validateRequestQueryViaMiddleware(emailQueriesValidator), async (req: Request, res: Response) => {
    const data: IListEmailQueriesDTO = {
        storeId: req.validatedQuery.storeId,
        queryType: req.validatedQuery.queryType,
        queryStatus: req.validatedQuery.queryStatus,
        queryCategory: req.validatedQuery.queryCategory,
        pageSize: req.validatedQuery.pageSize || PER_PAGE,
        continuationToken: req.validatedQuery.continuationToken || PAGE
    }
    const result = await EmailQueriesService.listEmails(data, req.user);
    Utils.apiResponse({
        res,
        code: HttpStatusCode.Ok,
        status: true,
        responseCode: '200',
        responseDescription: result.emailQueries.length ? 'Emails fetched successfully' : 'No emails found',
        data: result
    });
});


//* API TO CHANGE EMAIL QUERY STATUS
routes.patch('/:id/status', authMiddleware, validateRequestParamsViaMiddleware(getEmailQueryByIdValidator), validateRequestBodyViaMiddleware(changeEmailQueryStatusValidator), async (req: Request, res: Response) => {
    const data: IChangeEmailQueryStatusDTO = {
        id: req.validatedParams.id,
        status: req.validatedBody.status
    }
    const result = await EmailQueriesService.changeEmailQueryStatus(data, req.user);
    Utils.apiResponse({
        res,
        code: HttpStatusCode.Ok,
        status: true,
        responseCode: `${HttpStatusCode.Ok}`,
        responseDescription: 'Email query status updated successfully',
        data: result
    });
});


//* API TO GET EMAIL QUERY BY ID
routes.get('/:id', authMiddleware, validateRequestParamsViaMiddleware(getEmailQueryByIdValidator), async (req: Request, res: Response) => {
    const data: IGetEmailQueryByIdDTO = {
        id: req.validatedParams.id
    }
    const result = await EmailQueriesService.getEmailQueryById(data, req.user);
    Utils.apiResponse({
        res,
        code: HttpStatusCode.Ok,
        status: true,
        responseCode: '200',
        responseDescription: 'Emails fetched successfully',
        data: result
    });
});

/**
 * GET /emails/:id/fetch-emails
 * Query params: startDate=YYYY-MM-DD, endDate=YYYY-MM-DD
 */
routes.get('/emails/:storeId/fetch-emails',
    authMiddleware,
    validateRequestParamsViaMiddleware(getEmailQueryByIdValidator),
    async (req: Request, res: Response) => {
        const storeId = req.validatedParams.id;
        const startDate = req.query.startDate as string;
        const endDate = req.query.endDate as string;

        if (!startDate || !endDate) {
            return Utils.apiResponse({
                res,
                code: HttpStatusCode.BadRequest,
                status: false,
                responseCode: '400',
                responseDescription: 'startDate and endDate are required',
                data: null,
            });
        }

        const start = new Date(`${startDate}T00:00:00Z`);
        const end = new Date(`${endDate}T23:59:00Z`);

        // Adjust endDate to be 1 minute less
        const adjustedEndDate = new Date(end.getTime() - 60 * 1000).toISOString();

        EmailsJobProcessor.getInstance().enqueueEmailProcessingJob({
            storeId,
            startDate: start.toISOString(),
            endDate: adjustedEndDate
        });

        Utils.apiResponse({
            res,
            code: HttpStatusCode.Ok,
            status: true,
            responseCode: '200',
            responseDescription: 'Email processing job added successfully',
            data: { storeId, startDate, endDate },
        });
    }
);

export default routes;