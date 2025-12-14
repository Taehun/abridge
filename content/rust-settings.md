+++
title = "Rust 개발 환경 설정"
date = 2023-07-20
draft = false

[taxonomies]
tags = ['Rust']

[extra]
author = "김태훈"
toc = true
+++

ℹ️

Mac 터미널 환경과 VSCode 기준으로 작성하였습니다.

## Rust 설치하기

curl 커맨드를 사용하여 Rush 설치 스크립트를 다운로드하고 설치 합니다.

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

설치 및 버전 확인

```
rustc --version
```

결과


<!-- TODO: 이미지 추가 - 파일명: 스크린샷_2023-07-11_오후_10.40.23.png, 원본: https://www.notion.so/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fsecure.notion-static.com%2F5bbdfbd7-6a7d-49d7-ae4a-526e8d2a751f%2F%25E1%2584%2589%25E1%2585%25B3%25E1%2584%258F%25E1%2585%25B3%25E1%2584%2585%25E1%2585%25B5%25E1%2586%25AB%25E1%2584%2589%25E1%2585%25A3%25E1%2586%25BA_2023-07-11_%25E1%2584%258B%25E1%2585%25A9%25E1%2584%2592%25E1%2585%25AE_10.40.23.png?table=block&id=bf59d3c9-b6d1-497a-85c4-8db7ff148c89&cache=v2 -->

