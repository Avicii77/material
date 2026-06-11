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
                  className="rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 active:scale-95"
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
    <div className="overflow-hidden rounded-2xl border border-line bg-card">
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
