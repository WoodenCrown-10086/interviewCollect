let accessToken: string | null = null

export function setAccessToken(token: string | null): void {
  accessToken = token
}

export function getAccessToken(): string | null {
  return accessToken
}

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function tryRefresh(): Promise<boolean> {
  try {
    const res = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    })
    if (!res.ok) return false
    const data = (await res.json()) as { accessToken: string }
    setAccessToken(data.accessToken)
    return true
  } catch {
    return false
  }
}

export async function request<T = unknown>(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<T> {
  const headers = new Headers(options.headers)
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`)
  if (options.body != null && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  let res = await fetch(path, { ...options, headers, credentials: 'include' })

  // 401 且未重试过 → 用 refresh 换新 access 后重试一次
  if (res.status === 401 && retry) {
    const ok = await tryRefresh()
    if (ok) return request<T>(path, options, false)
  }

  if (!res.ok) {
    let message = '请求失败'
    try {
      const data = (await res.json()) as { error?: unknown }
      if (data && typeof data.error === 'string') message = data.error
    } catch {
      /* ignore */
    }
    throw new ApiError(res.status, message)
  }

  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

export async function downloadFile(
  path: string,
  filename: string,
): Promise<void> {
  const headers = new Headers()
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`)

  let res = await fetch(path, { headers, credentials: 'include' })

  if (res.status === 401) {
    const ok = await tryRefresh()
    if (ok) return downloadFile(path, filename)
  }

  if (!res.ok) {
    let message = '下载失败'
    try {
      const data = (await res.json()) as { error?: unknown }
      if (data && typeof data.error === 'string') message = data.error
    } catch {
      /* ignore */
    }
    throw new ApiError(res.status, message)
  }

  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
