const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const databaseService = require('../services/database.service');

// Apply authentication to all routes
router.use(authenticateToken);

// Transform client for list view
const transformClientForList = (client) => ({
  id: client.id,
  name: `${client.firstName} ${client.lastName}`,
  avatar: client.avatar,
  email: client.email,
  phone: client.phone,
  clientType: client.clientType,
  stage: client.stage,
  source: client.source,
  lastContactDate: client.lastContactDate,
  nextFollowUpDate: client.nextFollowUpDate,
  activeEscrows: client.activeEscrows || 0,
  totalVolume: client.totalVolume || 0,
  tags: client.tags || []
});

// GET /v1/clients - List all clients with pagination and filters
router.get('/', (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      type,
      stage,
      source,
      sort = 'lastContactDate',
      order = 'desc',
      search
    } = req.query;

    let clients = databaseService.getAll('clients');

    // Apply filters
    if (type) {
      clients = clients.filter(c => c.clientType?.includes(type));
    }
    if (stage) {
      clients = clients.filter(c => c.stage === stage);
    }
    if (source) {
      clients = clients.filter(c => c.source === source);
    }
    if (search) {
      const searchLower = search.toLowerCase();
      clients = clients.filter(c => 
        c.firstName?.toLowerCase().includes(searchLower) ||
        c.lastName?.toLowerCase().includes(searchLower) ||
        c.email?.toLowerCase().includes(searchLower) ||
        c.phone?.includes(search) ||
        c.notes?.toLowerCase().includes(searchLower)
      );
    }

    // Sort clients
    clients.sort((a, b) => {
      let aVal = a[sort];
      let bVal = b[sort];
      
      // Handle date sorting
      if (sort.includes('Date')) {
        aVal = new Date(aVal || 0).getTime();
        bVal = new Date(bVal || 0).getTime();
      }
      
      // Handle numeric sorting
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return order === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      // Handle string sorting
      const aStr = String(aVal || '');
      const bStr = String(bVal || '');
      return order === 'asc' 
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedClients = clients.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        clients: paginatedClients.map(transformClientForList),
        pagination: {
          total: clients.length,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(clients.length / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch clients'
      }
    });
  }
});

// GET /v1/clients/stats - Get client statistics
router.get('/stats', (req, res) => {
  try {
    const stats = databaseService.getStats('clients');
    const clients = databaseService.getAll('clients');
    
    // Calculate additional stats
    const needsFollowUp = clients.filter(c => {
      const followUp = new Date(c.nextFollowUpDate);
      return followUp <= new Date();
    }).length;

    const recentContacts = clients.filter(c => {
      const contact = new Date(c.lastContactDate);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return contact >= weekAgo;
    }).length;

    const bySource = {};
    clients.forEach(c => {
      bySource[c.source] = (bySource[c.source] || 0) + 1;
    });

    res.json({
      success: true,
      data: {
        overview: {
          ...stats,
          needsFollowUp,
          recentContacts,
          avgTransactionValue: stats.totalVolume / (stats.total || 1)
        },
        byType: {
          buyers: stats.buyers,
          sellers: stats.sellers,
          both: clients.filter(c => c.clientType === 'Buyer & Seller').length,
          pastClients: clients.filter(c => c.clientType === 'Past Client').length,
          prospects: clients.filter(c => c.clientType === 'Prospect').length
        },
        bySource,
        byStage: {
          new: clients.filter(c => c.stage === 'New').length,
          qualified: clients.filter(c => c.stage === 'Qualified').length,
          showing: clients.filter(c => c.stage === 'Showing').length,
          offer: clients.filter(c => c.stage === 'Offer').length,
          contract: clients.filter(c => c.stage === 'Contract').length,
          closed: clients.filter(c => c.stage === 'Closed').length
        }
      }
    });
  } catch (error) {
    console.error('Error fetching client stats:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch client statistics'
      }
    });
  }
});

