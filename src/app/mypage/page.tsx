import { redirect } from "next/navigation";
import { LotList } from "@/components/lot-list";
import { StatusBanner } from "@/components/status-banner";
import { getMyPageData, type SearchParams } from "@/lib/queries";
import { buildLotViews } from "@/lib/listing-view";

export const dynamic = "force-dynamic";

type MyPageProps = {
  searchParams?: Promise<SearchParams>;
};

export default async function MyPage({ searchParams }: MyPageProps) {
  const data = await getMyPageData();
  if (!data.user) {
    redirect("/login?next=/mypage");
  }

  const [myLots, bookmarkLots, recentLots] = await Promise.all([
    buildLotViews(data.listings),
    buildLotViews(data.bookmarks),
    buildLotViews(data.recentViews),
  ]);

  const params = (await searchParams) ?? {};
  const message = Array.isArray(params.message) ? params.message[0] : params.message;
  const error = Array.isArray(params.error) ? params.error[0] : params.error;

  return (
    <main className="mx-auto w-full max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <div className="pb-6">
        <p className="font-lat text-xs uppercase tracking-[0.2em] text-sub">Account workspace</p>
        <h1 className="mt-2 text-3xl font-medium tracking-tight text-ink">마이페이지</h1>
        <p className="mt-2 text-sm text-sub">내 등록물, 찜, 최근 본 원료, 프로필을 관리합니다.</p>
      </div>
      {message ? <StatusBanner type="success">{message}</StatusBanner> : null}
      {error ? <StatusBanner type="error">{error}</StatusBanner> : null}
      {data.configMissing ? (
        <StatusBanner>Supabase 환경변수 설정 전이라 마이페이지 데이터를 불러올 수 없습니다.</StatusBanner>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-ink">내 등록물</h2>
        <LotList items={myLots} loggedIn emptyText="등록한 원료가 없습니다." />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-ink">찜</h2>
        <LotList items={bookmarkLots} loggedIn emptyText="찜한 원료가 없습니다." />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-ink">최근 본 원료</h2>
        <LotList items={recentLots} loggedIn emptyText="최근 본 원료가 없습니다." />
      </section>

      <section className="rounded-2xl border border-line bg-white p-6">
        <h2 className="text-xl font-semibold tracking-tight text-ink">프로필 수정</h2>
        <p className="mt-1 text-sm text-sub">
          상세 페이지의 연락처 블록에 노출되는 정보입니다. 로그인 사용자에게만 표시됩니다.
        </p>
        <form action="/api/profile" method="post" className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">표시명</span>
            <input
              name="display_name"
              defaultValue={data.profile?.display_name ?? ""}
              className="rounded-lg border border-line px-3.5 py-2.5 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">담당자 이름</span>
            <input
              name="contact_name"
              defaultValue={data.profile?.contact_name ?? ""}
              className="rounded-lg border border-line px-3.5 py-2.5 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">회사명</span>
            <input
              name="company_name"
              defaultValue={data.profile?.company_name ?? ""}
              className="rounded-lg border border-line px-3.5 py-2.5 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">전화</span>
            <input
              name="phone"
              defaultValue={data.profile?.phone ?? ""}
              className="rounded-lg border border-line px-3.5 py-2.5 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">연락 이메일</span>
            <input
              type="email"
              name="contact_email"
              defaultValue={data.profile?.contact_email ?? ""}
              className="rounded-lg border border-line px-3.5 py-2.5 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">지역</span>
            <input
              name="region"
              defaultValue={data.profile?.region ?? ""}
              className="rounded-lg border border-line px-3.5 py-2.5 text-sm"
            />
          </label>
          <div className="md:col-span-2">
            <button className="rounded-lg bg-ink px-6 py-3 text-sm font-semibold text-white hover:opacity-90">
              프로필 저장
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
