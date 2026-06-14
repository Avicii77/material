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
      className="group flex h-full w-full flex-col overflow-hidden rounded-2xl border border-line bg-card text-left transition hover:-translate-y-0.5 hover:border-ink/30 hover:shadow-[0_18px_50px_rgb(20_23_26_/_0.07)]"
    >
      <div className="relative aspect-[4/3] bg-[linear-gradient(135deg,#eef1f3,#dfe4e8)]">
        {item.imageUrls[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.imageUrls[0]} alt={item.title} className="size-full object-cover" />
        ) : (
          <div className="flex size-full items-center justify-center text-xs font-semibold uppercase tracking-[0.12em] text-sub">
            No image
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="truncate text-sm font-semibold text-ink">{item.title}</div>
        <div className="mt-1 truncate text-xs text-sub">CAS {item.casNo}</div>
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="text-sm font-bold text-ink">{item.priceLabel}</span>
          <span className={`shrink-0 text-[11px] ${item.expired ? "text-signal" : "text-sub"}`}>
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
    <div className="rounded-2xl border border-ink/20 bg-card p-4 sm:p-5">
      <div className="grid gap-5 sm:grid-cols-[280px_1fr]">
        <div>
          <div className="aspect-[4/3] overflow-hidden rounded-lg bg-[linear-gradient(135deg,#e9eef1,#d6dee3)]">
            {item.imageUrls[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.imageUrls[0]} alt={item.title} className="size-full object-cover" />
            ) : (
              <div className="flex size-full items-center justify-center text-xs font-semibold uppercase tracking-[0.12em] text-sub">
                No image
              </div>
            )}
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
              <p className="mt-0.5 text-xs text-sub">CAS {item.casNo} · {item.typeCategory}</p>
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
            {item.functionTags.slice(0, 4).map((t) => (
              <Badge key={t}>{t}</Badge>
            ))}
            {item.certTags.slice(0, 3).map((t) => (
              <Badge key={t} tone="muted">{t}</Badge>
            ))}
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 border-y border-line-soft py-3 sm:grid-cols-4">
            <Spec k="수량" v={`${item.quantity} ${item.unit}`} />
            <Spec k="유효기한" v={item.expiryLabel} signal={item.expired} />
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
      <div className="rounded-[30px] border border-dashed border-line bg-surface px-6 py-12 text-center text-sm text-sub">
        {emptyText}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-4">
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
