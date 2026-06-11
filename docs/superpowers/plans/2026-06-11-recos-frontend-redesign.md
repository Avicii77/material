# ReCos 프론트엔드 리디자인 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ReCos 프론트엔드를 Cosmax식 클린 모노크롬 코퍼레이트 톤으로 전면 리스킨하고, 매물 목록을 인라인 펼침(아코디언) 매거진-하이브리드 레이아웃으로 교체한다. 데이터/권한/검증/쿼리 로직은 변경하지 않는다.

**Architecture:** 디자인 토큰(`globals.css`)과 폰트(`layout.tsx`)를 먼저 교체해 모든 페이지의 시각 기반을 바꾼 뒤, 작고 단일책임인 프레젠테이션 컴포넌트(Badge, SectionHead, StatBand, FeaturedLot, LotList, ContactGate 등)를 추가/리스킨한다. 서버 컴포넌트가 `Listing`을 직렬화 가능한 `LotView`로 가공(`lib/listing-view.ts`)해 클라이언트 아코디언(`LotList`)에 전달한다. 페이지는 마크업/클래스만 교체한다.

**Tech Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 (CSS-변수 토큰 + `@theme inline`) · `next/font` (Noto Sans KR + Inter Tight) · Supabase(불변).

**검증 방식(중요):** 이 저장소엔 테스트 러너가 없다. 각 태스크의 검증은 다음으로 한다 —
1. `npm run build` (= `tsc --noEmit && next build`) **통과** (타입/빌드 회귀 방지).
2. 해당하면 `npm run dev` 후 대상 페이지가 에러 없이 렌더되고 `docs/superpowers/specs/2026-06-11-recos-frontend-redesign-design.md`의 디자인 시스템과 일치하는지 육안 확인.
3. Supabase 키가 없어도 빌드/기동이 깨지지 않아야 한다(`getCurrentUser`/쿼리들이 `configMissing`/빈 배열을 반환하므로 컴포넌트는 빈 데이터에서도 렌더돼야 함).

---

## 파일 구조

**생성**
- `src/lib/listing-view.ts` — `LotView` 타입 + `buildLotViews(listings)` (서버에서 포맷/이미지 URL 가공)
- `src/components/badge.tsx` — `Badge` (neutral/signal/muted)
- `src/components/section-head.tsx` — `SectionHead` (영문 라벨 + 국문 제목 + 링크)
- `src/components/stat-band.tsx` — `StatBand`
- `src/components/empty-state.tsx` — `EmptyState`
- `src/components/featured-lot.tsx` — `FeaturedLot` (피처드 카드)
- `src/components/lot-list.tsx` — `LotList` + 내부 `LotRow` (클라이언트 아코디언)
- `src/components/contact-gate.tsx` — `ContactGate` (상세 페이지 연락처/게이트)

**수정**
- `src/app/globals.css` — 토큰 전면 교체
- `src/app/layout.tsx` — Inter Tight 폰트 추가
- `src/components/site-header.tsx` · `site-footer.tsx` · `status-banner.tsx` · `listing-filters.tsx` · `listing-form.tsx` — 리스킨
- `src/app/page.tsx` · `listings/page.tsx` · `listings/[id]/page.tsx` · `mypage/page.tsx` · `login/page.tsx` · `signup/page.tsx` · `terms/page.tsx` — 리빌드/리스킨

**삭제**
- `src/components/listing-table.tsx` — `LotList`로 대체 (마지막 태스크)

**불변 (건드리지 않음)**
- `src/lib/{queries,permissions,featureGate,taxonomy,listingValidation,listing-options,format,listingStorage}.ts`, `src/lib/supabase/*`, `src/app/api/*`, `supabase/*`

---

## 공통: 토큰 클래스 매핑표

리스킨 시 아래 매핑을 일괄 적용한다(검색/치환). 신토큰은 Task 1에서 Tailwind 유틸로 생성된다.

| 기존 클래스 | 신규 클래스 |
|---|---|
| `text-accent` / `text-accent-strong` | `text-ink` (라벨류는 `text-sub`) |
| `bg-accent-strong` (버튼) | `bg-ink` |
| `hover:bg-accent` | `hover:opacity-90` |
| `bg-accent-soft text-accent-strong` (배지) | `Badge` 컴포넌트로 교체 |
| `border-accent-strong` / `border-accent` | `border-ink` |
| `hover:bg-accent-soft` | `hover:bg-surface` |
| `text-slate-950` / `text-slate-900` | `text-ink` |
| `text-slate-700` / `text-slate-600` | `text-ink` (본문) 또는 `text-sub` (보조) |
| `text-slate-500` / `text-slate-400` | `text-sub` |
| `bg-surface-muted` / `hover:bg-surface-muted` | `bg-surface` / `hover:bg-surface` |
| `border border-slate-300` (입력) | `border border-line` |
| `rounded-sm` / `rounded-md` | `rounded-lg` (입력·버튼), `rounded-2xl` (카드) |
| `shadow-[0_18px_60px_rgba(16,70,50,...)]` | 제거(그림자 없음, 보더만) |
| `font-extrabold` (제목) | `font-semibold` |

> Task 1에서 레거시 토큰(`--color-accent*` 등)은 신팔레트로 **재매핑**되므로, 아직 리스킨하지 않은 페이지도 빌드가 깨지지 않고 무채색으로 자연스럽게 보인다. 각 페이지 태스크에서 위 표대로 마크업을 정리한다.

---

### Task 1: 디자인 토큰 교체 (`globals.css`)

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: `globals.css`를 아래 내용으로 교체**

```css
@import "tailwindcss";

:root {
  --bg: #ffffff;
  --surface: #f7f8f9;
  --ink: #14171a;
  --sub: #6b7280;
  --line: #e8eaed;
  --line-soft: #f0f1f3;
  --signal: #c0492e;
}

@theme inline {
  --color-bg: var(--bg);
  --color-surface: var(--surface);
  --color-ink: var(--ink);
  --color-sub: var(--sub);
  --color-line: var(--line);
  --color-line-soft: var(--line-soft);
  --color-signal: var(--signal);

  /* 신토큰 별칭 (페이지가 쓰는 기존 이름 유지용) */
  --color-background: var(--bg);
  --color-foreground: var(--ink);
  --color-surface-muted: var(--surface);

  /* 레거시 accent → 무채색 재매핑 (미마이그레이션 페이지 graceful degrade) */
  --color-accent: var(--ink);
  --color-accent-strong: var(--ink);
  --color-accent-soft: var(--surface);

  --font-lat: var(--font-inter-tight);
}

body {
  background: var(--bg);
  color: var(--ink);
  font-family: var(--font-sans-kr), var(--font-inter-tight), Arial, Helvetica, sans-serif;
}

button,
input,
select,
textarea {
  font: inherit;
}

input,
select,
textarea {
  background: #fff;
}

::selection {
  background: #e9edf0;
}
```

