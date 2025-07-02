# 阶段1：构建阶段
FROM node:20-alpine AS builder

# 1. 清理Yarn并安装pnpm（显式安装比corepack更快）
RUN rm -f /usr/local/bin/yarn /usr/local/bin/yarnpkg && \
    npm install -g pnpm@8

WORKDIR /app

# 2. 复制包管理文件（注意pnpm使用pnpm-lock.yaml）
COPY package.json pnpm-lock.yaml ./

# 3. 安装依赖（pnpm等效参数）
RUN pnpm install --frozen-lockfile --ignore-scripts

# 4. 复制源代码
COPY . .

# 5. 构建项目
RUN pnpm build && \
    pnpm store prune # 清理pnpm存储（比yarn cache clean更高效）

# ----------------------------
# 阶段2：生产环境
FROM node:20-alpine

# 时区配置（保持不变）
RUN apk add --no-cache tzdata && \
    cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && \
    echo "Asia/Shanghai" > /etc/timezone && \
    apk del tzdata

WORKDIR /app

# 环境变量（保持不变）
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

# 复制构建产物（关键修改：pnpm的node_modules结构不同）
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

# 安全设置（保持不变）
RUN addgroup -S appgroup && \
    adduser -S appuser -G appgroup && \
    chown -R appuser:appgroup /app
USER appuser

CMD ["node", "dist/main.js"]