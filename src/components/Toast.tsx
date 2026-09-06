import { useEffect, useState } from 'react'

export default function Toast({
  message,
  type = 'success',
  onDone,
}: {
  message: string
  type?: 'success' | 'error'
  onDone: () => void
}) {
  const [leaving, setLeaving] = useState(false)
  const isError = type === 'error'

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
      <div
        className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium shadow-lg ${
          isError
            ? 'border-red-200 bg-red-50 text-red-700 shadow-red-500/10'
            : 'border-emerald-200 bg-emerald-50 text-emerald-700 shadow-emerald-500/10'
        }`}
      >
        {isError ? (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4 shrink-0 text-red-500"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4" />
            <path d="M12 16h.01" />
          </svg>
        ) : (
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
        )}
        {message}
      </div>
    </div>
  )
}
