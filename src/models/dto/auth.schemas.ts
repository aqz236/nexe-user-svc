import { Type } from '@sinclair/typebox';

/**
 * 认证相关的验证模式
 * 使用简洁明了的验证规则和良好的字段命名
 */

export const LoginSchema = Type.Object({
  email: Type.String({
    format: 'email',
    errorMessage: 'Please enter a valid email address',
  }),
  password: Type.String({
    minLength: 6,
    errorMessage: 'Password must be at least 6 characters long',
  }),
});

export const RegisterSchema = Type.Object({
  email: Type.String({
    format: 'email',
    title: 'Email Address',
    description: 'A valid email address',
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
  firstName: Type.Optional(Type.String({
    maxLength: 100,
    title: 'First Name',
    description: 'First name (optional)',
  })),
  lastName: Type.Optional(Type.String({
    maxLength: 100,
    title: 'Last Name',
    description: 'Last name (optional)',
  })),
});

export const RefreshTokenSchema = Type.Object({
  refreshToken: Type.String(),
});

export const ChangePasswordSchema = Type.Object({
  currentPassword: Type.String(),
  newPassword: Type.String({ minLength: 6 }),
});
