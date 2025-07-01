# 阶段1：构建阶段
FROM node:20-alpine AS builder

# 安装 pnpm (比全局安装更规范)
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# 1. 单独复制包管理文件
COPY package.json pnpm-lock.yaml .npmrc ./

# 2. 安装依赖（包括devDependencies）
RUN pnpm install --frozen-lockfile

# 3. 复制所有源代码
COPY . .

# 4. 执行构建
RUN pnpm build && \
    pnpm prune --production # 移除开发依赖

# ----------------------------
# 阶段2：生产环境
FROM node:20-alpine

# 安装生产环境需要的系统依赖
RUN apk add --no-cache tzdata && \
    cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && \
    apk del tzdata

# 启用 pnpm
RUN corepack enable

WORKDIR /app

# 环境变量
ENV NODE_ENV=production
ENV PORT=3001
EXPOSE 3001

# 从构建阶段复制产物
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --chown=node:node .env.production ./

# 使用非root用户
USER node

CMD ["node", "dist/main.js"]