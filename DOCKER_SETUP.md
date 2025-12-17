# 🐳 Docker-First Setup Guide

## Overview

The RAMS Workload Management System now runs entirely in Docker containers with **zero manual configuration required**. You no longer need to install Node.js or PostgreSQL on your local machine!

## What Changed?

### ✅ What's New

1. **Automatic Database Initialization**
   - Backend container automatically waits for PostgreSQL to be ready
   - Database schema is created automatically on first run
   - Mock data (15 resources, 3 projects) is seeded automatically
   - No manual `npm run db:setup` or `npm run db:seed` needed

2. **One-Command Startup**
   - **Linux/Mac**: `./start.sh`
   - **Windows**: `start.bat` (double-click or run from command prompt)
   - Scripts handle everything: checking Docker, building containers, starting services, opening browser

3. **Enhanced Docker Configuration**
   - PostgreSQL container with health checks
   - Backend waits for database to be ready before starting
   - Frontend automatically connects to backend API
   - Custom Docker networks for isolated communication
   - Persistent database storage with Docker volumes

4. **Developer Experience Improvements**
   - `.dockerignore` files optimize build speed
   - Automatic browser opening when ready
   - Colored console output with status indicators
   - Real-time log viewing
   - Simple troubleshooting commands

### 📋 Prerequisites

**Before**: Node.js 16+, PostgreSQL 14+, npm
**After**: Only Docker Desktop

That's it! Just install Docker and you're ready to go.

## Quick Start

### First Time Setup

1. **Install Docker Desktop**
   - Mac: https://docs.docker.com/desktop/install/mac-install/
   - Windows: https://docs.docker.com/desktop/install/windows-install/
   - Linux: https://docs.docker.com/engine/install/

2. **Start Docker Desktop**
   - Wait for it to fully start (check system tray/menu bar)

3. **Run the Application**
   
   **Linux/Mac:**
   ```bash
   ./start.sh
   ```
   
   **Windows:**
   ```batch
   start.bat
   ```
   
   Or double-click the file in File Explorer.

4. **Wait for Initialization**
   - First run takes 2-3 minutes (downloading images, building containers)
   - Subsequent runs take ~30 seconds
   - The script will automatically open http://localhost:45679 when ready

### What Happens Behind the Scenes

```
1. Docker checks ✓
   - Verifies Docker is installed and running
   
2. Building containers ⚙️
   - PostgreSQL: Official postgres:14-alpine image
   - Backend: Node.js 18 with PostgreSQL client
   - Frontend: Node.js 18 with React development server
   
3. Starting PostgreSQL 🗄️
   - Container starts with health checks
   - Waits for database to accept connections
   
4. Initializing Backend 🚀
   - Waits for PostgreSQL health check to pass
   - Checks if rams_workload database exists
   - If not: creates database schema
   - If not: seeds with 15 resources, 3 projects, 15 work packages
   - Starts Express API server on port 45678
   
5. Starting Frontend 🎨
   - Starts React development server on port 45679
   - Connects to backend API at http://localhost:45678
   
6. Opening Browser 🌐
   - Automatically opens http://localhost:45679
```

## Common Commands

### Starting & Stopping

```bash
# Start everything
./start.sh                    # Linux/Mac
start.bat                     # Windows

# Or manually with Docker Compose
docker compose up --build

# Stop everything (preserves data)
docker compose down

# Stop and delete all data (clean slate)
docker compose down -v
```

### Viewing Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f postgres
docker compose logs -f frontend

# Last 100 lines
docker compose logs --tail=100 backend
```

### Running Commands in Containers

```bash
# Run capacity test
docker compose exec backend npm run test:capacity

# Access PostgreSQL
docker compose exec postgres psql -U postgres -d rams_workload

# Check backend API
docker compose exec backend curl http://localhost:45678/api/health
```

### Restarting Services

```bash
# Restart all services
docker compose restart

# Restart specific service
docker compose restart backend

# Rebuild and restart after code changes
docker compose up --build
```

### Resetting the Database

```bash
# Clean reset (deletes all data)
docker compose down -v
docker compose up --build

# The database will be recreated and reseeded automatically
```

## Troubleshooting

### Docker Not Running

**Error**: "Cannot connect to the Docker daemon"

**Solution**:
1. Start Docker Desktop
2. Wait for it to fully start (check system tray)
3. Verify with: `docker info`

### Port Already in Use

**Error**: "Bind for 0.0.0.0:3000 failed: port is already allocated"

**Solution**:
```bash
# Stop existing containers
docker compose down

# Or find and kill the process using the port
# Linux/Mac
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Database Won't Initialize

**Error**: Backend logs show connection refused

**Solution**:
```bash
# Check PostgreSQL logs
docker compose logs postgres

# Check if PostgreSQL is healthy
docker compose ps

# If unhealthy, reset everything
docker compose down -v
docker compose up --build
```

### Containers Won't Build

**Error**: Build failures or dependency issues

**Solution**:
```bash
# Clean rebuild (removes cache)
docker compose down -v
docker compose build --no-cache
docker compose up
```

### Backend Takes Too Long to Start

**Issue**: Backend initializing for more than 2 minutes

**Solution**:
```bash
# Check what's happening
docker compose logs backend

# Common causes:
# 1. PostgreSQL not ready yet (wait a bit longer)
# 2. Database initialization in progress (normal on first run)
# 3. npm install running (normal on first build)
```

## Architecture

### Container Structure

