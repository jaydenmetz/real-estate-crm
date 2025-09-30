const Lead = require('../models/Lead.mock');
const Client = require('../models/Client.mock');
const logger = require('../utils/logger');
const { validationResult } = require('express-validator');
const emailService = require('../services/email.service');
const leadScoringService = require('../services/leadScoring.service');
const leadRoutingService = require('../services/leadRouting.service');

// GET /api/v1/leads
exports.getLeads = async (req, res) => {
  try {
    const {
      status,
      source,
      score,
      temperature,
      assignedTo,
      type,
      search,
      page = 1,
      limit = 20,
      sort = 'createdAt',
      order = 'desc',
      dateFrom,
      dateTo,
      includeMetrics = true
    } = req.query;

    // Build filter object
    const filters = {};
    
    // Status filter
    if (status) {
      const validStatuses = ['New', 'Contacted', 'Qualified', 'Nurture', 'Appointment Set', 'Met', 'Converted', 'Lost'];
      if (validStatuses.includes(status)) {
        filters.status = status;
      } else if (status.includes(',')) {
        filters.status = { $in: status.split(',').filter(s => validStatuses.includes(s)) };
      }
    }
    
    // Source filter
    if (source) {
      const validSources = ['Website', 'Zillow', 'Realtor.com', 'Referral', 'Social Media', 'Open House', 'Cold Call', 'Other'];
      if (validSources.includes(source)) {
        filters.source = source;
      } else if (source.includes(',')) {
        filters.source = { $in: source.split(',').filter(s => validSources.includes(s)) };
      }
    }
    
    // Score range filter
    if (score) {
      if (score.includes('-')) {
        const [min, max] = score.split('-').map(Number);
        filters.score = { $gte: min, $lte: max };
      } else {
        // Predefined score ranges
        switch (score) {
          case 'hot':
            filters.score = { $gte: 80 };
            break;
          case 'warm':
            filters.score = { $gte: 50, $lt: 80 };
            break;
          case 'cool':
            filters.score = { $lt: 50 };
            break;
          default:
            filters.score = parseInt(score);
        }
      }
    }
    
    // Temperature filter
    if (temperature) {
      filters.temperature = temperature;
    }
    
    // Assigned agent filter
    if (assignedTo) {
      filters.assignedTo = assignedTo;
    }
    
    // Lead type filter
    if (type) {
      filters.type = type;
    }
    
    // Date range filter
    if (dateFrom || dateTo) {
      filters.createdAt = {};
      if (dateFrom) filters.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filters.createdAt.$lte = new Date(dateTo);
    }
    
    // Search filter
    if (search) {
      filters.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search.replace(/\D/g, ''), $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } }
      ];
    }

    // Sorting options
    const sortOptions = {};
    const validSortFields = ['score', 'createdAt', 'lastContactDate', 'name'];
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
    const [leads, totalCount] = await Promise.all([
      Lead.find(filters)
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('assignedTo', 'firstName lastName')
        .select('-__v'),
      Lead.countDocuments(filters)
    ]);

    // Calculate conversion metrics if requested
    let conversionMetrics = {};
    if (includeMetrics === 'true') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const [totalLeads, convertedLeads, avgTimeToConvert] = await Promise.all([
        Lead.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
        Lead.countDocuments({ 
          createdAt: { $gte: thirtyDaysAgo }, 
          status: 'Converted' 
        }),
        Lead.aggregate([
          {
            $match: {
              status: 'Converted',
              createdAt: { $gte: thirtyDaysAgo }
            }
          },
          {
            $project: {
              timeToConvert: {
                $divide: [
                  { $subtract: ['$convertedAt', '$createdAt'] },
                  1000 * 60 * 60 * 24 // Convert to days
                ]
              }
            }
          },
          {
            $group: {
              _id: null,
              avgDays: { $avg: '$timeToConvert' }
            }
          }
        ])
      ]);

      conversionMetrics = {
        conversionRate: totalLeads > 0 ? (convertedLeads / totalLeads * 100).toFixed(2) : 0,
        totalLeads,
        convertedLeads,
        averageDaysToConvert: avgTimeToConvert[0]?.avgDays?.toFixed(1) || 0
      };
    }

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / parseInt(limit));
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;

    res.json({
      success: true,
      data: {
        leads,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalCount,
          limit: parseInt(limit),
          hasNextPage,
          hasPrevPage
        },
        metrics: conversionMetrics
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching leads:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch leads',
        details: error.message
      }
    });
  }
};

// GET /api/v1/leads/:id
exports.getLead = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get lead with related data
    const lead = await Lead.findById(id)
      .populate('assignedTo', 'firstName lastName email phone')
      .populate('activities.createdBy', 'firstName lastName')
      .select('-__v');
    
    if (!lead) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Lead not found'
        }
      });
    }

    // Calculate days in pipeline
    const daysInPipeline = Math.floor((new Date() - lead.createdAt) / (1000 * 60 * 60 * 24));
    
    // Get activity timeline
    const activityTimeline = lead.activities.sort((a, b) => b.date - a.date);
    
    // Get email/call history
    const communicationHistory = activityTimeline.filter(activity => 
      ['Email', 'Phone', 'Text', 'Meeting'].includes(activity.type)
    );
    
    // Get property interests
    const propertyInterests = {
      types: lead.propertyInterest?.types || [],
      locations: lead.propertyInterest?.locations || [],
      priceRange: lead.budget || {},
      features: lead.propertyInterest?.features || []
    };

    // Calculate engagement score
    const engagementScore = leadScoringService.calculateEngagementScore(lead);

    res.json({
      success: true,
      data: {
        ...lead.toObject(),
        daysInPipeline,
        activityTimeline,
        communicationHistory,
        propertyInterests,
        engagementScore,
        lastActivity: activityTimeline[0] || null
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching lead:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch lead',
        details: error.message
      }
    });
  }
};

