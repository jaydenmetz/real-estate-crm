/**
 * Checklists Routes
 */

const express = require('express');
const router = express.Router();
const checklistsController = require('../controllers/checklists.controller');
const { authenticate } = require('../middleware/apiKey.middleware');

// All routes require authentication
router.use(authenticate);

// GET /v1/checklists - List all checklists
router.get('/', checklistsController.getAllChecklists);

// GET /v1/checklists/entity/:type/:id - Get checklists for entity
router.get('/entity/:type/:id', checklistsController.getChecklistsByEntity);

// GET /v1/checklists/:id - Get checklist by ID (with tasks)
router.get('/:id', checklistsController.getChecklistById);

// POST /v1/checklists - Create checklist from template
router.post('/', checklistsController.createChecklist);

// PUT /v1/checklists/:id - Update checklist
router.put('/:id', checklistsController.updateChecklist);

// DELETE /v1/checklists/:id - Delete checklist
router.delete('/:id', checklistsController.deleteChecklist);

module.exports = router;
