import { redirect } from "next/navigation";
import { ListingTable } from "@/components/listing-table";
import { StatusBanner } from "@/components/status-banner";
import { getMyPageData, type SearchParams } from "@/lib/queries";

export const dynamic = "force-dynamic";

type MyPageProps = {
  searchParams?: Promise<SearchParams>;
};

export default async function MyPage({ searchParams }: MyPageProps) {
  const data = await getMyPageData();
  if (!data.user) {
    redirect("/login?next=/mypage");
  }

  const params = (await searchParams) ?? {};
  const message = Array.isArray(params.message) ? params.message[0] : params.message;
  const error = Array.isArray(params.error) ? params.error[0] : params.error;

  return (
    <main className="mx-auto w-full max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <div className="border-b border-line pb-5">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-accent">Account workspace</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">마이페이지</h1>
        <p className="mt-2 text-sm text-slate-500">내 등록물, 찜, 최근 본 원료, 프로필을 관리합니다.</p>
      </div>
      {message ? <StatusBanner type="success">{message}</StatusBanner> : null}
      {error ? <StatusBanner type="error">{error}</StatusBanner> : null}
      {data.configMissing ? (
        <StatusBanner>Supabase 환경변수 설정 전이라 마이페이지 데이터를 불러올 수 없습니다.</StatusBanner>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-xl font-extrabold tracking-tight">내 등록물</h2>
        <ListingTable listings={data.listings} emptyText="등록한 원료가 없습니다." />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-extrabold tracking-tight">찜</h2>
        <ListingTable listings={data.bookmarks} emptyText="찜한 원료가 없습니다." />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-extrabold tracking-tight">최근 본 원료</h2>
        <ListingTable listings={data.recentViews} emptyText="최근 본 원료가 없습니다." />
      </section>

      <section className="border border-line bg-white p-5 shadow-[0_18px_60px_rgba(16,70,50,0.05)]">
        <h2 className="text-xl font-extrabold tracking-tight">프로필 수정</h2>
        <p className="mt-1 text-sm text-slate-500">
          상세 페이지의 연락처 블록에 노출되는 정보입니다. 로그인 사용자에게만 표시됩니다.
        </p>
        <form action="/api/profile" method="post" className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">표시명</span>
            <input
              name="display_name"
              defaultValue={data.profile?.display_name ?? ""}
              className="rounded-md border border-slate-300 px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">담당자 이름</span>
            <input
              name="contact_name"
              defaultValue={data.profile?.contact_name ?? ""}
              className="rounded-md border border-slate-300 px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">회사명</span>
            <input
              name="company_name"
              defaultValue={data.profile?.company_name ?? ""}
              className="rounded-md border border-slate-300 px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">전화</span>
            <input
              name="phone"
              defaultValue={data.profile?.phone ?? ""}
              className="rounded-md border border-slate-300 px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">연락 이메일</span>
            <input
              type="email"
              name="contact_email"
              defaultValue={data.profile?.contact_email ?? ""}
              className="rounded-md border border-slate-300 px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">지역</span>
            <input
              name="region"
              defaultValue={data.profile?.region ?? ""}
              className="rounded-md border border-slate-300 px-3 py-2"
            />
          </label>
          <div className="md:col-span-2">
            <button className="rounded-sm bg-accent-strong px-5 py-2.5 text-sm font-bold text-white hover:bg-accent">
              프로필 저장
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
