const Client = require('../models/Client.mock');
const logger = require('../utils/logger');
const { validationResult } = require('express-validator');
const emailService = require('../services/email.service');
const { validateEmail, validatePhone } = require('../utils/validators');
const { pool } = require('../config/database');

// GET /api/v1/clients
exports.getAllClients = async (req, res) => {
  try {
    const {
      type,
      status = 'Active',
      search,
      page = 1,
      limit = 20,
      sort = 'createdAt',
      order = 'desc',
      tags,
      source,
      lastContactDays,
      transactionCount,
      minValue,
      maxValue
    } = req.query;

    // Build filter object
    const filters = {};
    
    // Client type filter (Buyer, Seller, Both, Past Client)
    if (type) {
      const validTypes = ['Buyer', 'Seller', 'Both', 'Past Client'];
      if (validTypes.includes(type)) {
        filters.clientType = type;
      }
    }
    
    // Status filter (Active, Inactive, Archived)
    if (status) {
      const validStatuses = ['Active', 'Inactive', 'Archived'];
      if (validStatuses.includes(status)) {
        filters.status = status;
      }
    }
    
    // Search by name, email, phone
    if (search) {
      filters.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search.replace(/\D/g, ''), $options: 'i' } },
        { $text: { $search: search } }
      ];
    }
    
    // Tag filter
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : tags.split(',');
      filters.tags = { $in: tagArray };
    }
    
    // Source filter
    if (source) {
      filters.source = source;
    }
    
    // Last contact filter
    if (lastContactDays) {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(lastContactDays));
      filters.lastContactDate = { $lte: daysAgo };
    }
    
    // Transaction count filter
    if (transactionCount) {
      filters.transactionCount = { $gte: parseInt(transactionCount) };
    }
    
    // Value range filters
    if (minValue) {
      filters.totalTransactionValue = { ...filters.totalTransactionValue, $gte: parseFloat(minValue) };
    }
    if (maxValue) {
      filters.totalTransactionValue = { ...filters.totalTransactionValue, $lte: parseFloat(maxValue) };
    }

    // Sorting options
    const sortOptions = {};
    const validSortFields = ['name', 'createdAt', 'lastContactDate', 'totalTransactionValue', 'transactionCount'];
    if (validSortFields.includes(sort)) {
      if (sort === 'name') {
        sortOptions.lastName = order === 'desc' ? -1 : 1;
        sortOptions.firstName = order === 'desc' ? -1 : 1;
      } else {
        sortOptions[sort] = order === 'desc' ? -1 : 1;
      }
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Execute query
    const [clients, totalCount] = await Promise.all([
      Client.find(filters)
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .select('-__v'),
      Client.countDocuments(filters)
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / parseInt(limit));
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;

    res.json({
      success: true,
      data: {
        clients,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalCount,
          limit: parseInt(limit),
          hasNextPage,
          hasPrevPage
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching clients:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch clients',
        details: error.message
      }
    });
  }
};

// GET /api/v1/clients/:id
exports.getClientById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get client with all related data
    const [client, transactions, communications, properties, notes] = await Promise.all([
      Client.findById(id).select('-__v'),
      Client.getTransactionHistory(id),
      Client.getCommunicationLogs(id),
      Client.getRelatedProperties(id),
      Client.getNotes(id)
    ]);
    
    if (!client) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Client not found'
        }
      });
    }

    // Calculate additional stats
    const stats = {
      totalTransactions: transactions.length,
      totalValue: transactions.reduce((sum, t) => sum + (t.value || 0), 0),
      averageTransactionValue: transactions.length > 0 ? 
        transactions.reduce((sum, t) => sum + (t.value || 0), 0) / transactions.length : 0,
      lastContactDate: communications.length > 0 ? communications[0].date : null,
      communicationFrequency: Client.calculateCommunicationFrequency(communications),
      referralsGenerated: client.referrals?.length || 0
    };

    res.json({
      success: true,
      data: {
        ...client.toObject(),
        transactionHistory: transactions,
        communicationLogs: communications,
        relatedProperties: properties,
        notes,
        stats
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching client:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch client',
        details: error.message
      }
    });
  }
};

