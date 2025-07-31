import { cors } from 'hono/cors';
import { env } from '../config/env.js';

/**
 * CORS 中间件配置
 */
export const corsMiddleware = cors({
  origin: (origin, _c) => {
    // 在开发环境允许所有源
    if (env.NODE_ENV === 'development') {
      return origin || '*';
    }

    // 在生产环境中，您可以配置允许的域名
    const allowedOrigins = [
      'https://your-frontend-domain.com',
      'https://your-admin-domain.com',
    ];

    if (!origin) {
      return '*'; // 允许无 origin 的请求（如移动应用）
    }

    return allowedOrigins.includes(origin) ? origin : null;
  },
  credentials: true,
  allowHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
  ],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  exposeHeaders: ['X-Total-Count', 'X-Page', 'X-Per-Page'],
  maxAge: 86400, // 24 小时
});
