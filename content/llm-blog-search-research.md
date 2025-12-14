+++
title = "LLM을 이용한 블로그 검색 추가 - 데이터 탐색 및 실험"
date = 2024-05-03
draft = false

[taxonomies]
tags = ['LLM', 'Semantic Search', 'Transformer', 'LangChain', 'LanceDB']

[extra]
author = "김태훈"
toc = true
+++

## 개요

블로그에 검색창은 있지만 아직 동작하지 않아서 이참에 검색 기능을 추가해보려고 합니다. 개인 블로그라 데이터가 많지 않으므로 블로그 기사 제목의 **키워드 검색**만으로도 충분할 것 입니다. 그래도 명색이 머신러닝 엔지니어이므로 기왕이면 LLM을 활용한 **시맨틱 검색** 기능도 추가해보겠습니다.


<!-- TODO: 이미지 추가 - 파일명: LLM_블로그_검색_(1).png, 원본: https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fd16ab49b-c880-41d3-8de9-a0ddfb671740%2Ffbcce5c3-bcb7-4d23-8cef-65067df34297%2FLLM_%25E1%2584%2587%25E1%2585%25B3%25E1%2586%25AF%25E1%2584%2585%25E1%2585%25A9%25E1%2584%2580%25E1%2585%25B3_%25E1%2584%2580%25E1%2585%25A5%25E1%2586%25B7%25E1%2584%2589%25E1%2585%25A2%25E1%2586%25A8_(1).png?table=block&id=89d43b52-747c-44f8-8647-2ec6c666da2d&cache=v2 -->

