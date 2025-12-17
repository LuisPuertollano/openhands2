@echo off
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
echo   Frontend:  http://localhost:3001
echo   Backend:   http://localhost:3000
echo.
echo Useful commands:
echo   View logs:     docker compose logs -f
echo   Stop system:   docker compose down
echo   Restart:       docker compose restart
echo.
echo Opening application in your browser...
echo ==================================================
echo.

REM Open browser
start http://localhost:3001

echo Press any key to view logs...
pause >nul

docker compose logs -f
