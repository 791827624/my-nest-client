```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Run tests

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

```
tm-transform
├─ .eslintrc.js
├─ .prettierrc
├─ README.md
├─ nest-cli.json
├─ package-lock.json
├─ package.json
├─ public
│  └─ index.html
├─ src
│  ├─ app.controller.spec.ts
│  ├─ app.controller.ts
│  ├─ app.module.ts
│  ├─ app.service.ts
│  ├─ core                                # 核心模块
│  │  ├─ exceptions                       # 全局异常处理
│  │  │  └─ global-exception.filter.ts
│  │  ├─ interceptors                     # 拦截器
│  │  │  └─ logging.interceptor.ts
│  │  └─ utils                            # 工具类
│  │     └─ retry.util.ts
│  ├─ data                                # 数据抓取推送数据，调试用
│  │  ├─ Stone.js
│  │  ├─ Zoey.js
│  │  ├─ gg.js
│  │  ├─ grace.js
│  │  ├─ 探马无客户数据的情况.json
│  │  └─ 新资源.js
│  ├─ http                                # 探马http请求封装
│  │  └─ http-client.service.ts
│  ├─ log-route.middleware.ts
│  ├─ main.ts
│  └─ modules                             # 业务模块
│     └─ integration                      # 集成模块
│        ├─ data-processing.service.ts    # 处理简道云推送数据 => 探马，核心业务数据处理
│        ├─ dto
│        │  └─ jdy-payload.dto.ts
│        ├─ entities
│        │  └─ integration.entity.ts
│        ├─ integration.controller.ts
│        └─ integration.module.ts
├─ tsconfig.build.json
└─ tsconfig.json

```
