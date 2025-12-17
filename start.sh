#!/bin/bash

echo "=================================================="
echo "🚀 RAMS Workload Management System"
echo "=================================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed."
    echo ""
    echo "Please install Docker:"
    echo "  - Mac: https://docs.docker.com/desktop/install/mac-install/"
    echo "  - Windows: https://docs.docker.com/desktop/install/windows-install/"
    echo "  - Linux: https://docs.docker.com/engine/install/"
    exit 1
fi

# Check if Docker Compose is available
if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not available."
    echo ""
    echo "Please install Docker Compose:"
    echo "  https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker is installed"
echo "✅ Docker Compose is available"
echo ""

# Check if Docker daemon is running
if ! docker info &> /dev/null; then
    echo "❌ Docker daemon is not running."
    echo ""
    echo "Please start Docker Desktop or the Docker daemon."
    exit 1
fi

echo "✅ Docker daemon is running"
echo ""

# Function to check if port is in use
check_port() {
    local port=$1
    if command -v lsof &> /dev/null; then
        lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1
    elif command -v netstat &> /dev/null; then
        netstat -an | grep ":$port " | grep LISTEN >/dev/null 2>&1
    else
        # Fallback: try to connect
        (echo >/dev/tcp/localhost/$port) >/dev/null 2>&1
    fi
}

# Function to get process using port
get_port_process() {
    local port=$1
    if command -v lsof &> /dev/null; then
        lsof -Pi :$port -sTCP:LISTEN -t 2>/dev/null
    elif command -v netstat &> /dev/null; then
        netstat -tulpn 2>/dev/null | grep ":$port " | awk '{print $7}' | cut -d'/' -f1
    fi
}

# Load .env file if it exists
if [ -f .env ]; then
    echo "📝 Loading port configuration from .env file..."
    export $(grep -v '^#' .env | xargs)
    echo "✅ Configuration loaded"
    echo ""
fi

# Set default ports (using high port numbers to avoid conflicts)
POSTGRES_PORT=${POSTGRES_PORT:-5432}
BACKEND_PORT=${BACKEND_PORT:-45678}
FRONTEND_PORT=${FRONTEND_PORT:-45679}

# Check for port conflicts
echo "🔍 Checking for port conflicts..."
echo ""

PORT_CONFLICTS=false
CONFLICT_DETAILS=""

if check_port $POSTGRES_PORT; then
    PORT_CONFLICTS=true
    PID=$(get_port_process $POSTGRES_PORT)
    CONFLICT_DETAILS="${CONFLICT_DETAILS}⚠️  Port $POSTGRES_PORT (PostgreSQL) is already in use"
    [ -n "$PID" ] && CONFLICT_DETAILS="${CONFLICT_DETAILS} by PID $PID"
    CONFLICT_DETAILS="${CONFLICT_DETAILS}\n"
fi

if check_port $BACKEND_PORT; then
    PORT_CONFLICTS=true
    PID=$(get_port_process $BACKEND_PORT)
    CONFLICT_DETAILS="${CONFLICT_DETAILS}⚠️  Port $BACKEND_PORT (Backend API) is already in use"
    [ -n "$PID" ] && CONFLICT_DETAILS="${CONFLICT_DETAILS} by PID $PID"
    CONFLICT_DETAILS="${CONFLICT_DETAILS}\n"
fi

if check_port $FRONTEND_PORT; then
    PORT_CONFLICTS=true
    PID=$(get_port_process $FRONTEND_PORT)
    CONFLICT_DETAILS="${CONFLICT_DETAILS}⚠️  Port $FRONTEND_PORT (Frontend) is already in use"
    [ -n "$PID" ] && CONFLICT_DETAILS="${CONFLICT_DETAILS} by PID $PID"
    CONFLICT_DETAILS="${CONFLICT_DETAILS}\n"
fi

