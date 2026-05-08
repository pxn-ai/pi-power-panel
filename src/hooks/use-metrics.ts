import { useEffect, useRef, useState } from "react";

export type MetricSeries = {
  cpu: number;
  cpuTemp: number;
  gpu: number;
  fan: number;
  ramUsed: number; // GB
  swapUsed: number; // GB
  diskUsed: number; // GB
  netDown: number; // Mbps
  netUp: number; // Mbps
};

export const LIMITS = {
  ramTotal: 8, // GB
  swapTotal: 2, // GB
  diskTotal: 128, // GB
  fanMax: 6000, // RPM
  netMax: 100, // Mbps
};

const HISTORY = 60;

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function jitter(prev: number, target: number, step: number, min: number, max: number) {
  const drift = (target - prev) * 0.15;
  const noise = (Math.random() - 0.5) * step;
  return clamp(prev + drift + noise, min, max);
}

export function useMetrics(intervalMs: number, paused = false) {
  const [history, setHistory] = useState<MetricSeries[]>(() => {
    const seed: MetricSeries = {
      cpu: 22,
      cpuTemp: 48,
      gpu: 14,
      fan: 2200,
      ramUsed: 3.1,
      swapUsed: 0.3,
      diskUsed: 42,
      netDown: 8,
      netUp: 2,
    };
    return Array.from({ length: HISTORY }, () => seed);
  });
  const [uptime, setUptime] = useState(0);
  const startRef = useRef(Date.now());

  useEffect(() => {
    const t = setInterval(() => {
      setUptime(Math.floor((Date.now() - startRef.current) / 1000));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setHistory((h) => {
        const last = h[h.length - 1];
        // CPU target wobbles
        const cpuTarget = 25 + Math.random() * 50 + (Math.random() < 0.05 ? 30 : 0);
        const cpu = jitter(last.cpu, cpuTarget, 8, 2, 100);
        // Temp follows CPU
        const tempTarget = 42 + cpu * 0.35;
        const cpuTemp = jitter(last.cpuTemp, tempTarget, 1.2, 35, 85);
        // GPU mostly low, occasional spikes
        const gpuTarget = 10 + Math.random() * 25 + (Math.random() < 0.08 ? 50 : 0);
        const gpu = jitter(last.gpu, gpuTarget, 6, 0, 100);
        // Fan follows temp
        const fanTarget = 1500 + (cpuTemp - 40) * 110;
        const fan = jitter(last.fan, fanTarget, 120, 800, LIMITS.fanMax);
        // RAM slow drift
        const ramTarget = 3 + Math.random() * 3;
        const ramUsed = jitter(last.ramUsed, ramTarget, 0.15, 1, LIMITS.ramTotal);
        const swapUsed = jitter(last.swapUsed, 0.2 + Math.random() * 0.6, 0.05, 0, LIMITS.swapTotal);
        // Disk drifts very slowly
        const diskUsed = clamp(last.diskUsed + (Math.random() - 0.45) * 0.05, 30, LIMITS.diskTotal);
        // Network bursty
        const netDown = jitter(last.netDown, Math.random() < 0.2 ? 40 + Math.random() * 50 : 5 + Math.random() * 15, 8, 0, LIMITS.netMax);
        const netUp = jitter(last.netUp, Math.random() < 0.2 ? 10 + Math.random() * 20 : 1 + Math.random() * 4, 3, 0, LIMITS.netMax);

        const next: MetricSeries = { cpu, cpuTemp, gpu, fan, ramUsed, swapUsed, diskUsed, netDown, netUp };
        return [...h.slice(1), next];
      });
    }, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs, paused]);

  const current = history[history.length - 1];
  return { current, history, uptime };
}

export function formatUptime(s: number) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
}
