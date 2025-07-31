import type { Context } from 'hono';
import { R } from '../utils/response.util.js';
import { UserService } from '../services/user.service.js';
import type { UpdateUserRequest, UserListQuery } from '../types/user.types.js';
import { UserRole } from '../types/user.types.js';

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
      return R.of(c)
        .notFound('User not found')
        .build();
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
    const updateData = await c.req.json<UpdateUserRequest>();

    const updatedUser = await this.userService.updateUser(
      user.userId,
      updateData,
    );

    if (!updatedUser) {
      return R.of(c)
        .notFound('User not found')
        .build();
    }

    return R.of(c)
      .success('User information updated successfully')
      .data(updatedUser)
      .build();
  };

  /**
   * 获取指定用户信息（管理员功能 - 只能查看普通用户）
   */
  getAdminUserById = async (c: Context) => {
    const { id } = c.req.param();
    const userProfile = await this.userService.getUserById(id);

    if (!userProfile) {
      return R.of(c)
        .notFound('User not found')
        .build();
    }

    // 管理员不能查看其他管理员或超级管理员的信息
    if (userProfile.role !== UserRole.USER) {
      return R.of(c)
        .forbidden('Access denied: Cannot view admin/super admin users')
        .build();
    }

    return R.of(c)
      .success('User information retrieved successfully')
      .data(userProfile)
      .build();
  };

  /**
   * 获取指定用户信息（超级管理员功能 - 可以查看所有用户）
   */
  getSuperAdminUserById = async (c: Context) => {
    const { id } = c.req.param();
    const userProfile = await this.userService.getUserById(id);

    if (!userProfile) {
      return R.of(c)
        .notFound('User not found')
        .build();
    }

    return R.of(c)
      .success('User information retrieved successfully')
      .data(userProfile)
      .build();
  };

  /**
   * 获取用户列表（管理员功能 - 只能看到普通用户）
   */
  getAdminUserList = async (c: Context) => {
    const queryParams = c.req.query();

    // 转换查询参数类型
    const processedQuery: UserListQuery = {
      search: queryParams.search as string | undefined,
      role: UserRole.USER, // 管理员只能看到普通用户
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

    const result = await this.userService.getUserList(processedQuery);

    return R.of(c)
      .success('User list retrieved successfully')
      .data(result)
      .build();
  };

  /**
   * 获取用户列表（超级管理员功能 - 可以看到所有用户）
   */
  getSuperAdminUserList = async (c: Context) => {
    const queryParams = c.req.query();

    // 转换查询参数类型
    const processedQuery: UserListQuery = {
      search: queryParams.search as string | undefined,
      role: queryParams.role as UserListQuery['role'], // 超级管理员可以看到所有角色
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

    const result = await this.userService.getUserList(processedQuery);

    return R.of(c)
      .success('All users list retrieved successfully')
      .data(result)
      .build();
  };

  /**
   * 更新用户信息（管理员功能 - 只能更新普通用户）
   */
  updateAdminUser = async (c: Context) => {
    const { id } = c.req.param();
    const updateData = await c.req.json<UpdateUserRequest>();

    // 先检查目标用户是否存在
    const targetUser = await this.userService.getUserById(id);
    if (!targetUser) {
      return R.of(c)
        .notFound('User not found')
        .build();
    }

    // 管理员不能更新其他管理员或超级管理员
    if (targetUser.role !== UserRole.USER) {
      return R.of(c)
        .forbidden('Access denied: Cannot update admin/super admin users')
        .build();
    }

    const updatedUser = await this.userService.updateUser(id, updateData);

    return R.of(c)
      .success('User information updated successfully')
      .data(updatedUser)
      .build();
  };

  /**
   * 更新用户信息（超级管理员功能 - 可以更新所有用户）
   */
  updateSuperAdminUser = async (c: Context) => {
    const { id } = c.req.param();
    const updateData = await c.req.json<UpdateUserRequest>();

    const updatedUser = await this.userService.updateUser(id, updateData);

    if (!updatedUser) {
      return R.of(c)
        .notFound('User not found')
        .build();
    }

    return R.of(c)
      .success('User information updated successfully')
      .data(updatedUser)
      .build();
  };

  /**
   * 删除用户（管理员功能 - 只能删除普通用户）
   */
  deleteAdminUser = async (c: Context) => {
    const { id } = c.req.param();

    // 先检查目标用户是否存在
    const targetUser = await this.userService.getUserById(id);
    if (!targetUser) {
      return R.of(c)
        .notFound('User not found')
        .build();
    }

    // 管理员不能删除其他管理员或超级管理员
    if (targetUser.role !== UserRole.USER) {
      return R.of(c)
        .forbidden('Access denied: Cannot delete admin/super admin users')
        .build();
    }

    await this.userService.deleteUser(id);

    return R.of(c)
      .success('User deleted successfully')
      .build();
  };

  /**
   * 删除用户（超级管理员功能 - 可以删除所有用户）
   */
  deleteSuperAdminUser = async (c: Context) => {
    const { id } = c.req.param();
    const deleted = await this.userService.deleteUser(id);

    if (!deleted) {
      return R.of(c)
        .notFound('User not found')
        .build();
    }

    return R.of(c)
      .success('User deleted successfully')
      .build();
  };

  /**
   * 更新用户状态（管理员功能 - 只能更新普通用户状态）
   */
  updateAdminUserStatus = async (c: Context) => {
    const { id } = c.req.param();
    const { isActive } = await c.req.json<{ isActive: boolean }>();

    // 先检查目标用户是否存在
    const targetUser = await this.userService.getUserById(id);
    if (!targetUser) {
      return R.of(c)
        .notFound('User not found')
        .build();
    }

    // 管理员不能更新其他管理员或超级管理员的状态
    if (targetUser.role !== UserRole.USER) {
      return R.of(c)
        .forbidden('Access denied: Cannot update admin/super admin user status')
        .build();
    }

    const updatedUser = await this.userService.updateUserStatus(id, isActive);

    return R.of(c)
      .success('User status updated successfully')
      .data(updatedUser)
      .build();
  };

  /**
   * 更新用户状态（超级管理员功能 - 可以更新所有用户状态）
   */
  updateSuperAdminUserStatus = async (c: Context) => {
    const { id } = c.req.param();
    const { isActive } = await c.req.json<{ isActive: boolean }>();

    const updatedUser = await this.userService.updateUserStatus(id, isActive);

    if (!updatedUser) {
      return R.of(c)
        .notFound('User not found')
        .build();
    }

    return R.of(c)
      .success('User status updated successfully')
      .data(updatedUser)
      .build();
  };
}
