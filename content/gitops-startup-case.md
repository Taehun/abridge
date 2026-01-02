+++
title = "초기 스타트업의 GitOps 적용기"
date = 2024-03-31
draft = false

[taxonomies]
tags = ['GitOps', 'ArgoCD']

[extra]
author = "김태훈"
toc = true
+++

회사에서 연구&개발에 관련된 다양한 업무를 하고 있지만, 그 중 DevOps 관련된 일을 많이 했습니다. 시리즈 A 규모의 초기 스타트업에서 GitOps를 적용한 과정을 정리해 보았습니다. 이 기사 내용은 실제 경험을 기반으로 작성 하였지만, 설명을 위해 일부 내용은 재구성하였습니다.

## 단계 0 - 직접 배포

<p align="center">
<img src="https://img-src.io/taehun/gitops-startup-case/1.png" alt="스크린샷">
</p>

저는 직접 경험하진 않았지만, 많은 초기 스타트업이 거쳐가는 과정이지 않나 생각합니다. 한/두명의 소수의 개발자가 GitHub에 원격 저장소를 생성하고, git으로 소스 코드 버전 관리만 합니다. 배포는 조립형 PC로 구축한 사내 서버에 개발자가 직접 배포합니다. Git 브랜치 전략이나 인프라 저장소 및 CI/CD는 없습니다.

## 단계 1 - Push-based 배포

<p align="center">
<img src="https://img-src.io/taehun/gitops-startup-case/2.png" alt="스크린샷">
</p>

서비스가 성장하면서 투자 유치에 성공하였습니다! 사업 확장을 위해 신규 개발 인력 채용을 하였습니다. 새로 합류한 개발 인력들은 서비스 안정성과 확장성을 위하여 클라우드 도입을 주장합니다. 회사는 클라우드 비용이 아직은 부담스럽지만, AWS 무료 크레딧과 클라우드 비용 지원 프로그램에 선정되어 클라우드 도입을 결정하였습니다. 클라우드내 서비스 배포 환경은 VM, AppRunner, Lambda, ECS등 여러 솔루션을 검토 해 본 결과, 사내 쿠버네티스 전문 인력도 있으니 EKS로 결정되었습니다.

