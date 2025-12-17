#!/bin/bash

echo "=================================================="
echo "RAMS Workload Management System - Setup Script"
echo "=================================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL client not found. Please ensure PostgreSQL 14+ is installed and running."
else
    echo "✅ PostgreSQL client found"
fi

echo ""
echo "${YELLOW}Step 1: Installing Backend Dependencies${NC}"
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install backend dependencies"
    exit 1
fi
echo "${GREEN}✅ Backend dependencies installed${NC}"

echo ""
echo "${YELLOW}Step 2: Setting up Database${NC}"
echo "Please ensure PostgreSQL is running and credentials in backend/.env are correct."
echo "Database: rams_workload"
echo "User: postgres"
echo ""
read -p "Press Enter to continue with database setup (Ctrl+C to cancel)..."

npm run db:setup
if [ $? -ne 0 ]; then
    echo "❌ Failed to setup database"
    echo "Please check your PostgreSQL connection and credentials in backend/.env"
    exit 1
fi
echo "${GREEN}✅ Database schema created${NC}"

echo ""
echo "${YELLOW}Step 3: Seeding Database with Mock Data${NC}"
npm run db:seed
if [ $? -ne 0 ]; then
    echo "❌ Failed to seed database"
    exit 1
fi
echo "${GREEN}✅ Database seeded with mock data${NC}"

echo ""
echo "${YELLOW}Step 4: Installing Frontend Dependencies${NC}"
cd ../frontend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi
echo "${GREEN}✅ Frontend dependencies installed${NC}"

cd ..

echo ""
echo "=================================================="
echo "${GREEN}✅ Setup Complete!${NC}"
echo "=================================================="
echo ""
echo "To start the application:"
echo ""
echo "1. Start Backend (Terminal 1):"
echo "   cd backend && npm start"
echo ""
echo "2. Start Frontend (Terminal 2):"
echo "   cd frontend && npm start"
echo ""
echo "3. Open browser to: http://localhost:3001"
echo ""
echo "Alternative - Using Docker:"
echo "   docker-compose up"
echo ""
echo "=================================================="
