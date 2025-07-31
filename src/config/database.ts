import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from './env.js';

// 创建 PostgreSQL 连接
const client = postgres(env.DATABASE_URL, {
  max: 20, // 连接池最大连接数
  idle_timeout: 20, // 空闲超时时间（秒）
  connect_timeout: 10, // 连接超时时间（秒）
});

// 创建 Drizzle 数据库实例
export const db = drizzle(client);

// 导出客户端用于手动查询或关闭连接
export { client };
