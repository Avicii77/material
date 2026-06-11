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
