+++
title = "제로부터 시작하는 MLOps 도구와 활용 - 4. 데이터 관리 (2/2)"
date = 2023-12-10
draft = false

[taxonomies]
tags = ['MLOps', 'Zero-to-MLOps']

[extra]
author = "김태훈"
toc = true
+++

> *‘제로부터 시작하는 MLOps 도구와 활용’* 시리즈 기사를 마지막으로 작성 했던 것이 거의 5개월 전이네요. 요즘은 MLOps 관련 업무를 하지 않아서, 솔직히 흥미가 많이 떨어졌습니다. 그래도 계획했던 내용들은 모두 마무리 짓고 싶습니다. 시간이 흘러 초기화되어 버린 내용들은 다시 예전 경험들을 곰곰이 떠올려보고, 최근 트렌드도 찾아보면서 ChatGPT와 함께 작성해 보겠습니다.

> *[**제로부터 시작하는 MLOps 도구와 활용 - 4. 데이터 관리 (1/2)**](https://blog.taehun.dev/from-zero-to-hero-mlops-tools-4-1)에서 이어지는 내용 입니다.*

## 4.2 데이터 버전 관리

데이터 버전 관리는 머신러닝 모델의 학습과 평가에 사용되는 데이터 세트의 변경을 추적하고 관리하는 과정으로, 재현성과 팀 협업의 효율성을 높이는 데 중요합니다. 머신러닝 모델은 동일한 코드에도 불구하고 사용된 데이터에 따라 다른 결과를 생성하기 때문에, 정확한 데이터 세트의 사용이 필수적입니다. 이를 위해 Git Large File Storage (LFS)나 Data Version Control (DVC) 같은 도구들이 데이터의 이력을 명확하게 파악하고, 필요에 따라 이전 버전으로 쉽게 되돌아갈 수 있도록 지원합니다.

### 4.2.1 데이터 버전 관리 개요

<p align="center">
<img src="https://img-src.io/i/taehun/from-zero-to-hero-mlops-tools-4-2/1.webp" alt="그림 4-10. 코드, 데이터, 모델의 버전 관리"><br>
<i>그림 4-10. 코드, 데이터, 모델의 버전 관리</i>
</p>

머신러닝 모델은 코드와 데이터의 조합에 의해 이루어집니다. 기존 소프트웨어와 달리 머신러닝 모델은 동일한 코드라도 학습 및 검증에 사용되는 데이터가 변경되면 다른 모델이 생성됩니다. 머신러닝 모델 버전 관리는 *‘5장. 머신러닝 모델 실험과 개발’* 에서 자세히 살펴보겠습니다. 이 장에서는 그 중 데이터 버전 관리만 중점적으로 살펴봅니다.

데이터 버전 관리는 머신러닝 모델의 학습과 평가에 사용되는 데이터 세트의 변경 사항을 추적하고 관리하는 과정을 의미합니다. 소프트웨어 개발에서 소스 코드의 버전을 관리하는 것과 유사한 방식으로, 데이터 버전 관리는 데이터 과학자와 엔지니어가 데이터의 이력을 명확하게 파악하고, 필요한 경우 이전 버전으로 쉽게 되돌아갈 수 있게 합니다.

데이터 버전 관리의 가장 큰 이점 중 하나는 **재현성** 입니다. 머신러닝 모델의 결과를 정확하게 재현하기 위해서는 모델을 훈련시킬 때 사용된 정확한 데이터 세트를 알아야 합니다. 데이터 버전 관리를 통해 어떤 데이터가 어떤 모델의 훈련에 사용되었는지 정확히 추적할 수 있습니다. 이는 실험의 결과가 데이터의 변경 사항에 의해 영향을 받지 않도록 보장합니다.

또한, 데이터 버전 관리는 팀 협업에도 중요합니다. 여러 사람이 동일한 프로젝트에서 작업할 때, 모든 팀원이 동일한 데이터 세트의 버전을 사용하고 있는지 확인하는 것이 중요합니다. 이를 통해 데이터의 일관성을 유지하고, 혼란이나 오류의 가능성을 줄일 수 있습니다.

이러한 데이터 버전 관리를 지원하기 위한 도구로는 *Git Large File Storage (LFS)* 나 *DVC (Data Version Control)* 같은 시스템이 있습니다. Git LFS는 대용량 파일을 효율적으로 관리할 수 있게 해주며, DVC는 데이터 세트의 버전 관리에 특화되어 있습니다. 이러한 도구들은 데이터의 변경 사항을 추적하고, 다양한 버전 간에 쉽게 전환할 수 있는 기능을 제공합니다.

### 4.2.2 Git LFS (Git Large File Storage)

*Git LFS (Git Large File Storage)* 는 기존 Git 저장소의 한계를 극복하기 위해 고안되었습니다. 일반적인 Git 저장소는 소스 코드와 같은 작은 파일을 효과적으로 관리할 수 있지만, 대용량 파일(예: 이미지, 비디오, 데이터 세트)을 처리하는 데는 적합하지 않습니다. 이러한 대용량 파일들은 저장소의 크기를 빠르게 증가시키며, Git의 성능을 저하시킬 수 있습니다.

Git LFS를 사용하면, 대용량 파일들이 실제로 저장소에 직접 저장되는 대신, 이들의 참조 링크만 저장소에 포함됩니다. 실제 파일들은 별도의 서버에 저장되며, 필요한 경우 이를 다운로드하여 사용할 수 있습니다. 이 접근 방식은 저장소의 크기를 크게 줄이고, Git의 성능을 유지하며, 데이터 버전 관리를 보다 효율적으로 만들어 줍니다.

머신러닝 프로젝트의 데이터 버전 관리에서 Git LFS은 특히 유용합니다. 머신러닝 프로젝트에서는 종종 대규모의 데이터 세트와 모델 파일이 사용되며, 이러한 파일들을 효율적으로 관리하고 버전 관리하는 것은 프로젝트의 성공에 중요합니다. Git LFS를 통해, 개발자들은 대용량 데이터 파일들의 버전을 손쉽게 관리할 수 있으며, 필요한 버전의 데이터를 쉽게 추출하고 사용할 수 있습니다.

**Git LFS 설치**

Git LFS를 사용하려면 Git과 별도로 패키지를 다운로드하여 설치해야 합니다.

- *macOS*

```bash
brew install git-lfs
```

- *Linux (Debian/Ubuntu)*

```bash
sudo apt install git-lfs
```

**Git LFS 설정**

사용자 계정에 대한 Git LFS를 설정합니다 (사용자 계정당 한 번만 실행):

```bash
git lfs install
```

결과

<p align="center">
<img src="https://img-src.io/i/taehun/from-zero-to-hero-mlops-tools-4-2/2.webp?w=800" alt="git lfs install 결과">
</p>

Git LFS를 사용하려는 각 Git 저장소에서 Git LFS가 관리할 파일 유형을 설정합니다 (또는 `.gitattributes` 설정 파일을 직접 편집).

```bash
git lfs track "*.petastorm" "*.tfrecord" "*.csv" "*.parquet"
git add .gitattributes
git commit -m "Enable Git LFS for the dataset file"
cat .gitattributes
```

결과

<p align="center">
<img src="https://img-src.io/i/taehun/from-zero-to-hero-mlops-tools-4-2/3.webp?w=800" alt="git lfs track 결과">
</p>

**Git LFS 사용**

추가나 변경된 데이터셋 파일을 기존 Git과 같이 추가하고 커밋합니다.

```bash
git add datasets/train.petastorm
git add datasets/val.petastorm
git commit -m "Add new train/val dataset"
```

결과

<p align="center">
<img src="https://img-src.io/i/taehun/from-zero-to-hero-mlops-tools-4-2/4.webp?w=800" alt="git lfs 사용 결과">
</p>

Git LFS를 사용하는 주요 장점은 기존 Git 방식 그대로 데이터 버전 관리를 수행할 수 있다는 점입니다. 사용자는 익숙한 Git 명령어와 워크플로를 유지하면서도 대용량 파일을 효과적으로 관리할 수 있습니다. 그러나, 한 가지 주요 제한 사항은 GitHub과 같은 원격 저장소에서는 용량 제한을 초과하는 파일을 추가할 수 없다는 점입니다. 이로 인해, 사용자는 대용량 파일을 관리하는 데 있어 추가적인 도구가 필요해 집니다.

### 4.2.3 DVC

<p align="center">
<img src="https://img-src.io/i/taehun/from-zero-to-hero-mlops-tools-4-2/5.gif" alt="그림 4-11. DVC 동작 방식"><br>
<i>그림 4-11. DVC 동작 방식 (출처> <a href="https://github.com/iterative/dvc">https://github.com/iterative/dvc</a>)</i>
</p>

*Data Version Control (DVC)* 는 데이터 버전 관리를 위한 강력한 오픈 소스 도구로, 특히 머신러닝과 데이터 과학 프로젝트에서 유용합니다. 기존의 Git 시스템을 확장하여 대용량 데이터 파일 및 머신러닝 모델의 버전 관리를 가능하게 하는 DVC는 Git과의 밀접한 통합을 통해 개발자에게 친숙한 환경을 제공합니다. 이 도구는 대용량 데이터 파일을 효과적으로 관리하면서도 저장소의 크기를 작게 유지할 수 있도록 메타데이터만을 Git 저장소에 저장하고, 실제 데이터 파일은 별도의 저장소에 보관합니다.

DVC의 또 다른 중요한 기능은 데이터 파이프라인의 버전 관리입니다. 머신 러닝 프로젝트의 여러 단계를 데이터 파이프라인으로 구성하고, 이를 통해 전체 프로젝트의 재현성과 투명성을 향상시킬 수 있습니다. 이러한 기능은 특히 복잡한 데이터 처리 및 모델 훈련 과정에서 유용합니다.

DVC는 Amazon S3, Google Cloud Storage, Azure Blob Storage 등 다양한 클라우드 기반 오브젝트 스토리지 뿐만 아니라, SSH, NFS 등의 원격 저장소와의 연동을 지원합니다. 이러한 범용성은 프로젝트의 유연성을 크게 향상시킵니다. 또한, 데이터 세트, 모델, 코드 등 프로젝트의 모든 요소의 버전을 관리함으로써 프로젝트의 재현성을 보장하고 팀원 간의 협업을 용이하게 합니다.

**DVC 설치**

- *macOS*

```bash
brew install dvc
```

- *Linux (Debian/Ubuntu)*

```bash
sudo wget https://dvc.org/deb/dvc.list -O /etc/apt/sources.list.d/dvc.list
wget -qO - https://dvc.org/deb/iterative.asc | gpg --dearmor > packages.iterative.gpg
sudo install -o root -g root -m 644 packages.iterative.gpg /etc/apt/trusted.gpg.d/
rm -f packages.iterative.gpg
sudo apt update
sudo apt install dvc
```

- *pip*

```bash
pip install dvc
```

**프로젝트 초기화**

`dvc init`을 실행하여 현재 작업 디렉터리를 DVC 프로젝트로 초기화합니다:

```bash
dvc init
```

결과

<p align="center">
<img src="https://img-src.io/i/taehun/from-zero-to-hero-mlops-tools-4-2/6.webp?w=800" alt="DVC 설치 확인">
</p>

Git 저장소에 DVC와 관련된 몇가지 설정 파일들이 추가 됩니다:

```bash
git status
```

결과

<p align="center">
<img src="https://img-src.io/i/taehun/from-zero-to-hero-mlops-tools-4-2/7.webp?w=800" alt="dvc init 결과">
</p>

생성된 DVC 설정 파일들을 커밋하면 DVC 사용 준비가 된 것 입니다.

```bash
git commit -m "Initialize DVC"
```

**데이터 추적**

초기화된 프로젝트 디렉토리 내에서 작업할 데이터를 선택해 보겠습니다. 여기서는 `data.xml` 파일 예시를 사용하지만, 텍스트나 바이너리 파일(또는 디렉토리)도 괜찮습니다. `dvc get` 명령어로 샘플 데이터를 가져옵니다:

```bash
dvc get https://github.com/iterative/dataset-registry get-started/data.xml -o data/data.xml
```

결과

<p align="center">
<img src="https://img-src.io/i/taehun/from-zero-to-hero-mlops-tools-4-2/8.webp?w=800" alt="dvc remote add 결과">
</p>

데이터 추적을 시작하려면 `dvc add` 명령어를 사용합니다:

```bash
dvc add data/data.xml
```

결과

<p align="center">
<img src="https://img-src.io/i/taehun/from-zero-to-hero-mlops-tools-4-2/9.webp?w=800" alt="dvc add 결과">
</p>

DVC는 추가된 파일에 대한 정보를 `data/data.xml.dvc`라는 특수한 .dvc 파일에 저장합니다. 이 작고 사람이 읽을 수 있는 (human-readable) 메타데이터 파일은 Git 추적을 위해 원본 데이터의 위치 표시자 역할을 합니다.

다음 명령을 실행하여 Git의 변경 내용을 추적합니다:

```bash
git add data/data.xml.dvc data/.gitignore
git commit -m "Add raw data"
```

결과

<p align="center">
<img src="https://img-src.io/i/taehun/from-zero-to-hero-mlops-tools-4-2/10.webp?w=800" alt="dvc push 결과">
</p>

데이터의 메타데이터는 소스 코드와 함께 Git으로 버전이 관리되고, `data/data.xml` 원본 데이터 파일은 `data/.gitignore`에 추가되어 추적하지 않습니다.

**저장 및 공유**

"remote"라고 하는 다양한 스토리지 시스템(원격 또는 로컬)에 DVC가 추적하는 데이터를 업로드할 수 있습니다. 간단하게 설명하기 위해 이 가이드에서는 로컬 파일 시스템의 디렉터리인 "local remote"을 사용하겠습니다.

데이터를 remote로 푸시하기 전에 `dvc remote add` 명령을 사용하여 remote을 설정해야 합니다:

```bash
mkdir /tmp/dvcstore
dvc remote add -d myremote /tmp/dvcstore
```

결과

<p align="center">
<img src="https://img-src.io/i/taehun/from-zero-to-hero-mlops-tools-4-2/11.webp?w=800" alt="DVC 메타 파일 git 커밋">
</p>

DVC remote의 가장 일반적인 사용 사례의 예는 Amazon S3 remote을 구성하는 것입니다:

```bash
dvc remote add -d storage s3://mybucket/dvcstore
```

이 작업을 수행하려면 액세스를 허용하도록 설정된 AWS 계정과 자격 증명이 필요합니다.

이제 remote 저장소가 설정되었으므로 `dvc push`를 실행하여 데이터를 업로드합니다:

```bash
dvc push
```

결과

<p align="center">
<img src="https://img-src.io/i/taehun/from-zero-to-hero-mlops-tools-4-2/12.webp?w=800" alt="dvc pull 결과">
</p>

**데이터 가져오기**

DVC 추적 데이터와 모델이 remote에 저장되면 필요할 때, 다른 곳에서 `dvc pull`을 사용하여 다운로드할 수 있습니다. 보통은 `git pull` 또는 `git clone` 후에 실행합니다.

```bash
dvc pull
```

결과

<p align="center">
<img src="https://img-src.io/i/taehun/from-zero-to-hero-mlops-tools-4-2/13.webp?w=800" alt="dvc checkout 결과">
</p>

**데이터 업데이트**

데이터 소스에서 더 많은 데이터가 추가 되었다고 가정해 보겠습니다. 데이터 세트의 내용을 두 배로 늘려서 시뮬레이션해 보겠습니다:

```bash
cp data/data.xml /tmp/data.xml
cat /tmp/data.xml >> data/data.xml
```

데이터가 변경되었으면 `dvc add`를 다시 실행하여 최신 버전을 추적합니다:

```bash
dvc add data/data.xml
```

결과

<p align="center">
<img src="https://img-src.io/i/taehun/from-zero-to-hero-mlops-tools-4-2/14.webp?w=800" alt="git diff 결과">
</p>

이제 `dvc push`를 실행하여 원격 저장소에 변경 사항을 업로드한 다음, `git commit`을 실행하여 변경 사항을 추적할 수 있습니다:

```bash
dvc push
git commit data/data.xml.dvc -m "Dataset updates"
```

결과

<p align="center">
<img src="https://img-src.io/i/taehun/from-zero-to-hero-mlops-tools-4-2/15.webp?w=800" alt="dvc diff 결과">
</p>

**데이터 버전 간 전환**

일반적으로 사용되는 워크플로우는 `git checkout`을 사용하여 브랜치를 전환하거나, 특정 .dvc 파일 리비전으로 체크아웃한 다음, `dvc checkout`으로 데이터를 워크스페이스에 동기화하는 것입니다. 아래는 이전 커밋으로 데이터를 되돌리는 예제 입니다:

```bash
git checkout HEAD~1 data/data.xml.dvc
dvc checkout
```

결과

<p align="center">
<img src="https://img-src.io/i/taehun/from-zero-to-hero-mlops-tools-4-2/16.webp?w=800" alt="dvc checkout 후 git checkout">
</p>

DVC는 데이터 버전 관리뿐만 아니라 데이터 파이프라인 구축, 실험 관리, 모델 관리 등의 다양한 기능을 제공합니다. 그러나 이러한 기능들에 대해서는 DVC 대신 다른 도구들을 사용할 계획입니다. 예를 들어, 데이터 파이프라인 구축에는 Airflow를, 실험 및 모델 관리에는 MLFlow를 활용할 예정입니다. 이는 각각의 영역에서 더 특화된 기능과 유연성을 제공하기 때문입니다.

> *DVC에 대한 좀 더 많은 정보는 [**DVC 공식 문서**](https://dvc.org/doc)를 참고하시기 바랍니다.*

## 4.3 피처 스토어 (Feature Store)

한 데이터 과학 팀이 있습니다. 이 팀은 여러 개의 머신러닝 프로젝트를 진행하고 있으며, 각 프로젝트마다 다양한 데이터 소스와 피처(특성)를 사용합니다. 초기에는 모든 것이 순조로워 보였습니다. 하지만 시간이 지나면서, 팀원들은 데이터의 일관성 유지, 피처의 재사용, 그리고 모델의 성능 관리에 어려움을 겪기 시작했습니다. 각 프로젝트마다 다르게 처리된 피처들로 인해, 팀은 중복 작업에 많은 시간을 소비하게 되었고, 모델 성능도 일관성이 떨어지는 문제가 발생했습니다.

이런 와중에 데이터 과학자는 모델 성능 향상을 위해 새로운 피처를 추가 하였습니다. 머신러닝 엔지니어는 데이터 과학자에게 전달받은 새 모델을 배포하였습니다. 얼마 뒤 서비스 장애가 발생합니다. 원인은 새 모델에 추가된 피처가 프로덕션 환경에는 제공되지 않기 때문이었습니다. 경영진은 서비스 장애로 인해 발생한 손실로 머신러닝 도입에 대해 의구심을 품기 시작합니다.

위와 같은 시나리오는 MLOps 도입전 머신러닝 프로젝트에서 매우 흔하게 볼 수 있는 시나리오 입니다. 초기의 머신러닝 프로젝트는 상대적으로 단순했으며, 데이터 과학자들이 개별적으로 피처를 생성하고 관리하는 것이 가능 했습니다. 하지만 머신러닝 기술의 발전과 함께 프로젝트의 규모와 복잡도가 증가하면서, 데이터와 피처 관리의 중요성이 부각되었습니다.

### 4.3.1 피처 스토어 개요

<p align="center">
<img src="https://img-src.io/i/taehun/from-zero-to-hero-mlops-tools-4-2/17.webp?w=800" alt="그림 4-12. 피처 스토어"><br>
<i>그림 4-12. 피처 스토어 (출처> <a href="https://www.featurestore.org/what-is-a-feature-store">https://www.featurestore.org/what-is-a-feature-store</a>)</i>
</p>

피처 스토어는 피처(특성) 데이터를 중앙화하여 관리하는 시스템입니다. 피처 스토어는 데이터 과학자와 머신러닝 엔지니어가 피처를 효과적으로 재사용하고 공유할 수 있는 환경을 제공합니다. 피처 스토어의 도입은 데이터 관리 프로세스를 표준화하고, 모델의 성능과 일관성을 향상시키는 데 중요한 역할을 합니다.

피처 스토어의 주요 기능으로는 중앙화된 피처 관리, 버전 관리 및 감사 추적, 실시간 및 배치 데이터 처리 등이 있습니다. 중앙화된 피처 관리를 통해 데이터의 일관성을 유지하며, 버전 관리는 모델의 성능 변화를 추적하는 데 도움을 줍니다. 또한, 피처 스토어는 실시간 데이터 스트리밍 처리와 배치 데이터 처리를 지원하여, 다양한 ML 애플리케이션에 적용할 수 있습니다. 이러한 기능들은 피처 스토어를 데이터 과학과 ML 프로젝트에서 필수적인 도구로 만들어 줍니다.

피처 스토어의 장점으로는 데이터 품질과 일관성 유지, 효율성 향상, 모델의 예측 정확도 개선 등이 있습니다. 데이터 품질 관리를 통해 모델의 정확성과 신뢰성을 높이고, 피처의 재사용을 통해 데이터 준비 시간을 줄일 수 있습니다. 이와 함께, 일관된 피처 세트의 사용은 모델 성능의 일관성을 보장하며, 팀 간 협업을 용이하게 합니다. 이러한 점들은 팀이 더 빠르고 효과적으로 높은 품질의 ML 모델을 개발하는 데 도움이 됩니다.

> **온라인 스토어 Vs. 오프라인 스토어**
>
> 피처 스토어는 여러 데이터 소스를 결합하여 모델의 피처로 전처리 합니다. 이때, 사용하는 주요 데이터 유형은 다음과 같습니다:
> - *배치 데이터*: 일반적으로 *데이터 레이크* 또는 *데이터 웨어하우스*에서 가져옵니다. 이는 모델에서 사용하기 위해 저장된 큰 데이터 덩어리이며 반드시 실시간으로 업데이트되는 것은 아닙니다.
> - *실시간 데이터*: 일반적으로 *스트리밍* 및 *로그 이벤트*에서 가져옵니다. 시스템에 기록된 이벤트와 같은 소스에서 지속적으로 제공되는 온라인 데이터입니다.
>
> 이러한 유형의 데이터는 피처 스토어 내부에서 결합되어 두 가지 유형의 스토어를 형성합니다:
>
> - *오프라인 스토어*: 데이터 과학자가 **모델 학습 파이프라인**에서 사용할 수 있는 피처의 과거 원본을 구축하는 데 사용됩니다. 오프라인 스토어는 배치 데이터의 전처리된 피처로 구성된 스토어입니다. 일반적으로 BIgQuery, Redshift, Snowflake 등의 데이터 웨어하우스에 저장되지만, S3, HDFS, PostgreSQL과 같은 다른 종류의 저장소도 사용할 수 있습니다.
> - *온라인 스토어*: 오프라인 스토어의 피처와 스트리밍 데이터 소스의 실시간 전처리 피처가 결합된 스토어 입니다. 이는 가장 최신의 정리된 피처 모음으로, **프로덕션 모델에 예측**을 위한 새로운 피처를 제공하는 데 사용합니다. 일반적으로 빠른 액세스를 위해 Redis, DynamoDB, SQLite와 같은 데이터베이스에 저장되지만, MySQL, PostgreSQL과 같은 다른 종류의 저장소도 사용할 수 있습니다.

### 4.3.2 Feast

<p align="center">
<img src="https://img-src.io/i/taehun/from-zero-to-hero-mlops-tools-4-2/18.png?w=800" alt="그림 4-13. FEAST 아키텍처"><br>
<i>그림 4-13. FEAST 아키텍처 (출처> <a href="https://feast.dev">https://feast.dev</a>)</i>
</p>

*Feast (**Fea**ture **St**ore)* 는 Gojek과 Google Cloud의 협력으로 개발되었으며, 데이터 과학자와 머신러닝 엔지니어가 피처 데이터를 효율적으로 관리하고 사용할 수 있도록 설계되었습니다.

Feast의 핵심은 다양한 데이터 소스로부터 추출된 피처를 중앙 집중화하여 관리하는 것입니다. 이는 데이터의 재사용성을 높이고 일관성 있는 데이터 관리를 가능하게 합니다. 또한, Feast는 피처의 버전을 관리할 수 있어, 모델의 성능 변화를 추적하고, 시간에 따른 데이터의 변화를 감지하는 데 유용합니다. 이는 모델의 효율성과 정확성을 크게 향상시킬 수 있는 기능입니다.

Feast는 실시간 데이터 스트리밍 처리와 배치 데이터 처리를 모두 지원합니다. 이를 통해, 다양한 유형의 ML 애플리케이션에서 요구하는 다양한 데이터 처리 요구사항을 충족할 수 있습니다. Feast의 이러한 유연성은 실시간 예측 모델부터 대규모 배치 처리 모델에 이르기까지 다양한 환경에 적용할 수 있게 해줍니다.

Feast는 확장성과 유연성 또한 강점입니다. 클라우드 환경과 온프레미스 환경 모두에서 동작할 수 있으며, 대용량 데이터와의 호환성을 가지고 있습니다. 이는 다양한 규모의 조직과 프로젝트에 적용할 수 있는 범용성을 의미합니다. 또한, Feast는 고성능의 프로덕션 환경에 적합하게 설계되었으며, 안정적인 데이터 서비스를 제공합니다. 이는 프로덕션 환경에서의 머신러닝 모델 운영에 큰 도움이 됩니다.

**1 단계. Feast 설치**

- pip

```bash
pip install feast
```

**2 단계. 피처 리포지토리 만들기**

`feast init` 명령어를 사용하여 새 피처 리포지토리를 부트스트랩합니다.

```bash
feast init some_ml_project
```

결과

<p align="center">
<img src="https://img-src.io/i/taehun/from-zero-to-hero-mlops-tools-4-2/19.webp?w=800" alt="스크린샷 19">
</p>

생성된 샘플 `feature_repo` 내용을 살펴보겠습니다.

- `data/` 샘플 데이터 parquet 파일이 포함되어 있습니다.

`example_repo.py` 에는 피처 정의 예제가 포함되어 있습니다.

```python
# 다음은 피처 정의 파일 예시입니다.
from datetime import timedelta

import pandas as pd

from feast import (
    Entity,
    FeatureService,
    FeatureView,
    Field,
    FileSource,
    PushSource,
    RequestSource,
)
from feast.on_demand_feature_view import on_demand_feature_view
from feast.types import Float32, Float64, Int64

# 드라이버의 엔티티를 정의합니다. 엔티티는 피처을 가져오는데 사용되는 기본키라고 생각하면 됩니다.
driver = Entity(name="driver", join_keys=["driver_id"])

# parquet 파일에서 데이터를 읽습니다. parquet 파일은 로컬 개발시 편리합니다.
# 프로덕션의 경우 BigQuery와 같은 데이터 웨어하우스를 사용할 수 있습니다. 자세한 내용은 Feast 문서를 참조하세요.
driver_stats_source = FileSource(
    name="driver_hourly_stats_source",
    path="/Users/taehun/Projects/some_ml_project/feature_repo/data/driver_stats.parquet",
    timestamp_field="event_timestamp",
    created_timestamp_column="created",
)

# parquet 파일에는 driver_id 컬럼, timestamp 및 3개의 피처 컬럼이 포함된 샘플 데이터가 포함되어 있습니다.
# 여기에서는 이 데이터를 온라인으로 모델에 제공할 수 있는 FeatureView를 정의합니다.
driver_stats_fv = FeatureView(
    # 이 FeatureView의 고유 이름입니다. 단일 프로젝트에서 중복될 수 없습니다.
    name="driver_hourly_stats",
    entities=[driver],
    ttl=timedelta(days=1),
    # 아래에 정의된 피처 목록은 스토어에 피처를 구체화하는 스키마 역할을 하며,
    # 학습 데이터 세트 구축 또는 피처 서빙을 위한 검색시 참조로 사용됩니다.
    schema=[
        Field(name="conv_rate", dtype=Float32),
        Field(name="acc_rate", dtype=Float32),
        Field(name="avg_daily_trips", dtype=Int64, description="Average daily trips"),
    ],
    online=True,
    source=driver_stats_source,
    # 태그는 각 FeatureView에 붙는 사용자 정의 키/값 쌍입니다.
    tags={"team": "driver_performance"},
)

# 요청 시점에만 사용할 수 있는 기능/정보를 인코딩하는 RequestSource 정의(예: 사용자가 시작한 HTTP 요청의 일부)
input_request = RequestSource(
    name="vals_to_add",
    schema=[
        Field(name="val_to_add", dtype=Int64),
        Field(name="val_to_add_2", dtype=Int64),
    ],
)

# 기존 FeatureView 및 RequestSource를 기반으로 새 피처을 생성할 수 있는 온디맨드 FeatureView를 정의
@on_demand_feature_view(
    sources=[driver_stats_fv, input_request],
    schema=[
        Field(name="conv_rate_plus_val1", dtype=Float64),
        Field(name="conv_rate_plus_val2", dtype=Float64),
    ],
)
def transformed_conv_rate(inputs: pd.DataFrame) -> pd.DataFrame:
    df = pd.DataFrame()
    df["conv_rate_plus_val1"] = inputs["conv_rate"] + inputs["val_to_add"]
    df["conv_rate_plus_val2"] = inputs["conv_rate"] + inputs["val_to_add_2"]
    return df


# 피처을 모델 버전으로 그룹화합니다.
driver_activity_v1 = FeatureService(
    name="driver_activity_v1",
    features=[
        driver_stats_fv[["conv_rate"]],  # FeatureView에서 서브 피처 선택
        transformed_conv_rate,  # FeatureView에서 모든 피처 선택
    ],
)
driver_activity_v2 = FeatureService(
    name="driver_activity_v2", features=[driver_stats_fv, transformed_conv_rate]
)

# 오프라인, 온라인 또는 둘 다에서 사용할 수 있도록 데이터를 Feast로 푸시하는 방법을 정의합니다.
driver_stats_push_source = PushSource(
    name="driver_stats_push_source",
    batch_source=driver_stats_source,
)

# 소스가 푸시 소스로 변경된 위의 FeatureView의 약간 수정된 버전을 정의합니다. 
# 이렇게 하면 이 FeatureView에 대한 새로운 피처를 온라인 스토어에 직접 푸시할 수 있습니다.
driver_stats_fresh_fv = FeatureView(
    name="driver_hourly_stats_fresh",
    entities=[driver],
    ttl=timedelta(days=1),
    schema=[
        Field(name="conv_rate", dtype=Float32),
        Field(name="acc_rate", dtype=Float32),
        Field(name="avg_daily_trips", dtype=Int64),
    ],
    online=True,
    source=driver_stats_push_source,  # 위에서 변경됨
    tags={"team": "driver_performance"},
)

# 기존 FeatureView 및 RequestSource를 기반으로 새 피처을 생성할 수 있는 온디맨드 FeatureView를 정의
@on_demand_feature_view(
    sources=[driver_stats_fresh_fv, input_request],  # relies on fresh version of FV
    schema=[
        Field(name="conv_rate_plus_val1", dtype=Float64),
        Field(name="conv_rate_plus_val2", dtype=Float64),
    ],
)

def transformed_conv_rate_fresh(inputs: pd.DataFrame) -> pd.DataFrame:
    df = pd.DataFrame()
    df["conv_rate_plus_val1"] = inputs["conv_rate"] + inputs["val_to_add"]
    df["conv_rate_plus_val2"] = inputs["conv_rate"] + inputs["val_to_add_2"]
    return df

driver_activity_v3 = FeatureService(
    name="driver_activity_v3",
    features=[driver_stats_fresh_fv, transformed_conv_rate_fresh],
)
```

`feature_store.yaml` 파일은 피처 스토어의 주요 전체 아키텍처를 설정합니다.

```yaml
project: some_ml_project
# 기본적으로 registry는 파일이지만 확장성이 뛰어난 SQL-backend registry로 전환할 수 있습니다.
registry: data/registry.db
# provider는 주로 기본 오프라인/온라인 스토어를 지정하고 지정된 클라우드에 레지스트리를 저장합니다.
provider: local
online_store:
    type: sqlite
    path: data/online_store.db
entity_key_serialization_version: 2
```

- `provider`는 오프라인 및 온라인 스토어 공급자를 설정합니다. `feature_store.yaml`의 유효한 공급자 값은 다음과 같습니다:
- `local`: SQL 레지스트리 또는 로컬 파일 레지스트리를 사용합니다. 기본적으로 *파일/Dask 기반 오프라인 스토어 + SQLite 온라인 스토어*를 사용합니다.
- `gcp`: SQL 레지스트리 또는 GCS 파일 레지스트리를 사용합니다. 기본적으로 *BigQuery(오프라인 스토어) + Google Cloud 데이터스토어(온라인 스토어)*를 사용합니다.
- `aws`: SQL 레지스트리 또는 S3 파일 레지스트리를 사용합니다. 기본적으로 *Redshift(오프라인 스토어) + DynamoDB(온라인 스토어)*를 사용합니다.
- 커뮤니티 플러그인을 통해 Spark, Azure, Hive, Trino, PostgreSQL 등 Feast와 연동되는 다른 오프라인/온라인 스토어가 많이 있습니다. Feast 사용자 지정을 따라 사용자 지정 설정을 할 수도 있습니다.
- `offline_store`는 과거 데이터를 처리하기 위한 컴퓨팅 계층을 제공합니다 (학습 데이터 및 서비스용 피처 값 생성용).
- `online_store`는 최신 피처 값이 있는 지연 시간이 짧은 저장소입니다 (실시간 예측용).

`test_workflow.py`는 피처 정의, 검색, 푸시 등 모든 주요 Feast 명령을 실행하는 예제 입니다.

```python
import subprocess
from datetime import datetime

import pandas as pd
from feast import FeatureStore
from feast.data_source import PushMode


def run_demo():
    store = FeatureStore(repo_path=".")
    print("\n--- Run feast apply ---")
    subprocess.run(["feast", "apply"])

    print("\n--- Historical features for training ---")
    fetch_historical_features_entity_df(store, for_batch_scoring=False)

    print("\n--- Historical features for batch scoring ---")
    fetch_historical_features_entity_df(store, for_batch_scoring=True)

    print("\n--- Load features into online store ---")
    store.materialize_incremental(end_date=datetime.now())

    print("\n--- Online features ---")
    fetch_online_features(store)

    print("\n--- Online features retrieved (instead) through a feature service---")
    fetch_online_features(store, source="feature_service")

    print(
        "\n--- Online features retrieved (using feature service v3, which uses a feature view with a push source---"
    )
    fetch_online_features(store, source="push")

    print("\n--- Simulate a stream event ingestion of the hourly stats df ---")
    event_df = pd.DataFrame.from_dict(
        {
            "driver_id": [1001],
            "event_timestamp": [
                datetime.now(),
            ],
            "created": [
                datetime.now(),
            ],
            "conv_rate": [1.0],
            "acc_rate": [1.0],
            "avg_daily_trips": [1000],
        }
    )
    print(event_df)
    store.push("driver_stats_push_source", event_df, to=PushMode.ONLINE_AND_OFFLINE)

    print("\n--- Online features again with updated values from a stream push---")
    fetch_online_features(store, source="push")

    print("\n--- Run feast teardown ---")
    subprocess.run(["feast", "teardown"])


def fetch_historical_features_entity_df(store: FeatureStore, for_batch_scoring: bool):
    # 참고: 오프라인 스토어의 모든 엔티티에 대해 검색하는 방법에 대한 자세한 내용은
    # https://docs.feast.dev/getting-started/concepts/feature-retrieval을 참조하세요.
    entity_df = pd.DataFrame.from_dict(
        {
            # entity's join key -> entity values
            "driver_id": [1001, 1002, 1003],
            # "event_timestamp" (reserved key) -> timestamps
            "event_timestamp": [
                datetime(2021, 4, 12, 10, 59, 42),
                datetime(2021, 4, 12, 8, 12, 10),
                datetime(2021, 4, 12, 16, 40, 26),
            ],
            # (optional) label name -> label values. Feast does not process these
            "label_driver_reported_satisfaction": [1, 5, 3],
            # values we're using for an on-demand transformation
            "val_to_add": [1, 2, 3],
            "val_to_add_2": [10, 20, 30],
        }
    )
    # For batch scoring, we want the latest timestamps
    if for_batch_scoring:
        entity_df["event_timestamp"] = pd.to_datetime("now", utc=True)

    training_df = store.get_historical_features(
        entity_df=entity_df,
        features=[
            "driver_hourly_stats:conv_rate",
            "driver_hourly_stats:acc_rate",
            "driver_hourly_stats:avg_daily_trips",
            "transformed_conv_rate:conv_rate_plus_val1",
            "transformed_conv_rate:conv_rate_plus_val2",
        ],
    ).to_df()
    print(training_df.head())


def fetch_online_features(store, source: str = ""):
    entity_rows = [
        # {join_key: entity_value}
        {
            "driver_id": 1001,
            "val_to_add": 1000,
            "val_to_add_2": 2000,
        },
        {
            "driver_id": 1002,
            "val_to_add": 1001,
            "val_to_add_2": 2002,
        },
    ]
    if source == "feature_service":
        features_to_fetch = store.get_feature_service("driver_activity_v1")
    elif source == "push":
        features_to_fetch = store.get_feature_service("driver_activity_v3")
    else:
        features_to_fetch = [
            "driver_hourly_stats:acc_rate",
            "transformed_conv_rate:conv_rate_plus_val1",
            "transformed_conv_rate:conv_rate_plus_val2",
        ]
    returned_features = store.get_online_features(
        features=features_to_fetch,
        entity_rows=entity_rows,
    ).to_dict()
    for key, value in sorted(returned_features.items()):
        print(key, " : ", value)


if __name__ == "__main__":
    run_demo()
```

제공된 샘플 데이터는 차량 공유 앱에서 운전자의 시간별 통계를 보여줍니다.

```python
import pandas as pd
pd.read_parquet("data/driver_stats.parquet")
```


<p align="center">
<img src="https://img-src.io/i/taehun/from-zero-to-hero-mlops-tools-4-2/20.png?w=800" alt="스크린샷 20">
</p>


**3 단계. 샘플 워크플로 실행**

전체 샘플 워크플로우를 실행하는 `test_workflow.py` 파일이 포함되어 있습니다:

1. `feast apply` 명령어로 피처 정의 등록
2. 학습 데이터 세트 생성(`get_historical_features` 사용)
3. 배치 예측을 위한 피처 생성(`get_historical_features` 사용)
4. 온라인 스토어에 배치 피처 수집(`materialize_incremental` 사용)
5. 실시간 예측을 강화하기 위해 온라인 피처 가져오기(`get_online_features` 사용)
6. 오프라인/온라인 스토어에 스트리밍 피처 수집(푸시 사용)
7. 온라인 피처가 업데이트 되었는지/새로운 피처인지 확인

**3a 단계. 피처 정의 등록 및 피처 스토어 배포**

`feast apply` 명령은 현재 디렉터리에 있는 Python 파일에서 FeatureView/Entity 정의를 검색하고, Entity를 등록하고, 인프라를 배포합니다. 이 예제에서는 `example_repo.py`를 읽고 SQLite 온라인 스토어 테이블을 설정합니다. `feature_store.yaml`에서 online\_store를 구성하여 SQLite를 기본 온라인 스토어로 지정했음을 참고하세요.

```bash
feast apply
```

결과

<p align="center">
<img src="https://img-src.io/i/taehun/from-zero-to-hero-mlops-tools-4-2/21.webp?w=800" alt="스크린샷 21">
</p>

**3b 단계: 학습 데이터 생성 또는 일괄 예측 모델 강화하기**

모델을 학습하려면 피처와 라벨이 필요합니다. 이 라벨 데이터는 종종 별도로 저장됩니다(예: 사용자 설문조사 결과를 저장하는 테이블과 피처 값이 있는 다른 테이블 세트가 있는 경우). Feast는 이러한 라벨에 매핑되는 피처를 생성하는 데 도움을 줄 수 있습니다.
Feast에는 Entity 목록(예: 드라이버 ID)과 타임스탬프가 필요합니다. Feast는 관련 테이블을 지능적으로 조인하여 관련 피처 벡터를 생성합니다. 이 목록을 생성하는 방법에는 두 가지가 있습니다:

1. 사용자가 타임스탬프가 있는 라벨 테이블을 쿼리하고 이를 학습 데이터 생성을 위한 Entity 데이터 프레임으로 Feast에 전달할 수 있습니다.

2. 사용자가 Entity를 가져오는 SQL 쿼리로 해당 테이블을 쿼리할 수도 있습니다. 자세한 내용은 [피처 검색 문서](https://docs.feast.dev/getting-started/concepts/feature-retrieval)를 참조하세요.

타임스탬프를 포함하는 이유는 모델에서 다양한 타임스탬프의 동일한 드라이버에 대한 기능을 사용하기 위해서입니다.

- 학습 데이터 생성 (`gen_train_data.py`)

```python
from datetime import datetime
import pandas as pd

from feast import FeatureStore

# 참고: 오프라인 스토어의 모든 엔티티에 대해 검색하는 방법에 대한 자세한 내용은
# https://docs.feast.dev/getting-started/concepts/feature-retrieval을 참조하세요.
entity_df = pd.DataFrame.from_dict(
    {
        # entity의 조인 키 -> entity 값
        "driver_id": [1001, 1002, 1003],
        # "event_timestamp" (예약키) -> timestamps
        "event_timestamp": [
            datetime(2021, 4, 12, 10, 59, 42),
            datetime(2021, 4, 12, 8, 12, 10),
            datetime(2021, 4, 12, 16, 40, 26),
        ],
        # (optional) 라벨 이름 -> 라벨 값. Feast는 다음을 처리하지 않습니다.
        "label_driver_reported_satisfaction": [1, 5, 3],
        # 온디맨드 변환에 사용 중인 값
        "val_to_add": [1, 2, 3],
        "val_to_add_2": [10, 20, 30],
    }
)

store = FeatureStore(repo_path=".")

training_df = store.get_historical_features(
    entity_df=entity_df,
    features=[
        "driver_hourly_stats:conv_rate",
        "driver_hourly_stats:acc_rate",
        "driver_hourly_stats:avg_daily_trips",
        "transformed_conv_rate:conv_rate_plus_val1",
        "transformed_conv_rate:conv_rate_plus_val2",
    ],
).to_df()

print("----- Feature schema -----\n")
print(training_df.info())

print()
print("----- Example features -----\n")
print(training_df.head())
```

결과

<p align="center">
<img src="https://img-src.io/i/taehun/from-zero-to-hero-mlops-tools-4-2/22.webp?w=800" alt="스크린샷 22">
</p>

배치 예측을 실행하려면 기본적으로 `get_historical_features` 호출로 피처를 생성해야 하지만 현재 타임스탬프를 사용해야 합니다.

- 오프라인 예측 실행 (일괄 예측, `batch_inference.py`)

```python
# (...... 생략) -> 'gen_train_data.py' 내용과 동일

# 배치 예측은 현재 타임스탬프를 사용
entity_df["event_timestamp"] = pd.to_datetime("now", utc=True)

training_df = store.get_historical_features(
    entity_df=entity_df,
    features=[
        "driver_hourly_stats:conv_rate",
        "driver_hourly_stats:acc_rate",
        "driver_hourly_stats:avg_daily_trips",
        "transformed_conv_rate:conv_rate_plus_val1",
        "transformed_conv_rate:conv_rate_plus_val2",
    ],
).to_df()

print("\n----- Example features -----\n")
print(training_df.head())
```

결과

<p align="center">
<img src="https://img-src.io/i/taehun/from-zero-to-hero-mlops-tools-4-2/23.webp?w=800" alt="스크린샷 23">
</p>

**3c 단계: 온라인 스토어에 배치 피처 수집**

이제 서비스 제공을 준비하기 위해 초기부터 최신 피처 값을 직렬화합니다(참고: `materialize-incremental`은 마지막 `materialize` 호출 이후 모든 새로운 피처를 직렬화합니다).

```bash
CURRENT_TIME=$(date -u +"%Y-%m-%dT%H:%M:%S")
feast materialize-incremental $CURRENT_TIME
```

결과

<p align="center">
<img src="https://img-src.io/i/taehun/from-zero-to-hero-mlops-tools-4-2/24.webp?w=800" alt="스크린샷 24">
</p>

**3d 단계: 추론을 위한 특징 벡터 가져오기**

예측 시점에 온라인 피처 스토어에서 `get_online_features()`를 사용하여 다양한 드라이버의 최신 피처 값(배치 소스에만 존재했을 수 있음)을 빠르게 읽어야 합니다. 그런 다음 이러한 피처 벡터를 모델에 공급할 수 있습니다.

- `fetch_feature_vectors.py`

```python
from pprint import pprint
from feast import FeatureStore

store = FeatureStore(repo_path=".")

feature_vector = store.get_online_features(
    features=[
        "driver_hourly_stats:conv_rate",
        "driver_hourly_stats:acc_rate",
        "driver_hourly_stats:avg_daily_trips",
    ],
    entity_rows=[
        # {join_key: entity_value}
        {"driver_id": 1004},
        {"driver_id": 1005},
    ],
).to_dict()

pprint(feature_vector)
```

결과

<p align="center">
<img src="https://img-src.io/i/taehun/from-zero-to-hero-mlops-tools-4-2/25.webp?w=800" alt="스크린샷 25">
</p>

**3e 단계: 피처 서비스를 사용하여 온라인 피처 가져오기**

피처 서비스를 사용하여 여러 피처를 관리하고, FeatureView 정의와 최종 애플리케이션에 필요한 피처를 분리할 수도 있습니다. 피처 스토어는 아래의 동일한 API를 사용하여 온라인 또는 과거 피처를 가져오는 데에도 사용할 수 있습니다.

driver\_activity\_v1 피처 서비스는 driver\_hourly\_stats FeatureView에서 모든 피처를 가져옵니다:

- `feature_service.py`

```python
from pprint import pprint
from feast import FeatureStore

feature_store = FeatureStore('.')  # Initialize the feature store

feature_service = feature_store.get_feature_service("driver_activity_v1")
feature_vector = feature_store.get_online_features(
    features=feature_service,
    entity_rows=[
        # {join_key: entity_value}
        {
            "driver_id": 1001,
            "val_to_add": 1000,
            "val_to_add_2": 2000,
        },
        {
            "driver_id": 1002,
            "val_to_add": 1001,
            "val_to_add_2": 2002,
        },
    ],
).to_dict()

pprint(feature_vector)
```

결과

<p align="center">
<img src="https://img-src.io/i/taehun/from-zero-to-hero-mlops-tools-4-2/26.webp?w=800" alt="스크린샷 26">
</p>

**4단계: 웹 UI로 피처 탐색하기 (experimental)**

`feast ui` 명령어로 웹 UI로 등록된 모든 피처, 데이터 소스, 엔티티 및 피처 서비스를 볼 수 있습니다.

```bash
feast ui
```

→ 웹 브라우저에서 [`http://localhost:8888`](http://localhost:8888) 접속

<p align="center">
<img src="https://img-src.io/i/taehun/from-zero-to-hero-mlops-tools-4-2/27.webp?w=800" alt="스크린샷 27">
</p>

**5단계:** `test_workflow.py` **다시 검토하기**

`test_workflow.py` 코드를 다시 살펴보세요. 여기에는 Feast와 상호 작용하는 방법에 대한 많은 샘플 흐름이 나와 있습니다. 향후 개념 + 아키텍처 + 튜토리얼 페이지에서도 이러한 예시를 볼 수 있습니다.

> *Feast에 대한 좀 더 많은 정보는 [**Feast 공식 문서**](https://docs.feast.dev/)를 참고하시기 바랍니다.*

**Feast 장점**

- **중앙화된 피처 관리**: Feast는 데이터 소스에서 추출한 피처를 중앙 집중화하여 관리함으로써 데이터의 재사용성과 일관성을 높입니다.
- **피처 버전 관리**: Feast는 피처의 버전을 관리하므로 모델의 성능 변화를 추적하고, 시간에 따른 데이터의 변화를 감지하는 데 유용합니다.
- **실시간 및 배치 데이터 처리 지원**: Feast는 실시간 데이터 스트리밍 처리와 배치 데이터 처리를 지원하여, 다양한 유형의 머신러닝 애플리케이션에 적용할 수 있습니다.
- **확장성과 유연성**: 클라우드와 온프레미스 환경 모두에서 호환되며, 대용량 데이터와의 호환성을 제공합니다.
- **프로덕션 환경에 적합**: Feast는 고성능 프로덕션 환경에 적합하게 설계되어 안정적인 데이터 서비스를 제공합니다.

**Feast 단점**

- **설정과 사용의 복잡성**: Feast의 설정과 사용은 초보자에게 다소 복잡하게 느껴질 수 있으며, 이로 인해 초기 학습 곡선이 가파를 수 있습니다.
- **인프라 요구사항**: Feast는 특히 클라우드 환경에서 최적화되어 있으며, 이는 특정 인프라에 대한 의존성을 만들 수 있습니다.
- **커뮤니티와 지원**: 비교적 새로운 도구인 만큼, Feast의 사용자 커뮤니티와 지원 자료가 다른 잘 알려진 도구들에 비해 제한적일 수 있습니다.

### 4.3.3 기타 피처 스토어 도구들

| ㅤ | 설명 | 장점 | 적용 분야 |
| --- | --- | --- | --- |
| **Tecton** | Tecton은 엔터프라이즈급 피처 스토어로, 대규모 데이터와 실시간 피처 처리에 초점을 맞춘 관리형 서비스입니다. | 강력한 데이터 파이프라인 통합, 실시간 피처 서빙, 높은 확장성, 안정성. | 대기업 및 중대형 기업의 복잡한 머신러닝 프로젝트, 실시간 데이터 스트림 처리. |
| **Hopsworks** | Hopsworks는 데이터 과학 및 머신러닝을 위한 오픈 소스 데이터 플랫폼으로, 피처 스토어를 포함하고 있습니다. | 오픈 소스, Apache Spark와의 통합, 사용자 친화적인 UI, 다양한 데이터 소스 지원. | 데이터 과학 및 머신러닝 프로젝트, 대용량 데이터 처리, 다양한 데이터 소스의 통합. |
| **Feathr** | LinkedIn에서 개발된 오픈 소스 피처 스토어 | 피처 정의와 변환의 단순화, 대규모 분산 데이터 처리 지원, 오픈 소스 커뮤니티를 통한 확장성 및 유연성 제공 | 복잡한 머신러닝 파이프라인을 갖춘 조직, 대규모 데이터셋을 활용한 모델 개발, 다양한 데이터 소스를 통합하여 피처를 관리하고자 하는 기업 |
| **AWS Feature Store** | AWS에서 제공하는 관리형 피처 스토어 서비스로, Amazon SageMaker의 일부로 통합되어 있습니다. | AWS 인프라와의 원활한 통합, 관리 및 보안의 용이성, 높은 확장성. | AWS 환경에서의 머신러닝 모델 개발 및 배포, 대규모 데이터 세트 관리. |
| **Vertex AI Feature Store** | Google Cloud의 Vertex AI 플랫폼에 통합된 피처 스토어 서비스입니다. | Google Cloud의 통합 ML 플랫폼 내에서 실시간 및 배치 데이터 처리, 중앙화된 피처 관리, 확장성 및 보안 강화를 제공합니다 | Google Cloud 환경에서의 머신러닝 모델 개발 및 배포, 대규모 데이터 세트 관리. |
| **Databricks Feature Store** | Databricks Lakehouse 플랫폼에 통합된 피처 스토어로, 데이터와 머신러닝 워크플로우의 효율적인 관리를 지원 | 높은 통합성과 데이터 레이크하우스 아키텍처와의 원활한 연동, 실시간 및 배치 데이터 처리, 높은 확장성과 성능을 제공 | 대규모 데이터 처리가 필요한 머신러닝 프로젝트, 실시간 데이터 분석 및 예측, 복잡한 데이터 파이프라인을 가진 기업에서의 머신러닝 응용 프로그램 개발에 적합 |

## 4.4 데이터 버전 관리 Vs. 피처 스토어

데이터 버전 관리 도구와 피처 스토어는 유사해 보일 수 있지만, 각각의 목적과 필요성이 다릅니다. 일부 피처 스토어에 버전 관리 기능이 있음에도 불구하고, 데이터 버전 관리 도구를 사용해야 하는 이유가 있습니다. 이 두 도구는 서로 다른 역할을 수행하며, 각각 특정한 상황과 요구 사항에 적합합니다:

**데이터 버전 관리 도구가 필요한 경우**:

1. **데이터의 변화 추적**: 프로젝트에서 사용되는 데이터 세트가 지속적으로 업데이트되고 변화하는 경우, 이러한 변화를 정확하게 추적하기 위해 필요합니다.

2. **실험 재현성 보장**: 모델의 학습 및 평가를 위해 사용된 특정 데이터 세트의 버전을 기록함으로써, 실험의 재현성을 보장하고자 할 때 중요합니다.

3. **팀 협업 효율성**: 여러 사람이 동일한 데이터 세트를 사용하여 작업하는 경우, 모든 팀원이 동일한 데이터 세트의 버전을 사용하고 있는지 확인하는 데 도움이 됩니다.

**피처 스토어가 필요한 경우**:

1. **피처 관리의 중앙화**: 다양한 머신러닝 모델과 프로젝트에서 재사용 가능한 피처 세트를 중앙화하여 관리하고자 할 때 유용합니다.

2. **모델 성능 향상**: 일관된 피처 세트를 사용하여 모델의 성능과 일관성을 향상시키고자 할 때 필요합니다.

3. **실시간 및 배치 데이터 처리**: 실시간 데이터 스트리밍 처리와 배치 데이터 처리를 모두 지원하므로, 다양한 유형의 머신러닝 애플리케이션에 적용하고자 할 때 적합합니다.

데이터 버전 관리 도구는 데이터의 변화를 추적하고 실험의 재현성을 보장하는 데 중점을 두는 반면, 피처 스토어는 피처의 효율적인 관리와 재사용, 모델의 성능 향상에 초점을 맞추고 있습니다.

머신러닝 프로젝트 특성에 따라 적합한 도구를 선정해서 적용해야 합니다. 필자의 개인적인 경험에 의하면, 비정형 데이터를 사용하는 딥러닝 모델을 개발하는 프로젝트는 데이터 버전 관리 도구가 적합 했습니다. 반면에, 정형 데이터에서 피처 엔지니어링이 필요한 머신러닝 모델을 개발하는 프로젝트는 피처 스토어가 필요 했습니다.

## 4.5 요약

- **데이터 라벨링**은 원시 데이터에 의미 있는 태그를 부여해 머신러닝 모델 학습에 사용할 수 있도록 하는 과정입니다.
- **Label Studio**는 다양한 데이터 유형과 프로젝트를 지원하는 유연한 오픈 소스 데이터 라벨링 도구입니다.
- **데이터 버전 관리**는 머신러닝 모델의 학습과 평가에 사용되는 데이터 세트의 변경 사항을 추적하고 관리하는 과정으로, 재현성과 팀 협업의 효율성을 높이는 데 중요합니다.
- **Git LFS**는 대용량 파일을 Git 저장소에 포함 할 수 있도록 합니다. 원격 저장소 용량 제한에 따른 제약사항이 있습니다.
- **DVC**는 데이터 파일을 별도의 저장소에 보관하며 메타데이터만을 Git 저장소에 저장합니다.
- **피처 스토어**는 머신러닝 모델을 위한 피처(특성) 데이터를 중앙화하여 관리하는 시스템입니다.
- **Feast**는 중앙화된 피처 관리, 피처 버전 관리, 실시간 및 배치 데이터 처리를 지원하는 피처 스토어 도구입니다. 데이터 버전 관리와 피처 스토어의 효과적인 활용은 머신러닝 모델의 성능과 일관성을 향상시키는 데 기여합니다.
