+++
title = "제로부터 시작하는 MLOps 도구와 활용 - 3. 컴퓨팅 인프라 - 쿠버네티스 (1/2)"
date = 2023-04-22
draft = false

[taxonomies]
tags = ['MLOps', 'Kubernetes']

[extra]
author = "김태훈"
toc = true
+++


<!-- TODO: 이미지 추가 - 파일명: Zero-to-MLOps-3-1png.png, 원본: https://www.notion.so/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fsecure.notion-static.com%2F215e0f4f-253a-4e9d-a5d3-e1aa5545db07%2FZero-to-MLOps-3-1png.png?table=block&id=6d9c03a6-10c3-4780-a316-f7ab44579f90&cache=v2 -->

![그림 3-1. 3장 컴퓨팅 인프라 - 쿠버네티스의 구성 요소와 도구들 (컴퓨팅 인프라, 클러스터 생성, 인프라 관리 자동화)]()


그림 3-1. *3장 컴퓨팅 인프라 - 쿠버네티스*의구성 요소와 도구들 (컴퓨팅 인프라, 클러스터 생성, 인프라 관리 자동화)

이번 장에서는 MLOps 인프라의 기반이 되는 쿠버네티스 클러스터를 구축하는 방법에 대해 알아보겠습니다. 본 장의 내용은 MLOps에 국한된 것이 아니라 DevOps 인프라와 밀접한 관련이 있습니다. 그러나 MLOps 시스템을 처음부터 구축하기 위해서는 이 장의 과정을 반드시 이해하고 수행해야 합니다.

먼저, 쿠버네티스의 개념과 주요 구성 요소를 간단하게 소개합니다. 이어서 쿠버네티스 클러스터 구축을 위한 물리적 인프라 구성 방법과 클러스터 생성 도구들로 쿠버네티스 클러스터를 생성 합니다. 마지막으로 인프라 관리에 도움이 되는 도구들을 소개하며, 효율적인 클러스터 관리 및 운영 방법을 제시하면서 이 장을 마무리합니다.

### 3.1 컴퓨팅 인프라: 쿠버네티스

ℹ️

