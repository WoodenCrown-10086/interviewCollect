import type { InterviewEntry } from '../types'
import { repo } from './repository'

const SEED_FLAG_KEY = 'interviewCollect.seeded.v1'

function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  const pad = (x: number) => String(x).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export async function seedIfNeeded(): Promise<void> {
  if (localStorage.getItem(SEED_FLAG_KEY)) return
  const existing = await repo.list()
  if (existing.length > 0) {
    localStorage.setItem(SEED_FLAG_KEY, '1')
    return
  }

  const seeds: Omit<InterviewEntry, 'id' | 'createdAt'>[] = [
    {
      company: '字节跳动',
      stage: 'offer',
      note: '等 HR 谈薪，base 杭州',
      updatedAt: daysAgo(1),
      website: 'https://www.bytedance.com',
      markdown: `## 面筋总结

### 一面（技术）
- 手写 Promise.all，考察并发控制
- 问 React 渲染原理、Fiber 调度

### 二面（主管）
- 项目深挖：最难的一个 bug 怎么定位的
- 系统设计：短链服务

### 三面（交叉）
- 算法：链表反转 + 最长回文子串

> 整体感受：面试官很 nice，流程快，一周内走完三轮。`,
    },
    {
      company: '腾讯',
      stage: 'round2',
      note: '等二面结果，预计本周内出',
      updatedAt: daysAgo(3),
      website: 'https://www.tencent.com',
      markdown: `## 面筋总结

### 一面（技术）
- 前端安全：XSS / CSRF 原理与防御
- HTTP 缓存策略、强缓存 vs 协商缓存

### 二面（主管）
- 追问性能优化：首屏从 3s 优化到 1s 的完整路径
- 代码题：实现一个带并发限制的请求调度器

\`\`\`js
// 示例：并发调度器
class Scheduler {
  constructor(limit = 2) { this.limit = limit; this.queue = []; this.running = 0 }
  add(task) {
    return new Promise((resolve) => {
      this.queue.push(() => task().then(resolve))
      this.run()
    })
  }
  run() {
    while (this.running < this.limit && this.queue.length) {
      const task = this.queue.shift()
      this.running++
      task().finally(() => { this.running--; this.run() })
    }
  }
}
\`\`\`

## 复盘
- 缓存那题答得一般，需要补 RFC 7234。`,
    },
    {
      company: '阿里巴巴',
      stage: 'applied',
      note: '刚投递，等初筛',
      updatedAt: daysAgo(6),
      website: 'https://www.alibabagroup.com',
      markdown: `## 准备中

已投递岗位：前端工程师（P6）。

### 复习清单
- [x] JS 基础 / 原型链 / 事件循环
- [x] React / Hooks / 状态管理
- [ ] 打包工具 webpack / vite 原理
- [ ] 手写题专项

> 持续更新中……`,
    },
  ]

  for (const s of seeds) {
    await repo.create(s)
  }
  localStorage.setItem(SEED_FLAG_KEY, '1')
}
