import { createLogger } from '@nexe/logger';
import { createMiddleware } from 'hono/factory';
import { R } from '../utils/response.util.js';

const logger = createLogger('error-handler');

/**
 * 通用错误处理中间件
 */
export const errorHandlerMiddleware = createMiddleware(async (c, next) => {
  try {
    await next();
  } catch (error) {
    logger.error('Error:', error);

    if (error instanceof Error) {
      // 处理已知错误类型
      if (error.message.includes('already exists')) {
        return R.of(c)
          .conflict(error.message)
          .build();
      }

      if (error.message.includes('not found')) {
        return R.of(c)
          .notFound(error.message)
          .build();
      }

      if (
        error.message.includes('Invalid') ||
        error.message.includes('incorrect')
      ) {
        return R.of(c)
          .badRequest(error.message)
          .build();
      }

      if (error.message.includes('inactive')) {
        return R.of(c)
          .forbidden(error.message)
          .build();
      }

      if (error.message.includes('Access denied')) {
        return R.of(c)
          .forbidden(error.message)
          .build();
      }
    }

    // 默认服务器错误
    return R.of(c)
      .error('An unexpected error occurred')
      .build();
  }
});
