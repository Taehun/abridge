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

> Mac 터미널 환경과 VSCode 기준으로 작성하였습니다.

## Rust 설치하기

curl 커맨드를 사용하여 Rush 설치 스크립트를 다운로드하고 설치 합니다.

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

설치 및 버전 확인

```bash
rustc --version
```

결과

<p align="center">
<img src="https://img-src.io/taehun/rust-settings/1.png?w=800" alt="rustc version">
</p>

Rust는 `rustc` (컴파일러), `cargo` (프로젝트/패키지 관리자) 등이 포함된 Rust 툴체인을 관리하는 `rustup` 툴체인 관리 도구를 제공 합니다.

## 최신 버전으로 업데이트 하기

```bash
rustup update
```

결과

<p align="center">
<img src="https://img-src.io/taehun/rust-settings/2.png?w=800" alt="rustup update">
</p>

## Cargo: Rust 프로젝트/패키지 관리자

### 프로젝트 생성

`cargo` 커맨드로 Rust 프로젝트를 생성 할 수 있습니다.

```bash
cargo new rust-demo
cd rust-demo
```

- `cargo new` *`<프로젝트 이름>`* 형식 입니다.

커맨드를 실행한 곳에 `rust-demo` 폴더가 생성되며, 아래와 같은 파일이 자동 생성 됩니다.

```text
.
├── Cargo.toml
└── src
    └── main.rs
```

### 프로젝트 빌드 및 실행

cargo로 프로젝트를 빌드하여 실행 파일을 생성 할 수 있습니다.

```rust
cargo build
```

결과

<p align="center">
<img src="https://img-src.io/taehun/rust-settings/3.png?w=800" alt="cargo build">
</p>

실행 파일은 `./target/debug/` 폴더에 *<프로젝트 이름>*과 같은 파일로 생성 됩니다. (여기선 `rust-demo`)

아래과 같이 실행 해 볼 수 있습니다.

```bash
./target/debug/rust-demo
```

결과

<p align="center">
<img src="https://img-src.io/taehun/rust-settings/4.png?w=800" alt="실행 결과">
</p>

디버깅 심볼등을 제외한 릴리즈용 실행 파일은 `-r`(또는 `--release`)옵션을 추가하여 빌드 합니다.

```bash
cargo build -r
```

결과

<p align="center">
<img src="https://img-src.io/taehun/rust-settings/5.png?w=800" alt="cargo build -r">
</p>

`cargo run` 으로 빌드와 실행을 한번에 할 수도 있습니다.

```bash
cargo run
```

결과

<p align="center">
<img src="https://img-src.io/taehun/rust-settings/6.png?w=800" alt="cargo run">
</p>

`cargo run` 으로 빌드와 실행을 한번에 할 수 있습니다.

```bash
cargo run
```

결과

<p align="center">
<img src="https://img-src.io/taehun/rust-settings/7.png?w=800" alt="cargo run 결과">
</p>

### Crate 바이너리 설치