// POST /api/v1/clients
exports.createClient = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: errors.array()
        }
      });
    }

    const {
      firstName,
      lastName,
      email,
      phone,
      clientType = 'Buyer',
      status = 'Active',
      source = 'Direct',
      tags = [],
      preferences = {},
      address,
      birthday,
      anniversary,
      occupation,
      referredBy,
      sendWelcomeEmail = true
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: 'First name and last name are required'
        }
      });
    }

    if (!email && !phone) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_CONTACT',
          message: 'Either email or phone number is required'
        }
      });
    }

    // Validate email format
    if (email && !validateEmail(email)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_EMAIL',
          message: 'Invalid email format'
        }
      });
    }

    // Validate phone format
    if (phone && !validatePhone(phone)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PHONE',
          message: 'Invalid phone number format'
        }
      });
    }

    // Check for duplicates
    const duplicateQuery = [];
    if (email) duplicateQuery.push({ email: email.toLowerCase() });
    if (phone) duplicateQuery.push({ phone: phone.replace(/\D/g, '') });
    
    const existingClient = await Client.findOne({ $or: duplicateQuery });
    if (existingClient) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'DUPLICATE_CLIENT',
          message: 'Client with this email or phone already exists',
          existingClientId: existingClient._id
        }
      });
    }

    // Create client object
    const clientData = {
      firstName,
      lastName,
      email: email?.toLowerCase(),
      phone: phone?.replace(/\D/g, ''),
      clientType,
      status,
      source,
      tags,
      preferences: {
        communicationMethod: preferences.communicationMethod || 'Email',
        contactFrequency: preferences.contactFrequency || 'Monthly',
        propertyTypes: preferences.propertyTypes || [],
        priceRange: preferences.priceRange || {},
        locations: preferences.locations || [],
        ...preferences
      },
      address,
      birthday: birthday ? new Date(birthday) : undefined,
      anniversary: anniversary ? new Date(anniversary) : undefined,
      occupation,
      referredBy,
      timeline: [{
        date: new Date(),
        event: 'Client Created',
        description: `${firstName} ${lastName} added to CRM`,
        type: 'system'
      }],
      createdAt: new Date(),
      updatedAt: new Date(),
      lastContactDate: new Date()
    };

    // Create client
    const client = await Client.create(clientData);

    // Send welcome email if requested and email exists
    if (sendWelcomeEmail && email) {
      try {
        await emailService.sendWelcomeEmail({
          to: email,
          name: `${firstName} ${lastName}`,
          clientType
        });
        
        // Log email communication
        await Client.addCommunicationLog(client._id, {
          type: 'Email',
          direction: 'Outbound',
          subject: 'Welcome to Our Real Estate Services',
          notes: 'Automated welcome email sent',
          date: new Date()
        });
      } catch (emailError) {
        logger.error('Failed to send welcome email:', emailError);
      }
    }

    // Emit real-time update
    const io = req.app.get('io');
    io.to('clients').emit('client:created', client);

    res.status(201).json({
      success: true,
      data: client,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error creating client:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CREATE_ERROR',
        message: 'Failed to create client',
        details: error.message
      }
    });
  }
};

