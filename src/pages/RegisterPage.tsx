import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const inputCls =
  'w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none transition placeholder:text-muted/70 focus:border-primary focus:ring-2 focus:ring-primary/20'

export default function RegisterPage() {
  const { register, isAuthenticated, loading } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (loading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center text-sm text-muted">
        加载中…
      </div>
    )
  }
  if (isAuthenticated) return <Navigate to="/" replace />

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !password) return
    if (password !== confirm) {
      setError('两次输入的密码不一致')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      await register(username.trim(), password)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : '注册失败')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-[100dvh] items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-line bg-white p-6 shadow-xl sm:p-8"
      >
        <h1 className="text-xl font-bold tracking-tight text-ink">注册</h1>
        <p className="mt-1 text-sm text-muted">创建一个账号开始记录</p>

        {error ? (
          <div className="mt-4 rounded-lg bg-alert-soft px-3 py-2 text-sm text-alert">
            {error}
          </div>
        ) : null}

        <div className="mt-5 space-y-4">
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-ink">
              用户名
            </label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="3-30 位字母/数字/下划线"
              className={inputCls}
              autoFocus
              autoComplete="username"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-ink">
              密码
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="至少 6 位"
              className={inputCls}
              autoComplete="new-password"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-ink">
              确认密码
            </label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="再次输入密码"
              className={inputCls}
              autoComplete="new-password"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting || !username.trim() || !password}
          className="mt-6 w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-white transition hover:bg-primary-strong active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? '注册中…' : '注册'}
        </button>

        <p className="mt-4 text-center text-sm text-muted">
          已有账号？{' '}
          <Link
            to="/login"
            className="font-medium text-primary-strong transition-colors hover:text-primary"
          >
            登录
          </Link>
        </p>
      </form>
    </div>
  )
}
