+++
title = "제로부터 시작하는 MLOps 도구와 활용-5. 머신러닝 모델 실험과 개발 (1/4)"
date = 2023-12-24
draft = false

[taxonomies]
tags = ['MLOps', 'Zero-to-MLOps', 'JupyterLab', 'JupyterHub']

[extra]
author = "김태훈"
toc = true
+++


<!-- TODO: 이미지 추가 - 파일명: Zero-to-MLOps-5-1.png, 원본: https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fd16ab49b-c880-41d3-8de9-a0ddfb671740%2F88c4c8d2-b567-497f-8b2f-4800d27c4c6a%2FZero-to-MLOps-5-1.png?table=block&id=e9764ebc-4b78-46fd-bda0-828e93c0cfb7&cache=v2 -->

![그림 5-1. 5장 머신러닝 모델 실험과 개발의 구성요소와 도구들 (머신러닝 실험 환경, 메타데이터 저장소, 소스코드 리포지토리, 분산 학습)]()


그림 5-1. 5*장 머신러닝 모델 실험과 개발*의 구성요소와 도구들 (머신러닝 실험 환경, 메타데이터 저장소, 소스코드 리포지토리, 분산 학습)

이번 장에서는 MLOps 시스템 내에서 머신러닝 모델의 실험과 개발에 필요한 도구들을 살펴봅니다. 특히, 효과적인 머신러닝 실험을 위한 대화형 도구인 JupyterLab에 주목합니다. 또한, MLOps 환경에서 JupyterLab을 중앙화된 방식으로 운영하는 JupyterHub의 설치 및 설정 과정을 안내합니다.

이어서, 머신러닝 실험 과정에서 생성되는 다양한 메타데이터의 관리의 중요성을 강조하며, 이를 위한 MLFlow Tracking의 역할과 사용법을 탐구합니다. MLFlow를 통해 머신러닝 실험 데이터의 추적과 관리를 어떻게 하는지 예시를 통해 알아보겠습니다.

또한, 머신러닝 실험과 개발에 사용한 소스코드 버전 관리 도구인 Github과 GitLab에 대해서도 알아보고, 이들의 활용 방법을 소개합니다. 마지막으로, 분산 학습을 위한 도구들에 대해 알아보면서 이 장을 마무리합니다.

### ****5.1 머신러닝 실험 환경****

머신러닝 실험은 소프트웨어 개발과 마찬가지로 물리적으로는 대부분 로컬 환경, 즉, 여러분이 사용 중인 노트북이나 데스크탑에서 이루어집니다. SQL 클러이언트 프로그램, VSCode와 같은 코드 에디터, Python 인터프리터, 각종 머신러닝 관련 Python 패키지등 모두 머신러닝 실험과 개발에 사용하는 필수 도구들 입니다. 이 장에서는 데이터 분석 및 머신러닝 실험과 개발에 널리 사용되는 대화형 도구인 JupyterLab에 주목합니다.

JupyterLab은 Jupyter Notebook을 기반으로 한 확장 버전으로, 웹 기반의 강력한 인터랙티브 개발 환경을 제공합니다. 이 환경은 코드 작성, 데이터 시각화, 문서화 및 파일 관리를 통합적으로 수행할 수 있는 인터페이스를 통해 복잡한 데이터 과학 및 머신러닝 프로젝트에 최적화되어 있습니다.

또한, JupyterLab을 MLOps 인프라 환경에 통합하여 중앙화된 서비스로 제공하는 방법에 대해서도 논의합니다. 이를 위해 JupyterHub를 쿠버네티스 클러스터에 설치 및 설정하는 과정을 자세히 살펴보겠습니다.

#### 5.1.1 JupyterLab


<!-- TODO: 이미지 추가 - 파일명: 스크린샷_2023-12-23_오후_6.53.09.png, 원본: https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fd16ab49b-c880-41d3-8de9-a0ddfb671740%2Fc6edf8f1-4f3c-4150-9b8e-dfdaea4aba14%2F%25E1%2584%2589%25E1%2585%25B3%25E1%2584%258F%25E1%2585%25B3%25E1%2584%2585%25E1%2585%25B5%25E1%2586%25AB%25E1%2584%2589%25E1%2585%25A3%25E1%2586%25BA_2023-12-23_%25E1%2584%258B%25E1%2585%25A9%25E1%2584%2592%25E1%2585%25AE_6.53.09.png?table=block&id=9dab3e1a-339d-4914-9447-a6c6a6e437ab&cache=v2 -->

