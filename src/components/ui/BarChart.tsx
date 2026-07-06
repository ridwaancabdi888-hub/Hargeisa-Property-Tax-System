interface BarChartProps {
  data: { label: string; value: number }[];
  highlightLabel?: string;
  formatValue?: (value: number) => string;
}

export default function BarChart({ data, highlightLabel, formatValue }: BarChartProps) {
  const max = Math.max(...data.map((d) => d.value));

  return (
    <div className="flex h-56 items-end gap-2.5">
      {data.map((d) => {
        const heightPct = max > 0 ? (d.value / max) * 100 : 0;
        const isHighlighted = d.label === highlightLabel;
        return (
          <div key={d.label} className="group flex flex-1 flex-col items-center gap-2">
            <div className="relative flex h-44 w-full items-end">
              <div
                className={`w-full rounded-t-md transition-colors ${
                  isHighlighted ? "bg-navy-800" : "bg-slate-200 group-hover:bg-navy-700/60"
                }`}
                style={{ height: `${heightPct}%` }}
                title={formatValue ? formatValue(d.value) : String(d.value)}
              />
            </div>
            <span className="text-[11px] font-medium text-slate-500">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}
