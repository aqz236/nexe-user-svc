import { type Static, Type } from '@sinclair/typebox';

/**
 * 认证相关的请求 DTO
 * 包含验证规则和类型定义
 */

export const LoginRequestSchema = Type.Object({
  email: Type.String({
    pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
    description: 'Please enter a valid email address',
  }),
  password: Type.String({
    minLength: 6,
    description: 'Password must be at least 6 characters long',
  }),
});

export const RegisterRequestSchema = Type.Object({
  email: Type.String({
    pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
    description: 'Please enter a valid email address',
  }),
  username: Type.String({
    minLength: 3,
    maxLength: 50,
    pattern: '^[a-zA-Z0-9_-]+$',
    title: 'Username',
    description: 'Username with 3-50 characters (letters, numbers, _, -)',
  }),
  password: Type.String({
    minLength: 6,
    title: 'Password',
    description: 'Password with at least 6 characters',
  }),
  firstName: Type.Optional(
    Type.String({
      maxLength: 100,
      title: 'First Name',
      description: 'First name (optional)',
    }),
  ),
  lastName: Type.Optional(
    Type.String({
      maxLength: 100,
      title: 'Last Name',
      description: 'Last name (optional)',
    }),
  ),
});

export const RefreshTokenRequestSchema = Type.Object({
  refreshToken: Type.String(),
});

export const ChangePasswordRequestSchema = Type.Object({
  currentPassword: Type.String(),
  newPassword: Type.String({ minLength: 6 }),
});

// 类型推断
export type LoginRequestDto = Static<typeof LoginRequestSchema>;
export type RegisterRequestDto = Static<typeof RegisterRequestSchema>;
export type RefreshTokenRequestDto = Static<typeof RefreshTokenRequestSchema>;
export type ChangePasswordRequestDto = Static<typeof ChangePasswordRequestSchema>;
