+++
title = "Starship, fnm으로 Zsh 시작 속도 개선하기"
date = 2026-01-12
draft = false

[taxonomies]
tags = ["zsh", "starship", "fnm"]

[extra]
author = "김태훈"
toc = true
+++

터미널 프롬프트를 Oh My Zsh + Powerlevel10k 조합과 NVM을 사용하는 환경에서 Starship과 fnm으로 전환했습니다.

## OMZ에서 Starship으로 전환 계기

[GeekNews에 올라온 "Oh My Zsh는 불필요한 부하를 추가함"](https://news.hada.io/topic?id=25725) 글을 읽고 전환을 결정했습니다.

글의 요지는 간단합니다. Oh My Zsh는 쉘 스크립트로 구성되어 있어서 새 터미널을 열 때마다 모든 스크립트를 해석해야 하고, 기본 설정만으로도 약 0.38초의 지연이 발생한다는 것입니다. 반면 Starship + 최소 Zsh 설정을 사용하면 0.07초로 단축할 수 있다고 해요.

사실 저도 Oh My Zsh + Powerlevel10k 조합을 쓰면서 새 터미널 탭을 열 때마다 미세한 딜레이를 느끼고 있었습니다. Powerlevel10k의 instant prompt 기능을 켜도 체감상 느린 건 마찬가지였어요.

Starship은 Rust로 만들어진 단일 바이너리라서 빠르고, 설정 파일 하나로 깔끔하게 관리할 수 있다는 점이 마음에 들었습니다. 최근 Rust 기반 CLI 도구들을 선호하는 편이라 자연스럽게 전환을 결정했습니다.

## 설치

기존 사용하시던 `.zshrc` 파일을 백업해둡니다.

```zsh
cp ~/.zshrc ~/.zshrc.backup
```

macOS 기준으로 Homebrew를 사용해 설치합니다.

```zsh
brew install starship
```

리눅스 환경에서는 아래 명령어를 사용합니다.

```zsh
curl -fsSL https://starship.rs/install.sh | bash
```

`.zshrc` 맨 아래에 다음 한 줄을 추가합니다.

```zsh
eval "$(starship init zsh)"
```

설정 파일은 `~/.config/starship.toml`에 작성합니다.

```zsh
mkdir -p ~/.config && touch ~/.config/starship.toml
```

## Oh My Zsh 플러그인 대체

Oh My Zsh 없이도 필요한 기능들은 Homebrew로 직접 설치할 수 있습니다.

```zsh
brew install zsh-autosuggestions zsh-syntax-highlighting fzf
```

`.zshrc`에서 플러그인을 로드합니다.

```zsh
# autosuggestions
source /opt/homebrew/share/zsh-autosuggestions/zsh-autosuggestions.zsh

# syntax-highlighting (반드시 마지막에 로드)
source /opt/homebrew/share/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh
```

이렇게 starship 설정을 추가 한 뒤, 기존 OMZ 플러그인 설정을 모두 제거하거나 주석 처리하면 설정이 완료됩니다.

## Starship 설정

현재 사용 중인 인프라 환경을 구분하기 위해 Kubernetes, AWS, GCP context를 구분하여 표시하도록 설정했습니다. 특정 폴더에서만 표시하고 싶다면 `detect_folders`와 `detect_files` 옵션을 사용하면 됩니다.

```toml
# ~/.config/starship.toml
# Starship Configuration

format = """
$cmd_duration\
$username\
$hostname\
$directory\
$git_branch\
$git_status\
${custom.cloudflare}\
$kubernetes\
$aws\
$gcloud\
$terraform\
$docker_context\
$nodejs\
$python\
$rust\
$golang\
$line_break\
$character"""

# 스캔 타임아웃 (ms) - 빠른 프롬프트를 위해
scan_timeout = 30
command_timeout = 500

[character]
success_symbol = "[❯](bold green)"
error_symbol = "[❯](bold red)"

[directory]
truncation_length = 0
truncate_to_repo = false
home_symbol = "~"
style = "bold cyan"
format = "[$path]($style)[$read_only]($read_only_style) "

[git_branch]
symbol = " "
style = "bold purple"
format = "[$symbol$branch(:$remote_branch)]($style) "

[git_status]
format = '([$untracked](yellow)[$stashed](cyan)[$modified](yellow)[$staged](green)[$deleted](red)[$conflicted](red bold)[$ahead_behind](blue) )'
style = "bold red"
conflicted = "="
ahead = "⇡${count}"
behind = "⇣${count}"
diverged = "⇕⇡${ahead_count}⇣${behind_count}"
untracked = "?${count}"
stashed = "📦"
modified = "!${count}"
staged = "+${count}"
deleted = "✘${count}"

[kubernetes]
disabled = false
symbol = "☸ "
format = '[$symbol$context(\($namespace\))]($style) '
style = "bold blue"

[aws]
symbol = " "
format = '[$symbol($profile)(\($region\))]($style) '
style = "bold yellow"
disabled = true

[gcloud]
symbol = " "
format = '[$symbol$account(@$domain)(\($project\))]($style) '
style = "bold blue"
disabled = true

[terraform]
symbol = "󱁢 "
format = '[$symbol$workspace]($style) '
style = "bold 105"
disabled = true

[docker_context]
symbol = " "
format = '[$symbol$context]($style) '
style = "bold blue"
only_with_files = true

[custom.cloudflare]
symbol = "󰢎 "
style = "bold #F38020"
format = '[$symbol cf]($style) '
detect_files = ["wrangler.toml"]
disabled = false

[nodejs]
symbol = " "
format = '[$symbol($version)]($style) '
style = "bold green"
disabled = false
detect_files = ["package.json", ".node-version"]
detect_folders = ["node_modules"]

[python]
symbol = " "
format = '[${symbol}${pyenv_prefix}(${version})(\($virtualenv\))]($style) '
style = "bold yellow"
detect_files = ["pyproject.toml", "uv.lock", "requirements.txt", ".python-version"]

[rust]
symbol = " "
format = '[$symbol($version)]($style) '
style = "bold red"
detect_files = ["Cargo.toml"]

[golang]
symbol = " "
format = '[$symbol($version)]($style) '
style = "bold cyan"
detect_files = ["go.mod"]

[username]
style_user = "bold dimmed blue"
style_root = "bold red"
format = "[$user]($style) "
disabled = true
show_always = false

[hostname]
ssh_only = true
format = "[@$hostname]($style) "
style = "bold dimmed green"

[time]
disabled = false
format = '[$time]($style) '
style = "bold dimmed white"
time_format = "%H:%M"

[cmd_duration]
min_time = 2_000
format = "⏳ [$duration]($style)\n"
style = "bold yellow"
```

클라우드 context 표시 여부는 `disabled` 옵션을 통해 설정할 수 있습니다. (`disabled = false` 또는 `disabled = true`)

## NVM에서 fnm으로 전환

Zsh 시작 속도를 최적화하면서 NVM도 병목 지점이라는 걸 알게 되었습니다. NVM은 로딩 시간이 상당히 길어서, 많은 사람들이 lazy loading으로 우회합니다. 저도 기존에 아래처럼 lazy loading을 적용해서 쓰고 있었어요.

```zsh
# 기존 NVM lazy loading 설정
export NVM_DIR="$HOME/.nvm"

nvm() {
  unset -f nvm node npm npx
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
  nvm "$@"
}

node() {
  unset -f nvm node npm npx
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
  node "$@"
}
# npm, npx도 동일하게...
```

이 방식의 문제는 `pnpm`, `bun`, `claude` (Claude Code) 같은 Node.js 기반 CLI 도구들이 NVM 로드 전까지 실행되지 않는다는 점입니다. 매번 `node` 명령을 먼저 실행해서 NVM을 로드한 뒤에야 다른 CLI 도구를 쓸 수 있었어요. lazy loading 함수에 모든 CLI 도구를 추가하는 방법도 있지만, 도구가 늘어날 때마다 관리가 번거롭습니다.

fnm은 Rust로 만들어져서 NVM보다 훨씬 빠릅니다. lazy loading 없이도 쉘 시작 속도에 영향이 거의 없어서 이 문제가 깔끔하게 해결됩니다. Homebrew를 사용해 fnm을 설치합니다.

```zsh
brew install fnm
```

`.zshrc`에서 NVM 관련 설정을 모두 제거하고 다음 한 줄만 추가합니다.

```zsh
eval "$(fnm env --use-on-cd --shell zsh)"
```

기존 Node.js 버전은 fnm으로 다시 설치합니다.

```zsh
fnm install --lts
fnm default lts-latest
```

## 결과

- ***Benchmark 1**: starship + fnm*
- ***Benchmark 2**: oh my zsh + powerlevel10k (nvm lazy loading)*
- ***Benchmark 3**: oh my zsh + powerlevel10k (nvm)*

```zsh
hyperfine --warmup 3 \
  'zsh -i -c exit' \
  'ZDOTDIR=$(mktemp -d) && cp ~/.zshrc.bak $ZDOTDIR/.zshrc && zsh -i -c exit' \
  'zsh -c "source ~/.nvm/nvm.sh && exit"
```

```zsh
Benchmark 1: zsh -i -c exit
  Time (mean ± σ):      56.3 ms ±   2.9 ms    [User: 26.4 ms, System: 18.6 ms]
  Range (min … max):    51.6 ms …  67.5 ms    50 runs

Benchmark 2: ZDOTDIR=$(mktemp -d) && cp ~/.zshrc.bak $ZDOTDIR/.zshrc && zsh -i -c exit
  Time (mean ± σ):      62.7 ms ±   3.7 ms    [User: 27.7 ms, System: 21.3 ms]
  Range (min … max):    57.6 ms …  75.5 ms    44 runs

Benchmark 3: zsh -c "source ~/.nvm/nvm.sh && exit"
  Time (mean ± σ):     673.6 ms ±  11.4 ms    [User: 209.4 ms, System: 356.0 ms]
  Range (min … max):   653.8 ms … 689.2 ms    10 runs

Summary
  zsh -i -c exit ran
    1.11 ± 0.09 times faster than ZDOTDIR=$(mktemp -d) && cp ~/.zshrc.bak $ZDOTDIR/.zshrc && zsh -i -c exit
   11.96 ± 0.64 times faster than zsh -c "source ~/.nvm/nvm.sh && exit"
```

Starship과 fnm 조합을 적용 후 터미널 쉘 시작 체감 속도가 확실히 빨라졌습니다. 설정 파일도 `.zshrc`와 `starship.toml` 두 개로 깔끔하게 관리됩니다. 기존 Oh My Zsh + Powerlevel10k 조합에서 느꼈던 미세한 딜레이가 사라졌어요.

Oh My Zsh의 편의 기능들이 그리울 수 있지만, 필요한 것만 직접 설정하면 오히려 가볍고 빠른 환경을 만들 수 있습니다. 터미널 속도에 민감하신 분들께 Starship + fnm 조합을 추천합니다.

> Starship과 fnm에 대한 좀 더 자세한 내용은 아래 링크를 참조하세요:
>
> - [Starship](https://starship.rs/)
> - [fnm](https://github.com/Schniz/fnm)
