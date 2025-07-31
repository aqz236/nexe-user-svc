import { Type } from '@sinclair/typebox';

/**
 * 查询参数相关的验证模式
 */

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

export const PaginationQuerySchema = Type.Object({
  page: Type.Optional(Type.Number({ minimum: 1 })),
  limit: Type.Optional(Type.Number({ minimum: 1, maximum: 100 })),
});

export const SearchQuerySchema = Type.Object({
  search: Type.Optional(Type.String()),
});
