import type { Context } from 'hono';
import type {
  UpdateUserRequestDto,
  UserListQueryDto,
} from '../models/dto/index.js';
import { UserService } from '../services/user.service.js';
import type { UserRole } from '../types/user.types.js';
import { R } from '../utils/response.util.js';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  /**
   * 获取当前用户信息
   */
  getCurrentUser = async (c: Context) => {
    const user = c.get('user');
    const userProfile = await this.userService.getUserById(user.userId);

    if (!userProfile) {
      return R.of(c).notFound('User not found').build();
    }

    return R.of(c)
      .success('User information retrieved successfully')
      .data(userProfile)
      .build();
  };

  /**
   * 更新当前用户信息
   */
  updateCurrentUser = async (c: Context) => {
    const user = c.get('user');
    const updateData = await c.req.json<UpdateUserRequestDto>();
    const updatedUser = await this.userService.updateUser(
      user.userId,
      updateData,
    );

    if (!updatedUser) {
      return R.of(c).notFound('User not found').build();
    }

    return R.of(c)
      .success('User information updated successfully')
      .data(updatedUser)
      .build();
  };

  /**
   * 获取指定用户信息（管理员/超级管理员功能）
   */
  getUserById = async (c: Context) => {
    const { id } = c.req.param();
    const currentUser = c.get('user');

    const userProfile = await this.userService.getUserByIdWithPermission(
      id,
      currentUser.role as UserRole,
    );

    if (!userProfile) {
      return R.of(c).notFound('User not found').build();
    }

    return R.of(c)
      .success('User information retrieved successfully')
      .data(userProfile)
      .build();
  };

  /**
   * 获取用户列表（管理员/超级管理员功能）
   */
  getUserList = async (c: Context) => {
    const currentUser = c.get('user');
    const queryParams = c.req.query();

    // 转换查询参数类型
    const processedQuery: UserListQueryDto = {
      search: queryParams.search as string | undefined,
      role: queryParams.role as UserListQueryDto['role'],
      page: queryParams.page
        ? parseInt(queryParams.page as string, 10)
        : undefined,
      limit: queryParams.limit
        ? parseInt(queryParams.limit as string, 10)
        : undefined,
      isActive: queryParams.isActive
        ? (queryParams.isActive as string) === 'true'
        : undefined,
    };

    const result = await this.userService.getUserListWithPermission(
      processedQuery,
      currentUser.role as UserRole,
    );

    return R.of(c)
      .success('User list retrieved successfully')
      .data(result)
      .build();
  };

  /**
   * 更新用户信息（管理员/超级管理员功能）
   */
  updateUser = async (c: Context) => {
    const { id } = c.req.param();
    const currentUser = c.get('user');
    const updateData = await c.req.json<UpdateUserRequestDto>();

    const updatedUser = await this.userService.updateUserWithPermission(
      id,
      updateData,
      currentUser.role as UserRole,
    );

    if (!updatedUser) {
      return R.of(c).notFound('User not found').build();
    }

    return R.of(c)
      .success('User information updated successfully')
      .data(updatedUser)
      .build();
  };

  /**
   * 删除用户（管理员/超级管理员功能）
   */
  deleteUser = async (c: Context) => {
    const { id } = c.req.param();
    const currentUser = c.get('user');

    const deleted = await this.userService.deleteUserWithPermission(
      id,
      currentUser.role as UserRole,
    );

    if (!deleted) {
      return R.of(c).notFound('User not found').build();
    }

    return R.of(c).success('User deleted successfully').build();
  };

  /**
   * 更新用户状态（管理员/超级管理员功能）
   */
  updateUserStatus = async (c: Context) => {
    const { id } = c.req.param();
    const currentUser = c.get('user');
    const { isActive } = await c.req.json<{ isActive: boolean }>();

    const updatedUser = await this.userService.updateUserStatusWithPermission(
      id,
      isActive,
      currentUser.role as UserRole,
    );

    if (!updatedUser) {
      return R.of(c).notFound('User not found').build();
    }

    return R.of(c)
      .success('User status updated successfully')
      .data(updatedUser)
      .build();
  };
}
