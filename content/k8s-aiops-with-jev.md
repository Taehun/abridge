+++
title = "Jev를 활용한 k8s AIOps 설계"
date = 2026-10-09
draft = false

[taxonomies]
tags = ['AIOps', 'Kubernetes', 'Jev', 'LLM', 'SRE', 'Observability']

[extra]
author = "김태훈"
toc = true
+++

## 개요

쿠버네티스 클러스터를 운영하다 보면 알람 대응은 참 고역입니다. 로그, 메트릭, 트레이스를 꼼꼼히 수집할수록 알람은 늘어나는데, 새벽에 울린 알람을 열어 보면 절반은 이미 저절로 회복되어 있고, 나머지 절반은 Pod 재시작 한 번이면 끝나는 일인 경우가 많습니다.

관측성(Observability)은 이 세 가지 신호로 시스템 내부 상태를 추론하는 것을 말합니다. 메트릭은 에러율, 지연 시간, 리소스 사용량 같은 수치로 *무엇이* 나빠졌는지를, 로그는 그 시점에 애플리케이션이 남긴 기록으로 *왜* 그랬는지를, 트레이스는 요청이 거쳐 간 서비스 경로로 *어디서* 막혔는지를 보여줍니다. 운영자는 이 셋을 조합하여 장애 여부와 원인을 판단합니다.

