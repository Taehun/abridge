+++
title = "‘제로부터 시작하는 MLOps 도구와 활용’ 연재 중단"
date = 2024-03-17
draft = false

[taxonomies]
tags = ['MLOps', 'Zero-to-MLOps']

[extra]
author = "김태훈"
toc = false
+++

작년 2월부터 연재하던 *‘제로부터 시작하는 MLOps 도구와 활용’* 시리즈 기사 연재 중단 합니다.

이 기사는 블로그를 시작 하면서, 글의 연속성을 살리기 위해 연재 시작 당시 6개월내 MLOps 오픈소스 도구들에 대해 정리 하는 계획을 가지고 나름 야심차게 시작했습니다. 기사의 취지는 MLOps의 기본 개념과 필요성에 대해 알리고, 비싼 MLOps SaaS들을 대체하는 오픈소스 MLOps tool stack을 가장 밑바닥 구축해 나가는 내용으로 채워나가는 것 이었습니다.

연재 중단의 가장 큰 이유는 우선, 요즘 저는 MLOps 유관 업무를 하고 있지 않습니다. 물론 약 4년전 처음 MLOps 업무를 시작 했을때부터 지금도 관심은 꾸준히 가지고 있긴 합니다만, 업무 연관성이 떨어지니 과거 경험에 기반 하더라도 다시 자료 조사부터 시작해서 직접 설치 및 설정 후 사용법까지 정리하는 것이 생각보다 시간이 많이 듭니다. 원해서 시작한 일이지만, 아무런 보상도 없는 프로젝트를 이어 나가기에는 조금 지쳤습니다.

두번째 이유는 작성한 글의 깊이가 만족스럽지 않습니다. 해당 기사의 가장 최근 기사를 작성하면서 속으로는 *‘이거 실제로 제대로 구축하려면, 도메인 설정부터 시작해서 CNI, 로드밸런서, 서비스 매시, 오브젝트 스토리지, 로그 포워딩, 인증/인가등은 기본인데… 이게 맞나?’* 라는 생각이 머리를 떠나지 않았습니다. ‘MLOps 도구에 대한 글을 작성해야 한다’라는 목표에 너무 함몰되어 알맹이가 빠진 수박 겉핥기식의 내용의 글을 작성하고 있더군요. 공수 대비 결과물이 시원찮으니 의욕이 확 떨어졌습니다.

앞으로는 일하면서 경험한 삽질기 위주로 블로깅을 할 생각입니다. 블로그 검색 기능도 추가할겸, 벡터 DB 관련 내용도 좋고, 바쁘다는 핑계로 요즘 못하고 있는 사이드 프로젝트에 대한 내용, 요즘 회사에서 하고 있는 NextJS 웹 앱 개발이나 스트리밍 파이프라인 만드는 내용등 블로그 기사로 작성할 컨텐츠는 많습니다. 글의 무게를 조금 내려놓고, 조금 가볍게 써보겠습니다.

#### 지금까지 작성한 **‘제로부터 시작하는 MLOps 도구와 활용’ 시리즈 기사**

- [**제로부터 시작하는 MLOps 도구와 활용 - 1. MLOps 개요**](https://blog.taehun.dev/from-zero-to-hero-mlops-tools-1)
- [**제로부터 시작하는 MLOps 도구와 활용 - 2. MLOps 시스템 아키텍처**](https://blog.taehun.dev/from-zero-to-hero-mlops-tools-2)
- [**제로부터 시작하는 MLOps 도구와 활용 - 3. 컴퓨팅 인프라 - 쿠버네티스 (1/2)**](https://blog.taehun.dev/from-zero-to-hero-mlops-tools-3-1)
- [**제로부터 시작하는 MLOps 도구와 활용 - 3. 컴퓨팅 인프라 - 쿠버네티스 (2/2)**](https://blog.taehun.dev/from-zero-to-hero-mlops-tools-3-2)
- [**제로부터 시작하는 MLOps 도구와 활용 - 4. 데이터 관리 (1/2)**](https://blog.taehun.dev/from-zero-to-hero-mlops-tools-4-1)
- [**제로부터 시작하는 MLOps 도구와 활용 - 4. 데이터 관리 (2/2)**](https://blog.taehun.dev/from-zero-to-hero-mlops-tools-4-2)
- [**제로부터 시작하는 MLOps 도구와 활용 - 5. 머신러닝 모델 실험과 개발 (1/4)**](https://blog.taehun.dev/from-zero-to-hero-mlops-tools-5-1)

#### **미처 작성하지 못했던 MLOps 도구들 링크**

- All-in-one, End-to-end 파이프라인
  - [kubeflow](https://www.kubeflow.org/)
  - [TFX](https://www.tensorflow.org/tfx?hl=ko)
- ML 실험 및 모델 관리
  - [MLflow](https://mlflow.org/)
  - [TensorBoard](https://www.tensorflow.org/tensorboard?hl=ko)
- ML 모델 서빙
  - [BentoML](https://www.bentoml.com/)
  - [TorchServe](https://pytorch.org/serve/)
  - [Seldon Core](https://github.com/SeldonIO/seldon-core)
  - [NVIDIA Triton Inference Server](https://developer.nvidia.com/triton-inference-server)
- CI/CD
  - [Github Action](https://github.com/features/actions)
  - [Jenkins](https://www.jenkins.io/)
- CT
  - [Airflow](https://airflow.apache.org/)
  - [Kubeflow Pipeline](https://www.kubeflow.org/docs/components/pipelines/v2/introduction/)
- 모니터링
  - [Prometheus](https://prometheus.io/) / [Grafana](https://grafana.com/)
  - [ELK (Elasticsearch, Logstash, Kibana) 스택](https://www.elastic.co/kr/)
- 기타
  - 쿠버네티스 기본 컴포넌트들…

> neptune.ai에서 최근에 MLOps Landscape를 정리한 기사도 있습니다.
> 
> - *[**MLOps Landscape in 2024: Top Tools and Platforms**](https://neptune.ai/blog/mlops-tools-platforms-landscape)*

<p align="center">
<img src="https://img-src.io/i/taehun/stop-from-zero-to-hero-mlops-tools/1.png?w=600" alt="MLOps Tools"><br>
<i>도구는 단지 도구일 뿐 입니다. MLOps 필요성과 개념을 이해하는 것이 훨씬 중요합니다.(그림 출처> <a href="https://proceedings.neurips.cc/paper_files/paper/2015/file/86df7dcfd896fcaf2674f757a2463eba-Paper.pdf">Hidden Technical Debt in Machine Learning Systems</a>)</i>
</p>