![notion image](https://img-src.io/taehun/llm-blog-search-research/1.png)


> *본 기사에서 소개된 코드는 아래의 Colab 노트북에 작성되어 있습니다.*

[Google Colab

https://colab.research.google.com/drive/16b5B\_277YPUON7yuXZB\_gBHO5nkPwnGZ?usp=sharing](https://colab.research.google.com/drive/16b5B_277YPUON7yuXZB_gBHO5nkPwnGZ?usp=sharing)

## 데이터 탐색

이 블로그는 [Notion](https://www.notion.so/)에서 기사를 작성합니다. Notion에서 작성된 기사는 Next.js에서 HTML 페이지로 렌더링 되어 제공됩니다. 실험에 필요한 데이터를 준비하기 위해, Notion API을 사용하여 Notion에 있는 원본 데이터를 가져와야 합니다.

## Notion API 설정

Notion API를 사용하려면 API 키가 필요합니다. Notion API 키는 아래 링크에서 *통합 (integration)*을 생성하여 발급 받을 수 있습니다.

- <https://www.notion.so/my-integrations>


<!-- TODO: 이미지 추가 - 파일명: notion_api-1.png, 원본: https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fd16ab49b-c880-41d3-8de9-a0ddfb671740%2F642ebb2f-8000-40ef-ad53-cc63dd0e7a5e%2Fnotion_api-1.png?table=block&id=9d496cfc-7206-47f0-8e4d-d0374ed6b4e5&cache=v2 -->

![notion image](https://img-src.io/taehun/llm-blog-search-research/2.png?w=800)



<!-- TODO: 이미지 추가 - 파일명: notion_api_2.png, 원본: https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fd16ab49b-c880-41d3-8de9-a0ddfb671740%2F11e41c14-f4df-4d11-95b6-bb7865473160%2Fnotion_api_2.png?table=block&id=50ae42d5-9bc6-48a9-aad3-be3371b86dc7&cache=v2 -->

![notion image](https://img-src.io/taehun/llm-blog-search-research/3.png?w=800)


Notion 통합이 생성되면, **Secrets** 문자열을 복사 해 둡니다. 이 문자열을 Notion API 키로 사용합니다.

아래와 같이, 생성된 Notion 통합을 사용할 노션 페이지와 연결합니다. 노션 우측 상단 메뉴 (…)에서 Connections → Connect to 메뉴에서 생성한 통합을 선택하여 연결 합니다.


<!-- TODO: 이미지 추가 - 파일명: notion_api_3.png, 원본: https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fd16ab49b-c880-41d3-8de9-a0ddfb671740%2F8363489e-5864-48aa-9164-322fb209e099%2Fnotion_api_3.png?table=block&id=3fe5c5a0-f972-4837-8e61-2782fb4bfa8e&cache=v2 -->

![notion image](https://img-src.io/taehun/llm-blog-search-research/4.png?w=800)


## 데이터 처리

제 블로그의 글은 테이블 형태의 [Notion 데이터베이스](https://www.notion.so/help/intro-to-databases)에 저장되어 있습니다. 블로그 최상위 노션 페이지에서 아래와 같이 데이터베이스를 찾습니다:

```python
import os
import requests
import json
import pprint
import getpass

NOTION_KEY = getpass.getpass("Notion API Key:")
# -> Notion 통합의 Secrets 문자열 입니다.

headers = {'Authorization': f"Bearer {NOTION_KEY}",
           'Content-Type': 'application/json',
           'Notion-Version': '2022-06-28'}
```

출력

```toml
Notion API Key:··········
```

```
page_id = "1a64aad6a8d9466e9a49c2a1e38ea384"  # 최상위 Notion 페이지 ID
blocks_response = requests.get(
    f"https://api.notion.com/v1/blocks/{page_id}/children",
    headers=headers)

notion_db_id = ""
for block in blocks_response.json()['results']:
    if block['type'] == "child_database":
        notion_db_id = block["id"]  # 노션 DB ID
        pprint.pprint(block)
```

출력

```
{'archived': False,
 'child_database': {'title': '블로그 포스트'},
 'created_by': {'id': '4379a593-9b04-4876-91fc-40f08fe802f3', 'object': 'user'},
 'created_time': '2023-01-29T10:49:00.000Z',
 'has_children': False,
 'id': 'abd18099-3d66-45df-b587-69d7aedb3e61',
 'in_trash': False,
 'last_edited_by': {'id': '4379a593-9b04-4876-91fc-40f08fe802f3',
                    'object': 'user'},
 'last_edited_time': '2024-04-12T16:16:00.000Z',
 'object': 'block',
 'parent': {'page_id': '1a64aad6-a8d9-466e-9a49-c2a1e38ea384',
            'type': 'page_id'},
 'type': 'child_database'}
```

Notion 페이지의 텍스트, 이미지, 데이터베이스 등 모든 것이 [Block](https://www.notion.so/help/what-is-a-block) 입니다. 블로그 기사 Notion 페이지를 탐색하려면 Notion 데이터베이스의 ID가 필요합니다. 이를 위해 Notion 페이지 자식 Block에서 Blcok 타입이 `child_database` 인 블록을 찾습니다. 모든 자식 Block을 순회하여 Notion 데이터베이스 Block을 찾았으면, `notion_db_id` 변수에 Notion 데이터베이스 블록 ID가 대입됩니다.

Notion 데이터베이스는 Filter 파라메터를 사용하여 데이터를 쿼리 할 수 있습니다. 여기서는 단순히 `Public` 필드가 체크된 데이터를 모두 가져오도록 필터 조건을 지정하였습니다. 쿼리 결과에서 우리가 필요한 값은 블로그 기사의 ***Notion 페이지 ID, 제목, Tags*** 세 항목 입니다. 이를 가져와서 `blog_posts` 리스트에 저장해 둡니다.

```python
pamras = {
  "filter": {
    "property": "Public",
    "checkbox": {
        "equals": True
   }
  }
}

query_results = requests.post(
    f"https://api.notion.com/v1/databases/{notion_db_id}/query",
    json=pamras, headers=headers)

blog_posts = []
for result in query_results.json()['results']:
    data = {
        "id": result['id'],
        "title": result['properties']['Name']['title'][-1]['text']['content'],
        "tags": [tag["name"] for tag in result['properties']["Tags"]['multi_select']]
    }
    print(data)
    blog_posts.append(data)
```

출력

```
{'id': '588335e5-f000-4e53-8117-6187861e8c8b', 'title': '쿠버네티스 Job을 이용한 NAS 데이터 병렬 처리', 'tags': ['Kubernetes', 'Data Engineering']}
{'id': 'f7fee315-c39f-4ad3-848e-d1214a6b27a4', 'title': 'Next.js 14 Docker 컨테이너 패키징', 'tags': ['NextJS', 'Docker']}
{'id': 'f1bbd851-cfa6-46ea-9f1a-c8a7e1501a23', 'title': '초기 스타트업의 GitOps 적용기', 'tags': ['GitOps', 'ArgoCD']}
{'id': 'ba7fdc78-2a23-447c-9969-6af055b87684', 'title': '‘제로부터 시작하는 MLOps 도구와 활용’ 연재 중단', 'tags': ['MLOps', 'Zero-to-MLOps']}
{'id': 'ebe4d83a-da00-431b-8015-bb8c32bc71a8', 'title': '스트림 처리 엔진 - Arroyo 소개와 기본 사용법', 'tags': ['Arroyo', 'Data Engineering', 'Streaming Processing']}
{'id': 'e7817960-c97a-4210-9495-ea89df2eafa1', 'title': 'Auth0로 NextJS 14 로그인 추가하기', 'tags': ['NextJS', 'Auth0', '사용자 인증']}
{'id': '3a038900-7387-40cc-91b1-0f0204a8b556', 'title': 'LlamaIndex 시작하기', 'tags': ['LLM', 'RAG', 'LlamaIndex']}
{'id': 'c403e567-534e-410c-a3e7-89cf11a5ca76', 'title': '2023 하반기 회고', 'tags': ['회고', '2023']}
{'id': '4cc23c99-df13-41a0-96d1-4265aeee5e5f', 'title': '5. 머신러닝 모델 실험과 개발 (1/4)', 'tags': ['MLOps', 'Zero-to-MLOps', 'JupyterLab', 'JupyterHub']}
{'id': 'ccf1cc7f-1f6c-45e6-ad18-9cb5c19f02af', 'title': 'AWS 자격증 시험 후기 - SAA-C03, MLS-C01', 'tags': ['AWS', '자격증']}
{'id': 'd1ec3d00-6ae0-4b5a-8cce-80c02b3a0e7e', 'title': '[번역] Actix 문서', 'tags': ['Rust', 'Actix']}
{'id': '150b44b3-816a-4808-9c8b-1b9e6a00d5f8', 'title': 'Rust 개발 환경 설정', 'tags': ['Rust']}
{'id': '2b5bbdc9-d0b1-4c6f-b0ac-1843bd3ccf1c', 'title': '2023년 상반기 회고', 'tags': ['회고']}
{'id': '6e3d7168-14fc-4dd3-bc90-3907785a3566', 'title': '제로부터 시작하는 MLOps 도구와 활용 - 3. 컴퓨팅 인프라 - 쿠버네티스 (1/2)', 'tags': ['MLOps', 'Kubernetes']}
{'id': '3bbad645-b4b6-409a-9821-b1900f41e723', 'title': 'MLOps 도구와 활용 - 2. MLOps 시스템 아키텍처', 'tags': ['MLOps']}
{'id': '8fd8f6e4-82bf-4170-8901-aeee1751f5c4', 'title': 'MLOps 도구와 활용 - 1. MLOps 개요', 'tags': ['MLOps']}
{'id': 'ae7d4dfc-a5cd-441d-bccb-c1f76faac421', 'title': 'ARM Cortex-A 페이징', 'tags': ['Embedded', 'Cortex-A', '운영체제']}
{'id': '4f45ba64-1ee2-4449-b994-c21ad7fd5e45', 'title': '글쓰는 개발자 모임, 글또 8기를 시작하면서', 'tags': ['글또']}
{'id': 'f0309533-f780-4331-9a09-7ff429bfb72b', 'title': 'AWS Data/MLOps 인프라 아키텍처링', 'tags': ['AWS', 'MLOps', 'Data Engineering']}
{'id': '5396d8e5-5661-47f5-806f-90450971acd0', 'title': '글쓰는 개발자 모임, 글또 7기를 마무리하면서', 'tags': ['글또']}
{'id': '502cfe1d-63ad-4d4f-a2bd-67c6d4eb3d56', 'title': '딥러닝 모델 서빙을 위한 모델 변환', 'tags': ['MLOps', 'Deep Learning', 'ONNX', 'TensorRT', 'TFLite', 'CoreML', 'ML Serving']}
{'id': '73d3ccde-7526-497a-8e8d-c9a0c1a955ab', 'title': 'Docker buildx로 멀티 플랫폼 이미지 빌드하기', 'tags': ['Docker', 'm2', 'Macbook']}
{'id': 'febda882-3acd-44de-9c39-2bdbd2b65a67', 'title': '2022년 MLOps 추천 자료 Top 5', 'tags': ['MLOps']}
{'id': '5a51368d-645e-497c-9b79-3ecd41609925', 'title': 'Python으로 인프라 생성하기 - CDKTF', 'tags': ['Python', 'Terraform', 'IaC', 'DevOps']}
{'id': 'aaff2e42-0c76-4d41-9450-759ea4e1b76d', 'title': '비전 데이터셋 아키텍처', 'tags': ['MLOps', 'GCP', 'Deep Learning']}
{'id': '3354b5e8-050d-4242-8144-026b08a33f69', 'title': 'Flax/JAX로 시작하는 딥러닝', 'tags': ['Flax', 'Jax', 'Deep Learning']}
{'id': '1127ba35-a077-4cc6-b77f-06ec7cce153f', 'title': '2022년 MLOps 툴 스택', 'tags': ['MLOps']}
{'id': 'b2a91e49-c2f8-4cdc-bdc6-66ba4c8cb6f4', 'title': 'YOLOv5 커스텀 데이터셋 학습', 'tags': ['Deep Learning', 'YOLO', 'Object Detection']}
{'id': 'd799b4a2-90da-4757-8ce8-e8be6624cbe8', 'title': '글쓰는 개발자 모임, 글또 7기를 시작하면서', 'tags': ['글또']}
{'id': 'e6325ea4-4edd-4215-a991-b49294a6f5af', 'title': '[번역] MLOps 아키텍처 가이드', 'tags': ['MLOps', 'Neptuen.ai']}
{'id': '9d1cc318-b904-41fd-9f99-aa910024deb7', 'title': 'MLOps 소개', 'tags': ['Machine Learning', 'MLOps']}
```

> *참고>* [*Query a database*](https://developers.notion.com/reference/post-database-query)

샘플 기사 하나를 가져와서 블로그 기사를 작성하는데 어떤 Block 타입이 사용되었는지 확인해 봅시다. LLM 모델로 시맨틱 검색을 추가하려면 블로그 기사 내용은 모두 텍스트로 변환해야 합니다.

```toml
page_id = blog_posts[0]['id']
blocks_response = requests.get(
    f"https://api.notion.com/v1/blocks/{page_id}/children",
    headers=headers)

block_types = set()
for block in blocks_response.json()['results']:
    block_types.add(block["type"])
block_types
```

출력

```
{'bookmark',
 'bulleted_list_item',
 'callout',
 'code',
 'heading_2',
 'heading_3',
 'image',
 'numbered_list_item',
 'paragraph',
 'quote',
 'toggle'}
```

Block 페이지를 참고하여 텍스트 컨텐츠가 포함된 Block들은 모두 텍스트로 추출하였습니다. Code Block의 코드 내용은 앞 뒤로 \`\`\` 문자를 추가하여 구분하였습니다. 텍스트만 추출하기 위해 테이블과 이미지 컨텐츠는 일단 포함하지 않습니다.

```toml
# 텍스트 컨텐츠가 포함된 Block 타입들
text_types = {"heading_1", "heading_2", "heading_3", "paragraph", "bulleted_list_item","numbered_list_item", "code"}

page_id = blog_posts[0]['id']  # 샘플 노션 페이지 ID
blocks_response = requests.get(
    f"https://api.notion.com/v1/blocks/{page_id}/children",
    headers=headers)

contents = ""
for block in blocks_response.json()['results']:
    if block["type"] in text_types:
        rich_text = block[block["type"]]['rich_text']
        for obj in rich_text:
            base_content = obj['plain_text'] + "\n"
            if block["type"][:7] == "heading":  # 제목 블록은 한 줄 공백을 추가
                content = "\n" + base_content if len(contents) > 0 else base_content
            elif block["type"] == "code":  # 코드 블럭은 앞 뒤로 ```
문자를 추가
                lang = block[block["type"]]['language']
                content = f"```{lang}\n{base_content}```
            elif block["type"][-9:] == "list_item":  # List item 블럭은 앞에 '- ' 문자 추가
                content = "- " + base_content
            else:
                content = base_content
            contents += content

print(contents)
```

출력

```
개요
회사에서 컴퓨터 비전 관련 프로젝트를 하고 있습니다. 컴퓨터 비전 관련 프로젝트를 할 때마다 항상 느끼는 것이지만, 미디어 데이터를 처리하는 것은 참 고역입니다. 비디오 파일과 이미지 파일과 같은 미디어 데이터는 크기가 커서 저장 공간도 많이 차지하고, 프로세싱도 오래 걸립니다. 분산, 병렬 처리가 필요한 시점이 왔습니다.
빅 데이터가 대두된 이래로 정말 많은 분산, 병렬 처리 솔루션이 등장했습니다. Hadoop과 Spark가 대표적입니다. 머신러닝 프로젝트에는 Ray도 많이 사용합니다. 클라우드 환경에는 AWS Glue, Amazon EMR, AWS Batch, GCP Dataflow, GCP Dataproc 등 분산, 병렬 처리 서비스들이 참 많습니다.
미디어 데이터 처리를 위해 클라우드 서비스를 사용하기는 비용과 데이터 마이그레이션에 걸리는 시간이 부담이 됩니다. 그렇다고, 온프레미스 환경에서 Spark나 Ray Job으로 처리하려니 설치, 설정, 사용법을 익히는 과정이 매우 번거롭습니다. 온프레미스 환경에 쿠버네티스 클러스터는 있으니, 쿠버네티스 Job으로 NAS에 있는 비디오 파일을 분산, 병렬 처리하였습니다. 이 기사는 해당 경험을 정리한 것 입니다.

시스템 구성도
처리 과정
- 맥북에 있는 비디오 파일을 NAS에 업로드 합니다.
- 다중 쿠버네티스 Job에서 NAS의 비디오 파일을 병렬로 읽어 옵니다.
- 다중 쿠버네티스 Job에서 처리된 미디어 파일을 NAS에 병렬로 저장합니다.

데이터 준비
미디어 데이터 분산, 병렬 처리을 위해 맥북에 있는 비디오 파일을 NAS에 업로드합니다. NAS는 다양한 네트워크 파일 공유 프로토콜을 지원하지만 NFS 서버를 사용하였습니다. NFS 서버 접속 정보는 아래와 같이 가정하겠습니다.
맥북에 NFS 파일 시스템 마운트 포인트를 생성합니다.
```bash
sudo mkdir /private/nfs
```
생성된 마운트 포인트에 NFS 파일 시스템을 마운트 합니다.
```bash
sudo mount -t nfs -o resvport,rw,noowners 192.168.1.11:/share /private/nfs
```
NFS에 비디오 파일을 복사할 경로를 생성하고, 비디오 파일을 복사합니다.
```bash
$ mkdir /private/nfs/video
$ cp 
bash
<비디오 파일 경로>
bash
/*.mp4 /private/nfs/video/
```

쿠버네티스 NFS 설정

NFS CSI 드라이버 설치
쿠버네티스 환경에서 NFS를 사용하려면 
NFS CSI(Container Storage Interface) 드라이버
를 설치해야 합니다.
- NFS CSI 드라이버 설치
```bash
curl -skSL https://raw.githubusercontent.com/kubernetes-csi/csi-driver-nfs/v4.6.0/deploy/install-driver.sh | bash -s v4.6.0 –
```
- NFS CSI 드라이버 설치 확인
```bash
kubectl -n kube-system get pod -o wide -l app=csi-nfs-controller
bash
kubectl -n kube-system get pod -o wide -l app=csi-nfs-node
```

StorageClass 생성
설치된 NFS CSI를 사용하는 StoageClass를 생성해야 합니다. 아래 YAML 파일을 작성하여 
nfs-csi
 StorageClass를 설정합니다.
- nfs-sc.yaml
```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: nfs-csi
provisioner: nfs.csi.k8s.io
parameters:
  server: 192.168.1.11
  share: share
reclaimPolicy: Delete
volumeBindingMode: Immediate
mountOptions:
  - nfsvers=3
```
kubectl create
 명령어로 
nfs-csi
 StorageClass 리소스를 생성합니다.
```bash
kubectl create -f nfs-sc.yaml
```

PersistentVolume 생성
nfs-csi
 StorageClass의 
reclaimPolicy
 를 Delete로 설정하였습니다. 이는 
동적 볼륨 프로비저닝
으로 자동 할당된 PV는 PVC를 삭제하면 PV도 같이 삭제 됩니다. 우리가 원하는 동작은 쿠버네티스 Job 실행이 완료 되더라도, 처리된 데이터는 그대로 남아 있는 것 입니다. 이를 위해, 
reclaimPolicy
 정책을 재정의한 PV를 생성하고, PVC에서 PV를 바인딩하는 
정적 프로비저닝
을 사용하였습니다.
아래와 같이 YAML 파일로 PV를 정의합니다.
- nfs-pv.yaml
```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  annotations:
    pv.kubernetes.io/provisioned-by: nfs.csi.k8s.io
  name: pv-nfs
spec:
  capacity:
    storage: 100Gi
  accessModes:
    - ReadWriteMany
  persistentVolumeReclaimPolicy: Retain
  storageClassName: nfs-csi
  csi:
    driver: nfs.csi.k8s.io
    volumeHandle: 192.168.1.11/share##
    volumeAttributes:
      server: 192.168.1.11
      share: share
```
kubectl create
 명령어로 
pv-nfs
 PV 리소스를 생성합니다.
```bash
kubectl create -f nfs-pv.yaml
```

PersistentVolumeClaim 생성
앞서 생성한 PV에 바인딩하는 PVC 리소스를 설정합니다.
- nfs-pvc.yaml
```yaml
kind: PersistentVolumeClaim
apiVersion: v1
metadata:
  name: pvc-nfs-static
spec:
  accessModes:
    - ReadWriteMany
  resources:
    requests:
      storage: 100Gi
  volumeName: pv-nfs
  storageClassName: nfs-csi
```
kubectl create
 명령어로 
pvc-nfs-static
 PVC 리소스를 생성합니다.
```bash
kubectl create -f nfs-pvc.yaml
```

데이터 프로세싱 환경
쿠버네티스 Job 실행에 필요한 패키지가 설치되어 있는 컨테이너 환경이 필요합니다. 
ffmpeg
 CLI 도구로 비디오 파일의 프레임을 1초 간격으로 추출하는 Job을 예시로 만들어 보겠습니다. 이 경우, Ubuntu 환경에서 
ffmpeg
 CLI 도구만 추가적으로 필요합니다.
- Dockerfile
```bash
FROM ubuntu:24.04
RUN apt-get update && apt-get install -y ffmpeg
```
컨테이너 이미지를 빌드하고 컨테이너 레지스트리에 푸시합니다. 맥북과 쿠버네티스 클러스터의 CPU 아키텍처가 다르므로, 
docker buildx
로 멀티 아키텍처를 지원하도록 빌드하였습니다.
```bash
docker buildx build --platform linux/arm64,linux/amd64 -t taehun/video-processor --push .
```

쿠버네티스 Job 설정 및 실행
분산, 병렬 처리시 데이터 처리 단위를 어떻게 분할 할 것인지 여부가 중요합니다. 즉, 
파티셔닝
 정책을 어떻게 설정하는지에 따라 처리 성능이 달라집니다. 여기서는 단순히 비디오 파일 하나당 하나의 Job이 생성되도록 설정했습니다.
아래와 같이 쿠버네티스 Job 템플릿 YAML 파일을 정의합니다.
- video-job-template.yaml
```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: extract-frames-$FILE_NAME
  labels:
    jobgroup: extract-frames
spec:
  template:
    metadata:
      name: extract-frames
      labels:
        jobgroup: extract-frames
    spec:
      containers:
      - name: extract-frames
        image: taehun/video-processor:latest
        command: ["/bin/bash",  "-c", "--"]
        args: ["mkdir -p /mnt/nfs/frames/$FILE_NAME; ffmpeg -i $VIDEO_PATH -vf fps=1 /mnt/nfs/frames/$FILE_NAME/frame_%04d.png"]
        volumeMounts:
        - name: persistent-storage
          mountPath: "/mnt/nfs"
      restartPolicy: Never
      volumes:
      - name: persistent-storage
        persistentVolumeClaim:
          claimName: pvc-nfs-static
  backoffLimit: 2
  ttlSecondsAfterFinished: 100
```
YAML 파일내 
$FILE_NAME
 과 
$VIDEO_PATH
 은 쉘 스크립트에서 환경 변수로 설정되어 재정의 됩니다. 아래와 같이 Job 템플릿 파일 내용을 재정의하고, 쿠버네티스 Job을 제출하는 쉘 스크립트를 작성하였습니다.
- extract-frames-k8s.sh
```bash
#!/bin/bash
if [ "$#" -ne 1 ]; then
   echo "Usage: $0 <Video files directory>"; exit 1
fi

VIDEO_DIR=$1
mkdir -p jobs

for VIDEO_FILE in "$VIDEO_DIR"/*.mp4; do
   BASE_NAME=$(basename "$VIDEO_FILE")
   export FILE_NAME="${BASE_NAME%.*}"
   export VIDEO_PATH="/mnt/nfs/video/$BASE_NAME"
   cat video-job-template.yaml | envsubst > ./jobs/job-$FILE_NAME.yaml
done

kubectl create -f ./jobs
```
이 스크립트는 NFS의 비디오 파일 목록을 가져와, 
./jobs
 폴더에 비디오 파일 단위로 쿠버네티스 Job YAML 파일을 생성합니다. 마지막으로 
kubectl create
 명령어로 
./jobs
 폴더에 있는 쿠버네티스 Job YAML 파일을 제출하여 Job을 실행합니다. 아래와 같이 마운트된 NFS 비디오 파일 경로를 지정하여 스크립트를 실행할 수 있습니다.
```bash
sh extract-frames-k8s.sh /private/nfs/video
```
지정된 라벨로 Job 실행 상태를 확인 할 수 있습니다.
```bash
kubectl get jobs -l jobgroup=extract-frames
```
쿠버네티스 Job 실행이 완료되면, 
<NFS 서버>/frames 
경로에 영상에서 추출된 프레임의 이미지 파일들이 저장되어 있습니다.

결론
쿠버네티스 Job으로 NAS에 있는 비디오 파일을 병렬 처리 해 보았습니다. NFS CSI 설치를 제외하고는 쿠버네티스 기본 기능만 사용하므로 간단한 병렬 처리에 활용하면 좋습니다. 하지만, 사용자와 Job이 많이지고 Job 관리가 필요해지는 시점에는 이와 같은 방법은 적합하지 않습니다. 확장성 있는 Job 솔루션이 필요해지면, Spark나 Ray를 쿠버네티스 환경에 설치해서 사용하시는 것을 추천합니다. 쿠버네티스 환경에서 가벼운 Job 관리 솔루션이 필요하시면 
Kueue
를 사용하는 것도 좋습니다. (Ray나 Kubeflow에는 내장되어 있습니다.)

참고자료
- https://github.com/kubernetes-csi/csi-driver-nfs
- 확장을 사용한 병렬 처리
```

블로그 기사의 내용이 그럭저럭 텍스트로 잘 변환된 것처럼 보입니다. 제목이 나오면 한 줄 공백을 추가하여 파트별 분리도 되고, 코드 블록의 코드도 모두 포함되어 있습니다. 표나 이미지가 빠진 것이 조금 아쉽지만 우선 이것을 실험 데이터로 사용하겠습니다.

Notion Block을 텍스트로 변환하는 함수를 정의하고, 이를 이용해 모든 블로그 기사를 순회 하면서 `id`, `title`, `contents` 속성을 가진 블로그 데이터 (`blog_datas`)를 준비합니다.

```python
def notion_block_to_text(block: list) -> str:
    contents = ""
    for block in blocks_response.json()['results']:
        if block["type"] in text_types:
            rich_text = block[block["type"]]['rich_text']
            for obj in rich_text:
                base_content = obj['plain_text'] + "\n"
                if block["type"][:7] == "heading":
                    content = "\n" + base_content if len(contents) > 0 else base_content
                elif block["type"] == "code":
                    lang = block[block["type"]]['language']
                    content = f"```{lang}\n{base_content}```
                elif block["type"][-9:] == "list_item":
                    content = "- " + base_content
                else:
                    content = base_content
                contents += content
    return contents
```

```
blog_datas = []

for idx, post in enumerate(blog_posts):
    page_id = post['id']
    blocks_response = requests.get(f"https://api.notion.com/v1/blocks/{page_id}/children", headers=headers)
    blog_contents = notion_block_to_text(blocks_response.json()['results'])
		blog_data = {"id": page_id, "title": post['title'], "tags": post['tags'], "contents": blog_contents}
    blog_datas.append(blog_data)
    print("제목:", blog_data["title"], ", 내용 길이:", len(blog_data["contents"]))
```

출력

```
제목: 쿠버네티스 Job을 이용한 NAS 데이터 병렬 처리 , 내용 길이: 6180
제목: Next.js 14 Docker 컨테이너 패키징 , 내용 길이: 2073
제목: 초기 스타트업의 GitOps 적용기 , 내용 길이: 5383
제목: ‘제로부터 시작하는 MLOps 도구와 활용’ 연재 중단 , 내용 길이: 1484
제목: 스트림 처리 엔진 - Arroyo 소개와 기본 사용법 , 내용 길이: 6043
제목: Auth0로 NextJS 14 로그인 추가하기 , 내용 길이: 9488
제목: LlamaIndex 시작하기 , 내용 길이: 8994
제목: 2023 하반기 회고 , 내용 길이: 2340
제목: 5. 머신러닝 모델 실험과 개발 (1/4) , 내용 길이: 12195
제목: AWS 자격증 시험 후기 - SAA-C03, MLS-C01 , 내용 길이: 2915
제목: [번역] Actix 문서 , 내용 길이: 12817
제목: Rust 개발 환경 설정 , 내용 길이: 3832
제목: 2023년 상반기 회고 , 내용 길이: 3702
제목: 제로부터 시작하는 MLOps 도구와 활용 - 3. 컴퓨팅 인프라 - 쿠버네티스 (1/2) , 내용 길이: 7660
제목: MLOps 도구와 활용 - 2. MLOps 시스템 아키텍처 , 내용 길이: 11712
제목: MLOps 도구와 활용 - 1. MLOps 개요 , 내용 길이: 11332
제목: ARM Cortex-A 페이징 , 내용 길이: 17340
제목: 글쓰는 개발자 모임, 글또 8기를 시작하면서 , 내용 길이: 2068
제목: AWS Data/MLOps 인프라 아키텍처링 , 내용 길이: 3322
제목: 글쓰는 개발자 모임, 글또 7기를 마무리하면서 , 내용 길이: 747
제목: 딥러닝 모델 서빙을 위한 모델 변환 , 내용 길이: 7398
제목: Docker buildx로 멀티 플랫폼 이미지 빌드하기 , 내용 길이: 4268
제목: 2022년 MLOps 추천 자료 Top 5 , 내용 길이: 2248
제목: Python으로 인프라 생성하기 - CDKTF , 내용 길이: 7434
제목: 비전 데이터셋 아키텍처 , 내용 길이: 12167
제목: Flax/JAX로 시작하는 딥러닝 , 내용 길이: 6994
제목: 2022년 MLOps 툴 스택 , 내용 길이: 6212
제목: YOLOv5 커스텀 데이터셋 학습 , 내용 길이: 8537
제목: 글쓰는 개발자 모임, 글또 7기를 시작하면서 , 내용 길이: 1483
제목: [번역] MLOps 아키텍처 가이드 , 내용 길이: 5900
제목: MLOps 소개 , 내용 길이: 6639
```

## 인덱싱과 LLM을 이용한 검색

## 키워드 검색

먼저, 블로그 기사의 제목과 내용을 키워드로 검색하는 키워드 검색부터 살펴 봅시다. *FTS(Full-Text Search)* 기능을 구현한 대부분의 도구는 검색의 대상이 되는 문서를 [역색인(Inverted Index)](https://ko.wikipedia.org/wiki/%EC%97%AD%EC%83%89%EC%9D%B8)으로 저장합니다. (책 뒷면의 색인 같은 것) 사용자가 검색 키워드를 입력하면 해당 키워드가 포함된 모든 문서를 찾습니다. 찾은 문서에서 [BM25](https://en.wikipedia.org/wiki/Okapi_BM25)라는 알고리즘을 사용하여 가장 연관도가 높은 문서를 반환합니다.


<!-- TODO: 이미지 추가 - 파일명: inverted_index.jpeg, 원본: https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fd16ab49b-c880-41d3-8de9-a0ddfb671740%2Fa7dd1710-41ee-4ea2-becb-5b6a5e47df9c%2Finverted_index.jpeg?table=block&id=c4e6ecde-4228-4457-a5df-b29ca43464f3&cache=v2 -->

![출처&gt; https://programminghistorian.org/posts/full-text-search](https://img-src.io/taehun/llm-blog-search-research/5.jpeg?w=800)


*출처>* *<https://programminghistorian.org/posts/full-text-search>*

키워드 검색에 사용하는 가장 유명한 도구로는 [Elasticsearch](https://www.elastic.co/kr/elasticsearch)가 있습니다. 하지만 여기서는 [벤치마크 결과](https://tantivy-search.github.io/bench/)도 우수하고, 제가 좋아하는 언어인 Rust로 구현한 [tantivy](https://github.com/quickwit-oss/tantivy)를 사용하겠습니다.

tantivy를 설치하고, 스키마 빌더를 정의 합니다.

```python
!pip install -q tantivy
```

```python
import tempfile
import pathlib
import tantivy

# 스키마 정의
schema_builder = tantivy.SchemaBuilder()
schema_builder.add_integer_field("id",stored=True)
schema_builder.add_text_field("title", stored=True)
schema_builder.add_text_field("tags", stored=True)
schema_builder.add_text_field("contents", stored=True)
schema = schema_builder.build()

# 인덱스 객체를 생성합니다. (메모리에 저장)
index = tantivy.Index(schema)
```

앞서 생성한 블로그 데이터를 인덱스에 tantivy 문서로 추가합니다.

```toml
# 인덱싱
writer = index.writer()
for blog_data in blog_datas:
    writer.add_document(tantivy.Document(
        id=blog_data["id"],
        title=blog_data["title"],
        tags=blog_data["tags"],
        contents=blog_data["contents"],
    ))
writer.commit()
writer.wait_merging_threads()
```

인덱스를 다시 불러오고, 검색기를 가져와서 키워드 검색에 사용합니다. 블로그 기사 제목에서 `MLOps` 키워드로 검색 해 보겠습니다. 연관도가 높은 최대 10개의 검색 결과만 가져옵니다.

```python
index.reload()
searcher = index.searcher()
query = index.parse_query("MLOps", ["title"])  # 'MLOps' 키워드로 제목 검색
for score, doc_addr in searcher.search(query, 10).hits:
    print(score, searcher.doc(doc_addr)["title"])
```

출력

```
1.6204864978790283 ['MLOps 소개']
1.5968784093856812 ['MLOps 도구와 활용 - 1. MLOps 개요']
1.5177857875823975 ['MLOps 도구와 활용 - 2. MLOps 시스템 아키텍처']
1.3375605344772339 ['2022년 MLOps 툴 스택']
1.3375605344772339 ['[번역] MLOps 아키텍처 가이드']
1.2301708459854126 ['AWS Data/MLOps 인프라 아키텍처링']
1.1387436389923096 ['2022년 MLOps 추천 자료 Top 5']
1.0599662065505981 ['‘제로부터 시작하는 MLOps 도구와 활용’ 연재 중단']
0.8302279114723206 ['제로부터 시작하는 MLOps 도구와 활용 - 3. 컴퓨팅 인프라 - 쿠버네티스 (1/2)']
```

`GitOps` 태그가 설정된 기사도 찾아보겠습니다.

```toml
query = index.parse_query("GitOps", ["tags"])  # 'GitOps' 키워드로 태그 검색
(best_score, best_doc_address) = searcher.search(query, 3).hits[0]
best_doc = searcher.doc(best_doc_address)
best_doc["title"]
```

출력

```
['초기 스타트업의 GitOps 적용기']
```

이번에는 블로그 본문 검색을 해보겠습니다. 블로그 내용에서 `Ansible` 키워드가 나오는 블로그 기사를 찾아보겠습니다.

```python
query = index.parse_query("Ansible", ["contents"])  # 'Ansible' 키워드로 내용 검색
for score, doc_addr in searcher.search(query, 5).hits:
    print(score, searcher.doc(doc_addr)["title"])
```

출력

```
2.652600049972534 ['글쓰는 개발자 모임, 글또 8기를 시작하면서']
2.344245672225952 ['2023년 상반기 회고']
2.076092481613159 ['Python으로 인프라 생성하기 - CDKTF']
1.3402262926101685 ['MLOps 도구와 활용 - 2. MLOps 시스템 아키텍처']
```

총 4개의 기사에서 Ansible을 언급하였습니다.

## 시맨틱 검색

> *시맨틱 검색은 검색 쿼리의 단어나 키워드가 아닌 의미(semantic)를 이해하여 검색하는 기술 입니다.*

시맨틱 검색은 딥러닝 기술이 대중화 되기 이전부터 존재 했지만, LLM 등장이후부터는 고성능의 시맨틱 검색을 쉽게 구현 할 수 있게 되었습니다. 먼저, 검색 대상이 되는 컨텐츠 (문서, 이미지, 동영상)를 *임베딩 모델*로 벡터로 변환하여 *벡터 DB*에 저장합니다. 사용자가 검색 쿼리를 입력하면, 검색 쿼리도 벡터로 변환후 벡터 DB에서 가장 인접한 벡터 값을 가진 컨텐츠를 리턴합니다.


<!-- TODO: 이미지 추가 - 파일명: semantic-search.png, 원본: https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fd16ab49b-c880-41d3-8de9-a0ddfb671740%2F3525c6f1-2252-4ea1-ba68-9a5afaf74df2%2Fsemantic-search.png?table=block&id=f43eb6a5-66c3-40ba-98e3-b790604af1a1&cache=v2 -->

![시맨틱 검색 과정. 임베딩 모델과 벡터 DB를 사용합니다.](https://img-src.io/taehun/llm-blog-search-research/6.png)


시맨틱 검색 과정. 임베딩 모델과 벡터 DB를 사용합니다.

**OpenAI 임베딩**

시맨틱 검색에 사용할 수 있는 다양한 도구들이 있지만, 그 중 비교적 간단하게 구현할 수 있는 LangChain과 OpenAI 임베딩 모델을 사용해서 실험해 보겠습니다. OpenAI API를 사용하려면 [이곳](https://platform.openai.com/api-keys)에서 API 키를 생성해야 합니다.

```
!pip install -q langchain langchain-openai tiktoken
```

OpenAI API 키를 설정하고, 임베딩 모델을 불러옵니다.

```python
from langchain_openai import OpenAIEmbeddings
import os
import getpass

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
```

출력

```
OpenAI API Key:··········
```

블로그 각 기사 내용을 임베딩하여 벡터로 변환합니다.

```toml
contents_vectors = embeddings.embed_documents([data["contents"] for data in blog_datas])
```

컨텐츠 벡터와 쿼리 벡터의 유사도를 계산하는 `cosine_similarity` 함수를 정의합니다. 이를 사용하는 컨텐츠 벡터와 쿼리 벡터의 유사도를 계산하여 최상위 top\_k 결과를 리턴하는 `similarity_search` 함수도 아래와 같이 정의했습니다:

```python
import numpy as np

def cosine_similarity(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))
    
def similarity_search(contents_vectors, query_vector, top_k=5):
    # 코사인 유사도 계산
    similarities = [cosine_similarity(query_vector, content_vector) for content_vector in contents_vectors]
    # 유사도에 따라 인덱스 정렬
    sorted_indices = np.argsort(similarities)[::-1]
    # 상위 top_k개의 결과 리턴
    result = [blog_datas[idx] for idx in sorted_indices[:top_k]]
    return result
```

벡터 유사도 검사에는 다음과 같은 세 가지 매트릭을 많이 사용 합니다:

- [유클리드 거리(Euclidean distance)](https://en.wikipedia.org/wiki/Euclidean_distance)

- [코사인 유사도(Cosine similarity)](https://en.wikipedia.org/wiki/Cosine_similarity)

- [내적 유사도(Dot Product similarity)](https://en.wikipedia.org/wiki/Dot_product)

이 중 코사인 유사도는 벡터의 방향(즉, 문서의 전체 내용)을 비교할 수 있기 때문에 시맨틱 검색에 사용하기에 적합합니다.

이제 샘플 쿼리를 몇 개를 작성해서 시맨틱 검색 실험을 해 봅시다. 각 쿼리를 벡터로 변환하고, `similarity_search` 함수를 호출하여 시맨틱 검색을 수행합니다.

```python
queries = [
    "MLOps 정의와 소개에 대한 글을 찾아줘",
    "GitOps에 대한 글",
    "Rust에 대한 글",
    "비디오 데이터 병렬 처리하는 방법",
    "글또에 대한 글",
    "회고"
]

for query in queries:
    query_vector = embeddings.embed_query(query)
    query_results = similarity_search(contents_vectors, query_vector)
    print(f"쿼리: '{query}'")
    print("< Top-5 검색 결과 >")
    for result in query_results:
        print("-> 제목:", result["title"])
    print("="*20)
```

출력

```
쿼리: 'MLOps 정의와 소개에 대한 글을 찾아줘'
< Top-5 검색 결과 >
-> 제목: ‘제로부터 시작하는 MLOps 도구와 활용’ 연재 중단
-> 제목: MLOps 소개
-> 제목: 2022년 MLOps 추천 자료 Top 5
-> 제목: AWS Data/MLOps 인프라 아키텍처링
-> 제목: [번역] MLOps 아키텍처 가이드
====================
쿼리: 'GitOps에 대한 글'
< Top-5 검색 결과 >
-> 제목: 초기 스타트업의 GitOps 적용기
-> 제목: 글쓰는 개발자 모임, 글또 8기를 시작하면서
-> 제목: Rust 개발 환경 설정
-> 제목: 글쓰는 개발자 모임, 글또 7기를 시작하면서
-> 제목: 글쓰는 개발자 모임, 글또 7기를 마무리하면서
====================
쿼리: 'Rust에 대한 글'
< Top-5 검색 결과 >
-> 제목: Rust 개발 환경 설정
-> 제목: [번역] Actix 문서
-> 제목: 글쓰는 개발자 모임, 글또 7기를 시작하면서
-> 제목: LlamaIndex 시작하기
-> 제목: ‘제로부터 시작하는 MLOps 도구와 활용’ 연재 중단
====================
쿼리: '비디오 데이터 병렬 처리하는 방법'
< Top-5 검색 결과 >
-> 제목: 쿠버네티스 Job을 이용한 NAS 데이터 병렬 처리
-> 제목: 비전 데이터셋 아키텍처
-> 제목: LlamaIndex 시작하기
-> 제목: 스트림 처리 엔진 - Arroyo 소개와 기본 사용법
-> 제목: YOLOv5 커스텀 데이터셋 학습
====================
쿼리: '글또에 대한 글'
< Top-5 검색 결과 >
-> 제목: 글쓰는 개발자 모임, 글또 7기를 마무리하면서
-> 제목: 글쓰는 개발자 모임, 글또 7기를 시작하면서
-> 제목: 글쓰는 개발자 모임, 글또 8기를 시작하면서
-> 제목: ‘제로부터 시작하는 MLOps 도구와 활용’ 연재 중단
-> 제목: LlamaIndex 시작하기
====================
쿼리: '회고'
< Top-5 검색 결과 >
-> 제목: 글쓰는 개발자 모임, 글또 7기를 시작하면서
-> 제목: Auth0로 NextJS 14 로그인 추가하기
-> 제목: 글쓰는 개발자 모임, 글또 8기를 시작하면서
-> 제목: 글쓰는 개발자 모임, 글또 7기를 마무리하면서
-> 제목: [번역] Actix 문서
====================
```

첫 번째 쿼리 결과는 썩 만족스럽진 않지만, 기사 내용과 쿼리의 의미를 파악해서 잘 검색이 되는 것 같습니다. 유료 API를 사용하므로 API 예상 요금도 한번 계산해 봅시다.

API 예상 요금 계산을 위해 블로그 기사의 토큰 크기를 확인해야 합니다. OpenAI 임베딩 모델은 토큰 단위로 요금을 부과합니다.

```python
import tiktoken

total_token = 0
for data in blog_datas:
    encoding = tiktoken.get_encoding("cl100k_base")
    num_tokens = len(encoding.encode(data["contents"]))
    print(f"{data['title']}: {num_tokens}")
    total_token += num_tokens
print(f"총 {total_token} 토큰")
```

출력

```toml
쿠버네티스 Job을 이용한 NAS 데이터 병렬 처리: 3082
Next.js 14 Docker 컨테이너 패키징: 856
초기 스타트업의 GitOps 적용기: 3920
‘제로부터 시작하는 MLOps 도구와 활용’ 연재 중단: 1277
스트림 처리 엔진 - Arroyo 소개와 기본 사용법: 3443
Auth0로 NextJS 14 로그인 추가하기: 4052
LlamaIndex 시작하기: 4309
2023 하반기 회고: 1949
5. 머신러닝 모델 실험과 개발 (1/4): 5362
AWS 자격증 시험 후기 - SAA-C03, MLS-C01: 2263
[번역] Actix 문서: 6475
Rust 개발 환경 설정: 1845
2023년 상반기 회고: 3080
제로부터 시작하는 MLOps 도구와 활용 - 3. 컴퓨팅 인프라 - 쿠버네티스 (1/2): 5753
MLOps 도구와 활용 - 2. MLOps 시스템 아키텍처: 9840
MLOps 도구와 활용 - 1. MLOps 개요: 9656
ARM Cortex-A 페이징: 11209
글쓰는 개발자 모임, 글또 8기를 시작하면서: 1846
AWS Data/MLOps 인프라 아키텍처링: 2345
글쓰는 개발자 모임, 글또 7기를 마무리하면서: 654
딥러닝 모델 서빙을 위한 모델 변환: 4358
Docker buildx로 멀티 플랫폼 이미지 빌드하기: 2192
2022년 MLOps 추천 자료 Top 5: 1657
Python으로 인프라 생성하기 - CDKTF: 3049
비전 데이터셋 아키텍처: 5014
Flax/JAX로 시작하는 딥러닝: 3843
2022년 MLOps 툴 스택: 4491
YOLOv5 커스텀 데이터셋 학습: 4838
글쓰는 개발자 모임, 글또 7기를 시작하면서: 1466
[번역] MLOps 아키텍처 가이드: 5156
MLOps 소개: 5137
총 124417 토큰
```

총 `124417` 토큰 입니다. `text-embedding-3-small` 모델을 사용하면, 1M 토큰당 $0.02이므로 컨텐츠 임베딩에는 $0.0025이라는 매우 적은 금액이 부과됩니다. (참고> [OpenAI 가격](https://openai.com/pricing)의 **Embedding models**)

- *`0.02 * 124417 / 1000000 = $0.0024883400000000003`*

검색 쿼리는 어떨까요? 구글 Analytics를 확인해보면 블로그 방문자가 일간 100명이 채 되지 않네요. (…) 넉넉잡아 하루 200명의 방문자가 10분당 100 토큰의 검색 쿼리를 한다고 가정해보겠습니다.

- `0.02 * 200 * 100 * 6 * 24 * 30 / 1000000 = $1.728`

월간에 약 $1.728 비용이 나오는군요. 적은 금액이지만, 사용자가 폭증 하거나 악의적인 사용자가 더미 쿼리 생성하여 발생한 비용 폭탄이 걱정됩니다. 무료로 텍스트 임베딩을 할 순 없을까요? `sentence_transformer`로 오픈 소스 임베딩 모델을 실험 해보겠습니다.

**Sentence Transformers 임베딩**

빠른 실험을 위해 `sentence_transformers` LangChain 바인딩을 사용하겠습니다. LangChain은 다양한 임베딩 모델을 사용 할 수 있습니다.

- [LangChain 컴포넌트 - 임베딩 모델](https://python.langchain.com/docs/integrations/text_embedding/)

```
!pip install -q sentence-transformers langchain-community
```

사용 방법은 OpenAI 임베딩 모델과 동일 합니다. `OpenAIEmbeddings` 대신 `HuggingFaceEmbeddings` 을 import하고 사용할 임베딩 모델을 지정합니다.

```python
from langchain_community.embeddings import HuggingFaceEmbeddings

hf_embeddings = HuggingFaceEmbeddings(model_name="multi-qa-mpnet-base-cos-v1")
```

Sentence Transformers의 장점은 Hugging Face에 있는 다양한 오픈 소스 임베딩 모델을 모두 사용 할 수 있다는 점 입니다. 위에 지정된 `multi-qa-mpnet-base-cos-v1` 모델은 Sentence Transformer 문서에 나열된 [사전 학습된 Multi-QA](https://www.sbert.net/docs/pretrained_models.html#multi-qa-models)[모델](https://www.sbert.net/docs/pretrained_models.html#multi-qa-models) 중 하나를 선택 한 것 입니다.

> [Sentence Transformers에서 사용 가능한 Hugging Face의 모델 목록](https://huggingface.co/models?library=sentence-transformers)

검색 대상이 되는 컨텐츠를 임베딩하고, 앞서 작성한 샘플 쿼리와 유사도를 확인해 봅시다.

```python
contents_vectors_hf = hf_embeddings.embed_documents([data["contents"] for data in blog_datas])
```

```
for query in queries:
    query_vector = hf_embeddings.embed_query(query)
    query_results = similarity_search(contents_vectors_hf, query_vector)
    print(f"쿼리: '{query}'")
    print("< Top-5 검색 결과 >")
    for result in query_results:
        print("-> 제목:", result["title"])
    print("="*20)
```

출력

```
쿼리: 'MLOps 정의와 소개에 대한 글을 찾아줘'
< Top-5 검색 결과 >
-> 제목: 제로부터 시작하는 MLOps 도구와 활용 - 3. 컴퓨팅 인프라 - 쿠버네티스 (1/2)
-> 제목: ‘제로부터 시작하는 MLOps 도구와 활용’ 연재 중단
-> 제목: MLOps 도구와 활용 - 2. MLOps 시스템 아키텍처
-> 제목: MLOps 도구와 활용 - 1. MLOps 개요
-> 제목: 딥러닝 모델 서빙을 위한 모델 변환
====================
쿼리: 'GitOps에 대한 글'
< Top-5 검색 결과 >
-> 제목: 초기 스타트업의 GitOps 적용기
-> 제목: 글쓰는 개발자 모임, 글또 7기를 시작하면서
-> 제목: AWS 자격증 시험 후기 - SAA-C03, MLS-C01
-> 제목: 비전 데이터셋 아키텍처
-> 제목: 글쓰는 개발자 모임, 글또 8기를 시작하면서
====================
쿼리: 'Rust에 대한 글'
< Top-5 검색 결과 >
-> 제목: Rust 개발 환경 설정
-> 제목: 스트림 처리 엔진 - Arroyo 소개와 기본 사용법
-> 제목: [번역] Actix 문서
-> 제목: AWS 자격증 시험 후기 - SAA-C03, MLS-C01
-> 제목: AWS Data/MLOps 인프라 아키텍처링
====================
쿼리: '비디오 데이터 병렬 처리하는 방법'
< Top-5 검색 결과 >
-> 제목: 비전 데이터셋 아키텍처
-> 제목: 글쓰는 개발자 모임, 글또 8기를 시작하면서
-> 제목: 2023 하반기 회고
-> 제목: 딥러닝 모델 서빙을 위한 모델 변환
-> 제목: 글쓰는 개발자 모임, 글또 7기를 시작하면서
====================
쿼리: '글또에 대한 글'
< Top-5 검색 결과 >
-> 제목: 비전 데이터셋 아키텍처
-> 제목: 글쓰는 개발자 모임, 글또 7기를 시작하면서
-> 제목: 글쓰는 개발자 모임, 글또 8기를 시작하면서
-> 제목: 딥러닝 모델 서빙을 위한 모델 변환
-> 제목: 초기 스타트업의 GitOps 적용기
====================
쿼리: '회고'
< Top-5 검색 결과 >
-> 제목: 2023 하반기 회고
-> 제목: AWS 자격증 시험 후기 - SAA-C03, MLS-C01
-> 제목: 딥러닝 모델 서빙을 위한 모델 변환
-> 제목: 비전 데이터셋 아키텍처
-> 제목: 글쓰는 개발자 모임, 글또 8기를 시작하면서
====================
```

*“비디오 데이터 병렬 처리하는 방법”* 쿼리는 [**쿠버네티스 Job을 이용한 NAS 데이터 병렬 처리**](https://blog.taehun.dev/k8s-job-for-nfs)기사를 찾지 못하는군요. *“글또에 대한 글”* 쿼리의 첫 번째 결과도 잘못 나왔습니다. 왜 그럴까요? 여러가지 원인이 있겠지만, 크게 두 가지 원인 때문에 성능이 떨어집니다.

첫 번째 원인은 임베딩 결과 *벡터의 차원 (dimension)* 크기 차이로 인해 발생한 정확도 차이 입니다. OpenAI 모델은 유료 모델인만큼 고차원 벡터로 임베딩 할 수 있습니다.

- OpenAI `text-embedding-3-small` 모델의 최대 차원 = `1536`

- OpenAI `text-embedding-3-large` 모델의 최대 차원 = `3072`

- `multi-qa-mpnet-base-cos-v1` 모델의 최대 차원 = `768`

두 번째 원인은 *최대 입력 토큰 (max input token)* 크기의 차이 입니다. Sentence Transformer 패키지는 임베딩 모델의 최대 입력 토큰을 넘는 입력이 들어오면 자동으로 잘라냅니다. (참고로 LangChain OpenAI 임베딩은 최대 토큰이 넘는 입력이 들어오면 자동 분할 합니다.)

- OpenAI `text-embedding-3-small` 모델의 최대 입력 = `8192`

- OpenAI `text-embedding-3-large` 모델의 최대 입력 = `8192`

- `multi-qa-mpnet-base-cos-v1` 모델의 최대 입력 = `512`

이를 위해, 다양한 *텍스트 분할 (Text Split)* 기법들이 있습니다. LLM에서 큰 입력 데이터를 모델이 처리할 수 있는 단위로 분할한 것을 *청크 (Chunk)* 라고 합니다. LangChain에는 다양한 [Text Splitter](https://python.langchain.com/docs/modules/data_connection/document_transformers/) 기능을 제공하고 있으니, 이를 사용하면 편리하게 텍스트를 분할 할 수 있습니다.

블로그 기사 본문을 청킹하고, 청크와 원본 기사 매핑도 하려니 실험 단계가 너무 길어지는것 같습니다. 그냥 OpenAI 모델로 임베딩 하겠습니다. 더미 요청 이슈는 구현 단계에서 처리하겠습니다.

## 벡터 DB

시맨틱 검색 실험에 사용한 벡터 값은 모두 메모리에 있습니다. 이제 벡터 DB에 벡터를 저장하고, 검색 해보겠습니다.

[Langchain에서 지원하는 벡터 DB](https://python.langchain.com/docs/integrations/vectorstores/)만 해도 수십 가지가 넘습니다. LLM 대중화 이후로 정말 많은 벡터 DB가 등장했습니다. 마치 2년전 MLOps 도구들을 보는 것 같습니다. 이 중에서도 오픈소스 벡터 DB인 [LanceDB](https://lancedb.com/)를 사용해보겠습니다.

```
!pip install -q lancedb
```

LanceDB에 연결합니다. URI로 지정된 폴더가 존재하지 않으면 새 DB가 생성됩니다.

```python
import lancedb

uri = "vector-db"
db = lancedb.connect(uri)
```

블로그 데이터에 벡터 컬럼을 추가하고, 벡터 테이블을 생성 합니다.

```toml
for data, vector in zip(blog_datas, contents_vectors):
    data['vector'] = vector  # 'vector' 컬럼을 추가 합니다.

# 벡터 DB에 'blog_articles' 테이블 생성
tbl = db.create_table("blog_articles", data=blog_datas)
```

LanceDB에서 검색은 테이블 객체의 `search()` 메소드로 할 수 있습니다.

```python
for query in queries:
    query_vector = embeddings.embed_query(query)
    # LanceDB 테이블에서 Top-5 검색. 검색 결과를 리스트로 반환합니다.
    query_results = tbl.search(query_vector).limit(5).to_list()
    print(f"쿼리: '{query}'")
    print("< Top-5 검색 결과 >")
    for result in query_results:
        print("-> 제목:", result["title"])
    print("="*20)
```

출력

```
쿼리: 'MLOps 정의와 소개에 대한 글을 찾아줘'
< Top-5 검색 결과 >
-> 제목: ‘제로부터 시작하는 MLOps 도구와 활용’ 연재 중단
-> 제목: MLOps 소개
-> 제목: 2022년 MLOps 추천 자료 Top 5
-> 제목: AWS Data/MLOps 인프라 아키텍처링
-> 제목: [번역] MLOps 아키텍처 가이드
====================
쿼리: 'GitOps에 대한 글'
< Top-5 검색 결과 >
-> 제목: 초기 스타트업의 GitOps 적용기
-> 제목: 글쓰는 개발자 모임, 글또 8기를 시작하면서
-> 제목: Rust 개발 환경 설정
-> 제목: 글쓰는 개발자 모임, 글또 7기를 시작하면서
-> 제목: 글쓰는 개발자 모임, 글또 7기를 마무리하면서
====================
쿼리: 'Rust에 대한 글'
< Top-5 검색 결과 >
-> 제목: Rust 개발 환경 설정
-> 제목: [번역] Actix 문서
-> 제목: 글쓰는 개발자 모임, 글또 7기를 시작하면서
-> 제목: LlamaIndex 시작하기
-> 제목: ‘제로부터 시작하는 MLOps 도구와 활용’ 연재 중단
====================
쿼리: '비디오 데이터 병렬 처리하는 방법'
< Top-5 검색 결과 >
-> 제목: 쿠버네티스 Job을 이용한 NAS 데이터 병렬 처리
-> 제목: 비전 데이터셋 아키텍처
-> 제목: LlamaIndex 시작하기
-> 제목: 스트림 처리 엔진 - Arroyo 소개와 기본 사용법
-> 제목: YOLOv5 커스텀 데이터셋 학습
====================
쿼리: '글또에 대한 글'
< Top-5 검색 결과 >
-> 제목: 글쓰는 개발자 모임, 글또 7기를 마무리하면서
-> 제목: 글쓰는 개발자 모임, 글또 7기를 시작하면서
-> 제목: 글쓰는 개발자 모임, 글또 8기를 시작하면서
-> 제목: ‘제로부터 시작하는 MLOps 도구와 활용’ 연재 중단
-> 제목: LlamaIndex 시작하기
====================
쿼리: '회고'
< Top-5 검색 결과 >
-> 제목: 글쓰는 개발자 모임, 글또 7기를 시작하면서
-> 제목: Auth0로 NextJS 14 로그인 추가하기
-> 제목: 글쓰는 개발자 모임, 글또 8기를 시작하면서
-> 제목: 글쓰는 개발자 모임, 글또 7기를 마무리하면서
-> 제목: [번역] Actix 문서
====================
```

## 하이브리드 검색

하이브리드 검색은 텍스트 기반 검색과 벡터 기반 검색을 결합한 검색 방식입니다. 하이브리드 검색은 키워드 검색과 시맨틱 검색 장점을 결합하여, 사용자가 입력한 키워드에 정확하게 일치하는 문서를 찾으면서도, 동시에 문서의 의미적 맥락을 고려하여 유사한 내용을 포함한 문서도 제시할 수 있습니다. 예를 들어, 사용자가 *"태양의 도시"*로 검색했을 때, 하이브리드 검색은 이 키워드를 포함하는 문서와 함께 *"태양의 도시"*가 은유적으로 사용된 문맥에서 관련된 다른 문서들도 함께 제공할 수 있습니다.


<!-- TODO: 이미지 추가 - 파일명: Screenshot-2024-02-19-at-2.41.44-PM.webp, 원본: https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fd16ab49b-c880-41d3-8de9-a0ddfb671740%2F08c6911f-992b-4551-b9ec-dc15ccbeead2%2FScreenshot-2024-02-19-at-2.41.44-PM.webp?table=block&id=fcfb5b73-54e4-4832-989b-1e9df68dfe1a&cache=v2 -->

![그림 출처&gt; https://blog.lancedb.com/hybrid-search-combining-bm25-and-semantic-search-for-better-results-with-lan-1358038fe7e6/](https://img-src.io/taehun/llm-blog-search-research/7.webp)


그림 출처> <https://blog.lancedb.com/hybrid-search-combining-bm25-and-semantic-search-for-better-results-with-lan-1358038fe7e6/>

블로그 검색에서 사용자가 기대하는 결과는 블로그 기사 제목의 *키워드 검색* 결과 입니다. 여기에 더해 검색 쿼리 의미를 파악하여, 기사 내용에서 *시맨틱 검색*이 조금 가미되면 좋겠습니다. 이러한 블로그 검색 특성에 맞게 하이브리드 검색을 추가해 봅시다.

LanceDB를 사용하여 하이브리드 검색 실험을 해보겠습니다. LanceDB에서 하이브리드 검색을 사용하려면 임베딩 함수가 테이블에 설정되어야 합니다. 아래와 같이 OpenAI 임베딩 모델로 임베딩 함수를 정의하고, 테이블 스키마를 지정하였습니다.

```python
from lancedb.pydantic import LanceModel, Vector
from lancedb.embeddings import get_registry
from typing import List

embedding_func = get_registry().get("openai").create(name="text-embedding-3-small")

class BlogArticle(LanceModel):
    contents: str = embedding_func.SourceField()
    vector: Vector(embedding_func.ndims()) = embedding_func.VectorField()
    title: str
    tags: List[str]

tlb2 = db.create_table("blog_articles2", schema=BlogArticle)
```

새로 생성한 테이블에 블로그 데이터를 추가 합니다.

```toml
data = [
    {
        "contents": data["contents"],
        "vector": data["vector"],
        "title": data["title"],
        "tags": data["tags"]
    } 
    for data in blog_datas
]
tlb2.add(data)
```

LanceDB에서 하이브리드 검색시 키워드 검색에 사용할 필드의 인덱스를 생성하고, [Reranker](https://lancedb.github.io/lancedb/reranking/)를 설정합니다. [Comparing Rerankers 문서](https://lancedb.github.io/lancedb/hybrid_search/eval/)에 따르면 가장 좋은 성능을 보여주는 Reranker는 Cohere Reranker 입니다. Cohere Reranker를 사용하려면 <https://cohere.com/> 에 계정도 만들어야하고 유료이므로 디폴트 Reranker인 [Linear Combination Reranker](https://lancedb.github.io/lancedb/reranking/linear_combination/)를 사용 했습니다. Linear Combination Reranker는 FTS와 벡터 검색 가중치를 설정 값으로 조절 할 수 있습니다.

```python
from lancedb.rerankers import LinearCombinationReranker

# 키워드 검색을 위한 FTS 인덱스 생성
tlb2.create_fts_index("title")
# weight = 벡터 가중치 = 0.3, FTS 가중치 = 1-(weight) = 0.7
reranker = LinearCombinationReranker(weight=0.3)

for query in queries:
    # 제목의 키워드와 내용의 벡터 유사도를 조합한 하이브리드 검색
    query_results = tlb2.search(query, query_type="hybrid").limit(5).rerank(reranker=reranker).to_list()
    print(f"쿼리: '{query}'")
    print("< Top-5 검색 결과 >")
    for result in query_results:
        print("-> 제목:", result["title"])
    print("="*20)
```

출력

```
쿼리: 'MLOps 정의와 소개에 대한 글을 찾아줘'
< Top-5 검색 결과 >
-> 제목: MLOps 소개
-> 제목: ‘제로부터 시작하는 MLOps 도구와 활용’ 연재 중단
-> 제목: MLOps 도구와 활용 - 1. MLOps 개요
-> 제목: 2022년 MLOps 추천 자료 Top 5
-> 제목: MLOps 도구와 활용 - 2. MLOps 시스템 아키텍처
====================
쿼리: 'GitOps에 대한 글'
< Top-5 검색 결과 >
-> 제목: 초기 스타트업의 GitOps 적용기
-> 제목: 글쓰는 개발자 모임, 글또 8기를 시작하면서
-> 제목: Rust 개발 환경 설정
-> 제목: 글쓰는 개발자 모임, 글또 7기를 시작하면서
-> 제목: 글쓰는 개발자 모임, 글또 7기를 마무리하면서
====================
쿼리: 'Rust에 대한 글'
< Top-5 검색 결과 >
-> 제목: Rust 개발 환경 설정
-> 제목: [번역] Actix 문서
-> 제목: 글쓰는 개발자 모임, 글또 7기를 시작하면서
-> 제목: LlamaIndex 시작하기
-> 제목: ‘제로부터 시작하는 MLOps 도구와 활용’ 연재 중단
====================
쿼리: '비디오 데이터 병렬 처리하는 방법'
< Top-5 검색 결과 >
-> 제목: 쿠버네티스 Job을 이용한 NAS 데이터 병렬 처리
-> 제목: 비전 데이터셋 아키텍처
-> 제목: LlamaIndex 시작하기
-> 제목: 스트림 처리 엔진 - Arroyo 소개와 기본 사용법
-> 제목: YOLOv5 커스텀 데이터셋 학습
====================
쿼리: '글또에 대한 글'
< Top-5 검색 결과 >
-> 제목: 글쓰는 개발자 모임, 글또 7기를 마무리하면서
-> 제목: 글쓰는 개발자 모임, 글또 7기를 시작하면서
-> 제목: 글쓰는 개발자 모임, 글또 8기를 시작하면서
-> 제목: ‘제로부터 시작하는 MLOps 도구와 활용’ 연재 중단
-> 제목: LlamaIndex 시작하기
====================
쿼리: '회고'
< Top-5 검색 결과 >
-> 제목: 글쓰는 개발자 모임, 글또 7기를 시작하면서
-> 제목: Auth0로 NextJS 14 로그인 추가하기
-> 제목: 글쓰는 개발자 모임, 글또 8기를 시작하면서
-> 제목: 글쓰는 개발자 모임, 글또 7기를 마무리하면서
-> 제목: 2023 하반기 회고
====================
```

블로그 제목에 대한 키워드 검색과 블로그 내용에 적용된 시맨틱 검색의 결합으로 검색 결과의 정확도와 관련성이 향상되었습니다.

## 결론

처음에는 단순히 블로그 제목에 대한 키워드 검색 기능을 구현할 계획이었으나, 기술적 호기심과 직무 전문성을 바탕으로 LLM 기반의 시맨틱 검색까지 실험해 보았습니다. 이 과정에서 LangChain, OpenAI의 임베딩 모델과 LanceDB 같은 벡터 데이터베이스를 활용하였습니다.

하이브리드 검색은 사용자가 입력한 키워드와 직접적으로 관련된 내용뿐만 아니라, 그 의미를 깊이 파악하여 관련 내용을 제시하는 기능입니다. 사용자가 입력한 구체적인 키워드를 직접 포함하는 기사뿐 아니라, 은유적으로 비슷한 맥락을 다룬 기사도 함께 제공됩니다.

이제 실험한 내용을 기반으로 구현할 차례입니다! 다음 기사에는 NextJS 환경에서 블로그 검색 기능을 개발한 경험담을 공유해 드리겠습니다.