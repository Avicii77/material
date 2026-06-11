# Starbucks 색 적용 패스 (color-only reskin)

이미 완성된 ReCos 프론트엔드(Cosmax 모노크롬)에 Starbucks 브랜드 색 체계를 입힌다. **색/형태(pill)만** 바꾸고 레이아웃·로직·구조는 유지한다. 원본 디자인 시스템: `C:\Users\ummdd\OneDrive\DESIGN-starbucks.md`.

## 1. 토큰 — `src/app/globals.css`

`:root` 블록을 아래로 교체(기존 토큰명 유지 + 신규 brand/accent/band/card 추가):

```css
:root {
  --bg: #f2f0eb;        /* Neutral Warm — 페이지 캔버스 */
  --surface: #edebe9;   /* Ceramic — 호버/구분 존 */
  --card: #ffffff;      /* White — 카드 면 */
  --ink: #1a1a1a;       /* Text Black (≈0.87) */
  --sub: #6b6b6b;       /* Text Black Soft */
  --line: #e0ddd6;      /* warm hairline */
  --line-soft: #ebe8e2;
  --brand: #006241;     /* Starbucks Green — 로고/브랜드 헤딩 */
  --accent: #00754A;    /* Green Accent — CTA */
  --band: #1E3932;      /* House Green — 푸터/밴드 */
  --signal: #c82014;    /* Red — 임박/에러 */
}
```

`@theme inline` 블록에 신규 색 토큰 매핑 추가(기존 항목은 유지):

```css
  --color-card: var(--card);
  --color-brand: var(--brand);
  --color-accent: var(--accent);
  --color-band: var(--band);
```

> 주의: `@theme inline`에 이미 있는 레거시 `--color-accent: var(--ink);` 줄은 위 `--color-accent: var(--accent);`로 **교체**(중복 금지). `--color-accent-strong`/`--color-accent-soft`가 남아 있으면 각각 `var(--accent)`, `var(--surface)`로 둔다.

## 2. 컴포넌트 색/형태 리포인팅 규칙

아래는 **색·모서리·active**만 바꾼다. 텍스트/구조/props/로직/클래스의 나머지는 그대로.

### 2.1 솔리드 CTA 버튼 (그린 풀-필 + 프레스)
다음 파일에서 `bg-ink ... text-white hover:opacity-90` 패턴의 버튼을 `bg-accent text-white hover:opacity-90 active:scale-95 transition`로, 모서리 `rounded-lg`는 `rounded-full`로 바꾼다:
- `src/components/site-header.tsx` — 회원가입 버튼
- `src/app/page.tsx` — 히어로 "원료 검색하기"(솔리드). "원료 등록하기"(라인) 버튼은 `rounded-lg`→`rounded-full`, `border-line`→`border-accent text-accent` (아웃라인 그린 필).
- `src/app/listings/page.tsx` — "원료 등록"
- `src/components/lot-list.tsx` — "자세히 보기 →"
- `src/components/contact-gate.tsx` — "로그인"
- `src/components/listing-form.tsx` — "저장"
- `src/components/listing-filters.tsx` — "검색" 버튼(`bg-ink`→`bg-accent`, `rounded-lg`→`rounded-full`). "초기화"는 `rounded-lg`→`rounded-full` 유지(아웃라인).
- `src/app/mypage/page.tsx` — "프로필 저장"
- `src/app/login/page.tsx` — "이메일 로그인", Google 버튼은 아웃라인 유지(`rounded-lg`→`rounded-full`)
- `src/app/signup/page.tsx` — "회원가입"

헤더/검색의 아웃라인 "로그인"·"이전/다음" 페이지네이션·기타 보더 버튼은 `rounded-lg`→`rounded-full`만 적용(색 유지).

### 2.2 화이트 카드 (크림 위)
페이지 캔버스가 크림이 되므로, 콘텐츠 카드/패널에 흰 배경을 준다. `border border-line`로 시작하는 카드형 컨테이너에 `bg-card`를 추가한다(이미 흰 배경이거나 밴드/푸터면 제외):
- `src/components/lot-list.tsx` — 리스트 컨테이너 `rounded-2xl border border-line` → `+ bg-card`
- `src/components/featured-lot.tsx` — 카드 루트 `rounded-2xl border border-line` → `+ bg-card`
- `src/components/listing-filters.tsx` — `<form>` `rounded-2xl border border-line bg-white` (이미 흰색이면 유지)
- `src/app/listings/[id]/page.tsx` — 정보/연락처/서류/소유자 카드 `rounded-2xl border border-line bg-white`(유지/추가)
- `src/components/listing-form.tsx` — `<form>` 컨테이너 `+ bg-card`
- `src/app/login/page.tsx`·`signup/page.tsx` — 폼/카드 컨테이너 `+ bg-card`
- `src/app/mypage/page.tsx` — 프로필 섹션 카드 `+ bg-card`

> `EmptyState`/배지의 `bg-surface`는 그대로(세라믹 톤). LotList 호버 `hover:bg-surface`도 유지.

### 2.3 브랜드 그린 텍스트
- `src/components/site-header.tsx` — 로고 `text-ink` → `text-brand`.
- `src/app/page.tsx` — 히어로 강조 span(`판매자와 직접 거래`)의 `font-bold` 옆에 `text-brand` 추가.

### 2.4 푸터 = House Green 밴드
`src/components/site-footer.tsx`:
- `<footer>` `border-t border-line bg-bg` → `bg-band`
- 내부 텍스트 `text-sub` → `text-white/70`
- 링크 `hover:text-ink` → `hover:text-white`

### 2.5 기능 배지 green-light
`src/components/badge.tsx` — `neutral` 톤의 `bg-[#eef1f3] text-[#3c4045]` → `bg-[#d4e9e2] text-[#006241]`. `signal`/`muted` 톤은 유지.

### 2.6 입력 포커스 그린
모든 입력의 `focus:border-ink` → `focus:border-accent` (`listing-filters.tsx`, `listing-form.tsx`, 그리고 인라인 input이 있으면 `mypage/login/signup`).

## 3. 검증
- `npm run build`(= `tsc --noEmit && next build`) **통과**.
- 색 외 레이아웃/텍스트/로직 변화 없음. `src/lib`/`api`/`supabase` 무변경.
