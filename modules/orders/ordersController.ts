import express, { Request, Response } from 'express';
import { Utils } from '../../utils/utils';
import { HttpStatusCode } from 'axios';
import ShopifyManager from '../../integration/shopifyManager';
const routes = express.Router();


routes.get('/', async (req: Request, res: Response) => {
    const orders = await ShopifyManager.getInstance().getOrders("asdasd","asdasdss");
    Utils.apiResponse({
        res,
        code: HttpStatusCode.Ok,
        status: true,
        responseCode: '200',
        responseDescription: 'Orders fetched successfully',
        data: orders
    });
});



export default routes;