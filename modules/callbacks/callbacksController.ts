import express, { Request, Response } from 'express';
import { HttpStatusCode } from 'axios';
import { Application } from '../../app';
import { validateRequestQueryViaMiddleware } from '../../core/validators/globalValidators';
import { IGoogleCallbackDTO } from './callbacksInterface';
import { googleCallbackValidator } from './callbackValidator';
import CallbacksService from './callbacksService';

const routes = express.Router();


routes.get('/google', validateRequestQueryViaMiddleware(googleCallbackValidator), async (req: Request, res: Response): Promise<void> => {
    const data: IGoogleCallbackDTO = req.validatedQuery;
    await CallbacksService.handleGoogleOauthCallback(data);
    res.status(HttpStatusCode.Ok).redirect(Application.conf.CLIENT_URL);
});


export default routes;