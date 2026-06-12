# ReCos `/about` 랜딩페이지 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 공급자(재고 보유 기업) 중심·손실회피 카피로 ReCos를 소개하는 마케팅 랜딩 `/about`를 추가하고, 하단에 관심 등록(이메일 리드) 폼을 붙인다.

**Architecture:** 정적 섹션 컴포넌트들을 `/about` 페이지가 순서대로 조립. 이메일 관심 등록만 동적 — 기존 `submitEarlyAccess`/`submitFeedback`와 동일한 서버 액션 + Supabase insert + 로컬 JSON graceful-degradation 패턴을 따른다. 현재 홈(`/`)은 건드리지 않는다.

**Tech Stack:** Next.js 16(App Router) · React 19 · Tailwind v4(토큰: `src/app/globals.css`) · Supabase(`@supabase/ssr`). **테스트 러너 없음** — 검증은 `npm run build`(tsc --noEmit + next build) + `npm run lint` + 브라우저 확인. (기존 코드베이스에 테스트 인프라가 없어, 단순성·기존 스타일 준수를 위해 새 프레임워크를 도입하지 않는다.)

**스펙:** `docs/superpowers/specs/2026-06-12-recos-landing-about-design.md` (섹션 카피·구조의 단일 출처)

**구현 흐름:** 본 계획 Task 1(프리뷰 HTML)을 Claude가 만들어 사용자 시각 승인 → 승인된 프리뷰 HTML이 정적 섹션의 시각·카피 기준 → Codex(dual-ai)가 Task 2~6을 Next.js로 구현.

---

## File Structure

| 파일 | 책임 | 생성/수정 |
|---|---|---|
| `preview/about-landing.html` | 승인용 정적 목업(전체 페이지) | 생성 (Claude) |
| `src/app/actions.ts` | `submitInterestLead` 서버 액션 추가 | 수정 |
| `src/components/email-capture.tsx` | 관심 등록 폼(클라이언트, 상태·제출) | 생성 |
| `src/components/about/hero.tsx` | ① HERO + `LandingPreview` | 생성 |
| `src/components/about/problem-grid.tsx` | ② 고통 4분할 | 생성 |
| `src/components/about/before-after.tsx` | ③ Before→After + 3단계 | 생성 |
| `src/components/about/trust-pillars.tsx` | ④ 구조적 신뢰 3요소 | 생성 |
| `src/components/about/value-stack.tsx` | ⑤ 가치 체크리스트 | 생성 |
| `src/components/about/urgency-band.tsx` | ⑥ 긴급성(시그널) | 생성 |
| `src/components/about/final-cta.tsx` | ⑦ 보증 + TradeNotice + 버튼 | 생성 |
| `src/app/about/page.tsx` | 섹션 조립 + 메타데이터 | 생성 |
| `src/components/site-nav`(기존 nav) | `/about` 링크 추가 | 수정(존재 시) |
| `supabase/`(마이그레이션 위치 관습) | `interest_leads` 테이블 | 문서화(Task 2) |

재사용: `ScrollReveal`, `SectionHead`, `TradeNotice`, `LandingPreview`.

---

## Task 1: 프리뷰 HTML 목업 (Claude) — 시각 승인 게이트

**Files:**
- Create: `preview/about-landing.html`

- [ ] **Step 1: 단일 HTML 파일로 전체 랜딩 목업 작성**

스펙의 섹션 ①~⑧ 카피를 그대로 사용. 인라인 `<style>`로 토큰 재현(`--ink #14171a`, `--sub #6b7280`, `--line #e8eaed`, `--surface #f7f8f9`, `--signal #c0492e`), 시스템 sans + `font-weight` 대비로 "강한 마케팅 톤" 표현. `max-width:1180px` 컨테이너. 기존 `preview/brainstorm/*.html` 스타일 관습을 따른다. 콘솔 목업(HERO 비주얼)은 정적 카드로 단순 재현.

- [ ] **Step 2: 브라우저에서 열어 확인 후 사용자 승인 요청**

Run: 파일을 브라우저로 열기 (`start preview/about-landing.html`)
Expected: 7개 섹션 + 관심 등록 밴드가 토큰 색/타이포로 렌더. 사용자에게 시각·카피 승인 요청. **승인 전 Task 2~로 진행 금지.**

- [ ] **Step 3: 피드백 반영 후 커밋**

```bash
git add preview/about-landing.html
git commit -m "preview: /about 랜딩 정적 목업"
```

---

## Task 2: 관심 등록 서버 액션 `submitInterestLead`

기존 `submitEarlyAccess`(`src/app/actions.ts`)와 동일 패턴. 관심 등록은 **이메일만** 필요.

**Files:**
- Modify: `src/app/actions.ts` (파일 끝에 추가)
- DB: `interest_leads` 테이블 (Task 2 Step 1 참조)

- [ ] **Step 1: Supabase 테이블 준비 (운영자 작업, 문서화)**

`interest_leads` 테이블 생성 (Supabase SQL editor 또는 마이그레이션):

