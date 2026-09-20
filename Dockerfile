FROM node:22-slim

WORKDIR /app

ENV npm_config_registry=https://registry.npmmirror.com

COPY package*.json ./

# better-sqlite3 13.0.2+ 自带预编译二进制，无需编译工具；
# 若解析到旧版本需要源码编译，则自动换阿里云源装编译工具后重试。
RUN set -eux; \
  if ! npm ci; then \
    echo ">>> npm ci 失败，安装编译工具后重试"; \
    for f in /etc/apt/sources.list /etc/apt/sources.list.d/debian.sources; do \
      if [ -f "$f" ]; then \
        sed -i 's|deb.debian.org|mirrors.aliyun.com|g; s|security.debian.org|mirrors.aliyun.com|g' "$f"; \
      fi; \
    done; \
    apt-get update; \
    apt-get install -y --no-install-recommends python3 make g++; \
    rm -rf /var/lib/apt/lists/* node_modules; \
    npm ci; \
  fi

COPY . .
RUN npm run build \
  && npm prune --omit=dev

ENV NODE_ENV=production
RUN mkdir -p /app/server/data

EXPOSE 3001
CMD ["node", "server/dist/index.js"]
