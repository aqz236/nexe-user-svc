import { SignJWT, decodeJwt, jwtVerify } from 'jose';
import { jwtConfig, type JwtPayload } from '../../config/jwt.js';

const secret = new TextEncoder().encode(jwtConfig.secret);

/**
 * 生成访问令牌
 */
export async function generateAccessToken(
  payload: Omit<JwtPayload, 'iat' | 'exp'>,
): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(jwtConfig.expiresIn)
    .sign(secret);
}

/**
 * 生成刷新令牌
 */
export async function generateRefreshToken(
  payload: Omit<JwtPayload, 'iat' | 'exp'>,
): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(jwtConfig.refreshExpiresIn)
    .sign(secret);
}

/**
 * 验证令牌
 */
export async function verifyToken(token: string): Promise<JwtPayload> {
  try {
    const { payload } = await jwtVerify(token, secret);

    // 验证 payload 是否包含必需的字段
    if (
      typeof payload.userId === 'string' &&
      typeof payload.email === 'string' &&
      typeof payload.role === 'string'
    ) {
      return {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
        iat: payload.iat,
        exp: payload.exp,
      };
    }

    throw new Error('Invalid token payload structure');
  } catch (error) {
    throw new Error(
      `Token verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/**
 * 解码令牌（不验证）
 */
export function decodeToken(token: string): JwtPayload | null {
  try {
    const payload = decodeJwt(token);

    // 验证 payload 是否包含必需的字段
    if (
      typeof payload.userId === 'string' &&
      typeof payload.email === 'string' &&
      typeof payload.role === 'string'
    ) {
      return {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
        iat: payload.iat,
        exp: payload.exp,
      };
    }

    return null;
  } catch {
    return null;
  }
}
