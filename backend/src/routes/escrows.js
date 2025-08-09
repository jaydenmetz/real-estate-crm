const express = require('express');
const router = express.Router();
const SimpleEscrowController = require('../controllers/escrows.controller');

// Mount health check routes
const healthRoutes = require('./escrows-health');
router.use('/', healthRoutes);

// Database routes
router.get('/database', SimpleEscrowController.getAllEscrows);
router.get('/database/:id', SimpleEscrowController.getEscrowById);

// Helper function to transform database escrow to API response format for list view
const transformEscrowForList = (escrow) => ({
  id: escrow.id,
  escrowNumber: escrow.escrowNumber,
  propertyAddress: escrow.propertyAddress,
  propertyImage: escrow.propertyImages?.[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
  escrowStatus: escrow.escrowStatus,
  purchasePrice: escrow.purchasePrice,
  myCommission: escrow.myCommission,
  clients: escrow.clients?.map(c => ({ 
    name: c.name, 
    type: c.role || c.type, 
    avatar: c.avatar 
  })) || [],
  scheduledCoeDate: escrow.scheduledCoeDate,
  daysToClose: escrow.activityStats?.daysToClose || 0,
  checklistProgress: escrow.checklistProgress?.overall?.percentage || 0,
  lastActivity: escrow.lastActivity || escrow.lastModifiedDate || escrow.updatedAt || escrow.createdAt || null,
  upcomingDeadlines: escrow.activityStats?.upcomingDeadlines || 0
});

// GET /v1/escrows - List all escrows from real database
router.get('/', async (req, res) => {
  // Always use real database
  return SimpleEscrowController.getAllEscrows(req, res);
});

// GET /v1/escrows/stats - Get dashboard statistics
router.get('/stats', SimpleEscrowController.getEscrowStats);

// GET /v1/escrows/:id - Get single escrow with full details
router.get('/:id', async (req, res) => {
  // Back to full controller
  return SimpleEscrowController.getEscrowById(req, res);
});

// NEW ENDPOINTS FOR ESCROW DETAIL DATA

// GET /v1/escrows/:id/details - Get core escrow details
router.get('/:id/details', SimpleEscrowController.getEscrowDetails);

// GET /v1/escrows/:id/people - Get all people associated with escrow
router.get('/:id/people', SimpleEscrowController.getEscrowPeople);

// GET /v1/escrows/:id/timeline - Get escrow timeline
router.get('/:id/timeline', SimpleEscrowController.getEscrowTimeline);

// GET /v1/escrows/:id/financials - Get escrow financial details
router.get('/:id/financials', SimpleEscrowController.getEscrowFinancials);

// GET /v1/escrows/:id/checklist-loan - Get loan checklist
router.get('/:id/checklist-loan', SimpleEscrowController.getEscrowChecklistLoan);

// GET /v1/escrows/:id/checklist-house - Get house checklist
router.get('/:id/checklist-house', SimpleEscrowController.getEscrowChecklistHouse);

// GET /v1/escrows/:id/checklist-admin - Get admin checklist
router.get('/:id/checklist-admin', SimpleEscrowController.getEscrowChecklistAdmin);

// GET /v1/escrows/:id/documents - Get escrow documents
router.get('/:id/documents', SimpleEscrowController.getEscrowDocuments);

// GET /v1/escrows/:id/property-details - Get property details
router.get('/:id/property-details', SimpleEscrowController.getEscrowPropertyDetails);

// GET /v1/escrows/:id/image - Get property image from Zillow
router.get('/:id/image', SimpleEscrowController.getEscrowImage);

// PUT /v1/escrows/:id/details - Update core escrow details
router.put('/:id/details', SimpleEscrowController.updateEscrowDetails);

// PUT /v1/escrows/:id/people - Update escrow people
router.put('/:id/people', SimpleEscrowController.updateEscrowPeople);

// PUT /v1/escrows/:id/property-details - Update property details
router.put('/:id/property-details', SimpleEscrowController.updateEscrowPropertyDetails);

// PUT /v1/escrows/:id/financials - Update financial details
router.put('/:id/financials', SimpleEscrowController.updateEscrowFinancials);

// PUT /v1/escrows/:id/timeline - Update timeline dates
router.put('/:id/timeline', SimpleEscrowController.updateEscrowTimeline);

// PUT /v1/escrows/:id/checklist-loan - Update loan checklist
router.put('/:id/checklist-loan', SimpleEscrowController.updateEscrowChecklistLoan);

// PUT /v1/escrows/:id/checklist-house - Update house checklist
router.put('/:id/checklist-house', SimpleEscrowController.updateEscrowChecklistHouse);

// PUT /v1/escrows/:id/checklist-admin - Update admin checklist
router.put('/:id/checklist-admin', SimpleEscrowController.updateEscrowChecklistAdmin);

// PUT /v1/escrows/:id/documents - Update documents
router.put('/:id/documents', SimpleEscrowController.updateEscrowDocuments);

// POST /v1/escrows - Create new escrow with sequential ID
router.post('/', (req, res) => {
  return SimpleEscrowController.createEscrow(req, res);
});

// PUT /v1/escrows/:id - Update escrow
router.put('/:id', SimpleEscrowController.updateEscrow);




// POST /v1/escrows/:id/ai-assist - AI assistance endpoint
router.post('/:id/ai-assist', (req, res) => {
  const { action, context } = req.body;
  
  // This would connect to the AI team executive assistant
  res.json({
    success: true,
    data: {
      action,
      status: 'processing',
      message: 'AI assistant is working on your request',
      estimatedTime: '30 seconds',
      endpoint: '/v1/ai-team/exec-assistant/endpoint'
    }
  });
});

// DELETE /v1/escrows/:id - Delete escrow
router.delete('/:id', SimpleEscrowController.deleteEscrow);

module.exports = router;