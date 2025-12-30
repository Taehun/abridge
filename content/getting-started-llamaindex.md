+++
title = "LlamaIndex 시작하기"
date = 2024-02-18
draft = false

[taxonomies]
tags = ['LLM', 'RAG', 'LlamaIndex']

[extra]
author = "김태훈"
toc = true
+++

## 시작하기

### 설치

- pip

```bash
pip install llama-index
```

### 중요: OpenAI 환경 설정
기본적으로 텍스트 생성에는 OpenAI gpt-3.5-turbo 모델을, 검색 및 임베딩에는 `text-embedding-ada-002`모델을 사용합니다. 이 모델을 사용하려면 환경 변수로 ***OPENAI\_API\_KEY*** 가 설정되어 있어야 합니다. API 키는 [OpenAI 계정에 로그인](https://platform.openai.com/api-keys)하여 새 API 키를 생성하면 얻을 수 있습니다.

```bash
export OPENAI_API_KEY=<YOUR_OPENAI_API_KEY>
```

### 샘플 데이터 다운로드

```bash
wget https://raw.githubusercontent.com/run-llama/llama_index/main/examples/paul_graham_essay/data/paul_graham_essay.txt
mkdir data
mv paul_graham_essay.txt data/
```

### 데이터 로드 및 인덱싱

- `starter.py`

```python
from llama_index import VectorStoreIndex, SimpleDirectoryReader

documents = SimpleDirectoryReader("data").load_data()
index = VectorStoreIndex.from_documents(documents)
```

작업 디렉토리 구조

```text
├── starter.py
└── data
    └── paul_graham_essay.txt
```

### 커스텀 데이터 쿼리

- [`starter.py`](http://starter.py) 파일에 아래 코드 추가

```python
query_engine = index.as_query_engine()
response = query_engine.query("저자는 어렸을 때 무엇을 했나요?")
print(response)
```

결과

<p align="center">
<img src="https://img-src.io/taehun/getting-started-llamaindex/1.png?w=800" alt="스크린샷">
</p>

### 로깅을 사용하여 쿼리 및 이벤트 보기

[`starter.py`](http://starter.py) 파일 상단에 아래 코드를 추가 합니다.

```python
import logging
import sys

logging.basicConfig(stream=sys.stdout, level=logging.DEBUG)
logging.getLogger().addHandler(logging.StreamHandler(stream=sys.stdout))
```

자세한 출력을 원하면 로깅 레벨을 `DEBUG`로 설정하고, 이보다 간략하게 출력하려면 `level=logging.INFO`를 사용하면 됩니다.

### 인덱스 저장

기본적으로 방금 로드한 데이터는 일련의 벡터 임베딩으로 메모리에 저장됩니다. 임베딩을 디스크에 저장하면 시간을 절약하고 OpenAI에 대한 요청도 줄일 수 있습니다. 아래 코드를 추가하면 됩니다:

```python
index.storage_context.persist()
```

기본적으로 데이터를 디렉토리 저장소에 저장하지만 persist\_dir 매개변수를 전달하여 이를 변경할 수 있습니다.

물론 데이터를 로드하지 않으면 지속성의 이점을 얻을 수 없습니다. 따라서 색인이 존재하지 않으면 생성하여 저장하고, 존재하면 로드하도록 `starter.py`를 수정해 보겠습니다:

```python
import os.path
from llama_index import (
    VectorStoreIndex,
    SimpleDirectoryReader,
    StorageContext,
    load_index_from_storage,
)

# 'storage' 폴더가 없으면
if not os.path.exists("./storage"):
    # 문서를 로드하고 색인을 생성합니다.
    documents = SimpleDirectoryReader("data").load_data()
    index = VectorStoreIndex.from_documents(documents)
    # 나중에 사용할 수 있도록 저장
    index.storage_context.persist()
else:
    # 저장된 인덱스 로드
    storage_context = StorageContext.from_defaults(persist_dir="./storage")
    index = load_index_from_storage(storage_context)

# 어느 쪽이든 이제 인덱스를 쿼리할 수 있습니다.
query_engine = index.as_query_engine()
response = query_engine.query("저자는 어렸을 때 무엇을 했나요?")
print(response)
```

결과

<p align="center">
<img src="https://img-src.io/taehun/getting-started-llamaindex/2.png?w=800" alt="스크린샷">
</p>

## 상위 개념

### Retrieval Augmented Generation (RAG)

머신러닝은 방대한 데이터에 대해 학습하지만 사용자 데이터에 대해서는 학습하지 않습니다. **검색 증강 생성(Retrieval Augmented Generation, RAG)** 은 LLM이 이미 액세스하고 있는 데이터에 사용자 데이터를 추가하여 이 문제를 해결합니다. 이 문서에서 RAG에 대한 언급을 자주 보게 될 것입니다.

RAG에서는 데이터가 로드되고 쿼리를 위해 준비되거나 "*인덱싱*"됩니다. 사용자 쿼리는 인덱스에 작용하여 데이터를 가장 관련성이 높은 컨텍스트로 필터링합니다. 그러면 이 컨텍스트와 쿼리가 프롬프트와 함께 LLM으로 전달되고, LLM은 응답을 제공합니다.

챗봇이나 에이전트를 구축하는 경우에도 데이터를 애플리케이션으로 가져오기 위한 RAG 기술을 알고 싶을 것입니다.

<p align="center">
<img src="https://img-src.io/taehun/getting-started-llamaindex/3.png?w=800" alt="스크린샷">
</p>

### RAG 단계

RAG에는 다섯 가지 주요 단계가 있으며, 이 단계는 여러분이 구축하는 모든 대규모 애플리케이션의 일부가 될 것입니다. 다음은 다음과 같습니다:

1. **로딩**: 텍스트 파일, PDF, 다른 웹사이트, 데이터베이스, API 등 데이터가 있는 곳에서 파이프라인으로 데이터를 가져오는 것을 말합니다. 라마허브는 선택할 수 있는 수백 개의 커넥터를 제공합니다.
2. **인덱싱**: 이는 데이터를 쿼리할 수 있는 데이터 구조를 만드는 것을 의미합니다. LLM의 경우, 이는 거의 항상 벡터 임베딩, 데이터의 의미를 수치로 표현하는 것, 그리고 맥락에 맞는 데이터를 정확하게 찾을 수 있도록 하는 다양한 메타데이터 전략을 만드는 것을 의미합니다.
3. **저장**: 데이터가 색인된 후에는 거의 항상 색인과 다른 메타데이터를 저장하여 다시 색인할 필요가 없도록 해야 합니다.
4. **쿼리**: 주어진 인덱싱 전략에 따라 하위 쿼리, 다단계 쿼리, 하이브리드 전략 등 다양한 방법으로 LLM과 LlamaIndex 데이터 구조를 활용하여 쿼리할 수 있습니다.
5. **평가**: 모든 파이프라인에서 중요한 단계는 다른 전략과 비교하여 얼마나 효과적인지 또는 언제 변경해야 하는지 확인하는 것입니다. 평가는 쿼리에 대한 응답이 얼마나 정확하고 충실하며 빠른지에 대한 객관적인 척도를 제공합니다.

<p align="center">
<img src="https://img-src.io/taehun/getting-started-llamaindex/4.png?w=800" alt="스크린샷">
</p>

### 각 단계의 중요 개념

또한 이러한 각 단계의 단계를 나타내는 몇 가지 용어가 있습니다.

#### 로드 단계

- *노드* 및 *문서*: 문서는 모든 데이터 소스(예: PDF, API 출력 또는 데이터베이스에서 검색된 데이터)를 담고 있는 컨테이너입니다. 노드는 라마 인덱스에서 데이터의 원자 단위이며 소스 문서의 '청크'를 나타냅니다. 노드에는 해당 노드가 속한 문서 및 다른 노드와 관련된 메타데이터가 있습니다.

- *커넥터*: 데이터 커넥터(종종 리더라고도 함)는 다양한 데이터 소스 및 데이터 형식의 데이터를 문서와 노드로 수집합니다.

#### 인덱싱 단계

- *인덱싱*: 데이터를 수집한 후에는 데이터를 검색하기 쉬운 구조로 색인하는 데 도움이 되는 LlamaIndex가 있습니다. 여기에는 일반적으로 벡터 저장소라는 특수 데이터베이스에 저장되는 벡터 임베딩을 생성하는 작업이 포함됩니다. 인덱스에는 데이터에 대한 다양한 메타데이터도 저장할 수 있습니다.
- *임베딩*: LLM은 임베딩이라고 하는 데이터의 숫자 표현을 생성합니다. 관련성을 위해 데이터를 필터링할 때, LlamaIndex는 쿼리를 임베딩으로 변환하고, 벡터 스토어는 쿼리의 임베딩과 수치적으로 유사한 데이터를 찾습니다.

#### 쿼리 단계

- *리트리버*: 리트리버는 쿼리가 주어졌을 때 인덱스에서 관련 컨텍스트를 효율적으로 검색하는 방법을 정의합니다. 검색 전략은 검색된 데이터의 관련성과 검색의 효율성을 결정하는 핵심 요소입니다.
- *라우터*: 라우터는 지식창고에서 관련성 있는 컨텍스트를 검색하는 데 사용할 검색기를 결정합니다. 좀 더 구체적으로 RouterRetriever 클래스는 쿼리를 실행할 하나 또는 여러 개의 후보 리트리버를 선택하는 일을 담당합니다. 이 클래스는 선택기를 사용하여 각 후보의 메타데이터와 쿼리를 기반으로 최상의 옵션을 선택합니다.
- *노드 포스트프로세서*: 노드 포스트프로세서는 검색된 노드 집합을 받아 변환, 필터링 또는 순위 재지정 로직을 적용합니다.
- *응답 합성기*: 응답 합성기는 사용자 쿼리와 검색된 텍스트 청크의 지정된 세트를 사용하여 LLM에서 응답을 생성합니다.

### 종합 정리

데이터 기반 LLM 애플리케이션의 사용 사례는 무궁무진하지만 크게 세 가지 범주로 분류할 수 있습니다:

- ***쿼리 엔진***: 쿼리 엔진은 데이터에 대해 질문할 수 있는 종단간 파이프라인입니다. 쿼리 엔진은 자연어 쿼리를 받아 검색된 참조 컨텍스트와 함께 응답을 반환하여 LLM에 전달합니다.
- ***채팅 엔진***: 채팅 엔진은 데이터와 대화를 나누기 위한 종단간 파이프라인입니다(단일 질문과 답변이 아닌 여러 번의 주고받기).
- ***에이전트***: 에이전트는 일련의 도구를 통해 세상과 상호작용하는 LLM 기반의 자동화된 의사 결정자입니다. 에이전트는 주어진 작업을 완료하기 위해 임의의 단계를 수행하여 미리 정해진 단계를 따르지 않고 동적으로 최선의 조치를 결정할 수 있습니다. 이를 통해 보다 복잡한 작업을 유연하게 처리할 수 있습니다

## 커스터마이징 튜토리얼

이 튜토리얼에서는 [시작 예제](https://docs.llamaindex.ai/en/stable/getting_started/starter_example.html)를 위해 작성한 코드부터 시작하여 사용 사례에 맞게 사용자 지정할 수 있는 가장 일반적인 방법을 보여드립니다:

- `starter.py`

```python
from llama_index import VectorStoreIndex, SimpleDirectoryReader

documents = SimpleDirectoryReader("data").load_data()
index = VectorStoreIndex.from_documents(documents)
query_engine = index.as_query_engine()
response = query_engine.query("What did the author do growing up?")
print(response)
```

*"문서를 더 작은 청크로 파싱하고 싶습니다.”*

```python
from llama_index import ServiceContext

service_context = ServiceContext.from_defaults(chunk_size=1000)
```

ServiceContext는 라마 인덱스 파이프라인에서 사용되는 서비스 및 구성의 번들입니다.

```python
from llama_index import VectorStoreIndex, SimpleDirectoryReader

documents = SimpleDirectoryReader("data").load_data()
index = VectorStoreIndex.from_documents(
    documents, service_context=service_context
)
query_engine = index.as_query_engine()
response = query_engine.query("What did the author do growing up?")
print(response)
```

*"다른 벡터 저장소를 사용하고 싶습니다.”*

```python
import chromadb
from llama_index.vector_stores import ChromaVectorStore
from llama_index import StorageContext

chroma_client = chromadb.PersistentClient()
chroma_collection = chroma_client.create_collection("quickstart")
vector_store = ChromaVectorStore(chroma_collection=chroma_collection)
storage_context = StorageContext.from_defaults(vector_store=vector_store)
```

StorageContext는 문서, 임베딩, 인덱스가 저장되는 저장소 백엔드를 정의합니다. [저장소](https://docs.llamaindex.ai/en/stable/module_guides/storing/storing.html) 및 [저장소를 사용자 지정하는 방법](https://docs.llamaindex.ai/en/stable/module_guides/storing/customization.html)에 대해 자세히 알아보세요.

```python
from llama_index import VectorStoreIndex, SimpleDirectoryReader

documents = SimpleDirectoryReader("data").load_data()
index = VectorStoreIndex.from_documents(
    documents, storage_context=storage_context
)
query_engine = index.as_query_engine()
response = query_engine.query("What did the author do growing up?")
print(response)
```

*"쿼리할 때 더 많은 컨텍스트를 검색하고 싶습니다.”*

```python
from llama_index import VectorStoreIndex, SimpleDirectoryReader

documents = SimpleDirectoryReader("data").load_data()
index = VectorStoreIndex.from_documents(documents)
query_engine = index.as_query_engine(similarity_top_k=5)
response = query_engine.query("What did the author do growing up?")
print(response)
```

`as_query_engine`은 인덱스 위에 기본 리트리버와 쿼리 엔진을 구축합니다. 키워드 인수를 전달하여 리트리버와 쿼리 엔진을 구성할 수 있습니다. 여기서는 기본값인 2개 대신 가장 유사한 상위 5개 문서를 반환하도록 리트리버를 구성합니다. [리트리버](https://docs.llamaindex.ai/en/stable/module_guides/querying/retriever/retrievers.html) 및 [쿼리 엔진](https://docs.llamaindex.ai/en/stable/module_guides/deploying/query_engine/root.html)에서 자세히 알아보세요.

*"다른 LLM을 사용하고 싶습니다.”*

```python
from llama_index import ServiceContext
from llama_index.llms import PaLM

service_context = ServiceContext.from_defaults(llm=PaLM())
```

[LLM 커스터마이징](https://docs.llamaindex.ai/en/stable/module_guides/models/llms.html)에서 자세히 알아볼 수 있습니다.

```python
from llama_index import VectorStoreIndex, SimpleDirectoryReader

documents = SimpleDirectoryReader("data").load_data()
index = VectorStoreIndex.from_documents(documents)
query_engine = index.as_query_engine(service_context=service_context)
response = query_engine.query("What did the author do growing up?")
print(response)
```

*"다른 응답 모드를 사용하고 싶습니다.”*

```python
from llama_index import VectorStoreIndex, SimpleDirectoryReader

documents = SimpleDirectoryReader("data").load_data()
index = VectorStoreIndex.from_documents(documents)
query_engine = index.as_query_engine(response_mode="tree_summarize")
response = query_engine.query("What did the author do growing up?")
print(response)
```

[쿼리 엔진](https://docs.llamaindex.ai/en/stable/module_guides/deploying/query_engine/root.html) 및 [응답 모드](https://docs.llamaindex.ai/en/stable/module_guides/deploying/query_engine/response_modes.html)에서 자세히 알아볼 수 있습니다.

*"응답을 다시 스트리밍하고 싶습니다.”*

```python
from llama_index import VectorStoreIndex, SimpleDirectoryReader

documents = SimpleDirectoryReader("data").load_data()
index = VectorStoreIndex.from_documents(documents)
query_engine = index.as_query_engine(streaming=True)
response = query_engine.query("What did the author do growing up?")
response.print_response_stream()
```

[응답 스트리밍](https://docs.llamaindex.ai/en/stable/module_guides/deploying/query_engine/streaming.html)에서 자세히 알아볼 수 있습니다.

*"Q&A 대신 챗봇을 원합니다.”*

```python
from llama_index import VectorStoreIndex, SimpleDirectoryReader

documents = SimpleDirectoryReader("data").load_data()
index = VectorStoreIndex.from_documents(documents)
query_engine = index.as_chat_engine()
response = query_engine.chat("What did the author do growing up?")
print(response)

response = query_engine.chat("Oh interesting, tell me more.")
print(response)
```

[채팅 엔진](https://docs.llamaindex.ai/en/stable/module_guides/deploying/chat_engines/usage_pattern.html)에서 자세히 알아볼 수 있습니다.

## LlamaIndex 비디오 시리즈 알아보기

동영상으로 배우는 것을 좋아하신다면 지금이 바로 "라마인덱스 알아보기" 시리즈를 확인해 보시기 바랍니다. 그렇지 않다면 LlamaIndex 이해하기 튜토리얼을 살펴보는 것을 추천합니다.

### 상향식 개발(라마 문서 봇)

이 문서는 문서 챗봇을 처음부터 구축하는 방법을 보여주는 Discover LlamaIndex의 하위 시리즈입니다.

먼저 데이터 객체인 LLM을 독립적인 모듈로 사용하는 것부터 시작하여 '상향식' 방식으로 구축하는 방법을 보여드립니다. 그런 다음 인덱싱과 고급 검색기/순위 재조정기와 같은 더 높은 수준의 추상화를 점진적으로 추가하세요.

- [Full Repo](https://github.com/run-llama/llama_docs_bot) [[Part 1] LLMs and Prompts](https://www.youtube.com/watch?v=p0jcvGiBKSA) [[Part 2] Documents and Metadata](https://www.youtube.com/watch?v=nGNoacku0YY) [[Part 3]](https://www.youtube.com/watch?v=LQy8iHOJE2A)
- [Evaluation](https://www.youtube.com/watch?v=LQy8iHOJE2A) [[Part 4] Embeddings](https://www.youtube.com/watch?v=2c64G-iDJKQ) [[Part 5] Retrievers and Postprocessors](https://www.youtube.com/watch?v=mIyZ_9gqakE)

### 하위 질문 쿼리 엔진 + 10K 분석

이 동영상에서는 복잡한 쿼리를 여러 개의 하위 질문으로 분해하여 재무 문서에 적용하는 데 도움이 되는 SubQuestionQueryEngine과 그 적용 방법에 대해 설명합니다.

- [Youtube](https://www.youtube.com/watch?v=GT_Lsj3xj1o)
- [Notebook](https://docs.llamaindex.ai/en/stable/getting_started/discover_llamaindex.html#../../examples/usecases/10k_sub_question.ipynb)

### Discord 문서 관리

이 동영상에서는 지속적으로 업데이트되는 소스(예: Discord)의 문서를 관리하는 방법과 문서 중복을 방지하고 임베딩 토큰을 저장하는 방법에 대해 설명합니다.

- [Youtube](https://www.youtube.com/watch?v=j6dJcODLd_c)
- [Notebook + Supplementary Material](https://github.com/jerryjliu/llama_index/tree/main/docs/examples/discover_llamaindex/document_management/)
- [Reference Docs](https://docs.llamaindex.ai/en/stable/module_guides/indexing/document_management.html)

### 텍스트 to SQL과 시맨틱 검색 통합

이 동영상에서는 SQL과 시맨틱 검색을 하나의 통합 쿼리 인터페이스로 결합하기 위해 LlamaIndex에 내장된 도구에 대해 설명합니다.

- [Youtube](https://www.youtube.com/watch?v=ZIvcVJGtCrY)
- [Notebook](https://docs.llamaindex.ai/en/stable/getting_started/discover_llamaindex.html#../../examples/query_engine/SQLAutoVectorQueryEngine.ipynb)

## 참고자료

- [LlamaIndex 문서](https://docs.llamaindex.ai/en/stable/index.html)
