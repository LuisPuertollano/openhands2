# 🎯 Data Display Fix - README

## Issue Resolved
Fixed the issue where Capacity Overview, Budget Benchmarking, and Project Hierarchy pages were not showing data or Add buttons.

---

## 🔧 What Was Wrong?

The frontend `.env` file contained outdated port numbers from before the port change to 45678/45679. React applications need to be rebuilt when API URLs change because they use environment variables at runtime.

---

## ✅ What Was Fixed?

### 1. Frontend Configuration Updated
- **File:** `frontend/.env.example`
- **Changed:** API URL from `http://localhost:3000/api` to `http://localhost:45678/api`
- **Changed:** Frontend port from `3001` to `45679`

### 2. Frontend Dockerfile Enhanced
- **File:** `frontend/Dockerfile`
- **Added:** Default environment variables for API URL
- **Added:** Comments for clarity
- **Result:** Ensures correct API URL is available in container

### 3. Automated Fix Scripts Created
Two scripts to automatically fix and rebuild everything:

#### Linux/Mac: `fix-and-rebuild.sh`
- Stops all containers
- Removes old images and volumes
- Rebuilds from scratch with correct configuration
- Seeds database with mock data
- Verifies everything is working

#### Windows: `fix-and-rebuild.bat`
- Same functionality as the shell script
- Windows-compatible commands

### 4. Comprehensive Documentation
Created three documentation files:

- **`FIX_DATA_DISPLAY.md`** - Quick fix guide with simple instructions
- **`TROUBLESHOOTING_DATA_ISSUE.md`** - Detailed troubleshooting for all scenarios
- **`DATA_FIX_README.md`** - This file, explaining what was fixed

---

## 🚀 How to Apply the Fix

### Option 1: Automated (Recommended)

**On Linux/Mac:**
```bash
cd /path/to/project
./fix-and-rebuild.sh
```

**On Windows:**
```cmd
cd C:\path\to\project
fix-and-rebuild.bat
```

**Time:** 3-5 minutes  
**Result:** Everything fixed automatically

### Option 2: Manual Steps

```bash
# 1. Pull latest changes
git pull origin main

# 2. Stop and clean everything
docker compose down --volumes --rmi all

# 3. Rebuild from scratch
docker compose build --no-cache

# 4. Start containers
docker compose up -d

# 5. Wait for backend to initialize
sleep 10

# 6. Seed database
docker compose exec backend npm run seed

# 7. Open browser
open http://localhost:45679
```

---

## ✅ Expected Results After Fix

### 1. Capacity Overview Page (📊)
- ✅ **"➕ Add Resource"** button visible at top
- ✅ Table shows 15 mock resources:
  - Names: Alice Johnson, Bob Smith, Carol Williams, etc.
  - Contract hours: 35h or 40h per week
  - Capacity and utilization percentages
- ✅ Bar chart visualization of capacity
- ✅ Can create new resources via modal form

### 2. Budget Benchmarking Page (📈)
- ✅ Table shows 15 work packages
- ✅ Columns display:
  - Project name
  - Work package name
  - RAMS tag (FMECA, Hazard Log, SIL, Risk Assessment, Safety Case)
  - Standard effort hours
  - Actual hours (sum of activities)
  - Budget status (OK / Over Budget)
- ✅ Real-time budget comparison

### 3. Project Hierarchy Page (🌳)
- ✅ **"➕ Add Project"** button visible at top
- ✅ 3 mock projects shown:
  1. Railway Signaling System
  2. Metro Train Control Platform
  3. Safety Critical Software Upgrade
- ✅ Each project expandable with ▶ button
- ✅ **"➕ WP"** button next to each project
- ✅ 5 work packages under each project
- ✅ Each WP expandable with ▶ button
- ✅ **"➕ Activity"** button next to each WP
- ✅ Activities showing resource assignments

