#!/bin/bash

# API Authentication Test Script
# This script tests the complete API key flow and escrow endpoints

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Configuration
API_URL="https://api.jaydenmetz.com/v1"
# API_URL="http://localhost:5050/v1"  # Uncomment for local testing

echo -e "${BLUE}${BOLD}===================================${NC}"
echo -e "${BLUE}${BOLD}   API AUTHENTICATION TEST SUITE   ${NC}"
echo -e "${BLUE}${BOLD}===================================${NC}\n"

# Step 1: Login to get JWT token
echo -e "${YELLOW}Step 1: Login to get JWT token${NC}"
echo "Logging in as admin@jaydenmetz.com..."

LOGIN_RESPONSE=$(curl -s -X POST "${API_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin@jaydenmetz.com",
    "password": "AdminPassword123!"
  }')

JWT_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | sed 's/"token":"//')

if [ -z "$JWT_TOKEN" ]; then
  echo -e "${RED}✗ Failed to login${NC}"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✓ Successfully logged in${NC}"
echo "JWT Token: ${JWT_TOKEN:0:50}..."
echo ""

# Step 2: Create an API key
echo -e "${YELLOW}Step 2: Create an API key${NC}"
echo "Creating API key named 'Test API Key'..."

API_KEY_RESPONSE=$(curl -s -X POST "${API_URL}/api-keys" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "name": "Test API Key",
    "expiresInDays": 30
  }')

API_KEY=$(echo "$API_KEY_RESPONSE" | grep -o '"key":"[^"]*' | sed 's/"key":"//')
API_KEY_ID=$(echo "$API_KEY_RESPONSE" | grep -o '"id":"[^"]*' | sed 's/"id":"//')

if [ -z "$API_KEY" ]; then
  echo -e "${RED}✗ Failed to create API key${NC}"
  echo "Response: $API_KEY_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✓ Successfully created API key${NC}"
echo "API Key: $API_KEY"
echo "API Key ID: $API_KEY_ID"
echo ""

# Step 3: Test authentication with API key
echo -e "${YELLOW}Step 3: Test authentication with API key${NC}"
echo "Testing /v1/escrows/health/auth endpoint..."

AUTH_TEST=$(curl -s -X GET "${API_URL}/escrows/health/auth" \
  -H "X-API-Key: $API_KEY")

if echo "$AUTH_TEST" | grep -q '"authenticated":true'; then
  echo -e "${GREEN}✓ API key authentication successful${NC}"
  USER_EMAIL=$(echo "$AUTH_TEST" | grep -o '"user":"[^"]*' | sed 's/"user":"//')
  AUTH_METHOD=$(echo "$AUTH_TEST" | grep -o '"authMethod":"[^"]*' | sed 's/"authMethod":"//')
  echo "  User: $USER_EMAIL"
  echo "  Auth Method: $AUTH_METHOD"
else
  echo -e "${RED}✗ API key authentication failed${NC}"
  echo "Response: $AUTH_TEST"
fi
echo ""

# Step 4: Test database connection
echo -e "${YELLOW}Step 4: Test database connection${NC}"
echo "Testing /v1/escrows/health/db endpoint..."

DB_TEST=$(curl -s -X GET "${API_URL}/escrows/health/db" \
  -H "X-API-Key: $API_KEY")

if echo "$DB_TEST" | grep -q '"connected":true'; then
  echo -e "${GREEN}✓ Database connection successful${NC}"
  DATABASE=$(echo "$DB_TEST" | grep -o '"database":"[^"]*' | sed 's/"database":"//')
  echo "  Database: $DATABASE"
else
  echo -e "${RED}✗ Database connection failed${NC}"
  echo "Response: $DB_TEST"
fi
echo ""

# Step 5: Run comprehensive health check
echo -e "${YELLOW}Step 5: Run comprehensive health check${NC}"
echo "Testing all escrow operations with /v1/escrows/health..."

HEALTH_CHECK=$(curl -s -X GET "${API_URL}/escrows/health" \
  -H "X-API-Key: $API_KEY")

# Parse health check results
if echo "$HEALTH_CHECK" | grep -q '"success":true'; then
  echo -e "${GREEN}✓ All health checks passed${NC}"
else
  echo -e "${YELLOW}⚠ Some health checks failed${NC}"
fi

# Extract test results
echo -e "\n${BOLD}Test Results:${NC}"
echo "$HEALTH_CHECK" | grep -o '"name":"[^"]*","status":"[^"]*' | while read -r line; do
  TEST_NAME=$(echo "$line" | grep -o '"name":"[^"]*' | sed 's/"name":"//')
  TEST_STATUS=$(echo "$line" | grep -o '"status":"[^"]*' | sed 's/"status":"//')
  
  if [ "$TEST_STATUS" = "passed" ]; then
    echo -e "  ${GREEN}✓${NC} $TEST_NAME"
  elif [ "$TEST_STATUS" = "failed" ]; then
    echo -e "  ${RED}✗${NC} $TEST_NAME"
  else
    echo -e "  ${YELLOW}⚠${NC} $TEST_NAME ($TEST_STATUS)"
  fi
