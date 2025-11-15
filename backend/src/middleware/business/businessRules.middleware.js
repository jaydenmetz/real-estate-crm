// backend/src/middleware/businessRules.middleware.js
const logger = require('../../utils/logger');

/**
 * Validates business rules for escrow operations
 */
const validateEscrowRules = (req, res, next) => {
  const {
    opening_date, closing_date, purchase_price, earnest_money,
  } = req.body;
  const errors = [];

  // Rule 1: Closing date must be after opening date
  if (opening_date && closing_date) {
    const openDate = new Date(opening_date);
    const closeDate = new Date(closing_date);

    if (closeDate <= openDate) {
      errors.push({
        field: 'closing_date',
        message: 'Closing date must be after opening date',
        rule: 'CLOSING_AFTER_OPENING',
      });
    }
  }

  // Rule 2: Purchase price must be positive
  if (purchase_price !== undefined && purchase_price <= 0) {
    errors.push({
      field: 'purchase_price',
      message: 'Purchase price must be greater than zero',
      rule: 'POSITIVE_PURCHASE_PRICE',
    });
  }

  // Rule 3: Earnest money must be positive and less than purchase price
  if (earnest_money !== undefined) {
    if (earnest_money < 0) {
      errors.push({
        field: 'earnest_money',
        message: 'Earnest money cannot be negative',
        rule: 'NON_NEGATIVE_EARNEST_MONEY',
      });
    }

    if (purchase_price && earnest_money > purchase_price) {
      errors.push({
        field: 'earnest_money',
        message: 'Earnest money cannot exceed purchase price',
        rule: 'EARNEST_MONEY_EXCEEDS_PRICE',
      });
    }
  }

  if (errors.length > 0) {
    logger.warn('Escrow business rule validation failed', { errors, body: req.body });
    return res.status(400).json({
      success: false,
      error: {
        code: 'BUSINESS_RULE_VIOLATION',
        message: 'Business rule validation failed',
        violations: errors,
      },
    });
  }

  next();
};

/**
 * Validates business rules for listing operations
 */
const validateListingRules = (req, res, next) => {
  const {
    list_price, listPrice, square_feet, squareFootage, year_built, yearBuilt,
  } = req.body;
  const errors = [];

  const price = list_price || listPrice;
  const sqft = square_feet || squareFootage;
  const year = year_built || yearBuilt;

  // Rule 1: List price must be positive
  if (price !== undefined && price <= 0) {
    errors.push({
      field: 'list_price',
      message: 'List price must be greater than zero',
      rule: 'POSITIVE_LIST_PRICE',
    });
  }

  // Rule 2: Square footage must be positive
  if (sqft !== undefined && sqft <= 0) {
    errors.push({
      field: 'square_feet',
      message: 'Square footage must be greater than zero',
      rule: 'POSITIVE_SQUARE_FEET',
    });
  }

  // Rule 3: Year built must be reasonable (1800-current year + 2 for pre-construction)
  if (year !== undefined) {
    const currentYear = new Date().getFullYear();
    if (year < 1800 || year > currentYear + 2) {
      errors.push({
        field: 'year_built',
        message: `Year built must be between 1800 and ${currentYear + 2}`,
        rule: 'REASONABLE_YEAR_BUILT',
      });
    }
  }

  // Rule 4: Price per sqft sanity check (warn if < $10 or > $10,000/sqft)
  if (price && sqft && price > 0 && sqft > 0) {
    const pricePerSqft = price / sqft;
    if (pricePerSqft < 10) {
      logger.warn('Unusually low price per square foot', {
        price,
        sqft,
        pricePerSqft,
        listing: req.body,
      });
    }
    if (pricePerSqft > 10000) {
      errors.push({
        field: 'list_price',
        message: 'Price per square foot exceeds $10,000 - please verify',
        rule: 'EXTREME_PRICE_PER_SQFT',
      });
    }
  }

  if (errors.length > 0) {
    logger.warn('Listing business rule validation failed', { errors, body: req.body });
    return res.status(400).json({
      success: false,
      error: {
        code: 'BUSINESS_RULE_VIOLATION',
        message: 'Business rule validation failed',
        violations: errors,
      },
    });
  }

  next();
};

/**
 * Validates business rules for appointment operations
 */
const validateAppointmentRules = (req, res, next) => {
  const { appointment_date, start_time, end_time } = req.body;
  const errors = [];

  // Rule 1: End time must be after start time
  if (start_time && end_time) {
    const start = new Date(`1970-01-01T${start_time}`);
    const end = new Date(`1970-01-01T${end_time}`);

    if (end <= start) {
      errors.push({
        field: 'end_time',
        message: 'End time must be after start time',
        rule: 'END_AFTER_START',
      });
    }
  }

  // Rule 2: Appointment date cannot be in the past (for new appointments)
  if (appointment_date && req.method === 'POST') {
    const apptDate = new Date(appointment_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (apptDate < today) {
      errors.push({
        field: 'appointment_date',
        message: 'Cannot create appointments in the past',
        rule: 'NO_PAST_APPOINTMENTS',
      });
    }
  }

  if (errors.length > 0) {
    logger.warn('Appointment business rule validation failed', { errors, body: req.body });
    return res.status(400).json({
      success: false,
      error: {
        code: 'BUSINESS_RULE_VIOLATION',
        message: 'Business rule validation failed',
        violations: errors,
      },
    });
  }

  next();
};

/**
 * Validates business rules for lead operations
 */
const validateLeadRules = (req, res, next) => {
  const { budget_range, lead_score } = req.body;
  const errors = [];

  // Rule 1: Lead score must be between 0 and 100
  if (lead_score !== undefined && (lead_score < 0 || lead_score > 100)) {
    errors.push({
      field: 'lead_score',
      message: 'Lead score must be between 0 and 100',
      rule: 'LEAD_SCORE_RANGE',
    });
  }

  // Rule 2: Budget range format validation (if provided as string like "$100k-$200k")
  if (budget_range && typeof budget_range === 'string') {
    // Simple validation - just check it's not empty if provided
    if (budget_range.trim().length === 0) {
      errors.push({
        field: 'budget_range',
        message: 'Budget range cannot be empty',
        rule: 'NON_EMPTY_BUDGET',
      });
    }
  }

  if (errors.length > 0) {
    logger.warn('Lead business rule validation failed', { errors, body: req.body });
    return res.status(400).json({
      success: false,
      error: {
        code: 'BUSINESS_RULE_VIOLATION',
        message: 'Business rule validation failed',
        violations: errors,
      },
    });
  }

  next();
};

module.exports = {
  validateEscrowRules,
  validateListingRules,
  validateAppointmentRules,
  validateLeadRules,
};
