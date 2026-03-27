import express from 'express'
const routes = express.Router();
import { wrapRoutesWithAsyncHandler } from '../utils/helpers/asyncHandler';

import OrderRoutes from '../modules/orders/ordersController'
import UsersRoutes from '../modules/users/usersController'
import MenusRoutes from '../modules/menus/menusController'
import RolesRoutes from '../modules/roles/rolesController'
import StoresRoutes from '../modules/stores/storesController'
import EmailsRoutes from '../modules/emails/emailsController'
import DashboardRoutes from '../modules/dashboard/dashboardController'
import PermissionsRoutes from '../modules/permissions/permissionsController'
import EmailQueriesRoutes from '../modules/emailQueries/emailQueriesController'
import EmailThreadsRoutes from '../modules/emailThreads/emailThreadsController'
import StoreKnowledgeBaseRoutes from '../modules/storesKnowledgeBase/storesKnowledgeBaseController'
import AiPlaygroundChatroomsRoutes from '../modules/aiPlaygroundChatrooms/aiPlaygroundChatroomsController'
import AiPlaygroundChatroomConversationsRoutes from '../modules/aiPlaygroundChatroomConversations/aiPlaygroundChatroomConversationsController'


routes.use('/v1/users', wrapRoutesWithAsyncHandler(UsersRoutes));
routes.use('/v1/menus', wrapRoutesWithAsyncHandler(MenusRoutes));
routes.use('/v1/roles', wrapRoutesWithAsyncHandler(RolesRoutes));
routes.use('/v1/orders', wrapRoutesWithAsyncHandler(OrderRoutes));
routes.use('/v1/stores', wrapRoutesWithAsyncHandler(StoresRoutes));
routes.use('/v1/emails', wrapRoutesWithAsyncHandler(EmailsRoutes));
routes.use('/v1/dashboard', wrapRoutesWithAsyncHandler(DashboardRoutes));
routes.use('/v1/permissions', wrapRoutesWithAsyncHandler(PermissionsRoutes));
routes.use('/v1/email-queries', wrapRoutesWithAsyncHandler(EmailQueriesRoutes));
routes.use('/v1/email-threads', wrapRoutesWithAsyncHandler(EmailThreadsRoutes));
routes.use('/v1/stores/knowledge-base', wrapRoutesWithAsyncHandler(StoreKnowledgeBaseRoutes));
routes.use('/v1/playground/chatrooms', wrapRoutesWithAsyncHandler(AiPlaygroundChatroomsRoutes));
routes.use('/v1/playground/chatroom-conversations', wrapRoutesWithAsyncHandler(AiPlaygroundChatroomConversationsRoutes));



export const router = routes;