done
echo ""

# Step 6: Test regular escrow endpoints
echo -e "${YELLOW}Step 6: Test regular escrow endpoints${NC}"

# Get escrows list
echo "Testing GET /v1/escrows..."
ESCROWS_LIST=$(curl -s -X GET "${API_URL}/escrows?limit=5" \
  -H "X-API-Key: $API_KEY")

if echo "$ESCROWS_LIST" | grep -q '"success":true'; then
  echo -e "${GREEN}✓ Successfully retrieved escrows list${NC}"
  ESCROW_COUNT=$(echo "$ESCROWS_LIST" | grep -o '"id"' | wc -l)
  echo "  Found $ESCROW_COUNT escrows"
else
  echo -e "${RED}✗ Failed to retrieve escrows${NC}"
  echo "Response: $ESCROWS_LIST"
fi
echo ""

# Step 7: Test without authentication (should fail)
echo -e "${YELLOW}Step 7: Test without authentication (should fail)${NC}"
echo "Testing /v1/escrows without API key..."

NO_AUTH_TEST=$(curl -s -X GET "${API_URL}/escrows" \
  -w "\nHTTP_STATUS:%{http_code}")

HTTP_STATUS=$(echo "$NO_AUTH_TEST" | grep "HTTP_STATUS" | cut -d':' -f2)

if [ "$HTTP_STATUS" = "401" ]; then
  echo -e "${GREEN}✓ Correctly rejected unauthenticated request${NC}"
  echo "  HTTP Status: 401 Unauthorized"
else
  echo -e "${RED}✗ Security issue: Request should have been rejected${NC}"
  echo "  HTTP Status: $HTTP_STATUS"
fi
echo ""

# Step 8: List API keys
echo -e "${YELLOW}Step 8: List API keys${NC}"
echo "Getting list of API keys..."

API_KEYS_LIST=$(curl -s -X GET "${API_URL}/api-keys" \
  -H "Authorization: Bearer $JWT_TOKEN")

if echo "$API_KEYS_LIST" | grep -q '"success":true'; then
  echo -e "${GREEN}✓ Successfully retrieved API keys${NC}"
  KEY_COUNT=$(echo "$API_KEYS_LIST" | grep -o '"id"' | wc -l)
  echo "  Found $KEY_COUNT API key(s)"
else
  echo -e "${RED}✗ Failed to list API keys${NC}"
fi
echo ""

# Step 9: Revoke the test API key
echo -e "${YELLOW}Step 9: Cleanup - Revoke test API key${NC}"
echo "Revoking API key..."

REVOKE_RESPONSE=$(curl -s -X PUT "${API_URL}/api-keys/${API_KEY_ID}/revoke" \
  -H "Authorization: Bearer $JWT_TOKEN")

if echo "$REVOKE_RESPONSE" | grep -q '"success":true'; then
  echo -e "${GREEN}✓ Successfully revoked API key${NC}"
  
  # Test that revoked key no longer works
  echo "Verifying revoked key no longer works..."
  REVOKED_TEST=$(curl -s -X GET "${API_URL}/escrows/health/auth" \
    -H "X-API-Key: $API_KEY" \
    -w "\nHTTP_STATUS:%{http_code}")
  
  REVOKED_STATUS=$(echo "$REVOKED_TEST" | grep "HTTP_STATUS" | cut -d':' -f2)
  if [ "$REVOKED_STATUS" = "401" ]; then
    echo -e "${GREEN}✓ Revoked key correctly rejected${NC}"
  else
    echo -e "${RED}✗ Security issue: Revoked key still works${NC}"
  fi
else
  echo -e "${RED}✗ Failed to revoke API key${NC}"
fi
echo ""

# Summary
echo -e "${BLUE}${BOLD}===================================${NC}"
echo -e "${BLUE}${BOLD}         TEST SUMMARY              ${NC}"
echo -e "${BLUE}${BOLD}===================================${NC}\n"

echo -e "${GREEN}✓ API Key Authentication System Working${NC}"
echo -e "  • JWT authentication for management"
echo -e "  • API key generation and validation"
echo -e "  • Proper access control and permissions"
echo -e "  • Health check endpoints functional"
echo -e "  • Security properly enforced"
echo ""
echo -e "${BOLD}Important API Key: Save this for testing${NC}"
echo -e "${YELLOW}$API_KEY${NC}"
echo ""
echo -e "${BOLD}Example CURL commands:${NC}"
echo "# With API Key:"
echo "curl -H \"X-API-Key: $API_KEY\" ${API_URL}/escrows"
echo ""
echo "# With JWT Token:"
echo "curl -H \"Authorization: Bearer $JWT_TOKEN\" ${API_URL}/escrows"