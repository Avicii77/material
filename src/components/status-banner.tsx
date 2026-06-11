type StatusBannerProps = {
  type?: "info" | "error" | "success";
  children: React.ReactNode;
};

export function StatusBanner({ type = "info", children }: StatusBannerProps) {
  const className =
    type === "error"
      ? "border-signal/30 bg-signal/5 text-signal"
      : type === "success"
        ? "border-line bg-surface text-ink"
        : "border-line bg-surface text-sub";

  return (
    <div className={`rounded-xl border px-4 py-3 text-sm font-medium ${className}`}>
      {children}
    </div>
  );
}
