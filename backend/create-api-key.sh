#!/bin/bash

echo "Creating API key for admin user..."

# First login to get JWT token
echo "1. Logging in to get JWT token..."
TOKEN=$(curl -s -X POST https://api.jaydenmetz.com/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "AdminPassword123!",
    "rememberMe": true
  }' | jq -r '.data.token')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo "Failed to get JWT token"
  exit 1
fi

echo "JWT Token obtained: ${TOKEN:0:20}..."

# Create API key
echo -e "\n2. Creating API key..."
API_KEY_RESPONSE=$(curl -s -X POST https://api.jaydenmetz.com/v1/api-keys \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Web Application",
    "expiresInDays": 365
  }')

echo "$API_KEY_RESPONSE" | jq '.'

# Extract the API key
API_KEY=$(echo "$API_KEY_RESPONSE" | jq -r '.data.key')

if [ "$API_KEY" != "null" ] && [ -n "$API_KEY" ]; then
  echo -e "\n✅ API Key created successfully!"
  echo "API Key: $API_KEY"
  echo -e "\nTo use this API key in the frontend:"
  echo "1. Open browser console (F12)"
  echo "2. Run: localStorage.setItem('apiKey', '$API_KEY')"
  echo "3. Refresh the page"
  
  # Test the API key
  echo -e "\n3. Testing API key..."
  curl -s https://api.jaydenmetz.com/v1/escrows \
    -H "X-API-Key: $API_KEY" | jq '.success'
else
  echo "Failed to create API key"
  echo "Response: $API_KEY_RESPONSE"
fi