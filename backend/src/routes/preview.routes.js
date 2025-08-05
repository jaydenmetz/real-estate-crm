const express = require('express');
const router = express.Router();
const { fetchOpenGraphData } = require('../scripts/fetch-og-preview');

/**
 * GET /api/v1/preview?url=https://example.com
 * Fetches Open Graph preview data for a URL
 */
router.get('/', async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_URL',
          message: 'URL parameter is required'
        }
      });
    }
    
    // Validate URL
    try {
      new URL(url);
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_URL',
          message: 'Invalid URL format'
        }
      });
    }
    
    // Fetch Open Graph data
    const ogData = await fetchOpenGraphData(url);
    
    res.json({
      success: true,
      data: ogData,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Preview error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'PREVIEW_ERROR',
        message: error.message || 'Failed to fetch preview'
      },
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;