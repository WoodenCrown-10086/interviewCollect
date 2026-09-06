import type { InterviewStage } from '../types'
import { STAGE_LABELS } from '../types'

const STAGE_STYLES: Record<InterviewStage, string> = {
  not_applied: 'bg-slate-100 text-slate-500 ring-slate-200',
  applied: 'bg-primary-soft text-primary-strong ring-primary-soft',
  scheduled: 'bg-primary text-white ring-primary',
  round1: 'bg-primary text-white ring-primary',
  round2: 'bg-primary text-white ring-primary',
  round3: 'bg-primary text-white ring-primary',
  hr: 'bg-primary-strong text-white ring-primary-strong',
  offer: 'bg-accent text-yellow-900 ring-accent',
  reject: 'bg-alert-soft text-alert ring-alert-soft',
}

export default function StageBadge({ stage }: { stage: InterviewStage }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${STAGE_STYLES[stage]}`}
    >
      {STAGE_LABELS[stage]}
    </span>
  )
}