if [ "$PORT_CONFLICTS" = true ]; then
    echo -e "$CONFLICT_DETAILS"
    echo "=================================================="
    echo "⚠️  PORT CONFLICT DETECTED"
    echo "=================================================="
    echo ""
    echo "You have several options:"
    echo ""
    echo "1) Choose different ports (recommended)"
    echo "2) Continue anyway (may fail if ports are in use)"
    echo "3) Exit and manually free the ports"
    echo ""
    read -p "Enter your choice (1/2/3): " choice
    echo ""
    
    case $choice in
        1)
            echo "Please enter new port numbers (press Enter to keep current):"
            echo ""
            
            read -p "PostgreSQL port [current: $POSTGRES_PORT]: " new_postgres
            POSTGRES_PORT=${new_postgres:-$POSTGRES_PORT}
            
            read -p "Backend API port [current: $BACKEND_PORT]: " new_backend
            BACKEND_PORT=${new_backend:-$BACKEND_PORT}
            
            read -p "Frontend port [current: $FRONTEND_PORT]: " new_frontend
            FRONTEND_PORT=${new_frontend:-$FRONTEND_PORT}
            
            # Create/update .env file
            echo "# RAMS Workload Management System - Port Configuration" > .env
            echo "# Generated on $(date)" >> .env
            echo "" >> .env
            echo "POSTGRES_PORT=$POSTGRES_PORT" >> .env
            echo "BACKEND_PORT=$BACKEND_PORT" >> .env
            echo "FRONTEND_PORT=$FRONTEND_PORT" >> .env
            
            echo ""
            echo "✅ Configuration saved to .env file"
            echo "   PostgreSQL: localhost:$POSTGRES_PORT"
            echo "   Backend:    localhost:$BACKEND_PORT"
            echo "   Frontend:   localhost:$FRONTEND_PORT"
            echo ""
            
            export POSTGRES_PORT
            export BACKEND_PORT
            export FRONTEND_PORT
            ;;
        2)
            echo "⚠️  Continuing with current ports..."
            echo "   If startup fails, choose option 1 next time."
            echo ""
            ;;
        3)
            echo "👋 Exiting. Please free up the ports and try again."
            echo ""
            echo "To find and kill processes using ports:"
            echo "  Linux/Mac: lsof -ti:PORT | xargs kill -9"
            echo "  Or: sudo netstat -tulpn | grep :PORT"
            exit 0
            ;;
        *)
            echo "❌ Invalid choice. Exiting."
            exit 1
            ;;
    esac
else
    echo "✅ All ports are available"
    echo "   PostgreSQL: localhost:$POSTGRES_PORT"
    echo "   Backend:    localhost:$BACKEND_PORT"
    echo "   Frontend:   localhost:$FRONTEND_PORT"
    echo ""
fi

# Stop any existing containers
echo "🧹 Cleaning up existing containers..."
docker compose down 2>/dev/null

echo ""
echo "🔨 Building and starting containers..."
echo "   This may take a few minutes on first run..."
echo ""

# Build and start containers
docker compose up --build -d

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Failed to start containers."
    echo "Check the error messages above."
    echo ""
    echo "💡 Tip: If you see port conflict errors, run this script again"
    echo "   and choose different ports."
    exit 1
fi

echo ""
echo "⏳ Waiting for services to be ready..."
echo ""

# Wait for backend to be ready
max_attempts=60
attempt=0
while [ $attempt -lt $max_attempts ]; do
    if curl -s http://localhost:$BACKEND_PORT/api/health > /dev/null 2>&1; then
        echo "✅ Backend API is ready!"
        break
    fi
    attempt=$((attempt + 1))
    sleep 2
    echo -n "."
done

if [ $attempt -eq $max_attempts ]; then
    echo ""
    echo "⚠️  Backend took longer than expected to start."
    echo "Check logs with: docker compose logs backend"
fi

echo ""
echo "=================================================="
echo "✅ RAMS Workload Management System is running!"
echo "=================================================="
echo ""
echo "🌐 Access the application:"
echo "   Frontend:  http://localhost:$FRONTEND_PORT"
echo "   Backend:   http://localhost:$BACKEND_PORT"
echo "   API Docs:  http://localhost:$BACKEND_PORT/api/health"
echo ""
echo "📊 Database Info:"
echo "   Host:      localhost:$POSTGRES_PORT"
echo "   Database:  rams_workload"
echo "   User:      postgres"
echo "   Password:  postgres"
echo ""
echo "🔍 Useful commands:"
echo "   View logs:     docker compose logs -f"
echo "   Stop system:   docker compose down"
echo "   Restart:       docker compose restart"
echo "   Clean reset:   docker compose down -v"
echo ""
echo "📖 Opening application in your browser..."
echo "=================================================="

# Try to open browser (cross-platform)
if command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:$FRONTEND_PORT &> /dev/null &
elif command -v open &> /dev/null; then
    open http://localhost:$FRONTEND_PORT &> /dev/null &
elif command -v start &> /dev/null; then
    start http://localhost:$FRONTEND_PORT &> /dev/null &
else
    echo "Please open http://localhost:$FRONTEND_PORT in your browser"
fi

echo ""
echo "Press Ctrl+C to view logs, or just close this window."
echo ""

# Follow logs
docker compose logs -f
