# Pi Power Panel

A real-time system monitoring dashboard for Raspberry Pi 5, providing live metrics for CPU, GPU, temperature, memory, disk, and network performance. Built with modern web technologies for a responsive, efficient user experience.

**Live Demo:** Access the dashboard from any device on your network via the Raspberry Pi's IP address.

## Features

- **Real-time Metrics**: CPU usage, GPU load, system temperature, RAM, swap, and disk utilization
- **Network Monitoring**: Live download/upload speeds with historical charts
- **Temperature Tracking**: CPU temperature with color-coded warnings (normal → warning → danger)
- **Fan Speed Display**: Real-time fan RPM monitoring
- **Historical Data**: 60-second rolling history with sparkline and trend visualization
- **Responsive UI**: Works on desktop, tablet, and mobile devices
- **Dark Theme**: Easy on the eyes, optimized for 24/7 monitoring
- **Pause Controls**: Freeze metrics for inspection, adjust refresh intervals

## Technology Stack

### Frontend
- **React 19**: Modern UI library with hooks
- **TanStack Start/Router**: Full-stack meta-framework for routing and data management
- **TypeScript**: Type-safe JavaScript for reliability
- **Tailwind CSS**: Utility-first styling for responsive design
- **Recharts**: Data visualization library for charts and metrics
- **Lucide React**: Modern icon library

### Backend & Build
- **Vite**: Next-generation bundler with hot module replacement
- **Node.js (Bun runtime)**: JavaScript runtime (compatible with Node.js)
- **Cloudflare Workers**: Optional serverless deployment target
- **ESLint & Prettier**: Code quality and formatting

### Architecture
- Full-stack TypeScript application
- Server-side rendering (SSR) ready
- Real-time metric polling via hooks
- Modular component structure with reusable UI components

## Project Structure

```
pi-power-panel/
├── src/
│   ├── routes/              # TanStack Router page components
│   │   ├── __root.tsx      # Root layout and app shell
│   │   └── index.tsx       # Main dashboard component
│   ├── components/
│   │   ├── dashboard/      # Dashboard-specific components
│   │   │   ├── MetricCard.tsx
│   │   │   ├── Sparkline.tsx
│   │   │   ├── Gauge.tsx
│   │   │   ├── BarMeter.tsx
│   │   │   └── NetworkChart.tsx
│   │   └── ui/             # Reusable UI components (Radix UI)
│   ├── hooks/
│   │   ├── use-metrics.ts  # Main metrics collection hook
│   │   └── use-mobile.tsx  # Mobile detection hook
│   ├── lib/                # Utility functions
│   ├── styles.css          # Global styles with Tailwind
│   ├── start.ts            # Entry point (client)
│   ├── server.ts           # SSR error wrapper
│   └── router.tsx          # Router configuration
├── package.json
├── vite.config.ts
├── tsconfig.json
├── wrangler.jsonc          # Cloudflare deployment config
└── components.json         # Radix UI components registry
```

## Getting Started

### Prerequisites

- **Raspberry Pi 5** (4GB RAM minimum, 8GB+ recommended)
- **Debian Trixie** (or compatible Linux distribution)
- **Node.js 20+** or **Bun 1.0+**
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/pxn-ai/pi-power-panel.git
   cd pi-power-panel
   ```

2. **Install dependencies**
   ```bash
   # Using Bun (recommended for performance)
   bun install

   # OR using npm
   npm install

   # OR using yarn
   yarn install
   ```

3. **Start development server**
   ```bash
   # Using Bun
   bun run dev

   # OR using npm
   npm run dev
   ```

   The dashboard will be available at `http://localhost:5173` (development mode)

### Building for Production

```bash
# Build for production
bun run build

# OR using npm
npm run build

# Preview the production build
bun run preview
```

## Implementation Guide for Real Data (Raspberry Pi 5)

### Current Setup (Mock Data)

The project currently uses simulated metrics through the `use-metrics.ts` hook. To integrate with your Raspberry Pi 5's real system data, follow this implementation guide.

### Step 1: Create a Backend API Endpoint

Create a new file `src/routes/api.metrics.ts`:

```typescript
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
```

### Step 2: Install System Monitoring Dependencies

```bash
# For system info gathering
bun add systeminformation
# OR
npm install systeminformation

# Optional: For better system access
bun add get-cpu-usage
npm install get-cpu-usage
```

### Step 3: Implement Linux System Commands Handler

Create `src/lib/system-metrics.ts`:

```typescript
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
```

### Step 4: Update use-metrics Hook

Modify `src/hooks/use-metrics.ts` to fetch real data:

```typescript
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
```

### Step 5: Configure for Raspberry Pi Debian Trixie

1. **Install required system packages**:
   ```bash
   sudo apt-get update
   sudo apt-get install -y git curl
   
   # For Node.js (if not already installed)
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # OR use Bun (lightweight, performant)
   curl -fsSL https://bun.sh/install | bash
   ```

2. **Set up cron job for auto-restart** (optional):
   ```bash
   # Create startup script: /home/pi/start-dashboard.sh
   #!/bin/bash
   cd /home/pi/pi-power-panel
   bun run dev &
   
   # Add to crontab: sudo crontab -e
   @reboot /home/pi/start-dashboard.sh
   ```

3. **Configure firewall** (if needed):
   ```bash
   sudo ufw allow 5173/tcp  # For dev server
   sudo ufw allow 3000/tcp  # For production server
   ```

### Step 6: Deploy to Production

**Option A: systemd Service**

