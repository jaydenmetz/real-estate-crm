#!/bin/bash

# Test login endpoint
echo "Testing login endpoint..."

# Test with admin credentials
echo -e "\n1. Testing with admin credentials:"
curl -X POST https://api.jaydenmetz.com/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "AdminPassword123!",
    "rememberMe": true
  }' | jq '.'

# Test with email login
echo -e "\n2. Testing with email login:"
curl -X POST https://api.jaydenmetz.com/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin@jaydenmetz.com",
    "password": "AdminPassword123!",
    "rememberMe": true
  }' | jq '.'

# Test simple login endpoint
echo -e "\n3. Testing simple login endpoint:"
curl -X POST https://api.jaydenmetz.com/v1/auth/simple-login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "AdminPassword123!"
  }' | jq '.'

# Test with wrong credentials
echo -e "\n4. Testing with wrong credentials (should fail):"
curl -X POST https://api.jaydenmetz.com/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "wrong",
    "rememberMe": true
  }' | jq '.'

echo -e "\nDone testing login endpoints"