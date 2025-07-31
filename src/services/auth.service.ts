import { UserRepository } from '../repositories/user.repository.js';
import type {
  ChangePasswordRequest,
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  RegisterRequest,
} from '../types/auth.types.js';
import { hashPassword, verifyPassword } from '../utils/hash.util.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
} from '../utils/jwt.util.js';
import { UserService } from './user.service.js';

export class AuthService {
  private userRepository: UserRepository;
  private userService: UserService;

  constructor() {
    this.userRepository = new UserRepository();
    this.userService = new UserService();
  }

  /**
   * 用户注册
   */
  async register(registerData: RegisterRequest): Promise<LoginResponse> {
    // 创建用户
    const user = await this.userService.createUser(registerData);

    // 生成令牌
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = await generateAccessToken(tokenPayload);
    const refreshToken = await generateRefreshToken(tokenPayload);

    // 保存刷新令牌
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 天后过期

    await this.userRepository.createRefreshToken({
      userId: user.id,
      token: refreshToken,
      expiresAt,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
      accessToken,
      refreshToken,
    };
  }

  /**
   * 用户登录
   */
  async login(loginData: LoginRequest): Promise<LoginResponse> {
    // 查找用户
    const user = await this.userRepository.findByEmail(loginData.email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // 检查用户是否激活
    if (!user.isActive) {
      throw new Error('Account is inactive');
    }

    // 验证密码
    const isPasswordValid = await verifyPassword(
      loginData.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // 生成令牌
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = await generateAccessToken(tokenPayload);
    const refreshToken = await generateRefreshToken(tokenPayload);

    // 保存刷新令牌
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 天后过期

    await this.userRepository.createRefreshToken({
      userId: user.id,
      token: refreshToken,
      expiresAt,
    });

    // 更新最后登录时间
    await this.userService.updateLastLogin(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        avatar: user.avatar || undefined,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
      accessToken,
      refreshToken,
    };
  }

  /**
   * 刷新访问令牌
   */
  async refreshAccessToken(
    refreshData: RefreshTokenRequest,
  ): Promise<RefreshTokenResponse> {
    // 验证刷新令牌
    let payload;
    try {
      payload = await verifyToken(refreshData.refreshToken);
    } catch {
      throw new Error('Invalid refresh token');
    }

    // 检查刷新令牌是否存在且未撤销
    const refreshToken = await this.userRepository.findRefreshToken(
      refreshData.refreshToken,
    );
    if (!refreshToken) {
      throw new Error('Refresh token not found or revoked');
    }

    // 检查是否过期
    if (refreshToken.expiresAt < new Date()) {
      await this.userRepository.revokeRefreshToken(refreshData.refreshToken);
      throw new Error('Refresh token expired');
    }

    // 获取用户信息
    const user = await this.userRepository.findById(payload.userId);
    if (!user || !user.isActive) {
      throw new Error('User not found or inactive');
    }

    // 生成新的令牌
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const newAccessToken = await generateAccessToken(tokenPayload);
    const newRefreshToken = await generateRefreshToken(tokenPayload);

    // 撤销旧的刷新令牌
    await this.userRepository.revokeRefreshToken(refreshData.refreshToken);

    // 保存新的刷新令牌
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 天后过期

    await this.userRepository.createRefreshToken({
      userId: user.id,
      token: newRefreshToken,
      expiresAt,
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  /**
   * 用户登出
   */
  async logout(refreshToken: string): Promise<void> {
    await this.userRepository.revokeRefreshToken(refreshToken);
  }

  /**
   * 登出所有设备
   */
  async logoutAll(userId: string): Promise<void> {
    await this.userRepository.revokeAllRefreshTokens(userId);
  }

  /**
   * 更改密码
   */
  async changePassword(
    userId: string,
    changePasswordData: ChangePasswordRequest,
  ): Promise<void> {
    // 获取用户
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // 验证当前密码
    const isCurrentPasswordValid = await verifyPassword(
      changePasswordData.currentPassword,
      user.password,
    );
    if (!isCurrentPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // 更新密码
    const hashedNewPassword = await hashPassword(
      changePasswordData.newPassword,
    );
    await this.userRepository.update(userId, { password: hashedNewPassword });

    // 撤销所有刷新令牌（强制重新登录）
    await this.userRepository.revokeAllRefreshTokens(userId);
  }

  /**
   * 验证访问令牌
   */
  async validateAccessToken(token: string): Promise<{
    userId: string;
    email: string;
    role: string;
  } | null> {
    try {
      const payload = await verifyToken(token);

      // 检查用户是否存在且激活
      const user = await this.userRepository.findById(payload.userId);
      if (!user || !user.isActive) {
        return null;
      }

      return {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
      };
    } catch {
      return null;
    }
  }
}