// POST /api/v1/leads
exports.createLead = async (req, res) => {
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
      leadSource = 'Website',
      leadType = 'Buyer',
      propertyInterest,
      budget,
      timeline,
      notes,
      sourceDetails,
      assignmentMethod = 'round-robin' // round-robin, territory, load-balanced
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

    // Check for duplicates
    const duplicateQuery = [];
    if (email) duplicateQuery.push({ email: email.toLowerCase() });
    if (phone) duplicateQuery.push({ phone: phone.replace(/\D/g, '') });
    
    const existingLead = await Lead.findOne({ 
      $or: duplicateQuery,
      status: { $ne: 'Converted' }
    });

    if (existingLead) {
      // Merge with existing lead instead of creating duplicate
      return exports.mergeLead(req, res, existingLead);
    }

    // Calculate initial lead score
    const initialScore = leadScoringService.calculateInitialScore({
      source: leadSource,
      timeline,
      budget,
      propertyInterest,
      hasEmail: !!email,
      hasPhone: !!phone
    });

    // Auto-assign to agent
    const assignedAgent = await leadRoutingService.assignLead({
      method: assignmentMethod,
      leadType,
      location: propertyInterest?.locations?.[0],
      score: initialScore
    });

    // Determine temperature based on score
    const temperature = initialScore >= 80 ? 'Hot' : initialScore >= 50 ? 'Warm' : 'Cool';

    // Create lead object
    const leadData = {
      firstName,
      lastName,
      email: email?.toLowerCase(),
      phone: phone?.replace(/\D/g, ''),
      source: leadSource,
      type: leadType,
      status: 'New',
      score: initialScore,
      temperature,
      propertyInterest: {
        types: propertyInterest?.types || [],
        locations: propertyInterest?.locations || [],
        features: propertyInterest?.features || [],
        notes: propertyInterest?.notes || ''
      },
      budget: {
        min: budget?.min || 0,
        max: budget?.max || 0,
        isPreApproved: budget?.isPreApproved || false,
        preApprovalAmount: budget?.preApprovalAmount || null,
        lender: budget?.lender || null,
        currentRent: budget?.currentRent || null
      },
      timeline: timeline || 'Not specified',
      notes,
      sourceDetails,
      assignedTo: assignedAgent?._id,
      activities: [{
        type: 'System',
        description: 'Lead created',
        date: new Date(),
        automatic: true
      }],
      scoreHistory: [{
        score: initialScore,
        reason: 'Initial score calculation',
        date: new Date()
      }],
      createdAt: new Date(),
      updatedAt: new Date(),
      lastContactDate: null
    };

    // Create lead
    const lead = await Lead.create(leadData);

    // Trigger immediate response workflow
    try {
      await triggerImmediateResponse(lead);
    } catch (workflowError) {
      logger.error('Failed to trigger immediate response:', workflowError);
    }

    // Send CRM notification
    const io = req.app.get('io');
    io.to('leads').emit('lead:created', lead);
    io.to(`agent:${assignedAgent?._id}`).emit('lead:assigned', {
      lead,
      message: `New ${temperature} lead assigned: ${firstName} ${lastName}`
    });

    // Send email notification to assigned agent
    if (assignedAgent?.email) {
      try {
        await emailService.sendLeadAssignmentNotification({
          to: assignedAgent.email,
          agentName: `${assignedAgent.firstName} ${assignedAgent.lastName}`,
          leadName: `${firstName} ${lastName}`,
          leadScore: initialScore,
          leadSource,
          propertyInterest: propertyInterest?.types?.join(', ')
        });
      } catch (emailError) {
        logger.error('Failed to send assignment email:', emailError);
      }
    }

    res.status(201).json({
      success: true,
      data: lead,
      message: `Lead created and assigned to ${assignedAgent?.firstName} ${assignedAgent?.lastName}`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error creating lead:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CREATE_ERROR',
        message: 'Failed to create lead',
        details: error.message
      }
    });
  }
};

// PUT /api/v1/leads/:id
exports.updateLead = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const currentLead = await Lead.findById(id);
    if (!currentLead) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Lead not found'
        }
      });
    }

    // Track score changes
    if (updates.score && updates.score !== currentLead.score) {
      if (!updates.scoreHistory) updates.scoreHistory = currentLead.scoreHistory || [];
      updates.scoreHistory.push({
        score: updates.score,
        previousScore: currentLead.score,
        reason: updates.scoreChangeReason || 'Manual update',
        date: new Date(),
        changedBy: req.user?.id || 'system'
      });

      // Update temperature based on new score
      updates.temperature = updates.score >= 80 ? 'Hot' : updates.score >= 50 ? 'Warm' : 'Cool';
    }

    // Track status changes
    if (updates.status && updates.status !== currentLead.status) {
      if (!updates.activities) updates.activities = currentLead.activities || [];
      updates.activities.push({
        type: 'Status Change',
        description: `Status changed from ${currentLead.status} to ${updates.status}`,
        date: new Date(),
        createdBy: req.user?.id || 'system'
      });

      // If converting to client, set conversion date
      if (updates.status === 'Converted') {
        updates.convertedAt = new Date();
      }
    }

    // Update source attribution if provided
    if (updates.sourceDetails) {
      updates.sourceDetails = {
        ...currentLead.sourceDetails,
        ...updates.sourceDetails
      };
    }

    // Apply score decay if lead is stale
    const daysSinceLastContact = currentLead.lastContactDate 
      ? Math.floor((new Date() - currentLead.lastContactDate) / (1000 * 60 * 60 * 24))
      : Math.floor((new Date() - currentLead.createdAt) / (1000 * 60 * 60 * 24));

    if (daysSinceLastContact > 14 && !updates.score) {
      const decayAmount = Math.min(daysSinceLastContact - 14, 20); // Max 20 point decay
      updates.score = Math.max(currentLead.score - decayAmount, 0);
      updates.scoreHistory = currentLead.scoreHistory || [];
      updates.scoreHistory.push({
        score: updates.score,
        previousScore: currentLead.score,
        reason: `Score decay: ${daysSinceLastContact} days since last contact`,
        date: new Date(),
        automatic: true
      });
    }

    updates.updatedAt = new Date();

    const updatedLead = await Lead.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('assignedTo', 'firstName lastName');

    // Emit real-time update
    const io = req.app.get('io');
    io.to('leads').emit('lead:updated', updatedLead);

    res.json({
      success: true,
      data: updatedLead,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error updating lead:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_ERROR',
        message: 'Failed to update lead',
        details: error.message
      }
    });
  }
};

