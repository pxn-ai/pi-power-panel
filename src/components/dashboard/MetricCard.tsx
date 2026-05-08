import type { ReactNode } from "react";

type Props = {
  title: string;
  icon?: ReactNode;
  accent?: string;
  children: ReactNode;
  className?: string;
};

export function MetricCard({ title, icon, accent, children, className = "" }: Props) {
  return (
    <div
      className={`relative flex flex-col overflow-hidden rounded-xl border border-border p-3 ${className}`}
      style={{
        background: "var(--gradient-card)",
        boxShadow: accent ? `0 0 0 1px ${accent}20, 0 8px 24px -12px ${accent}40` : undefined,
      }}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{title}</h2>
        {icon && <span style={{ color: accent ?? "var(--color-muted-foreground)" }}>{icon}</span>}
      </div>
      <div className="mt-1 flex flex-1 flex-col">{children}</div>
    </div>
  );
}