// PUT /api/v1/clients/:id
exports.updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Validate email if provided
    if (updates.email && !validateEmail(updates.email)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_EMAIL',
          message: 'Invalid email format'
        }
      });
    }

    // Validate phone if provided
    if (updates.phone && !validatePhone(updates.phone)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PHONE',
          message: 'Invalid phone number format'
        }
      });
    }

    // Check for duplicates if email or phone is being updated
    if (updates.email || updates.phone) {
      const duplicateQuery = [];
      if (updates.email) duplicateQuery.push({ email: updates.email.toLowerCase(), _id: { $ne: id } });
      if (updates.phone) duplicateQuery.push({ phone: updates.phone.replace(/\D/g, ''), _id: { $ne: id } });
      
      const existingClient = await Client.findOne({ $or: duplicateQuery });
      if (existingClient) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'DUPLICATE_CLIENT',
            message: 'Another client with this email or phone already exists'
          }
        });
      }
    }

    // Get current client for comparison
    const currentClient = await Client.findById(id);
    if (!currentClient) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Client not found'
        }
      });
    }

    // Track preference changes
    const preferenceChanges = [];
    if (updates.preferences) {
      Object.keys(updates.preferences).forEach(key => {
        if (currentClient.preferences[key] !== updates.preferences[key]) {
          preferenceChanges.push({
            field: key,
            oldValue: currentClient.preferences[key],
            newValue: updates.preferences[key]
          });
        }
      });
    }

    // Normalize data
    if (updates.email) updates.email = updates.email.toLowerCase();
    if (updates.phone) updates.phone = updates.phone.replace(/\D/g, '');
    
    // Update timestamp
    updates.updatedAt = new Date();

    // Perform update
    const updatedClient = await Client.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    // Add timeline entry for significant changes
    if (preferenceChanges.length > 0) {
      await Client.addTimelineEntry(id, {
        event: 'Preferences Updated',
        description: `Updated ${preferenceChanges.length} preference(s)`,
        details: preferenceChanges,
        type: 'update'
      });
    }

    // Emit real-time update
    const io = req.app.get('io');
    io.to('clients').emit('client:updated', updatedClient);

    res.json({
      success: true,
      data: updatedClient,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error updating client:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_ERROR',
        message: 'Failed to update client',
        details: error.message
      }
    });
  }
};

// Archive client - soft delete by setting status to 'Archived'
exports.archiveClient = async (req, res) => {
  try {
    const { id } = req.params;

    // Archive the client
    const archivedClient = await Client.findByIdAndUpdate(
      id,
      {
        status: 'Archived',
        clientStatus: 'Archived',
        archivedAt: new Date(),
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!archivedClient) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Client not found'
        }
      });
    }

    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.to('clients').emit('client:archived', { id });
    }

    res.json({
      success: true,
      data: {
        id: archivedClient._id || archivedClient.id,
        firstName: archivedClient.firstName,
        lastName: archivedClient.lastName,
        status: archivedClient.status || archivedClient.clientStatus,
        archivedAt: archivedClient.archivedAt
      },
      message: 'Client archived successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error archiving client:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'ARCHIVE_ERROR',
        message: 'Failed to archive client'
      }
    });
  }
};

// DELETE /api/v1/clients/:id
exports.deleteClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { archive = false } = req.query;

    if (archive) {
      // Archive instead of delete
      const archivedClient = await Client.findByIdAndUpdate(
        id,
        { 
          status: 'Archived',
          archivedAt: new Date(),
          updatedAt: new Date()
        },
        { new: true }
      );

      if (!archivedClient) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Client not found'
          }
        });
      }

      // Emit real-time update
      const io = req.app.get('io');
      io.to('clients').emit('client:archived', { id });

      res.json({
        success: true,
        data: archivedClient,
        message: 'Client archived successfully',
        timestamp: new Date().toISOString()
      });
    } else {
      // Permanent delete
      const deletedClient = await Client.findByIdAndDelete(id);
      
      if (!deletedClient) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Client not found'
          }
        });
      }

      // Emit real-time update
      const io = req.app.get('io');
      io.to('clients').emit('client:deleted', { id });

      res.json({
        success: true,
        data: deletedClient,
        message: 'Client permanently deleted',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    logger.error('Error deleting client:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_ERROR',
        message: 'Failed to delete client',
        details: error.message
      }
    });
  }
};

