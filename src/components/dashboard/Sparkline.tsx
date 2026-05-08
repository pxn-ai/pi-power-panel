import { useId } from "react";

type Props = {
  data: number[];
  min?: number;
  max?: number;
  stroke?: string;
  fill?: string;
  height?: number;
};

export function Sparkline({
  data,
  min,
  max,
  stroke = "var(--color-primary)",
  fill = "var(--color-primary)",
  height = 48,
}: Props) {
  const gradientId = useId().replace(/:/g, "");

  if (!data.length) return null;
  const lo = min ?? Math.min(...data);
  const hi = max ?? Math.max(...data);
  const range = hi - lo || 1;
  const w = 100;
  const h = 100;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - lo) / range) * h;
    return [x, y] as const;
  });
  const linePath = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
  const areaPath = `${linePath} L${w},${h} L0,${h} Z`;
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      style={{ width: "100%", height }}
      aria-hidden
    >
      <defs>
        <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={fill} stopOpacity="0.45" />
          <stop offset="100%" stopColor={fill} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradientId})`} />
      <path d={linePath} fill="none" stroke={stroke} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
