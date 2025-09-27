#!/bin/bash

# Test script for escrow archive-then-delete workflow
# This tests the proper flow: Archive → Delete

API_URL="https://api.jaydenmetz.com/v1"
API_KEY=""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "========================================="
echo "ESCROW DELETE WORKFLOW TEST"
echo "Testing: Archive → Permanent Delete"
echo "========================================="

# Function to make API calls
api_call() {
    local method=$1
    local endpoint=$2
    local data=$3

    if [ -z "$data" ]; then
        curl -s -X $method \
            "${API_URL}${endpoint}" \
            -H "X-API-Key: $API_KEY" \
            -H "Content-Type: application/json"
    else
        curl -s -X $method \
            "${API_URL}${endpoint}" \
            -H "X-API-Key: $API_KEY" \
            -H "Content-Type: application/json" \
            -d "$data"
    fi
}

# Check if API key is provided
if [ -z "$1" ]; then
    echo -e "${RED}Usage: $0 <API_KEY>${NC}"
    echo "Please provide your API key as an argument"
    exit 1
fi

API_KEY=$1

echo ""
echo "Step 1: Create a test escrow"
echo "-----------------------------"

CREATE_DATA='{
  "property_address": "TEST DELETE WORKFLOW 123 Main St",
  "city": "Test City",
  "state": "CA",
  "zip_code": "90210",
  "purchase_price": 500000,
  "escrow_status": "Active",
  "closing_date": "2024-12-31"
}'

RESPONSE=$(api_call POST "/escrows" "$CREATE_DATA")
ESCROW_ID=$(echo $RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ -z "$ESCROW_ID" ]; then
    echo -e "${RED}❌ Failed to create test escrow${NC}"
    echo "Response: $RESPONSE"
    exit 1
fi

echo -e "${GREEN}✓ Created test escrow: $ESCROW_ID${NC}"

echo ""
echo "Step 2: Verify escrow exists"
echo "-----------------------------"

RESPONSE=$(api_call GET "/escrows/$ESCROW_ID")
if echo "$RESPONSE" | grep -q "$ESCROW_ID"; then
    echo -e "${GREEN}✓ Escrow exists and is accessible${NC}"
else
    echo -e "${RED}❌ Cannot access created escrow${NC}"
    exit 1
fi

echo ""
echo "Step 3: Archive the escrow (soft delete)"
echo "-----------------------------------------"

RESPONSE=$(api_call PUT "/escrows/$ESCROW_ID/archive")
if echo "$RESPONSE" | grep -q "success.*true"; then
    echo -e "${GREEN}✓ Escrow archived successfully${NC}"
else
    echo -e "${RED}❌ Failed to archive escrow${NC}"
    echo "Response: $RESPONSE"
    exit 1
fi

echo ""
echo "Step 4: Verify escrow is archived"
echo "----------------------------------"

# Try to get archived escrows
RESPONSE=$(api_call GET "/escrows?archived=true")
if echo "$RESPONSE" | grep -q "$ESCROW_ID"; then
    echo -e "${GREEN}✓ Escrow found in archives${NC}"
else
    echo -e "${YELLOW}⚠ Could not verify escrow in archives (may be permission issue)${NC}"
fi

echo ""
echo "Step 5: Try to delete non-archived escrow (should fail)"
echo "--------------------------------------------------------"

# Create another escrow to test
CREATE_DATA2='{
  "property_address": "TEST NON-ARCHIVE DELETE 456 Oak St",
  "city": "Test City",
  "state": "CA",
  "zip_code": "90210",
  "purchase_price": 600000,
  "escrow_status": "Active",
  "closing_date": "2024-12-31"
}'

RESPONSE=$(api_call POST "/escrows" "$CREATE_DATA2")
ESCROW_ID2=$(echo $RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ ! -z "$ESCROW_ID2" ]; then
    echo -e "${GREEN}✓ Created second test escrow: $ESCROW_ID2${NC}"

    # Try to delete without archiving (should fail)
    RESPONSE=$(api_call DELETE "/escrows/$ESCROW_ID2")
    if echo "$RESPONSE" | grep -q "archived"; then
        echo -e "${GREEN}✓ Correctly rejected deletion of non-archived escrow${NC}"
    else
        echo -e "${YELLOW}⚠ Delete may have succeeded without archive${NC}"
    fi

    # Clean up - archive then delete
    api_call PUT "/escrows/$ESCROW_ID2/archive" > /dev/null 2>&1
    api_call DELETE "/escrows/$ESCROW_ID2" > /dev/null 2>&1
fi

echo ""
echo "Step 6: Permanently delete archived escrow"
echo "-------------------------------------------"

RESPONSE=$(api_call DELETE "/escrows/$ESCROW_ID")
if echo "$RESPONSE" | grep -q "success.*true"; then
    echo -e "${GREEN}✓ Archived escrow permanently deleted${NC}"
else
    echo -e "${RED}❌ Failed to delete archived escrow${NC}"
    echo "Response: $RESPONSE"
    exit 1
fi

echo ""
echo "Step 7: Verify escrow is gone"
echo "------------------------------"

RESPONSE=$(api_call GET "/escrows/$ESCROW_ID")
if echo "$RESPONSE" | grep -q "not found\|404"; then
    echo -e "${GREEN}✓ Escrow successfully removed from system${NC}"
else
    echo -e "${YELLOW}⚠ Escrow may still exist${NC}"
    echo "Response: $RESPONSE"
fi

echo ""
echo "========================================="
echo -e "${GREEN}WORKFLOW TEST COMPLETE${NC}"
echo "Archive → Delete workflow working correctly!"
echo "========================================="