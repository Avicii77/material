import Link from "next/link";
import { ListingTable } from "@/components/listing-table";
import { StatusBanner } from "@/components/status-banner";
import { getHomeListings } from "@/lib/queries";

export const dynamic = "force-dynamic";

const marketplaceSteps = [
  {
    label: "등록",
    title: "남는 원료를 품질 정보와 함께 올립니다.",
    body: "원료명, INCI, CAS-NO, 제조원, 공급처, 유효기한, 사진과 서류 보유 여부를 한 번에 정리합니다.",
  },
  {
    label: "검색",
    title: "COOS 분류와 서류 조건으로 좁힙니다.",
    body: "종류, 기능, 인증서, 수량, 가격, 지역, 보관 상태까지 거래 판단에 필요한 조건으로 필터링합니다.",
  },
  {
    label: "연락",
    title: "로그인 후 연락처를 열람해 직접 거래합니다.",
    body: "ReCos는 결제나 정산을 중개하지 않습니다. 품질 확인과 거래 조건은 당사자 간 직접 확인합니다.",
  },
];

const heroStats = [
  ["18종", "COOS 종류 분류"],
  ["21개", "기능 필터"],
  ["10열", "원본형 원료 표"],
];

export default async function Home() {
  const listings = await getHomeListings();

  return (
    <main>
      <section className="border-b border-line bg-[#f8fbf6]">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_440px] lg:px-8 lg:py-14">
          <div className="flex flex-col justify-between gap-10">
            <div className="max-w-3xl">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">
                Cosmetic raw material circular market
              </p>
              <h1 className="mt-5 max-w-4xl text-4xl font-extrabold leading-[1.12] tracking-tight text-accent-strong sm:text-5xl lg:text-6xl">
                소량구매 · 마감임박원료판매 · 긴급원료요청
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
                ReCos는 화장품 제조사, 연구소, 소규모 브랜드가 잉여 원료와 필요한 원료를
                직접 찾고 연락할 수 있게 만드는 원료 매칭 플랫폼입니다.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {heroStats.map(([value, label]) => (
                <div key={label} className="border-l border-line pl-4">
                  <div className="text-2xl font-extrabold text-accent-strong">{value}</div>
                  <div className="mt-1 text-sm font-medium text-slate-500">{label}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/listings"
                className="inline-flex items-center justify-center rounded-sm bg-accent-strong px-5 py-3 text-sm font-bold text-white hover:bg-accent"
              >
                원료 검색하기
              </Link>
              <Link
                href="/listings/new"
                className="inline-flex items-center justify-center rounded-sm border border-accent-strong px-5 py-3 text-sm font-bold text-accent-strong hover:bg-accent-soft"
              >
                원료 등록하기
              </Link>
            </div>
          </div>

          <div className="relative min-h-[420px] border border-line bg-white p-4 shadow-[0_24px_80px_rgba(16,70,50,0.10)]">
            <div className="absolute left-4 top-4 h-16 w-16 border-l border-t border-accent" />
            <div className="absolute bottom-4 right-4 h-16 w-16 border-b border-r border-accent" />
            <div className="relative flex h-full flex-col justify-between bg-[linear-gradient(135deg,#ffffff_0%,#eef4ec_100%)] p-5">
              <div className="flex items-start justify-between gap-4 border-b border-line pb-5">
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
                    Inspection sheet
                  </div>
                  <div className="mt-3 text-3xl font-extrabold text-accent-strong">
                    Niacinamide
                  </div>
                  <div className="mt-1 text-sm text-slate-500">CAS 98-92-0 · 미개봉 · 냉장</div>
                </div>
                <div className="rounded-sm bg-accent-soft px-3 py-2 text-sm font-bold text-accent-strong">
                  가능
                </div>
              </div>

              <div className="grid gap-3 py-6">
                {[
                  ["수량", "25 kg"],
                  ["유효기한", "2026.11까지"],
                  ["서류", "MSDS · COA"],
                  ["공급처/제조원", "Global Raw / Seoul Lab"],
                ].map(([label, value]) => (
                  <div key={label} className="grid grid-cols-[96px_1fr] border-b border-line/70 pb-3 text-sm">
                    <span className="font-semibold text-slate-500">{label}</span>
                    <span className="font-bold text-slate-900">{value}</span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold text-accent-strong">
                <div className="border border-line bg-white px-2 py-3">INCI</div>
                <div className="border border-line bg-white px-2 py-3">CAS</div>
                <div className="border border-line bg-white px-2 py-3">COOS</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-4 px-4 py-8 sm:px-6 md:grid-cols-3 lg:px-8">
        <Link
          href="/listings/new"
          className="group border border-line bg-white p-5 hover:border-accent"
        >
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-accent">Sell</div>
          <div className="mt-4 text-xl font-extrabold text-slate-950">원료등록</div>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            사진, 서류, 제조원, 공급처, 보관 상태까지 거래 판단 정보를 갖춰 등록합니다.
          </p>
          <div className="mt-5 text-sm font-bold text-accent-strong group-hover:underline">
            등록 화면으로 이동
          </div>
        </Link>
        <Link href="/listings" className="group border border-line bg-white p-5 hover:border-accent">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-accent">Find</div>
          <div className="mt-4 text-xl font-extrabold text-slate-950">원료검색</div>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            종류, 기능, 인증서, 유효기한, 수량, 가격, 지역을 조합해 필요한 원료만 찾습니다.
          </p>
          <div className="mt-5 text-sm font-bold text-accent-strong group-hover:underline">
            검색 화면으로 이동
          </div>
        </Link>
        <Link href="/mypage" className="group border border-line bg-white p-5 hover:border-accent">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-accent">Manage</div>
          <div className="mt-4 text-xl font-extrabold text-slate-950">마이페이지</div>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            내 등록물, 찜, 최근 본 원료와 연락처 프로필을 한 곳에서 관리합니다.
          </p>
          <div className="mt-5 text-sm font-bold text-accent-strong group-hover:underline">
            내 정보 관리
          </div>
        </Link>
      </section>

      <section className="border-y border-line bg-white">
        <div className="mx-auto grid w-full max-w-7xl gap-0 px-4 py-8 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
          <div className="border-line pb-6 lg:border-r lg:pb-0 lg:pr-8">
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-950">이용 안내</h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600">
              ReCos는 원료를 보유한 판매자와 필요한 구매자가 직접 연락하는 매칭 서비스입니다.
              사이트 내 결제, 정산, 물류 중개 없이 원료 정보와 연락 경로를 명확히 정리합니다.
            </p>
            <Link className="mt-5 inline-flex text-sm font-bold text-accent-strong underline" href="/terms">
              약관·면책 확인
            </Link>
          </div>
          <div className="grid gap-4 pt-6 lg:pl-8 lg:pt-0">
            {marketplaceSteps.map((step) => (
              <div key={step.label} className="grid gap-3 border-b border-line pb-4 last:border-b-0 last:pb-0 sm:grid-cols-[72px_1fr]">
                <div className="text-sm font-extrabold text-accent">{step.label}</div>
                <div>
                  <h3 className="font-bold text-slate-950">{step.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl space-y-4 px-4 py-9 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-accent">Recent lots</p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950">
              최근 등록 원료
            </h2>
            <p className="mt-1 text-sm text-slate-500">임박순 기준 최대 20개를 표시합니다.</p>
          </div>
          <Link
            href="/listings"
            className="inline-flex items-center justify-center rounded-sm bg-accent-strong px-4 py-2.5 text-sm font-bold text-white hover:bg-accent"
          >
            더 많은 원료 검색하기
          </Link>
        </div>
        {listings.configMissing ? (
          <StatusBanner>Supabase 환경변수 설정 전이라 등록 데이터가 비어 있습니다.</StatusBanner>
        ) : null}
        {listings.error ? <StatusBanner type="error">{listings.error}</StatusBanner> : null}
        <ListingTable listings={listings.listings} />
      </section>
    </main>
  );
}
