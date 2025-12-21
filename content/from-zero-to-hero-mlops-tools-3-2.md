+++
title = "제로부터 시작하는 MLOps 도구와 활용 - 3. 컴퓨팅 인프라 - 쿠버네티스 (2/2)"
date = 2023-05-07
draft = false

[taxonomies]
tags = ['MLOps', 'Terraform', 'Ansible', 'Helm', 'ArgoCD']

[extra]
author = "김태훈"
toc = true
+++

> [제로부터 시작하는 MLOps 도구와 활용 - 3. 컴퓨팅 인프라 - 쿠버네티스 (1/2)](https://blog.taehun.dev/from-zero-to-hero-mlops-tools-3-1)에서 이어지는 글 입니다.

## 3.3 인프라 관리 자동화

이 절에서는 쿠버네티스 환경에서 널리 사용되는 몇가지 인프라 관리 자동화 도구들에 대해 소개합니다. 각 도구들의 주요 용도는 아래 *<표 3-4>*와 같습니다:

| 도구 | 용도 | 설명 |
| --- | --- | --- |
| **Ansible** | 서버(노드) 설정 자동화 및 선언형 관리 | Ansible은 오픈소스 자동화 도구로, 서버 구성을 선언형 언어로 기술하여 복잡한 시스템 구성 및 관리를 간소화합니다. |
| **Helm** | 쿠버네티스 패키지 관리 | Helm은 쿠버네티스 애플리케이션을 위한 패키지 관리자로, 차트라는 YAML 파일 모음을 사용하여 애플리케이션에 필요한 리소스를 기술하고 배포 및 관리를 단순화합니다. |
| **ArgoCD** | 선언형 GitOps 지속적 배포(CD) | ArgoCD는 쿠버네티스를 위한 선언형 GitOps 기반의 지속적 배포 도구로, 애플리케이션 배포를 간소화하고 자동화하여 환경 간 일관성을 보장합니다. |
| **Terraform** | 인프라 리소스 프로비저닝 | Terraform은 오픈소스 인프라 관리 도구로, HCL(HashiCorp Configuration Language)이라는 선언형 언어를 사용하여 여러 클라우드 제공 업체의 인프라 리소스를 정의하고 관리할 수 있습니다 |

*표 3-4. 쿠버네티스 환경 인프라 관리 도구들*

> *이 절에서 설명하는 모든 도구들은 로컬 환경에서 사용하는 도구들 입니다.*

### 3.3.1 Ansible

<p align="center">
<img src="https://img-src.io/taehun/from-zero-to-hero-mlops-tools-3-2/1.png?w=500" alt="그림 3-14. Ansible 구조"><br>
<i>그림 3-14. Ansible 구조 (출처> <a href="https://docs.ansible.com/ansible/latest/getting_started/index.html">https://docs.ansible.com/ansible/latest/getting_started/index.html</a>)</i>
</p>

‘[*3.2 쿠버네티스 클러스터 생성’*](https://blog.taehun.dev/from-zero-to-hero-mlops-tools-3-1#3-2-kubeonetiseu-keulreoseuteo-saengseong) 에서 Ubuntu Server가 설치된 노드를 기반으로 쿠버네티스 클러스터를 구축하는 과정을 소개하였습니다. 예를 들어, RKE2를 사용하여 쿠버네티스 클러스터를 구축할 경우, 먼저 Ubuntu Server가 설치된 노드에서 패키지를 최신으로 업데이트하고, 스왑 파티션을 비활성화하며, RKE2를 설치 및 설정하는 과정이 필요합니다. 클러스터의 노드 수가 많아질수록 이러한 과정을 모두 수동으로 하는 것은 매우 비효율적입니다.

Ansible은 서버 구성을 자동화하고 선언적으로 관리하기 위한 도구입니다. Ubuntu Server의 초기 설정부터 쿠버네티스 설정까지 Ansible을 사용하면, 노드가 증가하더라도 Ansible을 실행함으로써 자동으로 구성이 완료됩니다. 이를 통해 시스템 관리자는 대규모 클러스터의 구성과 관리에 걸리는 시간과 노력을 줄일 수 있습니다.

*<그림 3-14>* 의 Ansible 구조에서 각 구성 요소는 다음과 같은 역활을 합니다:

- *제어 노드 (Control node)*: Ansible이 설치된 시스템입니다. 제어 노드에서 `ansible` 또는 `ansible-inventory`와 같은 Ansible 명령을 실행합니다. 우리는 로컬 환경을 제어 노드로 사용 합니다.
- *관리 노드 (Managed node)*: Ansible이 제어하는 원격 시스템 또는 호스트입니다. 쿠버네티스 클러스터 설정 자동화에는 컨트롤 플레인 노드, 워커 노드가 관리 노드가 됩니다.
- *인벤토리 (Inventory)*: 논리적으로 구성된 관리되는 노드의 목록입니다. 제어 노드에서 인벤토리를 생성하여 Ansible에 대한 호스트 배포를 설명합니다.

**Ansible 설치 및 연결**

Python `pip` 패키지 관리자로 Ansible 패키지를 설치하면, Ansible이 설치 됩니다.

```bash
pip3 install --user ansible
```

MacOS 환경에서는 `brew` 로도 설치 할 수 있습니다.

```bash
brew install ansible
```

설치 확인

```bash
ansible --version
```

```output
ansible [core 2.14.5]
  config file = None
  configured module search path = ['/Users/taehun/.ansible/plugins/modules', '/usr/share/ansible/plugins/modules']
  ansible python module location = /Users/taehun/Library/Python/3.9/lib/python/site-packages/ansible
  ansible collection location = /Users/taehun/.ansible/collections:/usr/share/ansible/collections
  executable location = /Users/taehun/Library/Python/3.9/bin/ansible
  python version = 3.9.6 (default, Mar 10 2023, 20:16:38) [Clang 14.0.3 (clang-1403.0.22.14.1)] (/Library/Developer/CommandLineTools/usr/bin/python3)
  jinja version = 3.1.2
  libyaml = True
```

관리 노드 IP 주소를 `/etc/ansible/hosts` 에 추가하여 인벤토리를 생성 합니다. 아래 예시와 같이 `[`*`그룹명`*`]` 로 관리 노드의 그룹을 지정 할 수 있습니다.

- `/etc/ansible/hosts` 예시

```ini
[control_plane]
192.168.65.6

[worker_node]
192.168.65.7
```

인벤토리에서 호스트를 확인합니다.

```bash
ansible all --list-hosts
```

```output
hosts (2):
    192.168.65.6
    192.168.65.7
```

Ansible이 관리 노드에 연결할 수 있도록 SSH 연결을 설정합니다. SSH 공용키를 각 노드의 `${HOME}/.ssh/authorized_keys` 파일에 추가합니다.

```bash
$ SSH_PUBLIC_KEY=`cat ~/.ssh/id_ed25519.pub`
$ ansible all --list-hosts | awk 'FNR>=2' | xargs -I {} ssh taehun@{} "echo $SSH_PUBLIC_KEY >> ~/.ssh/authorized_keys"
taehun@192.168.65.6's password: <비밀번호 입력>
taehun@192.168.65.7's password: <비밀번호 입력>
$ unset SSH_PUBLIC_KEY
```

만약, 로컬 환경에 사전 생성된 SSH 공용키가 없으면, `ssh-keygen` 커맨드로 SSH 키를 생성해야 합니다.

```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```

모든 관리 노드에 ping을 보내 Ansible 연결을 확인 합니다.

```bash
ansible all -m ping
```

```output
192.168.65.7 | SUCCESS => {
    "ansible_facts": {
        "discovered_interpreter_python": "/usr/bin/python3"
    },
    "changed": false,
    "ping": "pong"
}
192.168.65.6 | SUCCESS => {
    "ansible_facts": {
        "discovered_interpreter_python": "/usr/bin/python3"
    },
    "changed": false,
    "ping": "pong"
}
```

**Ansible playbook으로 쿠버네티스 클러스터 생성 자동화**

Ansible playbook은 인벤토리에서 노드를 배포하고 구성하는 데 사용하는 YAML 형식의 자동화 청사진입니다.

예를 들어, 인벤토리의 모든 노드에 `apt update && apt upgrade` 를 수행하여 패키지를 최신으로 유지하려면 다음과 같은 playbook YAML 파일을 작성해서 실행합니다.

- `playbook.yml` 파일 예시

```yaml
- hosts: all
  become: yes
  tasks:
  - name: apt update && apt upgrade
    apt:
      update_cache: yes
      name: "*"
      state: latest
```

Ansible playbook 실행은 `ansible-playbook` 커맨드를 사용합니다. 실행시 작성한 playbook YAML 파일을 파라메터로 지정합니다. `sudo` 권한이 필요한 작업은 `-K` 옵션을 추가하여, sudo 계정의 비밀번호를 입력해야 합니다. (Ansible과 연결된 계정이 sudo 계정이어야 합니다.)

```bash
$ ansible-playbook playbook.yml -K
BECOME password: <sudo 계정 비밀번호>
```

```output
PLAY [all] *******************************************************************************

TASK [Gathering Facts] ***********************************************************************
ok: [192.168.65.6]
ok: [192.168.65.7]

TASK [apt update && apt upgrade] ***************************************************************
changed: [192.168.65.7]
changed: [192.168.65.6]

PLAY RECAP *******************************************************************************
192.168.65.6               : ok=2    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
192.168.65.7               : ok=2    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
```

자 이제 *'[3.2.5 RKE2로 쿠버네티스 클러스터 생성](https://blog.taehun.dev/from-zero-to-hero-mlops-tools-3-1#4232f94cb7e74de7bd41dd406d4cbd04)'* 에서했던 작업들을 Ansible playbook으로 정의 해보겠습니다. 각 노드에 Ubuntu Server 22.04 설치 후 RKE2로 쿠버네티스 클러스터를 설정하는 과정을 정리하면 다음과 같습니다:

**공통 작업**
1. 패키지 업데이트 → `apt update && apt upgrade`
2. 스왑 파티션 비활성화 → `swapoff -a`

**컨트롤 플레인 노드 작업**
1. RKE2 스크립트 다운로드 및 실행 → `curl sfL` `https://get.rke2.io` `| sudo sh -`
2. RKE2 설정 파일 생성 → `/etc/rancher/rke2/config.yaml`
3. RKE2 서버 Systemd 서비스 활성화 → `systemctl enable rke2-server.service`
4. RKE2 서버 Systemd 서비스 시작 → `systemctl start rke2-server.service`

**워커 노드 작업**
1. RKE2 스크립트 다운로드 및 실행 → `curl sfL` `https://get.rke2.io` `| INSTALL_RKE2_TYPE="agent" sudo sh -`
2. RKE2 설정 파일 생성 → `/etc/rancher/rke2/config.yaml` (*서버 IP/토큰 필요*)
3. RKE2 에이전트 Systemd 서비스 활성화 → `systemctl enable rke2-agent.service`
4. RKE2 에이전트 Systemd 서비스 시작 → `systemctl start rke2-agent.service`

이를 Ansible playbook으로 표현하면 다음과 같습니다.

- `playbook.yaml`

```yaml
- name: Common Tasks
  hosts: all
  become: yes
  tasks:
    - name: apt update && apt upgrade
      apt:
        update_cache: yes
        name: "*"
        state: latest
    - name: Disable SWAP
      shell: swapoff -a
    - name: Disable SWAP in fstab
      replace:
        path: /etc/fstab
        regexp: '^([^#].*?\sswap\s+sw\s+.*)$'
        replace: '# \1'

- name: Control Plane Tasks
  hosts: control_plane
  become: yes
  vars_files:
    - vars.yml
  tasks:
    - name: Download RKE2 install script
      get_url:
        url: https://get.rke2.io
        dest: /tmp/rke2.sh
        mode: 0755
    - name: Run RKE2 install script
      shell: sudo sh /tmp/rke2.sh
    - name: Create RKE2 configuration folder
      file:
        path: /etc/rancher/rke2
        state: directory
    - name: Generate RKE2 configuration file
      copy:
        dest: /etc/rancher/rke2/config.yaml
        content: |
          tls-san:
            - "{{ control_plane_ip }}"
    - name: Enable & start RKE2 server systemd service
      systemd:
        name: rke2-server
        enabled: true
        state: started
    - name: Read node-token from file
      slurp:
        path: "/var/lib/rancher/rke2/server/node-token"
      register: node_token
    - name: Store RKE2 server token
      set_fact:
        rke2_token: "{{ node_token.content | b64decode | regex_replace('\n', '') }}"

- name: Worker Node Tasks
  hosts: worker_node
  become: yes
  vars_files:
    - vars.yml
  tasks:
    - name: Download RKE2 install script
      get_url:
        url: https://get.rke2.io
        dest: /tmp/rke2.sh
        mode: 0755
    - name: Run RKE2 install script
      shell: INSTALL_RKE2_TYPE="agent" sudo sh /tmp/rke2.sh
    - name: Create RKE2 configuration folder
      file:
        path: /etc/rancher/rke2
        state: directory
    - name: Generate RKE2 configuration file
      copy:
        dest: /etc/rancher/rke2/config.yaml
        content: |
          server: "https://{{ control_plane_ip }}:9345"
          token: "{{ rke2_token }}"
    - name: Enable & start RKE2 agent systemd service
      systemd:
        name: rke2-agent
        enabled: true
        state: started
```

- `vars.yml`

```yaml
control_plane_ip: "{{ hostvars[groups['control_plane'][0]]['ansible_host'] | default(groups['control_plane'][0]) }}"
rke2_token: "{{ hostvars[groups['control_plane'][0]]['rke2_token'] }}"
```

각 워커 노드의 RKE2 에이전트 설정 파일에는 컨트롤 플레인의 IP 주소와 RKE2 토큰이 필요합니다. `vars.yml`  파일을 생성하여 이를 Ansible 변수로 추가 하였습니다. 이렇게 작성한 playbook YAML 파일로 Ansible playbook을 실행하면, 관리 노드들에 RKE2 설치 및 설정이 자동화되어 쿠버네티스 클러스터가 생성 됩니다.

```bash
$ ansible-playbook playbook.yml -K
BECOME password: <sudo 계정 비밀번호 입력>
```

```output
PLAY [Common Tasks] ******************************************************************************

TASK [Gathering Facts] ***************************************************************************
ok: [192.168.65.6]
ok: [192.168.65.7]

TASK [apt update && apt upgrade] *********************************************************************
ok: [192.168.65.6]
ok: [192.168.65.7]

TASK [Disable SWAP] ******************************************************************************
changed: [192.168.65.6]
changed: [192.168.65.7]

TASK [Disable SWAP in fstab] ***********************************************************************
ok: [192.168.65.6]
ok: [192.168.65.7]

PLAY [Control Plane Tasks] *************************************************************************

TASK [Gathering Facts] ***************************************************************************
ok: [192.168.65.6]

TASK [Download RKE2 install script] ******************************************************************
ok: [192.168.65.6]

TASK [Run RKE2 install script] ***********************************************************************
changed: [192.168.65.6]

TASK [Create RKE2 configuration folder] ****************************************************************
ok: [192.168.65.6]

TASK [Generate RKE2 configuration file] ****************************************************************
ok: [192.168.65.6]

TASK [Enable & start RKE2 server systemd service] ********************************************************
ok: [192.168.65.6]

TASK [Read node-token from file] *********************************************************************
ok: [192.168.65.6]

TASK [Store RKE2 server token] ***********************************************************************
ok: [192.168.65.6]

PLAY [Worker Node Tasks] ***************************************************************************

TASK [Gathering Facts] ***************************************************************************
ok: [192.168.65.7]

TASK [Download RKE2 install script] ******************************************************************
ok: [192.168.65.7]

TASK [Run RKE2 install script] ***********************************************************************
changed: [192.168.65.7]

TASK [Create RKE2 configuration folder] ****************************************************************
ok: [192.168.65.7]

TASK [Generate RKE2 configuration file] ****************************************************************
changed: [192.168.65.7]

TASK [Enable & start RKE2 agent systemd service] *********************************************************
changed: [192.168.65.7]

PLAY RECAP *************************************************************************************
192.168.65.6               : ok=12   changed=2    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
192.168.65.7               : ok=10   changed=4    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
```

이렇게 Ansible playbook 파일을 작성해 놓으면, 노드 대수와 관계 없이 Ubuntu Server 22.04가 기본 설치된 노드에서 *1) Ansible 연결을 위해 sudo 계정 SSH 공용키를 추가*하고, 2) *인벤토리 파일에 노드의 IP 주소를 추가*해서, 3) *`ansible-playbook`* *커맨드만 실행*하면 자동 설정되어 편리합니다.

