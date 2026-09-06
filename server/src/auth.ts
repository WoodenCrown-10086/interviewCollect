import bcrypt from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'
import { config } from './config.js'

export async function hashPassword(pw: string): Promise<string> {
  return bcrypt.hash(pw, 10)
}

export async function verifyPassword(
  pw: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(pw, hash)
}

const secret = new TextEncoder().encode(config.jwtSecret)

export async function signAccessToken(userId: number): Promise<string> {
  return new SignJWT({ sub: String(userId) })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(secret)
}

export async function signRefreshToken(userId: number): Promise<string> {
  return new SignJWT({ sub: String(userId) })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)
}

export async function verifyToken(token: string): Promise<number> {
  const { payload } = await jwtVerify(token, secret)
  if (typeof payload.sub !== 'string') throw new Error('invalid token subject')
  return Number(payload.sub)
}

export const REFRESH_COOKIE = 'refresh'

export function refreshCookieOptions() {
  return {
    httpOnly: true,
    secure: config.cookieSecure,
    sameSite: 'lax' as const,
    path: '/api/auth',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 天
  }
}
