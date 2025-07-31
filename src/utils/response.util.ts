import type { Context } from 'hono';
import { StatusCodes } from 'http-status-codes';

/**
 * 统一响应结果封装类
 */
export class R {
  private context: Context;
  private statusCode: number = StatusCodes.OK;
  private responseData: unknown = null;
  private message: string = '';
  private errorCode?: string;
  private errorDetails?: unknown;

  constructor(context: Context) {
    this.context = context;
  }

  /**
   * 创建响应实例
   */
  static of(context: Context): R {
    return new R(context);
  }

  /**
   * 设置成功响应
   */
  success(message: string = 'Operation successful'): R {
    this.message = message;
    this.statusCode = StatusCodes.OK;
    return this;
  }

  /**
   * 设置创建成功响应
   */
  created(message: string = 'Resource created successfully'): R {
    this.message = message;
    this.statusCode = StatusCodes.CREATED;
    return this;
  }

  /**
   * 设置错误响应
   */
  error(message: string, code: string = 'ERROR'): R {
    this.message = message;
    this.errorCode = code;
    this.statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    return this;
  }

  /**
   * 设置客户端错误响应
   */
  badRequest(message: string, code: string = 'BAD_REQUEST'): R {
    this.message = message;
    this.errorCode = code;
    this.statusCode = StatusCodes.BAD_REQUEST;
    return this;
  }

  /**
   * 设置未认证响应
   */
  unauthorized(message: string = 'Unauthorized', code: string = 'UNAUTHORIZED'): R {
    this.message = message;
    this.errorCode = code;
    this.statusCode = StatusCodes.UNAUTHORIZED;
    return this;
  }

  /**
   * 设置禁止访问响应
   */
  forbidden(message: string = 'Forbidden', code: string = 'FORBIDDEN'): R {
    this.message = message;
    this.errorCode = code;
    this.statusCode = StatusCodes.FORBIDDEN;
    return this;
  }

  /**
   * 设置资源未找到响应
   */
  notFound(message: string = 'Resource not found', code: string = 'NOT_FOUND'): R {
    this.message = message;
    this.errorCode = code;
    this.statusCode = StatusCodes.NOT_FOUND;
    return this;
  }

  /**
   * 设置冲突响应
   */
  conflict(message: string = 'Resource conflict', code: string = 'CONFLICT'): R {
    this.message = message;
    this.errorCode = code;
    this.statusCode = StatusCodes.CONFLICT;
    return this;
  }

  /**
   * 设置响应数据
   */
  data(data: unknown): R {
    this.responseData = data;
    return this;
  }

  /**
   * 设置错误详情
   */
  details(details: unknown): R {
    this.errorDetails = details;
    return this;
  }

  /**
   * 设置自定义状态码
   */
  status(code: number): R {
    this.statusCode = code;
    return this;
  }

  /**
   * 构建并返回响应
   */
  build() {
    const timestamp = new Date().toISOString();
    const path = this.context.req.path;

    // 如果是错误响应
    if (this.errorCode) {
      const errorResponse = {
        error: {
          code: this.errorCode,
          message: this.message,
          timestamp,
          path,
          ...(this.errorDetails && typeof this.errorDetails === 'object' && this.errorDetails !== null
            ? { details: this.errorDetails }
            : {}),
        },
      };
      return this.context.json(errorResponse, this.statusCode as never);
    }

    // 成功响应
    const successResponse: Record<string, unknown> = {
      message: this.message,
      timestamp,
      path,
    };

    // 只有在有数据时才添加 data 字段
    if (this.responseData !== null) {
      successResponse.data = this.responseData;
    }

    return this.context.json(successResponse, this.statusCode as never);
  }
}

/**
 * 便捷方法：成功响应
 */
export const success = (context: Context, message?: string) =>
  R.of(context).success(message);

/**
 * 便捷方法：创建成功响应
 */
export const created = (context: Context, message?: string) =>
  R.of(context).created(message);

/**
 * 便捷方法：错误响应
 */
export const error = (context: Context, message: string, code?: string) =>
  R.of(context).error(message, code);

/**
 * 便捷方法：客户端错误响应
 */
export const badRequest = (context: Context, message: string, code?: string) =>
  R.of(context).badRequest(message, code);

/**
 * 便捷方法：未认证响应
 */
export const unauthorized = (context: Context, message?: string, code?: string) =>
  R.of(context).unauthorized(message, code);

/**
 * 便捷方法：禁止访问响应
 */
export const forbidden = (context: Context, message?: string, code?: string) =>
  R.of(context).forbidden(message, code);

/**
 * 便捷方法：资源未找到响应
 */
export const notFound = (context: Context, message?: string, code?: string) =>
  R.of(context).notFound(message, code);

/**
 * 便捷方法：冲突响应
 */
export const conflict = (context: Context, message?: string, code?: string) =>
  R.of(context).conflict(message, code);
