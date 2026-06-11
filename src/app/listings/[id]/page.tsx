import Link from "next/link";
import { notFound } from "next/navigation";
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
      <dt className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">{label}</dt>
      <dd className="mt-1 font-semibold text-slate-900">{children}</dd>
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
          <div className="text-sm font-bold text-accent">{listing.type_category}</div>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-slate-950">{listing.title}</h1>
          <p className="mt-2 text-slate-600">{listing.inci_name} · {listing.cas_no}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-accent-soft px-3 py-1 text-sm font-bold text-accent-strong">{statusLabel(listing.status)}</span>
          {ownerCanEdit ? (
            <Link
              href={`/listings/${listing.id}/edit`}
              className="rounded-sm border border-line px-3 py-2 text-sm font-bold hover:bg-surface-muted"
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
                <div key={image.id} className="aspect-[4/3] overflow-hidden border border-line bg-slate-100">
                  {image.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={image.url} alt={listing.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-slate-500">
                      이미지 URL 없음
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="border border-dashed border-line bg-white p-8 text-sm text-slate-500">
                등록된 사진이 없습니다.
              </div>
            )}
          </div>

          <div className="border border-line bg-white p-5">
            <h2 className="text-xl font-extrabold tracking-tight">전체 정보</h2>
            <dl className="mt-5 grid gap-4 sm:grid-cols-2">
              <InfoItem label="수량">{formatNumber(listing.quantity)} {listing.unit}</InfoItem>
              <InfoItem label="유효기한">
                {expiry.label} <span className="text-sm font-medium text-slate-500">{expiry.helper}</span>
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
              <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">기능</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {(listing.function_tags ?? []).length > 0 ? (
                  listing.function_tags?.map((tag) => (
                    <span key={tag} className="rounded-full bg-accent-soft px-3 py-1 text-xs font-bold text-accent-strong">
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-slate-500">-</span>
                )}
              </div>
            </div>
            <div className="mt-5">
              <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">인증서</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {(listing.cert_tags ?? []).length > 0 ? (
                  listing.cert_tags?.map((tag) => (
                    <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-slate-500">-</span>
                )}
              </div>
            </div>
            <div className="mt-5">
              <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">기타사항</div>
              <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                {listing.notes ?? "-"}
              </p>
            </div>
          </div>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="border border-line bg-white p-5 shadow-[0_18px_60px_rgba(16,70,50,0.06)]">
            <h2 className="text-xl font-extrabold tracking-tight">연락처</h2>
            {detail.contact ? (
              <dl className="mt-4 space-y-3 text-sm">
                <div>
                  <dt className="text-xs text-slate-500">담당자</dt>
                  <dd>{detail.contact.contact_name ?? "-"}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">회사명</dt>
                  <dd>{detail.contact.company_name ?? "-"}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">전화</dt>
                  <dd>{detail.contact.phone ?? "-"}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">이메일</dt>
                  <dd>{detail.contact.contact_email ?? "-"}</dd>
                </div>
              </dl>
            ) : (
              <div className="mt-4 space-y-3">
                <p className="text-sm text-slate-600">로그인 후 연락처를 볼 수 있습니다.</p>
                <Link
                  href={`/login?next=/listings/${listing.id}`}
                  className="inline-block rounded-sm bg-accent-strong px-4 py-2 text-sm font-bold text-white hover:bg-accent"
                >
                  로그인
                </Link>
              </div>
            )}
          </div>

          <div className="border border-line bg-white p-5">
            <h2 className="text-xl font-extrabold tracking-tight">서류</h2>
            <div className="mt-4 space-y-2 text-sm">
              {(listing.listing_docs ?? []).length > 0 ? (
                listing.listing_docs?.map((doc) =>
                  doc.signed_url ? (
                    <a
                      key={doc.id}
                      href={doc.signed_url}
                      className="block rounded-sm border border-line px-3 py-2 font-bold hover:bg-surface-muted"
                    >
                      {doc.doc_type.toUpperCase()} 다운로드
                    </a>
                  ) : (
                    <div key={doc.id} className="rounded-sm bg-slate-50 px-3 py-2 text-slate-500">
                      {doc.doc_type.toUpperCase()} · 로그인 후 다운로드
                    </div>
                  ),
                )
              ) : (
                <p className="text-slate-500">첨부 서류가 없습니다.</p>
              )}
            </div>
          </div>

          {detail.user ? (
            <form action="/api/bookmarks" method="post" className="border border-line bg-white p-5">
              <input type="hidden" name="listing_id" value={listing.id} />
              <button className="w-full rounded-sm border border-accent-strong px-4 py-2 text-sm font-bold text-accent-strong hover:bg-accent-soft">
                찜 토글
              </button>
            </form>
          ) : null}

          {ownerCanEdit ? (
            <div className="border border-line bg-white p-5">
              <h2 className="text-xl font-extrabold tracking-tight">소유자 작업</h2>
              <div className="mt-4 grid gap-2">
                {["available", "reserved", "completed"].map((status) => (
                  <form key={status} action={`/api/listings/${listing.id}`} method="post">
                    <input type="hidden" name="intent" value="status" />
                    <input type="hidden" name="status" value={status} />
                    <button className="w-full rounded-sm border border-line px-3 py-2 text-sm font-bold hover:bg-surface-muted">
                      {statusLabel(status)}로 변경
                    </button>
                  </form>
                ))}
                <form action={`/api/listings/${listing.id}`} method="post">
                  <input type="hidden" name="intent" value="delete" />
                  <button className="w-full rounded-sm border border-red-300 px-3 py-2 text-sm font-bold text-red-700 hover:bg-red-50">
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
