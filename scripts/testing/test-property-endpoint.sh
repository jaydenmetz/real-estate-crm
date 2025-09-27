#!/bin/bash

# Test that property details endpoint is working
ESCROW_ID="70656a01-2182-4371-8a7c-c00a19f2cfda"
API_URL="https://api.jaydenmetz.com/v1"

echo "Testing property-details endpoint directly..."
echo

# Test updating pool
echo "1. Testing pool update via /property-details endpoint..."
RESPONSE=$(curl -s -X PUT "${API_URL}/escrows/${ESCROW_ID}/property-details" \
  -H "Content-Type: application/json" \
  -d '{"pool": true}' \
  -w "\nHTTP Status: %{http_code}")

echo "$RESPONSE"
echo

# Check if it was updated
echo "2. Verifying pool was updated..."
curl -s "${API_URL}/escrows/${ESCROW_ID}" | python3 -c "
import sys, json
data = json.load(sys.stdin)
if data.get('data'):
    pool = data['data'].get('pool')
    print(f'Pool value in database: {pool}')
"

echo
echo "3. Testing spa update via /property-details endpoint..."
RESPONSE=$(curl -s -X PUT "${API_URL}/escrows/${ESCROW_ID}/property-details" \
  -H "Content-Type: application/json" \
  -d '{"spa": false}' \
  -w "\nHTTP Status: %{http_code}")

echo "$RESPONSE"