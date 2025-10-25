// Mock Lead model for development and testing
const logger = require('../../../utils/logger');

// Comprehensive mock leads data
const mockLeads = [
  {
    id: '1',
    firstName: 'Jennifer',
    lastName: 'Wilson',
    fullName: 'Jennifer Wilson',
    email: 'jennifer.wilson@email.com',
    phone: '(619) 555-6789',
    secondaryPhone: null,
    source: 'Website',
    sourceDetails: {
      page: 'Property Listing - 123 Main St',
      referrer: 'Google Search',
      utmSource: 'google',
      utmMedium: 'cpc',
      utmCampaign: 'luxury-homes',
    },
    status: 'New',
    score: 85,
    temperature: 'Hot',
    estimatedValue: 125000,
    type: 'Buyer',
    budget: {
      min: 600000,
      max: 800000,
      isPreApproved: false,
      downPayment: 120000,
    },
    timeline: '1-3 months',
    motivation: 'Growing family, need more space',
    propertyInterest: {
      types: ['Single Family'],
      locations: ['La Jolla', 'Del Mar', 'Carmel Valley'],
      bedrooms: { min: 4, max: 5 },
      bathrooms: { min: 3, max: 4 },
      features: ['Good Schools', 'Pool', 'Large Yard'],
    },
    notes: 'Expecting second child, currently in 2BR condo. Husband works in tech.',
    tags: ['Urgent', 'Growing Family', 'Tech Professional'],
    assignedTo: 'Jayden Metz',
    createdAt: new Date('2025-07-14'),
    updatedAt: new Date(),
    lastContactDate: new Date('2025-07-15'),
    nextFollowUpDate: new Date('2025-07-17'),
  },
  {
    id: '2',
    firstName: 'Robert',
    lastName: 'Davis',
    fullName: 'Robert Davis',
    email: 'rdavis@business.com',
    phone: '(858) 555-3210',
    secondaryPhone: '(858) 555-3211',
    source: 'Referral',
    sourceDetails: {
      referrerName: 'Michael Thompson',
      referrerType: 'Past Client',
      referralDate: new Date('2025-07-10'),
      referralNotes: 'Golf buddy looking to invest',
    },
    status: 'Contacted',
    score: 70,
    temperature: 'Warm',
    estimatedValue: 175000,
    type: 'Investor',
    budget: {
      min: 800000,
      max: 1200000,
      cashAvailable: 400000,
      financingPreApproved: true,
    },
    timeline: '3-6 months',
    motivation: 'Investment property for rental income',
    propertyInterest: {
      types: ['Multi-Family', 'Condo'],
      locations: ['Downtown', 'University City', 'Mission Valley'],
      units: { min: 2, max: 4 },
      targetCap: 6.5,
      targetCashFlow: 2000,
    },
    notes: 'Owns 3 rental properties already. Looking for 4th. Prefers newer construction.',
    tags: ['Investor', 'Cash Buyer', 'Repeat Investor'],
    assignedTo: 'Jayden Metz',
    createdAt: new Date('2025-07-10'),
    updatedAt: new Date(),
    lastContactDate: new Date('2025-07-12'),
    nextFollowUpDate: new Date('2025-07-19'),
  },
  {
    id: '3',
    firstName: 'Amanda',
    lastName: 'Chen',
    fullName: 'Amanda Chen',
    email: 'achen2025@gmail.com',
    phone: '(760) 555-4321',
    secondaryPhone: null,
    source: 'Open House',
    sourceDetails: {
      property: '789 Beach Drive, Carlsbad',
      date: new Date('2025-07-13'),
      agent: 'Sarah Johnson',
      feedback: 'Very interested, taking photos',
    },
    status: 'Qualified',
    score: 92,
    temperature: 'Hot',
    estimatedValue: 95000,
    type: 'Buyer',
    budget: {
      min: 500000,
      max: 650000,
      isPreApproved: true,
      preApprovalAmount: 650000,
      lender: 'Bank of America',
    },
    timeline: 'ASAP',
    motivation: 'First time buyer, getting married in 3 months',
    propertyInterest: {
      types: ['Condo', 'Townhouse'],
      locations: ['Carlsbad', 'Encinitas', 'Solana Beach'],
      bedrooms: { min: 2, max: 3 },
      bathrooms: { min: 2, max: 2 },
      features: ['Ocean View', 'Modern Kitchen', 'Parking'],
    },
    notes: 'Wedding in October, wants to close before then. Fiancé is a doctor at Scripps.',
    tags: ['First Time Buyer', 'Pre-Approved', 'Urgent Timeline'],
    assignedTo: 'Jayden Metz',
    createdAt: new Date('2025-07-13'),
    updatedAt: new Date(),
    lastContactDate: new Date('2025-07-16'),
    nextFollowUpDate: new Date('2025-07-17'),
  },
  {
    id: '4',
    firstName: 'Mark',
    lastName: 'Johnson',
    fullName: 'Mark Johnson',
    email: 'mjohnson@email.com',
    phone: '(619) 555-8765',
    secondaryPhone: null,
    source: 'Facebook Ad',
    sourceDetails: {
      campaign: 'Seller Leads July 2025',
      adSet: 'Home Valuation',
      creative: 'What\'s Your Home Worth?',
    },
    status: 'New',
    score: 65,
    temperature: 'Warm',
    estimatedValue: 87500,
    type: 'Seller',
    propertyDetails: {
      address: '456 Pine Street, San Diego, CA 92109',
      type: 'Single Family',
      bedrooms: 3,
      bathrooms: 2,
      sqft: 1800,
      yearBuilt: 1985,
      estimatedValue: 875000,
      mortgageBalance: 325000,
    },
    timeline: '6+ months',
    motivation: 'Thinking about downsizing after retirement',
    notes: 'Not in a rush, just exploring options. Wants to stay in San Diego area.',
    tags: ['Future Seller', 'Downsizing', 'Retirement'],
    assignedTo: 'Jayden Metz',
    createdAt: new Date('2025-07-15'),
    updatedAt: new Date(),
    lastContactDate: null,
    nextFollowUpDate: new Date('2025-07-18'),
  },
  {
    id: '5',
    firstName: 'Lisa',
    lastName: 'Anderson',
    fullName: 'Lisa Anderson',
    email: 'lisa.anderson@lawfirm.com',
    phone: '(858) 555-9876',
    secondaryPhone: null,
    source: 'Zillow',
    sourceDetails: {
      inquiry: 'Contact about 321 Sunset Blvd',
      message: 'Is this still available? Would like to schedule viewing this weekend.',
    },
    status: 'Nurturing',
    score: 55,
    temperature: 'Cold',
    estimatedValue: 62500,
    type: 'Buyer',
    budget: {
      min: 1000000,
      max: 1500000,
      isPreApproved: false,
    },
    timeline: '6+ months',
    motivation: 'Relocating from Bay Area for work',
    propertyInterest: {
      types: ['Single Family'],
      locations: ['La Jolla', 'Del Mar', 'Rancho Santa Fe'],
      bedrooms: { min: 4, max: 6 },
      bathrooms: { min: 3, max: 5 },
      features: ['Home Office', 'Guest House', 'Privacy'],
    },
    notes: 'Partner at law firm, relocating to open SD office. Very particular about property.',
    tags: ['Luxury Buyer', 'Relocating', 'Professional'],
    assignedTo: 'Jayden Metz',
    createdAt: new Date('2025-07-08'),
    updatedAt: new Date(),
    lastContactDate: new Date('2025-07-11'),
    nextFollowUpDate: new Date('2025-07-25'),
  },
];

