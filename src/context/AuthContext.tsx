import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import { request, setAccessToken } from '../lib/api'

export interface AuthUser {
  id: number
  username: string
}

interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  register: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  // 启动时用 refresh cookie 恢复会话
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include',
        })
        if (res.ok) {
          const data = (await res.json()) as {
            accessToken: string
            user: AuthUser
          }
          setAccessToken(data.accessToken)
          if (!cancelled) setUser(data.user)
        }
      } catch {
        /* 未登录，忽略 */
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const login = async (username: string, password: string) => {
    const data = await request<{ accessToken: string; user: AuthUser }>(
      '/api/auth/login',
      { method: 'POST', body: JSON.stringify({ username, password }) },
    )
    setAccessToken(data.accessToken)
    setUser(data.user)
  }

  const register = async (username: string, password: string) => {
    const data = await request<{ accessToken: string; user: AuthUser }>(
      '/api/auth/register',
      { method: 'POST', body: JSON.stringify({ username, password }) },
    )
    setAccessToken(data.accessToken)
    setUser(data.user)
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } finally {
      setAccessToken(null)
      setUser(null)
      // 强制刷新页面，清除内存中的旧数据（列表等），回到未登录态首页
      window.location.href = '/'
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
