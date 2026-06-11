# Pretendard 폰트 + 당근식 고밀도 그리드 패스

색은 유지(Starbucks). (1) 폰트를 Pretendard로 교체, (2) 매물 목록을 2~4열 카드 그리드 + 인라인 전체폭 펼침으로, (3) 전반적 여백 축소(당근 느낌). 로직/데이터/`src/lib`·`api`·`supabase` 무변경.

## 1. 폰트 → Pretendard

### `src/app/layout.tsx`
- `Inter_Tight` import와 그 폰트 로더, `${interTight.variable}` 사용을 **제거**.
- `<html>` className에서 interTight 변수 제거(`${notoSansKr.variable} h-full` 유지).
- `<body>` 바로 안쪽 최상단에 Pretendard 스타일시트 link를 렌더(React 19가 head로 hoist):
  ```tsx
  <link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
  />
  ```

### `src/app/globals.css`
- `body` font-family를 `"Pretendard", var(--font-sans-kr), system-ui, sans-serif` 로 교체.
- `@theme inline`의 `--font-lat: var(--font-inter-tight);` → `--font-lat: "Pretendard";`

> 결과: 전 화면 Pretendard. `font-lat` 유틸(영문 라벨)도 Pretendard.

## 2. `src/components/lot-list.tsx` 전체 교체 (그리드 + 전체폭 인라인 펼침)

아래 코드로 파일 전체를 교체:

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

function CompactCard({ item, onClick }: { item: LotView; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex h-full w-full flex-col overflow-hidden rounded-xl border border-line bg-card text-left transition hover:border-accent/50"
    >
      <div className="relative aspect-[4/3] bg-[linear-gradient(135deg,#eef1f3,#dfe4e8)]">
        {item.imageUrls[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.imageUrls[0]} alt={item.title} className="size-full object-cover" />
        ) : null}
        {item.imminent ? (
          <span className="absolute left-2 top-2">
            <Badge tone="signal">임박</Badge>
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-3">
        <div className="truncate text-sm font-semibold text-ink">{item.title}</div>
        <div className="mt-1 truncate text-xs text-sub">CAS {item.casNo} · {item.supplier}</div>
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="text-sm font-bold text-ink">{item.priceLabel}</span>
          <span className={`shrink-0 text-[11px] ${item.expired || item.imminent ? "text-signal" : "text-sub"}`}>
            {item.expiryLabel}
          </span>
        </div>
      </div>
    </button>
  );
}

function ExpandedCard({
  item,
  onClose,
  loggedIn,
}: {
  item: LotView;
  onClose: () => void;
  loggedIn: boolean;
}) {
  const docs = [item.hasMsds && "MSDS", item.hasCoa && "COA"].filter(Boolean).join(" · ") || "-";
  return (
    <div className="rounded-xl border border-accent/40 bg-card p-4">
      <div className="grid gap-5 sm:grid-cols-[280px_1fr]">
        <div>
          <div className="aspect-[4/3] overflow-hidden rounded-lg bg-[linear-gradient(135deg,#e9eef1,#d6dee3)]">
            {item.imageUrls[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.imageUrls[0]} alt={item.title} className="size-full object-cover" />
            ) : null}
          </div>
          {item.imageUrls.length > 1 ? (
            <div className="mt-2 flex gap-2">
              {item.imageUrls.slice(1, 5).map((u, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={u} alt="" className="size-12 rounded-md object-cover" />
              ))}
            </div>
          ) : null}
        </div>
        <div>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-ink">{item.title}</h3>
              <p className="mt-0.5 text-xs text-sub">CAS {item.casNo} · {item.supplier} · {item.typeCategory}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-sub hover:bg-surface"
            >
              접기 ▲
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {item.imminent ? <Badge tone="signal">마감임박</Badge> : null}
            {item.functionTags.slice(0, 4).map((t) => (
              <Badge key={t}>{t}</Badge>
            ))}
            {item.certTags.slice(0, 3).map((t) => (
              <Badge key={t} tone="muted">{t}</Badge>
            ))}
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 border-y border-line-soft py-3 sm:grid-cols-4">
            <Spec k="수량" v={`${item.quantity} ${item.unit}`} />
            <Spec k="유효기한" v={item.expiryLabel} signal={item.expired || item.imminent} />
            <Spec k="가격" v={item.priceLabel} />
            <Spec k="서류" v={docs} />
          </dl>
          <p className="mt-3 text-xs text-sub">
            {loggedIn ? "연락처·서류는 상세 페이지에서 확인하세요." : "로그인 후 연락처를 확인할 수 있어요."}
          </p>
          <div className="mt-3">
            <Link
              href={`/listings/${item.id}`}
              className="inline-block rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 active:scale-95"
            >
              자세히 보기 →
            </Link>
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
      <div className="rounded-2xl border border-dashed border-line bg-card px-6 py-12 text-center text-sm text-sub">
        {emptyText}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((it) => {
        const open = openId === it.id;
        return (
          <div key={it.id} className={open ? "col-span-full" : ""}>
            {open ? (
              <ExpandedCard item={it} loggedIn={loggedIn} onClose={() => setOpenId(null)} />
            ) : (
              <CompactCard item={it} onClick={() => setOpenId(it.id)} />
            )}
          </div>
        );
      })}
    </div>
  );
}
```

## 3. 홈 고밀도화 — `src/app/page.tsx`

- `FeaturedLot` import와 사용을 **제거**. 최근 등록 원료 섹션을 피처드+사이드 분할 대신 **그리드 한 덩어리**로:
  ```tsx
  <LotList items={lots} loggedIn={Boolean(user)} emptyText="등록된 원료가 없습니다." />
  ```
  (즉 `const [featured, ...rest] = lots;` 분기 제거, `lots` 전체를 LotList에 전달.)
- 여백 축소:
  - 히어로 섹션 `py-20 ... lg:py-24` → `py-10 lg:py-14`.
  - 히어로 h1 `text-4xl ... lg:text-[54px] font-light` → `text-3xl sm:text-4xl font-semibold`; 이어지는 `mt-6`들은 `mt-4`/`mt-5`로, CTA `mt-9` → `mt-6`, StatBand 래퍼 `mt-14` → `mt-8`.
  - "이용 안내" 섹션 `py-16` → `py-10`, 내부 `gap-8` → `gap-6`.
  - 최근 등록 섹션 `py-16` → `py-10`, `space-y-8` → `space-y-5`.

## 4. 기타 페이지 여백 축소

- `src/app/listings/page.tsx`: 메인 `py-10` → `py-8`, `space-y-6` → `space-y-5`. (LotList가 자동으로 그리드가 됨.)
- `src/app/mypage/page.tsx`: 메인 `space-y-8` → `space-y-6`, 헤더 `pb-6` → `pb-5`.

## 5. 정리
- `FeaturedLot`이 더 이상 쓰이지 않으면 `src/components/featured-lot.tsx` 삭제(파일시스템 rm). `rg "FeaturedLot|featured-lot" src` 로 잔여 참조 없음 확인.

## 6. 검증
- `npm run build`(= `tsc --noEmit && next build`) **통과**.
- 색/로직/데이터/필드/권한 무변경. 그리드 카드 클릭 시 전체폭 펼침 동작.
