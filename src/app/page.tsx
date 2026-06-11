import Link from "next/link";
import { EarlyAccessForm } from "@/components/early-access-form";
import { ScrollReveal } from "@/components/scroll-reveal";
import { SectionHead } from "@/components/section-head";
import { StatusBanner } from "@/components/status-banner";
import { getHomeListings } from "@/lib/queries";
import { buildLotViews, type LotView } from "@/lib/listing-view";

export const dynamic = "force-dynamic";

type PreviewLot = Pick<
  LotView,
  | "id"
  | "title"
  | "casNo"
  | "supplier"
  | "quantity"
  | "unit"
  | "expiryLabel"
  | "imminent"
  | "priceLabel"
  | "imageUrls"
  | "hasMsds"
  | "hasCoa"
  | "storageText"
>;

const sampleLots: PreviewLot[] = [
  {
    id: "sample-niacinamide",
    title: "Niacinamide",
    casNo: "98-92-0",
    supplier: "Seoul Lab",
    quantity: 25,
    unit: "kg",
    expiryLabel: "2026.09",
    imminent: true,
    priceLabel: "₩8,000 / kg",
    imageUrls: [],
    hasMsds: true,
    hasCoa: true,
    storageText: "차광 보관",
  },
  {
    id: "sample-tocopherol",
    title: "Tocopherol",
    casNo: "59-02-9",
    supplier: "Daehan",
    quantity: 5,
    unit: "kg",
    expiryLabel: "2026.07",
    imminent: true,
    priceLabel: "협의",
    imageUrls: [],
    hasMsds: true,
    hasCoa: false,
    storageText: "상온 보관",
  },
  {
    id: "sample-centella",
    title: "Centella Asiatica Extract",
    casNo: "84696-21-9",
    supplier: "BioPure",
    quantity: 12,
    unit: "kg",
    expiryLabel: "2027.01",
    imminent: false,
    priceLabel: "₩20,000 / kg",
    imageUrls: [],
    hasMsds: true,
    hasCoa: true,
    storageText: "냉장 보관",
  },
  {
    id: "sample-retinol",
    title: "Retinol 10%",
    casNo: "68-26-8",
    supplier: "BioPure",
    quantity: 1,
    unit: "kg",
    expiryLabel: "2026.12",
    imminent: false,
    priceLabel: "₩90,000 / kg",
    imageUrls: [],
    hasMsds: true,
    hasCoa: true,
    storageText: "차광 보관",
  },
];

function MaterialImage({ item, featured = false }: { item: PreviewLot; featured?: boolean }) {
  const src = item.imageUrls[0] ?? "/recos-material-hero.png";

  return (
    <div className={`relative overflow-hidden bg-[linear-gradient(135deg,#eef1f3,#dfe4e8)] ${featured ? "h-[230px]" : "size-[46px] rounded-[10px]"}`}>
      <img src={src} alt="" className="size-full object-cover" />
      {featured && item.imminent ? (
        <span className="absolute left-4 top-4 rounded-full bg-signal px-3 py-1.5 text-[11px] font-semibold tracking-wide text-white">
          마감임박
        </span>
      ) : null}
    </div>
  );
}

