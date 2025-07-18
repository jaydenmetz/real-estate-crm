#!/bin/bash

# Test script for Clients API endpoints
# Make sure the server is running on port 3001

BASE_URL="http://localhost:3001/api/v1/clients"
CLIENT_ID=""

echo "========================================="
echo "Testing Clients API Endpoints"
echo "========================================="

# Test 1: Create a client
echo -e "\n1. Creating a new client..."
CREATE_RESPONSE=$(curl -s -X POST $BASE_URL \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane@example.com",
    "phone": "6195551234",
    "clientType": "Buyer",
    "status": "Active",
    "preferences": {
      "propertyTypes": ["Single Family", "Condo"],
      "priceRange": {
        "min": 500000,
        "max": 800000
      },
      "locations": ["Downtown", "North Park"]
    },
    "tags": ["First Time Buyer", "Pre-approved"],
    "sendWelcomeEmail": true
  }')

echo "Response: $CREATE_RESPONSE"
CLIENT_ID=$(echo $CREATE_RESPONSE | grep -o '"_id":"[^"]*' | cut -d'"' -f4)
echo "Created client ID: $CLIENT_ID"

# Test 2: Search clients
echo -e "\n2. Searching for clients with name 'jane'..."
curl -s "$BASE_URL?search=jane&type=Buyer" | jq '.'

# Test 3: Get client with full details
echo -e "\n3. Getting client details..."
curl -s "$BASE_URL/$CLIENT_ID" | jq '.'

# Test 4: Add communication log
echo -e "\n4. Adding communication log..."
curl -s -X POST "$BASE_URL/$CLIENT_ID/communications" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "Email",
    "direction": "Outbound",
    "subject": "Property Update",
    "notes": "Sent new listings matching criteria",
    "outcome": "Positive"
  }' | jq '.'

# Test 5: Update client preferences
echo -e "\n5. Updating client preferences..."
curl -s -X PATCH "$BASE_URL/$CLIENT_ID/preferences" \
  -H "Content-Type: application/json" \
  -d '{
    "communicationMethod": "Text",
    "contactFrequency": "Weekly",
    "propertyTypes": ["Single Family", "Condo", "Townhouse"]
  }' | jq '.'

# Test 6: Link to property
echo -e "\n6. Linking client to property..."
curl -s -X POST "$BASE_URL/$CLIENT_ID/properties" \
  -H "Content-Type: application/json" \
  -d '{
    "propertyId": "prop_123456789012",
    "relationshipType": "Interested",
    "notes": "Client loved the kitchen and backyard"
  }' | jq '.'

# Test 7: Add note
echo -e "\n7. Adding a note..."
curl -s -X POST "$BASE_URL/$CLIENT_ID/notes" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Client is looking to buy within 3 months. Has excellent credit.",
    "category": "Financial",
    "isPrivate": false
  }' | jq '.'

# Test 8: Get client stats
echo -e "\n8. Getting client statistics..."
curl -s "$BASE_URL/$CLIENT_ID/stats" | jq '.'

# Test 9: Add tags
echo -e "\n9. Adding a tag..."
curl -s -X POST "$BASE_URL/$CLIENT_ID/tags" \
  -H "Content-Type: application/json" \
  -d '{"tag": "VIP"}' | jq '.'

# Test 10: Get upcoming birthdays
echo -e "\n10. Getting upcoming birthdays..."
curl -s "$BASE_URL/birthdays?days=30" | jq '.'

# Test 11: Get overall stats
echo -e "\n11. Getting overall client statistics..."
curl -s "$BASE_URL/stats" | jq '.'

# Test 12: Export client data
echo -e "\n12. Exporting client data..."
curl -s "$BASE_URL/$CLIENT_ID/export?format=json&includeHistory=true" | jq '.'

# Test 13: Create another client for merge test
echo -e "\n13. Creating another client for merge test..."
CREATE_RESPONSE2=$(curl -s -X POST $BASE_URL \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith-Johnson",
    "email": "jane.johnson@example.com",
    "phone": "6195551234",
    "clientType": "Seller"
  }')

CLIENT_ID2=$(echo $CREATE_RESPONSE2 | grep -o '"_id":"[^"]*' | cut -d'"' -f4)
echo "Created second client ID: $CLIENT_ID2"

# Test 14: Merge clients
echo -e "\n14. Merging duplicate clients..."
curl -s -X POST "$BASE_URL/merge" \
  -H "Content-Type: application/json" \
  -d "{
    \"primaryClientId\": \"$CLIENT_ID\",
    \"secondaryClientId\": \"$CLIENT_ID2\",
    \"mergeStrategy\": \"primary\"
  }" | jq '.'

# Test 15: Bulk update tags
echo -e "\n15. Bulk updating tags..."
curl -s -X PATCH "$BASE_URL/bulk-update" \
  -H "Content-Type: application/json" \
  -d "{
    \"clientIds\": [\"$CLIENT_ID\"],
    \"action\": \"add\",
    \"tags\": [\"Premium\", \"Referral Source\"]
  }" | jq '.'

# Test 16: Update client status
echo -e "\n16. Updating client status..."
curl -s -X PATCH "$BASE_URL/$CLIENT_ID/status" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Inactive",
    "note": "Client purchased property"
  }' | jq '.'

# Test 17: Filter clients by various criteria
echo -e "\n17. Filtering clients with advanced criteria..."
curl -s "$BASE_URL?status=Active&type=Buyer&tags=VIP&page=1&limit=10&sort=createdAt&order=desc" | jq '.'

# Test 18: Archive client (soft delete)
echo -e "\n18. Archiving client..."
curl -s -X DELETE "$BASE_URL/$CLIENT_ID?archive=true" | jq '.'

echo -e "\n========================================="
echo "Client API tests completed!"
echo "========================================="