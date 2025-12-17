# 🪟 Windows Docker Desktop - One-Click Installation

## Prerequisites

**Only Docker Desktop for Windows is required!**

Download and install: https://docs.docker.com/desktop/install/windows-install/

## One-Click Installation

### Step 1: Open Docker Desktop Terminal

1. Open **Docker Desktop** application
2. Wait for Docker to fully start (whale icon in system tray should be steady)
3. Click on the **Terminal** button (or use PowerShell/Command Prompt)

### Step 2: Copy & Paste This Command

**Option A: Using Git (Recommended)**

If you have Git installed, copy and paste this **single command**:

```powershell
git clone https://github.com/LuisPuertollano/openhands2.git; cd openhands2; docker compose up -d --build
```

**Option B: Without Git (Download ZIP)**

1. Download ZIP: https://github.com/LuisPuertollano/openhands2/archive/refs/heads/main.zip
2. Extract to a folder (e.g., `C:\Users\YourName\openhands2`)
3. In Docker Desktop Terminal, copy and paste:

```powershell
cd C:\Users\YourName\openhands2
docker compose up -d --build
```

### Step 3: Wait for Initialization

First time setup takes **2-3 minutes**. You'll see:
- ⬇️ Pulling Docker images
- 🔨 Building containers
- ⚙️ Starting services
- ✅ Services running

### Step 4: Access the Application

Once complete, open your browser to:

**🌐 http://localhost:3001**

That's it! The system is now running with a persistent database.

## What Just Happened?

The single command:
1. ✅ Downloaded the complete RAMS system
2. ✅ Built PostgreSQL, Backend, and Frontend containers
3. ✅ Created persistent database storage (survives restarts)
4. ✅ Initialized database schema
5. ✅ Seeded 15 resources, 3 projects, 15 work packages
6. ✅ Started all services in the background

## Persistent Database Storage

**Your data is automatically saved!** 

The database uses a Docker volume named `openhands2_postgres_data` which persists even when containers are stopped or restarted.

### To verify persistent storage:

```powershell
docker volume ls
```

You should see: `openhands2_postgres_data`

## Managing the Application

### View Running Containers

```powershell
docker compose ps
```

### View Logs

```powershell
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f postgres
docker compose logs -f frontend
```

### Stop the Application (Keep Data)

```powershell
docker compose stop
```

### Start Again

```powershell
docker compose start
```

### Restart Everything

```powershell
docker compose restart
```

### Stop and Remove Containers (Keep Data)

```powershell
docker compose down
```

**Note:** Data remains in the volume. Next `docker compose up` will use existing data.

### Complete Reset (Delete All Data)

```powershell
# WARNING: This deletes all database data!
docker compose down -v
docker compose up -d --build
```

**Note:** The `-v` flag removes volumes. Database will be recreated with fresh mock data.

## One-Command Variations

### Run and Auto-Open Browser

```powershell
docker compose up -d --build; Start-Process "http://localhost:3001"
```

### Run and Follow Logs

```powershell
docker compose up --build
```

This keeps the terminal open showing live logs. Press `Ctrl+C` to stop.

### Quick Start (After First Setup)

```powershell
docker compose up -d
```

Starts in seconds using cached images.

## Verification Steps

### 1. Check All Containers Are Running

```powershell
docker compose ps
```

Expected output:
```
NAME                IMAGE                    STATUS
rams-postgres       postgres:14-alpine       Up (healthy)
rams-backend        openhands2-backend       Up
rams-frontend       openhands2-frontend      Up
```

### 2. Test Backend API

```powershell
curl http://localhost:3000/api/health
```

Or open in browser: http://localhost:3000/api/health

### 3. Test Frontend

Open browser: http://localhost:3001

You should see the RAMS Workload Management dashboard.

### 4. Check Database

```powershell
docker compose exec postgres psql -U postgres -d rams_workload -c "SELECT COUNT(*) FROM resources;"
```

Should return: `15` (mock resources)

## Troubleshooting

### Error: "port is already allocated"

**Problem:** Ports 3000, 3001, or 5432 are in use.

**Solution:**
```powershell
# Stop existing containers
docker compose down

# Find and kill process using port
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Error: "Cannot connect to Docker daemon"

**Problem:** Docker Desktop is not running.

**Solution:**
1. Start Docker Desktop application
2. Wait for the whale icon to be steady in system tray
3. Try the command again

### Backend Won't Start

**Problem:** Database initialization issues.

**Solution:**
```powershell
# Check logs
docker compose logs backend
docker compose logs postgres

# Reset everything
docker compose down -v
docker compose up -d --build
```

### Containers Keep Restarting

**Problem:** Service crashes on startup.

**Solution:**
```powershell
# Check what's wrong
docker compose logs --tail=50 backend

