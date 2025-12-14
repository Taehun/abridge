+++
title = "CKS 자격증 시험 후기"
date = 2024-07-04
draft = false

[taxonomies]
tags = ['Kubernetes', 'CKS', '자격증']

[extra]
author = "김태훈"
toc = true
+++


<!-- TODO: 이미지 추가 - 파일명: 스크린샷_2024-07-03_오후_11.26.53.png, 원본: https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fd16ab49b-c880-41d3-8de9-a0ddfb671740%2Fc05da5e3-2d6d-49a3-ab39-a82a9b72ac15%2F%25E1%2584%2589%25E1%2585%25B3%25E1%2584%258F%25E1%2585%25B3%25E1%2584%2585%25E1%2585%25B5%25E1%2586%25AB%25E1%2584%2589%25E1%2585%25A3%25E1%2586%25BA_2024-07-03_%25E1%2584%258B%25E1%2585%25A9%25E1%2584%2592%25E1%2585%25AE_11.26.53.png?table=block&id=de220093-5e99-49ae-9ef4-0bd0a75dfd86&cache=v2 -->

![notion image](https://img-src.io/taehun/review-cks-certified/1.png)


## 계기

> *“Your CKA Certification Expires in 3 Months”*

얼마전에 CKA 자격증 만료일이 다되어 간다는 메일을 받았습니다. 응시료도 비싼데, CKA 자격증만 갱신 하려니 뭔가 허전합니다. 그래서, 그냥 이참에 CKS 자격증을 준비해서 취득했습니다.

## CKS 자격증 간단 소개

> *CKS(Certified Kubernetes Security Specialist)* 시험은 Kubernetes 환경에서 보안의 중요한 측면을 다루는 자격증 시험입니다. 이 시험은 Kubernetes의 클러스터 구성, 네트워크 보안, 정책 관리, 클러스터 모니터링 및 로깅, 그리고 런타임 보안과 같은 영역을 포함합니다. CKS 자격증은 Kubernetes와 관련된 보안 기술을 검증하며, 클라우드 네이티브 애플리케이션의 보안을 강화하고자 하는 전문가들에게 적합합니다. 시험 응시자는 Kubernetes의 보안 기능을 실질적으로 활용하고 문제를 해결하는 능력을 평가받습니다.
> *- ChatGPT*

CKS 자격증 시험 응시 자격이 CKA 자격증 소지자 입니다. 쿠버네티스 자격증 시험의 개인적인 체감 난이도는 CKA ≤ CKAD < CKS 입니다.

## 준비 과정

ℹ️

*저는 다년간 on-premise, EKS, GKE 등 다양한 쿠버네티스 클러스터를 구축하고 운영한 경험이 있습니다. 20년 이상 리눅스 환경에서 여러가지 업무를 해왔습니다. 즉, 리눅스 환경과 쿠버네티스는 이미 익숙한 상태이고, CKS 시험에서 다루는 보안과 관련된 도구들만 생소한 상태였습니다.*

제 기준(위 참고)에서 자격증 취득에 무리 없을 정도로만 준비 했습니다.

- *준비 기간*

- 15일 (2일 휴식)

- *공부 시간*

- 하루 평균 3시간

- *총 공부 시간*

- 3시간 x 13일 = 약 40 시간

- *일자별 준비 과정*

- 1~10일차

- [무료 CKS 유투브 강의 공부](https://www.youtube.com/watch?v=d9xfB5qaOfg) + [killercoda 실습](https://killercoda.com/killer-shell-cks)
- 약 11시간 분량의 유투브 강의 입니다. *1) 노션에 정리하면서 강의 듣기 2) Hands-on 실습은 모두 따라해보기 3) 강의 내용과 관련된 killercoda 실습하기* ←이렇게 준비 했습니다.

- 11일차

- [killercoda 실습](https://killercoda.com/killer-shell-cks) 2회차

- 12~13일차

- [killer.sh](http://killer.sh) 모의고사 풀기 (2회)
- 1회차는 답안 보고 이해하면서 따라하는 방식
- 2회차는 리셋하고 직접 풀어보기

정리하면 *1.* *[무료 CKS 유투브 강의](https://www.youtube.com/watch?v=d9xfB5qaOfg)*로 공부와 Hands-on 실습, *2.* *[killercoda 실습](https://killercoda.com/killer-shell-cks)*해보기, *3.* *[killer.sh](http://killer.sh)*모의고사 풀기

*[killer.sh](http://killer.sh)*모의고사는 CKS 시험 신청시 무료 2세션이 제공 됩니다. 1세션당 36시간 동안 사용 가능 합니다.

## 시험

온라인으로 진행되는 시험이지만, 감독관분이 꼼꼼히 체크 합니다. 저는 집 근처 스터디 카페 2인실을 대여해서 시험을 치뤘습니다.

- 준비물: 노트북, **신분증(여권)**

웹 캠으로 시험 장소 전체를 보여주고, 스마트 장치등을 착용하지 않았는지 확인합니다. 시험 장소에 책상, 의자, 노트북, 신분증 외에는 아무것도 없는 것이 깔끔합니다.

### 어려웠던 부분

- 영문장 독해

요즘 영문서를 볼때 번역기 돌리는 것이 습관화 되어 영문장 독해력이 많이 떨어졌습니다. 언어 장벽으로 문제가 요구하는 바를 정확하게 파악하는 것이 힘들었습니다. (문장이 길지 않고, 쉬운 단어로만 되어 있어요. 그냥 개인적인 이슈)

- 생소한 문제

생소한 문제가 하나 나와서 못풀었습니다 (Cipher Suites). → [참고할 링크](https://github.com/kodekloudhub/certified-kubernetes-security-specialist-cks-course/blob/main/docs/03-Cluster-Setup-and-Hardening/49-Cipher-Suites.md)

## 결론 및 후기

- `kubectl delete` 옵션에 `--grace-period=0 --force` 사용하기

- → 시간이 빡빡해서 리소스 삭제 완료 대기 시간이 아깝습니다.

- 노드 접속후 풀어야 하는 문제가 많습니다.

- 문제와 답을 외우는 것 보다는 문제를 푸는 과정을 숙달하는 것이 도움이 됩니다. 예를 들면, AppArmor 프로파일 설정을 하려면 허용된 리소스 중 어떤 문서를 봐야하는지 등…

- 언어 이슈로 잘못 푼 문제가 많아서 떨어질까 조마조마 했는데, 다행히 합격 했습니다. 도파민 폭발~!

- CKS 시험 준비하면서 배운점을 업무에 활용해 보는 재미도 쏠쏠 하네요. (gvisor와 trivy)