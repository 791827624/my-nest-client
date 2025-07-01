# 阶段1：构建阶段
FROM node:20-alpine AS builder

# 启用 Yarn
RUN corepack enable && \
    yarn set version stable

WORKDIR /app

# 1. 仅复制必要的包管理文件
COPY package.json yarn.lock ./

# 2. 安装依赖
RUN yarn install --frozen-lockfile --production=false

# 3. 复制源代码
COPY . .

# 4. 构建项目
RUN yarn build && \
    yarn cache clean

# ----------------------------
# 阶段2：生产环境
FROM node:20-alpine

# 时区配置
RUN apk add --no-cache tzdata && \
    cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && \
    echo "Asia/Shanghai" > /etc/timezone && \
    apk del tzdata

WORKDIR /app

# 环境变量
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

# 复制构建产物
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/yarn.lock ./

# 安全设置
RUN addgroup -S appgroup && \
    adduser -S appuser -G appgroup && \
    chown -R appuser:appgroup /app
USER appuser

CMD ["node", "dist/main.js"]