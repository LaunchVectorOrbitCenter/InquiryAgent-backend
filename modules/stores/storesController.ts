import express, { Request, Response } from 'express';
import { Utils } from '../../utils/utils';
import { HttpStatusCode } from 'axios';
import { authMiddleware } from '../../middlewares/authMiddleware';
import { validateRequestBodyViaMiddleware, validateRequestParamsViaMiddleware, validateRequestQueryViaMiddleware } from '../../core/validators/globalValidators';
import StoresService from './storesService';
import { PER_PAGE } from '../../utils/constants';
import DisconnectableEntities from '../../core/enums/disconnectableEntities';
import { ICreateStoreDTO, IListStoresDTO, IDisconnectStoreDTO, IGetStoreByIdDTO, IUpdateStoreDTO, IDeleteStoreDTO } from './storesInterface';
import { createStoreValidator, listStoresValidator, disconnectEmailFromWatchValidator, getStoreByIdValidator, updateStoreNameValidator, deleteStoreValidator } from './storesValidator';
const routes = express.Router();


//* API TO CREATE STORE
routes.post('/', authMiddleware, validateRequestBodyViaMiddleware(createStoreValidator), async (req: Request, res: Response) => {
    const data: ICreateStoreDTO = req.validatedBody;
    const result = await StoresService.createStore(data, req.user);
    Utils.apiResponse({
        res,
        code: HttpStatusCode.Ok,
        status: true,
        responseCode: '200',
        responseDescription: 'Store created successfully',
        data: result
    });
});



//* API TO LIST STORES
routes.get('/', authMiddleware, validateRequestQueryViaMiddleware(listStoresValidator), async (req: Request, res: Response) => {
    const data: IListStoresDTO = {
        pageSize: req.validatedQuery?.pageSize || PER_PAGE,
        continuationToken: req.validatedQuery?.continuationToken || null,
        fields: req.validatedQuery?.fields || null,
        paginate: req.validatedQuery?.paginate || true,
        view: req.validatedQuery.view
    }
    const result = await StoresService.listStores(data, req.user);
    Utils.apiResponse({
        res,
        code: HttpStatusCode.Ok,
        status: true,
        responseCode: '200',
        responseDescription: result.stores.length ? 'Stores fetched successfully' : 'No stores found',
        data: result
    });
});



//* API TO DISCONNECT STORE OR EMAIL
routes.post('/disconnect', authMiddleware, validateRequestBodyViaMiddleware(disconnectEmailFromWatchValidator), async (req: Request, res: Response) => {
    const data: IDisconnectStoreDTO = {
        slug: req.validatedBody.slug,
        disconnectingEntity: req.validatedBody.disconnectingEntity
    }
    await StoresService.disconnectStore(data, req.user);
    Utils.apiResponse({
        res,
        code: HttpStatusCode.Ok,
        status: true,
        responseCode: '200',
        responseDescription: data.disconnectingEntity === DisconnectableEntities.EMAIL ? 'Support email disconnected successfully' : 'Shopify account disconnected successfully',
        data: null
    });
});



//* API TO GET STORE BY ID
routes.get('/:storeId', authMiddleware, validateRequestParamsViaMiddleware(getStoreByIdValidator), async (req: Request, res: Response) => {
    const data: IGetStoreByIdDTO = {
        storeId: req.validatedParams?.storeId
    };
    const result = await StoresService.getStoreById(data, req.user);
    Utils.apiResponse({
        res,
        code: HttpStatusCode.Ok,
        status: true,
        responseCode: '200',
        responseDescription: 'Store fetched successfully',
        data: result
    });
});



//* API TO UPDATE STORE
routes.patch('/:storeId', authMiddleware, validateRequestParamsViaMiddleware(getStoreByIdValidator), validateRequestBodyViaMiddleware(updateStoreNameValidator), async (req: Request, res: Response) => {
    const data: IUpdateStoreDTO = {
        storeId: req.validatedParams.storeId,
        ...req.validatedBody
    };
    const result = await StoresService.updateStore(data, req.user);
    Utils.apiResponse({
        res,
        code: HttpStatusCode.Ok,
        status: true,
        responseCode: '200',
        responseDescription: 'Store updated successfully',
        data: result
    });
});



//* API TO DELETE STORE
routes.delete('/:storeSlug', authMiddleware, validateRequestParamsViaMiddleware(deleteStoreValidator), async (req: Request, res: Response) => {
    const data: IDeleteStoreDTO = {
        storeSlug: req.validatedParams?.storeSlug
    }
    await StoresService.deleteStore(data, req.user);
    Utils.apiResponse({
        res,
        code: HttpStatusCode.Ok,
        status: true,
        responseCode: '200',
        responseDescription: 'Store deleted successfully',
    });
});


export default routes;