import Link from "next/link";

type SectionHeadProps = {
  label: string;
  title: string;
  href?: string;
  linkText?: string;
};

export function SectionHead({ label, title, href, linkText }: SectionHeadProps) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <p className="font-lat text-xs uppercase tracking-[0.2em] text-sub">{label}</p>
        <h2 className="mt-2 text-2xl font-medium tracking-tight text-ink sm:text-[28px]">{title}</h2>
      </div>
      {href ? (
        <Link href={href} className="shrink-0 text-sm font-semibold text-sub hover:text-ink">
          {linkText ?? "더 보기"} →
        </Link>
      ) : null}
    </div>
  );
}
