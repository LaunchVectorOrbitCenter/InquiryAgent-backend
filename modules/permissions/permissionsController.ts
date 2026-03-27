import express, { Request, Response } from 'express';
import { Utils } from '../../utils/utils';
import { HttpStatusCode } from 'axios';
import { authMiddleware } from '../../middlewares/authMiddleware';
import { validateRequestBodyViaMiddleware, validateRequestQueryViaMiddleware } from '../../core/validators/globalValidators';
import PermissionsService from './permissionsService';
import { createPermissionValidator, listPermissionsValidator } from './permissionsValidator';
import { ICreatePermissionDTO, IListPermissionsDTO } from './permissionsInterface';
const routes = express.Router();



//* API TO CREATE PERMISSION
routes.post('/', authMiddleware, validateRequestBodyViaMiddleware(createPermissionValidator), async (req: Request, res: Response) => {
    const data: ICreatePermissionDTO = req.validatedBody;
    const result = await PermissionsService.createPermission(data, req.user);
    Utils.apiResponse({
        res,
        code: HttpStatusCode.Ok,
        status: true,
        responseCode: '200',
        responseDescription: 'Permission created successfully',
        data: result
    });
});



//* API TO LIST PERMISSIONS
routes.get('/', authMiddleware, validateRequestQueryViaMiddleware(listPermissionsValidator), async (req: Request, res: Response) => {
    const data: IListPermissionsDTO = {
        menuSlug: req.validatedQuery?.menuSlug || null
    }
    const result = await PermissionsService.listPermissions(data);
    Utils.apiResponse({
        res,
        code: HttpStatusCode.Ok,
        status: true,
        responseCode: '200',
        responseDescription: result.permissions.length ? 'Permissions retrieved successfully' : 'No permissions found',
        data: result
    });
});


export default routes;