+++
title = "img-src.io 출시 일주일 후기"
date = 2026-02-09
draft = false

[taxonomies]
tags = ['img-src', 'CDN', 'SaaS', 'Startup', 'Lean Startup']

[extra]
author = "김태훈"
toc = true
+++

2026년 2월 2일, 개발자를 위한 이미지 CDN 서비스 [img-src.io](https://img-src.io)를 출시한 지 약 일주일이 지났습니다. 바이브 코딩으로 혼자 만든 SaaS의 첫 일주일은 어땠을까요? 실제 데이터를 기반으로 돌아봅니다.

<!-- more -->

## 2/2 ~ 2/9 주요 업데이트 내역

- AI 시대에 맞춰서 [MCP 서버](https://github.com/img-src-io/mcp)를 추가 했습니다.
- 출력 포맷에 [JXL 포맷](https://en.wikipedia.org/wiki/JPEG_XL)을 추가 했습니다.
- 랜딩 페이지를 변경 했습니다.

## 트래픽 분석

첫 일주일간 img-src.io의 Cloudflare Web Analytics 데이터입니다.

<p align="center">
<svg viewBox="0 0 600 200" xmlns="http://www.w3.org/2000/svg" style="max-width:560px;width:100%;font-family:system-ui,-apple-system,sans-serif;">
  <rect width="600" height="200" rx="12" fill="#1e1e2e"/>
  <text x="300" y="30" text-anchor="middle" fill="#cdd6f4" font-size="14" font-weight="600">img-src.io 첫 주 트래픽 (2/2 ~ 2/9)</text>
  <!-- 카드 1: 방문 -->
  <rect x="40" y="50" width="155" height="120" rx="8" fill="#313244"/>
  <text x="117" y="95" text-anchor="middle" fill="#fab387" font-size="36" font-weight="700">159</text>
  <text x="117" y="118" text-anchor="middle" fill="#a6adc8" font-size="12">Visits</text>
  <text x="117" y="148" text-anchor="middle" fill="#6c7086" font-size="10">일평균 ~23회</text>
  <!-- 카드 2: 페이지 뷰 -->
  <rect x="222" y="50" width="155" height="120" rx="8" fill="#313244"/>
  <text x="299" y="95" text-anchor="middle" fill="#89b4fa" font-size="36" font-weight="700">205</text>
  <text x="299" y="118" text-anchor="middle" fill="#a6adc8" font-size="12">Page Views</text>
  <text x="299" y="148" text-anchor="middle" fill="#6c7086" font-size="10">일평균 ~29회</text>
  <!-- 카드 3: 방문당 페이지 -->
  <rect x="404" y="50" width="155" height="120" rx="8" fill="#313244"/>
  <text x="481" y="95" text-anchor="middle" fill="#a6e3a1" font-size="36" font-weight="700">1.29</text>
  <text x="481" y="118" text-anchor="middle" fill="#a6adc8" font-size="12">Pages / Visit</text>
  <text x="481" y="148" text-anchor="middle" fill="#6c7086" font-size="10">205 / 159</text>
</svg>
</p>

일주일간 **159회 방문**, **205 페이지 뷰**가 발생했습니다. 방문당 평균 1.29 페이지를 조회했으며, 이는 대부분의 방문자가 랜딩 페이지만 보고 이탈했다는 의미입니다. *Product Hunt, x.com, LinkedIn* 등의 소셜 미디어에 포스팅한 글을 보시고 찾아오신 방문자가 많았습니다.

159명이 방문해서 3명이 가입했으니, **방문 → 가입 전환율은 약 1.9%** 입니다.

## 사용자 현황

### 총 사용자 현황

첫 일주일간 **총 3명**의 사용자가 가입했습니다.

| 플랜 | 사용자 수 |
|------|----------|
| Free | 2명 |
| Pro | 1명 |

3명 중 1명이 Pro 플랜을 선택했으니, 무료 → 유료 전환율이 **33%** 입니다. 1명의 유료 사용자는 결제 테스트 겸 가족 사용자라 의미 없는 데이터입니다.

### 일별 가입 추이

<p align="center">
<svg viewBox="0 0 600 280" xmlns="http://www.w3.org/2000/svg" style="max-width:560px;width:100%;font-family:system-ui,-apple-system,sans-serif;">
  <defs>
    <linearGradient id="barGrad1" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#6366f1"/>
      <stop offset="100%" stop-color="#4f46e5"/>
    </linearGradient>
  </defs>
  <!-- 배경 -->
  <rect width="600" height="280" rx="12" fill="#1e1e2e"/>
  <!-- 제목 -->
  <text x="300" y="30" text-anchor="middle" fill="#cdd6f4" font-size="14" font-weight="600">일별 신규 가입자 (2/2 ~ 2/8)</text>
  <!-- Y축 그리드 -->
  <line x1="80" y1="60" x2="560" y2="60" stroke="#313244" stroke-width="1"/>
  <line x1="80" y1="110" x2="560" y2="110" stroke="#313244" stroke-width="1"/>
  <line x1="80" y1="160" x2="560" y2="160" stroke="#313244" stroke-width="1"/>
  <line x1="80" y1="210" x2="560" y2="210" stroke="#313244" stroke-width="1"/>
  <!-- Y축 라벨 -->
  <text x="70" y="65" text-anchor="end" fill="#6c7086" font-size="11">3</text>
  <text x="70" y="115" text-anchor="end" fill="#6c7086" font-size="11">2</text>
  <text x="70" y="165" text-anchor="end" fill="#6c7086" font-size="11">1</text>
  <text x="70" y="215" text-anchor="end" fill="#6c7086" font-size="11">0</text>
  <!-- 막대 차트 -->
  <!-- 2/2: 2명 -->
  <rect x="95" y="110" width="50" height="100" rx="4" fill="url(#barGrad1)" opacity="0.9"/>
  <text x="120" y="100" text-anchor="middle" fill="#a6adc8" font-size="12" font-weight="600">2</text>
  <!-- 2/3: 0명 -->
  <rect x="165" y="210" width="50" height="0" rx="4" fill="url(#barGrad1)" opacity="0.9"/>
  <!-- 2/4: 0명 -->
  <rect x="235" y="210" width="50" height="0" rx="4" fill="url(#barGrad1)" opacity="0.9"/>
  <!-- 2/5: 0명 -->
  <rect x="305" y="210" width="50" height="0" rx="4" fill="url(#barGrad1)" opacity="0.9"/>
  <!-- 2/6: 1명 -->
  <rect x="375" y="160" width="50" height="50" rx="4" fill="url(#barGrad1)" opacity="0.9"/>
  <text x="400" y="150" text-anchor="middle" fill="#a6adc8" font-size="12" font-weight="600">1</text>
  <!-- 2/7: 0명 -->
  <rect x="445" y="210" width="50" height="0" rx="4" fill="url(#barGrad1)" opacity="0.9"/>
  <!-- 2/8: 0명 -->
  <rect x="515" y="210" width="50" height="0" rx="4" fill="url(#barGrad1)" opacity="0.9"/>
  <!-- X축 라벨 -->
  <text x="120" y="235" text-anchor="middle" fill="#6c7086" font-size="11">2/2</text>
  <text x="190" y="235" text-anchor="middle" fill="#6c7086" font-size="11">2/3</text>
  <text x="260" y="235" text-anchor="middle" fill="#6c7086" font-size="11">2/4</text>
  <text x="330" y="235" text-anchor="middle" fill="#6c7086" font-size="11">2/5</text>
  <text x="400" y="235" text-anchor="middle" fill="#6c7086" font-size="11">2/6</text>
  <text x="470" y="235" text-anchor="middle" fill="#6c7086" font-size="11">2/7</text>
  <text x="540" y="235" text-anchor="middle" fill="#6c7086" font-size="11">2/8</text>
  <!-- 주석 -->
  <text x="120" y="255" text-anchor="middle" fill="#f38ba8" font-size="9">출시일</text>
</svg>
</p>

출시 당일(2/2)에 2명이 가입하고, 이후 며칠간 조용하다가 2/6에 1명이 추가 가입했습니다. 출시 당일 가입자는 가족과 지인 한 분이라 출시 효과는 없었습니다. 사실상
2/6 가입자가 첫 신규 가입 사용자 입니다.

## 서비스 활용도

### 이미지 업로드 현황

| 지표 | 수치 |
|------|------|
| 총 이미지 수 | 221개 |
| 총 스토리지 | 19.5 MB |
| 평균 파일 크기 | ~88 KB |
| 평균 해상도 | 394 x 258 px |

### 일별 업로드 추이

<p align="center">
<svg viewBox="0 0 600 280" xmlns="http://www.w3.org/2000/svg" style="max-width:560px;width:100%;font-family:system-ui,-apple-system,sans-serif;">
  <defs>
    <linearGradient id="barGrad2" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#a6e3a1"/>
      <stop offset="100%" stop-color="#40a02b"/>
    </linearGradient>
  </defs>
  <rect width="600" height="280" rx="12" fill="#1e1e2e"/>
  <text x="300" y="30" text-anchor="middle" fill="#cdd6f4" font-size="14" font-weight="600">일별 이미지 업로드 수 (2/2 ~ 2/8)</text>
  <!-- Y축 그리드 -->
  <line x1="80" y1="60" x2="560" y2="60" stroke="#313244" stroke-width="1"/>
  <line x1="80" y1="90" x2="560" y2="90" stroke="#313244" stroke-width="1"/>
  <line x1="80" y1="120" x2="560" y2="120" stroke="#313244" stroke-width="1"/>
  <line x1="80" y1="150" x2="560" y2="150" stroke="#313244" stroke-width="1"/>
  <line x1="80" y1="180" x2="560" y2="180" stroke="#313244" stroke-width="1"/>
  <line x1="80" y1="210" x2="560" y2="210" stroke="#313244" stroke-width="1"/>
  <!-- Y축 라벨 -->
  <text x="70" y="65" text-anchor="end" fill="#6c7086" font-size="11">5</text>
  <text x="70" y="95" text-anchor="end" fill="#6c7086" font-size="11">4</text>
  <text x="70" y="125" text-anchor="end" fill="#6c7086" font-size="11">3</text>
  <text x="70" y="155" text-anchor="end" fill="#6c7086" font-size="11">2</text>
  <text x="70" y="185" text-anchor="end" fill="#6c7086" font-size="11">1</text>
  <text x="70" y="215" text-anchor="end" fill="#6c7086" font-size="11">0</text>
  <!-- 막대 -->
  <!-- 2/2: 2개 -->
  <rect x="95" y="150" width="50" height="60" rx="4" fill="url(#barGrad2)" opacity="0.9"/>
  <text x="120" y="143" text-anchor="middle" fill="#a6adc8" font-size="12" font-weight="600">2</text>
  <!-- 2/3: 0 -->
  <!-- 2/4: 0 -->
  <!-- 2/5: 1개 -->
  <rect x="305" y="180" width="50" height="30" rx="4" fill="url(#barGrad2)" opacity="0.9"/>
  <text x="330" y="173" text-anchor="middle" fill="#a6adc8" font-size="12" font-weight="600">1</text>
  <!-- 2/6: 5개 -->
  <rect x="375" y="60" width="50" height="150" rx="4" fill="url(#barGrad2)" opacity="0.9"/>
  <text x="400" y="50" text-anchor="middle" fill="#a6adc8" font-size="12" font-weight="600">5</text>
  <!-- X축 라벨 -->
  <text x="120" y="235" text-anchor="middle" fill="#6c7086" font-size="11">2/2</text>
  <text x="190" y="235" text-anchor="middle" fill="#6c7086" font-size="11">2/3</text>
  <text x="260" y="235" text-anchor="middle" fill="#6c7086" font-size="11">2/4</text>
  <text x="330" y="235" text-anchor="middle" fill="#6c7086" font-size="11">2/5</text>
  <text x="400" y="235" text-anchor="middle" fill="#6c7086" font-size="11">2/6</text>
  <text x="470" y="235" text-anchor="middle" fill="#6c7086" font-size="11">2/7</text>
  <text x="540" y="235" text-anchor="middle" fill="#6c7086" font-size="11">2/8</text>
  <!-- 용량 표시 -->
  <text x="120" y="255" text-anchor="middle" fill="#6c7086" font-size="9">289 KB</text>
  <text x="330" y="255" text-anchor="middle" fill="#6c7086" font-size="9">1.6 KB</text>
  <text x="400" y="255" text-anchor="middle" fill="#6c7086" font-size="9">2.1 MB</text>
</svg>
</p>

첫 주 동안 총 **8개** 이미지(약 2.4MB)가 업로드되었습니다. 2/6에 가장 많은 업로드가 발생했는데, 새로 가입한 사용자의 활동으로 보입니다.

참고로 전체 221개 이미지 중 대부분은 제 계정에서 업로드되어 서빙 중인 이미지 입니다. (블로그 이미지 대부분 *img-src.io* 에서 서빙 중입니다.)

### 이미지 포맷 분포

<p align="center">
<svg viewBox="0 0 600 320" xmlns="http://www.w3.org/2000/svg" style="max-width:560px;width:100%;font-family:system-ui,-apple-system,sans-serif;">
  <rect width="600" height="320" rx="12" fill="#1e1e2e"/>
  <text x="300" y="30" text-anchor="middle" fill="#cdd6f4" font-size="14" font-weight="600">업로드 이미지 포맷 분포 (전체 221개)</text>
  <!-- 가로 막대 차트 -->
  <!-- PNG: 200개 (90.5%) -->
  <text x="75" y="72" text-anchor="end" fill="#cdd6f4" font-size="12">PNG</text>
  <rect x="85" y="58" width="430" height="22" rx="4" fill="#89b4fa" opacity="0.85"/>
  <text x="520" y="74" fill="#a6adc8" font-size="11">200개 (90.5%)</text>
  <!-- JPEG: 8개 (3.6%) -->
  <text x="75" y="107" text-anchor="end" fill="#cdd6f4" font-size="12">JPEG</text>
  <rect x="85" y="93" width="17" height="22" rx="4" fill="#f9e2af" opacity="0.85"/>
  <text x="107" y="109" fill="#a6adc8" font-size="11">8개 (3.6%)</text>
  <!-- SVG: 6개 (2.7%) -->
  <text x="75" y="142" text-anchor="end" fill="#cdd6f4" font-size="12">SVG</text>
  <rect x="85" y="128" width="13" height="22" rx="4" fill="#a6e3a1" opacity="0.85"/>
  <text x="103" y="144" fill="#a6adc8" font-size="11">6개 (2.7%)</text>
  <!-- GIF: 3개 (1.4%) -->
  <text x="75" y="177" text-anchor="end" fill="#cdd6f4" font-size="12">GIF</text>
  <rect x="85" y="163" width="7" height="22" rx="4" fill="#f38ba8" opacity="0.85"/>
  <text x="97" y="179" fill="#a6adc8" font-size="11">3개 (1.4%)</text>
  <!-- WebP: 1개 -->
  <text x="75" y="212" text-anchor="end" fill="#cdd6f4" font-size="12">WebP</text>
  <rect x="85" y="198" width="4" height="22" rx="4" fill="#cba6f7" opacity="0.85"/>
  <text x="94" y="214" fill="#a6adc8" font-size="11">1개</text>
  <!-- AVIF: 1개 -->
  <text x="75" y="247" text-anchor="end" fill="#cdd6f4" font-size="12">AVIF</text>
  <rect x="85" y="233" width="4" height="22" rx="4" fill="#94e2d5" opacity="0.85"/>
  <text x="94" y="249" fill="#a6adc8" font-size="11">1개</text>
  <!-- 기타: 2개 -->
  <text x="75" y="282" text-anchor="end" fill="#cdd6f4" font-size="12">기타</text>
  <rect x="85" y="268" width="5" height="22" rx="4" fill="#585b70" opacity="0.85"/>
  <text x="95" y="284" fill="#a6adc8" font-size="11">2개</text>
</svg>
</p>

**PNG가 압도적**(90.5%)입니다. 현 블로그에서 사용되는 이미지가 대부분 PNG 포맷이라 당연한 결과입니다.

### API 활용

| 지표 | 수치 |
|------|------|
| 생성된 API 키 | 7개 |
| API 키를 생성한 사용자 | 3명 (전체의 60%) |
| 2월 활성 사용자 | 2명 |
| 2월 총 업로드 (API+웹) | 21건 |

제가 사용하는 API 키 5개를 제외하고, 총 2개의 API 키가 생성되었습니다.

## 핵심 지표 요약

<p align="center">
<svg viewBox="0 0 600 140" xmlns="http://www.w3.org/2000/svg" style="max-width:560px;width:100%;font-family:system-ui,-apple-system,sans-serif;">
  <rect width="600" height="140" rx="12" fill="#1e1e2e"/>
  <!-- 카드 1: 방문 -->
  <rect x="10" y="15" width="110" height="110" rx="8" fill="#313244"/>
  <text x="65" y="50" text-anchor="middle" fill="#fab387" font-size="26" font-weight="700">159</text>
  <text x="65" y="72" text-anchor="middle" fill="#a6adc8" font-size="11">방문</text>
  <text x="65" y="100" text-anchor="middle" fill="#6c7086" font-size="10">205 페이지뷰</text>
  <!-- 카드 2: 사용자 -->
  <rect x="130" y="15" width="110" height="110" rx="8" fill="#313244"/>
  <text x="185" y="50" text-anchor="middle" fill="#89b4fa" font-size="26" font-weight="700">3</text>
  <text x="185" y="72" text-anchor="middle" fill="#a6adc8" font-size="11">가입자</text>
  <text x="185" y="100" text-anchor="middle" fill="#6c7086" font-size="10">Free 2 / Pro 1</text>
  <!-- 카드 3: 전환율 -->
  <rect x="250" y="15" width="110" height="110" rx="8" fill="#313244"/>
  <text x="305" y="50" text-anchor="middle" fill="#a6e3a1" font-size="26" font-weight="700">1.9%</text>
  <text x="305" y="72" text-anchor="middle" fill="#a6adc8" font-size="11">가입 전환율</text>
  <text x="305" y="100" text-anchor="middle" fill="#6c7086" font-size="10">3/159 방문</text>
  <!-- 카드 4: 이미지 -->
  <rect x="370" y="15" width="110" height="110" rx="8" fill="#313244"/>
  <text x="425" y="50" text-anchor="middle" fill="#f9e2af" font-size="26" font-weight="700">221</text>
  <text x="425" y="72" text-anchor="middle" fill="#a6adc8" font-size="11">총 이미지</text>
  <text x="425" y="100" text-anchor="middle" fill="#6c7086" font-size="10">19.5 MB 사용</text>
  <!-- 카드 5: API -->
  <rect x="490" y="15" width="110" height="110" rx="8" fill="#313244"/>
  <text x="545" y="50" text-anchor="middle" fill="#cba6f7" font-size="26" font-weight="700">7</text>
  <text x="545" y="72" text-anchor="middle" fill="#a6adc8" font-size="11">API 키</text>
  <text x="545" y="100" text-anchor="middle" fill="#6c7086" font-size="10">3명이 생성</text>
</svg>
</p>

## 인사이트

- **사용자 수 부족**: 사용자 수가 너무 적어 학습에 충분하지 않습니다. 마케팅 채널을 다각화해야 합니다.
- **차별화 부족**: 기존 유사 CDN 서비스와 차별화 되는 포인트가 부족 합니다. Show HN에서 CloudFlare Images와 기능이 겹친다는 피드백을 받았습니다.
- **작은 시장**: 대상 사용자층이 너무 작아 비지니스 성장이 어렵습니다. 사용자가 적을땐 인프라 비용이 거의 들지 않도록 설계를 해둬서 몇달 더 지켜볼 생각입니다.

## 결론 및 다음 계획

첫 일주일의 데이터는 **제품은 작동하지만, 사용자를 모으는 데 실패했다**는 걸 명확히 보여줍니다. 제가 사용하려고 만든 제품이지만, 현재 상태로는 이 제품으로 비지니스 성과를 내기는 힘들 것 같습니다.

다음 한 달은 이 방향에 집중할 계획입니다:

1. **소액 유료 광고**: *Google, X.com* 에 소액으로 유료 마케팅을 해 볼 계획입니다. 블로그 여백에도 배너 광고라도 추가해보려 합니다.
2. **AIOps 자동화**: 시스템의 로그와 매트릭을 AI가 분석하여 대응하는 자동화 시스템을 만들 계획입니다. 토큰 사용량 고려하여, 온 디바이스 모델과 Claude Code Opus 조합으로 구현할 예정입니다.

한달 뒤 다음 후기에서 유료 마케팅 효과와 AIOps 자동화 성과를 공유해 드리겠습니다. 내일부터는 다음 제품 기획과 개발에 집중할 예정입니다. (모바일 앱)
