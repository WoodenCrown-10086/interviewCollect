export default function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-white/60 px-6 py-16 text-center">
      <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-primary-faint text-primary">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-7 w-7"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6" />
          <path d="M9 13h6" />
          <path d="M9 17h4" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-ink">还没有面试记录</h3>
      <p className="mt-1 text-sm text-muted">
        添加第一条，开始记录你的面试进度与面筋
      </p>
      <button
        onClick={onAdd}
        className="mt-6 inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-strong active:scale-[0.98]"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="h-4 w-4"
        >
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </svg>
        新增第一条
      </button>
    </div>
  )
}