![그림 5-2. JupyterLab 실행 화면]()


그림 5-2. JupyterLab 실행 화면

JupyterLab은 데이터 과학 및 머신러닝 분야에서 널리 사용되는 인터랙티브한 웹 기반 개발 환경입니다. Jupyter Notebook의 직접적인 후속작으로 개발되었으며, 사용자에게 훨씬 더 풍부한 기능과 유연한 작업 공간을 제공합니다. JupyterLab에서 사용자는 코드를 작성하고 실행할 뿐만 아니라 데이터를 시각화하고, 결과를 문서화할 수 있습니다. 이 환경은 코드, 시각적 출력, 그리고 서식 있는 텍스트를 동시에 볼 수 있는 인터페이스를 제공함으로써, 데이터 과학자와 개발자가 보다 효과적으로 작업을 수행할 수 있도록 합니다.

JupyterLab의 주요 강점은 그 확장성과 통합성에 있습니다. 사용자는 다양한 머신러닝 프레임워크와 데이터 처리 라이브러리를 쉽게 통합할 수 있으며, 추가적인 확장 기능을 통해 맞춤화된 작업 환경을 구성할 수 있습니다. 또한, JupyterLab은 파일 탐색기, 리치 텍스트 에디터, 터미널 등 다양한 도구를 내장하고 있어, 하나의 플랫폼에서 전체 데이터 과학 및 머신러닝 워크플로우를 관리할 수 있습니다. 이를 통해 사용자는 코드 작성, 데이터 분석, 시각화 및 결과 공유 등의 작업을 원활하게 진행할 수 있습니다.

**JupyterLab 설치**

- pip

```bash
$ pip install jupyterlab
```

- conda

```bash
$ conda install -c conda-forge jupyterlab
```

**JupyterLab 실행**

작업 디렉토리를 생성 후, 커맨드라인에서 `jupyter lab` 을 실행 합니다.

```bash
$ mkdir notebooks
$ cd notebooks
$ jupyter lab
```

웹 브라우저에서 `http://localhost:8888/lab` 주소로 접속하면, <그림 5-2>와 같은 화면을 볼 수 있습니다.

ℹ️

**Docker로 실행하기 (추천)**아래와 같이 docker를 사용하여 JupyterLab을 실행 할 수 있습니다.
$ `docker run -it --rm -p 8888:8888 -v "${PWD}":/home/jovyan/work` `quay.io/jupyter/scipy-notebook:2023-11-17`
웹 브라우저에서 `http://localhost:8888/` 접속하면, **Password or token:** 을 입력하는 페이지가 나옵니다. docker 실행시 출력한 아래와 같은 콘슬 메세지의 출력한 토큰을 복사하여 입력합니다. (또는 콘솔에 출력된 URL로 바로 접속)


<!-- TODO: 이미지 추가 - 파일명: 스크린샷_2023-12-24_오후_3.23.01.png, 원본: https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fd16ab49b-c880-41d3-8de9-a0ddfb671740%2Fda05f8fa-7854-4c11-a9ad-8c5491a9dbac%2F%25E1%2584%2589%25E1%2585%25B3%25E1%2584%258F%25E1%2585%25B3%25E1%2584%2585%25E1%2585%25B5%25E1%2586%25AB%25E1%2584%2589%25E1%2585%25A3%25E1%2586%25BA_2023-12-24_%25E1%2584%258B%25E1%2585%25A9%25E1%2584%2592%25E1%2585%25AE_3.23.01.png?table=block&id=fda5afce-f339-4242-a1e4-7b90bb4064e3&cache=v2 -->

![notion image]()


