// backend/src/routes/escrows.routes.js

const express = require('express');
const { body, param, query } = require('express-validator');

const router = express.Router();
// Use modular controller (Phase 1: Backend modularization)
const escrowsController = require('../controllers/escrows');
const { authenticate } = require('../middleware/apiKey.middleware');
const {
  validate, escrowValidationRules, paginationValidationRules, idValidationRules,
} = require('../middleware/validation.middleware');
const { validateEscrowRules } = require('../middleware/businessRules.middleware');
const {
  canAccessScope,
  requireOwnership,
  requireModifyPermission,
  requireDeletePermission
} = require('../middleware/authorization.middleware');

// All routes require authentication
router.use(authenticate);

/**
 * @openapi
 * /escrows:
 *   get:
 *     operationId: listEscrows
 *     summary: List all escrows
 *     description: Returns a paginated list of escrow transactions with optional filtering by status, price range, and closing dates
 *     tags:
 *       - Escrows
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     x-openai-isConsequential: false
 *     x-ai-examples:
 *       - query: "Show me all active escrows"
 *         parameters: { status: "active" }
 *       - query: "Find escrows closing this month"
 *         parameters: { closingDateStart: "2025-10-01", closingDateEnd: "2025-10-31" }
 *       - query: "List escrows over $500k"
 *         parameters: { minPrice: 500000 }
 *     parameters:
 *       - name: status
 *         in: query
 *         description: Filter by escrow status
 *         schema:
 *           type: string
 *           enum: [active, pending, closed, cancelled]
 *       - name: minPrice
 *         in: query
 *         description: Minimum purchase price filter
 *         schema:
 *           type: number
 *           minimum: 0
 *       - name: maxPrice
 *         in: query
 *         description: Maximum purchase price filter
 *         schema:
 *           type: number
 *           minimum: 0
 *       - name: closingDateStart
 *         in: query
 *         description: Filter escrows closing after this date
 *         schema:
 *           type: string
 *           format: date
 *       - name: closingDateEnd
 *         in: query
 *         description: Filter escrows closing before this date
 *         schema:
 *           type: string
 *           format: date
 *       - $ref: '#/components/parameters/pageParam'
 *       - $ref: '#/components/parameters/limitParam'
 *     responses:
 *       200:
 *         description: Successfully retrieved escrows
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/PaginatedResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Escrow'
 *             example:
 *               success: true
 *               data:
 *                 - id: "550e8400-e29b-41d4-a716-446655440000"
 *                   property_address: "123 Main St, Tehachapi, CA 93561"
 *                   purchase_price: 500000
 *                   escrow_status: "active"
 *                   closing_date: "2025-03-01"
 *               pagination:
 *                 page: 1
 *                 limit: 20
 *                 total: 45
 *                 pages: 3
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get(
  '/',
  [
    query('status').optional().isString().withMessage('Status must be a string'),
    query('minPrice').optional().isFloat({ min: 0 }).withMessage('minPrice must be a positive number')
      .toFloat(),
    query('maxPrice').optional().isFloat({ min: 0 }).withMessage('maxPrice must be a positive number')
      .toFloat(),
    query('closingDateStart').optional().isISO8601().withMessage('Invalid closingDateStart format'),
    query('closingDateEnd').optional().isISO8601().withMessage('Invalid closingDateEnd format'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be an integer')
      .toInt(),
    query('limit').optional().isInt({ min: 1 }).withMessage('Limit must be an integer')
      .toInt(),
    query('scope').optional().isString().withMessage('Scope must be a string'),
  ],
  validate,
  canAccessScope, // Phase 2: Check if user can access requested scope
  escrowsController.getEscrows,
);

/**
 * @openapi
 * /escrows/{id}:
 *   get:
 *     operationId: getEscrowById
 *     summary: Get escrow by ID
 *     description: Returns detailed information about a specific escrow transaction
 *     tags:
 *       - Escrows
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     x-openai-isConsequential: false
 *     x-ai-examples:
 *       - query: "Get escrow details for ID 550e8400-e29b-41d4-a716-446655440000"
 *         parameters: { id: "550e8400-e29b-41d4-a716-446655440000" }
 *       - query: "Show me the full details of this escrow"
 *         parameters: { id: "{{escrow_id}}" }
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     responses:
 *       200:
 *         description: Escrow found
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Escrow'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get(
  '/:id',
  [
    param('id').notEmpty().withMessage('Escrow ID is required'),
  ],
  validate,
  requireOwnership('escrow'), // Phase 2: Check ownership access
  escrowsController.getEscrow,
);

/**
 * @openapi
 * /escrows:
 *   post:
 *     operationId: createEscrow
 *     summary: Create new escrow
 *     description: |
 *       Creates a new escrow transaction. Property address is required.
 *
 *       ⚠️ **CONSEQUENTIAL ACTION**: This creates a new transaction record in the CRM.
 *       AI agents should confirm with users before executing.
 *
 *       Business Rules:
 *       - Property address is mandatory
 *       - Purchase price should be positive if provided
 *       - Closing date must be in the future
 *       - Status defaults to "pending" if not specified
 *     tags:
 *       - Escrows
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     x-openai-isConsequential: true
 *     x-ai-examples:
 *       - query: "Create an escrow for 123 Main St at $500k closing March 1st"
 *         parameters: { property_address: "123 Main St, Tehachapi, CA 93561", purchase_price: 500000, closing_date: "2025-03-01" }
 *       - query: "Start a new escrow transaction for the property on Oak Street"
 *         parameters: { property_address: "456 Oak St, Tehachapi, CA 93561", escrow_status: "active" }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - property_address
 *             properties:
 *               property_address:
 *                 type: string
 *                 description: Full property address
 *                 example: "123 Main St, Tehachapi, CA 93561"
 *               purchase_price:
 *                 type: number
 *                 example: 500000
 *               buyers:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Person'
 *               sellers:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Person'
 *               acceptance_date:
 *                 type: string
 *                 format: date
 *                 example: "2025-01-15"
 *               closing_date:
 *                 type: string
 *                 format: date
 *                 example: "2025-03-01"
 *               escrow_status:
 *                 type: string
 *                 enum: [active, pending, closed, cancelled]
 *                 example: "active"
 *               city:
 *                 type: string
 *                 example: "Tehachapi"
 *               state:
 *                 type: string
 *                 example: "CA"
 *               zip_code:
 *                 type: string
 *                 example: "93561"
 *           example:
 *             property_address: "123 Main St, Tehachapi, CA 93561"
 *             purchase_price: 500000
 *             buyers: [{"name": "John Doe", "email": "john@example.com"}]
 *             closing_date: "2025-03-01"
 *             escrow_status: "active"
 *     responses:
 *       201:
 *         description: Escrow created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Escrow'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post(
  '/',
  // Custom middleware to normalize field names before validation
  (req, res, next) => {
    // Normalize snake_case to camelCase if needed
    if (req.body.property_address && !req.body.propertyAddress) {
      req.body.propertyAddress = req.body.property_address;
    }
    if (req.body.purchase_price && !req.body.purchasePrice) {
      req.body.purchasePrice = req.body.purchase_price;
    }
    if (req.body.acceptance_date && !req.body.acceptanceDate) {
      req.body.acceptanceDate = req.body.acceptance_date;
    }
    if (req.body.closing_date && !req.body.closingDate) {
      req.body.closingDate = req.body.closing_date;
    }
    if (req.body.escrow_status && !req.body.escrowStatus) {
      req.body.escrowStatus = req.body.escrow_status;
    }
    if (req.body.zip_code && !req.body.zipCode) {
      req.body.zipCode = req.body.zip_code;
    }
    next();
  },
  [
    // Now validate only camelCase fields
    body('propertyAddress').notEmpty().withMessage('Property address is required'),
    body('purchasePrice').optional().isNumeric().withMessage('Purchase price must be a number'),
    body('buyers').optional().isArray({ min: 1 }).withMessage('Buyers must be an array'),
    body('sellers').optional().isArray({ min: 1 }).withMessage('Sellers must be an array'),
    body('acceptanceDate').optional().isISO8601().withMessage('Invalid acceptance date'),
    body('closingDate').optional().isISO8601().withMessage('Invalid closing date'),
    body('escrowStatus').optional().isString().withMessage('Escrow status must be a string'),
    body('city').optional().isString().withMessage('City must be a string'),
    body('state').optional().isString().withMessage('State must be a string'),
    body('zipCode').optional().isString().withMessage('Zip code must be a string'),
  ],
  validate,
  validateEscrowRules,
  escrowsController.createEscrow,
);

/**
 * @openapi
 * /escrows/{id}:
 *   put:
 *     operationId: updateEscrow
 *     summary: Update escrow
 *     description: |
 *       Updates an existing escrow transaction. Supports partial updates (only send fields you want to change).
 *
 *       ⚠️ **CONSEQUENTIAL ACTION**: This modifies transaction data.
 *       AI agents should confirm changes with users before executing.
 *
 *       Business Rules:
 *       - Cannot change property address after creation
 *       - Closing date changes may require broker approval
 *       - Price changes should be documented
 *       - Optimistic locking prevents concurrent update conflicts
 *       - Version field increments automatically
 *     tags:
 *       - Escrows
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     x-openai-isConsequential: true
 *     x-ai-examples:
 *       - query: "Update escrow price to $525,000"
 *         parameters: { id: "{{escrow_id}}", purchase_price: 525000 }
 *       - query: "Change the closing date to March 15th"
 *         parameters: { id: "{{escrow_id}}", closing_date: "2025-03-15" }
 *       - query: "Mark this escrow as closed"
 *         parameters: { id: "{{escrow_id}}", escrow_status: "closed" }
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               purchase_price:
 *                 type: number
 *                 example: 525000
 *               closing_date:
 *                 type: string
 *                 format: date
 *                 example: "2025-03-15"
 *               escrow_status:
 *                 type: string
 *                 enum: [active, pending, closed, cancelled]
 *               version:
 *                 type: integer
 *                 description: Current version for optimistic locking
 *                 example: 1
 *           example:
 *             purchase_price: 525000
 *             closing_date: "2025-03-15"
 *             version: 1
 *     responses:
 *       200:
 *         description: Escrow updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Escrow'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       409:
 *         description: Version conflict (optimistic locking)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.put(
  '/:id',
  // Normalize field names before validation (remove snake_case versions after copying)
  (req, res, next) => {
    if (req.body.purchase_price && !req.body.purchasePrice) {
      req.body.purchasePrice = req.body.purchase_price;
      delete req.body.purchase_price;
    }
    if (req.body.closing_date && !req.body.closingDate) {
      req.body.closingDate = req.body.closing_date;
      delete req.body.closing_date;
    }
    if (req.body.escrow_status && !req.body.escrowStatus) {
      req.body.escrowStatus = req.body.escrow_status;
      delete req.body.escrow_status;
    }
    if (req.body.escrow_officer_name && !req.body.escrowOfficerName) {
      req.body.escrowOfficerName = req.body.escrow_officer_name;
      delete req.body.escrow_officer_name;
    }
    next();
  },
  [
    param('id').notEmpty().withMessage('Escrow ID is required'),
    body('purchasePrice').optional().isNumeric().withMessage('Purchase price must be a number'),
    body('closingDate').optional().isISO8601().withMessage('Invalid closing date'),
    body('escrowStatus').optional().isString().withMessage('Escrow status must be a string'),
  ],
  validate,
  requireModifyPermission('escrow'), // Phase 2: Check modify permission
  validateEscrowRules,
  escrowsController.updateEscrow,
);

// Archive (soft delete) escrow - PUT /v1/escrows/:id/archive
router.put(
  '/:id/archive',
  [
    param('id').notEmpty().withMessage('Escrow ID is required'),
  ],
  validate,
  escrowsController.archiveEscrow,
);

// Restore archived escrow - PUT /v1/escrows/:id/restore
router.put(
  '/:id/restore',
  [
    param('id').notEmpty().withMessage('Escrow ID is required'),
  ],
  validate,
  escrowsController.restoreEscrow,
);

/**
 * @openapi
 * /escrows/{id}:
 *   delete:
 *     operationId: deleteEscrow
 *     summary: Delete escrow (permanent)
 *     description: |
 *       Permanently deletes an escrow transaction. This action cannot be undone.
 *
 *       🚨 **HIGHLY CONSEQUENTIAL ACTION**: This permanently destroys data.
 *       AI agents MUST get explicit user confirmation before executing.
 *
 *       Business Rules:
 *       - Only archived escrows can be permanently deleted
 *       - Active or closed escrows should be archived first
 *       - Deletion removes all transaction history
 *       - This action is irreversible - no recovery possible
 *       - Use archive instead of delete for most cases
 *     x-openai-isConsequential: true
 *     x-ai-examples:
 *       - query: "Permanently delete archived escrow {{escrow_id}}"
 *         parameters: { id: "{{escrow_id}}" }
 *         warning: "This will permanently delete the escrow. Are you sure?"
 *     tags:
 *       - Escrows
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     responses:
 *       200:
 *         description: Escrow deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       400:
 *         description: Cannot delete non-archived escrow
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.delete(
  '/:id',
  [
    param('id').notEmpty().withMessage('Escrow ID is required'),
  ],
  validate,
  requireDeletePermission('escrow'), // Phase 2: Check delete permission
  escrowsController.deleteEscrow,
);

// Batch delete multiple escrows (only archived ones) - POST /v1/escrows/batch-delete
router.post(
  '/batch-delete',
  [
    body('ids').isArray({ min: 1 }).withMessage('IDs must be a non-empty array'),
    body('ids.*').isString().withMessage('Each ID must be a string'),
  ],
  validate,
  escrowsController.batchDeleteEscrows,
);

// PATCH /v1/escrows/:id/checklist
router.patch(
  '/:id/checklist',
  [
    param('id').notEmpty().withMessage('Escrow ID is required'),
    body('item').notEmpty().withMessage('Checklist item is required'),
    body('value').isBoolean().withMessage('Value must be boolean'),
    body('note').optional().isString().withMessage('Note must be a string'),
  ],
  validate,
  escrowsController.updateChecklist,
);

// GET /v1/escrows/:id/timeline
router.get(
  '/:id/timeline',
  [
    param('id').notEmpty().withMessage('Escrow ID is required'),
  ],
  validate,
  escrowsController.getEscrowTimeline,
);

// GET /v1/escrows/:id/people
router.get(
  '/:id/people',
  [
    param('id').notEmpty().withMessage('Escrow ID is required'),
  ],
  validate,
  escrowsController.getEscrowPeople,
);

// GET /v1/escrows/:id/financials
router.get(
  '/:id/financials',
  [
    param('id').notEmpty().withMessage('Escrow ID is required'),
  ],
  validate,
  escrowsController.getEscrowFinancials,
);

// GET /v1/escrows/:id/checklists
router.get(
  '/:id/checklists',
  [
    param('id').notEmpty().withMessage('Escrow ID is required'),
  ],
  validate,
  escrowsController.getEscrowChecklists,
);

// GET /v1/escrows/:id/details
router.get(
  '/:id/details',
  [
    param('id').notEmpty().withMessage('Escrow ID is required'),
  ],
  validate,
  escrowsController.getEscrowDetails,
);

// GET /v1/escrows/:id/property-details
router.get(
  '/:id/property-details',
  [
    param('id').notEmpty().withMessage('Escrow ID is required'),
  ],
  validate,
  escrowsController.getEscrowPropertyDetails,
);

// GET /v1/escrows/:id/checklist-loan
router.get(
  '/:id/checklist-loan',
  [
    param('id').notEmpty().withMessage('Escrow ID is required'),
  ],
  validate,
  escrowsController.getEscrowChecklistLoan,
);

// GET /v1/escrows/:id/checklist-house
router.get(
  '/:id/checklist-house',
  [
    param('id').notEmpty().withMessage('Escrow ID is required'),
  ],
  validate,
  escrowsController.getEscrowChecklistHouse,
);

// GET /v1/escrows/:id/checklist-admin
router.get(
  '/:id/checklist-admin',
  [
    param('id').notEmpty().withMessage('Escrow ID is required'),
  ],
  validate,
  escrowsController.getEscrowChecklistAdmin,
);

// GET /v1/escrows/:id/documents
router.get(
  '/:id/documents',
  [
    param('id').notEmpty().withMessage('Escrow ID is required'),
  ],
  validate,
  escrowsController.getEscrowDocuments,
);

// GET /v1/escrows/:id/notes
router.get(
  '/:id/notes',
  [
    param('id').notEmpty().withMessage('Escrow ID is required'),
  ],
  validate,
  escrowsController.getEscrowNotes,
);

// POST /v1/escrows/:id/notes
router.post(
  '/:id/notes',
  [
    param('id').notEmpty().withMessage('Escrow ID is required'),
    body('note').notEmpty().withMessage('Note content is required'),
    body('type').optional().isString().withMessage('Note type must be a string'),
  ],
  validate,
  escrowsController.addEscrowNote,
);

// Additional PUT endpoints for updating specific escrow sections

// PUT /v1/escrows/:id/details
router.put(
  '/:id/details',
  [
    param('id').notEmpty().withMessage('Escrow ID is required'),
  ],
  validate,
  escrowsController.updateEscrowDetails,
);

// PUT /v1/escrows/:id/people
router.put(
  '/:id/people',
  [
    param('id').notEmpty().withMessage('Escrow ID is required'),
  ],
  validate,
  escrowsController.updateEscrowPeople,
);

// PUT /v1/escrows/:id/timeline
router.put(
  '/:id/timeline',
  [
    param('id').notEmpty().withMessage('Escrow ID is required'),
  ],
  validate,
  escrowsController.updateEscrowTimeline || escrowsController.updateEscrow,
);

// PUT /v1/escrows/:id/financials
router.put(
  '/:id/financials',
  [
    param('id').notEmpty().withMessage('Escrow ID is required'),
  ],
  validate,
  escrowsController.updateEscrowFinancials,
);

// PUT /v1/escrows/:id/property-details
router.put(
  '/:id/property-details',
  [
    param('id').notEmpty().withMessage('Escrow ID is required'),
  ],
  validate,
  escrowsController.updateEscrowPropertyDetails,
);

// PUT /v1/escrows/:id/checklist-loan
router.put(
  '/:id/checklist-loan',
  [
    param('id').notEmpty().withMessage('Escrow ID is required'),
  ],
  validate,
  escrowsController.updateEscrowChecklistLoan,
);

// PUT /v1/escrows/:id/checklist-house
router.put(
  '/:id/checklist-house',
  [
    param('id').notEmpty().withMessage('Escrow ID is required'),
  ],
  validate,
  escrowsController.updateEscrowChecklistHouse,
);

// PUT /v1/escrows/:id/checklist-admin
router.put(
  '/:id/checklist-admin',
  [
    param('id').notEmpty().withMessage('Escrow ID is required'),
  ],
  validate,
  escrowsController.updateEscrowChecklistAdmin,
);

// PUT /v1/escrows/:id/documents
router.put(
  '/:id/documents',
  [
    param('id').notEmpty().withMessage('Escrow ID is required'),
    body().isArray().withMessage('Documents must be an array'),
  ],
  validate,
  escrowsController.updateEscrowDocuments,
);

module.exports = router;
