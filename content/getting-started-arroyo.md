+++
title = "스트림 처리 엔진 - Arroyo 소개와 기본 사용법"
date = 2024-03-03
draft = false

[taxonomies]
tags = ['Arroyo', 'Data Engineering', 'Streaming Processing']

[extra]
author = "김태훈"
toc = true
+++

## 소개

[Arroyo](https://www.arroyo.dev/)는 Rust로 개발된 분산 스트림 처리 엔진으로, 데이터 스트림 상의 상태 유지 계산에 중점을 둡니다. 고성능을 목표로 SQL을 통한 파이프라인 정의를 지원하며, 초당 수백만 개의 이벤트를 처리할 수 있도록 확장 가능합니다. 상태 유지 연산, 내결함성, 이벤트 시간 처리와 같은 기능을 제공합니다. 자체 호스팅이 가능하며, 사기 탐지, 분석, 실시간 머신러닝 피처 생성과 같은 실시간 데이터 처리 애플리케이션에 적합합니다.

<p align="center">
<img src="https://img-src.io/taehun/getting-started-arroyo/1.png?w=800" alt="그림 1. Arroyo UI 스크린샷">
<i>그림 1. Arroyo UI 스크린샷 (출처> <a href="https://doc.arroyo.dev/introduction">https://doc.arroyo.dev/introduction</a>)</i>
</p>

### 핵심 기능

- SQL로 정의된 파이프라인, 복잡한 분석 쿼리 지원
- 초당 수백만 개의 이벤트까지 확장 가능
- 윈도우 및 조인과 같은 상태 저장 작업
- 내결함성 및 파이프라인 복구를 위한 상태 저장
- 워터마크 지원을 통한 이벤트 시간 처리

### 사용 사례

- 사기 및 보안 사고 탐지
- 실시간 제품 및 비즈니스 분석
- 데이터 웨어하우스 또는 데이터 레이크로 실시간 수집
- 실시간 ML 피처 생성

### 왜 Arroyo 인가?

[*Apache Flink*](https://flink.apache.org/)*,* [*Spark Streaming*](https://spark.apache.org/docs/latest/streaming-programming-guide.html)*,* [*Kafka Stream*](https://kafka.apache.org/documentation/streams/)등 기존 스트림 처리 엔진이 이미 많이 나와 있습니다. Arroyo를 새로 만든 이유가 뭘까요?

- **서버리스 운영**: Arroyo 파이프라인은 최신 클라우드 환경에서 실행되도록 설계되어 원활한 확장, 복구 및 일정 재조정을 지원합니다.
- **고성능 SQL**: SQL은 일관되게 우수한 성능으로 최우선 순위의 관심사입니다.
- **비전문가를 위한 설계**: Arroyo는 파이프라인 API를 내부 구현에서 깔끔하게 분리합니다. 스트리밍 전문가가 아니어도 실시간 데이터 파이프라인을 구축할 수 있습니다.

### Arroyo와 Apache Flink 비교

현재 스트림 처리를 위한 가장 유명한 도구는 [Apache Flink](https://flink.apache.org/) 입니다. Apache Flink는 오픈 소스 스트림 처리 엔진으로, 널리 사용되고 있습니다. 베를린 공과대학교의 연구 프로젝트에서 시작하여 전 세계 수 많은 사용자를 보유한 대규모의 성공적인 프로젝트로 성장했습니다.

Arroyo와 Apache Flink는 모두 오픈소스 스트림 처리 엔진입니다. Arroyo와 Apache Flink의 주요 차이점은 다음과 같습니다:

- **유연성:** Flink는 복잡한 이벤트 처리와 다양한 처리 모델을 지원합니다. Arroyo는 Flink와 같은 수준의 유연성을 목표로 하지 않습니다.
- **슬라이딩 윈도우 쿼리**: Flink에서는 슬라이드를 줄일수록 처리량이 급격히 감소하는 반면, Arroyo는 슬라이드와 윈도우 크기에 상관 없이 일정한 처리량을 제공합니다.
- **체크포인트 저장소:** Flink는 이벤트 상태 체크포인트를 RocksDB에 저장합니다. Arroyo는 S3와 같은 오브젝트 스토리지에 저장합니다.
- **사용 사례**: Flink는 복잡한 데이터 파이프라인 구축, 실시간 분석, 이벤트 기반 애플리케이션 개발 등 다양한 고급 사용 사례에 적합합니다. Arroyo는 비전문가도 SQL 쿼리를 사용하여 실시간 스트리밍 데이터를 변환하거나 분석 할 수 있습니다.
- **개발 언어**: Flink는 Java와 Scala로 개발되었으며, Arroyo는 Rust로 개발되었습니다.

### 아키텍처

<p align="center">
<img src="https://img-src.io/taehun/getting-started-arroyo/2.png?w=800" alt="그림 2. Arroyo 아키텍처">
<i>그림 2. Arroyo 아키텍처</i>
</p>

Arroyo의 구성 요소는 다음과 같습니다:

- **Web UI**: React로 작성된 단일 페이지 앱으로, REST API를 통해 시스템과 상호작용합니다.
- **Arroyo API**: Web UI를 지원하며, REST API를 통해 모든 구성 작업과 파이프라인 관리를 처리합니다.
- **Arroyo Controller**: 데이터베이스에 정의된 시스템의 원하는 상태와 실제 상태를 지속적으로 조정합니다.
- **Schedulers**: 다양한 스케줄러를 지원하며, 데이터플로우 엔진을 구성하는 Worker를 관리 합니다.
- **Arroyo Worker**: 실제 처리 로직을 실행하는 워커로, 데이터플레인을 구성합니다.
- **Postgres**: 설정 및 시스템 상태를 저장하는 데 사용됩니다.
- **Prometheus**: 메트릭 수집에 사용됩니다.
- **S3**: 체크포인트를 저장하는 데 사용됩니다.

## 설치

### 로컬 설치 및 실행

로컬 설치 및 실행은 `docker` 로 할 수 있습니다.

```bash
docker run -p 8000:8000 ghcr.io/arroyosystems/arroyo-single:latest
```

→ 웹 브라우저에서 [`http://localhost:8000`](http://localhost:8000) 접속

### 쿠버네티스 클러스터에 배포

Arroyo를 쿠버네티스 클러스터에 배포하면 아래 컴포넌트들이 설치 됩니다 ([아키텍처](/a827881328f54bc7846370bc64ea70aa#bee49c99cad348dca573743b33a16707) 참고):

- *arroyo-compiler*
- *arroyo-controller*
- *arroyo-api*
- *prometheus*
- *postgres*

Arroyo Helm 저장소를 추가 합니다:

```bash
helm repo add arroyo https://arroyosystems.github.io/helm-repo
```

아래와 같이 Helm Chart 설정 파일을 작성 합니다:

- `values.yaml`

```yaml
artifactUrl: "s3://<YOUR_ARROYO_ARTIFACT_BUCKET>"
checkpointUrl: "s3://<YOUR_ARROYO_CHECKPOINT_BUCKET>"
```

`artifactUrl` 는 파이프라인 아티팩트가 저장되는 S3 버킷 URL, `checkpointUrl` 는 체크포인트 데이터 저장되는 S3 버킷 URL 설정 입니다.

쿠버네티스 클러스터에 PostgreSQL과 Promethus가 이미 설치 되어 있으면, 새로 설치하지 않도록 아래와 같이 설정해서 사용 할 수 있습니다:

- `values.yaml`

```yaml
postgresql:
  deploy: false
  externalDatabase:
    host: postgresql.arroyo.svc.cluster.local
    name: arroyo_test
    user: arroyodb
    password: arroyodb
prometheus:
  deploy: false
  endpoint: prometheus.arroyo.svc.cluster.local
artifactUrl: "s3://<YOUR_ARROYO_ARTIFACT_BUCKET>"
checkpointUrl: "s3://<YOUR_ARROYO_CHECKPOINT_BUCKET>"
```

Helm Chart를 설치 합니다:

```bash
helm install arroyo arroyo/arroyo -f values.yaml
```

설치가 완료되면 다음 Pod가 실행되는 것을 확인 할 수 있습니다:

```bash
$ kubectl get pods
NAME                                        READY   STATUS             RESTARTS      AGE
arroyo-compiler-ccd6b7bdb-752vt             1/1     Running            0             36s
arroyo-controller-75587f886b-k9drg          1/1     Running            1 (18s ago)   36s
arroyo-postgresql-0                         1/1     Running            0             26s
arroyo-api-5dccb89967-zl727                 1/1     Running            2 (17s ago)   36s
arroyo-prometheus-server-5c8d49b85d-xwl2h   2/2     Running            0             36s
```

아래와 같이 포트 포워딩으로 웹 UI에 접속 할 수 있습니다:

```bash
kubectl port-forward service/arroyo-api 8000:80
```

→ 웹 브라우저에서 [`http://localhost:8000`](http://localhost:8000) 접속

## 기본 사용법

### 연결 생성

Arroyo UI의 `Connections` 메뉴의 `Create Connection` 버튼을 클릭합니다. Arroyo는 다양한 커넥터를 지원합니다. 여기서는 데모를 위해 *Nexmark 연결*을 생성 합니다.

<p align="center">
<img src="https://img-src.io/taehun/getting-started-arroyo/3.png?w=800" alt="스크린샷">
</p>

- `Connections` → `Create Connection`→ Nexmark 카드 메뉴의 `Create` 클릭

그런 다음 원하는 이벤트 속도를 설정합니다. 이 튜토리얼에서는 초당 100개의 메시지로 충분하니, 100으로 설정하고 다른 필드는 비워 둡니다.

<p align="center">
<img src="https://img-src.io/taehun/getting-started-arroyo/4.png?w=800" alt="스크린샷">
</p>

- **Event rate (messages / sec):** `100` → `Next` 클릭

연결 이름을 `nexmark` 로 설정하고, 연결 테스트를 수행합니다. 연결이 이상 없으면, `Create` 버튼을 클릭하여 연결을 생성 합니다.

<p align="center">
<img src="https://img-src.io/taehun/getting-started-arroyo/5.png?w=800" alt="스크린샷">
</p>

- **Connection Name**: `nexmark` → `Test Connection` 클릭 → `Create` 클릭

### 스트리밍 파이프라인 만들기

데이터 소스 연결을 생성 하였으므로, 이제 SQL 쿼리를 작성하여 스트리밍 파이프라인을 구축 할 수 있습니다. 좌측 메뉴의 `Pipelines` 로 가서 `Create Pipeline` 을 클릭합니다.

<p align="center">
<img src="https://img-src.io/taehun/getting-started-arroyo/6.png?w=800" alt="스크린샷">
</p>

아래와 같이 간단한 쿼리를 작성해서 테스트 해 봅시다.

```sql
SELECT bid FROM nexmark WHERE bid IS NOT NULL;
```

- → `Start Preview` 클릭

<p align="center">
<img src="https://img-src.io/taehun/getting-started-arroyo/7.png?w=800" alt="스크린샷">
</p>

스트리밍 파이프라인은 어떤 식으로든 시간을 다루는 작업을 수반합니다. Arroyo는 데이터의 시간 특성에 대한 계산을 표현하는 몇 가지 다른 방법을 지원합니다. 시간을 기준으로 집계를 수행하기 위해 슬라이딩 창(SQL에서는 hop이라고 함)을 추가해 보겠습니다:

```sql
SELECT avg(bid.price) as avg_price
FROM nexmark
WHERE bid IS NOT NULL
GROUP BY hop(interval '2 seconds', interval '10 seconds');
```

<p align="center">
<img src="https://img-src.io/taehun/getting-started-arroyo/8.png?w=800" alt="스크린샷">
</p>

이 쿼리는 10초 크기의 슬라이딩 윈도우에서 집계 함수(`avg`)를 계산하여 2초마다 업데이트합니다. 이를 Preview로 확인 해보면 지난 10초 동안의 모든 입찰에 대한 평균 입찰가에 대한 결과를 2초마다 생성하는 등 예상한 대로 작동하는 것을 확인할 수 있습니다.

좀 더 복잡한 쿼리를 실행해 보겠습니다. 슬라이딩 윈도우에서 입찰 횟수별로 상위 5개 경매를 찾도록 요청하는 Nexmark 벤치마크의 쿼리를 작성해 보겠습니다.

```sql
SELECT * FROM (
    SELECT *, ROW_NUMBER() OVER (
        PARTITION BY window
        ORDER BY count DESC) AS row_num
    FROM (SELECT count(*) AS count, bid.auction AS auction,
        hop(interval '2 seconds', interval '60 seconds') AS window
            FROM nexmark WHERE bid is not null
            GROUP BY 2, window)) WHERE row_num <= 5
```


<p align="center">
<img src="https://img-src.io/taehun/getting-started-arroyo/9.png?w=800" alt="스크린샷">
</p>

SQL 쿼리로 작성한 파이프라인이 마음에 들면, 실제로 파이프라인을 실행할 수 있습니다. `Start Pipeline` 을 클릭하고 파이프라인 이름을 지정 합니다. (ex> `top_auctions`) `Start` 버튼을 클릭하여 파이프라인을 실행 합니다.

파이프라인이 실행되면, 데이터 흐름 그래프에서 노드를 클릭해 메트릭을 확인하고, 출력 탭에서 결과를 추적할 수 있습니다. Arroyo는 일관된 체크포인트를 통해 장애 복구를 지원하며, 파이프라인의 실행을 중지 및 시작할 수 있도록 제어 기능을 제공합니다.

<p align="center">
<img src="https://img-src.io/taehun/getting-started-arroyo/10.png?w=800" alt="스크린샷">
</p>

<p align="center">
<img src="https://img-src.io/taehun/getting-started-arroyo/11.png?w=800" alt="스크린샷">
</p>

## 참고자료

- <https://doc.arroyo.dev/>
- <https://www.arroyo.dev/blog/how-arroyo-beats-flink-at-sliding-windows>
- <https://www.arroyo.dev/blog/why-not-flink>
