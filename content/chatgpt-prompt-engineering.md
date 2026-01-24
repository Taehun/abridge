+++
title = "ChatGPT Prompt Engineering for Developers 강의 정리"
date = 2023-05-29
draft = false

[taxonomies]
tags = ['ChatGPT']

[extra]
author = "김태훈"
toc = true
+++

> *원본 강의 링크>* *<https://learn.deeplearning.ai/chatgpt-prompt-eng>*

## 소개

### 두 가지 타입의 LLM (Large Language Models)

| **Base LLM** | **Instruction Tuned LLM** |
| --- | --- |
| 학습된 텍스트 데이터에서 다음 단어 추론 | • 지침(instruction)을 따름 • 지침에서 모델이 파인 튜닝 • **RLHF** (**Reinforcement Learning from Human Feedback)**  인간 피드백 기반 강화 학습 |

> **RLHF (Reinforcement Learning from Human Feedback)** *by. ChatGPT*
>
> RLHF은 강화 학습 (Reinforcement Learning)에서 인간의 피드백을 활용하여 에이전트를 학습시키는 기술입니다. 일반적으로 강화 학습은 에이전트가 환경과 상호작용하여 피드백을 받고, 이를 통해 최적의 행동을 학습하는 방식입니다. 하지만 이러한 학습 과정은 실제 환경에서 실험을 반복하고 오랜 시간을 소요할 수 있습니다.

RLHF는 이러한 문제를 해결하기 위해 인간의 지식과 피드백을 효과적으로 활용하여 학습 속도를 높이는 방법입니다. RLHF는 주로 두 가지 방식으로 구현됩니다.

1. Demonstrations (시연): 먼저 인간이 원하는 결과를 달성하는 최적의 행동들을 보여줍니다. 이러한 시연을 통해 학습 데이터를 생성하고, 이를 기반으로 강화 학습 알고리즘이 에이전트를 학습시킵니다. 예를 들어, 자율 주행 자동차를 학습시킬 때, 운전자가 좋은 예시를 보여주고, 에이전트가 그 예시를 따라하도록 할 수 있습니다.
2. Reward Models (보상 모델): 인간은 에이전트의 행동에 대한 평가나 보상을 제공합니다. 이 평가나 보상은 에이전트가 최적의 행동을 선택할 수 있도록 도와줍니다. 예를 들어, 게임에서 플레이어가 특정 행동을 하면 보상을 주는 방식으로 학습할 수 있습니다.

이러한 RLHF 기술은 실제 환경에서의 실험을 줄이고, 에이전트의 학습 속도와 성능을 향상시킬 수 있습니다. 또한, RLHF는 인간의 지식과 전문성을 강화 학습 알고리즘에 통합하는 데에도 유용하게 활용될 수 있습니다.

## 프롬프트 가이드라인

대규모 언어 모델에 효과적인 프롬프트를 작성하기 위해 두 가지 프롬프트 원칙과 관련 전략을 연습

### OpenAI 패키지 초기화
```python
import openai
import os

from dotenv import load_dotenv, find_dotenv
_ = load_dotenv(find_dotenv())

openai.api_key  = os.getenv('OPENAI_API_KEY')
```

→ `.env` 파일에 `OPENAI_API_KEY` 변수 값을 본인 계정의 key를 넣을 것

- OpenAI API 키는 <https://platform.openai.com/account/api-keys> 에서 생성 및 확인

