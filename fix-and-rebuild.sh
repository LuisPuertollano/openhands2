#!/bin/bash
set -e

echo "🔧 RAMS Workload Management - Fix and Rebuild Script"
echo "===================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker Desktop and try again."
    exit 1
fi

print_status "Docker is running"

# Step 1: Stop and remove everything
echo ""
echo "📦 Step 1: Stopping and removing old containers..."
docker compose down --volumes --rmi all 2>/dev/null || docker compose down 2>/dev/null || true
print_status "Old containers removed"

# Step 2: Build with no cache
echo ""
echo "🔨 Step 2: Building containers from scratch (this may take a few minutes)..."
docker compose build --no-cache
print_status "Containers built successfully"

# Step 3: Start containers
echo ""
echo "🚀 Step 3: Starting containers..."
docker compose up -d
print_status "Containers started"

# Step 4: Wait for backend to be ready
echo ""
echo "⏳ Step 4: Waiting for backend to initialize..."
sleep 5

# Check if backend is healthy
max_attempts=30
attempt=0
while [ $attempt -lt $max_attempts ]; do
    if curl -s http://localhost:45678/api/resources > /dev/null 2>&1; then
        print_status "Backend is ready"
        break
    fi
    attempt=$((attempt + 1))
    echo -n "."
    sleep 1
done

if [ $attempt -eq $max_attempts ]; then
    print_error "Backend did not start in time. Check logs with: docker compose logs backend"
    exit 1
fi

# Step 5: Seed database
echo ""
echo "🌱 Step 5: Seeding database with mock data..."
if docker compose exec -T backend npm run seed; then
    print_status "Database seeded successfully"
else
    print_warning "Database seeding might have failed. Check logs with: docker compose logs backend"
fi

# Step 6: Verify
echo ""
echo "🔍 Step 6: Verifying setup..."

# Check containers
if [ "$(docker compose ps -q | wc -l)" -eq 3 ]; then
    print_status "All 3 containers are running"
else
    print_warning "Expected 3 containers, found $(docker compose ps -q | wc -l)"
fi

# Check backend API
if curl -s http://localhost:45678/api/resources | grep -q "data"; then
    print_status "Backend API is responding with data"
else
    print_warning "Backend API may not have data"
fi

# Check frontend
if curl -s http://localhost:45679 | grep -q "RAMS"; then
    print_status "Frontend is accessible"
else
    print_warning "Frontend may not be fully loaded yet (wait a minute and refresh)"
fi

# Final summary
echo ""
echo "======================================================"
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo "======================================================"
echo ""
echo "📊 System Status:"
docker compose ps
echo ""
echo "🌐 Access Points:"
echo "   Frontend: http://localhost:45679"
echo "   Backend:  http://localhost:45678"
echo ""
echo "📋 What's Available:"
echo "   - 15 Resources (team members)"
echo "   - 3 Projects"
echo "   - 15 Work Packages (5 per project)"
echo "   - ~45 Activities"
echo ""
echo "🎯 Test the New Features:"
echo "   1. Open http://localhost:45679 in your browser"
echo "   2. Go to 'Capacity Overview' - Click '➕ Add Resource'"
echo "   3. Go to 'Project Hierarchy' - Click '➕ Add Project'"
echo "   4. Expand a project - Click '➕ WP' to add work package"
echo "   5. Expand a work package - Click '➕ Activity' to assign work"
echo ""
echo "📖 Documentation:"
echo "   - NEW_FEATURES_GUIDE.md - Complete guide to using add buttons"
echo "   - TROUBLESHOOTING_DATA_ISSUE.md - If you encounter issues"
echo ""
echo "🔧 Useful Commands:"
echo "   View logs:        docker compose logs -f"
echo "   Restart:          docker compose restart"
echo "   Stop:             docker compose down"
echo "   Check status:     docker compose ps"
echo ""
print_status "All done! Enjoy your RAMS Workload Management System! 🎉"
