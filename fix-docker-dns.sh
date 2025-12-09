#!/bin/bash
# Quick fix script for Docker DNS resolution issues on Arch Linux

echo "🔧 Fixing Docker DNS Configuration..."
echo ""

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then 
    echo "⚠️  This script needs sudo privileges."
    echo "Please run: sudo bash fix-docker-dns.sh"
    exit 1
fi

# Create Docker config directory
echo "📁 Creating /etc/docker directory..."
mkdir -p /etc/docker

# Create daemon.json with DNS configuration
echo "📝 Creating Docker daemon.json with DNS servers..."
cat > /etc/docker/daemon.json << 'EOF'
{
  "dns": ["8.8.8.8", "8.8.4.4", "1.1.1.1"]
}
EOF

# Restart Docker service
echo "🔄 Restarting Docker service..."
systemctl restart docker

# Wait a moment for Docker to start
sleep 2

# Check Docker status
echo ""
echo "✅ Docker DNS configuration updated!"
echo ""
echo "Testing Docker..."
if docker ps > /dev/null 2>&1; then
    echo "✅ Docker is running correctly"
    echo ""
    echo "You can now try: docker-compose build"
else
    echo "⚠️  Docker might not be running. Check with: sudo systemctl status docker"
fi

