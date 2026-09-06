import { useEffect, useState } from 'react'

export default function Toast({
  message,
  onDone,
}: {
  message: string
  onDone: () => void
}) {
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    const t1 = window.setTimeout(() => setLeaving(true), 800)
    const t2 = window.setTimeout(onDone, 1000)
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
    }
  }, [onDone])

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed left-1/2 top-6 z-[100] ${
        leaving ? 'animate-toast-out' : 'animate-toast-in'
      }`}
    >
      <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700 shadow-lg shadow-emerald-500/10">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4 shrink-0 text-emerald-500"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
        {message}
      </div>
    </div>
  )
}
