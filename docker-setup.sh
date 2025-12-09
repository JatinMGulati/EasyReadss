#!/bin/bash
# EasyReads Docker Setup Script
# Run this script to set up and start your Docker environment

set -e  # Exit on error

echo "🚀 EasyReads Docker Setup"
echo "========================"
echo ""

# Step 1: Fix DNS (if needed)
echo "📡 Step 1: Configuring Docker DNS..."
if [ ! -f /etc/docker/daemon.json ]; then
    echo "   Creating Docker daemon.json..."
    sudo mkdir -p /etc/docker
    sudo tee /etc/docker/daemon.json > /dev/null << 'EOF'
{
  "dns": ["8.8.8.8", "8.8.4.4", "1.1.1.1"]
}
EOF
    echo "   ✅ DNS configuration created"
    echo "   🔄 Restarting Docker..."
    sudo systemctl restart docker
    sleep 2
else
    echo "   ✅ Docker daemon.json already exists"
fi

# Verify Docker is working
echo ""
echo "   Testing Docker..."
if docker ps > /dev/null 2>&1; then
    echo "   ✅ Docker is working"
else
    echo "   ❌ Docker is not working. Please check: sudo systemctl status docker"
    exit 1
fi

# Step 2: Create .env file
echo ""
echo "📝 Step 2: Setting up environment file..."
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "   ✅ Created .env from .env.example"
        echo "   ⚠️  IMPORTANT: Edit .env file and add your actual values!"
        echo "   Run: nano .env (or your preferred editor)"
    else
        echo "   ⚠️  .env.example not found. Creating empty .env..."
        touch .env
    fi
else
    echo "   ✅ .env file already exists"
fi

# Step 3: Build Docker images
echo ""
echo "🔨 Step 3: Building Docker images..."
echo "   This may take a few minutes on first run..."
docker-compose build

# Step 4: Start services
echo ""
echo "🚀 Step 4: Starting all services..."
docker-compose up -d

# Step 5: Wait for services to be ready
echo ""
echo "⏳ Step 5: Waiting for services to start..."
sleep 5

# Step 6: Check status
echo ""
echo "📊 Step 6: Checking service status..."
docker-compose ps

echo ""
echo "✅ Setup Complete!"
echo ""
echo "📋 Next Steps:"
echo "   • View logs: docker-compose logs -f"
echo "   • Stop services: docker-compose down"
echo "   • Restart services: docker-compose restart"
echo ""
echo "🌐 Access your application:"
echo "   • Frontend: http://localhost:5173"
echo "   • Backend API: http://localhost:5000/api"
echo ""

