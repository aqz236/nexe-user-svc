# User Service 微服务设计文档

## 概述

基于 Hono 框架构建的用户管理微服务，提供用户注册、登录、个人信息管理等核心功能。采用分层架构设计，确保代码结构清晰、高效且易维护。

## 技术栈

- **框架**: Hono.js
- **运行时**: Bun
- **数据库**: PostgreSQL (使用 Drizzle ORM)
- **认证**: JWT (jsonwebtoken)
- **验证**: TypeBox
- **状态码**: http-status-codes
- **日志**: 集成 `@nexe/logger`

## 项目结构

```
src/
├── index.ts                 # 应用入口
├── app.ts                   # Hono 应用配置
├── config/                  # 配置管理
│   ├── env.ts              # 环境变量配置
│   ├── database.ts         # 数据库配置
│   └── jwt.ts              # JWT 配置
├── controllers/             # 控制器层
│   ├── user.controller.ts  # 用户控制器
│   └── auth.controller.ts  # 认证控制器
├── services/               # 业务逻辑层
│   ├── user.service.ts     # 用户服务
│   └── auth.service.ts     # 认证服务
├── repositories/           # 数据访问层
│   └── user.repository.ts  # 用户仓储
├── models/                 # 数据模型
│   ├── user.model.ts       # 用户模型
│   └── dto/                # 数据传输对象
│       ├── user.dto.ts     # 用户 DTO
│       └── auth.dto.ts     # 认证 DTO
├── middleware/             # 中间件
│   ├── auth.middleware.ts  # 认证中间件
│   ├── cors.middleware.ts  # CORS 中间件
│   ├── logger.middleware.ts # 日志中间件
│   └── validation.middleware.ts # 验证中间件
├── routes/                 # 路由定义
│   ├── user.routes.ts      # 用户路由
│   └── auth.routes.ts      # 认证路由
├── utils/                  # 工具函数
│   ├── hash.util.ts        # 密码哈希工具
│   ├── jwt.util.ts         # JWT 工具
│   └── validation.util.ts  # 验证工具
├── types/                  # 类型定义
│   ├── user.types.ts       # 用户类型
│   └── auth.types.ts       # 认证类型
└── drizzle/                # Drizzle 相关
    ├── schema.ts           # 数据库模式
    ├── migrations/         # 数据库迁移
    └── db.ts               # 数据库连接
```

## 核心功能模块

### 1. 用户管理 (User Management)
- 用户注册
- 用户信息查询
- 用户信息更新
- 用户删除（软删除）
- 用户列表（分页）

### 2. 身份认证 (Authentication)
- 用户登录
- 用户登出
- JWT Token 刷新
- 密码重置

### 3. 用户权限 (Authorization)
- 基于角色的访问控制 (RBAC)
- 权限验证中间件

## API 设计

### 认证相关
- `POST /auth/register` - 用户注册
- `POST /auth/login` - 用户登录
- `POST /auth/logout` - 用户登出
- `POST /auth/refresh` - 刷新 Token
- `POST /auth/forgot-password` - 忘记密码
- `POST /auth/reset-password` - 重置密码

### 用户管理
- `GET /users/me` - 获取当前用户信息
- `PUT /users/me` - 更新当前用户信息
- `GET /users/:id` - 获取指定用户信息
- `GET /users` - 获取用户列表（分页）
- `PUT /users/:id` - 更新用户信息（管理员）
- `DELETE /users/:id` - 删除用户（管理员）

### 健康检查
- `GET /health` - 健康检查
- `GET /metrics` - 性能指标

## 数据模型

### User 模型
```typescript
interface User {
  id: string;
  email: string;
  username: string;
  password: string; // 哈希后的密码
  firstName?: string;
  lastName?: string;
  avatar?: string;
  role: UserRole;
  isActive: boolean;
  isEmailVerified: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date; // 软删除
}

enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin'
}
```

## 依赖管理

### 生产依赖
- `hono` - Web 框架
- `@hono/typebox-validator` - 参数验证
- `drizzle-orm` - ORM
- `pg` - PostgreSQL 客户端
- `dotenv` - 环境变量管理
- `bcryptjs` - 密码哈希
- `jsonwebtoken` - JWT 处理
- `@sinclair/typebox` - 数据验证
- `http-status-codes` - HTTP 状态码
- `@nexe/logger` - 日志记录

### 开发依赖
- `drizzle-kit` - Drizzle 工具链
- `tsx` - TypeScript 执行器
- `@types/pg` - PostgreSQL 类型定义
- `@types/bcryptjs` - bcryptjs 类型定义
- `@types/jsonwebtoken` - JWT 类型定义
- `@nexe/eslint-config` - ESLint 配置
- `@nexe/typescript-config` - TypeScript 配置

## 中间件设计

