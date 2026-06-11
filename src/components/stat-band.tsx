type Stat = { value: string; label: string };

export function StatBand({ stats }: { stats: Stat[] }) {
  return (
    <div className="flex flex-wrap gap-x-12 gap-y-6">
      {stats.map((s) => (
        <div key={s.label}>
          <div className="font-lat text-3xl font-semibold tracking-tight text-ink">{s.value}</div>
          <div className="mt-1 text-xs text-sub">{s.label}</div>
        </div>
      ))}
    </div>
  );
}
