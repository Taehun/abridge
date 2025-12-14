+++
title = "쿠버네티스 Job을 이용한 NAS 데이터 병렬 처리"
date = 2024-04-11
draft = false

[taxonomies]
tags = ['Kubernetes', 'Data Engineering']

[extra]
author = "김태훈"
toc = true
+++

## 개요

회사에서 컴퓨터 비전 관련 프로젝트를 하고 있습니다. 컴퓨터 비전 관련 프로젝트를 할 때마다 항상 느끼는 것이지만, 미디어 데이터를 처리하는 것은 참 고역입니다. 비디오 파일과 이미지 파일과 같은 미디어 데이터는 크기가 커서 저장 공간도 많이 차지하고, 프로세싱도 오래 걸립니다. 분산, 병렬 처리가 필요한 시점이 왔습니다.
빅 데이터가 대두된 이래로 정말 많은 분산, 병렬 처리 솔루션이 등장했습니다. Hadoop과 Spark가 대표적입니다. 머신러닝 프로젝트에는 Ray도 많이 사용합니다. 클라우드 환경에는 AWS Glue, Amazon EMR, AWS Batch, GCP Dataflow, GCP Dataproc 등 분산, 병렬 처리 서비스들이 참 많습니다.
미디어 데이터 처리를 위해 클라우드 서비스를 사용하기는 비용과 데이터 마이그레이션에 걸리는 시간이 부담이 됩니다. 그렇다고, 온프레미스 환경에서 Spark나 Ray Job으로 처리하려니 설치, 설정, 사용법을 익히는 과정이 매우 번거롭습니다. 온프레미스 환경에 쿠버네티스 클러스터는 있으니, 쿠버네티스 Job으로 NAS에 있는 비디오 파일을 분산, 병렬 처리하였습니다. 이 기사는 해당 경험을 정리한 것 입니다.

## 시스템 구성도


<!-- TODO: 이미지 추가 - 파일명: k8s-job-for-nfspng.png, 원본: https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fd16ab49b-c880-41d3-8de9-a0ddfb671740%2F0e3e4562-f3f8-4156-bc3b-f76d2c432fe4%2Fk8s-job-for-nfspng.png?table=block&id=17bfc5cf-1d33-478e-a28e-f4b9ff903971&cache=v2 -->