![notion image](https://img-src.io/taehun/rust-settings/1.png)


Rust는 `rustc` (컴파일러), `cargo` (프로젝트/패키지 관리자) 등이 포함된 Rust 툴체인을 관리하는 `rustup` 툴체인 관리 도구를 제공 합니다.

## 최신 버전으로 업데이트 하기

```
rustup update
```

결과


<!-- TODO: 이미지 추가 - 파일명: 스크린샷_2023-07-11_오후_10.43.19.png, 원본: https://www.notion.so/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fsecure.notion-static.com%2Fa9e3f61f-45bc-4abb-9918-2eee639027fa%2F%25E1%2584%2589%25E1%2585%25B3%25E1%2584%258F%25E1%2585%25B3%25E1%2584%2585%25E1%2585%25B5%25E1%2586%25AB%25E1%2584%2589%25E1%2585%25A3%25E1%2586%25BA_2023-07-11_%25E1%2584%258B%25E1%2585%25A9%25E1%2584%2592%25E1%2585%25AE_10.43.19.png?table=block&id=0d84446c-e31e-456c-8b95-761014c94398&cache=v2 -->

![notion image](https://img-src.io/taehun/rust-settings/2.png)


## Cargo: Rust 프로젝트/패키지 관리자

## 프로젝트 생성

`cargo` 커맨드로 Rust 프로젝트를 생성 할 수 있습니다.

```bash
$ cargo new rust-demo
$ cd rust-demo
```

- `cargo new` *`<프로젝트 이름>`*형식 입니다.

커맨드를 실행한 곳에 `rust-demo` 폴더가 생성되며, 아래와 같은 파일이 자동 생성 됩니다.

```
.
├── Cargo.toml
└── src
    └── main.rs
```

## 프로젝트 빌드 및 실행

cargo로 프로젝트를 빌드하여 실행 파일을 생성 할 수 있습니다.

```rust
cargo build
```

결과


<!-- TODO: 이미지 추가 - 파일명: 스크린샷_2023-07-11_오후_11.10.30.png, 원본: https://www.notion.so/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fsecure.notion-static.com%2Fa707e836-a7d4-4530-a2f8-77ffba389063%2F%25E1%2584%2589%25E1%2585%25B3%25E1%2584%258F%25E1%2585%25B3%25E1%2584%2585%25E1%2585%25B5%25E1%2586%25AB%25E1%2584%2589%25E1%2585%25A3%25E1%2586%25BA_2023-07-11_%25E1%2584%258B%25E1%2585%25A9%25E1%2584%2592%25E1%2585%25AE_11.10.30.png?table=block&id=ed9c22b5-7e4a-4e9f-976b-0b4997160e90&cache=v2 -->

![notion image](https://img-src.io/taehun/rust-settings/3.png)


실행 파일은 `./target/debug/` 폴더에 *<프로젝트 이름>*과 같은 파일로 생성 됩니다. (여기선 `rust-demo`)

아래과 같이 실행 해 볼 수 있습니다.

```
./target/debug/rust-demo
```

결과


<!-- TODO: 이미지 추가 - 파일명: 스크린샷_2023-07-11_오후_11.14.08.png, 원본: https://www.notion.so/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fsecure.notion-static.com%2Fce1761f8-c9e5-475e-b7ad-a0f24df545ef%2F%25E1%2584%2589%25E1%2585%25B3%25E1%2584%258F%25E1%2585%25B3%25E1%2584%2585%25E1%2585%25B5%25E1%2586%25AB%25E1%2584%2589%25E1%2585%25A3%25E1%2586%25BA_2023-07-11_%25E1%2584%258B%25E1%2585%25A9%25E1%2584%2592%25E1%2585%25AE_11.14.08.png?table=block&id=9d4a314f-af9b-4625-995d-d6edd8251ff4&cache=v2 -->

![notion image](https://img-src.io/taehun/rust-settings/4.png)


디버깅 심볼등을 제외한 릴리즈용 실행 파일은 `-r`(또는 `--release`)옵션을 추가하여 빌드 합니다.

```rust
cargo build -r
```

결과


<!-- TODO: 이미지 추가 - 파일명: 스크린샷_2023-07-11_오후_11.16.57.png, 원본: https://www.notion.so/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fsecure.notion-static.com%2Fc614b5ae-3329-4150-92de-518333bb6524%2F%25E1%2584%2589%25E1%2585%25B3%25E1%2584%258F%25E1%2585%25B3%25E1%2584%2585%25E1%2585%25B5%25E1%2586%25AB%25E1%2584%2589%25E1%2585%25A3%25E1%2586%25BA_2023-07-11_%25E1%2584%258B%25E1%2585%25A9%25E1%2584%2592%25E1%2585%25AE_11.16.57.png?table=block&id=f33c1680-cdf7-418c-bc2a-fa729c61774e&cache=v2 -->

![notion image](https://img-src.io/taehun/rust-settings/5.png)


`cargo run` 으로 빌드와 실행을 한번에 할 수도 있습니다.

```rust
cargo run
```

결과


<!-- TODO: 이미지 추가 - 파일명: 스크린샷_2023-07-11_오후_11.18.35.png, 원본: https://www.notion.so/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fsecure.notion-static.com%2F2ca3b71d-ad0b-4cdd-840d-1738b924ae0e%2F%25E1%2584%2589%25E1%2585%25B3%25E1%2584%258F%25E1%2585%25B3%25E1%2584%2585%25E1%2585%25B5%25E1%2586%25AB%25E1%2584%2589%25E1%2585%25A3%25E1%2586%25BA_2023-07-11_%25E1%2584%258B%25E1%2585%25A9%25E1%2584%2592%25E1%2585%25AE_11.18.35.png?table=block&id=51ceb96e-3934-4540-82a9-0900cc4d4317&cache=v2 -->

![notion image](https://img-src.io/taehun/rust-settings/6.png)


`cargo run` 으로 빌드와 실행을 한번에 할 수 있습니다.

```rust
cargo run
```

결과


<!-- TODO: 이미지 추가 - 파일명: 스크린샷_2023-07-12_오전_12.45.08.png, 원본: https://www.notion.so/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fsecure.notion-static.com%2F632305cc-e4b2-4aeb-90e3-5c8eacb57474%2F%25E1%2584%2589%25E1%2585%25B3%25E1%2584%258F%25E1%2585%25B3%25E1%2584%2585%25E1%2585%25B5%25E1%2586%25AB%25E1%2584%2589%25E1%2585%25A3%25E1%2586%25BA_2023-07-12_%25E1%2584%258B%25E1%2585%25A9%25E1%2584%258C%25E1%2585%25A5%25E1%2586%25AB_12.45.08.png?table=block&id=4554a39e-9f85-48a2-a9fe-8a805c191753&cache=v2 -->

![notion image](https://img-src.io/taehun/rust-settings/7.png)


## Crate 바이너리 설치

`cargo install` 로 [crates.io](http://crates.io) 에 배포된 crate 바이너리를 설치 할 수 있습니다. (`go install` 같은 것)

```rust
cargo install wasm-pack
```

결과


<!-- TODO: 이미지 추가 - 파일명: 스크린샷_2023-07-12_오전_12.56.34.png, 원본: https://www.notion.so/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fsecure.notion-static.com%2F54351304-fc8a-4eb2-9906-0db5f939b539%2F%25E1%2584%2589%25E1%2585%25B3%25E1%2584%258F%25E1%2585%25B3%25E1%2584%2585%25E1%2585%25B5%25E1%2586%25AB%25E1%2584%2589%25E1%2585%25A3%25E1%2586%25BA_2023-07-12_%25E1%2584%258B%25E1%2585%25A9%25E1%2584%258C%25E1%2585%25A5%25E1%2586%25AB_12.56.34.png?table=block&id=4e582126-6c26-4095-a846-837b5dd5accc&cache=v2 -->

![notion image](https://img-src.io/taehun/rust-settings/8.png)


## 자주쓰는 Cargo 명령어 정리

- `cargo new`로 새 프로젝트를 생성할 수 있습니다.

- `cargo build` 명령으로 프로젝트를 빌드할 수 있습니다.

- `cargo run` 명령어는 한 번에 프로젝트를 빌드하고 실행할 수 있습니다.

- `cargo check` 명령으로 바이너리를 생성하지 않고 프로젝트의 에러를 체크할 수 있습니다.

- `cargo test` 명령으로 자동화 테스트를 수행 합니다.

- `cargo add` 명령으로 Crate를 추가합니다. (From [crates.io](http://crates.io))

- `cargo install` 명령으로 Crate 바이너리를 설치 합니다.

## VSCode 설정

## Rust 관련 추천 Extensions

- **[rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)** **→ VSCode Rust 필수 확장 프로그램**

- [Rust Extension Pack](https://marketplace.visualstudio.com/items?itemName=swellaby.rust-pack) → VSCode Rust 개발에 많이 사용되는 확장 모음집

- [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
- [crates](https://marketplace.visualstudio.com/items?itemName=serayuzgur.crates) → Cargo.toml 파일로 의존성 관리를 편리하게 해줌
- [Better TOML](https://marketplace.visualstudio.com/items?itemName=bungcip.better-toml) → .toml 파일 (Rust 진영에서 많이 사용되는 설정파일 포맷) 쓰기 편하게 도와줌

## Neovim 설정

## **AstroNvim 확장에 Rust 설정**

기존 Neovim 설정이 있으면, 백업을 해둡니다.

```bash
mv ~/.config/nvim ~/.config/nvimbackup
```

AstroNvim을 설치합니다.

```bash
git clone https://github.com/AstroNvim/AstroNvim ~/.config/nvim
```

플러그인 설치를 위해 nvim 패키지 매니저를 실행합니다.

```
nvim +PackerSync
```

nvim을 실행하고, `LspInstall` 로 Rust analyzer를 설치 합니다.

```
nvim .
```

- nvim 명령행

```
:LspInstall rust
```

→ `rust_analyzer` 선택

결과


<!-- TODO: 이미지 추가 - 파일명: 스크린샷_2023-07-12_오후_11.49.45.png, 원본: https://www.notion.so/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fsecure.notion-static.com%2Fd221956e-e290-4841-a01d-c20b9ee402b3%2F%25E1%2584%2589%25E1%2585%25B3%25E1%2584%258F%25E1%2585%25B3%25E1%2584%2585%25E1%2585%25B5%25E1%2586%25AB%25E1%2584%2589%25E1%2585%25A3%25E1%2586%25BA_2023-07-12_%25E1%2584%258B%25E1%2585%25A9%25E1%2584%2592%25E1%2585%25AE_11.49.45.png?table=block&id=133d137f-e4dd-4c14-8ca1-dda4dfedb8ba&cache=v2 -->

![notion image](https://img-src.io/taehun/rust-settings/9.png)


`tree-snitter` (Rust용 구문 분석기)도 설치 합니다.

- nvim 명령행

```
:TSInstall rust
```

## 테스트 작성법

## 유닛 테스트

Rust의 유닛 테스트는 테스트 대상과 **같은 파일**내 **`tests`** **모듈**을 만들고, **`cfg(test)`**를 어노테이션하는 게 일반적인 관례입니다.

- [`add.rs`](http://add.rs)

```rust
pub fn add(a: i32, b: i32) -> i32 {
    a + b
}

#[cfg(test)]
mod tests {
    // Note this useful idiom: importing names from outer (for mod tests) scope.
    use super::*;

    #[test]
    fn test_add() {
        assert_eq!(add(1, 2), 3);
    }
}
```

`#[cfg(test)]` 는 이 코드가 `cargo build` 가 아닌 `cargo test` 명령어 실행시에만 컴파일 및 실행되도록 지정하는 것 입니다.

## 통합 테스트

통합 테스트는 `tests` 폴더 아래 작성 합니다. 예를 들면, 아래와 같은 디렉터리 구조가 될 수 있습니다.

```
adder
├── Cargo.lock
├── Cargo.toml
├── src
│   └── lib.rs
└── tests
    └── integration_test.rs
```

- `src/lib.rs`

```rust
pub fn add(a: i32, b: i32) -> i32 {
    a + b
}
```

- `tests/integration_test.rs`

```rust
#[test]
fn it_adds_two() {
    assert_eq!(4, adder::add(2, 2));
}
```

통합 테스트도 `cargo test` 커맨드로 실행 합니다.

```rust
cargo test
```

결과


<!-- TODO: 이미지 추가 - 파일명: 스크린샷_2023-07-13_오전_1.12.23.png, 원본: https://www.notion.so/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fsecure.notion-static.com%2F91182eee-df23-4d16-a12e-41d966120a8d%2F%25E1%2584%2589%25E1%2585%25B3%25E1%2584%258F%25E1%2585%25B3%25E1%2584%2585%25E1%2585%25B5%25E1%2586%25AB%25E1%2584%2589%25E1%2585%25A3%25E1%2586%25BA_2023-07-13_%25E1%2584%258B%25E1%2585%25A9%25E1%2584%258C%25E1%2585%25A5%25E1%2586%25AB_1.12.23.png?table=block&id=31765350-1443-46cb-a3fa-41185e8827e6&cache=v2 -->

![notion image](https://img-src.io/taehun/rust-settings/10.png)


## 생성형 AI 활용

## ChatGPT

Code Interpreter로 ONNX 모델 파일 REST API 추론 서비스 코드 작성하기

1. **+** 버튼 클릭후 `.onnx` 모델 파일 업로드 (최대 100MB)

2. 프롬프트 작성

- 프롬프트

```
Generate actix-web source code to inference uploaded model
```

결과


<!-- TODO: 이미지 추가 - 파일명: 스크린샷_2023-07-13_오전_2.08.23.png, 원본: https://www.notion.so/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fsecure.notion-static.com%2Fbd390cbc-8192-4023-bee7-3bde0186e0bf%2F%25E1%2584%2589%25E1%2585%25B3%25E1%2584%258F%25E1%2585%25B3%25E1%2584%2585%25E1%2585%25B5%25E1%2586%25AB%25E1%2584%2589%25E1%2585%25A3%25E1%2586%25BA_2023-07-13_%25E1%2584%258B%25E1%2585%25A9%25E1%2584%258C%25E1%2585%25A5%25E1%2586%25AB_2.08.23.png?table=block&id=0157608e-c6e5-454c-ab25-1b4afca1d33c&cache=v2 -->

![notion image](https://img-src.io/taehun/rust-settings/11.png)


Rust 코드로 변환 하기

- 프롬프트

```python
from xgboost import XGBClassifier
# read data
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
data = load_iris()
X_train, X_test, y_train, y_test = train_test_split(data['data'], data['target'], test_size=.2)
# create model instance
bst = XGBClassifier(n_estimators=2, max_depth=2, learning_rate=1, objective='binary:logistic')
# fit model
bst.fit(X_train, y_train)
# make predictions
preds = bst.predict(X_test)
---
Convert this code to Rust
```

결과


<!-- TODO: 이미지 추가 - 파일명: 스크린샷_2023-07-13_오전_2.17.23.png, 원본: https://www.notion.so/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fsecure.notion-static.com%2Fef11bad5-9f35-483b-bb85-18df99c60ccb%2F%25E1%2584%2589%25E1%2585%25B3%25E1%2584%258F%25E1%2585%25B3%25E1%2584%2585%25E1%2585%25B5%25E1%2586%25AB%25E1%2584%2589%25E1%2585%25A3%25E1%2586%25BA_2023-07-13_%25E1%2584%258B%25E1%2585%25A9%25E1%2584%258C%25E1%2585%25A5%25E1%2586%25AB_2.17.23.png?table=block&id=f70a0d1b-637b-459f-b656-d8d9d2bd4278&cache=v2 -->

![notion image](https://img-src.io/taehun/rust-settings/12.png)


개발 가이드

- 프롬프트

```
How to develop CLI tools using Rust?
```

결과


<!-- TODO: 이미지 추가 - 파일명: 스크린샷_2023-07-13_오전_2.20.18.png, 원본: https://www.notion.so/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fsecure.notion-static.com%2F6ce09faf-6563-49d7-98b7-62c9445e4001%2F%25E1%2584%2589%25E1%2585%25B3%25E1%2584%258F%25E1%2585%25B3%25E1%2584%2585%25E1%2585%25B5%25E1%2586%25AB%25E1%2584%2589%25E1%2585%25A3%25E1%2586%25BA_2023-07-13_%25E1%2584%258B%25E1%2585%25A9%25E1%2584%258C%25E1%2585%25A5%25E1%2586%25AB_2.20.18.png?table=block&id=d475ca68-f363-4548-aab9-e8a76af6adce&cache=v2 -->

![notion image](https://img-src.io/taehun/rust-settings/13.png)


## Copilot Labs

ChatGPT와 연동된 Copilot Labs를 사용하면 매우 편리합니다. VSCode 내에서 코드나 주석을 Drag해서 다음과 같은 작업을 할 수 있습니다:

- 코드 생성

- 코드 분석

- 테스트 코드 작성

- 문서 작업 (주석)

- 리팩터링

아직 Preview 단계라 신청후 사용이 가능합니다.

- <https://githubnext.com/projects/copilot-labs/>


<!-- TODO: 이미지 추가 - 파일명: 160909091-70c1d70c-2850-4483-91ed-4de87efe5285.gif, 원본: https://www.notion.so/image/https%3A%2F%2Fuser-images.githubusercontent.com%2F8978670%2F160909091-70c1d70c-2850-4483-91ed-4de87efe5285.gif?table=block&id=58f48a3d-b310-4707-a69f-06030f79e703&cache=v2 -->

![notion image](https://img-src.io/taehun/rust-settings/14.gif)


## 참고 링크

- <https://rust-kr.github.io/doc.rust-kr.org/title-page.html>

- <https://code.visualstudio.com/docs/languages/rust>

- <https://rusty-ferris.pages.dev/blog/using-nvim-for-rust-development/>