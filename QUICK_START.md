# Quick Start Guide

## Prerequisites

**Only Docker is required!** No need to install Node.js or PostgreSQL.

- Docker Desktop ([Download](https://www.docker.com/products/docker-desktop))
  - Mac: https://docs.docker.com/desktop/install/mac-install/
  - Windows: https://docs.docker.com/desktop/install/windows-install/
  - Linux: https://docs.docker.com/engine/install/

## Option 1: One-Command Start (Recommended) 🚀

This is the easiest way! Everything runs in Docker containers with automatic setup.

### Linux/Mac

```bash
./start.sh
```

This single script will:
- ✅ Check if Docker is installed and running
- ✅ Build all containers (PostgreSQL, Backend, Frontend)
- ✅ Initialize the database automatically
- ✅ Seed with mock data (15 resources, 3 projects)
- ✅ Start all services
- ✅ Open the application in your browser

### Windows

```batch
start.bat
```

Double-click `start.bat` or run it from Command Prompt.

**That's it!** The application will be available at http://localhost:3001

## Option 2: Manual Docker Setup

If you prefer to run Docker commands manually:

```bash
# Build and start all containers
docker compose up --build

# Or run in background (detached mode)
docker compose up --build -d

# View logs
docker compose logs -f

# Stop everything
docker compose down

# Clean reset (removes database data)
docker compose down -v
```

**What happens automatically:**
- PostgreSQL container starts and initializes
- Backend waits for PostgreSQL to be ready
- Backend automatically creates database schema
- Backend seeds mock data (15 resources, 3 projects, 15 WPs)
- Backend API starts on port 3000
- Frontend starts on port 3001

Access the app at: http://localhost:3001

## Option 3: Traditional Setup (For Developers)

**⚠️ Only if you want to develop without Docker**

### Prerequisites for this option:
- Node.js 16+ ([Download](https://nodejs.org/))
- PostgreSQL 14+ ([Download](https://www.postgresql.org/download/))
- npm (comes with Node.js)

### Step 1: Backend Setup

```bash
cd backend
npm install

# Configure database
cp .env.example .env
# Edit .env with your PostgreSQL credentials

# Initialize database
npm run db:setup

# Seed with mock data
npm run db:seed
```

### Step 2: Frontend Setup

```bash
cd frontend
npm install

# Configure API endpoint
cp .env.example .env
```

### Step 3: Run

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

Access at: http://localhost:3001

## Testing the System

### 1. Run Capacity Validation Test

**Using Docker:**
```bash
docker compose exec backend npm run test:capacity
```

**Without Docker:**
```bash
cd backend
npm run test:capacity
```

This will:
- Calculate monthly capacity for all 15 mock resources
- Show utilization percentages
- Display warnings for over-capacity resources
- Provide summary statistics

### 2. Test API Endpoints

```bash
# Health check
curl http://localhost:3000/api/health

# Get all resources
curl http://localhost:3000/api/resources

# Get capacity data for January 2024
curl "http://localhost:3000/api/resources/capacity?year=2024&month=1"

# Get budget status
curl http://localhost:3000/api/work-packages/budget-status
```

### 3. Explore the Frontend

Visit http://localhost:3001 and explore:

1. **Capacity Overview** (`/capacity`)
   - View resource utilization heatmap
   - See capacity warnings
   - Export reports to Excel/PDF

2. **Budget Benchmarking** (`/benchmarking`)
   - Compare standard vs. actual effort
   - Filter by project and RAMS tag
   - View budget overruns

3. **Project Hierarchy** (`/hierarchy`)
   - Expand/collapse project tree
   - Drill down: Project → Work Package → Activity
   - View resource assignments

## Mock Data Overview

The seeded database includes:

- **15 Resources**: Mix of 35h and 40h contracts
  - Alice Johnson (35h), Bob Smith (40h), etc.
  
- **3 Projects**:
  - Railway Signaling System
  - Metro Train Control Platform
  - Safety Critical Software Upgrade

- **15 Work Packages**: 5 per project
  - Tagged with: FMECA, Hazard Log, SIL, Risk Assessment, Safety Case

- **45+ Activities**: Random assignments across 2024

## Common Issues

### Docker Issues

#### Docker Not Running

**Problem**: "Cannot connect to Docker daemon"

**Solution**:
1. Start Docker Desktop
2. Wait for Docker to fully start (check system tray/menu bar)
3. Run `docker info` to verify

#### Containers Won't Start

**Problem**: Containers fail to build or start

**Solution**:
```bash
# Clean rebuild
docker compose down -v
docker compose build --no-cache
docker compose up
```

#### Port Already in Use

**Problem**: Port 3000, 3001, or 5432 already in use

**Solution**:
```bash
# Stop existing containers
docker compose down

# Or find and stop conflicting process
# Linux/Mac
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

#### Database Not Initializing

**Problem**: Backend can't connect to database

**Solution**:
```bash
# Check logs
docker compose logs postgres
docker compose logs backend

# Reset database
docker compose down -v
docker compose up --build
```

### Traditional Setup Issues (Non-Docker)

#### Database Connection Failed

**Problem**: Cannot connect to PostgreSQL

**Solution**:
1. Ensure PostgreSQL is running
2. Check credentials in `backend/.env`
3. Verify database exists: `psql -U postgres -l`

#### NPM Install Fails

**Problem**: Dependencies won't install

**Solution**:
1. Clear npm cache: `npm cache clean --force`
2. Delete `node_modules` and try again
3. Update npm: `npm install -g npm@latest`

## Next Steps

1. **Explore the API**: Check out `/api/health` endpoint
2. **Review Database**: Connect with a PostgreSQL client
3. **Customize Data**: Modify seed script for your needs
4. **Read Full Docs**: See [README.md](README.md) for complete documentation

## Support

For detailed documentation, architecture, and API reference, see [README.md](README.md)

---

**Happy capacity planning! 🚂⚙️**
