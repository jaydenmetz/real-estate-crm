#!/bin/bash

# Test that checklist updates preserve all existing fields
ESCROW_ID="70656a01-2182-4371-8a7c-c00a19f2cfda"
API_URL="https://api.jaydenmetz.com/v1"

echo "Step 1: Get initial checklist state..."
INITIAL=$(curl -s "${API_URL}/escrows/${ESCROW_ID}" | python3 -c "
import sys, json
data = json.load(sys.stdin)
if data.get('data'):
    checklists = data['data'].get('checklists', {})
    print(json.dumps(checklists, indent=2))
    # Save for comparison
    with open('/tmp/initial_checklists.json', 'w') as f:
        json.dump(checklists, f)
")
echo "$INITIAL"

echo -e "\n\nStep 2: Count initial checked items..."
python3 -c "
import json
with open('/tmp/initial_checklists.json', 'r') as f:
    checklists = json.load(f)
    for category in ['loan', 'house', 'admin']:
        if category in checklists:
            checked = sum(1 for v in checklists[category].values() if v == True)
            total = len(checklists[category])
            print(f'{category}: {checked}/{total} checked')
"

echo -e "\n\nStep 3: Toggle ONE item (loan.le)..."
# Get current state and toggle just loan.le
python3 -c "
import json
import subprocess

with open('/tmp/initial_checklists.json', 'r') as f:
    checklists = json.load(f)
    
# Toggle loan.le
current_value = checklists.get('loan', {}).get('le', False)
new_value = not current_value
print(f'Toggling loan.le from {current_value} to {new_value}')

# Update only that field
checklists['loan']['le'] = new_value

# Save for update
update_data = {'checklists': checklists}

# Make the API call
import urllib.request
import urllib.parse

url = '${API_URL}/escrows/${ESCROW_ID}'
data = json.dumps(update_data).encode('utf-8')
req = urllib.request.Request(url, data=data, method='PUT')
req.add_header('Content-Type', 'application/json')

try:
    with urllib.request.urlopen(req) as response:
        result = json.load(response)
        print('Update success:', result.get('success'))
except Exception as e:
    print('Error:', e)
"

echo -e "\n\nStep 4: Verify all other fields are preserved..."
FINAL=$(curl -s "${API_URL}/escrows/${ESCROW_ID}" | python3 -c "
import sys, json
data = json.load(sys.stdin)
if data.get('data'):
    checklists = data['data'].get('checklists', {})
    with open('/tmp/final_checklists.json', 'w') as f:
        json.dump(checklists, f)
    print(json.dumps(checklists, indent=2))
")

echo -e "\n\nStep 5: Compare before and after..."
python3 -c "
import json

with open('/tmp/initial_checklists.json', 'r') as f:
    initial = json.load(f)
with open('/tmp/final_checklists.json', 'r') as f:
    final = json.load(f)

print('Checking preservation of all fields:')
print('=' * 50)

issues = []
for category in ['loan', 'house', 'admin']:
    if category in initial:
        for field, initial_value in initial[category].items():
            if field == 'le' and category == 'loan':
                # This one should have changed
                if final.get(category, {}).get(field) == initial_value:
                    print(f'❌ {category}.{field} did not toggle')
                else:
                    print(f'✅ {category}.{field} toggled successfully')
            else:
                # All other fields should be unchanged
                final_value = final.get(category, {}).get(field)
                if final_value != initial_value:
                    issues.append(f'{category}.{field}: was {initial_value}, now {final_value}')
                    print(f'❌ {category}.{field} changed unexpectedly!')
                else:
                    print(f'✅ {category}.{field} preserved')

if issues:
    print('\\n⚠️  PROBLEMS FOUND:')
    for issue in issues:
        print(f'  - {issue}')
else:
    print('\\n✅ All fields preserved correctly!')

# Count totals
print('\\nFinal counts:')
for category in ['loan', 'house', 'admin']:
    if category in final:
        checked = sum(1 for v in final[category].values() if v == True)
        total = len(final[category])
        print(f'{category}: {checked}/{total} checked')
"