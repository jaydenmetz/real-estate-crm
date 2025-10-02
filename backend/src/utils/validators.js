const { body, param, query } = require('express-validator');

// Common validation patterns
const validators = {
  // ID validation
  id: param('id').matches(/^[a-z]+_[a-zA-Z0-9]{12}$/).withMessage('Invalid ID format'),

  // Email validation
  email: body('email').optional().isEmail().normalizeEmail(),

  // Phone validation
  phone: body('phone').optional().isMobilePhone('any').withMessage('Invalid phone number'),

  // Date validation
  date: (field) => body(field).optional().isISO8601().toDate(),

  // Price validation
  price: (field) => body(field).optional().isFloat({ min: 0 }).withMessage(`${field} must be a positive number`),

  // Required string
  requiredString: (field, minLength = 1) => body(field).notEmpty().isLength({ min: minLength }).withMessage(`${field} is required`),

  // Optional string with max length
  optionalString: (field, maxLength = 255) => body(field).optional().isLength({ max: maxLength }).withMessage(`${field} too long`),

  // Enum validation
  enum: (field, values) => body(field).optional().isIn(values).withMessage(`${field} must be one of: ${values.join(', ')}`),

  // Array validation
  array: (field, itemValidator = null) => {
    const validator = body(field).optional().isArray();
    if (itemValidator) {
      return validator.custom((value) => value.every(itemValidator));
    }
    return validator;
  },

  // Pagination
  pagination: [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('sort').optional().isString(),
    query('order').optional().isIn(['asc', 'desc']),
  ],
};

// Specific entity validators
const escrowValidators = {
  create: [
    validators.requiredString('propertyAddress'),
    validators.price('purchasePrice').notEmpty(),
    validators.array('buyers'),
    validators.array('sellers'),
    validators.date('acceptanceDate').notEmpty(),
    validators.date('closingDate').notEmpty(),
    validators.enum('propertyType', ['Single Family', 'Condo', 'Townhouse', 'Multi-Family', 'Land', 'Commercial']),
    validators.enum('escrowStatus', ['Active', 'Pending', 'Closed', 'Cancelled', 'On Hold']),
  ],
  update: [
    validators.id,
    validators.optionalString('propertyAddress'),
    validators.price('purchasePrice'),
    validators.date('closingDate'),
    validators.enum('escrowStatus', ['Active', 'Pending', 'Closed', 'Cancelled', 'On Hold']),
  ],
};

const listingValidators = {
  create: [
    validators.requiredString('propertyAddress'),
    validators.price('listPrice').notEmpty(),
    validators.array('sellers'),
    validators.date('listingDate').notEmpty(),
    validators.enum('propertyType', ['Single Family', 'Condo', 'Townhouse', 'Multi-Family', 'Land', 'Commercial']),
    validators.enum('listingStatus', ['Coming Soon', 'Active', 'Pending', 'Sold', 'Expired', 'Withdrawn', 'Cancelled']),
  ],
};

const clientValidators = {
  create: [
    validators.requiredString('firstName'),
    validators.requiredString('lastName'),
    validators.email.notEmpty(),
    validators.phone,
    validators.enum('clientType', ['Buyer', 'Seller', 'Both', 'Investor', 'Referral']),
    validators.enum('clientStatus', ['Active', 'Past Client', 'Prospect', 'Archived']),
  ],
};

const leadValidators = {
  create: [
    validators.requiredString('firstName'),
    validators.requiredString('lastName'),
    validators.email,
    validators.phone,
    validators.requiredString('leadSource'),
    validators.enum('leadType', ['Buyer', 'Seller', 'Both', 'Investor']),
    validators.enum('leadStatus', ['New', 'Contacted', 'Qualified', 'Nurture', 'Appointment Set', 'Met', 'Converted', 'Lost']),
  ],
};

const appointmentValidators = {
  create: [
    validators.requiredString('title'),
    validators.date('date').notEmpty(),
    validators.requiredString('startTime'),
    body('duration').optional().isInt({ min: 15, max: 480 }),
    validators.enum('appointmentType', ['Listing Presentation', 'Buyer Consultation', 'Property Showing', 'Open House', 'Closing', 'Inspection', 'Other']),
    validators.enum('status', ['Scheduled', 'Confirmed', 'Completed', 'Cancelled', 'No Show']),
  ],
};

// Utility validation functions
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone) => {
  // Remove all non-digit characters and check if it's a valid phone number
  const cleanPhone = phone.replace(/\D/g, '');
  // US phone number: 10 digits or 11 digits starting with 1
  return cleanPhone.length === 10 || (cleanPhone.length === 11 && cleanPhone.startsWith('1'));
};

module.exports = {
  validators,
  escrowValidators,
  listingValidators,
  clientValidators,
  leadValidators,
  appointmentValidators,
  validateEmail,
  validatePhone,
};
