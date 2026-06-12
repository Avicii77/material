import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-bg">
      <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-3 px-5 py-8 text-[12.5px] text-sub sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <span>© {new Date().getFullYear()} ReCos · 화장품 원료 순환 마켓</span>
        <div className="flex flex-wrap gap-x-5 gap-y-2 font-semibold">
          <Link className="hover:text-ink" href="/terms">
            이용약관
          </Link>
          <Link className="hover:text-ink" href="/terms">
            면책 고지
          </Link>
          <Link className="hover:text-ink" href="/feedback">
            문의 / 피드백
          </Link>
        </div>
      </div>
    </footer>
  );
}
