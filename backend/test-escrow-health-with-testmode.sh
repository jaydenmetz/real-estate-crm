#!/bin/bash

# Test the escrow health endpoint with test mode enabled (no popups)
# This will test the complete archive-then-delete workflow

API_URL="https://api.jaydenmetz.com/v1"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "========================================="
echo "ESCROW HEALTH CHECK WITH TEST MODE"
echo "Archive → Delete Workflow"
echo "========================================="

# Check if API key is provided
if [ -z "$1" ]; then
    echo -e "${RED}Usage: $0 <API_KEY>${NC}"
    echo "Please provide your API key as an argument"
    exit 1
fi

API_KEY=$1

echo ""
echo -e "${BLUE}Running health check with test mode enabled...${NC}"
echo "This will:"
echo "1. Create a test escrow"
echo "2. Read the test escrow"
echo "3. Update the test escrow"
echo "4. Update people data"
echo "5. Update checklists"
echo "6. Check permissions"
echo "7. Archive the test escrow"
echo "8. Permanently delete the archived escrow"
echo ""

# Run the health check
RESPONSE=$(curl -s -X GET \
    "${API_URL}/escrows/health?testMode=true" \
    -H "X-API-Key: $API_KEY" \
    -H "Content-Type: application/json")

# Parse the response
SUCCESS=$(echo $RESPONSE | grep -o '"success":[^,}]*' | cut -d: -f2)

if [ "$SUCCESS" = "true" ]; then
    echo -e "${GREEN}✅ HEALTH CHECK PASSED${NC}"
else
    echo -e "${RED}❌ HEALTH CHECK FAILED${NC}"
fi

echo ""
echo "Test Results:"
echo "-------------"

# Extract and display individual test results
echo "$RESPONSE" | python3 -m json.tool 2>/dev/null | grep -A2 '"name"' | while IFS= read -r line; do
    if echo "$line" | grep -q '"name"'; then
        TEST_NAME=$(echo "$line" | cut -d'"' -f4)
    elif echo "$line" | grep -q '"status"'; then
        STATUS=$(echo "$line" | cut -d'"' -f4)

        if [ "$STATUS" = "passed" ]; then
            echo -e "${GREEN}✓${NC} $TEST_NAME: $STATUS"
        elif [ "$STATUS" = "failed" ]; then
            echo -e "${RED}✗${NC} $TEST_NAME: $STATUS"
        elif [ "$STATUS" = "skipped" ]; then
            echo -e "${YELLOW}⊘${NC} $TEST_NAME: $STATUS"
        else
            echo "  $TEST_NAME: $STATUS"
        fi
    fi
done

# Extract summary
echo ""
echo "Summary:"
echo "--------"
TOTAL=$(echo $RESPONSE | grep -o '"total":[0-9]*' | cut -d: -f2)
PASSED=$(echo $RESPONSE | grep -o '"passed":[0-9]*' | cut -d: -f2)
FAILED=$(echo $RESPONSE | grep -o '"failed":[0-9]*' | cut -d: -f2)
SKIPPED=$(echo $RESPONSE | grep -o '"skipped":[0-9]*' | cut -d: -f2)

echo "Total tests: $TOTAL"
echo -e "${GREEN}Passed: $PASSED${NC}"
if [ "$FAILED" != "0" ]; then
    echo -e "${RED}Failed: $FAILED${NC}"
else
    echo "Failed: $FAILED"
fi
if [ "$SKIPPED" != "0" ]; then
    echo -e "${YELLOW}Skipped: $SKIPPED${NC}"
fi

echo ""
if [ "$SUCCESS" = "true" ]; then
    echo -e "${GREEN}=========================================${NC}"
    echo -e "${GREEN}✅ ALL TESTS PASSED SUCCESSFULLY!${NC}"
    echo -e "${GREEN}Archive → Delete workflow is working!${NC}"
    echo -e "${GREEN}=========================================${NC}"
else
    echo -e "${RED}=========================================${NC}"
    echo -e "${RED}⚠️  Some tests failed. Check the output above.${NC}"
    echo -e "${RED}=========================================${NC}"
    echo ""
    echo "Full response for debugging:"
    echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
fi