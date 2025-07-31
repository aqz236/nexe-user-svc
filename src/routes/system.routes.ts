import { Hono } from 'hono';
import { SystemController } from '../controllers/system.controller.js';

const systemRouter = new Hono();
const systemController = new SystemController();

// 健康检查路由
systemRouter.get('/health', systemController.health);

// 系统信息路由
systemRouter.get('/info', systemController.info);

export { systemRouter };
