# 🔌 Port Configuration Guide

## Overview

The RAMS Workload Management System uses **high port numbers (45678, 45679)** by default to avoid conflicts with common development servers. It also includes **automatic port conflict detection** and **configurable ports**.

## 🎯 Default Ports

| Service | Default Port | Why? |
|---------|--------------|------|
| **Backend API** | 45678 | High port to avoid conflicts with Node.js (3000), Rails (3000), etc. |
| **Frontend** | 45679 | High port to avoid conflicts with React (3000-3001), Vue (8080), etc. |
| **PostgreSQL** | 5432 | Standard PostgreSQL port |

**Benefits of high port numbers:**
- ✅ Avoids conflicts with common development tools (Node.js, React, Angular, Vue, etc.)
- ✅ Reduces installation failures
- ✅ Allows running multiple projects simultaneously
- ✅ Professional port allocation (45000+ range is rarely used)

## 🎯 Problem Solved

**Before:** Installation would fail if port 3000 or 3001 was already in use (extremely common with other development servers).

**Now:** 
- Uses high ports (45678/45679) by default to avoid conflicts
- Automatically detects any remaining port conflicts
- Allows you to choose different ports interactively!

---

## 🚀 Quick Start

### Automatic Port Conflict Detection

When you run `./start.sh` (Linux/Mac) or `start.bat` (Windows), the system will:

1. ✅ Check if ports 45678, 45679, and 5432 are available
2. ⚠️ Alert you if any ports are in use
3. 💡 Offer you options to resolve the conflict

### Interactive Port Selection

If a port conflict is detected, you'll see:

```
⚠️  Port 45678 (Backend API) is already in use by PID 12345

==================================================
⚠️  PORT CONFLICT DETECTED
==================================================

You have several options:

1) Choose different ports (recommended)
2) Continue anyway (may fail if ports are in use)
3) Exit and manually free the ports

Enter your choice (1/2/3):
```

#### Option 1: Choose Different Ports (Recommended)

The installer will prompt you for new ports:

```
Please enter new port numbers (press Enter to keep current):

PostgreSQL port [current: 5432]: 5433
Backend API port [current: 45678]: 8080
Frontend port [current: 45679]: 8081

✅ Configuration saved to .env file
   PostgreSQL: localhost:5433
   Backend:    localhost:8080
   Frontend:   localhost:8081
```

The configuration is automatically saved to `.env` file and will be used for future runs.

#### Option 2: Continue Anyway

Try to start with current ports (may fail if truly in use).

#### Option 3: Exit and Free Ports Manually

Exit and manually kill the processes using the ports.

---

## 📝 Manual Port Configuration

### Method 1: Using .env File (Recommended)

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit .env file:**
   ```env
   # RAMS Workload Management System - Port Configuration
   
   POSTGRES_PORT=5433
   BACKEND_PORT=8080
   FRONTEND_PORT=8081
   ```

3. **Run the system:**
   ```bash
   ./start.sh           # Linux/Mac
   start.bat            # Windows
   ```

   Or:
   ```bash
   docker compose up -d --build
   ```

4. **Access the app:**
   ```
   http://localhost:8081
   ```

### Method 2: Environment Variables

Set environment variables before running:

**Linux/Mac:**
```bash
export POSTGRES_PORT=5433
export BACKEND_PORT=8080
export FRONTEND_PORT=8081
docker compose up -d --build
```

**Windows (PowerShell):**
```powershell
$env:POSTGRES_PORT=5433
$env:BACKEND_PORT=8080
$env:FRONTEND_PORT=8081
docker compose up -d --build
```

**Windows (CMD):**
```batch
set POSTGRES_PORT=5433
set BACKEND_PORT=8080
set FRONTEND_PORT=8081
docker compose up -d --build
```

### Method 3: Inline with Docker Compose

**Linux/Mac:**
```bash
POSTGRES_PORT=5433 BACKEND_PORT=8080 FRONTEND_PORT=8081 docker compose up -d --build
```