### 헬퍼 함수 작성
이 강의는 OpenAI의 `gpt-3.5-turbo` 모델과 [Chat completions 엔드포인트](https://platform.openai.com/docs/guides/chat)를 사용

이 헬퍼 함수를 사용하면 프롬프트를 더 쉽게 사용할 수 있고, 생성된 출력을 확인할 수 있음

```python
def get_completion(prompt, model="gpt-3.5-turbo", temperature=0):
    messages = [{"role": "user", "content": prompt}]
    response = openai.ChatCompletion.create(
        model=model,
        messages=messages,
        temperature=temperature,  # '확장하기' 단원 참고
    )
    return response.choices[0].message["content"]
```

### 프롬프트 원칙

- 원칙 1: 명확하고 구체적인 지침을 작성하세요.
- 원칙 2: 모델에게 "생각할" 시간을 주세요.

#### 원칙 1: 명확하고 구체적인 지침을 작성하세요.

**전략 1: 구분 기호를 사용하여 입력의 뚜렷한 부분을 명확하게 표시하세요.**

- 구분 기호는 다음과 같을 수 있습니다: ` ``` `, `"""`, `< >`, `<tag> </tag>`, `:`

````python
text = f"""
가능한 한 명확하고 구체적인 지침을 제공하여 모델이 수행하기를 원하는 작업을 표현해야 합니다.
이렇게 하면 모델을 원하는 출력으로 안내하고 관련성이 없거나 잘못된 응답을 받을 가능성을 줄일 수 있습니다.
명확한 프롬프트를 작성하는 것과 짧은 프롬프트를 작성하는 것을 혼동하지 마세요.
대부분의 경우, 긴 프롬프트가 모델에 더 명확하고 맥락을 제공하므로 다음과 같은 결과를 얻을 수 있습니다.
더 상세하고 관련성 높은 출력을 얻을 수 있습니다.
"""

prompt = f"""
백틱 세 개로 구분된 텍스트를 한 문장으로 요약하세요.
````json
{text}```
"""
response = get_completion(prompt)
print(response)
````

```output
모델의 작업을 명확하고 구체적으로 표현하고, 긴 프롬프트를 사용하여 모델이 더 명확하고 관련성 높은 출력을 얻을 수 있도록 해야 합니다.
````

**전략 2: 구조화된 결과물 요청하기**

- JSON, HTML

```python
prompt = f"""
저자 및 장르와 함께 세 개의 구성 도서 제목 목록을 생성합니다.
다음 키와 함께 JSON 형식으로 제공하세요: 
book_id, 제목, 저자, 장르.
"""
response = get_completion(prompt)
print(response)
```

```json
{
    "book_id": 1,
    "제목": "어린 왕자",
    "저자": "생텍쥐페리",
    "장르": "소설"
},
{
    "book_id": 2,
    "제목": "죄와 벌",
    "저자": "톨스토이",
    "장르": "소설"
},
{
    "book_id": 3,
    "제목": "사람은 무엇으로 사는가",
    "저자": "톨스토이",
    "장르": "철학"
}
```

**전략 3: 모델에게 조건이 충족되었는지 확인하도록 요청하기**

```python
text_1 = f"""
차 한 잔을 만드는 것은 쉽습니다! 먼저 물을 끓여야 합니다. 끓는 동안 컵을 들고 티백을 넣으세요.
물이 충분히 뜨거워지면 티백 위에 붓기만 하면 됩니다.
차가 우러날 수 있도록 잠시 기다리세요. 몇 분 후 티백을 꺼내세요.
원한다면 설탕이나 우유를 넣어 맛을 낼 수 있습니다.
그리고 그게 다입니다! 맛있는 차 한 잔을 즐길 수 있습니다.
"""
prompt = f"""
세 개의 큰따옴표로 구분된 텍스트가 제공됩니다. 
일련의 지침이 포함된 경우 다음 형식으로 해당 지침을 다시 작성합니다:

1 단계 - ...
2 단계 - ...
...
N 단계 - ...

텍스트에 일련의 지침이 포함되어 있지 않은 경우, \"단계 없음\"이라고 입력합니다.

\"\"\"{text_1}\"\"\"
"""
response = get_completion(prompt)
print("text_1 결과:")
print(response)
```

```output
text_1 결과:
1 단계 - 물을 끓입니다.
2 단계 - 끓는 동안 컵을 들고 티백을 넣습니다.
3 단계 - 물이 충분히 뜨거워지면 티백 위에 붓습니다.
4 단계 - 차가 우러날 수 있도록 잠시 기다립니다.
5 단계 - 몇 분 후 티백을 꺼냅니다.
6 단계 - 원한다면 설탕이나 우유를 넣어 맛을 낼 수 있습니다.
7 단계 - 맛있는 차 한 잔을 즐깁니다.
```

```python
text_2 = f"""
오늘은 태양이 밝게 빛나고 새들이 노래하고 있습니다.
공원에서 산책하기 좋은 날입니다.
꽃이 피고 나무들이 바람에 살랑살랑 흔들리고 있습니다.
사람들은 바깥으로 나와 아름다운 날씨를 즐기고 있습니다. 

어떤 사람들은 피크닉을 즐기고 있고,
어떤 사람들은 게임을 하거나 잔디밭에서 휴식을 취하고 있습니다.
야외에서 시간을 보내며 자연의 아름다움을 감상하기에 완벽한 날입니다.
자연의 아름다움을 감상하기에 완벽한 날입니다.
"""
prompt = f"""
세 개의 큰따옴표로 구분된 텍스트가 제공됩니다. 
일련의 지침이 포함된 경우 다음 형식으로 해당 지침을 다시 작성합니다:

1 단계 - ...
2 단계 - ...
...
N 단계 - ...

텍스트에 일련의 지침이 포함되어 있지 않은 경우, \"단계 없음\"이라고 입력합니다.

\"\"\"{text_2}\"\"\"
"""
response = get_completion(prompt)
print("text_2 결과:")
print(response)
```

```output
text_2 결과:
단계 없음
```

**전략 4: "Few-shot" 프롬프트**

```python
prompt = f"""
당신의 임무는 일관된 스타일로 대답하는 것입니다.

<손자>: 인내심에 대해 가르쳐주세요.

<할아버지>: 가장 깊은 계곡을 깎아내는 강물은 겸손한 샘에서 흐르고, 가장 웅장한 교향곡은 한 음에서 시작됩니다; 가장 복잡한 태피스트리는 고독한 실에서 시작됩니다.

<손자>: 회복탄력성에 대해 가르쳐 주세요.
"""
response = get_completion(prompt)
print(response)
```

```output
<할아버지>: 인생은 언제나 어려움과 도전으로 가득 차 있습니다. 하지만 회복탄력성이 있다면 어떤 어려움이든 극복할 수 있습니다. 회복탄력성은 어려운 상황에서도 긍정적인 마인드를 유지하고, 빠르게 회복하는 능력입니다. 이것은 자신의 강점과 약점을 인식하고, 문제를 해결하기 위해 적극적으로 행동하는 것을 의미합니다.
```

#### 원칙 2: 모델에게 '생각할 시간' 주기

**전략 1: 작업 완료에 필요한 단계 지정하기**

````python
text = f"""
매력적인 마을에서 잭과 질 남매는 언덕 위의 우물에서 물을 길어오기 위해 모험을 떠났어요.
즐거운 노래를 부르며 오르던 중 잭은 돌에 걸려 넘어져 언덕 아래로 굴러떨어졌고 질도 그 뒤를 따랐습니다. 

두 사람은 약간의 상처를 입었지만 서로를 위로하며 집으로 돌아왔습니다.
사고에도 불구하고 두 사람의 모험심은 꺾이지 않았고, 기쁨에 가득 찬 모습으로 기쁨으로 탐험을 계속했습니다.
"""
# example 1
prompt_1 = f"""
다음 작업을 수행합니다: 
1 - 세 개의 백틱으로 구분된 텍스트를 1문장으로 요약합니다.
2 - 요약을 프랑스어로 번역합니다.
3 - 프랑스어 요약에 각 이름을 나열합니다.
4 - 다음 key을 포함하는 json 객체를 출력합니다. key: french_summary, num_names

응답은 줄 바꿈으로 구분하세요.

Text:
````{text}```
"""
response = get_completion(prompt_1)
print("프롬프트 1 결과:")
print(response)
````

```output
프롬프트 1 결과:
1 - 잭과 질 남매는 마을에서 우물에서 물을 길어오기 위해 모험을 떠났고, 중간에 사고가 있었지만 모험심은 꺾이지 않았습니다.
2 - Jack et Jill, frère et sœur, sont partis à l'aventure pour chercher de l'eau dans un puits sur une colline dans un charmant village. En chantant joyeusement, Jack a trébuché sur une pierre et est tombé en roulant en bas de la colline, suivi de Jill. Bien qu'ils aient été légèrement blessés, ils se sont encouragés mutuellement et sont rentrés chez eux. Malgré l'accident, leur esprit d'aventure n'a pas été brisé et ils ont continué à explorer avec joie.
3 - Jack et Jill
4 - {"french_summary": "Jack et Jill, frère et sœur, sont partis à l'aventure pour chercher de l'eau dans un puits sur une colline dans un charmant village. En chantant joyeusement, Jack a trébuché sur une pierre et est tombé en roulant en bas de la colline, suivi de Jill. Bien qu'ils aient été légèrement blessés, ils se sont encouragés mutuellement et sont rentrés chez eux. Malgré l'accident, leur esprit d'aventure n'a pas été brisé et ils ont continué à explorer avec joie.", "num_names": 2}
````

지정된 형식의 출력 요청

```python
prompt_2 = f"""
다음 작업을 수행하세요: 
1 - <>로 구분된 다음 텍스트를 1문장으로 요약합니다.
2 - 요약을 프랑스어로 번역합니다.
3 - 프랑스어 요약에 각 이름을 나열합니다.
4 - 다음 key가 포함된 json 객체를 출력합니다. key: 프랑스어_요약, num_names.

다음 형식을 사용합니다:
텍스트: <요약할 텍스트>
요약: <요약>
번역: <요약 번역>
Names: <이탈리아어 요약의 이름 목록>
출력 JSON: <프랑스어_요약 및 num_names가 포함된 json>

Text: <{text}>
"""
response = get_completion(prompt_2)
print("\n프롬프트 2 결과:")
print(response)
```

```output
프롬프트 2 결과:
요약: 잭과 질 남매는 우물에서 물을 길어오기 위해 모험을 떠났고, 사고에도 불구하고 모험심은 꺾이지 않았습니다.
번역: Jack et Jill, frère et sœur, sont partis à l'aventure pour chercher de l'eau dans un puits sur une colline charmante. Malgré un accident, leur esprit d'aventure n'a pas été brisé et ils ont continué à explorer avec joie.
Names: Jack, Jill
Output JSON: {"프랑스어_요약": "Jack et Jill, frère et sœur, sont partis à l'aventure pour chercher de l'eau dans un puits sur une colline charmante. Malgré un accident, leur esprit d'aventure n'a pas été brisé et ils ont continué à explorer avec joie.", "num_names": 2}
```

**전략 2: 결론을 서두르기 전에 모델 스스로 해결책을 찾도록 지시하세요.**

```python
prompt = f"""
학생의 정답이 실제 정답인지 확인합니다.

질문:
태양광 발전 설비를 건설 중인데 재정 문제를 해결하는 데 도움이 필요합니다. 
- 토지가 평방 피트당 $100입니다.
- 태양광 패널을 평방 피트당 $250에 구입할 수 있습니다.
- 연간 $100,000의 고정 비용과 평방 피트당 $10의 추가 비용이 드는 유지 보수 계약을 협상했습니다.
운영 첫해의 총 비용은 얼마입니까? 
평방 피트 수의 함수입니다.

학생의 정답:
x를 평방 피트 단위의 설비 크기라고 합니다.
비용:
1. 토지 비용: 100x
2. 태양광 패널 비용: 250x
3. 유지보수 비용: 100,000 + 100x
총 비용: 100x + 250x + 100,000 + 100x = 450x + 100,000
"""
response = get_completion(prompt)
print(response)
```

```output
정답입니다.
```

**학생의 솔루션이 실제로는 오답이라는 점에 유의하세요.
모델에 먼저 자체적으로 정답을 찾도록 지시하여 이 문제를 해결할 수 있습니다.**

````python
prompt = f"""
당신의 역활은 학생의 정답이 실제 정답인지 판단하는 것입니다.
문제를 해결하려면 다음을 수행합니다:
- 먼저 문제에 대한 자신만의 정답을 생각해 봅니다. 
- 그런 다음 자신의 정답을 학생의 정답과 비교하여 정답인지 평가합니다.
문제를 직접 풀기 전까지는 학생의 정답이 올바른지 결정하지 마십시오.

다음 형식을 사용합니다:
질문:
```
질문 내용
```
학생의 정답:
```
학생의 정답 내용
```
실제 정답:
```
정답을 찾는 과정과 실제 정답
```
학생의 정답이 방금 계산한 실제 정답과 동일한가?
```
'예' 또는 '아니요'
```
학생의 성적:
```
'정답' 또는 '오답'
```

질문:
```
태양광 발전 설비를 건설 중인데 재정 계산에 도움이 필요합니다. 
- 토지 비용은 평방 피트당 $100입니다.
- 태양광 패널을 평방 피트당 $250에 구입할 수 있습니다.
- 연간 $100,000의 고정 비용과 평방 피트당 $10의 추가 비용이 드는 유지보수 계약을 협상했습니다.

운영 첫해의 총 비용은 얼마입니까?

평방 피트 수의 함수입니다.
```

학생의 정답:
```
x를 평방 피트 단위의 설비 크기라고 합니다.
비용:

1. 토지 비용: 100x
2. 태양광 패널 비용: 250x
3. 유지보수 비용: 100,000 + 100x

총 비용: 100x + 250x + 100,000 + 100x = 450x + 100,000
```

실제 정답:
"""

response = get_completion(prompt)
print(response)
````

```output
정답을 찾는 과정과 실제 정답:
1. 토지 비용: 100x
2. 태양광 패널 비용: 250x
3. 유지보수 비용: 100,000 + 10x (평방 피트당 $10의 추가 비용)

총 비용: 100x + 250x + (100,000 + 10x) = 360x + 100,000

학생의 정답이 방금 계산한 실제 정답과 동일한가?
아니요

학생의 성적:
오답
```

### 모델 제한사항: 환각(Hallucinations)

- Boie는 실제 존재하는 회사이지만, 제품 이름은 실제가 아닙니다.

```python
prompt = f"""
Boie의 AeroGlide 울트라슬림 스마트 칫솔에 대해 알려주세요.
"""
response = get_completion(prompt)
print(response)
```

```output
Boie의 AeroGlide 울트라슬림 스마트 칫솔은 미국의 칫솔 제조업체 Boie에서 출시한 제품입니다. 이 제품은 블루투스 기능을 탑재하여 스마트폰과 연동하여 사용할 수 있습니다. 이를 통해 칫솔 사용 시간, 세척 횟수, 배터리 잔량 등을 모니터링할 수 있습니다.

또한, 이 제품은 울트라슬림 디자인으로 구성되어 있어 칫솔질이 더욱 편리하고 쉽습니다. 또한, 칫솔 머리는 부드러운 섬유로 만들어져 치아와 잇몸을 부드럽게 마사지하며 치아의 표면을 깨끗하게 닦아줍니다.

이 제품은 USB 충전이 가능하며, 한 번 충전으로 최대 4주간 사용할 수 있습니다. 또한, 칫솔 머리는 교체가 가능하며, Boie에서는 칫솔 머리를 구매할 수 있는 구독 서비스도 제공하고 있습니다.
```

## 반복적인 프롬프트 개발

<p align="center">
<img src="https://img-src.io/i/taehun/chatgpt-prompt-engineering/1.png?w=600" alt="notion image">
</p>


### 제품 팩트 시트에서 마케팅 제품 소개 생성

```python
fact_sheet_chair = """
개요
- 20세기 중반에서 영감을 받은 아름다운 사무용 가구 제품군의 일부입니다, 파일 캐비닛, 책상, 책장, 회의 테이블 등을 포함합니다.
- 다양한 쉘 색상 및 베이스 마감 옵션.
- 플라스틱 소재의 후면 및 전면 커버 (SWC-100) 또는 또는 10가지 패브릭 및 6가지 가죽 옵션의 풀 커버 (SWC-110)로 제공됩니다.
- 기본 마감 옵션: 스테인리스 스틸, 무광 블랙, 유광 화이트 또는 크롬.
- 의자는 팔걸이가 있든 없든 선택할 수 있습니다.
- 가정 또는 비즈니스 환경에 적합합니다.
- 계약 사용 자격이 있습니다.

구조
- 5바퀴 플라스틱 코팅 알루미늄 베이스.
- 공압식 의자는 쉽게 올리거나 내릴 수 있도록 조절됩니다.

치수
- 폭 53cm | 20.87"
- 깊이 51 cm | 20.08"
- 높이 80 cm | 31.50"
- 좌석 높이 44cm | 17.32"
- 좌석 깊이 41cm | 16.14"

옵션
- 소프트 또는 하드 플로어 캐스터 옵션.
- 두 가지 시트 폼 밀도 선택 가능: 
 중간(1.8파운드/ft3) 또는 높음(2.8파운드/ft3)
- 팔걸이 없음 또는 8위치 PU 팔걸이 

재료
쉘 베이스 글라이더
- 변형 나일론 PA6/PA66 코팅된 주조 알루미늄.
- 셸 두께: 10mm.

SEAT
- HD36 폼

원산지
- 이탈리아
"""
```

```python
prompt = f"""
당신의 임무는 마케팅 팀이 기술 팩트 시트를 기반으로
제품의 소매 웹사이트에 대한 한글 제품 소개 작성을 돕는 것입니다.

세 개의 백틱으로 구분된 기술 사양에 제공된 정보를 기반으로 제품 설명서를 작성하세요.

기술 사양: ```{fact_sheet_chair}```
"""
response = get_completion(prompt)
print(response)
````

```output
제품 소개:

이 제품은 20세기 중반의 아름다운 사무용 가구 제품군의 일부로, 파일 캐비닛, 책상, 책장, 회의 테이블 등을 포함합니다. 다양한 쉘 색상 및 베이스 마감 옵션으로 제공되며, 플라스틱 소재의 후면 및 전면 커버 (SWC-100) 또는 10가지 패브릭 및 6가지 가죽 옵션의 풀 커버 (SWC-110)로 제공됩니다. 기본 마감 옵션은 스테인리스 스틸, 무광 블랙, 유광 화이트 또는 크롬입니다.

이 제품은 가정 또는 비즈니스 환경에 적합하며, 계약 사용 자격이 있습니다. 구조는 5바퀴 플라스틱 코팅 알루미늄 베이스로 이루어져 있으며, 공압식 의자는 쉽게 올리거나 내릴 수 있도록 조절됩니다.

이 제품의 치수는 폭 53cm, 깊이 51cm, 높이 80cm, 좌석 높이 44cm, 좌석 깊이 41cm입니다. 옵션으로는 소프트 또는 하드 플로어 캐스터 옵션, 두 가지 시트 폼 밀도 선택 가능(중간(1.8파운드/ft3) 또는 높음(2.8파운드/ft3)), 팔걸이 없음 또는 8위치 PU 팔걸이가 있습니다.

이 제품은 변형 나일론 PA6/PA66 코팅된 주조 알루미늄으로 만들어졌으며, 셸 두께는 10mm입니다. 시트는 HD36 폼으로 만들어졌으며, 원산지는 이탈리아입니다.
```

### 이슈 1: 너무 긴 텍스트

- 단어/문장/문자 수를 제한합니다.

````python
prompt = f"""
당신의 임무는 마케팅 팀이 기술 팩트 시트를 기반으로
제품의 소매 웹사이트에 대한 한글 제품 소개 작성을 돕는 것입니다.

세 개의 백틱으로 구분된 기술 사양에 제공된 정보를 기반으로 제품 소개를 작성하세요.

최대 50단어까지 사용하세요.

기술 사양: ```{fact_sheet_chair}```
"""
response = get_completion(prompt)
print(response)
````

```output
이 제품군은 20세기 중반의 사무용 가구에서 영감을 받아 디자인된 제품으로, 파일 캐비닛, 책상, 책장, 회의 테이블 등을 포함합니다. 다양한 쉘 색상과 베이스 마감 옵션을 제공하며, 플라스틱 또는 패브릭/가죽 커버를 선택할 수 있습니다. 의자는 팔걸이가 있든 없든 선택 가능하며, 가정 또는 비즈니스 환경에 적합합니다. 또한, 소프트 또는 하드 플로어 캐스터 옵션과 두 가지 시트 폼 밀도 선택이 가능하며, 이 제품은 이탈리아에서 생산됩니다.
```

### 이슈 2. 잘못된 세부 사항에 중점을 둔 텍스트

- 대상 독자와 관련된 내용에 중점을 두도록 요청하세요.

````python
prompt = f"""
당신의 임무는 마케팅 팀이 기술 팩트 시트를 기반으로
제품의 소매 웹사이트에 대한 한글 제품 소개 작성을 돕는 것입니다.

세 개의 백틱으로 구분된 기술 사양에 제공된 정보를 기반으로 제품 소개를 작성하세요.

제품 소개는 가구 소매상을 위한 것이므로 본질적으로 기술적이어야 하며 
제품이 구성되는 재료에 중점을 두어야 합니다.

최대 50단어까지 사용하세요.

기술 사양: ```{fact_sheet_chair}```
"""
response = get_completion(prompt)
print(response)
````

```output
이 제품군은 20세기 중반의 아름다운 사무용 가구를 현대적으로 재해석한 제품입니다. 파일 캐비닛, 책상, 책장, 회의 테이블 등 다양한 제품으로 구성되며, 다양한 쉘 색상과 베이스 마감 옵션을 제공합니다. 플라스틱 소재의 후면 및 전면 커버 또는 패브릭 및 가죽 옵션의 풀 커버로 제공됩니다. 의자는 팔걸이가 있든 없든 선택할 수 있으며, 가정 또는 비즈니스 환경에 적합합니다. 이 제품은 이탈리아에서 생산되었으며, 고품질의 재료로 만들어졌습니다.
```

````python
prompt = f"""
당신의 임무는 마케팅 팀이 기술 팩트 시트를 기반으로
제품의 소매 웹사이트에 대한 한글 제품 소개 작성을 돕는 것입니다.

세 개의 백틱으로 구분된 기술 사양에 제공된 정보를 기반으로 제품 소개를 작성하세요.

제품 소개는 가구 소매상을 위한 것이므로 본질적으로 기술적이어야 하며 
제품이 구성되는 재료에 중점을 두어야 합니다.

제품 소개 마지막에는 기술 사양에 있는 7자리로 구성된 모든 제품 ID를 표시하세요.

최대 50단어까지 사용하세요.

기술 사양: ```{fact_sheet_chair}```
"""
response = get_completion(prompt)
print(response)
````

```output
20세기 중반의 아름다운 사무용 가구 제품군 중 하나인 이 제품은 파일 캐비닛, 책상, 책장, 회의 테이블 등으로 구성되어 있습니다. 다양한 쉘 색상과 베이스 마감 옵션을 제공하며, 플라스틱 소재의 후면 및 전면 커버 또는 패브릭 및 가죽 옵션의 풀 커버로 제공됩니다. 스테인리스 스틸, 무광 블랙, 유광 화이트 또는 크롬으로 마감할 수 있으며, 팔걸이가 있든 없든 선택할 수 있습니다. 이 제품은 가정 또는 비즈니스 환경에 적합하며, 계약 사용 자격이 있습니다. 제품 ID: SWC-100, SWC-110.
```

### 이슈 3. 설명서에 치수의 표가 필요한 경우

- 정보를 추출하여 표로 정리해 달라고 요청하세요.

````python
prompt = f"""
당신의 임무는 마케팅 팀이 기술 팩트 시트를 기반으로
제품의 소매 웹사이트에 대한 한글 제품 소개 작성을 돕는 것입니다.

세 개의 백틱으로 구분된 기술 사양에 제공된 정보를 기반으로 제품 소개를 작성하세요.

제품 소개는 가구 소매상을 위한 것이므로 본질적으로 기술적이어야 하며
제품이 구성되는 재료에 중점을 두어야 합니다.

제품 소개 마지막에는 기술 사양에 있는 7자리로 구성된
모든 제품 ID(예: "SWC-123")를 표시하세요.

제품 소개 끝 부분에 제품의 치수를 표시하는 표를 포함합니다.
표에는 두 개의 열이 있어야 합니다.
첫 번째 열에는 치수 이름이 포함됩니다.
두 번째 열에는 인치 단위의 측정값만 포함합니다.
테이블 제목은 '제품 치수'라고 지정하십시오.

웹사이트에서 사용할 수 있도록 출력 포맷을 HTML으로 하세요.
제품 소개를 <div> 요소에 포함합니다.

기술 사양: ```{fact_sheet_chair}```
"""

response = get_completion(prompt)
print(response)
````

```html
<div>
<h2>제품 소개</h2>
<p>이 제품은 20세기 중반에서 영감을 받은 아름다운 사무용 가구 제품군의 일부입니다. 파일 캐비닛, 책상, 책장, 회의 테이블 등을 포함하며, 다양한 쉘 색상 및 베이스 마감 옵션을 제공합니다. 플라스틱 소재의 후면 및 전면 커버 (SWC-100) 또는 10가지 패브릭 및 6가지 가죽 옵션의 풀 커버 (SWC-110)로 제공됩니다. 기본 마감 옵션은 스테인리스 스틸, 무광 블랙, 유광 화이트 또는 크롬입니다. 의자는 팔걸이가 있든 없든 선택할 수 있으며, 가정 또는 비즈니스 환경에 적합합니다. 계약 사용 자격이 있습니다.</p>
<p>제품 ID: SWC-100, SWC-110</p>
<h3>제품 치수</h3>
<table>
  <tr>
    <th>치수 이름</th>
    <th>치수 (인치)</th>
  </tr>
  <tr>
    <td>폭</td>
    <td>20.87"</td>
  </tr>
  <tr>
    <td>깊이</td>
    <td>20.08"</td>
  </tr>
  <tr>
    <td>높이</td>
    <td>31.50"</td>
  </tr>
  <tr>
    <td>좌석 높이</td>
    <td>17.32"</td>
  </tr>
  <tr>
    <td>좌석 깊이</td>
    <td>16.14"</td>
  </tr>
</table>
<h3>옵션</h3>
<ul>
  <li>소프트 또는 하드 플로어 캐스터 옵션</li>
  <li>두 가지 시트 폼 밀도 선택 가능: 중간(1.8파운드/ft3) 또는 높음(2.8파운드/ft3)</li>
  <li>팔걸이 없음 또는 8위치 PU 팔걸이</li>
</ul>
<h3>재료</h3>
<p>쉘 베이스 글라이더: 변형 나일론 PA6/PA66 코팅된 주조 알루미늄. 셸 두께는 10mm입니다. 시트는 HD36 폼으로 만들어졌습니다.</p>
<p>원산지: 이탈리아</p>
</div>
```

```python
from IPython.display import display, HTML
display(HTML(response))
```

<p align="center">
<img src="https://img-src.io/i/taehun/chatgpt-prompt-engineering/2.png" alt="notion image">
</p>

## 요약하기

텍스트 요약하기

### 단어/문장/문자 수 제한으로 요약하기

```python
prod_review = """
딸의 생일 선물로 이 팬더 봉제 인형을 받았는데, 딸이 좋아해서 어디든 가지고 다닙니다.
부드럽고 매우 귀엽고 얼굴이 친근한 표정을 지녔어요.
하지만 가격에 비해 조금 작아요. 같은 가격에 더 큰 다른 옵션이 있을 것 같아요.

배송은 예상보다 하루 일찍 도착해서 딸에게 선물하기 전에
제가 먼저 가지고 놀 수 있었어요.
"""
```

````python
prompt = f"""
당신의 임무는 전자 상거래 사이트에서 제품 리뷰에 대한 짧은 요약을 생성하는 것입니다.

최대 30단어로 세 개의 백틱으로 구분된 아래 리뷰를 요약하십시오.

리뷰: ```{prod_review}```
"""

response = get_completion(prompt)
print(response)
````

```output
"부드럽고 귀여운 팬더 봉제 인형, 작은 크기에 비해 가격이 조금 높음. 빠른 배송."
```

### 배송에 중점을 두고 요약하기

````python
prompt = f"""
당신의 임무는 전자 상거래 사이트에서 배송 부서에 피드백을 제공하기 위해
제품 리뷰에 대한 간략한 요약을 생성하는 것입니다.

세 개의 백틱으로 구분된 아래 리뷰를 제품 배송 측면에 중점을 둬서 최대 30단어로 요약하세요.

리뷰: ```{prod_review}``
"""

response = get_completion(prompt)
print(response)
````

```output
"부드럽고 귀여운 팬더 봉제 인형, 배송은 예상보다 일찍 도착했지만 가격 대비 크기는 작음."
```

### 가격에 중점을 두고 요약하기

````python
prompt = f"""
당신의 임무는 전자 상거래 사이트에서 제품 가격 결정을 담당하는 가격 책정 부서에
피드백을 제공하기 위해 제품 리뷰에 대한 간략한 요약을 생성하는 것 입니다.

세 개의 백틱으로 구분된 아래 리뷰를 가격 측면에 중점을 둬서 최대 30단어로 요약하세요.

리뷰: ```json
{prod_review}```
"""

response = get_completion(prompt)
print(response)
````

```output
"부드럽고 귀여운 팬더 봉제인형, 가격 대비 크기는 작음"
```

요약은 중점을 두려는 주제와 관련없는 내용이 포함됩니다.

### “요약(summarize)”대신 “추출(extract)” 사용

````python
prompt = f"""
당신의 임무는 전자 상거래 사이트의 제품 리뷰에서 배송 관련 정보를 추출하여
배송 부서에 피드백을 제공하는 것입니다.

세 개의 백틱으로 구분된 아래 리뷰에서 배송과 관련된 정보만 추출합니다.
최대 30단어로 제한합니다.

리뷰: ```{prod_review}```
"""
response = get_completion(prompt)
print(response)
````

```output
"배송은 예상보다 하루 일찍 도착"
```

### 여러 제품 리뷰 요약

```python
review_1 = prod_review 

# 스탠딩 램프 리뷰
review_2 = """
내 침실에 멋진 램프가 필요했는데, 이 램프는 추가 수납 공간이 있고 가격대가 그리 높지 않았습니다.
배송은 빨랐습니다 - 2일만에 도착했습니다.
배송 중에 램프의 줄이 끊어졌는데, 회사는 기꺼이 새 것을 보냈습니다.
그것도 몇일만에 왔고, 조립하기도 쉬웠습니다.
그런 다음 누락된 부품이 있어서 지원팀에 연락했는데 매우 신속하게 누락된 부품을 받았습니다!
Lumina는 고객과 제품을 아끼는 훌륭한 회사인 것 같습니다!!!
"""

# 전동 칫솔 리뷰
review_3 = """
치과위생사가 전동칫솔을 추천해줘서 이걸 샀어요.
배터리 수명은 지금까지도 꽤 인상적입니다.
처음 충전하고 지난 3주 동안 매일 두 번 양치질을 모두 동일한 충전으로 사용했습니다.

하지만 칫솔모가 너무 작습니다. 아기 칫솔이 이것보다도 더 클것 같아요.
치아 사이에 더 잘 들어갈 수 있도록 길이가 더 컸으면 좋겠습니다.
전반적으로 $50 정도로 사기에는 괜찮은 것 같습니다.

제조업체의 교체용 헤드는 꽤 비싸지만 더 합리적인 가격의 일반 헤드를 구할 수 있습니다.
이 칫솔은 내가 매일 치과에 간 것 같은 느낌을 줍니다. 치아가 반짝반짝 깨끗해진 느낌!
"""

# 믹서기 리뷰
review_4 = """
그래서 그들은 여전히 11월에 약 49달러에 계절 판매로 17피스 시스템을 가지고 있었는데,
약 절반 정도 할인되었지만 어떤 이유로(바가지 가격이라고 부름) 12월 둘째 주쯤에 가격이 모두 올라갔습니다.
동일한 시스템은 $70-$89 사이입니다. 그리고 11피스 시스템은 이전 판매 가격인 $29에서 $10 정도 가격이 올랐습니다.

그래서 괜찮아 보이지만 본체를 보면 칼날이 제자리에 고정되는 부분이 몇 년 전의 이전 버전만큼 좋아 보이지는 않는데,
저는 아주 부드럽게 사용할 계획입니다 (예를 들어, 저는 콩, 얼음, 쌀 등과 같은 매우 단단한 품목을
먼저 블렌더에서 분쇄한 다음 블렌더에서 원하는 서빙 크기로 분쇄한 다음 더 고운 밀가루를 위해 휘핑 칼날로 전환하고
먼저 십자 칼날을 사용합니다. 스무디를 만들 때 더 곱거나 과육이 덜 필요하면 평평한 칼날을 사용하세요.).

스무디를 만들 때 특별한 팁, 사용할 과일과 야채를 잘게 자르고 얼립니다
(시금치를 사용하는 경우-시금치를 살짝 끓인 다음 사용할 준비가 될 때까지 얼립니다.
셔벗을 만들 경우 중소형 푸드 프로세서 사용).
그렇게 하면 스무디를 만들 때 얼음을 너무 많이 넣지 않아도 됩니다.

약 1년 후 모터에서 이상한 소리가 났습니다.
고객센터에 전화를 했는데 보증기간이 이미 만료돼서 하나 더 사야 했어요.
참고: 이런 유형의 제품에서는 전반적인 품질이 떨어지기 때문에 판매를 유지하기 위해
브랜드 인지도와 소비자 충성도에 의존하고 있습니다. 약 이틀만에 받았습니다.
"""

reviews = [review_1, review_2, review_3, review_4]
```

````python
for i in range(len(reviews)):
    prompt = f"""
    당신의 임무는 전자상거래 사이트의 제품 리뷰에 대한 간단한 요약을 생성하는 것입니다. 

    세 개의 백틱으로 구분된 리뷰를 최대 20 단어로 요약하세요.

    리뷰: ```{reviews[i]}```
    """

    response = get_completion(prompt)
    print(i, response, "\n")
````

```output
0 "부드럽고 귀여운 팬더 봉제인형, 가격 대비 크기는 작지만 딸이 좋아해요. 배송은 예상보다 일찍 도착했습니다."

1 간단 요약: 멋진 램프, 추가 수납 공간, 빠른 배송, 누락된 부품 신속 대응, 고객 친절. 

2 치과위생사 추천 전동칫솔, 배터리 수명 인상적, 칫솔모가 작음, 가격은 괜찮음, 교체용 헤드 비싸지만 일반 헤드 구할 수 있음, 치아 깨끗해짐. 

3 11월에 49달러에 판매된 17피스 시스템은 12월에 가격이 올랐으며, 11피스 시스템은 $29에서 $10 정도 가격이 올랐습니다. 블렌더는 과일과 야채를 잘게 자르고 얼리면 스무디를 만들 때 얼음을 너무 많이 넣지 않아도 됩니다. 모터에서 이상한 소리가 나서 보증기간이 만료돼서 새로 구매해야 했습니다.
```

## 추론하기

제품 리뷰와 뉴스 기사에서 감정과 주제를 유추해보기

### 제품 리뷰 텍스트

```python
lamp_review = """
내 침실에 멋진 램프가 필요했는데, 이 램프는 추가 수납 공간이 있고 가격대가 그리 높지 않았습니다.
배송은 빨랐습니다 - 2일만에 도착했습니다.
배송 중에 램프의 줄이 끊어졌는데, 회사는 기꺼이 새 것을 보냈습니다.
그것도 몇일만에 왔고, 조립하기도 쉬웠습니다.
그런 다음 누락된 부품이 있어서 지원팀에 연락했는데 매우 신속하게 누락된 부품을 받았습니다!
Lumina는 고객과 제품을 아끼는 훌륭한 회사인 것 같습니다!!!
"""
```

### 감성 (긍정적/부정적)

```python
prompt = f"""
세 개의 백틱으로 구분된 제품 리뷰의 감성은 무엇입니까?

리뷰 텍스트: '''{lamp_review}'''
"""
response = get_completion(prompt)
print(response)
```

```output
감성: 긍정적
```

```python
prompt = f"""
세 개의 백틱으로 구분된 제품 리뷰의 감성은 무엇입니까?
'긍정적' 또는 '부정적' 중 한 단어로 답하세요.

리뷰 텍스트: '''{lamp_review2}'''
"""
response = get_completion(prompt)
print(response)
```

```output
긍정적
```

### 감성 유형 식별

```python
prompt = f"""
다음 리뷰의 작성자가 표현하고 있는 감성 목록을 식별합니다.
목록에 5개 이하의 항목을 포함시키십시오.
답의 형식은 쉼표로 구분된 감성 단어의 목록으로 구성합니다.

리뷰 텍스트: '''{lamp_review}'''
"""
response = get_completion(prompt)
print(response)
```

```output
만족, 감사, 놀람, 신뢰, 친절함
```

### 불만 식별

```python
prompt = f"""
다음 리뷰 작성자가 불만을 표현하고 있나요?
리뷰는 세 개의 백틱으로 구분됩니다. 
'예' 또는 '아니요'로 답하세요.

리뷰 텍스트: '''{lamp_review}'''
"""
response = get_completion(prompt)
print(response)
```

```output
아니요
```

### 고객 리뷰에서 제품 및 회사명 추출

```python
prompt = f"""
리뷰 텍스트에서 다음 항목을 식별합니다: 
- 리뷰어가 구매한 아이템
- 해당 아이템을 만든 회사

리뷰는 백틱 세 개로 구분됩니다. 
"Item" 및 "Brand"를 키로 사용하여 응답 형식을 JSON 객체로 합니다. 
정보가 없는 경우 "알 수 없음"을 값으로 사용합니다.
응답은 가능한 한 짧게 작성하세요.
  
리뷰 텍스트: '''{lamp_review}'''
"""
response = get_completion(prompt)
print(response)
```

```json
{
    "Item": "램프",
    "Brand": "Lumina"
}
```

### 한 번에 여러 작업 수행

```python
prompt = f"""
리뷰 텍스트에서 다음 항목을 식별합니다: 
- 감성(긍정적 또는 부정적)
- 리뷰 작성자가 불만을 표현하고 있나요? (True 또는 False)
- 리뷰어가 구매한 아이템
- 아이템을 만든 회사

리뷰는 백틱 세 개로 구분됩니다. 

"감성", "불만", "아이템" 및 "브랜드"를 키로 사용하는 JSON으로 응답하세요.

정보가 없는 경우 "알 수 없음"을 값으로 사용합니다.

응답은 가능한 한 짧게 작성하세요.

불만 값의 형식을 부울로 지정합니다.

리뷰 텍스트: '''{lamp_review}'''
"""
response = get_completion(prompt)
print(response)
```

```json
{
  "감성": "긍정적",
  "불만": false,
  "아이템": "램프",
  "브랜드": "Lumina"
}
```

### 주제 추론하기

```python
story = """
최근 정부에서 실시한 설문 조사에서 공공 부문 직원들에게 자신이 근무하는 부서에 대한 직업 만족도를
평가해 달라는 요청을 받았습니다. 조사 결과, 만족도가 95%에 달하는 가장 인기 있는 부서는 NASA로 나타났습니다.

NASA의 한 직원인 존 스미스는 조사 결과에 대해 다음과 같이 말했습니다, "NASA가 1위에 오른 것이 놀랍지 않습니다.
훌륭한 사람들과 함께 일하기 좋은 곳이며 놀라운 기회를 제공합니다. 이렇게 혁신적인 조직의 일원이 된 것이 
자랑스럽습니다."

이번 결과는 NASA의 경영진도 환영했습니다, 톰 존슨(Tom Johnson) 국장은
"우리 직원들이 직원들이 NASA에서의 업무에 만족하고 있다는 소식을 듣게 되어 기쁩니다. 
우리에게는 목표를 달성하기 위해 지칠 줄 모르고 일하고 있는 목표를 달성하기 위해 끊임없이
노력하는 재능 있고 헌신적인 팀이 있습니다. 성과를 내고 있습니다."

설문조사에 따르면 다음과 같은 사실도 밝혀졌습니다. 사회보장국은 만족도가 가장 낮았습니다.
직원의 45%만이 자신의 업무에 만족한다고 답했습니다. 자신의 직업에 만족한다고 답했습니다.
정부는 다음과 같이 약속했습니다. 설문조사에서 직원들이 제기한 우려 사항을 해결하고 모든 부서의
직무 만족도를 개선하기 위해 노력하겠다고 약속했습니다.
"""
```

5개 주제 추론

```python
prompt = f"""
세 개의 백틱으로 구분된 텍스트에서 논의되고 있는 5개의 주제를 결정합니다.

각 주제는 하나 또는 두개의 단어로 작성합니다.

응답 형식은 파이썬 리스트 입니다.

텍스트 샘플: '''{story2}'''
"""
response = get_completion(prompt)
print(response)
```

```output
['설문조사 결과', 'NASA의 직원 만족도', 'NASA의 경영진 반응', '사회보장국의 직원 만족도', '정부의 대응 약속']
```

특정 주제에 대한 뉴스 알람 만들기

```python
topic_list = ["NASA", "지방 정부", "Engineering", "직원 만족도", "연방 정부"]

prompt = f"""
다음 주제 목록의 각 항목이 세 개의 백틱으로 구분된 아래 텍스트의 주제에 해당하는지 여부를 판단합니다.

각 주제에 대해 0 또는 1로 표시된 목록으로 답하세요.

주제 목록: {", ".join(topic_list)}

텍스트 샘플: '''{story}'''
"""
response = get_completion(prompt)
print(response)
```

```output
NASA: 1
지방 정부: 0
Engineering: 0
직원 만족도: 1
연방 정부: 1
```

```python
topic_dict = {i.split(': ')[0]: int(i.split(': ')[1]) for i in response.split(sep='\n')}
if topic_dict['NASA'] == 1:
    print("알람: 새로운 NASA 기사!")
```

```output
알람: 새로운 NASA 기사!
```

## 변환하기

언어 번역, 맞춤법 및 문법 검사, 어조 조정, 형식 변환과 같은 텍스트 변환 작업에 대규모 언어 모델을 사용하는 방법을 살펴봅니다.

### 번역

ChatGPT의 다국어 학습을 통해 다양한 언어 간 번역을 지원합니다. 다음은 이 기능을 사용하는 방법에 대한 몇 가지 예입니다.

````python
prompt = f"""
다음 영어 텍스트를 스페인어로 번역하세요: \ 
```Hi, I would like to order a blender```
"""
response = get_completion(prompt)
print(response)
````

```output
Hola, me gustaría pedir una licuadora.
```

````python
prompt = f"""
어떤 언어인지 알려주세요: 
```Combien coûte le lampadaire?```
"""
response = get_completion(prompt)
print(response)
````

```output
이 문장은 프랑스어입니다.
```

````python
prompt = f"""
다음 언어를 프랑스어, 스페인어, 영어로 번역하세요:
```I want to order a basketball```
"""
response = get_completion(prompt)
print(response)
````

```output
Je veux commander un ballon de basket (프랑스어)
Quiero pedir una pelota de baloncesto (스페인어)
I want to order a basketball (영어)
```

```python
prompt = f"""
다음 텍스트를 반말과 존댓말 두 형식의 스페인어로 번역하세요:
'Would you like to order a pillow?'
"""
response = get_completion(prompt)
print(response)
```

```output
- 반말: ¿Quieres pedir una almohada?
- 존댓말: ¿Le gustaría pedir una almohada?
```

### 유니버셜 번역기

대규모 다국적 이커머스 기업에서 IT를 담당하고 있다고 가정해 보세요. 사용자들이 각자의 모국어로 IT 문제에 대해 메시지를 보내고 있습니다. 전 세계 각지에서 온 직원들은 각자의 모국어만 구사합니다. 여러분에게는 범용 번역기가 필요합니다!

````python
user_messages = [
  "La performance du système est plus lente que d'habitude.",
  "Mi monitor tiene píxeles que no se iluminan.",
  "Il mio mouse non funziona",
  "Mój klawisz Ctrl jest zepsuty",
  "我的屏幕在闪烁"
]

for issue in user_messages:
    prompt = f"언어 종류는?: ```{issue}```
    lang = get_completion(prompt)
    print(f"원본 메세지 ({lang}): {issue}")

    prompt = f"""
    다음 텍스트를 English와 한국어로 번역하세요: ```{issue}```
    """
    response = get_completion(prompt)
    print(response, "\n")
````

```output
원본 메세지 (프랑스어 (French)): La performance du système est plus lente que d'habitude.
English: The system performance is slower than usual.
한국어: 시스템 성능이 평소보다 느립니다. 

원본 메세지 (스페인어입니다.): Mi monitor tiene píxeles que no se iluminan.
English: My monitor has pixels that don't light up.
한국어: 내 모니터에는 불이 켜지지 않는 픽셀이 있습니다. 

원본 메세지 (이탈리아어입니다.): Il mio mouse non funziona
English: My mouse is not working.
한국어: 내 마우스가 작동하지 않습니다. 

원본 메세지 (폴란드어입니다.): Mój klawisz Ctrl jest zepsuty
English: My Ctrl key is broken.
한국어: 내 Ctrl 키가 고장 났어. 

원본 메세지 (중국어 (간체자)): 我的屏幕在闪烁
English: My screen is flickering.
한국어: 내 화면이 깜빡입니다.
```

### 톤 변환

글쓰기는 대상에 따라 달라질 수 있습니다. ChatGPT는 다양한 톤을 생성할 수 있습니다.

````python
prompt = f"""
다음 속어 문장을 정중한 비즈니스 이메일 형식으로 변경하세요:
```
나 태훈인데, 첨부한 스탠드 램프의 사양을 확인해.
```
"""

response = get_completion(prompt)
print(response)
````

```output
안녕하세요,
저는 태훈입니다. 첨부된 스탠드 램프의 사양을 확인 부탁드립니다.
감사합니다.
```

### 포맷 변환

ChatGPT는 형식 간 번역이 가능합니다. 프롬프트에 입력 및 출력 형식이 설명되어 있어야 합니다.

```python
from IPython.display import display, Markdown, Latex, HTML, JSON

data_json = { "resturant employees" :[ 
    {"name":"Shyam", "email":"shyamjaiswal@gmail.com"},
    {"name":"Bob", "email":"bob32@gmail.com"},
    {"name":"Jai", "email":"jai87@gmail.com"}
]}

prompt = f"""
다음 Python 사전 데이터를 JSON에서 테이블 형식의 HTML으로 변환하세요.
열 이름과 캡션도 포함된 테이블 입니다: {data_json}
"""
response = get_completion(prompt)

display(HTML(response))
```

<p align="center">
<img src="https://img-src.io/i/taehun/chatgpt-prompt-engineering/3.png" alt="notion image">
</p>

### 맞춤법/문법 검사

다음은 일반적인 문법 및 철자 문제와 LLM의 응답에 대한 몇 가지 예입니다.

LLM에 텍스트를 교정해 달라는 신호를 보내려면 모델에 '교정' 또는 '교정 및 수정'을 지시합니다.

````python
text = [ 
  "The girl with the black and white puppies have a ball.",  # 동사 오류
  "Yolanda has her notebook.", # ok
  "Its going to be a long day. Does the car need it’s oil changed?",  # 동음이의어 오류
  "Their goes my freedom. There going to bring they’re suitcases.",  # 동음이의어 오류
  "Your going to need you’re notebook.",  # 동음이의어 오류
  "That medicine effects my ability to sleep. Have you heard of the butterfly affect?", # 동음이의어 오류
  "This phrase is to cherck chatGPT for speling abilitty"  # 스펠링 오류
]

for t in text:
    prompt = f"""
    다음 영문 텍스트를 교정하고 교정된 버전으로 출력하세요.
    오류를 찾지 못한 문장은 "<오류 없음>"이라고 출력합니다: ```{t}```
    """
    response = get_completion(prompt)
    print(response)
````

```output
The girl with the black and white puppies has a ball.
<오류 없음>
It's going to be a long day. Does the car need its oil changed?
Their goes my freedom. They're going to bring their suitcases.
You're going to need your notebook.
"That medicine affects my ability to sleep. Have you heard of the butterfly effect?"
This phrase is to check ChatGPT for spelling ability.
```

````python
text = f"""
Got this for my daughter for her birthday cuz she keeps taking \
mine from my room.  Yes, adults also like pandas too.  She takes \
it everywhere with her, and it's super soft and cute.  One of the \
ears is a bit lower than the other, and I don't think that was \
designed to be asymmetrical. It's a bit small for what I paid for it \
though. I think there might be other options that are bigger for \
the same price.  It arrived a day earlier than expected, so I got \
to play with it myself before I gave it to my daughter.
"""
prompt = f"이 리뷰 교정 및 수정: ```{text}```
response = get_completion(prompt)
print(response)
````

```output
I got this panda plushie for my daughter's birthday because she kept taking mine from my room. Yes, even adults like pandas too. She takes it everywhere with her, and it's super soft and cute. However, one of the ears is a bit lower than the other, and I don't think that was designed to be asymmetrical. Also, I feel like it's a bit small for the price I paid. I think there might be other options that are bigger for the same price. On the bright side, it arrived a day earlier than expected, so I got to play with it myself before giving it to my daughter.
```

```python
from redlines import Redlines

diff = Redlines(text, response)
display(Markdown(diff.output_markdown))
```

> ~~**Got**~~ **I got** this **panda plushie** for my ~~**daughter for her**~~ **daughter's** birthday ~~**cuz**~~ **because** she ~~**keeps**~~ **kept** taking mine from my ~~**room.**~~ **room.** Yes, **even** adults ~~**also**~~ like pandas ~~**too.**~~ **too.** She takes it everywhere with her, and it's super soft and ~~**cute. One**~~ **cute. However, one** of the ears is a bit lower than the other, and I don't think that was designed to be asymmetrical. ~~**It's**~~ **Also, I feel like it's** a bit small for ~~**what**~~ **the price** I ~~**paid for it though.**~~ **paid.** I think there might be other options that are bigger for the same ~~**price. It**~~ **price. On the bright side, it** arrived a day earlier than expected, so I got to play with it myself before ~~**I gave**~~ **giving** it to my ~~**daughter.**~~ **daughter.**

````python
from IPython.display import Markdown

prompt = f"""
다음 리뷰를 교정 및 수정하고, 더 설득력 있게 작성하세요. 
APA 스타일 가이드를 따르고 고급 독자를 대상으로 합니다. 
Markdown 형식으로 출력합니다.
리뷰: ```{text}```
"""
response = get_completion(prompt)
display(Markdown(response))
````

> **Title: A Cute and Soft Panda Plush Toy for All Ages**
>
> **Introduction:** As an adult, I understand the appeal of cute and cuddly plush toys. That's why I got this panda plush toy for my daughter's birthday, as she kept taking mine from my room. In this review, I will share my thoughts on the product's quality, design, and value for money.
>
> **Body:** The panda plush toy is undeniably soft and cute, making it a perfect companion for children and adults alike. My daughter takes it everywhere with her, and I have to admit that I've grown attached to it too. However, I did notice that one of the ears is a bit lower than the other, which seems to be a manufacturing flaw rather than a deliberate design choice.
>
> While I appreciate the quality of the product, I do think that it's a bit small for the price I paid. I believe that there are other options available that offer better value for money in terms of size. Nonetheless, I was pleasantly surprised to receive the product a day earlier than expected, which gave me the chance to play with it myself before giving it to my daughter.
>
> **Conclusion:** Overall, I would recommend this panda plush toy to anyone who loves cute and cuddly companions. Despite its small size and minor flaw, it's a high-quality product that is sure to bring joy to anyone who receives it.

## 확장하기

각 고객의 리뷰에 맞는 고객 서비스 이메일을 생성하기

### 고객 이메일에 대한 자동 회신 사용자 지정하기

```python
# 리뷰 내용에서 감성을 판단하는 것은 '추론하기' 단원 참고
sentiment = "부정적"

review = f"""
그래서 그들은 여전히 11월에 약 49달러에 계절 판매로 17피스 시스템을 가지고 있었는데,
약 절반 정도 할인되었지만 어떤 이유로(바가지 가격이라고 부름) 12월 둘째 주쯤에 가격이 모두 올라갔습니다.
동일한 시스템은 $70-$89 사이입니다. 그리고 11피스 시스템은 이전 판매 가격인 $29에서 $10 정도 가격이 올랐습니다.

그래서 괜찮아 보이지만 본체를 보면 칼날이 제자리에 고정되는 부분이 몇 년 전의 이전 버전만큼 좋아 보이지는 않는데,
저는 아주 부드럽게 사용할 계획입니다 (예를 들어, 저는 콩, 얼음, 쌀 등과 같은 매우 단단한 품목을
먼저 블렌더에서 분쇄한 다음 블렌더에서 원하는 서빙 크기로 분쇄한 다음 더 고운 밀가루를 위해 휘핑 칼날로 전환하고
먼저 십자 칼날을 사용합니다. 스무디를 만들 때 더 곱거나 과육이 덜 필요하면 평평한 칼날을 사용하세요.).

스무디를 만들 때 특별한 팁, 사용할 과일과 야채를 잘게 자르고 얼립니다
(시금치를 사용하는 경우-시금치를 살짝 끓인 다음 사용할 준비가 될 때까지 얼립니다.
셔벗을 만들 경우 중소형 푸드 프로세서 사용).
그렇게 하면 스무디를 만들 때 얼음을 너무 많이 넣지 않아도 됩니다.

약 1년 후 모터에서 이상한 소리가 났습니다.
고객센터에 전화를 했는데 보증기간이 이미 만료돼서 하나 더 사야 했어요.
참고: 이런 유형의 제품에서는 전반적인 품질이 떨어지기 때문에 판매를 유지하기 위해
브랜드 인지도와 소비자 충성도에 의존하고 있습니다. 약 이틀만에 받았습니다.
"""
```

````python
prompt = f"""
당신은 고객 서비스 AI 어시스턴트입니다.
당신의 임무는 소중한 고객에게 이메일 답장을 보내는 것입니다.
```로 고객 이메일을 구분합니다.
고객의 리뷰에 대한 감사의 답장을 생성합니다.
감정이 긍정적이거나 중립적인 경우 고객의 리뷰에 감사를 표시합니다.

부정적인 감정인 경우에는 사과하고 고객 서비스에 문의할 수 있도록 제안합니다. 
리뷰의 구체적인 세부 정보를 사용하세요.
간결하고 전문적인 어조로 작성하세요.
이메일에 'AI 고객 상담원'으로 서명합니다.

고객 리뷰: ```{review}```
리뷰 감성: {sentiment}
"""

response = get_completion(prompt)
print(response)
````

```output
안녕하세요,

저희 제품을 구매해 주셔서 감사합니다. 그러나 고객님의 리뷰를 읽어보니 불만족스러운 경험을 하셨다는 것을 알게 되어 죄송합니다.

저희 제품의 가격 변동과 모터 소리에 대한 문제로 인해 불편을 드려 대단히 죄송합니다. 이러한 문제가 발생한 것에 대해 깊이 양해를 구합니다.

고객님의 소중한 의견을 반영하여 제품의 품질 향상에 노력하겠습니다. 또한, 고객님께서 문의하신 내용에 대해서는 고객 서비스팀으로 연락주시면 친절하게 안내해 드리겠습니다.

감사합니다.

AI 고객 상담원
```

### 고객 이메일의 세부 정보를 모델에서 사용

<p align="center">
<img src="https://img-src.io/i/taehun/chatgpt-prompt-engineering/4.png?w=600" alt="notion image">
</p>

````python
prompt = f"""
당신은 고객 서비스 AI 어시스턴트입니다.
당신의 임무는 소중한 고객에게 이메일 답장을 보내는 것입니다.
```로 구분된 고객 이메일이 주어지면, 고객의 리뷰에 대한 답장을 생성합니다.
감정이 긍정적이거나 중립적인 경우, 고객의 리뷰에 감사를 표시합니다.
부정적인 감정인 경우에는 사과하고 고객 서비스에 문의할 수 있도록 제안합니다. 
리뷰의 구체적인 세부 정보를 사용하세요.
간결하고 전문적인 어조로 작성하세요.
이메일에 'AI 고객 상담원'으로 서명합니다.

고객 리뷰: ```{review}```
리뷰 감성: {sentiment}
"""
response = get_completion(prompt, temperature=0.7)
print(response)
````

```output
안녕하세요,

고객님의 이메일을 받아보았습니다. 먼저 저희 제품을 구매해주셔서 감사드립니다.

고객님께서 언급하신 가격 변동과 모터 소리에 불편을 드려 대단히 죄송합니다.
저희 제품에 대한 고객님의 소중한 피드백을 고려하여 개선점을 찾도록 노력하겠습니다.

제품 사용 시에 고객님께서 언급하신 팁과 주의사항들은 매우 유용한 정보이며,
고객님의 경험을 살려 제품 사용이 더욱 원활하게 이루어질 수 있을 것입니다.

더 나은 서비스를 제공하기 위해 노력하겠습니다.
만약 추가 문의 사항이 있으시다면 언제든지 고객 서비스에 문의해주시기 바랍니다.

감사합니다.

AI 고객 상담원 드림.
```

## 챗봇

채팅 형식을 활용하여 특정 작업이나 행동에 맞게 맞춤화되거나 특화된 챗봇과 확장된 대화를 나누는 방법을 살펴보기

<p align="center">
<img src="https://img-src.io/i/taehun/chatgpt-prompt-engineering/5.png?w=600" alt="notion image">
</p>

새로운 헬퍼 함수

```python
def get_completion_from_messages(messages, model="gpt-3.5-turbo", temperature=0):
    response = openai.ChatCompletion.create(
        model=model,
        messages=messages,
        temperature=temperature, # '확장하기' 단원 참고
    )
    return response.choices[0].message["content"]
````

여러 메세지에 메세지마다 역활(role)을 지정하여 프롬프트를 생성

```python
messages =  [  
    {'role':'system', 'content':'당신은 유머러스한 개발자입니다.'},    
    {'role':'user', 'content':'농담 좀 해봐요.'},   
    {'role':'assistant', 'content':'개발자의 아내가 "여보, 마트가서 우유 하나 사고, 만약 아보카도 있으면 6개 사와."라고 했어요.'},
    {'role':'user', 'content':'그리곤요?'},
    {'role':'assistant', 'content':'개발자 남편이 우유만 6개 사왔습니다.'},
    {'role':'user', 'content':'왜요?'},
]

response = get_completion_from_messages(messages, temperature=1)
print(response)
```

```output
아내가 "아보카도 있으면 6개 사와"라고 했기 때문에요! 이것이 개발자 유머의 전형적인 예시죠. :)
```

```python
messages =  [
    {'role':'system', 'content':'당신은 친근한 챗봇입니다.'},    
    {'role':'user', 'content':'안녕, 나는 태훈 이야.'}
]
response = get_completion_from_messages(messages, temperature=1)
print(response)
```

```output
안녕하세요, 태훈님! 반갑습니다. 무엇을 도와드릴까요?
```

컨텍스트(context)가 다르면 ChatGPT는 이전 내용을 기억하지 못합니다.

```python
messages =  [  
    {'role':'system', 'content':'당신은 친근한 챗봇입니다.'},
    {'role':'user', 'content':'좋아! 내 이름이 뭐야?'}
]
response = get_completion_from_messages(messages, temperature=1)
print(response)
```

```output
안녕하세요! 당신의 이름을 무엇으로 부르면 좋을까요?
```

동일한 컨텍스트에서는 이전에 입력한 내용을 기반으로 응답을 생성합니다.

```python
messages =  [  
    {'role':'system', 'content':'당신은 친근한 챗봇입니다.'},    
    {'role':'user', 'content':'안녕, 나는 태훈 이야.'},
    {'role':'assistant', 'content': '안녕하세요 태훈님, 반갑습니다! 저는 챗봇입니다. 무엇을 도와드릴까요?'},
    {'role':'user', 'content':'좋아! 내 이름이 뭐야?'}
]
response = get_completion_from_messages(messages, temperature=1)
print(response)
```

```output
당신의 이름은 태훈이라고 하셨죠! :)
```

### 주문 봇 만들기

사용자 프롬프트와 어시스턴트 응답 수집을 자동화하여 주문 봇을 구축. 주문봇이 피자 가게에서 주문을 받음.

```python
def collect_messages(_):
    prompt = inp.value_input
    inp.value = ''
    context.append({'role':'user', 'content':f"{prompt}"})
    response = get_completion_from_messages(context) 
    context.append({'role':'assistant', 'content':f"{response}"})
    panels.append(
        pn.Row('고객:', pn.pane.Markdown(prompt, width=600)))
    panels.append(
        pn.Row('주문봇:', pn.pane.Markdown(response, width=600, style={'background-color': '#F6F6F6'})))
 
    return pn.Column(*panels)
