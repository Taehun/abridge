+++
title = "Rust 토이 프로젝트 - RSQuery"
date = 2023-09-24
draft = false

[taxonomies]
tags = ['Rust', '스터디', 'RSQuery', '분산 쿼리 시스템', 'Ballista']

[extra]
author = "김태훈"
toc = true
+++

새로운 프로그래밍 언어를 익히는 가장 빠른 방법은 새로 배운 언어로 뭔가 만들어보는 것이라고 생각합니다. Rust 프로그래밍 언어 공부를 목적으로 [Rust 프로그래밍 언어 스터디](https://good-passenger-646.notion.site/Rust-c11ea0202c514f1ea800f254f4f84801)를 진행하였고, Rust 언어로 토이 프로젝트도 했습니다. 저는 RSQuery라는 프로젝트를 기획해서 만들었습니다.

- [rsquery GitHub 저장소](https://github.com/Taehun/rsquery)

## 프로젝트 개요

[Apache Ballista](https://arrow.apache.org/ballista/)를 활용하여 구글 BigQuery 클론 만들기

- REST API → Apache Flight RPC 프록시 서버를 Rust 마이크로 서비스로 구현

## 기술 스택

- 프론트엔드
  - 개발 언어 및 프레임워크: NextJS (Typescript)
  - 인프라: Vercel
- 백엔드
  - 개발 언어 및 프레임워크: [Actix Web](https://actix.rs/) (Rust), [Apache Ballista](https://github.com/apache/arrow-ballista)
  - 인프라: AWS
    - EKS
    - S3

## 시스템 아키텍처

<p align="center">
<img src="https://img-src.io/i/taehun/rsquery-review/1.png?w=800" alt="RSQuery 시스템 아키텍처">
</p>

- Web → Rest API Server (POST 요청)
- Rest API Server → Ballista Scheduler (Flight RPC)

## 프로젝트 로그

### 1주차: 2023.07.17 ~ 2023.07.23

- Git 원격 저장소 생성 및 설정
  - rsquery-web (프론트엔드)
  - rsquery-restapi-server (REST API 마이크로서비스)
  - rsquery-infra (인프라) → 비용 문제로 프트젝트 후반부에 셋팅
- 프론트엔드
  - 도메인 설정: [rsquery.taehun.dev](http://rsquery.taehun.dev)
  - Vercel Github 연동: rsquery-web Github 저장소와 Vercel 프로젝트 연동
- 백엔드
  - Actix Web 템플릿 코드 작성
  - Actix Web 학습

### 2주차: 2023.07.24 ~ 2023.07.30

- 프론트엔드
  - 프로젝트에 사용할 패키지 선정
    - [React Textarea Code Editor](https://uiwjs.github.io/react-textarea-code-editor/) → SQL 쿼리 에디터 UI
    - [tremor](https://www.tremor.so/) → Dashboard UI
- 백엔드
  - Actix Web 학습 → 문서 번역하면서 학습하고 있습니다.
    - [Errors](https://actix.rs/docs/errors)
    - [URL Dispatch](https://actix.rs/docs/url-dispatch)
    - [JSON Request](https://actix.rs/docs/request)
  - Apache Ballista 빌드 및 배포 (0.11.0) → 참고 문서: [Developer's Guide](https://github.com/apache/arrow-ballista/blob/main/CONTRIBUTING.md#developers-guide)
    - `public.ecr.aws/t7j3q4u1/arrow-ballista-benchmarks:0.11.0`
    - `public.ecr.aws/t7j3q4u1/arrow-ballista-cli:0.11.0`
    - `public.ecr.aws/t7j3q4u1/arrow-ballista-executor:0.11.0`
    - `public.ecr.aws/t7j3q4u1/arrow-ballista-scheduler:0.11.0`
    - `public.ecr.aws/t7j3q4u1/arrow-ballista-standalone:0.11.0`
  - REST API 엔드포인트에 Swagger 문서 자동 생성 적용
    - [utoipa](https://github.com/juhaku/utoipa) 크레이트 사용

### 3주차: 2023.07.31 ~ 2023.08.06

- Actix Web 학습 → 문서 번역하면서 학습하고 있습니다.
  - [Response](https://actix.rs/docs/response)
  - [Testing](https://actix.rs/docs/testing)
  - [Middleware](https://actix.rs/docs/middleware)
- Apache Ballista k8s 클러스터내 설치
  - ref> [Deploying Ballista with Kubernetes](https://arrow.apache.org/ballista/user-guide/deployment/kubernetes.html)
- Apache Ballista 예제 돌려보기
  - Standalone 환경 잘됨
  - Distributed 환경 (k8s)에서 예제 Job이 동작 하지 않는 이슈 트래킹 중…

### 4주차: 2023.08.07 ~ 2023.08.13

- Actix Web 학습 → 문서 번역 완료
  - [[번역] Actix 문서](https://blog.taehun.dev/actix-docs-hangul)
- 백엔드
  - REST API 인터페이스 요청/응답 스키마 정리
  - Ballista Distributed 환경 (k8s)에서 예제 Job이 동작 하지 않는 이슈 해결
    - 예제를 실행하는 환경에서 Worker IP로 접속 하도록 되어 있었음
    - Ex> 실행 환경: 로컬, 설치 환경: k8s → 로컬에서 예제 실행시 Worker의 k8s 클러스터 IP로 접속 시도 → 로컬에서 k8s 클러스터 IP 접속이 안됨
- 프론트엔드
  - UI 레이아웃 구현 (SQL 쿼리 에디터)

### 5주차: 2023.08.14 ~ 2023.08.20

- 백엔드
  - 백엔드 인프라 설정 및 배포
    - AWS 인프라: EKS, ECR, ALB, ….
    - Swagger 문서: <https://rsquery-api.taehun.dev/swagger-ui/>
  - 크레이트 의존성 이슈 해결
  - 샘플 응답 메세지 추가
- 프론트엔드
  - 백엔드 연동
  - 응답 메세지 파싱 및 표시 추가

### 스터디 종료 이후: ~2023.09.17

- 백엔드
  - Apache Ballista 크레이트 의존성 문제
    - → 배포된 크레이트 (X), Github 최신 `main` 브랜치 코드로 변경
    - Github [r4ntix](https://github.com/r4ntix)유저의 PR이 많은 도움이 되었음 (datafusion 버전업 PR)
    - ballista 0.11.0 의존성 크레이트가 구버전이라 다른 크레이트와 충돌 발생
  - RSQuery 백엔드 ↔ Apache Ballista 연동
    - Ballista Context를 actix-web AppState로 관리
    - Ballista 스케쥴러 URL을 환경 변수로 설정 가능하게 추가
  - Dockerfile 업데이트
    - 크레이트 의존성이 늘어나면서, `distroless` Base 이미지 사용 불가
    - Base 이미지 `ubuntu` 로 변경
  - REST API 응답 포맷 업데이트
    - Apache Ballista 쿼리 실행 결과 포맷에 맞춤
  - S3 파일 로드시 `MissingRegion` 이슈
    - Ballista Client (RSQuery 백엔드), Ballista Scheduler, Ballista Executor 모두 AWS Region 설정 환경 변수가 필요함 → `AWS_DEFAULT_REGION` 환경 변수
- 프론트엔드
  - UI 수정
    - 테이블 형태 결과와 메세지 형태 결과 모두 표시 가능
  - 변경된 응답 메세지 포맷에 맞게 파싱 루틴 업데이트
  - 단축키 (cmd + Enter) 추가 시도
    - `e.preventDefault()` 가 왜 적용이 안될까?
    - `cmd + Enter` 키 입력시 핸들러 실행은 되지만, 쿼리 입력 박스에 엔터키가 입력됨
- 인프라
  - EKS Fargate → Graviton Spot 인스턴스
    - 백엔드 배포 타겟 아키텍처가 x86 → arm64로 변경됨
  - 데모 영상 녹화
    - S3에 있는 CSV 원본 데이터에서 테이블 생성후 간단한 쿼리 실행
  - Github 저장소 모놀리딕으로 변경 및 커밋 정리
    - 인프라 코드 관련 커밋 삭제

## 후기

- 프로젝트 수행은 매주 주말 평균 3~5시간을 투자 했습니다. [Actix 문서 번역](https://blog.taehun.dev/actix-docs-hangul)에 쏟은 시간이 아깝다는 생각이 들었습니다.
- Apache Ballista 프로젝트 완성도와 활성도가 낮아 힘들었습니다. 특히, 배포된 Ballista에서 사용하는 크레이트들이 모두 구버전이라 크레이트 의존성 충돌 문제를 해결하는데 많은 시간을 허비하였습니다.
- Datafusion SQL 쿼리 엔진은 좋았습니다. Datafusion Python 바인딩도 있으니, export한 데이터를 로컬에서 SQL 쿼리로 분석할때 앞으로 활용해 볼 생각입니다. Datafusion 기반으로 k8s 환경에서 동작하는 새로운 분산 쿼리 엔진을 만들어보는 것도 재밌을것 같습니다.
- Rust 개발 환경은 [Cargo](https://rinthel.github.io/rust-lang-book-ko/ch01-03-hello-cargo.html)로 인해 매우 편리했습니다.
- 사용하는 크레이트가 늘어나면서 Rust 빌드 타임은 저의 인내심의 한계를 넘어섰습니다. 멀티 아키텍처 지원을 위해 `docker buildx build` 라도 하게 되면 그날 작업은 그것으로 끝입니다. (돌려놓고 수면…) 과거 임베디드 개발자로 일할때 [AOSP](https://namu.wiki/w/Android%20Open%20Source%20Project) 빌드 하던 일이 떠올랐습니다.
- 많은 분들이 Rust 단점으로 꼽는 진입 장벽은 의외로 할만 했습니다. cargo와 [rust-analyzer](https://rust-analyzer.github.io/) 확장의 편의성과 생성형 AI (ChatGPT, Copilot)들이 많은 도움이 되었습니다.
