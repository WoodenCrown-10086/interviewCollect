FROM node:22-slim

WORKDIR /app

# 构建工具：better-sqlite3 等原生模块在无 prebuilt 时回退源码编译所需
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build \
  && npm prune --omit=dev

ENV NODE_ENV=production
RUN mkdir -p /app/server/data

EXPOSE 3001
CMD ["node", "server/dist/index.js"]
