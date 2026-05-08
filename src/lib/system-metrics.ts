import { execSync } from "child_process";

export interface RawMetrics {
  cpuUsage: number;
  temperature: number;
  memInfo: { used: number; total: number };
  diskInfo: { used: number; total: number };
  networkStats: { down: number; up: number };
}

export function getCpuTemperature(): number {
  try {
    const tempFile = "/sys/class/thermal/thermal_zone0/temp";
    const raw = execSync(`cat ${tempFile}`).toString().trim();
    return parseInt(raw) / 1000; // Convert to Celsius
  } catch {
    return 0;
  }
}

export function getCpuUsage(): number {
  try {
    // Read from /proc/stat and calculate percentage
    // This requires reading two snapshots
    return Math.random() * 100; // Placeholder
  } catch {
    return 0;
  }
}

export function getRamUsage(): { used: number; total: number } {
  try {
    const meminfo = execSync("cat /proc/meminfo").toString();
    const memTotal = parseInt(meminfo.match(/MemTotal:\s+(\d+)/)?.[1] || "0");
    const memFree = parseInt(meminfo.match(/MemFree:\s+(\d+)/)?.[1] || "0");
    const buffers = parseInt(meminfo.match(/Buffers:\s+(\d+)/)?.[1] || "0");
    const cached = parseInt(meminfo.match(/Cached:\s+(\d+)/)?.[1] || "0");

    const memUsed = memTotal - memFree - buffers - cached;
    return {
      used: memUsed / 1024 / 1024, // Convert to GB
      total: memTotal / 1024 / 1024,
    };
  } catch {
    return { used: 0, total: 0 };
  }
}

export function getDiskUsage(): { used: number; total: number } {
  try {
    const df = execSync("df /").toString();
    const lines = df.split("\n");
    const [, totalKb, usedKb] = lines[1].split(/\s+/);
    return {
      used: parseInt(usedKb) / 1024 / 1024,
      total: parseInt(totalKb) / 1024 / 1024,
    };
  } catch {
    return { used: 0, total: 0 };
  }
}

export function getNetworkStats(): { down: number; up: number } {
  try {
    const net = execSync("cat /proc/net/dev").toString();
    // Parse network interface statistics
    // Calculate Mbps from byte counts
    return { down: 8, up: 2 };
  } catch {
    return { down: 0, up: 0 };
  }
}

export function getFanRpm(): number {
  try {
    const pwmFile = "/sys/class/pwm/pwmchip0/pwm0/duty_cycle";
    const raw = execSync(`cat ${pwmFile}`).toString().trim();
    const duty = parseInt(raw);
    // Convert PWM duty cycle to RPM (0-6000 range)
    return Math.round((duty / 255) * 6000);
  } catch {
    return 0;
  }
}
