import express from 'express'
const routes = express.Router();
import SystemRoutes from '../modules/system/systemController'
import { wrapRoutesWithAsyncHandler } from '../utils/helpers/asyncHandler';
import EmailQueriesRoutes from "../modules/emailQueries/emailQueriesController";


routes.use('/insights', wrapRoutesWithAsyncHandler(SystemRoutes));
routes.use('/credit-card', wrapRoutesWithAsyncHandler(SystemRoutes));

export const router = routes;