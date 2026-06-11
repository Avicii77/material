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
        : "bg-[#d4e9e2] text-[#006241]";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${cls}`}>
      {children}
    </span>
  );
}
