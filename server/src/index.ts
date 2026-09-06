import express from 'express'
import type { NextFunction, Request, Response } from 'express'
import cookieParser from 'cookie-parser'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { config } from './config.js'
import { seedPublicEntries } from './db.js'
import authRoutes from './routes/auth.js'
import entryRoutes from './routes/entries.js'

seedPublicEntries()

const app = express()
app.use(express.json({ limit: '1mb' }))
app.use(cookieParser())

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})
app.use('/api/auth', authRoutes)
app.use('/api/entries', entryRoutes)

// 生产环境：托管前端构建产物 + SPA 回退
if (config.isProduction) {
  const __dirname = path.dirname(fileURLToPath(import.meta.url))
  const distDir = path.resolve(__dirname, '../../dist')
  app.use(express.static(distDir))
  app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api')) return next()
    res.sendFile(path.join(distDir, 'index.html'))
  })
}

// 未知 API 404
app.use('/api', (_req, res) => {
  res.status(404).json({ error: '接口不存在' })
})

// 统一错误处理
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err)
  res.status(500).json({ error: '服务器内部错误' })
})

app.listen(config.port, () => {
  console.log(`Interview Collect API listening on :${config.port}`)
})
