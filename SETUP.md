# Quick Setup Guide - Pi Power Panel

## On Your Raspberry Pi 5

### 1. Install Dependencies

```bash
# Update system packages
sudo apt-get update && sudo apt-get upgrade -y

# Install Node.js 22+ (recommended)
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify npm is available
npm --version
```

### 2. Clone/Update the Repository

```bash
cd /home/pasan/GitHub
git clone https://github.com/pxn-ai/pi-power-panel.git
# OR if already cloned:
cd pi-power-panel && git pull
```

### 3. Install Project Dependencies

```bash
cd /home/pasan/GitHub/pi-power-panel

npm install
```

### 4. Test the Server

```bash
# Run development server
npm run dev

# Visit: http://localhost:5173
# From another device: http://<pi-ip>:5173
```

### 5. Set Up Auto-Start on Reboot

```bash
# Make the install script executable
chmod +x install-service.sh

# Install and enable service
sudo bash install-service.sh
```

That's it! The dashboard will now:
- ✅ Start automatically on reboot
- ✅ Restart if it crashes
- ✅ Collect real Raspberry Pi metrics
- ✅ Be accessible at http://<pi-ip>:5173

### Troubleshooting

**Check service status:**
```bash
sudo systemctl status pi-power-panel
```

**View live logs:**
```bash
sudo journalctl -u pi-power-panel -f
```

**If metrics are 0, check permissions:**
```bash
# Most metrics require root access to /proc and /sys
# Verify the service is running as the correct user
cat /etc/systemd/system/pi-power-panel.service

# If needed, run with sudo
sudo systemctl edit pi-power-panel
# Change User=pasan to User=root (less secure but easier)
# Then restart: sudo systemctl restart pi-power-panel
```

**Restart/Stop the service:**
```bash
sudo systemctl restart pi-power-panel
sudo systemctl stop pi-power-panel
```

**Disable auto-start:**
```bash
sudo systemctl disable pi-power-panel
```

## File Reference

- **src/routes/api.metrics.ts** - API endpoint that provides metrics
- **src/lib/system-metrics.ts** - Core metrics collection from /proc and /sys
- **src/hooks/use-metrics.ts** - React hook that fetches metrics from API
- **pi-power-panel.service** - Systemd service file
- **install-service.sh** - Installation script for the service

## Default Configuration

- **Port:** 5173 (development) / 3000 (production)
- **Host:** 0.0.0.0 (accessible from any device)
- **Auto-restart:** Enabled (5 second delay between restarts)
- **Environment:** NODE_ENV=production

To change port or host, edit `/etc/systemd/system/pi-power-panel.service` and add Environment variables:

```ini
Environment="PORT=3000"
Environment="HOST=127.0.0.1"
```

Then restart: `sudo systemctl restart pi-power-panel`
