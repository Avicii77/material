import Link from "next/link";
import { featureGate } from "@/lib/featureGate";
import { getCurrentUser } from "@/lib/queries";

export async function SiteHeader() {
  const user = await getCurrentUser();
  const tier = user?.membership_tier ?? "free";

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur">
      <div className="mx-auto flex h-[88px] w-full max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="font-lat text-2xl font-bold tracking-tight text-brand">
          ReCos
        </Link>
        <nav className="hidden items-center gap-9 text-[16px] font-semibold text-[#2a2e33] md:flex">
          <Link className="border-b-2 border-transparent py-1 hover:border-ink" href="/listings">
            원료 검색
          </Link>
          {featureGate(tier, "create_listing") ? (
            <Link className="border-b-2 border-transparent py-1 hover:border-ink" href="/listings/new">
              원료 등록
            </Link>
          ) : null}
          <Link className="border-b-2 border-transparent py-1 hover:border-ink" href="/terms">
            이용 안내
          </Link>
          {user ? (
            <Link className="border-b-2 border-transparent py-1 hover:border-ink" href="/mypage">
              마이페이지
            </Link>
          ) : null}
        </nav>
        <div className="flex items-center gap-3 text-[15px] font-semibold">
          {user ? (
            <form action="/auth/signout" method="post">
              <button className="rounded-full border border-line px-5 py-3 text-ink hover:bg-surface">
                로그아웃
              </button>
            </form>
          ) : (
            <>
              <Link className="rounded-full border border-line px-5 py-3 text-ink hover:bg-surface" href="/login">
                로그인
              </Link>
              <Link className="rounded-full bg-accent px-5 py-3 text-white transition hover:opacity-90 active:scale-95" href="/signup">
                회원가입
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
