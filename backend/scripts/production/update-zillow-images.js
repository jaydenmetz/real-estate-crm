#!/usr/bin/env node

/**
 * Script to fetch and update Zillow image URLs for escrows
 * Usage: node scripts/update-zillow-images.js
 */

require('dotenv').config();
const { Pool } = require('pg');
const axios = require('axios');
const cheerio = require('cheerio');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function fetchZillowImage(url) {
  try {
    console.log(`Fetching image for: ${url}`);
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      timeout: 10000,
    });

    const $ = cheerio.load(response.data);
    const ogImage = $('meta[property="og:image"]').attr('content');
    
    if (ogImage) {
      console.log(`  ✓ Found image: ${ogImage}`);
      return ogImage;
    } else {
      console.log(`  ✗ No OG image found`);
      return null;
    }
  } catch (error) {
    console.error(`  ✗ Error: ${error.message}`);
    return null;
  }
}

async function updateZillowImages() {
  try {
    // Get all escrows with Zillow URLs but no image URLs
    const query = `
      SELECT id, display_id, property_address, zillow_url 
      FROM escrows 
      WHERE zillow_url IS NOT NULL 
        AND zillow_image_url IS NULL
      ORDER BY created_at DESC
    `;
    
    const result = await pool.query(query);
    console.log(`Found ${result.rows.length} escrows with Zillow URLs but no images\n`);
    
    for (const escrow of result.rows) {
      console.log(`Processing ${escrow.display_id}: ${escrow.property_address}`);
      
      const imageUrl = await fetchZillowImage(escrow.zillow_url);
      
      if (imageUrl) {
        const updateQuery = `
          UPDATE escrows 
          SET zillow_image_url = $1 
          WHERE id = $2
        `;
        
        await pool.query(updateQuery, [imageUrl, escrow.id]);
        console.log(`  ✓ Updated database\n`);
      } else {
        console.log(`  ⚠ Skipping - no image found\n`);
      }
      
      // Be nice to Zillow - wait between requests
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log('Done!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

// Run the script
updateZillowImages();