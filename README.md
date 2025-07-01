# 阶段1：构建阶段
FROM node:20-alpine AS builder

# 全局启用 Yarn（兼容所有 Node 版本）
RUN corepack enable && \
    yarn set version stable && \
    yarn config set network-timeout 600000

WORKDIR /app

# 1. 单独复制包管理文件（利用 Docker 缓存层）
COPY package.json yarn.lock .yarnrc ./

# 2. 安装所有依赖（包括 devDependencies）
RUN yarn install --frozen-lockfile --production=false

# 3. 复制源代码
COPY . .

# 4. 执行构建并清理缓存
RUN yarn build && \
    yarn cache clean

# ----------------------------
# 阶段2：生产环境
FROM node:20-alpine

# 系统依赖（时区设置）
RUN apk add --no-cache tzdata && \
    cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && \
    apk del tzdata

# 启用 Yarn
RUN corepack enable

WORKDIR /app

# 环境变量
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

# 从构建阶段复制产物
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/yarn.lock ./
COPY --chown=node:node .env.production ./

# 使用非 root 用户
USER node

# 启动命令
CMD ["node", "dist/main.js"]