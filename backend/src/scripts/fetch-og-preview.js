const https = require('https');
const http = require('http');
const { URL } = require('url');
const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' });

const pool = new Pool({
  connectionString: 'postgresql://postgres:ueLIWnvALZWVbRdnOmpLGsrrukeGLGQQ@ballast.proxy.rlwy.net:20017/railway',
  ssl: { rejectUnauthorized: false }
});

/**
 * Fetches Open Graph metadata from a URL
 * This mimics how iMessage, Slack, Facebook, etc. generate link previews
 */
async function fetchOpenGraphData(urlString) {
  return new Promise((resolve, reject) => {
    try {
      const url = new URL(urlString);
      const protocol = url.protocol === 'https:' ? https : http;
      
      const options = {
        hostname: url.hostname,
        path: url.pathname + url.search,
        method: 'GET',
        headers: {
          // Identify as a link preview bot
          'User-Agent': 'Mozilla/5.0 (compatible; RealEstateCRM/1.0; +http://example.com/bot)',
          'Accept': 'text/html',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        timeout: 5000
      };

      const req = protocol.request(options, (res) => {
        // Only read the first 50KB (usually OG tags are in the <head>)
        let data = '';
        let bytesRead = 0;
        const maxBytes = 50 * 1024; // 50KB
        
        res.on('data', (chunk) => {
          bytesRead += chunk.length;
          if (bytesRead <= maxBytes) {
            data += chunk;
          } else {
            res.destroy(); // Stop reading
          }
        });
        
        res.on('end', () => {
          // Extract Open Graph tags
          const ogData = {
            title: null,
            description: null,
            image: null,
            url: urlString,
            site_name: null,
            type: null
          };
          
          // Match various OG tag formats
          const patterns = {
            title: /<meta\s+(?:property|name)=["']og:title["']\s+content=["']([^"']+)["']/i,
            description: /<meta\s+(?:property|name)=["']og:description["']\s+content=["']([^"']+)["']/i,
            image: /<meta\s+(?:property|name)=["']og:image["']\s+content=["']([^"']+)["']/i,
            site_name: /<meta\s+(?:property|name)=["']og:site_name["']\s+content=["']([^"']+)["']/i,
            type: /<meta\s+(?:property|name)=["']og:type["']\s+content=["']([^"']+)["']/i,
          };
          
          // Also check for reversed attribute order
          const reversePatterns = {
            title: /<meta\s+content=["']([^"']+)["']\s+(?:property|name)=["']og:title["']/i,
            description: /<meta\s+content=["']([^"']+)["']\s+(?:property|name)=["']og:description["']/i,
            image: /<meta\s+content=["']([^"']+)["']\s+(?:property|name)=["']og:image["']/i,
            site_name: /<meta\s+content=["']([^"']+)["']\s+(?:property|name)=["']og:site_name["']/i,
            type: /<meta\s+content=["']([^"']+)["']\s+(?:property|name)=["']og:type["']/i,
          };
          
          for (const [key, pattern] of Object.entries(patterns)) {
            const match = data.match(pattern) || data.match(reversePatterns[key]);
            if (match && match[1]) {
              ogData[key] = match[1].trim();
            }
          }
          
          // Fallback to regular title tag if no OG title
          if (!ogData.title) {
            const titleMatch = data.match(/<title>([^<]+)<\/title>/i);
            if (titleMatch && titleMatch[1]) {
              ogData.title = titleMatch[1].trim();
            }
          }
          
          // Make image URL absolute if it's relative
          if (ogData.image && !ogData.image.startsWith('http')) {
            ogData.image = new URL(ogData.image, urlString).href;
          }
          
          resolve(ogData);
        });
        
        res.on('error', (err) => {
          reject(err);
        });
      });
      
      req.on('error', (err) => {
        reject(err);
      });
      
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
      
      req.end();
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Updates property images using Open Graph data
 */
async function updatePropertyFromOG(propertyAddress, url) {
  try {
    console.log(`\nFetching Open Graph data for: ${propertyAddress}`);
    console.log(`URL: ${url}`);
    
    const ogData = await fetchOpenGraphData(url);
    
    console.log('\nOpen Graph Data Found:');
    console.log('- Title:', ogData.title || 'Not found');
    console.log('- Description:', ogData.description || 'Not found');
    console.log('- Image:', ogData.image || 'Not found');
    console.log('- Site Name:', ogData.site_name || 'Not found');
    
    if (ogData.image) {
      const result = await pool.query(
        `UPDATE escrows 
         SET property_image_url = $1,
             updated_at = NOW()
         WHERE property_address = $2
         RETURNING id, display_id`,
        [ogData.image, propertyAddress]
      );
      
      if (result.rows.length > 0) {
        console.log(`\n✓ Updated ${result.rows[0].display_id} with OG image`);
        return true;
      }
    } else {
      console.log('\n✗ No Open Graph image found');
    }
    
    return false;
  } catch (error) {
    console.error('\nError:', error.message);
    return false;
  }
}

/**
 * Process all properties with Zillow URLs
 */
async function processAllProperties() {
  try {
    const result = await pool.query(
      `SELECT property_address, zillow_url 
       FROM escrows 
       WHERE zillow_url IS NOT NULL 
       ORDER BY property_address`
    );
    
    console.log(`Found ${result.rows.length} properties with Zillow URLs\n`);
    
    for (const row of result.rows) {
      await updatePropertyFromOG(row.property_address, row.zillow_url);
      
      // Wait between requests to be respectful
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
  } catch (error) {
    console.error('Database error:', error);
  } finally {
    await pool.end();
  }
}

// Command line usage
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Open Graph Preview Fetcher');
    console.log('==========================\n');
    console.log('This tool fetches Open Graph metadata (like iMessage previews) from URLs.\n');
    console.log('Usage:');
    console.log('  Fetch OG data from URL:');
    console.log('    node fetch-og-preview.js <url>\n');
    console.log('  Update property image from URL:');
    console.log('    node fetch-og-preview.js <property_address> <url>\n');
    console.log('  Process all properties:');
    console.log('    node fetch-og-preview.js --all\n');
  } else if (args[0] === '--all') {
    processAllProperties();
  } else if (args.length === 1) {
    // Just fetch and display OG data
    fetchOpenGraphData(args[0])
      .then(data => {
        console.log('\nOpen Graph Data:');
        console.log(JSON.stringify(data, null, 2));
      })
      .catch(err => {
        console.error('Error:', err.message);
      });
  } else if (args.length === 2) {
    // Update property with OG data
    updatePropertyFromOG(args[0], args[1])
      .then(() => pool.end());
  }
}

module.exports = { fetchOpenGraphData };