```sql
create table if not exists public.interest_leads (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);
alter table public.interest_leads enable row level security;
create policy "anon insert interest_leads"
  on public.interest_leads for insert to anon with check (true);
```

미설정이어도 액션은 로컬 JSON으로 graceful degrade하므로 개발은 진행 가능.

- [ ] **Step 2: `src/app/actions.ts` 끝에 액션 추가**

```ts
export interface InterestLeadSubmission {
  email: string;
}

export async function submitInterestLead(data: InterestLeadSubmission) {
  const email = data.email?.trim() ?? "";
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, error: "올바른 이메일 주소를 입력해 주세요." };
  }

  const payload = { email };

  try {
    if (isSupabaseConfigured()) {
      const supabase = await createClient();
      const { error } = await supabase.from("interest_leads").insert([payload]);

      if (error) {
        if (error.code === "23505") {
          return { success: true, dbSaved: true, alreadyExists: true };
        }
        console.error("Supabase insert error:", error);
        return { success: false, error: "등록 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요." };
      }
      return { success: true, dbSaved: true };
    }

    const filePath = path.join(process.cwd(), "interest_leads_submissions.json");
    let existing: Record<string, unknown>[] = [];
    try {
      existing = JSON.parse(await fs.readFile(filePath, "utf-8"));
    } catch {
      // 파일 없음 — 빈 배열로 진행
    }
    if (existing.some((row) => row.email === email)) {
      return { success: true, dbSaved: false, alreadyExists: true };
    }
    existing.push({ ...payload, id: crypto.randomUUID(), created_at: new Date().toISOString() });
    await fs.writeFile(filePath, JSON.stringify(existing, null, 2), "utf-8");
    return { success: true, dbSaved: false };
  } catch (error: unknown) {
    console.error("Action error:", error);
    return { success: false, error: "서버 처리 중 오류가 발생했습니다." };
  }
}
```

- [ ] **Step 3: 타입체크**

Run: `npm run build`
Expected: 타입 에러 없음(빌드 통과). `isSupabaseConfigured`, `createClient`, `fs`, `path`는 파일 상단에 이미 import됨.

- [ ] **Step 4: 커밋**

```bash
git add src/app/actions.ts
git commit -m "feat: 관심 등록(interest lead) 서버 액션 추가"
```

---

## Task 3: `EmailCapture` 클라이언트 컴포넌트

**Files:**
- Create: `src/components/email-capture.tsx`

- [ ] **Step 1: 폼 컴포넌트 작성**

```tsx
"use client";

import { useState } from "react";
import { submitInterestLead } from "@/app/actions";

type Status = "idle" | "submitting" | "success" | "error";

export function EmailCapture() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("submitting");
    const result = await submitInterestLead({ email });
    if (result.success) {
      setStatus("success");
      setMessage(result.alreadyExists ? "이미 등록된 이메일입니다. 곧 소식을 보내드릴게요." : "관심 등록이 완료되었습니다. 곧 연락드리겠습니다.");
      setEmail("");
    } else {
      setStatus("error");
      setMessage(result.error ?? "등록에 실패했습니다.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="이메일 주소"
        className="flex-1 rounded-[9px] border border-line bg-card px-5 py-4 text-sm text-ink outline-none focus:border-ink"
      />
      <button
        type="submit"
        disabled={status === "submitting"}
        className="rounded-[9px] bg-ink px-7 py-4 text-sm font-semibold text-white transition hover:opacity-90 active:scale-95 disabled:opacity-60"
      >
        {status === "submitting" ? "등록 중…" : "관심 등록하기"}
      </button>
      {status === "success" || status === "error" ? (
        <p aria-live="polite" className={`text-sm ${status === "error" ? "text-signal" : "text-sub"} sm:basis-full`}>
          {message}
        </p>
      ) : null}
    </form>
  );
}
```

- [ ] **Step 2: 타입체크 + 커밋**

Run: `npm run build`
Expected: 통과.
```bash
git add src/components/email-capture.tsx
git commit -m "feat: 관심 등록 폼(EmailCapture) 컴포넌트"
```

---

## Task 4: 섹션 컴포넌트 (정적)

각 섹션은 `src/components/about/`에 분리. **카피는 스펙 §3, 시각은 승인된 `preview/about-landing.html` 기준.** 기존 홈(`src/app/page.tsx`)의 클래스 관습을 그대로 따른다: 컨테이너 `mx-auto w-full max-w-[1180px] px-5 sm:px-8`, 섹션 `border-b border-line` 구분, `ScrollReveal`로 감싸기, 4분할 카드는 `grid` + `border-line` 카드.

