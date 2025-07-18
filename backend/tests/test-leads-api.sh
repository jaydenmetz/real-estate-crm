#!/bin/bash

# Test script for Leads API endpoints
# Make sure the server is running on port 3001

BASE_URL="http://localhost:3001/api/v1/leads"
LEAD_ID=""
LEAD_ID_2=""

echo "========================================="
echo "Testing Leads API Endpoints"
echo "========================================="

# Test 1: Create a new lead
echo -e "\n1. Creating a new lead..."
CREATE_RESPONSE=$(curl -s -X POST $BASE_URL \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Sarah",
    "lastName": "Johnson",
    "email": "sarah.johnson@email.com",
    "phone": "(555) 123-4567",
    "source": "Website",
    "type": "Buyer",
    "budget": 450000,
    "timeline": "1-3 months",
    "location": "North County San Diego",
    "propertyInterests": ["Single Family", "Condo"],
    "notes": "Looking for 3BR/2BA with good schools",
    "preferredContact": "email"
  }')

echo "Response: $CREATE_RESPONSE"
LEAD_ID=$(echo $CREATE_RESPONSE | grep -o '"_id":"[^"]*' | cut -d'"' -f4)
echo "Created lead ID: $LEAD_ID"

# Test 2: Create another lead for duplicate testing
echo -e "\n2. Creating another lead (for duplicate detection test)..."
CREATE_RESPONSE_2=$(curl -s -X POST $BASE_URL \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Sarah",
    "lastName": "Johnson",
    "email": "s.johnson@email.com",
    "phone": "(555) 123-4567",
    "source": "Phone",
    "type": "Buyer",
    "notes": "Called about listing on Main St"
  }')

echo "Response: $CREATE_RESPONSE_2"
LEAD_ID_2=$(echo $CREATE_RESPONSE_2 | grep -o '"_id":"[^"]*' | cut -d'"' -f4)

# Test 3: Get all leads with filtering
echo -e "\n3. Getting all leads (with temperature filter)..."
curl -s "$BASE_URL?temperature=Warm&limit=10" | jq '.'

# Test 4: Get hot leads
echo -e "\n4. Getting hot leads..."
curl -s "$BASE_URL/hot" | jq '.'

# Test 5: Get single lead with full details
echo -e "\n5. Getting lead details..."
curl -s "$BASE_URL/$LEAD_ID" | jq '.'

# Test 6: Record activity
echo -e "\n6. Recording lead activity..."
curl -s -X POST "$BASE_URL/$LEAD_ID/activity" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "email_open",
    "description": "Opened property listing email",
    "outcome": "Engaged with 3 property listings",
    "nextSteps": "Send follow-up with similar properties",
    "followUpDate": "2025-02-05"
  }' | jq '.'

# Test 7: Update lead score
echo -e "\n7. Updating lead score..."
curl -s -X PATCH "$BASE_URL/$LEAD_ID/score" \
  -H "Content-Type: application/json" \
  -d '{
    "adjustment": 15,
    "reason": "Showed strong interest in properties"
  }' | jq '.'

# Test 8: Assign lead to agent
echo -e "\n8. Assigning lead to agent..."
curl -s -X PATCH "$BASE_URL/$LEAD_ID/assign" \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "agent_001",
    "reason": "Territory match - North County specialist"
  }' | jq '.'

# Test 9: Add to nurture campaign
echo -e "\n9. Adding lead to nurture campaign..."
curl -s -X POST "$BASE_URL/$LEAD_ID/nurture" \
  -H "Content-Type: application/json" \
  -d '{
    "campaignId": "first_time_buyer_campaign",
    "startDate": "2025-02-01"
  }' | jq '.'

# Test 10: Get lead conversion rate analytics
echo -e "\n10. Getting lead conversion rate..."
curl -s "$BASE_URL/analytics/conversion-rate?source=Website" | jq '.'

# Test 11: Get source ROI analytics
echo -e "\n11. Getting lead source ROI..."
curl -s "$BASE_URL/analytics/source-roi" | jq '.'

# Test 12: Get agent performance
echo -e "\n12. Getting agent performance metrics..."
curl -s "$BASE_URL/analytics/agent-performance?metric=conversion_rate" | jq '.'

# Test 13: Get lead funnel visualization
echo -e "\n13. Getting lead funnel data..."
curl -s "$BASE_URL/analytics/funnel?groupBy=month" | jq '.'

# Test 14: Update lead information
echo -e "\n14. Updating lead information..."
curl -s -X PUT "$BASE_URL/$LEAD_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "budget": 500000,
    "timeline": "Within 1 month",
    "status": "Qualified"
  }' | jq '.'

# Test 15: Bulk import leads
echo -e "\n15. Bulk importing leads..."
curl -s -X POST "$BASE_URL/bulk-import" \
  -H "Content-Type: application/json" \
  -d '{
    "leads": [
      {
        "firstName": "Michael",
        "lastName": "Brown",
        "email": "m.brown@email.com",
        "phone": "(555) 234-5678",
        "source": "Email Campaign",
        "type": "Seller",
        "timeline": "3-6 months"
      },
      {
        "firstName": "Jennifer",
        "lastName": "Davis",
        "email": "j.davis@email.com",
        "source": "Social Media",
        "type": "Buyer",
        "budget": 350000
      }
    ],
    "importSource": "Marketing Campaign Q1 2025",
    "skipDuplicates": false
  }' | jq '.'

# Test 16: Get routing rules
echo -e "\n16. Getting current routing rules..."
curl -s "$BASE_URL/routing-rules" | jq '.'

# Test 17: Update routing rules
echo -e "\n17. Updating routing rules..."
curl -s -X PUT "$BASE_URL/routing-rules" \
  -H "Content-Type: application/json" \
  -d '{
    "rules": {
      "scoreBasedRouting": {
        "enabled": true,
        "rules": [
          { "minScore": 85, "agentLevel": "senior" },
          { "minScore": 60, "agentLevel": "mid" },
          { "minScore": 0, "agentLevel": "junior" }
        ]
      }
    }
  }' | jq '.'

# Test 18: Merge duplicate leads
echo -e "\n18. Merging duplicate leads..."
if [ ! -z "$LEAD_ID_2" ]; then
  curl -s -X POST "$BASE_URL/merge" \
    -H "Content-Type: application/json" \
    -d "{
      \"leadIds\": [\"$LEAD_ID\", \"$LEAD_ID_2\"],
      \"primaryLeadId\": \"$LEAD_ID\"
    }" | jq '.'
fi

# Test 19: Convert lead to client
echo -e "\n19. Converting lead to client..."
curl -s -X POST "$BASE_URL/$LEAD_ID/convert" \
  -H "Content-Type: application/json" \
  -d '{
    "clientType": "Buyer",
    "conversionNotes": "Pre-approved for $500k, ready to make offers"
  }' | jq '.'

# Test 20: Get lead statistics
echo -e "\n20. Getting lead statistics..."
curl -s "$BASE_URL/stats" | jq '.'

# Test 21: Search leads by name
echo -e "\n21. Searching leads by name..."
curl -s "$BASE_URL?search=Sarah&limit=5" | jq '.'

# Test 22: Get leads with score range
echo -e "\n22. Getting leads with score range..."
curl -s "$BASE_URL?minScore=50&maxScore=80&sort=score&order=desc" | jq '.'

# Clean up - delete test lead
echo -e "\n23. Cleaning up - deleting test lead..."
# Note: Only delete if not converted
# curl -s -X DELETE "$BASE_URL/$LEAD_ID" | jq '.'

echo -e "\n========================================="
echo "Lead API tests completed!"
echo "========================================="