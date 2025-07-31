import { db } from '#/drizzle/db.js';
import {
  refreshTokens,
  users,
  type NewRefreshToken,
  type NewUser,
  type RefreshToken,
  type User,
} from '#/drizzle/schema.js';
import { and, count, desc, eq, isNull, like, or } from 'drizzle-orm';
import type { UserListQuery } from '../types/user.types.js';

export class UserRepository {
  /**
   * 创建新用户
   */
  async create(userData: NewUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  /**
   * 根据 ID 查找用户
   */
  async findById(id: string): Promise<User | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(and(eq(users.id, id), isNull(users.deletedAt)));

    return user || null;
  }

  /**
   * 根据邮箱查找用户
   */
  async findByEmail(email: string): Promise<User | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(and(eq(users.email, email), isNull(users.deletedAt)));

    return user || null;
  }

  /**
   * 根据用户名查找用户
   */
  async findByUsername(username: string): Promise<User | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(and(eq(users.username, username), isNull(users.deletedAt)));

    return user || null;
  }

  /**
   * 检查邮箱是否已存在
   */
  async existsByEmail(email: string, excludeId?: string): Promise<boolean> {
    const conditions = [eq(users.email, email), isNull(users.deletedAt)];
    if (excludeId) {
      conditions.push(eq(users.id, excludeId));
    }

    const [result] = await db
      .select({ count: count() })
      .from(users)
      .where(excludeId ? and(...conditions.slice(0, -1)) : and(...conditions));

    return result.count > 0;
  }

  /**
   * 检查用户名是否已存在
   */
  async existsByUsername(
    username: string,
    excludeId?: string,
  ): Promise<boolean> {
    const conditions = [eq(users.username, username), isNull(users.deletedAt)];
    if (excludeId) {
      conditions.push(eq(users.id, excludeId));
    }

    const [result] = await db
      .select({ count: count() })
      .from(users)
      .where(excludeId ? and(...conditions.slice(0, -1)) : and(...conditions));

    return result.count > 0;
  }

  /**
   * 更新用户信息
   */
  async update(id: string, userData: Partial<NewUser>): Promise<User | null> {
    const [user] = await db
      .update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(and(eq(users.id, id), isNull(users.deletedAt)))
      .returning();

    return user || null;
  }

  /**
   * 软删除用户
   */
  async softDelete(id: string): Promise<boolean> {
    const [user] = await db
      .update(users)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(users.id, id), isNull(users.deletedAt)))
      .returning();

    return !!user;
  }

  /**
   * 获取用户列表（分页）
   */
  async findMany(query: UserListQuery) {
    const { page = 1, limit = 10, search, role, isActive } = query;
    const offset = (page - 1) * limit;

    // 构建查询条件
    const conditions = [isNull(users.deletedAt)];

    if (search) {
      const searchCondition = or(
        like(users.email, `%${search}%`),
        like(users.username, `%${search}%`),
        like(users.firstName, `%${search}%`),
        like(users.lastName, `%${search}%`),
      );
      if (searchCondition) {
        conditions.push(searchCondition);
      }
    }

    if (role) {
      conditions.push(eq(users.role, role));
    }

    if (typeof isActive === 'boolean') {
      conditions.push(eq(users.isActive, isActive));
    }

    // 获取用户列表
    const userList = await db
      .select()
      .from(users)
      .where(and(...conditions))
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset);

    // 获取总数
    const [{ count: total }] = await db
      .select({ count: count() })
      .from(users)
      .where(and(...conditions));

    return {
      users: userList,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * 更新最后登录时间
   */
  async updateLastLogin(id: string): Promise<void> {
    await db
      .update(users)
      .set({ lastLoginAt: new Date(), updatedAt: new Date() })
      .where(eq(users.id, id));
  }

  // 刷新令牌相关方法

  /**
   * 创建刷新令牌
   */
  async createRefreshToken(tokenData: NewRefreshToken): Promise<RefreshToken> {
    const [token] = await db
      .insert(refreshTokens)
      .values(tokenData)
      .returning();
    return token;
  }

  /**
   * 根据令牌查找刷新令牌
   */
  async findRefreshToken(token: string): Promise<RefreshToken | null> {
    const [refreshToken] = await db
      .select()
      .from(refreshTokens)
      .where(
        and(eq(refreshTokens.token, token), isNull(refreshTokens.revokedAt)),
      );

    return refreshToken || null;
  }

  /**
   * 撤销刷新令牌
   */
  async revokeRefreshToken(token: string): Promise<boolean> {
    const [refreshToken] = await db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(eq(refreshTokens.token, token))
      .returning();

    return !!refreshToken;
  }

  /**
   * 撤销用户的所有刷新令牌
   */
  async revokeAllRefreshTokens(userId: string): Promise<void> {
    await db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(
        and(eq(refreshTokens.userId, userId), isNull(refreshTokens.revokedAt)),
      );
  }

  /**
   * 清理过期的刷新令牌
   */
  async cleanupExpiredTokens(): Promise<void> {
    const now = new Date();
    await db
      .update(refreshTokens)
      .set({ revokedAt: now })
      .where(
        and(eq(refreshTokens.expiresAt, now), isNull(refreshTokens.revokedAt)),
      );
  }
}