```

```python
import panel as pn  # GUI
pn.extension()

panels = [] # collect display 

context = [ {'role':'system', 'content':"""
당신은 피자 레스토랑의 주문을 받는 자동화된 주문봇입니다. 
먼저 고객에게 인사를 건네고 주문을 받은 다음 픽업인지 배달인지 묻습니다.
전체 주문을 받을 때까지 기다린 다음, 주문을 요약하고 고객이 추가할 사항이 있는지 마지막으로 확인합니다.
배송인 경우 주소를 요청합니다.
마지막으로 지불 방법을 확인합니다.
메뉴에서 품목을 고유하게 식별할 수 있도록 모든 옵션, 추가 사항 및 크기를 명확히 설명하세요.
크기는 '라지', '미디움', '스몰'이 있습니다.
짧고 대화하듯 친근한 스타일로 응답합니다. 
메뉴에는 다음이 포함됩니다:
페퍼로니 피자 12.95, 10.00, 7.00 
치즈 피자 10.95, 9.25, 6.50 
가지 피자 11.95, 9.75, 6.75
감자튀김 4.50, 3.50
그리스 샐러드 7.25

토핑: 
엑스트라 치즈 2.00
버섯 1.50 
소시지 3.00
캐나다 베이컨 3.50
AI 소스 1.50
고추 1.00

음료수:
콜라 3.00, 2.00, 1.00
스프라이트 3.00, 2.00, 1.00
생수 5.00
"""} ]  # accumulate messages


