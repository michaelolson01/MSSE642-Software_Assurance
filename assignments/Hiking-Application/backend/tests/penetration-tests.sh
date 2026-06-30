#!/bin/bash

# Penetration Testing Script for Trip Management System
# This script tests common vulnerabilities

set -e

API_URL="http://localhost:3000/api"
FRONTEND_URL="http://localhost:3001"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "=========================================="
echo "Penetration Testing - Trip Management System"
echo "=========================================="
echo ""

# Test 1: Weak Password Validation
echo -e "${YELLOW}[TEST 1] Weak Password Validation${NC}"
echo "Attempting to register with password '1'..."
RESPONSE=$(curl -s -X POST $API_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"weakpass@example.com","password":"1","firstName":"Test","lastName":"User"}')

if echo $RESPONSE | grep -q "user_id"; then
  echo -e "${RED}[VULNERABLE] System accepts 1-character passwords${NC}"
else
  echo -e "${GREEN}[SAFE] Password validation working${NC}"
fi
echo ""

# Test 2: SQL Injection in Login
echo -e "${YELLOW}[TEST 2] SQL Injection in Login${NC}"
echo "Attempting SQL injection in email field..."
RESPONSE=$(curl -s -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com\" OR \"1\"=\"1","password":"anything"}')

if echo $RESPONSE | grep -q "token"; then
  echo -e "${RED}[VULNERABLE] SQL injection successful${NC}"
else
  echo -e "${GREEN}[SAFE] SQL injection blocked${NC}"
fi
echo ""

# Test 3: Missing Authentication
echo -e "${YELLOW}[TEST 3] Missing Authentication on Protected Endpoints${NC}"
echo "Attempting to access /api/admin/users without token..."
RESPONSE=$(curl -s -X GET $API_URL/admin/users)

if echo $RESPONSE | grep -q "error"; then
  echo -e "${GREEN}[SAFE] Endpoint requires authentication${NC}"
else
  echo -e "${RED}[VULNERABLE] Endpoint accessible without authentication${NC}"
fi
echo ""

# Test 4: Horizontal Privilege Escalation
echo -e "${YELLOW}[TEST 4] Horizontal Privilege Escalation${NC}"
echo "Logging in as member..."
MEMBER_TOKEN=$(curl -s -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"member@example.com","password":"password123"}' | grep -o '"token":"[^"]*' | cut -d'"' -f4)

echo "Attempting to access other member's profile..."
RESPONSE=$(curl -s -X GET $API_URL/members/3 \
  -H "Authorization: Bearer $MEMBER_TOKEN")

if echo $RESPONSE | grep -q "medical_info"; then
  echo -e "${RED}[VULNERABLE] Can access other members' confidential info${NC}"
else
  echo -e "${GREEN}[SAFE] Confidential info protected${NC}"
fi
echo ""

# Test 5: Brute Force Attack
echo -e "${YELLOW}[TEST 5] Brute Force Protection${NC}"
echo "Attempting 10 failed logins..."
for i in {1..10}; do
  curl -s -X POST $API_URL/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@example.com","password":"wrongpassword"}' > /dev/null
done

echo "Checking if account is locked..."
RESPONSE=$(curl -s -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}')

if echo $RESPONSE | grep -q "token"; then
  echo -e "${RED}[VULNERABLE] No brute force protection${NC}"
else
  echo -e "${GREEN}[SAFE] Account locked after failed attempts${NC}"
fi
echo ""

# Test 6: CORS Misconfiguration
echo -e "${YELLOW}[TEST 6] CORS Misconfiguration${NC}"
echo "Testing CORS from unauthorized origin..."
RESPONSE=$(curl -s -X GET $API_URL/events \
  -H "Origin: http://evil.com" \
  -H "Authorization: Bearer $MEMBER_TOKEN" \
  -i)

if echo $RESPONSE | grep -q "Access-Control-Allow-Origin"; then
  echo -e "${RED}[VULNERABLE] CORS allows unauthorized origins${NC}"
else
  echo -e "${GREEN}[SAFE] CORS properly configured${NC}"
fi
echo ""

# Test 7: Information Disclosure
echo -e "${YELLOW}[TEST 7] Information Disclosure in Error Messages${NC}"
echo "Triggering error with invalid event ID..."
RESPONSE=$(curl -s -X GET $API_URL/events/99999)

if echo $RESPONSE | grep -q "database\|sql\|query"; then
  echo -e "${RED}[VULNERABLE] Error messages reveal system details${NC}"
else
  echo -e "${GREEN}[SAFE] Error messages are generic${NC}"
fi
echo ""

echo "=========================================="
echo "Penetration Testing Complete"
echo "=========================================="