// Archive lead - soft delete by setting status to 'Archived'
exports.archiveLead = async (req, res) => {
  try {
    const { id } = req.params;

    const archivedLead = await Lead.findByIdAndUpdate(
      id,
      {
        status: 'Archived',
        archivedAt: new Date(),
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!archivedLead) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Lead not found'
        }
      });
    }

    // Emit real-time update if socket.io is configured
    const io = req.app.get('io');
    if (io) {
      io.to('leads').emit('lead:archived', { id });
    }

    res.json({
      success: true,
      data: archivedLead,
      message: 'Lead archived successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error archiving lead:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'ARCHIVE_ERROR',
        message: 'Failed to archive lead',
        details: error.message
      }
    });
  }
};

// DELETE /api/v1/leads/:id
exports.deleteLead = async (req, res) => {
  try {
    const { id } = req.params;
    const { archive = false } = req.query;

    if (archive === 'true') {
      // Archive instead of delete
      const archivedLead = await Lead.findByIdAndUpdate(
        id,
        { 
          status: 'Archived',
          archivedAt: new Date(),
          updatedAt: new Date()
        },
        { new: true }
      );

      if (!archivedLead) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Lead not found'
          }
        });
      }

      // Emit real-time update
      const io = req.app.get('io');
      io.to('leads').emit('lead:archived', { id });

      res.json({
        success: true,
        data: archivedLead,
        message: 'Lead archived successfully',
        timestamp: new Date().toISOString()
      });
    } else {
      // Permanent delete
      const deletedLead = await Lead.findByIdAndDelete(id);
      
      if (!deletedLead) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Lead not found'
          }
        });
      }

      // Emit real-time update
      const io = req.app.get('io');
      io.to('leads').emit('lead:deleted', { id });

      res.json({
        success: true,
        data: deletedLead,
        message: 'Lead permanently deleted',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    logger.error('Error deleting lead:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_ERROR',
        message: 'Failed to delete lead',
        details: error.message
      }
    });
  }
};

// POST /api/v1/leads/:id/activities
exports.recordActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, notes, outcome, nextAction, nextActionDate } = req.body;

    if (!type || !notes) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: 'Activity type and notes are required'
        }
      });
    }

    const lead = await Lead.findById(id);
    if (!lead) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Lead not found'
        }
      });
    }

    const activity = {
      type,
      description: notes,
      outcome,
      nextAction,
      nextActionDate: nextActionDate ? new Date(nextActionDate) : null,
      date: new Date(),
      createdBy: req.user?.id || 'system'
    };

    lead.activities.push(activity);
    lead.lastContactDate = new Date();

    // Update lead score based on activity
    const scoreChange = leadScoringService.getActivityScoreChange(type, outcome);
    if (scoreChange !== 0) {
      lead.score = Math.min(100, Math.max(0, lead.score + scoreChange));
      lead.scoreHistory.push({
        score: lead.score,
        previousScore: lead.score - scoreChange,
        reason: `${type} activity ${outcome ? `with outcome: ${outcome}` : ''}`,
        date: new Date(),
        changedBy: req.user?.id || 'system'
      });
      
      // Update temperature
      lead.temperature = lead.score >= 80 ? 'Hot' : lead.score >= 50 ? 'Warm' : 'Cool';
    }

    // Update status if needed
    if (lead.status === 'New' && type !== 'System') {
      lead.status = 'Contacted';
    }

    await lead.save();

    res.status(201).json({
      success: true,
      data: {
        activity,
        lead
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error recording activity:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'ACTIVITY_ERROR',
        message: 'Failed to record activity',
        details: error.message
      }
    });
  }
};

// PATCH /api/v1/leads/:id/score
exports.updateScore = async (req, res) => {
  try {
    const { id } = req.params;
    const { scoreChange, reason } = req.body;

    if (scoreChange === undefined || !reason) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: 'Score change and reason are required'
        }
      });
    }

    const lead = await Lead.findById(id);
    if (!lead) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Lead not found'
        }
      });
    }

    const previousScore = lead.score;
    lead.score = Math.min(100, Math.max(0, lead.score + scoreChange));
    lead.scoreHistory.push({
      score: lead.score,
      previousScore,
      change: scoreChange,
      reason,
      date: new Date(),
      changedBy: req.user?.id || 'system'
    });

    // Update temperature
    lead.temperature = lead.score >= 80 ? 'Hot' : lead.score >= 50 ? 'Warm' : 'Cool';
    lead.updatedAt = new Date();

    await lead.save();

    res.json({
      success: true,
      data: lead,
      message: `Lead score updated from ${previousScore} to ${lead.score}`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error updating lead score:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SCORE_ERROR',
        message: 'Failed to update lead score',
        details: error.message
      }
    });
  }
};

