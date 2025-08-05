const express = require('express');
const router = express.Router();
const { getLinkPreview } = require('../controllers/linkPreview.controller');
const { authenticateToken } = require('./auth');
const { body, validationResult } = require('express-validator');

// Validation middleware
const validateLinkPreview = [
  body('url').isURL().withMessage('Invalid URL format'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details: errors.array()
        }
      });
    }
    next();
  }
];

// POST /api/v1/link-preview
// Fetch Open Graph preview data for a URL
// Temporarily removing auth for testing
router.post('/', validateLinkPreview, getLinkPreview);

module.exports = router;