import type { InterviewEntry } from '../types'
import { STAGE_ORDER } from '../types'

export interface InterviewRepository {
  list(): Promise<InterviewEntry[]>
  get(id: string): Promise<InterviewEntry | null>
  create(
    entry: Omit<InterviewEntry, 'id' | 'createdAt'>,
  ): Promise<InterviewEntry>
  update(
    id: string,
    patch: Partial<InterviewEntry>,
  ): Promise<InterviewEntry>
  remove(id: string): Promise<void>
  clear(): Promise<void>
}

const STORAGE_KEY = 'interviewCollect.entries.v1'

function uuid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

const VALID_STAGES: ReadonlySet<string> = new Set(STAGE_ORDER)

function isValidEntry(e: unknown): e is InterviewEntry {
  if (!e || typeof e !== 'object') return false
  const o = e as Record<string, unknown>
  return (
    typeof o.id === 'string' &&
    typeof o.company === 'string' &&
    typeof o.stage === 'string' &&
    VALID_STAGES.has(o.stage) &&
    typeof o.markdown === 'string' &&
    typeof o.updatedAt === 'string'
  )
}

export class LocalStorageRepository implements InterviewRepository {
  private read(): InterviewEntry[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return []
      const parsed: unknown = JSON.parse(raw)
      if (!Array.isArray(parsed)) return []
      return parsed.filter(isValidEntry)
    } catch {
      return []
    }
  }

  private write(entries: InterviewEntry[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
    } catch {
      // 存储不可用（隐私模式/配额满）时静默降级
    }
  }

  async list(): Promise<InterviewEntry[]> {
    return [...this.read()].sort((a, b) =>
      b.updatedAt.localeCompare(a.updatedAt),
    )
  }

  async get(id: string): Promise<InterviewEntry | null> {
    return this.read().find((e) => e.id === id) ?? null
  }

  async create(
    entry: Omit<InterviewEntry, 'id' | 'createdAt'>,
  ): Promise<InterviewEntry> {
    const full: InterviewEntry = {
      ...entry,
      id: uuid(),
      createdAt: new Date().toISOString(),
    }
    const entries = this.read()
    entries.push(full)
    this.write(entries)
    return full
  }

  async update(
    id: string,
    patch: Partial<InterviewEntry>,
  ): Promise<InterviewEntry> {
    const entries = this.read()
    const idx = entries.findIndex((e) => e.id === id)
    if (idx === -1) throw new Error(`entry not found: ${id}`)
    const next: InterviewEntry = { ...entries[idx], ...patch, id }
    entries[idx] = next
    this.write(entries)
    return next
  }

  async remove(id: string): Promise<void> {
    this.write(this.read().filter((e) => e.id !== id))
  }

  async clear(): Promise<void> {
    this.write([])
  }
}

// 单一入口；后续接入登录鉴权/后端时，替换为 HttpRepository 实现同一接口即可。
export const repo: InterviewRepository = new LocalStorageRepository()
