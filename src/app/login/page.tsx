import { startWithEmail } from "@/app/login/actions";
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
          <p className="font-lat text-xs uppercase tracking-[0.2em] text-sub">Member access</p>
          <h1 className="mt-2 text-3xl font-medium tracking-tight text-ink">로그인</h1>
          <p className="mt-2 text-sm text-sub">이메일만 입력하면 비밀번호 없이 바로 로그인됩니다.</p>
        </div>
        {error ? <StatusBanner type="error">{error}</StatusBanner> : null}
        {message ? <StatusBanner type="success">{message}</StatusBanner> : null}
        <form action={startWithEmail} className="space-y-4 rounded-2xl border border-line bg-card p-6">
          <input type="hidden" name="next" value={next ?? "/listings"} />
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-semibold text-ink">이메일</span>
            <input
              type="email"
              name="email"
              required
              className="rounded-lg border border-line px-3.5 py-2.5 text-sm focus:border-accent"
            />
          </label>
          <button className="w-full rounded-full bg-accent px-4 py-2.5 text-sm font-bold text-white transition hover:opacity-90 active:scale-95">
            이메일로 바로 시작
          </button>
        </form>
      </section>

      <aside className="rounded-2xl border border-line bg-card p-6">
        <h2 className="text-xl font-semibold tracking-tight text-ink">로그인이 필요한 이유</h2>
        <div className="mt-5 space-y-4 text-sm leading-6 text-sub">
          <p>연락처는 거래 의사가 있는 사용자에게만 노출됩니다.</p>
          <p>찜과 최근 본 원료 기록으로 같은 원료를 다시 빠르게 찾을 수 있습니다.</p>
          <p>판매자는 내 등록물의 가능, 예약, 완료 상태를 직접 관리합니다.</p>
        </div>
      </aside>
    </main>
  );
}