이 절의 내용은 쿠버네티스 공식 문서 ‘[****쿠버네티스란 무엇인가?****](https://kubernetes.io/ko/docs/concepts/overview/)****’, ‘****[****쿠버네티스 컴포넌트****](https://kubernetes.io/ko/docs/concepts/overview/components/)****’**** 페이지를 요약 정리 한 것 입니다. 쿠버네티스에 대해 좀 더 많은 내용을 알고 싶으시면 [쿠버네티스 공식 문서](https://kubernetes.io/ko/docs/home/)를 참고하시기 바랍니다.

**쿠버네티스(Kubernetes)**는 컨테이너화된 애플리케이션의 배포, 확장 및 관리를 자동화하는 오픈 소스 오케스트레이션 플랫폼입니다. 쿠버네티스는 애플리케이션을 더 쉽게 관리하고 확장할 수 있도록 클러스터내 컨테이너 리소스를 조정하고, 컨테이너 간 네트워킹과 로드 밸런싱을 처리하며, 상태 및 비상태 워크로드에 대한 자동 스케일링과 [롤링 업데이트](https://kubernetes.io/ko/docs/tutorials/kubernetes-basics/update/update-intro/)를 지원합니다. 이를 통해 개발자와 시스템 관리자는 복잡한 인프라 관리 작업을 단순화하고, 높은 가용성과 빠른 개발을 통한 애플리케이션의 안정성과 효율성을 높일 수 있습니다.

쿠버네티스를 종종 **`k8s`** 라고 부르곤 합니다. `k8s`는 `kubernetes` 의 첫 문자 `k`와 중간 문자열의 길이 (`len(’ubernete') = 8`)와 마지막 문자 `s`를 붙인 약어 입니다.

#### 3.1.1 컨테이너 배포의 시대


<!-- TODO: 이미지 추가 - 파일명: container_evolution.svg, 원본: https://www.notion.so/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fsecure.notion-static.com%2Fa2095400-d16d-4c3b-8bb4-c7dbd777813c%2Fcontainer_evolution.svg?table=block&id=11c7adff-c806-4440-9f39-2de58cb499f2&cache=v2 -->

![그림 3-2. 소포트웨어 배포 시대 흐름  (출처&gt; https://kubernetes.io/ko/docs/concepts/overview/)]()


그림 3-2. 소포트웨어 배포 시대 흐름 (*출처>* *<https://kubernetes.io/ko/docs/concepts/overview/>**)*

전통적인 배포 시대에서는 물리 서버에서 애플리케이션을 실행했으며, 리소스 할당 문제가 발생했습니다. 한 물리 서버에서 여러 애플리케이션의 리소스 한계를 정의할 방법이 없었기에, 리소스 할당의 문제가 발생했습니다. 이에 대한 해결책은 서로 다른 여러 물리 서버에서 각 애플리케이션을 실행하는 것이었습니다.

가상화된 배포 시대에서는 가상 머신(VM)을 도입하여 리소스를 효율적으로 사용하게 되었습니다. 가상화를 사용하면 물리 서버에서 리소스를 보다 효율적으로 활용할 수 있으며, 쉽게 애플리케이션을 추가하거나 업데이트할 수 있고 하드웨어 비용을 절감할 수 있어 더 나은 확장성을 제공합니다.

컨테이너 배포 시대에는 애플리케이션 간에 운영체제를 공유하면서도 격리된 환경에서 실행할 수 있게 되었습니다. 컨테이너는 가볍고, 이식성이 높으며, 개발과 운영의 관심사를 분리할 수 있어 인기를 얻게 되었습니다.

이러한 발전으로 인해 컨테이너는 기민한 애플리케이션 생성, 배포, 가시성 및 이식성 등 다양한 혜택을 제공하게 되었습니다. 컨테이너 기술은 애플리케이션 중심의 관리를 가능하게 하며, 마이크로서비스 아키텍처와 같은 유연한 애플리케이션 개발을 지원합니다.

쿠버네티스는 컨테이너화된 워크로드와 서비스를 관리하기 위한 이식성이 있고, 확장가능한 오픈소스 플랫폼입니다. 쿠버네티스는 *선언형(Declarative)* 설정과 자동화를 모두 용이하게 해줍니다.

💡

**명령형 언어(Imperative Language) Vs. 선언형 언어(Declarative Language)** 

명령형 언어와 선언형 언어는 프로그래밍 언어를 설명하는 두 가지 다른 관점입니다. 이들은 프로그래밍 언어가 문제 해결을 위해 코드를 작성하는 방식에 따라 구분됩니다.
명령형 언어는 코드가 어떻게 작동해야 하는지에 중점을 두고 문제를 해결하는 방식을 사용합니다. 프로그래머가 상태 변경을 통해 결과를 얻는 데 필요한 모든 단계를 지시하며, 프로그램의 상태 변화를 세밀하게 제어할 수 있습니다. 이러한 언어는 변수를 할당하고, 조건문을 사용하며, 반복문을 통해 반복적인 작업을 수행하는 등의 기능을 제공합니다. 대표적인 명령형 언어로는 *C, C++, Java, Python* 등이 있습니다.
선언형 언어는 코드가 무엇을 수행해야 하는지에 중점을 두고 문제를 해결하는 방식을 사용합니다. 프로그래머는 원하는 결과를 정의하며, 언어 및 시스템이 그 결과를 얻는 방법을 결정합니다. 선언형 언어에서는 프로그래머가 직접 제어 구조를 작성하지 않으며, 코드가 목표 상태에 도달하는 방법에 대한 추상화를 제공합니다. 대표적인 선언형 언어로는 *SQL, HTML, CSS, Haskell, Prolog* 등이 있습니다.

쿠버네티스의 선언형 접근법은 *YAML(또는 JSON)* 형식의 설정 파일을 사용하여 원하는 리소스 상태를 정의하는 것입니다. 이러한 설정 파일을 작성한 후, `kubectl apply`커맨드를 사용하여 쿠버네티스 클러스터에 전달합니다. 쿠버네티스 시스템은 이러한 선언된 상태를 이해하고, 리소스를 생성, 업데이트, 삭제하여 실제 클러스터 상태가 원하는 상태와 일치하도록 관리합니다. 이 선언형 접근법을 사용하면, 쿠버네티스에서 워크로드 배포, 네트워킹 구성, 스케일링 등의 작업을 쉽게 수행하고 추적할 수 있으며, 인프라 관리에 대한 일관성과 복원력을 향상시킬 수 있습니다.

|  |  |
| --- | --- |
| **명령형 접근법** | **선언형 접근법** |
| $ kubectl create *(리소스 생성)* $ kubectl run *(컨테이너 실행)* $ kubectl scale *(레플리카 수 스케일링)* $ kubectl delete (*리소스 삭제)* | *(YAML 파일에 리소스 상태 작성)* $ kubectl apply -f *<YAML 파일>* |

- 표 3-1. 쿠버네티스 명령형 접근법과 선언형 접근법 비교

#### 3.1.2 쿠버네티스 기본


<!-- TODO: 이미지 추가 - 파일명: Zero-to-MLOps-3-3.png, 원본: https://www.notion.so/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fsecure.notion-static.com%2Fe75cc495-f39f-4f32-9816-a225f579af8c%2FZero-to-MLOps-3-3.png?table=block&id=8e8d4b80-719a-4ed9-8445-820bedb121c2&cache=v2 -->

![그림 3-3. 쿠버네티스 아키텍처 예시]()


그림 3-3. 쿠버네티스 아키텍처 예시

**파드(Pod)**

파드는 단일 IP 주소와 메모리 및 스토리지와 같은 리소스를 공유하여 단일 애플리케이션으로 취급할 수 있는 컨테이너 그룹입니다. 파드는 쿠버네티스에서 관리하는 가장 작은 단위로, 단일 컨테이너 또는 함께 작동하는 여러 컨테이너를 포함할 수 있습니다. 다중 컨테이너 파드를 사용하면 여러 컨테이너가 요청 처리, 이미지 처리, 스토리지 관리와 같은 서로 다른 작업을 수행하는 복잡한 애플리케이션을 더 쉽게 배포 할 수 있습니다.

**디플로이먼트**(**Deployment)**

디플로이먼트를 사용하면 원하는 수의 동일한 파드 복제본(replica)을 설정하고 업데이트 전략을 지정하여 애플리케이션의 규모를 정의할 수 있습니다. 쿠버네티스는 파드 상태를 추적하여 애플리케이션 배포의 원하는 상태를 유지하기 위해 자동으로 파드를 추가하거나 제거합니다.

**레플리카셋(ReplicaSet)**

레플리카셋은 보통 명시된 동일 파드 개수에 대한 가용성을 보증하는데 사용합니다. 디플로이먼트를 쿠버네티스 클러스터에 배포하면 자동 생성 됩니다.

**서비스(Service)**

쿠버네티스는 파드를 고유하고 오래 실행되는 인스턴스로 취급하지 않으며, 파드에 장애가 발생하여 죽으면 애플리케이션이 다운타임을 겪지 않도록 파드를 교체하는 것이 쿠버네티스의 역할입니다. 안정성을 보장하기 위해 서비스는 파드에 대한 추상화 계층 역할을 하여 기본 파드가 변경되더라도 일관되게 유지되는 단일 머신 이름 또는 IP 주소를 제공합니다. 이렇게 하면 파드 자체의 변경에도 불구하고 애플리케이션 소비자와의 원활한 상호 작용이 보장됩니다.

**인그레스(Ingress)**

인그레스는 클러스터 외부에서 클러스터 내부 서비스(Service)로 HTTP와 HTTPS 경로를 노출 합니다. 트래픽 라우팅은 인그레스 리소스에 정의된 규칙에 의해 이루어 집니다.

**노드(Node)**

노드는 파드를 관리하고 실행하는 가상 또는 실제 머신입니다. 노드는 여러 파드의 수집 지점 역할을 하여 함께 작동할 수 있도록 합니다. 대규모 운영에서는 사용 가능한 용량이 있는 노드에 워크로드를 효율적으로 분산하여 최적의 리소스 활용을 보장할 수 있습니다.

**네임스페이스 (NameSpace)**

네임스페이스는 리소스를 구성하고 격리할 수 있는 클러스터 내의 논리적 파티션으로, 워크로드와 해당 구성 요소를 깔끔하게 분리할 수 있도록 합니다. 네임스페이스는 각 네임스페이스에 고유한 구성, 정책 및 리소스 제한을 적용할 수 있으므로 서로 다른 프로젝트 또는 환경에서 작업하는 팀이 충돌 없이 클러스터를 공유할 수 있습니다.

그 외, 각종 설정 값에 사용하는 *ConfigMap*과 *Secret*, 스토리지 역활을 하는 *퍼시스턴트 볼륨*(*Persistent Volume)*과 접근 제어에 사용하는 *서비스 계정(Service Account)* 및 *역활(Role)*등 쿠버네티스에서 사용하는 용어와 항목들은 매우 많습니다. 그 모든것을 설명하는 것은 이 글의 주제를 벗어나므로 우선은 생략하고, 이후 설명이 필요하면 하나씩 살펴보겠습니다.

#### 3.1.3 쿠버네티스 클러스터 구성 요소


<!-- TODO: 이미지 추가 - 파일명: components-of-kubernetes.svg, 원본: https://www.notion.so/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fsecure.notion-static.com%2Fb7c708f5-fad9-4717-b45c-c4895b736579%2Fcomponents-of-kubernetes.svg?table=block&id=f4bd5355-6ba2-41b4-b073-561f0b406bc7&cache=v2 -->

![그림 3-4. 쿠버네티스 클러스터 구성 요소 (출처&gt; https://kubernetes.io/ko/docs/concepts/overview/components)]()


그림 3-4. 쿠버네티스 클러스터 구성 요소 *(출처>* *[https://kubernetes.io/ko/docs/concepts/overview/components](https://kubernetes.io/ko/docs/concepts/overview/components/)**)*

쿠버네티스 클러스터는 컨테이너화된 애플리케이션을 실행하는 **노드(Node)**라고 하는 워커의 집합으로 구성됩니다. 모든 클러스터에는 하나 이상의 워커 노드가 있습니다.

워커 노드는 애플리케이션 워크로드의 구성 요소인 **파드(Pod)**를 호스팅합니다. **컨트롤 플레인(Control Plane)**은 클러스터의 **워커 노드(Worker Node)**와 파드를 관리합니다. 프로덕션 환경에서 컨트롤 플레인은 일반적으로 여러 대의 컴퓨터에서 실행되고 클러스터는 일반적으로 여러 노드를 실행하여 내결함성과 고가용성을 제공합니다.

**컨트롤 플레인(Control Plane) 구성 요소**

컨트롤 플레인 구성 요소는 클러스터에 대한 전역적인 결정을 내리는 역할을 합니다(예: 스케줄링). 또한 클러스터 이벤트를 감지하고 대응합니다(예: Deployment의 `replica` 필드가 충족되지 않을 때 새 파드를 시작).

컨트롤 플레인 구성 요소는 클러스터 내의 어떤 노드에서든 실행될 수 있습니다. 그러나 일반적으로 모든 컨트롤 플레인 구성 요소를 동일한 노드에서 시작하고, 이 노드는 사용자 컨테이너를 실행하지 않습니다.

|  |  |
| --- | --- |
| **구성 요소** | **설명** |
| ****kube-apiserver (api)**** | 쿠버네티스 컨트롤 플레인의 핵심 구성 요소. API 서버는 쿠버네티스 API를 노출하고 컨트롤 플레인의 프런트엔드 역할을 합니다. |
| ****etcd**** | 모든 리소스의 현재 상태와 그 관계를 포함하여 쿠버네티스 클러스터 설정과 상태를 저장하는 분산형 키-값(key-value) 저장소 |
| ****kube-scheduler (sched)**** | 새로 생성된 파드를 감시하고 실행할 노드를 결정하는 스케쥴러 |
| ****kube-controller-manager (c-m)**** | 컨트롤러 프로세스를 실행하는 컨트롤 플레인 컴포넌트. 컨트롤러 유형에는 *노드 컨트롤러, 잡 컨트롤러, 엔드포인트슬라이스 컨트롤러, 서비스어카운트 컨트롤러*가 있습니다. |
| ****cloud-controller-manager (c-c-m)**** | 클라우드별 컨트롤 로직을 포함하는 컨트롤러. 클라우드 플랫폼과 상호 작용하는 컨트롤러 관리. *노드 컨트롤러, 라우트 컨트롤러, 서비스 컨트롤러*등이 클라우드 제공 사업자 의존성을 가질 수 있습니다. |

- 표 3-2. 컨트롤 플레인 구성 요소

**노드(Node) 구성 요소**

노드 구성 요소는 워커 노드에 상주하며 컨테이너화된 애플리케이션 실행을 담당합니다. 주요 구성 요소로는 API 서버와 통신하여 파드 내의 컨테이너를 관리하는 **kubelet**, 컨테이너를 실행하고 관리하는 **container runtime**, 서비스 검색 및 로드 밸런싱을 지원하는 네트워크 프록시인 **kube-proxy**, 하나 이상의 컨테이너로 구성된 워크로드 구성 요소인 파드가 있습니다.

|  |  |
| --- | --- |
| **구성 요소** | **설명** |
| ****kubelet**** | *kubelet*은 파드 내의 컨테이너가 예상대로 실행되고 있는지 확인하는 역할을 담당합니다. API 서버와 통신하여 원하는 파드 구성을 수신하고, 컨테이너에 대한 정기적인 상태 확인을 수행합니다. 컨테이너에 장애가 발생하면 *kubelet*은 컨테이너를 다시 시작하여 원하는 시스템 상태를 유지합니다. |
| ****kube-proxy (k-proxy)**** | *kube-proxy*는 클러스터의 각 노드에서 실행되는 네트워크 프록시로, 서비스 개념의 구현부입니다. 서비스에서 노드로 들어오는 트래픽을 라우팅합니다. |
| c****ontainer runtime**** | *컨테이너 런타임*은 Docker와 같은 컨테이너 실행을 담당하는 소프트웨어입니다. 파드가 실행될 수 있도록 클러스터의 각 노드에 컨테이너 런타임을 설치해야 합니다. |

- 표 3-3. 노드 구성 요소

### 3.2 쿠버네티스 클러스터 생성

#### 3.2.1 물리적 인프라

우선, 쿠버네티스 클러스터를 구성하는 노드가 있어야 합니다. MLOps를 위한 온프레미스 쿠버네티스 클러스터를 구축하기 위해서는 고려해야하는 하드웨어 사양이 있습니다. MLOps 워크로드는 모델 학습, 추론 및 대용량 데이터 처리가 빈번하다는 요구 사항으로 인해 리소스 집약적 입니다. 다음은 MLOps용 온프레미스 쿠버네티스 클러스터의 하드웨어 사양에 대한 몇 가지 권장 사항들 입니다:

- **CPU**

- 효율적인 병렬 처리를 위해 코어 수(16개 이상)와 클럭 속도(2.5GHz 이상)가 높은 최신 멀티코어 프로세서(예: 인텔 제온 또는 AMD EPYC).
- 머신러닝 워크로드 최적화를 위한 하드웨어 가상화(Intel VT-x 또는 AMD-V) 기능 및 AVX/AVX2 명령어 지원
- *bfloat16* 데이터 타입 지원 (*딥러닝 워크로드 옵션*)

- **GPU** (*딥러닝 워크로드 옵션*)

- 가속화된 모델 학습 및 추론을 위한 CUDA 및 텐서 코어가 포함된 NVIDIA GPU(예: NVIDIA A100, A40 또는 RTX 30 시리즈).
- 서버 하드웨어의 전력 요구 사항과 호환성을 확인합니다.

- **메모리**

- 데이터 처리 및 모델 학습 작업을 처리할 수 있는 대용량 메모리 (노드당 128GB 이상).
- 대역폭이 높은 고속 메모리(예: DDR4 또는 DDR5)로 성능을 개선합니다.

- **스토리지**

- 대용량 데이터 세트와 모델 체크포인트를 처리하기 위한 NVMe SSD 또는 분산 파일 시스템(예: Ceph, GlusterFS)과 같은 고성능 스토리지 솔루션.
- 유연성과 확장성을 위해 빠른 로컬 스토리지와 공유 네트워크 스토리지의 조합 (스토리지 클래스로 분리)

- **네트워킹**

- 노드 간의 효율적인 통신을 지원하고 데이터 처리 및 모델 학습 중 네트워크 병목을 줄이기 위한 고대역폭, 저지연 네트워크 인터페이스(10GbE, 25GbE 또는 40GbE).
- 필요한 대역폭과 처리량을 지원하는 네트워크 스위치 및 라우터.

- **쿨링 및 전원 공급 장치**

- CPU, GPU 및 기타 구성 요소에서 발생하는 열을 처리할 수 있는 적절한 냉각 솔루션.
- 안정성을 보장하고 전력 소비를 최소화하기 위해 효율적인 전원 공급 장치.

이러한 권장 사항은 일반적인 지침이며 MLOps 워크로드의 특정 요구 사항에 따라 조정해야 합니다. 머신러닝 작업의 규모와 복잡성, 데이터 세트의 크기, 조직의 성장 가능성을 고려하여 쿠버네티스 클러스터의 하드웨어 사양을 선택해야 합니다. 이 글의 주요 대상인 예산이 부족한 소규모 ML 팀이라면 먼저 회사나 연구실의 여분의 데스크탑 PC나 노트북을 활용하시는 것을 추천합니다. 저사양의 노트북은 컨트롤 플레인 노드로 설정하고, *테인트(taint)* 를 설정하여 어플리케이션 파드가 스케쥴 되지 않도록 설정 합니다. 여분의 PC나 노트북이 없다면, [다나와](https://www.danawa.com/) 같은 싸이트에서 예산이 허용하는 범위내에서 가성비가 좋은 데스크탑 PC를 몇 대와 *NAS(Network Access Storage)* 를 구매하여 쿠버네티스 클러스터를 구축 할 수 있습니다.


<!-- TODO: 이미지 추가 - 파일명: Zero-to-MLOps-3-5.png, 원본: https://www.notion.so/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fsecure.notion-static.com%2Fd026e249-309a-41eb-9406-67987c44b9f6%2FZero-to-MLOps-3-5.png?table=block&id=358dab5a-2c64-4984-83d6-5e714b923f00&cache=v2 -->

![그림 3-5. 노트북, 데스크탑 PC, NAS로 구성한 소규모 쿠버네티스 클러스터]()


그림 3-5. 노트북, 데스크탑 PC, NAS로 구성한 소규모 쿠버네티스 클러스터

클러스터내 모든 노드의 하드웨어 사양이 같을 필요는 없지만, 노드의 역활 (*컨트롤 플레인* 또는 *워커 노드*)별로 동일한 사양으로 구성하는 것이 노드 관리에 용이합니다. 소규모 클러스터는 노드 장애 발생시 장애가 난 노드를 즉각적으로 감지 할 수 있고, 약간의 성능상의 이점과 관리상의 편의성으로 가상화 레이어 없는 물리적 머신(Physical Machine)을 노드로 할당하여 사용하는 것을 추천합니다. 반면에 사용자와 노드가 많은 대규모 클러스터는 물리적 머신을 노드로 할당하면 관리 비용이 큰 폭으로 증가하게 됩니다. 대규모 클러스터는 Hyper-V, VMware, Proxmox, OpenStack과 같은 솔루션을 활용하여 가상 머신 (VM, Virtual Machine)을 노드로 사용해야 합니다.

ℹ️

**bfloat16 데이터 타입**


<!-- TODO: 이미지 추가 - 파일명: Untitled.png, 원본: https://www.notion.so/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fsecure.notion-static.com%2F4a94a9dd-f123-416f-9ed4-42b823230d7e%2FUntitled.png?table=block&id=cde18a44-6357-4bb3-b205-6c80ec7a15e2&cache=v2 -->

![그림 3-6. bfloat16 데이터 타입 (출처&gt; https://cloud.google.com/tpu/docs/bfloat16)]()


그림 3-6. bfloat16 데이터 타입 *(출처>* *<https://cloud.google.com/tpu/docs/bfloat16>**)*

*bfloat16(Brain Floating Point)* 데이터 타입은 딥 러닝 및 인공 지능(AI) 애플리케이션에 더 높은 성능과 적은 메모리 공간을 제공하도록 설계된 16비트 부동 소수점 형식입니다. 원래 Google에서 텐서 처리 장치(TPU)를 위해 개발했으며, 이후 AI 하드웨어 및 소프트웨어에 광범위하게 채택되었습니다.

bfloat16 형식의 특징은 다음과 같습니다:

- **표현**: bfloat16 형식은 부호 비트 1개, 지수 비트 8개, 맨티사 비트 7개로 구성됩니다. 이 구성은 부호 비트 1개, 지수 비트 5개, 맨티사 비트 10개로 구성된 IEEE 754 반정밀도(float16) 형식과는 다릅니다.

- **동적 범위**: 8개의 지수 비트를 사용하는 bfloat16은 단정밀도(float32) 형식과 동일한 동적 범위를 가지므로 매우 큰 숫자와 매우 작은 숫자를 표현할 수 있습니다. 이 동적 범위는 가중치와 활성화 함수가 광범위한 값에 걸쳐 있을 수 있는 딥 러닝 모델에 매우 중요합니다.

- **정밀도**: bfloat16 형식은 맨티사 비트가 적기 때문에 float16 형식보다 정밀도가 낮습니다(7비트 대 10비트). 그러나 이러한 낮은 정밀도는 작은 반올림 오류에도 비교적 견고하게 모델을 구현할 수 있는 딥러닝 작업에는 충분할 수 있습니다.

- **성능 및 메모리 효율성**: (float32에 비해) bfloat16의 메모리 사용 공간이 더 작기 때문에 AI 하드웨어에서 더 빠른 연산, 더 낮은 전력 소비, 더 효율적인 메모리 사용을 가능하게 합니다. 이는 특히 리소스가 제한된 엣지 디바이스에서 대규모 신경망을 훈련하고 AI 모델을 배포하는 데 유용합니다.

- **호환성**: bfloat16은 Google TPU, DL 부스트 기술이 적용된 인텔 프로세서, 텐서 코어가 탑재된 NVIDIA GPU 등 다양한 AI 하드웨어 가속기에서 지원됩니다. 또한, TensorFlow, PyTorch등 많은 딥 러닝 프레임워크가 모델 학습 및 추론을 위한 기본 데이터 유형으로 bfloat16을 지원합니다.

요약하면, bfloat16 데이터 유형은 고성능 딥 러닝 애플리케이션을 위해 설계된 16비트 부동 소수점 형식입니다. 이 형식은 float32의 동적 범위와 float16의 메모리 효율성 사이에서 균형을 이루기 때문에 AI 하드웨어 및 소프트웨어 구현에 널리 사용됩니다.

#### 3.2.2 kubectl - 쿠버네티스 CLI 도구

쿠버네티스 커맨드라인 도구인 `kubectl`을 사용하면 쿠버네티스 클러스터를 제어 할 수 있습니다. kubectl 커맨드를 사용하면 애플리케이션 배포, 클러스터 리소스 검사 및 로그를 확인등 다양한 작업들이 커맨드라인 환경에서 가능합니다. kubectl는 `kube-apiserver` 와 상호 작용하여 쿠버네티스 클러스터를 제어 합니다. 즉, kubectl는 쿠버네티스 API를 래핑하여 커맨드라인 인터페이스를 제공해주는 도구 입니다.

쿠버네티스를 사용하려면 먼저 **로컬 환경**에 kubectl 커맨드라인 도구를 설치해야 합니다.

💡

**로컬 환경 (Local Environment)**로컬 환경은 개인의 작업용 컴퓨터나 노트북에서 도구, 라이브러리 및 종속성을 설정하고 구성하는 것을 의미합니다. 이 글에서 언급하는 로컬 환경은 다음 중 하나라고 가정하겠습니다:

- *macOS 13 / Macbook, iMac*

- *Ubuntu 22.04 데스크탑 / 데스크탑 PC*

윈도우 환경은 호환성 문제로 제외하도록 하겠습니다. (사실 제가 윈도우 머신이 없습니다.) 윈도우 사용자는 *WSL(Windows Subsystem for Linux)* 환경에 Ubuntu 22.04을 설치하면 Ubuntu 22.04 데스크탑 환경과 거의 동일한 환경을 구성 할 수 있습니다.

****macOS 환경에 kubectl 설치****

`brew` 로 간단하게 설치 할 수 있습니다. 로컬 macOS 환경의 많은 도구들이 brew를 사용하여 설치하므로, 아직 설치가 되어 있지 않다면 아래 커맨드를 실행하여 Homebrew부터 설치해 주시기 바랍니다.

- *(**`brew`* *미설치된 환경만)* Homebrew 설치하기

```bash
$ /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

`brew` 로 kubectl 설치하기

```bash
$ brew install kubectl
```

설치 확인

```bash
$ kubectl version --client
```

```WARNING: This version information is deprecated and will be replaced with the output from kubectl version --short.  Use --output=yaml|json to get the full version.
Client Version: version.Info{Major:"1", Minor:"25", GitVersion:"v1.25.0", GitCommit:"a866cbe2e5bbaa01cfd5e969aa3e033f3282a8a2", GitTreeState:"clean", BuildDate:"2022-08-23T17:44:59Z", GoVersion:"go1.19", Compiler:"gc", Platform:"darwin/arm64"}
Kustomize Version: v4.5.7
```

자주 사용하는 커맨드이므로 다음과 같이 alias와 자동 완성 설정을 해두면 편리합니다.

- `${HOME}/.zshrc`

```
alias k=kubectl

(.....)

# oh-my-zsh(https://ohmyz.sh) 사용자는 plugins에 kubectl을 추가하면 자동 완성을 사용할 수 있습니다.
plugins=(
  # 기존 사용 중인 플러그인들 (git, fzf, asdf, bat, tmux, ...)
  kubectl
)
```

**Ubuntu 환경에 kubectl 설치**

우분투 환경은 [`snap`](https://snapcraft.io/docs) [패키지 관리자](https://snapcraft.io/docs)로 간편하게 설치할 수 있습니다.

```bash
$ sudo snap install kubectl --classic
```

설치 확인

```bash
$ kubectl version --client
```

```WARNING: This version information is deprecated and will be replaced with the output from kubectl version --short.  Use --output=yaml|json to get the full version.
Client Version: version.Info{Major:"1", Minor:"26", GitVersion:"v1.26.4", GitCommit:"f89670c3aa4059d6999cb42e23ccb4f0b9a03979", GitTreeState:"clean", BuildDate:"2023-04-14T02:14:23Z", GoVersion:"go1.19.8", Compiler:"gc", Platform:"linux/arm64"}
Kustomize Version: v4.5.7
```

자주 사용하는 커맨드이므로 다음과 같이 alias와 자동 완성 설정을 해두면 편리합니다.

```bash
$ sudo apt-get install bash-completion -y
$ echo 'alias k=kubectl' >> ~/.bashrc
$ echo 'complete -o default -F __start_kubectl k' >> ~/.bashrc
```

**Lens**

GUI 환경에서 쿠버네티스 클러스터를 제어하려면 [k9s](https://k9scli.io/), [Kubernetes Dashboard](https://kubernetes.io/docs/tasks/access-application-cluster/web-ui-dashboard/) 등 다양한 도구들이 있지만, 저는 [Lens](https://k8slens.dev/)를 사용하고 있습니다. Lens를 설치하면 `${HOME}/.kube/config` 설정 파일을 참고하여 쿠버네티스 GUI 사용 환경을 제공해 줍니다.


<!-- TODO: 이미지 추가 - 파일명: 스크린샷_2023-04-22_오후_4.37.03.png, 원본: https://www.notion.so/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fsecure.notion-static.com%2F3bfa34ce-11f9-4d78-9284-8919ada13e8a%2F%25E1%2584%2589%25E1%2585%25B3%25E1%2584%258F%25E1%2585%25B3%25E1%2584%2585%25E1%2585%25B5%25E1%2586%25AB%25E1%2584%2589%25E1%2585%25A3%25E1%2586%25BA_2023-04-22_%25E1%2584%258B%25E1%2585%25A9%25E1%2584%2592%25E1%2585%25AE_4.37.03.png?table=block&id=60125d72-bf41-4321-963f-4c3ad6cde182&cache=v2 -->

![그림 3-7. Lens 실행 화면]()


그림 3-7. Lens 실행 화면

> Lens 홈페이지: [https://k8slens.dev](https://k8slens.dev/)

#### 3.2.3 kind로 쿠버네티스 클러스터 생성


<!-- TODO: 이미지 추가 - 파일명: Untitled.png, 원본: https://www.notion.so/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fsecure.notion-static.com%2Fe7c3c3fa-31f5-4bf0-9ba8-6a0ea13094f8%2FUntitled.png?table=block&id=9cc0fb6e-0cf9-4d1f-a757-f1cb2d870ef0&cache=v2 -->

![그림 3-8. kind 아키텍처 (출처&gt; https://kind.sigs.k8s.io/docs/design/initial)]()


그림 3-8. kind 아키텍처 *(출처>* *[https://kind.sigs.k8s.io/docs/design/initial](https://kind.sigs.k8s.io/docs/design/initial/)**)*

`kind`는 도커 컨테이너를 "*노드*"로 사용하여 로컬 쿠버네티스 클러스터를 사용하기 위한 도구입니다. 로컬 개발 환경에서 쿠버네티스 테스트 및 CI용으로 많이 사용합니다. 여러 노드로 구성된 쿠버네티스 클러스터는 잠시 잊고, kind로 로컬 환경에 쿠버네티스 클러스터를 만들어 봅시다. kind를 사용하려면, 로컬 환경에 [docker](https://www.docker.com/)가 설치되어 있어야 합니다.

**macOS 환경에 kind 설치:**

```bash
$ brew install kind
```

**Ubuntu 환경에 kind 설치:**

```bash
$ curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.18.0/kind-linux-amd64
$ chmod +x ./kind
$ sudo mv ./kind /usr/local/bin/kind
```

`kind` CLI를 실행하여 설치가 제대로 되었는지 확인해 봅시다.

```bash
$ kind version
```

```kind v0.16.0 go1.19.1 darwin/arm64
```

**kind로 (로컬) 쿠버네티스 클러스터 생성하기**

```bash
$ kind create cluster
```

```Creating cluster "kind" ...
 ✓ Ensuring node image (kindest/node:v1.25.2) 🖼
 ✓ Preparing nodes 📦
 ✓ Writing configuration 📜
⢆⡱ Starting control-plane 🕹️
Set kubectl context to "kind-kind"
You can now use your cluster with:

kubectl cluster-info --context kind-kind

Have a question, bug, or feature request? Let us know! https://kind.sigs.k8s.io/#community 🙂
```

kind는 도커 컨테이너를 노드로 사용합니다. 실행 중인 도커 컨테이너를 확인해보면, `kind-control-plane` 컨테이너가 실행되고 있습니다.

```bash
$ docker ps
```

```CONTAINER ID   IMAGE                  COMMAND                  CREATED              STATUS              PORTS                       NAMES
870ca58fe6c3   kindest/node:v1.25.2   "/usr/local/bin/entr…"   About a minute ago   Up About a minute   127.0.0.1:54988->6443/tcp   kind-control-plane
```

클러스터 이름을 지정하려면 다음과 같이 `--name` 옵션을 추가 합니다.

```bash
$ kind create cluster --name local-k8s
```

kind 클러스터 목록 가져오기

```bash
$ kind get clusters
```

```kind
local-k8s
```

kind 클러스터 삭제

```bash
$ kind delete cluster
```

```Deleting cluster "kind" ...
```

`kubectl get all -A` 커맨드로 kind 클러스터에 기본 설치된 리소스를 확인해보면 다음과 같은 쿠버네티스 기본 파드, 서비스, 데몬셋이 동작하고 있는걸 확인할 수 있습니다.

```bash
$ kubectl get all -A
```

```NAMESPACE            NAME                                                  READY   STATUS    RESTARTS   AGE
kube-system          pod/coredns-565d847f94-f5cz7                          1/1     Running   0          3m21s
kube-system          pod/coredns-565d847f94-pr7q8                          1/1     Running   0          3m21s
kube-system          pod/etcd-local-k8s-control-plane                      1/1     Running   0          3m35s
kube-system          pod/kindnet-zfxgq                                     1/1     Running   0          3m21s
kube-system          pod/kube-apiserver-local-k8s-control-plane            1/1     Running   0          3m35s
kube-system          pod/kube-controller-manager-local-k8s-control-plane   1/1     Running   0          3m35s
kube-system          pod/kube-proxy-wc9n6                                  1/1     Running   0          3m21s
kube-system          pod/kube-scheduler-local-k8s-control-plane            1/1     Running   0          3m35s
local-path-storage   pod/local-path-provisioner-684f458cdd-n6pf6           1/1     Running   0          3m21s

NAMESPACE     NAME                 TYPE        CLUSTER-IP   EXTERNAL-IP   PORT(S)                  AGE
default       service/kubernetes   ClusterIP   10.96.0.1    <none>        443/TCP                  3m37s
kube-system   service/kube-dns     ClusterIP   10.96.0.10   <none>        53/UDP,53/TCP,9153/TCP   3m35s

NAMESPACE     NAME                        DESIRED   CURRENT   READY   UP-TO-DATE   AVAILABLE   NODE SELECTOR            AGE
kube-system   daemonset.apps/kindnet      1         1         1       1            1           <none>                   3m34s
kube-system   daemonset.apps/kube-proxy   1         1         1       1            1           kubernetes.io/os=linux   3m35s

NAMESPACE            NAME                                     READY   UP-TO-DATE   AVAILABLE   AGE
kube-system          deployment.apps/coredns                  2/2     2            2           3m35s
local-path-storage   deployment.apps/local-path-provisioner   1/1     1            1           3m33s

NAMESPACE            NAME                                                DESIRED   CURRENT   READY   AGE
kube-system          replicaset.apps/coredns-565d847f94                  2         2         2       3m21s
local-path-storage   replicaset.apps/local-path-provisioner-684f458cdd   1         1         1       3m21s
```

간단한 디플로이먼트를 kind 에 배포해 봅시다. nginx라는 가벼운 웹 서버를 3개의 복제본으로 배포하겠습니다:

```bash
$ echo "apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
  labels:
    app: nginx
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:1.14.2
        ports:
        - containerPort: 80" | kubectl apply -f -
```

```deployment.apps/nginx-deployment created
```

3개의 파드가 생성되어 잘 동작하고 있네요!

```bash
$ kubectl get pod
```

```NAME                                READY   STATUS    RESTARTS   AGE
nginx-deployment-7fb96c846b-hprbj   1/1     Running   0          58s
nginx-deployment-7fb96c846b-jnmhs   1/1     Running   0          58s
nginx-deployment-7fb96c846b-kq5fv   1/1     Running   0          58s
```

로컬 호스트의 8080 포트로 포트 포워딩을 한 뒤, 웹 브라우저에서 [`http://localhost:8080`](http://localhost:8080) 으로 접속하면 다음과 같은 웹 페이지를 확인 할 수 있습니다.

```bash
$ kubectl port-forward deployment/nginx-deployment 8080:80
```

```Forwarding from 127.0.0.1:8080 -> 80
Forwarding from [::1]:8080 -> 80
Handling connection for 8080
Handling connection for 8080
```


<!-- TODO: 이미지 추가 - 파일명: 스크린샷_2023-04-16_오후_9.00.44.png, 원본: https://www.notion.so/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fsecure.notion-static.com%2F497f4d4a-f24f-4c98-b490-4ae7e20190f1%2F%25E1%2584%2589%25E1%2585%25B3%25E1%2584%258F%25E1%2585%25B3%25E1%2584%2585%25E1%2585%25B5%25E1%2586%25AB%25E1%2584%2589%25E1%2585%25A3%25E1%2586%25BA_2023-04-16_%25E1%2584%258B%25E1%2585%25A9%25E1%2584%2592%25E1%2585%25AE_9.00.44.png?table=block&id=4f94a1d6-7e93-4d07-bb61-fa0ca91ea9d1&cache=v2 -->

![그림 3-9. nginx 초기 웹 페이지]()


그림 3-9. nginx 초기 웹 페이지

> kind에 대한 좀 더 많은 정보는 [https://kind.sigs.k8s.io](https://kind.sigs.k8s.io/) 를 참고하시기 바랍니다.

#### 3.2.4 운영체제 설치 - Ubuntu Server 22.04 LTS

쿠버네티스 클러스터 노드가 준비되었으면, 노드에 운영체제를 설치해야 합니다. 쿠버네티스 클러스터 노드의 운영체제는 리눅스 계열 배포판이면 어떤 것이든 상관 없지만 일반적으로 사용자 풀이 많다는 이유로 다음과 같은 운영체제가 많이 사용 됩니다.

- *Ubuntu, Debian*등의 Debian 계열 리눅스 배포판

- *CentOS/RHEL*등의 Redhat 계열 리눅스 배포판

- *SUSE 리눅스*

쿠버네티스에 필요한 소프트웨어만 설치되어 있는 경량 운영체제인 *RancherOS*와 *COS(Container-Optimized OS)*등의 전용 운영체제들도 있습니다만, 물리적 노드에 설치하기에는 적합하지 않습니다.

여러 운영체제 중에 우리는 [Ubuntu 22.04 Server](https://ubuntu.com/download/server) 운영체제를 사용하겠습니다. 이 후 쿠버네티스 노드에서 수행하는 내용은 모두 *Ubuntu 22.04 Server 환경*이라고 가정하겠습니다.

**OS 설치 미디어 (.iso 파일) 다운로드 및 OS 설치 디스크 준비 (로컬)**

공식 웹사이트(<https://ubuntu.com/download/server>)에서 우분투 서버 22.04 LTS ISO 이미지를 다운로드합니다. ISO 이미지를 USB 디스크에 구워 부팅 가능한 USB 드라이브를 만듭니다. 아래와 같이 터미널에서 `dd` 커맨드를 사용하거나 [etcher](https://www.balena.io/etcher)와 같은 프로그램을 사용하여 운영제체 ISO 이미지로 손쉽게 USB 설치 디스크를 만들 수 있습니다.

- `dd` 커맨드로 iso 이미지 굽기 예제 (*USB 디스크 장치 =* *`/dev/sdb`**)*

```bash
$ sudo dd if=ubuntu-22.04.2-live-server-amd64.iso of=/dev/sdb bs=4M
```

```357+1 records in
357+1 records out
1501102080 bytes (1.5 GB, 1.4 GiB) copied, 164.77 s, 9.1 MB/s
```

**BIOS/UEFI 설정 및 설치 디스크로 부팅**

OS를 설치하기 전에 USB 드라이브에서 부팅하도록 서버의 BIOS/UEFI 설정을 구성합니다. 필요에 따라 하드웨어 가상화 기능(Intel VT-x 또는 AMD-V)이 활성화되어 있는지 확인 합니다. *(가상화 레이어 사용시 옵션)*

USB 디스크로 부팅이 먼저 되도록 BIOS 설정이 되었다면, 부팅시 아래와 같은 화면이 나옵니다.


<!-- TODO: 이미지 추가 - 파일명: 스크린샷_2023-04-10_오전_2.33.40.png, 원본: https://www.notion.so/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fsecure.notion-static.com%2F6ce11af2-8bae-4955-8365-516fb8fbadd9%2F%25E1%2584%2589%25E1%2585%25B3%25E1%2584%258F%25E1%2585%25B3%25E1%2584%2585%25E1%2585%25B5%25E1%2586%25AB%25E1%2584%2589%25E1%2585%25A3%25E1%2586%25BA_2023-04-10_%25E1%2584%258B%25E1%2585%25A9%25E1%2584%258C%25E1%2585%25A5%25E1%2586%25AB_2.33.40.png?table=block&id=e62236ae-182b-4271-8d72-cb79339243d4&cache=v2 -->

![그림 3-10. 우분투 설치 디스크 부팅 화면]()


그림 3-10. 우분투 설치 디스크 부팅 화면

'*Try or Install Ubuntu Server*'를 선택하면 우분투 서버 설치를 시작합니다.

**우분투 서버 설치 과정**

💡

설치 화면 스크린샷과 함께 좀 더 자세한 내용은 우분투 공식 홈페이지 [Step-by-step 설치 가이드](https://ubuntu.com/server/docs/install/step-by-step)를 참고하세요.

아래와 같은 단계로 각 노드에 우분투 서버를 설치합니다.

1. **Select Language** → **English**

2. **Keyboard Layout** → **Enlish (US)**

3. **Select Installation Type** → **Ubuntu Server**

4. **Network connections → 고정 IP 설정**

1. 노드의 IP 주소가 변경되면 클러스터에서 노드를 감지하지 못하는 문제가 발생합니다.

5. **Configure proxy** → 공백

6. **Configure Ubuntu archive mirror → http://kr.ports.ubuntu.com/ubuntu-ports**

7. **Storage configuration** → **Use an entire disk**

1. 전체 디스크에 파티션이 자동 생성 됩니다. Confirm 창이 뜨면, **Continue**를 선택하면 디스크를 덮어씁니다.

8. **Profile setup**

1. Your name: 본인의 영문 이름. 저는 Taehun Kim.
2. **Your server’s name →** `control-plane-1` , `worker-node-1` 와 같이 노드의 이름 (hostname)을 설정합니다.
3. **Pick a username**: `mlops-admin` 등의 계정명
4. **Choose a password:** ***<계정 비밀번호>***
5. **Confirm your password:** ***<계정 비밀번호>***

9. **SSH Setup** → **Install OpenSSH server 체크**

10. **Featured Server Snaps** → 아무것도 선택하지 않음

여기까지 진행하면 우분투 서버 설치를 시작합니다. 설치가 완료되면 아래와 같은 화면이 나옵니다. USB 부트 디스크를 제거하고, **Reboot Now**를 선택하면 Ubuntu Server가 설치된 하드디스크로 부팅이 됩니다.


<!-- TODO: 이미지 추가 - 파일명: Untitled.png, 원본: https://www.notion.so/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fsecure.notion-static.com%2Fd2c06261-7938-4c4e-a60c-7a4fb4f43eeb%2FUntitled.png?table=block&id=af2261e0-b700-4f3d-8be3-291467e55b3b&cache=v2 -->

![그림 3-11. Ubuntu Server 설치 완료 화면]()


그림 3-11. Ubuntu Server 설치 완료 화면

설치가 완료되면 서버에 로그인하여 소프트웨어 패키지를 업데이트합니다:

```bash
$ sudo apt update && sudo apt upgrade -y
```


<!-- TODO: 이미지 추가 - 파일명: 스크린샷_2023-04-10_오전_4.03.14.png, 원본: https://www.notion.so/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fsecure.notion-static.com%2Fdf61a33c-3736-4ddf-a5ff-a2a2b7ac8e5d%2F%25E1%2584%2589%25E1%2585%25B3%25E1%2584%258F%25E1%2585%25B3%25E1%2584%2585%25E1%2585%25B5%25E1%2586%25AB%25E1%2584%2589%25E1%2585%25A3%25E1%2586%25BA_2023-04-10_%25E1%2584%258B%25E1%2585%25A9%25E1%2584%258C%25E1%2585%25A5%25E1%2586%25AB_4.03.14.png?table=block&id=b164e44b-e9ae-429c-8dfa-3d4cb72c2d96&cache=v2 -->

![그림 3-12. Ubuntu 패키지 업데이트]()


그림 3-12. Ubuntu 패키지 업데이트

스왑 메모리 사용을 하지 않도록 설정 합니다.

```bash
$ sudo swapoff -a
$ sudo vi /etc/fstab
```

```# 아래와 같은 스왑 파티션이 있으면 사용하지 않도록 커맨트 처리 합니다.
#/swap.img      none    swap    sw      0       0
```

많은 수의 노드에 운영 체제를 설치할 때는 이러한 수동 설치는 매우 비효율적입니다. UEFI의 [*PXE(Preboot eXecution Environment)*](https://en.wikipedia.org/wiki/Preboot_Execution_Environment)기능을 활용하여 네트워크 부팅을 하거나 [*autoinstall*](https://ubuntu.com/server/docs/install/autoinstall)으로상호 작용 없이 자동 설치를 할 수도 있습니다. 가상 머신 노드에는 [Vagrant](https://www.vagrantup.com/)와 같은 도구를 사용하여 가상 환경을 사전 생성하여 사용 할 수 있습니다.

#### 3.2.5 RKE2로 쿠버네티스 클러스터 생성


<!-- TODO: 이미지 추가 - 파일명: Untitled.png, 원본: https://www.notion.so/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fsecure.notion-static.com%2F9cee217a-60b1-4a46-a72e-e36573012679%2FUntitled.png?table=block&id=bf87d38b-bc4c-4e7a-91be-1d10d62a0e92&cache=v2 -->

![그림 3-13. RKE2 아키텍처 (출처&gt; https://docs.rke2.io/architecture)]()


그림 3-13. RKE2 아키텍처 *(출처>* *<https://docs.rke2.io/architecture>**)*

*RKE2(Rancher Kubernetes Engine 2)*는 Rancher Labs에서 설계하고 유지 관리하는 오픈소스 경량 쿠버네티스 배포판으로, 특히 중소규모의 쿠버네티스 클러스터에 맞춤화되어 있습니다. RKE2는 간단하고 안전한 모듈식 아키텍처를 제공하여 Kubernetes 클러스터의 배포, 관리, 운영을 간소화합니다. 사용자 친화적인 디자인 덕분에 사용자는 필수 기능이나 보안에 영향을 주지 않으면서도 클러스터를 빠르게 설정하고 구성할 수 있습니다.

RKE2 배포판은 Rancher의 다른 서비스와 통합되어 사용자가 다양한 환경에서 여러 쿠버네티스 클러스터를 쉽게 관리하고 모니터링할 수 있습니다. CIS 강화 및 자동화된 인증서 관리와 같은 기본 제공 보안 기능을 통해 RKE2는 소규모 클러스터도 필요한 보안 및 규정 준수 요구 사항을 충족할 수 있도록 보장합니다.

RKE2는 *<그림 3-13>*와 같이 쿠버네티스 컨트롤 플레인 역활을 하는 *서버 노드(Server Node)*와 워커 노드 역활을 하는 *에이전트 노드(Agent Node)*로 구성 됩니다.

**서버 노드 설정**

[https://get.rke2.io](https://get.rke2.io/)에 있는 설치 스크립트를 실행하여 RKE2를 설치합니다.

```bash
$ curl -sfL https://get.rke2.io | sudo sh -
```

`rke2-server` 서비스를 활성화 합니다. 이러면, 시스템 재시작시 rke2-server 서비스가 자동 실행 됩니다.

```bash
$ sudo systemctl enable rke2-server.service
```

로컬 환경에서 RKE2 클러스터에 접근하려면 `/etc/rancher/rke2/config.yaml` 설정 파일에 `tls-san` 항목에 서버 노드 IP 주소나 도메인 주소를 설정해야 합니다. RKE2는 이 설정의 도메인과 IP 주소에 해당하는 TLS 인증서를 생성 합니다.

```bash
$ sudo mkdir -p /etc/rancher/rke2/
$ sudo vi /etc/rancher/rke2/config.yaml
```

```tls-san:
  - 12.34.56.78
  - some.domain.com
```

`rke2-server` 서비스를 실행 합니다. 시스템 사양에 따라 다르지만 첫 실행은 1분 이상 소요 될 수 있습니다.

```bash
$ sudo systemctl start rke2-server.service
```

터미널을 하나 더 띄워서 `journalctl` 커맨드로 서비스 로그를 볼 수 있습니다.

```bash
$ journalctl -u rke2-server -f
```

서비스 시작이 완료되면 서비스 상태를 확인합니다. `Active: active (running)` 가 되어야 합니다.

```bash
$ systemctl status rke2-server
```

```● rke2-server.service - Rancher Kubernetes Engine v2 (server)
     Loaded: loaded (/usr/local/lib/systemd/system/rke2-server.service; enabled; vendor preset: enabled)
     Active: active (running) since Sat 2023-04-22 08:08:23 UTC; 14min ago
       Docs: https://github.com/rancher/rke2#readme
   Main PID: 683 (rke2)
      Tasks: 226
     Memory: 1.7G
        CPU: 1min 7.402s
     CGroup: /system.slice/rke2-server.service
             ├─  683 "/usr/local/bin/rke2 server"
             ├─ 1035 containerd -c /var/lib/rancher/rke2/agent/etc/containerd/config.toml -a /run/k3s/containerd/containerd.sock --state /run/k3s/containerd --root /var/lib/r>
             ├─ 1050 kubelet --volume-plugin-dir=/var/lib/kubelet/volumeplugins --file-check-frequency=5s --sync-frequency=30s --address=0.0.0.0 --alsologtostderr=false --ano>
             ├─ 1170 /var/lib/rancher/rke2/data/v1.24.12-rke2r1-47f4cbaf32c2/bin/containerd-shim-runc-v2 -namespace k8s.io -id b4e6ba180e426da72d4a8d6db1fcb0a693818708c29487f>
             ├─ 1171 /var/lib/rancher/rke2/data/v1.24.12-rke2r1-47f4cbaf32c2/bin/containerd-shim-runc-v2 -namespace k8s.io -id 99a438199ee01ab6b29d00f697bc7729f562e856604ef2a>
             ├─ 1172 /var/lib/rancher/rke2/data/v1.24.12-rke2r1-47f4cbaf32c2/bin/containerd-shim-runc-v2 -namespace k8s.io -id 6372320c82ac1f7007c7864f249378499cb6703e1c34241>
             ├─ 1173 /var/lib/rancher/rke2/data/v1.24.12-rke2r1-47f4cbaf32c2/bin/containerd-shim-runc-v2 -namespace k8s.io -id 9cd2bc3120bb9255b247b60d378180e2fa59c15f3ed6a06>
             ├─ 1221 /var/lib/rancher/rke2/data/v1.24.12-rke2r1-47f4cbaf32c2/bin/containerd-shim-runc-v2 -namespace k8s.io -id 6008134aded494785aa5edf8d0bd8786846cb3bf2105a6c>
             ├─ 1234 /var/lib/rancher/rke2/data/v1.24.12-rke2r1-47f4cbaf32c2/bin/containerd-shim-runc-v2 -namespace k8s.io -id d2c8eedda0172d348ae1d6c4b7d2c84879a2e3f0a443b12>
             ├─ 1907 /var/lib/rancher/rke2/data/v1.24.12-rke2r1-47f4cbaf32c2/bin/containerd-shim-runc-v2 -namespace k8s.io -id b1ff89912935d6fc76b3260ee8f3b467bb21719de04373d>
             ├─ 2085 /var/lib/rancher/rke2/data/v1.24.12-rke2r1-47f4cbaf32c2/bin/containerd-shim-runc-v2 -namespace k8s.io -id aaf564afdc6e6f1f16a3769508e7291cdfd5576f476e412>
             ├─ 2095 /var/lib/rancher/rke2/data/v1.24.12-rke2r1-47f4cbaf32c2/bin/containerd-shim-runc-v2 -namespace k8s.io -id 545e6bd64fa37dd524a20e3995c030d1f2c29c58fa0a5d5>
             ├─ 2322 /var/lib/rancher/rke2/data/v1.24.12-rke2r1-47f4cbaf32c2/bin/containerd-shim-runc-v2 -namespace k8s.io -id 757180640984ee707c15338d4cf85e7bc898bd31c27ec1f>
             ├─ 2386 /var/lib/rancher/rke2/data/v1.24.12-rke2r1-47f4cbaf32c2/bin/containerd-shim-runc-v2 -namespace k8s.io -id aabad2bc793873c4859f44357b1093dd45a7ff3b4e24a38>
             ├─ 2841 /var/lib/rancher/rke2/data/v1.24.12-rke2r1-47f4cbaf32c2/bin/containerd-shim-runc-v2 -namespace k8s.io -id eec31e20e333064c2213b8773c53d4b03c373f8adb36484>
             ├─ 2849 /var/lib/rancher/rke2/data/v1.24.12-rke2r1-47f4cbaf32c2/bin/containerd-shim-runc-v2 -namespace k8s.io -id 3fb2fd28adb3d5e9355b8e721df5d45906ea4e5f3c0f762>
             └─19223 /var/lib/rancher/rke2/data/v1.24.12-rke2r1-47f4cbaf32c2/bin/containerd-shim-runc-v2 -namespace k8s.io -id 0fd96b7ec63d7e9cf9e4e184a697ce07051dc670d4022f7>

Apr 22 08:09:11 instance-1 rke2[683]: I0422 08:09:11.303956     683 event.go:294] "Event occurred" object="kube-system/rke2-coredns" fieldPath="" kind="HelmChart" apiVersion=>
Apr 22 08:09:11 instance-1 rke2[683]: I0422 08:09:11.304034     683 event.go:294] "Event occurred" object="kube-system/rke2-canal" fieldPath="" kind="HelmChart" apiVersion="h>
Apr 22 08:09:11 instance-1 rke2[683]: I0422 08:09:11.304058     683 event.go:294] "Event occurred" object="kube-system/rke2-ingress-nginx" fieldPath="" kind="HelmChart" apiVe>
Apr 22 08:09:11 instance-1 rke2[683]: time="2023-04-22T08:09:11Z" level=info msg="Starting rbac.authorization.k8s.io/v1, Kind=ClusterRoleBinding controller"
Apr 22 08:09:11 instance-1 rke2[683]: time="2023-04-22T08:09:11Z" level=info msg="Starting batch/v1, Kind=Job controller"
Apr 22 08:09:11 instance-1 rke2[683]: time="2023-04-22T08:09:11Z" level=info msg="Starting /v1, Kind=ConfigMap controller"
Apr 22 08:09:11 instance-1 rke2[683]: time="2023-04-22T08:09:11Z" level=info msg="Starting /v1, Kind=ServiceAccount controller"
Apr 22 08:09:11 instance-1 rke2[683]: I0422 08:09:11.619997     683 leaderelection.go:258] successfully acquired lease kube-system/rke2-etcd
Apr 22 08:09:11 instance-1 rke2[683]: time="2023-04-22T08:09:11Z" level=info msg="Starting managed etcd apiserver addresses controller"
```

**에이전트 노드 설정**

워커 노드로 사용할 노드들은 모두 에이전트 노드로 설정하여 사용 합니다.

[https://get.rke2.io](https://get.rke2.io/)에 있는 설치 스크립트를 실행하여 RKE2를 설치합니다. 설치시 `INSTALL_RKE2_TYPE` 환경 변수에 노드 타입을 `agent` 로 설정하여 실행 합니다.

```bash
$ curl -sfL https://get.rke2.io | INSTALL_RKE2_TYPE="agent" sudo sh -
```

`rke2-agent` 서비스를 활성화 합니다. 이러면, 시스템 재시작시 rke2-agent 서비스가 자동 실행 됩니다.

```bash
$ sudo systemctl enable rke2-agent.service
```

`rke2-agent` 서비스 설정 파일을 생성 합니다. 이 설정 파일에 서버 노드 주소와 토큰을 입력 합니다.

```bash
$ sudo mkdir -p /etc/rancher/rke2/
$ sudo vi /etc/rancher/rke2/config.yaml
```

```server: https://<server>:9345
token: <token from server node>
```

> *`token`**은 서버 노드의* *`/var/lib/rancher/rke2/server/node-token`* *파일에 저장되어 있습니다.*

`rke2-agent` 서비스를 실행 합니다.

```bash
$ sudo systemctl start rke2-agent.service
```

서비스 시작이 완료되면 서비스 상태를 확인합니다. `Active: active (running)` 가 되어야 합니다.

```bash
$ systemctl status rke2-agent
```

```● rke2-agent.service - Rancher Kubernetes Engine v2 (agent)
     Loaded: loaded (/usr/local/lib/systemd/system/rke2-agent.service; enabled; vendor preset: enabled)
     Active: active (running) since Sat 2023-04-22 09:41:45 UTC; 1min 14s ago
       Docs: https://github.com/rancher/rke2#readme
    Process: 453 ExecStartPre=/bin/sh -xc ! /usr/bin/systemctl is-enabled --quiet nm-cloud-setup.service (code=exited, status=0/SUCCESS)
    Process: 500 ExecStartPre=/sbin/modprobe br_netfilter (code=exited, status=0/SUCCESS)
    Process: 507 ExecStartPre=/sbin/modprobe overlay (code=exited, status=0/SUCCESS)
   Main PID: 515 (rke2)
      Tasks: 87
     Memory: 364.6M
        CPU: 5.746s
     CGroup: /system.slice/rke2-agent.service
             ├─ 515 /usr/local/bin/rke2 agent
             ├─ 551 containerd -c /var/lib/rancher/rke2/agent/etc/containerd/config.toml -a /run/k3s/containerd/containerd.sock --state /run/k3s/containerd --root /var/lib/ra>
             ├─ 564 kubelet --volume-plugin-dir=/var/lib/kubelet/volumeplugins --file-check-frequency=5s --sync-frequency=30s --address=0.0.0.0 --allowed-unsafe-sysctls=net.i>
             ├─ 660 /var/lib/rancher/rke2/data/v1.24.12-rke2r1-47f4cbaf32c2/bin/containerd-shim-runc-v2 -namespace k8s.io -id 7715c404b8b1b60254a9c7e403840822b5e9f6d26bafa579>
             ├─ 975 /var/lib/rancher/rke2/data/v1.24.12-rke2r1-47f4cbaf32c2/bin/containerd-shim-runc-v2 -namespace k8s.io -id f2aca623dc1a6fec94b893f61157f5bd4cf16d4e97614df7>
             ├─1073 /var/lib/rancher/rke2/data/v1.24.12-rke2r1-47f4cbaf32c2/bin/containerd-shim-runc-v2 -namespace k8s.io -id ff70054c44f80af1e6a323bd74ce5cb8a280e7482943d8f5>
             └─1166 /var/lib/rancher/rke2/data/v1.24.12-rke2r1-47f4cbaf32c2/bin/containerd-shim-runc-v2 -namespace k8s.io -id a64259f288260f50f2aa9418cb65ea252479f6d1f8d120cc>

Apr 22 09:41:45 instance-3 rke2[564]: Flag --logtostderr has been deprecated, will be removed in a future release, see https://github.com/kubernetes/enhancements/tree/master/>
Apr 22 09:41:45 instance-3 rke2[564]: Flag --pod-infra-container-image has been deprecated, will be removed in 1.27. Image garbage collector will get sandbox image informatio>
Apr 22 09:41:45 instance-3 rke2[564]: Flag --pod-manifest-path has been deprecated, This parameter should be set via the config file specified by the Kubelet's --config flag.>
Apr 22 09:41:45 instance-3 rke2[564]: Flag --read-only-port has been deprecated, This parameter should be set via the config file specified by the Kubelet's --config flag. Se>
Apr 22 09:41:45 instance-3 rke2[564]: Flag --resolv-conf has been deprecated, This parameter should be set via the config file specified by the Kubelet's --config flag. See h>
Apr 22 09:41:45 instance-3 rke2[564]: Flag --serialize-image-pulls has been deprecated, This parameter should be set via the config file specified by the Kubelet's --config f>
Apr 22 09:41:45 instance-3 rke2[564]: Flag --stderrthreshold has been deprecated, will be removed in a future release, see https://github.com/kubernetes/enhancements/tree/mas>
Apr 22 09:41:45 instance-3 rke2[564]: Flag --tls-cert-file has been deprecated, This parameter should be set via the config file specified by the Kubelet's --config flag. See>
Apr 22 09:41:45 instance-3 rke2[564]: Flag --tls-private-key-file has been deprecated, This parameter should be set via the config file specified by the Kubelet's --config fl>
Apr 22 09:41:57 instance-3 rke2[515]: time="2023-04-22T09:41:57Z" level=info msg="Tunnel authorizer set Kubelet Port 10250"
```

**로컬 환경 설정**

로컬 환경에서 `kubectl` 커맨드로 RKE2로 생성한 쿠버네티스 클러스터를 제어하려면, kubectl 설정 파일 (`${HOME}/.kube/config`)에 클러스터, 컨텍스트, 사용자 설정이 있어야 합니다. 각각의 kubectl 설정 파일 경로는 다음과 같습니다:

- 원본 kubectl 설정 파일 (RKE2 서버 노드): `/etc/rancher/rke2/rke2.yaml`

- 로컬 kubectl 설정 파일: `${HOME}/.kube/config`

로컬 kubectl 설정 파일에 RKE2 kubectl 설정을 추가 합니다.

```bash
$ vim ~/.kube/config
```

```clusters:
- cluster:
    certificate-authority-data: <원본 파일 내용 복사 & 붙여넣기>
    server: https://12.34.56.78:6443  # 원본 파일의 '127.0.0.1'를 RKE2 서버 노드 IP로 수정합니다.
  name: rke2-cluster  # 원본 파일의 'default'를 'rke2-cluster'로 수정 합니다.

(......)

contexts:
- context:
    cluster: rke2-cluster  # 원본 파일의 'default'를 'rke2-cluster'로 수정 합니다.
    user: rke2-user  # 원본 파일의 'default'를 'rke2-user'로 수정 합니다.
  name: rke2-context  # 원본 파일의 'default'를 'rke2-context'로 수정 합니다.

(......)

users:
- name: rke2-user # 원본 파일의 'default'를 'rke2-user'로 수정 합니다. 
  user:
    client-certificate-data: <원본 파일 내용 복사 & 붙여넣기>
    client-key-data: <원본 파일 내용 복사 & 붙여넣기>
```

이렇게 kubectl 설정 파일에 `clsuter`, `context`, `user` 를 추가하였으면, 아래와 같이 context를 변경하여 RKE2로 생성한 쿠버네티스 클러스터 정보를 확인 할 수 있습니다.

```bash
$ kubectl config set current-context rke2-context
$ kubectl get node
```

```NAME            STATUS                        ROLES                       AGE     VERSION
control-plane   Ready                         control-plane,etcd,master   26m     v1.24.12+rke2r1
worker-node-1   Ready                         <none>                      25m     v1.24.12+rke2r1
```

간단한 디플로이먼트를 rke2에 배포해 봅시다. nginx라는 가벼운 웹 서버를 3개의 복제본으로 배포하겠습니다:

```bash
$ echo "apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
  labels:
    app: nginx
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:1.14.2
        ports:
        - containerPort: 80" > nginx-deployment.yaml
$ kubectl apply -f nginx-deployment.yaml
```

배포된 디플로이먼트의 파드를 확인해보니, 하나는 `worker-node-1` 노드에 할당되어 실행되고, 두 개는 `control-plane` 노드에 할당되어 실행되고 있네요.

```bash
 $ kubectl get pod -o wide
NAME                                READY   STATUS        RESTARTS      AGE     IP           NODE            NOMINATED NODE   READINESS GATES
nginx-deployment-6595874d85-cw7gk   1/1     Running       0             14s     10.42.3.4    worker-node-1   <none>           <none>
nginx-deployment-6595874d85-rqpvj   1/1     Running       0             14s     10.42.2.14   control-plane   <none>           <none>
nginx-deployment-6595874d85-vzq5w   1/1     Running       0             14s     10.42.2.13   control-plane   <none>           <none>
```

아래와 같이 노드에 taint를 설정하여 쿠버네티스 일반적인 사용 사례와 같이 따라 컨트롤 플레인 노드에는 어플리케이션 파드를 스케쥴링 하지 않도록 할 수 있습니다.

```bash
$ kubectl taint nodes control-plane type=app:NoSchedule
```

배포된 디플로이먼트를 재배포하여 확인해보면 워커 노드에서만 파드가 실행되고 있습니다.

```bash
$ kubectl delete -f nginx-deployment.yaml
$ kubectl apply -f nginx-deployment.yaml
$ kubectl get pod -o wide
```

```NAME                                READY   STATUS        RESTARTS      AGE     IP           NODE            NOMINATED NODE   READINESS GATES
nginx-deployment-6595874d85-8bcrq   1/1     Running       0             54s     10.42.3.6    worker-node-1   <none>           <none>
nginx-deployment-6595874d85-cz9qg   1/1     Running       0             54s     10.42.3.7    worker-node-1   <none>           <none>
nginx-deployment-6595874d85-wdxpd   1/1     Running       0             54s     10.42.3.5    worker-node-1   <none>           <none>
```

> RKE2에 대한 좀 더 많은 정보는 [https://docs.rke2.io](https://docs.rke2.io/) 를 참고하시기 바랍니다.

#### 3.2.6 kubeadm으로 쿠버네티스 클러스터 생성

kubeadm은 쿠버네티스 클러스터를 설정하고 관리하는 프로세스를 간소화하기 위해 쿠버네티스 프로젝트에서 개발한 쿠버네티스 클러스터 생성 도구입니다. 이 도구는 컨트롤 플레인, etcd, 워커 노드 등 클러스터를 구성하는 다양한 구성 요소를 배포하고 구성하는 것과 관련된 많은 복잡성을 자동화합니다. kubeadm은 사용자에게 일관되고 간소화된 환경을 제공하여 다양한 규모와 토폴로지의 쿠버네티스 클러스터를 더 쉽게 생성 및 관리할 수 있도록 해줍니다.

kubeadm을 사용하여 클러스터를 생성하려면, 사용자는 먼저 필요한 구성 요소를 설정하고 클러스터 구성 정보를 생성하는 컨트롤 플레인 노드를 초기화해야 합니다. 이 작업이 완료되면 초기화 프로세스 중에 제공된 조인 명령을 실행하여 워커 노드를 추가할 수 있습니다. Kubeadm의 설계는 안전하고 확장 가능한 클러스터 운영을 보장하는 데 중점을 두고 있으며, TLS 부트스트래핑, RBAC, 구성 요소 업그레이드와 같은 기능을 제공합니다. 따라서 컨테이너 오케스트레이션 요구 사항을 관리할 수 있는 안정적이고 효율적인 방법을 찾는 신규 및 숙련된 쿠버네티스 사용자 모두에게 탁월한 선택이 될 수 있습니다.

**시스템 설정**

네트워크 브릿지 설정

```bash
$ sudo su -
# cat > /etc/sysctl.d/99-k8s-cri.conf <<EOF
net.bridge.bridge-nf-call-iptables=1
net.bridge.bridge-nf-call-ip6tables=1
net.ipv4.ip_forward=1
EOF
# sysctl --system
```

필요한 커널 모듈 로드 (`overlay`, `br_netfilter`)

```
# modprobe overlay; modprobe br_netfilter
# echo -e overlay\\nbr_netfilter > /etc/modules-load.d/k8s.conf
# reboot
```

****컨테이너 런타임 (containerd) 설치****

파드에서 컨테이너를 실행하기 위해 컨테이너 런타임을 설치합니다. 쿠버네티스는 [컨테이너 런타임 인터페이스](https://kubernetes.io/ko/docs/concepts/overview/components/#%ec%bb%a8%ed%85%8c%ec%9d%b4%eb%84%88-%eb%9f%b0%ed%83%80%ec%9e%84)
(CRI)를 사용하여 사용자가 선택한 컨테이너 런타임과 상호 작용 합니다. `containerd`를 컨테이너 런타임으로 사용하겠습니다.

```bash
$ sudo apt install -y containerd
```

systemd containerd 서비스 설치 확인

```bash
$ systemctl status containerd
```

```● containerd.service - containerd container runtime
     Loaded: loaded (/lib/systemd/system/containerd.service; enabled; vendor preset: enabled)
     Active: active (running) since Sun 2023-04-23 06:50:10 UTC; 4s ago
       Docs: https://containerd.io
    Process: 583 ExecStartPre=/sbin/modprobe overlay (code=exited, status=0/SUCCESS)
   Main PID: 585 (containerd)
      Tasks: 8
     Memory: 66.2M
        CPU: 143ms
     CGroup: /system.slice/containerd.service
             └─585 /usr/local/bin/containerd

Apr 23 06:50:10 control-plane containerd[585]: time="2023-04-23T06:50:10.488114166Z" level=info msg="Start subscribing containerd event"
Apr 23 06:50:10 control-plane containerd[585]: time="2023-04-23T06:50:10.488293656Z" level=info msg="Start recovering state"
Apr 23 06:50:10 control-plane containerd[585]: time="2023-04-23T06:50:10.488446701Z" level=info msg="Start event monitor"
Apr 23 06:50:10 control-plane containerd[585]: time="2023-04-23T06:50:10.488479559Z" level=info msg="Start snapshots syncer"
Apr 23 06:50:10 control-plane containerd[585]: time="2023-04-23T06:50:10.488497599Z" level=info msg="Start cni network conf syncer for defa>
Apr 23 06:50:10 control-plane containerd[585]: time="2023-04-23T06:50:10.488538222Z" level=info msg="Start streaming server"
Apr 23 06:50:10 control-plane containerd[585]: time="2023-04-23T06:50:10.489888713Z" level=info msg=serving... address=/run/containerd/cont>
Apr 23 06:50:10 control-plane containerd[585]: time="2023-04-23T06:50:10.490064256Z" level=info msg=serving... address=/run/containerd/cont>
Apr 23 06:50:10 control-plane containerd[585]: time="2023-04-23T06:50:10.490146
```

containerd 버전 확인

```bash
$ containerd --version
```

```containerd github.com/containerd/containerd 1.6.12-0ubuntu1~22.04.1
```

💡

시스템에 설치된 `containerd` 버전이 1.6.x 이전 버전이라면 아래와 같이 바이너리 파일에서 수동 설치해야 합니다. 이전 버전의 `containerd` 는 최신 kubeadm, kubelet과 호환되지 않습니다.

containerd 바이너리 파일을 다운로드 받아 설치 합니다.

```bash
$ wget https://github.com/containerd/containerd/releases/download/v1.6.2/containerd-1.6.2-linux-amd64.tar.gz
$ sudo tar Czxvf /usr/local containerd-1.6.2-linux-amd64.tar.gz
```

containerd systemd 서비스 파일도 추가하고, 서비스를 활성화 합니다.

```bash
$ wget https://raw.githubusercontent.com/containerd/containerd/main/containerd.service
$ sudo mv containerd.service /usr/lib/systemd/system/
$ sudo systemctl daemon-reload
$ sudo systemctl enable --now containerd
```

containerd 설정 파일을 생성하고, 설정을 변경합니다.

```bash
$ sudo mkdir -p /etc/containerd
$ containerd config default | sudo tee /etc/containerd/config.toml
$ sudo vi /etc/containerd/config.toml
```

- `/etc/containerd/config.toml`

```
[plugins."io.containerd.grpc.v1.cri"]
  ...
  sandbox_image = "registry.k8s.io/pause:3.9"

[plugins."io.containerd.grpc.v1.cri".containerd.runtimes.runc]
  ...
  [plugins."io.containerd.grpc.v1.cri".containerd.runtimes.runc.options]
    SystemdCgroup = true
```

→ `sandbox_image` , `SystemdCgroup` 수정

containerd 서비스를 재시작 합니다.

```bash
$ sudo systemctl restart containerd
```

**kubeadm 설치**

쿠버네티스 apt 리포지토리를 사용하는 데 필요한 패키지를 설치 합니다.

```bash
$ sudo apt install -y apt-transport-https ca-certificates curl
```

쿠버네티스 apt 리포지토리 공개키를 다운로드 합니다.

```bash
$ sudo curl -fsSLo /usr/share/keyrings/kubernetes-archive-keyring.gpg https://packages.cloud.google.com/apt/doc/apt-key.gpg
```

쿠버네티스 apt 리포지토리 추가하고, apt 패키지 목록을 업데이트 합니다.

```bash
$ echo "deb [signed-by=/usr/share/keyrings/kubernetes-archive-keyring.gpg] https://apt.kubernetes.io/ kubernetes-xenial main" | sudo tee /etc/apt/sources.list.d/kubernetes.list
$ sudo apt update
```

`kubeadm` , `kubelet`, `kubectl` 패키지를 설치 합니다. 설치가 완료되면 해당 패키지 버전을 고정 합니다.

```bash
$ sudo apt install kubelet kubeadm kubectl -y
$ sudo apt-mark hold kubelet kubeadm kubectl
```

패키지 설치 확인

```bash
$ kubectl version --client && kubeadm version
```

```WARNING: This version information is deprecated and will be replaced with the output from kubectl version --short.  Use --output=yaml|json to get the full version.
Client Version: version.Info{Major:"1", Minor:"27", GitVersion:"v1.27.1", GitCommit:"4c9411232e10168d7b050c49a1b59f6df9d7ea4b", GitTreeState:"clean", BuildDate:"2023-04-14T13:21:19Z", GoVersion:"go1.20.3", Compiler:"gc", Platform:"linux/amd64"}
Kustomize Version: v5.0.1
kubeadm version: &version.Info{Major:"1", Minor:"27", GitVersion:"v1.27.1", GitCommit:"4c9411232e10168d7b050c49a1b59f6df9d7ea4b", GitTreeState:"clean", BuildDate:"2023-04-14T13:20:04Z", GoVersion:"go1.20.3", Compiler:"gc", Platform:"linux/amd64"}
```

쿠버네티스 클러스터 기본 컨테이너 이미지를 가져 옵니다.

```bash
$ sudo kubeadm config images pull
```

```W0423 09:06:17.801914    9688 images.go:80] could not find officially supported version of etcd for Kubernetes v1.27.1, falling back to the nearest etcd version (3.5.7-0)
[config/images] Pulled registry.k8s.io/kube-apiserver:v1.27.1
[config/images] Pulled registry.k8s.io/kube-controller-manager:v1.27.1
[config/images] Pulled registry.k8s.io/kube-scheduler:v1.27.1
[config/images] Pulled registry.k8s.io/kube-proxy:v1.27.1
[config/images] Pulled registry.k8s.io/pause:3.9
[config/images] Pulled registry.k8s.io/etcd:3.5.7-0
[config/images] Pulled registry.k8s.io/coredns/coredns:v1.10.1
```

`kubeadm init` 커맨드를 실행하여 쿠버네티스 클러스터를 생성 합니다. (컨트롤 플레인 노드)

```javascript
$ sudo kubeadm init --pod-network-cidr=10.244.0.0/16
```

```[init] Using Kubernetes version: v1.27.1
[preflight] Running pre-flight checks
[preflight] Pulling images required for setting up a Kubernetes cluster
[preflight] This might take a minute or two, depending on the speed of your internet connection
[preflight] You can also perform this action in beforehand using 'kubeadm config images pull'
W0423 09:21:12.409065    1046 images.go:80] could not find officially supported version of etcd for Kubernetes v1.27.1, falling back to the nearest etcd version (3.5.7-0)
W0423 09:21:12.544199    1046 checks.go:835] detected that the sandbox image "registry.k8s.io/pause:3.6" of the container runtime is inconsistent with that used by kubeadm. It is recommended that using "registry.k8s.io/pause:3.9" as the CRI sandbox image.
[certs] Using certificateDir folder "/etc/kubernetes/pki"
[certs] Generating "ca" certificate and key
[certs] Generating "apiserver" certificate and key
[certs] apiserver serving cert is signed for DNS names [control-plane kubernetes kubernetes.default kubernetes.default.svc kubernetes.default.svc.cluster.local] and IPs [10.96.0.1 192.168.65.5]
[certs] Generating "apiserver-kubelet-client" certificate and key
[certs] Generating "front-proxy-ca" certificate and key
[certs] Generating "front-proxy-client" certificate and key
[certs] Generating "etcd/ca" certificate and key
[certs] Generating "etcd/server" certificate and key
[certs] etcd/server serving cert is signed for DNS names [control-plane localhost] and IPs [192.168.65.5 127.0.0.1 ::1]
[certs] Generating "etcd/peer" certificate and key
[certs] etcd/peer serving cert is signed for DNS names [control-plane localhost] and IPs [192.168.65.5 127.0.0.1 ::1]
[certs] Generating "etcd/healthcheck-client" certificate and key
[certs] Generating "apiserver-etcd-client" certificate and key
[certs] Generating "sa" key and public key
[kubeconfig] Using kubeconfig folder "/etc/kubernetes"
[kubeconfig] Writing "admin.conf" kubeconfig file
[kubeconfig] Writing "kubelet.conf" kubeconfig file
[kubeconfig] Writing "controller-manager.conf" kubeconfig file
[kubeconfig] Writing "scheduler.conf" kubeconfig file
[kubelet-start] Writing kubelet environment file with flags to file "/var/lib/kubelet/kubeadm-flags.env"
[kubelet-start] Writing kubelet configuration to file "/var/lib/kubelet/config.yaml"
[kubelet-start] Starting the kubelet
[control-plane] Using manifest folder "/etc/kubernetes/manifests"
[control-plane] Creating static Pod manifest for "kube-apiserver"
[control-plane] Creating static Pod manifest for "kube-controller-manager"
[control-plane] Creating static Pod manifest for "kube-scheduler"
[etcd] Creating static Pod manifest for local etcd in "/etc/kubernetes/manifests"
W0423 09:21:14.553046    1046 images.go:80] could not find officially supported version of etcd for Kubernetes v1.27.1, falling back to the nearest etcd version (3.5.7-0)
[wait-control-plane] Waiting for the kubelet to boot up the control plane as static Pods from directory "/etc/kubernetes/manifests". This can take up to 4m0s
[apiclient] All control plane components are healthy after 5.002558 seconds
[upload-config] Storing the configuration used in ConfigMap "kubeadm-config" in the "kube-system" Namespace
[kubelet] Creating a ConfigMap "kubelet-config" in namespace kube-system with the configuration for the kubelets in the cluster
[upload-certs] Skipping phase. Please see --upload-certs
[mark-control-plane] Marking the node control-plane as control-plane by adding the labels: [node-role.kubernetes.io/control-plane node.kubernetes.io/exclude-from-external-load-balancers]
[mark-control-plane] Marking the node control-plane as control-plane by adding the taints [node-role.kubernetes.io/control-plane:NoSchedule]
[bootstrap-token] Using token: u3fgqe.scjkkqpy3y1wa32p
[bootstrap-token] Configuring bootstrap tokens, cluster-info ConfigMap, RBAC Roles
[bootstrap-token] Configured RBAC rules to allow Node Bootstrap tokens to get nodes
[bootstrap-token] Configured RBAC rules to allow Node Bootstrap tokens to post CSRs in order for nodes to get long term certificate credentials
[bootstrap-token] Configured RBAC rules to allow the csrapprover controller automatically approve CSRs from a Node Bootstrap Token
[bootstrap-token] Configured RBAC rules to allow certificate rotation for all node client certificates in the cluster
[bootstrap-token] Creating the "cluster-info" ConfigMap in the "kube-public" namespace
[kubelet-finalize] Updating "/etc/kubernetes/kubelet.conf" to point to a rotatable kubelet client certificate and key
[addons] Applied essential addon: CoreDNS
[addons] Applied essential addon: kube-proxy

Your Kubernetes control-plane has initialized successfully!

To start using your cluster, you need to run the following as a regular user:

  mkdir -p $HOME/.kube
  sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
  sudo chown $(id -u):$(id -g) $HOME/.kube/config

Alternatively, if you are the root user, you can run:

  export KUBECONFIG=/etc/kubernetes/admin.conf

You should now deploy a pod network to the cluster.
Run "kubectl apply -f [podnetwork].yaml" with one of the options listed at:
  https://kubernetes.io/docs/concepts/cluster-administration/addons/

Then you can join any number of worker nodes by running the following on each as root:

kubeadm join 192.168.65.5:6443 --token u3fgqe.scjkkqpy3y1wa32p \
	--discovery-token-ca-cert-hash sha256:db0b82417ad151c665e9984a88747ffd54fdc7f93080603dc4e4f6c796741343
```

설치 완료후 출력된 가이드대로 kubectl CLI 사용을 위해 설정 파일을 복사해 옵니다. 아래에 있는 `kubeadm join` (……) 커맨드는 워커 노드를 추가할때 사용되므로, 다른곳에 복사해 둡니다.

```bash
$ mkdir -p $HOME/.kube
$ sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
$ sudo chown $(id -u):$(id -g) $HOME/.kube/config
```

쿠버네티스 클러스터 설치가 제대로 되었다면, 클러스터 정보는 다음과 같이 표시 됩니다.

```bash
$ kubectl cluster-info
```

```Kubernetes control plane is running at https://192.168.65.5:6443
CoreDNS is running at https://192.168.65.5:6443/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy

To further debug and diagnose cluster problems, use 'kubectl cluster-info dump'.
```

쿠버네티스 노드 상태를 확인해보면, NotReady 상태로 아직 파드를 실행할 수 없습니다.

```bash
$ kubectl get node
```

```NAME            STATUS   ROLES           AGE   VERSION
control-plane   NotReady    control-plane   26m   v1.27.1
```

`kubectl describe node` 로 확인해보면, 아직 클러스터 네트워크가 준비되지 않아서 그렇습니다. `Flannel` 네트워크 플러그인을 설치하여, 클러스터내 네트워크 사용이 가능하도록 해 줍니다.

```bash
$ kubectl apply -f https://raw.githubusercontent.com/flannel-io/flannel/master/Documentation/kube-flannel.yml
```

kubelet을 재시작하고 노드 상태를 확인해보면, Ready가 되어 있습니다.

```bash
$ sudo systemctl restart kubelet
$ kubectl get nodes
```

```NAME            STATUS   ROLES           AGE   VERSION
control-plane   Ready    control-plane   26m   v1.27.1
```

**워커 노드 추가**

컨트롤 플레인 노드 설정에 성공 하였으면, 워커 노드를 추가하는 것은 간단합니다. 컨트롤 플레인 노드와 동일하게 1. **시스템 설정, 2. 컨테이너 런타임 설치, 3. kubeadm 설치** (kubectl 패키지는 제외)까지 진행 한 뒤, `kubeadm init` 대신 `kubeadm join` 커맨드로 클러스터에 노드를 추가 합니다.

컨트롤 플레인 노드에서 `kubeadm init` 커맨드 실행 후 출력된 `kubeadm join` 커맨드를 워커 노드에서 복사 & 붙여넣기

```bash
$ kubeadm join 192.168.65.5:6443 --token u3fgqe.scjkkqpy3y1wa32p \
	--discovery-token-ca-cert-hash sha256:db0b82417ad151c665e9984a88747ffd54fdc7f93080603dc4e4f6c796741343
```

```[preflight] Running pre-flight checks
[preflight] Reading configuration from the cluster...
[preflight] FYI: You can look at this config file with 'kubectl -n kube-system get cm kubeadm-config -o yaml'
[kubelet-start] Writing kubelet configuration to file "/var/lib/kubelet/config.yaml"
[kubelet-start] Writing kubelet environment file with flags to file "/var/lib/kubelet/kubeadm-flags.env"
[kubelet-start] Starting the kubelet
[kubelet-start] Waiting for the kubelet to perform the TLS Bootstrap...

This node has joined the cluster:
* Certificate signing request was sent to apiserver and a response was received.
* The Kubelet was informed of the new secure connection details.

Run 'kubectl get nodes' on the control-plane to see this node join the cluster.
```

컨트롤 플레인 노드에서 `kubectl` 커맨드로 노드를 확인해보면, 워커 노드가 추가 되어 있습니다.

```bash
$ kubectl get nodes
```

```NAME            STATUS   ROLES           AGE   VERSION
control-plane   Ready    control-plane   55m   v1.27.1
worker-node-1   Ready    <none>          17m   v1.27.1
```

쿠버네티스 클러스터 설정이 완료되었으면, 앞서 했던 것과 마찬가지로 간단한 웹 어플리케이션을 배포해서 파드가 잘 실행되는지 확인해 보겠습니다.

```bash
$ echo "apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
  labels:
    app: nginx
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:1.14.2
        ports:
        - containerPort: 80" | kubectl apply -f -
```

```deployment.apps/nginx-deployment created
```

파드들이 워커 노드에 모두 할당되어 잘 실행되고 있네요!

```bash
$ kubectl get pod -o wide
NAME                               READY   STATUS    RESTARTS   AGE   IP           NODE            NOMINATED NODE   READINESS GATES
nginx-deployment-cbdccf466-8gghh   1/1     Running   0          7s    10.244.1.5   worker-node-1   <none>           <none>
nginx-deployment-cbdccf466-rkhvx   1/1     Running   0          7s    10.244.1.4   worker-node-1   <none>           <none>
nginx-deployment-cbdccf466-scrqn   1/1     Running   0          7s    10.244.1.6   worker-node-1   <none>           <none>
```

ℹ️

`kubeadm` 으로 쿠버네티스 클러스터를 생성하면, 쿠버네티스 표준 사용 사례에 따라 컨트롤 플레인 노드에는 어플리케이션 파드가 스케쥴링 되지 않습니다. 만약, 컨트롤 플레인 노드의 리소스도 어플리케이션에 사용하려면 아래와 같이 Taint 설정을 해제해야 합니다.

```bash
$ kubectl taint nodes --all node-role.kubernetes.io/control-plane-
```

> kubeadm에 대해 좀 더 많은 정보는 *[Bootstrapping clusters with kubeadm](https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/)*를 참고하시기 바랍니다.