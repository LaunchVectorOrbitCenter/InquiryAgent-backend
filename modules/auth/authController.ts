import express, { Request, Response } from 'express';
import { HttpStatusCode } from 'axios';
import { validateRequestBodyViaMiddleware } from '../../core/validators/globalValidators';
import { authMiddleware } from '../../middlewares/authMiddleware';
import { Utils } from '../../utils/utils';
import { ILoginDTO, ISocialLoginDTO, IForgotPasswordDTO, IResetPasswordDTO } from '../users/usersInterface';
import { connectShopifyValidator, loginValidator, socialLoginValidator, forgotPasswordValidator, resetPasswordValidator } from './authValidator';
import StoresService from '../stores/storesService';
import AuthService from './authService';
const routes = express.Router();


routes.post('/shopify', authMiddleware, validateRequestBodyViaMiddleware(connectShopifyValidator), async (req: Request, res: Response) => {
    const data = req.validatedBody;
    await StoresService.connectShopify(data, req.user);
    Utils.apiResponse({
        res,
        code: HttpStatusCode.Ok,
        status: true,
        responseCode: '200',
        responseDescription: 'Shopify connected successfully'
    });
});


routes.post('/login', validateRequestBodyViaMiddleware(loginValidator), async (req: Request, res: Response) => {
    const data: ILoginDTO = req.validatedBody;
    const result = await AuthService.login(data);
    Utils.apiResponse({
        res,
        code: HttpStatusCode.Ok,
        status: true,
        responseCode: '200',
        responseDescription: 'You have successfully logged in',
        data: result
    });
});


routes.post('/social-login', validateRequestBodyViaMiddleware(socialLoginValidator), async (req: Request, res: Response) => {
    const data: ISocialLoginDTO = req.validatedBody;
    const result = await AuthService.socialLogin(data);
    Utils.apiResponse({
        res,
        code: HttpStatusCode.Ok,
        status: true,
        responseCode: '200',
        responseDescription: 'You have successfully logged in',
        data: result
    });
});


routes.post('/forgot-password', validateRequestBodyViaMiddleware(forgotPasswordValidator), async (req: Request, res: Response) => {
    const data: IForgotPasswordDTO = req.validatedBody;
    await AuthService.forgotPassword(data);
    Utils.apiResponse({
        res,
        code: HttpStatusCode.Ok,
        status: true,
        responseCode: '200',
        responseDescription: "You will get an email with instructions on how to reset your password. If it doesn't arrive, be sure to check your spam folder"
    });
});



routes.post('/reset-password', validateRequestBodyViaMiddleware(resetPasswordValidator), async (req: Request, res: Response): Promise<void> => {
    const data: IResetPasswordDTO = req.validatedBody;
    await AuthService.resetPassword(data);
    Utils.apiResponse({
        res,
        code: HttpStatusCode.Ok,
        status: true,
        responseCode: '200',
        responseDescription: "Password reset successfully"
    });
});



routes.post('/logout', authMiddleware, async (req: Request, res: Response): Promise<void> => {
    Utils.apiResponse({
        res,
        code: HttpStatusCode.Ok,
        status: true,
        responseCode: '200',
        responseDescription: 'Logged out successfully',
    });
});


export default routes;