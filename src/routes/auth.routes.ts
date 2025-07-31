import { Hono } from 'hono';
import { AuthController } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validation.middleware.js';
import {
  ChangePasswordRequestSchema,
  LoginRequestSchema,
  RefreshTokenRequestSchema,
  RegisterRequestSchema,
} from '../models/dto/index.js';

const authRouter = new Hono();
const authController = new AuthController();

// 公开路由（无需认证）
authRouter.post(
  '/register',
  validateBody(RegisterRequestSchema),
  authController.register,
);
authRouter.post('/login', validateBody(LoginRequestSchema), authController.login);
authRouter.post(
  '/refresh',
  validateBody(RefreshTokenRequestSchema),
  authController.refreshToken,
);

// 需要认证的路由
authRouter.use('/*', authMiddleware);

authRouter.post('/logout', authController.logout);
authRouter.post('/logout-all', authController.logoutAll);
authRouter.post(
  '/change-password',
  validateBody(ChangePasswordRequestSchema),
  authController.changePassword,
);
authRouter.get('/me', authController.me);

export { authRouter };
