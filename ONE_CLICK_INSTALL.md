# 🚀 One-Click Installation - Copy & Paste Commands

## ✅ Database is PERSISTENT
Your data is automatically saved in a Docker volume and survives container restarts, stops, and rebuilds!

---

## 🪟 Windows - Docker Desktop Terminal

### Step 1: Open Docker Desktop Terminal
1. Launch Docker Desktop
2. Wait for Docker to start (whale icon steady)
3. Click **Terminal** button (or use PowerShell/CMD)

### Step 2: Copy & Paste This Command

```powershell
git clone https://github.com/LuisPuertollano/openhands2.git; cd openhands2; docker compose up -d --build
```

### Step 3: Wait 2-3 Minutes (First Time Only)

You'll see:
- ⬇️ Pulling images
- 🔨 Building containers
- ⚙️ Starting services
- ✅ Services running

### Step 4: Open Browser

```
http://localhost:45679
```

**Done!** 🎉

---

## 🐧 Linux / 🍎 Mac

### Copy & Paste This Command

```bash
git clone https://github.com/LuisPuertollano/openhands2.git && cd openhands2 && docker compose up -d --build
```

### Open Browser

```
http://localhost:45679
```

**Done!** 🎉

---

## 📦 What Gets Installed?

- ✅ PostgreSQL 14 (with persistent storage)
- ✅ Node.js Backend API (Express)
- ✅ React Frontend Dashboard
- ✅ 15 Mock Resources (mix of 35h/40h contracts)
- ✅ 3 Sample Projects (RAMS Railway Projects)
- ✅ 15 Work Packages (FMECA, Hazard Log, SIL, etc.)
- ✅ 45+ Activities with capacity planning

**Total Size:** ~500 MB (Docker images + code)  
**Setup Time:** 2-3 minutes first run, 30 seconds after that

---

## 🔄 Daily Usage

### Start the System

```bash
docker compose start
```

### Stop the System (Keep Data)

```bash
docker compose stop
```

### View Logs

```bash
docker compose logs -f
```

### Complete Reset (Delete All Data)

```bash
docker compose down -v
docker compose up -d --build
```

---

## 🔍 Verification

### Check All Services Running

```bash
docker compose ps
```

Expected output:
```
NAME            STATUS
rams-postgres   Up (healthy)
rams-backend    Up
rams-frontend   Up
```

### Test Backend API

Open in browser:
```
http://localhost:45678/api/health
```

Should return:
```json
{"status":"ok","database":"connected"}
```

### Test Frontend

Open in browser:
```
http://localhost:45679
```

Should show: **RAMS Workload Management System** dashboard

---

## 📊 Features Available

1. **Capacity Overview**
   - Monthly utilization heatmap
   - Resource allocation tracking
   - Over-capacity warnings

2. **Budget Benchmarking**
   - Standard vs. Actual effort comparison
   - Budget overrun alerts
   - RAMS discipline filtering

3. **Project Hierarchy**
   - Tree view navigation
   - Project → Work Package → Activity
   - Detailed information panels

4. **Reports & Export**
   - PDF/Excel capacity reports
   - Budget analysis reports
   - Audit trail logs

---

## 💾 Database Persistence

### How It Works

Your data is stored in a Docker volume named `openhands2_postgres_data`.

This volume:
- ✅ Survives `docker compose stop`
- ✅ Survives `docker compose down`
- ✅ Survives `docker compose restart`
- ✅ Survives `docker compose up --build`
- ✅ Survives computer restarts

### Only Deleted When

```bash
docker compose down -v  # The -v flag deletes volumes
```

### Verify Persistent Storage

```bash
docker volume ls | grep openhands2
```

Should show:
```
local     openhands2_postgres_data
```

### Check Database Data

