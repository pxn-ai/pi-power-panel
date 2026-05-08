- Raspberry Pi 5 Dashboard — Plan

A single-page dashboard styled like a modern monitoring console (dark, techy, glassy cards). All metrics are simulated client-side with realistic ranges and smooth jitter, updating every ~1.0s. Each metric shows a current value plus a rolling 60-second sparkline.  
should fit in the viewer's screen. no scrolling.

### Page layout (`/`)

- **Header**: "Smart - Freaks" title, hostname placeholder (smart-freaks.local), uptime ticker, status pill (Online), and a refresh-rate selector (1s / 2s / paused).
- **Top row — system summary cards** (compact):
  - CPU Usage (%) — gauge + sparkline (Area)
  - CPU Temperature (°C) — value + thermal color (green/amber/red) + sparkline (Area)
  - GPU Usage (%) — gauge + sparkline (Area)
  - Fan Speed (RPM) — value + sparkline (Area)
- **Middle row — memory & storage**:
  - RAM card: used / total bar (e.g. 3.2 / 8 GB), plus SWAP used / total bar underneath + sparkline (Area) graph
  - Disk card: used / total bar (e.g. 42 / 128 GB), free space, read/write indicator + sparkline (Area) graph
- **Bottom row — network**:
  - Network card: ↓ download Mbps and ↑ upload Mbps with a dual-line 60s chart, plus totals (GB transferred this session)

### Mock data engine

- A single `useMetrics(intervalMs)` hook in `src/hooks/use-metrics.ts`.
- Maintains a ring buffer of the last 60 seconds (≈ 60 samples at 1.0s) per metric.
- Generates correlated, realistic values (e.g. fan RPM rises with CPU temp; temp follows CPU load with smoothing).

Exposes `{ current, history }` for each metric.

### Components (`src/components/dashboard/`)

- `MetricCard.tsx` — title, big value, unit, optional icon, sparkline slot.
- `Sparkline.tsx` — lightweight SVG line chart (no external dep, smooth path).
- `Gauge.tsx` — circular percentage gauge for CPU/GPU.
- `BarMeter.tsx` — horizontal used/total bar for RAM, SWAP, Disk.

`NetworkChart.tsx` — dual-line area chart for up/down using SVG.

- `StatusHeader.tsx` — title, uptime, refresh control.

### Design system

- Dark theme as default (set `dark` class on `<html>` in `__root.tsx`).
- Tune `src/styles.css` tokens for a Pi-monitoring vibe: deep slate background, subtle card surface, accent green for healthy, amber for warning, red for critical. Add `--gradient-card`, `--shadow-glow`, `--color-success`, `--color-warning` semantic tokens.
- All colors via tokens — no raw `text-white` / `bg-black`.
- Responsive grid: 1 col mobile, 2 cols md, 4 cols xl for top row.

### Routing & SEO

- Replace placeholder in `src/routes/index.tsx` with the dashboard.
- Update `__root.tsx` head: title "Raspberry Pi 5 Dashboard", meta description, single H1 in page.

### Out of scope (per your answers)

- No backend, no Lovable Cloud, no auth, no persistence.
- No real Pi integration yet — mock data only. Easy to swap later by replacing `useMetrics` with a `fetch('/metrics')` call.

### Tech notes

- No new dependencies needed; sparklines/gauges are hand-rolled SVG to keep it light and avoid Recharts overhead for tiny charts.
- Dashboard renders entirely client-side; safe for SSR/prerender.