// POST /api/v1/clients/:id/communications
exports.addCommunicationLog = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      type,
      direction = 'Inbound',
      subject,
      notes,
      outcome,
      nextFollowUp,
      attachments = []
    } = req.body;

    // Validate required fields
    if (!type || !notes) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: 'Type and notes are required'
        }
      });
    }

    const validTypes = ['Email', 'Phone', 'Text', 'Meeting', 'Video Call', 'Other'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_TYPE',
          message: 'Invalid communication type'
        }
      });
    }

    const communication = await Client.addCommunicationLog(id, {
      type,
      direction,
      subject,
      notes,
      outcome,
      nextFollowUp: nextFollowUp ? new Date(nextFollowUp) : null,
      attachments,
      date: new Date(),
      createdBy: req.user?.id || 'system'
    });

    if (!communication) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Client not found'
        }
      });
    }

    // Update last contact date
    await Client.findByIdAndUpdate(id, {
      lastContactDate: new Date(),
      updatedAt: new Date()
    });

    // Emit real-time update
    const io = req.app.get('io');
    io.to('clients').emit('client:communication', { clientId: id, communication });

    res.status(201).json({
      success: true,
      data: communication,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error adding communication log:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'COMMUNICATION_ERROR',
        message: 'Failed to add communication log',
        details: error.message
      }
    });
  }
};

// PATCH /api/v1/clients/:id/preferences
exports.updatePreferences = async (req, res) => {
  try {
    const { id } = req.params;
    const preferences = req.body;

    const client = await Client.findById(id);
    if (!client) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Client not found'
        }
      });
    }

    // Merge with existing preferences
    const updatedPreferences = {
      ...client.preferences,
      ...preferences,
      updatedAt: new Date()
    };

    const updatedClient = await Client.findByIdAndUpdate(
      id,
      { 
        preferences: updatedPreferences,
        updatedAt: new Date()
      },
      { new: true }
    );

    // Add timeline entry
    await Client.addTimelineEntry(id, {
      event: 'Preferences Updated',
      description: 'Client preferences updated',
      type: 'update'
    });

    res.json({
      success: true,
      data: updatedClient,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error updating preferences:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_ERROR',
        message: 'Failed to update preferences',
        details: error.message
      }
    });
  }
};

// POST /api/v1/clients/:id/properties
exports.linkToProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const { propertyId, relationshipType, notes } = req.body;

    if (!propertyId || !relationshipType) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: 'Property ID and relationship type are required'
        }
      });
    }

    const validRelationships = ['Interested', 'Viewed', 'Made Offer', 'Under Contract', 'Purchased', 'Sold', 'Rejected'];
    if (!validRelationships.includes(relationshipType)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_TYPE',
          message: 'Invalid relationship type'
        }
      });
    }

    const relationship = await Client.linkToProperty(id, {
      propertyId,
      relationshipType,
      notes,
      linkedDate: new Date()
    });

    if (!relationship) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Client not found'
        }
      });
    }

    res.status(201).json({
      success: true,
      data: relationship,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error linking property:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'LINK_ERROR',
        message: 'Failed to link property',
        details: error.message
      }
    });
  }
};

// POST /api/v1/clients/batch-delete
exports.batchDeleteClients = async (req, res) => {
  const client = await pool.connect();
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: 'IDs must be a non-empty array'
        }
      });
    }

    await client.query('BEGIN');

    // Check which clients exist and are archived
    const checkQuery = `
      SELECT cl.id
      FROM clients cl
      JOIN contacts co ON cl.contact_id = co.id
      WHERE cl.id = ANY($1) AND cl.status = 'archived'
    `;
    const existResult = await client.query(checkQuery, [ids]);

    if (existResult.rows.length === 0) {
      await client.query('COMMIT');
      return res.json({
        success: true,
        message: 'No clients found to delete',
        deletedCount: 0,
        deletedIds: []
      });
    }

    const existingIds = existResult.rows.map(row => row.id);

    // Delete clients
    const deleteQuery = `
      DELETE FROM clients
      WHERE id = ANY($1)
      RETURNING id
    `;
    const deleteResult = await client.query(deleteQuery, [existingIds]);

    await client.query('COMMIT');

    res.json({
      success: true,
      message: `Successfully deleted ${deleteResult.rowCount} clients`,
      deletedCount: deleteResult.rowCount,
      deletedIds: deleteResult.rows.map(row => row.id)
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Batch delete clients error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_ERROR',
        message: 'Failed to delete clients',
        details: error.message
      }
    });
  } finally {
    client.release();
  }
};