**Windows (PowerShell):**
```powershell
$env:POSTGRES_PORT="5433"; $env:BACKEND_PORT="8080"; $env:FRONTEND_PORT="8081"; docker compose up -d --build
```

---

## 🔍 Checking Port Usage

### Linux / Mac

**Check if port is in use:**
```bash
lsof -i :3000
lsof -i :3001
lsof -i :5432
```

**Find and kill process:**
```bash
# Find process ID
lsof -ti :3000

# Kill process
lsof -ti :3000 | xargs kill -9

# Or combined
kill -9 $(lsof -ti :3000)
```

**Alternative using netstat:**
```bash
netstat -tuln | grep :3000
```

### Windows

**Check if port is in use:**
```batch
netstat -ano | findstr :3000
netstat -ano | findstr :3001
netstat -ano | findstr :5432
```

**Find and kill process:**
```batch
# Find process (shows PID in last column)
netstat -ano | findstr :3000

# Kill process (replace PID with actual number)
taskkill /PID 12345 /F
```

**Using PowerShell:**
```powershell
# Find process
Get-NetTCPConnection -LocalPort 3000 | Select-Object -Property OwningProcess

# Kill process
Stop-Process -Id 12345 -Force
```

---

## 🎛️ Port Configuration Reference

### Default Ports

| Service | Default Port | Purpose |
|---------|--------------|---------|
| **PostgreSQL** | 5432 | Database server |
| **Backend** | 45678 | Express API server (high port to avoid conflicts) |
| **Frontend** | 45679 | React development server (high port to avoid conflicts) |

### Alternative Ports (if needed)

If you prefer standard development ports or if high ports are blocked:

| Service | Alternative Ports |
|---------|-------------------|
| **PostgreSQL** | 5433, 5434, 15432 |
| **Backend** | 3000, 8000, 8080, 4000, 5000 |
| **Frontend** | 3001, 8001, 8081, 4001, 5001 |

### Port Requirements

- **PostgreSQL:** Any available port (typically 5432-5439)
- **Backend:** Any available port (typically 3000-9999)
- **Frontend:** Any available port (typically 3000-9999)

**Note:** Frontend must know backend port (configured automatically via `REACT_APP_API_URL`)

---

## 🔄 Changing Ports After Installation

### If System is Running

1. **Stop the system:**
   ```bash
   docker compose down
   ```

2. **Edit .env file:**
   ```bash
   nano .env  # or use any text editor
   ```

3. **Change ports:**
   ```env
   POSTGRES_PORT=5433
   BACKEND_PORT=8080
   FRONTEND_PORT=8081
   ```

4. **Restart:**
   ```bash
   docker compose up -d --build
   ```

5. **Access new URL:**
   ```
   http://localhost:8081
   ```

### If System is Not Running

Just edit `.env` file and run:
```bash
./start.sh           # Linux/Mac
start.bat            # Windows
```

The new ports will be used automatically.

---

## 🐛 Troubleshooting

### Port Still Showing as "In Use" After Killing Process

**Problem:** Port doesn't free up immediately.

**Solution:**
```bash
# Wait 10 seconds for OS to release port
sleep 10

# Or restart Docker
docker restart $(docker ps -q)

# Or reboot computer (last resort)
```

### Backend Can't Connect to PostgreSQL

**Problem:** Backend connects to wrong PostgreSQL port.

**Solution:**
The backend always connects to PostgreSQL container's internal port 5432. The `POSTGRES_PORT` only affects external access.

If you need external database access on a different port, that's fine. Backend still connects internally.

### Frontend Can't Connect to Backend

**Problem:** `REACT_APP_API_URL` points to wrong port.

**Solution:**
The docker-compose.yml automatically sets `REACT_APP_API_URL` based on `BACKEND_PORT`. If you changed backend port, restart containers:

```bash
docker compose down
docker compose up -d --build
```

### Port Change Not Taking Effect

**Problem:** Changed .env but still using old ports.

**Solution:**
1. Stop containers: `docker compose down`
2. Remove old containers: `docker compose rm -f`
3. Rebuild: `docker compose up -d --build`
4. Or use: `docker compose up -d --build --force-recreate`

