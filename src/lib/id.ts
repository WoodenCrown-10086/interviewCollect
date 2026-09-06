export function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  // 非安全上下文（如纯 IP + HTTP）下 crypto.randomUUID 不可用，退回时间戳 + 随机数
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}
