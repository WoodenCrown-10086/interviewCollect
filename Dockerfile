FROM node:22-slim

WORKDIR /app

# 阿里云 apt 源（比默认 deb.debian.org 快）+ better-sqlite3 编译所需工具
RUN for f in /etc/apt/sources.list /etc/apt/sources.list.d/debian.sources; do \
      if [ -f "$f" ]; then \
        sed -i 's|deb.debian.org|mirrors.aliyun.com|g; s|security.debian.org|mirrors.aliyun.com|g' "$f"; \
      fi; \
    done \
  && apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

# npm 走国内镜像
ENV npm_config_registry=https://registry.npmmirror.com

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build && npm prune --omit=dev

ENV NODE_ENV=production
RUN mkdir -p /app/server/data

EXPOSE 3001
CMD ["node", "server/dist/index.js"]
