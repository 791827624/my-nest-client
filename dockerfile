# 阶段1：构建阶段
FROM node:20-alpine AS builder

# 1. 清理可能存在的旧版Yarn
RUN rm -f /usr/local/bin/yarn /usr/local/bin/yarnpkg && \
    corepack enable && \
    corepack prepare yarn@1.22.22 --activate

WORKDIR /app

# 2. 复制包管理文件
COPY package.json yarn.lock ./

# 3. 安装依赖
RUN yarn install --ignore-engines

# 4. 复制源代码
COPY . .

# 5. 构建项目
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

# 安全设置
RUN addgroup -S appgroup && \
    adduser -S appuser -G appgroup && \
    chown -R appuser:appgroup /app
USER appuser

CMD ["node", "dist/main.js"]