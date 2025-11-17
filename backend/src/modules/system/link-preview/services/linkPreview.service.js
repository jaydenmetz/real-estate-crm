/**
 * Link Preview Service
 *
 * Business logic for generating link previews (Open Graph metadata).
 * Simple utility service for DDD compliance.
 */

const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Generate link preview from URL
 * @param {string} url - URL to preview
 * @returns {Promise<Object>} Preview metadata
 */
exports.generatePreview = async (url) => {
  try {
    const response = await axios.get(url, {
      timeout: 5000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LinkPreview/1.0)'
      }
    });

    const $ = cheerio.load(response.data);

    const preview = {
      url,
      title: $('meta[property="og:title"]').attr('content') || $('title').text(),
      description: $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content'),
      image: $('meta[property="og:image"]').attr('content'),
      siteName: $('meta[property="og:site_name"]').attr('content'),
      type: $('meta[property="og:type"]').attr('content') || 'website'
    };

    return preview;
  } catch (error) {
    const err = new Error('Failed to generate link preview');
    err.code = 'PREVIEW_ERROR';
    err.details = error.message;
    throw err;
  }
};

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {boolean} Is valid
 */
exports.validateUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};
