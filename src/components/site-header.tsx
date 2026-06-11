import Link from "next/link";
import { featureGate } from "@/lib/featureGate";
import { getCurrentUser } from "@/lib/queries";

export async function SiteHeader() {
  const user = await getCurrentUser();
  const tier = user?.membership_tier ?? "free";

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-sm bg-accent-strong text-sm font-extrabold text-white">
            R
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-xl font-extrabold tracking-tight text-accent-strong">ReCos</span>
            <span className="mt-1 hidden text-[11px] font-semibold text-slate-500 sm:block">
              Raw material circulation
            </span>
          </span>
        </Link>
        <nav className="flex flex-wrap items-center justify-end gap-1 text-sm font-semibold text-slate-700">
          <Link className="rounded-sm px-3 py-2 hover:bg-surface-muted" href="/listings">
            원료검색
          </Link>
          {featureGate(tier, "create_listing") ? (
            <Link className="rounded-sm px-3 py-2 hover:bg-surface-muted" href="/listings/new">
              원료등록
            </Link>
          ) : null}
          {user ? (
            <>
              <Link className="rounded-sm px-3 py-2 hover:bg-surface-muted" href="/mypage">
                마이페이지
              </Link>
              <form action="/auth/signout" method="post">
                <button className="rounded-sm border border-line px-3 py-2 hover:bg-surface-muted">
                  로그아웃
                </button>
              </form>
            </>
          ) : (
            <>
              <Link className="rounded-sm px-3 py-2 hover:bg-surface-muted" href="/login">
                로그인
              </Link>
              <Link
                className="rounded-sm bg-accent-strong px-3 py-2 text-white hover:bg-accent"
                href="/signup"
              >
                회원가입
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
