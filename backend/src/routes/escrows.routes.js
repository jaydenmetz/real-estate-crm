// backend/src/routes/escrows.routes.js

const express = require('express');
const { body, param, query } = require('express-validator');
const multer = require('multer');
const router = express.Router();
const escrowsController = require('../controllers/escrows.controller');
const { authenticate, requirePermission } = require('../middleware/auth.middleware');
const validationMiddleware = require('../middleware/validation.middleware');

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// All routes require authentication and escrows permission
router.use(authenticate);
router.use(requirePermission('escrows'));

// GET /v1/escrows?status&page&limit&minPrice&maxPrice&closingDateStart&closingDateEnd
router.get(
  '/',
  [
    query('status').optional().isString().withMessage('Status must be a string'),
    query('minPrice').optional().isFloat({ min: 0 }).withMessage('minPrice must be a positive number').toFloat(),
    query('maxPrice').optional().isFloat({ min: 0 }).withMessage('maxPrice must be a positive number').toFloat(),
    query('closingDateStart').optional().isISO8601().withMessage('Invalid closingDateStart format'),
    query('closingDateEnd').optional().isISO8601().withMessage('Invalid closingDateEnd format'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be an integer').toInt(),
    query('limit').optional().isInt({ min: 1 }).withMessage('Limit must be an integer').toInt()
  ],
  validationMiddleware,
  escrowsController.getEscrows
);

// GET /v1/escrows/:id
router.get(
  '/:id',
  [
    param('id').notEmpty().withMessage('Escrow ID is required')
  ],
  validationMiddleware,
  escrowsController.getEscrow
);

// POST /v1/escrows
router.post(
  '/',
  [
    // Required core fields for every transaction
    body('propertyAddress').notEmpty().withMessage('Property address is required'),
    body('purchasePrice').isNumeric().withMessage('Purchase price must be a number'),
    body('buyers').isArray({ min: 1 }).withMessage('Buyers must be a non-empty array'),
    body('buyers.*.name').notEmpty().withMessage('Buyer name is required'),
    body('sellers').isArray({ min: 1 }).withMessage('Sellers must be a non-empty array'),
    body('sellers.*.name').notEmpty().withMessage('Seller name is required'),
    body('acceptanceDate').isISO8601().withMessage('Invalid acceptance date'),
    body('closingDate').isISO8601().withMessage('Invalid closing date'),
    
    // Optional fields that AI can update later
    body('propertyType').optional().isString(),
    body('escrowCompany').optional().isString(),
    body('escrowOfficer').optional().isString(),
    body('titleCompany').optional().isString(),
    body('lender').optional().isString(),
    body('earnestMoneyDeposit').optional().isNumeric(),
    body('downPayment').optional().isNumeric(),
    body('loanAmount').optional().isNumeric(),
    body('commissionPercentage').optional().isNumeric(),
    body('inspectionDeadline').optional().isISO8601(),
    body('appraisalDeadline').optional().isISO8601(),
    body('loanContingencyDeadline').optional().isISO8601(),
    body('notes').optional().isString()
  ],
  validationMiddleware,
  escrowsController.createEscrow
);

// POST /v1/escrows/parse-rpa - Parse RPA PDF and extract escrow data
router.post(
  '/parse-rpa',
  upload.single('rpa'),
  escrowsController.parseRPA
);

// PUT /v1/escrows/:id
router.put(
  '/:id',
  [
    param('id').notEmpty().withMessage('Escrow ID is required'),
    body('purchasePrice').optional().isNumeric().withMessage('Purchase price must be a number'),
    body('closingDate').optional().isISO8601().withMessage('Invalid closing date')
  ],
  validationMiddleware,
  escrowsController.updateEscrow
);

// DELETE /v1/escrows/:id
router.delete(
  '/:id',
  [
    param('id').notEmpty().withMessage('Escrow ID is required')
  ],
  validationMiddleware,
  escrowsController.deleteEscrow
);

// PATCH /v1/escrows/:id/checklist
router.patch(
  '/:id/checklist',
  [
    param('id').notEmpty().withMessage('Escrow ID is required'),
    body('item').notEmpty().withMessage('Checklist item is required'),
    body('value').isBoolean().withMessage('Value must be boolean'),
    body('note').optional().isString().withMessage('Note must be a string')
  ],
  validationMiddleware,
  escrowsController.updateChecklist
);

module.exports = router;