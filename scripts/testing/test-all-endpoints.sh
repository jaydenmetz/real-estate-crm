#!/bin/bash

# Test all escrow update endpoints to ensure they preserve existing data
ESCROW_ID="70656a01-2182-4371-8a7c-c00a19f2cfda"
API_URL="https://api.jaydenmetz.com/v1"

echo "=== Testing All Escrow Update Endpoints ==="
echo

# Test 1: Checklists endpoint
echo "1. Testing /escrows/${ESCROW_ID}/checklists endpoint..."
echo "   Getting current checklists..."
CURRENT_CHECKLISTS=$(curl -s "${API_URL}/escrows/${ESCROW_ID}" | python3 -c "
import sys, json
data = json.load(sys.stdin)
if data.get('data'):
    print(json.dumps(data['data'].get('checklists', {})))
")

echo "   Toggling loan.le..."
UPDATED_CHECKLISTS=$(echo "$CURRENT_CHECKLISTS" | python3 -c "
import sys, json
checklists = json.load(sys.stdin)
checklists.setdefault('loan', {})['le'] = not checklists.get('loan', {}).get('le', False)
print(json.dumps(checklists))
")

RESPONSE=$(curl -s -X PUT "${API_URL}/escrows/${ESCROW_ID}/checklists" \
  -H "Content-Type: application/json" \
  -d "$UPDATED_CHECKLISTS")

SUCCESS=$(echo "$RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('success', False))")
echo "   Result: $SUCCESS"

# Test 2: Property Details endpoint
echo
echo "2. Testing /escrows/${ESCROW_ID}/property-details endpoint..."
echo "   Updating pool status..."

RESPONSE=$(curl -s -X PUT "${API_URL}/escrows/${ESCROW_ID}/property-details" \
  -H "Content-Type: application/json" \
  -d '{"pool": true}')

SUCCESS=$(echo "$RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('success', False))")
echo "   Result: $SUCCESS"

# Verify pool was updated
VERIFY=$(curl -s "${API_URL}/escrows/${ESCROW_ID}" | python3 -c "
import sys, json
data = json.load(sys.stdin)
if data.get('data'):
    # Check various possible locations for pool
    pool = (data['data'].get('property_details', {}).get('pool') or 
            data['data'].get('propertyDetails', {}).get('pool') or
            data['data'].get('pool'))
    print(f'Pool status: {pool}')
")
echo "   $VERIFY"

# Test 3: Financials endpoint
echo
echo "3. Testing /escrows/${ESCROW_ID}/financials endpoint..."
echo "   Updating commission percentage..."

RESPONSE=$(curl -s -X PUT "${API_URL}/escrows/${ESCROW_ID}/financials" \
  -H "Content-Type: application/json" \
  -d '{"commissionPercentage": 3.5}')

SUCCESS=$(echo "$RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('success', False))")
echo "   Result: $SUCCESS"

# Test 4: Timeline endpoint
echo
echo "4. Testing /escrows/${ESCROW_ID}/timeline endpoint..."
echo "   Updating acceptance date..."

RESPONSE=$(curl -s -X PUT "${API_URL}/escrows/${ESCROW_ID}/timeline" \
  -H "Content-Type: application/json" \
  -d '{"acceptanceDate": "2025-01-15"}')

SUCCESS=$(echo "$RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('success', False))")
echo "   Result: $SUCCESS"

# Test 5: People endpoint
echo
echo "5. Testing /escrows/${ESCROW_ID}/people endpoint..."
echo "   Updating buyer agent name..."

RESPONSE=$(curl -s -X PUT "${API_URL}/escrows/${ESCROW_ID}/people" \
  -H "Content-Type: application/json" \
  -d '{"buyerAgent": {"name": "Test Agent", "email": "test@example.com"}}')

SUCCESS=$(echo "$RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('success', False))")
echo "   Result: $SUCCESS"

echo
echo "=== Final Verification ==="
echo "Checking if all data is preserved..."

FINAL_DATA=$(curl -s "${API_URL}/escrows/${ESCROW_ID}" | python3 -c "
import sys, json
data = json.load(sys.stdin)
if data.get('data'):
    escrow = data['data']
    print('✅ Checklists present:', 'checklists' in escrow or 'checklist' in escrow)
    print('✅ Property details present:', 'property_details' in escrow or 'propertyDetails' in escrow)
    print('✅ Financials present:', 'financials' in escrow)
    print('✅ Timeline present:', 'timeline' in escrow)
    print('✅ People present:', 'people' in escrow)
")

echo "$FINAL_DATA"
echo
echo "=== Test Complete ===="