const express = require('express');
const router = express.Router();
const { authenticateToken } = require('./auth');
const ClientsController = require('../controllers/clients.controller.db');

// Apply authentication to all routes
router.use(authenticateToken);

// Client routes
router.get('/', ClientsController.getAllClients);
router.get('/stats', ClientsController.getAllClients); // Can add specific stats method later
router.get('/:id', ClientsController.getClientById);
router.post('/', ClientsController.createClient);
router.put('/:id', ClientsController.updateClient);
router.delete('/:id', ClientsController.deleteClient);

// Additional endpoints can be added here for notes, tasks, etc.

module.exports = router;