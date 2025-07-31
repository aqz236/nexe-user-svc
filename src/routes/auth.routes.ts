import { Hono } from 'hono';
import { AuthController } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const authRouter = new Hono();
const authController = new AuthController();

// 公开路由（无需认证）
authRouter.post('/register', authController.register);
authRouter.post('/login', authController.login);
authRouter.post('/refresh', authController.refreshToken);

// 需要认证的路由
authRouter.use('/*', authMiddleware);

authRouter.post('/logout', authController.logout);
authRouter.post('/logout-all', authController.logoutAll);
authRouter.post('/change-password', authController.changePassword);
authRouter.get('/me', authController.me);

export { authRouter };
