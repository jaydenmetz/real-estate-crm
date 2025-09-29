#!/bin/bash

# Test script for Upload API endpoints
# Make sure the server is running on port 3001

BASE_URL="http://localhost:3001/api/v1"
UPLOAD_ID=""
IMAGE_ID=""

echo "========================================="
echo "Testing Upload API Endpoints"
echo "========================================="

# Create test files if they don't exist
echo -e "\n0. Creating test files..."
echo "This is a test PDF document for upload testing." > test.txt
convert -size 800x600 xc:blue test.jpg 2>/dev/null || echo "Note: ImageMagick not installed, using existing test.jpg if available"

# Test 1: Upload a document
echo -e "\n1. Uploading a document (text file as PDF substitute)..."
UPLOAD_RESPONSE=$(curl -s -X POST "$BASE_URL/upload/document" \
  -F "file=@test.txt" \
  -F "category=contract" \
  -F "description=Test contract document" \
  -F "tags=test,contract,sample" \
  -F "entityType=escrow" \
  -F "entityId=123456789012345678901234")

echo "Response: $UPLOAD_RESPONSE"
UPLOAD_ID=$(echo $UPLOAD_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)
echo "Uploaded document ID: $UPLOAD_ID"

# Test 2: Upload an image
echo -e "\n2. Uploading an image..."
if [ -f "test.jpg" ]; then
  IMAGE_RESPONSE=$(curl -s -X POST "$BASE_URL/upload/image" \
    -F "file=@test.jpg" \
    -F "category=property" \
    -F "description=Property exterior photo" \
    -F "altText=Front view of property" \
    -F "tags=exterior,front,property" \
    -F "entityType=listing" \
    -F "entityId=234567890123456789012345")
  
  echo "Response: $IMAGE_RESPONSE"
  IMAGE_ID=$(echo $IMAGE_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)
  echo "Uploaded image ID: $IMAGE_ID"
else
  echo "test.jpg not found, skipping image upload test"
fi

# Test 3: Get file metadata
echo -e "\n3. Getting file metadata..."
if [ ! -z "$UPLOAD_ID" ]; then
  curl -s "$BASE_URL/uploads/metadata/$UPLOAD_ID" | jq '.'
fi

# Test 4: List uploaded files
echo -e "\n4. Listing uploaded files..."
curl -s "$BASE_URL/uploads?page=1&limit=10" | jq '.'

# Test 5: Get upload statistics
echo -e "\n5. Getting upload statistics..."
curl -s "$BASE_URL/uploads/stats/summary" | jq '.'

# Test 6: Filter files by category
echo -e "\n6. Getting files by category (property)..."
curl -s "$BASE_URL/uploads?category=property" | jq '.'

# Test 7: Filter files by entity
echo -e "\n7. Getting files for a specific listing..."
curl -s "$BASE_URL/uploads?entityType=listing&entityId=234567890123456789012345" | jq '.'

# Test 8: Download file (test local storage)
echo -e "\n8. Downloading uploaded file..."
if [ ! -z "$UPLOAD_ID" ]; then
  FILENAME=$(echo $UPLOAD_RESPONSE | grep -o '"filename":"[^"]*' | cut -d'"' -f4)
  if [ ! -z "$FILENAME" ]; then
    echo "Attempting to download: $FILENAME"
    curl -s -o "downloaded-$FILENAME" "$BASE_URL/uploads/$FILENAME"
    if [ -f "downloaded-$FILENAME" ]; then
      echo "File downloaded successfully as: downloaded-$FILENAME"
      ls -la "downloaded-$FILENAME"
    fi
  fi
fi

# Test 9: Test file type validation (should fail)
echo -e "\n9. Testing file type validation (uploading invalid type)..."
echo "#!/bin/bash" > test.sh
INVALID_RESPONSE=$(curl -s -X POST "$BASE_URL/upload/document" \
  -F "file=@test.sh" \
  -F "category=general")
echo "Response (should be error): $INVALID_RESPONSE"

# Test 10: Test file size validation
echo -e "\n10. Testing file size limit..."
# Create a large file (11MB)
dd if=/dev/zero of=large-file.txt bs=1M count=11 2>/dev/null
LARGE_RESPONSE=$(curl -s -X POST "$BASE_URL/upload/document" \
  -F "file=@large-file.txt" \
  -F "category=general")
echo "Response (should be error): $LARGE_RESPONSE"

# Test 11: Upload without file (should fail)
echo -e "\n11. Testing upload without file..."
NO_FILE_RESPONSE=$(curl -s -X POST "$BASE_URL/upload/document" \
  -F "category=general" \
  -F "description=No file attached")
echo "Response (should be error): $NO_FILE_RESPONSE"

# Test 12: Check if files exist in uploads directory
echo -e "\n12. Checking uploads directory..."
if [ -d "uploads" ]; then
  echo "Documents directory:"
  ls -la uploads/documents/ | head -5
  echo -e "\nImages directory:"
  ls -la uploads/images/ | head -5
  echo -e "\nImage thumbnails:"
  ls -la uploads/images/thumbnail/ | head -5
else
  echo "Uploads directory not found in current location"
fi

# Test 13: Delete uploaded file
echo -e "\n13. Deleting uploaded file..."
if [ ! -z "$UPLOAD_ID" ]; then
  curl -s -X DELETE "$BASE_URL/uploads/$UPLOAD_ID" | jq '.'
fi

# Clean up test files
echo -e "\n14. Cleaning up test files..."
rm -f test.txt test.jpg test.sh large-file.txt downloaded-*

echo -e "\n========================================="
echo "Upload API tests completed!"
echo "========================================="
echo ""
echo "Note: Make sure to check the uploads/ directory for uploaded files:"
echo "  - uploads/documents/ for documents"
echo "  - uploads/images/ for original images"
echo "  - uploads/images/thumbnail|small|medium|large/ for image variants"