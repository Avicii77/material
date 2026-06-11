# Dreelio 웜 테마 패스 (color + mono-label font)

레퍼런스: https://dreelio.framer.website/ — 웜 미니멀(오프화이트/크림 캔버스 + 웜 니어블랙 브랜드 + 웜 그레이 텍스트 + 화이트 카드 + Inter/Fragment Mono). 채도 높은 액센트 없음(모노크롬 웜).

토큰 기반이라 값 교체 + Fragment Mono 추가로 전체 cascade. 레이아웃/밀도/로직/데이터/`src/lib`·`api`·`supabase` 무변경. 국문은 Pretendard 유지.

## 1. `src/app/globals.css` 토큰 교체

`:root` 블록을 아래로:

```css
:root {
  --bg: #f9f8f8;        /* warm off-white canvas */
  --surface: #f1ebe5;   /* cream — 호버/배지/구분 */
  --card: #ffffff;      /* white card */
  --ink: #1a1615;       /* warm near-black — 텍스트 */
  --sub: #757170;       /* warm grey — 보조 */
  --line: #e4e2e2;      /* warm hairline */
  --line-soft: #efeae6;
  --brand: #1a1615;     /* 로고/브랜드 헤딩 = 웜 니어블랙 */
  --accent: #1a1615;    /* CTA = 웜 니어블랙 (흰 글자) */
  --band: #1a1615;      /* 푸터/다크 밴드 */
  --signal: #b3401f;    /* warm terracotta — 임박/에러 */
}
```

`@theme inline`에서 `--font-lat`를 Fragment Mono로:

```css
  --font-lat: var(--font-fragment-mono);
```

`body` font-family는 그대로 `"Pretendard", var(--font-sans-kr), system-ui, sans-serif` 유지(국문 Pretendard).

> 나머지 `@theme inline`의 색 매핑(`--color-bg/surface/card/ink/sub/line/line-soft/brand/accent/band/signal`)은 이미 존재하므로 그대로 둔다(토큰 값만 바뀜).

## 2. `src/app/layout.tsx` — Fragment Mono 추가

- `next/font/google`에서 `Fragment_Mono`를 추가 로드:
  ```tsx
  import { Noto_Sans_KR, Fragment_Mono } from "next/font/google";

  const fragmentMono = Fragment_Mono({
    subsets: ["latin"],
    weight: ["400"],
    variable: "--font-fragment-mono",
    display: "swap",
  });
  ```
- `<html>` className에 `${fragmentMono.variable}` 추가(기존 `notoSansKr.variable`·Pretendard link 유지).

> Pretendard CDN `<link>`는 그대로 둔다.

## 3. `src/components/badge.tsx` — neutral 톤 웜 크림으로

- `neutral` 톤의 현재 클래스(`bg-[#d4e9e2] text-[#006241]`)를 `bg-[#f1ebe5] text-[#453f3d]`로 교체.
- `signal`/`muted` 톤은 유지(각각 `bg-signal text-white`, `bg-surface text-sub`).

## 4. (선택) 라운드 소프트화 — 생략 가능
Dreelio는 20~40px 라운드. 현재 버튼 풀-필·카드 `rounded-xl/2xl`로 충분히 소프트하므로 **이번 패스에선 변경하지 않는다**(색·폰트만).

## 5. 검증
- `npm run build`(= `tsc --noEmit && next build`) **통과**.
- 그린→웜블랙, 쿨화이트→웜크림으로 전체 전환. 영문 대문자 라벨(`font-lat`)이 Fragment Mono로 표시. 레이아웃/로직 무변경.
