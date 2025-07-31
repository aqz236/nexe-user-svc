import { Type } from '@sinclair/typebox';

// 用户相关验证模式
export const UserSchema = {
  // 注册用户
  register: Type.Object({
    email: Type.String({ format: 'email', maxLength: 255 }),
    username: Type.String({ minLength: 3, maxLength: 100 }),
    password: Type.String({ minLength: 8, maxLength: 100 }),
    firstName: Type.Optional(Type.String({ maxLength: 100 })),
    lastName: Type.Optional(Type.String({ maxLength: 100 })),
  }),

  // 更新用户信息
  update: Type.Object({
    username: Type.Optional(Type.String({ minLength: 3, maxLength: 100 })),
    firstName: Type.Optional(Type.String({ maxLength: 100 })),
    lastName: Type.Optional(Type.String({ maxLength: 100 })),
    avatar: Type.Optional(Type.String({ format: 'uri' })),
  }),

  // 用户列表查询
  list: Type.Object({
    page: Type.Optional(Type.Integer({ minimum: 1, default: 1 })),
    limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 100, default: 10 })),
    search: Type.Optional(Type.String({ maxLength: 255 })),
    role: Type.Optional(Type.Union([
      Type.Literal('user'),
      Type.Literal('admin'),
      Type.Literal('super_admin'),
    ])),
    isActive: Type.Optional(Type.Boolean()),
  }),

  // 用户 ID 参数
  id: Type.Object({
    id: Type.String({ format: 'uuid' }),
  }),
};

// 认证相关验证模式
export const AuthSchema = {
  // 登录
  login: Type.Object({
    email: Type.String({ format: 'email' }),
    password: Type.String({ minLength: 1 }),
  }),

  // 刷新令牌
  refresh: Type.Object({
    refreshToken: Type.String({ minLength: 1 }),
  }),

  // 忘记密码
  forgotPassword: Type.Object({
    email: Type.String({ format: 'email' }),
  }),

  // 重置密码
  resetPassword: Type.Object({
    token: Type.String({ minLength: 1 }),
    newPassword: Type.String({ minLength: 8, maxLength: 100 }),
  }),

  // 更改密码
  changePassword: Type.Object({
    currentPassword: Type.String({ minLength: 1 }),
    newPassword: Type.String({ minLength: 8, maxLength: 100 }),
  }),
};
