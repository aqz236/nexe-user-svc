import { createLogger } from '@nexe/logger';
import { createMiddleware } from 'hono/factory';
import { StatusCodes } from 'http-status-codes';

const logger = createLogger('validation');

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
        return c.json(
          {
            error: {
              code: 'CONFLICT',
              message: error.message,
              timestamp: new Date().toISOString(),
              path: c.req.path,
            },
          },
          StatusCodes.CONFLICT,
        );
      }

      if (error.message.includes('not found')) {
        return c.json(
          {
            error: {
              code: 'NOT_FOUND',
              message: error.message,
              timestamp: new Date().toISOString(),
              path: c.req.path,
            },
          },
          StatusCodes.NOT_FOUND,
        );
      }

      if (
        error.message.includes('Invalid') ||
        error.message.includes('incorrect')
      ) {
        return c.json(
          {
            error: {
              code: 'BAD_REQUEST',
              message: error.message,
              timestamp: new Date().toISOString(),
              path: c.req.path,
            },
          },
          StatusCodes.BAD_REQUEST,
        );
      }

      if (error.message.includes('inactive')) {
        return c.json(
          {
            error: {
              code: 'FORBIDDEN',
              message: error.message,
              timestamp: new Date().toISOString(),
              path: c.req.path,
            },
          },
          StatusCodes.FORBIDDEN,
        );
      }
    }

    // 默认服务器错误
    return c.json(
      {
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred',
          timestamp: new Date().toISOString(),
          path: c.req.path,
        },
      },
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }
});
