const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const leadsController = require('../controllers/leads.controller');
const { authenticate, requirePermission } = require('../middleware/auth.middleware');
const handleValidationErrors = require('../middleware/validation.middleware');

// All routes require authentication
router.use(authenticate);

// Validation rules
const createValidation = [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('phone').optional().matches(/^[\d\s\-\+\(\)]+$/).withMessage('Invalid phone number format'),
  body('source').notEmpty().isIn(['Website', 'Referral', 'Social Media', 'Email Campaign', 'Phone', 'Walk-in', 'Partner', 'Advertisement', 'Other']).withMessage('Invalid lead source'),
  body('type').optional().isIn(['Buyer', 'Seller', 'Investor', 'Renter']).withMessage('Invalid lead type'),
  body('budget').optional().isInt({ min: 0 }).withMessage('Budget must be a positive number'),
  body('timeline').optional().isIn(['Immediate', 'Within 1 month', '1-3 months', '3-6 months', '6-12 months', 'Over 1 year', 'Just looking']).withMessage('Invalid timeline'),
  body('location').optional().isString(),
  body('propertyInterests').optional().isArray(),
  body('notes').optional().isString(),
  body('assignToAgent').optional().isMongoId()
];

const updateValidation = [
  body('firstName').optional().notEmpty(),
  body('lastName').optional().notEmpty(),
  body('email').optional().isEmail(),
  body('phone').optional().matches(/^[\d\s\-\+\(\)]+$/),
  body('type').optional().isIn(['Buyer', 'Seller', 'Investor', 'Renter']),
  body('status').optional().isIn(['New', 'Contacted', 'Qualified', 'Interested', 'Negotiating', 'Converted', 'Lost', 'On Hold']),
  body('score').optional().isInt({ min: 0, max: 100 }),
  body('timeline').optional().isIn(['Immediate', 'Within 1 month', '1-3 months', '3-6 months', '6-12 months', 'Over 1 year', 'Just looking']),
  body('budget').optional().isInt({ min: 0 }),
  body('assignedTo').optional().isMongoId()
];