### 1. 认证中间件 (AuthMiddleware)
- 验证 JWT Token
- 提取用户信息
- 处理 Token 过期

### 2. 权限中间件 (AuthorizationMiddleware)
- 基于角色的权限检查
- 资源访问控制

### 3. 验证中间件 (ValidationMiddleware)
- 请求参数验证
- 响应格式统一

### 4. 日志中间件 (LoggerMiddleware)
- 请求/响应日志记录
- 性能监控

### 5. 错误处理中间件 (ErrorMiddleware)
- 统一错误处理
- 错误格式标准化

## 错误处理策略

### 错误类型
- `ValidationError` - 数据验证错误
- `AuthenticationError` - 认证错误
- `AuthorizationError` - 权限错误
- `NotFoundError` - 资源不存在
- `ConflictError` - 资源冲突
- `InternalServerError` - 服务器内部错误

### 错误响应格式
```typescript
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
    path: string;
  };
}
```

## 安全考虑

1. **密码安全**: 使用 bcrypt 进行密码哈希
2. **JWT 安全**: 设置合理的过期时间，使用强密钥
3. **CORS 配置**: 配置跨域访问策略
4. **速率限制**: 防止暴力破解和 DDoS 攻击
5. **输入验证**: 严格的数据验证和清理
6. **SQL 注入防护**: 使用 Prisma ORM 防止 SQL 注入

## 性能优化

1. **数据库连接池**: 合理配置连接池大小
2. **查询优化**: 使用索引，避免 N+1 查询
3. **缓存策略**: Redis 缓存用户会话和常用数据
4. **分页查询**: 大数据量时使用游标分页
5. **响应压缩**: 启用 gzip 压缩

## 监控和日志

1. **结构化日志**: 使用 JSON 格式日志
2. **请求追踪**: 记录请求 ID 用于链路追踪
3. **性能监控**: 记录响应时间和错误率
4. **健康检查**: 提供服务健康状态接口

## 部署配置

### 环境变量
```bash
# 服务配置
PORT=3000
NODE_ENV=production

# 数据库配置
DATABASE_URL=postgresql://username:password@localhost:5432/nexe_user

# JWT 配置
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Redis 配置 (可选)
REDIS_URL=redis://localhost:6379
```

## Todo List

### Phase 1: 基础架构 (Priority: High)
- [ ] 项目结构搭建
- [ ] 依赖安装和配置
- [ ] TypeScript 配置优化
- [ ] ESLint 和 Prettier 配置
- [ ] 基础 Hono 应用设置

### Phase 2: 数据层 (Priority: High)
- [ ] Drizzle ORM 配置和初始化
- [ ] 用户数据模型设计
- [ ] 数据库迁移脚本
- [ ] 用户仓储层实现

### Phase 3: 核心业务逻辑 (Priority: High)
- [ ] 用户服务层实现
- [ ] 认证服务层实现
- [ ] 密码哈希工具实现
- [ ] JWT 工具实现

### Phase 4: API 层 (Priority: High)
- [ ] 用户控制器实现
- [ ] 认证控制器实现
- [ ] 路由配置
- [ ] 数据验证 (TypeBox schemas)

### Phase 5: 中间件 (Priority: Medium)
- [ ] 认证中间件
- [ ] 权限中间件
- [ ] 日志中间件
- [ ] 错误处理中间件
- [ ] CORS 中间件

### Phase 6: 安全和验证 (Priority: Medium)
- [ ] 输入验证增强
- [ ] 速率限制中间件
- [ ] 安全头设置
- [ ] 参数清理

### Phase 7: 监控和日志 (Priority: Medium)
- [ ] 集成 @nexe/logger
- [ ] 健康检查端点
- [ ] 性能监控
- [ ] 错误追踪

### Phase 8: 测试 (Priority: Low)
- [ ] 单元测试
- [ ] 集成测试
- [ ] README 文档更新

### Phase 9: 优化和部署 (Priority: Low)
- [ ] 性能优化
- [ ] Docker 配置
- [ ] CI/CD 配置
- [ ] 环境配置文档

## 预期时间安排

- **Phase 1-2**: 1-2 天
- **Phase 3-4**: 2-3 天  
- **Phase 5-6**: 1-2 天
- **Phase 7-8**: 1-2 天
- **Phase 9**: 1 天

**总计**: 6-10 天

## 技术决策说明

1. **选择 Drizzle**: 轻量级 ORM，提供类型安全和灵活的查询构建
2. **分层架构**: Controller -> Service -> Repository 清晰的依赖链
3. **TypeBox 验证**: 高性能的 JSON Schema 验证，与 TypeScript 完美集成
4. **JWT 认证**: 无状态认证，适合微服务架构
5. **软删除策略**: 保留数据完整性，便于审计

---

**请审阅以上设计方案，确认后我将开始按照 Todo List 逐步实现。**
