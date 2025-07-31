import { Type } from '@sinclair/typebox';

/**
 * 用户管理相关的验证模式
 */

export const UpdateUserSchema = Type.Object({
  username: Type.Optional(Type.String({ minLength: 3, maxLength: 50 })),
  firstName: Type.Optional(Type.String({ maxLength: 100 })),
  lastName: Type.Optional(Type.String({ maxLength: 100 })),
  avatar: Type.Optional(Type.String()),
});

export const UserStatusSchema = Type.Object({
  isActive: Type.Boolean(),
});

export const UserIdParamSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
});