Ansible playbook 파일의 크기가 커질수록 파일을 논리적인 단위로 분할하는 것이 좋습니다. Ansible은 이를 위해 [Role 단위로 playbook 파일을 분리](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_reuse_roles.html)할 수 있습니다. 예를 들어, 쿠버네티스 클러스터 생성을 위해 `common`, `control_plane`, `worker_node` 세 개의 Role로 분할할 수 있습니다. 이렇게 분할하면 코드 관리와 유지보수가 용이해지며, 코드 재사용성도 높아집니다.

> *Ansible에 대한 좀 더 많은 정보는 [Ansible Documentation](https://docs.ansible.com/ansible/latest/index.html) 문서를 참고하시기 바랍니다.*

### 3.3.2 Helm

Helm은 컨테이너화된 애플리케이션의 배포, 확장 및 관리를 자동화하도록 설계된 오픈소스 컨테이너 오케스트레이션 플랫폼인 쿠버네티스용 패키지 관리자로 널리 사용되고 있습니다. Helm은 리소스, 구성 및 서비스를 패키징, 공유 및 배포하는 효율적인 방법을 제공함으로써 쿠버네티스 애플리케이션 관리 프로세스를 간소화합니다. Helm은 "*Chart*"라는 패키징 형식을 사용하는데, 이는 본질적으로 관련 쿠버네티스 리소스 집합을 설명하는 파일 모음입니다. 개발자와 운영자는 이러한 차트를 사용하여 가장 복잡한 쿠버네티스 애플리케이션도 일관되고 유지 관리 가능한 방식으로 정의, 설치 및 업그레이드할 수 있습니다.

Helm은 Chart 관리 외에도 사용자가 변수와 함수를 사용하여 배포를 사용자 정의할 수 있는 강력한 템플릿 엔진을 제공합니다. 이러한 유연성 덕분에 다양한 환경이나 구성에서 Chart를 쉽게 재사용할 수 있어 배포 프로세스가 간소화되고 오류 발생 가능성이 줄어듭니다. Helm에는 Chart 및 릴리스 관리를 간소화하는 강력한 명령줄 인터페이스(CLI)와 Tiller(Helm v2에서 사용) 또는 간단히 Helm(Helm v3에서 사용)이라는 서버 측 구성 요소가 탑재되어 있습니다. 이 구성 요소는 쿠버네티스 API 서버와 상호 작용하여 쿠버네티스 리소스를 설치, 업그레이드, 쿼리 및 제거합니다.

> **패키지 관리 도구들**
>
> - Ubuntu/Debian: `apt`
> - MacOS: `brew`
> - 쿠버네티스: `helm`

**Helm 설치**

`get_helm.sh` 스크립트로 설치하거나 MacOS 환경은 `brew` 로 helm을 설치 할 수 있습니다.

- 스크립트 설치

```bash
curl -fsSL -o get_helm.sh https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3
chmod 700 get_helm.sh
./get_helm.sh
```

- brew

```bash
brew install helm
```

**Helm Chart 저장소 추가**

Helm이 설치 되었으면 Helm Chart를 가져올 저장소를 추가해야 합니다. [Artifact Hub](https://artifacthub.io/packages/search?kind=0) 에서 사용 가능한 Helm Chart 저장소를 확인 할 수 있습니다.

- bitnami 저장소 추가 예시

```bash
helm repo add bitnami https://charts.bitnami.com/bitnami
```

```output
"bitnami" has been added to your repositories
```

다음과 같이 저장소에 있는 Helm Chart 목록을 확인할 수 있습니다.

```bash
helm search repo bitnami
```

```output
NAME                                        	CHART VERSION	APP VERSION  	DESCRIPTION
bitnami/airflow                             	14.1.1       	2.5.3        	Apache Airflow is a tool to express and execute...
bitnami/apache                              	9.5.2        	2.4.57       	Apache HTTP Server is an open-source HTTP serve...
bitnami/appsmith                            	0.2.1        	1.9.17       	Appsmith is an open source platform for buildin...
bitnami/argo-cd                             	4.6.2        	2.6.7        	Argo CD is a continuous delivery tool for Kuber...
bitnami/argo-workflows                      	5.1.14       	3.4.7        	Argo Workflows is meant to orchestrate Kubernet...
bitnami/aspnet-core                         	4.0.11       	7.0.5        	ASP.NET Core is an open-source framework for we...
bitnami/cassandra                           	10.2.1       	4.1.1        	Apache Cassandra is an open source distributed ...
bitnami/cert-manager                        	0.9.6        	1.11.1       	cert-manager is a Kubernetes add-on to automate...

(...이하 생략)
```

**Helm 기본 사용법**

Helm Chart 설치는 `helm install` 커맨드로 할 수 있습니다.

```bash
helm repo update   # 저장소의 최신 차트 목록으로 갱신 합니다.
helm install mysql bitnami/mysql
```

```output
NAME: mysql
LAST DEPLOYED: Wed May  3 00:42:11 2023
NAMESPACE: default
STATUS: deployed
REVISION: 1
TEST SUITE: None
NOTES:
CHART NAME: mysql
CHART VERSION: 9.8.2
APP VERSION: 8.0.33

(...이하 생략)
```

`helm install` 커맨드의 포맷은 다음과 같습니다.

```bash
helm install <Release 이름> <저장소/Chart>
```

Helm 사용시 특정 네임스페이스에 Chart를 설치하려면 `helm install -n` *`<Namepsace>`*또는 `helm install --namespace <`*`Namespace`*`>` 로 네임스페이스 옵션을 추가 하시면 됩니다.

```bash
helm install -n somenamespace redis bitnami/mysql
```

`helm ls` 또는 `helm list` 커맨드로 설치된 Helm Chart를 확인 할 수 있습니다.

```bash
helm ls
```

```output
NAME                 	NAMESPACE	REVISION	UPDATED                             	STATUS  	CHART                        	APP VERSION
mysql                	default  	1       	2023-05-03 00:42:11.096995 +0900 KST	deployed	mysql-9.8.2                  	8.0.33
```

설치된 Chart를 제거하려면 `helm uninstall` 커맨드를 사용합니다.

```bash
helm uninstall mysql
```

```output
release "mysql" uninstalled
```

앞으로 MLOps에 사용되는 많은 도구들을 Helm으로 쿠버네티스 환경에 설치하여 MLOps 인프라를 만들어 나갈 것 입니다.

> *Helm에 대한 좀 더 많은 정보는 [Helm 문서](https://helm.sh/docs)를 참고하시기 바랍니다.*

### 3.3.3 ArgoCD

ArgoCD는 오픈 소스, 쿠버네티스 네이티브 지속적 배포(CD) 도구로, 쿠버네티스 클러스터 내에서 애플리케이션의 배포, 모니터링, 관리를 간소화합니다. 대표적인 *GitOps* 도구인 ArgoCD는 Git 리포지토리에 정의된 대로 원하는 애플리케이션 상태를 쿠버네티스 환경에서 실행되는 실제 상태와 동기화하는 작업을 자동화합니다. 이 접근 방식은 전체 애플리케이션 수명 주기를 버전 제어 및 추적할 수 있도록 보장하여 신속한 롤백, 손쉬운 감사, 팀원 간의 향상된 협업을 촉진합니다. ArgoCD는 Helm, Kustomize, Jsonnet과 같은 광범위한 구성 관리 도구를 지원하므로 개발자가 선호하는 방법을 사용하여 쿠버네티스 리소스를 정의할 수 있습니다.

ArgoCD의 핵심 강점은 애플리케이션 리소스의 실시간 시각화 및 상태 모니터링 기능을 제공하여 사용자가 원하는 상태와 실제 상태 간의 불일치를 신속하게 식별하고 수정할 수 있다는 점입니다. 직관적인 사용자 인터페이스는 명령줄 및 API 옵션과 함께 개발자와 운영자 모두에게 원활한 경험을 제공합니다. 또한 ArgoCD는 Jenkins, GitLab, CircleCI 등 널리 사용되는 지속적 통합(CI) 도구와 쉽게 통합하여 완벽한 CI/CD 파이프라인을 구축할 수 있습니다. 역할 기반 액세스 제어(RBAC) 및 싱글 사인온(SSO)과 같은 기본 제공 보안 기능을 통해 권한이 부여된 사용자만 애플리케이션 리소스를 변경할 수 있으므로 배포 프로세스 전반에 걸쳐 높은 수준의 보안을 유지할 수 있습니다.

> **GitOps**
>
> GitOps는 선언적 인프라 및 애플리케이션 코드에 대한 신뢰할 수 있는 단일 소스로 Git을 사용하는 애플리케이션 개발 및 운영에 대한 최신 접근 방식입니다. 이 방법론은 Git 리포지토리를 애플리케이션 및 인프라의 원하는 상태에 대한 변경 사항을 저장, 버전 관리 및 추적하는 중앙 허브로 취급하여 애플리케이션의 배포, 관리 및 모니터링을 간소화합니다. GitOps는 Git의 강력한 버전 제어 기능과 DevOps의 원칙을 결합하여 전체 소프트웨어 개발 라이프사이클에서 협업, 투명성 및 효율성을 개선할 수 있습니다.
>
> GitOps 워크플로에서 DevOps 엔지니어는 인프라의 원하는 상태를 코드로 선언하여 Git 리포지토리에 저장합니다. 그런 다음 CI(지속적 통합) 및 CD(지속적 배포) 파이프라인을 설정하여 배포 환경에서 실행 중인 실제 상태를 리포지토리에 정의된 상태와 동기화합니다. 이 접근 방식은 인프라 또는 애플리케이션에 대한 모든 변경 사항을 버전 제어, 감사 및 추적할 수 있도록 보장합니다. GitOps는 자동화 향상, 장애로부터의 빠른 복구, Pull Request 검토 및 액세스 제어를 통한 보안 강화, 팀원 간의 보다 쉬운 협업 등 여러 가지 이점을 제공합니다. GitOps 접근 방식을 용이하게 하는 인기 있는 도구로는 쿠버네티스 및 기타 클라우드 네이티브 기술과 원활하게 작동하도록 설계된 *ArgoCD, Flux, Jenkins X* 등이 있습니다.

<p align="center">
<img src="https://img-src.io/taehun/from-zero-to-hero-mlops-tools-3-2/2.png" alt="그림 3-15. GitOps CI/CD 워크플로우"><br>
<i>그림 3-15. GitOps CI/CD 워크플로우</i>
</p>

**ArgoCD 설치**

쿠버네티스 클러스터에 ArgoCD를 Helm을 사용해서 설치하겠습니다. ([공식 가이드 문서](https://argo-cd.readthedocs.io/en/stable/getting_started/#1-install-argo-cd)에 따라 `install.yaml` 파일로 설치하셔도 됩니다.)

```bash
helm repo add argo https://argoproj.github.io/argo-helm
helm -n argocd install argocd argo/argo-cd --create-namespace
```

설치가 완료 될 때까지 대기 합니다.

```bash
kubectl wait --for=condition=available --timeout=180s -n argocd --all deployments
```

```output
deployment.apps/argocd-applicationset-controller condition met
deployment.apps/argocd-dex-server condition met
deployment.apps/argocd-notifications-controller condition met
deployment.apps/argocd-redis condition met
deployment.apps/argocd-repo-server condition met
deployment.apps/argocd-server condition met
```

로컬 호스트의 8080 포트로 포워딩을 해서 ArgoCD 웹 UI로 접속합니다. 초기 접속 계정 ID는 Username은 `admin` , 비밀번호는 `argocd-initial-admin-secret` Secret에 저장되어 있습니다. 아래 커맨드로 Secret에 저장된 비밀번호를 확인 할 수 있습니다.

- 초기 `admin` 비밀번호 확인

```bash
kubectl get secret -n argocd argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 --decode
```

- ArgoCD 웹 서버 포트 포워딩

```bash
kubectl port-forward svc/argocd-server -n argocd 8080:443
```

웹 브라우저에서 [`https://localhost:8080`](https://localhost:8080) 으로 접속 (Username: `admin`, Password: *`<Secret 값>`*)

<p align="center">
<img src="https://img-src.io/taehun/from-zero-to-hero-mlops-tools-3-2/3.png?w=800" alt="그림 3-16. ArgoCD 웹 UI 화면"><br>
<i>그림 3-16. ArgoCD 웹 UI 화면</i>
</p>

샘플 어플리케이션을 하나 추가해 봅시다. 상단의 **+ NEW APP** 버튼을 클릭후 팝업 되는 입력 창에 다음과 같이 입력 합니다. 공개 Git 원격 저장소에서 Helm Chart 파일을 ArgoCD로 배포 할 것 입니다.

- **GENERAL**
  - Application Name: `guest-book`
  - Project Name: `default`
  - SYNC POLICY: `Manual`
- **SOURCE**
  - Repository URL: `https://github.com/argoproj/argocd-example-apps/`
  - Revision: `HEAD`
  - Path: `helm-guestbook`
- **DESTINATION**
  - Cluster URL: `https://kubernetes.default.svc`
  - Namespace: `default`

위와 같이 입력후 **CREATE** 버튼을 클릭하면 아래 *<그림 3-17>* 같이 *OutofSync* 상태로 어플리케이션이 추가되어 있습니다.

<p align="center">
<img src="https://img-src.io/taehun/from-zero-to-hero-mlops-tools-3-2/4.png?w=800" alt="그림 3-17. ArgoCD 새로운 어플리케이션 추가"><br>
<i>그림 3-17. ArgoCD 새로운 어플리케이션 추가</i>
</p>

ArgoCD 어플리케이션의 세 개의 버튼은 각각 다음을 의미 합니다.

- *SYNC*: ArgoCD의 현재 어플리케이션 설정대로 쿠버네티스에 배포 합니다. (**ArgoCD → k8s**)
- *REFRESH:* Git 저장소의 최신 어플리케이션 설정 값을 ArgoCD에 읽어 옵니다. **(Git Repo → ArgoCD)**
- *DELETE*: ArgoCD 어플리케이션을 삭제 합니다.

**SYNC** 버튼을 클릭하여 ArgoCD와 쿠버네티스간의 동기화가 완료되면 어플리케이션 Status 값이 *Healthy, Synced* 로 변경 됩니다.

`kubectl` 로 guestbook 어플리케이션이 배포되었는지 확인해 보겠습니다.

```bash
kubectl get all
```

```output
NAME                                             READY   STATUS    RESTARTS   AGE
pod/guest-book-helm-guestbook-6dcf44954d-v2fpf   1/1     Running   0          9m45s

NAME                                TYPE        CLUSTER-IP     EXTERNAL-IP   PORT(S)   AGE
service/guest-book-helm-guestbook   ClusterIP   10.96.208.65   <none>        80/TCP    9m45s
service/kubernetes                  ClusterIP   10.96.0.1      <none>        443/TCP   20d

NAME                                        READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/guest-book-helm-guestbook   1/1     1            1           9m45s

NAME                                                   DESIRED   CURRENT   READY   AGE
replicaset.apps/guest-book-helm-guestbook-6dcf44954d   1         1         1       9m45s
```

guestbook 관련 리소스가 모두 배포되어 있네요! 앞서 ArgoCD 어플리케이션을 추가할때 설정했던 각 항목들에 대한 내용은 다음과 같습니다.

- **GENERAL:** 일반적인 설정 항목들
  - *Application Name*: 어플리케이션 이름
  - *Project Name*: 프로젝트 이름. 임의 기입은 되지 않고, ArgoCD에 존재하는 프로젝트에서 선택해야 합니다. 새로운 프로젝트 추가는 *Settings → Projects* 메뉴에서 추가 합니다.
  - *SYNC POLICY*: 동기화 방식
  - `Manual` 은 배포 담당자가 직접 SYNC를 해야 하며, 주로 Production 환경 배포에 사용
  - `Automatic` 은 ArgoCD가 변경점 감지시 자동 배포. 주로 Develop 환경 배포에 사용
- **SOURCE:** 환경 저장소 관련 설정
  - *Repository URL*: Git 원격 저장소 URL. Private 저장소는 *Settings → Repositories* 메뉴에서 추가 및 설정이 필요합니다.
  - *Revision*: Git의 Revsion (HEAD 혹은 main 등의 브랜치 이름도 사용 가능)
  - *Path*: Git 원격 저장소내 어플리케이션 설정 파일의 위치
- **DESTINATION:** 배포 대상(k8s) 관련 설정
  - *Cluster URL*: 배포할 쿠버네티스 클러스터 URL. `https://kubernetes.default.svc` 는 현재 ArgoCD가 설치된 쿠버네티스 (즉, in-cluster)를 의미 합니다. 배포 대상이 다른 쿠버네티스 클러스터이면 argocd CLI로 클러스터를 추가해야 합니다.
  - *Namespace*: 배포할 쿠버네티스내 네임스페이스

> *ArgoCD에 대한 좀 더 많은 정보는 [ArgoCD 문서](https://argo-cd.readthedocs.io/en/latest/)를 참고하시기 바랍니다.*

### 3.3.4 Terraform

Terraform은 해시코프에서 개발한 오픈소스 IaC (Infrastructure as Code) 도구로, 사용자가 HCL (HashiCorp Configuration Language)이라는 선언형 언어를 통해 클라우드 인프라를 자동화하고 관리할 수 있게 해줍니다. Terraform은 코드를 사용하여 인프라 리소스를 정의하고 프로비저닝함으로써 일관되고 반복 가능한 배포를 가능하게 하여 인적 오류를 줄이고 전반적인 효율성을 개선합니다. 이 도구는 모듈식 공급자 시스템을 통해 AWS, Azure, Google Cloud 등 여러 클라우드 플랫폼을 지원하므로 확장성이 뛰어나고 다양한 인프라 요구 사항에 맞게 조정할 수 있습니다. Terraform의 협업 및 버전 제어 접근 방식은 개발, 스테이징 및 프로덕션 환경 전반의 인프라를 관리하기 위한 DevOps 실무자들 사이에서 인기 있는 선택이 되었습니다.

이 시리즈에서 설명하는 MLOps 도구는 주로 온프레미스 환경을 대상으로 하므로 Terraform을 활용하지 않습니다. 하지만 인프라 관리 도구로서 Terraform의 중요성을 고려할 때, IaC와 그 대표적인 도구인 Terraform을 언급하는 것은 필수적입니다. 게다가 실제 프로젝트에서는 클라우드와 온프레미스가 결합된 하이브리드 클라우드 환경이 널리 사용되고 있습니다. 따라서 Terraform 사용의 기본 사항을 간략히 살펴보는 것이 좋습니다.

> **쿠버네티스와 IaC 도구들**
>
> IaC는 인프라를 코드로 관리하는 것이 핵심입니다. 대표적인 IaC 도구인 Terraform과 Ansible을 사용하여 쿠버네티스 클러스터 생성하려면 다음과 같이 합니다:
>
> - *Terraform* 으로 클러스터 노드를 프로비저닝 하고, (노드 생성)
> - *Ansible* 로 각 노드를 설정하여 쿠버네티스 클러스터를 만든다. (노드 설정)

공용 클라우드 서비스는 EKS, GKE, AKS등의 관리형 쿠버네티스 환경을 Terraform에서 직접 프로비저닝하므로 Ansible이 필요 없습니다. 하지만, OpenStack등을 사용하는 사설 클라우드 환경에는 위와 같이 Terraform과 Ansible을 조합하여 쿠버네티스 클러스터를 생성합니다. 여기에 *ArgoCD* 나 *Flux* 같은 GitOps 도구까지 추가하면 코드로 대부분의 인프라 리소스를 관리할 수 있습니다.

**Terraform 설치**

Terraform이라고 하면 `terraform` 이라는 CLI 도구를 의미 합니다. `brew` 나 `apt` 패키지 관리자로 설치 할 수 있습니다.

- brew (MacOS)

```bash
brew tap hashicorp/tap
brew install hashicorp/tap/terraform
```

- apt (Ubuntu)

```bash
sudo apt-get update && sudo apt-get install -y gnupg software-properties-common
wget -O- https://apt.releases.hashicorp.com/gpg | \
  gpg --dearmor | \
  sudo tee /usr/share/keyrings/hashicorp-archive-keyring.gpg
gpg --no-default-keyring \
  --keyring /usr/share/keyrings/hashicorp-archive-keyring.gpg \
  --fingerprint
echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] \
  https://apt.releases.hashicorp.com $(lsb_release -cs) main" | \
  sudo tee /etc/apt/sources.list.d/hashicorp.list
sudo apt update
sudo apt-get install terraform
```

설치 확인

```bash
terraform -version
```

```output
Terraform v1.4.6
on darwin_arm64
```

Terraform으로 AWS EC2 인스턴스를 하나 생성해 보겠습니다. 이를 실행하기 위해서는 AWS 계정과 aws CLI 도구가 설치되어 있어야 합니다.

먼저, Terraform 작업 디렉토리를 만들고 그곳에 HCL 코드를 작성 합니다.

```bash
mkdir terraform-aws-example
cd terraform-aws-example
touch main.tf
```

에디터로 [`main.tf`](http://main.tf) 파일을 열고, 다음 내용을 추가 합니다.

```hcl
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.16"
    }
  }

  required_version = ">= 1.2.0"
}

provider "aws" {
  region  = "us-west-2"
}

resource "aws_instance" "app_server" {
  ami           = "ami-830c94e3"
  instance_type = "t2.micro"

  tags = {
    Name = "ExampleAppServerInstance"
  }
}
```

이 HCL 코드 내용을 요약하면, AWS 리소스 프로비저닝을 위해 `hashicorp/aws` 프로바이더를 사용하고, `us-east-2` 리즌에 `app_server` 라는 EC2 인스턴스를 생성하겠다는 의미 입니다. 인스턴스의 크기는 `t2.micro` 입니다.

위와 같이 HCL 코드는 직관적으로 이해하기 쉬운 문법으로 되어 있습니다. 이렇게 작성된 HCL 코드를 사용하여 `terraform` 커맨드를 실행하여 실제 인프라를 생성 할 수 있습니다.

현재 폴더에서 Terraform을 초기화 합니다. Terraform은 초기화 과정에서 필요한 프로바이더를 다운로드하여 설치합니다.

```bash
terraform init
```

```output
Initializing the backend...

Initializing provider plugins...
- Finding hashicorp/aws versions matching "~> 4.16"...
- Installing hashicorp/aws v4.66.1...
- Installed hashicorp/aws v4.66.1 (signed by HashiCorp)

(...이하 생략)
```

HCL 파일이 유효한지 검증 합니다.

```bash
terraform validate
```

```output
Success! The configuration is valid.
```

HCL 파일을 적용하여 실제 인프라를 생성 합니다.

```bash
terraform apply
```

```output
Terraform used the selected providers to generate the following execution plan. Resource actions are indicated with the following symbols:
  + create

Terraform will perform the following actions:

  # aws_instance.app_server will be created
  + resource "aws_instance" "app_server" {
      + ami                                  = "ami-830c94e3"
      + arn                                  = (known after apply)
      + associate_public_ip_address          = (known after apply)
      + availability_zone                    = (known after apply)
      + cpu_core_count                       = (known after apply)
      + cpu_threads_per_core                 = (known after apply)
      + disable_api_stop                     = (known after apply)
      + disable_api_termination              = (known after apply)
      + ebs_optimized                        = (known after apply)

(...이하 생략)

Plan: 1 to add, 0 to change, 0 to destroy.

Do you want to perform these actions?
  Terraform will perform the actions described above.
  Only 'yes' will be accepted to approve.

  Enter a value: yes

aws_instance.app_server: Creating...
aws_instance.app_server: Still creating... [10s elapsed]
aws_instance.app_server: Still creating... [20s elapsed]
aws_instance.app_server: Still creating... [30s elapsed]
aws_instance.app_server: Still creating... [40s elapsed]
aws_instance.app_server: Still creating... [50s elapsed]
aws_instance.app_server: Still creating... [1m0s elapsed]
aws_instance.app_server: Creation complete after 1m5s [id=i-07c4ba04f5ff58673]

Apply complete! Resources: 1 added, 0 changed, 0 destroyed.
```

`terraform apply` 가 완료된 이후 AWS 웹 콘솔에 접속하여 EC2 서비스 `us-west-2` 리즌을 확인해보면, HCL 파일에 정의한 EC2 인스턴스가 생성되어 있습니다.

<p align="center">
<img src="https://img-src.io/taehun/from-zero-to-hero-mlops-tools-3-2/5.png?w=800" alt="그림 3-18 AWS 콘솔의 EC2 메뉴"><br>
<i>그림 3-18 AWS 콘솔의 EC2 메뉴</i>
</p>

Terraform은 HCL 파일을 적용할 때 `terraform.tfstate` 파일에 인프라 관련 내용들을 모두 기입합니다. 실제 Terraform 동작은 `.tf` 파일들에서 인프라 관련 자세한 설정이 있는 `terraform.tfstate` 파일을 생성하고, `terraform.tfstate` 파일 내용에서 실제 인프라를 생성 및 삭제합니다. `terraform.tfstate` 파일에는 인프라에 관련된 민감한 내용이 종종 포함되어 있으므로, 관리에 유의해야 합니다. (GitHub과 같은 Git 저장소에 올리지 마세요!)

생성된 인프라를 삭제하는 것은 `terraform destroy` 커맨드로 할 수 있습니다. `terraform.tfstate` 파일에 기입된 인프라 리소스를 제거하고 해당 파일 내용을 갱신합니다.

```bash
terraform destroy
```

```output
aws_instance.app_server: Refreshing state... [id=i-07c4ba04f5ff58673]

Terraform used the selected providers to generate the following execution plan. Resource actions are indicated with the
following symbols:
  - destroy

Terraform will perform the following actions:

  # aws_instance.app_server will be destroyed
  - resource "aws_instance" "app_server" {
      - ami                                  = "ami-830c94e3" -> null
      - arn                                  = "arn:aws:ec2:us-west-2:915194574876:instance/i-07c4ba04f5ff58673" -> null
      - associate_public_ip_address          = true -> null
      - availability_zone                    = "us-west-2a" -> null
      - cpu_core_count                       = 1 -> null
      - cpu_threads_per_core                 = 1 -> null
      - disable_api_stop                     = false -> null
      - disable_api_termination              = false -> null
      - ebs_optimized                        = false -> null
      - get_password_data                    = false -> null
      - hibernation                          = false -> null

(...이하 생략)

Plan: 0 to add, 0 to change, 1 to destroy.

Do you really want to destroy all resources?
  Terraform will destroy all your managed infrastructure, as shown above.
  There is no undo. Only 'yes' will be accepted to confirm.

  Enter a value: yes

aws_instance.app_server: Destroying... [id=i-07c4ba04f5ff58673]
aws_instance.app_server: Still destroying... [id=i-07c4ba04f5ff58673, 10s elapsed]
aws_instance.app_server: Still destroying... [id=i-07c4ba04f5ff58673, 20s elapsed]
aws_instance.app_server: Still destroying... [id=i-07c4ba04f5ff58673, 30s elapsed]
aws_instance.app_server: Destruction complete after 32s

Destroy complete! Resources: 1 destroyed.
```

AWS 콘솔을 확인해보면, 앞서 생성한 EC2 인스턴스가 삭제되어 있습니다.

> *Terraform에 대한 좀 더 많은 정보는 [Terraform 문서](https://developer.hashicorp.com/terraform)를 참고하시기 바랍니다.*

> *Python으로 인프라를 생성하는 CDKTF(CDK for Terraform)에 대한 내용은 [여기](https://blog.taehun.dev/terraform-cdk)에 있습니다.*

## 3.4 요약

이번 장에는 **쿠버네티스 클러스터를 구축**하고, **인프라 관리 도구들을 설치 및 설정**을 하였습니다. 3장에서 했던 작업들을 정리하였습니다 (MacOS 환경):

```bash
brew install kubectl
brew install kind
brew install ansible
```

- 쿠버네티스 노드에 Ubuntu Server 22.04 설치 (→ [3.2.4 운영체제 설치 - Ubuntu Server 22.04 LTS](https://blog.taehun.dev/from-zero-to-hero-mlops-tools-3-1#4bb65a80a19b410496e7238dacbeca86))
- `/etc/ansible/hosts` 파일 작성 (→ [3.3.1 Ansible](/from-zero-to-hero-mlops-tools-3-2#82e114d834fa48fe94f74a91f810fbe1))
- `playbook.yaml` 파일 작성 (→ [3.3.1 Ansible](/from-zero-to-hero-mlops-tools-3-2#82e114d834fa48fe94f74a91f810fbe1))

```bash
SSH_PUBLIC_KEY=`cat ~/.ssh/id_ed25519.pub`
ansible all --list-hosts | awk 'FNR>=2' | xargs -I {} ssh taehun@{} "echo $SSH_PUBLIC_KEY >> ~/.ssh/authorized_keys"
unset SSH_PUBLIC_KEY
ansible-playbook playbook.yml -K
```

- `${HOME}/.kube/config` 파일 설정 (→ [3.2.5 RKE2로 쿠버네티스 클러스터 생성](https://blog.taehun.dev/from-zero-to-hero-mlops-tools-3-1#4232f94cb7e74de7bd41dd406d4cbd04))

```bash
brew install helm
helm repo add argo https://argoproj.github.io/argo-helm
helm -n argocd install argocd argo/argo-cd --create-namespace
```
