import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import type { InterviewEntry } from '../types'
import StageBadge from './StageBadge'
import MarkdownView from './MarkdownView'
import { formatDate } from '../lib/format'

export default function EntryCard({
  entry,
  index,
}: {
  entry: InterviewEntry
  index: number
}) {
  const [open, setOpen] = useState(false)
  const timer = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (timer.current) window.clearTimeout(timer.current)
    }
  }, [])

  const hoverable = () =>
    window.matchMedia('(hover: hover) and (pointer: fine)').matches

  const handleEnter = () => {
    if (!hoverable()) return
    timer.current = window.setTimeout(() => setOpen(true), 200)
  }

  const handleLeave = () => {
    if (timer.current) {
      window.clearTimeout(timer.current)
      timer.current = null
    }
    if (hoverable()) setOpen(false)
  }

  const toggle = () => setOpen((o) => !o)

  return (
    <article
      className="animate-fade-in-up overflow-hidden rounded-2xl border border-line/70 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-[box-shadow,transform,border-color] duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_12px_32px_-12px_rgba(14,165,233,0.3)]"
      style={{ '--i': index } as CSSProperties}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {/* 展示条（收起态） */}
      <header
        className="flex cursor-pointer select-none flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 sm:flex-nowrap sm:px-5"
        onClick={toggle}
        role="button"
        aria-expanded={open}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            toggle()
          }
        }}
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary text-sm font-semibold text-white">
            {entry.company.charAt(0)}
          </span>
          <h3 className="truncate text-[15px] font-semibold text-ink">
            {entry.company}
          </h3>
          <StageBadge stage={entry.stage} />
        </div>

        {entry.note ? (
          <p className="min-w-0 flex-1 truncate text-[13px] text-muted">
            {entry.note}
          </p>
        ) : (
          <span className="flex-1" />
        )}

        <div className="ml-auto flex shrink-0 items-center gap-3">
          <time className="text-xs tabular-nums text-muted">
            {formatDate(entry.updatedAt)}
          </time>

          {entry.website ? (
            <a
              href={entry.website}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 rounded-lg px-2.5 py-2 text-xs font-medium text-primary-strong transition-colors hover:bg-primary-faint hover:text-primary"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-3.5 w-3.5"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <path d="M15 3h6v6" />
                <path d="M10 14 21 3" />
              </svg>
              官网
            </a>
          ) : null}

          <Link
            to={`/entry/${entry.id}`}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-2 text-xs font-medium text-muted transition-colors hover:bg-primary-faint hover:text-primary-strong"
          >
            详情
          </Link>

          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`h-4 w-4 shrink-0 text-muted transition-transform duration-300 ${
              open ? 'rotate-180' : ''
            }`}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </header>

      {/* 展开区 */}
      <div className={`entry-expand ${open ? 'is-open' : ''}`}>
        <div className="entry-expand-inner">
          <div className="border-t border-line/60">
            <div className="h-[min(45vh,340px)] overflow-y-auto px-4 py-4 sm:px-5">
              {entry.note ? (
                <div className="mb-3 rounded-lg bg-primary-faint px-3 py-2 text-[13px]">
                  <span className="font-medium text-primary-strong">
                    备注：
                  </span>
                  <span className="text-ink">{entry.note}</span>
                </div>
              ) : null}
              <MarkdownView content={entry.markdown} />
            </div>

            <div className="flex items-center justify-end border-t border-line/60 px-4 py-2.5 sm:px-5">
              <Link
                to={`/entry/${entry.id}`}
                onClick={(e) => e.stopPropagation()}
                className="text-sm font-medium text-primary-strong transition-colors hover:text-primary"
              >
                打开详情页 →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}
