import express, { Request, Response } from 'express';
import { Utils } from '../../utils/utils';
import { HttpStatusCode } from 'axios';
import { authMiddleware } from '../../middlewares/authMiddleware';
import { validateRequestBodyViaMiddleware, validateRequestParamsViaMiddleware, validateRequestQueryViaMiddleware } from '../../core/validators/globalValidators';
import UsersService from './usersService';
import { PAGE, PER_PAGE } from '../../utils/constants';
import { ICreateUserDTO, IListUsersDTO, IUpdateUserDTO } from './usersInterface';
import { createUserValidator, addUserPartnerValidator, listUsersValidator, updateUserParamsValidator, updateUserBodyValidator } from './usersValidator';
const routes = express.Router();



//* API TO CREATE USER
routes.post('/', authMiddleware, validateRequestBodyViaMiddleware(createUserValidator), async (req: Request, res: Response) => {
    const data: ICreateUserDTO = req.validatedBody;
    const result = await UsersService.createUser(data, req.user);
    Utils.apiResponse({
        res,
        code: HttpStatusCode.Ok,
        status: true,
        responseCode: '200',
        responseDescription: 'User created successfully',
        data: result
    });
});


//* API TO ADD USER PARTNER
routes.post('/partners', authMiddleware, validateRequestBodyViaMiddleware(addUserPartnerValidator), async (req: Request, res: Response) => {
    const data = req.validatedBody;
    const result = await UsersService.addUserPartner(data, req.user);
    Utils.apiResponse({
        res,
        code: HttpStatusCode.Ok,
        status: true,
        responseCode: '200',
        responseDescription: 'Partner user added successfully',
        data: result
    });
});


//* API TO LIST USERS
routes.get('/', authMiddleware, validateRequestQueryViaMiddleware(listUsersValidator), async (req: Request, res: Response) => {
    const data: IListUsersDTO = {
        searchText: req.validatedQuery?.searchText || null,
        continuationToken: req.validatedQuery?.continuationToken || PAGE,
        pageSize: req.validatedQuery?.pageSize || PER_PAGE,
        fields: req.validatedQuery?.fields || null,
    }
    const result = await UsersService.listUsers(data, req.user);
    Utils.apiResponse({
        res,
        code: HttpStatusCode.Ok,
        status: true,
        responseCode: '200',
        responseDescription: result.users.length ? 'Users fetched successfully' : 'No users found',
        data: result
    });
});



//* API TO UPDATE USER DETAILS
routes.patch('/:userId', authMiddleware, validateRequestParamsViaMiddleware(updateUserParamsValidator), validateRequestBodyViaMiddleware(updateUserBodyValidator), async (req: Request, res: Response) => {
    const data: IUpdateUserDTO = {
        userId: req.validatedParams.userId,
        ...req.validatedBody
    }
    const result = await UsersService.updateUser(data, req.user);
    Utils.apiResponse({
        res,
        code: HttpStatusCode.Ok,
        status: true,
        responseCode: '200',
        responseDescription: 'User updated successfully',
        data: result
    });
});


export default routes;