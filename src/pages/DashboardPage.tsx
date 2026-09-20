import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { InterviewEntry } from '../types'
import { repo } from '../lib/repository'
import {
  CHART_COLORS,
  funnelSteps,
  recentCounts,
  stageDistribution,
  trendSeries,
} from '../lib/dashboard'

type Range = '7' | '30' | 'all'

const RANGE_LABELS: Record<Range, string> = {
  '7': '近7天',
  '30': '近30天',
  all: '全部',
}

export default function DashboardPage() {
  const [entries, setEntries] = useState<InterviewEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState<Range>('7')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const data = await repo.list()
        if (!cancelled) setEntries(data)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const recent = useMemo(() => recentCounts(entries), [entries])
  const dist = useMemo(() => stageDistribution(entries), [entries])
  const funnel = useMemo(() => funnelSteps(entries), [entries])
  const trend = useMemo(
    () => trendSeries(entries, range === 'all' ? 'all' : Number(range)),
    [entries, range],
  )

  const metrics = [
    { label: '投递', value: recent.applied },
    { label: '测评', value: recent.assessment },
    { label: '预约', value: recent.scheduled },
    { label: '面试', value: recent.interview },
    { label: '笔试', value: recent.written },
  ]

  const total = entries.length
  const funnelMax = funnel[0]?.count || 1

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-primary-strong"
      >
        ← 返回列表
      </Link>

      <h1 className="mt-4 text-2xl font-bold tracking-tight text-ink">
        数据统计
      </h1>
      <p className="mt-1 text-sm text-muted">
        共 {total} 条记录 · 近7天指标
      </p>

      {loading ? (
        <div className="py-16 text-center text-sm text-muted">加载中…</div>
      ) : total === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-line bg-white/60 px-6 py-16 text-center text-sm text-muted">
          还没有数据，去创建第一条吧
        </div>
      ) : (
        <div className="mt-6 space-y-5">
          {/* 概览指标 */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {metrics.map((m) => (
              <div
                key={m.label}
                className="rounded-2xl border border-line/70 bg-white px-4 py-3 text-center shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
              >
                <div className="text-2xl font-bold tabular-nums text-ink">
                  {m.value}
                </div>
                <div className="mt-0.5 text-[13px] text-muted">{m.label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {/* 状态分布 */}
            <section className="rounded-2xl border border-line/70 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
              <h2 className="mb-3 text-sm font-semibold text-ink">状态分布</h2>
              <div className="flex items-center gap-4">
                <div className="h-40 w-40 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dist}
                        dataKey="count"
                        nameKey="label"
                        innerRadius={38}
                        outerRadius={64}
                        paddingAngle={2}
                      >
                        {dist.map((_, i) => (
                          <Cell
                            key={i}
                            fill={CHART_COLORS[i % CHART_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <ul className="flex-1 space-y-1.5">
                  {dist.map((s, i) => (
                    <li
                      key={s.stage}
                      className="flex items-center gap-2 text-[13px]"
                    >
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{
                          background: CHART_COLORS[i % CHART_COLORS.length],
                        }}
                      />
                      <span className="flex-1 text-muted">{s.label}</span>
                      <span className="font-medium tabular-nums text-ink">
                        {s.count}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* 转化漏斗 */}
            <section className="rounded-2xl border border-line/70 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
              <h2 className="mb-3 text-sm font-semibold text-ink">转化漏斗</h2>
              <div className="space-y-3">
                {funnel.map((step) => {
                  const pct = Math.round((step.count / funnelMax) * 100)
                  return (
                    <div key={step.label}>
                      <div className="mb-1 flex items-center justify-between text-[13px]">
                        <span className="text-muted">{step.label}</span>
                        <span className="font-medium tabular-nums text-ink">
                          {step.count}
                        </span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-primary transition-[width] duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          </div>

          {/* 趋势 */}
          <section className="rounded-2xl border border-line/70 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-ink">新增趋势</h2>
              <div className="inline-flex rounded-xl border border-line p-0.5">
                {(['7', '30', 'all'] as Range[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRange(r)}
                    className={`rounded-lg px-3 py-1 text-xs font-medium transition ${
                      range === r
                        ? 'bg-primary text-white'
                        : 'text-muted hover:text-ink'
                    }`}
                  >
                    {RANGE_LABELS[r]}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trend}>
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={{ stroke: '#e2e8f0' }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 10 }}
                    width={24}
                    tickLine={false}
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <Tooltip />
                  <Bar dataKey="count" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
