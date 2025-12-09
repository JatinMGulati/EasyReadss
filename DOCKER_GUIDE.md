# 🐳 Docker Integration Guide for EasyReads

## 📚 What is Docker?

Docker is a platform that allows you to package your application and all its dependencies into containers. Think of containers as lightweight, portable boxes that contain everything your application needs to run.

### Why Use Docker?

- **Consistency**: Your app runs the same way on any machine
- **Isolation**: Each service runs in its own container
- **Easy Setup**: No need to install Node.js, MongoDB, etc. on your machine
- **Portability**: Works on Windows, Mac, and Linux
- **Easy Deployment**: Deploy to any server easily

## 🏗️ Docker Concepts

### 1. **Dockerfile**
A recipe that tells Docker how to build your application image.

### 2. **Docker Image**
A snapshot of your application with all dependencies (like a template).

### 3. **Docker Container**
A running instance of an image (like a house built from a blueprint).

### 4. **Docker Compose**
A tool to run multiple containers together (frontend, backend, database).

## 📦 Project Structure

```
EasyReads/
├── frontend/
│   ├── Dockerfile          # Frontend container recipe
│   └── .dockerignore       # Files to exclude from build
├── backend/
│   ├── Dockerfile          # Backend container recipe
│   └── .dockerignore       # Files to exclude from build
├── docker-compose.yml      # Orchestrates all containers
└── .env.example           # Environment variables template
```

## 🚀 Step-by-Step Setup

### Step 1: Install Docker

**Windows/Mac:**
1. Download Docker Desktop from https://www.docker.com/products/docker-desktop
2. Install and restart your computer
3. Open Docker Desktop and wait for it to start

**Linux:**

**Arch Linux:**
```bash
# Install Docker and Docker Compose
sudo pacman -S docker docker-compose

# Start and enable Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Add your user to docker group (to run without sudo)
sudo usermod -aG docker $USER

# For Hyprland users: Restart your session
hyprctl dispatch exit
# Then log back in

# Alternative: Activate docker group in current session
newgrp docker

# Verify installation
docker --version
docker-compose --version
```

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install docker.io docker-compose
sudo systemctl start docker
sudo systemctl enable docker

# Add your user to docker group (to run without sudo)
sudo usermod -aG docker $USER
# Log out and log back in for this to take effect
```

**Verify Installation:**
```bash
docker --version
docker-compose --version
```

### Step 2: Create Dockerfiles

#### Frontend Dockerfile
Located at: `frontend/Dockerfile`

This file tells Docker how to build your React frontend.

#### Backend Dockerfile
Located at: `backend/Dockerfile`

This file tells Docker how to build your Express backend.

### Step 3: Create Docker Compose File

Located at: `docker-compose.yml` (root directory)

This file defines all services (frontend, backend, MongoDB) and how they connect.

### Step 4: Create Environment Files

Copy `.env.example` files and fill in your actual values.

### Step 5: Build and Run

```bash
# Build all containers
docker-compose build

# Start all services
docker-compose up

# Or run in background (detached mode)
docker-compose up -d
```

## 📝 Common Docker Commands

### Building
```bash
# Build all services
docker-compose build

# Build specific service
docker-compose build frontend
docker-compose build backend
```

### Running
```bash
# Start all services
docker-compose up

# Start in background
docker-compose up -d

# Start specific service
docker-compose up frontend
```

### Stopping
```bash
# Stop all services
docker-compose down

# Stop and remove volumes (clears database)
docker-compose down -v
```

### Viewing Logs
```bash
# All services
docker-compose logs

# Specific service
docker-compose logs frontend
docker-compose logs backend

# Follow logs (like tail -f)
docker-compose logs -f backend
```

### Managing Containers
```bash
# List running containers
docker ps

# List all containers (including stopped)
docker ps -a

# Stop a container
docker stop <container-name>

# Start a stopped container
docker start <container-name>

# Remove a container
docker rm <container-name>
```

### Executing Commands
```bash
# Run command in running container
docker-compose exec backend npm install
docker-compose exec frontend npm install

