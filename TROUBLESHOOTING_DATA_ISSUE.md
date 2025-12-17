# 🔧 Troubleshooting: Data Not Showing & Missing Add Buttons

## Problem
The Capacity Overview, Budget Benchmarking, and Project Hierarchy pages are not showing any data or the new Add buttons.

## Root Cause
1. **Port Configuration Mismatch**: The frontend `.env` file had outdated port numbers
2. **React Build Cache**: React apps require a rebuild to pick up environment variable changes
3. **Database Not Seeded**: The database may be empty if the seed script wasn't run

---

## ✅ Solution (Complete Fix)

### Step 1: Stop All Containers
```bash
cd /path/to/project
docker compose down
```

### Step 2: Remove Old Images (Force Clean Build)
```bash
docker compose down --volumes --rmi all
```
**Warning:** This will delete all data in the database. This is fine since we'll reseed it.

### Step 3: Verify Updated Configuration Files
The following files have been updated with correct ports:
- ✅ `frontend/.env` - Now points to `http://localhost:45678/api`
- ✅ `frontend/.env.example` - Updated to port 45678
- ✅ `docker-compose.yml` - Already configured correctly

### Step 4: Rebuild Everything from Scratch
```bash
docker compose build --no-cache
```
**Important:** The `--no-cache` flag ensures React rebuilds with the new API URL.

### Step 5: Start the Containers
```bash
docker compose up -d
```

### Step 6: Verify Containers Are Running
```bash
docker compose ps
```
You should see:
- `rams-postgres` - healthy
- `rams-backend` - running
- `rams-frontend` - running

### Step 7: Wait for Backend to Initialize
```bash
# Watch the logs to see when the backend is ready
docker compose logs -f backend
```
Wait until you see: `✅ Server is running on port 3000` (internal port)

Press `Ctrl+C` to stop watching logs.

### Step 8: Seed the Database with Mock Data
```bash
docker compose exec backend npm run seed
```

You should see output like:
```
Creating 15 mock resources...
  Created resource: Alice Johnson (35h/week)
  Created resource: Bob Smith (40h/week)
  ...

Creating 3 mock projects...
  Created project: Railway Signaling System
  ...

Creating 5 work packages per project...
  Created WP: Railway Signaling S-WP1 (FMECA, 156.78h)
  ...

Creating activities (linking resources to work packages)...
  Created 45 activities

Database seeding completed successfully!
Summary:
  - Resources: 15
  - Projects: 3
  - Work Packages: 15
  - Activities: 45
```

### Step 9: Verify Backend API Works
```bash
# Test resources endpoint
curl http://localhost:45678/api/resources

# Test projects endpoint
curl http://localhost:45678/api/projects

# Test work packages endpoint
curl http://localhost:45678/api/work-packages
```

Each should return JSON data with the mock records.

### Step 10: Access the Frontend
Open your browser and navigate to:
```
http://localhost:45679
```

### Step 11: Verify Each Page

#### ✅ Capacity Overview Tab
- Should show: `➕ Add Resource` button at top
- Should show: Table with 15 resources and their utilization
- Should show: Bar chart of capacity

#### ✅ Budget Benchmarking Tab
- Should show: Table with 15 work packages
- Should show: Standard effort vs. actual hours comparison
- Should show: Budget status (OK/Over Budget)

#### ✅ Project Hierarchy Tab
- Should show: `➕ Add Project` button at top
- Should show: 3 projects with expand arrows (▶)
- Click ▶ to expand project
- Should show: `➕ WP` button next to project name
- Should show: 5 work packages under each project
- Click ▶ to expand work package
- Should show: `➕ Activity` button next to work package name
- Should show: Activities with resource names and hours

---

## 🎯 Quick One-Command Fix

If you want to do it all in one go (after the files are committed):

```bash
cd /path/to/project
docker compose down --volumes --rmi all && \
docker compose build --no-cache && \
docker compose up -d && \
sleep 10 && \
docker compose exec backend npm run seed && \
echo "✅ Setup complete! Open http://localhost:45679"
```

---

## 🔍 Additional Troubleshooting

### Issue: "Cannot connect to backend"

**Check if backend is running:**
```bash
docker compose logs backend
```

**Check if backend is accessible:**
```bash
curl http://localhost:45678/api/resources
```

**If you get connection refused:**
1. Check firewall settings
2. Verify port 45678 is not blocked
3. Restart Docker Desktop (if on Windows/Mac)

### Issue: "Add buttons not visible"

**This means React didn't rebuild with new components.**

**Solution:**
```bash
docker compose down
docker rmi rams-frontend  # Remove frontend image
docker compose build --no-cache frontend
docker compose up -d
```

**Alternative (if using npm directly):**
```bash
cd frontend
rm -rf node_modules/.cache
npm start
```

### Issue: "Data shows but add buttons missing"

**This means the modal components weren't included in the build.**

**Verify files exist:**
```bash
ls -la frontend/src/components/common/Add*.js
```

You should see:
- AddActivityModal.js
- AddProjectModal.js
- AddResourceModal.js
- AddWorkPackageModal.js
- Modal.js

**If missing, pull latest from git:**
```bash
git pull origin main
```

**Then rebuild:**
```bash
docker compose build --no-cache frontend
docker compose up -d
```

### Issue: "Database is empty after seeding"

**Check if database was created:**
```bash
docker compose exec postgres psql -U postgres -d rams_workload -c "\dt"
```

You should see tables: `activities`, `change_logs`, `projects`, `resources`, `work_packages`

