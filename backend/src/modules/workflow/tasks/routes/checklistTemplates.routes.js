/**
 * Checklist Templates Routes
 */

const express = require('express');
const router = express.Router();
const checklistTemplatesController = require('../controllers/checklistTemplates.controller');
const { authenticate, requireRole } = require('../../../middleware/auth.middleware');

// SECURITY: All routes require authentication
router.use(authenticate);

// GET /v1/checklist-templates - List all templates (all authenticated users)
router.get('/', checklistTemplatesController.getAllTemplates);

// GET /v1/checklist-templates/:id - Get template by ID (all authenticated users)
router.get('/:id', checklistTemplatesController.getTemplateById);

// POST /v1/checklist-templates - Create new template (admin/broker only)
router.post('/', requireRole('system_admin', 'broker'), checklistTemplatesController.createTemplate);

// PUT /v1/checklist-templates/:id - Update template (admin/broker only)
router.put('/:id', requireRole('system_admin', 'broker'), checklistTemplatesController.updateTemplate);

// DELETE /v1/checklist-templates/:id - Delete template (admin/broker only)
router.delete('/:id', requireRole('system_admin', 'broker'), checklistTemplatesController.deleteTemplate);

module.exports = router;