- [ ] **Step 2: 빌드 검증**

Run: `npm run build`
Expected: PASS (타입/빌드 에러 없음). 기존 페이지가 `accent-strong` 등을 참조해도 토큰이 존재하므로 통과.

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "style: replace design tokens with Cosmax monochrome palette"
```

---

### Task 2: Inter Tight 폰트 추가 (`layout.tsx`)

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: import와 폰트 로더 추가** — 상단 import 블록을 아래로 교체

```tsx
import type { Metadata } from "next";
import { Noto_Sans_KR, Inter_Tight } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const notoSansKr = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans-kr",
  display: "swap",
});

const interTight = Inter_Tight({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter-tight",
  display: "swap",
});
```

- [ ] **Step 2: `<html>`에 폰트 변수 추가** — `className`을 아래로 교체

```tsx
    <html lang="ko" className={`${notoSansKr.variable} ${interTight.variable} h-full`}>
      <body className="flex min-h-full flex-col bg-bg text-ink antialiased">
```

- [ ] **Step 3: 빌드 검증**

Run: `npm run build`
Expected: PASS. (`font-lat` 유틸과 `--font-inter-tight`가 연결됨.)

- [ ] **Step 4: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat: add Inter Tight latin font"
```

---

### Task 3: 공용 프리미티브 (Badge, SectionHead, StatBand, EmptyState)

**Files:**
- Create: `src/components/badge.tsx`, `src/components/section-head.tsx`, `src/components/stat-band.tsx`, `src/components/empty-state.tsx`

- [ ] **Step 1: `src/components/badge.tsx`**

```tsx
type BadgeProps = {
  children: React.ReactNode;
  tone?: "neutral" | "signal" | "muted";
};

export function Badge({ children, tone = "neutral" }: BadgeProps) {
  const cls =
    tone === "signal"
      ? "bg-signal text-white"
      : tone === "muted"
        ? "bg-surface text-sub"
        : "bg-[#eef1f3] text-[#3c4045]";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${cls}`}>
      {children}
    </span>
  );
}
```

- [ ] **Step 2: `src/components/section-head.tsx`**

```tsx
import Link from "next/link";

type SectionHeadProps = {
  label: string;
  title: string;
  href?: string;
  linkText?: string;
};

export function SectionHead({ label, title, href, linkText }: SectionHeadProps) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <p className="font-lat text-xs uppercase tracking-[0.2em] text-sub">{label}</p>
        <h2 className="mt-2 text-2xl font-medium tracking-tight text-ink sm:text-[28px]">{title}</h2>
      </div>
      {href ? (
        <Link href={href} className="shrink-0 text-sm font-semibold text-sub hover:text-ink">
          {linkText ?? "더 보기"} →
        </Link>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 3: `src/components/stat-band.tsx`**

```tsx
type Stat = { value: string; label: string };

export function StatBand({ stats }: { stats: Stat[] }) {
  return (
    <div className="flex flex-wrap gap-x-12 gap-y-6">
      {stats.map((s) => (
        <div key={s.label}>
          <div className="font-lat text-3xl font-semibold tracking-tight text-ink">{s.value}</div>
          <div className="mt-1 text-xs text-sub">{s.label}</div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: `src/components/empty-state.tsx`**

```tsx
export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-surface px-6 py-14 text-center text-sm text-sub">
      {children}
    </div>
  );
}
```

- [ ] **Step 5: 빌드 검증**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/badge.tsx src/components/section-head.tsx src/components/stat-band.tsx src/components/empty-state.tsx
git commit -m "feat: add badge, section-head, stat-band, empty-state primitives"
```

---

### Task 4: 매물 뷰모델 (`lib/listing-view.ts`)

**Files:**
- Create: `src/lib/listing-view.ts`

- [ ] **Step 1: 파일 작성** — 서버에서 `Listing`을 직렬화 가능한 `LotView`로 가공. `imminent`는 유효기한 3개월 이내(만료 제외).

```tsx
import { formatExpiry, formatPrice, storageLabel } from "@/lib/format";
import { getImageUrl, type Listing } from "@/lib/queries";

export type LotView = {
  id: string;
  title: string;
  inciName: string;
  casNo: string;
  typeCategory: string;
  manufacturer: string;
  supplier: string;
  region: string | null;
  quantity: number;
  unit: string;
  expiryLabel: string;
  expiryHelper: string;
  expired: boolean;
  imminent: boolean;
  priceLabel: string;
  status: string;
  hasMsds: boolean;
  hasCoa: boolean;
  functionTags: string[];
  certTags: string[];
  storageText: string;
  imageUrls: string[];
};

function monthsUntil(dateStr: string): number | null {
  const date = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  const now = new Date();
  return (date.getFullYear() - now.getFullYear()) * 12 + (date.getMonth() - now.getMonth());
}

export async function buildLotViews(listings: Listing[]): Promise<LotView[]> {
  return Promise.all(
    listings.map(async (l) => {
      const expiry = formatExpiry(l.expiry_date);
      const months = monthsUntil(l.expiry_date);
      const images = (l.listing_images ?? [])
        .slice()
        .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
      const urls = (
        await Promise.all(images.map((img) => getImageUrl(img.storage_path)))
      ).filter((u): u is string => Boolean(u));

      return {
        id: l.id,
        title: l.title,
        inciName: l.inci_name,
        casNo: l.cas_no,
        typeCategory: l.type_category,
        manufacturer: l.manufacturer,
        supplier: l.supplier,
        region: l.region,
        quantity: l.quantity,
        unit: l.unit,
        expiryLabel: expiry.label,
        expiryHelper: expiry.helper,
        expired: expiry.expired,
        imminent: !expiry.expired && months !== null && months <= 3,
        priceLabel: formatPrice(l.price, l.price_negotiable),
        status: l.status,
        hasMsds: l.has_msds,
        hasCoa: l.has_coa,
        functionTags: l.function_tags ?? [],
        certTags: l.cert_tags ?? [],
        storageText: storageLabel(l.storage_condition),
        imageUrls: urls,
      };
    }),
  );
}
```

