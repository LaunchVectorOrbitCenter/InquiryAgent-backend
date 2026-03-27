import express, { Request, Response } from 'express';
import { Utils } from '../../utils/utils';
import { HttpStatusCode } from 'axios';
import { authMiddleware } from '../../middlewares/authMiddleware';
import DashboardService from './dashboardService';
import {validateRequestQueryViaMiddleware } from '../../core/validators/globalValidators';
import { IGetDashboardAnalytics, IGetDashboardInsightsRequestDTO, IGetUserEmailResponsesDashboardInsightsRequestDTO } from './dashboardInterface';
import { getDashboardAnalyticsValidator, getDashboardInsightsValidator, getUserEmailResponsesDashboardInsightsQueryValidator } from './dashboardValidator';

const routes = express.Router();


//* API TO GET DASHBOARD INSIGHTS
routes.get('/insights', authMiddleware, validateRequestQueryViaMiddleware(getDashboardInsightsValidator), async (req: Request, res: Response) => {
    const data: IGetDashboardInsightsRequestDTO = {
        startDate: req.validatedQuery.startDate,
        endDate: req.validatedQuery.endDate,
        storeId: req.validatedQuery.storeId
    }
    const result = await DashboardService.getDashboardInsights(req.user, data);
    Utils.apiResponse({
        res,
        code: HttpStatusCode.Ok,
        status: true,
        responseCode: '200',
        responseDescription: 'Dashboard insights retrieved successfully',
        data: result
    });
});


//* API TO GET DASHBOARD ANALYTICS
routes.get('/analytics', authMiddleware, validateRequestQueryViaMiddleware(getDashboardAnalyticsValidator), async (req: Request, res: Response) => {
    const data: IGetDashboardAnalytics = {
        startDate: req.validatedQuery.startDate,
        endDate: req.validatedQuery.endDate,
        storeId: req.validatedQuery.storeId
    }
    const result = await DashboardService.getDashboardAnalytics(data);
    Utils.apiResponse({
        res,
        code: HttpStatusCode.Ok,
        status: true,
        responseCode: '200',
        responseDescription: 'Dashboard analytics retrieved successfully',
        data: result
    });
});



//* API TO GET DASHBOARD INSIGHTS FOR RESPONDED EMAILS BY USER
routes.get('/users/insights/email-responses', authMiddleware, validateRequestQueryViaMiddleware(getUserEmailResponsesDashboardInsightsQueryValidator), async (req: Request, res: Response) => {
    const data: IGetUserEmailResponsesDashboardInsightsRequestDTO = {
        startDate: req.validatedQuery.startDate,
        endDate: req.validatedQuery.endDate
    }
    const result = await DashboardService.getUserEmailResponsesDashboardInsights(data, req.user);
    Utils.apiResponse({
        res,
        code: HttpStatusCode.Ok,
        status: true,
        responseCode: '200',
        responseDescription: 'User email responses insights retrieved successfully',
        data: result
    });
});



export default routes;