import { Router } from 'express'
import { db } from '../db.js'
import {
  hashPassword,
  verifyPassword,
  signAccessToken,
  signRefreshToken,
  verifyToken,
  REFRESH_COOKIE,
  refreshCookieOptions,
} from '../auth.js'
import { validateUsername, validatePassword } from '../validate.js'
import { asyncHandler } from '../middleware.js'

const router = Router()

router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const body = (req.body ?? {}) as Record<string, unknown>
    const uErr = validateUsername(body.username)
    if (uErr) {
      res.status(400).json({ error: uErr })
      return
    }
    const pErr = validatePassword(body.password)
    if (pErr) {
      res.status(400).json({ error: pErr })
      return
    }

    const username = body.username as string
    const password = body.password as string

    const existing = db
      .prepare('SELECT id FROM users WHERE username = ?')
      .get(username)
    if (existing) {
      res.status(409).json({ error: '用户名已存在' })
      return
    }

    const hash = await hashPassword(password)
    const info = db
      .prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)')
      .run(username, hash)
    const userId = Number(info.lastInsertRowid)

    const accessToken = await signAccessToken(userId)
    const refreshToken = await signRefreshToken(userId)
    res.cookie(REFRESH_COOKIE, refreshToken, refreshCookieOptions())
    res.status(201).json({ accessToken, user: { id: userId, username } })
  }),
)

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const body = (req.body ?? {}) as Record<string, unknown>
    const username = typeof body.username === 'string' ? body.username : ''
    const password = typeof body.password === 'string' ? body.password : ''
    if (!username || !password) {
      res.status(400).json({ error: '用户名和密码不能为空' })
      return
    }

    const user = db
      .prepare('SELECT id, username, password_hash FROM users WHERE username = ?')
      .get(username) as
      | { id: number; username: string; password_hash: string }
      | undefined
    if (!user) {
      res.status(401).json({ error: '用户名或密码错误' })
      return
    }

    const ok = await verifyPassword(password, user.password_hash)
    if (!ok) {
      res.status(401).json({ error: '用户名或密码错误' })
      return
    }

    const accessToken = await signAccessToken(user.id)
    const refreshToken = await signRefreshToken(user.id)
    res.cookie(REFRESH_COOKIE, refreshToken, refreshCookieOptions())
    res.json({ accessToken, user: { id: user.id, username: user.username } })
  }),
)

router.post(
  '/refresh',
  asyncHandler(async (req, res) => {
    const token = (req.cookies ?? {})[REFRESH_COOKIE] as string | undefined
    if (!token) {
      res.status(401).json({ error: '未登录' })
      return
    }
    try {
      const userId = await verifyToken(token)
      const user = db
        .prepare('SELECT id, username FROM users WHERE id = ?')
        .get(userId) as { id: number; username: string } | undefined
      if (!user) {
        res.status(401).json({ error: '用户不存在' })
        return
      }
      const accessToken = await signAccessToken(userId)
      res.json({ accessToken, user })
    } catch {
      res.status(401).json({ error: '登录已过期' })
    }
  }),
)

router.post('/logout', (_req, res) => {
  res.clearCookie(REFRESH_COOKIE, { path: '/api/auth' })
  res.json({ ok: true })
})

export default router