// POST /api/v1/clients/:id/notes
exports.addNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, category = 'General', isPrivate = false } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_CONTENT',
          message: 'Note content is required'
        }
      });
    }

    const note = await Client.addNote(id, {
      content,
      category,
      isPrivate,
      createdBy: req.user?.id || 'system',
      createdAt: new Date()
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Client not found'
        }
      });
    }

    res.status(201).json({
      success: true,
      data: note,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error adding note:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'NOTE_ERROR',
        message: 'Failed to add note',
        details: error.message
      }
    });
  }
};

// POST /api/v1/clients/:id/convert-to-lead
exports.convertToLead = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, leadScore = 50 } = req.body;

    const client = await Client.findById(id);
    if (!client) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Client not found'
        }
      });
    }

    // Create lead from client data
    const leadData = {
      firstName: client.firstName,
      lastName: client.lastName,
      email: client.email,
      phone: client.phone,
      source: 'Client Conversion',
      status: 'New',
      score: leadScore,
      preferences: client.preferences,
      notes: [{
        content: `Converted from client. Reason: ${reason || 'Client became inactive'}`,
        date: new Date()
      }],
      previousClientId: id
    };

    // Here you would typically create a lead in the Lead model
    // const lead = await Lead.create(leadData);

    // Update client status
    const updatedClient = await Client.findByIdAndUpdate(
      id,
      {
        status: 'Converted',
        convertedToLeadAt: new Date(),
        updatedAt: new Date()
      },
      { new: true }
    );

    res.json({
      success: true,
      data: {
        client: updatedClient,
        // lead: lead
      },
      message: 'Client successfully converted to lead',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error converting client to lead:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CONVERSION_ERROR',
        message: 'Failed to convert client to lead',
        details: error.message
      }
    });
  }
};

// GET /api/v1/clients/:id/stats
exports.getClientStats = async (req, res) => {
  try {
    const { id } = req.params;

    const client = await Client.findById(id);
    if (!client) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Client not found'
        }
      });
    }

    // Get comprehensive stats
    const [
      transactions,
      communications,
      properties,
      referrals
    ] = await Promise.all([
      Client.getTransactionHistory(id),
      Client.getCommunicationLogs(id),
      Client.getRelatedProperties(id),
      Client.getReferrals(id)
    ]);

    // Calculate stats
    const stats = {
      totalLifetimeValue: transactions.reduce((sum, t) => sum + (t.value || 0), 0),
      numberOfTransactions: transactions.length,
      averageTransactionValue: transactions.length > 0 
        ? transactions.reduce((sum, t) => sum + (t.value || 0), 0) / transactions.length 
        : 0,
      referralsGenerated: referrals.length,
      referralConversionRate: referrals.length > 0
        ? (referrals.filter(r => r.converted).length / referrals.length) * 100
        : 0,
      communicationFrequency: {
        total: communications.length,
        monthly: Client.calculateMonthlyFrequency(communications),
        lastContact: communications.length > 0 ? communications[0].date : null,
        preferredMethod: Client.getMostUsedCommunicationMethod(communications)
      },
      propertyMetrics: {
        viewed: properties.filter(p => p.relationshipType === 'Viewed').length,
        interested: properties.filter(p => p.relationshipType === 'Interested').length,
        offers: properties.filter(p => p.relationshipType === 'Made Offer').length,
        purchased: properties.filter(p => p.relationshipType === 'Purchased').length,
        sold: properties.filter(p => p.relationshipType === 'Sold').length
      },
      engagement: {
        score: Client.calculateEngagementScore(client, communications, transactions),
        level: Client.getEngagementLevel(client, communications, transactions)
      },
      timeline: {
        firstContact: client.createdAt,
        lastActivity: client.updatedAt,
        totalDuration: Math.floor((new Date() - new Date(client.createdAt)) / (1000 * 60 * 60 * 24)) // days
      }
    };

    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching client stats:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'STATS_ERROR',
        message: 'Failed to fetch client statistics',
        details: error.message
      }
    });
  }
};

