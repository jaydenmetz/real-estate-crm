#!/bin/bash

# Test updating checklists on production
ESCROW_ID="70656a01-2182-4371-8a7c-c00a19f2cfda"
API_URL="https://api.jaydenmetz.com/v1"

# Get current checklists
echo "Getting current checklists..."
curl -s "${API_URL}/escrows/${ESCROW_ID}" | python3 -c "
import sys, json
data = json.load(sys.stdin)
if data.get('data'):
    checklists = data['data'].get('checklists', {})
    print('Current checklists:')
    print(json.dumps(checklists, indent=2))
"

# Update a checklist item
echo -e "\n\nUpdating checklist (setting loan.le to false)..."
UPDATE_DATA='{
  "checklists": {
    "loan": {
      "le": false,
      "cd": false,
      "loanFunded": false,
      "lockedRate": true,
      "clearToClose": true,
      "loanDocsSigned": true,
      "cashToClosePaid": true,
      "appraisalOrdered": true,
      "appraisalReceived": true
    },
    "admin": {
      "tcEmail": true,
      "tcGlideInvite": true,
      "mlsStatusUpdate": true,
      "addContactsToPhone": false,
      "addContactsToNotion": false
    },
    "house": {
      "rr": true,
      "emd": true,
      "avid": true,
      "recorded": false,
      "sellerDisclosures": true,
      "homeInspectionOrdered": true,
      "homeInspectionReceived": true,
      "solarTransferInitiated": true
    }
  }
}'

curl -X PUT "${API_URL}/escrows/${ESCROW_ID}" \
  -H "Content-Type: application/json" \
  -d "$UPDATE_DATA" \
  -s | python3 -c "
import sys, json
data = json.load(sys.stdin)
print('Update success:', data.get('success'))
if data.get('data'):
    checklists = data['data'].get('checklists', {})
    print('Updated loan.le:', checklists.get('loan', {}).get('le'))
"