- [ ] **Step 2: 빌드 검증**

Run: `npm run build`
Expected: PASS. (`storageLabel`은 `null` 입력 시 `"-"` 반환하므로 안전.)

- [ ] **Step 3: Commit**

```bash
git add src/lib/listing-view.ts
git commit -m "feat: add LotView builder for list/featured presentation"
```

---

### Task 5: FeaturedLot 컴포넌트

**Files:**
- Create: `src/components/featured-lot.tsx`

- [ ] **Step 1: 파일 작성**

```tsx
import Link from "next/link";
import type { LotView } from "@/lib/listing-view";
import { Badge } from "@/components/badge";

function FSpec({ k, v, signal }: { k: string; v: string; signal?: boolean }) {
  return (
    <div className="flex-1 border-l border-line-soft pl-4 first:border-l-0 first:pl-0">
      <dt className="text-[10.5px] uppercase tracking-[0.08em] text-sub">{k}</dt>
      <dd className={`mt-1.5 text-sm font-semibold ${signal ? "text-signal" : "text-ink"}`}>{v}</dd>
    </div>
  );
}

export function FeaturedLot({ item }: { item: LotView }) {
  const docs = [item.hasMsds && "MSDS", item.hasCoa && "COA"].filter(Boolean).join(" · ") || "-";
  return (
    <Link
      href={`/listings/${item.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line transition-colors hover:border-ink/30"
    >
      <div className="relative h-56 bg-[linear-gradient(135deg,#eef1f3,#dfe4e8)]">
        {item.imageUrls[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.imageUrls[0]} alt={item.title} className="size-full object-cover" />
        ) : null}
        {item.imminent ? (
          <span className="absolute left-4 top-4">
            <Badge tone="signal">마감임박{item.expiryHelper ? ` · ${item.expiryHelper}` : ""}</Badge>
          </span>
        ) : null}
      </div>
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-[22px] font-semibold tracking-tight text-ink">{item.title}</h3>
            <p className="mt-1 text-sm text-sub">CAS {item.casNo} · {item.supplier}</p>
          </div>
          <div className="shrink-0 text-right font-lat text-xl font-semibold text-ink">{item.priceLabel}</div>
        </div>
        <dl className="mt-5 flex border-t border-line-soft pt-4">
          <FSpec k="수량" v={`${item.quantity} ${item.unit}`} />
          <FSpec k="유효기한" v={item.expiryLabel} signal={item.expired || item.imminent} />
          <FSpec k="서류" v={docs} />
          <FSpec k="보관" v={item.storageText} />
        </dl>
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: 빌드 검증**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/components/featured-lot.tsx
git commit -m "feat: add FeaturedLot card component"
```

---

### Task 6: LotList 아코디언 (클라이언트)

**Files:**
- Create: `src/components/lot-list.tsx`

- [ ] **Step 1: 파일 작성** — 클릭 시 한 번에 하나만 펼침. 높이 애니메이션은 `grid-rows-[0fr→1fr]` 기법. `loggedIn`으로 연락처 게이트 문구 분기(실제 연락처는 상세 페이지에서만 노출).

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import type { LotView } from "@/lib/listing-view";
import { Badge } from "@/components/badge";

function Spec({ k, v, signal }: { k: string; v: string; signal?: boolean }) {
  return (
    <div>
      <dt className="text-[10.5px] uppercase tracking-[0.07em] text-sub">{k}</dt>
      <dd className={`mt-1 text-sm font-semibold ${signal ? "text-signal" : "text-ink"}`}>{v}</dd>
    </div>
  );
}

function LotRow({
  item,
  open,
  onToggle,
  loggedIn,
}: {
  item: LotView;
  open: boolean;
  onToggle: () => void;
  loggedIn: boolean;
}) {
  const docs = [item.hasMsds && "MSDS", item.hasCoa && "COA"].filter(Boolean).join(" · ") || "-";
  return (
    <div className="border-b border-line-soft last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className={`flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-surface ${open ? "bg-surface" : ""}`}
      >
        <div className="size-12 shrink-0 overflow-hidden rounded-xl bg-[linear-gradient(135deg,#eef1f3,#dfe4e8)]">
          {item.imageUrls[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.imageUrls[0]} alt={item.title} className="size-full object-cover" />
          ) : null}
        </div>
        <div className="min-w-0">
          <div className="truncate text-[15px] font-semibold text-ink">{item.title}</div>
          <div className="mt-0.5 truncate text-xs text-sub">
            CAS {item.casNo} · {item.supplier} · {item.typeCategory}
          </div>
        </div>
        <div className="ml-auto shrink-0 text-right">
          <div className="text-sm font-semibold text-ink">{item.priceLabel}</div>
          <div className={`mt-0.5 text-xs ${item.expired || item.imminent ? "text-signal" : "text-sub"}`}>
            {item.expiryLabel}
            {item.expiryHelper ? ` · ${item.expiryHelper}` : ""}
          </div>
        </div>
        <span className={`ml-3 shrink-0 text-sub transition-transform ${open ? "rotate-180" : ""}`} aria-hidden>
          ▾
        </span>
      </button>

      <div className={`grid transition-all duration-300 ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden">
          <div className="grid gap-6 px-5 pb-6 pt-1 sm:grid-cols-[280px_1fr]">
            <div>
              <div className="aspect-[4/3] overflow-hidden rounded-xl bg-[linear-gradient(135deg,#e9eef1,#d6dee3)]">
                {item.imageUrls[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.imageUrls[0]} alt={item.title} className="size-full object-cover" />
                ) : null}
              </div>
              {item.imageUrls.length > 1 ? (
                <div className="mt-2 flex gap-2">
                  {item.imageUrls.slice(1, 5).map((u, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={i} src={u} alt="" className="size-12 rounded-lg object-cover" />
                  ))}
                </div>
              ) : null}
            </div>
            <div>
              <div className="mb-4 flex flex-wrap gap-1.5">
                {item.imminent ? <Badge tone="signal">마감임박</Badge> : null}
                {item.functionTags.slice(0, 4).map((t) => (
                  <Badge key={t}>{t}</Badge>
                ))}
                {item.certTags.slice(0, 3).map((t) => (
                  <Badge key={t} tone="muted">{t}</Badge>
                ))}
              </div>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-4 border-y border-line-soft py-4 sm:grid-cols-4">
                <Spec k="수량" v={`${item.quantity} ${item.unit}`} />
                <Spec k="유효기한" v={item.expiryLabel} signal={item.expired || item.imminent} />
                <Spec k="서류" v={docs} />
                <Spec k="제조원" v={item.manufacturer} />
              </dl>
              <p className="mt-4 text-xs text-sub">
                {loggedIn ? "연락처·서류는 상세 페이지에서 확인하세요." : "로그인 후 연락처를 확인할 수 있어요."}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href={`/listings/${item.id}`}
                  className="rounded-lg bg-ink px-5 py-3 text-sm font-semibold text-white hover:opacity-90"
                >
                  자세히 보기 →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LotList({
  items,
  loggedIn = false,
  emptyText = "표시할 원료가 없습니다.",
}: {
  items: LotView[];
  loggedIn?: boolean;
  emptyText?: string;
}) {
  const [openId, setOpenId] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-line bg-surface px-6 py-14 text-center text-sm text-sub">
        {emptyText}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-line">
      {items.map((it) => (
        <LotRow
          key={it.id}
          item={it}
          loggedIn={loggedIn}
          open={openId === it.id}
          onToggle={() => setOpenId(openId === it.id ? null : it.id)}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 2: 빌드 검증**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/components/lot-list.tsx
git commit -m "feat: add LotList inline-expand accordion component"
```

---

### Task 7: ContactGate 컴포넌트 (상세 페이지용)

**Files:**
- Create: `src/components/contact-gate.tsx`

- [ ] **Step 1: 파일 작성** — `contact`가 있으면 표시, 없으면(비로그인/불허) 로그인 유도. **서버에서 `contact`가 null로 들어오는 게이팅 로직은 그대로** 활용.

```tsx
import Link from "next/link";
import type { ListingContact } from "@/lib/queries";

function Row({ k, v }: { k: string; v: string | null }) {
  return (
    <div>
      <dt className="text-xs text-sub">{k}</dt>
      <dd className="mt-0.5 font-medium text-ink">{v ?? "-"}</dd>
    </div>
  );
}

export function ContactGate({
  contact,
  listingId,
}: {
  contact: ListingContact | null;
  listingId: string;
}) {
  if (!contact) {
    return (
      <div className="rounded-2xl border border-dashed border-line bg-surface p-5">
        <p className="text-sm text-sub">
          <span className="font-semibold text-ink">로그인 후</span> 연락처를 볼 수 있습니다.
        </p>
        <Link
          href={`/login?next=/listings/${listingId}`}
          className="mt-3 inline-block rounded-lg bg-ink px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
        >
          로그인
        </Link>
      </div>
    );
  }
  return (
    <dl className="space-y-3 text-sm">
      <Row k="담당자" v={contact.contact_name} />
      <Row k="회사명" v={contact.company_name} />
      <Row k="전화" v={contact.phone} />
      <Row k="이메일" v={contact.contact_email} />
    </dl>
  );
}
```

- [ ] **Step 2: 빌드 검증**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/components/contact-gate.tsx
git commit -m "feat: add ContactGate component"
```

---

### Task 8: SiteHeader 리스킨 (헤더 키움)

**Files:**
- Modify: `src/components/site-header.tsx`

- [ ] **Step 1: 컴포넌트 본문(`return (...)`)을 아래로 교체** (상단 import·`getCurrentUser`·`featureGate` 로직은 유지)

```tsx
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur">
      <div className="mx-auto flex h-[88px] w-full max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="font-lat text-2xl font-bold tracking-tight text-ink">
          ReCos
        </Link>
        <nav className="hidden items-center gap-9 text-[16px] font-semibold text-[#2a2e33] md:flex">
          <Link className="border-b-2 border-transparent py-1 hover:border-ink" href="/listings">
            원료 검색
          </Link>
          {featureGate(tier, "create_listing") ? (
            <Link className="border-b-2 border-transparent py-1 hover:border-ink" href="/listings/new">
              원료 등록
            </Link>
          ) : null}
          <Link className="border-b-2 border-transparent py-1 hover:border-ink" href="/terms">
            이용 안내
          </Link>
          {user ? (
            <Link className="border-b-2 border-transparent py-1 hover:border-ink" href="/mypage">
              마이페이지
            </Link>
          ) : null}
        </nav>
        <div className="flex items-center gap-3 text-[15px] font-semibold">
          {user ? (
            <form action="/auth/signout" method="post">
              <button className="rounded-lg border border-line px-5 py-3 text-ink hover:bg-surface">
                로그아웃
              </button>
            </form>
          ) : (
            <>
              <Link className="rounded-lg border border-line px-5 py-3 text-ink hover:bg-surface" href="/login">
                로그인
              </Link>
              <Link className="rounded-lg bg-ink px-5 py-3 text-white hover:opacity-90" href="/signup">
                회원가입
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
```

- [ ] **Step 2: 빌드 검증 + 렌더 확인**

Run: `npm run build` → PASS. 이어 `npm run dev` 후 모든 페이지 상단에서 네비/버튼이 커졌는지 육안 확인.

- [ ] **Step 3: Commit**

```bash
git add src/components/site-header.tsx
git commit -m "style: enlarge and reskin site header"
```

---

### Task 9: SiteFooter · StatusBanner 리스킨

**Files:**
- Modify: `src/components/site-footer.tsx`, `src/components/status-banner.tsx`

- [ ] **Step 1: `site-footer.tsx` 교체**

```tsx
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-bg">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-8 text-sm text-sub sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p>© {new Date().getFullYear()} ReCos · 화장품 원료 순환 마켓</p>
        <div className="flex gap-5 font-semibold">
          <Link className="hover:text-ink" href="/terms">
            약관·면책
          </Link>
          <a className="hover:text-ink" href="mailto:contact@recos.local">
            문의
          </a>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: `status-banner.tsx` 교체** (시그널/중립만 사용)

```tsx
type StatusBannerProps = {
  type?: "info" | "error" | "success";
  children: React.ReactNode;
};

export function StatusBanner({ type = "info", children }: StatusBannerProps) {
  const className =
    type === "error"
      ? "border-signal/30 bg-signal/5 text-signal"
      : type === "success"
        ? "border-line bg-surface text-ink"
        : "border-line bg-surface text-sub";

  return (
    <div className={`rounded-xl border px-4 py-3 text-sm font-medium ${className}`}>
      {children}
    </div>
  );
}
```

- [ ] **Step 3: 빌드 검증**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/components/site-footer.tsx src/components/status-banner.tsx
git commit -m "style: reskin footer and status banner"
```

---

### Task 10: 홈 페이지 리빌드 (`app/page.tsx`)

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: 파일 전체를 아래로 교체** — 첫 매물을 `FeaturedLot`, 나머지를 `LotList`로. 데이터 호출(`getHomeListings`)은 유지하고 `buildLotViews`로 가공, `getCurrentUser`로 로그인 여부 전달.

```tsx
import Link from "next/link";
import { SectionHead } from "@/components/section-head";
import { StatBand } from "@/components/stat-band";
import { FeaturedLot } from "@/components/featured-lot";
import { LotList } from "@/components/lot-list";
import { StatusBanner } from "@/components/status-banner";
import { getCurrentUser, getHomeListings } from "@/lib/queries";
import { buildLotViews } from "@/lib/listing-view";

export const dynamic = "force-dynamic";

const marketplaceSteps = [
  {
    label: "등록",
    title: "남는 원료를 품질 정보와 함께 올립니다.",
    body: "원료명, INCI, CAS-NO, 제조원, 공급처, 유효기한, 사진과 서류 보유 여부를 한 번에 정리합니다.",
  },
  {
    label: "검색",
    title: "분류와 서류 조건으로 좁힙니다.",
    body: "종류, 기능, 인증서, 수량, 가격, 지역, 보관 상태까지 거래 판단에 필요한 조건으로 필터링합니다.",
  },
  {
    label: "연락",
    title: "로그인 후 연락처를 열람해 직접 거래합니다.",
    body: "ReCos는 결제나 정산을 중개하지 않습니다. 품질 확인과 거래 조건은 당사자 간 직접 확인합니다.",
  },
];

export default async function Home() {
  const [result, user] = await Promise.all([getHomeListings(), getCurrentUser()]);
  const lots = await buildLotViews(result.listings);
  const [featured, ...rest] = lots;

  return (
    <main>
      <section className="border-b border-line">
        <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          <p className="font-lat text-xs uppercase tracking-[0.22em] text-sub">
            Cosmetic Raw Material · Circular Market
          </p>
          <h1 className="mt-6 max-w-4xl text-4xl font-light leading-[1.18] tracking-tight text-ink sm:text-5xl lg:text-[54px]">
            소량구매 · 마감임박 원료,{" "}
            <span className="font-bold">판매자와 직접 거래</span>합니다.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-sub">
            마감임박·잉여·소량 원료를 필요한 곳에 연결합니다. 원료 순환으로 비용을 줄이고, 중간 단계 없이 직접 거래하세요.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/listings" className="rounded-lg bg-ink px-7 py-3.5 text-center text-sm font-semibold text-white hover:opacity-90">
              원료 검색하기
            </Link>
            <Link href="/listings/new" className="rounded-lg border border-line px-7 py-3.5 text-center text-sm font-semibold text-ink hover:bg-surface">
              원료 등록하기
            </Link>
          </div>
          <div className="mt-14">
            <StatBand
              stats={[
                { value: "18종", label: "원료 카테고리" },
                { value: "21개", label: "기능 태그" },
                { value: "10일", label: "평균 매칭 소요" },
              ]}
            />
          </div>
        </div>
      </section>

      <section className="border-b border-line">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
          <div className="lg:border-r lg:border-line lg:pr-8">
            <h2 className="text-2xl font-medium tracking-tight text-ink">이용 안내</h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-sub">
              ReCos는 원료를 보유한 판매자와 필요한 구매자가 직접 연락하는 매칭 서비스입니다. 사이트 내 결제·정산·물류 중개 없이 원료 정보와 연락 경로를 명확히 정리합니다.
            </p>
            <Link className="mt-5 inline-flex text-sm font-semibold text-ink underline" href="/terms">
              약관·면책 확인
            </Link>
          </div>
          <div className="grid gap-4 lg:pl-8">
            {marketplaceSteps.map((step) => (
              <div key={step.label} className="grid gap-3 border-b border-line-soft pb-4 last:border-b-0 last:pb-0 sm:grid-cols-[72px_1fr]">
                <div className="font-lat text-sm font-semibold text-sub">{step.label}</div>
                <div>
                  <h3 className="font-semibold text-ink">{step.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-sub">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl space-y-8 px-4 py-16 sm:px-6 lg:px-8">
        <SectionHead label="Recent Lots" title="최근 등록 원료" href="/listings" linkText="더 많은 원료 검색하기" />
        {result.configMissing ? (
          <StatusBanner>Supabase 환경변수 설정 전이라 등록 데이터가 비어 있습니다.</StatusBanner>
        ) : null}
        {result.error ? <StatusBanner type="error">{result.error}</StatusBanner> : null}
        {featured ? (
          <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
            <FeaturedLot item={featured} />
            <LotList items={rest} loggedIn={Boolean(user)} emptyText="추가 등록 원료가 없습니다." />
          </div>
        ) : (
          <LotList items={lots} loggedIn={Boolean(user)} emptyText="등록된 원료가 없습니다." />
        )}
      </section>
    </main>
  );
}
```

- [ ] **Step 2: 빌드 + 렌더 검증**

Run: `npm run build` → PASS. `npm run dev` → `/` 가 히어로/스탯/이용안내/피처드+리스트로 렌더되고, 우측 리스트 행 클릭 시 펼쳐지는지 확인. (데이터 비어있어도 `EmptyState`로 렌더돼야 함.)

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: rebuild home page with featured + accordion layout"
```

---

### Task 11: 검색 페이지 리빌드 (`app/listings/page.tsx`)

**Files:**
- Modify: `src/app/listings/page.tsx`

- [ ] **Step 1: 결과 표시부를 `LotList`로 교체** — `filterChips`/`pageHref` 함수와 `getListings` 호출은 유지. import와 본문을 아래로 교체.

상단 import 교체:

```tsx
import Link from "next/link";
import { ListingFilters } from "@/components/listing-filters";
import { LotList } from "@/components/lot-list";
import { Badge } from "@/components/badge";
import { StatusBanner } from "@/components/status-banner";
import { getCurrentUser, getListings, type SearchParams } from "@/lib/queries";
import { buildLotViews } from "@/lib/listing-view";
```

`filterChips`와 `pageHref` 함수는 **그대로 유지**. `ListingsPage` 함수를 아래로 교체:

```tsx
export default async function ListingsPage({ searchParams }: ListingsPageProps) {
  const params = (await searchParams) ?? {};
  const [result, user] = await Promise.all([getListings(params), getCurrentUser()]);
  const lots = await buildLotViews(result.listings);
  const chips = filterChips(params);
  const totalPages = Math.max(1, Math.ceil(result.count / result.pageSize));

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-lat text-xs uppercase tracking-[0.2em] text-sub">Search Inventory</p>
          <h1 className="mt-2 text-3xl font-medium tracking-tight text-ink">원료 검색</h1>
        </div>
        <Link href="/listings/new" className="rounded-lg bg-ink px-5 py-3 text-sm font-semibold text-white hover:opacity-90">
          원료 등록
        </Link>
      </div>

      <ListingFilters searchParams={params} />

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm font-semibold text-ink">총 {result.count}개 결과</div>
          {chips.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {chips.map((chip) => (
                <Badge key={chip} tone="muted">{chip}</Badge>
              ))}
            </div>
          ) : null}
        </div>
        {result.configMissing ? (
          <StatusBanner>Supabase 환경변수 설정 전이라 검색 데이터가 비어 있습니다.</StatusBanner>
        ) : null}
        {result.error ? <StatusBanner type="error">{result.error}</StatusBanner> : null}
        <LotList items={lots} loggedIn={Boolean(user)} emptyText="검색 조건에 맞는 원료가 없습니다." />
        <div className="flex items-center justify-between border-t border-line pt-4 text-sm">
          <Link
            href={pageHref(params, Math.max(1, result.page - 1))}
            className={`rounded-lg border border-line px-4 py-2.5 font-semibold ${result.page <= 1 ? "pointer-events-none text-sub/40" : "text-ink hover:bg-surface"}`}
          >
            이전
          </Link>
          <span className="text-sub">{result.page} / {totalPages}</span>
          <Link
            href={pageHref(params, Math.min(totalPages, result.page + 1))}
            className={`rounded-lg border border-line px-4 py-2.5 font-semibold ${result.page >= totalPages ? "pointer-events-none text-sub/40" : "text-ink hover:bg-surface"}`}
          >
            다음
          </Link>
        </div>
      </section>
    </main>
  );
}
```

- [ ] **Step 2: 빌드 + 렌더 검증**

Run: `npm run build` → PASS. `npm run dev` → `/listings` 가 필터 + 아코디언 리스트 + 칩 + 페이지네이션으로 렌더되는지 확인.

- [ ] **Step 3: Commit**

```bash
git add src/app/listings/page.tsx
git commit -m "feat: rebuild listings page with accordion list"
```

---

### Task 12: ListingFilters 리스킨 (상세 필터 접기)

**Files:**
- Modify: `src/components/listing-filters.tsx`

- [ ] **Step 1: 입력 클래스 상수와 헬퍼 톤 정리** — `inputClass`를 교체하고, `FieldLabel`·`CheckGrid`의 라벨 색을 신토큰으로.

`inputClass` 교체:

```tsx
const inputClass = "rounded-lg border border-line px-3.5 py-2.5 text-sm outline-none focus:border-ink";
```

`FieldLabel`의 `<span>` 클래스 교체: `font-bold text-slate-700` → `font-semibold text-ink`.
`CheckGrid`의 `<legend>` 클래스 교체: `font-bold text-slate-700` → `font-semibold text-ink`. 그리드 컨테이너 `border border-line bg-white p-2` → `rounded-lg border border-line bg-white p-2`. 옵션 라벨 `hover:bg-surface-muted` → `hover:bg-surface`. 체크박스 `accent-[var(--accent)]` → `accent-[var(--ink)]`.

- [ ] **Step 2: `<form>` 컨테이너와 버튼 톤 교체**

`<form>` 클래스: `border border-line bg-white p-4 shadow-[...]` → `rounded-2xl border border-line bg-white p-5`.
초기화 링크: `rounded-sm border border-line ... hover:bg-surface-muted` → `rounded-lg border border-line px-4 py-2.5 text-sm font-semibold text-ink hover:bg-surface`.
검색 버튼: `rounded-sm bg-accent-strong ... hover:bg-accent` → `rounded-lg bg-ink px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90`.

- [ ] **Step 3: 상세 필터를 `<details>`로 감싸기** — 기능/인증서/기간/수량/가격/지역/서류 패널(현재 `<div className="grid gap-5 pt-4 ...">` 블록 전체)을 아래로 감싼다(서버 컴포넌트 유지, JS 불필요):

```tsx
      <details className="group pt-4">
        <summary className="cursor-pointer list-none text-sm font-semibold text-ink">
          <span className="inline-flex items-center gap-1">상세 필터 <span className="text-sub transition-transform group-open:rotate-180">▾</span></span>
        </summary>
        <div className="grid gap-5 pt-4 xl:grid-cols-[1.15fr_0.85fr]">
          {/* ...기존 기능/인증서/기간/수량/가격/지역/서류 내용 그대로... */}
        </div>
      </details>
```

> 기존 `<div className="grid gap-5 pt-4 xl:grid-cols-[1.15fr_0.85fr]">...</div>` 블록의 **내부 내용은 그대로** 옮기고, 바깥만 `<details>`로 교체한다. 체크박스 `accent-[var(--accent)]`는 모두 `accent-[var(--ink)]`로.

- [ ] **Step 4: 빌드 + 렌더 검증**

Run: `npm run build` → PASS. `npm run dev` → `/listings` 에서 "상세 필터" 클릭 시 패널이 접히고 펼쳐지는지, 검색/초기화 동작이 그대로인지 확인.

- [ ] **Step 5: Commit**

```bash
git add src/components/listing-filters.tsx
git commit -m "style: reskin filters and collapse advanced panel"
```

---

### Task 13: 상세 페이지 리스킨 (`app/listings/[id]/page.tsx`)

**Files:**
- Modify: `src/app/listings/[id]/page.tsx`

- [ ] **Step 1: import에 컴포넌트 추가**

```tsx
import { Badge } from "@/components/badge";
import { ContactGate } from "@/components/contact-gate";
```

- [ ] **Step 2: 헤더·배지·연락처 블록 교체**
  - 상단 헤더의 `text-sm font-bold text-accent` → `font-lat text-xs uppercase tracking-[0.2em] text-sub`; `h1`의 `text-4xl font-extrabold ... text-slate-950` → `text-4xl font-semibold tracking-tight text-ink`; `<p className="mt-2 text-slate-600">` → `text-sub`.
  - 상태 배지 `<span className="rounded-full bg-accent-soft ...">{statusLabel(...)}</span>` → `<Badge tone={listing.status === "available" ? "neutral" : "muted"}>{statusLabel(listing.status)}</Badge>`.
  - 수정 링크 `rounded-sm border border-line ... hover:bg-surface-muted` → `rounded-lg border border-line px-4 py-2.5 text-sm font-semibold text-ink hover:bg-surface`.
  - **연락처 카드 내부**(현재 `{detail.contact ? (<dl>...) : (<로그인 유도>)}` 전체)를 아래로 교체:

```tsx
            <ContactGate contact={detail.contact} listingId={listing.id} />
```

  - `기능` 배지들: `<span className="rounded-full bg-accent-soft ...">{tag}</span>` → `<Badge key={tag}>{tag}</Badge>`.
  - `인증서` 배지들: `<span className="rounded-full bg-slate-100 ...">{tag}</span>` → `<Badge key={tag} tone="muted">{tag}</Badge>`.
  - 카드 컨테이너들의 `border border-line bg-white p-5 shadow-[...]` → `rounded-2xl border border-line bg-white p-6`. `InfoItem`의 라벨/값 색은 `text-slate-500`→`text-sub`, `text-slate-900`→`text-ink`.
  - 찜 버튼 `border-accent-strong text-accent-strong hover:bg-accent-soft` → `border-ink text-ink hover:bg-surface`, `rounded-sm`→`rounded-lg`.
  - 소유자 작업 버튼들의 `rounded-sm ... hover:bg-surface-muted` → `rounded-lg ... hover:bg-surface`. 삭제 버튼의 빨강 계열은 `border-signal/40 text-signal hover:bg-signal/5`로.

> 나머지 마크업/로직(이미지 매핑, `getImageUrl`, 서류 signed_url, `ownerCanEdit`)은 **그대로 유지**.

- [ ] **Step 3: 빌드 + 렌더 검증**

Run: `npm run build` → PASS. `npm run dev` → 임의 상세 경로 렌더 시 갤러리/정보/연락처 게이트/서류/소유자작업이 신톤으로 보이는지 확인(데이터 없으면 `configMissing` 배너).

- [ ] **Step 4: Commit**

```bash
git add src/app/listings/[id]/page.tsx
git commit -m "style: reskin listing detail page with ContactGate and Badge"
```

---

### Task 14: ListingForm 리스킨

**Files:**
- Modify: `src/components/listing-form.tsx`

- [ ] **Step 1: 공용 입력 클래스 상수 추가** — `export function ListingForm` 위에 추가:

```tsx
const field = "rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm outline-none focus:border-ink";
```

- [ ] **Step 2: 입력 클래스 일괄 치환** — 파일 내 모든 `className="rounded-md border border-slate-300 px-3 py-2"` 및 `className="min-h-48 rounded-md border border-slate-300 px-3 py-2"`, `className="rounded-md border border-slate-300 px-3 py-2 disabled:bg-slate-100"` 를 각각:
  - 일반 input/select/date: `className={field}`
  - multiple select(기능/인증서): `className={`${field} min-h-48`}`
  - 가격 input(비활성 포함): `className={`${field} disabled:bg-surface`}`

- [ ] **Step 3: 폼 컨테이너·섹션 헤더·라벨·버튼 톤 교체**
  - `<form>` 클래스: `space-y-7 border border-line bg-white p-5 shadow-[...]` → `space-y-7 rounded-2xl border border-line bg-white p-6`.
  - 섹션 헤더 `<h2 className="text-xl font-extrabold tracking-tight text-slate-950">` → `text-xl font-semibold tracking-tight text-ink` (3곳). 그 아래 `<p className="... text-slate-500">` → `text-sub`.
  - 모든 라벨 `<span className="font-medium">` 은 유지(중립). 
  - 기존 사진 안내 박스 `rounded-md bg-slate-50 ... text-slate-600` → `rounded-lg bg-surface ... text-sub`.
  - 저장 버튼 `rounded-sm bg-accent-strong ... hover:bg-accent` → `rounded-lg bg-ink px-6 py-3 text-sm font-semibold text-white hover:opacity-90`.

> `"use client"`, `useState`(negotiable), 모든 `name`/`required`/검증 속성·필드 구성은 **그대로 유지**.

- [ ] **Step 4: 빌드 + 렌더 검증**

Run: `npm run build` → PASS. `npm run dev` → `/listings/new` 렌더 시 폼이 신톤으로 보이고, "협의" 체크 시 가격 비활성화가 그대로 동작하는지 확인.

- [ ] **Step 5: Commit**

```bash
git add src/components/listing-form.tsx
git commit -m "style: reskin listing form"
```

---

### Task 15: 마이페이지 리스킨 (`app/mypage/page.tsx`)

**Files:**
- Modify: `src/app/mypage/page.tsx`

- [ ] **Step 1: import 교체** — `ListingTable` 대신 `LotList` + `buildLotViews` + `getCurrentUser`는 불필요(데이터에 user 포함). 상단 import를 아래로:

```tsx
import { redirect } from "next/navigation";
import { LotList } from "@/components/lot-list";
import { StatusBanner } from "@/components/status-banner";
import { getMyPageData, type SearchParams } from "@/lib/queries";
import { buildLotViews } from "@/lib/listing-view";
```

- [ ] **Step 2: 데이터 가공 추가** — `redirect` 직후, 세 목록을 `LotView`로 변환:

```tsx
  const [myLots, bookmarkLots, recentLots] = await Promise.all([
    buildLotViews(data.listings),
    buildLotViews(data.bookmarks),
    buildLotViews(data.recentViews),
  ]);
```

- [ ] **Step 3: 헤더·섹션·표 교체**
  - 헤더 `<p className="text-sm font-bold uppercase ... text-accent">Account workspace</p>` → `font-lat text-xs uppercase tracking-[0.2em] text-sub`; `h1` `text-3xl font-extrabold ... text-slate-950` → `text-3xl font-medium tracking-tight text-ink`; 설명 `text-slate-500` → `text-sub`. 컨테이너 `border-b border-line pb-5` → `pb-6`.
  - 세 섹션의 `<h2 className="text-xl font-extrabold tracking-tight">` → `text-xl font-semibold tracking-tight text-ink`, 그리고:
    - 내 등록물: `<LotList items={myLots} loggedIn emptyText="등록한 원료가 없습니다." />`
    - 찜: `<LotList items={bookmarkLots} loggedIn emptyText="찜한 원료가 없습니다." />`
    - 최근 본: `<LotList items={recentLots} loggedIn emptyText="최근 본 원료가 없습니다." />`
  - 프로필 섹션 컨테이너 `border border-line bg-white p-5 shadow-[...]` → `rounded-2xl border border-line bg-white p-6`. 입력들 `rounded-md border border-slate-300 px-3 py-2` → `rounded-lg border border-line px-3.5 py-2.5 text-sm`. 저장 버튼 `rounded-sm bg-accent-strong ... hover:bg-accent` → `rounded-lg bg-ink px-6 py-3 text-sm font-semibold text-white hover:opacity-90`. 설명 `text-slate-500` → `text-sub`.

> `getMyPageData`·`redirect`·`/api/profile` form action·`name` 속성은 **불변**.

- [ ] **Step 4: 빌드 + 렌더 검증**

Run: `npm run build` → PASS. (`/mypage`는 비로그인 시 `/login`으로 redirect되므로 렌더 확인은 로그인 환경 또는 빌드 통과로 갈음.)

- [ ] **Step 5: Commit**

```bash
git add src/app/mypage/page.tsx
git commit -m "feat: reskin mypage with accordion lists"
```

---

### Task 16: 로그인·회원가입·약관 리스킨

**Files:**
- Modify: `src/app/login/page.tsx`, `src/app/signup/page.tsx`, `src/app/terms/page.tsx`

- [ ] **Step 1: 공통 매핑 적용** — 세 파일 모두 아래로 일괄 치환:
  - `text-sm font-bold uppercase tracking-[0.16em] text-accent` → `font-lat text-xs uppercase tracking-[0.2em] text-sub`
  - `text-3xl font-extrabold tracking-tight text-slate-950` → `text-3xl font-medium tracking-tight text-ink`
  - `text-slate-500` / `text-slate-600` → `text-sub`
  - 카드/폼 컨테이너 `border border-line bg-white p-5` → `rounded-2xl border border-line bg-white p-6`
  - 입력 `rounded-sm border border-line px-3 py-2.5` → `rounded-lg border border-line px-3.5 py-2.5 text-sm`
  - 라벨 `<span className="font-bold">` / `<span className="font-medium">` → `font-semibold text-ink`
  - 솔리드 버튼 `rounded-sm bg-accent-strong ... hover:bg-accent` → `rounded-lg bg-ink ... text-white hover:opacity-90`
  - 보조 버튼(Google) `rounded-sm border border-line ... hover:bg-surface-muted` → `rounded-lg border border-line ... hover:bg-surface`
  - 링크 `font-bold text-accent-strong underline` → `font-semibold text-ink underline`

- [ ] **Step 2: 약관 본문 제목 톤** — `terms/page.tsx`의 `<h2 className="text-xl font-extrabold text-slate-900">` → `text-xl font-semibold text-ink`, 본문 `text-slate-700` → `text-ink`. 컨테이너 `border border-line bg-white p-5` → `rounded-2xl border border-line bg-white p-6 sm:p-8`.

> 모든 `action`(`signInWithEmail`/`signInWithGoogle`/`signUpWithEmail`)·`name`·`next` hidden·`required`/`minLength`는 **불변**.

- [ ] **Step 3: 빌드 + 렌더 검증**

Run: `npm run build` → PASS. `npm run dev` → `/login`, `/signup`, `/terms` 가 신톤 카드로 렌더되는지 확인.

- [ ] **Step 4: Commit**

```bash
git add src/app/login/page.tsx src/app/signup/page.tsx src/app/terms/page.tsx
git commit -m "style: reskin login, signup, terms pages"
```

---

### Task 17: 정리 — listing-table 제거 + 최종 검증

**Files:**
- Delete: `src/components/listing-table.tsx`

- [ ] **Step 1: 잔여 참조 확인** — `ListingTable`이 더 이상 import되지 않는지 확인.

Run: `git grep -n "listing-table\|ListingTable" src` (PowerShell: `Select-String -Path src -Pattern "ListingTable" -Recurse`)
Expected: 결과 없음 (Task 10·11·15에서 모두 교체됨).

- [ ] **Step 2: 파일 삭제**

```bash
git rm src/components/listing-table.tsx
```

- [ ] **Step 3: 레거시 토큰 정리(선택)** — `globals.css`의 `--color-accent`, `--color-accent-strong`, `--color-accent-soft` 별칭을 `git grep -n "accent" src`로 검색해 잔여 사용처가 없으면 제거. 사용처가 남아 있으면 그대로 둔다.

- [ ] **Step 4: 전체 빌드 + 렌더 스윕**

Run: `npm run build`
Expected: PASS.

Run: `npm run dev` → 다음 페이지를 순회하며 콘솔 에러 없이 렌더되고 디자인 시스템과 일치하는지 확인:
`/`, `/listings`, `/listings/new`, `/login`, `/signup`, `/terms`. (가능하면 상세/마이페이지도.)

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: remove legacy ListingTable and finalize redesign"
```

---

## Self-Review (작성자 점검 완료)

**스펙 커버리지** — 디자인 스펙 §3 디자인시스템(Task 1·2·3), §4.1 헤더(8), §4.2 홈(10), §4.3 검색(11·12), §4.4 상세(13·7), §4.5 폼(14), §4.6 마이페이지(15), §4.7 로그인/회원가입/약관(16), §4.8 공통상태(EmptyState/StatusBanner: 3·9), 인라인 펼침(6), 토큰 가드레일(전 태스크 "불변" 명시). 누락 없음.

**플레이스홀더 스캔** — TBD/모호 지시 없음. 리스킨 태스크는 정확한 클래스 치환 규칙으로 구체화.

**타입 일관성** — `LotView`(Task 4) 필드명이 `FeaturedLot`(5)·`LotList`(6)에서 동일하게 사용됨(`imageUrls`, `expiryLabel`, `expiryHelper`, `imminent`, `storageText`, `priceLabel`). `ContactGate`는 `ListingContact`(queries.ts) 사용. `buildLotViews`는 `Listing[]` 입력으로 home·listings·mypage에서 일관 호출.