Create `/etc/systemd/system/pi-power-panel.service`:

```ini
[Unit]
Description=Pi Power Panel Dashboard
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/pi-power-panel
ExecStart=/home/pi/.bun/bin/bun run build && /home/pi/.bun/bin/bun run preview
Restart=on-failure
RestartSec=10s
Environment="NODE_ENV=production"
Environment="HOST=0.0.0.0"
Environment="PORT=3000"

[Install]
WantedBy=multi-user.target
```

Then enable:
```bash
sudo systemctl daemon-reload
sudo systemctl enable pi-power-panel
sudo systemctl start pi-power-panel
```

**Option B: Docker** (if installed)

Create `Dockerfile`:
```dockerfile
FROM oven/bun:latest

WORKDIR /app
COPY . .

RUN bun install
RUN bun run build

EXPOSE 3000
ENV NODE_ENV=production
CMD ["bun", "run", "preview"]
```

Build and run:
```bash
docker build -t pi-power-panel .
docker run -d -p 3000:3000 --name dashboard pi-power-panel
```

### Step 7: Access the Dashboard

Once running, access from any browser:
- **Local Pi**: `http://localhost:5173` (dev) or `http://localhost:3000` (prod)
- **From other devices**: `http://<pi-ip-address>:5173` or `http://<pi-ip-address>:3000`

Find your Pi's IP:
```bash
hostname -I
```

## Metrics Reference

### Collected Metrics

| Metric | Unit | Range | Source |
|--------|------|-------|--------|
| CPU Usage | % | 0-100 | `/proc/stat` |
| CPU Temperature | °C | 35-85+ | `/sys/class/thermal/thermal_zone0/temp` |
| GPU Load | % | 0-100 | `vcgencmd` (GPU on Pi) |
| Fan Speed | RPM | 0-6000 | `/sys/class/pwm/` |
| RAM Used | GB | 0-8 | `/proc/meminfo` |
| Swap Used | GB | 0-2 | `/proc/meminfo` |
| Disk Used | GB | 0-512+ | `df` |
| Network Down | Mbps | 0-1000+ | `/proc/net/dev` |
| Network Up | Mbps | 0-1000+ | `/proc/net/dev` |

### Temperature Color Thresholds

- **Green (Normal)**: < 60°C
- **Yellow (Warning)**: 60-75°C
- **Red (Danger)**: > 75°C

## Configuration

### Environment Variables

Create `.env.local`:
```bash
# Server host/port
VITE_API_URL=http://localhost:5173/api
NODE_ENV=production
HOST=0.0.0.0
PORT=3000

# Optional: Cloudflare Workers
WRANGLER_CONFIG_PATH=./wrangler.jsonc
```

### Customization

**Adjust refresh interval** (in dashboard):
- Default: 1000ms (1 second)
- Can be toggled via UI slider

**Update metric limits** in `src/hooks/use-metrics.ts`:
```typescript
export const LIMITS = {
  ramTotal: 8,      // Change if Pi has different RAM
  diskTotal: 128,   // Adjust to your storage
  fanMax: 6000,     // PWM max RPM
  netMax: 100,      // Max network Mbps
};
```

## Development

### Scripts

```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint

# Format code
npm run format
```

### Adding New Metrics

1. Extend `MetricSeries` type in `use-metrics.ts`
2. Add system collection function to `system-metrics.ts`
3. Update API endpoint in `routes/api.metrics.ts`
4. Add UI component to `components/dashboard/`
5. Display in main dashboard (`routes/index.tsx`)

### Debugging

Enable verbose logging:
```bash
DEBUG=* npm run dev
```

Check metric collection:
```bash
# Test API endpoint directly
curl http://localhost:5173/api/metrics

# Monitor Pi temperature
watch -n 1 "cat /sys/class/thermal/thermal_zone0/temp | awk '{print \$1/1000}'"
```

## Troubleshooting

### Metrics Not Updating

1. Check API endpoint: `curl http://localhost:5173/api/metrics`
2. Verify permissions on `/sys/class/thermal/` and `/proc/`
3. Check browser console for errors (F12)

### High Temperature

- Ensure adequate cooling/ventilation
- Check CPU load with `top` or `htop`
- Consider heatsink or fan upgrade

### Memory Issues

- Monitor with `free -h`
- Increase swap if needed
- Review running processes with `ps aux`

### Network Stats Not Working

- Verify network interface name (usually `eth0` or `wlan0`)
- Check with `ifconfig` or `ip addr`
- Update network parsing logic in `system-metrics.ts`

## Performance Tips

1. **Optimize Update Interval**: Increase interval to reduce CPU load
2. **Use Bun**: Significantly faster than Node.js for this workload
3. **Enable Compression**: Configure nginx/reverse proxy with gzip
4. **Database Caching** (optional): Store metrics in SQLite for analytics

## License

MIT - See LICENSE file

## Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit changes with descriptive messages
4. Push to branch
5. Open a Pull Request

## Support

For issues or questions:
- Check existing [GitHub Issues](https://github.com/pxn-ai/pi-power-panel/issues)
- Review [Troubleshooting](#troubleshooting) section
- File a new issue with system details and error logs

## Resources

- [Raspberry Pi Documentation](https://www.raspberrypi.com/documentation/)
- [Debian Trixie Release Notes](https://wiki.debian.org/DebianTrixie)
- [TanStack Start Docs](https://tanstack.com/start/latest)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)

---

**Built for Raspberry Pi 5 by the Smart-Freaks team** 🚀