inp = pn.widgets.TextInput(value="안녕", placeholder='여기에 텍스트를 입력하세요...')
button_conversation = pn.widgets.Button(name="전송")

interactive_conversation = pn.bind(collect_messages, button_conversation)

dashboard = pn.Column(
    inp,
    pn.Row(button_conversation),
    pn.panel(interactive_conversation, loading_indicator=True, height=300),
)

dashboard
```

<p align="center">
<img src="https://img-src.io/i/taehun/chatgpt-prompt-engineering/6.png" alt="notion image">
</p>

```python
messages =  context.copy()
messages.append({
    'role':'system',
    'content': """
        이전 음식 주문에 대한 JSON 형식의 요약을 생성합니다. 각 항목의 가격을 항목별로 정리합니다.
        필드는 1) 피자, 사이즈 포함 2) 토핑 목록 3) 음료 목록, 사이즈 포함 4) 사이드 메뉴 목록, 사이즈 포함 5) 총 가격
        입니다.
    """
})

response = get_completion_from_messages(messages, temperature=0)
print(response)
```

```output
아래는 이전 주문에 대한 JSON 형식의 요약입니다.

{
  "피자": {
    "메뉴": "페퍼로니 피자",
    "크기": "미디움",
    "가격": 12.95
  },
  "토핑": [],
  "음료": {
    "메뉴": "콜라",
    "크기": "라지",
    "가격": 3.00
  },
  "사이드 메뉴": [],
  "총 가격": 15.95
}
```

## 후기

역시 Andrew 교수님! 이라는 말이 절로 나오는 강의 였습니다. 짧은 강의지만 프롬프트 엔지니어링에 대한 핵심적인 내용을 대부분 잘 담고 있습니다. 회사 업무와 블로깅 등에서 LLM (ChatGPT, Bard)을 적극적으로 활용중이며, 챗봇을 넘어 AGI로 발전해나가는 과정에도 많은 관심을 갖고 있어서 재밌게 수강했습니다.

이 글을 보시는 분들이 이해하기 쉽도록 예제와 프롬프트를 한글로 변환해 보았는데, 몇 가지 예제에서는 원하는 결과를 얻기 위해 여러 번의 *반복적인 프롬프트 개발*이 필요했습니다. 단어와 조사 등을 조금씩 변경하면서 원하는 결과가 나올 때까지 수정했습니다. ChatGPT가 다국어로 학습 되었다곤 하지만, 영어로 된 데이터가 압도적으로 많을테니 영어에 익숙하신 분들이라면 영문 프롬프트를 사용하는 것을 권장드립니다.

흥미로운 강의였으며, 이 글을 읽어주셔서 감사합니다. 강의 내용을 정리하면서 빠진 내용도 있을테니, 원본 강의를 수강하시면서 보조 학습 자료정도로 활용하시면 좋겠습니다.
