#!/bin/bash
set -e

echo "=================================================="
echo "RAMS Backend - Starting Initialization"
echo "=================================================="

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
until PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -U "$DB_USER" -d postgres -c '\q' 2>/dev/null; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 2
done

echo "✅ PostgreSQL is ready!"

# Check if database exists
DB_EXISTS=$(PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -U "$DB_USER" -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'")

if [ "$DB_EXISTS" != "1" ]; then
  echo "Database does not exist. Creating and initializing..."
  npm run db:setup
  echo "✅ Database schema created"
  
  echo "Seeding database with mock data..."
  npm run db:seed
  echo "✅ Database seeded with mock data"
else
  echo "✅ Database already exists"
fi

echo "=================================================="
echo "Starting Express Server..."
echo "=================================================="

# Start the application
exec npm start
