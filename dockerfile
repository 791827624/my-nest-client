# 阶段1：构建阶段
FROM node:20-alpine AS builder

WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production=false
COPY . .
RUN yarn build

# ----------------------------
# 阶段2：生产环境
FROM node:20-alpine

# 安全增强配置
RUN apk add --no-cache su-exec && \
    addgroup -S appgroup && \
    adduser -S appuser -G appgroup

# 应用配置
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

# 从构建阶段复制产物
COPY --from=builder --chown=appuser:appgroup /app/dist ./dist
COPY --from=builder --chown=appuser:appgroup /app/package.json ./
COPY --from=builder --chown=appuser:appgroup /app/node_modules ./node_modules

# 启动应用
USER appuser
CMD ["node", "dist/main.js"]