const express = require('express');
const router = express.Router();
const contactRolesController = require('../controllers/contact-roles.controller');
const { authenticate } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authenticate);

// Contact Roles routes
router.get('/', contactRolesController.list);                          // GET /v1/contact-roles - List all available roles
router.get('/:id', contactRolesController.getById);                    // GET /v1/contact-roles/:id - Get specific role definition
router.post('/', contactRolesController.create);                       // POST /v1/contact-roles - Create new role (admin only)
router.put('/:id', contactRolesController.update);                     // PUT /v1/contact-roles/:id - Update role (admin only)

module.exports = router;
