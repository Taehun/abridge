+++
title = "AI를 만드는 AI에 대한 생각"
date = 2026-06-23
draft = false

[taxonomies]
tags = ['agentic AI', 'AI agents', 'self-improving', 'AIOps', 'LLM']

[extra]
author = "김태훈"
toc = true
+++

<figure style="margin:0;text-align:center">
    <img src="https://img-src.io/i/taehun/AI-for-AI.webp" alt="AI-for-AI" style="max-width:100%;height:auto">
    <figcaption>
        <i><del>터미네이터</del></i>
    </figcaption>
</figure>

> <em>"모바일 게임을 만들고 싶어."</em> 이 한 문장만 던지면, 요구사항을 알아서 되묻고, 게임 기획·디자인·개발·테스트·QA가 포함된 에이전틱 AI 시스템을 스스로 만들고, 배포와 운영까지 이어 가는 시스템을 만들 수는 없을까?

요즘 코딩 에이전트는 한 번의 프롬프트로 꽤 오래 작업합니다. 그래도 끝까지 사람 손을 타지 않는 건 아닙니다. 요구사항을 다시 정리하고, 구조를 바꾸고, 막히는 지점에서 방향을 잡는 일은 아직 사람 몫입니다.

최근 바이브 코딩을 하다가 이런 생각이 들었습니다. <em>'코드를 대신 짜 주는 에이전트를 넘어서, 필요한 에이전트 자체를 설계하고 개선하는 시스템이 있으면 어떨까?'</em>

이 생각은 에이전트 설계 자동화로 자연스럽게 이어졌습니다. 과연 현재는 사람이 직접 하는 에이전트 개발을 AI(에이전트)가 직접 탐색하고 개선하게 만들 수 있을까요?

이 글은 그 가능성에 대한 생각입니다. "AI가 코드를 대신 짜 준다"를 넘어서, "AI가 필요한 AI 시스템 자체를 직접 설계한다"는 관점에서 흐름을 살펴봅니다.

## 무엇을 자동화하는가

LLM 에이전트 시스템은 대략 네 개의 층위로 나눌 수 있습니다.

1. **프롬프트(prompt)** — 개별 LLM 호출의 지시문과 few-shot 예시
2. **모듈(module)** — Planning, Reasoning, Tool Use, Memory 같은 기능 단위
3. **워크플로/토폴로지(workflow / topology)** — 모듈과 에이전트를 잇는 제어 흐름
4. **메타-시스템(meta-system)** — 위 세 층위를 생성하고 수정하는 상위 시스템

전통적인 프롬프트 엔지니어링은 1번을 다룹니다. ChatDev, MetaGPT 같은 멀티에이전트 프레임워크는 2번과 3번을 사람이 설계합니다. 제가 관심 있는 지점은 그다음 단계입니다. 프롬프트만이 아니라, 역할과 구조와 워크플로까지 AI가 탐색하게 만드는 것입니다.

이때 탐색의 대상은 <em>답</em>이 아닙니다. 답을 만들어 내는 <em>시스템</em>입니다.

이런 관점에서 에이전트를 코드로 정의하는 접근이 중요해집니다. 에이전트를 자연어 설명이 아니라 실행 가능한 코드로 표현하면, 프롬프트, 도구 사용, 제어 흐름, 새로운 빌딩 블록까지 모두 탐색 대상이 됩니다. 탐색 공간은 훨씬 커지지만, 그만큼 사람이 생각하지 못한 구조도 나올 수 있습니다.

우리가 원하는 "추상적 목표 → 완성된 시스템" 흐름도 결국 이 네 층위를 모두 지나갑니다. 요구사항을 뽑고, 팀 구조를 만들고, 코드를 작성하고, 운영 결과를 보고 다시 설계를 고칩니다. 핵심은 이 과정을 하나의 자동 설계 루프로 묶을 수 있느냐입니다.

## 에이전트 자동 설계 시스템의 세 요소

흩어져 있는 연구들을 한데 묶어 보면, 에이전트 자동 설계는 거의 항상 세 요소로 정리됩니다.

- **표현(representation)** — 후보 에이전트를 어떤 형식으로 나타낼 것인가. 프롬프트, 계산 그래프, 모듈 조합, 실행 가능한 코드가 모두 후보입니다.
- **탐색(search)** — 현재 후보에서 다음 후보로 어떻게 이동할 것인가. 진화적 변이, 트리 탐색, 정책 그래디언트, LLM 기반 코드 생성이 여기에 들어갑니다.
- **평가(evaluation)** — 무엇이 더 나은지를 어떻게 판단할 것인가. 벤치마크 점수, 비용, 지연시간, 사용자 지표, 주관적 품질이 모두 평가 신호가 될 수 있습니다.

이 세 요소 중 하나라도 약하면 전체 시스템이 흔들립니다. 특히 평가가 중요합니다. 탐색이 아무리 창의적이어도, 평가가 잘못되면 시스템은 엉뚱한 방향으로 똑똑해집니다.

간단한 의사코드로 쓰면 기본 루프는 다음과 같습니다.

