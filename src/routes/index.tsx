import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Cpu, Thermometer, Zap, Fan, MemoryStick, HardDrive, Network, Activity, ArrowDown, ArrowUp } from "lucide-react";
import { useMetrics, formatUptime, LIMITS } from "@/hooks/use-metrics";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { Sparkline } from "@/components/dashboard/Sparkline";
import { Gauge } from "@/components/dashboard/Gauge";
import { BarMeter } from "@/components/dashboard/BarMeter";
import { NetworkChart } from "@/components/dashboard/NetworkChart";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

function tempColor(t: number) {
  if (t < 60) return "var(--color-success)";
  if (t < 75) return "var(--color-warning)";
  return "var(--color-danger)";
}

function Dashboard() {
  const [interval, setIntervalMs] = useState(1000);
  const [paused, setPaused] = useState(false);
  const { current, history, uptime } = useMetrics(interval, paused);

  const series = (key: keyof typeof current) => history.map((h) => h[key] as number);

  const cpuSeries = series("cpu");
  const tempSeries = series("cpuTemp");
  const gpuSeries = series("gpu");
  const fanSeries = series("fan");
  const ramSeries = series("ramUsed");
  const diskSeries = series("diskUsed");
  const downSeries = series("netDown");
  const upSeries = series("netUp");

  const tColor = tempColor(current.cpuTemp);

  return (
    <main
      className="flex h-screen w-full flex-col gap-3 overflow-hidden p-4"
      style={{
        background:
          "radial-gradient(1200px 600px at 10% -10%, oklch(0.78 0.17 155 / 0.08), transparent), radial-gradient(900px 500px at 110% 110%, oklch(0.72 0.15 230 / 0.08), transparent), var(--color-background)",
      }}
    >
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-lg"
            style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}
          >
            <Activity className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold leading-tight text-foreground">Smart-Freaks</h1>
            <p className="text-xs text-muted-foreground">smart-freaks.local · Raspberry Pi 5</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
            </span>
            <span className="text-foreground">Online</span>
          </div>
          <div className="text-muted-foreground">
            Uptime <span className="tabular-nums text-foreground">{formatUptime(uptime)}</span>
          </div>
          <div className="flex items-center gap-1 rounded-md border border-border bg-card p-0.5">
            {[
              { label: "1s", v: 1000 },
              { label: "2s", v: 2000 },
            ].map((o) => (
              <button
                key={o.v}
                onClick={() => {
                  setIntervalMs(o.v);
                  setPaused(false);
                }}
                className={`rounded px-2 py-0.5 text-xs transition-colors ${
                  !paused && interval === o.v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {o.label}
              </button>
            ))}
            <button
              onClick={() => setPaused((p) => !p)}
              className={`rounded px-2 py-0.5 text-xs transition-colors ${
                paused ? "bg-warning text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {paused ? "Paused" : "Pause"}
            </button>
          </div>
        </div>
      </header>

      {/* Top row: 4 cards */}
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <MetricCard title="CPU Usage" icon={<Cpu className="h-4 w-4" />} accent="var(--color-primary)">
          <div className="flex items-center gap-3">
            <Gauge value={current.cpu} color="var(--color-primary)" />
            <div className="flex-1">
              <Sparkline data={cpuSeries} min={0} max={100} stroke="var(--color-primary)" fill="var(--color-primary)" height={48} />
              <p className="mt-1 text-[10px] text-muted-foreground">4 cores · ARM Cortex-A76</p>
            </div>
          </div>
        </MetricCard>

        <MetricCard title="CPU Temp" icon={<Thermometer className="h-4 w-4" style={{ color: tColor }} />} accent={tColor}>
          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-semibold tabular-nums" style={{ color: tColor }}>
                  {current.cpuTemp.toFixed(1)}
                </span>
                <span className="text-sm text-muted-foreground">°C</span>
              </div>
              <p className="text-[10px] text-muted-foreground">Throttle @ 80°C</p>
            </div>
          </div>
          <div className="mt-auto">
            <Sparkline data={tempSeries} min={35} max={85} stroke={tColor} fill={tColor} height={42} />
          </div>
        </MetricCard>

        <MetricCard title="GPU Usage" icon={<Zap className="h-4 w-4" />} accent="var(--color-info)">
          <div className="flex items-center gap-3">
            <Gauge value={current.gpu} color="var(--color-info)" />
            <div className="flex-1">
              <Sparkline data={gpuSeries} min={0} max={100} stroke="var(--color-info)" fill="var(--color-info)" height={48} />
              <p className="mt-1 text-[10px] text-muted-foreground">VideoCore VII</p>
            </div>
          </div>
        </MetricCard>

        <MetricCard title="Fan Speed" icon={<Fan className="h-4 w-4 animate-spin-slow" />} accent="var(--color-warning)">
          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-semibold tabular-nums text-foreground">
                  {Math.round(current.fan)}
                </span>
                <span className="text-sm text-muted-foreground">RPM</span>
              </div>
              <p className="text-[10px] text-muted-foreground">Auto · max {LIMITS.fanMax}</p>
            </div>
          </div>
          <div className="mt-auto">
            <Sparkline data={fanSeries} min={800} max={LIMITS.fanMax} stroke="var(--color-warning)" fill="var(--color-warning)" height={42} />
          </div>
        </MetricCard>
      </section>

      {/* Middle row: RAM + Disk */}
      <section className="grid flex-1 grid-cols-1 gap-3 md:grid-cols-2">
        <MetricCard title="Memory" icon={<MemoryStick className="h-4 w-4" />} accent="var(--color-primary)">
          <div className="flex h-full flex-col gap-2">
            <div className="space-y-2">
              <BarMeter label="RAM" used={current.ramUsed} total={LIMITS.ramTotal} color="var(--color-primary)" />
              <BarMeter label="SWAP" used={current.swapUsed} total={LIMITS.swapTotal} color="var(--color-info)" />
            </div>
            <div className="mt-auto">
              <Sparkline data={ramSeries} min={0} max={LIMITS.ramTotal} stroke="var(--color-primary)" fill="var(--color-primary)" height={56} />
            </div>
          </div>
        </MetricCard>

        <MetricCard title="Disk" icon={<HardDrive className="h-4 w-4" />} accent="var(--color-info)">
          <div className="flex h-full flex-col gap-2">
            <BarMeter label="Storage" used={current.diskUsed} total={LIMITS.diskTotal} color="var(--color-info)" />
            <div className="grid grid-cols-3 gap-2 text-[11px]">
              <div className="rounded-md border border-border bg-muted/40 p-2">
                <p className="text-muted-foreground">Free</p>
                <p className="tabular-nums text-foreground">{(LIMITS.diskTotal - current.diskUsed).toFixed(1)} GB</p>
              </div>
              <div className="rounded-md border border-border bg-muted/40 p-2">
                <p className="text-muted-foreground">Read</p>
                <p className="tabular-nums text-foreground">{(20 + Math.random() * 80).toFixed(0)} MB/s</p>
              </div>
              <div className="rounded-md border border-border bg-muted/40 p-2">
                <p className="text-muted-foreground">Write</p>
                <p className="tabular-nums text-foreground">{(5 + Math.random() * 40).toFixed(0)} MB/s</p>
              </div>
            </div>
            <div className="mt-auto">
              <Sparkline data={diskSeries} min={0} max={LIMITS.diskTotal} stroke="var(--color-info)" fill="var(--color-info)" height={48} />
            </div>
          </div>
        </MetricCard>
      </section>

      {/* Bottom row: Network */}
      <section>
        <MetricCard title="Network" icon={<Network className="h-4 w-4" />} accent="var(--color-info)">
          <div className="flex items-stretch gap-4">
            <div className="flex flex-col justify-between gap-2 pr-4">
              <div className="flex items-center gap-2">
                <ArrowDown className="h-4 w-4 text-info" style={{ color: "var(--color-info)" }} />
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-semibold tabular-nums text-foreground">{current.netDown.toFixed(1)}</span>
                    <span className="text-xs text-muted-foreground">Mbps</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Download</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ArrowUp className="h-4 w-4" style={{ color: "var(--color-warning)" }} />
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-semibold tabular-nums text-foreground">{current.netUp.toFixed(1)}</span>
                    <span className="text-xs text-muted-foreground">Mbps</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Upload</p>
                </div>
              </div>
            </div>
            <div className="flex-1">
              <NetworkChart down={downSeries} up={upSeries} max={LIMITS.netMax} height={90} />
              <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                <span>60s ago</span>
                <span>now</span>
              </div>
            </div>
          </div>
        </MetricCard>
      </section>
    </main>
  );
}
