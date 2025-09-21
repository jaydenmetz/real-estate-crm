#!/bin/bash

# Secure API authentication test script
# This script uses environment variables for sensitive data

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check for required environment variables
if [ -z "$API_KEY" ]; then
    echo -e "${RED}Error: API_KEY environment variable not set${NC}"
    echo "Usage: API_KEY=your-api-key ./test-api-auth-secure.sh"
    exit 1
fi

if [ -z "$API_URL" ]; then
    API_URL="https://api.jaydenmetz.com/v1"
    echo -e "${YELLOW}Using default API_URL: $API_URL${NC}"
fi

if [ -z "$TEST_EMAIL" ]; then
    echo -e "${RED}Error: TEST_EMAIL environment variable not set${NC}"
    echo "Usage: TEST_EMAIL=admin@jaydenmetz.com API_KEY=your-api-key ./test-api-auth-secure.sh"
    exit 1
fi

if [ -z "$TEST_PASSWORD" ]; then
    echo -e "${RED}Error: TEST_PASSWORD environment variable not set${NC}"
    echo "Usage: TEST_PASSWORD=your-password TEST_EMAIL=admin@jaydenmetz.com API_KEY=your-api-key ./test-api-auth-secure.sh"
    exit 1
fi

echo "========================================="
echo "API Authentication Test (Secure Version)"
echo "========================================="
echo ""
echo "API URL: $API_URL"
echo ""

# Test 1: Health Check
echo -e "${YELLOW}Test 1: Health Check${NC}"
RESPONSE=$(curl -s "$API_URL/health")
if echo "$RESPONSE" | grep -q "healthy"; then
    echo -e "${GREEN}✓ Health check passed${NC}"
else
    echo -e "${RED}✗ Health check failed${NC}"
fi
echo ""

# Test 2: Login with JWT
echo -e "${YELLOW}Test 2: Login with JWT${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}")

JWT_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ ! -z "$JWT_TOKEN" ]; then
    echo -e "${GREEN}✓ Login successful${NC}"
    echo "Token (first 20 chars): ${JWT_TOKEN:0:20}..."
else
    echo -e "${RED}✗ Login failed${NC}"
    echo "Response: $LOGIN_RESPONSE"
fi
echo ""

# Test 3: API Key Authentication
echo -e "${YELLOW}Test 3: API Key Authentication${NC}"
ESCROWS_RESPONSE=$(curl -s "$API_URL/escrows" \
    -H "X-API-Key: $API_KEY")

if echo "$ESCROWS_RESPONSE" | grep -q "success"; then
    echo -e "${GREEN}✓ API key authentication successful${NC}"
else
    echo -e "${RED}✗ API key authentication failed${NC}"
    echo "Response: $ESCROWS_RESPONSE"
fi
echo ""

# Test 4: Create Test Escrow
echo -e "${YELLOW}Test 4: Create Test Escrow${NC}"
TEST_ESCROW=$(curl -s -X POST "$API_URL/escrows" \
    -H "X-API-Key: $API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
        "property_address": "123 Test St",
        "city": "Test City",
        "state": "CA",
        "zip_code": "90210",
        "purchase_price": 500000,
        "escrow_status": "Active",
        "closing_date": "2024-12-31"
    }')

ESCROW_ID=$(echo "$TEST_ESCROW" | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ ! -z "$ESCROW_ID" ]; then
    echo -e "${GREEN}✓ Escrow created: $ESCROW_ID${NC}"

    # Cleanup: Archive and delete
    echo "Cleaning up test escrow..."
    curl -s -X PUT "$API_URL/escrows/$ESCROW_ID/archive" \
        -H "X-API-Key: $API_KEY" > /dev/null
    curl -s -X DELETE "$API_URL/escrows/$ESCROW_ID" \
        -H "X-API-Key: $API_KEY" > /dev/null
else
    echo -e "${RED}✗ Failed to create escrow${NC}"
fi

echo ""
echo "========================================="
echo "Test Complete"
echo "========================================="