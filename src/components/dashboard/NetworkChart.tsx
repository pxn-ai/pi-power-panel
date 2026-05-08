type Props = {
  down: number[];
  up: number[];
  max: number;
  height?: number;
};

export function NetworkChart({ down, up, max, height = 90 }: Props) {
  const w = 100;
  const h = 100;
  const buildPath = (data: number[]) => {
    if (!data.length) return "";
    return data
      .map((v, i) => {
        const x = (i / (data.length - 1)) * w;
        const y = h - (Math.min(v, max) / max) * h;
        return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
      })
      .join(" ");
  };
  const downPath = buildPath(down);
  const upPath = buildPath(up);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: "100%", height }} aria-hidden>
      <defs>
        <linearGradient id="dn" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--color-info)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="var(--color-info)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="upg" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--color-warning)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--color-warning)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${downPath} L${w},${h} L0,${h} Z`} fill="url(#dn)" />
      <path d={downPath} fill="none" stroke="var(--color-info)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      <path d={`${upPath} L${w},${h} L0,${h} Z`} fill="url(#upg)" />
      <path d={upPath} fill="none" stroke="var(--color-warning)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
