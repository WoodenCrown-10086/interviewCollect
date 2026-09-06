import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'

export interface AuthUser {
  id: string
  name?: string
}

interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  /** 后续接入真实鉴权时实现（调用后端 /login 等）。 */
  login: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isAuthenticated: false,
  login: async () => {},
  logout: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  // TODO: 接入真实登录后，替换为实际的会话状态管理。
  const value: AuthContextValue = {
    user: null,
    isAuthenticated: false,
    login: async () => {},
    logout: async () => {},
  }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext)
}
