import { useEffect, useRef, useState } from 'react'
import { DayPicker } from 'react-day-picker'
import { zhCN } from 'react-day-picker/locale'
import { format, isValid, parse } from 'date-fns'
import 'react-day-picker/style.css'

interface Props {
  value: string // YYYY-MM-DD
  onChange: (v: string) => void
}

function parseYmd(v: string): Date | undefined {
  if (!v) return undefined
  const d = parse(v, 'yyyy-MM-dd', new Date())
  return isValid(d) ? d : undefined
}

export default function DatePicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none transition hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20"
      >
        <span>{value || '选择日期'}</span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4 shrink-0 text-muted"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4" />
          <path d="M8 2v4" />
          <path d="M3 10h18" />
        </svg>
      </button>

      {open ? (
        <div className="absolute left-0 top-full z-50 mt-2 rounded-xl border border-line bg-white p-3 shadow-xl">
          <DayPicker
            mode="single"
            selected={parseYmd(value)}
            onSelect={(d) => {
              if (d) onChange(format(d, 'yyyy-MM-dd'))
              setOpen(false)
            }}
            locale={zhCN}
            showOutsideDays
          />
        </div>
      ) : null}
    </div>
  )
}
