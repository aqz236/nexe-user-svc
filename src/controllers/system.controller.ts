import type { Context } from 'hono';
import { StatusCodes } from 'http-status-codes';
import { env } from '../../config/env.js';
import { R } from '../utils/response.util.js';

export class SystemController {
  /**
   * 健康检查
   */
  health = async (c: Context) => {
    const healthInfo = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'user-svc',
      version: '1.0.0',
      environment: env.NODE_ENV,
    };

    return c.json(healthInfo, StatusCodes.OK);
  };

  /**
   * 系统信息
   */
  info = async (c: Context) => {
    return R.of(c)
      .success('System information retrieved successfully')
      .data({
        service: 'user-svc',
        version: '1.0.0',
        environment: env.NODE_ENV,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        nodeVersion: process.version,
        platform: process.platform,
      })
      .build();
  };
}
