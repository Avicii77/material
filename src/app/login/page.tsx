import Link from "next/link";
import { signInWithEmail, signInWithGoogle } from "@/app/login/actions";
import { StatusBanner } from "@/components/status-banner";
import type { SearchParams } from "@/lib/queries";

export const dynamic = "force-dynamic";

type LoginPageProps = {
  searchParams?: Promise<SearchParams>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = (await searchParams) ?? {};
  const error = Array.isArray(params.error) ? params.error[0] : params.error;
  const message = Array.isArray(params.message) ? params.message[0] : params.message;
  const next = Array.isArray(params.next) ? params.next[0] : params.next;

  return (
    <main className="mx-auto grid w-full max-w-5xl gap-6 px-4 py-10 sm:px-6 md:grid-cols-[1fr_380px] lg:px-8">
      <section className="space-y-5">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-accent">Member access</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">로그인</h1>
          <p className="mt-2 text-sm text-slate-500">로그인하면 연락처 열람, 찜, 등록이 가능합니다.</p>
        </div>
        {error ? <StatusBanner type="error">{error}</StatusBanner> : null}
        {message ? <StatusBanner type="success">{message}</StatusBanner> : null}
        <form action={signInWithEmail} className="space-y-4 border border-line bg-white p-5">
          <input type="hidden" name="next" value={next ?? "/mypage"} />
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-bold">이메일</span>
            <input
              type="email"
              name="email"
              required
              className="rounded-sm border border-line px-3 py-2.5"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-bold">비밀번호</span>
            <input
              type="password"
              name="password"
              required
              className="rounded-sm border border-line px-3 py-2.5"
            />
          </label>
          <button className="w-full rounded-sm bg-accent-strong px-4 py-2.5 text-sm font-bold text-white hover:bg-accent">
            이메일 로그인
          </button>
        </form>
        <form action={signInWithGoogle}>
          <input type="hidden" name="next" value={next ?? "/mypage"} />
          <button className="w-full rounded-sm border border-line bg-white px-4 py-2.5 text-sm font-bold hover:bg-surface-muted">
            Google로 로그인
          </button>
        </form>
        <p className="text-center text-sm text-slate-600">
          계정이 없나요?{" "}
          <Link href="/signup" className="font-bold text-accent-strong underline">
            회원가입
          </Link>
        </p>
      </section>

      <aside className="border border-line bg-white p-5">
        <h2 className="text-xl font-extrabold tracking-tight">로그인이 필요한 이유</h2>
        <div className="mt-5 space-y-4 text-sm leading-6 text-slate-600">
          <p>연락처는 거래 의사가 있는 사용자에게만 노출됩니다.</p>
          <p>찜과 최근 본 원료 기록으로 같은 원료를 다시 빠르게 찾을 수 있습니다.</p>
          <p>판매자는 내 등록물의 가능, 예약, 완료 상태를 직접 관리합니다.</p>
        </div>
      </aside>
    </main>
  );
}