// GET /v1/clients/:id - Get single client details
router.get('/:id', (req, res) => {
  try {
    const client = databaseService.getById('clients', req.params.id);
    
    if (!client) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Client not found'
        }
      });
    }

    // Get related data
    const escrows = databaseService.getAll('escrows').filter(e => 
      e.clients?.some(c => c.id === client.id)
    );
    
    const appointments = databaseService.getAll('appointments').filter(a => 
      a.clientId === client.id
    );

    // Add related data
    client.recentEscrows = escrows.slice(0, 5).map(e => ({
      id: e.id,
      escrowNumber: e.escrowNumber,
      propertyAddress: e.propertyAddress,
      status: e.escrowStatus,
      purchasePrice: e.purchasePrice
    }));

    client.upcomingAppointments = appointments
      .filter(a => new Date(a.startDate) >= new Date())
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
      .slice(0, 5);

    client.activitySummary = {
      totalEscrows: escrows.length,
      activeEscrows: escrows.filter(e => e.escrowStatus === 'active').length,
      totalAppointments: appointments.length,
      completedAppointments: appointments.filter(a => a.status === 'Completed').length,
      daysSinceLastContact: Math.floor(
        (Date.now() - new Date(client.lastContactDate).getTime()) / (24 * 60 * 60 * 1000)
      )
    };

    res.json({
      success: true,
      data: client
    });
  } catch (error) {
    console.error('Error fetching client:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch client details'
      }
    });
  }
});

// POST /v1/clients - Create new client
router.post('/', (req, res) => {
  try {
    const newClient = databaseService.create('clients', {
      ...req.body,
      stage: req.body.stage || 'New',
      activeEscrows: 0,
      closedTransactions: 0,
      totalVolume: 0,
      lastContactDate: new Date().toISOString(),
      createdBy: req.user.username
    });

    res.status(201).json({
      success: true,
      data: newClient
    });
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to create client'
      }
    });
  }
});

// PUT /v1/clients/:id - Update client
router.put('/:id', (req, res) => {
  try {
    const updated = databaseService.update('clients', req.params.id, req.body);
    
    if (!updated) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Client not found'
        }
      });
    }

    res.json({
      success: true,
      data: updated
    });
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to update client'
      }
    });
  }
});

// POST /v1/clients/:id/notes - Add note to client
router.post('/:id/notes', (req, res) => {
  try {
    const client = databaseService.getById('clients', req.params.id);
    
    if (!client) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Client not found'
        }
      });
    }

    const { note, type = 'general' } = req.body;
    const timestamp = new Date().toISOString();
    
    const newNote = `[${timestamp}] ${type.toUpperCase()}: ${note}\n`;
    const updatedNotes = (client.notes || '') + newNote;
    
    const updated = databaseService.update('clients', req.params.id, {
      notes: updatedNotes,
      lastContactDate: timestamp
    });

    res.json({
      success: true,
      data: {
        message: 'Note added successfully',
        note: newNote
      }
    });
  } catch (error) {
    console.error('Error adding note:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to add note'
      }
    });
  }
});

// POST /v1/clients/:id/contact - Log contact
router.post('/:id/contact', (req, res) => {
  try {
    const client = databaseService.getById('clients', req.params.id);
    
    if (!client) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Client not found'
        }
      });
    }

    const { method, notes, nextFollowUp } = req.body;
    const timestamp = new Date().toISOString();
    
    const updates = {
      lastContactDate: timestamp,
      contactAttempts: (client.contactAttempts || 0) + 1
    };
    
    if (nextFollowUp) {
      updates.nextFollowUpDate = nextFollowUp;
    }
    
    if (notes) {
      const contactNote = `[${timestamp}] CONTACT via ${method}: ${notes}\n`;
      updates.notes = (client.notes || '') + contactNote;
    }
    
    const updated = databaseService.update('clients', req.params.id, updates);

    res.json({
      success: true,
      data: {
        message: 'Contact logged successfully',
        lastContactDate: timestamp,
        totalContacts: updates.contactAttempts
      }
    });
  } catch (error) {
    console.error('Error logging contact:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to log contact'
      }
    });
  }
});

// DELETE /v1/clients/:id - Delete client
router.delete('/:id', (req, res) => {
  try {
    const deleted = databaseService.delete('clients', req.params.id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Client not found'
        }
      });
    }

    res.json({
      success: true,
      data: {
        message: 'Client deleted successfully'
      }
    });
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to delete client'
      }
    });
  }
});

module.exports = router;