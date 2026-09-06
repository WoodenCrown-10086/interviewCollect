import { Router } from 'express'
import { db } from '../db.js'
import { requireAuth, optionalAuth } from '../middleware.js'
import { validateEntry } from '../validate.js'

const router = Router()

interface EntryRow {
  id: string
  owner_id: number | null
  company: string
  stage: string
  note: string | null
  updated_at: string
  website: string | null
  markdown: string
  created_at: string
}

function toEntry(row: EntryRow) {
  return {
    id: row.id,
    company: row.company,
    stage: row.stage,
    note: row.note ?? undefined,
    updatedAt: row.updated_at,
    website: row.website ?? undefined,
    markdown: row.markdown,
    createdAt: row.created_at,
    ownerId: row.owner_id === null ? undefined : String(row.owner_id),
  }
}

// 列表：未登录只返回公共案例；登录只返回自己的
router.get('/', optionalAuth, (req, res) => {
  let rows: EntryRow[]
  if (req.userId != null) {
    rows = db
      .prepare(
        `SELECT * FROM interview_entries
         WHERE owner_id = ?
         ORDER BY updated_at DESC, created_at DESC`,
      )
      .all(req.userId) as EntryRow[]
  } else {
    rows = db
      .prepare(
        `SELECT * FROM interview_entries
         WHERE owner_id IS NULL
         ORDER BY updated_at DESC, created_at DESC`,
      )
      .all() as EntryRow[]
  }
  res.json(rows.map(toEntry))
})

// 详情：需登录（防分享链接直达）；私有数据仅 owner 可读
router.get('/:id', requireAuth, (req, res) => {
  const row = db
    .prepare('SELECT * FROM interview_entries WHERE id = ?')
    .get(req.params.id) as EntryRow | undefined
  if (!row) {
    res.status(404).json({ error: '记录不存在' })
    return
  }
  if (row.owner_id !== null && row.owner_id !== req.userId) {
    res.status(403).json({ error: '无权访问' })
    return
  }
  res.json(toEntry(row))
})

// 创建 / 编辑统一 upsert（需登录）
router.put('/:id', requireAuth, (req, res) => {
  const v = validateEntry(req.body)
  if (!v.ok) {
    res.status(400).json({ error: v.error })
    return
  }
  const id = req.params.id
  if (!id || id.length > 64) {
    res.status(400).json({ error: 'id 不合法' })
    return
  }

  const existing = db
    .prepare('SELECT owner_id FROM interview_entries WHERE id = ?')
    .get(id) as { owner_id: number | null } | undefined
  if (existing && existing.owner_id !== req.userId) {
    res.status(403).json({ error: '无权操作' })
    return
  }

  const data = v.data
  if (existing) {
    db.prepare(
      `UPDATE interview_entries
       SET company = ?, stage = ?, note = ?, updated_at = ?, website = ?, markdown = ?
       WHERE id = ?`,
    ).run(
      data.company,
      data.stage,
      data.note ?? null,
      data.updatedAt,
      data.website ?? null,
      data.markdown,
      id,
    )
  } else {
    const now = new Date().toISOString()
    db.prepare(
      `INSERT INTO interview_entries
        (id, owner_id, company, stage, note, updated_at, website, markdown, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      id,
      req.userId,
      data.company,
      data.stage,
      data.note ?? null,
      data.updatedAt,
      data.website ?? null,
      data.markdown,
      now,
    )
  }

  const row = db
    .prepare('SELECT * FROM interview_entries WHERE id = ?')
    .get(id) as EntryRow
  res.json(toEntry(row))
})

// 清空自己的全部数据（需登录）
router.delete('/', requireAuth, (req, res) => {
  db.prepare('DELETE FROM interview_entries WHERE owner_id = ?').run(req.userId)
  res.json({ ok: true })
})

// 删除（需登录，且仅 owner）
router.delete('/:id', requireAuth, (req, res) => {
  const row = db
    .prepare('SELECT owner_id FROM interview_entries WHERE id = ?')
    .get(req.params.id) as { owner_id: number | null } | undefined
  if (!row) {
    res.status(404).json({ error: '记录不存在' })
    return
  }
  if (row.owner_id !== req.userId) {
    res.status(403).json({ error: '无权操作' })
    return
  }
  db.prepare('DELETE FROM interview_entries WHERE id = ?').run(req.params.id)
  res.json({ ok: true })
})

export default router
