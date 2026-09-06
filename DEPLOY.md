# 部署到自有服务器（阿里云 Linux / IP + HTTP 版）

> 目标环境：Alibaba Cloud Linux 3，公网 IP `106.15.231.109`，暂无域名，用 IP + HTTP 访问。

## 0. 前置说明

- Docker 运行在**服务器**上，本地 Windows 无需 Docker。
- 当前无 HTTPS，登录 cookie 已通过 `COOKIE_SECURE=false` 关闭 secure 属性，HTTP 下可正常登录。
- ⚠️ HTTP 为明文传输，仅适合自用/测试；正式上线建议绑定域名并启用 HTTPS（见文末）。

## 1. 服务器安装 Docker

```bash
# Alibaba Cloud Linux 3（dnf）
sudo dnf install -y docker
sudo systemctl enable --now docker
sudo systemctl status docker   # 确认 active (running)

# 允许当前用户免 sudo 运行 docker（可选）
sudo usermod -aG docker $USER && newgrp docker
```

> 若 dnf 源没有 docker，改用官方脚本：`curl -fsSL https://get.docker.com | bash`

## 2. 上传代码到服务器

方式 A（推荐，代码已在 GitHub）：
```bash
cd ~
git clone https://github.com/WoodenCrown-10086/interviewCollect.git interview
cd interview
```

方式 B（Windows 本地直接上传，scp）：
```bash
# 在本地 Windows 的 Git Bash / PowerShell 执行
scp -r D:\interview root@106.15.231.109:/root/interview
```

## 3. 配置密钥并启动

```bash
cd ~/interview

# 生成一个强随机 JWT_SECRET（复制输出）
openssl rand -hex 32

# 写入 .env（把 <上面生成的串> 替换掉）
echo "JWT_SECRET=<上面生成的串>" > .env

# 构建并后台启动
docker compose up -d --build

# 查看状态与日志
docker compose ps
docker compose logs -f
```

启动后，服务监听 **80 端口**（已映射 `80:3001`）。

## 4. 阿里云安全组放行端口

1. 阿里云控制台 → 云服务器 ECS → 实例 → **安全组** → 配置规则。
2. 入方向放行 **TCP 80**（来源 `0.0.0.0/0`，或仅你自己 IP）。
3. 保存后，浏览器访问：`http://106.15.231.109`

## 5. 验证

- 首页能打开，未登录显示 3 条公共案例。
- 注册/登录正常，登录态能保持（refresh cookie 生效）。
- 数据持久化：重启容器 `docker compose restart` 后数据仍在（SQLite 在 `./data` 卷）。

## 6. 常用运维命令

```bash
docker compose logs -f          # 实时日志
docker compose restart          # 重启
docker compose down             # 停止（数据卷保留）
docker compose up -d --build    # 更新代码后重新构建
```

更新代码流程：`git pull` → `docker compose up -d --build`。

## 7. 后续启用 HTTPS（有域名后）

1. 域名解析 A 记录到 `106.15.231.109`。
2. 阿里云安全组放行 **443**。
3. 用 Caddy 自动申请 Let's Encrypt 证书并反代，或改用 `COOKIE_SECURE=true`。
4. 替换 `docker-compose.yml`：由 Caddy 监听 443 反代到本服务，端口改为 `127.0.0.1:3001:3001`。

## 环境变量

| 变量 | 说明 | 当前值 |
|---|---|---|
| `JWT_SECRET` | JWT 签名密钥（必填） | 你生成的随机串 |
| `COOKIE_SECURE` | cookie secure 属性 | `false`（HTTP 用） |
| `NODE_ENV` | `production` | `production` |
| `PORT` | 容器内端口 | 默认 `3001` |
