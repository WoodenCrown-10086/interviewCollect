FROM node:22-slim

WORKDIR /app

# 换 Debian 国内镜像源，加速 apt（node:22-slim 是 Debian bookworm）
RUN set -eux; \
  for f in /etc/apt/sources.list /etc/apt/sources.list.d/debian.sources; do \
    if [ -f "$f" ]; then \
      sed -i 's|deb.debian.org|mirrors.aliyun.com|g; s|security.debian.org|mirrors.aliyun.com|g' "$f"; \
    fi; \
  done; \
  apt-get update; \
  apt-get install -y --no-install-recommends python3 make g++; \
  rm -rf /var/lib/apt/lists/*

# 换 npm 与二进制包国内镜像源，加速依赖安装
ENV npm_config_registry=https://registry.npmmirror.com
ENV npm_config_better_sqlite3_binary_host=https://registry.npmmirror.com/-/binary/better-sqlite3

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build \
  && npm prune --omit=dev

ENV NODE_ENV=production
RUN mkdir -p /app/server/data

EXPOSE 3001
CMD ["node", "server/dist/index.js"]
