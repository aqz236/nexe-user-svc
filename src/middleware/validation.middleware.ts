import type { TSchema } from '@sinclair/typebox';
import { Value } from '@sinclair/typebox/value';
import { createMiddleware } from 'hono/factory';
import { StatusCodes } from 'http-status-codes';

/**
 * 请求体验证中间件
 *
 * @param schema - TypeBox schema 用于验证
 * @returns Hono 中间件
 */
export const validateBody = (schema: TSchema) => {
  return createMiddleware(async (c, next) => {
    try {
      const body = await c.req.json();

      // 使用 TypeBox 验证数据
      const isValid = Value.Check(schema, body);

      if (!isValid) {
        const errors = [...Value.Errors(schema, body)];
        return c.json(
          {
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Request validation failed',
              details: errors.map(error => ({
                path: error.path,
                message: error.schema.errorMessage || error.message,
                expectedType: error.schema.type,
              })),
              timestamp: new Date().toISOString(),
              path: c.req.path,
            },
          },
          StatusCodes.BAD_REQUEST,
        );
      }

      // 验证通过，继续执行
      await next();
    } catch (_error) {
      return c.json(
        {
          error: {
            code: 'INVALID_JSON',
            message: 'Invalid JSON format',
            timestamp: new Date().toISOString(),
            path: c.req.path,
          },
        },
        StatusCodes.BAD_REQUEST,
      );
    }
  });
};

/**
 * 查询参数验证中间件
 *
 * @param schema - TypeBox schema 用于验证
 * @returns Hono 中间件
 */
export const validateQuery = (schema: TSchema) => {
  return createMiddleware(async (c, next) => {
    const query = c.req.query();

    // 使用 TypeBox 验证数据
    const isValid = Value.Check(schema, query);

    if (!isValid) {
      const errors = [...Value.Errors(schema, query)];
      return c.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Query parameter validation failed',
            details: errors.map(error => ({
              path: error.path,
              message: error.message,
              expectedType: error.schema.type,
            })),
            timestamp: new Date().toISOString(),
            path: c.req.path,
          },
        },
        StatusCodes.BAD_REQUEST,
      );
    }

    await next();
  });
};

/**
 * 路径参数验证中间件
 *
 * @param schema - TypeBox schema 用于验证
 * @returns Hono 中间件
 */
export const validateParams = (schema: TSchema) => {
  return createMiddleware(async (c, next) => {
    const params = c.req.param();

    // 使用 TypeBox 验证数据
    const isValid = Value.Check(schema, params);

    if (!isValid) {
      const errors = [...Value.Errors(schema, params)];
      return c.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Path parameter validation failed',
            details: errors.map(error => ({
              path: error.path,
              message: error.message,
              expectedType: error.schema.type,
            })),
            timestamp: new Date().toISOString(),
            path: c.req.path,
          },
        },
        StatusCodes.BAD_REQUEST,
      );
    }

    await next();
  });
};
