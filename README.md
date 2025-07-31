# User Service (nexe-user-svc)

基于 Hono 框架的用户管理微服务，提供完整的用户认证和权限管理功能。

## 🚀 特性

- **用户认证**: 注册、登录、JWT Token 管理
- **用户管理**: 用户信息增删改查、权限管理
- **角色权限**: 三级权限系统（用户、管理员、超级管理员）
- **安全性**: 密码哈希、JWT 认证、CORS 保护、细粒度权限控制
- **数据库**: 使用 Drizzle ORM + PostgreSQL
- **类型安全**: 完整的 TypeScript 支持
- **日志记录**: 集成 @nexe/logger
- **错误处理**: 统一的错误处理和响应格式

## 🛠️ 技术栈

- **框架**: Hono.js
- **运行时**: Bun
- **数据库**: PostgreSQL + Drizzle ORM
- **认证**: JWT (使用 jose 库)
- **验证**: TypeBox
- **密码哈希**: bcryptjs (12 rounds)
- **日志**: @nexe/logger

## 🔐 权限管理系统

### 用户角色层级

```
用户权限层级：user < admin < super_admin

权限继承关系：
- super_admin: 拥有所有权限，可以管理所有用户（包括其他管理员）
- admin: 拥有用户管理权限，但只能管理普通用户，不能查看/操作其他管理员
- user: 只能管理自己的信息
```

### 角色权限详细说明

#### 1. 普通用户 (user)
- ✅ 查看和修改自己的信息
- ✅ 更改自己的密码
- ❌ 无法访问管理功能
- ❌ 无法查看其他用户信息

#### 2. 管理员 (admin)
- ✅ 所有普通用户权限
- ✅ 查看普通用户列表（不包含其他管理员）
- ✅ 查看、修改、删除普通用户
- ✅ 启用/禁用普通用户账户
- ❌ **不能查看其他管理员或超级管理员**
- ❌ **不能操作其他管理员或超级管理员**
- ❌ 无法访问超级管理员功能

#### 3. 超级管理员 (super_admin)
- ✅ 所有管理员权限
- ✅ 查看所有用户列表（包括普通用户、管理员、超级管理员）
- ✅ 管理所有用户（包括其他管理员）
- ✅ 执行系统级敏感操作
- ✅ 完整的用户权限管理

### 权限实现机制

#### JWT Token 结构
```typescript
{
  userId: string;
  email: string;
  role: 'user' | 'admin' | 'super_admin';
  iat: number;
  exp: number;
}
```

#### 中间件层级
1. **authMiddleware**: 验证 JWT Token 有效性
2. **adminMiddleware**: 验证 admin 或 super_admin 角色
3. **superAdminMiddleware**: 仅验证 super_admin 角色

#### 路由权限控制
```typescript
// 普通用户路由
GET /api/users/me
PUT /api/users/me

// 管理员路由（只能操作普通用户）
GET /api/users/admin/list        // 仅显示普通用户
GET /api/users/admin/:id         // 仅允许查看普通用户
PUT /api/users/admin/:id         // 仅允许修改普通用户
DELETE /api/users/admin/:id      // 仅允许删除普通用户
PATCH /api/users/admin/:id/status // 仅允许修改普通用户状态

// 超级管理员路由（可操作所有用户）
GET /api/users/superadmin/list        // 显示所有用户
GET /api/users/superadmin/:id         // 可查看任何用户
PUT /api/users/superadmin/:id         // 可修改任何用户
DELETE /api/users/superadmin/:id      // 可删除任何用户
PATCH /api/users/superadmin/:id/status // 可修改任何用户状态
```

## 📦 安装和运行

### 1. 安装依赖

```bash
bun install
```

### 3. 数据库迁移

```bash
# 生成迁移文件
bun run db:generate

# 执行迁移
bun run db:migrate

# 或者使用 push 命令（开发环境）
bun run db:push
```

### 4. 启动开发服务器

```bash
bun run dev
```

服务将在 http://localhost:3000 启动。

## 🔗 API 端点

### 🏥 健康检查
- `GET /health` - 服务健康状态

