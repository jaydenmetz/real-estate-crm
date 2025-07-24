const express = require('express');
const router = express.Router();
const databaseService = require('../services/database.service');
const SimpleEscrowController = require('../controllers/escrows.controller');
const { pool } = require('../config/database');

// Debug endpoint
router.get('/debug/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'SELECT numeric_id, display_id, property_address FROM escrows WHERE numeric_id = $1',
      [id]
    );
    res.json({
      success: true,
      found: result.rows.length > 0,
      data: result.rows[0] || null,
      environment: process.env.NODE_ENV || 'unknown'
    });
  } catch (error) {
    res.json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

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
  transactionType: escrow.transactionType,
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
  priorityLevel: escrow.priorityLevel,
  lastActivity: escrow.lastActivity || escrow.lastModifiedDate || escrow.updatedAt || escrow.createdAt || null,
  upcomingDeadlines: escrow.activityStats?.upcomingDeadlines || 0
});

// GET /v1/escrows - List all escrows from real database
router.get('/', async (req, res) => {
  // Always use real database
  return SimpleEscrowController.getAllEscrows(req, res);
});

// GET /v1/escrows/stats - Get dashboard statistics
router.get('/stats', (req, res) => {
  try {
    const escrows = databaseService.getAll('escrows');
    const stats = databaseService.getStats('escrows');
    
    // Calculate additional statistics
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    
    const closedThisMonth = escrows.filter(e => {
      if (e.escrowStatus !== 'closed') return false;
      const dateStr = e.actualCoeDate || e.scheduledCoeDate || e.closing_date;
      if (!dateStr) return false;
      const closeDate = new Date(dateStr);
      if (isNaN(closeDate.getTime())) return false;
      return closeDate.getMonth() === thisMonth && closeDate.getFullYear() === thisYear;
    }).length;
    
    const avgDaysToClose = escrows
      .filter(e => e.escrowStatus === 'closed' && e.actualCoeDate)
      .reduce((sum, e) => {
        const openDateStr = e.escrowOpenDate || e.acceptanceDate || e.acceptance_date;
        const closeDateStr = e.actualCoeDate || e.closing_date;
        if (!openDateStr || !closeDateStr) return sum;
        
        const openDate = new Date(openDateStr);
        const closeDate = new Date(closeDateStr);
        if (isNaN(openDate.getTime()) || isNaN(closeDate.getTime())) return sum;
        
        const days = Math.floor((closeDate - openDate) / (24 * 60 * 60 * 1000));
        return sum + days;
      }, 0) / (escrows.filter(e => e.escrowStatus === 'closed').length || 1);
    
    // Calculate pipeline
    const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const oneMonthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const twoMonthsFromNow = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
    
    const thisWeek = escrows.filter(e => {
      const dateStr = e.scheduledCoeDate || e.closing_date;
      if (!dateStr) return false;
      const closeDate = new Date(dateStr);
      if (isNaN(closeDate.getTime())) return false;
      return e.escrowStatus === 'active' && closeDate <= oneWeekFromNow;
    }).length;
    
    const thisMonthPipeline = escrows.filter(e => {
      const dateStr = e.scheduledCoeDate || e.closing_date;
      if (!dateStr) return false;
      const closeDate = new Date(dateStr);
      if (isNaN(closeDate.getTime())) return false;
      return e.escrowStatus === 'active' && closeDate <= oneMonthFromNow;
    }).length;
    
    const nextMonth = escrows.filter(e => {
      const dateStr = e.scheduledCoeDate || e.closing_date;
      if (!dateStr) return false;
      const closeDate = new Date(dateStr);
      if (isNaN(closeDate.getTime())) return false;
      return e.escrowStatus === 'active' && closeDate > oneMonthFromNow && closeDate <= twoMonthsFromNow;
    }).length;
    
    const projectedRevenue = escrows
      .filter(e => e.escrowStatus === 'active')
      .reduce((sum, e) => sum + (e.myCommission || 0), 0);
    
    // Generate monthly trends
    const trends = [];
    for (let i = 5; i >= 0; i--) {
      const trendDate = new Date(thisYear, thisMonth - i, 1);
      const monthName = trendDate.toLocaleString('default', { month: 'short' });
      
      const monthlyEscrows = escrows.filter(e => {
        if (e.escrowStatus !== 'closed') return false;
        const dateStr = e.actualCoeDate || e.scheduledCoeDate || e.closing_date;
        if (!dateStr) return false;
        const closeDate = new Date(dateStr);
        if (isNaN(closeDate.getTime())) return false;
        return closeDate.getMonth() === trendDate.getMonth() && 
               closeDate.getFullYear() === trendDate.getFullYear();
      });
      
      trends.push({
        month: monthName,
        closed: monthlyEscrows.length,
        volume: monthlyEscrows.reduce((sum, e) => sum + (e.purchasePrice || 0), 0)
      });
    }
    
    res.json({
      success: true,
      data: {
        overview: {
          activeEscrows: stats.active,
          pendingEscrows: stats.pending,
          closedThisMonth,
          totalVolume: stats.totalVolume,
          totalCommission: stats.totalCommission,
          avgDaysToClose: Math.round(avgDaysToClose)
        },
        performance: {
          closingRate: stats.closed > 0 ? Math.round((stats.closed / stats.total) * 100) : 0,
          avgListToSaleRatio: 98.5,
          clientSatisfaction: 4.8,
          onTimeClosingRate: 89
        },
        pipeline: {
          thisWeek,
          thisMonth: thisMonthPipeline,
          nextMonth,
          projectedRevenue
        },
        trends
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch escrow statistics'
      }
    });
  }
});

// GET /v1/escrows/:id - Get single escrow with full details
router.get('/:id', async (req, res) => {
  // Always use real database
  return SimpleEscrowController.getEscrowById(req, res);
});

// POST /v1/escrows - Create new escrow with sequential ID
router.post('/', (req, res) => {
  return SimpleEscrowController.createEscrow(req, res);
});

// PUT /v1/escrows/:id - Update escrow
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updatedEscrow = databaseService.update('escrows', id, req.body);
    
    if (!updatedEscrow) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Escrow not found'
        }
      });
    }
    
    res.json({
      success: true,
      data: updatedEscrow,
      message: 'Escrow updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update escrow'
      }
    });
  }
});

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
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const deleted = databaseService.delete('escrows', id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Escrow not found'
        }
      });
    }
    
    res.json({
      success: true,
      message: 'Escrow deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to delete escrow'
      }
    });
  }
});

module.exports = router;