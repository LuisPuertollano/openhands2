# 🔧 Quick Fix: Data Not Showing Issue

## Problem
You're seeing the app but no data or Add buttons appear on the pages.

## Cause
The frontend needs to be rebuilt with the updated API URL (port 45678).

---

## ✅ Quick Fix (Automated)

### On Linux/Mac:
```bash
cd /path/to/project
./fix-and-rebuild.sh
```

### On Windows:
```cmd
cd C:\path\to\project
fix-and-rebuild.bat
```

**What this does:**
1. Stops and removes old containers
2. Rebuilds everything from scratch with correct configuration
3. Starts the system
4. Seeds the database with mock data
5. Verifies everything is working

**Time required:** 3-5 minutes (depending on your internet speed)

---

## ✅ Manual Fix (If Script Doesn't Work)

### Step 1: Stop Everything
```bash
docker compose down --volumes --rmi all
```

### Step 2: Rebuild from Scratch
```bash
docker compose build --no-cache
```

### Step 3: Start
```bash
docker compose up -d
```

### Step 4: Wait (10 seconds)
```bash
# On Linux/Mac
sleep 10

# On Windows - just wait 10 seconds
```

### Step 5: Seed Database
```bash
docker compose exec backend npm run seed
```

### Step 6: Open Browser
```
http://localhost:45679
```

---

## ✅ What You Should See After Fix

### Capacity Overview Tab (📊)
- **"➕ Add Resource"** button at the top
- Table with 15 resources showing:
  - Resource names (Alice Johnson, Bob Smith, etc.)
  - Contract hours (35h or 40h per week)
  - Capacity and utilization percentages
  - Bar chart visualization

### Budget Benchmarking Tab (📈)
- Table with 15 work packages showing:
  - Work package names
  - RAMS tags (FMECA, Hazard Log, SIL, etc.)
  - Standard effort hours
  - Actual hours (sum of activities)
  - Budget status (OK or Over Budget)

### Project Hierarchy Tab (🌳)
- **"➕ Add Project"** button at the top
- 3 projects listed:
  - Railway Signaling System
  - Metro Train Control Platform
  - Safety Critical Software Upgrade
- Click **▶** to expand each project
- **"➕ WP"** button next to each project name
- 5 work packages under each project
- Click **▶** to expand work packages
- **"➕ Activity"** button next to each work package
- Activities showing resource assignments and hours

---

## 🔍 Still Not Working?

### Check Container Status
```bash
docker compose ps
```
**Expected:** All 3 containers (postgres, backend, frontend) running

### Check Backend Logs
```bash
docker compose logs backend | tail -20
```
**Expected:** Should see "Server is running on port 3000"

### Check Frontend Logs
```bash
docker compose logs frontend | tail -20
```
**Expected:** Should see "webpack compiled successfully" or "Compiled successfully"

### Test Backend API Directly
```bash
curl http://localhost:45678/api/resources
```
**Expected:** JSON response with array of resources

### Check Browser Console
1. Open http://localhost:45679
2. Press **F12** (Developer Tools)
3. Go to **Console** tab
4. Look for red error messages

**Common errors:**
- **"Network Error"** → Backend not reachable (wrong port in config)
- **"CORS error"** → Backend not allowing frontend origin
- **"404 Not Found"** → Wrong API endpoint

---

## 📝 What Was Fixed

### Files Updated:
1. **`frontend/.env`**
   ```
   REACT_APP_API_URL=http://localhost:45678/api  # Changed from 3000
   PORT=45679                                      # Changed from 3001
   ```

2. **`frontend/.env.example`**
   - Same changes for documentation

3. **New troubleshooting tools:**
   - `fix-and-rebuild.sh` (Linux/Mac)
   - `fix-and-rebuild.bat` (Windows)
   - `TROUBLESHOOTING_DATA_ISSUE.md` (detailed guide)
   - `FIX_DATA_DISPLAY.md` (this file)

---

## 🎯 Testing After Fix

### Test 1: Add a Resource
1. Go to **Capacity Overview** tab
2. Click **"➕ Add Resource"**
3. Enter name and contract hours
4. Click **"✓ Create Resource"**
5. ✅ **Should see:** New resource appears in table immediately

### Test 2: Add a Project
1. Go to **Project Hierarchy** tab
2. Click **"➕ Add Project"**
3. Enter name and dates
4. Click **"✓ Create Project"**
5. ✅ **Should see:** New project appears in hierarchy

### Test 3: Add a Work Package
1. **Expand** a project (click ▶)
2. Click **"➕ WP"** next to project name
3. Fill in details (name, RAMS discipline, standard effort)
4. Click **"✓ Create Work Package"**
5. ✅ **Should see:** New WP appears under project

### Test 4: Add an Activity
1. **Expand** a work package (click ▶)
2. Click **"➕ Activity"** next to WP name
3. Select resource, enter hours and dates
4. Click **"✓ Create Activity"**
5. ✅ **Should see:** New activity appears with resource name

---

## 💡 Understanding the Fix

### Why Did This Happen?

When we changed the default ports from 3000/3001 to 45678/45679 to avoid conflicts, the frontend `.env` file wasn't updated. 

React apps "bake in" environment variables at **build time**, so changing `docker-compose.yml` alone wasn't enough—we needed to:
1. Update `frontend/.env` with correct API URL
2. Rebuild the frontend container with `--no-cache`

### Why `--no-cache`?

Docker caches build layers for speed. Without `--no-cache`, it might reuse old layers that have the wrong API URL. The `--no-cache` flag forces a complete rebuild.

---

## 🆘 Need More Help?

See **TROUBLESHOOTING_DATA_ISSUE.md** for:
- Detailed troubleshooting steps
- Port conflict resolution
- Database connection issues
- Complete system verification
- Advanced debugging

---

## ✨ Summary

**The Problem:** Frontend couldn't connect to backend (wrong port)  
**The Fix:** Updated frontend `.env` and rebuilt containers  
**The Script:** Automated fix in `fix-and-rebuild.sh` / `.bat`  
**The Result:** All data visible, all Add buttons working  

**Run this:**
```bash
./fix-and-rebuild.sh    # Linux/Mac
fix-and-rebuild.bat     # Windows
```

**Then open:**
```
http://localhost:45679
```

**You should see all data and Add buttons! 🎉**