# Common causes:
# - Database not ready (wait 30 seconds)
# - Port conflicts (see "port already allocated" above)
# - Corrupted volume (reset with: docker compose down -v)
```

### "No such file or directory" Error

**Problem:** Not in the correct directory.

**Solution:**
```powershell
# Make sure you're in the openhands2 directory
cd path\to\openhands2

# Verify docker-compose.yml exists
dir docker-compose.yml

# Then run
docker compose up -d --build
```

## Advanced: Custom Configuration

### Change Ports

Create a `.env` file in the project root:

```env
BACKEND_PORT=3000
FRONTEND_PORT=3001
POSTGRES_PORT=5432
```

Then modify `docker-compose.yml` ports to use these variables.

### Change Database Password

Edit `docker-compose.yml`:

```yaml
services:
  postgres:
    environment:
      POSTGRES_PASSWORD: your_secure_password
  
  backend:
    environment:
      DB_PASSWORD: your_secure_password
```

Then:
```powershell
docker compose down -v
docker compose up -d --build
```

## Development Workflow

### Make Code Changes

1. Edit files in `backend/` or `frontend/`
2. Rebuild and restart:

```powershell
docker compose up -d --build
```

### Access Database Directly

```powershell
docker compose exec postgres psql -U postgres -d rams_workload
```

Inside PostgreSQL:
```sql
-- List all tables
\dt

-- Query resources
SELECT * FROM resources;

-- Exit
\q
```

### Run Tests

```powershell
docker compose exec backend npm run test:capacity
```

### Export Database

```powershell
docker compose exec postgres pg_dump -U postgres rams_workload > backup.sql
```

### Import Database

```powershell
Get-Content backup.sql | docker compose exec -T postgres psql -U postgres -d rams_workload
```

## Complete Workflow Example

```powershell
# 1. Clone and start (one-time setup)
git clone https://github.com/LuisPuertollano/openhands2.git
cd openhands2
docker compose up -d --build

# 2. View logs to confirm startup
docker compose logs -f

# Wait for "Backend API is ready!" message, then Ctrl+C

# 3. Open browser
Start-Process "http://localhost:3001"

# 4. Work with the application...

# 5. When done for the day
docker compose stop

# 6. Next day - start again (fast!)
docker compose start

# 7. Check status
docker compose ps

# 8. View logs if needed
docker compose logs -f backend
```

## Daily Usage

### Morning Startup

```powershell
cd path\to\openhands2
docker compose start
```

### Evening Shutdown

```powershell
docker compose stop
```

**Your data is preserved!** No need for `-v` flag.

## System Requirements

- **OS:** Windows 10/11 (64-bit)
- **RAM:** 4 GB minimum, 8 GB recommended
- **Disk:** 2 GB free space
- **CPU:** 2 cores minimum
- **Docker Desktop:** Latest version

## Performance Tips

### Speed Up Builds

Add to `docker-compose.yml`:

```yaml
services:
  backend:
    build:
      context: ./backend
      cache_from:
        - openhands2-backend:latest
```

### Reduce Resource Usage

In Docker Desktop:
1. Settings → Resources
2. Adjust CPU/Memory limits
3. Recommended: 2 CPUs, 4 GB RAM

### Clean Up Unused Data

```powershell
# Remove unused images
docker image prune -a

# Remove unused volumes (careful!)
docker volume prune

# Remove everything unused
docker system prune -a
```

## URLs Reference

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3001 | Main application UI |
| **Backend API** | http://localhost:3000 | REST API endpoints |
| **Health Check** | http://localhost:3000/api/health | API status |
| **Resources** | http://localhost:3000/api/resources | All resources |
| **Capacity** | http://localhost:3000/api/resources/capacity?year=2024&month=1 | Capacity data |
| **Projects** | http://localhost:3000/api/projects | All projects |
| **PostgreSQL** | localhost:5432 | Database (use pgAdmin/DBeaver) |

## Support & Documentation

- **Quick Start:** See [QUICK_START.md](QUICK_START.md)
- **Full Documentation:** See [README.md](README.md)
- **Docker Guide:** See [DOCKER_SETUP.md](DOCKER_SETUP.md)
- **Architecture:** See [ARCHITECTURE.md](ARCHITECTURE.md)

## Summary

**Installation is now just ONE command:**

```powershell
git clone https://github.com/LuisPuertollano/openhands2.git; cd openhands2; docker compose up -d --build
```

**Then open:** http://localhost:3001

**Your database is persistent and survives restarts!** 🎉

---

**Need help?** Check the troubleshooting section above or see [DOCKER_SETUP.md](DOCKER_SETUP.md) for detailed Docker information.
