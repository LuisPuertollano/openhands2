# Quick Start Guide

## Prerequisites

- Node.js 16+ ([Download](https://nodejs.org/))
- PostgreSQL 14+ ([Download](https://www.postgresql.org/download/))
- npm (comes with Node.js)

## Option 1: Automated Setup (Recommended)

### Linux/Mac

```bash
./setup.sh
```

### Windows

```bash
# Install backend dependencies
cd backend
npm install
npm run db:setup
npm run db:seed

# Install frontend dependencies
cd ../frontend
npm install
```

## Option 2: Manual Setup

### Step 1: Backend Setup

```bash
cd backend
npm install

# Configure database (edit if needed)
cp .env.example .env

# Initialize database
npm run db:setup

# Seed with mock data
npm run db:seed
```

### Step 2: Frontend Setup

```bash
cd frontend
npm install

# Configure API endpoint (edit if needed)
cp .env.example .env
```

## Running the Application

### Terminal 1 - Backend API

```bash
cd backend
npm start
```

Server will start on: http://localhost:3000

### Terminal 2 - Frontend React App

```bash
cd frontend
npm start
```

App will open automatically at: http://localhost:3001

## Option 3: Docker Setup

### Requirements
- Docker
- Docker Compose

### Run

```bash
docker-compose up
```

This will start:
- PostgreSQL on port 5432
- Backend API on port 3000
- Frontend on port 3001

Access the app at: http://localhost:3001

## Testing the System

### 1. Run Capacity Validation Test

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

### Database Connection Failed

**Problem**: Cannot connect to PostgreSQL

**Solution**:
1. Ensure PostgreSQL is running
2. Check credentials in `backend/.env`
3. Verify database exists: `psql -U postgres -l`

### Port Already in Use

**Problem**: Port 3000 or 3001 already in use

**Solution**:
1. Change port in `.env` files
2. Or stop the conflicting process:
   ```bash
   # Linux/Mac
   lsof -ti:3000 | xargs kill -9
   ```

### NPM Install Fails

**Problem**: Dependencies won't install

**Solution**:
1. Clear npm cache: `npm cache clean --force`
2. Delete `node_modules` and try again
3. Update npm: `npm install -g npm@latest`

### Frontend Can't Reach API

**Problem**: API calls fail from frontend

**Solution**:
1. Verify backend is running on port 3000
2. Check `REACT_APP_API_URL` in `frontend/.env`
3. Ensure no CORS issues (backend has CORS enabled)

## Next Steps

1. **Explore the API**: Check out `/api/health` endpoint
2. **Review Database**: Connect with a PostgreSQL client
3. **Customize Data**: Modify seed script for your needs
4. **Read Full Docs**: See [README.md](README.md) for complete documentation

## Support

For detailed documentation, architecture, and API reference, see [README.md](README.md)

---

**Happy capacity planning! 🚂⚙️**