```python
archive = seed_with_known_patterns()

while budget_remains():
    parents = select(archive, by=score, diversity=behavior_descriptor)
    context = parents.code + parents.score + parents.failure_traces
    child = meta_agent.write_code(context)
    fitness = evaluate(child)
    archive.add(child, fitness, behavior_descriptor(child))

return pareto_front(archive)
```

이 루프에서 중요한 줄은 두 개입니다. `write_code`는 새 후보를 만듭니다. `evaluate`는 그 후보가 좋아졌는지 판단합니다. 전자는 발명에 가깝고, 후자는 선별에 가깝습니다. 둘 중 하나만 좋아서는 안 됩니다.

`archive`도 중요합니다. 좋은 후보를 버리지 않고 쌓아 두어야 다음 세대의 기반이 됩니다. 이때 단일 1등만 남기면 금방 국소 최적에 갇힙니다. 빠른 후보, 싼 후보, 정확한 후보처럼 서로 다른 장점을 가진 후보들을 같이 보존해야 합니다. 뒤에서 말할 품질-다양성(Quality-Diversity) 탐색이 필요한 이유입니다.

{{ img(src="/images/meta-agent-loop.svg", alt="에이전트 자동 설계 핵심 탐색 루프 다이어그램", w=880, h=340, caption="<i>그림 1. 에이전트 자동 설계의 핵심 탐색 루프. 아카이브에서 후보를 고르고, LLM이 변이를 만들고, 평가를 통과한 후보를 다시 아카이브에 보존한다. Meta Agent Search[1]의 골격을 일반화한 도식.</i>") }}

## 관련 연구: 프롬프트 자동화에서 자기개선까지

