const express = require('express');
const router = express.Router();
const SimpleEscrowController = require('../controllers/escrows.controller');

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

// GET /v1/escrows/:id/people - Get all people associated with escrow
router.get('/:id/people', SimpleEscrowController.getEscrowPeople);

// GET /v1/escrows/:id/timeline - Get escrow timeline
router.get('/:id/timeline', SimpleEscrowController.getEscrowTimeline);

// GET /v1/escrows/:id/financials - Get escrow financial details
router.get('/:id/financials', SimpleEscrowController.getEscrowFinancials);

// GET /v1/escrows/:id/checklists - Get escrow checklists
router.get('/:id/checklists', SimpleEscrowController.getEscrowChecklists);

// GET /v1/escrows/:id/documents - Get escrow documents
router.get('/:id/documents', SimpleEscrowController.getEscrowDocuments);

// PUT /v1/escrows/:id/people - Update escrow people
router.put('/:id/people', SimpleEscrowController.updateEscrowPeople);

// POST /v1/escrows - Create new escrow with sequential ID
router.post('/', (req, res) => {
  return SimpleEscrowController.createEscrow(req, res);
});

// PUT /v1/escrows/:id - Update escrow
router.put('/:id', SimpleEscrowController.updateEscrow);

// PATCH /v1/escrows/:id/checklist - Update checklist item
router.patch('/:id/checklist', (req, res) => {
  try {
    const { id } = req.params;
    const { itemId, checked } = req.body;
    
    const escrow = databaseService.getById('escrows', id);
    if (!escrow) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Escrow not found'
        }
      });
    }
    
    // Update checklist item
    if (!escrow.checklists) {
      escrow.checklists = {};
    }
    escrow.checklists[itemId] = checked;
    
    // Update checklist progress
    // This is a simplified version - in production you'd calculate based on actual checklist structure
    const totalItems = Object.keys(escrow.checklists).length || 1;
    const completedItems = Object.values(escrow.checklists).filter(v => v === true).length;
    const percentage = Math.round((completedItems / totalItems) * 100);
    
    escrow.checklistProgress.overall = {
      completed: completedItems,
      total: totalItems,
      percentage
    };
    
    databaseService.update('escrows', id, escrow);
    
    res.json({
      success: true,
      data: {
        itemId,
        checked,
        completedAt: checked ? new Date().toISOString() : null,
        completedBy: 'Jayden Metz'
      },
      message: 'Checklist item updated'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update checklist'
      }
    });
  }
});

// POST /v1/escrows/:id/documents - Upload document
router.post('/:id/documents', (req, res) => {
  try {
    const { id } = req.params;
    const { documentType, name } = req.body;
    
    const escrow = databaseService.getById('escrows', id);
    if (!escrow) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Escrow not found'
        }
      });
    }
    
    // Add document to escrow
    if (!escrow.documents) {
      escrow.documents = [];
    }
    
    const newDocument = {
      id: `doc_${Date.now()}`,
      escrowId: id,
      documentType,
      name,
      uploadedAt: new Date().toISOString(),
      uploadedBy: 'Jayden Metz',
      size: '2.4 MB',
      url: 'https://example.com/document.pdf'
    };
    
    escrow.documents.push(newDocument);
    
    // Update document count in activity stats
    if (escrow.activityStats) {
      escrow.activityStats.documentsUploaded = escrow.documents.length;
    }
    
    databaseService.update('escrows', id, escrow);
    
    res.json({
      success: true,
      data: newDocument,
      message: 'Document uploaded successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to upload document'
      }
    });
  }
});

// POST /v1/escrows/:id/timeline - Add timeline event
router.post('/:id/timeline', (req, res) => {
  try {
    const { id } = req.params;
    const { event, description, type, icon } = req.body;
    
    const escrow = databaseService.getById('escrows', id);
    if (!escrow) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Escrow not found'
        }
      });
    }
    
    // Add timeline event
    if (!escrow.timeline) {
      escrow.timeline = [];
    }
    
    const newEvent = {
      id: Date.now(),
      date: new Date().toISOString(),
      event,
      description,
      type: type || 'update',
      icon: icon || 'event',
      createdBy: 'Jayden Metz'
    };
    
    escrow.timeline.push(newEvent);
    
    // Sort timeline by date (newest first) with safe date parsing
    escrow.timeline.sort((a, b) => {
      const dateA = a.date ? new Date(a.date) : new Date(0);
      const dateB = b.date ? new Date(b.date) : new Date(0);
      return dateB.getTime() - dateA.getTime();
    });
    
    databaseService.update('escrows', id, escrow);
    
    res.json({
      success: true,
      data: newEvent,
      message: 'Timeline event added'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to add timeline event'
      }
    });
  }
});

// POST /v1/escrows/:id/notes - Add note
router.post('/:id/notes', (req, res) => {
  try {
    const { id } = req.params;
    const { content, type = 'general' } = req.body;
    
    const escrow = databaseService.getById('escrows', id);
    if (!escrow) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Escrow not found'
        }
      });
    }
    
    // Add note to escrow
    if (!escrow.notes) {
      escrow.notes = [];
    }
    
    const newNote = {
      id: `note_${Date.now()}`,
      escrowId: id,
      content,
      type,
      createdAt: new Date().toISOString(),
      createdBy: 'Jayden Metz'
    };
    
    escrow.notes.push(newNote);
    
    // Update importantNotes if this is marked as important
    if (type === 'important') {
      escrow.importantNotes = content;
    }
    
    databaseService.update('escrows', id, escrow);
    
    res.json({
      success: true,
      data: newNote,
      message: 'Note added successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to add note'
      }
    });
  }
});

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