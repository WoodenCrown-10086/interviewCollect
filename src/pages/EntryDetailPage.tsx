import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import type { InterviewEntry } from '../types'
import { repo } from '../lib/repository'
import StageBadge from '../components/StageBadge'
import MarkdownView from '../components/MarkdownView'
import EntryForm, { type EntryDraft } from '../components/EntryForm'
import { formatDate } from '../lib/format'

export default function EntryDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [entry, setEntry] = useState<InterviewEntry | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [editing, setEditing] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const load = async () => {
    if (!id) return
    const e = await repo.get(id)
    if (e) {
      setEntry(e)
      setNotFound(false)
    } else {
      setEntry(null)
      setNotFound(true)
    }
  }

  useEffect(() => {
    setEntry(null)
    setNotFound(false)
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const handleSave = async (draft: EntryDraft) => {
    if (!entry) return
    await repo.update(entry.id, draft)
    await load()
    setEditing(false)
  }

  const handleDelete = async () => {
    if (!entry) return
    await repo.remove(entry.id)
    navigate('/')
  }

  if (notFound) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <p className="text-lg text-ink">未找到该记录</p>
        <Link
          to="/"
          className="mt-4 inline-block text-sm font-medium text-primary-strong transition-colors hover:text-primary"
        >
          ← 返回首页
        </Link>
      </div>
    )
  }

  if (!entry) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center text-sm text-muted">
        加载中…
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-primary-strong"
      >
        ← 返回列表
      </Link>

      <article className="mt-4 overflow-hidden rounded-2xl border border-line/70 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <header className="border-b border-line/60 px-5 py-5 sm:px-8">
          <div className="flex flex-wrap items-start gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary text-lg font-semibold text-white">
              {entry.company.charAt(0)}
            </span>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-xl font-bold tracking-tight text-ink sm:text-2xl">
                {entry.company}
              </h1>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[13px] text-muted">
                <StageBadge stage={entry.stage} />
                <time className="tabular-nums">
                  更新于 {formatDate(entry.updatedAt)}
                </time>
                {entry.website ? (
                  <a
                    href={entry.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-medium text-primary-strong transition-colors hover:text-primary"
                  >
                    官网 ↗
                  </a>
                ) : null}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button
                onClick={() => setEditing(true)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-primary-strong transition hover:bg-primary-faint"
              >
                编辑
              </button>
              {confirmingDelete ? (
                <span className="flex items-center gap-1.5">
                  <button
                    onClick={handleDelete}
                    className="rounded-lg bg-alert px-3 py-2 text-sm font-semibold text-white transition hover:brightness-95"
                  >
                    确认删除
                  </button>
                  <button
                    onClick={() => setConfirmingDelete(false)}
                    className="rounded-lg px-2 py-2 text-sm text-muted transition hover:bg-slate-100"
                  >
                    取消
                  </button>
                </span>
              ) : (
                <button
                  onClick={() => setConfirmingDelete(true)}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-alert transition hover:bg-alert-soft"
                >
                  删除
                </button>
              )}
            </div>
          </div>

          {entry.note ? (
            <div className="mt-4 rounded-lg bg-primary-faint px-3 py-2 text-[13px]">
              <span className="font-medium text-primary-strong">备注：</span>
              <span className="text-ink">{entry.note}</span>
            </div>
          ) : null}
        </header>

        <div className="px-5 py-5 sm:px-8 sm:py-6">
          <MarkdownView content={entry.markdown} />
        </div>
      </article>

      {editing ? (
        <EntryForm
          entry={entry}
          onClose={() => setEditing(false)}
          onSave={handleSave}
        />
      ) : null}
    </div>
  )
}
