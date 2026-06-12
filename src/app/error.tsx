"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 서버 런타임 로그(Vercel)로 전송됨. 추후 Sentry 등 연동 시 여기서 캡처.
    console.error("App error:", error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-6 text-center">
      <p className="text-[11px] uppercase tracking-[0.14em] text-sub">Something went wrong</p>
      <h1 className="mt-3 text-xl font-semibold text-ink">문제가 발생했어요</h1>
      <p className="mt-2 text-sm text-sub">
        일시적인 오류일 수 있어요. 잠시 후 다시 시도해 주세요.
      </p>
      {error.digest ? (
        <p className="mt-2 text-[11px] text-sub/70">오류 코드: {error.digest}</p>
      ) : null}
      <div className="mt-6 flex gap-3">
        <button
          onClick={reset}
          className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 active:scale-95"
        >
          다시 시도
        </button>
        <a
          href="/"
          className="rounded-full border border-line px-6 py-3 text-sm font-semibold text-ink transition hover:bg-surface active:scale-95"
        >
          홈으로
        </a>
      </div>
    </main>
  );
}
