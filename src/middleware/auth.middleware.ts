import { createMiddleware } from 'hono/factory';
import { StatusCodes } from 'http-status-codes';
import { AuthService } from '../services/auth.service.js';

// 扩展 Hono 的上下文类型
declare module 'hono' {
  interface ContextVariableMap {
    user: {
      userId: string;
      email: string;
      role: string;
    };
  }
}

/**
 * JWT 认证中间件
 */
export const authMiddleware = createMiddleware(async (c, next) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json(
      {
        error: {
          code: 'UNAUTHORIZED',
          message: 'Missing or invalid authorization header',
          timestamp: new Date().toISOString(),
          path: c.req.path,
        },
      },
      StatusCodes.UNAUTHORIZED,
    );
  }

  const token = authHeader.substring(7); // 移除 "Bearer " 前缀
  const authService = new AuthService();

  try {
    const user = await authService.validateAccessToken(token);

    if (!user) {
      return c.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: 'Invalid or expired token',
            timestamp: new Date().toISOString(),
            path: c.req.path,
          },
        },
        StatusCodes.UNAUTHORIZED,
      );
    }

    // 将用户信息存储到上下文中
    c.set('user', user);

    await next();
  } catch (_error) {
    return c.json(
      {
        error: {
          code: 'UNAUTHORIZED',
          message: 'Token validation failed',
          timestamp: new Date().toISOString(),
          path: c.req.path,
        },
      },
      StatusCodes.UNAUTHORIZED,
    );
  }
});

/**
 * 角色权限中间件
 */
export const roleMiddleware = (allowedRoles: string[]) => {
  return createMiddleware(async (c, next) => {
    const user = c.get('user');

    if (!user) {
      return c.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
            timestamp: new Date().toISOString(),
            path: c.req.path,
          },
        },
        StatusCodes.UNAUTHORIZED,
      );
    }

    if (!allowedRoles.includes(user.role)) {
      return c.json(
        {
          error: {
            code: 'FORBIDDEN',
            message: 'Insufficient permissions',
            timestamp: new Date().toISOString(),
            path: c.req.path,
          },
        },
        StatusCodes.FORBIDDEN,
      );
    }

    await next();
  });
};

/**
 * 管理员权限中间件
 */
export const adminMiddleware = roleMiddleware(['admin', 'super_admin']);

/**
 * 超级管理员权限中间件
 */
export const superAdminMiddleware = roleMiddleware(['super_admin']);