- [ ] **Step 1: 7개 섹션 컴포넌트 작성** — 파일별 1책임

  - `about/hero.tsx`: eyebrow + H1(굵기 대비) + sub + 버튼 2개(`/listings/new`, `/listings`) + `LandingPreview`
  - `about/problem-grid.tsx`: 헤더 + 4카드(01~04)
  - `about/before-after.tsx`: 헤더 + 2열 대비 표 + 3단계(① 등록 → ② 연결 → ③ 거래)
  - `about/trust-pillars.tsx`: 헤더 + 3요소(서류 검증·실물 확인·권한 제어)
  - `about/value-stack.tsx`: 헤더 + 체크리스트 5항목(무료·수수료 무료 강조)
  - `about/urgency-band.tsx`: 헤더 + 본문, `text-signal` 포인트(정직한 유효기한 긴급성)
  - `about/final-cta.tsx`: 보증 문구 + `<TradeNotice />` + 버튼 2개

  각 컴포넌트는 props 없는 순수 표현 컴포넌트. 카피는 스펙 §3에서 그대로 옮긴다(미검증 수치·후기 금지).

- [ ] **Step 2: 타입체크 + 커밋**

Run: `npm run build`
Expected: 통과.
```bash
git add src/components/about/
git commit -m "feat: /about 섹션 컴포넌트 7종"
```

---

## Task 5: `/about` 페이지 조립 + nav 링크

**Files:**
- Create: `src/app/about/page.tsx`
- Modify: 기존 사이트 nav 컴포넌트(있으면) — `/about` 링크 추가

- [ ] **Step 1: 페이지 작성**

```tsx
import type { Metadata } from "next";
import { AboutHero } from "@/components/about/hero";
import { ProblemGrid } from "@/components/about/problem-grid";
import { BeforeAfter } from "@/components/about/before-after";
import { TrustPillars } from "@/components/about/trust-pillars";
import { ValueStack } from "@/components/about/value-stack";
import { UrgencyBand } from "@/components/about/urgency-band";
import { FinalCta } from "@/components/about/final-cta";
import { EmailCapture } from "@/components/email-capture";

export const metadata: Metadata = {
  title: "남는 원료, 손해가 되기 전에 — ReCos",
  description: "유효기한이 남은 화장품 원료를 필요한 곳과 직접 연결해 폐기 비용을 회수 기회로 바꾸세요. 등록 무료·수수료 무료.",
};

export default function AboutPage() {
  return (
    <main>
      <AboutHero />
      <ProblemGrid />
      <BeforeAfter />
      <TrustPillars />
      <ValueStack />
      <UrgencyBand />
      <FinalCta />
      <section className="border-t border-line bg-surface py-16">
        <div className="mx-auto w-full max-w-[1180px] px-5 sm:px-8">
          <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">재고, ReCos로 정리해보고 싶으세요?</h2>
          <p className="mt-3 max-w-[520px] text-sm leading-7 text-sub">이메일을 남겨주시면 시작 방법과 ReCos 소식을 보내드립니다.</p>
          <div className="max-w-xl">
            <EmailCapture />
          </div>
        </div>
      </section>
    </main>
  );
}
```

- [ ] **Step 2: 사이트 nav에 `/about` 링크 추가**

기존 헤더/nav 컴포넌트를 찾아(예: `src/components/site-header.tsx` 또는 `layout.tsx` 내 nav) "소개" 또는 "왜 ReCos" 링크를 `/about`로 추가. nav가 없으면 이 스텝은 건너뛴다.

- [ ] **Step 3: 타입체크 + 커밋**

Run: `npm run build`
Expected: 통과.
```bash
git add src/app/about/page.tsx
git commit -m "feat: /about 랜딩 페이지 조립 + nav 링크"
```

---

## Task 6: 검증 (build · lint · 브라우저)

- [ ] **Step 1: 빌드 + 린트**

Run: `npm run build && npm run lint`
Expected: 둘 다 통과(에러 0).

- [ ] **Step 2: 브라우저 확인**

Run: `npm run dev` 후 `http://localhost:3000/about`
Expected:
- 7개 섹션 + 관심 등록 밴드가 토큰 색/타이포로 렌더, 모바일 단일 컬럼/데스크톱 반응형
- 주 CTA → `/listings/new`, 보조 CTA → `/listings`
- 관심 등록: 유효 이메일 제출 시 성공 메시지, 잘못된 이메일 시 인라인 에러, 중복 시 "이미 등록된 이메일" 안내
- 카피에 미검증 수치·후기 없음

- [ ] **Step 3: 최종 커밋(미커밋분 있으면)**

```bash
git add -A && git commit -m "feat: /about 랜딩 검증 반영"
```

---

## Self-Review 체크 결과

- **스펙 커버리지:** ①HERO→Task4, ②~⑥ 섹션→Task4, ⑦보증/CTA→Task4, ⑧관심등록→Task2·3·5. 디자인 토큰 준수→전 Task. 빠진 요구 없음.
- **플레이스홀더:** 동적 코드(서버 액션·폼·페이지)는 전체 코드 제공. 정적 섹션은 "스펙 §3 카피 + 승인 프리뷰 HTML"을 단일 출처로 위임(DRY) — 의도된 결정.
- **타입 일관성:** `submitInterestLead({ email })` 반환 `{ success, error?, alreadyExists? }`를 `EmailCapture`가 동일 형태로 소비. 일치.
- **테스트:** 코드베이스에 러너 없음 → build/lint/브라우저 검증으로 대체(헤더에 명시).
