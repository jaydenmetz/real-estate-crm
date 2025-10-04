# Zillow Feature Production Deployment Guide

## Overview
This guide walks through deploying the Zillow URL feature to production.

## Prerequisites
- Access to production database
- Ability to deploy backend updates
- Production environment variables

## Step 1: Run Database Migration

Connect to your production database and run:

```sql
-- Add zillow_url field to escrows table
ALTER TABLE escrows ADD COLUMN IF NOT EXISTS zillow_url TEXT;

-- Optional: Add example Zillow URL to first escrow
UPDATE escrows 
SET zillow_url = 'https://www.zillow.com/homedetails/6510-Summer-Breeze-Ln-Bakersfield-CA-93313/19056207_zpid/'
WHERE id = (SELECT id FROM escrows ORDER BY created_at ASC LIMIT 1);
```

## Step 2: Verify Database Changes

```sql
-- Check if column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'escrows' AND column_name = 'zillow_url';

-- Check which escrows have Zillow URLs
SELECT id, display_id, property_address, zillow_url 
FROM escrows 
WHERE zillow_url IS NOT NULL;
```

## Step 3: Deploy Backend Updates

The following files were updated and need to be deployed:

1. **New Files:**
   - `src/controllers/linkPreview.controller.js` - Fetches Open Graph data
   - `src/routes/linkPreview.routes.js` - Link preview endpoint routes

2. **Updated Files:**
   - `src/app.js` - Added link preview route
   - `src/controllers/escrows.controller.js` - Added zillowUrl to responses
   - `package.json` - Added cheerio dependency

3. **Install Dependencies:**
   ```bash
   npm install cheerio@1.0.0-rc.12
   ```

## Step 4: Test Production Endpoints

After deployment, test these endpoints:

```bash
# Test escrows list includes zillowUrl
curl https://api.jaydenmetz.com/api/v1/escrows | jq '.data.escrows[0]'

# Test escrow detail includes zillowUrl
curl https://api.jaydenmetz.com/api/v1/escrows/ESCROW-2025-0001 | jq '.zillowUrl'

# Test link preview endpoint
curl -X POST https://api.jaydenmetz.com/api/v1/link-preview \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.zillow.com/homedetails/6510-Summer-Breeze-Ln-Bakersfield-CA-93313/19056207_zpid/"}'
```

## Step 5: Add Zillow URLs to Escrows

You can add Zillow URLs to escrows via SQL:

```sql
-- Add Zillow URL to specific escrow
UPDATE escrows 
SET zillow_url = 'YOUR_ZILLOW_URL_HERE'
WHERE display_id = 'ESCROW-2025-0001';

-- Or update by property address
UPDATE escrows 
SET zillow_url = 'YOUR_ZILLOW_URL_HERE'
WHERE property_address LIKE '%789 Pacific Coast%';
```

## Features Once Deployed

1. **Automatic Zillow Preview**: Any escrow with a `zillow_url` will show an image-only preview
2. **Open Graph Support**: The link preview endpoint can fetch OG data from any URL
3. **Fallback Images**: If Zillow blocks requests, uses escrow's existing property image

## Troubleshooting

### If Zillow previews don't show:
1. Check if `zillow_url` is populated in database
2. Verify API returns `zillowUrl` field
3. Check browser console for errors
4. Ensure link preview endpoint is accessible

### If images don't load:
1. The backend uses Safari user agent to fetch Zillow data
2. Zillow may still block some requests - this is handled gracefully
3. Frontend will use escrow's propertyImage as fallback

## Migration Rollback (if needed)

```sql
-- Remove zillow_url column
ALTER TABLE escrows DROP COLUMN IF EXISTS zillow_url;
```