const activityValidation = [
  body('type').notEmpty().withMessage('Activity type is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('outcome').optional().isString(),
  body('nextSteps').optional().isString(),
  body('followUpDate').optional().isISO8601()
];

const scoreUpdateValidation = [
  body('score').optional().isInt({ min: 0, max: 100 }).withMessage('Score must be between 0 and 100'),
  body('adjustment').optional().isInt({ min: -50, max: 50 }).withMessage('Adjustment must be between -50 and 50'),
  body('reason').notEmpty().withMessage('Reason is required')
];

const nurtureCampaignValidation = [
  body('campaignId').notEmpty().withMessage('Campaign ID is required'),
  body('startDate').optional().isISO8601()
];

const convertValidation = [
  body('clientType').isIn(['Buyer', 'Seller', 'Past Client']).withMessage('Invalid client type'),
  body('conversionNotes').optional().isString()
];

const mergeValidation = [
  body('leadIds').isArray({ min: 2 }).withMessage('At least 2 lead IDs required'),
  body('leadIds.*').isMongoId().withMessage('Invalid lead ID format'),
  body('primaryLeadId').isMongoId().withMessage('Primary lead ID is required')
];

const bulkImportValidation = [
  body('leads').isArray({ min: 1 }).withMessage('Leads array is required'),
  body('leads.*.firstName').notEmpty().withMessage('First name is required'),
  body('leads.*.lastName').notEmpty().withMessage('Last name is required'),
  body('leads.*.source').notEmpty().withMessage('Source is required'),
  body('importSource').optional().isString(),
  body('skipDuplicates').optional().isBoolean()
];

// Analytics and reporting routes
router.get('/analytics/conversion-rate', requirePermission('leads'), [
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('source').optional().isString(),
  query('agentId').optional().isMongoId()
], handleValidationErrors, leadsController.getConversionRate);

router.get('/analytics/source-roi', requirePermission('leads'), [
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601()
], handleValidationErrors, leadsController.getSourceROI);

router.get('/analytics/agent-performance', requirePermission('leads'), [
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('metric').optional().isIn(['conversion_rate', 'response_time', 'total_converted', 'average_score'])
], handleValidationErrors, leadsController.getAgentPerformance);

router.get('/analytics/funnel', requirePermission('leads'), [
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('groupBy').optional().isIn(['week', 'month', 'quarter'])
], handleValidationErrors, leadsController.getLeadFunnel);

// Main CRUD routes
router.get('/stats', requirePermission('leads'), leadsController.getStats);
router.get('/hot', requirePermission('leads'), leadsController.getHotLeads);
router.get('/routing-rules', requirePermission('leads'), leadsController.getRoutingRules);

router.get('/', requirePermission('leads'), [
  query('status').optional().isIn(['New', 'Contacted', 'Qualified', 'Interested', 'Negotiating', 'Converted', 'Lost', 'On Hold']),
  query('source').optional().isIn(['Website', 'Referral', 'Social Media', 'Email Campaign', 'Phone', 'Walk-in', 'Partner', 'Advertisement', 'Other']),
  query('temperature').optional().isIn(['Hot', 'Warm', 'Cold']),
  query('minScore').optional().isInt({ min: 0, max: 100 }),
  query('maxScore').optional().isInt({ min: 0, max: 100 }),
  query('assignedTo').optional().isMongoId(),
  query('createdAfter').optional().isISO8601(),
  query('createdBefore').optional().isISO8601(),
  query('search').optional().isString(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('sort').optional().isIn(['score', 'createdAt', 'lastActivityDate', 'firstName']),
  query('order').optional().isIn(['asc', 'desc'])
], handleValidationErrors, leadsController.getLeads);

router.get('/:id', requirePermission('leads'), leadsController.getLead);
router.post('/', requirePermission('leads'), createValidation, handleValidationErrors, leadsController.createLead);
router.put('/:id', requirePermission('leads'), updateValidation, handleValidationErrors, leadsController.updateLead);
router.delete('/:id', requirePermission('leads'), leadsController.deleteLead);

// Workflow management endpoints
router.post('/:id/activity', requirePermission('leads'), activityValidation, handleValidationErrors, leadsController.recordActivity);
router.patch('/:id/score', requirePermission('leads'), scoreUpdateValidation, handleValidationErrors, leadsController.updateScore);
router.patch('/:id/assign', requirePermission('leads'), [
  body('agentId').notEmpty().isMongoId().withMessage('Valid agent ID is required'),
  body('reason').optional().isString()
], handleValidationErrors, leadsController.assignToAgent);
router.post('/:id/nurture', requirePermission('leads'), nurtureCampaignValidation, handleValidationErrors, leadsController.addToNurtureCampaign);
router.post('/:id/convert', requirePermission('leads'), convertValidation, handleValidationErrors, leadsController.convertToClient);

// Advanced features
router.post('/merge', requirePermission('leads'), mergeValidation, handleValidationErrors, leadsController.mergeLeads);
router.post('/bulk-import', requirePermission('leads'), bulkImportValidation, handleValidationErrors, leadsController.bulkImport);
router.put('/routing-rules', requirePermission('leads'), [
  body('rules').isObject().withMessage('Rules object is required')
], handleValidationErrors, leadsController.updateRoutingRules);

// Legacy endpoints (kept for backward compatibility)
router.post('/:id/convert-legacy', requirePermission('leads'), [
  body('clientType').isIn(['Buyer', 'Seller', 'Past Client']).withMessage('Invalid client type')
], handleValidationErrors, leadsController.convertLead);

router.post('/:id/activity-legacy', requirePermission('leads'), [
  body('type').notEmpty().withMessage('Activity type is required'),
  body('subject').notEmpty().withMessage('Subject is required')
], handleValidationErrors, leadsController.logActivity);

router.patch('/:id/status', requirePermission('leads'), [
  body('status').isIn(['New', 'Contacted', 'Qualified', 'Nurturing', 'Converted', 'Lost']).withMessage('Invalid status')
], handleValidationErrors, leadsController.updateStatus);

module.exports = router;