### 4. All Modal Forms Working
- ✅ Add Resource modal opens and creates resources
- ✅ Add Project modal opens and creates projects
- ✅ Add Work Package modal opens with RAMS disciplines dropdown
- ✅ Add Activity modal opens with resource/WP selection
- ✅ All forms validate input
- ✅ All forms show loading states
- ✅ Data refreshes immediately after creation

---

## 🔍 Verification Steps

Run these commands to verify everything is working:

### 1. Check Containers
```bash
docker compose ps
```
**Expected:** 3 containers running (postgres, backend, frontend)

### 2. Check Backend Data
```bash
curl http://localhost:45678/api/resources | jq
```
**Expected:** JSON array with 15 resources

### 3. Check Frontend
```bash
curl http://localhost:45679 | grep RAMS
```
**Expected:** HTML containing "RAMS Workload Management"

### 4. Check Database Records
```bash
docker compose exec postgres psql -U postgres -d rams_workload -c "SELECT COUNT(*) FROM resources;"
docker compose exec postgres psql -U postgres -d rams_workload -c "SELECT COUNT(*) FROM projects;"
docker compose exec postgres psql -U postgres -d rams_workload -c "SELECT COUNT(*) FROM work_packages;"
docker compose exec postgres psql -U postgres -d rams_workload -c "SELECT COUNT(*) FROM activities;"
```
**Expected:** 15 resources, 3 projects, 15 work packages, ~45 activities

### 5. Browser Test
1. Open http://localhost:45679
2. Navigate to each tab
3. Verify data is visible
4. Click each "Add" button
5. Verify modals open
6. Try creating new items

---

## 📋 Mock Data Summary

After running the seed script, you'll have:

### Resources (15 total)
- 5 with 35-hour contracts (every 3rd resource)
- 10 with 40-hour contracts
- Names: Alice Johnson, Bob Smith, Carol Williams, David Brown, Emma Davis, Frank Miller, Grace Wilson, Henry Moore, Iris Taylor, Jack Anderson, Karen Thomas, Leo Jackson, Mary White, Nathan Harris, Olivia Martin
- Alice Johnson has a vacation override for January 2024

### Projects (3 total)
1. **Railway Signaling System**
   - Start: 2024-01-01
   - End: 2024-12-31

2. **Metro Train Control Platform**
   - Start: 2024-02-01
   - End: 2024-11-30

3. **Safety Critical Software Upgrade**
   - Start: 2024-03-01
   - End: 2024-10-31

### Work Packages (15 total, 5 per project)
- Each WP has a RAMS tag: FMECA, Hazard Log, SIL, Risk Assessment, or Safety Case
- Standard effort ranges from ~100 to ~450 hours
- Names follow pattern: `{ProjectName}-WP1` through `WP5`

### Activities (~45 total)
- 2-5 activities per work package
- Random assignment to resources
- Planned hours: 20-100 hours per activity
- Date ranges span 2024 (1-3 months duration)

---

## 🛠️ Technical Details

### Why Did the Issue Occur?

1. **Port Change:** System ports changed from 3000/3001 to 45678/45679
2. **React Environment Variables:** React needs `REACT_APP_*` variables at runtime
3. **Docker Build Cache:** Old builds had the wrong API URL
4. **`.env` File:** Local `.env` was outdated (though `.env` is git-ignored for security)

### How Was It Fixed?

1. **Updated `.env.example`:** Template file now has correct ports
2. **Enhanced Dockerfile:** Added default ENV for API URL in container
3. **Forced Rebuild:** Scripts use `--no-cache` to avoid cached layers
4. **Documentation:** Created guides for users to fix their local setups

### Why Rebuild Is Necessary

React's development server reads environment variables at startup. When the API URL changes:
- Old running containers still point to port 3000
- Cached Docker layers may contain old configuration
- The `--no-cache` rebuild ensures fresh start

---

## 🎓 Understanding the Architecture

