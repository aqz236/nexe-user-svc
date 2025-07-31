/**
 * 统一导出所有验证模式
 *
 * 这个文件作为验证模式的入口点，方便其他模块导入
 */

// 认证相关
export {
  LoginSchema,
  RegisterSchema,
  RefreshTokenSchema,
  ChangePasswordSchema,
} from './auth.schemas.js';

// 用户相关
export {
  UpdateUserSchema,
  UserStatusSchema,
  UserIdParamSchema,
} from './user.schemas.js';

// 查询相关
export {
  UserListQuerySchema,
  PaginationQuerySchema,
  SearchQuerySchema,
} from './query.schemas.js';
