import { createAPIFileRoute } from "@tanstack/react-start/api";

export interface SystemMetrics {
  cpu: number;
  cpuTemp: number;
  gpu: number;
  fan: number;
  ramUsed: number;
  swapUsed: number;
  diskUsed: number;
  netDown: number;
  netUp: number;
}

export const Route = createAPIFileRoute("/api/metrics")({
  GET: async () => {
    return new Response(JSON.stringify(await getSystemMetrics()), {
      headers: { "Content-Type": "application/json" },
    });
  },
});

async function getSystemMetrics(): Promise<SystemMetrics> {
  const [
    cpuUsage,
    cpuTemp,
    gpuUsage,
    fanRpm,
    ramUsage,
    diskUsage,
    networkStats,
  ] = await Promise.all([
    getCpuUsage(),
    getCpuTemperature(),
    getGpuUsage(),
    getFanRpm(),
    getRamUsage(),
    getDiskUsage(),
    getNetworkStats(),
  ]);

  return {
    cpu: cpuUsage,
    cpuTemp,
    gpu: gpuUsage,
    fan: fanRpm,
    ramUsed: ramUsage,
    swapUsed: 0.3, // Implement if needed
    diskUsed: diskUsage,
    netDown: networkStats.down,
    netUp: networkStats.up,
  };
}

// Implement system metric collection functions
async function getCpuUsage(): Promise<number> {
  // Use /proc/stat parsing or child_process
  // Returns 0-100
}

async function getCpuTemperature(): Promise<number> {
  // Read from /sys/class/thermal/thermal_zone0/temp
  // Divide by 1000 to get Celsius
}

// ... implement other functions
