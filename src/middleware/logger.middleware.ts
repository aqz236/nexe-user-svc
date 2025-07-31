import { createMiddleware } from 'hono/factory';

import { createLogger } from '@nexe/logger';

const logger = createLogger('middleware');

/**
 * 日志中间件
 */
export const loggerMiddleware = createMiddleware(async (c, next) => {
  const start = Date.now();
  const method = c.req.method;
  const path = c.req.path;
  const userAgent = c.req.header('User-Agent') || '';
  const ip =
    c.req.header('X-Forwarded-For') || c.req.header('X-Real-IP') || 'unknown';

  // 获取用户信息（如果已认证）
  const user = c.get('user');
  const userId = user?.userId || 'anonymous';
  logger.info(
    `🚀 Request: ${method} ${path} - User: ${userId} - IP: ${ip} - UA: ${userAgent}`,
  );

  await next();

  const end = Date.now();
  const duration = end - start;
  const status = c.res.status;
  logger.info(
    `✅ Response: ${method} ${path} - Status: ${status} - Duration: ${duration}ms - User: ${userId} - IP: ${ip} - UA: ${userAgent}`,
  );

  // 如果有错误状态码，记录更详细的信息
  if (status >= 400) {
    logger.error(
      `❌ Response: ${method} ${path} - Status: ${status} - Duration: ${duration}ms - User: ${userId} - IP: ${ip} - UA: ${userAgent}`,
    );
  }
});