### Port Mapping
```
Host Machine              Docker Container
├─ localhost:45678   →   backend:3000
├─ localhost:45679   →   frontend:3001
└─ localhost:5432    →   postgres:5432
```

### API Communication
```
Browser (localhost:45679)
    ↓
Frontend Container (port 3001)
    ↓
Backend Container (port 3000)
    ↓
PostgreSQL Container (port 5432)
```

### Environment Variable Flow
```
docker-compose.yml
    ↓ (sets environment)
Frontend Container
    ↓ (REACT_APP_API_URL)
React App (services/api.js)
    ↓ (axios baseURL)
Backend API (localhost:45678)
```

---

## 📖 Related Documentation

- **`NEW_FEATURES_GUIDE.md`** - How to use the Add buttons and modals
- **`FIX_DATA_DISPLAY.md`** - Quick reference for this fix
- **`TROUBLESHOOTING_DATA_ISSUE.md`** - Detailed troubleshooting guide
- **`PORT_CONFIGURATION.md`** - Port configuration details
- **`DOCKER_SETUP.md`** - Docker setup and usage

---

## 🆘 Still Having Issues?

### Check System Health
```bash
# View all logs
docker compose logs -f

# Check specific service
docker compose logs backend
docker compose logs frontend

# Restart specific service
docker compose restart backend
docker compose restart frontend

# Check disk space
docker system df

# Clean up old images
docker system prune -a
```

### Common Issues

**Issue:** Backend won't start
```bash
# Check if port 45678 is in use
lsof -i :45678  # Mac/Linux
netstat -ano | findstr :45678  # Windows

# Check database connection
docker compose exec postgres psql -U postgres -c "SELECT 1;"
```

**Issue:** Frontend won't start
```bash
# Check if port 45679 is in use
lsof -i :45679  # Mac/Linux
netstat -ano | findstr :45679  # Windows

# Check frontend logs
docker compose logs frontend | grep -i error
```

**Issue:** Database empty after seed
```bash
# Verify database exists
docker compose exec postgres psql -U postgres -l | grep rams_workload

# Manually run setup then seed
docker compose exec backend npm run setup
docker compose exec backend npm run seed
```

### Get Support

If you're still having issues:

1. **Collect Information:**
   ```bash
   docker compose ps > docker_status.txt
   docker compose logs > docker_logs.txt
   curl http://localhost:45678/api/resources > api_test.txt 2>&1
   ```

2. **Check Files:**
   - Verify all new files exist (modals, scripts, etc.)
   - Check git status: `git status`
   - Check for local changes: `git diff`

3. **Review Documentation:**
   - `TROUBLESHOOTING_DATA_ISSUE.md` - comprehensive troubleshooting
   - `FIX_DATA_DISPLAY.md` - quick fixes
   - This file - technical details

---

## ✅ Summary

**Problem:** Data not showing, Add buttons missing  
**Root Cause:** Frontend API URL configuration outdated  
**Solution:** Rebuild containers with updated configuration  
**Scripts:** Automated fix scripts provided  
**Result:** All features working as expected  

**Quick Command:**
```bash
./fix-and-rebuild.sh    # Linux/Mac
fix-and-rebuild.bat     # Windows
```

**Verify:**
Open http://localhost:45679 and see all data and buttons! 🎉

---

## 📝 Commit Information

**Branch:** main  
**Commit Message:** "Fix data display issue: Update frontend API URL configuration and add rebuild scripts"

**Files Changed:**
- `frontend/.env.example` - Updated to port 45678
- `frontend/Dockerfile` - Added default ENV for API URL
- `fix-and-rebuild.sh` - Automated fix script (Linux/Mac)
- `fix-and-rebuild.bat` - Automated fix script (Windows)
- `FIX_DATA_DISPLAY.md` - Quick fix guide
- `TROUBLESHOOTING_DATA_ISSUE.md` - Detailed troubleshooting
- `DATA_FIX_README.md` - This comprehensive readme

**All changes committed and pushed to main branch!** ✅
