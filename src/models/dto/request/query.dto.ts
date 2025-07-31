import { type Static, Type } from '@sinclair/typebox';

/**
 * 查询参数相关的请求 DTO
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

// 类型推断
export type UserListQueryDto = Static<typeof UserListQuerySchema>;
export type PaginationQueryDto = Static<typeof PaginationQuerySchema>;
export type SearchQueryDto = Static<typeof SearchQuerySchema>;
