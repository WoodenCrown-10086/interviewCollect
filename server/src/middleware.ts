import type { NextFunction, Request, Response } from 'express'
import { verifyToken } from './auth.js'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId?: number
    }
  }
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ error: '未登录' })
    return
  }
  try {
    req.userId = await verifyToken(header.slice('Bearer '.length))
    next()
  } catch {
    res.status(401).json({ error: '登录已过期，请重新登录' })
  }
}

export async function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  const header = req.headers.authorization
  if (header && header.startsWith('Bearer ')) {
    try {
      req.userId = await verifyToken(header.slice('Bearer '.length))
    } catch {
      req.userId = undefined
    }
  }
  next()
}

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}
