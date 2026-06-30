#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "Trip Management System - Database Setup"
echo "========================================"

# Check if MySQL is installed
if ! command -v mysql &> /dev/null; then
    echo -e "${RED}MySQL is not installed. Please install MySQL first.${NC}"
    exit 1
fi

# Create database and user
echo "Creating database and user..."
mysql -u root -p << EOF
CREATE DATABASE IF NOT EXISTS trip_app;
CREATE USER IF NOT EXISTS 'app_user'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON trip_app.* TO 'app_user'@'localhost';
FLUSH PRIVILEGES;
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}Database and user created successfully${NC}"
else
    echo -e "${RED}Failed to create database${NC}"
    exit 1
fi

# Initialize schema
echo "Initializing database schema..."
cd backend
npm run init-db

if [ $? -eq 0 ]; then
    echo -e "${GREEN}Database schema initialized successfully${NC}"
    echo -e "${GREEN}Setup complete! You can now start the servers.${NC}"
else
    echo -e "${RED}Failed to initialize schema${NC}"
    exit 1
fi
