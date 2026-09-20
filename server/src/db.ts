import Database from 'better-sqlite3'
import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { config } from './config.js'

const dbPath = resolve(config.databasePath)
mkdirSync(dirname(dbPath), { recursive: true })

export const db = new Database(dbPath)
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    username      TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS interview_entries (
    id               TEXT PRIMARY KEY,
    owner_id         INTEGER REFERENCES users(id) ON DELETE CASCADE,
    company          TEXT NOT NULL,
    stage            TEXT NOT NULL,
    sub_status       TEXT,
    appointment_date TEXT,
    note             TEXT,
    updated_at       TEXT NOT NULL,
    website          TEXT,
    markdown         TEXT NOT NULL,
    created_at       TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_entries_owner ON interview_entries(owner_id);
`)

// 旧库补列（幂等）
function ensureColumn(column: string, type: string): void {
  const cols = db
    .prepare('PRAGMA table_info(interview_entries)')
    .all() as Array<{ name: string }>
  if (!cols.some((c) => c.name === column)) {
    db.exec(`ALTER TABLE interview_entries ADD COLUMN ${column} ${type}`)
  }
}
ensureColumn('sub_status', 'TEXT')
ensureColumn('appointment_date', 'TEXT')

// 旧状态值 → 新状态 + 子状态（幂等：迁移后旧值不再存在）
function migrateLegacyStages(): void {
  const map: Array<[string[], string, string | null]> = [
    [['not_applied'], 'applied', null],
    [['scheduled'], 'tech_interview', 'scheduled'],
    [['round1', 'round2', 'round3'], 'tech_interview', 'completed_next'],
    [['hr'], 'hr_interview', 'completed_all'],
    [['reject'], 'terminated', null],
  ]
  const upd = db.prepare(
    'UPDATE interview_entries SET stage = ?, sub_status = ? WHERE stage = ?',
  )
  const tx = db.transaction(() => {
    for (const [froms, to, sub] of map) {
      for (const old of froms) upd.run(to, sub, old)
    }
  })
  tx()
}
migrateLegacyStages()

// 公共案例数据（owner_id = NULL），未登录也可查看；仅首次（空库）时插入
const PUBLIC_SEED = [
  {
    id: 'demo-bytedance',
    company: '字节跳动',
    stage: 'offer',
    subStatus: null as string | null,
    appointmentDate: null as string | null,
    note: '等 HR 谈薪，base 杭州',
    updatedAt: '2026-09-05',
    website: 'https://www.bytedance.com',
    markdown:
      '## 面筋总结\n\n### 一面（技术）\n- 手写 Promise.all，考察并发控制\n- 问 React 渲染原理、Fiber 调度\n\n### 二面（主管）\n- 项目深挖：最难的一个 bug 怎么定位的\n- 系统设计：短链服务\n\n### 三面（交叉）\n- 算法：链表反转 + 最长回文子串\n\n> 整体感受：面试官很 nice，流程快，一周内走完三轮。',
  },
  {
    id: 'demo-tencent',
    company: '腾讯',
    stage: 'tech_interview',
    subStatus: 'completed_next',
    appointmentDate: null,
    note: '技术二面刚过，等下一轮',
    updatedAt: '2026-09-03',
    website: 'https://www.tencent.com',
    markdown:
      '## 面筋总结\n\n### 一面（技术）\n- 前端安全：XSS / CSRF 原理与防御\n- HTTP 缓存策略、强缓存 vs 协商缓存\n\n### 二面（主管）\n- 追问性能优化：首屏从 3s 优化到 1s 的完整路径\n- 代码题：实现一个带并发限制的请求调度器\n\n## 复盘\n- 缓存那题答得一般，需要补 RFC 7234。',
  },
  {
    id: 'demo-alibaba',
    company: '阿里巴巴',
    stage: 'applied',
    subStatus: null,
    appointmentDate: null,
    note: '刚投递，等初筛',
    updatedAt: '2026-08-28',
    website: 'https://www.alibabagroup.com',
    markdown:
      '## 准备中\n\n已投递岗位：前端工程师（P6）。\n\n### 复习清单\n- [x] JS 基础 / 原型链 / 事件循环\n- [x] React / Hooks / 状态管理\n- [ ] 打包工具 webpack / vite 原理\n- [ ] 手写题专项\n\n> 持续更新中……',
  },
] as const

export function seedPublicEntries(): void {
  const row = db
    .prepare('SELECT COUNT(*) AS c FROM interview_entries')
    .get() as { c: number }
  if (row.c > 0) return

  const insert = db.prepare(`
    INSERT INTO interview_entries
      (id, owner_id, company, stage, sub_status, appointment_date, note, updated_at, website, markdown, created_at)
    VALUES (?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  const now = new Date().toISOString()
  const tx = db.transaction(() => {
    for (const e of PUBLIC_SEED) {
      insert.run(
        e.id,
        e.company,
        e.stage,
        e.subStatus,
        e.appointmentDate,
        e.note ?? null,
        e.updatedAt,
        e.website ?? null,
        e.markdown,
        now,
      )
    }
  })
  tx()
}
