const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const databaseService = require('../services/database.service');

// Apply authentication to all routes
router.use(authenticateToken);

// Transform lead for list view
const transformLeadForList = (lead) => ({
  id: lead.id,
  name: `${lead.firstName} ${lead.lastName}`,
  email: lead.email,
  phone: lead.phone,
  source: lead.source,
  status: lead.status,
  interest: lead.interest,
  budget: lead.budget,
  timeframe: lead.timeframe,
  leadScore: lead.leadScore,
  firstContactDate: lead.firstContactDate,
  lastContactDate: lead.lastContactDate,
  contactAttempts: lead.contactAttempts,
  tags: lead.tags || []
});

// GET /v1/leads - List all leads with pagination and filters
router.get('/', (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      source,
      status,
      interest,
      minScore,
      sort = 'createdDate',
      order = 'desc',
      search
    } = req.query;

    let leads = databaseService.getAll('leads');

    // Apply filters
    if (source) {
      leads = leads.filter(l => l.source === source);
    }
    if (status) {
      leads = leads.filter(l => l.status === status);
    }
    if (interest) {
      leads = leads.filter(l => l.interest === interest);
    }
    if (minScore) {
      leads = leads.filter(l => l.leadScore >= parseFloat(minScore));
    }
    if (search) {
      const searchLower = search.toLowerCase();
      leads = leads.filter(l => 
        l.firstName?.toLowerCase().includes(searchLower) ||
        l.lastName?.toLowerCase().includes(searchLower) ||
        l.email?.toLowerCase().includes(searchLower) ||
        l.phone?.includes(search) ||
        l.notes?.toLowerCase().includes(searchLower)
      );
    }

    // Sort leads
    leads.sort((a, b) => {
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
    const paginatedLeads = leads.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        leads: paginatedLeads.map(transformLeadForList),
        pagination: {
          total: leads.length,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(leads.length / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching leads:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch leads'
      }
    });
  }
});

// GET /v1/leads/stats - Get lead statistics
router.get('/stats', (req, res) => {
  try {
    const stats = databaseService.getStats('leads');
    const leads = databaseService.getAll('leads');
    
    // Calculate additional stats
    const thisWeek = leads.filter(l => {
      const created = new Date(l.createdDate);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return created >= weekAgo;
    }).length;

    const hotLeads = leads.filter(l => l.leadScore >= 80).length;
    const warmLeads = leads.filter(l => l.leadScore >= 60 && l.leadScore < 80).length;
    const coldLeads = leads.filter(l => l.leadScore < 60).length;

    // Source performance
    const sourcePerformance = {};
    const sources = ['Zillow', 'Realtor.com', 'Website', 'Facebook', 'Instagram', 'Referral', 'Open House'];
    
    sources.forEach(source => {
      const sourceLeads = leads.filter(l => l.source === source);
      const converted = sourceLeads.filter(l => l.status === 'Converted').length;
      sourcePerformance[source] = {
        total: sourceLeads.length,
        converted,
        conversionRate: sourceLeads.length > 0 
          ? Math.round((converted / sourceLeads.length) * 100) 
          : 0
      };
    });

    res.json({
      success: true,
      data: {
        overview: {
          ...stats,
          thisWeek,
          hotLeads,
          warmLeads,
          coldLeads,
          avgLeadScore: Math.round(
            leads.reduce((sum, l) => sum + l.leadScore, 0) / (leads.length || 1)
          )
        },
        byStatus: {
          new: stats.new,
          contacted: stats.contacted,
          qualified: stats.qualified,
          nurturing: leads.filter(l => l.status === 'Nurturing').length,
          converted: stats.converted,
          lost: leads.filter(l => l.status === 'Lost').length
        },
        byInterest: {
          buying: leads.filter(l => l.interest === 'Buying').length,
          selling: leads.filter(l => l.interest === 'Selling').length,
          both: leads.filter(l => l.interest === 'Both').length,
          renting: leads.filter(l => l.interest === 'Renting').length,
          investing: leads.filter(l => l.interest === 'Investing').length
        },
        sourcePerformance,
        responseTime: {
          within1Hour: leads.filter(l => {
            const created = new Date(l.createdDate);
            const firstContact = new Date(l.firstContactDate);
            return (firstContact - created) <= 60 * 60 * 1000;
          }).length,
          within24Hours: leads.filter(l => {
            const created = new Date(l.createdDate);
            const firstContact = new Date(l.firstContactDate);
            return (firstContact - created) <= 24 * 60 * 60 * 1000;
          }).length
        }
      }
    });
  } catch (error) {
    console.error('Error fetching lead stats:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch lead statistics'
      }
    });
  }
});

// GET /v1/leads/:id - Get single lead details
router.get('/:id', (req, res) => {
  try {
    const lead = databaseService.getById('leads', req.params.id);
    
    if (!lead) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Lead not found'
        }
      });
    }

    // Calculate engagement metrics
    const daysSinceCreated = Math.floor(
      (Date.now() - new Date(lead.createdDate).getTime()) / (24 * 60 * 60 * 1000)
    );
    
    const daysSinceLastContact = lead.lastContactDate ? Math.floor(
      (Date.now() - new Date(lead.lastContactDate).getTime()) / (24 * 60 * 60 * 1000)
    ) : null;

    lead.engagement = {
      daysSinceCreated,
      daysSinceLastContact,
      responseRate: lead.contactAttempts > 0 ? 
        Math.round((1 / lead.contactAttempts) * 100) : 0,
      engagementScore: lead.leadScore
    };

    // Get property if specified
    if (lead.propertyId) {
      lead.propertyInterest = databaseService.getById('listings', lead.propertyId);
    }

    // Scoring breakdown
    lead.scoreBreakdown = {
      sourceScore: {
        'Referral': 30,
        'Website': 25,
        'Zillow': 20,
        'Realtor.com': 20,
        'Facebook': 15,
        'Instagram': 15,
        'Open House': 25,
        'Cold Call': 5
      }[lead.source] || 10,
      
      timeframeScore: {
        'Immediate': 30,
        '1-3 months': 20,
        '3-6 months': 10,
        '6+ months': 5
      }[lead.timeframe] || 5,
      
      preApprovedScore: lead.preApproved ? 20 : 0,
      
      engagementScore: Math.min(20, lead.contactAttempts * 4)
    };

    res.json({
      success: true,
      data: lead
    });
  } catch (error) {
    console.error('Error fetching lead:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch lead details'
      }
    });
  }
});