// PATCH /api/v1/leads/:id/assign
exports.assignToAgent = async (req, res) => {
  try {
    const { id } = req.params;
    const { agentId, reason } = req.body;

    if (!agentId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_AGENT',
          message: 'Agent ID is required'
        }
      });
    }

    const lead = await Lead.findById(id);
    if (!lead) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Lead not found'
        }
      });
    }

    const previousAgent = lead.assignedTo;
    lead.assignedTo = agentId;
    lead.activities.push({
      type: 'Assignment',
      description: `Lead reassigned ${reason ? `- ${reason}` : ''}`,
      date: new Date(),
      createdBy: req.user?.id || 'system',
      metadata: {
        previousAgent,
        newAgent: agentId
      }
    });
    lead.updatedAt = new Date();

    await lead.save();
    await lead.populate('assignedTo', 'firstName lastName email');

    // Send notifications
    const io = req.app.get('io');
    io.to(`agent:${agentId}`).emit('lead:assigned', {
      lead,
      message: `New lead assigned: ${lead.firstName} ${lead.lastName}`
    });

    if (previousAgent) {
      io.to(`agent:${previousAgent}`).emit('lead:unassigned', {
        leadId: id,
        message: `Lead reassigned: ${lead.firstName} ${lead.lastName}`
      });
    }

    res.json({
      success: true,
      data: lead,
      message: `Lead assigned to ${lead.assignedTo.firstName} ${lead.assignedTo.lastName}`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error assigning lead:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'ASSIGNMENT_ERROR',
        message: 'Failed to assign lead',
        details: error.message
      }
    });
  }
};

// POST /api/v1/leads/:id/nurture
exports.addToNurtureCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const { campaignId, campaignName, startDate } = req.body;

    if (!campaignId || !campaignName) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: 'Campaign ID and name are required'
        }
      });
    }

    const lead = await Lead.findById(id);
    if (!lead) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Lead not found'
        }
      });
    }

    lead.nurtureCampaign = {
      id: campaignId,
      name: campaignName,
      enrolledAt: new Date(),
      startDate: startDate ? new Date(startDate) : new Date(),
      status: 'Active'
    };
    
    if (lead.status !== 'Converted') {
      lead.status = 'Nurture';
    }

    lead.activities.push({
      type: 'Campaign',
      description: `Added to nurture campaign: ${campaignName}`,
      date: new Date(),
      createdBy: req.user?.id || 'system'
    });

    await lead.save();

    res.json({
      success: true,
      data: lead,
      message: `Lead added to ${campaignName} campaign`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error adding lead to nurture campaign:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CAMPAIGN_ERROR',
        message: 'Failed to add lead to nurture campaign',
        details: error.message
      }
    });
  }
};

// POST /api/v1/leads/:id/convert
exports.convertToClient = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      clientType = 'Buyer',
      notes,
      propertyId,
      transactionType
    } = req.body;

    const lead = await Lead.findById(id);
    if (!lead) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Lead not found'
        }
      });
    }

    if (lead.status === 'Converted') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ALREADY_CONVERTED',
          message: 'Lead has already been converted'
        }
      });
    }

    // Create client from lead data
    const clientData = {
      firstName: lead.firstName,
      lastName: lead.lastName,
      email: lead.email,
      phone: lead.phone,
      clientType,
      status: 'Active',
      source: lead.source,
      tags: ['Converted Lead', `${lead.temperature} Lead`, lead.source],
      preferences: {
        communicationMethod: 'Email',
        propertyTypes: lead.propertyInterest?.types || [],
        priceRange: lead.budget || {},
        locations: lead.propertyInterest?.locations || []
      },
      notes: `${notes || ''}\n\nConverted from lead. Original lead notes: ${lead.notes || 'None'}`,
      referredBy: lead.sourceDetails?.referrerName,
      timeline: [{
        date: new Date(),
        event: 'Converted from Lead',
        description: `Lead score at conversion: ${lead.score}`,
        type: 'system'
      }],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const client = await Client.create(clientData);

    // Update lead status
    lead.status = 'Converted';
    lead.convertedAt = new Date();
    lead.convertedToClientId = client._id;
    lead.activities.push({
      type: 'Conversion',
      description: `Converted to ${clientType} client`,
      date: new Date(),
      createdBy: req.user?.id || 'system',
      metadata: {
        clientId: client._id,
        clientType,
        transactionType
      }
    });

    await lead.save();

    // Emit real-time updates
    const io = req.app.get('io');
    io.to('leads').emit('lead:converted', { lead, client });
    io.to('clients').emit('client:created', client);

    res.json({
      success: true,
      data: {
        lead,
        client
      },
      message: 'Lead successfully converted to client',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error converting lead:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CONVERSION_ERROR',
        message: 'Failed to convert lead',
        details: error.message
      }
    });
  }
};

