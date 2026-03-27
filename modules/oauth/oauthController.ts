import express, { Request, Response } from 'express';
import { HttpStatusCode } from 'axios';
import { validateRequestBodyViaMiddleware } from '../../core/validators/globalValidators';
import { authMiddleware } from '../../middlewares/authMiddleware';
import { Utils } from '../../utils/utils';
import { IOauthGoogleLogin } from './oauthInterface';
import { googleOAuthLoginValidator } from './oauthValidator';
import OauthService from './oauthService';

const routes = express.Router();


routes.post('/google', authMiddleware, validateRequestBodyViaMiddleware(googleOAuthLoginValidator), async (req: Request, res: Response) => {
    const data: IOauthGoogleLogin = req.validatedBody;
    const result = await OauthService.googleOAuth(data, req.user);
    Utils.apiResponse({
        res,
        code: HttpStatusCode.Ok,
        responseCode: '200',
        responseDescription: 'Oauth Url generated successfully',
        status: true,
        data: result
    });
});

export default routes;