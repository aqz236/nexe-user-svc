import { UserRepository } from '../repositories/user.repository.js';
import type {
  CreateUserRequest,
  UpdateUserRequest,
  UserListQuery,
  UserListResponse,
  UserProfile,
  UserRole,
} from '../types/user.types.js';
import { hashPassword } from '../utils/hash.util.js';

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  /**
   * 创建新用户
   */
  async createUser(userData: CreateUserRequest): Promise<UserProfile> {
    // 检查邮箱是否已存在
    const existingEmailUser = await this.userRepository.findByEmail(
      userData.email,
    );
    if (existingEmailUser) {
      throw new Error('Email already exists');
    }

    // 检查用户名是否已存在
    const existingUsernameUser = await this.userRepository.findByUsername(
      userData.username,
    );
    if (existingUsernameUser) {
      throw new Error('Username already exists');
    }

    // 哈希密码
    const hashedPassword = await hashPassword(userData.password);

    // 创建用户
    const user = await this.userRepository.create({
      ...userData,
      password: hashedPassword,
    });

    return this.toUserProfile(user);
  }

  /**
   * 根据 ID 获取用户
   */
  async getUserById(id: string): Promise<UserProfile | null> {
    const user = await this.userRepository.findById(id);
    return user ? this.toUserProfile(user) : null;
  }

  /**
   * 根据邮箱获取用户
   */
  async getUserByEmail(email: string): Promise<UserProfile | null> {
    const user = await this.userRepository.findByEmail(email);
    return user ? this.toUserProfile(user) : null;
  }

  /**
   * 更新用户信息
   */
  async updateUser(
    id: string,
    userData: UpdateUserRequest,
  ): Promise<UserProfile | null> {
    // 如果更新用户名，检查是否已存在
    if (userData.username) {
      const existingUser = await this.userRepository.findByUsername(
        userData.username,
      );
      if (existingUser && existingUser.id !== id) {
        throw new Error('Username already exists');
      }
    }

    const user = await this.userRepository.update(id, userData);
    return user ? this.toUserProfile(user) : null;
  }

  /**
   * 删除用户（软删除）
   */
  async deleteUser(id: string): Promise<boolean> {
    return this.userRepository.softDelete(id);
  }

  /**
   * 获取用户列表
   */
  async getUserList(query: UserListQuery): Promise<UserListResponse> {
    const result = await this.userRepository.findMany(query);

    return {
      users: result.users.map(user => this.toUserProfile(user)),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  /**
   * 更新用户状态
   */
  async updateUserStatus(
    id: string,
    isActive: boolean,
  ): Promise<UserProfile | null> {
    const user = await this.userRepository.update(id, { isActive });
    return user ? this.toUserProfile(user) : null;
  }

  /**
   * 验证邮箱
   */
  async verifyEmail(id: string): Promise<UserProfile | null> {
    const user = await this.userRepository.update(id, {
      isEmailVerified: true,
    });
    return user ? this.toUserProfile(user) : null;
  }

  /**
   * 更新最后登录时间
   */
  async updateLastLogin(id: string): Promise<void> {
    await this.userRepository.updateLastLogin(id);
  }

  /**
   * 将数据库用户对象转换为用户配置文件
   */
  private toUserProfile(user: {
    id: string;
    email: string;
    username: string;
    firstName: string | null;
    lastName: string | null;
    avatar: string | null;
    role: 'user' | 'admin' | 'super_admin';
    isActive: boolean;
    isEmailVerified: boolean;
    lastLoginAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }): UserProfile {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
      avatar: user.avatar || undefined,
      role: user.role as UserRole,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      lastLoginAt: user.lastLoginAt || undefined,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
