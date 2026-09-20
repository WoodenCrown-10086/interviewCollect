import type { InterviewSubStatus } from '../types'
import { SUBSTATUS_LABELS } from '../types'

const SUB_STATUS_STYLES: Record<InterviewSubStatus, string> = {
  not_scheduled: 'bg-slate-100 text-slate-500 ring-slate-200',
  scheduled: 'bg-accent text-yellow-900 ring-accent',
  completed: 'bg-primary-soft text-primary-strong ring-primary-soft',
  completed_next: 'bg-primary text-white ring-primary',
  completed_all: 'bg-primary-strong text-white ring-primary-strong',
}

export default function SubStatusBadge({
  subStatus,
}: {
  subStatus: InterviewSubStatus
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${SUB_STATUS_STYLES[subStatus]}`}
    >
      {SUBSTATUS_LABELS[subStatus]}
    </span>
  )
}
