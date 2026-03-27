import express, { Request, Response } from 'express';
import { Utils } from '../../utils/utils';
import { HttpStatusCode } from 'axios';
import EmailsJobProcessor from '../../core/jobs/emailsJobProcessor';

const routes = express.Router();

routes.post('/google', async (req: Request, res: Response): Promise<void> => {
    const messageData = Buffer.from(req.body.message.data, 'base64').toString();
    const parsedData = JSON.parse(messageData);
    const emailAddress = parsedData.emailAddress;
    const historyId = parsedData.historyId;
    //TODO: REMOVE THE BELOW
    console.log('📧 Email Address:', emailAddress);
    console.log('📖 History ID:', historyId);
    EmailsJobProcessor.getInstance().enqueueEmailAnalysisJob({ emailAddress, historyId });
    Utils.apiResponse({
        res,
        code: HttpStatusCode.Ok,
        status: true,
        responseCode: '200',
        responseDescription: 'Webhook event received successfully'
    });
});


routes.post('/shopify', async (req: Request, res: Response): Promise<void> => {

});


routes.post('/17track', async (req: Request, res: Response): Promise<void> => {

});


export default routes;