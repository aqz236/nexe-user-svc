/**
 * 请求 DTO 统一导出
 */

// 认证相关请求
export {
  ChangePasswordRequestSchema,
  LoginRequestSchema,
  RefreshTokenRequestSchema,
  RegisterRequestSchema,
  type ChangePasswordRequestDto,
  type LoginRequestDto,
  type RefreshTokenRequestDto,
  type RegisterRequestDto,
} from './auth.dto.js';

// 用户管理相关请求
export {
  CreateUserRequestSchema,
  UpdateUserRequestSchema,
  UserIdParamSchema,
  UserStatusRequestSchema,
  type CreateUserRequestDto,
  type UpdateUserRequestDto,
  type UserIdParamDto,
  type UserStatusRequestDto,
} from './user.dto.js';

// 查询相关请求
export {
  PaginationQuerySchema,
  SearchQuerySchema,
  UserListQuerySchema,
  type PaginationQueryDto,
  type SearchQueryDto,
  type UserListQueryDto,
} from './query.dto.js';