// POST /v1/leads - Create new lead
router.post('/', (req, res) => {
  try {
    // Calculate initial lead score
    let leadScore = 50; // Base score
    
    if (req.body.source === 'Referral') leadScore += 20;
    else if (req.body.source === 'Website') leadScore += 15;
    else if (req.body.source === 'Open House') leadScore += 15;
    
    if (req.body.timeframe === 'Immediate') leadScore += 20;
    else if (req.body.timeframe === '1-3 months') leadScore += 10;
    
    if (req.body.preApproved) leadScore += 15;

    const newLead = databaseService.create('leads', {
      ...req.body,
      status: req.body.status || 'New',
      leadScore,
      contactAttempts: 0,
      firstContactDate: null,
      lastContactDate: null,
      createdBy: req.user.username
    });

    res.status(201).json({
      success: true,
      data: newLead
    });
  } catch (error) {
    console.error('Error creating lead:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to create lead'
      }
    });
  }
});

// PUT /v1/leads/:id - Update lead
router.put('/:id', (req, res) => {
  try {
    const updated = databaseService.update('leads', req.params.id, req.body);
    
    if (!updated) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Lead not found'
        }
      });
    }

    res.json({
      success: true,
      data: updated
    });
  } catch (error) {
    console.error('Error updating lead:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to update lead'
      }
    });
  }
});

// POST /v1/leads/:id/contact - Log contact attempt
router.post('/:id/contact', (req, res) => {
  try {
    const lead = databaseService.getById('leads', req.params.id);
    
    if (!lead) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Lead not found'
        }
      });
    }

    const { method, outcome, notes, nextFollowUp } = req.body;
    const timestamp = new Date().toISOString();
    
    const updates = {
      lastContactDate: timestamp,
      contactAttempts: (lead.contactAttempts || 0) + 1,
      status: outcome === 'connected' ? 'Contacted' : lead.status
    };
    
    if (!lead.firstContactDate) {
      updates.firstContactDate = timestamp;
    }
    
    if (notes) {
      const contactLog = `[${timestamp}] ${method.toUpperCase()} - ${outcome}: ${notes}\n`;
      updates.notes = (lead.notes || '') + contactLog;
    }
    
    // Update lead score based on engagement
    if (outcome === 'connected') {
      updates.leadScore = Math.min(100, (lead.leadScore || 50) + 10);
    } else if (outcome === 'no_answer') {
      updates.leadScore = Math.max(0, (lead.leadScore || 50) - 2);
    }
    
    const updated = databaseService.update('leads', req.params.id, updates);

    res.json({
      success: true,
      data: {
        message: 'Contact logged successfully',
        contactAttempts: updates.contactAttempts,
        newLeadScore: updates.leadScore || lead.leadScore
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

// POST /v1/leads/:id/convert - Convert lead to client
router.post('/:id/convert', (req, res) => {
  try {
    const lead = databaseService.getById('leads', req.params.id);
    
    if (!lead) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Lead not found'
        }
      });
    }

    // Create client from lead
    const client = databaseService.create('clients', {
      firstName: lead.firstName,
      lastName: lead.lastName,
      email: lead.email,
      phone: lead.phone,
      clientType: lead.interest === 'Buying' ? 'Buyer' : 
                  lead.interest === 'Selling' ? 'Seller' : 
                  'Buyer & Seller',
      stage: 'New',
      source: lead.source,
      notes: `Converted from lead ${lead.id}\n${lead.notes || ''}`,
      priceRangeMin: lead.budget ? parseInt(lead.budget.split('-')[0].replace(/\D/g, '')) * 1000 : null,
      priceRangeMax: lead.budget ? parseInt(lead.budget.split('-')[1]?.replace(/\D/g, '') || 
                     lead.budget.split('-')[0].replace(/\D/g, '')) * 1000 : null,
      tags: [...(lead.tags || []), 'Converted Lead'],
      createdBy: req.user.username
    });

    // Update lead status
    databaseService.update('leads', req.params.id, {
      status: 'Converted',
      convertedDate: new Date().toISOString(),
      convertedToClientId: client.id
    });

    res.json({
      success: true,
      data: {
        message: 'Lead converted to client successfully',
        clientId: client.id,
        client
      }
    });
  } catch (error) {
    console.error('Error converting lead:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to convert lead'
      }
    });
  }
});

// DELETE /v1/leads/:id - Delete lead
router.delete('/:id', (req, res) => {
  try {
    const deleted = databaseService.delete('leads', req.params.id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Lead not found'
        }
      });
    }

    res.json({
      success: true,
      data: {
        message: 'Lead deleted successfully'
      }
    });
  } catch (error) {
    console.error('Error deleting lead:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to delete lead'
      }
    });
  }
});

module.exports = router;