+++
title = "바이브 코딩으로 혼자서 SaaS를 만들었습니다. - 이미지 CDN SaaS"
date = 2026-02-03
draft = false

[taxonomies]
tags = ['바이브 코딩', 'SaaS', 'img-src', 'CDN']

[extra]
author = "김태훈"
toc = false
+++

최근 몇년간 AWS 환경에서 여러 웹 서비스를 개발했습니다.
웹 페이지에 사용되는 이미지 에셋 최적화가 필요할 때마다 항상 비슷한 작업을 반복해야 했습니다.

CloudFront + Lambda@Edge + S3 설정에 2~3시간.
매 프로젝트마다 처음부터 다시.

> "이미지 URL로 맞춤형 이미지 서빙하는 간단한 작업이 왜 이렇게 복잡하지?"

그래서 직접 만들었습니다.

[https://img-src.io](https://img-src.io) — 개발자를 위한 편리한 이미지 CDN 서비스

이미지를 업로드하면 글로벌 CDN에 캐싱된 이미지 URL이 즉시 생성되고,
URL 쿼리 파라미터만으로 리사이즈, 포맷 변환, 품질 조절이 됩니다.

CloudFront 설정 없이, Lambda 없이, S3 구성 없이.
업로드하고, URL 쓰면 끝.

하루 3시간, Claude Code와 바이브 코딩. 저는 Claude Code가 작성한 코드 테스트 및 피드백만 했습니다. React, TypeScript API, Rust 이미지 프로세서, 인프라까지 — 팀 없이 AI와 함께 혼자. 약 한 달 정도 걸렸습니다. 코딩은 Claude Code가 대부분 하더라도 인프라 설정이나 third-party 서비스 연동은 직접 해야 했습니다.

### 가격

- *Free 플랜*: 10GB + 무제한 대역폭
- *Pro 플랜*: 월 $5 (커피 한 잔 가격)

### 링크

- 문서 사이트: [https://docs.img-src.io](https://docs.img-src.io)
- Python SDK: [https://pypi.org/project/img-src/](https://pypi.org/project/img-src/)
- TypeScript SDK: [https://www.npmjs.com/package/@img-src/sdk](https://www.npmjs.com/package/@img-src/sdk)
- Go SDK: [https://pkg.go.dev/github.com/img-src-io/sdk-go](https://pkg.go.dev/github.com/img-src-io/sdk-go)
- Rust SDK: [https://crates.io/crates/img_src](https://crates.io/crates/img_src)

### 기술 스택

- 인프라: *Cloudflare*
- 프론트엔드: *React*, *TypeScript*, *Vite*, *Cloudflare Pages*
- 백엔드: *Hono*, *TypeScript*, *Cloudflare Workers*, *Cloudflare Container*
- 이미지 프로세서: *Rust*, *libvips*
- 데이터베이스: *Cloudflare D1*
- 이미지 저장소: *Cloudflare R2*
- 데이터 캐시: *Cloudflare KV*
- 사용자 인증: *Clerk*
- 결제: *Lemon Squeezy* (확장시 *Stripe*로 이전)
- 문서: *Mintlify*
- 이메일: *Resend*
- 로깅: *Cloudflare Logpush*, *Sentry*
- 모니터링 및 데이터 분석: *Cloudflare Analytics*

### 인프라 아키텍처

<p align="center">
<img src="https://img-src.io/i/taehun/how-it-works.webp?w=800" alt="img-src 인프라 아키텍처"><br>
<i>img-src 인프라 아키텍처</i>
</p>

오늘 [Product Hunt](https://www.producthunt.com/products/img-src-io)에 런칭했습니다.
관심 있으신 분 사용해 보시고, 피드백 주시면 감사하겠습니다. 개발 당시에는 개발자 지향적인 서비스로 개발했습니다. 앞으로는 AI 에이전트 지향적인 서비스로 개발할 예정입니다.
