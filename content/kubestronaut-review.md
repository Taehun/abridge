+++
title = "Kubestronaut 자격 취득 후기"
date = 2024-08-21
draft = false

[taxonomies]
tags = ['kubestronaut', 'Kubernetes']

[extra]
author = "김태훈"
toc = false
+++

<p align="center">
<img src="https://img-src.io/i/taehun/kubestronaut-review/1.png?w=800" alt="Kubestronaut 뱃지">
<a href="https://www.credly.com/badges/a4e4a343-f144-48c3-a478-4605a0eff534/public_url">Credly Kubestronaut 뱃지</a>
</p>

CNCF의 모든 Kubernetes 자격증(CKA, CKAD, CKS, KCNA, KCSA)을 취득하면 "Kubestronaut" 타이틀이 부여 됩니다. 저는 CKA와 CKAD 자격은 이미 보유 중이라 이번에 CKS → KCNA → KCSA 순으로 취득하여 Kubestronaut 자격을 얻었습니다. Kubestronaut 자격을 취득하면 다음과 같은 혜택이 있습니다:

- *간지나는 Kubestronaut 재킷*
- *전문성을 보여줄 수 있는 Credly 배지*
- *Kubestronaut 전용 사설 Slack 채널 및 메일링 리스트 초대*
- *공유 가능한 매년 5개 자격증 50% 할인 쿠폰*
- *연 3회 CNCF 이벤트(KubeCon 또는 KubeDays) 20% 할인*
- *Kubestronaut 홈페이지에 본인 프로필 게재*

각 자격 시험의 조금은 부담스러운 응시료와 생긴지 얼마 되지 않은 자격이라 그런지, 아직까진 희소성이 있습니다. 이 글을 쓰는 시점을 기준으로 전 세계 490명, 한국은 저 포함 14명이네요.

> [CNCF kubestronaut 명단 보러 가기](https://www.cncf.io/training/kubestronaut/)

저는 CKA → CKAD → (3년 후) → CKS → KCNA → KCSA 순으로 취득하였지만, KCNA → CKA → CKAD → KCSA → CKS 순으로 취득하시는 것을 추천합니다.

- KCNA: 클라우드 네이티브, 쿠버네티스 기초 이론
- CKA, CKAD: 쿠버네티스 운영 실전
- KCSA: 클라우드, 쿠버네티스 보안 이론
- CKS: 쿠버네티스 보안 실전

> 엔지니어 직군의 직무 관련 자격증은 사실 자격증 자체로는 커리어에 크게 도움이 되지 않습니다. 기술 직군은 어차피 항상 공부해야하므로 '자격증 취득'이라는 중간 목표로 설정하고, 더 큰 목표 달성을 위한 과정으로 생각하시는 것이 좋습니다.

<p align="center">
<img src="https://img-src.io/i/taehun/kubestronaut-review/2.png?w=800" alt="Credly 뱃지 수집">
<br><i>Credly 뱃지 수집 중. 몇달 쉬었다가 연말에 몇개 더 채울 예정 입니다.</i>
</p>

## 쿠버네티스 자격증 준비 과정

### CKA & CKAD

3년전이라 정확하진 않지만 CKA와 CKAD는 각각 2주, 1주 가량 준비해서 취득 했던 것으로 기억합니다. 아래 Udemy 강의들과 KodeKloud 핸즈온 실습을 하면서 준비했습니다.

- [Certified Kubernetes Administrator (CKA) with Practice Tests](https://www.udemy.com/course/certified-kubernetes-administrator-with-practice-tests)
- [Kubernetes Certified Application Developer (CKAD) with Tests](https://www.udemy.com/course/certified-kubernetes-application-developer)

CKAD는 CKA와 겹치는 부분은 제외하고 필요한 부분만 공부 했던 것 같습니다.

### CKS

[CKS 자격증 시험 후기](https://blog.taehun.dev/review-cks-certified)에 정리해 놓았습니다.

### KCNA

평일 1시간, 주말 2~3시간 가량 일주일 정도 준비 했습니다. [KCNA 소개 페이지](https://training.linuxfoundation.org/certification/kubernetes-cloud-native-associate/)에 있는 각 파트 내용을 정리하고, [examtopics.com](http://examtopics.com)의 무료 KCNA 문제들을 풀어 보았습니다.

문제가 어렵진 않지만, 문제에 생소한 영어 단어들이 나와서 단어장을 만들어 외웠습니다.

*KCNA 시험 분야*

- *Kubernetes Fundamentals (46%)*
- *Container Orchestration (22%)*
- *Cloud Native Architecture (16%)*
- *Cloud Native Observability (8%)*
- *Cloud Native Application Delivery (8%)*

### KCSA

평일 1시간, 주말 2~3시간 가량 일주일 정도 준비 했습니다. [LinkedIn의 KCSA 강의](https://www.linkedin.com/learning/cert-prep-kubernetes-and-cloud-native-security-associate-kcsa)를 듣고, [KCSA 소개 페이지](https://training.linuxfoundation.org/certification/kubernetes-and-cloud-native-security-associate-kcsa/)에 있는 각 파트 내용을 찾아서 정리하였습니다.

*KCSA 시험 분야*

- *Overview of Cloud Native Security (14%)*
- *Kubernetes Cluster Component Security (22%)*
- *Kubernetes Security Fundamentals (22%)*
- *Kubernetes Threat Model (16%)*
- *Platform Security (16%)*
- *Compliance and Security Frameworks (10%)*

아래 블로그 기사가 KCSA 내용을 정리하는데 많은 도움이 되었습니다:

- [Study Guide: Kubernetes Certified Security Associate (KCSA)](https://paulyu.dev/article/kcsa-study-guide/)
