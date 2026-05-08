import { useEffect, useRef, useState } from "react";

export type MetricSeries = {
  cpu: number;
  cpuTemp: number;
  gpu: number;
  fan: number;
  ramUsed: number;
  swapUsed: number;
  diskUsed: number;
  netDown: number;
  netUp: number;
};

export function useMetrics(intervalMs: number, paused = false) {
  const [history, setHistory] = useState<MetricSeries[]>([]);
  const [uptime, setUptime] = useState(0);
  const startRef = useRef(Date.now());

  // Fetch metrics from your API
  const fetchMetrics = async () => {
    try {
      const response = await fetch("/api/metrics");
      if (!response.ok) throw new Error("Failed to fetch metrics");
      return (await response.json()) as MetricSeries;
    } catch (error) {
      console.error("Metrics fetch error:", error);
      return null;
    }
  };

  useEffect(() => {
    // Initialize history with first metric
    fetchMetrics().then((metric) => {
      if (metric) {
        setHistory(Array(60).fill(metric));
      }
    });
  }, []);

  useEffect(() => {
    if (paused) return;

    const id = setInterval(async () => {
      const newMetric = await fetchMetrics();
      if (newMetric) {
        setHistory((h) => [...h.slice(1), newMetric].slice(-60));
      }
    }, intervalMs);

    return () => clearInterval(id);
  }, [intervalMs, paused]);

  useEffect(() => {
    const t = setInterval(() => {
      setUptime(Math.floor((Date.now() - startRef.current) / 1000));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  return {
    current: history[history.length - 1] || defaultMetric,
    history: history.length > 0 ? history : [defaultMetric],
    uptime,
  };
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
