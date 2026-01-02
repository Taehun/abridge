+++
title = "Next.js 14 Docker 컨테이너 패키징"
date = 2024-04-10
draft = false

[taxonomies]
tags = ['NextJS', 'Docker']

[extra]
author = "김태훈"
toc = true
+++

Next.js 웹 앱을 Docker 컨테이너 이미지로 패키징하는 방법을 정리했습니다. 이 글을 작성하는 시점에서 Next.js 최신 버전인 14.1.4 버전과 [pnpm](https://pnpm.io/) 패키지 관리자 기준으로 작성하였습니다. `docker`를 포함한 Next.js 개발 환경이 설정되어 있어야 합니다.

## Next.js 14 샘플 앱 생성

예제로 사용할 Next.js 샘플 앱을 생성합니다.

```bash
npx create-next-app@latest nextjs-app --ts --use-pnpm
```

<p align="center">
<img src="https://img-src.io/taehun/nextjs14-docker/1.png?w=800" alt="스크린샷">
</p>

→ *ESLint, Tailwind CSS,* *`src/`* *디렉토리, App Router, import alias*는 모두 디폴트 설정 입니다.

생성된 `nextjs-app` 폴더로 이동합니다.

```bash
cd nextjs-app
```

## Next.js standalone 설정

Next.js 웹 앱 빌드시 필요한 파일과 의존성만 포함하도록 `standalone` 빌드로 설정합니다. `next.config.mjs` 파일에 아래 내용을 추가합니다.

- `next.config.mjs`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
};

export default nextConfig;
```

## Dockerfile 작성

Docker 빌드시 불필요한 파일은 포함되지 않도록 `.dockerignore` 파일을 아래와 같이 작성합니다.

- `.dockerignore`

```text
Dockerfile
.dockerignore
node_modules
npm-debug.log
README.md
.next
.git
```

Docker 이미지를 생성하기 위한 `Dockerfile` 을 아래와 같이 정의합니다. Docker 이미지 최적화를 위해 multi-stage 빌드를 사용하였습니다.

- `Dockerfile`

```Dockerfile
# Build Stage
FROM node:20-alpine AS builder
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app
COPY . .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run build

# Run Stage
FROM node:20-alpine AS runner
ENV NODE_ENV production

WORKDIR /app
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

RUN mkdir -p /app/.next
RUN chown nextjs:nodejs /app/.next

COPY --from=builder --chown=nextjs:nodejs /app/next.config.mjs ./
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
```

## Docker 빌드 및 실행

```bash
docker build -t nextjs-app .
```

빌드가 완료되면, 3000번 포트를 매핑하여 Docker 컨테이너를 실행합니다.

```bash
docker run -p 3000:3000 nextjs-app
```

→ 웹 브라우저 주소창에서 [`http://localhost:3000`](http://localhost:3000) 로 접속

<p align="center">
<img src="https://img-src.io/taehun/nextjs14-docker/2.png?w=800" alt="스크린샷">
</p>