이 글을 읽으시는 대부분의 독자분들은 JupyterLab이나 Jupyter Notebook 사용법은 이미 익숙하실거라 생각합니다. JupyterLab에 대해 생소하시거나 자세한 사용법을 알고싶으신 분은 J[upyterLab User Guide](https://jupyterlab.readthedocs.io/en/stable/user/index.html) 문서를 참고하시기 바랍니다. 사실, Jupyter Notebook 코드 블록에서 `Shift + Enter` 단축키로 Python 코드를 실행하는 것만 알아도 충분합니다. 간단한 딥러닝 모델을 학습하고, 결과를 시각화하는 예제 노트북을 살펴보면서 이 절을 마무리 하겠습니다.

**PyTorch 이미지 분류 모델 학습 및 TensorBoard 시각화 예제**

JupyterLab에서 Python Notebook을 하나 띄워서 간단한 딥러닝 예제를 실행해 봅시다. 아래 코드 블록들은 Jupyter Notebook의 코드 블록 하나와 매핑 됩니다.

- *JupyterLab 런처에서 Notebook → Python 3 (ipykernel) 클릭!*

ℹ️

docker로 JupyterLab 실행시, 6006 포트도 매핑해야 합니다. (TensorBoard 포트)
$ `docker run -it --rm -p 6006:6006 -p 8888:8888 -v "${PWD}":/home/jovyan/work` `quay.io/jupyter/scipy-notebook:2023-11-17`

> 참고 *문서>* *[VISUALIZING MODELS, DATA, AND TRAINING WITH TENSORBOARD](https://pytorch.org/tutorials/intermediate/tensorboard_tutorial.html)*

필요한 패키지들을 설치 합니다.

```
!pip install -q tensorboard torch torchvision
```

TensorBoard 확장을 불러 옵니다.

```
%load_ext tensorboard
```

데이터셋 (*FashionMNIST)*을 설정하고, 변환기와 데이터 로더를 정의 합니다.

```python
# imports
import matplotlib.pyplot as plt
import numpy as np

import torch
import torchvision
import torchvision.transforms as transforms

import torch.nn as nn
import torch.nn.functional as F
import torch.optim as optim

# transforms
transform = transforms.Compose(
    [transforms.ToTensor(),
    transforms.Normalize((0.5,), (0.5,))])

# datasets
trainset = torchvision.datasets.FashionMNIST('./data',
    download=True,
    train=True,
    transform=transform)
testset = torchvision.datasets.FashionMNIST('./data',
    download=True,
    train=False,
    transform=transform)

# dataloaders
trainloader = torch.utils.data.DataLoader(trainset, batch_size=4,
                                        shuffle=True, num_workers=2)


testloader = torch.utils.data.DataLoader(testset, batch_size=4,
                                        shuffle=False, num_workers=2)

# constant for classes
classes = ('T-shirt/top', 'Trouser', 'Pullover', 'Dress', 'Coat',
        'Sandal', 'Shirt', 'Sneaker', 'Bag', 'Ankle Boot')

# helper function to show an image
# (used in the `plot_classes_preds` function below)
def matplotlib_imshow(img, one_channel=False):
    if one_channel:
        img = img.mean(dim=0)
    img = img / 2 + 0.5     # unnormalize
    npimg = img.numpy()
    if one_channel:
        plt.imshow(npimg, cmap="Greys")
    else:
        plt.imshow(np.transpose(npimg, (1, 2, 0)))
```

딥러닝 모델 아키텍처를 정의 합니다.

```python
class Net(nn.Module):
    def __init__(self):
        super(Net, self).__init__()
        self.conv1 = nn.Conv2d(1, 6, 5)
        self.pool = nn.MaxPool2d(2, 2)
        self.conv2 = nn.Conv2d(6, 16, 5)
        self.fc1 = nn.Linear(16 * 4 * 4, 120)
        self.fc2 = nn.Linear(120, 84)
        self.fc3 = nn.Linear(84, 10)

    def forward(self, x):
        x = self.pool(F.relu(self.conv1(x)))
        x = self.pool(F.relu(self.conv2(x)))
        x = x.view(-1, 16 * 4 * 4)
        x = F.relu(self.fc1(x))
        x = F.relu(self.fc2(x))
        x = self.fc3(x)
        return x


net = Net()
```

손실 함수와 옵티마이저를 설정합니다.

```toml
criterion = nn.CrossEntropyLoss()
optimizer = optim.SGD(net.parameters(), lr=0.001, momentum=0.9)
```

TensorBoard에 정보를 작성하는 핵심 객체인 SummaryWriter를 정의합니다.

```python
from torch.utils.tensorboard import SummaryWriter

# default `log_dir` is "runs" - we'll be more specific here
writer = SummaryWriter('runs/fashion_mnist_experiment_1')
```

TensorBoard 확장을 실행 합니다. SummaryWriter 객체에 기록된 값들은 이곳에 시각화되어 볼 수 있습니다.

```
%tensorboard --logdir=runs --host 0.0.0.0
```

이미지 그리드로 학습 데이터 샘플을 시각화하고, TensorBoard에 추가합니다.

```toml
# get some random training images
dataiter = iter(trainloader)
images, labels = next(dataiter)

# create grid of images
img_grid = torchvision.utils.make_grid(images)

# show images
matplotlib_imshow(img_grid, one_channel=True)

# write to tensorboard
writer.add_image('four_fashion_mnist_images', img_grid)
```


<!-- TODO: 이미지 추가 - 파일명: 스크린샷_2023-12-24_오후_4.29.54.png, 원본: https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fd16ab49b-c880-41d3-8de9-a0ddfb671740%2F4c5f41e1-91b1-408a-93f8-8eef2445c6e2%2F%25E1%2584%2589%25E1%2585%25B3%25E1%2584%258F%25E1%2585%25B3%25E1%2584%2585%25E1%2585%25B5%25E1%2586%25AB%25E1%2584%2589%25E1%2585%25A3%25E1%2586%25BA_2023-12-24_%25E1%2584%258B%25E1%2585%25A9%25E1%2584%2592%25E1%2585%25AE_4.29.54.png?table=block&id=53ed4bd9-d32e-4471-ad77-6f80af7dc672&cache=v2 -->

![notion image]()


모델 아키텍처를 TensorBoard에 추가합니다. TensorBoard GRAPHS 탭에서 시각화된 모델 아키텍처를 확인 할 수 있습니다.

```
writer.add_graph(net, images)
writer.close()
```


<!-- TODO: 이미지 추가 - 파일명: 스크린샷_2023-12-24_오후_4.36.01.png, 원본: https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fd16ab49b-c880-41d3-8de9-a0ddfb671740%2F13acc081-beab-4f93-aaac-281c2feb1fca%2F%25E1%2584%2589%25E1%2585%25B3%25E1%2584%258F%25E1%2585%25B3%25E1%2584%2585%25E1%2585%25B5%25E1%2586%25AB%25E1%2584%2589%25E1%2585%25A3%25E1%2586%25BA_2023-12-24_%25E1%2584%258B%25E1%2585%25A9%25E1%2584%2592%25E1%2585%25AE_4.36.01.png?table=block&id=a8a7cf56-0c86-46bd-a153-84ef94862bf7&cache=v2 -->

![notion image]()


`add_embedding` 메서드로 고차원 데이터의 저차원 표현을 시각화할 수 있습니다. TensorBoard 우측 상단 INACTIVE 메뉴에서 PROJECTOR 메뉴에서 확인 할 수 있습니다.

```python
# helper function
def select_n_random(data, labels, n=100):
    '''
    Selects n random datapoints and their corresponding labels from a dataset
    '''
    assert len(data) == len(labels)

    perm = torch.randperm(len(data))
    return data[perm][:n], labels[perm][:n]

# select random images and their target indices
images, labels = select_n_random(trainset.data, trainset.targets)

# get the class labels for each image
class_labels = [classes[lab] for lab in labels]

# log embeddings
features = images.view(-1, 28 * 28)
writer.add_embedding(features,
                    metadata=class_labels,
                    label_img=images.unsqueeze(1))
writer.close()
```


<!-- TODO: 이미지 추가 - 파일명: 스크린샷_2023-12-24_오후_4.40.32.png, 원본: https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fd16ab49b-c880-41d3-8de9-a0ddfb671740%2Fd3821dc2-f09e-4c07-a983-70690d5e27da%2F%25E1%2584%2589%25E1%2585%25B3%25E1%2584%258F%25E1%2585%25B3%25E1%2584%2585%25E1%2585%25B5%25E1%2586%25AB%25E1%2584%2589%25E1%2585%25A3%25E1%2586%25BA_2023-12-24_%25E1%2584%258B%25E1%2585%25A9%25E1%2584%2592%25E1%2585%25AE_4.40.32.png?table=block&id=ffdedad2-3746-463c-98f0-1b019c06074c&cache=v2 -->

![notion image]()


`add_figure`메소드로샘플 이미지 예측 결과와 실제 값을 보여주는 것을 TensorBoard에 추가합니다. (TensorBoard *IMAGES* 탭에서 확인) `add_scalar`메소드로 모델 학습 loss 값을 TensorBoard에 기록합니다. (TensorBoard *SCALARS* 탭에서 확인)

```python
# helper functions

def images_to_probs(net, images):
    '''
    Generates predictions and corresponding probabilities from a trained
    network and a list of images
    '''
    output = net(images)
    # convert output probabilities to predicted class
    _, preds_tensor = torch.max(output, 1)
    preds = np.squeeze(preds_tensor.numpy())
    return preds, [F.softmax(el, dim=0)[i].item() for i, el in zip(preds, output)]


def plot_classes_preds(net, images, labels):
    '''
    Generates matplotlib Figure using a trained network, along with images
    and labels from a batch, that shows the network's top prediction along
    with its probability, alongside the actual label, coloring this
    information based on whether the prediction was correct or not.
    Uses the "images_to_probs" function.
    '''
    preds, probs = images_to_probs(net, images)
    # plot the images in the batch, along with predicted and true labels
    fig = plt.figure(figsize=(12, 48))
    for idx in np.arange(4):
        ax = fig.add_subplot(1, 4, idx+1, xticks=[], yticks=[])
        matplotlib_imshow(images[idx], one_channel=True)
        ax.set_title("{0}, {1:.1f}%\n(label: {2})".format(
            classes[preds[idx]],
            probs[idx] * 100.0,
            classes[labels[idx]]),
                    color=("green" if preds[idx]==labels[idx].item() else "red"))
    return fig
```

```running_loss = 0.0
for epoch in range(1):  # loop over the dataset multiple times

    for i, data in enumerate(trainloader, 0):

        # get the inputs; data is a list of [inputs, labels]
        inputs, labels = data

        # zero the parameter gradients
        optimizer.zero_grad()

        # forward + backward + optimize
        outputs = net(inputs)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()

        running_loss += loss.item()
        if i % 1000 == 999:    # every 1000 mini-batches...

            # ...log the running loss
            writer.add_scalar('training loss',
                            running_loss / 1000,
                            epoch * len(trainloader) + i)

            # ...log a Matplotlib Figure showing the model's predictions on a
            # random mini-batch
            writer.add_figure('predictions vs. actuals',
                            plot_classes_preds(net, inputs, labels),
                            global_step=epoch * len(trainloader) + i)
            running_loss = 0.0
print('Finished Training')
```


<!-- TODO: 이미지 추가 - 파일명: 스크린샷_2023-12-24_오후_4.55.02.png, 원본: https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fd16ab49b-c880-41d3-8de9-a0ddfb671740%2F20bfa561-5d1d-4471-a848-1f32582b0dfe%2F%25E1%2584%2589%25E1%2585%25B3%25E1%2584%258F%25E1%2585%25B3%25E1%2584%2585%25E1%2585%25B5%25E1%2586%25AB%25E1%2584%2589%25E1%2585%25A3%25E1%2586%25BA_2023-12-24_%25E1%2584%258B%25E1%2585%25A9%25E1%2584%2592%25E1%2585%25AE_4.55.02.png?table=block&id=435353bc-be95-47a5-8921-0744f29d6628&cache=v2 -->

![notion image]()


로컬 JupyterLab 환경에서 머신러닝 실험을 진행하면 다양한 패키지 설치가 필요합니다. 하지만 이 과정은 시간 소모가 크며, 버전 충돌이나 환경 설정 문제를 야기할 수 있습니다. 이런 문제는 특히 여러 사람이 동일한 프로젝트에 참여하는 경우 더욱 심각해집니다. 이때 모든 팀원이 동일한 환경을 유지하는 것이 필수적입니다. 이러한 문제를 해결하기 위해 JupyterLab 환경을 중앙화된 MLOps 인프라로 통합하는 것이 좋습니다. JupyterHub를 도입하면 MLOps 인프라에서 필요한 모든 패키지와 환경을 효율적으로 관리할 수 있으며, 이를 통해 모든 팀원이 일관된 작업 환경에서 협업할 수 있게 됩니다.

#### 5.1.2 JupyterHub


<!-- TODO: 이미지 추가 - 파일명: Untitled.png, 원본: https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fd16ab49b-c880-41d3-8de9-a0ddfb671740%2F97528c34-7c37-4b5b-857d-416d95c99ac4%2FUntitled.png?table=block&id=410fe9ef-6196-4241-91c3-068c986b763c&cache=v2 -->

![그림 5-3. JupyterHub 아키텍처 (출처&gt; https://z2jh.jupyter.org/en/3.2.1/administrator/architecture.html)]()


그림 5-3. JupyterHub 아키텍처 *(출처>* *<https://z2jh.jupyter.org/en/3.2.1/administrator/architecture.html>**)*

JupyterHub는 여러 사용자가 JupyterLab 환경을 공유하고 사용할 수 있도록 하는 서버 소프트웨어입니다. 이 플랫폼은 개별 사용자에게 개인화된 Jupyter Notebook 환경을 제공하면서도 중앙 집중식 서버에서 모든 사용자를 관리할 수 있는 기능을 갖추고 있습니다. 대학, 연구소, 기업 등 다양한 조직에서 교육이나 협업 프로젝트를 진행할 때 효과적인 환경을 제공합니다. JupyterHub는 사용자별로 격리된 작업 공간을 제공하며, 이는 안정성과 보안을 강화하는 데 기여합니다.

JupyterHub의 또 다른 주요 장점은 설치 및 환경 구성의 간소화입니다. 관리자는 서버에 필요한 라이브러리와 도구를 한 번에 설치하고 구성함으로써, 사용자 각자가 동일한 작업을 반복하는 수고를 덜 수 있습니다. 이러한 중앙화된 관리는 프로젝트의 효율성을 크게 향상시키며, 팀 구성원 간의 일관된 작업 환경을 제공합니다. 또한, JupyterHub는 확장성이 뛰어나 다양한 인증 옵션, 사용자별 자원 할당 등을 지원하여 규모가 큰 조직의 요구사항을 충족시키는데 적합합니다.

**JupyterHub 기본 설치**

JupyterHub helm 차트 저장소를 추가하고, 차트의 정보를 업데이트 합니다.

```bash
$ helm repo add jupyterhub https://hub.jupyter.org/helm-chart/
$ helm repo update
```

`config.yaml` 설정 파일을 아래와 같이 작성합니다:

```
hub:
  config:
    Authenticator:
      admin_users:
        - admin
    DummyAuthenticator:
      password: ZeroToMLOps
    JupyterHub:
      authenticator_class: dummy
```

⚠️

위 설정은 관리자 권한을 가진 `admin` 사용자를 설정하고, 공용 암호를 `ZeroToMLOps` 설정한 것 입니다. `DummyAuthenticator` 는 순수 테스트를 목적으로 한 인증 설정입니다. 실사용에는 대부분 `GenericOAuthenticator`를 사용합니다.

작성한 `config.yaml` 를 사용하여 `helm install` 로 쿠버네티스 클러스터에 JupyterHub를 설치합니다.

```bash
$ helm install jupyterhub jupyterhub/jupyterhub -f config.yaml
```

JupyterHub 관련 Pod들이 *Running* 상태가 되기전까지 대기 합니다.

```bash
$ kubectl get pod -l "app=jupyterhub"
```


<!-- TODO: 이미지 추가 - 파일명: 스크린샷_2023-12-24_오후_9.10.31.png, 원본: https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fd16ab49b-c880-41d3-8de9-a0ddfb671740%2F59207c67-caba-442e-a918-689d0ef5a56f%2F%25E1%2584%2589%25E1%2585%25B3%25E1%2584%258F%25E1%2585%25B3%25E1%2584%2585%25E1%2585%25B5%25E1%2586%25AB%25E1%2584%2589%25E1%2585%25A3%25E1%2586%25BA_2023-12-24_%25E1%2584%258B%25E1%2585%25A9%25E1%2584%2592%25E1%2585%25AE_9.10.31.png?table=block&id=6b0893e0-3228-45fb-be25-6b42eba353c2&cache=v2 -->

![그림 5-4. 쿠버네티스 클러스터에 JupyterHub 기본 설치 완료]()


그림 5-4. 쿠버네티스 클러스터에 JupyterHub 기본 설치 완료

설치가 완료되면 로컬로 포트 포워딩을 하여 JupyterHub 웹 UI(`http://localhost:8080`)로 접속합니다. 앞서, JupyterLab과 달리 로그인 화면이 나옵니다.

```bash
$ kubectl port-forward svc/proxy-public 8080:80
```

→ 웹 브라우저에서 [`http://localhost:8080`](http://localhost:8080) 접속


<!-- TODO: 이미지 추가 - 파일명: 스크린샷_2023-12-24_오후_9.27.38.png, 원본: https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fd16ab49b-c880-41d3-8de9-a0ddfb671740%2F540b79b2-ba66-4bc5-b5a3-d8479bd1ec70%2F%25E1%2584%2589%25E1%2585%25B3%25E1%2584%258F%25E1%2585%25B3%25E1%2584%2585%25E1%2585%25B5%25E1%2586%25AB%25E1%2584%2589%25E1%2585%25A3%25E1%2586%25BA_2023-12-24_%25E1%2584%258B%25E1%2585%25A9%25E1%2584%2592%25E1%2585%25AE_9.27.38.png?table=block&id=3becda71-1ced-48f9-9573-cc7daa333031&cache=v2 -->

![그림 5-5. JupyterHub 로그인 화면]()


그림 5-5. JupyterHub 로그인 화면

접속 정보는 앞서 `config.yaml` 파일에 지정한 것 입니다:

- Username: `admin`

- Password: `ZeroToMLOps`

JupyterHub 로그인 이 후로는 *<그림 5-2>*의 JupyterLab 환경과 동일합니다. 사용자별 Jupyter 환경은 `jupyter-<username>` 으로 된 새로운 Pod이 생성되어 실행 됩니다.

```bash
$ kubectl get pod -l "app=jupyterhub"
```


<!-- TODO: 이미지 추가 - 파일명: 스크린샷_2023-12-24_오후_9.47.44.png, 원본: https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fd16ab49b-c880-41d3-8de9-a0ddfb671740%2Fffd69df3-4803-41da-9226-47253902e9d7%2F%25E1%2584%2589%25E1%2585%25B3%25E1%2584%258F%25E1%2585%25B3%25E1%2584%2585%25E1%2585%25B5%25E1%2586%25AB%25E1%2584%2589%25E1%2585%25A3%25E1%2586%25BA_2023-12-24_%25E1%2584%258B%25E1%2585%25A9%25E1%2584%2592%25E1%2585%25AE_9.47.44.png?table=block&id=5e853ad7-68bb-412d-95db-f5e7e3df71c0&cache=v2 -->

![그림 5-6. admin 사용자 로그인 후 Pod 목록]()


그림 5-6. admin 사용자 로그인 후 Pod 목록

**JupyterHub 사용자 추가**

관리자 계정으로 로그인 후 *`<JupyterHub 주소>`*`/hub/admin` 주소로 접속하면, 아래 <그림 5-7>과 같이 관리자 페이지에 접속 할 수 있습니다.


<!-- TODO: 이미지 추가 - 파일명: 스크린샷_2023-12-24_오후_9.53.24.png, 원본: https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fd16ab49b-c880-41d3-8de9-a0ddfb671740%2Fceac661e-d0cb-42e9-be32-0895e1fb42a3%2F%25E1%2584%2589%25E1%2585%25B3%25E1%2584%258F%25E1%2585%25B3%25E1%2584%2585%25E1%2585%25B5%25E1%2586%25AB%25E1%2584%2589%25E1%2585%25A3%25E1%2586%25BA_2023-12-24_%25E1%2584%258B%25E1%2585%25A9%25E1%2584%2592%25E1%2585%25AE_9.53.24.png?table=block&id=55936c27-c7d3-42f4-b8e8-ac60fbd2f8bf&cache=v2 -->

![그림 5-7. JupyterHub 관리자 페이지]()


그림 5-7. JupyterHub 관리자 페이지

`DummyAuthenticator` 로 설치한 JupyterHub에서 등록된 모든 사용자는 공용 암호를 공유해서 사용합니다. 관리자 페이지에서 관리자는 새로운 사용자 등록 및 기존 사용자 삭제, 그룹 관리, 실행 중인 Jupyter 서버 관리등을 할 수 있습니다.

좌측 상단 “**Add Users**” 버튼을 클릭하여, 새로운 사용자를 추가 할 수 있습니다.

**여러 실험 환경 제공**

JupyterHub 사용자에게 머신러닝 프로젝트에 필요한 패키지들이 미리 설치된 새로운 커스텀 환경을 설정하여 제공 할 수 있습니다. `config.yaml` 파일에 아래 설정을 추가 합니다:

```
singleuser:
  defaultUrl: "/lab"
  image:
    name: quay.io/jupyter/scipy-notebook
    tag: 2023-11-17
  profileList:
    - display_name: "JupyterLab Default"
      description: "JupyterLab Default"
      default: true
    - display_name: "Datascience environment"
      description: "Python, R, Julia등이 설치된 환경"
      kubespawner_override:
        image: quay.io/jupyter/datascience-notebook:2023-11-17
```

이는 “*JupyterLab Default*”와 "*Datascience environment*" 두 개의 환경을 제공하는 설정 입니다. 각각 [`quay.io/jupyter/scipy-notebook:2023-11-17`](http://quay.io/jupyter/scipy-notebook:2023-11-17) 이미지와 [`quay.io/jupyter/datascience-notebook:2023-11-17`](http://quay.io/jupyter/datascience-notebook:2023-11-17) 이미지를 사용합니다.

변경된 설정으로 Helm 차트를 업그레이드 합니다.

```bash
$ helm upgrade jupyterhub jupyterhub/jupyterhub -f config.yaml
```

업그레이드 완료후 JupyterHub에 로그인을 하면, 실행 환경 선택 화면이 추가 되어 있습니다.


<!-- TODO: 이미지 추가 - 파일명: 스크린샷_2023-12-24_오후_10.18.33.png, 원본: https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fd16ab49b-c880-41d3-8de9-a0ddfb671740%2F72f46d90-8a14-4aae-8743-9002a52bd906%2F%25E1%2584%2589%25E1%2585%25B3%25E1%2584%258F%25E1%2585%25B3%25E1%2584%2585%25E1%2585%25B5%25E1%2586%25AB%25E1%2584%2589%25E1%2585%25A3%25E1%2586%25BA_2023-12-24_%25E1%2584%258B%25E1%2585%25A9%25E1%2584%2592%25E1%2585%25AE_10.18.33.png?table=block&id=b5095046-a5ce-4493-97c3-aa753229b310&cache=v2 -->

![그림 5-8. JupyterHub 실행 환경 추가]()


그림 5-8. JupyterHub 실행 환경 추가

> *쿠버네티스 환경에서 JupyterHub 설치 및 설정에 대한 좀 더 많은 정보는**[**Zero to JupyterHub with Kubernetes**](https://z2jh.jupyter.org/en/3.2.1/index.html)**문서를 참고하시기 바랍니다.*