**If tables don't exist, run setup:**
```bash
docker compose exec backend npm run setup
docker compose exec backend npm run seed
```

### Issue: "Port already in use"

**Check what's using the port:**
```bash
# On Linux/Mac
lsof -i :45678
lsof -i :45679

# On Windows
netstat -ano | findstr :45678
netstat -ano | findstr :45679
```

**Solution 1 - Stop the conflicting process**

**Solution 2 - Use different ports:**

Create a `.env` file in the project root:
```bash
BACKEND_PORT=55678
FRONTEND_PORT=55679
POSTGRES_PORT=55432
```

Then update `frontend/.env`:
```
REACT_APP_API_URL=http://localhost:55678/api
PORT=55679
```

And rebuild:
```bash
docker compose build --no-cache
docker compose up -d
```

---

## 🧪 Testing Add Buttons

### Test Add Resource
1. Go to Capacity Overview tab
2. Click `➕ Add Resource`
3. Fill in: Name="Test Person", Contract Hours=35
4. Click "✓ Create Resource"
5. Modal should close
6. Table should show new resource immediately

### Test Add Project
1. Go to Project Hierarchy tab
2. Click `➕ Add Project`
3. Fill in: Name="Test Project", dates
4. Click "✓ Create Project"
5. Should appear in hierarchy tree

### Test Add Work Package
1. Expand a project (click ▶)
2. Click `➕ WP` next to project name
3. Notice project is pre-selected
4. Fill in: Name="Test WP", RAMS Discipline=FMECA, Standard Effort=100
5. Click "✓ Create Work Package"
6. Should appear under the project

### Test Add Activity
1. Expand a work package (click ▶)
2. Click `➕ Activity` next to work package name
3. Notice work package is pre-selected
4. Select a resource
5. Fill in: Planned Hours=20, dates
6. Click "✓ Create Activity"
7. Should appear under the work package

---

## 📋 Checklist After Fix

- [ ] All containers running (`docker compose ps`)
- [ ] Backend logs show "Server is running"
- [ ] Database seeded (15 resources, 3 projects, 15 WPs, ~45 activities)
- [ ] Frontend accessible at http://localhost:45679
- [ ] Capacity Overview shows data and "Add Resource" button
- [ ] Budget Benchmarking shows work packages
- [ ] Project Hierarchy shows projects and "Add Project" button
- [ ] Can expand projects to see "Add WP" buttons
- [ ] Can expand WPs to see "Add Activity" buttons
- [ ] All modals open and close correctly
- [ ] Can create new resources/projects/WPs/activities
- [ ] New items appear immediately after creation

---

## 🆘 Still Not Working?

### Get Full System Status
```bash
# Check all containers
docker compose ps

# Check backend logs
docker compose logs backend | tail -50

# Check frontend logs
docker compose logs frontend | tail -50

# Check database connection
docker compose exec postgres psql -U postgres -d rams_workload -c "SELECT COUNT(*) FROM resources;"

# Check API directly
curl http://localhost:45678/api/resources | jq

# Check if frontend can reach backend (from inside frontend container)
docker compose exec frontend curl http://backend:3000/api/resources
```

### Get Browser Console Logs
1. Open browser at http://localhost:45679
2. Press F12 (Developer Tools)
3. Go to Console tab
4. Look for errors (red text)
5. Common errors:
   - **CORS error**: Backend not allowing frontend origin
   - **Network error**: Frontend can't reach backend (wrong URL)
   - **404 error**: API endpoint doesn't exist
   - **500 error**: Backend crashed (check backend logs)

---

## 📝 Changes Made to Fix This Issue

1. **Updated `frontend/.env`**
   - Changed `REACT_APP_API_URL` from `http://localhost:3000/api` to `http://localhost:45678/api`
   - Changed `PORT` from `3001` to `45679`

2. **Updated `frontend/.env.example`**
   - Same changes for consistency

3. **Verified `docker-compose.yml`**
   - Already correctly configured with port mapping
   - Environment variables properly set

4. **Created this troubleshooting guide**

---

## 🎓 Understanding the Issue

### Why Did This Happen?

1. **React Build-Time Variables**: React apps "bake in" environment variables at build time. When you change `.env`, you must rebuild.

2. **Port Change**: We changed from ports 3000/3001 to 45678/45679 to avoid conflicts, but the frontend `.env` wasn't updated.

3. **Docker Layer Caching**: Docker caches build layers. Without `--no-cache`, it may use old builds.

### Why Not Just Edit docker-compose.yml?

The `docker-compose.yml` already had the correct environment variable:
```yaml
environment:
  REACT_APP_API_URL: http://localhost:${BACKEND_PORT:-45678}/api
```

But React only sees environment variables that exist:
1. At build time (in `.env` file or build args)
2. With `REACT_APP_` prefix

So we needed to update the `.env` file AND rebuild.

---

## ✅ Summary

**The Fix:**
1. Updated `frontend/.env` with correct API URL (port 45678)
2. Rebuild containers with `--no-cache` flag
3. Seed database with mock data
4. Verify all pages show data and buttons

**Pull latest changes:**
```bash
git pull origin main
```

**Run the fix:**
```bash
docker compose down --volumes --rmi all
docker compose build --no-cache
docker compose up -d
sleep 10
docker compose exec backend npm run seed
```

**Verify:**
Open http://localhost:45679 and check all three tabs!

---

✨ **After these steps, you should see all data and add buttons working perfectly!** ✨
