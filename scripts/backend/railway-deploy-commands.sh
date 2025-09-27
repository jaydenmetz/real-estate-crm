#!/bin/bash

# Railway Deployment Commands for Zillow Feature

echo "=== Step 1: Connect to Railway Production Database ==="
echo "Run this command to connect to your production database:"
echo ""
echo "railway run psql"
echo ""
echo "Or use the full connection string:"
echo "PGPASSWORD=ueLIWnvALZWVbRdnOmpLGsrrukeGLGQQ psql -h ballast.proxy.rlwy.net -p 20017 -U postgres -d railway"
echo ""

echo "=== Step 2: Run Migration in Production Database ==="
echo "Once connected, run:"
echo ""
cat << 'SQL'
-- Add zillow_url column
ALTER TABLE escrows ADD COLUMN IF NOT EXISTS zillow_url TEXT;

-- Add example Zillow URL to test
UPDATE escrows 
SET zillow_url = 'https://www.zillow.com/homedetails/6510-Summer-Breeze-Ln-Bakersfield-CA-93313/19056207_zpid/'
WHERE display_id = 'ESCROW-2025-0001';

-- Verify
SELECT display_id, property_address, zillow_url FROM escrows WHERE zillow_url IS NOT NULL;
SQL
echo ""

echo "=== Step 3: Deploy Backend to Railway ==="
echo "The backend will auto-deploy when you push to main branch"
echo "Or manually trigger with:"
echo ""
echo "railway up"
echo ""

echo "=== Step 4: Check Deployment Status ==="
echo "railway status"
echo "railway logs"