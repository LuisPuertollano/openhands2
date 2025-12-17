@echo off
setlocal enabledelayedexpansion

echo ============================================================
echo   RAMS Workload Management - Fix and Rebuild Script
echo ============================================================
echo.

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running. Please start Docker Desktop and try again.
    pause
    exit /b 1
)
echo [OK] Docker is running

REM Step 1: Stop and remove everything
echo.
echo [Step 1] Stopping and removing old containers...
docker compose down --volumes --rmi all 2>nul
if errorlevel 1 docker compose down 2>nul
echo [OK] Old containers removed

REM Step 2: Build with no cache
echo.
echo [Step 2] Building containers from scratch (this may take a few minutes)...
docker compose build --no-cache
if errorlevel 1 (
    echo [ERROR] Build failed. Check the output above.
    pause
    exit /b 1
)
echo [OK] Containers built successfully

REM Step 3: Start containers
echo.
echo [Step 3] Starting containers...
docker compose up -d
if errorlevel 1 (
    echo [ERROR] Failed to start containers.
    pause
    exit /b 1
)
echo [OK] Containers started

REM Step 4: Wait for backend to be ready
echo.
echo [Step 4] Waiting for backend to initialize...
timeout /t 5 /nobreak >nul

set max_attempts=30
set attempt=0

:wait_loop
curl -s http://localhost:45678/api/resources >nul 2>&1
if not errorlevel 1 (
    echo [OK] Backend is ready
    goto backend_ready
)
set /a attempt+=1
if !attempt! geq !max_attempts! (
    echo [ERROR] Backend did not start in time. Check logs with: docker compose logs backend
    pause
    exit /b 1
)
echo Waiting...
timeout /t 1 /nobreak >nul
goto wait_loop

:backend_ready

REM Step 5: Seed database
echo.
echo [Step 5] Seeding database with mock data...
docker compose exec -T backend npm run seed
if errorlevel 1 (
    echo [WARNING] Database seeding might have failed. Check logs with: docker compose logs backend
) else (
    echo [OK] Database seeded successfully
)

REM Step 6: Verify
echo.
echo [Step 6] Verifying setup...

REM Check backend API
curl -s http://localhost:45678/api/resources | findstr "data" >nul 2>&1
if not errorlevel 1 (
    echo [OK] Backend API is responding with data
) else (
    echo [WARNING] Backend API may not have data
)

REM Check frontend
curl -s http://localhost:45679 | findstr "RAMS" >nul 2>&1
if not errorlevel 1 (
    echo [OK] Frontend is accessible
) else (
    echo [WARNING] Frontend may not be fully loaded yet (wait a minute and refresh)
)

REM Final summary
echo.
echo ============================================================
echo   Setup Complete!
echo ============================================================
echo.
echo System Status:
docker compose ps
echo.
echo Access Points:
echo    Frontend: http://localhost:45679
echo    Backend:  http://localhost:45678
echo.
echo What's Available:
echo    - 15 Resources (team members)
echo    - 3 Projects
echo    - 15 Work Packages (5 per project)
echo    - ~45 Activities
echo.
echo Test the New Features:
echo    1. Open http://localhost:45679 in your browser
echo    2. Go to 'Capacity Overview' - Click 'Add Resource'
echo    3. Go to 'Project Hierarchy' - Click 'Add Project'
echo    4. Expand a project - Click 'Add WP' to add work package
echo    5. Expand a work package - Click 'Add Activity' to assign work
echo.
echo Documentation:
echo    - NEW_FEATURES_GUIDE.md - Complete guide to using add buttons
echo    - TROUBLESHOOTING_DATA_ISSUE.md - If you encounter issues
echo.
echo Useful Commands:
echo    View logs:        docker compose logs -f
echo    Restart:          docker compose restart
echo    Stop:             docker compose down
echo    Check status:     docker compose ps
echo.
echo [OK] All done! Enjoy your RAMS Workload Management System!
echo.
pause
