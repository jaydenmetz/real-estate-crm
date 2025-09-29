#!/bin/bash

# Test script for Listings API endpoints
# Usage: ./test-listings-api.sh

API_BASE="http://localhost:3001/api/v1"
AUTH_TOKEN="your-auth-token-here"  # Replace with actual token

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🏠 Testing Listings API Endpoints${NC}\n"

# 1. Create a listing
echo -e "${GREEN}1. Creating new listing...${NC}"
LISTING_RESPONSE=$(curl -s -X POST "${API_BASE}/listings" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "propertyAddress": "123 Test Street, San Diego, CA 92101",
    "listPrice": 500000,
    "propertyType": "Single Family",
    "bedrooms": 3,
    "bathrooms": 2,
    "squareFootage": 1800,
    "lotSize": 7200,
    "yearBuilt": 2015,
    "description": "Beautiful home in prime location",
    "features": ["Pool", "Updated Kitchen", "Solar Panels"],
    "listingStatus": "Coming Soon",
    "listingCommission": 3.0,
    "buyerCommission": 2.5
  }')

LISTING_ID=$(echo $LISTING_RESPONSE | grep -o '"id":"[^"]*' | grep -o '[^"]*$' | head -1)
echo "Created listing ID: $LISTING_ID"
echo -e "Response: $LISTING_RESPONSE\n"

# 2. Get all listings with filters
echo -e "${GREEN}2. Getting all listings with filters...${NC}"
curl -s -X GET "${API_BASE}/listings?status=Active&minPrice=300000&maxPrice=700000&page=1&limit=10" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" | jq '.'
echo ""

# 3. Get single listing
echo -e "${GREEN}3. Getting single listing...${NC}"
curl -s -X GET "${API_BASE}/listings/${LISTING_ID}" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" | jq '.'
echo ""

# 4. Update listing status to Active
echo -e "${GREEN}4. Updating listing status to Active...${NC}"
curl -s -X PATCH "${API_BASE}/listings/${LISTING_ID}/status" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"status": "Active"}' | jq '.'
echo ""

# 5. Record a price change
echo -e "${GREEN}5. Recording price reduction...${NC}"
curl -s -X POST "${API_BASE}/listings/${LISTING_ID}/price-change" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "newPrice": 475000,
    "reason": "Price Reduction - Motivated Seller"
  }' | jq '.'
echo ""

# 6. Log a showing
echo -e "${GREEN}6. Logging a showing...${NC}"
curl -s -X POST "${API_BASE}/listings/${LISTING_ID}/showings" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2025-01-18",
    "time": "14:30",
    "agentName": "Jane Smith",
    "agentEmail": "jane@realty.com",
    "agentPhone": "555-0123",
    "feedback": "Clients loved the kitchen and backyard",
    "interested": true
  }' | jq '.'
echo ""

# 7. Update marketing checklist
echo -e "${GREEN}7. Updating marketing checklist...${NC}"
curl -s -X PUT "${API_BASE}/listings/${LISTING_ID}/marketing-checklist" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "checklistData": [
      {
        "checklistItem": "Professional photos scheduled",
        "completed": true,
        "notes": "Photographer booked for Saturday"
      },
      {
        "checklistItem": "MLS listing submitted",
        "completed": true,
        "notes": "Listed on MLS"
      }
    ]
  }' | jq '.'
echo ""

# 8. Track analytics event
echo -e "${GREEN}8. Tracking view event...${NC}"
curl -s -X POST "${API_BASE}/listings/${LISTING_ID}/analytics" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"eventType": "view"}' | jq '.'
echo ""

# 9. Get listing analytics
echo -e "${GREEN}9. Getting listing analytics...${NC}"
curl -s -X GET "${API_BASE}/listings/${LISTING_ID}/analytics" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" | jq '.'
echo ""

# 10. Update listing to Pending
echo -e "${GREEN}10. Updating status to Pending...${NC}"
curl -s -X PATCH "${API_BASE}/listings/${LISTING_ID}/status" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"status": "Pending"}' | jq '.'
echo ""

echo -e "${BLUE}✅ All listing tests completed!${NC}"

# SQL queries to verify data
echo -e "\n${BLUE}Verify in database:${NC}"
echo "psql \$DATABASE_URL -c \"SELECT id, property_address, list_price, listing_status FROM listings WHERE id = '${LISTING_ID}';\""
echo "psql \$DATABASE_URL -c \"SELECT * FROM listing_price_history WHERE listing_id = '${LISTING_ID}';\""
echo "psql \$DATABASE_URL -c \"SELECT * FROM listing_showings WHERE listing_id = '${LISTING_ID}';\""