### 🔐 认证相关 (`/api/auth`)
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/refresh` - 刷新访问令牌
- `POST /api/auth/logout` - 用户登出
- `POST /api/auth/logout-all` - 登出所有设备
- `POST /api/auth/change-password` - 修改密码
- `GET /api/auth/me` - 获取当前用户信息

### 👤 用户管理 (`/api/users`)

#### 普通用户路由 (需要认证)
- `GET /api/users/me` - 获取当前用户详细信息
- `PUT /api/users/me` - 更新当前用户信息

#### 管理员路由 (需要 admin 或 super_admin 权限)
> ⚠️ **注意**: 管理员只能管理普通用户，无法查看或操作其他管理员

- `GET /api/users/admin/list` - 获取普通用户列表
- `GET /api/users/admin/:id` - 获取指定普通用户信息  
- `PUT /api/users/admin/:id` - 更新指定普通用户信息
- `DELETE /api/users/admin/:id` - 删除指定普通用户
- `PATCH /api/users/admin/:id/status` - 更新普通用户状态（启用/禁用）

#### 超级管理员路由 (仅需要 super_admin 权限)
> ✅ **权限**: 超级管理员可以管理所有用户，包括其他管理员

- `GET /api/users/superadmin/list` - 获取所有用户列表
- `GET /api/users/superadmin/:id` - 获取任意用户信息
- `PUT /api/users/superadmin/:id` - 更新任意用户信息  
- `DELETE /api/users/superadmin/:id` - 删除任意用户
- `PATCH /api/users/superadmin/:id/status` - 更新任意用户状态

## 📝 API 使用示例

### 用户注册
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "username",
    "password": "Password123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### 用户登录
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Password123"
  }'
```

### 管理员查看用户列表
```bash
curl -X GET "http://localhost:3000/api/users/admin/list?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

### 超级管理员查看所有用户
```bash
curl -X GET "http://localhost:3000/api/users/superadmin/list" \
  -H "Authorization: Bearer YOUR_SUPERADMIN_JWT_TOKEN"
```

## 🔧 环境变量

| 变量名 | 说明 | 默认值 |
| --- | --- | --- |
| `PORT` | 服务端口 | `3000` |
| `NODE_ENV` | 运行环境 | `development` |
| `DATABASE_URL` | PostgreSQL 连接字符串 | - |
| `JWT_SECRET` | JWT 签名密钥 | - |
| `JWT_EXPIRES_IN` | JWT 访问令牌有效期 | `1h` |
| `JWT_REFRESH_EXPIRES_IN` | JWT 刷新令牌有效期 | `7d` |
| `BCRYPT_ROUNDS` | 密码哈希轮数 | `12` |

## 🛡️ 安全特性

- **密码安全**: 使用 bcryptjs 进行密码哈希（12 轮）
- **JWT 安全**: 使用 jose 库，支持访问令牌和刷新令牌
- **权限隔离**: 严格的角色权限控制，防止越权访问
- **CORS 保护**: 配置 CORS 中间件
- **请求日志**: 完整的请求和响应日志记录
- **错误处理**: 统一的错误响应格式，不泄露敏感信息

## 🧪 开发

服务已成功启动并运行在 http://localhost:3000

### 项目结构
```
src/
├── app.ts                 # 应用主文件
├── index.ts              # 服务入口
├── config/               # 配置文件
├── controllers/          # 控制器层
├── services/            # 服务层
├── repositories/        # 数据访问层
├── middleware/          # 中间件
├── routes/              # 路由定义
├── types/               # 类型定义
├── utils/               # 工具函数
└── drizzle/            # 数据库相关
    ├── schema.ts        # 数据库模式
    └── migrations/      # 迁移文件
```

## 📊 数据库设计

### 用户表 (users)
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,                    -- CUID2 ID
  email VARCHAR(255) UNIQUE NOT NULL,     -- 邮箱
  username VARCHAR(100) UNIQUE NOT NULL,  -- 用户名
  password TEXT NOT NULL,                 -- 密码哈希
  first_name VARCHAR(100),                -- 名
  last_name VARCHAR(100),                 -- 姓
  avatar TEXT,                           -- 头像URL
  role user_role DEFAULT 'user' NOT NULL, -- 角色
  is_active BOOLEAN DEFAULT true NOT NULL, -- 是否激活
  is_email_verified BOOLEAN DEFAULT false NOT NULL, -- 邮箱验证
  last_login_at TIMESTAMP,               -- 最后登录时间
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMP                   -- 软删除
);
```

### 刷新令牌表 (refresh_tokens)
```sql
CREATE TABLE refresh_tokens (
  id TEXT PRIMARY KEY,                   -- CUID2 ID
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,            -- 刷新令牌
  expires_at TIMESTAMP NOT NULL,         -- 过期时间
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  revoked_at TIMESTAMP                   -- 撤销时间
);
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！
