import { cn } from "@/lib/utils";

export interface Datum {
  label: string;
  value: number;
  /** Pre-formatted value for labels/tooltips. */
  display: string;
}

/**
 * Single-series charts (one hue — the brand accent — so no legend; the title names the series).
 * Every bar is focusable and shows its value on hover/focus; a table view keeps values reachable without hovering.
 */

function TableView({ data, caption, valueLabel }: { data: Datum[]; caption: string; valueLabel: string }) {
  return (
    <details className="mt-4 text-xs text-muted">
      <summary className="cursor-pointer select-none hover:text-cream">View as table</summary>
      <table className="mt-3 w-full text-left">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-line">
            <th className="py-1.5 font-medium">Label</th>
            <th className="py-1.5 text-right font-medium">{valueLabel}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.label} className="border-b border-line/60">
              <td className="py-1.5 text-cream/90">{d.label}</td>
              <td className="py-1.5 text-right tabular-nums text-cream/90">{d.display}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  );
}

export function ColumnChart({
  data,
  caption,
  valueLabel = "Value",
  height = 220,
}: {
  data: Datum[];
  caption: string;
  valueLabel?: string;
  height?: number;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const maxIdx = data.reduce((best, d, i) => (d.value > data[best].value ? i : best), 0);
  const ticks = [1, 0.5, 0];
  return (
    <figure>
      <div className="relative" style={{ height }}>
        {/* recessive gridlines */}
        {ticks.map((t) => (
          <div key={t} className="absolute inset-x-0 border-t border-line/70" style={{ bottom: `${t * 100}%` }} aria-hidden />
        ))}
        <ul className="absolute inset-0 flex items-end gap-[2px]" role="list" aria-label={caption}>
          {data.map((d, i) => {
            const h = d.value > 0 ? Math.max(2, (d.value / max) * 100) : 0;
            const last = i === data.length - 1;
            return (
              <li key={d.label} className="group relative flex h-full min-w-0 flex-1 items-end justify-center">
                <span
                  tabIndex={0}
                  aria-label={`${d.label}: ${d.display}`}
                  className={cn(
                    "block w-3/5 max-w-12 rounded-t-[4px] bg-accent transition-[filter,opacity] duration-200 outline-none group-hover:brightness-125 focus-visible:ring-2 focus-visible:ring-cream",
                    !last && "opacity-80",
                  )}
                  style={{ height: `${h}%` }}
                />
                {/* selective direct labels: latest and peak only */}
                {(last || i === maxIdx) && d.value > 0 && (
                  <span className="pointer-events-none absolute -translate-y-full pb-1 text-[11px] tabular-nums text-cream" style={{ bottom: `${h}%` }}>
                    {d.display}
                  </span>
                )}
                <span
                  role="tooltip"
                  className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 rounded-lg border border-line-strong bg-ink px-3 py-2 text-left whitespace-nowrap shadow-xl group-focus-within:block group-hover:block"
                >
                  <span className="block text-sm font-semibold tabular-nums text-cream">{d.display}</span>
                  <span className="block text-[11px] text-muted">{d.label}</span>
                </span>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="mt-2 flex gap-[2px] border-t border-line-strong pt-2">
        {data.map((d) => (
          <span key={d.label} className="flex-1 truncate text-center text-[11px] text-muted">
            {d.label}
          </span>
        ))}
      </div>
      <TableView data={data} caption={caption} valueLabel={valueLabel} />
    </figure>
  );
}

export function BarList({ data, caption, valueLabel = "Value" }: { data: Datum[]; caption: string; valueLabel?: string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <figure>
      <ul className="space-y-[10px]" aria-label={caption}>
        {data.map((d) => (
          <li key={d.label} className="group" tabIndex={0} aria-label={`${d.label}: ${d.display}`}>
            <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
              <span className="truncate text-cream/90">{d.label}</span>
              <span className="shrink-0 tabular-nums text-cream">{d.display}</span>
            </div>
            <div className="h-2 rounded-[4px] bg-ink">
              <div
                className="h-full rounded-[4px] bg-accent transition-[filter] duration-200 group-hover:brightness-125 group-focus:brightness-125"
                style={{ width: `${d.value > 0 ? Math.max(1.5, (d.value / max) * 100) : 0}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
      <TableView data={data} caption={caption} valueLabel={valueLabel} />
    </figure>
  );
}
