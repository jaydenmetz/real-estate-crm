const axios = require('axios');
const cheerio = require('cheerio');
const { URL } = require('url');

/**
 * Fetch and parse Open Graph tags from a URL
 * This enables rich link previews like those seen in iMessage, Slack, etc.
 */
const getLinkPreview = async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_URL',
          message: 'URL is required'
        }
      });
    }

    // Validate URL
    let validUrl;
    try {
      validUrl = new URL(url);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_URL',
          message: 'Invalid URL format'
        }
      });
    }

    // For Zillow, we'll need to handle their blocking differently
    let response;
    
    try {
      response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Sec-Fetch-User': '?1',
          'Upgrade-Insecure-Requests': '1',
        },
        timeout: 10000, // 10 second timeout
        maxRedirects: 5,
      });
    } catch (axiosError) {
      // If Zillow blocks us (403), provide a structured fallback
      if (axiosError.response?.status === 403 && validUrl.hostname.includes('zillow.com')) {
        console.log('Zillow blocked request, using fallback data');
        
        // Extract property ID from URL
        const zpidMatch = url.match(/(\d+)_zpid/);
        const zpid = zpidMatch ? zpidMatch[1] : null;
        
        // Return structured Zillow data without scraping
        return res.json({
          success: true,
          data: {
            url: url,
            title: 'View Property on Zillow',
            description: 'Click to view full property details, photos, and more on Zillow.com',
            image: null, // We'll use the escrow image in the frontend
            siteName: 'Zillow',
            type: 'website',
            favicon: 'https://www.zillow.com/favicon.ico',
            ogTags: {},
            twitterTags: {},
            propertyData: null,
            isBlocked: true, // Flag to indicate we couldn't fetch real data
            zpid: zpid,
          },
          timestamp: new Date().toISOString()
        });
      }
      
      throw axiosError;
    }

    // Parse HTML with cheerio
    const $ = cheerio.load(response.data);

    // Extract Open Graph tags
    const ogTags = {};
    $('meta[property^="og:"]').each((i, elem) => {
      const property = $(elem).attr('property');
      const content = $(elem).attr('content');
      if (property && content) {
        const key = property.replace('og:', '');
        ogTags[key] = content;
      }
    });

    // Extract Twitter Card tags as fallback
    const twitterTags = {};
    $('meta[name^="twitter:"]').each((i, elem) => {
      const name = $(elem).attr('name');
      const content = $(elem).attr('content');
      if (name && content) {
        const key = name.replace('twitter:', '');
        twitterTags[key] = content;
      }
    });

    // Extract standard meta tags as additional fallback
    const title = ogTags.title || 
                 $('title').text() || 
                 $('meta[name="title"]').attr('content') || 
                 '';

    const description = ogTags.description || 
                       $('meta[name="description"]').attr('content') || 
                       $('meta[property="description"]').attr('content') || 
                       '';

    const image = ogTags.image || 
                 twitterTags.image || 
                 $('meta[name="image"]').attr('content') || 
                 $('link[rel="image_src"]').attr('href') || 
                 '';

    // Make image URL absolute if it's relative
    let absoluteImageUrl = image;
    if (image && !image.startsWith('http')) {
      absoluteImageUrl = new URL(image, validUrl.origin).href;
    }

    // Extract additional metadata
    const siteName = ogTags.site_name || 
                    $('meta[name="application-name"]').attr('content') || 
                    validUrl.hostname;

    const type = ogTags.type || 'website';

    // For Zillow specifically, extract additional property data
    let propertyData = null;
    if (validUrl.hostname.includes('zillow.com')) {
      propertyData = extractZillowData($);
    }

    // Build preview response
    const preview = {
      url: url,
      title: title.trim(),
      description: description.trim(),
      image: absoluteImageUrl,
      siteName: siteName,
      type: type,
      favicon: `${validUrl.origin}/favicon.ico`,
      // Include all OG tags for completeness
      ogTags: ogTags,
      twitterTags: twitterTags,
      // Include property-specific data if available
      propertyData: propertyData,
    };

    res.json({
      success: true,
      data: preview,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching link preview:', error);

    // Handle specific error types
    if (error.code === 'ENOTFOUND') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'URL_NOT_FOUND',
          message: 'The URL could not be found'
        }
      });
    }

    if (error.response?.status === 404) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PAGE_NOT_FOUND',
          message: 'The page does not exist'
        }
      });
    }

    if (error.code === 'ETIMEDOUT') {
      return res.status(504).json({
        success: false,
        error: {
          code: 'TIMEOUT',
          message: 'Request timed out while fetching the page'
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'PREVIEW_FETCH_ERROR',
        message: 'Failed to fetch link preview'
      }
    });
  }
};

/**
 * Extract Zillow-specific property data from the page
 */
function extractZillowData($) {
  try {
    const propertyData = {
      price: null,
      beds: null,
      baths: null,
      sqft: null,
      address: null,
      yearBuilt: null,
      propertyType: null,
      zestimate: null,
      monthlyPayment: null,
      status: null,
    };

    // Try to extract structured data
    const ldJsonScripts = $('script[type="application/ld+json"]');
    ldJsonScripts.each((i, elem) => {
      try {
        const data = JSON.parse($(elem).html());
        if (data['@type'] === 'SingleFamilyResidence' || data['@type'] === 'Product') {
          propertyData.price = data.offers?.price || data.price;
          propertyData.address = data.address?.streetAddress || data.name;
        }
      } catch (e) {
        // Ignore JSON parse errors
      }
    });

    // Extract from meta tags or page content
    const priceMatch = $('meta[property="product:price:amount"]').attr('content');
    if (priceMatch) {
      propertyData.price = priceMatch;
    }

    // Extract from specific Zillow selectors (these may change)
    const bedsText = $('[data-testid="bed-bath-sqft-fact-container"]').text();
    const bedsMatch = bedsText.match(/(\d+)\s*bed/i);
    if (bedsMatch) {
      propertyData.beds = parseInt(bedsMatch[1]);
    }

    const bathsMatch = bedsText.match(/(\d+\.?\d*)\s*bath/i);
    if (bathsMatch) {
      propertyData.baths = parseFloat(bathsMatch[1]);
    }

    const sqftMatch = bedsText.match(/([\d,]+)\s*sqft/i);
    if (sqftMatch) {
      propertyData.sqft = sqftMatch[1].replace(/,/g, '');
    }

    return propertyData;
  } catch (error) {
    console.error('Error extracting Zillow data:', error);
    return null;
  }
}

module.exports = {
  getLinkPreview
};