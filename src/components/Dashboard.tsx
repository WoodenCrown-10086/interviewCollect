import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { InterviewEntry } from '../types'
import {
  CHART_COLORS,
  recentCounts,
  stageDistribution,
  trendSeries,
} from '../lib/dashboard'

export default function Dashboard({ entries }: { entries: InterviewEntry[] }) {
  const [open, setOpen] = useState(false)
  const timer = useRef<number | null>(null)

  const recent = useMemo(() => recentCounts(entries), [entries])
  const dist = useMemo(() => stageDistribution(entries), [entries])
  const trend = useMemo(() => trendSeries(entries, 7), [entries])

  useEffect(() => {
    return () => {
      if (timer.current) window.clearTimeout(timer.current)
    }
  }, [])

  const hoverable = () =>
    window.matchMedia('(hover: hover) and (pointer: fine)').matches

  const handleEnter = () => {
    if (!hoverable()) return
    timer.current = window.setTimeout(() => setOpen(true), 180)
  }
  const handleLeave = () => {
    if (timer.current) {
      window.clearTimeout(timer.current)
      timer.current = null
    }
    if (hoverable()) setOpen(false)
  }

  const metrics = [
    { label: '投递', value: recent.applied },
    { label: '测评', value: recent.assessment },
    { label: '预约', value: recent.scheduled },
    { label: '面试', value: recent.interview },
    { label: '笔试', value: recent.written },
  ]

  const hasData = entries.length > 0

  return (
    <section
      className="mb-6 overflow-hidden rounded-2xl border border-line/70 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-shadow hover:border-primary/30 hover:shadow-[0_12px_32px_-12px_rgba(14,165,233,0.25)]"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {/* 收窄态 */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3 sm:px-5">
        <span className="shrink-0 text-xs font-medium text-muted">近7天</span>
        <div className="flex flex-1 flex-wrap items-center gap-x-6 gap-y-2">
          {metrics.map((m) => (
            <div key={m.label} className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold tabular-nums text-ink">
                {m.value}
              </span>
              <span className="text-[13px] text-muted">{m.label}</span>
            </div>
          ))}
        </div>
        <Link
          to="/dashboard"
          onClick={(e) => e.stopPropagation()}
          className="shrink-0 text-sm font-medium text-primary-strong transition-colors hover:text-primary"
        >
          查看详情 →
        </Link>
      </div>

      {/* hover 展开：图表 */}
      <div className={`entry-expand ${open ? 'is-open' : ''}`}>
        <div className="entry-expand-inner">
          <div className="border-t border-line/60">
            {hasData ? (
              <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-3 sm:p-5">
                <div>
                  <h4 className="mb-2 text-[13px] font-medium text-ink">
                    状态分布
                  </h4>
                  <div className="h-40">
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
                </div>

                <div>
                  <h4 className="mb-2 text-[13px] font-medium text-ink">
                    近7天新增
                  </h4>
                  <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={trend}>
                        <XAxis
                          dataKey="label"
                          tick={{ fontSize: 10 }}
                          tickLine={false}
                          axisLine={{ stroke: '#e2e8f0' }}
                        />
                        <YAxis
                          allowDecimals={false}
                          tick={{ fontSize: 10 }}
                          width={20}
                          tickLine={false}
                          axisLine={{ stroke: '#e2e8f0' }}
                        />
                        <Tooltip />
                        <Bar dataKey="count" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div>
                  <h4 className="mb-2 text-[13px] font-medium text-ink">
                    近7天走势
                  </h4>
                  <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trend}>
                        <XAxis
                          dataKey="label"
                          tick={{ fontSize: 10 }}
                          tickLine={false}
                          axisLine={{ stroke: '#e2e8f0' }}
                        />
                        <YAxis
                          allowDecimals={false}
                          tick={{ fontSize: 10 }}
                          width={20}
                          tickLine={false}
                          axisLine={{ stroke: '#e2e8f0' }}
                        />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="count"
                          stroke="#0284c7"
                          strokeWidth={2}
                          dot={{ r: 3, fill: '#0284c7' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            ) : (
              <p className="px-5 py-8 text-center text-sm text-muted">
                暂无数据可统计
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
