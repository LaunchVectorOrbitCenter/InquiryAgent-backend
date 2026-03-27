import express from 'express'
const routes = express.Router();

import { wrapRoutesWithAsyncHandler } from '../utils/helpers/asyncHandler';

import AuthRoutes from '../modules/auth/authController'
import CallbackRoutes from '../modules/callbacks/callbacksController'
import OAuthRoutes from '../modules/oauth/oauthController'


routes.use('/', wrapRoutesWithAsyncHandler(AuthRoutes));
routes.use('/oauth', wrapRoutesWithAsyncHandler(OAuthRoutes));
routes.use('/callbacks', wrapRoutesWithAsyncHandler(CallbackRoutes));



export const router = routes;