정작 힘든 것은 알람의 개수보다 이 판단입니다. 이 알람이 진짜 장애인지, 누가 봐야 하는지, 지금 당장 무엇을 하면 되는지를 매번 사람이 처음부터 판단해야 합니다. 이런 판단은 상당 부분 반복되는 일이므로 자동화할 여지가 있습니다. 최근 공개된 판단 전용 모델인 [Jev](https://docs.typesafe.ai/introduction)와 vLLM으로 배포한 오픈소스 LLM을 활용하여 쿠버네티스 환경의 알람 처리를 자동화하는 AIOps 시스템을 설계해 보았습니다. 이 글은 그 설계 내용을 정리한 것 입니다. (실제 구축 사례가 아닌 설계안이므로, 임계값이나 세부 설정은 예시로 봐주시기 바랍니다.)

{{<img src="/images/aiops-jev-funnel.svg" alt="관측성 신호가 Rule, Jev, AI 조치 세 단계를 거치며 줄어드는 처리 흐름 다이어그램" w={880} h={460} caption="<i>그림 1. 관측성 신호의 단계별 처리 흐름</i>" />}}

<그림 1>은 전체 처리 흐름을 도식화한 것 입니다. 로그, 메트릭, 트레이스를 세 단계에 걸쳐 처리합니다:

1. **1차 Rule 필터링** 로그, 메트릭, 트레이스에서 노이즈를 규칙으로 걸러 냅니다.
2. **2차 Jev 라우팅** 남은 알람을 Jev가 분류하고, 어느 경로로 보낼지 정합니다.
3. **3차 AI 조치** 장애 유형에 따라 AI가 선조치 후 알리거나, LLM이 작성한 조치 가이드를 붙여 담당자에게 즉시 알립니다.

아래 단계로 내려갈수록 처리하는 신호의 양은 줄어들고, 대신 판단은 깊어지고 비용도 비싸집니다. 가장 비싼 LLM은 분석이 꼭 필요한 장애에만 사용합니다. 이와 별도로, 평소에는 인프라 설정을 주기적으로 점검하여 보안, 가용성, 확장성, 성능 개선점을 제안하는 에이전트를 하나 더 둡니다.

## 빅테크 회사들의 AIOps 사례

이런 구조가 새로운 것은 아닙니다. 인시던트 대응을 자동화해 온 빅테크 회사들이 공개한 자료를 살펴보면, 세부 구현은 다르지만 비슷한 구조가 반복적으로 나타납니다.

| 회사 | 공개된 사례 | 이 글에서의 위치 |
|---|---|---|
| Google | 증상(SLO 소진율)에만 알람을 걸고, 사람을 깨우는 알람은 반드시 조치 가능해야 한다 ([SRE Book](https://sre.google/sre-book/monitoring-distributed-systems/), [SRE Workbook](https://sre.google/workbook/alerting-on-slos/)) | 1차 Rule |
| Microsoft | [DeepTriage](https://arxiv.org/abs/2012.03665): 인시던트를 담당 팀에 자동 배정. 오배정 시 완화 시간 10배 | 2차 라우팅 |
| Microsoft | [RCACopilot](https://arxiv.org/abs/2305.15778): 알람 유형별 핸들러가 진단 정보 수집, LLM이 원인 카테고리 예측 (정확도 0.766) | 2차 + 3차 |
| Meta | [휴리스틱으로 후보를 수천→수백 개로 줄인 뒤 LLM이 top-5 선정](https://engineering.fb.com/2024/06/24/data-infrastructure/leveraging-ai-for-efficient-incident-response/). 적중률 42% | 전체 구조 |
| Netflix | [규칙 분류기 + ML](https://netflixtechblog.com/evolving-from-rule-based-classifier-machine-learning-powered-auto-remediation-in-netflix-data-039d5efd115b)로 Spark 메모리 설정 오류 56% 자동 조치 | 선조치 |
| Google | [Autopilot](https://research.google/pubs/autopilot-workload-autoscaling-at-google-scale/): 리소스 limit 자동 조정. 여유분 46%→23%, OOM 피해 작업 1/10 | 주기 점검 |

이 사례들에서 공통적으로 보이는 점은 세 가지입니다.

첫째, 값싼 단계가 먼저 후보를 좁힌 다음에 모델을 호출합니다. Meta는 휴리스틱으로 후보를 수천 개에서 수백 개로 줄인 뒤에야 LLM을 호출하고, Netflix도 규칙 분류기를 1차로 두고 ML은 규칙이 '메모리 설정 오류'로 분류한 작업의 설정값 추천(과 미분류 오류의 재시도 판단)에만 붙였습니다.

둘째, 원인 분석보다 라우팅을 먼저 해결합니다. Microsoft가 2017년부터 담당 팀 자동 배정 분류기를 운영해 온 이유는 잘못 배정된 인시던트는 완화까지 10배 가까이 오래 걸렸기 때문입니다. RCACopilot도 알람 유형별 핸들러로 유형에 맞는 진단 정보만 수집한 뒤 LLM에 넘깁니다.

셋째, LLM의 원인 분석은 아직 사람의 판단을 대체할 만큼 정확하지 않습니다. Meta가 공개한 42%는 top-5 기준의 백테스트 결과이고, 2026년 7월에 공개된 [ORCA-bench](https://arxiv.org/abs/2607.28545)에서는 현실적인 입력을 준 과제에서 최고 모델의 적중률이 25.3%에 그쳤습니다. 그래서 공개된 사례들은 하나같이 LLM의 역할을 '제안'까지로 제한하고, 실행은 사람의 승인이나 검증된 코드에 맡기고 있습니다.

이 글의 설계는 위 세 가지를 작은 팀 규모에 맞게 옮긴 것 입니다. 빅테크 회사들이 직접 만든 분류기와 핸들러 자리에 판단 전용 모델인 Jev와 오픈소스 LLM을 끼워 넣었습니다.

## Jev 소개

[Jev](https://docs.typesafe.ai/introduction)는 TypeSafe AI에서 공개한 "System One" 모델입니다. 이름처럼 사람이 몇 초 안에 내리는 직관적인 판단을 대신하는 모델로, 텍스트를 생성하지 않습니다. *상태(state)* 와 *타입이 정해진 질문* 을 보내면 코드에서 바로 사용할 수 있는 구조화된 답을 돌려줍니다. 질문 타입은 세 가지입니다:

- **Choice**: 보기 중 하나를 고릅니다. `choice`, `probabilities`, `confidence`를 돌려줍니다.
- **Score**: 기준표(rubric)의 단계 중 어디에 해당하는지를 기대 레벨(0 ~ 단계 수−1)로 매깁니다. `score`, `probabilities`, `confidence`를 돌려줍니다.
- **Noul**: 어떤 진술이 참인지 0~1 사이의 값으로 판정합니다.

여러 질문을 한 번에 보내면 각 질문이 병렬로 평가되므로, 질문을 늘려도 응답 시간은 거의 늘어나지 않습니다.

알람 라우팅은 "어떤 유형의 장애인가", "얼마나 심각한가", "런북으로 처리 가능한가"와 같은 좁고 빠른 판단의 연속입니다. 이런 용도로 범용 LLM을 사용하면 느리고, 출력을 파싱해야 하고, 답이 매번 조금씩 달라집니다. Jev는 빠르고 정해진 형식으로 답하는 대신 긴 추론이나 글쓰기는 하지 못하므로, 이 설계에서는 판단은 Jev에, 설명과 분석은 LLM에 맡겼습니다. (외부 API를 사용할 수 없는 폐쇄망 환경이라면 뒤에서 설명할 로컬 결정 모델로 대체할 수 있습니다.)

## 전체 구조

{{<img src="/images/aiops-jev-architecture.svg" alt="Jev 기반 k8s AIOps 전체 아키텍처 다이어그램" w={880} h={400} caption="<i>그림 2. Jev 기반 k8s AIOps 전체 구조</i>" />}}

<그림 2>는 전체 구조를 도식화한 것 입니다. 위쪽은 장애가 발생했을 때 동작하는 실시간 처리 흐름이고, 아래쪽은 장애가 나기 전에 설정을 개선하는 주기 점검 흐름입니다. 실시간 처리 흐름부터 단계별로 하나씩 살펴보겠습니다.

## 1차 처리 - Rule 기반 필터링

결정적인(deterministic) 규칙으로 충분한 일을 확률적인 모델에 맡길 이유는 없으므로, 1차 필터는 최대한 단순하게 구성합니다. 다만 [SRE Book](https://sre.google/sre-book/monitoring-distributed-systems/)의 원칙 하나는 그대로 가져왔습니다. 사람을 부르는 알람은 원인(cause)이 아니라 증상(symptom)에 걸어야 한다는 것 입니다.

Pod 재시작, OOMKilled, 노드 디스크 압박은 모두 원인 쪽 신호이고, 사용자에게 보이는 증상은 에러율과 지연 시간입니다. 그래서 1차 규칙에서는 증상 알람만 라우터로 보내고, 원인 신호는 알람이 아니라 *컨텍스트* 로 같이 전달하도록 구성하였습니다.

- **로그와 트레이스**: OpenTelemetry Collector의 필터 프로세서로 헬스체크나 DEBUG 로그와 같이 장애 판단에 필요 없는 신호를 수집 단계에서 버립니다. 트레이스는 `spanmetrics` 커넥터로 요청 수, 에러율, 지연 시간 지표로 변환하여 메트릭과 동일하게 처리합니다. 이때 `spanmetrics`는 샘플링 프로세서보다 앞에 두어야 요청 수와 에러율이 샘플링 비율만큼 왜곡되지 않습니다.
- **메트릭**: 증상 알람은 [SRE Workbook](https://sre.google/workbook/alerting-on-slos/)의 다중 윈도 소진율(multiwindow burn rate) 방식을 사용합니다. 긴 윈도(1시간)와 짧은 윈도(5분)가 모두 임계값을 넘을 때만 알람이 울리므로, 순간적으로 튀었다가 회복되는 신호는 대부분 여기서 걸러집니다.
- **원인 알람**: `KubePodCrashLooping`과 같은 원인 알람은 `severity: context` 라벨을 붙여 null 수신자 라우트로 사람 호출 경로에서 빼고, 라우터가 Alertmanager API에서 같은 네임스페이스의 것을 조회하여 상태에 붙입니다. Alertmanager는 다른 그룹의 알람을 통지에 첨부하지 못하지만, 억제된 알람도 API로는 조회할 수 있습니다.
- **Alertmanager**: `group_by`와 `inhibit_rules`로 같은 원인에서 발생한 알람을 묶고 하위 알람을 억제한 뒤, 수신자를 사람 대신 라우터의 웹훅으로 변경합니다. 단, 원인 알람으로 증상 알람을 억제하는 규칙은 라우터의 입력을 끊으므로 두지 않습니다.

여기까지는 기존 모니터링 스택을 그대로 사용하므로, 새로 개발하는 것은 웹훅 뒤에 있는 라우터뿐입니다.

## 2차 처리 - Jev 라우팅

라우터는 알람을 받으면 먼저 Jev에 보낼 상태(state)를 만듭니다. RCACopilot의 핸들러와 같은 역할로, 같은 네임스페이스의 원인 알람, 최근 쿠버네티스 이벤트, 해당 Pod의 마지막 로그 몇십 줄, 직전 배포 이력을 짧게 붙입니다. 그리고 Jev에 장애 유형, 심각도, 적용할 런북 세 가지를 동시에 질문하고, 그 답을 정책 코드에서 경로로 변환합니다.

```python
a = client.system_one(
    state=build_context(alert),  # 증상 알람 + 원인 알람 + 최근 이벤트 + 로그 요약 + 직전 배포
    questions={
        "category": Choice(instructions="이 장애의 유형",
                           criteria={"resource": "...", "deploy": "...", "dependency": "...",
                                     "infra": "...", "security": "..."}),
        "severity": Score(instructions="사용자에게 미치는 영향",  # 기대 레벨 0~3으로 반환
                          criteria=["영향 없음", "일부 기능 저하", "핵심 기능 장애", "전체 서비스 중단"]),
        "runbook": Choice(instructions="적용할 런북",
                          criteria={"restart": "...", "rollback": "...", "scale_out": "...",
                                    "cordon": "...", "none": "검증된 런북이 없다"}),
    },
).answers
cat, sev, rb = a["category"], a["severity"], a["runbook"]

if cat.confidence < 0.7 or cat.choice == "security" or sev.score >= 2.5:
    lane = "page"       # 애매하거나, 보안 이슈거나, 전체 서비스 중단이면 사람에게
elif rb.choice != "none" and stage.get((cat.choice, rb.choice)) == "auto" \
        and rb.confidence >= 0.8 and sev.score < 1.5:
    lane = "auto_fix"   # 선조치로 승격된 (유형, 런북) 조합 + 일부 기능 저하 이하
else:
    lane = "guide"      # LLM 조치 가이드 + 즉시 알람 (승인 후 실행 단계 포함)
```

Score는 0~1이 아니라 기준표의 기대 레벨(여기서는 0~3)로 돌아오므로, '일부 기능 저하'(1) 이하일 때만 자동 조치하고 '전체 서비스 중단'(3)에 가까우면 바로 사람을 부릅니다. `stage`는 장애 유형과 런북 조합별 승격 단계 테이블로, 3차 처리에서 설명합니다. 모델은 판단만 하고, 그 판단으로 무엇을 할지는 사람이 읽고 리뷰할 수 있는 정책 코드에 두었습니다. 신뢰도가 낮을 때는 추측하지 않고 사람에게 넘기는 것이 기본 원칙입니다.

임계값의 기준은 정확도가 아니라 오답의 비용입니다. 선조치 경로의 오답은 멀쩡한 서비스를 건드리지만 즉시 호출 경로의 오답은 사람을 한 번 더 깨울 뿐이므로, `auto_fix`는 높은 신뢰도와 낮은 심각도를 모두 요구하고 `page`는 낮은 신뢰도 하나만으로도 열리도록 하였습니다. 다만 Jev의 신뢰도는 답이 한 보기에 얼마나 몰렸는지를 나타내는 값이지 정답률이 아니므로, 0.7 같은 숫자는 경로별 정밀도를 재기 전에는 의미가 없습니다. 라우터는 결국 분류기이므로 경로별 정밀도와 재현율을 기록하고, 담당자가 경로를 수정한 기록은 라벨로 모아 임계값 재조정과 로컬 모델 학습에 활용합니다.

## 3차 처리 - AI 조치

경로는 세 가지입니다.

| 경로 | 언제 | 무엇을 | 담당자가 받는 것 |
|---|---|---|---|
| 선조치 후 알람 | 선조치로 승격된 유형×런북 조합 + 일부 기능 저하 이하 | 런북 자동 실행 → 결과 검증 | "이미 처리했다" + 원인 분석 |
| AI 조치 가이드 | 그 외. 승격 단계에 따라 알람의 실행 버튼으로 '승인 후 실행' | LLM이 원인 분석 + 조치 가이드 작성 | "이렇게 하면 된다" |
| 즉시 호출 | 신뢰도 낮음, 보안, 전체 서비스 중단 | 최소한의 컨텍스트만 붙여 바로 호출 | "지금 봐야 한다" |

### 선조치 후 알람

{{<img src="/images/aiops-jev-remediation.svg" alt="선조치 후 알람 처리 흐름 다이어그램" w={880} h={300} caption="<i>그림 3. 선조치 후 알람 처리 흐름</i>" />}}

<그림 3>은 선조치 경로의 처리 흐름입니다. 1차 필터를 통과한 로그, 트레이스, 메트릭 신호가 Jev 분류와 가드레일 검사를 통과하면 런북을 실행하고, 결과를 검증한 뒤 담당자에게 알립니다. SRE Book에서 말하듯 로봇 같은 대응으로 충분한 알람은 사람을 깨우면 안 되므로, 이 경로는 그 대응을 실제로 로봇에게 맡기는 곳입니다.

가장 편하지만 가장 위험한 경로이기도 하므로, AI가 실행할 명령을 직접 만들지는 못하게 하였습니다. AI는 미리 검증된 런북 중 하나를 고를 뿐이고, 실행 가능한 동작은 `rollout restart`, 한도 내의 HPA 스케일 아웃, 이전 리비전 롤백, 노드 cordon 정도로 제한합니다. 자동 조치는 소유자가 어노테이션(예: `aiops/auto-remediate: "true"`)으로 동의한 워크로드에만 적용하고, 시간당 횟수 제한, 최소 권한 RBAC, 감사 로그를 기본 가드레일로 둡니다. 알람 폭주에도 대비해야 합니다. 노드풀이나 DNS 장애처럼 증상 알람 수십 개가 한꺼번에 뜨면 자동 조치가 병렬로 실행되어 장애를 키울 수 있으므로, 짧은 시간에 증상 알람이 일정 수를 넘거나 `infra` 유형이 함께 떠 있으면 자동 조치를 멈추고 알람을 하나로 묶어 사람에게 보내며(서킷 브레이커), 네임스페이스당 동시 조치는 1건으로 제한합니다.

런북은 멱등하게 작성해야 합니다. Alertmanager는 웹훅이 실패하면 재시도하고 `repeat_interval`마다 같은 알람을 다시 보내므로, 라우터는 알람 fingerprint 단위로 조치 상태를 기록하고 롤백은 리비전을 고정해서 실행합니다. (`rollout undo`를 리비전 지정 없이 두 번 실행하면 장애 리비전으로 되돌아갑니다.) 런북마다 역동작과 TTL도 같이 정의합니다. cordon은 uncordon, 스케일 아웃은 원복이 짝이고, 역동작이 없거나 DB 마이그레이션이 섞인 배포는 자동 롤백 대상에서 뺍니다. GitOps로 동기화되는 필드(이미지, HPA 범위)를 건드리는 런북은 클러스터가 아니라 Git에 revert 커밋을 넣거나 해당 앱의 동기화를 잠시 멈춘 뒤 실행해야 합니다. 그렇지 않으면 ArgoCD의 selfHeal이 몇 초 만에 되돌립니다. (ArgoCD는 기본 3분마다 Git을 폴링하므로, revert 뒤에는 webhook이나 수동 sync로 바로 동기화하고 그 지연을 사후 검증 대기 시간에 포함합니다.) 사후 검증은 알람 객체의 해소가 아니라 짧은 윈도(5분) 소진율이 임계 아래로 몇 분간 유지되는지로 판단하고, 아니면 역동작을 실행한 뒤 사람을 호출합니다.

어디서부터 자동화할지는 [Netflix 사례](https://netflixtechblog.com/evolving-from-rule-based-classifier-machine-learning-powered-auto-remediation-in-netflix-data-039d5efd115b)가 좋은 기준이 됩니다. Netflix는 'Spark 메모리 설정 오류'라는 좁은 유형에서 시작하여 그 범위 안에서 56%를 사람 없이 처리하였고, 처음부터 모든 장애를 자동 조치하려 하지 않았습니다.

그래서 이 설계에서도 장애 유형과 런북의 조합마다 승격 단계(`stage`)를 두었습니다. 같은 `resource` 유형이라도 OOM에는 restart가 맞고 디스크 부족에는 맞지 않기 때문입니다. 모든 조합은 가이드 단계에서 시작하고, 몇 주 동안 LLM 가이드의 1번 조치가 담당자가 실제로 실행한 조치와 충분히 일치하면 '승인 후 실행'(가이드 알람의 실행 버튼)으로, 승인 단계에서 거절이나 롤백이 한동안 없으면 '선조치 후 알람'으로 올립니다. 롤백이 한 번이라도 발생하면 한 단계 내립니다. 담당자가 실제로 실행한 조치는 알람의 실행 버튼 기록과 kube-apiserver 감사 로그에서 자동으로 모읍니다. 조치가 끝나면 담당자는 새벽에 깨는 대신, 출근해서 조치 내역과 원인 분석을 확인하면 됩니다.

### AI 조치 가이드

{{<img src="/images/aiops-jev-guide.svg" alt="AI 조치 가이드 처리 흐름과 담당자 알람 예시 다이어그램" w={880} h={320} caption="<i>그림 4. AI 조치 가이드 처리 흐름과 알람 예시</i>" />}}

<그림 4>는 AI 조치 가이드 경로의 처리 흐름과 담당자가 받는 알람의 예시입니다. 자동 조치가 어려운 장애는 vLLM으로 배포한 오픈소스 LLM이 원인을 조사하고 조치 가이드를 작성합니다. Jev가 이미 장애 유형을 정해 두었으므로, `deploy` 유형이면 직전 배포 diff를, `dependency` 유형이면 트레이스와 외부 호출 에러율을 먼저 조회하도록 유형별 프롬프트와 읽기 전용 툴셋만 지정하면 됩니다. 조사 범위가 좁아지면 더 빠르고, 싸고, 정확해집니다. 조사 에이전트를 직접 만들기 부담스럽다면, CNCF Sandbox 프로젝트인 [HolmesGPT](https://www.cncf.io/blog/2026/01/07/holmesgpt-agentic-troubleshooting-built-for-the-cloud-native-era/)처럼 자체 호스팅 LLM을 연결할 수 있는 오픈소스 조사 에이전트를 사용하는 방법도 있습니다.

[Meta](https://engineering.fb.com/2024/06/24/data-infrastructure/leveraging-ai-for-efficient-incident-response/)가 근본 원인 후보를 제시할 때 지키는 원칙 두 가지도 가져왔습니다. 후보마다 왜 의심되는지 근거를 붙이고, 신뢰도가 낮은 후보는 아예 보여주지 않는 것 입니다. 이때 신뢰도는 LLM의 자기 보고가 아니라 후보마다 Jev Noul("이 후보가 원인이다")로 매긴 점수를 쓰므로, 라우터와 같은 방식으로 임계값을 맞출 수 있습니다. 틀린 후보는 담당자가 엉뚱한 곳을 파게 만들므로 아무것도 보여주지 않는 것보다 해롭습니다.

담당자는 알람을 열자마자 상황, 원인, 다음 행동을 한 화면에서 확인할 수 있고, 가이드를 실행할지는 사람이 정합니다. 가이드에 담긴 명령이 허용 목록 밖이면 표시만 하고 실행 버튼은 비활성화합니다. 조사하는 에이전트가 변경까지 하는 에이전트가 되지 않도록 두 역할을 분리하는 것이 중요합니다.

## 주기 점검 에이전트

장애 대응을 자동화하더라도 장애 자체가 줄어들지는 않습니다. 그래서 실시간 처리 흐름과는 별도로, 매주 클러스터 설정을 점검하는 에이전트를 하나 두었습니다.

{{<img src="/images/aiops-jev-auditor.svg" alt="주기 점검 에이전트 동작 흐름 다이어그램" w={880} h={290} caption="<i>그림 5. 주기 점검 에이전트 동작 흐름</i>" />}}

<그림 5>와 같이 수집, LLM 분석, Jev 우선순위 결정, 제안의 순서로 동작하고, 사람이 머지한 결과는 다음 주기에 반영됩니다.

이런 에이전트의 원형은 이미 있습니다. Google의 Borg에서는 [Autopilot](https://research.google/pubs/autopilot-workload-autoscaling-at-google-scale/)이 각 작업의 CPU, 메모리 limit을 과거 사용량에 맞춰 자동으로 조정하는데, 리소스 크기는 숫자로 풀리는 문제이므로 ML과 휴리스틱만으로 충분하였습니다. LLM이 보탤 수 있는 부분은 NetworkPolicy가 왜 없는지, PDB가 왜 빠졌는지처럼 매니페스트와 주변 맥락을 읽어야 알 수 있는 판단입니다.

**수집** 단계에서는 GitOps 저장소의 매니페스트, Trivy, Kyverno, kube-bench, Polaris와 같은 스캐너의 리포트, Prometheus의 실사용량 대비 requests/limits처럼 이미 사용하고 있는 도구의 결과를 재사용합니다. 결정적인 검사로 끝나는 항목은 스캐너가 찾고, **LLM 분석**은 그 발견에 맥락을 더하는 판단을 네 가지 관점으로 나누어 맡습니다.

| 관점 | 스캐너·PromQL이 찾는 것 | LLM이 더하는 판단 |
|---|---|---|
| 보안 | NetworkPolicy가 없는 네임스페이스 | 외부 Ingress가 붙어 실제로 노출되는지 |
| 가용성 | PDB 없는 핵심 서비스, 한 AZ에 몰린 Pod | 다른 서비스들의 단일 의존점인지 |
| 확장성 | HPA 최대치에 자주 닿는 워크로드 | 트래픽 성장 때문인지 비효율 때문인지 |
| 성능 | requests가 실사용의 5배인 서비스 | 배치 피크 대비인지 상시 과다 할당인지 |

LLM은 이런 발견을 수십 개씩 쏟아낼 수 있는데, 이것을 전부 담당자에게 보내면 그것도 노이즈가 됩니다. 그래서 여기서도 Jev로 발견마다 영향도, 수정 난이도, 변경 시 장애 위험을 점수 매겨 상위 몇 개만 고릅니다.

**결과물**은 주간 리포트와 GitOps 저장소 PR 초안입니다. 클러스터에 직접 적용하지 않고 PR로 남겨두면 리뷰와 롤백이 자연스럽게 따라오고, 머지된 변경은 다음 주기에 효과를 다시 확인할 수 있습니다. Autopilot 논문도 효과가 분명했는데도 널리 쓰이게 하는 데 알고리즘 품질 외에 상당한 신뢰 구축 작업이 필요했다고 하니, 이 에이전트의 성과 지표는 발견 건수가 아니라 *제안 수락률* 로 잡는 것이 맞다고 생각합니다.

## 폐쇄망 환경 대안

금융권이나 공공기관처럼 외부 API를 호출할 수 없는 환경도 많습니다. 이 설계에서 LLM은 이미 vLLM으로 배포한 오픈소스 모델이므로 그대로 폐쇄망에서 운영하면 되고, 외부 서비스에 의존하는 부분은 2차의 판단 모델인 Jev뿐입니다.

판단 모델은 llama.cpp가 2026년 10월에 추가한 [`/v1/systemone` 엔드포인트](https://huggingface.co/blog/ggml-org/decision-models-in-llamacpp)로 대체합니다. 상태와 타입이 정해진 질문을 보내면 선택지별 확률을 돌려주는, Jev와 같은 형태의 인터페이스라 질문 정의를 그대로 사용할 수 있습니다. 공개된 결정 모델 중 Julia-1(144M), Laya(421M), Kev-4B, Clef(27B)는 Apache 2.0 라이선스이고, OpenJev(27B)는 CC BY-NC 4.0이므로 상용 환경에서는 피해야 합니다.

다만 작은 공개 모델은 파인 튜닝 없이는 정확도가 낮고 신뢰도 보정도 따로 해야 합니다. [Laya 모델 카드](https://huggingface.co/convaiinnovations/laya)를 보면 제로샷 정확도 0.36은 다수 클래스 기준선(0.46)에도 못 미치지만 파인 튜닝 후 0.77로 오르고, 온도 보정으로 ECE가 0.466에서 0.081로 내려갑니다. 그래서 0.7과 같은 임계값은 모델을 바꾸면 다시 맞춰야 하고, 가이드 모드로 몇 주간 운영하며 모은 '담당자가 수정한 경로' 라벨이 바로 이 파인 튜닝과 보정에 사용됩니다. (모델 카드에 무료 T4 GPU로 돌아가는 파인 튜닝 노트북이 있습니다.) GPU가 없는 환경이라면 데이터가 충분히 쌓인 뒤 [DeepTriage](https://arxiv.org/abs/2012.03665)처럼 자체 인시던트 데이터로 학습한 분류기로 가는 방법도 있습니다. GBDT 같은 경량 모델이면 GPU 없이도 됩니다.

LLM도 마찬가지입니다. Meta가 Llama 2 7B를 내부 문서로 추가 사전학습한 뒤 과거 조사에서 만든 약 5,000개의 학습 예제로 파인 튜닝하여 42%(top-5, 백테스트)를 달성한 것처럼, 범용 성능보다는 자기 인프라의 장애 이력으로 모델을 조정하는 쪽이 더 중요합니다.

## 도입 순서와 측정 지표

- **작게 시작**: 처음에는 모든 경로를 '가이드'로만 운영합니다. 자동 조치를 했다면 어떻게 했을지를 기록만 하는 shadow 모드인 셈이고, 몇 주간 판단이 맞았던 유형과 런북 조합만 하나씩 승격 단계를 올립니다. 0.7, 0.8과 같은 임계값은 담당자가 분류를 수정한 기록으로 주기적으로 다시 맞춥니다.
- **입력 검증과 장애 대비**: 로그와 diff는 신뢰할 수 없는 입력으로 취급하여 길이를 제한하고 토큰과 개인정보를 마스킹한 뒤 전달합니다. (Jev도 외부 모델입니다.) 모델 호출이 실패하거나 느리면 라우터가 알람의 원래 severity로 바로 사람을 부르고, 라우터 자체가 죽는 경우는 Watchdog 알람으로 잡습니다.
- **측정 지표**: 온콜 1교대당 페이지 수, 선조치 정밀도(자동 조치 후 롤백 없이 해소된 비율), 알람 발생 후 쓸모 있는 컨텍스트가 처음 도착하기까지의 시간, 주기 점검 제안 수락률. 이 네 가지 숫자가 나아지지 않으면 AI를 붙인 의미가 없습니다.

## 결론

AIOps라고 하면 AI가 모든 것을 알아서 처리하는 그림을 떠올리기 쉽지만, 제가 기대하는 효과는 그보다 소박합니다. 새벽에 깰 필요 없는 알람을 줄이고, 깨야 하는 알람에는 원인과 다음 행동을 붙여주고, 같은 장애가 반복되지 않도록 설정을 조금씩 고쳐 나가는 것 입니다. 빅테크 회사들의 공개 사례도 결국 이 세 가지를 수년에 걸쳐 쌓아 올린 것이었습니다.

Jev와 같이 판단에 특화된 모델이 나오면서, 그중 분류와 라우팅 단계는 작은 팀에서도 충분히 빠르고 예측 가능하게 만들 수 있게 되었다고 생각합니다. 다만 Jev는 외부 API를 호출해야 한다는 한계가 있습니다. 알람과 로그를 외부로 내보내기 어려운 환경이라면 Laya와 같은 오픈소스 대체 모델을 자기 알람 이력으로 파인 튜닝해서 같은 자리에 쓰면 됩니다. 인터페이스가 같으므로 라우터 코드는 그대로 두고 호출 대상만 바꾸면 되고, 가이드 모드로 운영하면서 모은 라벨이 그대로 파인 튜닝 데이터가 됩니다.

쿠버네티스 환경의 알람 대응에 지치신 분들이라면, 모든 것을 한 번에 자동화하기보다 1차 규칙 정리와 가이드 경로부터 시작해 보시는 것을 추천합니다.

## 참고자료

- [Jev Introduction - TypeSafe AI](https://docs.typesafe.ai/introduction)
- [Site Reliability Engineering, Ch.6 Monitoring Distributed Systems - Google](https://sre.google/sre-book/monitoring-distributed-systems/)
- [The Site Reliability Workbook, Ch.5 Alerting on SLOs - Google](https://sre.google/workbook/alerting-on-slos/)
- [DeepTriage: Automated Transfer Assistance for Incidents in Cloud Services - Microsoft](https://arxiv.org/abs/2012.03665)
- [Automatic Root Cause Analysis via Large Language Models for Cloud Incidents (RCACopilot) - Microsoft](https://arxiv.org/abs/2305.15778)
- [Leveraging AI for efficient incident response - Meta](https://engineering.fb.com/2024/06/24/data-infrastructure/leveraging-ai-for-efficient-incident-response/)
- [Evolving from Rule-based Classifier: Machine Learning Powered Auto Remediation in Netflix Data Platform - Netflix](https://netflixtechblog.com/evolving-from-rule-based-classifier-machine-learning-powered-auto-remediation-in-netflix-data-039d5efd115b)
- [Autopilot: Workload Autoscaling at Google Scale - Google](https://research.google/pubs/autopilot-workload-autoscaling-at-google-scale/)
- [ORCA-bench: How Ready Are Language Model Agents for Oncall?](https://arxiv.org/abs/2607.28545)
- [HolmesGPT: Agentic troubleshooting built for the cloud native era - CNCF](https://www.cncf.io/blog/2026/01/07/holmesgpt-agentic-troubleshooting-built-for-the-cloud-native-era/)
- [New in llama.cpp: Decision Models - ggml-org](https://huggingface.co/blog/ggml-org/decision-models-in-llamacpp)
- [Laya 모델 카드 - Convai Innovations](https://huggingface.co/convaiinnovations/laya)