class LeadMock {
  // Alias for compatibility with Mongoose-style queries
  static async find(filters = {}) {
    return this.findAll(filters);
  }

  static async findAll(filters = {}) {
    try {
      let filtered = [...mockLeads];

      // Apply type filter
      if (filters.type && filters.type !== 'all') {
        filtered = filtered.filter((l) => l.type === filters.type);
      }

      // Apply status filter
      if (filters.status) {
        filtered = filtered.filter((l) => l.status === filters.status);
      }

      // Apply temperature filter
      if (filters.temperature) {
        filtered = filtered.filter((l) => l.temperature === filters.temperature);
      }

      // Apply source filter
      if (filters.source) {
        filtered = filtered.filter((l) => l.source === filters.source);
      }

      // Apply score range filter
      if (filters.minScore) {
        filtered = filtered.filter((l) => l.score >= parseInt(filters.minScore));
      }
      if (filters.maxScore) {
        filtered = filtered.filter((l) => l.score <= parseInt(filters.maxScore));
      }

      // Apply search
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filtered = filtered.filter((l) => l.fullName.toLowerCase().includes(searchTerm)
          || l.email.toLowerCase().includes(searchTerm)
          || l.phone.includes(searchTerm)
          || l.notes.toLowerCase().includes(searchTerm));
      }

      // Apply sorting
      const sortField = filters.sort || 'createdAt';
      const sortOrder = filters.order === 'desc' ? -1 : 1;

      filtered.sort((a, b) => {
        if (sortField === 'score' || sortField === 'estimatedValue') {
          return (b[sortField] - a[sortField]) * sortOrder;
        }
        if (a[sortField] < b[sortField]) return -sortOrder;
        if (a[sortField] > b[sortField]) return sortOrder;
        return 0;
      });

      // Apply pagination
      const page = parseInt(filters.page) || 1;
      const limit = parseInt(filters.limit) || 20;
      const offset = (page - 1) * limit;
      const paginated = filtered.slice(offset, offset + limit);

      // Return minimal data for list view
      const minimalLeads = paginated.map((lead) => ({
        id: lead.id,
        fullName: lead.fullName,
        firstName: lead.firstName,
        lastName: lead.lastName,
        email: lead.email,
        phone: lead.phone,
        type: lead.type,
        status: lead.status,
        source: lead.source,
        score: lead.score,
        temperature: lead.temperature,
        estimatedValue: lead.estimatedValue,
        lastContactDate: lead.lastContactDate,
        nextFollowUpDate: lead.nextFollowUpDate,
        conversionProbability: lead.conversionProbability,
        tags: lead.tags,
        createdAt: lead.createdAt,
        updatedAt: lead.updatedAt,
      }));

      return {
        leads: minimalLeads,
        pagination: {
          total: filtered.length,
          page,
          pages: Math.ceil(filtered.length / limit),
          limit,
        },
      };
    } catch (error) {
      logger.error('Mock Lead.findAll error:', error);
      throw error;
    }
  }

  static async findById(id) {
    const lead = mockLeads.find((l) => l.id === id);
    if (!lead) return null;

    // Return comprehensive lead data for detail view
    return {
      ...lead,

      // Lead scoring details
      scoreBreakdown: {
        engagement: 25,
        budget: 20,
        timeline: 15,
        motivation: 20,
        responseTime: 10,
        profileCompleteness: 10,
        total: lead.score,
      },

      // Activity timeline
      activityTimeline: [
        {
          id: 1,
          date: lead.createdAt,
          type: 'created',
          title: 'Lead Created',
          description: `Lead came in from ${lead.source}`,
          icon: 'add',
        },
        ...(lead.lastContactDate ? [{
          id: 2,
          date: lead.lastContactDate,
          type: 'contact',
          title: 'Contact Attempt',
          description: 'Sent introduction email',
          icon: 'email',
        }] : []),
        ...(lead.status === 'Qualified' ? [{
          id: 3,
          date: new Date(lead.createdAt.getTime() + 2 * 24 * 60 * 60 * 1000),
          type: 'qualified',
          title: 'Lead Qualified',
          description: 'Lead meets all qualification criteria',
          icon: 'check',
        }] : []),
        {
          id: 4,
          date: new Date(),
          type: 'viewed',
          title: 'Profile Viewed',
          description: 'You viewed this lead profile',
          icon: 'visibility',
        },
      ],

      // Communication history
      communications: lead.lastContactDate ? [
        {
          id: 1,
          date: lead.lastContactDate,
          type: 'Email',
          subject: 'Welcome! Your property search starts here',
          status: 'Sent',
          opens: 2,
          clicks: 1,
        },
        ...(lead.status !== 'New' ? [{
          id: 2,
          date: new Date(lead.lastContactDate.getTime() - 24 * 60 * 60 * 1000),
          type: 'Phone',
          subject: 'Initial qualification call',
          status: 'No Answer',
          duration: 0,
          notes: 'Left voicemail',
        }] : []),
      ] : [],

      // Recommended properties (for buyer leads)
      recommendedProperties: lead.type === 'Buyer' ? [
        {
          id: '1',
          address: '123 Ocean View Dr, La Jolla',
          price: lead.budget.max * 0.9,
          bedrooms: lead.propertyInterest?.bedrooms?.min || 3,
          bathrooms: lead.propertyInterest?.bathrooms?.min || 2,
          sqft: 2400,
          matchScore: 92,
          image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400',
        },
        {
          id: '2',
          address: '456 Sunset Way, Del Mar',
          price: lead.budget.max * 0.95,
          bedrooms: lead.propertyInterest?.bedrooms?.min || 3,
          bathrooms: lead.propertyInterest?.bathrooms?.min || 2,
          sqft: 2600,
          matchScore: 88,
          image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400',
        },
        {
          id: '3',
          address: '789 Beach Rd, Carlsbad',
          price: lead.budget.min * 1.1,
          bedrooms: lead.propertyInterest?.bedrooms?.min || 3,
          bathrooms: lead.propertyInterest?.bathrooms?.min || 2,
          sqft: 2200,
          matchScore: 85,
          image: 'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=400',
        },
      ] : [],

      // Market analysis (for seller leads)
      marketAnalysis: lead.type === 'Seller' && lead.propertyDetails ? {
        estimatedValue: lead.propertyDetails.estimatedValue,
        valueRange: {
          low: lead.propertyDetails.estimatedValue * 0.95,
          high: lead.propertyDetails.estimatedValue * 1.05,
        },
        comparables: [
          {
            address: '123 Similar St',
            soldPrice: lead.propertyDetails.estimatedValue * 0.98,
            soldDate: new Date('2025-06-15'),
            sqft: lead.propertyDetails.sqft,
            pricePerSqft: Math.round((lead.propertyDetails.estimatedValue * 0.98) / lead.propertyDetails.sqft),
          },
          {
            address: '456 Nearby Ave',
            soldPrice: lead.propertyDetails.estimatedValue * 1.02,
            soldDate: new Date('2025-05-20'),
            sqft: lead.propertyDetails.sqft * 1.1,
            pricePerSqft: Math.round((lead.propertyDetails.estimatedValue * 1.02) / (lead.propertyDetails.sqft * 1.1)),
          },
        ],
        daysOnMarket: 22,
        listToSaleRatio: 0.98,
      } : null,

      // Lead nurture campaigns
      campaigns: [
        {
          id: 1,
          name: lead.type === 'Buyer' ? 'First Time Buyer Guide' : 'Home Seller Success',
          status: 'Active',
          emailsSent: 3,
          emailsOpened: 2,
          lastSent: new Date('2025-07-10'),
          nextScheduled: new Date('2025-07-17'),
        },
      ],

      // Tasks
      tasks: [
        {
          id: 1,
          title: 'Send property matches',
          dueDate: lead.nextFollowUpDate,
          priority: 'high',
          status: 'pending',
        },
        {
          id: 2,
          title: 'Schedule qualification call',
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          priority: 'medium',
          status: 'pending',
        },
      ],

      // AI insights
      aiInsights: {
        conversionProbability: lead.score,
        bestContactTime: 'Weekday evenings 6-8 PM',
        preferredCommunication: lead.source === 'Phone' ? 'Phone' : 'Email',
        buyerReadiness: lead.type === 'Buyer'
          ? (lead.timeline === 'ASAP' ? 'High' : lead.timeline === '1-3 months' ? 'Medium' : 'Low') : null,
        sellerReadiness: lead.type === 'Seller'
          ? (lead.timeline === 'ASAP' ? 'High' : lead.timeline === '1-3 months' ? 'Medium' : 'Low') : null,
        recommendedActions: [
          'Send personalized property matches',
          'Schedule follow-up call',
          'Add to nurture campaign',
          'Set up property alerts',
        ],
        personalityInsights: {
          decisionStyle: 'Analytical',
          communicationPreference: 'Detailed information',
          riskTolerance: 'Moderate',
        },
      },

      // Similar leads
      similarLeads: mockLeads
        .filter((l) => l.id !== id && l.type === lead.type)
        .slice(0, 3)
        .map((l) => ({
          id: l.id,
          name: l.fullName,
          score: l.score,
          status: l.status,
          createdAt: l.createdAt,
        })),
    };
  }

  static async create(data) {
    try {
      const id = String(Math.max(...mockLeads.map((l) => parseInt(l.id) || 0)) + 1);

      // Calculate initial lead score
      let score = 50; // Base score
      if (data.budget?.isPreApproved) score += 20;
      if (data.timeline === 'ASAP') score += 15;
      else if (data.timeline === '1-3 months') score += 10;
      if (data.source === 'Referral') score += 10;
      if (data.email && data.phone) score += 5;

      // Determine temperature based on score
      let temperature = 'Cold';
      if (score >= 80) temperature = 'Hot';
      else if (score >= 65) temperature = 'Warm';

      const newLead = {
        id,
        firstName: data.firstName,
        lastName: data.lastName,
        fullName: `${data.firstName} ${data.lastName}`,
        email: data.email,
        phone: data.phone,
        secondaryPhone: data.secondaryPhone || null,
        source: data.source || 'Website',
        sourceDetails: data.sourceDetails || {},
        status: data.status || 'New',
        score,
        temperature,
        estimatedValue: data.estimatedValue || (data.budget?.max ? data.budget.max * 0.025 : 50000),
        type: data.type || 'Buyer',
        budget: data.budget || {},
        timeline: data.timeline || '3-6 months',
        motivation: data.motivation || '',
        propertyInterest: data.propertyInterest || {},
        propertyDetails: data.propertyDetails || null,
        notes: data.notes || '',
        tags: data.tags || [],
        assignedTo: data.assignedTo || 'Jayden Metz',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastContactDate: null,
        nextFollowUpDate: data.nextFollowUpDate ? new Date(data.nextFollowUpDate) : new Date(Date.now() + 24 * 60 * 60 * 1000),
      };

      mockLeads.push(newLead);

      logger.info('Mock lead created:', {
        id: newLead.id,
        fullName: newLead.fullName,
        type: newLead.type,
        score: newLead.score,
      });

      return newLead;
    } catch (error) {
      logger.error('Mock Lead.create error:', error);
      throw error;
    }
  }

  static async update(id, data) {
    try {
      const index = mockLeads.findIndex((l) => l.id === id);
      if (index === -1) {
        return null;
      }

      const currentLead = mockLeads[index];

      // Update the lead
      mockLeads[index] = {
        ...currentLead,
        ...data,
        fullName: data.firstName && data.lastName
          ? `${data.firstName} ${data.lastName}`
          : currentLead.fullName,
        updatedAt: new Date(),
      };

      // Recalculate score if relevant fields changed
      if (data.budget || data.timeline || data.status) {
        const lead = mockLeads[index];
        let score = 50;
        if (lead.budget?.isPreApproved) score += 20;
        if (lead.timeline === 'ASAP') score += 15;
        else if (lead.timeline === '1-3 months') score += 10;
        if (lead.source === 'Referral') score += 10;
        if (lead.status === 'Qualified') score += 10;
        if (lead.email && lead.phone) score += 5;

        mockLeads[index].score = Math.min(score, 100);

        // Update temperature
        if (mockLeads[index].score >= 80) mockLeads[index].temperature = 'Hot';
        else if (mockLeads[index].score >= 65) mockLeads[index].temperature = 'Warm';
        else mockLeads[index].temperature = 'Cold';
      }

      logger.info('Mock lead updated:', {
        id,
        changes: Object.keys(data),
      });

      return mockLeads[index];
    } catch (error) {
      logger.error('Mock Lead.update error:', error);
      throw error;
    }
  }

  static async updateStatus(id, status, note) {
    try {
      const lead = await this.update(id, { status });
      if (lead && note) {
        logger.info('Lead status updated with note:', { id, status, note });
      }
      return lead;
    } catch (error) {
      logger.error('Mock Lead.updateStatus error:', error);
      throw error;
    }
  }

  static async updateScore(id, score, reason) {
    try {
      const lead = await this.update(id, {
        score: Math.min(Math.max(score, 0), 100),
      });

      if (lead) {
        // Update temperature based on new score
        let temperature = 'Cold';
        if (lead.score >= 80) temperature = 'Hot';
        else if (lead.score >= 65) temperature = 'Warm';

        await this.update(id, { temperature });

        logger.info('Lead score updated:', { id, score, reason });
      }

      return lead;
    } catch (error) {
      logger.error('Mock Lead.updateScore error:', error);
      throw error;
    }
  }

  static async convert(id, clientData) {
    try {
      const lead = mockLeads.find((l) => l.id === id);
      if (!lead) return null;

      // Update lead status
      await this.updateStatus(id, 'Converted');

      logger.info('Lead converted to client:', {
        leadId: id,
        clientData,
      });

      // In a real implementation, this would create a new client record
      return {
        success: true,
        leadId: id,
        clientId: Date.now().toString(),
        ...clientData,
      };
    } catch (error) {
      logger.error('Mock Lead.convert error:', error);
      throw error;
    }
  }

  static async logActivity(id, activity) {
    try {
      const lead = mockLeads.find((l) => l.id === id);
      if (!lead) return null;

      // Update last contact date if communication activity
      if (['Email', 'Phone', 'Text', 'Meeting'].includes(activity.type)) {
        await this.update(id, {
          lastContactDate: new Date(),
          nextFollowUpDate: activity.nextFollowUpDate || null,
        });
      }

      logger.info('Activity logged for lead:', {
        leadId: id,
        type: activity.type,
        subject: activity.subject,
      });

      return {
        id: Date.now(),
        leadId: id,
        ...activity,
        createdAt: new Date(),
      };
    } catch (error) {
      logger.error('Mock Lead.logActivity error:', error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      const index = mockLeads.findIndex((l) => l.id === id);
      if (index === -1) {
        throw new Error('Lead not found');
      }

      const deletedLead = mockLeads[index];
      mockLeads.splice(index, 1);

      logger.info('Mock lead deleted:', {
        id,
        fullName: deletedLead.fullName,
      });

      return deletedLead;
    } catch (error) {
      logger.error('Mock Lead.delete error:', error);
      throw error;
    }
  }

  static async getStats() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());

    const thisMonth = mockLeads.filter((l) => l.createdAt >= startOfMonth);
    const thisWeek = mockLeads.filter((l) => l.createdAt >= startOfWeek);

    return {
      total: mockLeads.length,
      new: mockLeads.filter((l) => l.status === 'New').length,
      thisWeek: thisWeek.length,
      thisMonth: thisMonth.length,
      byStatus: {
        new: mockLeads.filter((l) => l.status === 'New').length,
        contacted: mockLeads.filter((l) => l.status === 'Contacted').length,
        qualified: mockLeads.filter((l) => l.status === 'Qualified').length,
        nurturing: mockLeads.filter((l) => l.status === 'Nurturing').length,
        converted: mockLeads.filter((l) => l.status === 'Converted').length,
        lost: mockLeads.filter((l) => l.status === 'Lost').length,
      },
      byType: {
        buyer: mockLeads.filter((l) => l.type === 'Buyer').length,
        seller: mockLeads.filter((l) => l.type === 'Seller').length,
        investor: mockLeads.filter((l) => l.type === 'Investor').length,
        renter: mockLeads.filter((l) => l.type === 'Renter').length,
      },
      bySource: {
        website: mockLeads.filter((l) => l.source === 'Website').length,
        referral: mockLeads.filter((l) => l.source === 'Referral').length,
        zillow: mockLeads.filter((l) => l.source === 'Zillow').length,
        facebook: mockLeads.filter((l) => l.source === 'Facebook Ad').length,
        openHouse: mockLeads.filter((l) => l.source === 'Open House').length,
        other: mockLeads.filter((l) => !['Website', 'Referral', 'Zillow', 'Facebook Ad', 'Open House'].includes(l.source)).length,
      },
      byTemperature: {
        hot: mockLeads.filter((l) => l.temperature === 'Hot').length,
        warm: mockLeads.filter((l) => l.temperature === 'Warm').length,
        cold: mockLeads.filter((l) => l.temperature === 'Cold').length,
      },
      avgScore: Math.round(mockLeads.reduce((sum, l) => sum + l.score, 0) / mockLeads.length),
      totalEstimatedValue: mockLeads.reduce((sum, l) => sum + l.estimatedValue, 0),
      conversionRate: Math.round(
        (mockLeads.filter((l) => l.status === 'Converted').length / mockLeads.length) * 100,
      ),
    };
  }

  static async getHotLeads(limit = 10) {
    return mockLeads
      .filter((l) => l.temperature === 'Hot' && l.status !== 'Converted' && l.status !== 'Lost')
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }
}

module.exports = LeadMock;