# Open shell in container
docker-compose exec backend sh
docker-compose exec frontend sh
```

## 🔧 Troubleshooting

### Problem: Port Already in Use
**Solution:**
```bash
# Find what's using the port
# Linux/Mac
lsof -i :5000
lsof -i :5173

# Windows
netstat -ano | findstr :5000

# Kill the process or change port in docker-compose.yml
```

### Problem: Permission Denied (Docker Socket)
**Error:** `permission denied while trying to connect to the Docker daemon socket`

**Solution for Arch Linux:**
```bash
# 1. Add your user to docker group
sudo usermod -aG docker $USER

# 2. For Hyprland: Restart your session
hyprctl dispatch exit
# Then log back in

# 3. Alternative: Activate docker group in current session
newgrp docker

# 4. Verify it works
docker ps
```

**If still not working:**
```bash
# Check if you're in docker group
groups | grep docker

# Check Docker service status
sudo systemctl status docker

# Start Docker service if not running
sudo systemctl start docker
sudo systemctl enable docker
```

### Problem: DNS Resolution Error (Can't Reach Docker Hub)
**Error:** `failed to resolve source metadata for docker.io/library/node:18-alpine: dial tcp: lookup registry-1.docker.io: Temporary failure in name resolution`

**Solution 1 (Recommended): Configure Docker DNS**
```bash
# Create Docker daemon configuration
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json > /dev/null << 'EOF'
{
  "dns": ["8.8.8.8", "8.8.4.4", "1.1.1.1"]
}
EOF

# Restart Docker
sudo systemctl restart docker

# Verify
docker-compose build
```

**Solution 2: Configure DNS via systemd override**
```bash
# Edit Docker service
sudo systemctl edit docker

# Add this content:
[Service]
ExecStart=
ExecStart=/usr/bin/dockerd --dns 8.8.8.8 --dns 8.8.4.4

# Reload and restart
sudo systemctl daemon-reload
sudo systemctl restart docker
```

**Solution 3: Check network connectivity**
```bash
# Test DNS resolution
nslookup registry-1.docker.io

# Test connectivity
curl -I https://registry-1.docker.io/v2/

# If behind proxy, configure Docker proxy settings
sudo mkdir -p /etc/systemd/system/docker.service.d
sudo tee /etc/systemd/system/docker.service.d/http-proxy.conf > /dev/null << 'EOF'
[Service]
Environment="HTTP_PROXY=http://proxy.example.com:8080"
Environment="HTTPS_PROXY=http://proxy.example.com:8080"
EOF

sudo systemctl daemon-reload
sudo systemctl restart docker
```

### Problem: Container Won't Start
**Solution:**
```bash
# Check logs
docker-compose logs <service-name>

# Rebuild without cache
docker-compose build --no-cache

# Remove and recreate
docker-compose down
docker-compose up --build
```

### Problem: Database Connection Issues
**Solution:**
```bash
# Make sure MongoDB container is running
docker-compose ps

# Check MongoDB logs
docker-compose logs mongodb

# Restart MongoDB
docker-compose restart mongodb
```

### Problem: Port Already in Use (MongoDB)
**Error:** `failed to bind host port 0.0.0.0:27017/tcp: address already in use`

**Solution:**
You have a MongoDB service running on your host machine. Two options:

**Option 1 (Recommended): Use Different Port**
- The `docker-compose.yml` is already configured to use port `27018` on host
- Docker MongoDB accessible at: `localhost:27018`
- Containers still use `27017` internally (no changes needed)
- Just run: `docker-compose up -d`

**Option 2: Stop Host MongoDB**
```bash
# Stop and disable host MongoDB
sudo systemctl stop mongodb
sudo systemctl disable mongodb

# Then change docker-compose.yml port back to "27017:27017"
```

**Note:** If you need to connect from host to Docker MongoDB, use `localhost:27018`

### Problem: Environment Variables Not Working
**Solution:**
- Make sure `.env` file exists in root directory (for Docker)
- Copy from template: `cp .env.example .env`
- Fill in your actual values in `.env`
- Check that variable names match in docker-compose.yml
- Restart containers after changing .env files: `docker-compose down && docker-compose up -d`

**Note:** Warnings about unset variables are normal if `.env` doesn't exist, but the app won't work without proper values.

### Problem: Changes Not Reflecting
**Solution:**
```bash
# Rebuild the container
docker-compose build --no-cache <service>
docker-compose up -d <service>
```

## 🎯 Development Workflow

### First Time Setup
```bash
# 1. Create .env files
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env

