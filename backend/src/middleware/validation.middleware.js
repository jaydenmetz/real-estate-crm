const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    logger.warn('Validation errors:', { 
      errors: errors.array(), 
      url: req.url, 
      method: req.method 
    });
    
    return res.status(422).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input data',
        details: errors.array()
      },
      timestamp: new Date().toISOString()
    });
  }
  
  next();
};

module.exports = handleValidationErrors;