`cargo install` 로 [crates.io](http://crates.io) 에 배포된 crate 바이너리를 설치 할 수 있습니다. (`go install` 같은 것)

```bash
cargo install wasm-pack
```

결과

<p align="center">
<img src="https://img-src.io/taehun/rust-settings/8.png?w=800" alt="cargo install">
</p>

### 자주쓰는 Cargo 명령어 정리

- `cargo new`로 새 프로젝트를 생성할 수 있습니다.
- `cargo build` 명령으로 프로젝트를 빌드할 수 있습니다.
- `cargo run` 명령어는 한 번에 프로젝트를 빌드하고 실행할 수 있습니다.
- `cargo check` 명령으로 바이너리를 생성하지 않고 프로젝트의 에러를 체크할 수 있습니다.
- `cargo test` 명령으로 자동화 테스트를 수행 합니다.
- `cargo add` 명령으로 Crate를 추가합니다. (From [crates.io](http://crates.io))
- `cargo install` 명령으로 Crate 바이너리를 설치 합니다.

## VSCode 설정

### Rust 관련 추천 Extensions

- **[rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)** **→ VSCode Rust 필수 확장 프로그램**
- [Rust Extension Pack](https://marketplace.visualstudio.com/items?itemName=swellaby.rust-pack) → VSCode Rust 개발에 많이 사용되는 확장 모음집
- [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
- [crates](https://marketplace.visualstudio.com/items?itemName=serayuzgur.crates) → Cargo.toml 파일로 의존성 관리를 편리하게 해줌
- [Better TOML](https://marketplace.visualstudio.com/items?itemName=bungcip.better-toml) → .toml 파일 (Rust 진영에서 많이 사용되는 설정파일 포맷) 쓰기 편하게 도와줌

## Neovim 설정

### AstroNvim 확장에 Rust 설정

기존 Neovim 설정이 있으면, 백업을 해둡니다.

```bash
mv ~/.config/nvim ~/.config/nvimbackup
```

AstroNvim을 설치합니다.

```bash
git clone https://github.com/AstroNvim/AstroNvim ~/.config/nvim
```

플러그인 설치를 위해 nvim 패키지 매니저를 실행합니다.

```bash
nvim +PackerSync
```

nvim을 실행하고, `LspInstall` 로 Rust analyzer를 설치 합니다.

```bash
nvim .
```

- nvim 명령행

```nvim
:LspInstall rust
```

→ `rust_analyzer` 선택

결과

<p align="center">
<img src="https://img-src.io/taehun/rust-settings/9.png?w=800" alt="LspInstall rust">
</p>

`tree-snitter` (Rust용 구문 분석기)도 설치 합니다.

- nvim 명령행

```nvim
:TSInstall rust
```

## 테스트 작성법

### 유닛 테스트

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

### 통합 테스트

통합 테스트는 `tests` 폴더 아래 작성 합니다. 예를 들면, 아래와 같은 디렉터리 구조가 될 수 있습니다.

```text
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

<p align="center">
<img src="https://img-src.io/taehun/rust-settings/10.png?w=800" alt="cargo test">
</p>

## 생성형 AI 활용

### ChatGPT

Code Interpreter로 ONNX 모델 파일 REST API 추론 서비스 코드 작성하기

1. **+** 버튼 클릭후 `.onnx` 모델 파일 업로드 (최대 100MB)
2. 프롬프트 작성
   - 프롬프트

```Prompt
Generate actix-web source code to inference uploaded model
```

결과

<p align="center">
<img src="https://img-src.io/taehun/rust-settings/11.png?w=800" alt="ChatGPT Code Interpreter">
</p>

Rust 코드로 변환 하기

- 프롬프트

```Prompt
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

<p align="center">
<img src="https://img-src.io/taehun/rust-settings/12.png?w=800" alt="Python to Rust 변환">
</p>

개발 가이드

- 프롬프트

```Prompt
How to develop CLI tools using Rust?
```

결과
<p align="center">
<img src="https://img-src.io/taehun/rust-settings/13.png?w=800" alt="ChatGPT 개발 가이드">
</p>

### Copilot Labs

ChatGPT와 연동된 Copilot Labs를 사용하면 매우 편리합니다. VSCode 내에서 코드나 주석을 Drag해서 다음과 같은 작업을 할 수 있습니다:

- 코드 생성
- 코드 분석
- 테스트 코드 작성
- 문서 작업 (주석)
- 리팩터링

아직 Preview 단계라 신청후 사용이 가능합니다.

- <https://githubnext.com/projects/copilot-labs/>

<p align="center">
<img src="https://img-src.io/taehun/rust-settings/14.gif" alt="Copilot Labs 데모">
</p>

## 참고 링크

- <https://rust-kr.github.io/doc.rust-kr.org/title-page.html>
- <https://code.visualstudio.com/docs/languages/rust>
- <https://rusty-ferris.pages.dev/blog/using-nvim-for-rust-development/>
