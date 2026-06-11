import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p>© {new Date().getFullYear()} ReCos. 화장품 원료 직접 매칭.</p>
        <div className="flex gap-4 font-semibold">
          <Link className="hover:text-accent-strong" href="/terms">
            약관·면책
          </Link>
          <a className="hover:text-accent-strong" href="mailto:contact@recos.local">
            문의
          </a>
        </div>
      </div>
    </footer>
  );
}