// GET /api/v1/leads/analytics/conversion-rate
exports.getConversionRate = async (req, res) => {
  try {
    const { startDate, endDate, source, groupBy = 'month' } = req.query;

    const matchStage = {};
    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate);
      if (endDate) matchStage.createdAt.$lte = new Date(endDate);
    }
    if (source) matchStage.source = source;

    const groupFormat = {
      day: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
      week: { $isoWeek: '$createdAt' },
      month: { $month: '$createdAt' },
      year: { $year: '$createdAt' }
    };

    const conversionData = await Lead.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: groupFormat[groupBy] || groupFormat.month,
          totalLeads: { $sum: 1 },
          convertedLeads: {
            $sum: { $cond: [{ $eq: ['$status', 'Converted'] }, 1, 0] }
          },
          avgScore: { $avg: '$score' },
          avgDaysToConvert: {
            $avg: {
              $cond: [
                { $eq: ['$status', 'Converted'] },
                {
                  $divide: [
                    { $subtract: ['$convertedAt', '$createdAt'] },
                    1000 * 60 * 60 * 24
                  ]
                },
                null
              ]
            }
          }
        }
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          period: '$_id',
          totalLeads: 1,
          convertedLeads: 1,
          conversionRate: {
            $multiply: [
              { $divide: ['$convertedLeads', '$totalLeads'] },
              100
            ]
          },
          avgScore: { $round: ['$avgScore', 1] },
          avgDaysToConvert: { $round: ['$avgDaysToConvert', 1] }
        }
      }
    ]);

    // Overall statistics
    const overallStats = await Lead.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalLeads: { $sum: 1 },
          convertedLeads: {
            $sum: { $cond: [{ $eq: ['$status', 'Converted'] }, 1, 0] }
          },
          lostLeads: {
            $sum: { $cond: [{ $eq: ['$status', 'Lost'] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          totalLeads: 1,
          convertedLeads: 1,
          lostLeads: 1,
          conversionRate: {
            $multiply: [
              { $divide: ['$convertedLeads', '$totalLeads'] },
              100
            ]
          },
          lossRate: {
            $multiply: [
              { $divide: ['$lostLeads', '$totalLeads'] },
              100
            ]
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        periodData: conversionData,
        overall: overallStats[0] || {
          totalLeads: 0,
          convertedLeads: 0,
          lostLeads: 0,
          conversionRate: 0,
          lossRate: 0
        },
        parameters: { startDate, endDate, source, groupBy }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error calculating conversion rate:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'ANALYTICS_ERROR',
        message: 'Failed to calculate conversion rate',
        details: error.message
      }
    });
  }
};

// GET /api/v1/leads/analytics/source-roi
exports.getSourceROI = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const matchStage = {};
    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate);
      if (endDate) matchStage.createdAt.$lte = new Date(endDate);
    }

    const sourceAnalytics = await Lead.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$source',
          totalLeads: { $sum: 1 },
          convertedLeads: {
            $sum: { $cond: [{ $eq: ['$status', 'Converted'] }, 1, 0] }
          },
          avgScore: { $avg: '$score' },
          avgTimeToConvert: {
            $avg: {
              $cond: [
                { $eq: ['$status', 'Converted'] },
                {
                  $divide: [
                    { $subtract: ['$convertedAt', '$createdAt'] },
                    1000 * 60 * 60 * 24
                  ]
                },
                null
              ]
            }
          }
        }
      },
      {
        $project: {
          source: '$_id',
          totalLeads: 1,
          convertedLeads: 1,
          conversionRate: {
            $multiply: [
              { $divide: ['$convertedLeads', '$totalLeads'] },
              100
            ]
          },
          avgScore: { $round: ['$avgScore', 1] },
          avgTimeToConvert: { $round: ['$avgTimeToConvert', 1] },
          // Mock cost per lead (in production, this would come from actual data)
          costPerLead: {
            $switch: {
              branches: [
                { case: { $eq: ['$_id', 'Zillow'] }, then: 25 },
                { case: { $eq: ['$_id', 'Realtor.com'] }, then: 20 },
                { case: { $eq: ['$_id', 'Social Media'] }, then: 15 },
                { case: { $eq: ['$_id', 'Website'] }, then: 5 },
                { case: { $eq: ['$_id', 'Referral'] }, then: 0 }
              ],
              default: 10
            }
          }
        }
      },
      {
        $addFields: {
          costPerConversion: {
            $cond: [
              { $gt: ['$convertedLeads', 0] },
              {
                $divide: [
                  { $multiply: ['$totalLeads', '$costPerLead'] },
                  '$convertedLeads'
                ]
              },
              null
            ]
          },
          // Mock average transaction value
          avgTransactionValue: 15000,
          roi: {
            $cond: [
              { $gt: ['$convertedLeads', 0] },
              {
                $multiply: [
                  {
                    $divide: [
                      {
                        $subtract: [
                          { $multiply: ['$convertedLeads', 15000] },
                          { $multiply: ['$totalLeads', '$costPerLead'] }
                        ]
                      },
                      { $multiply: ['$totalLeads', '$costPerLead'] }
                    ]
                  },
                  100
                ]
              },
              -100
            ]
          }
        }
      },
      { $sort: { convertedLeads: -1 } }
    ]);

    res.json({
      success: true,
      data: sourceAnalytics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error calculating source ROI:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'ANALYTICS_ERROR',
        message: 'Failed to calculate source ROI',
        details: error.message
      }
    });
  }
};

