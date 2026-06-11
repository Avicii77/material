# ReCos 홈페이지 정직성 패스 & 핵심 플로우 검증 Implementation Plan

> **For agentic workers:** 이 코드베이스에는 단위 테스트 프레임워크가 없다. 검증은
> `npm run build`(= `tsc --noEmit && next build`), `npm run lint`, 그리고 실브라우저
> E2E 시나리오로 한다. 각 task의 체크박스(`- [ ]`)로 진행을 추적한다.

**Goal:** 홈페이지의 가짜 정보를 제거하고 카피를 개선하며, 로그인·회원가입·등록·조회·연락처
노출 플로우가 실제로 동작하도록 만들고 E2E로 검증한다.

**Architecture:** 프레젠테이션/정책 레이어 중심 수정. 로직(쿼리·권한·검증·api·supabase)은
필요한 최소한만. 디자인은 기존 CSS 변수 토큰 사용(하드코딩 금지). dual-ai: Codex 구현 →
Claude 검토(중간중간) → 미달 시 재지시. 8개 종료 조건 + E2E 전부 통과까지 반복.

**Tech Stack:** Next.js 16, React 19, Tailwind v4, Supabase(@supabase/ssr).

**참조 스펙:** `docs/superpowers/specs/2026-06-12-recos-homepage-honesty-pass-design.md`

---

## File Structure

- Modify: `src/app/page.tsx` — 히어로 카피 B, 통계 밴드 제거, 최근 원료 데모 라벨 + 이미지 전부 제거.
- Modify: `src/components/contact-gate.tsx` — 회사명(company_name) 행만 숨김.
- Check/Remove: `src/components/stat-band.tsx` — 사용처 사라지면 제거.
- Diagnose: `src/app/login/*`, Supabase Auth 설정 — 로그인 실패 실시간 진단·수정.
- Verify only: `src/app/signup/*`, `src/app/listings/new/*`, `src/app/listings/[id]/*` — E2E 동작 확인.

---

## Task 1: 로그인 실시간 진단 (Claude 직접 실행)

**Files:**
- Inspect: `src/app/login/actions.ts`, `src/lib/supabase/server.ts`, `.env.local`
- Possibly modify: 진단 결과에 따라 결정

- [ ] **Step 1: dev 서버 실행**

Run: `npm run dev` (백그라운드), `http://localhost:3000/login` 접속.

- [ ] **Step 2: 이메일 로그인 시도 → 실제 에러 메시지 확인**

테스트 계정으로 로그인 시도. 화면에 표시되는 `?error=...` 메시지를 기록.
Supabase 대시보드/로그에서 실패 원인 확인(사용자 없음 / 이메일 미확인 / 비밀번호 정책 등).

- [ ] **Step 3: Google 로그인 시도 → provider 상태 확인**

"Google로 로그인" 클릭 후 에러 또는 무반응 여부 확인. Supabase Auth Providers에서
Google OAuth 활성화 여부와 redirect URL(`/auth/callback`) 설정 확인.

- [ ] **Step 4: 진단 결과를 사용자에게 보고**

원인이 (a) 코드 버그면 → Task로 수정, (b) Supabase 콘솔 설정이면 → 사용자에게
필요한 설정(예: 이메일 확인 off, Google provider 활성화, redirect URL 등록)을 안내.
**여기서 멈추고 사용자 확인을 받는다.**

---

## Task 2: 히어로 카피 B + 통계 밴드 제거

**Files:**
- Modify: `src/app/page.tsx:174-205`

- [ ] **Step 1: 히어로 카피를 B안으로 교체**

`src/app/page.tsx` 의 `<h1>` ~ 첫 `<p>` 를 아래로 교체:

```tsx
<h1 className="mt-6 max-w-4xl text-[38px] font-light leading-[1.18] tracking-tight text-ink sm:text-[54px]">
  유효기한이 남은 원료를,
  <br />
  <strong className="font-bold">그냥 버리고 계신가요?</strong>
</h1>
<p className="mt-6 max-w-[520px] text-base leading-7 text-sub">
  소량이 필요한 곳과 직접 연결해, 낭비와 비용을 동시에 줄입니다.
</p>
```

- [ ] **Step 2: 통계 밴드 블록 전체 삭제**

`src/app/page.tsx` 에서 18종/21개/10일을 렌더하는 `<ScrollReveal className="mt-14">` …
`</ScrollReveal>` 블록(현재 192-205행) 전체를 삭제. 다른 마크업은 건드리지 않는다.

- [ ] **Step 3: 빌드 확인**

Run: `npm run build`
Expected: PASS, 타입 에러 0. (히어로 섹션에 통계 밴드 없이 CTA까지만 렌더)

---

## Task 3: 최근 등록 원료 — 데모 라벨 + 이미지 전부 제거

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: `MaterialImage` 컴포넌트 및 모든 사용처 제거**

`MaterialImage` 함수 정의(90-103행)와 `FeaturedMaterial`/`CompactMaterialRow` 내
`<MaterialImage .../>` 호출을 모두 삭제. `imageUrls`, `hasMsds`, `hasCoa` 중
이미지 전용으로만 쓰이던 `imageUrls`는 `PreviewLot`에서 제거 가능하면 제거(타입 정리).
`hasMsds`/`hasCoa`는 서류 표시에 계속 사용하므로 유지.

