# Docker Commands - Step by Step

## Prerequisites Check
```bash
# 1. Verify Docker is installed
docker --version
docker-compose --version

# 2. Check Docker service is running
sudo systemctl status docker
```

## Step 1: Fix DNS Issue (If Needed)
```bash
# Configure Docker DNS to resolve Docker Hub
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json > /dev/null << 'EOF'
{
  "dns": ["8.8.8.8", "8.8.4.4", "1.1.1.1"]
}
EOF

# Restart Docker
sudo systemctl restart docker

# Verify Docker is working
docker ps
```

## Step 2: Create Environment File
```bash
# Copy the example env file
cp .env.example .env

# Edit .env and fill in your actual values
nano .env
# (or use your preferred editor: vim, code, etc.)
```

## Step 3: Build Docker Images
```bash
# Build all services (frontend, backend, mongodb)
docker-compose build

# If build fails, try without cache
docker-compose build --no-cache
```

## Step 4: Start All Services
```bash
# Start all containers in detached mode
docker-compose up -d

# Or start in foreground (to see logs)
docker-compose up
```

## Step 5: Check Container Status
```bash
# List all running containers
docker-compose ps

# Check logs for all services
docker-compose logs

# Check logs for specific service
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mongodb

# Follow logs in real-time
docker-compose logs -f
```

## Step 6: Verify Services Are Running
```bash
# Check if services are accessible
curl http://localhost:5000/api/health
curl http://localhost:5173

# Or open in browser:
# Frontend: http://localhost:5173
# Backend API: http://localhost:5000/api
```

## Common Commands

### Stop Services
```bash
# Stop all containers
docker-compose down

# Stop and remove volumes (⚠️ deletes data)
docker-compose down -v
```

### Restart Services
```bash
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart backend
```

### Rebuild After Code Changes
```bash
# Rebuild and restart
docker-compose up -d --build

# Rebuild specific service
docker-compose build backend
docker-compose up -d backend
```

### View Logs
```bash
# All logs
docker-compose logs

# Specific service
docker-compose logs frontend

# Follow logs
docker-compose logs -f backend

# Last 100 lines
docker-compose logs --tail=100
```

### Execute Commands in Containers
```bash
# Open shell in backend container
docker-compose exec backend sh

# Run npm install in backend
docker-compose exec backend npm install

# Open shell in frontend container
docker-compose exec frontend sh
```

### Clean Up
```bash
# Stop and remove containers
docker-compose down

# Remove containers, networks, and volumes
docker-compose down -v

# Remove unused images
docker image prune

# Remove all unused Docker resources
docker system prune
```

## Production Commands

### Build and Run Production
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Start production services
docker-compose -f docker-compose.prod.yml up -d

# Check production logs
docker-compose -f docker-compose.prod.yml logs -f
```

## Troubleshooting

### If Build Fails
```bash
# Check Docker daemon logs
sudo journalctl -u docker -n 50

# Check container logs
docker-compose logs

# Rebuild without cache
docker-compose build --no-cache
```

### If Containers Won't Start
```bash
# Check what's wrong
docker-compose ps
docker-compose logs

# Restart Docker service
sudo systemctl restart docker

# Try starting again
docker-compose up -d
```

### If Ports Are Already in Use
```bash
# Find what's using the port
sudo lsof -i :5000
sudo lsof -i :5173

# Kill the process or change ports in docker-compose.yml
```

