import { Hono } from 'hono';
import { UserController } from '../controllers/user.controller.js';
import { authMiddleware, adminMiddleware, superAdminMiddleware } from '../middleware/auth.middleware.js';

const userRouter = new Hono();
const userController = new UserController();

// 所有用户路由都需要认证
userRouter.use('/*', authMiddleware);

// 用户自己的路由
userRouter.get('/me', userController.getCurrentUser);
userRouter.put('/me', userController.updateCurrentUser);

// 管理员路由（只能操作普通用户）
userRouter.use('/admin/*', adminMiddleware);
userRouter.get('/admin/list', userController.getAdminUserList);
userRouter.get('/admin/:id', userController.getAdminUserById);
userRouter.put('/admin/:id', userController.updateAdminUser);
userRouter.delete('/admin/:id', userController.deleteAdminUser);
userRouter.patch('/admin/:id/status', userController.updateAdminUserStatus);

// 超级管理员专用路由（可以操作所有用户）
userRouter.use('/superadmin/*', superAdminMiddleware);
userRouter.get('/superadmin/list', userController.getSuperAdminUserList);
userRouter.get('/superadmin/:id', userController.getSuperAdminUserById);
userRouter.put('/superadmin/:id', userController.updateSuperAdminUser);
userRouter.delete('/superadmin/:id', userController.deleteSuperAdminUser);
userRouter.patch('/superadmin/:id/status', userController.updateSuperAdminUserStatus);

export { userRouter };