// GET /api/v1/leads/analytics/agent-performance
exports.getAgentPerformance = async (req, res) => {
  try {
    const { startDate, endDate, agentId } = req.query;

    const matchStage = {};
    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate);
      if (endDate) matchStage.createdAt.$lte = new Date(endDate);
    }
    if (agentId) matchStage.assignedTo = agentId;

    const agentStats = await Lead.aggregate([
      { $match: { ...matchStage, assignedTo: { $exists: true } } },
      {
        $lookup: {
          from: 'users',
          localField: 'assignedTo',
          foreignField: '_id',
          as: 'agent'
        }
      },
      { $unwind: '$agent' },
      {
        $group: {
          _id: '$assignedTo',
          agentName: { $first: { $concat: ['$agent.firstName', ' ', '$agent.lastName'] } },
          totalLeads: { $sum: 1 },
          convertedLeads: {
            $sum: { $cond: [{ $eq: ['$status', 'Converted'] }, 1, 0] }
          },
          activeLeads: {
            $sum: {
              $cond: [
                { $in: ['$status', ['New', 'Contacted', 'Qualified', 'Nurture']] },
                1,
                0
              ]
            }
          },
          lostLeads: {
            $sum: { $cond: [{ $eq: ['$status', 'Lost'] }, 1, 0] }
          },
          avgResponseTime: {
            $avg: {
              $cond: [
                { $gt: ['$lastContactDate', null] },
                {
                  $divide: [
                    { $subtract: ['$lastContactDate', '$createdAt'] },
                    1000 * 60 * 60 // Convert to hours
                  ]
                },
                null
              ]
            }
          },
          avgScore: { $avg: '$score' }
        }
      },
      {
        $project: {
          agentId: '$_id',
          agentName: 1,
          totalLeads: 1,
          convertedLeads: 1,
          activeLeads: 1,
          lostLeads: 1,
          conversionRate: {
            $multiply: [
              { $divide: ['$convertedLeads', '$totalLeads'] },
              100
            ]
          },
          avgResponseTime: { $round: ['$avgResponseTime', 1] },
          avgScore: { $round: ['$avgScore', 1] }
        }
      },
      { $sort: { conversionRate: -1 } }
    ]);

    res.json({
      success: true,
      data: agentStats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching agent performance:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'ANALYTICS_ERROR',
        message: 'Failed to fetch agent performance',
        details: error.message
      }
    });
  }
};

// GET /api/v1/leads/analytics/funnel
exports.getLeadFunnel = async (req, res) => {
  try {
    const { startDate, endDate, source } = req.query;

    const matchStage = {};
    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate);
      if (endDate) matchStage.createdAt.$lte = new Date(endDate);
    }
    if (source) matchStage.source = source;

    const funnelData = await Lead.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgScore: { $avg: '$score' },
          sources: { $addToSet: '$source' }
        }
      },
      {
        $project: {
          status: '$_id',
          count: 1,
          avgScore: { $round: ['$avgScore', 1] },
          sourceCount: { $size: '$sources' }
        }
      }
    ]);

    // Define funnel stages in order
    const funnelStages = [
      'New',
      'Contacted',
      'Qualified',
      'Nurture',
      'Appointment Set',
      'Met',
      'Converted'
    ];

    // Create ordered funnel with all stages
    const orderedFunnel = funnelStages.map(stage => {
      const stageData = funnelData.find(d => d.status === stage) || {
        status: stage,
        count: 0,
        avgScore: 0,
        sourceCount: 0
      };
      return stageData;
    });

    // Calculate conversion rates between stages
    for (let i = 0; i < orderedFunnel.length - 1; i++) {
      const currentCount = orderedFunnel[i].count;
      const nextCount = orderedFunnel[i + 1].count;
      orderedFunnel[i].conversionToNext = currentCount > 0
        ? ((nextCount / currentCount) * 100).toFixed(1)
        : 0;
    }

    // Add lost leads
    const lostCount = await Lead.countDocuments({ ...matchStage, status: 'Lost' });

    res.json({
      success: true,
      data: {
        funnel: orderedFunnel,
        lost: lostCount,
        totalLeads: orderedFunnel.reduce((sum, stage) => sum + stage.count, 0) + lostCount
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching lead funnel:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'ANALYTICS_ERROR',
        message: 'Failed to fetch lead funnel',
        details: error.message
      }
    });
  }
};

// POST /api/v1/leads/merge
exports.mergeLeads = async (req, res) => {
  try {
    const { primaryLeadId, secondaryLeadId, mergeStrategy = 'newest' } = req.body;

    if (!primaryLeadId || !secondaryLeadId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_IDS',
          message: 'Both primary and secondary lead IDs are required'
        }
      });
    }

    const [primaryLead, secondaryLead] = await Promise.all([
      Lead.findById(primaryLeadId),
      Lead.findById(secondaryLeadId)
    ]);

    if (!primaryLead || !secondaryLead) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'One or both leads not found'
        }
      });
    }

    // Merge activities
    const mergedActivities = [...primaryLead.activities, ...secondaryLead.activities]
      .sort((a, b) => b.date - a.date);

    // Merge score history
    const mergedScoreHistory = [...primaryLead.scoreHistory || [], ...secondaryLead.scoreHistory || []]
      .sort((a, b) => b.date - a.date);

    // Determine which data to keep based on strategy
    let mergedData;
    if (mergeStrategy === 'newest') {
      mergedData = primaryLead.updatedAt > secondaryLead.updatedAt ? primaryLead : secondaryLead;
    } else if (mergeStrategy === 'highest_score') {
      mergedData = primaryLead.score > secondaryLead.score ? primaryLead : secondaryLead;
    } else {
      mergedData = primaryLead; // Default to primary
    }

    // Update primary lead with merged data
    primaryLead.activities = mergedActivities;
    primaryLead.scoreHistory = mergedScoreHistory;
    primaryLead.score = Math.max(primaryLead.score, secondaryLead.score);
    primaryLead.notes = `${primaryLead.notes || ''}\n\nMerged from duplicate lead: ${secondaryLead.notes || ''}`;
    
    // Keep the better contact info
    if (!primaryLead.email && secondaryLead.email) primaryLead.email = secondaryLead.email;
    if (!primaryLead.phone && secondaryLead.phone) primaryLead.phone = secondaryLead.phone;

    await primaryLead.save();

    // Archive secondary lead
    secondaryLead.status = 'Merged';
    secondaryLead.mergedInto = primaryLeadId;
    secondaryLead.mergedAt = new Date();
    await secondaryLead.save();

    res.json({
      success: true,
      data: primaryLead,
      message: 'Leads merged successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error merging leads:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'MERGE_ERROR',
        message: 'Failed to merge leads',
        details: error.message
      }
    });
  }
};

