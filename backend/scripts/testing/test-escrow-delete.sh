#!/bin/bash

# Test script for escrow delete functionality (single and batch)
# This tests both JWT authentication and API key authentication

# Configuration
API_BASE="https://api.jaydenmetz.com/v1"
EMAIL="admin@jaydenmetz.com"
PASSWORD="AdminPassword123!"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=====================================${NC}"
echo -e "${BLUE}  Escrow Delete Functionality Test  ${NC}"
echo -e "${BLUE}=====================================${NC}"
echo ""

# Step 1: Login and get JWT token
echo -e "${YELLOW}Step 1: Authenticating...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$EMAIL\", \"password\": \"$PASSWORD\"}")

TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | sed 's/"token":"//')

if [ -z "$TOKEN" ]; then
  echo -e "${RED}❌ Failed to login${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Successfully authenticated${NC}"
echo ""

# Step 2: Create test escrows
echo -e "${YELLOW}Step 2: Creating test escrows...${NC}"

create_escrow() {
  local address=$1
  local city=$2

  curl -s -X POST "$API_BASE/escrows" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"propertyAddress\": \"$address\",
      \"city\": \"$city\",
      \"state\": \"CA\",
      \"zipCode\": \"93301\",
      \"purchasePrice\": 500000,
      \"escrowNumber\": \"TEST-$(date +%s)-$RANDOM\",
      \"status\": \"active\"
    }"
}

# Create 3 test escrows
echo "Creating test escrow 1..."
ESCROW1=$(create_escrow "123 Test St" "Bakersfield")
ESCROW1_ID=$(echo "$ESCROW1" | grep -o '"id":"[^"]*' | sed 's/"id":"//' | head -1)

echo "Creating test escrow 2..."
ESCROW2=$(create_escrow "456 Demo Ave" "Bakersfield")
ESCROW2_ID=$(echo "$ESCROW2" | grep -o '"id":"[^"]*' | sed 's/"id":"//' | head -1)

echo "Creating test escrow 3..."
ESCROW3=$(create_escrow "789 Sample Blvd" "Bakersfield")
ESCROW3_ID=$(echo "$ESCROW3" | grep -o '"id":"[^"]*' | sed 's/"id":"//' | head -1)

if [ -z "$ESCROW1_ID" ] || [ -z "$ESCROW2_ID" ] || [ -z "$ESCROW3_ID" ]; then
  echo -e "${RED}❌ Failed to create test escrows${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Created 3 test escrows${NC}"
echo "  - Escrow 1: $ESCROW1_ID"
echo "  - Escrow 2: $ESCROW2_ID"
echo "  - Escrow 3: $ESCROW3_ID"
echo ""

# Step 3: Archive the escrows
echo -e "${YELLOW}Step 3: Archiving test escrows...${NC}"

archive_escrow() {
  local id=$1
  curl -s -X PUT "$API_BASE/escrows/$id/archive" \
    -H "Authorization: Bearer $TOKEN"
}

archive_escrow "$ESCROW1_ID" > /dev/null
archive_escrow "$ESCROW2_ID" > /dev/null
archive_escrow "$ESCROW3_ID" > /dev/null

echo -e "${GREEN}✅ Archived all test escrows${NC}"
echo ""

# Step 4: Test single delete
echo -e "${YELLOW}Step 4: Testing single delete...${NC}"

DELETE_RESPONSE=$(curl -s -X DELETE "$API_BASE/escrows/$ESCROW1_ID" \
  -H "Authorization: Bearer $TOKEN")

if echo "$DELETE_RESPONSE" | grep -q '"success":true'; then
  echo -e "${GREEN}✅ Successfully deleted single escrow${NC}"
else
  echo -e "${RED}❌ Failed to delete single escrow${NC}"
  echo "$DELETE_RESPONSE"
fi
echo ""

# Step 5: Test batch delete
echo -e "${YELLOW}Step 5: Testing batch delete...${NC}"

BATCH_RESPONSE=$(curl -s -X POST "$API_BASE/escrows/batch-delete" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"ids\": [\"$ESCROW2_ID\", \"$ESCROW3_ID\"]}")

if echo "$BATCH_RESPONSE" | grep -q '"success":true'; then
  DELETED_COUNT=$(echo "$BATCH_RESPONSE" | grep -o '"deleted":[0-9]*' | sed 's/"deleted"://')
  echo -e "${GREEN}✅ Successfully batch deleted $DELETED_COUNT escrows${NC}"
else
  echo -e "${RED}❌ Failed to batch delete escrows${NC}"
  echo "$BATCH_RESPONSE"
