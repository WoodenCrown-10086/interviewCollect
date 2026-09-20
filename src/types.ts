export type InterviewStage =
  | 'applied' // 投递
  | 'assessment' // 测评
  | 'written_test' // 笔试
  | 'ai_interview' // AI面试
  | 'tech_interview' // 技术面试
  | 'hr_interview' // HR面试
  | 'offer' // offer
  | 'terminated' // 已终止

export type InterviewSubStatus =
  | 'not_scheduled' // 未预约
  | 'scheduled' // 已预约
  | 'completed' // 已完成
  | 'completed_next' // 已完成有下一轮（面试类）
  | 'completed_all' // 面试已全部完成（面试类）

export interface InterviewEntry {
  id: string
  company: string
  stage: InterviewStage
  subStatus?: InterviewSubStatus
  appointmentDate?: string // YYYY-MM-DD，仅子状态=已预约时
  note?: string
  updatedAt: string // YYYY-MM-DD
  website?: string
  markdown: string
  createdAt: string
  ownerId?: string
}

export const STAGE_ORDER: InterviewStage[] = [
  'applied',
  'assessment',
  'written_test',
  'ai_interview',
  'tech_interview',
  'hr_interview',
  'offer',
  'terminated',
]

export const STAGE_LABELS: Record<InterviewStage, string> = {
  applied: '投递',
  assessment: '测评',
  written_test: '笔试',
  ai_interview: 'AI面试',
  tech_interview: '技术面试',
  hr_interview: 'HR面试',
  offer: 'offer',
  terminated: '已终止',
}

/** 面试类主状态 */
export const INTERVIEW_STAGES: InterviewStage[] = [
  'ai_interview',
  'tech_interview',
  'hr_interview',
]

export const SUBSTATUS_ORDER: InterviewSubStatus[] = [
  'not_scheduled',
  'scheduled',
  'completed',
  'completed_next',
  'completed_all',
]

export const SUBSTATUS_LABELS: Record<InterviewSubStatus, string> = {
  not_scheduled: '未预约',
  scheduled: '已预约',
  completed: '已完成',
  completed_next: '已完成有下一轮',
  completed_all: '面试已全部完成',
}

/** 各主状态允许的子状态（空数组 = 终态，无子状态） */
export const ALLOWED_SUBSTATUS: Record<InterviewStage, InterviewSubStatus[]> = {
  applied: [],
  assessment: ['not_scheduled', 'scheduled', 'completed'],
  written_test: ['not_scheduled', 'scheduled', 'completed'],
  ai_interview: ['not_scheduled', 'scheduled', 'completed_next', 'completed_all'],
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

export function stageHasSubStatus(stage: InterviewStage): boolean {
  return ALLOWED_SUBSTATUS[stage].length > 0
}
