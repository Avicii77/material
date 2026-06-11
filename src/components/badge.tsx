type BadgeProps = {
  children: React.ReactNode;
  tone?: "neutral" | "signal" | "muted";
};

export function Badge({ children, tone = "neutral" }: BadgeProps) {
  const cls =
    tone === "signal"
      ? "bg-signal text-white"
      : tone === "muted"
        ? "bg-surface text-sub"
        : "bg-[#f1ebe5] text-[#453f3d]";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${cls}`}>
      {children}
    </span>
  );
}
