const https = require('https');
const zlib = require('zlib');

async function fetchZillowOG(zillowUrl) {
  return new Promise((resolve, reject) => {
    console.log('Fetching:', zillowUrl);
    
    const url = new URL(zillowUrl);
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      },
      timeout: 10000
    };

    const req = https.request(options, (res) => {
      console.log('Status:', res.statusCode);
      console.log('Headers:', res.headers);
      
      let chunks = [];
      let totalSize = 0;
      const maxSize = 100 * 1024; // 100KB
      
      // Handle compression
      let stream = res;
      if (res.headers['content-encoding'] === 'gzip') {
        stream = res.pipe(zlib.createGunzip());
      } else if (res.headers['content-encoding'] === 'deflate') {
        stream = res.pipe(zlib.createInflate());
      }
      
      stream.on('data', (chunk) => {
        chunks.push(chunk);
        totalSize += chunk.length;
        
        // Check if we have enough data
        const html = Buffer.concat(chunks).toString('utf-8');
        const ogMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i);
        
        if (ogMatch) {
          console.log('Found og:image:', ogMatch[1]);
          req.abort();
          resolve(ogMatch[1]);
        }
        
        if (totalSize > maxSize) {
          req.abort();
          console.log('Max size reached, no og:image found');
          resolve(null);
        }
      });
      
      stream.on('end', () => {
        const html = Buffer.concat(chunks).toString('utf-8');
        console.log('First 2000 chars:', html.substring(0, 2000));
        resolve(null);
      });
      
      stream.on('error', (err) => {
        console.error('Stream error:', err);
        reject(err);
      });
    });
    
    req.on('error', (err) => {
      console.error('Request error:', err);
      reject(err);
    });
    
    req.on('timeout', () => {
      console.error('Request timeout');
      req.abort();
      reject(new Error('Request timeout'));
    });
    
    req.end();
  });
}

// Test with Monitor St property
const monitorStUrl = 'https://www.zillow.com/homedetails/5609-Monitor-St-Bakersfield-CA-93307/19015640_zpid/';
fetchZillowOG(monitorStUrl)
  .then(imageUrl => {
    console.log('\nResult:', imageUrl || 'No image found');
  })
  .catch(err => {
    console.error('\nError:', err.message);
  });