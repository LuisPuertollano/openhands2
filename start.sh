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
    exit 1
fi

echo ""
echo "⏳ Waiting for services to be ready..."
echo ""

# Wait for backend to be ready
max_attempts=60
attempt=0
while [ $attempt -lt $max_attempts ]; do
    if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
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
echo "   Frontend:  http://localhost:3001"
echo "   Backend:   http://localhost:3000"
echo "   API Docs:  http://localhost:3000/api/health"
echo ""
echo "📊 Database Info:"
echo "   Host:      localhost:5432"
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
    xdg-open http://localhost:3001 &> /dev/null &
elif command -v open &> /dev/null; then
    open http://localhost:3001 &> /dev/null &
elif command -v start &> /dev/null; then
    start http://localhost:3001 &> /dev/null &
else
    echo "Please open http://localhost:3001 in your browser"
fi

echo ""
echo "Press Ctrl+C to view logs, or just close this window."
echo ""

# Follow logs
docker compose logs -f