// POST /api/v1/clients/merge
exports.mergeClients = async (req, res) => {
  try {
    const { primaryClientId, secondaryClientId, mergeStrategy = 'primary' } = req.body;

    if (!primaryClientId || !secondaryClientId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_IDS',
          message: 'Both primary and secondary client IDs are required'
        }
      });
    }

    if (primaryClientId === secondaryClientId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'SAME_CLIENT',
          message: 'Cannot merge a client with itself'
        }
      });
    }

    const [primaryClient, secondaryClient] = await Promise.all([
      Client.findById(primaryClientId),
      Client.findById(secondaryClientId)
    ]);

    if (!primaryClient || !secondaryClient) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'One or both clients not found'
        }
      });
    }

    // Merge data based on strategy
    const mergedData = await Client.mergeClients(
      primaryClient,
      secondaryClient,
      mergeStrategy
    );

    // Update primary client with merged data
    const updatedClient = await Client.findByIdAndUpdate(
      primaryClientId,
      mergedData,
      { new: true }
    );

    // Archive or delete secondary client
    await Client.findByIdAndUpdate(secondaryClientId, {
      status: 'Merged',
      mergedInto: primaryClientId,
      mergedAt: new Date()
    });

    res.json({
      success: true,
      data: updatedClient,
      message: 'Clients merged successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error merging clients:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'MERGE_ERROR',
        message: 'Failed to merge clients',
        details: error.message
      }
    });
  }
};

