const express = require('express');
const router = express.Router();
const databaseService = require('../services/database.service');
const EscrowController = require('../controllers/escrowController.updated');
const SimpleEscrowController = require('../controllers/escrowController.simple');

// Database routes (use simplified controller)
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
  lastActivity: escrow.lastModifiedDate,
  upcomingDeadlines: escrow.activityStats?.upcomingDeadlines || 0
});

// GET /v1/escrows - List all escrows from real database
router.get('/', async (req, res) => {
  // Check if we should use database or mock data
  const useDatabase = req.query.useDatabase !== 'false';
  
  if (useDatabase) {
    // Use real database with simplified controller
    return SimpleEscrowController.getAllEscrows(req, res);
  }
  
  // Fallback to mock data for backwards compatibility
  try {
    const { 
      page = 1, 
      limit = 20, 
      status,
      sort = 'createdDate',
      order = 'desc',
      search
    } = req.query;
    
    // Get all escrows from mock database
    let escrows = databaseService.getAll('escrows');
    
    // Apply search filter
    if (search) {
      escrows = escrows.filter(escrow => 
        escrow.propertyAddress?.toLowerCase().includes(search.toLowerCase()) ||
        escrow.escrowNumber?.toLowerCase().includes(search.toLowerCase()) ||
        escrow.mlsNumber?.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Apply status filter
    if (status) {
      escrows = escrows.filter(escrow => 
        escrow.escrowStatus?.toLowerCase() === status.toLowerCase()
      );
    }
    
    // Sort escrows
    escrows.sort((a, b) => {
      let aVal = a[sort] || '';
      let bVal = b[sort] || '';
      
      // Handle date sorting
      if (sort.includes('Date')) {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }
      
      // Handle numeric sorting
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return order === 'desc' ? bVal - aVal : aVal - bVal;
      }
      
      // Handle string sorting
      if (order === 'desc') {
        return bVal.toString().localeCompare(aVal.toString());
      }
      return aVal.toString().localeCompare(bVal.toString());
    });
    
    // Calculate pagination
    const total = escrows.length;
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedEscrows = escrows.slice(startIndex, endIndex);
    
    // Transform escrows for list view
    const transformedEscrows = paginatedEscrows.map(transformEscrowForList);
    
    res.json({
      success: true,
      data: {
        escrows: transformedEscrows,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch escrows'
      }
    });
  }
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
      const closeDate = new Date(e.actualCoeDate || e.scheduledCoeDate);
      return closeDate.getMonth() === thisMonth && closeDate.getFullYear() === thisYear;
    }).length;
    
    const avgDaysToClose = escrows
      .filter(e => e.escrowStatus === 'closed' && e.actualCoeDate)
      .reduce((sum, e) => {
        const openDate = new Date(e.escrowOpenDate);
        const closeDate = new Date(e.actualCoeDate);
        const days = Math.floor((closeDate - openDate) / (24 * 60 * 60 * 1000));
        return sum + days;
      }, 0) / (escrows.filter(e => e.escrowStatus === 'closed').length || 1);
    
    // Calculate pipeline
    const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const oneMonthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const twoMonthsFromNow = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
    
    const thisWeek = escrows.filter(e => {
      const closeDate = new Date(e.scheduledCoeDate);
      return e.escrowStatus === 'active' && closeDate <= oneWeekFromNow;
    }).length;
    
    const thisMonthPipeline = escrows.filter(e => {
      const closeDate = new Date(e.scheduledCoeDate);
      return e.escrowStatus === 'active' && closeDate <= oneMonthFromNow;
    }).length;
    
    const nextMonth = escrows.filter(e => {
      const closeDate = new Date(e.scheduledCoeDate);
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
        const closeDate = new Date(e.actualCoeDate || e.scheduledCoeDate);
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
  // Check if we should use database or mock data
  const useDatabase = req.query.useDatabase !== 'false';
  
  if (useDatabase) {
    // Use real database with simplified controller
    return SimpleEscrowController.getEscrowById(req, res);
  }
  
  // Fallback to mock data
  try {
    const { id } = req.params;
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
    
    res.json({
      success: true,
      data: escrow
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch escrow'
      }
    });
  }
});

// POST /v1/escrows - Create new escrow
router.post('/', (req, res) => {
  try {
    // Generate escrow number
    const escrowCount = databaseService.getAll('escrows').length;
    const escrowNumber = `${new Date().getFullYear()}-${String(escrowCount + 1).padStart(4, '0')}`;
    
    // Prepare new escrow data
    const newEscrowData = {
      ...req.body,
      escrowNumber,
      escrowStatus: req.body.escrowStatus || 'active',
      createdBy: 'jaydenmetz',
      assignedTo: 'jaydenmetz',
      // Set default values for required fields
      activityStats: {
        daysInEscrow: 0,
        daysToClose: 30,
        tasksCompletedToday: 0,
        upcomingDeadlines: 0,
        documentsUploaded: 0,
        communicationScore: 100
      },
      checklistProgress: {
        phase1: { completed: 0, total: 10, percentage: 0 },
        phase2: { completed: 0, total: 8, percentage: 0 },
        phase3: { completed: 0, total: 7, percentage: 0 },
        overall: { completed: 0, total: 25, percentage: 0 }
      },
      timeline: [{
        date: new Date().toISOString(),
        event: 'Escrow Created',
        type: 'milestone',
        icon: 'start',
        description: 'New escrow initiated'
      }]
    };
    
    const newEscrow = databaseService.create('escrows', newEscrowData);
    
    res.status(201).json({
      success: true,
      data: newEscrow,
      message: 'Escrow created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create escrow'
      }
    });
  }
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
    
    // Sort timeline by date (newest first)
    escrow.timeline.sort((a, b) => new Date(b.date) - new Date(a.date));
    
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