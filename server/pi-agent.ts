// pi-agent.ts
import { execSync } from "child_process";
import * as os from "os";

Bun.serve({
  port: 3000,
  fetch(req) {
    const url = new URL(req.url);
    
    // CORS headers are REQUIRED so your laptop's browser can fetch this data
    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Content-Type": "application/json"
    };

    // Handle CORS preflight requests
    if (req.method === "OPTIONS") return new Response(null, { headers });

    if (url.pathname === "/api/metrics") {
      try {
        // 1. Get CPU Temp from Pi
        const tempFile = "/sys/class/thermal/thermal_zone0/temp";
        const cpuTempRaw = execSync(`cat ${tempFile}`).toString().trim();
        const cpuTemp = parseInt(cpuTempRaw) / 1000;

        // 2. Get RAM Info
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const ramUsed = (totalMem - freeMem) / (1024 * 1024 * 1024);

        // Construct metrics payload (Add your other shell commands here)
        const metrics = {
          cpu: (os.loadavg()[0] * 100) / os.cpus().length, // Approximate load
          cpuTemp: cpuTemp,
          gpu: 0, // Implement vcgencmd parsing if needed
          fan: 0, 
          ramUsed: ramUsed,
          swapUsed: 0,
          diskUsed: 0,
          netDown: 0,
          netUp: 0
        };

        return new Response(JSON.stringify(metrics), { headers });
      } catch (error) {
        return new Response(JSON.stringify({ error: "Failed to read metrics" }), { status: 500, headers });
      }
    }
    return new Response("Not found", { status: 404 });
  }
});

console.log("Lightweight Pi Metrics Agent running on http://0.0.0.0:3000");