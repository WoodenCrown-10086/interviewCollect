const pad = (n: number) => String(n).padStart(2, '0')

export function todayStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

// 统一格式化为 YYYY-MM-DD（兼容已存的 ISO 8601 与纯日期字符串）
export function formatDate(value: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

// 将任意日期值转为 <input type="date"> 需要的 YYYY-MM-DD
export function toDateInputValue(value?: string): string {
  if (!value) return todayStr()
  const formatted = formatDate(value)
  return formatted === '—' ? todayStr() : formatted
}
