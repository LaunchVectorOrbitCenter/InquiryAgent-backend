import EmailTemplateTypes from "../../core/enums/emailTemplateTypes";
import JwtTypes from "../../core/enums/jwtTypes";
import { Utils } from "../../utils/utils";
import { Application } from "../../app";
import UsersService from "../users/usersService";
import GmailManager from "../../integration/gmailManager";
import SecurityManager from "../../utils/helpers/securityManager";
import RolesService from "../roles/rolesService";
import IJWTPayload from "../../core/interfaces/jwt";
import { ISocialLoginDTO, IUsers, ILoginDTO, IForgotPasswordDTO, optimizedUserResponseFields, IResetPasswordDTO } from "../users/usersInterface";


class AuthService {



    public async socialLogin(data: ISocialLoginDTO) {
        const userDetails = await GmailManager.getInstance().getUserInfo(data.authToken);
        const user: Partial<IUsers> = await UsersService.validateUserAccount(userDetails.email);
        const { token } = await UsersService.issueJwt(user, JwtTypes.API);
        user['accessToken'] = token;
        return user;
    }


    public async login(data: ILoginDTO) {
        const { password, ...userDetails }: Partial<IUsers> = await UsersService.validateUserAccount(data.email);
        await UsersService.validatePassword(data.password, password);
        const { token } = await UsersService.issueJwt(userDetails, JwtTypes.API);
        userDetails['accessToken'] = token;
        const permissions: Record<string, any> = await RolesService.getPermissionsByRoleName(userDetails.role);
        return { ...userDetails, ...permissions };
    }


    public async forgotPassword(data: IForgotPasswordDTO) {
        const user: Partial<IUsers> = await UsersService.validateUserAccount(data.email, optimizedUserResponseFields, false);
        if (user) {
            const { token, reasonGUID } = await UsersService.issueJwt(user, JwtTypes.PASSWORD_RESET);

            const passwordResetLink = `${Application.conf.URLS.frontendBaseUrl}/reset-password?token=${token}&reasonGUID=${reasonGUID}`;

            await Utils.sendMail(user.email, EmailTemplateTypes.FORGOT_PASSWORD, { passwordResetLink });
        }
    }


    public async resetPassword(data: IResetPasswordDTO) {
        const decodedToken: IJWTPayload | null = SecurityManager.verifyAndDecodeJwt(data.token, JwtTypes.PASSWORD_RESET);

        // const getIssuedTokenConditions: any = [
        //     {
        //         param: 'reasonGUID',
        //         value: data.reasonGUID,
        //         operator: QueryOperators.AND
        //     },
        //     {
        //         param: 'userId',
        //         value: decodedToken._id,
        //         operator: QueryOperators.AND
        //     }
        // ];

        // const issuedToken: Partial<IUserTokens> = await UserTokensRepository.getInstance().GetOneByParams(getIssuedTokenConditions, ['_id']);

        // if (!issuedToken) throw new CustomError(HttpStatusCode.BadRequest, 'Invalid token provided');

        const passwordHash = await SecurityManager.hashPassword(data.password);

        await Promise.all([
            UsersService.updateUserPassword(decodedToken.id, passwordHash),
            // UserTokensRepository.getInstance().Update(new ObjectId(issuedToken._id), { deletedAt: Utils.getCurrentDate(), isActive: false }),
            // UserTokensService.revokeToken(decodedToken._id, JwtTypes.API)
        ]);
    }

}

export default new AuthService();