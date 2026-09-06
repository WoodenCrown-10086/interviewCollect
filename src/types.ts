export type InterviewStage =
  | 'not_applied' // 未投递
  | 'applied' // 已投递
  | 'scheduled' // 已约面
  | 'round1' // 一面过
  | 'round2' // 二面过
  | 'round3' // 三面过
  | 'hr' // HR面过
  | 'offer' // Offer
  | 'reject' // 已挂

export interface InterviewEntry {
  id: string
  company: string
  stage: InterviewStage
  note?: string
  updatedAt: string // ISO 8601
  website?: string
  markdown: string
  createdAt: string
  ownerId?: string // 预留：后续接入登录鉴权后的多用户隔离
}

export const STAGE_ORDER: InterviewStage[] = [
  'not_applied',
  'applied',
  'scheduled',
  'round1',
  'round2',
  'round3',
  'hr',
  'offer',
  'reject',
]

export const STAGE_LABELS: Record<InterviewStage, string> = {
  not_applied: '未投递',
  applied: '已投递',
  scheduled: '已约面',
  round1: '一面过',
  round2: '二面过',
  round3: '三面过',
  hr: 'HR面过',
  offer: 'Offer',
  reject: '已挂',
}