// POST /api/v1/leads/import
exports.bulkImport = async (req, res) => {
  try {
    const { leads, source = 'Import', checkDuplicates = true } = req.body;

    if (!leads || !Array.isArray(leads)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_DATA',
          message: 'Leads array is required'
        }
      });
    }

    const results = {
      imported: [],
      duplicates: [],
      errors: []
    };

    for (const leadData of leads) {
      try {
        // Validate required fields
        if (!leadData.firstName || !leadData.lastName || (!leadData.email && !leadData.phone)) {
          results.errors.push({
            data: leadData,
            error: 'Missing required fields'
          });
          continue;
        }

        // Check for duplicates if enabled
        if (checkDuplicates) {
          const duplicateQuery = [];
          if (leadData.email) duplicateQuery.push({ email: leadData.email.toLowerCase() });
          if (leadData.phone) duplicateQuery.push({ phone: leadData.phone.replace(/\D/g, '') });
          
          const existingLead = await Lead.findOne({
            $or: duplicateQuery,
            status: { $ne: 'Converted' }
          });

          if (existingLead) {
            results.duplicates.push({
              data: leadData,
              existingLeadId: existingLead._id
            });
            continue;
          }
        }

        // Calculate initial score
        const initialScore = leadScoringService.calculateInitialScore({
          source,
          hasEmail: !!leadData.email,
          hasPhone: !!leadData.phone
        });

        // Create lead
        const lead = await Lead.create({
          ...leadData,
          source,
          score: initialScore,
          temperature: initialScore >= 80 ? 'Hot' : initialScore >= 50 ? 'Warm' : 'Cool',
          status: 'New',
          activities: [{
            type: 'System',
            description: 'Lead imported',
            date: new Date(),
            automatic: true
          }],
          createdAt: new Date(),
          updatedAt: new Date()
        });

        results.imported.push(lead);
      } catch (error) {
        results.errors.push({
          data: leadData,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      data: results,
      summary: {
        total: leads.length,
        imported: results.imported.length,
        duplicates: results.duplicates.length,
        errors: results.errors.length
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error importing leads:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'IMPORT_ERROR',
        message: 'Failed to import leads',
        details: error.message
      }
    });
  }
};

// GET /api/v1/leads/routing-rules
exports.getRoutingRules = async (req, res) => {
  try {
    const rules = await leadRoutingService.getRoutingRules();
    
    res.json({
      success: true,
      data: rules,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching routing rules:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch routing rules',
        details: error.message
      }
    });
  }
};

// PUT /api/v1/leads/routing-rules
exports.updateRoutingRules = async (req, res) => {
  try {
    const { rules } = req.body;
    
    if (!rules || !Array.isArray(rules)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_DATA',
          message: 'Rules array is required'
        }
      });
    }

    const updatedRules = await leadRoutingService.updateRoutingRules(rules);
    
    res.json({
      success: true,
      data: updatedRules,
      message: 'Routing rules updated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error updating routing rules:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_ERROR',
        message: 'Failed to update routing rules',
        details: error.message
      }
    });
  }
};

// Helper functions

async function triggerImmediateResponse(lead) {
  try {
    // Send immediate email response
    if (lead.email) {
      await emailService.sendLeadWelcomeEmail({
        to: lead.email,
        name: `${lead.firstName} ${lead.lastName}`,
        propertyInterest: lead.propertyInterest?.types?.join(', '),
        source: lead.source
      });
    }

    // Log automatic activity
    lead.activities.push({
      type: 'Email',
      description: 'Automated welcome email sent',
      date: new Date(),
      automatic: true
    });

    await lead.save();
  } catch (error) {
    logger.error('Error in immediate response workflow:', error);
    throw error;
  }
}

async function mergeLead(req, res, existingLead) {
  try {
    const newData = req.body;
    
    // Update existing lead with new information
    if (newData.propertyInterest) {
      existingLead.propertyInterest = {
        ...existingLead.propertyInterest,
        ...newData.propertyInterest
      };
    }
    
    if (newData.budget) {
      existingLead.budget = {
        ...existingLead.budget,
        ...newData.budget
      };
    }
    
    // Add activity for duplicate attempt
    existingLead.activities.push({
      type: 'System',
      description: `Duplicate lead submission from ${newData.leadSource || 'Unknown source'}`,
      date: new Date(),
      automatic: true
    });
    
    // Boost score for repeated interest
    existingLead.score = Math.min(100, existingLead.score + 10);
    existingLead.scoreHistory.push({
      score: existingLead.score,
      previousScore: existingLead.score - 10,
      reason: 'Duplicate submission - increased interest',
      date: new Date(),
      automatic: true
    });
    
    await existingLead.save();
    
    res.status(200).json({
      success: true,
      data: existingLead,
      message: 'Lead information updated (duplicate detected)',
      duplicate: true,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error merging duplicate lead:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'MERGE_ERROR',
        message: 'Failed to merge duplicate lead',
        details: error.message
      }
    });
  }
}

