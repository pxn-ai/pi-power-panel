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

const defaultMetric: MetricSeries = {
  cpu: 0,
  cpuTemp: 0,
  gpu: 0,
  fan: 0,
  ramUsed: 0,
  swapUsed: 0,
  diskUsed: 0,
  netDown: 0,
  netUp: 0,
};

export function useMetrics(intervalMs: number, paused = false) {
  const [history, setHistory] = useState<MetricSeries[]>(() =>
    Array(HISTORY).fill(defaultMetric)
  );
  const [uptime, setUptime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const startRef = useRef(Date.now());

  const fetchMetrics = async (): Promise<MetricSeries | null> => {
    try {
      // 1. Get the Pi's IP from Vite environment variables, or fallback to localhost for testing
      const API_URL = import.meta.env.VITE_PI_API_URL || "http://192.168.1.100:3000/api/metrics";

      // 2. Fetch from the absolute URL instead of the relative path
      const response = await fetch(API_URL, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        // mode: 'cors' is automatically implied when fetching from a different IP
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = (await response.json()) as MetricSeries;
      setError(null);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      console.error("Failed to fetch metrics:", message);
      return null;
    }
  };

  useEffect(() => {
    const t = setInterval(() => {
      setUptime(Math.floor((Date.now() - startRef.current) / 1000));
    }, 1000);
    return () => clearInterval(t);
  },[]);

  useEffect(() => {
    let mounted = true;

    const initHistory = async () => {
      const metric = await fetchMetrics();
      if (mounted && metric) {
        setHistory(Array(HISTORY).fill(metric));
      }
    };

    initHistory();

    return () => {
      mounted = false;
    };
  },[]);

  useEffect(() => {
    if (paused) return;

    const id = setInterval(async () => {
      const metric = await fetchMetrics();
      if (metric) {
        setHistory((prev) => [...prev.slice(1), metric]);
      }
    }, intervalMs);

    return () => clearInterval(id);
  }, [intervalMs, paused]);

  const current = history[history.length - 1] || defaultMetric;
  return { current, history, uptime, error };
}

export function formatUptime(s: number) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
}