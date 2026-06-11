type StatusBannerProps = {
  type?: "info" | "error" | "success";
  children: React.ReactNode;
};

export function StatusBanner({ type = "info", children }: StatusBannerProps) {
  const className =
    type === "error"
      ? "border-red-200 bg-red-50 text-red-800"
      : type === "success"
        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
        : "border-amber-200 bg-[#f7efd9] text-amber-900";

  return (
    <div className={`rounded-sm border px-4 py-3 text-sm font-medium ${className}`}>
      {children}
    </div>
  );
}