// PATCH /api/v1/leads/:id/status
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;
    
    const validStatuses = ['New', 'Contacted', 'Qualified', 'Nurture', 'Appointment Set', 'Met', 'Converted', 'Lost'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: 'Invalid status value'
        }
      });
    }
    
    const lead = await Lead.findById(id);
    if (!lead) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Lead not found'
        }
      });
    }
    
    const previousStatus = lead.status;
    lead.status = status;
    lead.activities.push({
      type: 'Status Change',
      description: `Status changed from ${previousStatus} to ${status}${note ? ` - ${note}` : ''}`,
      date: new Date(),
      createdBy: req.user?.id || 'system'
    });
    
    // Update score based on status change
    const scoreChange = leadScoringService.getStatusScoreChange(previousStatus, status);
    if (scoreChange !== 0) {
      lead.score = Math.min(100, Math.max(0, lead.score + scoreChange));
      lead.scoreHistory.push({
        score: lead.score,
        previousScore: lead.score - scoreChange,
        reason: `Status change: ${previousStatus} → ${status}`,
        date: new Date(),
        changedBy: req.user?.id || 'system'
      });
    }
    
    if (status === 'Converted') {
      lead.convertedAt = new Date();
    }
    
    lead.updatedAt = new Date();
    await lead.save();
    
    // Emit real-time update
    const io = req.app.get('io');
    io.to('leads').emit('lead:statusChanged', { id, status, previousStatus });
    
    res.json({
      success: true,
      data: lead,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error updating lead status:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'STATUS_ERROR',
        message: 'Failed to update lead status',
        details: error.message
      }
    });
  }
};

// GET /api/v1/leads/stats
exports.getStats = async (req, res) => {
  try {
    const stats = await Lead.aggregate([
      {
        $facet: {
          byStatus: [
            { $group: { _id: '$status', count: { $sum: 1 } } }
          ],
          bySource: [
            { $group: { _id: '$source', count: { $sum: 1 } } }
          ],
          byTemperature: [
            { $group: { _id: '$temperature', count: { $sum: 1 } } }
          ],
          totals: [
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                newToday: {
                  $sum: {
                    $cond: [
                      {
                        $gte: ['$createdAt', new Date(new Date().setHours(0, 0, 0, 0))]
                      },
                      1,
                      0
                    ]
                  }
                },
                hotLeads: {
                  $sum: { $cond: [{ $eq: ['$temperature', 'Hot'] }, 1, 0] }
                },
                avgScore: { $avg: '$score' }
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
        bySource: stats[0].bySource,
        byTemperature: stats[0].byTemperature,
        totals: stats[0].totals[0] || { total: 0, newToday: 0, hotLeads: 0, avgScore: 0 }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching lead stats:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'STATS_ERROR',
        message: 'Failed to fetch lead statistics',
        details: error.message
      }
    });
  }
};

// GET /api/v1/leads/hot
exports.getHotLeads = async (req, res) => {
  try {
    const { limit = 10, includeAssigned = true } = req.query;
    
    const query = {
      temperature: 'Hot',
      status: { $nin: ['Converted', 'Lost'] }
    };
    
    if (includeAssigned === 'false') {
      query.assignedTo = { $exists: false };
    }
    
    const hotLeads = await Lead.find(query)
      .sort('-score -createdAt')
      .limit(parseInt(limit))
      .populate('assignedTo', 'firstName lastName')
      .select('-__v');
    
    res.json({
      success: true,
      data: hotLeads,
      count: hotLeads.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching hot leads:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch hot leads',
        details: error.message
      }
    });
  }
};

// Batch delete leads
exports.batchDeleteLeads = async (req, res) => {
  const client = await pool.connect();

  try {
    const { ids } = req.body;

    // Start transaction
    await client.query('BEGIN');

    // First, check which leads exist
    const existCheckQuery = `
      SELECT id, deleted_at FROM leads
      WHERE id = ANY($1)
    `;
    const existResult = await client.query(existCheckQuery, [ids]);

    // If no leads found, just return success with 0 deletions
    if (existResult.rows.length === 0) {
      await client.query('COMMIT');
      return res.json({
        success: true,
        message: 'No leads found to delete',
        deletedCount: 0,
        deletedIds: []
      });
    }

    // Check if any are not archived (deleted_at IS NULL means active)
    const activeLeads = existResult.rows.filter(r => !r.deleted_at);
    if (activeLeads.length > 0) {
      await client.query('ROLLBACK');
      const activeIds = activeLeads.map(r => r.id);
      return res.status(400).json({
        success: false,
        error: `Some leads are not archived and cannot be deleted: ${activeIds.join(', ')}`
      });
    }

    // Delete only the leads that exist and are archived
    const existingIds = existResult.rows.map(r => r.id);
    const deleteQuery = 'DELETE FROM leads WHERE id = ANY($1) RETURNING id';
    const result = await client.query(deleteQuery, [existingIds]);

    await client.query('COMMIT');

    logger.info('Batch deleted leads', {
      count: result.rowCount,
      ids: result.rows.map(r => r.id),
      requestedIds: ids,
      notFound: ids.filter(id => !existingIds.includes(id))
    });

    res.json({
      success: true,
      message: `Successfully deleted ${result.rowCount} leads`,
      deletedCount: result.rowCount,
      deletedIds: result.rows.map(r => r.id)
    });
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Error batch deleting leads:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  } finally {
    client.release();
  }
};
