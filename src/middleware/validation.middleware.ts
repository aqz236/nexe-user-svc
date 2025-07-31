import type { TSchema } from '@sinclair/typebox';
import { Value } from '@sinclair/typebox/value';
import { createMiddleware } from 'hono/factory';
import { R } from '../utils/response.util.js';

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
        const validationDetails = errors.map(error => ({
          path: error.path,
          message: error.schema.description || error.message,
          expectedType: error.schema.type,
        }));

        return R.of(c)
          .badRequest('Request validation failed', 'VALIDATION_ERROR')
          .details(validationDetails)
          .build();
      }

      // 验证通过，继续执行
      await next();
    } catch (_error) {
      return R.of(c).badRequest('Invalid JSON format', 'INVALID_JSON').build();
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
      const validationDetails = errors.map(error => ({
        path: error.path,
        message: error.schema.description || error.message,
        expectedType: error.schema.type,
      }));

      return R.of(c)
        .badRequest('Query parameter validation failed', 'VALIDATION_ERROR')
        .details(validationDetails)
        .build();
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
      const validationDetails = errors.map(error => ({
        path: error.path,
        message: error.schema.description || error.message,
        expectedType: error.schema.type,
      }));

      return R.of(c)
        .badRequest('Path parameter validation failed', 'VALIDATION_ERROR')
        .details(validationDetails)
        .build();
    }

    await next();
  });
};