![notion image](https://img-src.io/taehun/k8s-job-for-nfs/1.png)


**처리 과정**

1. 맥북에 있는 비디오 파일을 NAS에 업로드 합니다.

2. 다중 쿠버네티스 Job에서 NAS의 비디오 파일을 병렬로 읽어 옵니다.

3. 다중 쿠버네티스 Job에서 처리된 미디어 파일을 NAS에 병렬로 저장합니다.

## 데이터 준비

미디어 데이터 분산, 병렬 처리을 위해 맥북에 있는 비디오 파일을 NAS에 업로드합니다. NAS는 다양한 네트워크 파일 공유 프로토콜을 지원하지만 NFS 서버를 사용하였습니다. NFS 서버 접속 정보는 아래와 같이 가정하겠습니다.

✅

**NFS 서버 접속 정보**

- NFS 서버 호스트: `192.168.1.11`

- NFS 공유: `share`

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
$ cp <비디오 파일 경로>/*.mp4 /private/nfs/video/
```

## 쿠버네티스 NFS 설정

## NFS CSI 드라이버 설치

쿠버네티스 환경에서 NFS를 사용하려면 [NFS CSI(Container Storage Interface) 드라이버](https://github.com/kubernetes-csi/csi-driver-nfs)를 설치해야 합니다.

- NFS CSI 드라이버 설치

```bash
curl -skSL https://raw.githubusercontent.com/kubernetes-csi/csi-driver-nfs/v4.6.0/deploy/install-driver.sh | bash -s v4.6.0 –
```

- NFS CSI 드라이버 설치 확인

```bash
kubectl -n kube-system get pod -o wide -l app=csi-nfs-controller
```

```kubectl -n kube-system get pod -o wide -l app=csi-nfs-node
```


<!-- TODO: 이미지 추가 - 파일명: 스크린샷_2024-04-10_오후_11.08.06.png, 원본: https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fd16ab49b-c880-41d3-8de9-a0ddfb671740%2F789d7504-d966-4e92-8627-dec687331503%2F%25E1%2584%2589%25E1%2585%25B3%25E1%2584%258F%25E1%2585%25B3%25E1%2584%2585%25E1%2585%25B5%25E1%2586%25AB%25E1%2584%2589%25E1%2585%25A3%25E1%2586%25BA_2024-04-10_%25E1%2584%258B%25E1%2585%25A9%25E1%2584%2592%25E1%2585%25AE_11.08.06.png?table=block&id=4c3b0ec2-98bf-4324-b647-ac631df43b2e&cache=v2 -->

![notion image](https://img-src.io/taehun/k8s-job-for-nfs/2.png)


## StorageClass 생성

설치된 NFS CSI를 사용하는 StoageClass를 생성해야 합니다. 아래 YAML 파일을 작성하여 `nfs-csi` StorageClass를 설정합니다.

- `nfs-sc.yaml`

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

YAML 파일 설명

- `name`: 스토리지 클래스의 이름. *PV*(*PersistentVolume)와 PVC(PersistentVolumeClaim)가* 바인딩할 대상입니다.

- `provisioner`: 앞서 설치한 NFS CSI 드라이버를 사용합니다.

- `server` : 마운트할 NFS 서버의 주소

- `share`: NFS 서버 export 경로

- `reclaimPolicy`: 더 이상 사용되지 않는 볼륨을 처리하는 방법(예: PVC 삭제 시)을 지정합니다. 디폴트 값은 *Delete*이며, *Retain*으로 설정할 수 있습니다.

- `volumeBindingMode`: 스토리지 백엔드에 볼륨을 즉시 생성 (Immediate) 하도록 지시하거나, Pod가 볼륨을 사용하려고 할 때까지 기다리도록 WaitForFirstConsumer로 설정할 수 있습니다.

- `mountOptions` : 이 스토리지를 마운트하기 위한 세부 사항. NFSv3를 사용하도록 설정 했습니다.

`kubectl create` 명령어로 `nfs-csi` StorageClass 리소스를 생성합니다.

```bash
kubectl create -f nfs-sc.yaml
```

## PersistentVolume 생성

`nfs-csi` StorageClass의 `reclaimPolicy` 를 Delete로 설정하였습니다. 이는 [동적 볼륨 프로비저닝](https://kubernetes.io/ko/docs/concepts/storage/dynamic-provisioning/)으로 자동 할당된 PV는 PVC를 삭제하면 PV도 같이 삭제 됩니다. 우리가 원하는 동작은 쿠버네티스 Job 실행이 완료 되더라도, 처리된 데이터는 그대로 남아 있는 것 입니다. 이를 위해, `reclaimPolicy` 정책을 재정의한 PV를 생성하고, PVC에서 PV를 바인딩하는 [정적 프로비저닝](https://kubernetes.io/ko/docs/concepts/storage/persistent-volumes/#%EC%A0%95%EC%A0%81-%ED%94%84%EB%A1%9C%EB%B9%84%EC%A0%80%EB%8B%9D)을 사용하였습니다.

아래와 같이 YAML 파일로 PV를 정의합니다.

- `nfs-pv.yaml`

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

YAML 파일 설명

- `accessModes` : PV 접근 모드 설정. 다수의 Job (Pod)에서 사용하므로 *ReadWriteMany*로 설정합니다.

- `persistentVolumeReclaimPolicy` : PV 반환 정책 설정. 볼륨이 자동으로 삭제되지 않도록 *Retain*으로 설정해야 합니다.

- `storageClassName` : 사용할 StoageClass를 지정합니다.

- `volumeHandle` : VolumeID. 드라이버가 사용하는 볼륨 식별자.  `{nfs-server-address}#{sub-dir-name}#{share-name}` 형식을 사용합니다.

- ex> `192.168.1.11/share#subdir#`

- `volumeAttributes.server` : NFS 서버 주소

- `volumeAttributes.share` : NFS 공유 경로

`kubectl create` 명령어로 `pv-nfs` PV 리소스를 생성합니다.

```bash
kubectl create -f nfs-pv.yaml
```

## PersistentVolumeClaim 생성

앞서 생성한 PV에 바인딩하는 PVC 리소스를 설정합니다.

- `nfs-pvc.yaml`

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

`kubectl create` 명령어로 `pvc-nfs-static` PVC 리소스를 생성합니다.

```bash
kubectl create -f nfs-pvc.yaml
```

## 데이터 프로세싱 환경

쿠버네티스 Job 실행에 필요한 패키지가 설치되어 있는 컨테이너 환경이 필요합니다. `ffmpeg` CLI 도구로 비디오 파일의 프레임을 1초 간격으로 추출하는 Job을 예시로 만들어 보겠습니다. 이 경우, Ubuntu 환경에서 `ffmpeg` CLI 도구만 추가적으로 필요합니다.

- `Dockerfile`

```sql
FROM ubuntu:24.04
RUN apt-get update && apt-get install -y ffmpeg
```

컨테이너 이미지를 빌드하고 컨테이너 레지스트리에 푸시합니다. 맥북과 쿠버네티스 클러스터의 CPU 아키텍처가 다르므로, `docker buildx`로 멀티 아키텍처를 지원하도록 빌드하였습니다.

> *Docker buildx에 대한 내용은 아래 링크를 참고하시기 바랍니다.*

[Docker buildx로 멀티 플랫폼 이미지 빌드하기

김태훈 기술 블로그

https://blog.taehun.dev/docker-buildx-


<!-- TODO: 이미지 추가 - 파일명: social-image, 원본: https://www.notion.so/image/https%3A%2F%2Fblog.taehun.dev%2Fapi%2Fsocial-image%3Fid%3D73d3ccde-7526-497a-8e8d-c9a0c1a955ab?table=block&id=d7c8059d-b71f-43dc-8f84-2dca6a972b6e&cache=v2 -->

![Docker buildx로 멀티 플랫폼 이미지 빌드하기](https://img-src.io/taehun/k8s-job-for-nfs/4.png)
](https://blog.taehun.dev/docker-buildx-)

```bash
docker buildx build --platform linux/arm64,linux/amd64 -t taehun/video-processor --push .
```

`docker buildx` 빌드시 에러가 발생하면?

멀티 아키텍처 빌더가 없으면 에러가 납니다. 아래와 같이 멀티 아키텍처 빌더를 먼저 생성해야 합니다.

```bash
docker buildx create --name multi-arch-builder --driver docker-container --bootstrap --use
```

⚠️

설명을 위해 편의상 [DockerHub](https://hub.docker.com/) 공용 레지스트리를 사용했습니다. 아마 실무에선 대부분 비공개 레지스트리를 사용하실 겁니다. 쿠버네티스 환경에서 비공개 레지스트리에 대한 내용은 아래 문서를 참고하시기 바랍니다.
[**프라이빗 레지스트리에서 이미지 받아오기**](https://kubernetes.io/ko/docs/tasks/configure-pod-container/pull-image-private-registry/)

## 쿠버네티스 Job 설정 및 실행

분산, 병렬 처리시 데이터 처리 단위를 어떻게 분할 할 것인지 여부가 중요합니다. 즉, [파티셔닝](https://ko.wikipedia.org/wiki/%EB%8D%B0%EC%9D%B4%ED%84%B0%EB%B2%A0%EC%9D%B4%EC%8A%A4_%EB%B6%84%ED%95%A0) 정책을 어떻게 설정하는지에 따라 처리 성능이 달라집니다. 여기서는 단순히 비디오 파일 하나당 하나의 Job이 생성되도록 설정했습니다.

아래와 같이 쿠버네티스 Job 템플릿 YAML 파일을 정의합니다.

- `video-job-template.yaml`

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

YAML 파일 설명

- `volumes.persistentVolumeClaim.claimName` : 앞서 생성한 NFS PVC 입니다.

- `containers.volumeMounts.mountPath` : Job (Pod)내 NFS 마운트 경로 입니다.

- `containers.args` : Job에서 실행한 커맨드 입니다. `ffmpeg` 커맨드로 NFS의 비디오 파일 프레임을 1초 간격으로 추출합니다. 추출된 이미지 파일은 `/mnt/nfs/frames` 경로에 저장합니다.

YAML 파일내 `$FILE_NAME` 과 `$VIDEO_PATH` 은 쉘 스크립트에서 환경 변수로 설정되어 재정의 됩니다. 아래와 같이 Job 템플릿 파일 내용을 재정의하고, 쿠버네티스 Job을 제출하는 쉘 스크립트를 작성하였습니다.

- `extract-frames-k8s.sh`

```javascript
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

이 스크립트는 NFS의 비디오 파일 목록을 가져와, `./jobs` 폴더에 비디오 파일 단위로 쿠버네티스 Job YAML 파일을 생성합니다. 마지막으로 `kubectl create` 명령어로 `./jobs` 폴더에 있는 쿠버네티스 Job YAML 파일을 제출하여 Job을 실행합니다. 아래와 같이 마운트된 NFS 비디오 파일 경로를 지정하여 스크립트를 실행할 수 있습니다.

```
sh extract-frames-k8s.sh /private/nfs/video
```

지정된 라벨로 Job 실행 상태를 확인 할 수 있습니다.

```bash
kubectl get jobs -l jobgroup=extract-frames
```


<!-- TODO: 이미지 추가 - 파일명: 스크린샷_2024-04-11_오전_12.04.39.png, 원본: https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fd16ab49b-c880-41d3-8de9-a0ddfb671740%2Fbe4acf90-ccac-425e-849f-babfba514fe7%2F%25E1%2584%2589%25E1%2585%25B3%25E1%2584%258F%25E1%2585%25B3%25E1%2584%2585%25E1%2585%25B5%25E1%2586%25AB%25E1%2584%2589%25E1%2585%25A3%25E1%2586%25BA_2024-04-11_%25E1%2584%258B%25E1%2585%25A9%25E1%2584%258C%25E1%2585%25A5%25E1%2586%25AB_12.04.39.png?table=block&id=3ed25d14-a16b-4bfb-b53f-25450a9d195e&cache=v2 -->

![notion image]()


쿠버네티스 Job 실행이 완료되면, *<NFS 서버>/frames* 경로에 영상에서 추출된 프레임의 이미지 파일들이 저장되어 있습니다.

## 결론

쿠버네티스 Job으로 NAS에 있는 비디오 파일을 병렬 처리 해 보았습니다. NFS CSI 설치를 제외하고는 쿠버네티스 기본 기능만 사용하므로 간단한 병렬 처리에 활용하면 좋습니다. 하지만, 사용자와 Job이 많이지고 Job 관리가 필요해지는 시점에는 이와 같은 방법은 적합하지 않습니다. 확장성 있는 Job 솔루션이 필요해지면, Spark나 Ray를 쿠버네티스 환경에 설치해서 사용하시는 것을 추천합니다. 쿠버네티스 환경에서 가벼운 Job 관리 솔루션이 필요하시면 [Kueue](https://github.com/kubernetes-sigs/kueue)를 사용하는 것도 좋습니다. (Ray나 Kubeflow에는 내장되어 있습니다.)

> *참고>* *[**Kueue를 사용한 일괄 시스템 배포**](https://cloud.google.com/kubernetes-engine/docs/tutorials/kueue-intro?hl=ko)*

## 참고자료

- [csi-driver-nfs

  kubernetes-csi • Updated Apr 11, 2024](https://github.com/kubernetes-csi/csi-driver-nfs)

- [**확장을 사용한 병렬 처리**](https://kubernetes.io/ko/docs/tasks/job/parallel-processing-expansion/)