// GET /api/v1/clients/:id/export
exports.exportClientData = async (req, res) => {
  try {
    const { id } = req.params;
    const { format = 'json', includeHistory = true } = req.query;

    const client = await Client.findById(id);
    if (!client) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Client not found'
        }
      });
    }

    let exportData = {
      personalInfo: {
        firstName: client.firstName,
        lastName: client.lastName,
        email: client.email,
        phone: client.phone,
        address: client.address,
        birthday: client.birthday,
        anniversary: client.anniversary,
        occupation: client.occupation
      },
      preferences: client.preferences,
      tags: client.tags,
      createdAt: client.createdAt,
      updatedAt: client.updatedAt
    };

    if (includeHistory === 'true') {
      const [transactions, communications, notes] = await Promise.all([
        Client.getTransactionHistory(id),
        Client.getCommunicationLogs(id),
        Client.getNotes(id)
      ]);

      exportData.history = {
        transactions,
        communications,
        notes
      };
    }

    if (format === 'csv') {
      // Convert to CSV format
      const csv = Client.convertToCSV(exportData);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=client-${id}-export.csv`);
      res.send(csv);
    } else {
      res.json({
        success: true,
        data: exportData,
        message: 'Client data exported successfully',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    logger.error('Error exporting client data:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'EXPORT_ERROR',
        message: 'Failed to export client data',
        details: error.message
      }
    });
  }
};

// PATCH /api/v1/clients/bulk-update
exports.bulkUpdateTags = async (req, res) => {
  try {
    const { clientIds, action, tags } = req.body;

    if (!clientIds || !Array.isArray(clientIds) || clientIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_IDS',
          message: 'Client IDs array is required'
        }
      });
    }

    if (!action || !['add', 'remove', 'replace'].includes(action)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ACTION',
          message: 'Action must be add, remove, or replace'
        }
      });
    }

    if (!tags || !Array.isArray(tags)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_TAGS',
          message: 'Tags array is required'
        }
      });
    }

    const updateOperation = {};
    switch (action) {
      case 'add':
        updateOperation.$addToSet = { tags: { $each: tags } };
        break;
      case 'remove':
        updateOperation.$pull = { tags: { $in: tags } };
        break;
      case 'replace':
        updateOperation.$set = { tags };
        break;
    }

    updateOperation.$set = { ...updateOperation.$set, updatedAt: new Date() };

    const result = await Client.updateMany(
      { _id: { $in: clientIds } },
      updateOperation
    );

    res.json({
      success: true,
      data: {
        matched: result.matchedCount,
        modified: result.modifiedCount
      },
      message: `Successfully updated tags for ${result.modifiedCount} clients`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error bulk updating tags:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'BULK_UPDATE_ERROR',
        message: 'Failed to bulk update tags',
        details: error.message
      }
    });
  }
};

// GET /api/v1/clients/birthdays
exports.getUpcomingBirthdays = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    const today = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + parseInt(days));

    const clients = await Client.find({
      birthday: { $exists: true },
      status: 'Active'
    }).select('firstName lastName email phone birthday');

    // Filter clients with birthdays in the specified range
    const upcomingBirthdays = clients.filter(client => {
      if (!client.birthday) return false;
      
      const birthday = new Date(client.birthday);
      const thisYearBirthday = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate());
      const nextYearBirthday = new Date(today.getFullYear() + 1, birthday.getMonth(), birthday.getDate());
      
      return (thisYearBirthday >= today && thisYearBirthday <= endDate) ||
             (nextYearBirthday >= today && nextYearBirthday <= endDate);
    }).map(client => {
      const birthday = new Date(client.birthday);
      const thisYearBirthday = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate());
      const nextBirthday = thisYearBirthday >= today ? thisYearBirthday : 
        new Date(today.getFullYear() + 1, birthday.getMonth(), birthday.getDate());
      
      return {
        ...client.toObject(),
        nextBirthday,
        daysUntil: Math.ceil((nextBirthday - today) / (1000 * 60 * 60 * 24)),
        age: nextBirthday.getFullYear() - birthday.getFullYear()
      };
    }).sort((a, b) => a.daysUntil - b.daysUntil);

    res.json({
      success: true,
      data: upcomingBirthdays,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching upcoming birthdays:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'BIRTHDAY_ERROR',
        message: 'Failed to fetch upcoming birthdays',
        details: error.message
      }
    });
  }
};

// GET /api/v1/clients/anniversaries
exports.getUpcomingAnniversaries = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    const today = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + parseInt(days));

    const clients = await Client.find({
      anniversary: { $exists: true },
      status: 'Active'
    }).select('firstName lastName email phone anniversary');

    // Filter clients with anniversaries in the specified range
    const upcomingAnniversaries = clients.filter(client => {
      if (!client.anniversary) return false;
      
      const anniversary = new Date(client.anniversary);
      const thisYearAnniversary = new Date(today.getFullYear(), anniversary.getMonth(), anniversary.getDate());
      const nextYearAnniversary = new Date(today.getFullYear() + 1, anniversary.getMonth(), anniversary.getDate());
      
      return (thisYearAnniversary >= today && thisYearAnniversary <= endDate) ||
             (nextYearAnniversary >= today && nextYearAnniversary <= endDate);
    }).map(client => {
      const anniversary = new Date(client.anniversary);
      const thisYearAnniversary = new Date(today.getFullYear(), anniversary.getMonth(), anniversary.getDate());
      const nextAnniversary = thisYearAnniversary >= today ? thisYearAnniversary : 
        new Date(today.getFullYear() + 1, anniversary.getMonth(), anniversary.getDate());
      
      return {
        ...client.toObject(),
        nextAnniversary,
        daysUntil: Math.ceil((nextAnniversary - today) / (1000 * 60 * 60 * 24)),
        years: nextAnniversary.getFullYear() - anniversary.getFullYear()
      };
    }).sort((a, b) => a.daysUntil - b.daysUntil);

    res.json({
      success: true,
      data: upcomingAnniversaries,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching upcoming anniversaries:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'ANNIVERSARY_ERROR',
        message: 'Failed to fetch upcoming anniversaries',
        details: error.message
      }
    });
  }
};

// PATCH /api/v1/clients/:id/status
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;
    
    const validStatuses = ['Active', 'Inactive', 'Archived'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: 'Invalid status value'
        }
      });
    }
    
    const client = await Client.findByIdAndUpdate(
      id,
      { 
        status,
        updatedAt: new Date()
      },
      { new: true }
    );
    
    if (!client) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Client not found'
        }
      });
    }
    
    // Add timeline entry
    await Client.addTimelineEntry(id, {
      event: 'Status Changed',
      description: `Status changed to ${status}`,
      notes: note,
      type: 'status_change'
    });
    
    // Emit real-time update
    const io = req.app.get('io');
    io.to('clients').emit('client:statusChanged', { id, status });
    
    res.json({
      success: true,
      data: client,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error updating client status:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'STATUS_ERROR',
        message: 'Failed to update client status',
        details: error.message
      }
    });
  }
};

// POST /api/v1/clients/:id/tags
exports.addTag = async (req, res) => {
  try {
    const { id } = req.params;
    const { tag } = req.body;
    
    if (!tag) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_TAG',
          message: 'Tag is required'
        }
      });
    }
    
    const client = await Client.findByIdAndUpdate(
      id,
      { 
        $addToSet: { tags: tag },
        updatedAt: new Date()
      },
      { new: true }
    );
    
    if (!client) {
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
      data: client,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error adding tag:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'TAG_ERROR',
        message: 'Failed to add tag',
        details: error.message
      }
    });
  }
};

// DELETE /api/v1/clients/:id/tags/:tag
exports.removeTag = async (req, res) => {
  try {
    const { id, tag } = req.params;
    
    const client = await Client.findByIdAndUpdate(
      id,
      { 
        $pull: { tags: tag },
        updatedAt: new Date()
      },
      { new: true }
    );
    
    if (!client) {
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
      data: client,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error removing tag:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'TAG_ERROR',
        message: 'Failed to remove tag',
        details: error.message
      }
    });
  }
};

// GET /api/v1/clients/stats
exports.getStats = async (req, res) => {
  try {
    const stats = await Client.aggregate([
      {
        $facet: {
          byStatus: [
            { $group: { _id: '$status', count: { $sum: 1 } } }
          ],
          byType: [
            { $group: { _id: '$clientType', count: { $sum: 1 } } }
          ],
          bySource: [
            { $group: { _id: '$source', count: { $sum: 1 } } }
          ],
          totals: [
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                active: { $sum: { $cond: [{ $eq: ['$status', 'Active'] }, 1, 0] } },
                newThisMonth: {
                  $sum: {
                    $cond: [
                      {
                        $gte: ['$createdAt', new Date(new Date().setDate(1))]
                      },
                      1,
                      0
                    ]
                  }
                }
              }
            }
          ]
        }
      }
    ]);
    
    res.json({
      success: true,
      data: {
        byStatus: stats[0].byStatus,
        byType: stats[0].byType,
        bySource: stats[0].bySource,
        totals: stats[0].totals[0] || { total: 0, active: 0, newThisMonth: 0 }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching client stats:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'STATS_ERROR',
        message: 'Failed to fetch client statistics',
        details: error.message
      }
    });
  }
};