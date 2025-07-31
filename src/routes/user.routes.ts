import { Hono } from 'hono';
import { UserController } from '../controllers/user.controller.js';
import {
  adminMiddleware,
  authMiddleware,
  superAdminMiddleware,
} from '../middleware/auth.middleware.js';

const userRouter = new Hono();
const userController = new UserController();

// 所有用户路由都需要认证
userRouter.use('/*', authMiddleware);

// 用户自己的路由
userRouter.get('/me', userController.getCurrentUser);
userRouter.put('/me', userController.updateCurrentUser);

// 管理员路由（只能操作普通用户）
userRouter.use('/admin/*', adminMiddleware);
userRouter.get('/admin/list', userController.getUserList);
userRouter.get('/admin/:id', userController.getUserById);
userRouter.put('/admin/:id', userController.updateUser);
userRouter.delete('/admin/:id', userController.deleteUser);
userRouter.patch('/admin/:id/status', userController.updateUserStatus);

// 超级管理员专用路由（可以操作所有用户）
userRouter.use('/superadmin/*', superAdminMiddleware);
userRouter.get('/superadmin/list', userController.getUserList);
userRouter.get('/superadmin/:id', userController.getUserById);
userRouter.put('/superadmin/:id', userController.updateUser);
userRouter.delete('/superadmin/:id', userController.deleteUser);
userRouter.patch('/superadmin/:id/status', userController.updateUserStatus);

export { userRouter };
