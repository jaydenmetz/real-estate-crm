/**
 * Checklist Templates Routes
 */

const express = require('express');
const router = express.Router();
const checklistTemplatesController = require('../controllers/checklistTemplates.controller');
const { authenticate } = require('../../../middleware/apiKey.middleware');

// All routes require authentication
router.use(authenticate);

// GET /v1/checklist-templates - List all templates
router.get('/', checklistTemplatesController.getAllTemplates);

// GET /v1/checklist-templates/:id - Get template by ID
router.get('/:id', checklistTemplatesController.getTemplateById);

// POST /v1/checklist-templates - Create new template
router.post('/', checklistTemplatesController.createTemplate);

// PUT /v1/checklist-templates/:id - Update template
router.put('/:id', checklistTemplatesController.updateTemplate);

// DELETE /v1/checklist-templates/:id - Delete template
router.delete('/:id', checklistTemplatesController.deleteTemplate);

module.exports = router;
