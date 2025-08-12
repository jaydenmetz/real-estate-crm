#!/bin/bash

# Escrow CRUD Test Script
# Tests the complete CREATE, READ, UPDATE, DELETE cycle for escrows

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

# Test data
TIMESTAMP=$(date +%s)
TEST_PREFIX="TEST_${TIMESTAMP}"

echo -e "${BLUE}${BOLD}===================================${NC}"
echo -e "${BLUE}${BOLD}     ESCROW CRUD TEST SUITE        ${NC}"
echo -e "${BLUE}${BOLD}===================================${NC}\n"

# Initialize counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to check test result
check_test() {
    local test_name="$1"
    local condition="$2"
    local response="$3"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if [ "$condition" = "true" ]; then
        echo -e "  ${GREEN}✓${NC} $test_name"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "  ${RED}✗${NC} $test_name"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        if [ ! -z "$response" ]; then
            echo -e "    ${YELLOW}Response: ${response:0:200}${NC}"
        fi
    fi
}

# Step 1: Login to get JWT token
echo -e "${YELLOW}Authenticating...${NC}"

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

echo -e "${GREEN}✓ Successfully authenticated${NC}\n"

# Step 2: Create an API key for testing
echo -e "${YELLOW}Creating API key...${NC}"

API_KEY_RESPONSE=$(curl -s -X POST "${API_URL}/api-keys" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "name": "CRUD Test Key",
    "expiresInDays": 1
  }')

API_KEY=$(echo "$API_KEY_RESPONSE" | grep -o '"key":"[^"]*' | sed 's/"key":"//')

if [ -z "$API_KEY" ]; then
  echo -e "${RED}✗ Failed to create API key${NC}"
  echo "Response: $API_KEY_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✓ API key created${NC}\n"

# Arrays to store created escrow IDs
declare -a ESCROW_IDS

echo -e "${BLUE}${BOLD}===================================${NC}"
echo -e "${BLUE}${BOLD}    TESTING ESCROW OPERATIONS      ${NC}"
echo -e "${BLUE}${BOLD}===================================${NC}\n"

# Test Set 1: Basic Escrow (snake_case)
echo -e "${YELLOW}Test Set 1: Basic Escrow (snake_case fields)${NC}"

