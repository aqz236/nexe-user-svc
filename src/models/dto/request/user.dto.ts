import { type Static, Type } from '@sinclair/typebox';

/**
 * 用户管理相关的请求 DTO
 */

export const CreateUserRequestSchema = Type.Object({
  email: Type.String({
    pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
    description: 'Please enter a valid email address',
  }),
  username: Type.String({
    minLength: 3,
    maxLength: 50,
    pattern: '^[a-zA-Z0-9_-]+$',
    description: 'Username with 3-50 characters (letters, numbers, _, -)',
  }),
  password: Type.String({
    minLength: 6,
    description: 'Password with at least 6 characters',
  }),
  firstName: Type.Optional(
    Type.String({
      maxLength: 100,
      description: 'First name (optional)',
    }),
  ),
  lastName: Type.Optional(
    Type.String({
      maxLength: 100,
      description: 'Last name (optional)',
    }),
  ),
});

export const UpdateUserRequestSchema = Type.Object({
  username: Type.Optional(Type.String({ minLength: 3, maxLength: 50 })),
  firstName: Type.Optional(Type.String({ maxLength: 100 })),
  lastName: Type.Optional(Type.String({ maxLength: 100 })),
  avatar: Type.Optional(Type.String()),
});

export const UserStatusRequestSchema = Type.Object({
  isActive: Type.Boolean(),
});

export const UserIdParamSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
});

// 类型推断
export type CreateUserRequestDto = Static<typeof CreateUserRequestSchema>;
export type UpdateUserRequestDto = Static<typeof UpdateUserRequestSchema>;
export type UserStatusRequestDto = Static<typeof UserStatusRequestSchema>;
export type UserIdParamDto = Static<typeof UserIdParamSchema>;
