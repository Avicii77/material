import Link from "next/link";
import { SectionHead } from "@/components/section-head";
import { StatBand } from "@/components/stat-band";
import { LotList } from "@/components/lot-list";
import { StatusBanner } from "@/components/status-banner";
import { getCurrentUser, getHomeListings } from "@/lib/queries";
import { buildLotViews } from "@/lib/listing-view";

export const dynamic = "force-dynamic";

const marketplaceSteps = [
  {
    label: "등록",
    title: "남는 원료를 품질 정보와 함께 올립니다.",
    body: "원료명, INCI, CAS-NO, 제조원, 공급처, 유효기한, 사진과 서류 보유 여부를 한 번에 정리합니다.",
  },
  {
    label: "검색",
    title: "분류와 서류 조건으로 좁힙니다.",
    body: "종류, 기능, 인증서, 수량, 가격, 지역, 보관 상태까지 거래 판단에 필요한 조건으로 필터링합니다.",
  },
  {
    label: "연락",
    title: "로그인 후 연락처를 열람해 직접 거래합니다.",
    body: "ReCos는 결제나 정산을 중개하지 않습니다. 품질 확인과 거래 조건은 당사자 간 직접 확인합니다.",
  },
];

export default async function Home() {
  const [result, user] = await Promise.all([getHomeListings(), getCurrentUser()]);
  const lots = await buildLotViews(result.listings);

  return (
    <main>
      <section className="border-b border-line">
        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <p className="font-lat text-xs uppercase tracking-[0.22em] text-sub">
            Cosmetic Raw Material · Circular Market
          </p>
          <h1 className="mt-4 max-w-4xl text-3xl font-semibold leading-[1.18] tracking-tight text-ink sm:text-4xl">
            소량구매 · 마감임박 원료,{" "}
            <span className="font-bold text-brand">판매자와 직접 거래</span>합니다.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-sub">
            마감임박·잉여·소량 원료를 필요한 곳에 연결합니다. 원료 순환으로 비용을 줄이고, 중간 단계 없이 직접 거래하세요.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/listings" className="rounded-full bg-accent px-7 py-3.5 text-center text-sm font-semibold text-white transition hover:opacity-90 active:scale-95">
              원료 검색하기
            </Link>
            <Link href="/listings/new" className="rounded-full border border-accent px-7 py-3.5 text-center text-sm font-semibold text-accent hover:bg-surface">
              원료 등록하기
            </Link>
          </div>
          <div className="mt-8">
            <StatBand
              stats={[
                { value: "18종", label: "원료 카테고리" },
                { value: "21개", label: "기능 태그" },
                { value: "10일", label: "평균 매칭 소요" },
              ]}
            />
          </div>
        </div>
      </section>

      <section className="border-b border-line">
        <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
          <div className="lg:border-r lg:border-line lg:pr-8">
            <h2 className="text-2xl font-medium tracking-tight text-ink">이용 안내</h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-sub">
              ReCos는 원료를 보유한 판매자와 필요한 구매자가 직접 연락하는 매칭 서비스입니다. 사이트 내 결제·정산·물류 중개 없이 원료 정보와 연락 경로를 명확히 정리합니다.
            </p>
            <Link className="mt-5 inline-flex text-sm font-semibold text-ink underline" href="/terms">
              약관·면책 확인
            </Link>
          </div>
          <div className="grid gap-4 lg:pl-8">
            {marketplaceSteps.map((step) => (
              <div key={step.label} className="grid gap-3 border-b border-line-soft pb-4 last:border-b-0 last:pb-0 sm:grid-cols-[72px_1fr]">
                <div className="font-lat text-sm font-semibold text-sub">{step.label}</div>
                <div>
                  <h3 className="font-semibold text-ink">{step.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-sub">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl space-y-5 px-4 py-10 sm:px-6 lg:px-8">
        <SectionHead label="Recent Lots" title="최근 등록 원료" href="/listings" linkText="더 많은 원료 검색하기" />
        {result.configMissing ? (
          <StatusBanner>Supabase 환경변수 설정 전이라 등록 데이터가 비어 있습니다.</StatusBanner>
        ) : null}
        {result.error ? <StatusBanner type="error">{result.error}</StatusBanner> : null}
        <LotList items={lots} loggedIn={Boolean(user)} emptyText="등록된 원료가 없습니다." />
      </section>
    </main>
  );
}
