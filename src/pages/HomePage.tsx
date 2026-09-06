import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { InterviewEntry, InterviewStage } from '../types'
import { repo } from '../lib/repository'
import { downloadFile } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import AppHeader from '../components/AppHeader'
import EntryList from '../components/EntryList'
import EntryForm, { type EntryDraft } from '../components/EntryForm'
import Toast from '../components/Toast'

export default function HomePage() {
  const [entries, setEntries] = useState<InterviewEntry[]>([])
  const [search, setSearch] = useState('')
  const [stageFilter, setStageFilter] = useState<InterviewStage | 'all'>('all')
  const [formOpen, setFormOpen] = useState(false)
  const [confirmingClear, setConfirmingClear] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const load = async () => {
    setEntries(await repo.list())
  }

  useEffect(() => {
    void load()
  }, [])

  const filtered = entries.filter((e) => {
    const matchSearch = e.company
      .toLowerCase()
      .includes(search.trim().toLowerCase())
    const matchStage = stageFilter === 'all' || e.stage === stageFilter
    return matchSearch && matchStage
  })

  const openCreate = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/' } } })
      return
    }
    setFormOpen(true)
  }

  const handleSave = async (draft: EntryDraft) => {
    const entry: InterviewEntry = {
      ...draft,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    }
    await repo.upsert(entry)
    await load()
    setFormOpen(false)
    setToast({ message: '创建成功', type: 'success' })
  }

  const handleClear = async () => {
    await repo.clear()
    await load()
    setConfirmingClear(false)
  }

  const handleExport = async () => {
    try {
      await downloadFile('/api/entries/export', 'interview-entries.xlsx')
    } catch (err) {
      setToast({
        message: err instanceof Error ? err.message : '导出失败',
        type: 'error',
      })
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      <AppHeader
        search={search}
        onSearch={setSearch}
        stageFilter={stageFilter}
        onStageFilter={setStageFilter}
        onAdd={openCreate}
        onExport={handleExport}
      />
      <EntryList entries={filtered} />

      {entries.length > 0 ? (
        <div className="mt-8 flex justify-center">
          {confirmingClear ? (
            <span className="inline-flex items-center gap-2 rounded-xl bg-alert-soft px-4 py-2 text-sm">
              <span className="text-alert">确认清空我的数据？</span>
              <button
                onClick={handleClear}
                className="rounded-lg bg-alert px-3 py-1.5 font-semibold text-white transition hover:brightness-95"
              >
                清空
              </button>
              <button
                onClick={() => setConfirmingClear(false)}
                className="rounded-lg px-2 py-1.5 text-muted transition hover:bg-white"
              >
                取消
              </button>
            </span>
          ) : (
            <button
              onClick={() => setConfirmingClear(true)}
              className="rounded-xl px-4 py-2.5 text-sm font-medium text-alert transition hover:bg-alert-soft"
            >
              清空我的数据
            </button>
          )}
        </div>
      ) : null}

      {formOpen ? (
        <EntryForm
          entry={null}
          onClose={() => setFormOpen(false)}
          onSave={handleSave}
        />
      ) : null}

      {toast ? (
        <Toast
          message={toast.message}
          type={toast.type}
          onDone={() => setToast(null)}
        />
      ) : null}
    </div>
  )
}
