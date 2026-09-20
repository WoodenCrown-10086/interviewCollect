import type { InterviewStage } from '../types'
import { STAGE_LABELS } from '../types'

const STAGE_STYLES: Record<InterviewStage, string> = {
  applied: 'bg-slate-100 text-slate-600 ring-slate-200',
  assessment: 'bg-primary-soft text-primary-strong ring-primary-soft',
  written_test: 'bg-primary-soft text-primary-strong ring-primary-soft',
  ai_interview: 'bg-primary text-white ring-primary',
  tech_interview: 'bg-primary text-white ring-primary',
  hr_interview: 'bg-primary text-white ring-primary',
  offer: 'bg-accent text-yellow-900 ring-accent',
  terminated: 'bg-alert-soft text-alert ring-alert-soft',
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