```
┌─────────────────────────────────────────────────┐
│                  Host Machine                    │
│                                                  │
│  ┌────────────────────────────────────────────┐ │
│  │         Docker Network (rams-network)      │ │
│  │                                            │ │
│  │  ┌──────────────┐  ┌──────────────────┐  │ │
│  │  │  PostgreSQL  │  │     Backend      │  │ │
│  │  │   (port 5432)│  │   (port 45678)    │  │ │
│  │  │              │◄─┤  - Express API   │  │ │
│  │  │  - Database  │  │  - Auto-init DB  │  │ │
│  │  │  - Volumes   │  │  - CRUD routes   │  │ │
│  │  └──────────────┘  └──────────────────┘  │ │
│  │                            ▲              │ │
│  │                            │              │ │
│  │                    ┌───────┴──────────┐  │ │
│  │                    │     Frontend     │  │ │
│  │                    │   (port 45679)    │  │ │
│  │                    │  - React Dev     │  │ │
│  │                    │  - Dashboard     │  │ │
│  │                    └──────────────────┘  │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
│  Exposed Ports:                                  │
│  - 5432 → PostgreSQL (for external clients)     │
│  - 3000 → Backend API                            │
│  - 3001 → Frontend Web UI                        │
└─────────────────────────────────────────────────┘
```

### Automatic Initialization Flow

```
┌─────────────────────────────────────────────────────┐
│ 1. docker compose up --build                        │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│ 2. PostgreSQL Container Starts                      │
│    - Creates postgres database                      │
│    - Starts health checks (every 5s)                │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│ 3. Backend Container Waits                          │
│    - depends_on: postgres (health check)            │
│    - Waits for PostgreSQL to report healthy         │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│ 4. Backend Entrypoint Script Runs                   │
│    docker-entrypoint.sh:                            │
│    - Double-checks PostgreSQL connection            │
│    - Checks if rams_workload database exists        │
│    - If not: npm run db:setup (creates schema)      │
│    - If not: npm run db:seed (adds mock data)       │
│    - Starts: npm start (Express server)             │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│ 5. Backend API Ready                                │
│    - Listening on http://localhost:45678             │
│    - Health endpoint available: /api/health         │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│ 6. Frontend Container Starts                        │
│    - depends_on: backend                            │
│    - React dev server on http://localhost:45679      │
│    - Connects to REACT_APP_API_URL                  │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│ 7. System Ready! 🎉                                 │
│    - All services running                           │
│    - Database populated with mock data              │
│    - Frontend accessible in browser                 │
└─────────────────────────────────────────────────────┘
```

## Development Workflow

### Making Code Changes

**Backend changes:**
```bash
# Edit files in backend/
# Restart backend container
docker compose restart backend

# Or rebuild if you added dependencies
docker compose up --build backend
```

**Frontend changes:**
```bash
# Edit files in frontend/
# React hot reload works automatically!
# Just save and see changes in browser
```

**Database schema changes:**
```bash
# Edit backend/schema.sql
# Reset database
docker compose down -v
docker compose up --build
```

### Working with the Database

```bash
# Connect to PostgreSQL
docker compose exec postgres psql -U postgres -d rams_workload

# Run SQL queries
docker compose exec postgres psql -U postgres -d rams_workload -c "SELECT * FROM resources;"

# Export data
docker compose exec postgres pg_dump -U postgres rams_workload > backup.sql

# Import data
docker compose exec -T postgres psql -U postgres -d rams_workload < backup.sql
```

### Testing

```bash
# Run capacity validation test
docker compose exec backend npm run test:capacity

# Test API endpoints
curl http://localhost:45678/api/health
curl http://localhost:45678/api/resources
curl "http://localhost:45678/api/resources/capacity?year=2024&month=1"
```

## Comparison: Before vs After

### Before (Traditional Setup)

```bash
# Install prerequisites
brew install node postgresql  # Mac
# or download and install manually

# Start PostgreSQL
brew services start postgresql

# Backend setup
cd backend
npm install
cp .env.example .env
# Edit .env with credentials
npm run db:setup
npm run db:seed
npm start  # Keep terminal open

# Frontend setup (new terminal)
cd frontend
npm install
cp .env.example .env
npm start  # Keep terminal open

# Total: ~15 minutes, 2 terminals, manual config
```

### After (Docker Setup)

```bash
# Install Docker Desktop (one time)

# Run the system
./start.sh

# Total: 30 seconds, automatic, no config
```

## Benefits

### For Users
- ✅ No version conflicts (Node.js, PostgreSQL)
- ✅ Consistent environment across all machines
- ✅ One command to rule them all
- ✅ Easy to reset and start fresh
- ✅ No manual database setup

### For Developers
- ✅ Same environment in development and production
- ✅ Easy to onboard new team members
- ✅ Isolated from other projects
- ✅ Easy to test different configurations
- ✅ CI/CD ready

### For DevOps
- ✅ Reproducible builds
- ✅ Easy to deploy
- ✅ Scalable architecture
- ✅ Health checks built-in
- ✅ Log aggregation ready

## Next Steps

1. **Run the system**: `./start.sh`
2. **Explore the UI**: http://localhost:45679
3. **Check the API**: http://localhost:45678/api/health
4. **Read the docs**: See [README.md](README.md) for full documentation
5. **Make it yours**: Customize the mock data in `backend/scripts/seed_database.js`

## Support

- **Documentation**: [README.md](README.md), [QUICK_START.md](QUICK_START.md)
- **API Reference**: [ARCHITECTURE.md](ARCHITECTURE.md)
- **Docker Issues**: See troubleshooting section above
- **Docker Docs**: https://docs.docker.com/

---

**Welcome to the Docker-first era! 🐳🚀**
