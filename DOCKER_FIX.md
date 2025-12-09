# Docker Issues and Fixes

## Issue 1: Permission Denied Error

**Error:** `permission denied while trying to connect to the Docker daemon socket`

**Solution for Arch Linux:**

1. **Add your user to the docker group:**
   ```bash
   sudo usermod -aG docker $USER
   ```

2. **Log out and log back in** (or restart your session) for the changes to take effect.

3. **Verify it works:**
   ```bash
   docker ps
   ```

**Alternative (if above doesn't work):**
```bash
# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Or use sudo for docker commands temporarily
sudo docker-compose build
```

## Issue 2: Environment Variable Warnings

**Warning:** `The "VARIABLE_NAME" variable is not set. Defaulting to a blank string.`

**Solution:**
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and fill in your actual values:
   ```bash
   nano .env
   # or use your preferred editor
   ```

3. The warnings are now reduced (variables have default empty values), but you should still set them for the app to work properly.

## Issue 3: Version Field Warning

**Warning:** `the attribute 'version' is obsolete`

**Status:** ✅ **FIXED** - Removed `version` field from docker-compose files

## Quick Test

After fixing permissions, test Docker:
```bash
# Test Docker access
docker ps

# Test docker-compose
docker-compose --version

# Build without warnings (after creating .env)
docker-compose build
```

## For Hyprland Users

If you're using Hyprland and the group change doesn't work immediately:

1. **Restart the Hyprland session:**
   - Log out and log back in
   - Or restart Hyprland: `hyprctl dispatch exit`

2. **Verify groups:**
   ```bash
   groups
   # Should show 'docker' in the list
   ```

3. **If still not working, use newgrp:**
   ```bash
   newgrp docker
   docker ps
   ```
