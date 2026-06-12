import { startWithEmail } from "@/app/login/actions";
import { StatusBanner } from "@/components/status-banner";
import type { SearchParams } from "@/lib/queries";

export const dynamic = "force-dynamic";

type SignupPageProps = {
  searchParams?: Promise<SearchParams>;
};

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const params = (await searchParams) ?? {};
  const error = Array.isArray(params.error) ? params.error[0] : params.error;

  return (
    <main className="mx-auto w-full max-w-md space-y-5 px-4 py-10">
      <div>
        <p className="font-lat text-xs uppercase tracking-[0.2em] text-sub">Create account</p>
        <h1 className="mt-2 text-3xl font-medium tracking-tight text-ink">회원가입</h1>
        <p className="mt-2 text-sm text-sub">
          이메일만 입력하면 비밀번호 없이 바로 시작할 수 있어요. 둘러보기는 자유, 판매자 연락처는 마이페이지에서 프로필을 완성하면 열람됩니다.
        </p>
      </div>
      {error ? <StatusBanner type="error">{error}</StatusBanner> : null}
      <p className="text-center text-xs font-semibold text-accent">✉️ 비밀번호·인증 없이 이메일만으로 시작</p>
      <form action={startWithEmail} className="space-y-4 rounded-2xl border border-line bg-card p-6">
        <input type="hidden" name="next" value="/listings" />
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-semibold text-ink">이메일</span>
          <input
            type="email"
            name="email"
            required
            placeholder="name@company.com"
            className="rounded-lg border border-line px-3.5 py-2.5 text-sm focus:border-accent"
          />
        </label>
        <button className="w-full rounded-full bg-accent px-4 py-2.5 text-sm font-bold text-white transition hover:opacity-90 active:scale-95">
          이메일로 바로 시작
        </button>
      </form>
    </main>
  );
}
