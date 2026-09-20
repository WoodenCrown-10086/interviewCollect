import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import type {
  InterviewEntry,
  InterviewStage,
  InterviewSubStatus,
} from '../types'
import {
  ALLOWED_SUBSTATUS,
  STAGE_LABELS,
  STAGE_ORDER,
  SUBSTATUS_LABELS,
  stageHasSubStatus,
} from '../types'
import { todayStr, toDateInputValue } from '../lib/format'
import DatePicker from './DatePicker'

export type EntryDraft = Omit<InterviewEntry, 'id' | 'createdAt'>

interface Props {
  entry: InterviewEntry | null
  onClose: () => void
  onSave: (draft: EntryDraft) => Promise<void> | void
}

const inputCls =
  'w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none transition placeholder:text-muted/70 focus:border-primary focus:ring-2 focus:ring-primary/20'

const labelCls = 'mb-1.5 block text-[13px] font-medium text-ink'

export default function EntryForm({ entry, onClose, onSave }: Props) {
  const [company, setCompany] = useState(entry?.company ?? '')
  const [stage, setStage] = useState<InterviewStage>(entry?.stage ?? 'applied')
  const [subStatus, setSubStatus] = useState<InterviewSubStatus | ''>(
    entry?.subStatus ?? '',
  )
  const [appointmentDate, setAppointmentDate] = useState(
    entry?.appointmentDate ?? '',
  )
  const [note, setNote] = useState(entry?.note ?? '')
  const [website, setWebsite] = useState(entry?.website ?? '')
  const [markdown, setMarkdown] = useState(entry?.markdown ?? '')
  const [date, setDate] = useState(() => toDateInputValue(entry?.updatedAt))
  const [saving, setSaving] = useState(false)

  const needSub = stageHasSubStatus(stage)
  const allowedSub = ALLOWED_SUBSTATUS[stage]

  // 主状态变化时，修正子状态为合法值
  useEffect(() => {
    if (!needSub) {
      setSubStatus('')
      return
    }
    setSubStatus((prev) =>
      prev && allowedSub.includes(prev) ? prev : allowedSub[0],
    )
  }, [stage, needSub, allowedSub])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const c = company.trim()
    if (!c) return
    if (needSub && !subStatus) return
    setSaving(true)
    try {
      await onSave({
        company: c,
        stage,
        subStatus: needSub ? (subStatus as InterviewSubStatus) : undefined,
        appointmentDate:
          subStatus === 'scheduled' && appointmentDate
            ? appointmentDate
            : undefined,
        note: note.trim() || undefined,
        website: website.trim() || undefined,
        markdown,
        updatedAt: date || todayStr(),
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[92vh] w-full flex-col rounded-t-2xl bg-white shadow-2xl sm:max-w-lg sm:rounded-2xl"
      >
        <header className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-lg font-semibold text-ink">
            {entry ? '编辑进度' : '新增进度'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭"
            className="grid h-8 w-8 place-items-center rounded-lg text-muted transition hover:bg-slate-100 hover:text-ink"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="h-5 w-5"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          <div>
            <label className={labelCls}>
              公司 <span className="text-alert">*</span>
            </label>
            <input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="如：字节跳动"
              className={inputCls}
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>
                主状态 <span className="text-alert">*</span>
              </label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as InterviewStage)}
                className={inputCls}
              >
                {STAGE_ORDER.map((s) => (
                  <option key={s} value={s}>
                    {STAGE_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>

            {needSub ? (
              <div>
                <label className={labelCls}>
                  子状态 <span className="text-alert">*</span>
                </label>
                <select
                  value={subStatus}
                  onChange={(e) =>
                    setSubStatus(e.target.value as InterviewSubStatus)
                  }
                  className={inputCls}
                >
                  {allowedSub.map((s) => (
                    <option key={s} value={s}>
                      {SUBSTATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div />
            )}
          </div>

          {subStatus === 'scheduled' ? (
            <div>
              <label className={labelCls}>预约日期</label>
              <DatePicker value={appointmentDate} onChange={setAppointmentDate} />
            </div>
          ) : null}

          <div>
            <label className={labelCls}>日期</label>
            <DatePicker value={date} onChange={setDate} />
          </div>

          <div>
            <label className={labelCls}>备注</label>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="如：等 HR 谈薪"
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>官网链接</label>
            <input
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://"
              type="text"
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>面筋（Markdown）</label>
            <textarea
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              rows={8}
              placeholder="支持 Markdown：标题、列表、表格、代码块…"
              className={`${inputCls} resize-y font-mono text-[13px] leading-relaxed`}
            />
          </div>
        </div>

        <footer className="flex justify-end gap-3 border-t border-line px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2.5 text-sm font-medium text-muted transition hover:bg-slate-100"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={saving || !company.trim()}
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-strong active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? '保存中…' : '保存'}
          </button>
        </footer>
      </form>
    </div>
  )
}