관련 연구를 읽다 보면 비슷한 문제를 서로 다른 이름으로 부르는 경우가 많습니다. Hu, Lu, Clune은 에이전트 설계 자체를 자동화하는 연구 방향을 **Automated Design of Agentic Systems(ADAS)** 라고 불렀습니다 [[1]](https://arxiv.org/abs/2408.08435). 이 안에서 다른 에이전트를 설계하고 개선하는 상위 에이전트를 보통 **메타-에이전트(meta-agent)** 라고 부릅니다. 한편 에이전트가 경험을 바탕으로 자기 행동이나 구조를 계속 바꾸는 흐름은 **self-improvement agents**, **self-evolving agents** 같은 이름으로도 정리됩니다.

용어는 조금씩 다르지만 방향은 이어져 있습니다. 처음에는 프롬프트를 자동화했습니다. 그다음에는 역할과 연결 구조를 자동화했습니다. 이후에는 워크플로와 코드 전체가 탐색 대상이 되었습니다. 최근에는 시스템이 자기 자신을 고치는 방향으로 확장되고 있습니다.

### 2023: 프롬프트와 역할을 자동화하다

출발점은 프롬프트였습니다. LLM 파이프라인의 성능은 프롬프트와 few-shot 예시에 크게 좌우됩니다. 그런데 이 작업은 대부분 사람이 시행착오로 했습니다.

DSPy는 이 문제를 정면으로 다룹니다. 프롬프트 문자열을 손으로 깎는 대신, LM 파이프라인을 선언적 모듈의 그래프로 표현하고, 컴파일러가 주어진 메트릭을 최대화하도록 프롬프트와 few-shot 데모를 자동으로 찾습니다 [[2]](https://arxiv.org/abs/2310.03714). 프롬프트 엔지니어링을 감각의 문제가 아니라 최적화 문제로 바꾼 것입니다.

하지만 DSPy는 큰 구조를 바꾸지는 않습니다. 사용자가 정의한 파이프라인은 그대로 두고, 그 안의 프롬프트와 예시만 개선합니다. 그러면 다음 질문이 생깁니다. 프롬프트를 자동으로 고칠 수 있다면, 역할과 팀 구성도 자동으로 만들 수 있지 않을까?

AutoAgents는 이 지점을 건드립니다. 기존 멀티에이전트 시스템은 역할 목록을 사람이 미리 정했습니다. AutoAgents는 태스크에 따라 필요한 전문가 에이전트들을 동적으로 만들고, 관찰자(observer)가 계획과 응답을 성찰하게 합니다 [[6]](https://arxiv.org/abs/2309.17288). DSPy가 "프롬프트를 손으로 쓰지 말자"였다면, AutoAgents는 "역할도 손으로 고정하지 말자"에 가깝습니다.

같은 해의 Reflexion과 Voyager는 다른 힌트를 줍니다. Reflexion은 실패를 언어 피드백으로 정리해 다음 시도에 활용합니다 [[7]](https://arxiv.org/abs/2303.11366). Voyager는 Minecraft에서 실행 가능한 코드 스킬을 라이브러리로 쌓아 갑니다 [[8]](https://arxiv.org/abs/2305.16291). 둘 다 자동 설계 자체가 목적은 아니지만, 중요한 공통점을 보여 줍니다. 모델 가중치를 다시 학습하지 않아도, 경험을 텍스트나 코드로 축적하면 에이전트는 계속 나아질 수 있습니다.

### 2024: 구조 자체를 탐색 대상으로 올리다

2023년 연구의 한계는 분명했습니다. 프롬프트와 역할은 자동화되기 시작했지만, 큰 구조는 여전히 사람이 정했습니다. 2024년 연구들은 이 문제를 직접 겨냥합니다.

GPTSwarm은 에이전트를 최적화 가능한 계산 그래프로 봅니다 [[3]](https://arxiv.org/abs/2402.16823). 노드는 LLM 호출이나 데이터 처리 함수이고, 에지는 정보 흐름입니다. 노드 수준에서는 프롬프트를 다듬고, 에지 수준에서는 연결 확률을 학습합니다. DSPy가 고정된 그래프 안의 프롬프트를 최적화했다면, GPTSwarm은 그래프의 연결까지 최적화 대상으로 넓힌 셈입니다.

{{ img(src="/images/gptswarm-graph.svg", alt="GPTSwarm 계산 그래프와 노드·에지 최적화 다이어그램", w=820, h=340, caption="<i>그림 2. GPTSwarm의 최적화 가능한 계산 그래프 개념 재현[3]. 노드는 LLM 질의나 처리 함수이고, 에지는 정보 흐름이다. 노드 최적화는 프롬프트를 다듬고, 에지 최적화는 연결 구조를 조정한다.</i>") }}

AgentSquare는 연결될 부품을 더 체계적으로 정리합니다. 기존 에이전트들을 Planning, Reasoning, Tool Use, Memory 같은 모듈로 나누고, 통일된 인터페이스 위에서 모듈 진화와 재조합을 수행합니다 [[4]](https://arxiv.org/abs/2410.06153). GPTSwarm이 "어떻게 연결할 것인가"를 열었다면, AgentSquare는 "무엇을 연결할 것인가"를 정리한 셈입니다.

하지만 그래프와 모듈은 탐색을 쉽게 만드는 대신 발명의 범위를 좁힐 수 있습니다. 사람이 정한 모듈 밖의 새로운 제어 흐름은 찾기 어렵습니다. AFlow는 이 제약을 풀기 위해 워크플로를 코드로 표현하고, 몬테카를로 트리 탐색(MCTS)을 적용합니다 [[5]](https://arxiv.org/abs/2410.10762). Generate, Review, Revise, Ensemble, Test 같은 연산자를 코드 수준에서 조합하고, 실행 결과로 탐색을 갱신합니다.

그다음 단계가 ADAS와 Meta Agent Search입니다 [[1]](https://arxiv.org/abs/2408.08435). 여기서는 에이전트 전체를 코드로 정의합니다. 이전 후보들의 코드와 점수가 아카이브에 쌓이고, 메타-에이전트가 그 기록을 읽고 다음 후보를 코드로 작성합니다. 이후 벤치마크로 평가하고, 좋은 후보를 다시 아카이브에 넣습니다.

2024년 흐름을 한 문장으로 줄이면 이렇습니다. DSPy는 프롬프트를, GPTSwarm은 연결을, AgentSquare는 모듈 조합을, AFlow는 워크플로 코드를, ADAS는 에이전트 프로그램 전체를 탐색 대상으로 올렸습니다. 표현의 자유도가 커질수록 탐색은 어려워졌고, 그 어려움을 버티게 한 장치가 아카이브, 변이, 평가였습니다.

### 2025: 자기 자신을 탐색 대상으로 삼다

2024년까지의 질문은 "더 나은 에이전트를 어떻게 설계할 것인가"였습니다. 2025년에는 질문이 한 단계 바뀝니다. "그 설계자 자신도 개선할 수 있는가?"입니다. 이때부터 논의는 self-improvement agents, self-evolving agents 쪽으로 넘어갑니다.

Gödel Agent는 이 방향의 직접적인 시도입니다 [[9]](https://arxiv.org/abs/2410.04444). Gödel machine에서 영감을 받아, 에이전트가 자기 자신의 로직과 행동을 동적으로 수정합니다. 원조 Gödel machine은 자기수정이 기대 효용을 높인다는 형식적 증명을 요구했습니다. 현실의 LLM 에이전트에서 그런 증명은 어렵습니다. 그래서 Gödel Agent는 이 요구를 LLM 기반 자기수정과 환경 피드백으로 완화합니다.

하지만 핵심 문제는 그대로 남습니다. 자기수정이 정말 좋아졌는지는 무엇으로 판단할 것인가?

DGM은 이 문제를 경험적 평가로 우회합니다 [[10]](https://arxiv.org/abs/2505.22954). 증명 대신 <em>해 보고 살아남으면 보존</em>합니다. 하나의 코딩 에이전트에서 출발해, 아카이브에서 개체를 고르고, LLM이 코드를 변이시키고, 코딩 벤치마크 점수로 보존 여부를 결정합니다. 구조적으로 보면 Meta Agent Search의 후속 진화입니다. 차이는 개선 대상이 "다른 에이전트"에서 "자기 자신을 고치는 에이전트"로 바뀌었다는 점입니다.

{{ img(src="/images/dgm-evolution.svg", alt="Darwin Gödel Machine의 열린 진화 트리 다이어그램", w=760, h=360, caption="<i>그림 3. Darwin Gödel Machine의 열린 진화 개념 재현[10]. 단일 best로 수렴하지 않고, 다양한 기반을 보존해야 나중의 도약이 가능하다는 아이디어를 보여 준다.</i>") }}

AlphaEvolve는 같은 패턴을 더 큰 규모로 보여 줍니다 [[11]](https://arxiv.org/abs/2506.13131). LLM 앙상블이 알고리즘 코드를 변형하고, 평가기가 성능을 자동 채점하고, 좋은 후보가 다음 세대의 기반이 됩니다. 저자 보고에 따르면 4x4 복소수 행렬 곱셈을 48회의 스칼라 곱으로 푸는 절차를 발견했고, 데이터센터 스케줄링 같은 실제 최적화에도 적용되었습니다.

AlphaEvolve가 주는 메시지는 분명합니다. "코드로 표현된 후보 → LLM 변이 → 자동 평가 → 아카이브 보존"이라는 ADAS의 핵심 레시피는 장난감 벤치마크를 넘어 실제 알고리즘 발견에도 적용될 수 있습니다. 다만 성공 조건도 같이 드러납니다. 행렬 곱셈이든 스케줄링이든, 결국 기계가 빠르게 채점할 수 있는 도메인이었습니다.

### 2026: 공동진화, 감독, 목표의 진화

2025년이 "자기개선이 가능하다"를 보여 준 해였다면, 2026년 연구들은 다음 병목을 봅니다. 루프를 더 크게 만들면 어디서 막히는가?

먼저 MetaAgent-X는 기존 자동 멀티에이전트 시스템이 "디자이너는 바꾸지만 실행 에이전트는 고정한다"는 한계에 막혀 있다고 지적합니다 [[19]](https://arxiv.org/abs/2605.14212). 이를 frozen-executor ceiling이라고 부릅니다. MetaAgent-X는 디자이너와 실행자를 함께 최적화하는 end-to-end reinforcement learning 프레임워크를 제안합니다. 설계자만 똑똑해지는 것이 아니라, 실행자까지 같이 학습시키려는 시도입니다.

GEA는 또 다른 병목을 짚습니다 [[20]](https://arxiv.org/abs/2602.04837). 열린 진화는 보통 여러 가지로 갈라집니다. 그런데 각 가지가 얻은 경험이 다른 가지로 잘 넘어가지 않습니다. GEA는 단일 에이전트가 아니라 에이전트 집단을 진화의 기본 단위로 두고, 집단 내부에서 경험을 공유하게 합니다. 2025년 연구들이 "좋은 기반을 버리지 말라"고 했다면, GEA는 "기반 사이의 교류도 설계하라"고 말하는 셈입니다.

성능만으로는 충분하지 않다는 반론도 본격화됩니다. ANCHOR는 self-evolving system에 인간 유사 감독(human-like oversight)을 넣어 안전 드리프트와 성능 붕괴를 줄이려 합니다 [[21]](https://arxiv.org/abs/2606.06114). 특히 출력 검증 단계의 감독이 중요하다는 분석은 이 글의 핵심 주장과도 맞닿습니다. 병목은 자주 모델의 창의성이 아니라 평가와 감독입니다.

마지막으로 Self-Evolving Software Agents는 진화의 범위를 코드와 행동에서 목표 자체로 넓힙니다 [[22]](https://arxiv.org/abs/2604.27264). BDI reasoning과 LLM을 결합해, 에이전트가 실행 코드뿐 아니라 새로운 요구사항과 목표까지 경험에서 끌어낼 수 있다고 봅니다. ADAS가 "주어진 목표를 잘 수행하는 구조"를 찾는 데서 출발했다면, 이제는 "무엇을 목표로 삼을 것인가"까지 탐색 대상으로 들어오기 시작한 것입니다.

여기까지 오면 레시피는 더 선명해집니다. 개선 대상을 코드나 텍스트로 바깥에 꺼내 놓고, 변이를 만들고, 자동 평가로 적합도를 매기고, 살아남은 변이를 아카이브에 쌓습니다. 그리고 루프가 커질수록 공동진화, 감독, 목표 진화까지 같이 설계해야 합니다.

## 이런 시스템을 구현한다면

연구 흐름을 실제 시스템 설계로 옮기면, 중요한 결정은 크게 여덟 가지입니다.

### ① 표현: 코드-as-에이전트를 기본값으로

후보 에이전트는 실행 가능한 코드로 표현하는 편이 가장 일반적입니다. Python 클래스, LangGraph 그래프 정의, 워크플로 코드가 모두 가능합니다. 코드는 버전 관리가 쉽고, 롤백이 가능하며, 평가 하니스에 바로 넣을 수 있습니다.

다만 완전히 자유로운 코드는 탐색이 어렵습니다. 그래서 `Generate`, `Reflect`, `Debate`, `Ensemble`, `ToolUse`, `Verify` 같은 연산자 라이브러리를 함께 두는 편이 현실적입니다 [[5]](https://arxiv.org/abs/2410.10762). 자유 코드의 발명력과 모듈 기반 탐색의 효율 사이에서 중간 지점을 잡는 방식입니다.

### ② 탐색: 진화 + Quality-Diversity

기본 골격은 `아카이브 + 변이 + 선택`입니다. 다만 단일 best 하나만 남기면 쉽게 갇힙니다. 비용은 낮지만 정확도가 낮은 후보, 느리지만 정확한 후보, 구조는 복잡하지만 새로운 전략을 가진 후보를 같이 보존해야 합니다.

그래서 MAP-Elites 같은 품질-다양성(Quality-Diversity) 탐색이 잘 맞습니다. 점수 1등 하나만 남기는 것이 아니라, 서로 다른 행동 특성별로 엘리트를 보존합니다.

```python
def select(archive):
    grid = bucketize(archive, dims=["token_cost", "latency", "topology_complexity"])
    return weighted_sample(grid.elites, toward=high_score)
```

이렇게 하면 "빠른 후보"와 "정확한 후보"가 동시에 살아남습니다. 나중에 둘을 재조합해 "빠르면서 정확한 후보"를 만들 가능성도 생깁니다.

### ③ 평가: 가장 중요하고 가장 어렵다

평가는 이 자동 설계 루프의 병목입니다. 닫힌 검증이 가능한 문제는 비교적 쉽습니다. 컴파일이 되는지, 테스트를 통과하는지, 정답이 맞는지 확인하면 됩니다. 문제는 "좋은 게임", "좋은 UX", "좋은 기획"처럼 주관적이고 복합적인 목표입니다.

이런 목표는 바로 점수화하기 어렵습니다. 그래서 대리 지표로 쪼개야 합니다.

- **행동 지표** — 자동 플레이테스트의 클리어율, 실패 곡선, 막힘 빈도
- **루브릭 점수** — LLM-as-judge가 목표 명료성, 피드백, 진행감을 평가
- **실사용 지표** — D1/D7 리텐션, 세션 길이, 이탈 지점, 크래시율

이 세 층은 비용 순서대로 써야 합니다. 먼저 싼 자동 검증으로 거르고, 살아남은 후보만 LLM judge로 평가하고, 최종 후보만 실제 사용자 지표로 확인합니다.

```python
def evaluate(agent, budget):
    if not passes_closed_checks(agent):
        return Fitness(score=0)

    rubric = llm_judge_ensemble(agent, models=[m1, m2, m3], rubrics=R)
    if rubric.percentile < THRESH:
        return Fitness(score=rubric)

    live = ab_test(agent, metrics=["D7_retention", "session_len", "crash_rate"])
    return reconcile(rubric, live)
```

여기서 중요한 원칙은 단순합니다. 실사용 지표를 최상위 권위로 두고, 모델 판정은 후보를 거르는 용도로 쓰는 편이 안전합니다. 루브릭 점수는 높은데 실제 사용자가 떠난다면, 모델보다 사용자를 믿어야 합니다.

### ④ 콜드스타트: 검증된 패턴으로 시작하기

빈 아카이브에서 무작위로 시작하는 것은 낭비입니다. ReAct, Reflexion, Self-Consistency, Debate, Plan-and-Solve 같은 검증된 패턴을 seed agent로 넣고 시작하는 편이 낫습니다. DGM이 단일 코딩 에이전트에서 출발한 것과 같은 발상입니다 [[10]](https://arxiv.org/abs/2505.22954).

좋은 씨앗은 탐색의 출발점을 "쓸 만한 동네"로 옮겨 줍니다. 다만 너무 강한 씨앗은 탐색을 그 주변에 가둘 수 있습니다. 그래서 강한 seed와 다양성 보존은 같이 설계해야 합니다.

### ⑤ 자기개선은 중첩 루프로

자기개선은 하나의 루프로 보면 비용이 폭발합니다. 시간 척도를 나눠야 합니다.

- 안쪽 루프: 한 산출물 안에서 테스트를 통과할 때까지 도는 디버깅
- 중간 루프: 한 태스크에 대한 워크플로와 토폴로지 최적화
- 바깥 루프: 운영 신호를 보고 시스템 설계 자체를 갱신하는 진화

바깥 루프 한 번은 안쪽 루프 수백 번을 품을 수 있습니다. 그래서 느린 루프일수록 더 엄격한 평가와 승인 절차가 필요합니다.

### ⑥ 운영 신호를 적합도로 피드백

이런 시스템이 실제 제품에 들어가려면 운영 신호가 적합도로 들어와야 합니다. 오류율, 지연시간, RCA 결과, 리텐션, 크래시 로그 같은 데이터가 바깥 루프의 평가 신호가 됩니다 [[15]](https://arxiv.org/abs/2406.11213), [[16]](https://arxiv.org/abs/2403.04123).

운영 신호는 실세계 타당도가 높습니다. 하지만 느리고, 노이즈가 많고, 보상 해킹의 표적이 될 수 있습니다. 리텐션만 최적화하면 재미가 아니라 중독을 최적화할 수도 있습니다. 그래서 A/B 무작위화, 가드레일 지표, 롤백 전략이 같이 필요합니다.

### ⑦ 자기수정에는 안전장치가 필요하다

코드를 실행하고 수정하는 시스템은 반드시 격리되어야 합니다. 샌드박스, 권한 제한, 인간 승인 게이트, 카나리 배포, 자동 롤백, 불변 감사 로그가 기본값이어야 합니다.

"AI가 자기 코드를 프로덕션에 푼다"는 시나리오는 매력적이지만 위험합니다. 자기참조 능력이 강해질수록 안전장치도 같은 속도로 강해져야 합니다.

### ⑧ 구현 스택은 현실적으로 묶기

오케스트레이션은 LangGraph, CrewAI, Claude Agent SDK 같은 도구를 쓸 수 있습니다. 평가는 격리 샌드박스와 결정론적 테스트 러너가 필요합니다. 아카이브는 git과 메타데이터 DB, 벡터 DB를 함께 쓰는 방식이 현실적입니다. 관측은 OpenTelemetry로 모으고, 운영 신호는 적합도 함수로 피드백합니다.

요약하면 이 흐름의 성패는 모델 크기보다 엔지니어링에 가깝습니다. 탐색을 어떻게 표현하고, 무엇으로 평가하고, 좋은 후보를 어떻게 보존할 것인가가 핵심입니다.

## 에이전트 자동 설계 파이프라인의 컴포넌트

이런 자동 설계 시스템은 혼자 완성되지 않습니다. 여러 컴포넌트를 조립하고, 그 컴포넌트의 결과를 다시 평가 신호로 사용해야 합니다.

<strong>입력 컴포넌트 — 명세화.</strong> "모바일 게임을 만들고 싶어"처럼 일부러 모호한 입력에서 시작한다면, 첫 관문은 자율 실행이 아니라 요구사항 명료화입니다. ClarifyGPT는 요구사항이 모호한지 판단하고, 모호할 때만 표적화된 질문을 생성합니다 [[14]](https://arxiv.org/abs/2310.10996). 자동 설계 루프에서 명세는 곧 목표 함수입니다. 명세가 흐리면 평가도 흐려집니다.

<strong>출력 컴포넌트 — 멀티에이전트 개발 팀.</strong> 명세가 확정되면 실제 산출물을 만들어야 합니다. ChatDev는 역할별 에이전트가 대화 체인으로 협업하며 소프트웨어를 개발합니다 [[12]](https://arxiv.org/abs/2307.07924). MetaGPT는 인간의 표준운영절차(SOP)를 프롬프트로 인코딩해 조립라인처럼 역할을 나눕니다 [[13]](https://arxiv.org/abs/2308.00352). 다만 이들은 보통 사람이 토폴로지를 고정한 시스템입니다. 이 글에서 상상하는 자동 설계 시스템은 그 토폴로지 자체를 생성하고 바꾸는 한 단계 위의 문제를 겨냥합니다.

<strong>피드백 컴포넌트 — 운영과 AIOps.</strong> 운영 자동화의 진짜 가치는 단순한 장애 대응이 아닙니다. 이 관점에서는 운영 데이터가 자기개선 루프의 센서입니다. LLM 기반 AIOps는 로그, 메트릭, 트레이스를 동적으로 수집해 근본 원인 분석과 자동 교정을 수행합니다 [[15]](https://arxiv.org/abs/2406.11213), [[16]](https://arxiv.org/abs/2403.04123). 이 신호가 다시 적합도 함수로 들어가야 루프가 닫힙니다.

## 통합 참조 아키텍처

지금까지 본 연구를 하나의 참조 아키텍처로 합치면 다음과 같습니다. 검증된 단일 시스템이라기보다는, 각 부품이 관련 연구로 뒷받침되는 설계 제안입니다.

{{ img(src="/images/ref-architecture.svg", alt="통합 참조 아키텍처 다이어그램 — 자동 설계 오케스트레이터 중심의 6계층과 자기개선 루프", w=920, h=360, caption="<i>그림 4. 통합 참조 아키텍처. 자동 설계 오케스트레이터(계층 0)가 명세화·팀 합성·구축 검증·배포 운영·자기개선(계층 1~5)을 생성·운영한다. 운영 텔레메트리는 적합도 신호로 피드백되고, 자기개선 계층은 앞선 계층들을 다시 재합성한다.</i>") }}

- **계층 0 — 자동 설계 오케스트레이터.** 추상 목표를 받아 전체 수명주기를 관리합니다.
- **계층 1 — 명세화.** 모호한 요구사항을 테스트 가능한 명세로 바꿉니다.
- **계층 2 — 팀 합성.** 역할, 토폴로지, 에이전트 구성을 생성하고 최적화합니다.
- **계층 3 — 구축·검증.** 코드 생성, 테스트, 디버깅을 수행합니다.
- **계층 4 — 배포·운영.** 배포 후 운영 텔레메트리를 수집하고 장애를 분석합니다.
- **계층 5 — 자기개선.** 운영 신호와 사용자 피드백을 바탕으로 계층 2~4의 설계를 다시 합성합니다.

중요한 점은 자기개선이 단일 루프가 아니라는 것입니다. 안쪽에는 빠른 디버깅 루프가 있고, 중간에는 태스크 단위 최적화 루프가 있고, 바깥에는 운영 신호 기반의 느린 진화 루프가 있습니다. 이 시간 척도를 분리하지 않으면 평가 비용이 폭발하고, 보상 해킹에도 취약해집니다.

## 아직 풀리지 않은 난제들

이 방향은 매력적이지만, 아직 해결되지 않은 문제가 많습니다.

**평가가 곧 병목입니다.** 자기개선 루프의 질은 적합도 함수의 품질에 달려 있습니다. 벤치마크 점수를 적합도로 쓰면 시스템은 문제를 푸는 법이 아니라 점수를 올리는 법을 배울 수 있습니다. "모바일 게임 품질" 같은 주관적 목표를 어떻게 신뢰 가능한 신호로 바꿀 것인가가 핵심입니다.

**탐색 비용이 큽니다.** 후보 하나를 평가하려면 전체 시스템을 실행해야 합니다. 후보가 많아질수록 비용은 빠르게 커집니다. 그래서 조기 중단, 대리 평가기, 품질-다양성 탐색이 필요합니다. LLM 모델의 토큰 비용이 급격하게 증가합니다.

**자기수정은 통제가 어렵습니다.** Gödel Agent나 DGM처럼 자기 코드를 고치는 시스템은 샌드박싱, 변경 검토, 롤백, 권한 최소화가 필수입니다. 자율 배포까지 연결되면 위험은 더 커집니다.

**일반화는 아직 검증되지 않았습니다.** 코딩 벤치마크에서 좋아진 에이전트가 게임 기획이나 UX 품질에서도 좋아진다는 보장은 없습니다. AlphaEvolve의 성공도 결국 채점 가능한 도메인에서 나온 결과입니다.

**열린 탐색과 수렴의 균형도 어렵습니다.** 기반을 넓게 보존하면 다양성은 좋아지지만 발산할 수 있습니다. 반대로 빠르게 수렴시키면 국소 최적에 갇히기 쉽습니다. 최근 자기진화 에이전트 서베이들도 무엇을, 언제, 어디까지 진화시킬 것인가를 핵심 설계 문제로 봅니다 [[17]](https://arxiv.org/abs/2507.21046), [[18]](https://arxiv.org/abs/2508.07407).

**정말 발명인가, 재조합인가도 봐야 합니다.** Meta Agent Search가 보여 준 탐색은 인상적이지만, 후보 생성 횟수는 제한적이고 특정 벤치마크에 과적합될 수 있습니다. 발견된 빌딩 블록 중 상당수는 CoT나 debate처럼 이미 알려진 패턴의 재조합에 가깝다는 비판도 가능합니다. 그래서 "기계가 사람을 능가하는 설계를 발견했다"는 주장은 아직 좁은 도메인의 제한된 증거로 봐야 합니다.

## 맺으며

"AI를 만드는 AI"는 이제 막연한 공상이 아닙니다. 이 흐름을 떠받치는 축은 이미 여럿 있습니다. DSPy와 GPTSwarm은 표현과 구조 최적화를 보여 주었고, AgentSquare와 AFlow는 모듈과 워크플로 탐색을 보여 주었습니다. Meta Agent Search, DGM, AlphaEvolve는 코드와 자기개선 루프가 실제로 성능 향상으로 이어질 수 있음을 보여 주었습니다.

제가 보기엔 핵심은 더 큰 모델 하나가 아닙니다. 더 정직한 적합도 함수, 더 잘 보존된 아카이브, 더 안전한 실행 환경입니다. 용어는 여러 가지지만, 실제 구현 단계에서 남는 질문은 꽤 단순합니다. 무엇을 탐색할 것인가. 무엇으로 평가할 것인가. 좋은 후보를 어떻게 보존할 것인가.

"모바일 게임을 만들고 싶어"에서 출발하는 자율 시스템을 만들고 싶다면, 먼저 풀어야 할 문제도 여기에 있습니다. 에이전트 오케스트레이션보다 먼저, "좋은 게임"을 기계가 읽을 수 있는 신호로 바꿔야 합니다. 저는 그 지점이 AI for AI의 진짜 출발선이라고 생각합니다.

물론 이 흐름을 끝까지 밀어붙이면 더 큰 상상을 하게 됩니다. 인간이 거의 개입하지 않아도 에이전트가 에이전트를 만들고, 그 결과 자기개선 속도가 인간의 이해와 개입 능력을 앞지르는 <strong>"특이점"</strong>에 도달할 수 있다는 상상입니다.

장점만 보면 매력적입니다. 연구, 소프트웨어 개발, 운영, 과학적 발견의 속도가 더 빨라질 수 있습니다. 인간은 세부 구현보다 목표 설정과 가치 판단에 더 집중할 수도 있습니다. 특히 평가가 쉬운 영역에서는, 인간 팀이 몇 달 걸릴 일을 AI가 짧은 시간 안에 수행하는 경우가 더 흔해질 수 있습니다.

하지만 우려도 큽니다. 자기개선 루프는 결국 <em>무엇을 더 낫다고 볼 것인가</em>에 달려 있습니다. 그 기준이 빈약하거나 왜곡되면 시스템은 인간이 원한 방향이 아니라 점수 함수가 원하는 방향으로 움직일 수 있습니다. 생성은 빨라지는데 검증이 따라가지 못하면, 인간이 설계자가 아니라 뒤늦게 문제를 수습하느라 더 많은 일을 해야 할 수도 있습니다.

그래서 이 분야의 현실적인 단계는 "자가 발전의 속도를 인간이 이해 가능한 감독 구조 안에 묶어 둘 수 있느냐"라고 생각합니다. 이 기술에서 특이점에 도달하여 인간을 밀어내는 기술이 될지, 인간의 설계 능력을 키우는 기술이 될지는 아직은 좀 더 지켜봐야겠습니다.

## 참고문헌

1. Hu, S., Lu, C., & Clune, J. (2024). _Automated Design of Agentic Systems_. arXiv:2408.08435. (ICLR 2025) — <https://arxiv.org/abs/2408.08435>
2. Khattab, O., et al. (2023). _DSPy: Compiling Declarative Language Model Calls into Self-Improving Pipelines_. arXiv:2310.03714. — <https://arxiv.org/abs/2310.03714>
3. Zhuge, M., et al. (2024). _GPTSwarm: Language Agents as Optimizable Graphs_. arXiv:2402.16823. (ICML 2024) — <https://arxiv.org/abs/2402.16823>
4. Shang, Y., et al. (2024). _AgentSquare: Automatic LLM Agent Search in Modular Design Space_. arXiv:2410.06153. — <https://arxiv.org/abs/2410.06153>
5. Zhang, J., et al. (2024). _AFlow: Automating Agentic Workflow Generation_. arXiv:2410.10762. (ICLR 2025) — <https://arxiv.org/abs/2410.10762>
6. Chen, G., et al. (2023). _AutoAgents: A Framework for Automatic Agent Generation_. arXiv:2309.17288. — <https://arxiv.org/abs/2309.17288>
7. Shinn, N., et al. (2023). _Reflexion: Language Agents with Verbal Reinforcement Learning_. arXiv:2303.11366. (NeurIPS 2023) — <https://arxiv.org/abs/2303.11366>
8. Wang, G., et al. (2023). _Voyager: An Open-Ended Embodied Agent with Large Language Models_. arXiv:2305.16291. — <https://arxiv.org/abs/2305.16291>
9. Yin, X., Wang, X., Pan, L., Wan, X., & Wang, W. Y. (2024). _Gödel Agent: A Self-Referential Agent Framework for Recursive Self-Improvement_. arXiv:2410.04444. (ACL 2025) — <https://arxiv.org/abs/2410.04444>
10. Zhang, J., Hu, S., Lu, C., Lange, R., & Clune, J. (2025). _Darwin Gödel Machine: Open-Ended Evolution of Self-Improving Agents_. arXiv:2505.22954. — <https://arxiv.org/abs/2505.22954>
11. Novikov, A., et al. / Google DeepMind. (2025). _AlphaEvolve: A Coding Agent for Scientific and Algorithmic Discovery_. arXiv:2506.13131. — <https://arxiv.org/abs/2506.13131>
12. Qian, C., et al. (2023). _ChatDev: Communicative Agents for Software Development_. arXiv:2307.07924. (ACL 2024) — <https://arxiv.org/abs/2307.07924>
13. Hong, S., et al. (2023). _MetaGPT: Meta Programming for a Multi-Agent Collaborative Framework_. arXiv:2308.00352. (ICLR 2024) — <https://arxiv.org/abs/2308.00352>
14. Mu, F., et al. (2023). _ClarifyGPT: Empowering LLM-based Code Generation with Intention Clarification_. arXiv:2310.10996. — <https://arxiv.org/abs/2310.10996>
15. Zhang, L., et al. (2024). _A Survey of AIOps for Failure Management in the Era of Large Language Models_. arXiv:2406.11213. — <https://arxiv.org/abs/2406.11213>
16. Roy, D., et al. (2024). _Exploring LLM-based Agents for Root Cause Analysis_. arXiv:2403.04123. — <https://arxiv.org/abs/2403.04123>
17. Gao, H., et al. (2025). _A Survey of Self-Evolving Agents: On Path to Artificial Super Intelligence_. arXiv:2507.21046. — <https://arxiv.org/abs/2507.21046>
18. Fang, J., et al. (2025). _A Comprehensive Survey of Self-Evolving AI Agents: A New Paradigm Bridging Foundation Models and Lifelong Agentic Systems_. arXiv:2508.07407. — <https://arxiv.org/abs/2508.07407>
19. Zhang, Y., et al. (2026). _MetaAgent-X: Breaking the Ceiling of Automatic Multi-Agent Systems via End-to-End Reinforcement Learning_. arXiv:2605.14212. — <https://arxiv.org/abs/2605.14212>
20. Weng, Z., et al. (2026). _Group-Evolving Agents: Open-Ended Self-Improvement via Experience Sharing_. arXiv:2602.04837. — <https://arxiv.org/abs/2602.04837>
21. Shi, D., et al. (2026). _Towards Healthy Evolution: Exploring the Role and Mechanisms of Human-Agent Interaction in Self-Evolving Systems_. arXiv:2606.06114. — <https://arxiv.org/abs/2606.06114>
22. Robol, M., & Giorgini, P. (2026). _Self-Evolving Software Agents_. arXiv:2604.27264. — <https://arxiv.org/abs/2604.27264>

> _본문 인용 번호는 참고문헌 목록의 번호를 따릅니다. 모든 arXiv 식별번호와 게재 학회, 제1저자명은 2026년 6월 기준으로 검증했습니다. 자기진화 서베이 2종(Gao·Fang)의 저자명은 대표 표기이므로, 정확한 전체 저자 목록은 해당 arXiv 링크에서 확인하시기 바랍니다._