CI/CD 워크플로우 도구는 [GitHub Action](https://github.com/features/actions)을 사용하였습니다. ECR Private 저장소에 push 권한을 가진 IAM Role을 생성하고, Github Action Secret에 *AWS\_ACCESS\_KEY\_ID*와 *AWS\_SECRET\_ACCESS\_KEY*를 등록하였습니다. DevOps 담당자는 ECR에 비공개 저장소를 생성하고, [쿠버네티스 Deployment YAML 파일](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)을 작성합니다. 그리고, 개발자가 GitHub 원격 저장소에 `main` 브랜치에 push 하게되면 Github Action 워크플로우가 실행되어 빌드된 컨테이너 이미지가 ECR에 배포됩니다.

ECR에 빌드된 컨테이너 이미지가 배포되면 `kubectl rollout restart deployment` 커맨드로 Pod을 재시작하여, EKS에 새 버전을 배포 합니다. Git 브랜치 전략은 변형된 [GitHub flow](https://docs.github.com/en/get-started/using-github/github-flow)을 사용하였으며, CI/CD는 GitHub Action, 아직 인프라 저장소는 없습니다.

## 단계 2 - 환경 분리와 Pull-based 배포

<p align="center">
<img src="https://img-src.io/taehun/gitops-startup-case/3.png" alt="스크린샷">
</p>

서비스에 기능이 하나씩 추가되고, 복잡도가 증가하면서, 모놀리딕 구조로는 서비스가 너무 비대해졌습니다. [마이크로서비스 아키텍처](https://cloud.google.com/learn/what-is-microservices-architecture?hl=ko)를 도입하여, 비대해진 서비스를 분리하기로 하였습니다. 한명의 개발자가 하나의 마이크로 서비스 개발을 담당하므로 개발 업무를 나누기도 편해졌습니다.

그런데, 다수의 마이크로 서비스로 분리하면서 서비스간 통신에 사용하는 스키마 불일치등으로 장애가 발생합니다. 더구나 서비스별로 GitHub 저장소도 분리되어 있어, 개발자는 통합 테스트의 어려움을 호소합니다. 더이상 로컬에서만 테스트 하는 것이 힘들어졌습니다.

온프레미스 환경에 Dev 환경을 구축하면서, 이 단계부터 본격적인 GitOps를 도입하였습니다. 회사의 여분의 PC 3대에 Ubuntu Server 22.04를 설치하고, [RKE2](https://docs.rke2.io/)로 쿠버네티스 클러스터를 프로비저닝하여 Dev 환경을 구축하였습니다. Dev 환경에 ArgoCD를 설치하여 Pull-based 배포를 적용합니다. 인프라 저장소에는 쿠버네티스 YAML 파일과 Terraform IaC 코드도 같이 관리합니다.

온프레미스 환경에서 ECR Private 저장소에서 컨테이너 이미지를 가져오려면, AWS ECR 인증이 필요합니다. 이를 위해 매 10분마다 ECR 토큰을 갱신하는 쿠버네티스 CronJob을 생성하였습니다.

Github Action의 CI/CD 워크플로우는 기존 push-based에 사용하던 kubectl rollout restart 단계를 제거하고, 인프라 저장소 코드를 수정하여 push하는 단계를 추가하였습니다. ECR에 컨테이너 이미지를 배포시에는 `github.sha` 값을 컨테이너 이미지 태그로 지정하고, 인프라 저장소의 YAML 파일의 이미지 태그 값을 수정후 push 합니다. 어플리케이션 원격 저장소에 인프라 저장소 push 권한을 부여하는 GitHub 토큰이 필요합니다.

프로덕션 환경으로 사용하는 AWS 인프라 배포는 통합 테스트와 QA가 완료되면, ArgoCD에서 수동으로 Sync 하여 배포합니다. Sync 정책과 배포 타겟이 다르므로 환경별로 ArgoCD 어플리케이션을 별도 생성하였습니다. Git 브랜치 전략은 변형된 [GitHub flow](https://docs.github.com/en/get-started/using-github/github-flow)에서 dev 환경 배포용으로 `develop` 브랜치를 추가하였습니다. CI/CD는 GitHub Action, 인프라 저장소가 추가 되었습니다.

## 단계 3 - GitOps 고도화

<p align="center">
<img src="https://img-src.io/taehun/gitops-startup-case/4.png" alt="스크린샷">
</p>

앞서 설정한 GitOps 설정으로 운영을 지속해왔습니다. 회사에서 프로젝트는 점점 늘어나고, Dev 환경 리소스는 점차 부족해져 갑니다. 클러스터 노드를 추가 하기에는 예산이 빠듯하여, Dev 환경 배포시에는 할당된 리소스(CPU, 메모리)를 줄이기로 하였습니다. 즉, 환경별로 달라지는 설정들이 생기기 시작하였습니다.

이러한 문제를 해결하기 위해, 인프라 저장소의 쿠버네티스 YAML 파일들은 Kustomize를 적용하였습니다. 공통된 설정은 `base` 폴더에 각각 YAML 파일들에 작성하고, 환경별 폴더 (`dev` , `prod`)에 달라지는 설정을 오버라이딩하여 사용합니다.

GitHub Action에서 인프라 코드를 직접 수정하는 단계도 [ArgoCD Image Updater](https://argocd-image-updater.readthedocs.io/en/stable/)를 사용하면서 제거 하였습니다. GitHub Action에서 ECR로 컨테이너 이미지를 푸쉬하면, ArgoCD Image Updater에서 이미지 변경을 감지하여, ArgoCD 어플리케이션을 업데이트 합니다. ECR Private 저장소이므로 ArgoCD Image Updater에서 ECR 접근 권한이 필요합니다. 아래와 같은 ConfigMap을 설정하였습니다.

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: argocd-image-updater-config
data:
  registries.conf: |
    registries:
    - name: ECR
      prefix: <AWS 계정>.dkr.ecr.<AWS 리즌>.amazonaws.com
      api_url: https://<AWS 계정>.dkr.ecr.<AWS 리즌>.amazonaws.com
      credentials: pullsecret:argocd/regcred
      insecure: no
      ping: yes
      default: true
      credsexpire: 11h
```

`pullsecret` 값은 쿠버네티스 CronJob에서 자동 갱신되는 `regcred` Secret 값 입니다.

Git 브랜치 전략은 기존 브랜치 전략에서 프로덕션 환경 Hotfix 대응하기 위해 `hotfix` 브랜치가 추가 되었습니다.

## Q&A

**Q. Staging 환경은 없나요?**

**A.** 프로젝트마다 다른데, 규모가 작은 프로젝트는 (초기 스타트업 특성상) 비용 절감을 위해 *Local, Dev, Prod* 환경만 운영합니다. 프론트엔드단에서 Prod 환경에 배포된 백엔드와 연동하여, 최종 QA 및 확장성 테스트를 위한 Staging 환경을 설정해서 쓰기도 합니다.

**Q. 처음부터 단계 3으로 하면 되지 않나요?**

**A.** 제 주요 담당 업무는 *‘MLOps와 머신러닝 엔지니어링’* 입니다. 지금 회사에서 하고 있는 프로젝트에 머신러닝 관련 업무가 많지 않고, 사내 DevOps 전문 인력이 없어서 어쩌다보니 DevOps도 같이 하고 있습니다. 그때그때 요구사항에 맞는 최소한으로 만들어 나가다보니 단계별 적용이 되었습니다.

**Q. GitOps하면서 생각나는 이슈들은 뭐가 있었나요?**

**A.** GitOps와 직접적으로 연관된 내용은 아니지만, AWS EKS 클러스터 설정은 매번 삽질을 하는 것 같습니다. AWS 웹 콘솔, `eksctl` 커맨드, `terraform apply` IaC등 다양한 방법으로 여러 EKS 클러스터를 프로비저닝 해봤는데, 매번 이슈가 있었습니다. (특히, IAM 권한 부여와 Karpenter나 CA와 같은 노드 자동 확장 설정)

나름 쿠버네티스에 익숙하다고 자부하고 있지만, 온프레미스 환경에서 쿠버네티스 클러스터 운영하는 것은 꽤나 고역입니다. 물리적 리소스 (CPU, 메모리, 스토리지)가 부족하면 단순히 노드나 HDD를 추가할 수 있는 여건이 되지 않습니다. 더이상 사용하지 않는 리소스를 찾아서 제거하거나 최적화해서 리소스를 확보해야 합니다. Dev 환경이지만 정전시 서비스 중단되는 것도 담당자 입장에선 스트레스가 상당하구요. Private ECR이나 GitHub 저장소 연동도 처음에는 꽤나 번거롭습니다. 스타트업은 빠른 개발과 배포가 중요하므로 초기에는 서버리스 솔루션을 사용하다가 서비스가 성장하고 개발팀 규모가 커지면 쿠버네티스 도입을 검토하시는 것을 추천합니다.

## 후기 및 결론

여러 이슈들이 있었지만 YAML 파일이나 HCL 문법으로 작성된 코드대로 인프라가 구성되고, 복잡한 마이크로 서비스들이 GitOps로 통합되어 테스트와 배포가 자동화하는 것은 꽤나 흥미롭습니다. 본문에 언급하진 않았지만, Kustomize 적용하기 전 Helm Chart로 인프라 코드를 관리했던 시절도 있었습니다. Helm Chart는 Helm 패키징도 해야하고 Helm 저장소등의 추가 리소스가 필요하여 인력이 부족하고 서비스 규모가 작은 스타트업에는 맞지 않는 것 같아 Kustomize로 변경하였습니다. GitOps 솔루션으로 ArgoCD 대신 [FluxCD](https://fluxcd.io/)를 검토했던 적도 있는데, 이미 ArgoCD 편의성에 적응을 해버린 상태라 검토만 하였습니다.

스타트업은 스타트업입니다. 네카라쿠베나 FAANG과 같은 빅테크 회사에서 사용하는 최신 기술과 아키텍처는 스타트업에 적용하기에는 오버엔지니어링이 될 확률이 높습니다. 예전 어떤 프로젝트에 참여하면서 거의 일주일간을 밤새 야근하면서 쿠버네티스 클러스터 노드 자동 확장 설정 및 Pod 커스텀 오토스케일러 적용하여, 비용 최적화된 1000만 사용자도 수용 가능한 확장성 있는 인프라를 구축하였습니다. 하지만, 서비스 출시후 활성 사용자가 10명도 채 되지 않아 한달뒤 서비스가 종료되었습니다. 아마 스타트업에서는 이런 일이 비일비재 할 것 입니다. 스타트업에서 처음 서비스를 만들어 가는 분이라면 뭔가 있어보이는 최신 기술 적용을 고민하기 전에 먼저 서비스 본질에 집중 하셨으면 좋겠습니다. 그러기 위한 서버리스 SaaS 솔루션등이 많이 있으니 최대한 그것을 활용하시면 좋겠습니다. (Vercel, Supabase, Firebase, Github, MongoDB Atlas, Confluent, Amplify, Huggingface 등등)