```bash
# Connect to database
docker compose exec postgres psql -U postgres -d rams_workload

# Inside PostgreSQL, run:
SELECT COUNT(*) FROM resources;  -- Should return 15
SELECT COUNT(*) FROM projects;   -- Should return 3
SELECT COUNT(*) FROM work_packages;  -- Should return 15
\q  # Exit
```

---

## 🛠️ Troubleshooting

### Port Already in Use

**Error:** `Bind for 0.0.0.0:3000 failed: port is already allocated`

**Solution:**
```bash
# Stop existing containers
docker compose down

# Windows: Kill process
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac: Kill process
lsof -ti:3000 | xargs kill -9
```

### Docker Not Running

**Error:** `Cannot connect to the Docker daemon`

**Solution:**
1. Start Docker Desktop
2. Wait for it to fully start
3. Try again

### Containers Keep Restarting

**Solution:**
```bash
# Check logs
docker compose logs backend
docker compose logs postgres

# Reset everything
docker compose down -v
docker compose up -d --build
```

---

## 📁 Project Structure

```
openhands2/
├── backend/              # Node.js + Express API
│   ├── src/             # Controllers, routes, models
│   ├── schema.sql       # Database schema
│   ├── scripts/         # Setup, seed, test scripts
│   └── Dockerfile       # Backend container config
├── frontend/            # React dashboard
│   ├── src/            # Components, services
│   ├── public/         # Static files
│   └── Dockerfile      # Frontend container config
├── docker-compose.yml   # Orchestration config
├── INSTALL.md          # This file
├── README.md           # Full documentation
└── WINDOWS_DOCKER_DESKTOP.md  # Detailed Windows guide
```

---

## 🌐 Access Points

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:45679 | Main UI |
| **Backend API** | http://localhost:45678/api | REST API |
| **Health Check** | http://localhost:45678/api/health | Status |
| **Resources** | http://localhost:45678/api/resources | All resources |
| **Projects** | http://localhost:45678/api/projects | All projects |
| **Database** | localhost:5432 | PostgreSQL |

---

## 🎯 Quick Commands Reference

```bash
# First time setup (copy-paste this)
git clone https://github.com/LuisPuertollano/openhands2.git && cd openhands2 && docker compose up -d --build

# Daily start
docker compose start

# Daily stop (keeps data)
docker compose stop

# View all logs
docker compose logs -f

# View specific service logs
docker compose logs -f backend
docker compose logs -f postgres

# Check status
docker compose ps

# Restart all services
docker compose restart

# Restart specific service
docker compose restart backend

# Access database
docker compose exec postgres psql -U postgres -d rams_workload

# Run capacity test
docker compose exec backend npm run test:capacity

# Complete reset (deletes data)
docker compose down -v && docker compose up -d --build

# Cleanup unused Docker resources
docker system prune -a
```

---

## 📚 Full Documentation

- **Windows Detailed Guide:** [WINDOWS_DOCKER_DESKTOP.md](WINDOWS_DOCKER_DESKTOP.md)
- **Quick Start Guide:** [QUICK_START.md](QUICK_START.md)
- **Docker Setup Guide:** [DOCKER_SETUP.md](DOCKER_SETUP.md)
- **Architecture Overview:** [ARCHITECTURE.md](ARCHITECTURE.md)
- **Full README:** [README.md](README.md)

---

## ✨ Summary

**Before:**
- Install Node.js
- Install PostgreSQL
- Configure environment
- Run database setup
- Run seed scripts
- Start backend (terminal 1)
- Start frontend (terminal 2)
- Total: 15+ minutes

**After:**
```bash
git clone https://github.com/LuisPuertollano/openhands2.git && cd openhands2 && docker compose up -d --build
```
- Total: 30 seconds (+ 2 min first-time download)

**Database:** Automatically persistent with Docker volumes! 🎉

---

**Questions?** See [WINDOWS_DOCKER_DESKTOP.md](WINDOWS_DOCKER_DESKTOP.md) for detailed troubleshooting and advanced usage.
