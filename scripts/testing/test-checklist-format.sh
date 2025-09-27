#!/bin/bash

# Test if backend expects stringified JSON or object
ESCROW_ID="70656a01-2182-4371-8a7c-c00a19f2cfda"
API_URL="https://api.jaydenmetz.com/v1"

echo "Testing with object (not stringified)..."
curl -X PUT "${API_URL}/escrows/${ESCROW_ID}" \
  -H "Content-Type: application/json" \
  -d '{
    "checklists": {
      "loan": {"le": true},
      "house": {},
      "admin": {}
    }
  }' \
  -s | python3 -c "
import sys, json
data = json.load(sys.stdin)
print('Success:', data.get('success'))
if data.get('error'):
    print('Error:', data['error'])
"

echo -e "\n\nTesting partial update to set loan.le back to true..."
curl -X PUT "${API_URL}/escrows/${ESCROW_ID}" \
  -H "Content-Type: application/json" \
  -d '{
    "checklists": {
      "loan": {
        "le": true,
        "lockedRate": true,
        "appraisalOrdered": true,
        "appraisalReceived": true,
        "clearToClose": true,
        "cd": false,
        "loanDocsSigned": true,
        "cashToClosePaid": true,
        "loanFunded": false
      },
      "house": {
        "homeInspectionOrdered": true,
        "emd": true,
        "solarTransferInitiated": true,
        "avid": true,
        "homeInspectionReceived": true,
        "sellerDisclosures": true,
        "rr": true,
        "recorded": false
      },
      "admin": {
        "mlsStatusUpdate": true,
        "tcEmail": true,
        "tcGlideInvite": true,
        "addContactsToPhone": false,
        "addContactsToNotion": false
      }
    }
  }' \
  -s | python3 -c "
import sys, json
data = json.load(sys.stdin)
print('Success:', data.get('success'))
"