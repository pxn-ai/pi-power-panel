#!/bin/bash
# Installation script for Pi Power Panel systemd service
# Run with: sudo bash install-service.sh

set -e

SERVICE_NAME="pi-power-panel"
SERVICE_FILE="pi-power-panel.service"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEST="/etc/systemd/system/$SERVICE_FILE"

echo "📦 Installing Pi Power Panel systemd service..."

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo "❌ This script must be run as root (use sudo)"
   exit 1
fi

# Copy service file
if [ ! -f "$SCRIPT_DIR/$SERVICE_FILE" ]; then
    echo "❌ Error: $SERVICE_FILE not found in $SCRIPT_DIR"
    exit 1
fi

echo "📋 Copying service file to $DEST..."
cp "$SCRIPT_DIR/$SERVICE_FILE" "$DEST"
chmod 644 "$DEST"

# Reload systemd daemon
echo "🔄 Reloading systemd daemon..."
systemctl daemon-reload

# Enable service
echo "✅ Enabling service to start on boot..."
systemctl enable "$SERVICE_NAME"

# Start service
echo "🚀 Starting service..."
systemctl start "$SERVICE_NAME"

# Show status
echo ""
echo "📊 Service status:"
systemctl status "$SERVICE_NAME"

echo ""
echo "✨ Installation complete!"
echo ""
echo "Useful commands:"
echo "  View logs:           sudo journalctl -u $SERVICE_NAME -f"
echo "  Check status:        sudo systemctl status $SERVICE_NAME"
echo "  Restart:             sudo systemctl restart $SERVICE_NAME"
echo "  Stop:                sudo systemctl stop $SERVICE_NAME"
echo "  Disable auto-start:  sudo systemctl disable $SERVICE_NAME"
echo ""
echo "Dashboard URL: http://localhost:5173 (or http://<pi-ip>:5173)"
echo ""
echo "Note: this service now uses /usr/bin/npm run dev, so Node.js and npm must be installed."
