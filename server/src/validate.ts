export const STAGES = [
  'not_applied',
  'applied',
  'scheduled',
  'round1',
  'round2',
  'round3',
  'hr',
  'offer',
  'reject',
] as const

export type Stage = (typeof STAGES)[number]

export function validateUsername(u: unknown): string | null {
  if (typeof u !== 'string') return '用户名格式不正确'
  if (!/^[a-zA-Z0-9_]{3,30}$/.test(u)) {
    return '用户名需为 3-30 位字母、数字或下划线'
  }
  return null
}

export function validatePassword(p: unknown): string | null {
  if (typeof p !== 'string' || p.length < 6) return '密码至少 6 位'
  if (p.length > 100) return '密码过长'
  return null
}

export interface EntryInput {
  company: string
  stage: Stage
  note?: string
  updatedAt: string
  website?: string
  markdown: string
}

export function validateEntry(
  body: unknown,
): { ok: true; data: EntryInput } | { ok: false; error: string } {
  if (!body || typeof body !== 'object') {
    return { ok: false, error: '请求体格式不正确' }
  }
  const b = body as Record<string, unknown>

  const company = b.company
  if (typeof company !== 'string' || company.trim().length === 0) {
    return { ok: false, error: '公司名不能为空' }
  }
  if (company.trim().length > 100) return { ok: false, error: '公司名过长' }

  const stage = b.stage
  if (typeof stage !== 'string' || !STAGES.includes(stage as Stage)) {
    return { ok: false, error: '面试进度不合法' }
  }

  const updatedAt = b.updatedAt
  if (typeof updatedAt !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(updatedAt)) {
    return { ok: false, error: '日期格式不正确' }
  }

  const markdown = b.markdown
  if (markdown != null && typeof markdown !== 'string') {
    return { ok: false, error: '面筋格式不正确' }
  }
  if (typeof markdown === 'string' && markdown.length > 200000) {
    return { ok: false, error: '面筋内容过长' }
  }

  const note = b.note
  if (note != null && (typeof note !== 'string' || note.length > 500)) {
    return { ok: false, error: '备注过长' }
  }

  const website = b.website
  if (
    website != null &&
    website !== '' &&
    (typeof website !== 'string' || website.length > 300)
  ) {
    return { ok: false, error: '官网链接过长' }
  }

  return {
    ok: true,
    data: {
      company: company.trim(),
      stage: stage as Stage,
      note: typeof note === 'string' && note ? note : undefined,
      updatedAt,
      website: typeof website === 'string' && website ? website : undefined,
      markdown: typeof markdown === 'string' ? markdown : '',
    },
  }
}