# 2. Fill in your actual values in .env files

# 3. Build containers
docker-compose build

# 4. Start everything
docker-compose up
```

### Daily Development
```bash
# Start services
docker-compose up

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Making Code Changes
- Frontend: Changes are hot-reloaded automatically
- Backend: Changes require container restart (or use nodemon in Dockerfile)

### Adding Dependencies
```bash
# Install in container
docker-compose exec frontend npm install <package>
docker-compose exec backend npm install <package>

# Or rebuild container
docker-compose build[jatingulati@JatinGulati EasyReads]$ docker-compose up -d
[+] Running 11/11
 ✔ mongodb Pulled                                                                                                                                                                                                                    93.8s 
   ✔ 7e49dc6156b0 Pull complete                                                                                                                                                                                                      16.7s 
   ✔ 9985892e237f Pull complete                                                                                                                                                                                                       0.8s 
   ✔ a901f9c6e182 Pull complete                                                                                                                                                                                                      16.8s 
   ✔ 9d2241e4f0ab Pull complete                                                                                                                                                                                                       1.4s 
   ✔ 897d7bc84cb2 Pull complete                                                                                                                                                                                                       1.4s 
   ✔ 211ac2b07d3c Pull complete                                                                                                                                                                                                       1.5s 
   ✔ 4afb2761a021 Pull complete                                                                                                                                                                                                      87.0s 
   ✔ 049450a11439 Pull complete                                                                                                                                                                                                      16.9s 
   ✔ bce9988cd94d Download complete                                                                                                                                                                                                   0.0s 
   ✔ 6ae501915f39 Download complete                                                                                                                                                                                                   1.6s 
[+] Running 4/5
 ✔ Network easyreads_easyreads-network  Created                                                                                                                                                                                       0.0s 
 ✔ Volume easyreads_mongodb_data        Created                                                                                                                                                                                       0.0s 
 ⠦ Container easyreads-mongodb          Starting                                                                                                                                                                                      4.7s 
 ✔ Container easyreads-backend          Created                                                                                                                                                                                       1.2s 
 ✔ Container easyreads-frontend         Created                                                                                                                                                                                       2.9s 
Error response from daemon: failed to set up container networking: driver failed programming external connectivity on endpoint easyreads-mongodb (e1052b935decb09966ad1902b3d0592065e67212d3ceaa649305b8502821dd52): failed to bind host port 0.0.0.0:27017/tcp: address already in use
[jatingulati@JatinGulati EasyReads]$ 
```

## 🚢 Production Deployment

### Building for Production
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Run production
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Variables
- Use `.env` files for development
- Use environment variables or secrets management for production
- Never commit `.env` files with real credentials

## 📊 Understanding docker-compose.yml

```yaml
services:          # List of containers to run
  frontend:        # Service name
    build:         # How to build the image
    ports:         # Port mapping (host:container)
    volumes:       # File system mounts
    environment:   # Environment variables
    depends_on:    # Dependencies (start order)
```

## 🔐 Security Best Practices

1. **Never commit `.env` files** - Add to `.gitignore`
2. **Use secrets** for production credentials
3. **Keep images updated** - Regularly rebuild with latest base images
4. **Limit exposed ports** - Only expose necessary ports
5. **Use non-root users** in containers when possible

## 📚 Additional Resources

- **Docker Official Docs**: https://docs.docker.com/
- **Docker Compose Docs**: https://docs.docker.com/compose/
- **Docker Hub**: https://hub.docker.com/ (for base images)

## ✅ Quick Reference

```bash
# Start everything
docker-compose up -d

# View logs
docker-compose logs -f

# Stop everything
docker-compose down

# Rebuild after code changes
docker-compose up --build

# Clean everything (removes containers, images, volumes)
docker-compose down -v --rmi all
```

---

**Need Help?** Check the logs first: `docker-compose logs`

