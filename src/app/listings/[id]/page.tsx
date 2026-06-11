import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/badge";
import { ContactGate } from "@/components/contact-gate";
import { StatusBanner } from "@/components/status-banner";
import {
  formatExpiry,
  formatNumber,
  formatPrice,
  openedLabel,
  statusLabel,
  storageLabel,
} from "@/lib/format";
import { can } from "@/lib/permissions";
import { getImageUrl, getListingDetail } from "@/lib/queries";

export const dynamic = "force-dynamic";

type ListingDetailPageProps = {
  params: Promise<{ id: string }>;
};

function InfoItem({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-line pb-3">
      <dt className="text-[11px] font-bold uppercase tracking-[0.08em] text-sub">{label}</dt>
      <dd className="mt-1 font-semibold text-ink">{children}</dd>
    </div>
  );
}

export default async function ListingDetailPage({ params }: ListingDetailPageProps) {
  const { id } = await params;
  const detail = await getListingDetail(id);

  if (detail.configMissing) {
    return (
      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <StatusBanner>Supabase 환경변수 설정 전이라 상세 데이터를 불러올 수 없습니다.</StatusBanner>
      </main>
    );
  }

  if (!detail.listing) {
    notFound();
  }

  const listing = detail.listing;
  const expiry = formatExpiry(listing.expiry_date);
  const images = await Promise.all(
    (listing.listing_images ?? [])
      .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
      .map(async (image) => ({ ...image, url: await getImageUrl(image.storage_path) })),
  );
  const ownerCanEdit = can(detail.user, "edit_listing", listing);

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="font-lat text-xs uppercase tracking-[0.2em] text-sub">{listing.type_category}</div>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-ink">{listing.title}</h1>
          <p className="mt-2 text-sub">{listing.inci_name} · {listing.cas_no}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge tone={listing.status === "available" ? "neutral" : "muted"}>{statusLabel(listing.status)}</Badge>
          {ownerCanEdit ? (
            <Link
              href={`/listings/${listing.id}/edit`}
              className="rounded-full border border-line px-4 py-2.5 text-sm font-semibold text-ink hover:bg-surface"
            >
              수정
            </Link>
          ) : null}
        </div>
      </div>

      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {images.length > 0 ? (
              images.map((image) => (
                <div key={image.id} className="aspect-[4/3] overflow-hidden rounded-2xl border border-line bg-surface">
                  {image.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={image.url} alt={listing.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-sub">
                      이미지 URL 없음
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-line bg-white p-8 text-sm text-sub">
                등록된 사진이 없습니다.
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-line bg-card p-6">
            <h2 className="text-xl font-semibold tracking-tight text-ink">전체 정보</h2>
            <dl className="mt-5 grid gap-4 sm:grid-cols-2">
              <InfoItem label="수량">{formatNumber(listing.quantity)} {listing.unit}</InfoItem>
              <InfoItem label="유효기한">
                {expiry.label} <span className="text-sm font-medium text-sub">{expiry.helper}</span>
              </InfoItem>
              <InfoItem label="가격">{formatPrice(listing.price, listing.price_negotiable)}</InfoItem>
              <InfoItem label="할인율">{listing.discount_rate ?? "-"}%</InfoItem>
              <InfoItem label="공급처/제조원">{listing.supplier} / {listing.manufacturer}</InfoItem>
              <InfoItem label="지역">{listing.region ?? "-"}</InfoItem>
              <InfoItem label="개봉여부">{openedLabel(listing.opened_status)}</InfoItem>
              <InfoItem label="보관상태">{storageLabel(listing.storage_condition)}</InfoItem>
              <InfoItem label="원래 패킹 단위">{listing.original_packing_unit ?? "-"}</InfoItem>
              <InfoItem label="서류">MSDS {listing.has_msds ? "있음" : "없음"} · COA {listing.has_coa ? "있음" : "없음"}</InfoItem>
            </dl>
            <div className="mt-5">
              <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-sub">기능</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {(listing.function_tags ?? []).length > 0 ? (
                  listing.function_tags?.map((tag) => (
                    <Badge key={tag}>{tag}</Badge>
                  ))
                ) : (
                  <span className="text-sm text-sub">-</span>
                )}
              </div>
            </div>
            <div className="mt-5">
              <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-sub">인증서</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {(listing.cert_tags ?? []).length > 0 ? (
                  listing.cert_tags?.map((tag) => (
                    <Badge key={tag} tone="muted">{tag}</Badge>
                  ))
                ) : (
                  <span className="text-sm text-sub">-</span>
                )}
              </div>
            </div>
            <div className="mt-5">
              <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-sub">기타사항</div>
              <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-ink">
                {listing.notes ?? "-"}
              </p>
            </div>
          </div>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-line bg-card p-6">
            <h2 className="text-xl font-semibold tracking-tight text-ink">연락처</h2>
            <div className="mt-4">
              <ContactGate contact={detail.contact} listingId={listing.id} />
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-card p-6">
            <h2 className="text-xl font-semibold tracking-tight text-ink">서류</h2>
            <div className="mt-4 space-y-2 text-sm">
              {(listing.listing_docs ?? []).length > 0 ? (
                listing.listing_docs?.map((doc) =>
                  doc.signed_url ? (
                    <a
                      key={doc.id}
                      href={doc.signed_url}
                      className="block rounded-full border border-ink px-3 py-2 font-bold text-ink hover:bg-surface"
                    >
                      {doc.doc_type.toUpperCase()} 다운로드
                    </a>
                  ) : (
                    <div key={doc.id} className="rounded-lg bg-surface px-3 py-2 text-sub">
                      {doc.doc_type.toUpperCase()} · 로그인 후 다운로드
                    </div>
                  ),
                )
              ) : (
                <p className="text-sub">첨부 서류가 없습니다.</p>
              )}
            </div>
          </div>

          {detail.user ? (
            <form action="/api/bookmarks" method="post" className="rounded-2xl border border-line bg-white p-6">
              <input type="hidden" name="listing_id" value={listing.id} />
              <button className="w-full rounded-full border border-ink px-4 py-2 text-sm font-bold text-ink hover:bg-surface">
                찜 토글
              </button>
            </form>
          ) : null}

          {ownerCanEdit ? (
            <div className="rounded-2xl border border-line bg-card p-6">
              <h2 className="text-xl font-semibold tracking-tight text-ink">소유자 작업</h2>
              <div className="mt-4 grid gap-2">
                {["available", "reserved", "completed"].map((status) => (
                  <form key={status} action={`/api/listings/${listing.id}`} method="post">
                    <input type="hidden" name="intent" value="status" />
                    <input type="hidden" name="status" value={status} />
                    <button className="w-full rounded-full border border-line px-3 py-2 text-sm font-bold hover:bg-surface">
                      {statusLabel(status)}로 변경
                    </button>
                  </form>
                ))}
                <form action={`/api/listings/${listing.id}`} method="post">
                  <input type="hidden" name="intent" value="delete" />
                  <button className="w-full rounded-full border border-signal/40 px-3 py-2 text-sm font-bold text-signal hover:bg-signal/5">
                    삭제
                  </button>
                </form>
              </div>
            </div>
          ) : null}
        </aside>
      </section>
    </main>
  );
}
