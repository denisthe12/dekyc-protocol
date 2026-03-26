type MetricTileProps = {
  label: string;
  value: string;
  hint?: string;
};

export function MetricTile({ label, value, hint }: MetricTileProps) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
        {label}
      </div>

      <div className="mt-3 break-all text-sm font-semibold text-zinc-950">
        {value}
      </div>

      {hint ? (
        <div className="mt-2 text-xs leading-5 text-zinc-500">{hint}</div>
      ) : null}
    </div>
  );
}