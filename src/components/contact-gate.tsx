import Link from "next/link";
import type { ContactLock, ListingContact } from "@/lib/queries";

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
  lock,
}: {
  contact: ListingContact | null;
  listingId: string;
  lock?: ContactLock;
}) {
  const resolvedLock = lock === undefined ? (contact ? null : "login") : lock;

  if (resolvedLock === "login") {
    return (
      <div className="rounded-2xl border border-dashed border-line bg-surface p-5">
        <p className="text-sm text-sub">
          <span className="font-semibold text-ink">로그인 후</span> 연락처를 볼 수 있습니다.
        </p>
        <Link
          href={`/login?next=/listings/${listingId}`}
          className="mt-3 inline-block rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 active:scale-95"
        >
          로그인
        </Link>
      </div>
    );
  }

  if (resolvedLock === "profile") {
    return (
      <div className="rounded-2xl border border-dashed border-line bg-surface p-5">
        <p className="text-sm text-sub">
          내 프로필(이름·회사·연락처)을 완성하면 연락처를 볼 수 있습니다.
        </p>
        <Link
          href="/mypage"
          className="mt-3 inline-block rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 active:scale-95"
        >
          프로필 완성하기
        </Link>
      </div>
    );
  }

  if (!contact) {
    return <p className="text-sm text-sub">등록된 연락처가 없습니다.</p>;
  }

  return (
    <dl className="space-y-3 text-sm">
      <Row k="담당자" v={contact.contact_name} />
      <Row k="전화" v={contact.phone} />
      <Row k="이메일" v={contact.contact_email} />
    </dl>
  );
}