CREATE_RESPONSE_1=$(curl -s -X POST "${API_URL}/escrows" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{
    "property_address": "'${TEST_PREFIX}' - 123 Test St",
    "city": "Test City",
    "state": "CA",
    "zip_code": "90210",
    "purchase_price": 500000,
    "escrow_status": "Active",
    "acceptance_date": "2025-01-01",
    "closing_date": "2025-02-01",
    "buyers": [{"name": "John Buyer", "email": "buyer1@test.com"}],
    "sellers": [{"name": "Jane Seller", "email": "seller1@test.com"}]
  }')

ESCROW_ID_1=$(echo "$CREATE_RESPONSE_1" | grep -o '"id":"[^"]*' | head -1 | sed 's/"id":"//')
if [ ! -z "$ESCROW_ID_1" ]; then
    ESCROW_IDS+=("$ESCROW_ID_1")
    check_test "CREATE escrow with snake_case" "true" "$CREATE_RESPONSE_1"
    
    # Test UPDATE
    UPDATE_RESPONSE_1=$(curl -s -X PUT "${API_URL}/escrows/${ESCROW_ID_1}" \
      -H "Content-Type: application/json" \
      -H "X-API-Key: $API_KEY" \
      -d '{
        "purchase_price": 550000,
        "escrow_status": "Pending"
      }')
    
    if echo "$UPDATE_RESPONSE_1" | grep -q '"success":true'; then
        check_test "UPDATE escrow (snake_case)" "true" "$UPDATE_RESPONSE_1"
    else
        check_test "UPDATE escrow (snake_case)" "false" "$UPDATE_RESPONSE_1"
    fi
    
    # Test DELETE
    DELETE_RESPONSE_1=$(curl -s -X DELETE "${API_URL}/escrows/${ESCROW_ID_1}" \
      -H "X-API-Key: $API_KEY")
    
    if echo "$DELETE_RESPONSE_1" | grep -q '"success":true'; then
        check_test "DELETE escrow (snake_case)" "true" "$DELETE_RESPONSE_1"
    else
        check_test "DELETE escrow (snake_case)" "false" "$DELETE_RESPONSE_1"
    fi
else
    check_test "CREATE escrow with snake_case" "false" "$CREATE_RESPONSE_1"
    check_test "UPDATE escrow (snake_case)" "false" "Skipped - no escrow created"
    check_test "DELETE escrow (snake_case)" "false" "Skipped - no escrow created"
fi
echo ""

# Test Set 2: Escrow with camelCase
echo -e "${YELLOW}Test Set 2: Escrow with camelCase fields${NC}"

CREATE_RESPONSE_2=$(curl -s -X POST "${API_URL}/escrows" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{
    "propertyAddress": "'${TEST_PREFIX}' - 456 Camel Dr",
    "city": "Camel City",
    "state": "CA",
    "zipCode": "90211",
    "purchasePrice": 750000,
    "escrowStatus": "Active",
    "acceptanceDate": "2025-01-15",
    "closingDate": "2025-02-15",
    "buyers": [{"name": "Bob Buyer", "email": "buyer2@test.com"}],
    "sellers": [{"name": "Sally Seller", "email": "seller2@test.com"}]
  }')

ESCROW_ID_2=$(echo "$CREATE_RESPONSE_2" | grep -o '"id":"[^"]*' | head -1 | sed 's/"id":"//')
if [ ! -z "$ESCROW_ID_2" ]; then
    ESCROW_IDS+=("$ESCROW_ID_2")
    check_test "CREATE escrow with camelCase" "true" "$CREATE_RESPONSE_2"
    
    # Test UPDATE
    UPDATE_RESPONSE_2=$(curl -s -X PUT "${API_URL}/escrows/${ESCROW_ID_2}" \
      -H "Content-Type: application/json" \
      -H "X-API-Key: $API_KEY" \
      -d '{
        "purchasePrice": 800000,
        "escrowStatus": "In Review"
      }')
    
    if echo "$UPDATE_RESPONSE_2" | grep -q '"success":true'; then
        check_test "UPDATE escrow (camelCase)" "true" "$UPDATE_RESPONSE_2"
    else
        check_test "UPDATE escrow (camelCase)" "false" "$UPDATE_RESPONSE_2"
    fi
    
    # Test DELETE
    DELETE_RESPONSE_2=$(curl -s -X DELETE "${API_URL}/escrows/${ESCROW_ID_2}" \
      -H "X-API-Key: $API_KEY")
    
    if echo "$DELETE_RESPONSE_2" | grep -q '"success":true'; then
        check_test "DELETE escrow (camelCase)" "true" "$DELETE_RESPONSE_2"
    else
        check_test "DELETE escrow (camelCase)" "false" "$DELETE_RESPONSE_2"
    fi
else
    check_test "CREATE escrow with camelCase" "false" "$CREATE_RESPONSE_2"
    check_test "UPDATE escrow (camelCase)" "false" "Skipped - no escrow created"
    check_test "DELETE escrow (camelCase)" "false" "Skipped - no escrow created"
fi
echo ""

# Test Set 3: Mixed case fields
echo -e "${YELLOW}Test Set 3: Escrow with mixed case fields${NC}"

CREATE_RESPONSE_3=$(curl -s -X POST "${API_URL}/escrows" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{
    "property_address": "'${TEST_PREFIX}' - 789 Mixed Ave",
    "city": "Mixed City",
    "state": "CA",
    "zipCode": "90212",
    "purchase_price": 600000,
    "escrowStatus": "Active",
    "acceptance_date": "2025-01-20",
    "closingDate": "2025-02-20",
    "buyers": [{"name": "Charlie Buyer", "email": "buyer3@test.com"}],
    "sellers": [{"name": "Diana Seller", "email": "seller3@test.com"}]
  }')

ESCROW_ID_3=$(echo "$CREATE_RESPONSE_3" | grep -o '"id":"[^"]*' | head -1 | sed 's/"id":"//')
if [ ! -z "$ESCROW_ID_3" ]; then
    ESCROW_IDS+=("$ESCROW_ID_3")
    check_test "CREATE escrow with mixed case" "true" "$CREATE_RESPONSE_3"
    
    # Test UPDATE with checklist
    UPDATE_RESPONSE_3=$(curl -s -X PATCH "${API_URL}/escrows/${ESCROW_ID_3}/checklist" \
      -H "Content-Type: application/json" \
      -H "X-API-Key: $API_KEY" \
      -d '{
        "item": "loan.preApproval",
        "value": true,
        "note": "Approved by bank"
      }')
    
    if echo "$UPDATE_RESPONSE_3" | grep -q '"success":true'; then
        check_test "UPDATE escrow checklist" "true" "$UPDATE_RESPONSE_3"
    else
        check_test "UPDATE escrow checklist" "false" "$UPDATE_RESPONSE_3"
    fi
    
    # Test READ specific escrow
    READ_RESPONSE_3=$(curl -s -X GET "${API_URL}/escrows/${ESCROW_ID_3}" \
      -H "X-API-Key: $API_KEY")
    
    if echo "$READ_RESPONSE_3" | grep -q '"success":true'; then
        check_test "READ specific escrow" "true" "$READ_RESPONSE_3"
    else
        check_test "READ specific escrow" "false" "$READ_RESPONSE_3"
    fi
    
    # Test DELETE
    DELETE_RESPONSE_3=$(curl -s -X DELETE "${API_URL}/escrows/${ESCROW_ID_3}" \
      -H "X-API-Key: $API_KEY")
    
    if echo "$DELETE_RESPONSE_3" | grep -q '"success":true'; then
        check_test "DELETE escrow (mixed case)" "true" "$DELETE_RESPONSE_3"
    else
        check_test "DELETE escrow (mixed case)" "false" "$DELETE_RESPONSE_3"
    fi
else
    check_test "CREATE escrow with mixed case" "false" "$CREATE_RESPONSE_3"
    check_test "UPDATE escrow checklist" "false" "Skipped - no escrow created"
    check_test "READ specific escrow" "false" "Skipped - no escrow created"
    check_test "DELETE escrow (mixed case)" "false" "Skipped - no escrow created"
fi
echo ""

# Additional Tests
echo -e "${YELLOW}Additional Tests${NC}"

# Test authentication
AUTH_TEST=$(curl -s -X GET "${API_URL}/escrows/health/auth" \
  -H "X-API-Key: $API_KEY")

if echo "$AUTH_TEST" | grep -q '"authenticated":true'; then
    check_test "API Key Authentication" "true" "$AUTH_TEST"
else
    check_test "API Key Authentication" "false" "$AUTH_TEST"
fi

# Test database connection
DB_TEST=$(curl -s -X GET "${API_URL}/escrows/health/db" \
  -H "X-API-Key: $API_KEY")

if echo "$DB_TEST" | grep -q '"connected":true'; then
    check_test "Database Connection" "true" "$DB_TEST"
else
    check_test "Database Connection" "false" "$DB_TEST"
fi

# Test listing escrows
LIST_TEST=$(curl -s -X GET "${API_URL}/escrows?limit=5" \
  -H "X-API-Key: $API_KEY")

if echo "$LIST_TEST" | grep -q '"success":true'; then
    check_test "List Escrows" "true" "$LIST_TEST"
else
    check_test "List Escrows" "false" "$LIST_TEST"
fi
echo ""

# Cleanup - ensure all test escrows are deleted
echo -e "${YELLOW}Cleanup: Removing any remaining test escrows...${NC}"
for id in "${ESCROW_IDS[@]}"; do
    curl -s -X DELETE "${API_URL}/escrows/${id}" -H "X-API-Key: $API_KEY" > /dev/null 2>&1
done
echo -e "${GREEN}✓ Cleanup complete${NC}\n"

# Summary
echo -e "${BLUE}${BOLD}===================================${NC}"
echo -e "${BLUE}${BOLD}         TEST SUMMARY              ${NC}"
echo -e "${BLUE}${BOLD}===================================${NC}\n"

echo -e "${BOLD}Total Tests:${NC} $TOTAL_TESTS"
echo -e "${GREEN}Passed:${NC} $PASSED_TESTS"
echo -e "${RED}Failed:${NC} $FAILED_TESTS"

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "\n${GREEN}${BOLD}✓ All tests passed!${NC}"
else
    echo -e "\n${RED}${BOLD}✗ Some tests failed${NC}"
    echo -e "${YELLOW}Please check the API logs for more details${NC}"
fi

echo ""
echo -e "${BOLD}Test Timestamp:${NC} $(date)"
echo -e "${BOLD}API URL:${NC} $API_URL"