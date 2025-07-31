import type { Context } from 'hono';
import { AuthService } from '../services/auth.service.js';
import type {
  ChangePasswordRequestDto,
  LoginRequestDto,
  RefreshTokenRequestDto,
  RegisterRequestDto,
} from '../models/dto/index.js';
import { R } from '../utils/response.util.js';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * 用户注册
   */
  register = async (c: Context) => {
    // 数据已经通过中间件验证，可以安全获取
    const registerData = await c.req.json<RegisterRequestDto>();
    const result = await this.authService.register(registerData);

    return R.of(c).created('Registration successful').data(result).build();
  };

  /**
   * 用户登录
   */
  login = async (c: Context) => {
    // 数据已经通过中间件验证，可以安全获取
    const loginData = await c.req.json<LoginRequestDto>();
    const result = await this.authService.login(loginData);

    return R.of(c).success('Login successful').data(result).build();
  };

  /**
   * 刷新访问令牌
   */
  refreshToken = async (c: Context) => {
    // 数据已经通过中间件验证，可以安全获取
    const refreshData = await c.req.json<RefreshTokenRequestDto>();
    const result = await this.authService.refreshAccessToken(refreshData);

    return R.of(c).success('Token refreshed successfully').data(result).build();
  };

  /**
   * 用户登出
   */
  logout = async (c: Context) => {
    const { refreshToken } = await c.req.json<{ refreshToken: string }>();
    await this.authService.logout(refreshToken);

    return R.of(c).success('Logout successful').build();
  };

  /**
   * 登出所有设备
   */
  logoutAll = async (c: Context) => {
    const user = c.get('user');
    await this.authService.logoutAll(user.userId);

    return R.of(c).success('Logged out from all devices successfully').build();
  };

  /**
   * 更改密码
   */
  changePassword = async (c: Context) => {
    // 数据已经通过中间件验证，可以安全获取
    const user = c.get('user');
    const changePasswordData = await c.req.json<ChangePasswordRequestDto>();
    await this.authService.changePassword(user.userId, changePasswordData);

    return R.of(c).success('Password changed successfully').build();
  };

  /**
   * 获取当前用户信息
   */
  me = async (c: Context) => {
    const user = c.get('user');

    return R.of(c)
      .success('User information retrieved successfully')
      .data(user)
      .build();
  };
}
