import express, { Request, Response } from 'express';
import { Utils } from '../../utils/utils';
import { HttpStatusCode } from 'axios';
import { authMiddleware } from '../../middlewares/authMiddleware';
import { validateRequestBodyViaMiddleware, validateRequestQueryViaMiddleware } from '../../core/validators/globalValidators';
import MenusService from './menusService';
import { PAGE, PER_PAGE } from '../../utils/constants';
import { ICreateMenuDTO, IListMenusDTO } from './menusInterface';
import { createMenuValidator, listMenusValidator } from './menusValidator';
const routes = express.Router();



//* API TO CREATE MENU
routes.post('/', authMiddleware, validateRequestBodyViaMiddleware(createMenuValidator), async (req: Request, res: Response) => {
    const data: ICreateMenuDTO = req.validatedBody;
    const result = await MenusService.createMenu(data, req.user);
    Utils.apiResponse({
        res,
        code: HttpStatusCode.Ok,
        status: true,
        responseCode: '200',
        responseDescription: 'Menu created successfully',
        data: result
    });
});



//* API TO LIST MENUS
routes.get('/', authMiddleware, validateRequestQueryViaMiddleware(listMenusValidator), async (req: Request, res: Response) => {
    const data: IListMenusDTO = {
        searchText: req.validatedQuery?.searchText || null,
        continuationToken: req.validatedQuery?.continuationToken || PAGE,
        pageSize: req.validatedQuery?.pageSize || PER_PAGE
    };
    const result = await MenusService.listMenus(data);
    Utils.apiResponse({
        res,
        code: HttpStatusCode.Ok,
        status: true,
        responseCode: '200',
        responseDescription: result.searchResult.length ? 'Menus retrieved successfully' : 'No menus found',
        data: result
    });
});



export default routes;