+++
title = "오픈소스 AI 코딩 보조 도구 - Ollama + Codestral 사용후기"
date = 2024-07-14
draft = false

[taxonomies]
tags = ['ollama', 'Codestral']

[extra]
author = "김태훈"
toc = true
+++

## 개요

[GitHub Copilot](https://github.com/features/copilot)과 같은 AI 코딩 보조 도구들을 사용하면 개발자의 생산성 향상에 많은 도움이 됩니다. 저도 GitHub Copilot을 개인적으로 유료 결제해서 사용 중이며, 회사에서도 개발 비용으로 지원해 주고 있습니다. 하지만, GitHub Copilot의 도움을 받으려면 작성 중인 코드가 GitHub 서버로 전송되므로, 보안 정책이 엄격한 기업에서는 사용을 금지하고 있습니다. 게다가 매달 내는 GitHub Copilot 사용료도 조금 아깝기도 합니다.

그래서 사내 GPU 서버에 ollama와 [Codestral](https://mistral.ai/news/codestral/)이라는 Code LLM 모델을 설치 및 설정해서 사용해보았습니다.


<!-- TODO: 이미지 추가 - 파일명: codestral.drawio.png, 원본: https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fd16ab49b-c880-41d3-8de9-a0ddfb671740%2Ff64bdb87-0c86-4059-964b-09bc49f9fa00%2Fcodestral.drawio.png?table=block&id=44083d93-a33c-43f7-b3f7-09a04161b7c8&cache=v2 -->

![시스템 구성도](https://img-src.io/taehun/ollama-codestral/1.png)


시스템 구성도

위와 같이 GPU 서버에 ollama와 Codestral 모델을 설치하여 API로 사내 개발자들이 모두 사용할 수 있도록 구성했습니다. Codestral은 파라메터 크기가 커서 로컬에서 실행 하기엔 메모리 사용량이 부담됩니다.

## Ollama 설치 및 설정

1. GPU 서버에 ollama를 설치 합니다.

```bash
sudo curl -L https://ollama.com/download/ollama-linux-amd64 -o /usr/bin/ollama
sudo chmod +x /usr/bin/ollama
```

2. ollama Systemd 서비스를 설정 합니다.

ollama 계정을 만듭니다.

```bash
sudo useradd -r -s /bin/false -m -d /usr/share/ollama ollama
```

아래와 같이 `/etc/systemd/system/ollama.service` 파일을 작성합니다.

```toml
[Unit]
Description=Ollama Service
After=network-online.target

[Service]
ExecStart=/usr/bin/ollama serve
User=ollama
Group=ollama
Restart=always
RestartSec=3
Environment="OLLAMA_HOST=0.0.0.0"

[Install]
WantedBy=default.target
```

Systemd 서비스를 시작합니다.

```bash
sudo systemctl daemon-reload
sudo systemctl enable ollama
sudo systemctl start ollama
```

ℹ️

**Ollama 서비스 포트**
서버에 방화벽이 설치되어 있으면, 11434 포트를 허용해주어야 합니다.

3. Codestral 모델을 GPU 서버에 설치합니다.

```
ollama pull codestral:22b
```

4. 개인 노트북에서 curl 커맨드로 GPU 서버에 REST 요청을 보내 확인 합니다. (GPU 서버 주소는 `192.168.1.123` 으로 가정)

```bash
curl http://192.168.1.123:11434/api/generate -d '{
  "model": "codestral:22b",
  "prompt": "안녕?"
}'
```

## VSCode 설정

1. VSCode에서 ollama + codestral을 사용하려면 Continue라는 확장을 설치 합니다.

- CMD + SHFIT + X → `Continue` 확장 검색

- `Continue` 확장 선택후 설치


<!-- TODO: 이미지 추가 - 파일명: 스크린샷_2024-07-14_오후_4.26.35.png, 원본: https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fd16ab49b-c880-41d3-8de9-a0ddfb671740%2F35a4bbd8-f2b4-45e3-894a-12e289ab41e1%2F%25E1%2584%2589%25E1%2585%25B3%25E1%2584%258F%25E1%2585%25B3%25E1%2584%2585%25E1%2585%25B5%25E1%2586%25AB%25E1%2584%2589%25E1%2585%25A3%25E1%2586%25BA_2024-07-14_%25E1%2584%258B%25E1%2585%25A9%25E1%2584%2592%25E1%2585%25AE_4.26.35.png?table=block&id=8e328608-e49c-4ccf-9602-d97ff1f1a095&cache=v2 -->

![notion image](https://img-src.io/taehun/ollama-codestral/2.png)


2. 우측 아래 Continue 확장을 클릭하여, 설정 파일을 수정 합니다. → *Configure autocomplete options* 메뉴 선택


<!-- TODO: 이미지 추가 - 파일명: 스크린샷_2024-07-14_오후_4.28.12.png, 원본: https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fd16ab49b-c880-41d3-8de9-a0ddfb671740%2Fbc596403-b148-4921-8984-d82c0e799d89%2F%25E1%2584%2589%25E1%2585%25B3%25E1%2584%258F%25E1%2585%25B3%25E1%2584%2585%25E1%2585%25B5%25E1%2586%25AB%25E1%2584%2589%25E1%2585%25A3%25E1%2586%25BA_2024-07-14_%25E1%2584%258B%25E1%2585%25A9%25E1%2584%2592%25E1%2585%25AE_4.28.12.png?table=block&id=37cabfa2-9d3d-4f5b-8ded-9130777b8ef4&cache=v2 -->

![notion image](https://img-src.io/taehun/ollama-codestral/3.png)


3. 설정파일의 `models` 항목과 `tabAutocompleteModel` 항목을 아래와 같이 수정합니다. GPU 서버 주소는 `192.168.1.123` 으로 가정 했습니다.

```json
{
    "models": [
        {
            "title": "Codestral",
            "provider": "ollama",
            "model": "codestral:22b",
            "apiBase": "http://192.168.1.123:11434"
        }
    ],
    "tabAutocompleteModel": {
        "title": "Codestral",
        "provider": "ollama",
        "model": "codestral:22b",
        "apiBase": "http://192.168.1.123:11434"
    }
}
```

이게 끝 입니다. 자세한 사용법은 **[How to use Continue](https://docs.continue.dev/how-to-use-continue)**문서를 참고하세요.

## 결론 및 사용 후기

기대가 크지 않아서 그런지, 생각보다 쓸 만합니다. 오픈소스 모델이라 무료라는 장점과 GPU 서버 및 로컬 네트워크 성능에 비례하여 코드 생성 속도도 빨라집니다. 아래와 같이 RAG로 커스터마이징도 가능합니다.


<!-- TODO: 이미지 추가 - 파일명: rag-coding-architecture-tabnine.png, 원본: https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fd16ab49b-c880-41d3-8de9-a0ddfb671740%2F5a1a392d-f2f1-4817-b969-483d1ca1d214%2Frag-coding-architecture-tabnine.png?table=block&id=c552f20d-4631-4957-a108-211396e28931&cache=v2 -->

![그림 출처&gt; https://thenewstack.io/enhancing-ai-coding-assistants-with-context-using-rag-and-sem-rag/](https://img-src.io/taehun/ollama-codestral/4.png)


*그림 출처>* *<https://thenewstack.io/enhancing-ai-coding-assistants-with-context-using-rag-and-sem-rag/>*

사용 시 느낀 단점은 GitHub Copilot 대비 문맥 파악이 좀 떨어지는 것 같았습니다. GitHub Copilot은 문맥에 맞게 코드를 생성해주는 반면, Codestral은 그런 부분에서 많이 부족해 보였습니다. 이러한 단점은 위와 같이 RAG와 Ollama 문맥 관리를 프로젝트별로 설정을 잘하면 개선할 수 있을 것입니다. 조만간 설치형 AI 코딩 보조 도구들도 나오겠네요.