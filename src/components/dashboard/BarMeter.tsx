type Props = {
  label: string;
  used: number;
  total: number;
  unit?: string;
  color?: string;
};

export function BarMeter({ label, used, total, unit = "GB", color = "var(--color-primary)" }: Props) {
  const pct = Math.max(0, Math.min(100, (used / total) * 100));
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="tabular-nums text-foreground">
          {used.toFixed(1)} / {total} {unit}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}
