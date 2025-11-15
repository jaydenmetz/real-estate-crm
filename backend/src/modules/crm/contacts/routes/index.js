const express = require('express');
const router = express.Router();
const contactsController = require('../controllers');
const { authenticate } = require('../../../../middleware/auth/auth.middleware');

// All routes require authentication
router.use(authenticate);

// Contact CRUD routes
router.get('/', contactsController.list);
router.get('/search', contactsController.search);                      // GET /contacts/search?role=lead&name=john
router.get('/:id', contactsController.getById);
router.post('/', contactsController.create);
router.put('/:id', contactsController.update);
router.patch('/:id/archive', contactsController.archive);
router.patch('/:id/unarchive', contactsController.unarchive);
router.delete('/:id', contactsController.delete);

// Contact role management (multi-role support)
router.get('/:id/roles', contactsController.getRoles);                 // GET /contacts/:id/roles - Get all roles for contact
router.post('/:id/roles', contactsController.addRole);                 // POST /contacts/:id/roles - Add new role to contact
router.delete('/:id/roles/:roleId', contactsController.removeRole);    // DELETE /contacts/:id/roles/:roleId - Remove role from contact
router.put('/:id/roles/primary', contactsController.setPrimaryRole);   // PUT /contacts/:id/roles/primary - Set primary role

module.exports = router;