import { execSync } from "child_process";

export interface RawMetrics {
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

let lastCpuStats = { user: 0, system: 0, idle: 0, total: 0 };
let lastNetStats: Record<string, { rx: number; tx: number }> = {};

export function getCpuTemperature(): number {
  try {
    const tempFile = "/sys/class/thermal/thermal_zone0/temp";
    const raw = execSync(`cat ${tempFile}`, { encoding: "utf-8" }).trim();
    return parseInt(raw) / 1000;
  } catch {
    return 0;
  }
}

export function getCpuUsage(): number {
  try {
    const stat = execSync("cat /proc/stat | head -1", { encoding: "utf-8" }).trim();
    const parts = stat.split(/\s+/).slice(1).map(Number);

    const user = parts[0] || 0;
    const nice = parts[1] || 0;
    const system = parts[2] || 0;
    const idle = parts[3] || 0;
    const iowait = parts[4] || 0;

    const currentStats = {
      user: user + nice,
      system: system + iowait,
      idle,
      total: user + nice + system + idle + iowait,
    };

    const diffTotal =
      currentStats.total - lastCpuStats.total || 1;
    const diffIdle = currentStats.idle - lastCpuStats.idle;
    const usage = Math.max(
      0,
      Math.min(100, ((diffTotal - diffIdle) / diffTotal) * 100)
    );

    lastCpuStats = currentStats;
    return Math.round(usage * 10) / 10;
  } catch {
    return 0;
  }
}

export function getRamUsage(): {
  used: number;
  total: number;
} {
  try {
    const meminfo = execSync("cat /proc/meminfo", { encoding: "utf-8" });
    const memTotal = parseInt(
      meminfo.match(/MemTotal:\s+(\d+)/)?.[1] || "0"
    );
    const memFree = parseInt(
      meminfo.match(/MemFree:\s+(\d+)/)?.[1] || "0"
    );
    const buffers = parseInt(
      meminfo.match(/Buffers:\s+(\d+)/)?.[1] || "0"
    );
    const cached = parseInt(
      meminfo.match(/Cached:\s+(\d+)/)?.[1] || "0"
    );
    const swapCached = parseInt(
      meminfo.match(/SwapCached:\s+(\d+)/)?.[1] || "0"
    );

    const memUsed = memTotal - memFree - buffers - cached + swapCached;
    return {
      used: Math.round((memUsed / 1024 / 1024) * 100) / 100,
      total: Math.round((memTotal / 1024 / 1024) * 100) / 100,
    };
  } catch {
    return { used: 0, total: 0 };
  }
}

export function getSwapUsage(): {
  used: number;
  total: number;
} {
  try {
    const meminfo = execSync("cat /proc/meminfo", { encoding: "utf-8" });
    const swapTotal = parseInt(
      meminfo.match(/SwapTotal:\s+(\d+)/)?.[1] || "0"
    );
    const swapFree = parseInt(
      meminfo.match(/SwapFree:\s+(\d+)/)?.[1] || "0"
    );

    const swapUsed = swapTotal - swapFree;
    return {
      used: Math.round((swapUsed / 1024 / 1024) * 100) / 100,
      total: Math.round((swapTotal / 1024 / 1024) * 100) / 100,
    };
  } catch {
    return { used: 0, total: 0 };
  }
}

export function getDiskUsage(): {
  used: number;
  total: number;
} {
  try {
    const df = execSync("df /", { encoding: "utf-8" });
    const lines = df.split("\n");
    const [, totalKb, usedKb] = lines[1].split(/\s+/);
    return {
      used: Math.round((parseInt(usedKb) / 1024 / 1024) * 100) / 100,
      total: Math.round((parseInt(totalKb) / 1024 / 1024) * 100) / 100,
    };
  } catch {
    return { used: 0, total: 0 };
  }
}

export function getNetworkStats(): {
  netDown: number;
  netUp: number;
} {
  try {
    const net = execSync("cat /proc/net/dev", { encoding: "utf-8" });
    const lines = net.split("\n").slice(2);

    let totalRx = 0;
    let totalTx = 0;

    for (const line of lines) {
      if (!line.trim()) continue;
      const match = line.match(
        /^\s*(\w+):\s+(\d+)\s+\d+\s+\d+\s+\d+\s+\d+\s+\d+\s+\d+\s+\d+\s+(\d+)/
      );
      if (match) {
        const iface = match[1];
        const rx = parseInt(match[2]);
        const tx = parseInt(match[3]);

        if (
          iface !== "lo" &&
          !iface.startsWith("docker") &&
          !iface.startsWith("br-")
        ) {
          totalRx += rx;
          totalTx += tx;
        }
      }
    }

    let netDown = 0;
    let netUp = 0;

    if (lastNetStats.total) {
      const rxDiff = (totalRx - (lastNetStats.total?.rx || 0)) / 1_000_000; // Mbps
      const txDiff = (totalTx - (lastNetStats.total?.tx || 0)) / 1_000_000;
      netDown = Math.max(0, Math.round(Math.abs(rxDiff) * 10) / 10);
      netUp = Math.max(0, Math.round(Math.abs(txDiff) * 10) / 10);
    }

    lastNetStats.total = { rx: totalRx, tx: totalTx };
    return { netDown, netUp };
  } catch {
    return { netDown: 0, netUp: 0 };
  }
}

export function getGpuUsage(): number {
  try {
    const gpuMem = execSync(
      "vcgencmd get_mem gpu | sed 's/gpu=//g; s/M//g'",
      { encoding: "utf-8" }
    ).trim();
    return Math.round(parseInt(gpuMem) / 1024); // Convert MB to GB percentage
  } catch {
    return 0;
  }
}

export function getFanRpm(): number {
  try {
    // Method 1: Try PWM
    try {
      const pwmFile = "/sys/class/pwm/pwmchip0/pwm0/duty_cycle";
      const raw = execSync(`cat ${pwmFile}`, {
        encoding: "utf-8",
      }).trim();
      const duty = parseInt(raw);
      return Math.round((duty / 255) * 6000);
    } catch {
      // Method 2: Try hwmon
      const fanFile = execSync(
        "find /sys/class/hwmon -name 'fan*_input' | head -1",
        { encoding: "utf-8" }
      ).trim();
      if (fanFile) {
        const rpm = execSync(`cat ${fanFile}`, { encoding: "utf-8" }).trim();
        return parseInt(rpm);
      }
    }
    return 0;
  } catch {
    return 0;
  }
}

export async function getSystemMetrics(): Promise<RawMetrics> {
  return {
    cpu: getCpuUsage(),
    cpuTemp: getCpuTemperature(),
    gpu: getGpuUsage(),
    fan: getFanRpm(),
    ramUsed: getRamUsage().used,
    swapUsed: getSwapUsage().used,
    diskUsed: getDiskUsage().used,
    ...getNetworkStats(),
  };
}
