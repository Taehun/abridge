+++
title = "[번역] Actix 문서"
date = 2023-08-13
draft = false

[taxonomies]
tags = ['Rust', 'Actix']

[extra]
author = "김태훈"
toc = true
+++

ℹ️

원서 링크: <https://actix.rs/docs/>

## 소개

### **Actix에 오신 것을 환영합니다**

Actix Web을 사용하면 Rust에서 웹 서비스를 빠르고 자신 있게 개발할 수 있으며 이 가이드를 통해 금방 시작할 수 있습니다.

이 웹사이트의 문서는 주로 Actix Web 프레임워크에 중점을 두고 있습니다. Actix라는 액터 프레임워크에 대한 자세한 내용은 [Actix 챕터](https://actix.rs/docs/actix/)(또는 하위 레벨 [Actix API 문서](https://docs.rs/actix/latest/actix/))를 확인하세요. 그렇지 않다면 [시작 가이드](https://actix.rs/docs/getting-started/)로 이동하세요. 이미 사용법을 알고 있고 구체적인 정보가 필요하다면 [Actix Web API 문서](https://docs.rs/actix-web/latest/actix_web/)를 읽어보세요.

### Actix Web은 Crates 에코시스템의 일부입니다

오래 전 Actix Web은 `actix` 액터 프레임워크 위에 구축되었습니다. 이제 Actix Web은 액터 프레임워크와 거의 관련이 없으며 다른 시스템을 사용하여 구축되었습니다. `actix`는 여전히 유지되고 있지만, futures 및 async/await 생태계가 성숙해짐에 따라 일반적인 도구로서의 유용성은 줄어들고 있습니다. 현재 `actix` 사용은 웹소켓 엔드포인트에만 필요합니다.

우리는 Actix Web을 강력하고 실용적인 프레임워크라고 부릅니다. 모든 의도와 목적을 위해 몇 가지 변형이 가미된 마이크로 프레임워크입니다. 이미 Rust 프로그래머라면 금방 적응할 수 있겠지만, 다른 프로그래밍 언어 출신이라도 Actix Web을 쉽게 익힐 수 있습니다.

Actix Web으로 개발된 애플리케이션은 기본 실행 파일에 포함된 HTTP 서버를 노출합니다. 이 서버를 nginx와 같은 다른 HTTP 서버 뒤에 배치하거나 그대로 제공할 수 있습니다. 다른 HTTP 서버가 전혀 없는 경우에도 Actix Web은 HTTP/1 및 HTTP/2 지원은 물론 TLS(HTTPS)를 제공할 수 있을 만큼 강력합니다. 따라서 프로덕션 준비가 완료된 소규모 서비스를 구축하는 데 유용합니다.

가장 중요한 것은: Actix Web은 Rust 1.59 이상에서 실행되며 안정적인 릴리스에서 작동합니다.

## 기본

### 시작하기

#### Rust 설치

아직 Rust를 설치하지 않으셨다면 rustup을 사용해 Rust 설치를 관리하실 것을 권장합니다. [공식 Rust 가이드](https://doc.rust-lang.org/book/ch01-01-installation.html)에 시작하기 섹션이 잘 정리되어 있습니다.

Actix Web의 현재 지원되는 최소 Rust 버전(MSRV)은 1.59입니다. 러스트업 업데이트를 실행하면 가장 최신의 Rust 버전을 사용할 수 있습니다. 따라서 이 가이드에서는 Rust 1.59 이상을 실행하고 있다고 가정합니다.

#### **Hello, world!**

먼저 바이너리 기반 Cargo 프로젝트를 새로 생성하고 새 디렉토리로 변경합니다:

```rust
cargo new hello-world
cd hello-world
```

`Cargo.toml` 파일에 다음을 추가하여 프로젝트의 종속성으로 `actix-web`을 추가합니다.

```toml
[dependencies]
actix-web = "4"
```

요청 핸들러는 0개 이상의 매개변수를 허용하는 비동기 함수를 사용합니다. 이러한 매개변수는 요청에서 추출할 수 있으며(`FromRequest` 특성 참조), `HttpResponse`로 변환할 수 있는 유형을 반환합니다(`Responder` trait 참조):

`src/main.rs`의 내용을 다음과 같이 바꿉니다:

```rust
use actix_web::{get, post, web, App, HttpResponse, HttpServer, Responder};

#[get("/")]
async fn hello() -> impl Responder {
    HttpResponse::Ok().body("Hello world!")
}

#[post("/echo")]
async fn echo(req_body: String) -> impl Responder {
    HttpResponse::Ok().body(req_body)
}

async fn manual_hello() -> impl Responder {
    HttpResponse::Ok().body("Hey there!")
}
```

이러한 핸들러 중 일부는 기본 제공 매크로를 사용하여 라우팅 정보를 직접 첨부합니다. 이를 통해 처리기가 응답해야 하는 메서드와 경로를 지정할 수 있습니다. `manual_hello`(즉, 라우팅 매크로를 사용하지 않는 경로)를 등록하는 방법은 아래에서 확인할 수 있습니다.

다음으로 `App` 인스턴스를 생성하고 요청 핸들러를 등록합니다. 라우팅 매크로를 사용하는 핸들러에는 `App::service`를, 수동으로 라우팅된 핸들러에는 `App::route`를 사용하여 경로와 메서드를 선언합니다. 마지막으로, 앱은 앱을 "애플리케이션 팩토리"로 사용하여 들어오는 요청을 처리할 `HttpServer` 내부에서 시작됩니다.

`src/main.rs`에 다음과 같은 `main` 함수를 추가합니다:

```rust
#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new()
            .service(hello)
            .service(echo)
            .route("/hey", web::get().to(manual_hello))
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}
```

이게 전부 입니다! `cargo run`으로 프로그램을 컴파일하고 실행합니다. `#[actix_web::main]` 매크로는 actix 런타임 내에서 비동기 메인 함수를 실행합니다. 이제 `http://127.0.0.1:8080/` 또는 정의한 다른 경로로 이동하여 결과를 확인할 수 있습니다.

### 애플리케이션 작성

`actix-web`은 Rust로 웹 서버와 애플리케이션을 구축하기 위한 다양한 기본 요소를 제공합니다. 라우팅, 미들웨어, 요청의 전처리, 응답의 후처리 등을 제공합니다.

모든 `actix-web` 서버는 `App` 인스턴스를 중심으로 구축됩니다. 리소스 및 미들웨어에 대한 경로를 등록하는 데 사용됩니다. 또한 동일한 범위 내의 모든 핸들러에서 공유되는 애플리케이션 상태를 저장합니다.

애플리케이션의 `scope`는 모든 경로의 네임스페이스 역할을 합니다. 즉, 특정 애플리케이션 scope에 대한 모든 경로는 동일한 URL 경로 접두사를 갖습니다. 애플리케이션 접두사에는 항상 선행 "/" 슬래시가 포함됩니다. 제공된 접두사에 선행 슬래시가 포함되지 않은 경우 자동으로 삽입됩니다. 접두사는 값 경로 세그먼트로 구성되어야 합니다.

> scope가 `/app`인 애플리케이션의 경우 경로가 `/app`, `/app/` 또는 `/app/test`인 요청은 모두 일치하지만 경로 `/application`은 일치하지 않습니다.

```rust
use actix_web::{web, App, HttpServer, Responder};

async fn index() -> impl Responder {
    "Hello world!"
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new().service(
            // 모든 리소스 및 경로에 접두사를 붙입니다...
            web::scope("/app")
                // ...그래서 `GET /app/index.html` 요청을 처리합니다.
                .route("/index.html", web::get().to(index)),
        )
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}
```

이 예에서는 접두사가 `/app`인 애플리케이션과 `index.html` 리소스가 생성됩니다. 이 리소스는 `/app/index.html` URL로 사용할 수 있습니다.

> 자세한 내용은 [URL 디스패치](https://actix.rs/docs/url-dispatch) 섹션을 참조하세요.

#### 상태

애플리케이션 상태(state)는 동일한 범위(scope) 내의 모든 경로 및 리소스와 공유됩니다. 상태는 [`web::Data<T>`](https://docs.rs/actix-web/4/actix_web/web/struct.Data.html) 추출기를 사용하여 액세스할 수 있으며, 여기서 `T`는 상태의 타입 입니다. 상태는 미들웨어에서도 액세스할 수 있습니다.

간단한 애플리케이션을 작성하고 애플리케이션 이름을 상태에 저장해 보겠습니다:

```rust
use actix_web::{get, web, App, HttpServer};

// 이 구조체는 상태를 나타냅니다.
struct AppState {
    app_name: String,
}

#[get("/")]
async fn index(data: web::Data<AppState>) -> String {
    let app_name = &data.app_name; // <- app_name 가져오기
    format!("Hello {app_name}!") // <- app_name 응답
}
```

그런 다음 앱을 초기화 할 때의 상태를 전달하고 애플리케이션을 시작합니다:

```rust
#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new()
            .app_data(web::Data::new(AppState {
                app_name: String::from("Actix Web"),
            }))
            .service(index)
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}
```

애플리케이션 내에 상태 타입을 얼마든지 등록할 수 있습니다.

#### Shared Mutable State

`HttpServer`는 애플리케이션 인스턴스가 아닌 애플리케이션 팩토리를 허용합니다. `HttpServer`는 각 스레드에 대해 애플리케이션 인스턴스를 구성합니다. 따라서 애플리케이션 데이터는 여러 번 구성해야 합니다. 서로 다른 스레드 간에 데이터를 공유 하려면 공유 가능한 객체(예: `Send` + `Sync`)를 사용해야 합니다.

내부적으로 `Web::Data`는 `Arc`를 사용합니다. 따라서 두 개의 `Arc`를 생성하지 않으려면`App::app_data()`를 사용하여 데이터를 등록하기 전에 데이터를 생성해야 합니다.

다음 예제에서 *변경 가능한 공유 상태(Shared Mutable State)*를 가진 애플리케이션을 작성해 보겠습니다. 먼저 상태를 정의하고 핸들러를 생성합니다:

```rust
use actix_web::{web, App, HttpServer};
use std::sync::Mutex;

struct AppStateWithCounter {
    counter: Mutex<i32>, // <- 스레드 간에 안전하게 변경하려면 Mutex가 필요합니다.
}

async fn index(data: web::Data<AppStateWithCounter>) -> String {
    let mut counter = data.counter.lock().unwrap(); // <- counter의 MutexGuard 가져오기
    *counter += 1; // <- MutexGuard 내부의 counter 접근하기

    format!("Request number: {counter}") // <- count 응답
}
```

그리고, `App` 에 데이터를 등록 합니다:

```rust
#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // Note: HttpServer::new _외부_ 클로저를 web::Data로 생성
    let counter = web::Data::new(AppStateWithCounter {
        counter: Mutex::new(0),
    });

    HttpServer::new(move || {
        // counter 클로저로 move
        App::new()
            .app_data(counter.clone()) // <- 생성된 데이터 등록
            .route("/", web::get().to(index))
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}
```

핵심 사항:

- `HttpServer::new`로 전달된 클로저 내부에서 초기화된 state는 워커 스레드에 로컬이며 수정하면 동기화가 해제될 수 있습니다.

- 전역적으로 공유되는 state를 얻으려면 HttpServer::new로 전달된 클로저 **외부**에서 state를 생성하고 이동/복제해야 합니다.

#### 애플리케이션 범위를 사용하여 애플리케이션 구성

`web::scope()` 메서드를 사용하면 리소스 그룹 접두사를 설정할 수 있습니다. 이 범위는 리소스 구성에 의해 추가되는 모든 리소스 패턴에 추가되는 리소스 접두사를 나타냅니다. 이를 사용하면 동일한 리소스 이름을 유지하면서 원래 작성자가 의도한 것과 다른 위치에 경로 집합을 마운트하는 데 도움이 될 수 있습니다.

예를 들어:

```rust
#[actix_web::main]
async fn main() {
    let scope = web::scope("/users").service(show_users);
    App::new().service(scope);
}
```

위의 예에서 `show_users` 경로는 애플리케이션의 범위 인수가 패턴 앞에 추가되기 때문에 `/show` 대신 `/users/show`의 유효한 경로 패턴을 갖게 됩니다. 그러면 URL 경로가 `/users/show`인 경우에만 경로가 일치하며, 경로 이름 `show_users`로 `HttpRequest.url_for()` 함수를 호출하면 동일한 경로의 URL을 생성합니다.

#### 애플리케이션 가드 및 가상 호스팅

가드는 요청 객체 참조를 받아 참 또는 거짓을 반환하는 간단한 함수라고 생각하면 됩니다. 공식적으로 가드는 `Guard` trait을 구현하는 모든 객체입니다. Actix Web은 여러 가드를 제공합니다. API 문서의 함수 섹션에서 확인할 수 있습니다.

제공되는 가드 중 하나는 `Host`입니다. 요청 헤더 정보를 기반으로 필터로 사용할 수 있습니다.

```rust
#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new()
            .service(
                web::scope("/")
                    .guard(guard::Host("www.rust-lang.org"))
                    .route("", web::to(|| async { HttpResponse::Ok().body("www") })),
            )
            .service(
                web::scope("/")
                    .guard(guard::Host("users.rust-lang.org"))
                    .route("", web::to(|| async { HttpResponse::Ok().body("user") })),
            )
            .route("/", web::to(HttpResponse::Ok))
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}
```

#### **Configure**

단순성과 재사용성을 위해 `App::Scope`와 `web::Scope` 모두 `configure` 메서드를 제공합니다. 이 함수는 구성의 일부를 다른 모듈이나 라이브러리로 옮길 때 유용합니다. 예를 들어, 리소스 구성의 일부를 다른 모듈로 이동할 수 있습니다.

```rust
use actix_web::{web, App, HttpResponse, HttpServer};

// 이 함수는 다른 모듈에 위치할 수 있습니다.
fn scoped_config(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::resource("/test")
            .route(web::get().to(|| async { HttpResponse::Ok().body("test") }))
            .route(web::head().to(HttpResponse::MethodNotAllowed)),
    );
}

// 이 함수는 다른 모듈에 위치할 수 있습니다.
fn config(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::resource("/app")
            .route(web::get().to(|| async { HttpResponse::Ok().body("app") }))
            .route(web::head().to(HttpResponse::MethodNotAllowed)),
    );
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new()
            .configure(config)
            .service(web::scope("/api").configure(scoped_config))
            .route(
                "/",
                web::get().to(|| async { HttpResponse::Ok().body("/") }),
            )
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}
```

위 예제의 결과는 다음과 같습니다:

```
/         -> "/"
/app      -> "app"
/api/test -> "test"
```

각 `ServiceConfig`는 자체 `data`, `routes`, `sevices`를 가질 수 있습니다.

### **HTTP 서버**

[HttpServer](https://docs.rs/actix-web/4.3.1/actix_web/struct.HttpServer.html) 타입은 HTTP 요청을 처리합니다.

`HttpServer`는 애플리케이션 팩토리를 매개변수로 사용하며, 애플리케이션 팩토리에는 `Send` + `Sync` 경계가 있어야 합니다. 이에 대한 자세한 내용은 멀티 스레딩 섹션에서 확인하세요.

웹 서버를 시작하려면 먼저 네트워크 소켓에 바인딩해야 합니다. 소켓 주소 튜플 또는 문자열 `("127.0.0.1", 8080)` 또는 `"0.0.0.0:8080"`과 같은 문자열과 함께 `HttpServer::bind()`를 사용합니다. 다른 애플리케이션에서 소켓을 사용 중이면 실패합니다.

`bind`에 성공하면 `HttpServer::run()`을 사용하여 `Server` 인스턴스를 반환합니다. `Server`는 요청 처리를 시작하기 위해 `await` 또는 `spawn`되어야 하며 종료 신호(예: 기본적으로 `ctrl-c`; 자세한 내용은 [여기](https://actix.rs/docs/server/#graceful-shutdown)를 참조하세요)를 받을 때까지 실행됩니다.

```rust
use actix_web::{web, App, HttpResponse, HttpServer};

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| App::new().route("/", web::get().to(HttpResponse::Ok)))
        .bind(("127.0.0.1", 8080))?
        .run()
        .await
}
```

#### 멀티 쓰레딩

`HttpServer`는 다수의 HTTP 워커를 자동으로 시작하며, 기본적으로 이 수는 시스템의 물리적 CPU 수와 동일합니다. 이 숫자는 `HttpServer::workers()` 메서드로 재정의할 수 있습니다.

```rust
use actix_web::{web, App, HttpResponse, HttpServer};

#[actix_web::main]
async fn main() {
    HttpServer::new(|| App::new().route("/", web::get().to(HttpResponse::Ok))).workers(4);
    // <- 워커 4개로 시작
}
```

워커가 생성되면 각각 요청을 처리하기 위해 별도의 애플리케이션 인스턴스를 받습니다. 애플리케이션 상태는 스레드 간에 공유되지 않으며, 핸들러는 동시성 문제 없이 상태의 복사본을 자유롭게 조작할 수 있습니다.

애플리케이션 상태는 `Send` 또는 `Sync`일 필요는 없지만 애플리케이션 팩토리는 `Send` + `Sync`여야 합니다.

워커 스레드 간에 상태를 공유하려면 `Arc`/`Data`를 사용하세요. 공유 및 동기화가 도입되면 특별한 주의를 기울여야 합니다. 많은 경우, 공유 상태를 수정할 수 없도록 잠그는 과정에서 실수로 성능 비용이 발생합니다.

[뮤텍스](https://doc.rust-lang.org/std/sync/struct.Mutex.html) 대신 [읽기/쓰기 잠금](https://doc.rust-lang.org/std/sync/struct.RwLock.html)을 사용하여 비배타적 잠금을 달성하는 등 보다 효율적인 잠금 전략을 사용하여 이러한 비용을 줄일 수 있는 경우도 있지만, 가장 성능이 우수한 구현은 잠금이 전혀 발생하지 않는 구현인 경우가 많습니다.

각 워커 스레드는 요청을 순차적으로 처리하기 때문에 현재 스레드를 블록하는 핸들러는 현재 워커의 새 요청 처리를 중단시킵니다:

```rust
fn my_handler() -> impl Responder {
    std::thread::sleep(Duration::from_secs(5)); // <-- 나쁜 사례! 현재 워커 쓰레드가 중단 됩니다!
    "response"
}
```

따라서 CPU에 바인딩되지 않는 긴 연산(예: I/O, 데이터베이스 연산 등)은 퓨처 또는 비동기 함수로 표현해야 합니다. 비동기 핸들러는 워커 스레드에서 동시에 실행되므로 실행을 블록하지 않습니다:

```
async fn my_handler() -> impl Responder {
    tokio::time::sleep(Duration::from_secs(5)).await; // <-- Ok. 워커 스레드는 여기서 다른 요청을 처리합니다.
    "response"
}
```

추출기(extractor)에도 동일한 제한이 적용됩니다. 핸들러 함수가 `FromRequest`를 구현하는 인수를 받고 해당 구현이 현재 스레드를 차단하는 경우, 핸들러를 실행할 때 워커 스레드가 차단됩니다. 바로 이러한 이유로 추출기를 구현할 때는 특별한 주의를 기울여야 하며, 필요한 경우 비동기로 구현해야 합니다.

#### **TLS / HTTPS**

Actix Web은 기본적으로 두 가지 TLS 구현, 즉 `rustls`와 `openssl`을 지원합니다.

`rustls` 크레이트 기능은 `rustls` 통합을 위한 기능이며 `openssl`은 `openssl` 통합을 위한 기능입니다.

```rust
[dependencies]
actix-web = { version = "4", features = ["openssl"] }
openssl = { version = "0.10" }
```

```
use actix_web::{get, App, HttpRequest, HttpServer, Responder};
use openssl::ssl::{SslAcceptor, SslFiletype, SslMethod};

#[get("/")]
async fn index(_req: HttpRequest) -> impl Responder {
    "Welcome!"
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // TLS 키를 로드하여 테스트용 자체 서명 임시 인증서를 만듭니다:
    // `openssl req -x509 -newkey rsa:4096 -nodes -keyout key.pem -out cert.pem -days 365 -subj '/CN=localhost'`
    let mut builder = SslAcceptor::mozilla_intermediate(SslMethod::tls()).unwrap();
    builder
        .set_private_key_file("key.pem", SslFiletype::PEM)
        .unwrap();
    builder.set_certificate_chain_file("cert.pem").unwrap();

    HttpServer::new(|| App::new().service(index))
        .bind_openssl("127.0.0.1:8080", builder)?
        .run()
        .await
}
```

key.pem 및 cert.pem을 만들려면 다음 명령을 사용합니다. **subject를 직접 입력합니다.**

```bash
$ openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem \
  -days 365 -sha256 -subj "/C=CN/ST=Fujian/L=Xiamen/O=TVlinux/OU=Org/CN=muro.lxd"
```

비밀번호를 제거하려면 nopass.pem을 key.pem에 복사합니다.

```bash
$ openssl rsa -in key.pem -out nopass.pem
```

#### **Keep-Alive**

Actix Web은 후속 요청을 기다리기 위해 연결을 열어 둡니다.

> keep alive 연결 동작은 서버 설정에 의해 정의됩니다.

- `Duration::from_secs(75)` 또는 `KeepAlive::Timeout(75)`: 75초 킵얼라이브 타이머를 활성화합니다.

- `KeepAlive::Os:` OS keep-alive를 사용합니다.

- `None` 또는 `KeepAlive::Disabled:` 는 keep-alive를 비활성화합니다.

```rust
use actix_web::{http::KeepAlive, HttpServer};
use std::time::Duration;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // keep-alive를 75초로 설정
    let _one = HttpServer::new(app).keep_alive(Duration::from_secs(75));

    // OS의 keep-alive 사용(보통 꽤 김)
    let _two = HttpServer::new(app).keep_alive(KeepAlive::Os);

    // keep-alive 비활성화
    let _three = HttpServer::new(app).keep_alive(None);

    Ok(())
}
```

위의 첫 번째 옵션을 선택하면 [연결 타입](https://docs.rs/actix-web/4.3.1/actix_web/http/enum.ConnectionType.html)을 `Close` 또는 `Upgrade`로 설정하는 등 응답에서 명시적으로 허용하지 않는 경우 HTTP/1.1 요청에 대해 keep-alive가 활성화됩니다. 연결 강제 종료는 `HttpResponseBuilder`의 `force_close()` 메서드를 사용하여 수행할 수 있습니다.

> Keep-alive는 HTTP/1.0의 경우 **off**, HTTP/1.1 및 HTTP/2.0의 경우 **on**

```rust
use actix_web::{http, HttpRequest, HttpResponse};

async fn index(_req: HttpRequest) -> HttpResponse {
    let mut resp = HttpResponse::Ok()
        .force_close() // <- HttpResponseBuilder에서 연결 닫기
        .finish();

    // 또는 HttpResponse 구조체에서 연결을 닫습니다.
    resp.head_mut().set_connection_type(http::ConnectionType::Close);

    resp
}
```

#### 우아한 종료

`HttpServer`는 우아한 종료를 지원합니다. 중지 신호를 받은 워커는 특정 시간 내에 요청을 완료해야 합니다. 시간 초과 후에도 여전히 살아있는 워커는 강제 종료됩니다. 기본적으로 종료 시간 제한은 30초로 설정되어 있습니다. 이 매개변수는 `HttpServer::shutdown_timeout()` 메서드를 사용하여 변경할 수 있습니다.

`HttpServer`는 여러 OS 신호를 처리합니다. *CTRL-C*는 모든 OS에서 사용할 수 있으며, 다른 신호는 유닉스 시스템에서 사용할 수 있습니다.

- *SIGINT* - 강제 종료 작업자

- *SIGTERM* - 유예 종료 작업자

- *SIGQUIT* - 강제 종료 작업자

> `HttpServer::disable_signals()` 메서드로 신호 처리를 비활성화할 수 있습니다.

### Type-safe 정보 추출

Actix Web은 추출기(extractor, `impl FromRequest`)라고 하는 type-safe 요청 정보 액세스를 위한 기능을 제공합니다. 빌트인 추출기 구현이 많이 있습니다([구현자](https://docs.rs/actix-web/latest/actix_web/trait.FromRequest.html#implementors) 참조).

추출기는 핸들러 함수에 대한 인수로 접근할 수 있습니다. Actix Web은 핸들러 함수당 최대 12개의 추출기를 지원합니다. 인자 위치는 중요하지 않습니다.

```rust
async fn index(path: web::Path<(String, String)>, json: web::Json<MyInfo>) -> impl Responder {
    let path = path.into_inner();
    format!("{} {} {} {}", path.0, path.1, json.id, json.username)
}
```

#### 경로

[경로](https://docs.rs/actix-web/4.3.1/actix_web/dev/struct.Path.html)는 요청의 경로에서 추출된 정보를 제공합니다. 경로에서 추출할 수 있는 부분을 "동적 세그먼트"라고 하며 중괄호로 표시됩니다. 경로에서 가변 세그먼트를 역직렬화할 수 있습니다.

예를 들어, `/users/{user_id}/{friend}` 경로에 등록된 리소스의 경우, `user_id`와 `friend`라는 두 개의 세그먼트를 역직렬화할 수 있습니다. 이러한 세그먼트는 선언된 순서대로 튜플로 추출될 수 있습니다(예: `Path<(u32, String)>`).

```rust
use actix_web::{get, web, App, HttpServer, Result};

/// "/users/{user_id}/{friend}" URL에서 경로 정보를 추출합니다.
/// {user_id} - u32로 역직렬화
/// {friend} - String으로 역직렬화
#[get("/users/{user_id}/{friend}")] // <- 경로 매개변수 정의
async fn index(path: web::Path<(u32, String)>) -> Result<String> {
    let (user_id, friend) = path.into_inner();
    Ok(format!("Welcome {}, user_id {}!", friend, user_id))
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| App::new().service(index))
        .bind(("127.0.0.1", 8080))?
        .run()
        .await
}
```

동적 세그먼트 이름과 필드 이름을 일치시켜 `serde`에서 `Deserialize` trait을 구현하는 타입으로 경로 정보를 추출할 수도 있습니다. 다음은 튜플 타입 대신 `serde`를 사용하는 동등한 예입니다.

```rust
use actix_web::{get, web, Result};
use serde::Deserialize;

#[derive(Deserialize)]
struct Info {
    user_id: u32,
    friend: String,
}

/// serde를 사용하여 경로 정보 추출
#[get("/users/{user_id}/{friend}")] // <- 경로 매개변수 정의
async fn index(info: web::Path<Info>) -> Result<String> {
    Ok(format!(
        "Welcome {}, user_id {}!",
        info.friend, info.user_id
    ))
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    use actix_web::{App, HttpServer};

    HttpServer::new(|| App::new().service(index))
        .bind(("127.0.0.1", 8080))?
        .run()
        .await
}
```

non-type-safe 대안으로, 핸들러 내에서 이름으로 경로 매개변수 요청을 쿼리([match\_info](https://docs.rs/actix-web/latest/actix_web/struct.HttpRequest.html#method.match_info) 문서 참조)하는 것도 가능합니다:

```rust
#[get("/users/{user_id}/{friend}")] // <- 경로 매개변수 정의
async fn index(req: HttpRequest) -> Result<String> {
    let name: String = req.match_info().get("friend").unwrap().parse().unwrap();
    let userid: i32 = req.match_info().query("user_id").parse().unwrap();

    Ok(format!("Welcome {}, user_id {}!", name, userid))
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    use actix_web::{App, HttpServer};

    HttpServer::new(|| App::new().service(index))
        .bind(("127.0.0.1", 8080))?
        .run()
        .await
}
```

#### 쿼리

`Query<T>` 타입은 요청의 쿼리 매개변수에 대한 추출 기능을 제공합니다. 그 아래에는 `serde_urlencoded` 크레이트가 사용됩니다.

```rust
use actix_web::{get, web, App, HttpServer};
use serde::Deserialize;

#[derive(Deserialize)]
struct Info {
    username: String,
}

// 쿼리가 `Info`로 성공적으로 역직렬화되면 이 핸들러가 호출됩니다.
// 그렇지 않으면 400 Bad Request 에러 응답이 반환됩니다.
#[get("/")]
async fn index(info: web::Query<Info>) -> String {
    format!("Welcome {}!", info.username)
}
```

#### JSON

`Json<T>`는 요청 본문을 구조체로 역직렬화할 수 있습니다. 요청 본문에서 타입 정보를 추출하려면 `T` 타입이 `serde::Deserialize`를 구현해야 합니다.

```rust
use actix_web::{post, web, App, HttpServer, Result};
use serde::Deserialize;

#[derive(Deserialize)]
struct Info {
    username: String,
}

/// 요청 본문에서 'Info'를 역직렬화합니다.
#[post("/submit")]
async fn submit(info: web::Json<Info>) -> Result<String> {
    Ok(format!("Welcome {}!", info.username))
}
```

일부 추출기는 추출 프로세스를 구성하는 방법을 제공합니다. 추출기를 구성하려면 해당 설정 객체를 리소스의 `.app_data()` 메서드에 전달합니다. Json 추출기의 경우 [JsonConfig](https://docs.rs/actix-web/4.3.1/actix_web/web/struct.JsonConfig.html)를 반환합니다. JSON 페이로드의 최대 크기와 사용자 정의 오류 처리기 함수를 구성할 수 있습니다.

다음 예제에서는 페이로드의 크기를 4kb로 제한하고 사용자 지정 오류 처리기를 사용합니다.

```rust
use actix_web::{error, web, App, HttpResponse, HttpServer, Responder};
use serde::Deserialize;

#[derive(Deserialize)]
struct Info {
    username: String,
}

/// 요청 본문에서 'Info'를 역직렬화, 최대 페이로드 크기는 4KB입니다.
async fn index(info: web::Json<Info>) -> impl Responder {
    format!("Welcome {}!", info.username)
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        let json_config = web::JsonConfig::default()
            .limit(4096)
            .error_handler(|err, _req| {
                // 사용자 지정 에러 응답 생성
                error::InternalError::from_response(err, HttpResponse::Conflict().finish())
                    .into()
            });

        App::new().service(
            web::resource("/")
                // JSON 추출기 설정 변경
                .app_data(json_config)
                .route(web::post().to(index)),
        )
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}
```

#### URL 인코딩 양식

URL로 인코딩된 양식 본문은 `Json<T>`와 마찬가지로 구조체로 추출할 수 있습니다. 이 유형은 `serde::Deserialize`를 구현해야 합니다.

`FormConfig`를 사용하면 추출 프로세스를 구성할 수 있습니다.

```rust
use actix_web::{post, web, App, HttpServer, Result};
use serde::Deserialize;

#[derive(Deserialize)]
struct FormData {
    username: String,
}

/// serde를 사용하여 form 데이터 추출
/// 이 핸들러는 콘텐츠 유형이 *x-www-form-urlencoded*이고,
/// 요청의 콘텐츠가 `FormData` 구조체로 역직렬화될 수 있는 경우에만 호출됩니다.
#[post("/")]
async fn index(form: web::Form<FormData>) -> Result<String> {
    Ok(format!("Welcome {}!", form.username))
}
```

#### **Other**

Actix Web은 그 외에도 다양한 추출기를 제공하며, 다음은 몇 가지 중요한 추출기입니다:

- [데이터](https://docs.rs/actix-web/4.3.1/actix_web/web/struct.Data.html) - 애플리케이션 상태의 일부에 액세스하는 데 사용됩니다.

- [HttpRequest](https://docs.rs/actix-web/4.3.1/actix_web/struct.HttpRequest.html) - 요청의 다른 부분에 액세스해야 하는 경우 `HttpRequest` 자체가 추출기입니다.

- `String` - 요청의 페이로드를 `String`로 변환할 수 있습니다. [예제](https://docs.rs/actix-web/4.3.1/actix_web/trait.FromRequest.html#impl-FromRequest-for-String)는 rustdoc에서 확인할 수 있습니다.

- [Bytes](https://docs.rs/actix-web/4.3.1/actix_web/web/struct.Bytes.html) - 요청의 페이로드를 바이트 단위로 변환할 수 있습니다. [예제](https://docs.rs/actix-web/4.3.1/actix_web/trait.FromRequest.html#impl-FromRequest-5)는 rustdoc에서 확인할 수 있습니다.

- [Payload](https://docs.rs/actix-web/4.3.1/actix_web/web/struct.Payload.html) - 주로 다른 추출기를 구축하기 위한 저수준 페이로드 추출기입니다. [예제](https://docs.rs/actix-web/4.3.1/actix_web/web/struct.Payload.html)는 rustdoc에서 확인할 수 있습니다.

#### 어플리케이션 상태 추출기

애플리케이션 상태는 `web::Data` 추출기를 사용하여 핸들러에서 액세스할 수 있지만, 상태는 읽기 전용 참조로 액세스할 수 있습니다. 상태에 대한 변경 가능한 액세스가 필요한 경우 이를 구현해야 합니다.

다음은 처리된 요청 수를 저장하는 핸들러의 예시입니다:

```rust
use actix_web::{web, App, HttpServer, Responder};
use std::cell::Cell;

#[derive(Clone)]
struct AppState {
    count: Cell<usize>,
}

async fn show_count(data: web::Data<AppState>) -> impl Responder {
    format!("count: {}", data.count.get())
}

async fn add_one(data: web::Data<AppState>) -> impl Responder {
    let count = data.count.get();
    data.count.set(count + 1);

    format!("count: {}", data.count.get())
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let data = AppState {
        count: Cell::new(0),
    };

    HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(data.clone()))
            .route("/", web::to(show_count))
            .route("/add", web::to(add_one))
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}
```

이 처리기는 작동하지만 `data.count`는 각 작업자 스레드가 처리한 요청의 수만 계산합니다. 모든 스레드에서 총 요청 수를 계산하려면 공유 `Arc` 및 [atomics](https://doc.rust-lang.org/std/sync/atomic/)를 사용해야 합니다.

```rust
use actix_web::{get, web, App, HttpServer, Responder};
use std::{
    cell::Cell,
    sync::atomic::{AtomicUsize, Ordering},
    sync::Arc,
};

#[derive(Clone)]
struct AppState {
    local_count: Cell<usize>,
    global_count: Arc<AtomicUsize>,
}

#[get("/")]
async fn show_count(data: web::Data<AppState>) -> impl Responder {
    format!(
        "global_count: {}\nlocal_count: {}",
        data.global_count.load(Ordering::Relaxed),
        data.local_count.get()
    )
}

#[get("/add")]
async fn add_one(data: web::Data<AppState>) -> impl Responder {
    data.global_count.fetch_add(1, Ordering::Relaxed);

    let local_count = data.local_count.get();
    data.local_count.set(local_count + 1);

    format!(
        "global_count: {}\nlocal_count: {}",
        data.global_count.load(Ordering::Relaxed),
        data.local_count.get()
    )
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let data = AppState {
        local_count: Cell::new(0),
        global_count: Arc::new(AtomicUsize::new(0)),
    };

    HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(data.clone()))
            .service(show_count)
            .service(add_one)
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}
```

**Note**: 전체 상태를 모든 스레드에서 공유하려면 공유된 [변경 가능한 상태(Shared Mutable State)](https://actix.rs/docs/application/#shared-mutable-state)에 설명된 대로 `web::Data` 및 `app_data`를 사용하세요.

앱 상태 내에서 `Mutex` 또는 `RwLock`과 같은 동기화 차단 프리미티브를 사용할 때는 주의하세요. 액틱스 웹은 요청을 비동기적으로 처리합니다. 핸들러의 중요 섹션이 너무 크거나 .await 지점을 포함하는 경우 문제가 될 수 있습니다. 이 문제가 우려되는 경우 [비동기 코드에서 Mutex 차단 사용에 대한 Tokio의 조언](https://tokio.rs/tokio/tutorial/shared-state#on-using-stdsyncmutex)도 읽어보시기 바랍니다.

### 요청 핸들러

요청 핸들러는 요청에서 추출할 수 있는 0개 이상의 매개변수(예: [FromRequest](https://docs.rs/actix-web/4.3.1/actix_web/trait.FromRequest.html))를 수락하고 HttpResponse로 변환할 수 있는 타입(예: [Responder](https://docs.rs/actix-web/4.3.1/actix_web/trait.Responder.html))을 반환하는 비동기 함수입니다.

요청 처리는 두 단계로 이루어집니다. 먼저 핸들러 객체가 호출되어 [Responder](https://docs.rs/actix-web/4.3.1/actix_web/trait.Responder.html) trait을 구현하는 모든 객체를 반환합니다. 그런 다음 반환된 객체에 대해 `respond_to()`가 호출되어 `HttpResponse` 또는 `Error`로 변환됩니다.

기본적으로 actix-web은 `&'static str`, `String` 등과 같은 일부 표준 타입에 대한 `Responder` 구현을 제공합니다.

> 전체 구현 목록은 [*Responder 문서*](https://docs.rs/actix-web/4.3.1/actix_web/trait.Responder.html#foreign-impls)를 참조하세요.

유효한 핸들러의 예시:

```
async fn index(_req: HttpRequest) -> &'static str {
    "Hello world!"
}
```

```python
async fn index(_req: HttpRequest) -> String {
    "Hello world!".to_owned()
}
```

더 복잡한 타입이 관련된 경우 잘 작동하는 `impl Responder`를 반환하도록 시그너쳐을 변경할 수도 있습니다.

```
async fn index(_req: HttpRequest) -> impl Responder {
    web::Bytes::from_static(b"Hello world!")
}
```

```python
async fn index(req: HttpRequest) -> Box<Future<Item=HttpResponse, Error=Error>> {
    ...
}
```

#### 사용자 지정 타입으로 응답

핸들러 함수에서 직접 사용자 정의 유형을 반환하려면 해당 유형이 `Responder` trait을 구현해야 합니다.

`application/json` 응답으로 직렬화되는 사용자 정의 유형에 대한 응답을 만들어 보겠습니다:

```rust
use actix_web::{
    body::BoxBody, http::header::ContentType, HttpRequest, HttpResponse, Responder,
};
use serde::Serialize;

#[derive(Serialize)]
struct MyObj {
    name: &'static str,
}

// Responder
impl Responder for MyObj {
    type Body = BoxBody;

    fn respond_to(self, _req: &HttpRequest) -> HttpResponse<Self::Body> {
        let body = serde_json::to_string(&self).unwrap();

        // 응답 생성 및 콘텐츠 타입 설정
        HttpResponse::Ok()
            .content_type(ContentType::json())
            .body(body)
    }
}

async fn index() -> impl Responder {
    MyObj { name: "user" }
}
```

#### 스트리밍 response body

response body은 비동기적으로 생성될 수 있습니다. 이 경우 본문은 스트림 trait `Stream<Item=Bytes, Error=Error>`를 구현해야 합니다:

```rust
use actix_web::{get, web, App, Error, HttpResponse, HttpServer};
use futures::{future::ok, stream::once};

#[get("/stream")]
async fn stream() -> HttpResponse {
    let body = once(ok::<_, Error>(web::Bytes::from_static(b"test")));

    HttpResponse::Ok()
        .content_type("application/json")
        .streaming(body)
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| App::new().service(stream))
        .bind(("127.0.0.1", 8080))?
        .run()
        .await
}
```

#### 다양한 응답 타입(Either)

때로는 서로 다른 타입의 응답을 반환해야 하는 경우가 있습니다. 예를 들어, 에러를 체크하여 에러를 반환하거나 비동기 응답을 반환하거나 두 가지 타입 중 하나의 결과를 반환할 때가 있습니다.

이 경우 [Either](https://docs.rs/actix-web/4.3.1/actix_web/enum.Either.html) 타입을 사용할 수 있습니다. `Either`는 서로 다른 두 가지 응답 타입을 하나의 타입으로 결합할 수 있도록 해 줍니다.

```rust
use actix_web::{Either, Error, HttpResponse};

type RegisterResult = Either<HttpResponse, Result<&'static str, Error>>;

async fn index() -> RegisterResult {
    if is_a_variant() {
        // 왼쪽 타입 선택
        Either::Left(HttpResponse::BadRequest().body("Bad data"))
    } else {
        // 오른쪽 타입 선택
        Either::Right(Ok("Hello!"))
    }
}
```

## 고급

### 에러

Actix Web은 웹 핸들러의 에러 처리를 위해 자체 `actix_web::error::Error` 타입과 `actix_web::error::ResponseError` trait을 사용합니다.

핸들러가 `ResponseError` trait을 구현하는 `Result`에서 오류([일반 Rust 특성](https://doc.rust-lang.org/std/error/trait.Error.html) [`std::error::Error`](https://doc.rust-lang.org/std/error/trait.Error.html)참조)를 반환하는 경우, actix-web은 해당 오류를 해당 `actix_web::http::StatusCode`가 포함된 HTTP 응답으로 렌더링합니다. 기본적으로 내부 서버 오류가 생성됩니다:

```rust
pub trait ResponseError {
    fn error_response(&self) -> Response<Body>;
    fn status_code(&self) -> StatusCode;
}
```

`Responder`는 호환 가능한 `Result`를 HTTP 응답으로 강제 전송합니다:

```
impl<T: Responder, E: Into<Error>> Responder for Result<T, E>
```

위 코드의 `Error`는 actix-web의 에러 정의이며, 응답 오류를 구현하는 모든 오류는 자동으로 `ResponseError`로 변환할 수 있습니다.

Actix Web은 actix가 아닌 몇 가지 일반적인 오류에 대해 `ResponseError` 구현을 제공합니다. 예를 들어, 핸들러가 `io::Error`로 응답하는 경우 해당 오류는 `HttpInternalServerError`로 변환됩니다:

```rust
use std::io;
use actix_files::NamedFile;

fn index(_req: HttpRequest) -> io::Result<NamedFile> {
    Ok(NamedFile::open("static/index.html")?)
}
```

`ResponseError`에 대한 외부 구현의 전체 목록은 [actix-web API 설명서](https://docs.rs/actix-web/4.3.1/actix_web/error/trait.ResponseError.html#foreign-impls)를 참조하세요.

#### 사용자 지정 오류 응답의 예

다음은 선언적 오류 열거형에 [derive\_more](https://crates.io/crates/derive_more) 크레이트를 사용하는 `ResponseError`의 구현 예시입니다.

```rust
use actix_web::{error, Result};
use derive_more::{Display, Error};

#[derive(Debug, Display, Error)]
#[display(fmt = "my error: {}", name)]
struct MyError {
    name: &'static str,
}

// `error_response()` 메소드 기본 구현 사용
impl error::ResponseError for MyError {}

async fn index() -> Result<&'static str, MyError> {
    Err(MyError { name: "test" })
}
```

`ResponseError`에는 500(internal server error)을 렌더링하는 `error_response()`의 기본 구현이 있으며, 위의 `index` 핸들러가 실행될 때 이런 일이 발생합니다.

`error_response()`를 재정의하면 더 유용한 결과를 얻을 수 있습니다:

```rust
use actix_web::{
    error, get,
    http::{header::ContentType, StatusCode},
    App, HttpResponse,
};
use derive_more::{Display, Error};

#[derive(Debug, Display, Error)]
enum MyError {
    #[display(fmt = "internal error")]
    InternalError,

    #[display(fmt = "bad request")]
    BadClientData,

    #[display(fmt = "timeout")]
    Timeout,
}

impl error::ResponseError for MyError {
    fn error_response(&self) -> HttpResponse {
        HttpResponse::build(self.status_code())
            .insert_header(ContentType::html())
            .body(self.to_string())
    }

    fn status_code(&self) -> StatusCode {
        match *self {
            MyError::InternalError => StatusCode::INTERNAL_SERVER_ERROR,
            MyError::BadClientData => StatusCode::BAD_REQUEST,
            MyError::Timeout => StatusCode::GATEWAY_TIMEOUT,
        }
    }
}

#[get("/")]
async fn index() -> Result<&'static str, MyError> {
    Err(MyError::BadClientData)
}
```

#### 에러 헬퍼

Actix Web은 다른 에러로부터 특정 HTTP 에러 코드를 생성하는 데 유용한 에러 헬퍼 함수 세트를 제공합니다. 여기서는 `ResponseError` trait을 구현하지 않는 `MyError`를 `map_err`를 사용하여 400(bad request)으로 변환합니다:

```rust
use actix_web::{error, get, App, HttpServer};

#[derive(Debug)]
struct MyError {
    name: &'static str,
}

#[get("/")]
async fn index() -> actix_web::Result<String> {
    let result = Err(MyError { name: "test error" });

    result.map_err(|err| error::ErrorBadRequest(err.name))
}
```

사용 가능한 에러 헬퍼의 전체 목록은 [actix-web의](https://docs.rs/actix-web/4.3.1/actix_web/error/struct.Error.html) [`error`](https://docs.rs/actix-web/4.3.1/actix_web/error/struct.Error.html) [모듈의 API 설명서](https://docs.rs/actix-web/4.3.1/actix_web/error/struct.Error.html)를 참조하세요.

#### 에러 로깅

Actix는 모든 에러를 `WARN` 로그 레벨에 기록합니다. 애플리케이션의 로그 레벨이 `DEBUG`로 설정되어 있고 `RUST_BACKTRACE`가 활성화되어 있으면 백트레이스도 로깅됩니다. 이는 환경 변수로 설정할 수 있습니다:

```
RUST_BACKTRACE=1 RUST_LOG=actix_web=debug cargo run
```

#### 에러 처리 권장 사례

애플리케이션이 생성하는 에러를 크게 두 가지 그룹, 즉 사용자에게 의도된 에러와 그렇지 않은 에러로 구분하는 것이 유용할 수 있습니다.

전자의 예로, 사용자가 잘못된 입력을 보낼 때마다 반환할 `ValidationError`를 캡슐화하는 `UserError` 열거형을 지정하지 않은 경우를 들 수 있습니다:

```rust
use actix_web::{
    error, get,
    http::{header::ContentType, StatusCode},
    App, HttpResponse, HttpServer,
};
use derive_more::{Display, Error};

#[derive(Debug, Display, Error)]
enum UserError {
    #[display(fmt = "Validation error on field: {}", field)]
    ValidationError { field: String },
}

impl error::ResponseError for UserError {
    fn error_response(&self) -> HttpResponse {
        HttpResponse::build(self.status_code())
            .insert_header(ContentType::html())
            .body(self.to_string())
    }
    fn status_code(&self) -> StatusCode {
        match *self {
            UserError::ValidationError { .. } => StatusCode::BAD_REQUEST,
        }
    }
}
```

`display`로 정의된 에러 메시지는 사용자가 읽도록 명시적으로 작성 되었으므로 의도한 대로 정확하게 작동합니다.

그러나 모든 에러에 대해 에러 메시지를 다시 보내는 것이 바람직한 것은 아니며, 서버 환경에서는 사용자에게 세부 사항을 숨기고 싶은 오류가 많이 발생합니다. 예를 들어, 데이터베이스가 다운되어 클라이언트 라이브러리에서 연결 시간 초과 에러가 발생하거나 HTML 템플릿의 형식이 잘못 지정되어 렌더링 시 에러가 발생하는 경우 등이 있습니다. 이러한 경우에는 사용자가 사용하기에 적합한 일반 에러에 에러를 매핑하는 것이 바람직할 수 있습니다.

다음은 내부 에러를 사용자 지정 메시지와 함께 사용자 대면 `InternalError`에 매핑하는 예제입니다:

```rust
use actix_web::{
    error, get,
    http::{header::ContentType, StatusCode},
    App, HttpResponse, HttpServer,
};
use derive_more::{Display, Error};

#[derive(Debug, Display, Error)]
enum UserError {
    #[display(fmt = "An internal error occurred. Please try again later.")]
    InternalError,
}

impl error::ResponseError for UserError {
    fn error_response(&self) -> HttpResponse {
        HttpResponse::build(self.status_code())
            .insert_header(ContentType::html())
            .body(self.to_string())
    }

    fn status_code(&self) -> StatusCode {
        match *self {
            UserError::InternalError => StatusCode::INTERNAL_SERVER_ERROR,
        }
    }
}

#[get("/")]
async fn index() -> Result<&'static str, UserError> {
    do_thing_that_fails().map_err(|_e| UserError::InternalError)?;
    Ok("success!")
}
```

사용자가 직면하는 에러와 그렇지 않은 에러를 구분함으로써 사용자가 의도하지 않은 애플리케이션 내부에서 발생하는 에러에 실수로 노출되는 일이 없도록 할 수 있습니다.

#### 에러 로깅

다음은 `middleware::Logger`를 사용하는 기본 예제로, `env_logger`와 `log`에 의존합니다:

```rust
[dependencies]
env_logger = "0.8"
log = "0.4"
```

```
use actix_web::{error, get, middleware::Logger, App, HttpServer, Result};
use derive_more::{Display, Error};
use log::info;

#[derive(Debug, Display, Error)]
#[display(fmt = "my error: {}", name)]
pub struct MyError {
    name: &'static str,
}

// `error_response()` 메소드 기본 구현 사용
impl error::ResponseError for MyError {}

#[get("/")]
async fn index() -> Result<&'static str, MyError> {
    let err = MyError { name: "test error" };
    info!("{}", err);
    Err(err)
}

#[rustfmt::skip]
#[actix_web::main]
async fn main() -> std::io::Result<()> {
    std::env::set_var("RUST_LOG", "info");
    std::env::set_var("RUST_BACKTRACE", "1");
    env_logger::init();

    HttpServer::new(|| {
        let logger = Logger::default();

        App::new()
            .wrap(logger)
            .service(index)
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}
```

### URL 디스패치

URL 디스패치는 간단한 패턴 매칭 언어를 사용하여 URL을 핸들러 코드에 매핑하는 간단한 방법을 제공합니다. 패턴 중 하나가 요청과 연관된 경로 정보와 일치하면 특정 핸들러 객체가 호출됩니다.

> 요청 핸들러는 요청에서 추출할 수 있는 0개 이상의 매개변수(예: impl FromRequest)를 수락하고 HttpResponse로 변환할 수 있는 타입(예: impl Responder)을 반환하는 함수입니다. 자세한 내용은 [핸들러 섹션](https://actix.rs/docs/handlers/)에서 확인할 수 있습니다.

#### 리소스 설정

리소스 설정은 애플리케이션에 새 리소스를 추가하는 작업입니다. 리소스에는 URL 생성에 사용되는 식별자 역할을 하는 이름이 있습니다. 또한 개발자는 이 이름을 통해 기존 리소스에 경로를 추가할 수 있습니다. 리소스에는 패턴도 있는데, 이는 URL의 PATH 부분(체계와 포트 뒤에 오는 부분, 예: *http://localhost:8080/foo/bar?q=value* URL의 */foo/bar*)과 일치하기 위한 것입니다. QUERY 부분(예: *http://localhost:8080/foo/bar?q=value*의 *q=value*)과는 일치하지 않습니다.

*[App::route()](https://docs.rs/actix-web/4.3.1/actix_web/struct.App.html#method.route)* 메서드는 경로를 등록하는 간단한 방법을 제공합니다. 이 메서드는 애플리케이션 라우팅 테이블에 단일 경로를 추가합니다. 이 메서드는 경로 패턴, HTTP 메서드 및 핸들러 함수를 허용합니다. 동일한 경로에 대해 `route()` 메서드를 여러 번 호출할 수 있으며, 이 경우 동일한 리소스 경로에 대해 여러 경로가 등록됩니다.

```rust
use actix_web::{web, App, HttpResponse, HttpServer};

async fn index() -> HttpResponse {
    HttpResponse::Ok().body("Hello")
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new()
            .route("/", web::get().to(index))
            .route("/user", web::post().to(index))
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}
```

*App::route()*는 루트를 간단하게 등록하는 방법을 제공하지만, 완전한 리소스 설정에 액세스하려면 다른 방법을 사용해야 합니다. [*App::service()*](https://docs.rs/actix-web/4.3.1/actix_web/struct.App.html#method.service) 메소드는 하나의 [리소스](https://docs.rs/actix-web/4.3.1/actix_web/struct.Resource.html)를 애플리케이션 라우팅 테이블에 추가합니다. 이 메소드는 경로 패턴, 가드, 그리고 하나 이상의 루트를 받아들입니다.

```rust
use actix_web::{guard, web, App, HttpResponse};

async fn index() -> HttpResponse {
    HttpResponse::Ok().body("Hello")
}

pub fn main() {
    App::new()
        .service(web::resource("/prefix").to(index))
        .service(
            web::resource("/user/{name}")
                .name("user_detail")
                .guard(guard::Header("content-type", "application/json"))
                .route(web::get().to(HttpResponse::Ok))
                .route(web::put().to(HttpResponse::Ok)),
        );
}
```

리소스가 어떤 루트도 포함하지 않거나 일치하는 루트가 없다면, *NOT FOUND* HTTP 응답을 반환합니다.

#### 경로 설정하기

리소스는 일련의 경로를 포함합니다. 각 경로는 `guards` 세트와 핸들러를 가지고 있습니다. 새로운 경로는 `Resource::route()` 메소드로 생성할 수 있으며, 이는 새로운 *Route* 인스턴스에 대한 참조를 반환합니다. 기본적으로 경로는 어떤 가드도 포함하지 않아 모든 요청에 일치하며, 기본 핸들러는 `HttpNotFound`입니다.

애플리케이션은 리소스 등록과 경로 등록 중에 정의된 경로 기준에 따라 들어오는 요청을 라우팅합니다. 리소스는 `Resource::route()`를 통해 등록된 순서대로 포함된 모든 경로와 일치합니다.

> *Route는 여러 가드를 포함할 수 있지만, 핸들러는 오직 하나만 가질 수 있습니다.*

```
App::new().service(
    web::resource("/path").route(
        web::route()
            .guard(guard::Get())
            .guard(guard::Header("content-type", "text/plain"))
            .to(HttpResponse::Ok),
    ),
)
```

이 예에서 요청에 `Content-Type` 헤더가 포함되어 있고 이 헤더의 값이 *text/plain*이고 경로가 `/path`인 경우 *GET* 요청에 대해 `HttpResponse::Ok()`가 반환됩니다.

리소스가 어떤 경로와도 일치하지 않으면 "NOT FOUND" 응답이 반환됩니다.

[*ResourceHandler::route()*](https://docs.rs/actix-web/4.3.1/actix_web/struct.Resource.html#method.route)는 [Route](https://docs.rs/actix-web/4.3.1/actix_web/struct.Route.html) 객체를 반환합니다. 빌더와 같은 패턴으로 경로를 설정할 수 있습니다. 다음 설정 방법을 사용할 수 있습니다.

- *[Route::guard()](https://docs.rs/actix-web/4.3.1/actix_web/struct.Route.html#method.guard)*는 새로운 가드를 등록합니다. 각 경로에 대한 가드의 수는 얼마든지 등록할 수 있습니다.

- *[Route::method()](https://docs.rs/actix-web/4.3.1/actix_web/struct.Route.html#method.method)* 메서드 가드를 등록합니다. 각 경로에 대한 가드의 수는 얼마든지 등록할 수 있습니다.

- [*Route::to()*](https://docs.rs/actix-web/4.3.1/actix_web/struct.Route.html#method.to)는 이 경로에 대한 비동기 핸들러 함수를 등록합니다. 핸들러는 하나만 등록할 수 있습니다. 일반적으로 핸들러 등록은 마지막 설정 작업입니다.

#### 경로 매칭

경로 설정의 주요 목적은 요청의 `path`를 URL 경로 패턴과 일치 시키는 (또는 일치 시키지 않는) 것 입니다. `path`는 요청된 URL의 경로 부분을 나타냅니다.

actix-web이 이를 수행하는 방식은 매우 간단합니다. 요청이 시스템에 들어올 때 시스템에 있는 각 자원 설정 선언에 대해 actix는 선언된 패턴에 대해 요청의 경로를 확인합니다. 이 검사는 경로가 `App::service()` 메서드를 통해 선언된 순서대로 발생합니다. 리소스를 찾을 수 없으면 *디폴트 리소스*가 일치하는 리소스로 사용됩니다.

경로 설정이 선언되면 경로 보호 인수가 포함될 수 있습니다. 경로 선언과 연결된 모든 경로 가드는 확인 중에 지정된 요청에 사용할 경로 구성에 대해 `true`여야 합니다. 경로 구성에 제공된 경로 가드 인수 집합의 가드가 검사 중에 `false`를 반환하면 해당 경로를 건너뛰고 순서가 지정된 경로 집합을 통해 경로 일치가 계속됩니다.

경로가 일치하면 경로 일치 프로세스가 중지되고 경로와 연결된 핸들러가 호출됩니다. 모든 경로 패턴이 소진된 후 일치하는 경로가 없으면 *NOT FOUND* 응답이 반환됩니다.

#### 리소스 패턴 구문

패턴 인수에 actix가 사용하는 패턴 매칭 언어의 구문은 간단합니다.

경로 설정에 사용되는 패턴은 슬래시 문자(’/’)로 시작할 수 있습니다. 패턴이 슬래시 문자로 시작하지 않으면 일치할 때 암시적 슬래시가 앞에 추가됩니다. 예를 들어 다음 패턴이 이에 해당합니다:

```
{foo}/bar/baz
```

와

```
/{foo}/bar/baz
```

가변 부분(대체 마커)은 *{식별자}* 형식으로 지정되며, 이는 "다음 슬래시 문자까지 모든 문자를 허용하고 이를 `HttpRequest.match_info()` 객체에서 이름으로 사용"한다는 의미입니다.

패턴의 대체 마커는 정규식 `[^{}/]+`와 일치합니다.

`match_info`는 라우팅 패턴에 따라 URL에서 추출된 동적 부분을 나타내는 `Params` 객체입니다. *request.match\_info*로 사용할 수 있습니다. 예를 들어, 다음 패턴은 하나의 리터럴 세그먼트(foo)와 두 개의 대체 마커(baz 및 bar)를 정의합니다:

```
foo/{baz}/{bar}
```

위의 패턴은 이러한 URL과 일치하여 다음과 같은 일치 정보를 생성합니다:

```
foo/1/2        -> Params {'baz': '1', 'bar': '2'}
foo/abc/def    -> Params {'baz': 'abc', 'bar': 'def'}
```

그러나 다음 패턴과 일치하지는 않습니다:

```
foo/1/2/        -> 일치하지 않음(후행 슬래시)
bar/abc/def     -> 첫 번째 세그먼트 리터럴 불일치
```

세그먼트에서 세그먼트 대체 마커에 대한 일치는 패턴의 세그먼트에서 영숫자가 아닌 첫 번째 문자까지만 수행됩니다. 예를 들어, 아래 경로 패턴이 사용되었다면:

```
foo/{name}.html
```

리터럴 경로 `/foo/biz.html`은 위의 경로 패턴과 일치하며, 일치 결과는 `Params {'name': 'biz'}`가 됩니다. 그러나 리터럴 경로 `/foo/biz`는 `{name}.html`로 표시되는 세그먼트 끝에 리터럴 `.html`이 포함되어 있지 않기 때문에 일치하지 않습니다 (biz.html이 아닌 biz만 포함되어 있음).

두 세그먼트를 모두 캡처하려면 두 개의 대체 마커를 사용할 수 있습니다:

```
foo/{name}.{ext}
```

리터럴 경로 `/foo/biz.html`은 위의 경로 패턴과 일치하며, 일치 결과는 `Params {'name': 'biz', 'ext': 'html'}`가 됩니다. 이는 두 개의 대체 마커 `{name}`과 `{ext}` 사이에 리터럴 부분인 `.(`마침표)가 있기 때문에 발생합니다.

대체 마커는 선택적으로 경로 세그먼트가 마커와 일치해야 하는지 여부를 결정하는 데 사용되는 정규식을 지정할 수 있습니다. 정규식에 정의된 특정 문자 집합과만 일치하도록 대체 마커를 지정하려면 약간 확장된 형태의 대체 마커 구문을 사용해야 합니다. 중괄호 안에서는 대체 마커 이름 뒤에 콜론이 오고 그 바로 뒤에 정규식이 와야 합니다. 대체 마커 `[^/]+`와 연결된 기본 정규식은 슬래시가 아닌 하나 이상의 문자와 일치합니다. 예를 들어, 대체 마커 `{foo}`는 `{foo:[^/]+}`로 더 상세하게 철자를 지정할 수 있습니다. 이를 임의의 정규식으로 변경하여 임의의 문자 시퀀스와 일치하도록 할 수 있습니다(예: 숫자만 일치하도록 `{foo:\d+}`).

세그먼트 대체 마커와 일치하려면 세그먼트에 문자가 하나 이상 포함되어야 합니다. 예를 들어, `/abc/` URL의 경우입니다:

- `/abc/{foo}` 는 일치하지 않습니다.

- `/{foo}/` 는 일치 합니다.

> **Note**: 경로가 URL로 따옴표로 묶이지 않고 패턴과 일치하기 전에 유효한 유니코드 문자열로 디코딩되며, 일치하는 경로 세그먼트를 나타내는 값도 URL로 따옴표로 묶이지 않습니다.

예를 들어 다음과 같은 패턴이 있습니다:

```
foo/{bar}
```

다음 URL과 일치하는 경우:

```
http://example.com/foo/La%20Pe%C3%B1a
```

일치 사전은 다음과 같이 표시됩니다(값은 URL 디코딩된 값입니다):

```css
Params {'bar': 'La Pe\xf1a'}
```

경로 세그먼트의 리터럴 문자열은 actix에 제공된 경로의 디코딩된 값을 나타내야 합니다. 패턴에 URL로 인코딩된 값을 사용하면 안 됩니다. 예를 들어, 이렇게 하지 마세요:

```
/Foo%20Bar/{baz}
```

다음과 같이 사용하고 싶을 것입니다.

```
/Foo Bar/{baz}
```

"tail match"를 얻을 수 있습니다. 이를 위해서는 사용자 지정 정규식을 사용해야 합니다.

```
foo/{bar}/{tail:.*}
```

위의 패턴은 이러한 URL과 일치하여 다음과 같은 일치 정보를 생성합니다:

```
foo/1/2/           -> Params {'bar': '1', 'tail': '2/'}
foo/abc/def/a/b/c  -> Params {'bar': 'abc', 'tail': 'def/a/b/c'}
```

#### 경로 범위 지정

범위 지정은 공통 루트 경로를 공유하는 경로를 구성하는 데 도움이 됩니다. 범위 내에 범위를 중첩할 수 있습니다.

'사용자'를 보는 데 사용되는 엔드포인트에 대한 경로를 정리하고 싶다고 가정해 보겠습니다. 이러한 경로에는 다음이 포함될 수 있습니다:

- /users

- /users/show

- /users/show/{id}

이러한 경로의 범위가 지정된 레이아웃은 다음과 같이 표시됩니다.

```rust
#[get("/show")]
async fn show_users() -> HttpResponse {
    HttpResponse::Ok().body("Show users")
}

#[get("/show/{id}")]
async fn user_detail(path: web::Path<(u32,)>) -> HttpResponse {
    HttpResponse::Ok().body(format!("User detail: {}", path.into_inner().0))
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new().service(
            web::scope("/users")
                .service(show_users)
                .service(user_detail),
        )
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}
```

범위가 지정된 경로는 가변 경로 세그먼트를 리소스로 포함할 수 있습니다. 범위가 지정되지 않은 경로와 일치합니다.

가변 경로 세그먼트는 `HttpRequest::match_info()`에서 가져올 수 있습니다. [경로 추출기](https://actix.rs/docs/extractors/)는 범위 수준 가변 세그먼트도 추출할 수 있습니다.

#### 매치 정보

일치하는 경로 세그먼트를 나타내는 모든 값은 [`HttpRequest::match_info`](https://docs.rs/actix-web/4.3.1/actix_web/struct.HttpRequest.html#method.match_info)에서 사용할 수 있습니다. 특정 값은 [`Path::get()`](https://docs.rs/actix-web/4.3.1/actix_web/dev/struct.Path.html#method.get)으로 검색할 수 있습니다.

```rust
use actix_web::{get, App, HttpRequest, HttpServer, Result};

#[get("/a/{v1}/{v2}/")]
async fn index(req: HttpRequest) -> Result<String> {
    let v1: u8 = req.match_info().get("v1").unwrap().parse().unwrap();
    let v2: u8 = req.match_info().query("v2").parse().unwrap();
    let (v3, v4): (u8, u8) = req.match_info().load().unwrap();
    Ok(format!("Values {} {} {} {}", v1, v2, v3, v4))
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| App::new().service(index))
        .bind(("127.0.0.1", 8080))?
        .run()
        .await
}
```

이 예제에서 '/a/1/2/' 경로의 경우 값 v1 및 v2는 "1" 및 "2"로 해석됩니다.

**경로 정보 추출기**

Actix는 type-safe 경로 정보 추출 기능을 제공합니다. [*Path*](https://docs.rs/actix-web/4.3.1/actix_web/dev/struct.Path.html)는 정보를 추출하며, 목적지 타입은 여러 가지 형태로 정의할 수 있습니다. 가장 간단한 접근 방식은 `tuple` 타입을 사용하는 것입니다. 튜플의 각 요소는 경로 패턴의 한 요소에 대응해야 합니다. 즉, 경로 패턴 `/{id}/{username}/`을 `Path<(u32, String)>` 타입과 일치시킬 수 있지만, `Path<(String, String, String)>` 타입은 항상 실패합니다.

```rust
use actix_web::{get, web, App, HttpServer, Result};

#[get("/{username}/{id}/index.html")] // <- define path parameters
async fn index(info: web::Path<(String, u32)>) -> Result<String> {
    let info = info.into_inner();
    Ok(format!("Welcome {}! id: {}", info.0, info.1))
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| App::new().service(index))
        .bind(("127.0.0.1", 8080))?
        .run()
        .await
}
```

경로 패턴 정보를 구조체로 추출하는 것도 가능합니다. 이 경우 이 구조체는 serde의 `Deserialize` trait을 구현해야 합니다.

```rust
use actix_web::{get, web, App, HttpServer, Result};
use serde::Deserialize;

#[derive(Deserialize)]
struct Info {
    username: String,
}

// serde를 사용하여 경로 정보 추출
#[get("/{username}/index.html")] // <- 경로 매개변수 정의
async fn index(info: web::Path<Info>) -> Result<String> {
    Ok(format!("Welcome {}!", info.username))
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| App::new().service(index))
        .bind(("127.0.0.1", 8080))?
        .run()
        .await
}
```

[*Query*](https://docs.rs/actix-web/4.3.1/actix_web/web/struct.Query.html)는 요청 쿼리 매개변수에 대해 유사한 기능을 제공합니다.

#### 리소스 URL 생성

리소스 패턴에 따라 URL을 생성하려면*[HttpRequest.url\_for()](https://docs.rs/actix-web/4.3.1/actix_web/struct.HttpRequest.html#method.url_for)* 메서드를 사용합니다. 예를 들어, 이름이 "foo"이고 패턴이 "{a}/{b}/{c}"인 리소스를 구성한 경우 이렇게 할 수 있습니다:

```rust
use actix_web::{get, guard, http::header, HttpRequest, HttpResponse, Result};

#[get("/test/")]
async fn index(req: HttpRequest) -> Result<HttpResponse> {
    let url = req.url_for("foo", ["1", "2", "3"])?; // <- "foo" 리소스에 대한 URL 생성

    Ok(HttpResponse::Found()
        .insert_header((header::LOCATION, url.as_str()))
        .finish())
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    use actix_web::{web, App, HttpServer};

    HttpServer::new(|| {
        App::new()
            .service(
                web::resource("/test/{a}/{b}/{c}")
                    .name("foo") // <- 리소스 이름을 설정한 경우 `url_for`에서 사용할 수 있습니다.
                    .guard(guard::Get())
                    .to(HttpResponse::Ok),
            )
            .service(index)
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}
```

이 메서드는 <http://example.com/test/1/2/3> 문자열과 같은 것을 반환합니다(적어도 현재 프로토콜과 호스트 이름이 [http://example.com을](http://example.xn--com-of0o/) 암시하는 경우). `url_for()` 메서드는 이 URL을 수정(쿼리 매개변수, 앵커 추가 등)할 수 있도록 *[Url 객체](https://docs.rs/url/1.7.2/url/struct.Url.html)*를 반환합니다. `url_for()`는 명명된 리소스에 대해서만 호출할 수 있으며, 그렇지 않으면 에러가 반환됩니다.

#### 외부 리소스

유효한 URL인 리소스는 외부 리소스로 등록할 수 있습니다. 이러한 리소스는 URL 생성 목적으로만 유용하며 요청시 매칭에 고려되지 않습니다.

```rust
use actix_web::{get, App, HttpRequest, HttpServer, Responder};

#[get("/")]
async fn index(req: HttpRequest) -> impl Responder {
    let url = req.url_for("youtube", ["oHg5SJYRHA0"]).unwrap();
    assert_eq!(url.as_str(), "https://youtube.com/watch/oHg5SJYRHA0");

    url.to_string()
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new()
            .service(index)
            .external_resource("youtube", "https://youtube.com/watch/{video_id}")
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}
```

#### 경로 정규화 및 슬래시 추가 경로로의 리디렉션

정규화한다는 것은 다음을 의미합니다:

- 경로에 후행 슬래시를 추가합니다.

- 여러 슬래시를 하나로 바꾸기.

핸들러는 올바르게 해석되는 경로를 찾으면 즉시 반환합니다. 정규화 조건의 순서는 모두 활성화된 경우 1) 병합, 2) 병합과 추가 모두, 3) 추가입니다. 경로가 이러한 조건 중 하나 이상을 충족하여 해결되면 새 경로로 리디렉션됩니다.

```rust
use actix_web::{middleware, HttpResponse};

async fn index() -> HttpResponse {
    HttpResponse::Ok().body("Hello")
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    use actix_web::{web, App, HttpServer};

    HttpServer::new(|| {
        App::new()
            .wrap(middleware::NormalizePath::default())
            .route("/resource/", web::to(index))
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}
```

이 예제에서 `//resource//`는 `/resource/`로 리디렉션됩니다.

이 예제에서는 모든 메서드에 대해 경로 정규화 처리기가 등록되어 있지만 이 메커니즘에 의존하여 *POST* 요청을 리디렉션해서는 안 됩니다. 슬래시를 추가한 Not Found를 리디렉션하면 POST 요청이 GET으로 전환되어 원래 요청의 모든 *POST 데이터*가 손실됩니다.

경로 정규화는 *GET* 요청에 대해서만 등록할 수 있습니다:

```rust
use actix_web::{get, http::Method, middleware, web, App, HttpServer};

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new()
            .wrap(middleware::NormalizePath::default())
            .service(index)
            .default_service(web::route().method(Method::GET))
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}
```

**애플리케이션 접두사를 사용하여 애플리케이션 설정하기**

`web::scope()` 메서드를 사용하면 특정 애플리케이션 범위를 설정할 수 있습니다. 이 범위는 리소스 구성에 의해 추가된 모든 리소스 패턴에 추가되는 리소스 접두사를 나타냅니다. 이를 사용하면 포함된 콜러블의 작성자가 의도한 것과 다른 위치에 동일한 리소스 이름을 유지하면서 경로 집합을 마운트하는 데 도움이 될 수 있습니다.

예를 들어:

```rust
#[get("/show")]
async fn show_users() -> HttpResponse {
    HttpResponse::Ok().body("Show users")
}

#[get("/show/{id}")]
async fn user_detail(path: web::Path<(u32,)>) -> HttpResponse {
    HttpResponse::Ok().body(format!("User detail: {}", path.into_inner().0))
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new().service(
            web::scope("/users")
                .service(show_users)
                .service(user_detail),
        )
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}
```

위의 예에서 show\_users 경로는 응용 프로그램의 범위가 패턴 앞에 추가되기 때문에 */show* 대신 */users/show*의 유효한 경로 패턴을 갖습니다. 그러면 경로는 URL 경로가 */users/show*인 경우에만 일치하며 `HttpRequest.url_for()`함수가 경로 이름 show\_users로 호출되면 동일한 경로를 가진 URL을 생성합니다.

#### 사용자 지정 경로 가드

가드는 요청 객체 참조를 받아 참 또는 거짓을 반환하는 간단한 함수라고 생각하면 됩니다. 공식적으로 가드는 [`Guard`](https://docs.rs/actix-web/4.3.1/actix_web/guard/trait.Guard.html) trait을 구현하는 모든 객체입니다. Actix는 몇 가지 술어를 제공하며, API 문서의 [함수 섹션](https://docs.rs/actix-web/4.3.1/actix_web/guard/index.html#functions)에서 확인할 수 있습니다.

다음은 요청에 특정 *헤더*가 포함되어 있는지 확인하는 간단한 가드입니다:

```rust
use actix_web::{
    guard::{Guard, GuardContext},
    http, HttpResponse,
};

struct ContentTypeHeader;

impl Guard for ContentTypeHeader {
    fn check(&self, req: &GuardContext) -> bool {
        req.head()
            .headers()
            .contains_key(http::header::CONTENT_TYPE)
    }
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    use actix_web::{web, App, HttpServer};

    HttpServer::new(|| {
        App::new().route(
            "/",
            web::route().guard(ContentTypeHeader).to(HttpResponse::Ok),
        )
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}
```

이 예제에서 인덱스 핸들러는 요청에 CONTENT-TYPE 헤더가 포함된 경우에만 호출됩니다.

가드는 요청 객체에 액세스하거나 수정할 수 없지만 요청 확장에 추가 정보를 저장할 수 있습니다.

**가드 값 수정하기**

어떤 술어 값이라도 `Not` 술어로 감싸서 의미를 반전시킬 수 있습니다. 예를 들어, "GET"을 제외한 모든 메서드에 대해 "METHOD NOT ALLOWED" 응답을 반환 하려는 경우입니다:

```rust
use actix_web::{guard, web, App, HttpResponse, HttpServer};

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new().route(
            "/",
            web::route()
                .guard(guard::Not(guard::Get()))
                .to(HttpResponse::MethodNotAllowed),
        )
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}
```

`Any` 가드는 가드 목록을 받아들이고 제공된 가드 중 일치하는 가드가 있으면 일치 시킵니다:

```
guard::Any(guard::Get()).or(guard::Post())
```

`All` 가드는 제공된 가드 목록이 모두 일치하는 경우 가드 목록을 수락하고 일치합니다:

```
guard::All(guard::Get()).and(guard::Header("content-type", "plain/text"))
```

#### 디폴트 Not Found 응답 변경하기

라우팅 테이블에서 경로 패턴을 찾을 수 없거나 리소스에서 일치하는 경로를 찾을 수 없는 경우 디폴트 리소스가 사용됩니다. 디폴트 응답은 *NOT FOUND* 입니다. `App::default_service()`를 사용하여 *NOT FOUND* 응답을 재정의 할 수 있습니다. 이 메서드는 `App::service()` 메서드를 사용한 일반 리소스 구성과 동일한 구성 함수를 허용합니다.

```rust
#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new()
            .service(web::resource("/").route(web::get().to(index)))
            .default_service(
                web::route()
                    .guard(guard::Not(guard::Get()))
                    .to(HttpResponse::MethodNotAllowed),
            )
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}
```

### JSON 요청

JSON body 역직렬화에는 몇 가지 옵션이 있습니다.

첫 번째 옵션은 *Json 추출기*를 사용하는 것입니다. 먼저 `Json<T>`를 매개변수로 받아들이는 핸들러 함수를 정의한 다음 `.to()` 메서드를 사용하여 이 핸들러를 등록합니다. `serde_json::Value`를 타입 `T`로 사용하여 임의의 유효한 json 객체를 받을 수도 있습니다.

JSON 요청의 첫 번째 예제는 `serde` 의존성을 가집니다.

```toml
[dependencies]
serde = { version = "1.0", features = ["derive"] }
```

두 번째 JSON 요청의 예제는 `serde` 및 `serde_json`과 `future` 의존성을 가집니다.

```toml
[dependencies]
serde = { version = "1.0", features = ["derive"] }
serde_json = "1"
futures = "0.3"
```

필드에 디폴트 값을 추가하려면 [`serde`](https://serde.rs/attr-default.html) [문서](https://serde.rs/attr-default.html)를 참조하세요.

```rust
use actix_web::{web, App, HttpServer, Result};
use serde::Deserialize;

#[derive(Deserialize)]
struct Info {
    username: String,
}

/// serde를 사용하여 `Info` 추출
async fn index(info: web::Json<Info>) -> Result<String> {
    Ok(format!("Welcome {}!", info.username))
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| App::new().route("/", web::post().to(index)))
        .bind(("127.0.0.1", 8080))?
        .run()
        .await
}
```

페이로드를 메모리에 수동으로 로드한 다음 역직렬화할 수도 있습니다.

다음 예제에서는 *MyObj* 구조체를 역직렬화 하겠습니다. 먼저 요청 본문을 로드한 다음 json을 객체로 역직렬화해야 합니다.

```rust
use actix_web::{error, post, web, App, Error, HttpResponse};
use futures::StreamExt;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
struct MyObj {
    name: String,
    number: i32,
}

const MAX_SIZE: usize = 262_144; // max payload size is 256k

#[post("/")]
async fn index_manual(mut payload: web::Payload) -> Result<HttpResponse, Error> {
    // 페이로드는 바이트 객체의 스트림입니다.
    let mut body = web::BytesMut::new();
    while let Some(chunk) = payload.next().await {
        let chunk = chunk?;
        // 인메모리 페이로드의 최대 크기 제한
        if (body.len() + chunk.len()) > MAX_SIZE {
            return Err(error::ErrorBadRequest("overflow"));
        }
        body.extend_from_slice(&chunk);
    }

    // Body가 로드 되었으므로, 이제 serde-json으로 역직렬화 할 수 있습니다.
    let obj = serde_json::from_slice::<MyObj>(&body)?;
    Ok(HttpResponse::Ok().json(obj)) // <- send response
}
```

> 두 옵션에 대한 전체 예제는 [예제 디렉터리](https://github.com/actix/examples/tree/master/json/json)에서 확인할 수 있습니다.

#### 컨텐츠 인코딩

Actix Web은 페이로드의 압축을 자동으로 해제합니다. 지원되는 코덱은 다음과 같습니다:

- Brotli

- Gzip

- Deflate

- Zstd

요청 헤더에 `Content-Encoding` 헤더가 포함된 경우 요청 페이로드는 헤더 값에 따라 압축을 해제합니다. 다중 코덱은 지원되지 않습니다(예: `Content-Encoding: br, gzip`).

#### 청크 전송 인코딩

Actix는 청크 인코딩을 자동으로 디코딩합니다. [web::Payload](https://docs.rs/actix-web/4.3.1/actix_web/web/struct.Payload.html) 추출기에는 이미 디코딩된 바이트 스트림이 포함되어 있습니다. 요청 페이로드가 지원되는 압축 코덱(br, gzip, deflate) 중 하나로 압축된 경우, 바이트 스트림의 압축이 해제됩니다.

#### Multipart body

Actix Web은 외부 크레이트인 `actix-multipart`를 통해 멀티파트 스트림을 지원합니다.

> 전체 예제는 [예제 디렉터리](https://github.com/actix/examples/tree/master/forms/multipart)에서 확인할 수 있습니다.

#### Urlencoded body

Actix Web은 역직렬화된 인스턴스로 해석하는 `web::From` 추출기를 통해 *application/x-www-form-urlencoded*에 대한 지원을 제공합니다. 인스턴스 유형은 serde에서 `Deserialize` trait을 구현해야 합니다.

*UrlEncoded* future는 여러 경우에 오류로 해석될 수 있습니다:

- 콘텐츠 유형이 `application/x-www-form-urlencoded`가 아닙니다.

- 전송 인코딩이 `chunked` 입니다.

- 콘텐츠 길이가 256k보다 큽니다.

- 페이로드가 오류와 함께 종료됩니다.

```rust
use actix_web::{post, web, HttpResponse};
use serde::Deserialize;

#[derive(Deserialize)]
struct FormData {
    username: String,
}

#[post("/")]
async fn index(form: web::Form<FormData>) -> HttpResponse {
    HttpResponse::Ok().body(format!("username: {}", form.username))
}
```

#### 스트리밍 요청

*HttpRequest*는 `Bytes` 객체 스트림입니다. 요청 body 페이로드를 읽는 데 사용할 수 있습니다.

다음 예제에서는 요청 페이로드를 한 청크씩 읽고 인쇄합니다:

```rust
use actix_web::{get, web, Error, HttpResponse};
use futures::StreamExt;

#[get("/")]
async fn index(mut body: web::Payload) -> Result<HttpResponse, Error> {
    let mut bytes = web::BytesMut::new();
    while let Some(item) = body.next().await {
        let item = item?;
        println!("Chunk: {:?}", &item);
        bytes.extend_from_slice(&item);
    }

    Ok(HttpResponse::Ok().finish())
}
```

### 응답

빌더와 유사한 패턴은 `HttpResponse`의 인스턴스를 생성하는 데 사용됩니다. `HttpResponse`는 응답을 빌드하기 위한 다양한 메서드를 구현하는 `HttpResponseBuilder` 인스턴스를 반환하는 여러 메서드를 제공합니다.

> 타입 설명은 [이 문서](https://docs.rs/actix-web/4.3.1/actix_web/struct.HttpResponseBuilder.html)를 확인하세요.

`.body`, `.finish`, `.json` 메서드는 응답 생성을 완료하고 생성된 *HttpResponse* 인스턴스를 반환합니다. 동일한 빌더 인스턴스에서 이 메서드를 여러 번 호출하면 패닉이 발생합니다.

```rust
use actix_web::{http::header::ContentType, HttpResponse};

async fn index() -> HttpResponse {
    HttpResponse::Ok()
        .content_type(ContentType::plaintext())
        .insert_header(("X-Hdr", "sample"))
        .body("data")
}
```

#### JSON 응답

`Json` 타입을 사용하면 잘 형식화 된 JSON 데이터로 응답할 수 있습니다. 여기서 T는 *JSON*으로 직렬화할 구조체의 타입이며, `Json<T>` 타입의 값을 반환하면 됩니다. T 타입은 serde의 `Serialize` trait을 구현해야 합니다.

다음 예제를 실행하려면 `Cargo.toml`의 종속성에 `serde`를 추가해야 합니다:

```rust
[dependencies]
serde = { version = "1.0", features = ["derive"] }
```

```
use actix_web::{get, web, Responder, Result};
use serde::Serialize;

#[derive(Serialize)]
struct MyObj {
    name: String,
}

#[get("/a/{name}")]
async fn index(name: web::Path<String>) -> Result<impl Responder> {
    let obj = MyObj {
        name: name.to_string(),
    };
    Ok(web::Json(obj))
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    use actix_web::{App, HttpServer};

    HttpServer::new(|| App::new().service(index))
        .bind(("127.0.0.1", 8080))?
        .run()
        .await
}
```

`HttpResponse`에서 `.json` 메서드를 호출하는 대신 이러한 방식으로 `Json` 타입을 사용하면 함수가 다른 유형의 응답이 아닌 JSON을 반환한다는 것을 즉시 알 수 있습니다.

#### 콘텐츠 인코딩

Actix Web은 [압축 미들웨어](https://docs.rs/actix-web/4.3.1/actix_web/middleware/struct.Compress.html)를 사용하여 페이로드를 자동으로 압축할 수 있습니다. 지원되는 코덱은 다음과 같습니다:

- Brotli

- Gzip

- Deflate

- Identity

응답의 `Content-Encoding` 헤더는 기본적으로 요청의 `Accept-Encoding` 헤더를 기반으로 자동 콘텐츠 압축 협상을 수행하는 `ContentEncoding::Auto`로 설정됩니다.

```rust
use actix_web::{get, middleware, App, HttpResponse, HttpServer};

#[get("/")]
async fn index() -> HttpResponse {
    HttpResponse::Ok().body("data")
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new()
            .wrap(middleware::Compress::default())
            .service(index)
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}
```

`Content-Encoding`을 `Identity` 값으로 설정하여 핸들러에서 콘텐츠 압축을 명시적으로 비활성화합니다:

```rust
use actix_web::{
    get, http::header::ContentEncoding, middleware, App, HttpResponse, HttpServer,
};

#[get("/")]
async fn index() -> HttpResponse {
    HttpResponse::Ok()
        // v- 압축 비활성화
        .insert_header(ContentEncoding::Identity)
        .body("data")
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new()
            .wrap(middleware::Compress::default())
            .service(index)
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}
```

이미 압축된 본문을 처리할 때(예: 사전 압축된 에셋을 제공할 때) 미들웨어를 우회하려면 응답에 `Content-Encoding` 헤더를 수동으로 설정하세요:

```rust
use actix_web::{
    get, http::header::ContentEncoding, middleware, App, HttpResponse, HttpServer,
};

static HELLO_WORLD: &[u8] = &[
    0x1f, 0x8b, 0x08, 0x00, 0xa2, 0x30, 0x10, 0x5c, 0x00, 0x03, 0xcb, 0x48, 0xcd, 0xc9, 0xc9,
    0x57, 0x28, 0xcf, 0x2f, 0xca, 0x49, 0xe1, 0x02, 0x00, 0x2d, 0x3b, 0x08, 0xaf, 0x0c, 0x00,
    0x00, 0x00,
];

#[get("/")]
async fn index() -> HttpResponse {
    HttpResponse::Ok()
        .insert_header(ContentEncoding::Gzip)
        .body(HELLO_WORLD)
}
```

### 테스트

모든 애플리케이션은 제대로 테스트되어야 합니다. Actix Web은 단위 및 통합 테스트를 수행할 수 있는 도구를 제공합니다.

#### 유닛 테스트

유닛 테스트를 위해 actix-web은 요청 빌더 유형을 제공합니다. [*TestRequest*](https://docs.rs/actix-web/4.3.1/actix_web/test/struct.TestRequest.html)는 빌더와 유사한 패턴을 구현합니다. `to_http_request()`를 사용하여 `HttpRequest` 인스턴스를 생성하고 핸들러를 호출할 수 있습니다.

```rust
#[cfg(test)]
mod tests {
    use super::*;
    use actix_web::{
        http::{self, header::ContentType},
        test,
    };

    #[actix_web::test]
    async fn test_index_ok() {
        let req = test::TestRequest::default()
            .insert_header(ContentType::plaintext())
            .to_http_request();
        let resp = index(req).await;
        assert_eq!(resp.status(), http::StatusCode::OK);
    }

    #[actix_web::test]
    async fn test_index_not_ok() {
        let req = test::TestRequest::default().to_http_request();
        let resp = index(req).await;
        assert_eq!(resp.status(), http::StatusCode::BAD_REQUEST);
    }
}
```

#### 통합 테스트

애플리케이션을 테스트하는 몇 가지 방법이 있습니다. Actix Web은 실제 HTTP 서버에서 특정 핸들러로 애플리케이션을 실행하는 데 사용할 수 있습니다.

테스트 서버로 요청을 전송하는 데 `TestRequest::get()`, `TestRequest::post()` 및 기타 메서드를 사용할 수 있습니다.

테스트용 `Service`를 생성하려면 일반 `App` 빌더를 허용하는 `test::init_service` 메서드를 사용합니다.

> 자세한 내용은 [API 문서](https://docs.rs/actix-web/4.3.1/actix_web/test/index.html)를 확인하세요.

```rust
#[cfg(test)]
mod tests {
    use actix_web::{http::header::ContentType, test, web, App};

    use super::*;

    #[actix_web::test]
    async fn test_index_get() {
        let app = test::init_service(App::new().route("/", web::get().to(index))).await;
        let req = test::TestRequest::default()
            .insert_header(ContentType::plaintext())
            .to_request();
        let resp = test::call_service(&app, req).await;
        assert!(resp.status().is_success());
    }

    #[actix_web::test]
    async fn test_index_post() {
        let app = test::init_service(App::new().route("/", web::get().to(index))).await;
        let req = test::TestRequest::post().uri("/").to_request();
        let resp = test::call_service(&app, req).await;
        assert!(resp.status().is_client_error());
    }
}
```

더 복잡한 애플리케이션 설정이 필요한 경우 테스트는 일반 애플리케이션을 만드는 것과 매우 유사해야 합니다. 예를 들어, 애플리케이션 상태를 초기화 해야 할 수 있습니다. `data` 메서드가 있는 `App`을 만들고 일반 애플리케이션에서와 마찬가지로 상태를 첨부합니다.

```rust
#[cfg(test)]
mod tests {
    use super::*;
    use actix_web::{test, web, App};

    #[actix_web::test]
    async fn test_index_get() {
        let app = test::init_service(
            App::new()
                .app_data(web::Data::new(AppState { count: 4 }))
                .route("/", web::get().to(index)),
        )
        .await;
        let req = test::TestRequest::get().uri("/").to_request();
        let resp: AppState = test::call_and_read_body_json(&app, req).await;

        assert_eq!(resp.count, 4);
    }
}
```

#### 스트림 응답 테스트

스트림 생성을 테스트해야 하는 경우, 예를 들어, [*서버 전송 이벤트(Server Sent Events)*](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events)를 테스트할 때 [`into_parts()`](https://docs.rs/actix-web/4.3.1/actix_web/struct.HttpResponse.html#method.into_parts)를 호출하고 결과 본문을 future로 변환하여 실행하는 것으로 충분할 것입니다.

```rust
use std::task::Poll;

use actix_web::{
    http::{self, header::ContentEncoding, StatusCode},
    web, App, Error, HttpRequest, HttpResponse,
};
use futures::stream;

async fn sse(_req: HttpRequest) -> HttpResponse {
    let mut counter: usize = 5;

    // [5; 1]에서 N에 해당되는 `data: N` 생성
    let server_events =
        stream::poll_fn(move |_cx| -> Poll<Option<Result<web::Bytes, Error>>> {
            if counter == 0 {
                return Poll::Ready(None);
            }
            let payload = format!("data: {}\n\n", counter);  // 스트림 청크
            counter -= 1;
            Poll::Ready(Some(Ok(web::Bytes::from(payload))))
        });

    HttpResponse::build(StatusCode::OK)
        .insert_header((http::header::CONTENT_TYPE, "text/event-stream"))
        .insert_header(ContentEncoding::Identity)
        .streaming(server_events)
}

pub fn main() {
    App::new().route("/", web::get().to(sse));
}

#[cfg(test)]
mod tests {
    use super::*;

    use actix_web::{body, body::MessageBody as _, rt::pin, test, web, App};
    use futures::future;

    #[actix_web::test]
    async fn test_stream_chunk() {
        let app = test::init_service(App::new().route("/", web::get().to(sse))).await;
        let req = test::TestRequest::get().to_request();

        let resp = test::call_service(&app, req).await;
        assert!(resp.status().is_success());

        let body = resp.into_body();
        pin!(body);

        // 첫번째 청크
        let bytes = future::poll_fn(|cx| body.as_mut().poll_next(cx)).await;
        assert_eq!(
            bytes.unwrap().unwrap(),
            web::Bytes::from_static(b"data: 5\n\n")
        );

        // 두번째 청크
        let bytes = future::poll_fn(|cx| body.as_mut().poll_next(cx)).await;
        assert_eq!(
            bytes.unwrap().unwrap(),
            web::Bytes::from_static(b"data: 4\n\n")
        );

        // 남은 부분
        for i in 0..3 {
            let expected_data = format!("data: {}\n\n", 3 - i);
            let bytes = future::poll_fn(|cx| body.as_mut().poll_next(cx)).await;
            assert_eq!(bytes.unwrap().unwrap(), web::Bytes::from(expected_data));
        }
    }

    #[actix_web::test]
    async fn test_stream_full_payload() {
        let app = test::init_service(App::new().route("/", web::get().to(sse))).await;
        let req = test::TestRequest::get().to_request();

        let resp = test::call_service(&app, req).await;
        assert!(resp.status().is_success());

        let body = resp.into_body();
        let bytes = body::to_bytes(body).await;  // 전체 청크를 다 가져옴
        assert_eq!(
            bytes.unwrap(),
            web::Bytes::from_static(b"data: 5\n\ndata: 4\n\ndata: 3\n\ndata: 2\n\ndata: 1\n\n")
        );
    }
}
```

### 미들웨어

Actix Web의 미들웨어 시스템을 사용하면 요청/응답 처리에 동작을 추가할 수 있습니다. 미들웨어는 요청 프로세스에 연결하여 요청을 수정하고, 요청 처리를 중단하여 응답을 조기에 반환할 수 있습니다.

미들웨어는 응답 처리에도 연결할 수 있습니다.

일반적으로 미들웨어는 다음 작업에 관여합니다:

- 요청 전처리

- 응답 후처리

- 애플리케이션 상태 수정

- 외부 서비스(redis, 로깅, 세션) 접근

미들웨어는 각 `App`, `scope` 또는 `Resource`에 대해 등록 되며 등록 순서와 역순으로 실행됩니다. 일반적으로 미들웨어는 [*Service trait*](https://docs.rs/actix-web/4.3.1/actix_web/dev/trait.Service.html)과 [*Transform trait*](https://docs.rs/actix-web/4.3.1/actix_web/dev/trait.Transform.html)을 구현하는 유형입니다. Trait의 각 메서드에는 기본 구현이 있습니다. 각 메서드는 결과를 즉시 반환하거나 *future* 객체를 반환할 수 있습니다.

다음은 간단한 미들웨어를 만드는 예시입니다:

```rust
use std::future::{ready, Ready};

use actix_web::{
    dev::{forward_ready, Service, ServiceRequest, ServiceResponse, Transform},
    Error,
};
use futures_util::future::LocalBoxFuture;

// 미들웨어 처리에는 두 단계가 있습니다.
// 1. 미들웨어 초기화, 미들웨어 팩토리가 체인의 다음 서비스를 파라미터로 사용하여 호출됩니다.
// 2. 미들웨어의 호출 메서드는 일반 요청과 함께 호출됩니다.
pub struct SayHi;

// 미들웨어 팩토리는 `Transform` trait입니다.
// `S` - 다음 서비스 유형
// `B` - 응답 본문 유형
impl<S, B> Transform<S, ServiceRequest> for SayHi
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error>,
    S::Future: 'static,
    B: 'static,
{
    type Response = ServiceResponse<B>;
    type Error = Error;
    type InitError = ();
    type Transform = SayHiMiddleware<S>;
    type Future = Ready<Result<Self::Transform, Self::InitError>>;

    fn new_transform(&self, service: S) -> Self::Future {
        ready(Ok(SayHiMiddleware { service }))
    }
}

pub struct SayHiMiddleware<S> {
    service: S,
}

impl<S, B> Service<ServiceRequest> for SayHiMiddleware<S>
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error>,
    S::Future: 'static,
    B: 'static,
{
    type Response = ServiceResponse<B>;
    type Error = Error;
    type Future = LocalBoxFuture<'static, Result<Self::Response, Self::Error>>;

    forward_ready!(service);

    fn call(&self, req: ServiceRequest) -> Self::Future {
        println!("Hi from start. You requested: {}", req.path());

        let fut = self.service.call(req);

        Box::pin(async move {
            let res = fut.await?;

            println!("Hi from response");
            Ok(res)
        })
    }
}
```

또는 간단한 사용 사례의 경우 [*wrap\_fn*](https://docs.rs/actix-web/4.3.1/actix_web/struct.App.html#method.wrap_fn)을 사용하여 작은, ad-hoc 미들웨어를 만들 수 있습니다:

```rust
use actix_web::{dev::Service as _, web, App};
use futures_util::future::FutureExt;

#[actix_web::main]
async fn main() {
    let app = App::new()
        .wrap_fn(|req, srv| {
            println!("Hi from start. You requested: {}", req.path());
            srv.call(req).map(|res| {
                println!("Hi from response");
                res
            })
        })
        .route(
            "/index.html",
            web::get().to(|| async { "Hello, middleware!" }),
        );
}
```

> Actix Web은 로깅, 사용자 세션, 압축 등과 같은 몇 가지 유용한 미들웨어를 제공합니다.

**Warninig:** **`wrap()`** **또는** **`wrap_fn()`****을 여러 번 사용하는 경우 마지막으로 발생한 항목이 먼저 실행됩니다.**

#### 로깅

로깅은 미들웨어로 구현됩니다. 로깅 미들웨어를 애플리케이션의 첫 번째 미들웨어로 등록하는 것이 일반적입니다. 로깅 미들웨어는 각 애플리케이션마다 등록해야 합니다.

`Logger` 미들웨어는 표준 로그 크레이트를 사용하여 정보를 로깅 합니다. *actix\_web* 패키지가 액세스 로그를 보려면 로거를 활성화해야 합니다([env\_logger](https://docs.rs/env_logger/0.10.0/env_logger/)와 같은것).

**사용법**

지정된 포맷으로 `Logger` 미들웨어를 생성합니다. 디폴트 `Logger`는 `default` 메소드로 생성할 수 있으며, 디폴트 포맷을 사용합니다:

```rust
%a %t "%r" %s %b "%{Referer}i" "%{User-Agent}i" %T
```

```
use actix_web::middleware::Logger;
use env_logger::Env;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    use actix_web::{App, HttpServer};

    env_logger::init_from_env(Env::default().default_filter_or("info"));

    HttpServer::new(|| {
        App::new()
            .wrap(Logger::default())
            .wrap(Logger::new("%a %{User-Agent}i"))
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}
```

다음은 디폴트 로깅 포맷의 예입니다:

```
INFO:actix_web::middleware::logger: 127.0.0.1:59934 [02/Dec/2017:00:21:43 -0800] "GET / HTTP/1.1" 302 0 "-" "curl/7.54.0" 0.000397
INFO:actix_web::middleware::logger: 127.0.0.1:59947 [02/Dec/2017:00:22:40 -0800] "GET /index.html HTTP/1.1" 200 0 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.13; rv:57.0) Gecko/20100101 Firefox/57.0" 0.000646
```

**포맷**

- `%%` 퍼센트 기호

- `%a` 원격 IP 주소(역방향 프록시를 사용하는 경우 프록시의 IP 주소)

- `%t` 요청 처리가 시작된 시간

- `%P` 요청을 서비스한 자식의 프로세스 ID

- `%r` 요청의 첫 번째 줄

- `%s` 응답 상태 코드

- `%b` HTTP 헤더를 포함한 응답 크기(바이트)

- `%T` 요청을 처리하는 데 걸린 시간(초, .06f 형식의 부동 소수점)

- `%D` 요청을 처리하는 데 걸린 시간(밀리초)

- `%{FOO}i` request.headers['FOO']

- `%{FOO}o` response.headers['FOO']

- `%{FOO}e` os.environ['FOO']

#### 디폴트 헤더

`DefaultHeaders` 미들웨어로 디폴트 응답 헤더를 설정 할 수 있습니다. 응답 헤더에 이미 지정된 헤더가 포함되어 있는 경우 *DefaultHeaders* 미들웨어는 헤더를 설정하지 않습니다.

```rust
use actix_web::{http::Method, middleware, web, App, HttpResponse, HttpServer};

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new()
            .wrap(middleware::DefaultHeaders::new().add(("X-Version", "0.2")))
            .service(
                web::resource("/test")
                    .route(web::get().to(HttpResponse::Ok))
                    .route(web::method(Method::HEAD).to(HttpResponse::MethodNotAllowed)),
            )
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}
```

#### 유저 세션

Actix Web은 세션 관리를 위한 일반적인 솔루션을 제공합니다. [actix-session](https://docs.rs/actix-session/0.7.2/actix_session/) 미들웨어는 여러 백엔드 유형을 사용하여 세션 데이터를 저장할 수 있습니다.

> 디폴트로 쿠키 세션 백엔드만 구현됩니다만, 다른 백엔드 구현을 추가할 수 있습니다.

[CookieSession](https://docs.rs/actix-session/0.7.2/actix_session/storage/struct.CookieSessionStore.html)은 쿠키를 세션 저장소로 사용합니다. `CookieSessionBackend`는 페이로드가 단일 쿠키에 들어가야 하므로 4000바이트 미만의 데이터를 저장하는 것으로 제한되는 세션을 생성합니다. 세션에 4000바이트가 넘는 데이터가 포함되면 내부 서버 오류가 발생합니다.

쿠키에는 서명된 보안 정책 또는 *비공개* 보안 정책이 있을 수 있습니다. 각 쿠키에는 각각의 `CookieSession` 생성자가 있습니다.

*서명된 쿠키(signed cookie)*는 클라이언트가 볼 수는 있지만 수정할 수는 없습니다. *비공개 쿠키(private cookie)*는 클라이언트가 보거나 수정할 수 없습니다.

생성자는 키를 인수로 받습니다. 이 값은 쿠키 세션의 비공개 키이며, 이 값이 변경되면 모든 세션 데이터가 손실됩니다.

일반적으로 `SessionStorage` 미들웨어를 생성하고 쿠키 세션과 같은 특정 백엔드 구현으로 초기화 합니다. 세션 데이터에 액세스 하려면 [`Session`](https://docs.rs/actix-session/0.7.2/actix_session/struct.Session.html) 추출기를 사용해야 합니다. 이 메서드는 세션 데이터를 가져오거나 설정할 수 있는 [세션](https://docs.rs/actix-session/0.7.2/actix_session/struct.Session.html) 객체를 반환합니다.

> `actix_session::storage::CookieSessionStore`는 크레이트 기능 "cookie-session"에서 사용할 수 있습니다.

```rust
use actix_session::{Session, SessionMiddleware, storage::CookieSessionStore};
use actix_web::{web, App, Error, HttpResponse, HttpServer, cookie::Key};

async fn index(session: Session) -> Result<HttpResponse, Error> {
    // 세션 데이터 접근
    if let Some(count) = session.get::<i32>("counter")? {
        session.insert("counter", count + 1)?;
    } else {
        session.insert("counter", 1)?;
    }

    Ok(HttpResponse::Ok().body(format!(
        "Count is {:?}!",
        session.get::<i32>("counter")?.unwrap()
    )))
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new()
            .wrap(
                // 세션 미들웨어 기반 쿠키 생성
                SessionMiddleware::builder(CookieSessionStore::default(), Key::from(&[0; 64]))
                    .cookie_secure(false)
                    .build()
            )
            .service(web::resource("/").to(index))
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}
```

#### 에러 핸들러

`ErrorHandlers` 미들웨어를 사용하면 응답에 대한 사용자 정의 핸들러를 제공할 수 있습니다.

`ErrorHandlers::handler()` 메서드를 사용하여 특정 상태 코드에 대한 사용자 지정 오류 처리기를 등록할 수 있습니다. 기존 응답을 수정하거나 완전히 새로운 응답을 만들 수 있습니다. 오류 처리기는 즉시 응답을 반환하거나 응답으로 확인되는 future를 반환할 수 있습니다.

```rust
use actix_web::middleware::{ErrorHandlerResponse, ErrorHandlers};
use actix_web::{
    dev,
    http::{header, StatusCode},
    web, App, HttpResponse, HttpServer, Result,
};

fn add_error_header<B>(mut res: dev::ServiceResponse<B>) -> Result<ErrorHandlerResponse<B>> {
    res.response_mut().headers_mut().insert(
        header::CONTENT_TYPE,
        header::HeaderValue::from_static("Error"),
    );

    Ok(ErrorHandlerResponse::Response(res.map_into_left_body()))
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new()
            .wrap(
                ErrorHandlers::new()
                    .handler(StatusCode::INTERNAL_SERVER_ERROR, add_error_header),
            )
            .service(web::resource("/").route(web::get().to(HttpResponse::InternalServerError)))
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}
```

### 개별 파일

사용자 정의 경로 패턴과 `NamedFile`을 사용하여 정적 파일을 제공할 수 있습니다. 경로 끝 부분을 일치시키기 위해 `[.*]` 정규식을 사용할 수 있습니다.

```rust
use actix_files::NamedFile;
use actix_web::{HttpRequest, Result};
use std::path::PathBuf;

async fn index(req: HttpRequest) -> Result<NamedFile> {
    let path: PathBuf = req.match_info().query("filename").parse().unwrap();
    Ok(NamedFile::open(path)?)
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    use actix_web::{web, App, HttpServer};

    HttpServer::new(|| App::new().route("/{filename:.*}", web::get().to(index)))
        .bind(("127.0.0.1", 8080))?
        .run()
        .await
}
```

🚫

**위험**
경로 끝 부분을 `[.*]` 정규식과 일치시키고, 이를 사용하여 `NamedFile`을 반환하는 것은 보안에 심각한 영향을 미칩니다. 공격자가 URL에 `../`를 삽입하여 서버를 실행하는 사용자가 액세스할 수 있는 호스트의 모든 파일에 액세스할 수 있는 가능성을 제공합니다.

#### 디렉토리

특정 디렉터리 및 하위 디렉터리의 파일을 제공하려면 `Files`을 사용할 수 있습니다. `Files`은 `App::service()` 메서드로 등록해야 하며, 그렇지 않으면 하위 경로를 제공할 수 없습니다.

```rust
use actix_files as fs;
use actix_web::{App, HttpServer};

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| App::new().service(fs::Files::new("/static", ".").show_files_listing()))
        .bind(("127.0.0.1", 8080))?
        .run()
        .await
}
```

기본적으로 하위 디렉터리에 대한 파일 목록은 비활성화되어 있습니다. 디렉토리 목록을 로드하려고 시도하면 404 찾을 수 없음 응답이 반환됩니다. 파일 목록을 활성화하려면 [`Files::show_files_listing()`](https://docs.rs/actix-files/0.6.2/actix_files/struct.Files.html#method.show_files_listing) 메서드를 사용하세요.

디렉토리에 대한 파일 목록을 표시하는 대신 특정 인덱스 파일로 리디렉션할 수 있습니다. 이 리디렉션을 구성하려면 [`Files::index_file()`](https://docs.rs/actix-files/0.6.2/actix_files/struct.Files.html#method.index_file) 메서드를 사용하세요.

#### 설정

`NamedFiles`는 파일 제공을 위한 다양한 옵션을 지정할 수 있습니다:

- `set_content_disposition` - 파일의 mime을 해당 `Content-Disposition` 타입에 매핑하는 데 사용되는 함수입니다.

- `use_etag` - `ETag`를 계산하여 헤더에 포함할지 여부를 지정합니다.

- `use_last_modified` - 파일 수정 타임스탬프를 사용하여 `Last-Modified` 헤더에 추가할지 여부를 지정합니다.

위의 모든 메서드는 선택 사항이며 최상의 기본값으로 제공되지만 사용자 정의할 수 있습니다.

```rust
use actix_files as fs;
use actix_web::http::header::{ContentDisposition, DispositionType};
use actix_web::{get, App, Error, HttpRequest, HttpServer};

#[get("/{filename:.*}")]
async fn index(req: HttpRequest) -> Result<fs::NamedFile, Error> {
    let path: std::path::PathBuf = req.match_info().query("filename").parse().unwrap();
    let file = fs::NamedFile::open(path)?;
    Ok(file
        .use_last_modified(true)
        .set_content_disposition(ContentDisposition {
            disposition: DispositionType::Attachment,
            parameters: vec![],
        }))
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| App::new().service(index))
        .bind(("127.0.0.1", 8080))?
        .run()
        .await
}
```

이 구성은 디렉토리 서비스에도 적용할 수 있습니다:

```rust
use actix_files as fs;
use actix_web::{App, HttpServer};

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new().service(
            fs::Files::new("/static", ".")
                .show_files_listing()
                .use_last_modified(true),
        )
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}
```

## 프로토콜

### 웹 소켓

Actix Web은 `actix-web-actor` 크레이트와 함께 웹소켓을 지원합니다. [*web::Payload*](https://docs.rs/actix-web/4.3.1/actix_web/web/struct.Payload.html)를 사용하여 요청의 `Payload`를 *[ws::Message](https://docs.rs/actix-web-actors/2.0.0/actix_web_actors/ws/enum.Message.html)* 스트림으로 변환한 다음, 스트림 결합기를 사용하여 실제 메시지를 처리할 수도 있지만, 웹소켓 통신을 처리하는 것은 http 액터로 처리하는 것이 더 간단합니다.

다음은 간단한 웹소켓 에코 서버의 예시입니다:

```rust
use actix::{Actor, StreamHandler};
use actix_web::{web, App, Error, HttpRequest, HttpResponse, HttpServer};
use actix_web_actors::ws;

/// HTTP 액터 정의
struct MyWs;

impl Actor for MyWs {
    type Context = ws::WebsocketContext<Self>;
}

/// ws::Message 메세지 핸들러
impl StreamHandler<Result<ws::Message, ws::ProtocolError>> for MyWs {
    fn handle(&mut self, msg: Result<ws::Message, ws::ProtocolError>, ctx: &mut Self::Context) {
        match msg {
            Ok(ws::Message::Ping(msg)) => ctx.pong(&msg),
            Ok(ws::Message::Text(text)) => ctx.text(text),
            Ok(ws::Message::Binary(bin)) => ctx.binary(bin),
            _ => (),
        }
    }
}

async fn index(req: HttpRequest, stream: web::Payload) -> Result<HttpResponse, Error> {
    let resp = ws::start(MyWs {}, &req, stream);
    println!("{:?}", resp);
    resp
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| App::new().route("/ws/", web::get().to(index)))
        .bind(("127.0.0.1", 8080))?
        .run()
        .await
}
```

> 간단한 웹소켓 에코 서버 예제는 [examples 디렉터리](https://github.com/actix/examples/tree/master/websockets)에서 확인할 수 있습니다.

> 웹소켓 또는 TCP 연결을 통해 채팅할 수 있는 채팅 서버 예제는 [websocket-chat 디렉터리](https://github.com/actix/examples/tree/master/websockets/chat)에서 확인 할 수 있습니다.

### HTTPS/2

`actix-web`은 가능한 경우 연결을 HTTP/2로 자동 업그레이드합니다.

#### **Negotiation**

`rustls` 또는 `openssl` 기능 중 하나가 활성화된 경우 `HttpServer`는 각각 [bind\_rustls](https://docs.rs/actix-web/4.3.1/actix_web/struct.HttpServer.html#method.bind_rustls) 메서드와 [bind\_openssl](https://docs.rs/actix-web/4.3.1/actix_web/struct.HttpServer.html#method.bind_openssl) 메서드를 제공합니다.

```rust
[dependencies]
actix-web = { version = "4", features = ["openssl"] }
openssl = { version = "0.10", features = ["v110"] }
```

```
use actix_web::{web, App, HttpRequest, HttpServer, Responder};
use openssl::ssl::{SslAcceptor, SslFiletype, SslMethod};

async fn index(_req: HttpRequest) -> impl Responder {
    "Hello."
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // TLS 키를 로드하여 테스트용 자체 서명된 임시 인증서를 만듭니다:
		// `openssl req -x509 -newkey rsa:4096 -nodes -keyout key.pem -out cert.pem -days 365 -subj '/CN=localhost'`
    let mut builder = SslAcceptor::mozilla_intermediate(SslMethod::tls()).unwrap();
    builder
        .set_private_key_file("key.pem", SslFiletype::PEM)
        .unwrap();
    builder.set_certificate_chain_file("cert.pem").unwrap();

    HttpServer::new(|| App::new().route("/", web::get().to(index)))
        .bind_openssl("127.0.0.1:8080", builder)?
        .run()
        .await
}
```

[RFC 7540 §3.2](https://httpwg.org/specs/rfc7540.html#rfc.section.3.2)에 설명된 HTTP/2로의 업그레이드는 지원되지 않습니다. 사전 지식이 있는 상태에서 HTTP/2를 시작하는 것은 일반 텍스트와 TLS 연결 모두에 대해 지원됩니다([RFC 7540 §3.4](https://httpwg.org/specs/rfc7540.html#rfc.section.3.4))(하위 수준 `actix-http` 서비스 빌더를 사용하는 경우).

> 구체적인 예는 [TLS 예시](https://github.com/actix/examples/tree/master/https-tls)를 확인하세요.

## 패턴

### 자동-리로딩 개발 서버

개발 중에 변경 사항이 있을 때 자동으로 코드를 다시 컴파일하도록 설정하면 매우 편리할 수 있습니다. `cargo-watch`를 사용하면 이 작업을 매우 쉽게 수행할 수 있습니다.

```rust
cargo watch -x run
```

#### 역사적 기록

이 페이지의 이전 버전에서는 systemfd와 listenfd를 함께 사용할 것을 권장 했지만, 여기에는 많은 문제가 있으며 특히 광범위한 개발 워크플로우의 일부인 경우 제대로 통합 하기가 어려웠습니다. `cargo-watch`만으로도 자동 로딩에 충분하다고 생각합니다.

### 비동기 옵션

비동기 데이터베이스 어댑터의 사용을 보여주는 몇 가지 예제 프로젝트가 있습니다:

- Postgres: <https://github.com/actix/examples/tree/master/databases/postgres>

- SQLite: <https://github.com/actix/examples/tree/master/databases/sqlite>

- MongoDB: <https://github.com/actix/examples/tree/master/databases/mongodb>

#### **Diesel**

현재 버전의 Diesel (v1/v2)은 비동기 작업을 지원하지 않으므로 [`web::block`](https://docs.rs/actix-web/4.3.1/actix_web/web/fn.block.html) 함수를 사용하여 데이터베이스 작업을 Actix 런타임 스레드 풀로 오프로드 하는 것이 중요합니다.

앱이 데이터베이스에서 수행할 모든 작업에 해당하는 액션 함수를 만들 수 있습니다.

```rust
#[derive(Debug, Insertable)]
#[diesel(table_name = self::schema::users)]
struct NewUser<'a> {
    id: &'a str,
    name: &'a str,
}

fn insert_new_user(
    conn: &mut SqliteConnection,
    user_name: String,
) -> diesel::QueryResult<User> {
    use crate::schema::users::dsl::*;

    // Create insertion model
    let uid = format!("{}", uuid::Uuid::new_v4());
    let new_user = NewUser {
        id: &uid,
        name: &user_name,
    };

    // 일반 diesel 작동
    diesel::insert_into(users)
        .values(&new_user)
        .execute(conn)
        .expect("Error inserting person");

    let user = users
        .filter(id.eq(&uid))
        .first::<User>(conn)
        .expect("Error loading person that was just inserted");

    Ok(user)
}
```

이제 앱에서 많은 DB 연결을 사용할 수 있게 해주는 `r2d2`와 같은 크레이트를 사용하여 데이터베이스 풀을 설정해야 합니다. 즉, 여러 핸들러가 동시에 DB를 조작 하면서도 새로운 연결을 수락할 수 있습니다. 간단히 말해, 앱 상태의 풀입니다. (이 경우 풀이 공유 액세스를 처리하므로 상태 래퍼 구조체를 사용하지 않는 것이 유리합니다.)

```rust
type DbPool = r2d2::Pool<r2d2::ConnectionManager<SqliteConnection>>;

#[actix_web::main]
async fn main() -> io::Result<()> {
    // SQLite DB로 연결
    let manager = r2d2::ConnectionManager::<SqliteConnection>::new("app.db");
    let pool = r2d2::Pool::builder()
        .build(manager)
        .expect("database URL should be valid path to SQLite DB file");

    // 8080 포트로 HTTP 서버 시작
    HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(pool.clone()))
            .route("/{name}", web::get().to(index))
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}
```

이제 요청 핸들러에서 `Data<T>` 추출기를 사용하여 앱 상태에서 풀을 가져와서 연결을 가져옵니다. 이렇게 하면 [`web::block`](https://docs.rs/actix-web/4.3.1/actix_web/web/fn.block.html) 클로저로 전달할 수 있는 소유 데이터베이스 연결이 제공됩니다. 그런 다음 필요한 인수를 사용하여 액션 함수를 호출하고 결과를 `.await`하면 됩니다.

이 예제에서는 `?` 연산자를 사용하기 전에 오류를 `HttpResponse`에 매핑하지만 반환 오류 유형이 `ResponseError`를 구현하는 경우에는 이 작업이 필요하지 않습니다.

```rust
async fn index(
    pool: web::Data<DbPool>,
    name: web::Path<(String,)>,
) -> actix_web::Result<impl Responder> {
    let (name,) = name.into_inner();

    let user = web::block(move || {
        // 풀에서 연결을 가져오는 것도 잠재적인 차단 작업입니다.
				// 따라서 이 작업도 `web::block` 클로저 내에서 호출해야 합니다.
        let mut conn = pool.get().expect("couldn't get db connection from pool");

        insert_new_user(&mut conn, name)
    })
    .await?
    .map_err(error::ErrorInternalServerError)?;

    Ok(HttpResponse::Ok().json(user))
}
```

여기까지입니다! 전체 예제 보기: <https://github.com/actix/examples/tree/master/databases/diesel>

## 다이어그램

### 아키텍처 개요

아래는 다음 코드에서 발생하는 HttpServer 초기화 다이어그램입니다.

```rust
#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new()
            .route("/", web::to(|| HttpResponse::Ok()))
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}
```


<!-- TODO: 이미지 추가 - 파일명: http_server-5354c2dfdf584123f44e726d25b949db.svg, 원본: https://www.notion.so/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fsecure.notion-static.com%2Fe049fd45-2af6-407f-a18a-a4cee355ca93%2Fhttp_server-5354c2dfdf584123f44e726d25b949db.svg?table=block&id=7c54b414-a59b-4dd0-a8c6-b18cc769315f&cache=v2 -->

![notion image]()


서버가 모든 소켓을 수신 대기하기 시작한 후 [`Accept`](https://github.com/actix/actix-net/blob/master/actix-server/src/accept.rs)와 [`Worker`](https://github.com/actix/actix-net/blob/master/actix-server/src/worker.rs)는 들어오는 클라이언트 연결을 처리하는 두 가지 주요 루프입니다.

연결이 수락되면 애플리케이션 수준 프로토콜 처리는 [`Worker`](https://github.com/actix/actix-net/blob/master/actix-server/src/worker.rs)에서 생성된 프로토콜별 [`Dispatcher`](https://github.com/actix/actix-web/blob/master/actix-http/src/h1/dispatcher.rs) 루프에서 이루어집니다.

```
아래 다이어그램은 happy-path 시나리오만 간략하게 설명한 것입니다.
```


<!-- TODO: 이미지 추가 - 파일명: connection_overview-97766f50097ec4e7457e88ddf4a55f8b.svg, 원본: https://www.notion.so/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fsecure.notion-static.com%2F5fa3d27c-761f-45fe-a5ef-d24a22308920%2Fconnection_overview-97766f50097ec4e7457e88ddf4a55f8b.svg?table=block&id=a02ead64-f83b-492c-8707-eb87fb9da7d6&cache=v2 -->

![notion image]()


#### Accept 루프 자세히 보기


<!-- TODO: 이미지 추가 - 파일명: connection_accept-71d2b913dba510316a3123c2dc824c53.svg, 원본: https://www.notion.so/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fsecure.notion-static.com%2F98784696-a30f-450b-a72c-8a3eec18ae48%2Fconnection_accept-71d2b913dba510316a3123c2dc824c53.svg?table=block&id=0044d0b7-5667-42fa-a9e8-d8baad127204&cache=v2 -->

![notion image]()


대부분의 코드 구현은 구조체 [`Accept`](https://github.com/actix/actix-net/blob/master/actix-server/src/accept.rs)를 위한 [`actix-server`](https://crates.io/crates/actix-server) 크레이트에 있습니다.

#### 워커 루프 자세히 보기


<!-- TODO: 이미지 추가 - 파일명: connection_worker-716c9ff05de68638add7d3178c503637.svg, 원본: https://www.notion.so/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fsecure.notion-static.com%2Fa43aea7f-29d6-42a5-9819-1abee5ade3dc%2Fconnection_worker-716c9ff05de68638add7d3178c503637.svg?table=block&id=b4d45d52-eff9-42c2-acd4-48a6fd242428&cache=v2 -->

![notion image]()


대부분의 코드 구현은 구조체 [`Worker`](https://github.com/actix/actix-net/blob/master/actix-server/src/worker.rs)를 위한 [`actix-server`](https://crates.io/crates/actix-server) 크레이트에 있습니다.

#### 대략적인 요청 루프


<!-- TODO: 이미지 추가 - 파일명: connection_request-9dbd9333b5f99acf894184ad52124364.svg, 원본: https://www.notion.so/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fsecure.notion-static.com%2F533fc0b8-94ca-4198-a814-2a7ecae14a53%2Fconnection_request-9dbd9333b5f99acf894184ad52124364.svg?table=block&id=1b18e5ac-5bc7-4f13-9a96-ac81904a220e&cache=v2 -->

![notion image]()


요청 루프에 대한 대부분의 코드 구현은 [`actix-web`](https://crates.io/crates/actix-web) 및 [`actix-http`](https://crates.io/crates/actix-http) 크레이트에 있습니다.

## Actix

### 빠른 시작

Actix 애플리케이션 작성을 시작하려면 먼저 Rust 버전이 설치되어 있어야 합니다. 해당 버전을 설치하거나 구성하려면 rustup을 사용하는 것이 좋습니다.

#### Rust 설치

시작하기 전에 [rustup](https://rustup.rs/) 인스톨러를 사용하여 Rust를 설치해야 합니다:

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

이미 rustup이 설치되어 있는 경우 아래 명령을 실행하여 최신 버전의 Rust가 설치되어 있는지 확인하세요:

```
rustup update
```

Actix 프레임워크에는 Rust 버전 1.40.0 이상이 필요합니다.

#### 실행 예제

actix 실험을 시작하는 가장 빠른 방법은 actix 리포지토리를 복제하고 examples/ 디렉토리에 포함된 예제를 실행하는 것입니다. 다음 명령어들은 `ping` 예제를 실행합니다:

```rust
git clone https://github.com/actix/actix
cd actix
cargo run --example ping
```

더 많은 예제를 보려면 [examples/](https://github.com/actix/actix/tree/master/actix/examples) 디렉토리를 확인하세요.

### 시작하기

첫 번째 actix 애플리케이션을 생성하고 실행해 봅시다. actix에 의존하는 새 Cargo 프로젝트를 생성한 다음 애플리케이션을 실행하겠습니다.

이전 섹션에서 이미 필요한 러스트 버전을 설치했습니다. 이제 새 Cargo 프로젝트를 생성해 보겠습니다.

#### Ping 액터

첫 번째 액틱스 애플리케이션을 작성해 봅시다! 먼저 새로운 바이너리 기반 Cargo 프로젝트를 생성하고 새 디렉토리로 변경합니다:

```rust
cargo new actor-ping
cd actor-ping
```

이제 Cargo.toml에 다음이 포함되어 있는지 확인하여 프로젝트의 종속성으로 actix를 추가합니다:

```toml
[dependencies]
actix = "0.11.0"
actix-rt = "2.2" # <-- actix 런타임
```

`Ping` 메시지를 수락하고 처리된 핑의 개수로 응답하는 액터를 만들어 보겠습니다.

액터는 `Actor` trait을 구현하는 유형입니다:

```rust
use actix::prelude::*;

struct MyActor {
    count: usize,
}

impl Actor for MyActor {
    type Context = Context<Self>;
}
```

각 액터에는 실행 컨텍스트가 있으며, `MyActor`에는 `Context<A>`를 사용하겠습니다. 액터 컨텍스트에 대한 자세한 정보는 다음 섹션에서 확인할 수 있습니다.

이제 액터가 수락해야 하는 `Message`를 정의해야 합니다. 메시지는 `Message` trait을 구현하는 모든 유형이 될 수 있습니다.

```rust
use actix::prelude::*;

#[derive(Message)]
#[rtype(result = "usize")]
struct Ping(usize);
```

`Message` trait의 주요 목적은 결과 타입을 정의하는 것입니다. `Ping` 메시지는 `usize`를 정의하는데, 이는 `Ping` 메시지를 수신할 수 있는 모든 액터가 `usize` 값을 반환해야 함을 나타냅니다.

마지막으로 액터 `MyActor`가 `Ping`을 수락하고 처리할 수 있음을 선언해야 합니다. 이를 위해 액터는 `Handler<Ping>` trait을 구현해야 합니다.

```rust
impl Handler<Ping> for MyActor {
    type Result = usize;

    fn handle(&mut self, msg: Ping, _ctx: &mut Context<Self>) -> Self::Result {
        self.count += msg.0;

        self.count
    }
}
```

이게 전부 입니다. 이제 액터를 시작하고 메시지를 보내면 됩니다. 시작 절차는 액터의 컨텍스트 구현에 따라 다릅니다. 이 경우 tokio/future 기반인 `Context<A>`를 사용할 수 있습니다. `Actor::start()` 또는`Actor::create()`로 시작할 수 있습니다. 첫 번째는 액터 인스턴스를 즉시 생성할 수 있을 때 사용됩니다. 두 번째 방법은 액터 인스턴스를 생성하기 전에 컨텍스트 개체에 액세스해야 하는 경우에 사용됩니다. `MyActor` 액터의 경우 `start()`를 사용할 수 있습니다.

액터와의 모든 커뮤니케이션은 주소를 통해 이루어집니다. 응답을 기다리지 않고 `do_send` 메시지를 보내거나 특정 메시지를 액터에게 `send` 를 보낼 수 있습니다. `start()` 함수와 `create()` 함수는 모두 주소 객체를 반환합니다.

다음 예제에서는 `MyActor` 액터를 생성하고 하나의 메시지를 보내겠습니다.

여기서는 액터에 전송된 메시지를 쉽게 .`await`할 수 있도록 시스템을 시작하고 메인 Future를 구동하는 방법으로 actix-rt를 사용합니다.

```rust
#[actix_rt::main] 
async fn main() {
    // 새 액터 시작
    let addr = MyActor { count: 10 }.start();

    // 메세지를 보내고 future 결과를 가져옴
    let res = addr.send(Ping(10)).await;

    // handle()는 tokio 핸들러 리턴
    println!("RESULT: {}", res.unwrap() == 20);

    // 시스템 중단과 종료
    System::current().stop();
}
```

`#[actix_rt::main]`은 시스템을 시작하고 future가 처리될 때까지 블록 합니다.

Ping 예제는 [예제 디렉토리](https://github.com/actix/actix/tree/master/actix/examples/)에서 확인할 수 있습니다.

### 액터

Actix는 동시에 실행되는 어플리케이션 개발을 위한 프레임워크를 제공하는 Rust 라이브러리입니다.

Actix는 애플리케이션이 독립적으로 실행되지만 메시지를 통해 통신하는 협력 "액터" 그룹으로 작성될 수 있도록 하는 [Actor Model](https://en.wikipedia.org/wiki/Actor_model)을 기반으로 합니다. 액터는 상태와 동작을 캡슐화하고 actix 라이브러리에서 제공하는 *액터 시스템* 내에서 실행되는 객체입니다.

액터는 특정 실행 컨텍스트 `Context<A>` 내에서 실행됩니다. 컨텍스트 개체는 실행 중에만 사용할 수 있습니다. 각 액터에는 별도의 실행 컨텍스트가 있습니다. 실행 컨텍스트는 액터의 수명 주기도 제어합니다.

액터는 메시지 교환을 통해 독점적으로 통신합니다. 보내는 액터는 선택적으로 응답을 기다릴 수 있습니다. 액터는 직접 참조되지 않고 주소를 통해 참조됩니다.

모든 Rust 타입은 액터가 될 수 있으며 `Actor` trait을 구현하기만 하면 됩니다.

특정 메시지를 처리할 수 있으려면 액터가 이 메시지에 대한 [`Handler<M>`](https://docs.rs/actix/latest/actix/trait.Handler.html) 구현을 제공해야 합니다. 모든 메시지는 정적으로 입력됩니다. 메시지는 비동기 방식으로 처리될 수 있습니다. 액터는 다른 액터를 생성하거나 퓨처 또는 스트림을 실행 컨텍스트에 추가할 수 있습니다. `Actor` trait은 액터의 라이프사이클를 제어할 수 있는 여러 메서드를 제공합니다.

#### 액터 라이프사이클

**Started**

액터는 항상 `Started` 상태에서 시작됩니다. 이 상태에서는 액터의 `started()` 메서드가 호출됩니다. `Actor` trait은 이 메서드에 대한 기본 구현을 제공합니다. 이 상태에서는 액터 컨텍스트를 사용할 수 있으며 액터는 더 많은 액터를 시작하거나 비동기 스트림을 등록하거나 기타 필요한 구성을 수행할 수 있습니다.

**Running**

액터의 `started()` 메서드가 호출되면 액터는 실행 중(`Running`) 상태로 전환됩니다. 액터는 무한정 `running` 상태를 유지할 수 있습니다.

**Stopping**

액터의 실행 상태는 다음과 같은 상황에서 `stopping` 상태로 변경됩니다:

- 액터 자체에 의해 `Context::stop`이 호출됩니다.

- 액터에 대한 모든 주소가 삭제됩니다. 즉, 다른 액터가 액터를 참조하지 않습니다.

- 컨텍스트에 이벤트 객체가 등록되지 않은 경우.

액터는 새 주소를 생성하거나 이벤트 객체를 추가하고 `Running::Continue`를 반환하여 `stopping` 상태에서 `running` 상태로 복원할 수 있습니다.

`Context::stop()`이 호출되어 액터의 상태가 중지 상태로 변경된 경우, 컨텍스트는 즉시 수신 메시지 처리를 중지하고 `Actor::stopping()`을 호출합니다. 액터가 다시 `running` 상태로 복원되지 않으면 처리되지 않은 모든 메시지가 삭제됩니다.

기본적으로 이 메서드는 중지 작업을 확인하는 `Running::Stop`을 반환합니다.

**Stopped**

액터가 중지 상태에서 실행 컨텍스트를 수정하지 않으면 액터 상태가 `Stopped`으로 변경됩니다. 이 상태는 최종 상태로 간주되며 이 시점에서 액터가 삭제됩니다.

#### 메세지

액터는 메시지를 전송하여 다른 액터와 통신합니다. 액틱스에서는 모든 메시지가 입력됩니다. 메시지는 [`Message`](https://docs.rs/actix/latest/actix/trait.Message.html) trait을 구현하는 모든 Rust 타입이 될 수 있습니다. `Message::Result`는 리턴 타입을 정의합니다. 간단한 `Ping` 메시지를 정의해 보겠습니다. 이 메시지를 수신하는 액터는 `Result<bool, std::io::Error>`를 반환해야 합니다.

```rust
use actix::prelude::*;

struct Ping;

impl Message for Ping {
    type Result = Result<bool, std::io::Error>;
}
```

#### 액터 스폰

액터를 시작하는 방법은 컨텍스트에 따라 다릅니다. 새로운 비동기 액터를 스폰하는 것은 [`Actor`](https://docs.rs/actix/latest/actix/trait.Actor.html) trait의 `start` 및 `create` 메서드를 통해 이루어집니다. 액터를 생성하는 여러 가지 방법이 제공되며, 자세한 내용은 문서를 참조하세요.

#### 전체 예제

```rust
use actix::prelude::*;

/// Define message
#[derive(Message)]
#[rtype(result = "Result<bool, std::io::Error>")]
struct Ping;

// Define actor
struct MyActor;

// Provide Actor implementation for our actor
impl Actor for MyActor {
    type Context = Context<Self>;

    fn started(&mut self, ctx: &mut Context<Self>) {
       println!("Actor is alive");
    }

    fn stopped(&mut self, ctx: &mut Context<Self>) {
       println!("Actor is stopped");
    }
}

/// Define handler for `Ping` message
impl Handler<Ping> for MyActor {
    type Result = Result<bool, std::io::Error>;

    fn handle(&mut self, msg: Ping, ctx: &mut Context<Self>) -> Self::Result {
        println!("Ping received");

        Ok(true)
    }
}

#[actix_rt::main]
async fn main() {
    // Start MyActor in current thread
    let addr = MyActor.start();

    // Send Ping message.
    // send() message returns Future object, that resolves to message result
    let result = addr.send(Ping).await;

    match result {
        Ok(res) => println!("Got result: {}", res.unwrap()),
        Err(err) => println!("Got error: {}", err),
    }
}
```

#### MessageResponse로 응답하기

위의 예제에서 임포트 핸들러에 정의된 `Result` 타입을 살펴보겠습니다. `Result<bool, std::io::Error>`가 어떻게 반환되는지 보이시죠? 이 타입으로 액터의 수신 메시지에 응답할 수 있는 이유는 해당 타입에 대해 구현된 `MessageResponse` trait이 있기 때문입니다. 해당 trait의 정의는 다음과 같습니다:

```rust
pub trait MessageResponse<A: Actor, M: Message> {
    fn handle(self, ctx: &mut A::Context, tx: Option<OneshotSender<M::Result>>);
}
```

이 trait이 구현되지 않은 유형으로 수신 메시지에 응답하는 것이 합리적일 때가 있습니다. 그런 경우에는 직접 특성을 구현할 수 있습니다. 다음은 `Ping` 메시지에 대해 `GotPing`으로 응답하고, `Pong` 메시지에 대해 `GotPong`으로 응답하는 예제입니다.

```rust
use actix::dev::{MessageResponse, OneshotSender};
use actix::prelude::*;

#[derive(Message)]
#[rtype(result = "Responses")]
enum Messages {
    Ping,
    Pong,
}

enum Responses {
    GotPing,
    GotPong,
}

impl<A, M> MessageResponse<A, M> for Responses
where
    A: Actor,
    M: Message<Result = Responses>,
{
    fn handle(self, ctx: &mut A::Context, tx: Option<OneshotSender<M::Result>>) {
        if let Some(tx) = tx {
            tx.send(self);
        }
    }
}

// 액터 정의
struct MyActor;

// 액터에 대한 액터 구현
impl Actor for MyActor {
    type Context = Context<Self>;

    fn started(&mut self, _ctx: &mut Context<Self>) {
        println!("Actor is alive");
    }

    fn stopped(&mut self, _ctx: &mut Context<Self>) {
        println!("Actor is stopped");
    }
}

/// `Messages` 열거형에 대한 핸들러 정의
impl Handler<Messages> for MyActor {
    type Result = Responses;

    fn handle(&mut self, msg: Messages, _ctx: &mut Context<Self>) -> Self::Result {
        match msg {
            Messages::Ping => Responses::GotPing,
            Messages::Pong => Responses::GotPong,
        }
    }
}

#[actix_rt::main]
async fn main() {
    // 현재 스레드에서 MyActor 시작
    let addr = MyActor.start();

    // Ping 메세지 전송
    // send() 메시지는 메시지 결과로 해석되는 Future 객체를 반환합니다.
    let ping_future = addr.send(Messages::Ping).await;
    let pong_future = addr.send(Messages::Pong).await;

    match pong_future {
        Ok(res) => match res {
            Responses::GotPing => println!("Ping received"),
            Responses::GotPong => println!("Pong received"),
        },
        Err(e) => println!("Actor is probably dead: {}", e),
    }

    match ping_future {
        Ok(res) => match res {
            Responses::GotPing => println!("Ping received"),
            Responses::GotPong => println!("Pong received"),
        },
        Err(e) => println!("Actor is probably dead: {}", e),
    }
}
```

### 주소

액터는 메시지를 주고받는 방식으로만 통신합니다. 보내는 액터는 선택적으로 응답을 기다릴 수 있습니다. 액터는 직접 참조할 수 없으며 주소로만 참조할 수 있습니다.

액터의 주소를 얻는 방법에는 여러 가지가 있습니다. `Actor` trait은 액터 시작을 위한 두 가지 헬퍼 메서드를 제공합니다. 둘 다 시작된 액터의 주소를 반환합니다.

다음은 `Actor::start()` 메서드 사용 예시입니다. 이 예제에서 `MyActor` 액터는 비동기식이며 호출자와 동일한 스레드에서 시작됩니다 - 스레드는 [SyncArbiter](https://actix.rs/docs/actix/sync-arbiter/) 챕터에서 다룹니다.

```rust
struct MyActor;
impl Actor for MyActor {
    type Context = Context<Self>;
}

let addr = MyActor.start();
```

비동기 액터는 `Context` 구조체에서 주소를 가져올 수 있습니다. 컨텍스트는 `AsyncContext` trait을 구현해야 합니다. `AsyncContext::address()`는 액터의 주소를 제공합니다.

```rust
struct MyActor;

impl Actor for MyActor {
    type Context = Context<Self>;

    fn started(&mut self, ctx: &mut Context<Self>) {
       let addr = ctx.address();
    }
}
```

#### 메세지

특정 메시지를 처리하려면 액터는 이 메시지에 대한 [`Handler<M>`](https://docs.rs/actix/latest/actix/trait.Handler.html) 구현을 제공해야 합니다. 모든 메시지는 정적으로 입력됩니다. 메시지는 비동기 방식으로 처리할 수 있습니다. 액터는 다른 액터를 스폰하거나 실행 컨텍스트에 퓨처 또는 스트림을 추가할 수 있습니다. 액터 특성은 액터의 라이프사이클을 제어할 수 있는 몇 가지 메서드를 제공합니다.

액터에 메시지를 보내려면 `Addr` 객체를 사용해야 합니다. `Addr`는 메시지를 전송하는 여러 가지 방법을 제공합니다.

- `Addr::do_send(M)` - 이 메서드는 메시지 전송 시 오류를 무시합니다. 사서함이 가득 차면 메시지가 여전히 대기열에 추가되어 제한을 우회합니다. 액터의 메일함이 닫혀 있으면 메시지가 자동으로 삭제됩니다. 이 메서드는 결과를 반환하지 않으므로 사서함이 닫혀서 실패가 발생해도 이에 대한 표시가 없습니다.

- `Addr::try_send(M)` - 이 메서드는 메시지를 즉시 보내려고 시도합니다. 사서함이 꽉 찼거나 닫힌 경우(액터가 죽은 경우) 이 메서드는 SendError를 반환합니다.

- `Addr::send(M)` - 이 메시지는 메시지 처리 프로세스의 결과로 확인되는 미래 객체를 반환합니다. 반환된 Future 객체가 삭제되면 메시지가 취소됩니다.

#### 수신자

수신자는 한 가지 유형의 메시지만 지원하는 주소의 특수 버전입니다. 메시지를 다른 유형의 액터에게 보내야 하는 경우에 사용할 수 있습니다. 수신자 객체는 주소에서 `Addr::recipient()`를 사용하여 생성할 수 있습니다.

주소 객체에는 액터 유형이 필요하지만 메시지를 처리할 수 있는 액터에게 특정 메시지만 보내고 싶다면 Recipient 인터페이스를 사용하면 됩니다.

예를 들어, 수신자는 구독 시스템에 사용할 수 있습니다. 다음 예제에서 `OrderEvents` 액터는 모든 구독자에게 `OrderShipped` 메시지를 보냅니다. 구독자는 `Handler<OrderShipped>` trait을 구현하는 모든 액터가 될 수 있습니다.

```rust
use actix::prelude::*;

#[derive(Message)]
#[rtype(result = "()")]
struct OrderShipped(usize);

#[derive(Message)]
#[rtype(result = "()")]
struct Ship(usize);

/// 주문 배송 이벤트 구독하기
#[derive(Message)]
#[rtype(result = "()")]
struct Subscribe(pub Recipient<OrderShipped>);

/// 주문 배송 이벤트 구독을 제공하는 액터
struct OrderEvents {
    subscribers: Vec<Recipient<OrderShipped>>,
}

impl OrderEvents {
    fn new() -> Self {
        OrderEvents {
            subscribers: vec![]
        }
    }
}

impl Actor for OrderEvents {
    type Context = Context<Self>;
}

impl OrderEvents {
    /// 모든 구독자에게 이벤트 보내기
    fn notify(&mut self, order_id: usize) {
        for subscr in &self.subscribers {
           subscr.do_send(OrderShipped(order_id));
        }
    }
}

/// 배송 이벤트 구독하기
impl Handler<Subscribe> for OrderEvents {
    type Result = ();

    fn handle(&mut self, msg: Subscribe, _: &mut Self::Context) {
        self.subscribers.push(msg.0);
    }
}

/// 배송 메시지 구독하기
impl Handler<Ship> for OrderEvents {
    type Result = ();
    fn handle(&mut self, msg: Ship, ctx: &mut Self::Context) -> Self::Result {
        self.notify(msg.0);
        System::current().stop();
    }
}

/// 이메일 구독자
struct EmailSubscriber;
impl Actor for EmailSubscriber {
    type Context = Context<Self>;
}

impl Handler<OrderShipped> for EmailSubscriber {
    type Result = ();
    fn handle(&mut self, msg: OrderShipped, _ctx: &mut Self::Context) -> Self::Result {
        println!("Email sent for order {}", msg.0)
    }
    
}
struct SmsSubscriber;
impl Actor for SmsSubscriber {
    type Context = Context<Self>;
}

impl Handler<OrderShipped> for SmsSubscriber {
    type Result = ();
    fn handle(&mut self, msg: OrderShipped, _ctx: &mut Self::Context) -> Self::Result {
        println!("SMS sent for order {}", msg.0)
    }
    
}

fn main() {
    let system = System::new("events");
    let email_subscriber = Subscribe(EmailSubscriber{}.start().recipient());
    let sms_subscriber = Subscribe(SmsSubscriber{}.start().recipient());
    let order_event = OrderEvents::new().start();
    order_event.do_send(email_subscriber);
    order_event.do_send(sms_subscriber);
    order_event.do_send(Ship(1));
    system.run();
}
```

### 컨텍스트

액터는 모두 내부 실행 컨텍스트 또는 상태를 유지합니다. 이를 통해 액터는 자체 주소를 결정하거나 메일함 한도를 변경하거나 실행을 중지할 수 있습니다.

#### 메일박스

모든 메시지는 먼저 액터의 메일박스로 이동한 다음 액터의 실행 컨텍스트에서 특정 메시지 핸들러를 호출합니다. 일반적으로 메일박스는 제한이 있습니다. 용량은 컨텍스트 구현에 따라 다릅니다. `Context` 타입의 경우 용량은 기본적으로 16개의 메시지로 설정되어 있으며 [`Context::set_mailbox_capacity()`](https://docs.rs/actix/latest/actix/struct.Context.html#method.set_mailbox_capacity)를 사용하여 늘릴 수 있습니다.

```rust
struct MyActor;

impl Actor for MyActor {
    type Context = Context<Self>;

    fn started(&mut self, ctx: &mut Self::Context) {
        ctx.set_mailbox_capacity(1);
    }
}

let addr = MyActor.start();
```

메일박스 큐 제한을 우회하는 `Addr::do_send(M)` 또는 메일박스을 완전히 우회하는 `AsyncContext::notify(M)` 및 `AsyncContext::notify_later(M, Duration)`에는 적용되지 않는다는 점을 유의하세요.

#### 액터 주소 얻기

액터는 컨텍스트에서 자신의 주소를 볼 수 있습니다. 나중에 이벤트를 리퀘스트하거나 메시지 유형을 변환하고 싶을 수도 있습니다. 메시지에 대한 주소로 응답하고 싶을 수도 있습니다. 액터가 스스로 메시지를 보내도록 하려면 대신 `AsyncContext::notify(M)`를 살펴보세요.

컨텍스트에서 주소를 가져오려면 [`Context::address()`](https://docs.rs/actix/latest/actix/struct.Context.html#method.address)를 호출합니다. 예를 들면 다음과 같습니다:

```rust
struct MyActor;

struct WhoAmI;

impl Message for WhoAmI {
    type Result = Result<actix::Addr<MyActor>, ()>;
}

impl Actor for MyActor {
    type Context = Context<Self>;
}

impl Handler<WhoAmI> for MyActor {
    type Result = Result<actix::Addr<MyActor>, ()>;

    fn handle(&mut self, msg: WhoAmI, ctx: &mut Context<Self>) -> Self::Result {
        Ok(ctx.address())
    }
}

let who_addr = addr.do_send(WhoAmI{});
```

#### 액터 중지

액터 실행 컨텍스트 내에서 액터가 향후 모든 메일함 메시지를 처리하지 않도록 선택할 수 있습니다. 이는 오류 조건에 대한 응답이거나 프로그램 종료의 일부일 수 있습니다. 이렇게 하려면 [`Context::stop()`](https://docs.rs/actix/latest/actix/struct.Context.html#method.stop)을 호출하면 됩니다.

다음은 4개의 핑이 수신된 후 중지하는 조정된 핑 예제입니다.

```rust
impl Handler<Ping> for MyActor {
    type Result = usize;

    fn handle(&mut self, msg: Ping, ctx: &mut Context<Self>) -> Self::Result {
        self.count += msg.0;

        if self.count > 5 {
            println!("Shutting down ping receiver.");
            ctx.stop()
        }

        self.count
    }
}

#[actix_rt::main]
async fn main() {
    // 새 액터 시작
    let addr = MyActor { count: 10 }.start();

    // 메세지 전송 및 퓨처 결과 가져오기
    let addr_2 = addr.clone();
    let res = addr.send(Ping(6)).await;

    match res {
        Ok(_) => assert!(addr_2.try_send(Ping(6)).is_err()),
        _ => {}
    }
}
```

### 아비터

`Arbiter`는 `Actor`, `functions`, `futures`에 비동기 실행 컨텍스트를 제공합니다. 액터에 액터별 실행 상태를 정의하는 `Context`가 포함되어 있는 경우, 중재자는 액터가 실행되는 환경을 호스팅합니다.

그 결과 중재자는 다양한 기능을 수행합니다. 특히 새 OS 스레드를 생성하고, 이벤트 루프를 실행하고, 해당 이벤트 루프에서 비동기적으로 작업을 생성하고, 비동기 작업의 헬퍼 역할을 할 수 있습니다.

#### 시스템 및 아비터

앞의 모든 코드 예제에서 `System::new` 함수는 액터가 내부에서 실행할 수 있는 중재자를 생성합니다. 액터에서 `start()`를 호출하면 액터는 시스템 아비터의 스레드 안에서 실행됩니다. 대부분의 경우 Actix를 사용하는 프로그램에는 이 정도면 충분합니다.

스레드는 하나만 사용하지만 비동기 이벤트에 잘 작동하는 매우 효율적인 이벤트 루프 패턴을 사용합니다. 동기식 CPU 바운드 작업을 처리하려면 이벤트 루프를 차단하지 않고 대신 다른 스레드로 계산을 오프로드하는 것이 좋습니다. 이 사용 사례의 경우 다음 섹션을 읽고 `SyncArbiter` 사용을 고려해 보세요.

#### 이벤트 루프

하나의 `Arbiter`가 하나의 이벤트 풀로 하나의 스레드를 제어합니다. 중재자가 태스크를 스폰하면(`Arbiter::spawn`, `Context::run_later` 또는 유사한 구조체를 통해), 중재자는 해당 태스크 큐에서 실행되도록 태스크를 큐에 대기시킵니다. Arbiter는 "단일 스레드 이벤트 루프"라고 생각하면 됩니다.

일반적으로 Actix는 동시성을 지원하지만, 일반 `Arbiter`(`SyncArbiters`가 아닌)는 지원하지 않습니다. Actix를 동시 방식으로 사용하려면 `Arbiter::new`, `ArbiterBuilder` 또는 `Arbiter::start`를 사용하여 여러 개의 `Arbiter`를 스핀업할 수 있습니다.

새 아비터를 생성하면 액터에 대한 새 실행 컨텍스트가 생성됩니다. 새 스레드에 새 액터를 추가할 수 있지만, 액터는 스폰된 아비터에 묶여 있어 아비터 사이를 자유롭게 이동할 수 없습니다. 하지만 서로 다른 아비터에 있는 액터는 여전히 일반적인 `Addr`/`Recipient` 메서드를 사용하여 서로 통신할 수 있습니다. 메시지 전달 방식은 액터가 같은 또는 다른 아비터에서 실행 중인지 여부와 무관합니다.

#### 비동기 이벤트 해결을 위한 아비터 사용

Rust 퓨처의 전문가가 아니라면, 아비터는 비동기 이벤트를 순서대로 해결하는 데 유용하고 간단한 래퍼가 될 수 있습니다. A와 B라는 두 개의 액터가 있고, A의 결과가 완료될 때만 B에서 이벤트를 실행하고 싶다고 가정해 봅시다. 이 작업을 지원하기 위해 `Arbiter::spawn`을 사용할 수 있습니다.

```rust
use actix::prelude::*;

struct SumActor {}

impl Actor for SumActor {
    type Context = Context<Self>;
}

#[derive(Message)]
#[rtype(result = "usize")]
struct Value(usize, usize);

impl Handler<Value> for SumActor {
    type Result = usize;

    fn handle(&mut self, msg: Value, _ctx: &mut Context<Self>) -> Self::Result {
        msg.0 + msg.1
    }
}

struct DisplayActor {}

impl Actor for DisplayActor {
    type Context = Context<Self>;
}

#[derive(Message)]
#[rtype(result = "()")]
struct Display(usize);

impl Handler<Display> for DisplayActor {
    type Result = ();

    fn handle(&mut self, msg: Display, _ctx: &mut Context<Self>) -> Self::Result {
        println!("Got {:?}", msg.0);
    }
}

fn main() {
    let system = System::new("single-arbiter-example");

    // Future을 사용하여 실행 흐름 정의하기
    let execution = async {
        // `Actor::start`은 *현재* `Arbiter`에 `Actor`를 스폰합니다. (이 경우 시스템 아비터)
        let sum_addr = SumActor {}.start();
        let dis_addr = DisplayActor {}.start();

        // 먼저 `Value(6, 7)`를 `SumActor`에 전송합니다.
        // `Addr::send`는 `Future`를 구현하는 `Request`로 응답합니다.
        // 대기 중이면 `Result<usize, MailboxError>`로 해석됩니다.
        let sum_result = sum_addr.send(Value(6, 7)).await;

        match sum_result {
            Ok(res) => {
								// 이제 `res`는 `SumActor`가 `Value(6, 7)`에 대한 응답으로 반환한 `usize`입니다.
								// Future가 완료되면 성공적인 응답(`usize`)을 전송합니다.
							  // `Display`로 감싼 `DisplayActor`로 전송합니다.
                dis_addr.send(Display(res)).await;
            }
            Err(e) => {
                eprintln!("Encountered mailbox error: {:?}", e);
            }
        };
    };

    // 현재 Arbiter/event 루프에 Future 스폰
    Arbiter::current().spawn(execution);

    // 이 예제에서는 하나의 계산만 수행하고자 합니다.
    // `System`을 종료하고 그 안에 있는 모든 아비터(시스템 아비터 포함)를 중지합니다.
    // 그 안에서 실행 중인 모든 액터 컨텍스트도 멈추고, 마지막으로 모든 액터를 종료합니다.
    System::current().stop();

    system.run();
}
```

### SyncArbiter

일반적으로 액터를 실행할 때는 이벤트 루프를 사용하여 시스템의 아비터 스레드에서 여러 액터가 실행됩니다. 하지만 CPU에 구속되는 워크로드나 동시 접속이 많은 워크로드의 경우, 액터 한 개가 여러 인스턴스를 병렬로 실행하고 싶을 수 있습니다.

SyncArbiter가 제공하는 기능, 즉 OS 스레드 풀에서 액터의 여러 인스턴스를 실행할 수 있는 기능이 바로 그것입니다.

한 가지 중요한 점은 SyncArbiter는 한 가지 유형의 액터만 호스팅할 수 있다는 점입니다. 즉, 이런 방식으로 실행하려는 액터 유형마다 SyncArbiter를 생성해야 합니다.

#### Sync Actor 생성

액터가 SyncArbiter에서 실행되도록 구현할 때, 액터의 컨텍스트가 `Context`에서 `SyncContext`로 변경되어야 합니다.

```rust
use actix::prelude::*;

struct MySyncActor;

impl Actor for MySyncActor {
    type Context = SyncContext<Self>;
}
```

#### Sync Arbiter 시작하기

이제 Sync Actor를 정의했으니, `SyncArbiter`로 생성한 스레드 풀에서 실행할 수 있습니다. SyncArbiter 생성 시점에만 스레드 수를 제어할 수 있으며 나중에 스레드를 추가/제거할 수는 없습니다.

```rust
use actix::prelude::*;

struct MySyncActor;

impl Actor for MySyncActor {
    type Context = SyncContext<Self>;
}

let addr = SyncArbiter::start(2, || MySyncActor);
```

이전에 시작한 액터와 동일한 방식으로 주소와 통신할 수 있습니다. 메시지를 보내고, 선물과 결과를 받는 등의 작업을 할 수 있습니다.

#### Sync Actor 메일박스

동기화 액터에는 메일함 제한이 없지만, 다른 가능한 오류나 동기화 대 비동기 동작을 고려하기 위해 `do_send`, `try_send` 및 `send`를 정상적으로 사용해야 합니다.

## API 문서

- [actix](https://docs.rs/actix/latest/actix/)

- [actix-web](https://docs.rs/actix-web/latest/actix_web/)