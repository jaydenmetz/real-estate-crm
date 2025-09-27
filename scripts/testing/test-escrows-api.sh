#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color
BOLD='\033[1m'

echo -e "${BLUE}${BOLD}===================================${NC}"
echo -e "${BLUE}${BOLD}  ESCROW API ENDPOINT TEST SUITE  ${NC}"
echo -e "${BLUE}${BOLD}===================================${NC}\n"

# Set API URL based on environment
if [ "$NODE_ENV" == "production" ]; then
    API_URL="https://crm.jaydenmetz.com/v1"
else
    API_URL="http://localhost:5050/v1"
fi

echo -e "${YELLOW}Testing against: ${API_URL}${NC}\n"

# Test user tokens (you'll need to replace with actual tokens)
JAYDEN_TOKEN="your-jayden-token-here"
JOSH_TOKEN="your-josh-token-here"

# Counter for test results
PASSED=0
FAILED=0
SKIPPED=0

# Function to test endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local description=$3
    local token=$4
    local data=$5
    local expected_status=$6
    
    echo -e "${BOLD}Testing: ${description}${NC}"
    echo "  Method: $method"
    echo "  Endpoint: $endpoint"
    
    if [ "$token" == "SKIP" ]; then
        echo -e "  ${YELLOW}⚠ SKIPPED - No token available${NC}\n"
        ((SKIPPED++))
        return
    fi
    
    # Build curl command
    if [ "$method" == "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" -X GET \
            -H "Authorization: Bearer $token" \
            -H "Content-Type: application/json" \
            "${API_URL}${endpoint}")
    elif [ "$method" == "POST" ] || [ "$method" == "PUT" ] || [ "$method" == "PATCH" ]; then
        response=$(curl -s -w "\n%{http_code}" -X $method \
            -H "Authorization: Bearer $token" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "${API_URL}${endpoint}")
    elif [ "$method" == "DELETE" ]; then
        response=$(curl -s -w "\n%{http_code}" -X DELETE \
            -H "Authorization: Bearer $token" \
            -H "Content-Type: application/json" \
            "${API_URL}${endpoint}")
    fi
    
    # Extract status code and body
    status_code=$(echo "$response" | tail -n 1)
    body=$(echo "$response" | sed '$d')
    
    # Check if test passed
    if [ "$status_code" == "$expected_status" ]; then
        echo -e "  ${GREEN}✓ PASSED${NC} - Status: $status_code"
        ((PASSED++))
        
        # Show success response structure (first 200 chars)
        if [ "$status_code" == "200" ] || [ "$status_code" == "201" ]; then
            preview=$(echo "$body" | head -c 200)
            echo -e "  Response preview: ${preview}..."
        fi
    else
        echo -e "  ${RED}✗ FAILED${NC} - Expected: $expected_status, Got: $status_code"
        ((FAILED++))
        
        # Show error message if available
        error_msg=$(echo "$body" | grep -o '"message":"[^"]*"' | head -1)
        if [ ! -z "$error_msg" ]; then
            echo -e "  Error: $error_msg"
        fi
    fi
    echo ""
}

# ====================
# AUTHENTICATION TESTS
# ====================
echo -e "${BLUE}${BOLD}1. AUTHENTICATION TESTS${NC}\n"

test_endpoint "GET" "/escrows" \
    "Request without token" \
    "" \
    "" \
    "401"

test_endpoint "GET" "/escrows" \
    "Request with invalid token" \
    "invalid-token-123" \
    "" \
    "401"

# ====================
# READ ENDPOINTS (GET)
# ====================
echo -e "${BLUE}${BOLD}2. READ ENDPOINTS (GET)${NC}\n"

test_endpoint "GET" "/escrows" \
    "List all escrows" \
    "$JAYDEN_TOKEN" \
    "" \
    "200"

test_endpoint "GET" "/escrows/stats" \
    "Get dashboard statistics" \
    "$JAYDEN_TOKEN" \
    "" \
    "200"

test_endpoint "GET" "/escrows/database" \
    "Get database escrows" \
    "$JAYDEN_TOKEN" \
    "" \
    "200"

# Test with a specific escrow ID (you'll need to set this)
ESCROW_ID="test-escrow-id"

test_endpoint "GET" "/escrows/$ESCROW_ID" \
    "Get single escrow details" \
    "$JAYDEN_TOKEN" \
    "" \
    "200"

test_endpoint "GET" "/escrows/$ESCROW_ID/people" \
    "Get escrow people" \
    "$JAYDEN_TOKEN" \
    "" \
    "200"

test_endpoint "GET" "/escrows/$ESCROW_ID/timeline" \
    "Get escrow timeline" \
    "$JAYDEN_TOKEN" \
    "" \
    "200"

test_endpoint "GET" "/escrows/$ESCROW_ID/financials" \
    "Get escrow financials" \
    "$JAYDEN_TOKEN" \
    "" \
    "200"

test_endpoint "GET" "/escrows/$ESCROW_ID/checklists" \
    "Get escrow checklists" \
    "$JAYDEN_TOKEN" \
    "" \
    "200"

test_endpoint "GET" "/escrows/$ESCROW_ID/documents" \
    "Get escrow documents" \
    "$JAYDEN_TOKEN" \
    "" \
    "200"

test_endpoint "GET" "/escrows/$ESCROW_ID/property-details" \
    "Get property details" \
    "$JAYDEN_TOKEN" \
    "" \
    "200"

test_endpoint "GET" "/escrows/$ESCROW_ID/image" \
    "Get property image" \
    "$JAYDEN_TOKEN" \
    "" \
    "200"

