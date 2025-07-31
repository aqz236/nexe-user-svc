import { createLogger } from '@nexe/logger';
import { Hono } from 'hono';
import { env } from '../config/env.js';
import { corsMiddleware } from './middleware/cors.middleware.js';
import { errorHandlerMiddleware } from './middleware/error-handler.middleware.js';
import { loggerMiddleware } from './middleware/logger.middleware.js';
import { authRouter } from './routes/auth.routes.js';
import { systemRouter } from './routes/system.routes.js';
import { userRouter } from './routes/user.routes.js';
import { R } from './utils/response.util.js';

const logger = createLogger('server');
const app = new Hono();

// 全局中间件
app.use('*', corsMiddleware);
app.use('*', loggerMiddleware);
app.use('*', errorHandlerMiddleware);

// 系统路由
app.route('/', systemRouter);

// API 路由
app.route('/api/auth', authRouter);
app.route('/api/users', userRouter);

// 404 处理
app.notFound(c => {
  return R.of(c)
    .notFound('The requested resource was not found')
    .data({ path: c.req.path })
    .build();
});

// 启动服务器
const server = Bun.serve({
  port: env.PORT,
  fetch: app.fetch,
  reusePort: true,
});

logger.info(`🚀 User Service is running on port ${server.port}`);
logger.info(`🌍 Environment: ${env.NODE_ENV}`);
logger.info(`📊 Health check: http://localhost:${server.port}/health`);

// 优雅关闭
process.on('SIGINT', () => {
  logger.info('⏹️ Shutting down server...');
  server.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('⏹️ Shutting down server...');
  server.stop();
  process.exit(0);
});