### .env File Not Being Read

**Problem:** Ports from .env not used.

**Solution:**
1. Make sure `.env` is in the same directory as `docker-compose.yml`
2. Check file name is exactly `.env` (not `.env.txt`)
3. Remove any quotes around port numbers
4. Restart Docker daemon if needed

---

## 📋 Examples

### Example 1: Backend Port Conflict

**Scenario:** Port 3000 is used by another Node.js app.

**Solution:**
```bash
# Create .env file
echo "POSTGRES_PORT=5432" > .env
echo "BACKEND_PORT=8080" >> .env
echo "FRONTEND_PORT=3001" >> .env

# Start system
./start.sh
```

**Access:** http://localhost:3001 (frontend still on 3001)

### Example 2: All Ports in Use

**Scenario:** Running multiple projects.

**Solution:**
```bash
# Use alternative ports for everything
echo "POSTGRES_PORT=5433" > .env
echo "BACKEND_PORT=8080" >> .env
echo "FRONTEND_PORT=8081" >> .env

# Start system
docker compose up -d --build
```

**Access:** http://localhost:8081

### Example 3: Corporate Firewall

**Scenario:** Ports 3000-3999 blocked by firewall.

**Solution:**
```bash
# Use higher port numbers
echo "POSTGRES_PORT=5432" > .env
echo "BACKEND_PORT=4000" >> .env
echo "FRONTEND_PORT=4001" >> .env

./start.sh
```

**Access:** http://localhost:4001

### Example 4: Multiple Instances

**Scenario:** Run multiple RAMS instances simultaneously.

**Solution:**
```bash
# Instance 1 (default ports)
cd /path/to/instance1
docker compose up -d

# Instance 2 (custom ports)
cd /path/to/instance2
echo "POSTGRES_PORT=5433" > .env
echo "BACKEND_PORT=8080" >> .env
echo "FRONTEND_PORT=8081" >> .env
docker compose up -d
```

**Access:**
- Instance 1: http://localhost:3001
- Instance 2: http://localhost:8081

---

## 🔐 Security Notes

### Port Exposure

By default, all services expose ports to `0.0.0.0` (all network interfaces).

**To restrict to localhost only**, edit `docker-compose.yml`:

```yaml
services:
  postgres:
    ports:
      - "127.0.0.1:${POSTGRES_PORT:-5432}:5432"
  
  backend:
    ports:
      - "127.0.0.1:${BACKEND_PORT:-3000}:3000"
  
  frontend:
    ports:
      - "127.0.0.1:${FRONTEND_PORT:-3001}:3001"
```

This prevents external network access.

### Firewall Rules

If using custom ports, update firewall rules:

**Linux (ufw):**
```bash
sudo ufw allow 8080/tcp
sudo ufw allow 8081/tcp
```

**Windows (PowerShell as Admin):**
```powershell
New-NetFirewallRule -DisplayName "RAMS Backend" -Direction Inbound -LocalPort 8080 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "RAMS Frontend" -Direction Inbound -LocalPort 8081 -Protocol TCP -Action Allow
```

---

## 📖 Additional Resources

- **Docker Compose Docs:** https://docs.docker.com/compose/environment-variables/
- **Port Troubleshooting:** See [DOCKER_SETUP.md](DOCKER_SETUP.md#troubleshooting)
- **Windows Guide:** See [WINDOWS_DOCKER_DESKTOP.md](WINDOWS_DOCKER_DESKTOP.md)
- **Main README:** See [README.md](README.md)

---

## 💡 Tips

1. **Always use .env file** for persistent configuration
2. **Document your ports** if using non-standard values
3. **Check ports before starting** to avoid conflicts
4. **Use high port numbers** (8000+) to avoid common conflicts
5. **Keep .env file in .gitignore** (already configured)

---

## Summary

✅ **Automatic port conflict detection**  
✅ **Interactive port selection**  
✅ **Persistent configuration via .env**  
✅ **Multiple configuration methods**  
✅ **Detailed troubleshooting guide**  

**No more installation failures due to port conflicts!** 🎉
