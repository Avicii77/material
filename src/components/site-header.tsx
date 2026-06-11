import Link from "next/link";
import { featureGate } from "@/lib/featureGate";
import { getCurrentUser } from "@/lib/queries";

export async function SiteHeader() {
  const user = await getCurrentUser();
  const tier = user?.membership_tier ?? "free";

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/92 backdrop-blur-xl">
      <div className="mx-auto flex h-[88px] w-full max-w-[1180px] items-center justify-between gap-5 px-5 sm:px-8">
        <Link href="/" className="font-lat text-2xl font-bold tracking-tight text-brand">
          ReCos
        </Link>
        <nav className="hidden items-center gap-9 text-base font-semibold text-ink md:flex">
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
        <div className="hidden items-center gap-3 text-[15px] font-semibold sm:flex">
          {user ? (
            <form action="/auth/signout" method="post">
              <button className="rounded-[9px] border border-line bg-card px-5 py-3 text-ink hover:bg-surface">
                로그아웃
              </button>
            </form>
          ) : (
            <>
              <Link className="rounded-[9px] border border-line bg-card px-5 py-3 text-ink hover:bg-surface" href="/login">
                로그인
              </Link>
              <a className="rounded-[9px] bg-accent px-5 py-3 text-white transition hover:opacity-90 active:scale-95" href="/#early-access">
                회원가입
              </a>
            </>
          )}
        </div>
        <details className="relative sm:hidden">
          <summary className="cursor-pointer list-none rounded-[9px] border border-line bg-card px-4 py-2 text-sm font-semibold text-ink">
            메뉴
          </summary>
          <div className="absolute right-0 top-12 w-56 rounded-2xl border border-line bg-card p-3 shadow-[0_18px_60px_rgb(20_23_26_/_0.12)]">
            <Link className="block rounded-xl px-3 py-2 text-sm font-semibold text-ink hover:bg-surface" href="/listings">
              원료 검색
            </Link>
            {featureGate(tier, "create_listing") ? (
              <Link className="block rounded-xl px-3 py-2 text-sm font-semibold text-ink hover:bg-surface" href="/listings/new">
                원료 등록
              </Link>
            ) : null}
            <Link className="block rounded-xl px-3 py-2 text-sm font-semibold text-ink hover:bg-surface" href="/terms">
              이용 안내
            </Link>
            {user ? (
              <Link className="block rounded-xl px-3 py-2 text-sm font-semibold text-ink hover:bg-surface" href="/mypage">
                마이페이지
              </Link>
            ) : (
              <>
                <Link className="block rounded-xl px-3 py-2 text-sm font-semibold text-ink hover:bg-surface" href="/login">
                  로그인
                </Link>
                <a className="mt-2 block rounded-[9px] bg-accent px-3 py-2 text-center text-sm font-semibold text-white" href="/#early-access">
                  회원가입
                </a>
              </>
            )}
          </div>
        </details>
      </div>
    </header>
  );
}
