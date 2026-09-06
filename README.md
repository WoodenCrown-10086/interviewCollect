# Interview Collect 面试进度看板

记录面试进度与面筋的全栈应用。前端 React + Vite，后端 Express + SQLite，JWT 鉴权，部署后电脑与手机均可远程访问。

## 功能

- 面试进度看板：9 档状态（未投递 / 已投递 / 已约面 / 一面过 / 二面过 / 三面过 / HR面过 / Offer / 已挂）、备注、官网链接、Markdown 面筋
- 展示条 hover/点击展开动画 + 独立详情页
- react-day-picker 日历日期选择
- 用户名密码注册 / 登录（JWT 双 token + httpOnly cookie）
- 数据按用户隔离；3 条公共案例未登录可查看
- 防 SQL 注入（全程参数化查询 + 输入校验 + 白名单）

## 技术栈

- 前端：React 19 + Vite + TypeScript + Tailwind CSS v4 + react-markdown + react-day-picker
- 后端：Express 5 + better-sqlite3 + bcryptjs + jose（JWT）+ cookie-parser
- 部署：单服务（Express 生产环境同时托管前端静态文件与 API）

## 本地开发

```bash
npm install

# 终端 1：后端（tsx watch，端口 3001）
npm run dev:server

# 终端 2：前端（vite，端口 5173，/api 自动代理到 3001）
npm run dev
```

## 生产构建与运行

```bash
npm run build   # 前端 dist/ + 后端 server/dist/
npm start       # 运行后端（NODE_ENV=production 时同时托管前端）
```

## 环境变量

| 变量 | 说明 | 默认 |
|---|---|---|
| `PORT` | 服务端口 | `3001` |
| `JWT_SECRET` | JWT 签名密钥（生产必填） | `dev-secret-change-me-in-production` |
| `DATABASE_PATH` | SQLite 文件路径 | `server/data/app.db` |
| `NODE_ENV` | 为 `production` 时托管前端静态文件 | - |

## 部署到 Railway

1. 将仓库推送到 GitHub，在 Railway 新建项目并连接该仓库。
2. Railway 自动检测 Node 项目：Build = `npm run build`，Start = `npm start`（`railway.json` 已含健康检查）。
3. 添加**持久卷**：挂载路径 `/app/server/data`（保存 SQLite 数据，重启不丢）。
4. 添加环境变量 `JWT_SECRET`（一段强随机字符串）。
5. 部署完成后获得 `*.up.railway.app` 域名（自动 HTTPS），手机浏览器访问即可远程使用。

## API 概览

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/api/auth/register` | 注册 `{username, password}` |
| POST | `/api/auth/login` | 登录 |
| POST | `/api/auth/refresh` | 用 refresh cookie 换新 access |
| POST | `/api/auth/logout` | 登出 |
| GET | `/api/entries` | 列表（未登录返回公共案例；登录返回公共 + 自己的） |
| GET | `/api/entries/:id` | 详情（需登录） |
| PUT | `/api/entries/:id` | 创建/编辑统一 upsert（需登录） |
| DELETE | `/api/entries/:id` | 删除（需登录，仅 owner） |
| DELETE | `/api/entries` | 清空自己的数据（需登录） |
| GET | `/api/health` | 健康检查 |
