import { createMiddleware } from 'hono/factory';
import { AuthService } from '../services/auth.service.js';
import { R } from '../utils/response.util.js';

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
    return R.of(c)
      .unauthorized('Missing or invalid authorization header')
      .build();
  }

  const token = authHeader.substring(7); // 移除 "Bearer " 前缀
  const authService = new AuthService();

  try {
    const user = await authService.validateAccessToken(token);

    if (!user) {
      return R.of(c)
        .unauthorized('Invalid or expired token')
        .build();
    }

    // 将用户信息存储到上下文中
    c.set('user', user);

    await next();
  } catch (_error) {
    return R.of(c)
      .unauthorized('Token validation failed')
      .build();
  }
});

/**
 * 角色权限中间件
 */
export const roleMiddleware = (allowedRoles: string[]) => {
  return createMiddleware(async (c, next) => {
    const user = c.get('user');

    if (!user) {
      return R.of(c)
        .unauthorized('User not authenticated')
        .build();
    }

    if (!allowedRoles.includes(user.role)) {
      return R.of(c)
        .forbidden('Insufficient permissions')
        .build();
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