fi
echo ""

# Step 6: Verify deletions
echo -e "${YELLOW}Step 6: Verifying deletions...${NC}"

# Try to fetch the deleted escrows (should fail)
CHECK1=$(curl -s -X GET "$API_BASE/escrows/$ESCROW1_ID" \
  -H "Authorization: Bearer $TOKEN")

CHECK2=$(curl -s -X GET "$API_BASE/escrows/$ESCROW2_ID" \
  -H "Authorization: Bearer $TOKEN")

CHECK3=$(curl -s -X GET "$API_BASE/escrows/$ESCROW3_ID" \
  -H "Authorization: Bearer $TOKEN")

ERRORS=0

if echo "$CHECK1" | grep -q '"success":false'; then
  echo -e "${GREEN}  ✓ Escrow 1 properly deleted${NC}"
else
  echo -e "${RED}  ✗ Escrow 1 still exists${NC}"
  ERRORS=$((ERRORS + 1))
fi

if echo "$CHECK2" | grep -q '"success":false'; then
  echo -e "${GREEN}  ✓ Escrow 2 properly deleted${NC}"
else
  echo -e "${RED}  ✗ Escrow 2 still exists${NC}"
  ERRORS=$((ERRORS + 1))
fi

if echo "$CHECK3" | grep -q '"success":false'; then
  echo -e "${GREEN}  ✓ Escrow 3 properly deleted${NC}"
else
  echo -e "${RED}  ✗ Escrow 3 still exists${NC}"
  ERRORS=$((ERRORS + 1))
fi

echo ""

# Step 7: Test with API Key
echo -e "${YELLOW}Step 7: Testing with API Key authentication...${NC}"

# Create an API key
API_KEY_RESPONSE=$(curl -s -X POST "$API_BASE/api-keys" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Delete Test Key", "expiresInDays": 1}')

API_KEY=$(echo "$API_KEY_RESPONSE" | grep -o '"key":"[^"]*' | sed 's/"key":"//')

if [ -z "$API_KEY" ]; then
  echo -e "${RED}❌ Failed to create API key${NC}"
else
  echo -e "${GREEN}✅ Created API key for testing${NC}"

  # Create and archive a test escrow with API key
  echo "Creating test escrow with API key..."
  ESCROW4=$(curl -s -X POST "$API_BASE/escrows" \
    -H "X-API-Key: $API_KEY" \
    -H "Content-Type: application/json" \
    -d "{
      \"propertyAddress\": \"999 API Test Dr\",
      \"city\": \"Bakersfield\",
      \"state\": \"CA\",
      \"zipCode\": \"93301\",
      \"purchasePrice\": 600000,
      \"escrowNumber\": \"API-TEST-$(date +%s)\",
      \"status\": \"active\"
    }")

  ESCROW4_ID=$(echo "$ESCROW4" | grep -o '"id":"[^"]*' | sed 's/"id":"//' | head -1)

  if [ ! -z "$ESCROW4_ID" ]; then
    # Archive it
    curl -s -X PUT "$API_BASE/escrows/$ESCROW4_ID/archive" \
      -H "X-API-Key: $API_KEY" > /dev/null

    # Delete with API key
    DELETE_API_RESPONSE=$(curl -s -X DELETE "$API_BASE/escrows/$ESCROW4_ID" \
      -H "X-API-Key: $API_KEY")

    if echo "$DELETE_API_RESPONSE" | grep -q '"success":true'; then
      echo -e "${GREEN}✅ Successfully deleted escrow with API key${NC}"
    else
      echo -e "${RED}❌ Failed to delete with API key${NC}"
      ERRORS=$((ERRORS + 1))
    fi
  fi

  # Clean up API key
  curl -s -X DELETE "$API_BASE/api-keys/$(echo "$API_KEY_RESPONSE" | grep -o '"id":"[^"]*' | sed 's/"id":"//')" \
    -H "Authorization: Bearer $TOKEN" > /dev/null
fi

echo ""

# Final summary
echo -e "${BLUE}=====================================${NC}"
echo -e "${BLUE}            Test Summary             ${NC}"
echo -e "${BLUE}=====================================${NC}"

if [ $ERRORS -eq 0 ]; then
  echo -e "${GREEN}✅ All tests passed successfully!${NC}"
  echo ""
  echo "Tested functionality:"
  echo "  • Single escrow deletion"
  echo "  • Batch escrow deletion"
  echo "  • JWT authentication"
  echo "  • API key authentication"
  echo "  • Proper cleanup verification"
else
  echo -e "${RED}❌ $ERRORS test(s) failed${NC}"
  exit 1
fi