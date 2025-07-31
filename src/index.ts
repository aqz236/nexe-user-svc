import { createLogger } from '@nexe/logger';
import app from './app.js';
import { env } from './config/env.js';

const logger = createLogger('server');

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
