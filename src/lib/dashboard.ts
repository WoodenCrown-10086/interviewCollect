import type { InterviewEntry, InterviewStage } from '../types'
import { INTERVIEW_STAGES, STAGE_LABELS, STAGE_ORDER } from '../types'

const DAY = 24 * 60 * 60 * 1000

function startOfDay(d: Date): Date {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function ymd(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function withinDays(entry: InterviewEntry, days: number): boolean {
  const t = startOfDay(new Date(entry.updatedAt)).getTime()
  const from = startOfDay(new Date()).getTime() - (days - 1) * DAY
  return t >= from
}

export interface RecentCounts {
  applied: number
  assessment: number
  written: number
  interview: number
  scheduled: number
}

/** 近 N 天的关键指标 */
export function recentCounts(
  entries: InterviewEntry[],
  days = 7,
): RecentCounts {
  const recent = entries.filter((e) => withinDays(e, days))
  return {
    applied: recent.filter((e) => e.stage === 'applied').length,
    assessment: recent.filter((e) => e.stage === 'assessment').length,
    written: recent.filter((e) => e.stage === 'written_test').length,
    interview: recent.filter((e) => INTERVIEW_STAGES.includes(e.stage)).length,
    scheduled: recent.filter((e) => e.subStatus === 'scheduled').length,
  }
}

export interface StageSlice {
  stage: InterviewStage
  label: string
  count: number
}

/** 各主状态数量分布 */
export function stageDistribution(entries: InterviewEntry[]): StageSlice[] {
  return STAGE_ORDER.map((stage) => ({
    stage,
    label: STAGE_LABELS[stage],
    count: entries.filter((e) => e.stage === stage).length,
  })).filter((s) => s.count > 0)
}

export interface TrendPoint {
  date: string
  label: string
  count: number
}

/** 趋势：按 updatedAt 分日统计，range = 天数 或 'all' */
export function trendSeries(
  entries: InterviewEntry[],
  range: number | 'all',
): TrendPoint[] {
  const today = startOfDay(new Date())

  let days: number
  if (range === 'all') {
    const times = entries.map((e) => startOfDay(new Date(e.updatedAt)).getTime())
    const earliest = times.length ? Math.min(...times) : today.getTime()
    days = Math.max(1, Math.round((today.getTime() - earliest) / DAY) + 1)
    days = Math.min(days, 180) // 上限，避免点过多
  } else {
    days = range
  }

  const countByDate = new Map<string, number>()
  for (const e of entries) {
    const key = ymd(startOfDay(new Date(e.updatedAt)))
    countByDate.set(key, (countByDate.get(key) ?? 0) + 1)
  }

  const points: TrendPoint[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = ymd(d)
    points.push({
      date: key,
      label: `${String(d.getMonth() + 1).padStart(2, '0')}-${String(
        d.getDate(),
      ).padStart(2, '0')}`,
      count: countByDate.get(key) ?? 0,
    })
  }
  return points
}

export interface FunnelStep {
  label: string
  count: number
}

/** 转化漏斗：投递 → 测评/笔试 → 面试 → offer */
export function funnelSteps(entries: InterviewEntry[]): FunnelStep[] {
  const count = (fn: (e: InterviewEntry) => boolean) =>
    entries.filter(fn).length
  return [
    { label: '投递', count: count((e) => e.stage === 'applied') },
    {
      label: '测评/笔试',
      count: count((e) => e.stage === 'assessment' || e.stage === 'written_test'),
    },
    { label: '面试', count: count((e) => INTERVIEW_STAGES.includes(e.stage)) },
    { label: 'offer', count: count((e) => e.stage === 'offer') },
  ]
}

/** 图表统一配色（天蓝主 / 亮黄辅 / 明红点缀 / 中性） */
export const CHART_COLORS = [
  '#0ea5e9',
  '#0284c7',
  '#facc15',
  '#38bdf8',
  '#ef4444',
  '#7dd3fc',
  '#64748b',
  '#94a3b8',
]
