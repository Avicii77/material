import Link from "next/link";
import { signUpWithEmail } from "@/app/signup/actions";
import { signInWithGoogle } from "@/app/login/actions";
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
        <p className="mt-2 text-sm text-sub">가입 후 마이페이지에서 연락처 프로필을 보완합니다.</p>
      </div>
      {error ? <StatusBanner type="error">{error}</StatusBanner> : null}
      <form action={signInWithGoogle}>
        <input type="hidden" name="next" value="/mypage" />
        <button className="w-full rounded-full border border-line bg-white px-4 py-2.5 text-sm font-bold hover:bg-surface">
          Google로 회원가입
        </button>
      </form>
      <div className="flex items-center gap-3 text-xs text-sub">
        <span className="h-px flex-1 bg-line" />
        또는 이메일로 가입
        <span className="h-px flex-1 bg-line" />
      </div>
      <form action={signUpWithEmail} className="space-y-4 rounded-2xl border border-line bg-card p-6">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-semibold text-ink">이메일</span>
          <input
            type="email"
            name="email"
            required
            className="rounded-lg border border-line px-3.5 py-2.5 text-sm focus:border-accent"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-semibold text-ink">비밀번호</span>
          <input
            type="password"
            name="password"
            required
            minLength={6}
            className="rounded-lg border border-line px-3.5 py-2.5 text-sm focus:border-accent"
          />
        </label>
        <button className="w-full rounded-full bg-accent px-4 py-2.5 text-sm font-bold text-white transition hover:opacity-90 active:scale-95">
          회원가입
        </button>
      </form>
      <p className="text-center text-sm text-sub">
        이미 계정이 있나요?{" "}
        <Link href="/login" className="font-semibold text-ink underline">
          로그인
        </Link>
      </p>
    </main>
  );
}
