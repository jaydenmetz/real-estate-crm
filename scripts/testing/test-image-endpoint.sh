#!/bin/bash

echo "Testing Escrow Image Endpoint"
echo "============================"
echo ""

# Test with an escrow that has a Zillow URL
echo "1. Testing escrow with Zillow URL (Downey property):"
echo "   curl http://localhost:5050/api/v1/escrows/ESC-2025-2167/image"
echo ""

# Test with UUID
echo "2. Testing with UUID:"
echo "   curl http://localhost:5050/api/v1/escrows/d485ec66-7ad8-4566-848f-072a796e26a2/image"
echo ""

# Test with escrow without Zillow URL
echo "3. Testing escrow without Zillow URL (should return 'Add Zillow URL'):"
echo "   curl http://localhost:5050/api/v1/escrows/ESC-2025-4069/image"
echo ""

# Download image to file
echo "4. Download image to file:"
echo "   curl -o property-image.jpg http://localhost:5050/api/v1/escrows/ESC-2025-2167/image"
echo ""

# Test with production URL
echo "5. For production:"
echo "   curl https://api.jaydenmetz.com/api/v1/escrows/ESC-2025-2167/image"
echo ""

echo "Note: The endpoint will:"
echo "- Return the JPG image directly if property_image_url exists"
echo "- Try to fetch Open Graph image from Zillow if only zillow_url exists"
echo "- Return 'Add Zillow URL' if no Zillow URL is set"