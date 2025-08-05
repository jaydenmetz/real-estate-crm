#!/bin/bash

echo "Testing Monitor St Property Image Endpoint"
echo "=========================================="
echo ""

# Monitor St property IDs
MONITOR_ST_ID="70656a01-2182-4371-8a7c-c00a19f2cfda"
MONITOR_ST_DISPLAY="ESC-2025-2305"

echo "1. Testing with UUID:"
echo "   Command: curl http://localhost:5050/api/v1/escrows/$MONITOR_ST_ID/image"
echo "   Response:"
curl -s http://localhost:5050/api/v1/escrows/$MONITOR_ST_ID/image
echo ""
echo ""

echo "2. Testing with display ID:"
echo "   Command: curl http://localhost:5050/api/v1/escrows/$MONITOR_ST_DISPLAY/image"
echo "   Response:"
curl -s http://localhost:5050/api/v1/escrows/$MONITOR_ST_DISPLAY/image
echo ""
echo ""

echo "3. Testing production endpoint:"
echo "   Command: curl https://api.jaydenmetz.com/v1/escrows/$MONITOR_ST_ID/image"
echo "   Response:"
curl -s https://api.jaydenmetz.com/v1/escrows/$MONITOR_ST_ID/image
echo ""
echo ""

echo "4. Checking database values:"
PGPASSWORD=ueLIWnvALZWVbRdnOmpLGsrrukeGLGQQ psql -h ballast.proxy.rlwy.net -p 20017 -U postgres -d railway -t -c "
SELECT 
  'Display ID: ' || display_id,
  'Zillow URL: ' || COALESCE(zillow_url, 'NULL'),
  'Property Image: ' || COALESCE(property_image_url, 'NULL')
FROM escrows 
WHERE id = '$MONITOR_ST_ID'
"

echo ""
echo "Expected behavior:"
echo "- If property_image_url exists: Returns that URL directly"
echo "- If only zillow_url exists: Fetches Zillow page and extracts og:image"
echo "- If no zillow_url: Returns 'No Zillow URL found'"