function FeaturedMaterial({ item }: { item: PreviewLot }) {
  const docs = [item.hasMsds && "MSDS", item.hasCoa && "COA"].filter(Boolean).join(" · ") || "확인 필요";

  return (
    <Link href={item.id.startsWith("sample-") ? "/listings" : `/listings/${item.id}`} className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-card transition hover:-translate-y-0.5 hover:border-ink/25">
      <MaterialImage item={item} featured />
      <div className="p-6">
        <div className="flex items-start justify-between gap-5">
          <div>
            <h3 className="text-[22px] font-semibold tracking-tight text-ink">{item.title}</h3>
            <p className="mt-1 text-sm text-sub">CAS {item.casNo} · {item.supplier}</p>
          </div>
          <div className="shrink-0 text-right font-lat text-xl font-semibold text-ink">
            {item.priceLabel}
          </div>
        </div>
        <dl className="mt-6 grid grid-cols-2 gap-0 border-t border-line-soft pt-5 sm:grid-cols-4">
          {[
            ["수량", `${item.quantity} ${item.unit}`, false],
            ["유효기한", item.expiryLabel, item.imminent],
            ["서류", docs, false],
            ["보관", item.storageText, false],
          ].map(([label, value, signal]) => (
            <div key={String(label)} className="border-line-soft pl-4 first:border-l-0 first:pl-0 sm:border-l">
              <dt className="text-[10.5px] uppercase tracking-[0.08em] text-sub">{label}</dt>
              <dd className={`mt-1.5 text-sm font-semibold ${signal ? "text-signal" : "text-ink"}`}>{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Link>
  );
}

function CompactMaterialRow({ item }: { item: PreviewLot }) {
  return (
    <Link href={item.id.startsWith("sample-") ? "/listings" : `/listings/${item.id}`} className="flex items-center gap-3 border-b border-line-soft py-4 last:border-b-0">
      <MaterialImage item={item} />
      <div className="min-w-0">
        <div className="truncate text-[14.5px] font-semibold text-ink">{item.title}</div>
        <div className="mt-1 truncate text-[11.5px] text-sub">
          CAS {item.casNo} · {item.quantity}
          {item.unit} · {item.supplier}
        </div>
      </div>
      <div className="ml-auto shrink-0 text-right">
        <div className="text-sm font-semibold text-ink">{item.priceLabel}</div>
        <div className={`mt-1 text-[11px] ${item.imminent ? "text-signal" : "text-sub"}`}>
          {item.expiryLabel}
        </div>
      </div>
    </Link>
  );
}

export default async function Home() {
  const result = await getHomeListings();
  const realLots = await buildLotViews(result.listings);
  const lots: PreviewLot[] = realLots.length > 0 ? realLots.slice(0, 5) : sampleLots;
  const [featured, ...compactLots] = lots;

  return (
    <main>
      <section className="border-b border-line bg-bg py-16 sm:py-20 lg:py-[84px]">
        <div className="mx-auto w-full max-w-[1180px] px-5 sm:px-8">
          <ScrollReveal>
            <p className="font-lat text-xs uppercase tracking-[0.22em] text-sub">
              Cosmetic raw material · Circular market
            </p>
            <h1 className="mt-6 max-w-4xl text-[38px] font-light leading-[1.18] tracking-tight text-ink sm:text-[54px]">
              소량구매 · 마감임박 원료,
              <br />
              <strong className="font-bold">판매자와 직접 거래</strong>합니다.
            </h1>
            <p className="mt-6 max-w-[520px] text-base leading-7 text-sub">
              마감임박, 잉여, 소량 원료를 필요한 곳에 연결합니다. 원료 순환으로 비용을 줄이고 중간 단계 없이 거래 조건을 확인하세요.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/listings" className="rounded-[9px] bg-ink px-7 py-4 text-center text-sm font-semibold text-white transition hover:opacity-90 active:scale-95">
                원료 검색하기
              </Link>
              <Link href="/listings/new" className="rounded-[9px] border border-line bg-card px-7 py-4 text-center text-sm font-semibold text-ink transition hover:bg-surface active:scale-95">
                원료 등록하기
              </Link>
            </div>
          </ScrollReveal>

          <ScrollReveal className="mt-14">
            <div className="flex flex-wrap gap-x-12 gap-y-6">
              {[
                ["18종", "원료 카테고리"],
                ["21개", "기능 태그"],
                ["10분", "평균 매칭 소요"],
              ].map(([value, label]) => (
                <div key={label}>
                  <div className="font-lat text-[34px] font-semibold tracking-tight text-ink">{value}</div>
                  <div className="mt-1 text-xs tracking-wide text-sub">{label}</div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="bg-bg py-[72px]">
        <div className="mx-auto w-full max-w-[1180px] px-5 sm:px-8">
          <ScrollReveal>
            <SectionHead label="Recent Lots" title="최근 등록 원료" href="/listings" linkText="더 많은 원료 검색하기" />
          </ScrollReveal>
          {result.configMissing ? (
            <div className="mt-5">
              <StatusBanner>Supabase 환경변수 설정 전이라 샘플 원료를 표시하고 있습니다.</StatusBanner>
            </div>
          ) : null}
          {result.error ? (
            <div className="mt-5">
              <StatusBanner type="error">{result.error}</StatusBanner>
            </div>
          ) : null}

          <div className="mt-8 grid gap-5 lg:grid-cols-[1.5fr_1fr]">
            <FeaturedMaterial item={featured} />
            <div className="rounded-2xl border border-line bg-card px-5 py-1">
              {compactLots.map((item) => (
                <CompactMaterialRow key={item.id} item={item} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-card py-16">
        <div className="mx-auto grid w-full max-w-[1180px] gap-8 px-5 sm:px-8 lg:grid-cols-3">
          {[
            ["조건 탐색", "원료명, INCI, CAS-NO, 유효기한, 서류 보유 여부를 한 번에 좁힙니다."],
            ["정보 확인", "실물 사진, 보관 상태, MSDS와 COA 보유 여부를 거래 전에 확인합니다."],
            ["직접 연결", "로그인 후 권한이 확인된 구매자에게 판매자 연락처를 안전하게 공개합니다."],
          ].map(([title, body]) => (
            <ScrollReveal key={title}>
              <article className="border-t border-line pt-5">
                <h2 className="text-xl font-semibold tracking-tight text-ink">{title}</h2>
                <p className="mt-3 text-sm leading-6 text-sub">{body}</p>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <section id="early-access" className="border-t border-line bg-bg py-16 lg:py-20">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <ScrollReveal className="mb-10 text-center">
            <p className="font-lat text-xs font-semibold uppercase tracking-[0.22em] text-sub">Join Beta Launch</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              ReCos 사전 등록하기
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-sub">
              제조사, 브랜드사, 원료 유통사를 위한 베타 오픈 안내와 우선 혜택을 이메일로 보내드립니다.
            </p>
          </ScrollReveal>
          <ScrollReveal>
            <EarlyAccessForm />
          </ScrollReveal>
        </div>
      </section>
    </main>
  );
}