- [ ] **Step 2: 이미지 제거 후 카드 레이아웃 정리**

`FeaturedMaterial`: 최상단 이미지가 사라지므로 `rounded-2xl border` 카드의 본문(`p-6`)이
바로 보이도록 정리. `imminent`(마감임박) 표시는 이미지 pill 대신 `<h3>` 옆 또는 상단에
텍스트 배지로 유지:

```tsx
{item.imminent ? (
  <span className="mb-3 inline-block rounded-full bg-signal px-3 py-1 text-[11px] font-semibold tracking-wide text-white">
    마감임박
  </span>
) : null}
```

`CompactMaterialRow`: 46px 썸네일 제거 후 텍스트 블록이 왼쪽 정렬되도록 `gap-3` 등 조정.

- [ ] **Step 3: 데모 라벨 추가**

`Home`에서 샘플 사용 여부 플래그 추가: `const isDemo = realLots.length === 0;`
최근 등록 원료 `SectionHead` 근처에 데모일 때만 배지 표시:

```tsx
{isDemo ? (
  <span className="ml-2 rounded-full border border-line bg-surface px-2.5 py-1 text-[11px] font-semibold text-sub align-middle">
    예시 데이터
  </span>
) : null}
```

(SectionHead가 children/right slot을 받지 않으면, 섹션 제목 줄 바로 아래에 별도 줄로 배치)

- [ ] **Step 4: 빌드 + 린트 확인**

Run: `npm run build` 그리고 `npm run lint`
Expected: 둘 다 PASS, 타입 에러 0. 미사용 import/변수 0(이미지 제거로 생긴 orphan 정리).

---

## Task 4: ContactGate — 회사명 노출만 숨김

**Files:**
- Modify: `src/components/contact-gate.tsx:38`

- [ ] **Step 1: 회사명 행 제거**

`src/components/contact-gate.tsx` 의 연락처 카드에서 회사명 행만 삭제:

```tsx
<dl className="space-y-3 text-sm">
  <Row k="담당자" v={contact.contact_name} />
  <Row k="전화" v={contact.phone} />
  <Row k="이메일" v={contact.contact_email} />
</dl>
```

`company_name`은 타입/쿼리에서 제거하지 않는다(입력·수집은 유지, 노출만 숨김).
`ListingContact` 타입의 `company_name` 필드는 그대로 둔다.

- [ ] **Step 2: 빌드 확인**

Run: `npm run build`
Expected: PASS. (`company_name` 미사용 경고가 lint에서 뜨면, 타입 필드는 유지하되
구조분해에서 빼는 식으로 정리)

---

## Task 5: stat-band.tsx 정리

**Files:**
- Inspect/Remove: `src/components/stat-band.tsx`

- [ ] **Step 1: 사용처 검색**

Run: `grep -rn "StatBand\|stat-band" src/` (또는 Grep 도구)
Expected: Task 2 이후 사용처 0이면 파일 삭제. 다른 곳에서 쓰면 유지.

- [ ] **Step 2: 삭제 시 빌드 확인**

Run: `npm run build`
Expected: PASS.

---

## Task 6: E2E 실브라우저 시나리오 검증 (Claude 직접 실행)

**전제:** Task 1의 로그인 문제가 해결된 상태.

- [ ] **Step 1: 회원가입**

`/signup`에서 신규 계정 A 생성 → 가입 성공 및 로그인 상태 전환 확인.

- [ ] **Step 2: 품목 등록(사진 + 서류 업로드)**

계정 A로 `/listings/new` 진입 → 필수 필드 + 사진 + MSDS/COA 파일 첨부 후 저장 →
성공 리다이렉트 및 상세 페이지 생성 확인.

- [ ] **Step 3: 타 유저 조회**

계정 B(또는 비로그인)로 `/listings` 목록과 해당 상세 페이지 접근 → A가 등록한 원료가
보이는지 확인.

- [ ] **Step 4: 연락처 노출 정책 확인**

상세 페이지에서 로그인 사용자에게 연락처 카드가 **담당자(이름)+전화+이메일**만 보이고
**회사명은 없음**을 확인.

- [ ] **Step 5: 반응형 확인**

홈/목록/상세/등록 폼을 모바일 폭(≤390px)으로 확인 → 레이아웃 깨짐 없음.

- [ ] **Step 6: 최종 게이트**

Run: `npm run build` + `npm run lint` → 둘 다 PASS.
8개 종료 조건 전부 충족 시 루프 정지. 미달 항목 있으면 해당 Task로 돌아가 재지시.

---

## Self-Review (스펙 커버리지)

- 스펙 1(로그인) → Task 1, 6. 스펙 2(데모+이미지 제거) → Task 3. 스펙 3(통계 제거) →
  Task 2, 5. 스펙 4(카피 B) → Task 2. 스펙 5(회원가입→등록) → Task 6. 스펙 6(타유저 노출)
  → Task 6. 스펙 7(회사 노출만 숨김) → Task 4. 종료 조건 8개 → Task 6 Step 6.
- 모든 task에 구체 코드/명령 포함, placeholder 없음.
