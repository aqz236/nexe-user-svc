# 权限管理系统详细说明

## 概述

nexe-user-svc 实现了基于角色的权限控制系统（RBAC），支持三级用户权限：普通用户、管理员、超级管理员。

## 权限级别详解

### 1. 普通用户 (user)

**权限范围**: 仅限个人账户管理

**可执行操作**:
- ✅ 查看个人信息 (`GET /api/users/me`)
- ✅ 修改个人信息 (`PUT /api/users/me`)
- ✅ 修改密码 (`POST /api/auth/change-password`)
- ✅ 登录登出 (`POST /api/auth/login`, `POST /api/auth/logout`)

**限制**:
- ❌ 无法查看其他用户信息
- ❌ 无法访问管理功能
- ❌ 无法执行系统管理操作

### 2. 管理员 (admin)

**权限范围**: 普通用户管理权限（不包括其他管理员）

**继承权限**: 所有普通用户权限

**额外权限**:
- ✅ 查看普通用户列表 (`GET /api/users/admin/list`)
- ✅ 查看指定普通用户信息 (`GET /api/users/admin/:id`)
- ✅ 修改普通用户信息 (`PUT /api/users/admin/:id`)
- ✅ 删除普通用户 (`DELETE /api/users/admin/:id`)
- ✅ 启用/禁用普通用户 (`PATCH /api/users/admin/:id/status`)

**重要限制**:
- ❌ **无法查看其他管理员或超级管理员信息**
- ❌ **无法修改其他管理员或超级管理员**
- ❌ 无法访问超级管理员功能
- ❌ 无法提升用户权限

### 3. 超级管理员 (super_admin)

**权限范围**: 完整系统管理权限

**继承权限**: 所有管理员权限

**额外权限**:
- ✅ 查看所有用户列表 (`GET /api/users/superadmin/list`)
- ✅ 查看任意用户信息 (`GET /api/users/superadmin/:id`)
- ✅ 修改任意用户信息 (`PUT /api/users/superadmin/:id`)
- ✅ 删除任意用户 (`DELETE /api/users/superadmin/:id`)
- ✅ 修改任意用户状态 (`PATCH /api/users/superadmin/:id/status`)
- ✅ 管理其他管理员账户
- ✅ 执行系统级敏感操作

## 权限检查机制

### 1. JWT Token 验证

所有需要认证的接口都会验证 JWT Token：

```typescript
// Token 结构
{
  userId: string;
  email: string;
  role: 'user' | 'admin' | 'super_admin';
  iat: number;  // 签发时间
  exp: number;  // 过期时间
}
```

### 2. 中间件层级检查

```typescript
// 认证中间件 - 验证用户身份
authMiddleware -> 验证 JWT Token 有效性

// 管理员中间件 - 验证管理权限
adminMiddleware -> 验证角色是 'admin' 或 'super_admin'

// 超级管理员中间件 - 验证超级管理权限
superAdminMiddleware -> 验证角色是 'super_admin'
```

### 3. 业务层权限检查

在控制器方法中进行细粒度权限检查：

```typescript
// 管理员查看用户时的权限检查
if (targetUser.role !== UserRole.USER) {
  return R.of(c)
    .forbidden('Access denied: Cannot view admin/super admin users')
    .build();
}
```

## 权限测试示例

### 场景 1: 管理员尝试查看其他管理员

```bash
# 管理员尝试查看其他管理员信息
curl -X GET "http://localhost:3000/api/users/admin/ADMIN_USER_ID" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"

# 预期响应: 403 Forbidden
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Access denied: Cannot view admin/super admin users",
    "timestamp": "2025-07-31T02:48:03.170Z",
    "path": "/api/users/admin/ADMIN_USER_ID"
  }
}
```

### 场景 2: 超级管理员管理所有用户

```bash
# 超级管理员查看所有用户列表
curl -X GET "http://localhost:3000/api/users/superadmin/list" \
  -H "Authorization: Bearer SUPERADMIN_JWT_TOKEN"

# 预期响应: 200 OK (包含所有用户)
{
  "message": "All users list retrieved successfully",
  "data": {
    "users": [
      { "role": "user", ... },
      { "role": "admin", ... },
      { "role": "super_admin", ... }
    ]
  }
}
```

### 场景 3: 普通用户尝试访问管理功能

```bash
# 普通用户尝试访问管理员功能
curl -X GET "http://localhost:3000/api/users/admin/list" \
  -H "Authorization: Bearer USER_JWT_TOKEN"

# 预期响应: 403 Forbidden
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Insufficient permissions",
    "timestamp": "2025-07-31T02:48:03.170Z",
    "path": "/api/users/admin/list"
  }
}
```

## 安全最佳实践

### 1. 权限分离原则
- 管理员和超级管理员使用不同的 API 路由
- 每个角色有专门的控制器方法
- 避免在单一方法中处理多种权限级别

### 2. 最小权限原则
- 用户只能获得完成任务所需的最小权限
- 管理员无法越权操作其他管理员
- 明确区分操作权限和查看权限

### 3. 防御性编程
- 在每个操作前验证目标用户角色
- 提供清晰的错误消息
- 记录所有权限检查和拒绝操作

### 4. Token 安全
- 使用短期访问令牌 (1小时)
- 提供刷新令牌机制 (7天)
- 支持撤销所有设备的令牌

## 常见问题

### Q: 管理员为什么不能查看其他管理员？
A: 这是安全设计原则。管理员应该只管理普通用户，避免管理员之间的越权操作。只有超级管理员才能管理所有用户。

### Q: 如何提升用户权限？
A: 目前需要超级管理员直接在数据库中修改用户角色。未来可以添加角色管理 API。

### Q: Token 过期了怎么办？
A: 使用刷新令牌 (`POST /api/auth/refresh`) 获取新的访问令牌，或重新登录。

### Q: 如何撤销用户的所有会话？
A: 超级管理员可以禁用用户账户 (`PATCH /api/users/superadmin/:id/status`)，这会阻止该用户使用现有 Token。
