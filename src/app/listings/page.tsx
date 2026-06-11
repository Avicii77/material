import Link from "next/link";
import { ListingFilters } from "@/components/listing-filters";
import { ListingTable } from "@/components/listing-table";
import { StatusBanner } from "@/components/status-banner";
import { getListings, type SearchParams } from "@/lib/queries";

export const dynamic = "force-dynamic";

type ListingsPageProps = {
  searchParams?: Promise<SearchParams>;
};

function filterChips(params: SearchParams) {
  const labels: Record<string, string> = {
    q: "키워드",
    type: "종류",
    status: "상태",
    sort: "정렬",
    func: "기능",
    cert: "인증서",
    expiryAfter: "유효기한 시작",
    expiryBefore: "유효기한 종료",
    excludeExpired: "만료 제외",
    opened: "개봉",
    storage: "보관",
    region: "지역",
    qtyMin: "수량 최소",
    qtyMax: "수량 최대",
    priceMin: "가격 최소",
    priceMax: "가격 최대",
    hasMsds: "MSDS",
    hasCoa: "COA",
    negotiableOnly: "협의만",
  };

  return Object.entries(params)
    .filter(([key, value]) => key !== "page" && value && String(value).length > 0)
    .flatMap(([key, value]) =>
      Array.isArray(value)
        ? value.map((item) => `${labels[key] ?? key}: ${item}`)
        : [`${labels[key] ?? key}: ${value === "1" ? "적용" : value}`],
    );
}

function pageHref(params: SearchParams, page: number) {
  const next = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (key === "page" || value === undefined) return;
    if (Array.isArray(value)) {
      value.forEach((item) => next.append(key, item));
    } else if (value) {
      next.set(key, value);
    }
  });
  next.set("page", String(page));
  return `/listings?${next.toString()}`;
}

export default async function ListingsPage({ searchParams }: ListingsPageProps) {
  const params = (await searchParams) ?? {};
  const result = await getListings(params);
  const chips = filterChips(params);
  const totalPages = Math.max(1, Math.ceil(result.count / result.pageSize));

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 border-b border-line pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-accent">Search inventory</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">원료검색</h1>
          <p className="mt-1 text-sm text-slate-500">검색 결과는 원본 형식의 표로만 표시합니다.</p>
        </div>
        <Link
          href="/listings/new"
          className="inline-flex items-center justify-center rounded-sm bg-accent-strong px-4 py-2.5 text-sm font-bold text-white hover:bg-accent"
        >
          원료등록
        </Link>
      </div>

      <ListingFilters searchParams={params} />

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm font-bold text-slate-700">총 {result.count}개 결과</div>
          {chips.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {chips.map((chip) => (
                <span key={chip} className="rounded-full bg-accent-soft px-3 py-1 text-xs font-bold text-accent-strong">
                  {chip}
                </span>
              ))}
            </div>
          ) : null}
        </div>
        {result.configMissing ? (
          <StatusBanner>Supabase 환경변수 설정 전이라 검색 데이터가 비어 있습니다.</StatusBanner>
        ) : null}
        {result.error ? <StatusBanner type="error">{result.error}</StatusBanner> : null}
        <ListingTable
          listings={result.listings}
          page={result.page}
          pageSize={result.pageSize}
          emptyText="검색 조건에 맞는 원료가 없습니다."
        />
        <div className="flex items-center justify-between border-t border-line pt-4 text-sm">
          <Link
            href={pageHref(params, Math.max(1, result.page - 1))}
            className={`rounded-sm border px-3 py-2 font-bold ${
              result.page <= 1 ? "pointer-events-none text-slate-300" : "text-slate-700"
            }`}
          >
            이전
          </Link>
          <span className="text-slate-500">
            {result.page} / {totalPages}
          </span>
          <Link
            href={pageHref(params, Math.min(totalPages, result.page + 1))}
            className={`rounded-sm border px-3 py-2 font-bold ${
              result.page >= totalPages ? "pointer-events-none text-slate-300" : "text-slate-700"
            }`}
          >
            다음
          </Link>
        </div>
      </section>
    </main>
  );
}
