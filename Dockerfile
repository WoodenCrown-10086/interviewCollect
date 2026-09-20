FROM node:22-slim

WORKDIR /app

# 换 npm 与二进制包国内镜像源（better-sqlite3 用预编译包，无需编译工具）
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
