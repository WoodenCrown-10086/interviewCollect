export const STAGES = [
  'applied',
  'assessment',
  'written_test',
  'ai_interview',
  'tech_interview',
  'hr_interview',
  'offer',
  'terminated',
] as const

export type Stage = (typeof STAGES)[number]

export const STAGE_LABELS: Record<Stage, string> = {
  applied: '投递',
  assessment: '测评',
  written_test: '笔试',
  ai_interview: 'AI面试',
  tech_interview: '技术面试',
  hr_interview: 'HR面试',
  offer: 'offer',
  terminated: '已终止',
}

export const SUBSTATUS_LABELS: Record<string, string> = {
  not_scheduled: '未预约',
  scheduled: '已预约',
  completed: '已完成',
  completed_next: '已完成有下一轮',
  completed_all: '面试已全部完成',
}

/** 各主状态允许的子状态（空数组 = 终态，无子状态） */
export const ALLOWED_SUBSTATUS: Record<Stage, string[]> = {
  applied: [],
  assessment: ['not_scheduled', 'scheduled', 'completed'],
  written_test: ['not_scheduled', 'scheduled', 'completed'],
  ai_interview: [
    'not_scheduled',
    'scheduled',
    'completed_next',
    'completed_all',
  ],
  tech_interview: [
    'not_scheduled',
    'scheduled',
    'completed_next',
    'completed_all',
  ],
  hr_interview: [
    'not_scheduled',
    'scheduled',
    'completed_next',
    'completed_all',
  ],
  offer: [],
  terminated: [],
}

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
  subStatus?: string
  appointmentDate?: string
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
    return { ok: false, error: '主状态不合法' }
  }
  const stageTyped = stage as Stage

  // 子状态：需要时必填且合法，终态时必须为空
  const allowed = ALLOWED_SUBSTATUS[stageTyped]
  let subStatus: string | undefined
  if (allowed.length > 0) {
    const s = b.subStatus
    if (typeof s !== 'string' || !allowed.includes(s)) {
      return { ok: false, error: '子状态不合法' }
    }
    subStatus = s
  } else {
    subStatus = undefined
  }

  // 预约日期：仅子状态=已预约时可选
  let appointmentDate: string | undefined
  if (subStatus === 'scheduled') {
    const d = b.appointmentDate
    if (d != null && d !== '') {
      if (typeof d !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(d)) {
        return { ok: false, error: '预约日期格式不正确' }
      }
      appointmentDate = d
    }
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
      stage: stageTyped,
      subStatus,
      appointmentDate,
      note: typeof note === 'string' && note ? note : undefined,
      updatedAt,
      website: typeof website === 'string' && website ? website : undefined,
      markdown: typeof markdown === 'string' ? markdown : '',
    },
  }
}
