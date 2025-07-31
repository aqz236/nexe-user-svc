import { Type } from '@sinclair/typebox';

// 认证相关模式
export const LoginSchema = Type.Object({
  email: Type.String({ format: 'email' }),
  password: Type.String({ minLength: 6 }),
});

export const RegisterSchema = Type.Object({
  email: Type.String({ format: 'email' }),
  username: Type.String({ minLength: 3, maxLength: 50 }),
  password: Type.String({ minLength: 6 }),
  firstName: Type.Optional(Type.String({ maxLength: 100 })),
  lastName: Type.Optional(Type.String({ maxLength: 100 })),
});

export const RefreshTokenSchema = Type.Object({
  refreshToken: Type.String(),
});

export const ChangePasswordSchema = Type.Object({
  currentPassword: Type.String(),
  newPassword: Type.String({ minLength: 6 }),
});

// 用户相关模式
export const UpdateUserSchema = Type.Object({
  username: Type.Optional(Type.String({ minLength: 3, maxLength: 50 })),
  firstName: Type.Optional(Type.String({ maxLength: 100 })),
  lastName: Type.Optional(Type.String({ maxLength: 100 })),
  avatar: Type.Optional(Type.String()),
});

export const UserListQuerySchema = Type.Object({
  page: Type.Optional(Type.Number({ minimum: 1 })),
  limit: Type.Optional(Type.Number({ minimum: 1, maximum: 100 })),
  search: Type.Optional(Type.String()),
  role: Type.Optional(Type.Union([
    Type.Literal('user'),
    Type.Literal('admin'),
    Type.Literal('super_admin'),
  ])),
  isActive: Type.Optional(Type.Boolean()),
});

export const UserIdParamSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
});
