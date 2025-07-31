import { Hono } from 'hono';
import { UserController } from '../controllers/user.controller.js';
import {
  adminMiddleware,
  authMiddleware,
  superAdminMiddleware,
} from '../middleware/auth.middleware.js';
import { validateBody, validateParams, validateQuery } from '../middleware/validation.middleware.js';
import {
  UpdateUserSchema,
  UserStatusSchema,
  UserIdParamSchema,
  UserListQuerySchema,
} from '../models/dto/index.js';

const userRouter = new Hono();
const userController = new UserController();

// 所有用户路由都需要认证
userRouter.use('/*', authMiddleware);

// 用户自己的路由
userRouter.get('/me', userController.getCurrentUser);
userRouter.put('/me', validateBody(UpdateUserSchema), userController.updateCurrentUser);

// 管理员路由（只能操作普通用户）
userRouter.use('/admin/*', adminMiddleware);
userRouter.get('/admin/list', validateQuery(UserListQuerySchema), userController.getUserList);
userRouter.get('/admin/:id', validateParams(UserIdParamSchema), userController.getUserById);
userRouter.put('/admin/:id', validateParams(UserIdParamSchema), validateBody(UpdateUserSchema), userController.updateUser);
userRouter.delete('/admin/:id', validateParams(UserIdParamSchema), userController.deleteUser);
userRouter.patch('/admin/:id/status', validateParams(UserIdParamSchema), validateBody(UserStatusSchema), userController.updateUserStatus);

// 超级管理员专用路由（可以操作所有用户）
userRouter.use('/superadmin/*', superAdminMiddleware);
userRouter.get('/superadmin/list', validateQuery(UserListQuerySchema), userController.getUserList);
userRouter.get('/superadmin/:id', validateParams(UserIdParamSchema), userController.getUserById);
userRouter.put('/superadmin/:id', validateParams(UserIdParamSchema), validateBody(UpdateUserSchema), userController.updateUser);
userRouter.delete('/superadmin/:id', validateParams(UserIdParamSchema), userController.deleteUser);
userRouter.patch('/superadmin/:id/status', validateParams(UserIdParamSchema), validateBody(UserStatusSchema), userController.updateUserStatus);

export { userRouter };
