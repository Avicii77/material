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
