import Link from "next/link";
import type { LotView } from "@/lib/listing-view";
import { Badge } from "@/components/badge";

function Field({ label, value, signal }: { label: string; value: string; signal?: boolean }) {
  return (
    <div className="rounded-2xl border border-line bg-surface px-4 py-3">
      <dt className="font-lat text-[10px] uppercase tracking-[0.18em] text-sub">{label}</dt>
      <dd className={`mt-1 text-sm font-semibold ${signal ? "text-signal" : "text-ink"}`}>{value}</dd>
    </div>
  );
}

export function FeaturedLot({ item }: { item: LotView }) {
  const docs = [item.hasMsds && "MSDS", item.hasCoa && "COA"].filter(Boolean).join(" · ") || "서류 미등록";

  return (
    <Link
      href={`/listings/${item.id}`}
      className="group grid overflow-hidden rounded-[32px] border border-line bg-card transition hover:-translate-y-0.5 hover:border-ink/30 hover:shadow-[0_24px_70px_rgb(26_22_21_/_0.08)] lg:grid-cols-[0.86fr_1.14fr]"
    >
      <div className="relative min-h-[280px] bg-surface">
        {item.imageUrls[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.imageUrls[0]} alt={item.title} className="absolute inset-0 size-full object-cover" />
        ) : (
          <img
            src="/recos-material-hero.png"
            alt=""
            className="absolute inset-0 size-full object-cover"
          />
        )}
        <div className="absolute left-4 top-4 flex gap-2">
          <Badge>{item.typeCategory}</Badge>
        </div>
      </div>

      <div className="p-6 sm:p-7">
        <p className="font-lat text-xs uppercase tracking-[0.22em] text-sub">Featured material</p>
        <h3 className="mt-3 text-3xl font-semibold tracking-tight text-ink">{item.title}</h3>
        <p className="mt-2 text-sm leading-6 text-sub">
          {item.inciName} · CAS {item.casNo}
        </p>

        <dl className="mt-6 grid gap-3 sm:grid-cols-2">
          <Field label="Quantity" value={`${item.quantity} ${item.unit}`} />
          <Field label="Expiry" value={item.expiryLabel} signal={item.expired} />
          <Field label="Documents" value={docs} />
          <Field label="Price" value={item.priceLabel} />
        </dl>

        <div className="mt-6 flex flex-wrap gap-2">
          {item.functionTags.slice(0, 3).map((tag) => (
            <Badge key={tag} tone="muted">
              {tag}
            </Badge>
          ))}
          {item.certTags.slice(0, 2).map((tag) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
        </div>

        <div className="mt-7 inline-flex rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition group-hover:opacity-90">
          상세 확인하기
        </div>
      </div>
    </Link>
  );
}