# ====================
# WRITE ENDPOINTS (POST/PUT)
# ====================
echo -e "${BLUE}${BOLD}3. WRITE ENDPOINTS (POST/PUT)${NC}\n"

# Create new escrow
NEW_ESCROW_DATA='{
  "propertyAddress": "123 Test API Street",
  "city": "API City",
  "state": "CA",
  "zipCode": "90210",
  "purchasePrice": 500000,
  "escrowStatus": "active",
  "openDate": "2025-01-01",
  "scheduledCloseDate": "2025-02-01"
}'

test_endpoint "POST" "/escrows" \
    "Create new escrow" \
    "$JAYDEN_TOKEN" \
    "$NEW_ESCROW_DATA" \
    "201"

# Update escrow
UPDATE_DATA='{
  "escrowStatus": "pending",
  "purchasePrice": 525000
}'

test_endpoint "PUT" "/escrows/$ESCROW_ID" \
    "Update escrow" \
    "$JAYDEN_TOKEN" \
    "$UPDATE_DATA" \
    "200"

# Update people
PEOPLE_DATA='{
  "buyers": [{"name": "John Buyer", "email": "john@test.com"}],
  "sellers": [{"name": "Jane Seller", "email": "jane@test.com"}]
}'

test_endpoint "PUT" "/escrows/$ESCROW_ID/people" \
    "Update escrow people" \
    "$JAYDEN_TOKEN" \
    "$PEOPLE_DATA" \
    "200"

# Update checklists
CHECKLIST_DATA='{
  "loan": {
    "preApproval": {"checked": true},
    "loanApplication": {"checked": false}
  }
}'

test_endpoint "PUT" "/escrows/$ESCROW_ID/checklists" \
    "Update checklists" \
    "$JAYDEN_TOKEN" \
    "$CHECKLIST_DATA" \
    "200"

# Update financials
FINANCIAL_DATA='{
  "purchasePrice": 550000,
  "loanAmount": 440000,
  "downPayment": 110000,
  "earnestMoney": 10000
}'

test_endpoint "PUT" "/escrows/$ESCROW_ID/financials" \
    "Update financials" \
    "$JAYDEN_TOKEN" \
    "$FINANCIAL_DATA" \
    "200"

# Update timeline
TIMELINE_DATA='{
  "inspectionDate": "2025-01-10",
  "appraisalDate": "2025-01-15",
  "closingDate": "2025-02-01"
}'

test_endpoint "PUT" "/escrows/$ESCROW_ID/timeline" \
    "Update timeline" \
    "$JAYDEN_TOKEN" \
    "$TIMELINE_DATA" \
    "200"

# Update property details
PROPERTY_DATA='{
  "bedrooms": 4,
  "bathrooms": 3,
  "squareFeet": 2500,
  "yearBuilt": 2020
}'

test_endpoint "PUT" "/escrows/$ESCROW_ID/property-details" \
    "Update property details" \
    "$JAYDEN_TOKEN" \
    "$PROPERTY_DATA" \
    "200"

# ====================
# PERMISSION TESTS
# ====================
echo -e "${BLUE}${BOLD}4. PERMISSION TESTS${NC}\n"

test_endpoint "GET" "/escrows/$ESCROW_ID" \
    "Josh accessing Jayden's escrow (should fail)" \
    "$JOSH_TOKEN" \
    "" \
    "403"

test_endpoint "PUT" "/escrows/$ESCROW_ID" \
    "Josh updating Jayden's escrow (should fail)" \
    "$JOSH_TOKEN" \
    '{"escrowStatus": "closed"}' \
    "403"

test_endpoint "DELETE" "/escrows/$ESCROW_ID" \
    "Non-admin deleting escrow (should fail)" \
    "$JOSH_TOKEN" \
    "" \
    "403"

# ====================
# DELETE ENDPOINT
# ====================
echo -e "${BLUE}${BOLD}5. DELETE ENDPOINT${NC}\n"

test_endpoint "DELETE" "/escrows/$ESCROW_ID" \
    "Delete escrow (admin only)" \
    "$JAYDEN_TOKEN" \
    "" \
    "200"

# ====================
# ERROR HANDLING TESTS
# ====================
echo -e "${BLUE}${BOLD}6. ERROR HANDLING TESTS${NC}\n"

test_endpoint "GET" "/escrows/non-existent-id" \
    "Get non-existent escrow" \
    "$JAYDEN_TOKEN" \
    "" \
    "404"

test_endpoint "POST" "/escrows" \
    "Create escrow with invalid data" \
    "$JAYDEN_TOKEN" \
    '{"invalid": "data"}' \
    "400"

test_endpoint "PUT" "/escrows/$ESCROW_ID/checklists" \
    "Update with malformed JSON" \
    "$JAYDEN_TOKEN" \
    '{invalid json}' \
    "400"

# ====================
# TEST SUMMARY
# ====================
echo -e "${BLUE}${BOLD}===================================${NC}"
echo -e "${BLUE}${BOLD}         TEST SUMMARY              ${NC}"
echo -e "${BLUE}${BOLD}===================================${NC}\n"

TOTAL=$((PASSED + FAILED + SKIPPED))

echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo -e "${YELLOW}Skipped: $SKIPPED${NC}"
echo -e "${BOLD}Total: $TOTAL${NC}\n"

if [ $FAILED -eq 0 ] && [ $SKIPPED -eq 0 ]; then
    echo -e "${GREEN}${BOLD}✓ All tests passed!${NC}"
    exit 0
elif [ $FAILED -eq 0 ]; then
    echo -e "${YELLOW}${BOLD}⚠ All run tests passed, but some were skipped${NC}"
    exit 0
else
    echo -e "${RED}${BOLD}✗ Some tests failed${NC}"
    exit 1
fi