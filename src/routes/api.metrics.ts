import { createAPIFileRoute } from "@tanstack/react-start/api";
import { getSystemMetrics } from "@/lib/system-metrics";

export type SystemMetrics = {
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

export const Route = createAPIFileRoute("/api/metrics")({
  GET: async () => {
    try {
      const metrics = await getSystemMetrics();
      return new Response(JSON.stringify(metrics), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      });
    } catch (error) {
      console.error("Error fetching metrics:", error);
      return new Response(
        JSON.stringify({
          error: "Failed to fetch metrics",
          message: error instanceof Error ? error.message : "Unknown error",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  },
});
