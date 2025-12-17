@echo off
setlocal enabledelayedexpansion

echo ==================================================
echo RAMS Workload Management System
echo ==================================================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not installed.
    echo.
    echo Please install Docker Desktop:
    echo https://docs.docker.com/desktop/install/windows-install/
    pause
    exit /b 1
)

echo [OK] Docker is installed
echo.

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker daemon is not running.
    echo.
    echo Please start Docker Desktop.
    pause
    exit /b 1
)

echo [OK] Docker daemon is running
echo.

REM Load .env file if it exists
if exist .env (
    echo Loading port configuration from .env file...
    for /f "usebackq tokens=1,2 delims==" %%a in (.env) do (
        set %%a=%%b
    )
    echo [OK] Configuration loaded
    echo.
)

REM Set default ports (using high port numbers to avoid conflicts)
if not defined POSTGRES_PORT set POSTGRES_PORT=5432
if not defined BACKEND_PORT set BACKEND_PORT=45678
if not defined FRONTEND_PORT set FRONTEND_PORT=45679

REM Check for port conflicts
echo Checking for port conflicts...
echo.

set PORT_CONFLICTS=0

netstat -an | findstr ":%POSTGRES_PORT% " | findstr "LISTENING" >nul 2>&1
if %errorlevel% equ 0 (
    echo WARNING: Port %POSTGRES_PORT% ^(PostgreSQL^) is already in use
    set PORT_CONFLICTS=1
)

netstat -an | findstr ":%BACKEND_PORT% " | findstr "LISTENING" >nul 2>&1
if %errorlevel% equ 0 (
    echo WARNING: Port %BACKEND_PORT% ^(Backend API^) is already in use
    set PORT_CONFLICTS=1
)

netstat -an | findstr ":%FRONTEND_PORT% " | findstr "LISTENING" >nul 2>&1
if %errorlevel% equ 0 (
    echo WARNING: Port %FRONTEND_PORT% ^(Frontend^) is already in use
    set PORT_CONFLICTS=1
)

if %PORT_CONFLICTS% equ 1 (
    echo.
    echo ==================================================
    echo WARNING: PORT CONFLICT DETECTED
    echo ==================================================
    echo.
    echo You have several options:
    echo.
    echo 1^) Choose different ports ^(recommended^)
    echo 2^) Continue anyway ^(may fail if ports are in use^)
    echo 3^) Exit and manually free the ports
    echo.
    set /p choice="Enter your choice (1/2/3): "
    echo.
    
    if "!choice!"=="1" (
        echo Please enter new port numbers ^(press Enter to keep current^):
        echo.
        
        set /p new_postgres="PostgreSQL port [current: %POSTGRES_PORT%]: "
        if not "!new_postgres!"=="" set POSTGRES_PORT=!new_postgres!
        
        set /p new_backend="Backend API port [current: %BACKEND_PORT%]: "
        if not "!new_backend!"=="" set BACKEND_PORT=!new_backend!
        
        set /p new_frontend="Frontend port [current: %FRONTEND_PORT%]: "
        if not "!new_frontend!"=="" set FRONTEND_PORT=!new_frontend!
        
        REM Create/update .env file
        echo # RAMS Workload Management System - Port Configuration > .env
        echo # Generated on %date% %time% >> .env
        echo. >> .env
        echo POSTGRES_PORT=!POSTGRES_PORT! >> .env
        echo BACKEND_PORT=!BACKEND_PORT! >> .env
        echo FRONTEND_PORT=!FRONTEND_PORT! >> .env
        
        echo.
        echo [OK] Configuration saved to .env file
        echo    PostgreSQL: localhost:!POSTGRES_PORT!
        echo    Backend:    localhost:!BACKEND_PORT!
        echo    Frontend:   localhost:!FRONTEND_PORT!
        echo.
    ) else if "!choice!"=="2" (
        echo WARNING: Continuing with current ports...
        echo    If startup fails, run this script again and choose option 1.
        echo.
    ) else if "!choice!"=="3" (
        echo Exiting. Please free up the ports and try again.
        echo.
        echo To find and kill processes using ports:
        echo   netstat -ano ^| findstr :PORT
        echo   taskkill /PID process_id /F
        pause
        exit /b 0
    ) else (
        echo ERROR: Invalid choice. Exiting.
        pause
        exit /b 1
    )
) else (
    echo [OK] All ports are available
    echo    PostgreSQL: localhost:%POSTGRES_PORT%
    echo    Backend:    localhost:%BACKEND_PORT%
    echo    Frontend:   localhost:%FRONTEND_PORT%
    echo.
)

REM Export environment variables
set POSTGRES_PORT=%POSTGRES_PORT%
set BACKEND_PORT=%BACKEND_PORT%
set FRONTEND_PORT=%FRONTEND_PORT%

REM Stop existing containers
echo Cleaning up existing containers...
docker compose down >nul 2>&1

echo.
echo Building and starting containers...
echo This may take a few minutes on first run...
echo.

REM Build and start containers
docker compose up --build -d

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to start containers.
    echo Check the error messages above.
    echo.
    echo TIP: If you see port conflict errors, run this script again
    echo      and choose different ports.
    pause
    exit /b 1
)

echo.
echo Waiting for services to be ready...
timeout /t 10 /nobreak >nul

echo.
echo ==================================================
echo RAMS Workload Management System is running!
echo ==================================================
echo.
echo Access the application:
echo   Frontend:  http://localhost:%FRONTEND_PORT%
echo   Backend:   http://localhost:%BACKEND_PORT%
echo   API:       http://localhost:%BACKEND_PORT%/api/health
echo.
echo Database Info:
echo   Host:      localhost:%POSTGRES_PORT%
echo   Database:  rams_workload
echo   User:      postgres
echo   Password:  postgres
echo.
echo Useful commands:
echo   View logs:     docker compose logs -f
echo   Stop system:   docker compose down
echo   Restart:       docker compose restart
echo   Clean reset:   docker compose down -v
echo.
echo Opening application in your browser...
echo ==================================================
echo.

REM Open browser
start http://localhost:%FRONTEND_PORT%

echo Press any key to view logs...
pause >nul

docker compose logs -f
