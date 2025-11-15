// Mock Client model for development and testing
const logger = require('../../../utils/logger');
const MockQueryBuilder = require('./MockQueryBuilder');

// Comprehensive mock clients data
const mockClients = [
  {
    id: '1',
    firstName: 'Michael',
    lastName: 'Thompson',
    fullName: 'Michael Thompson',
    email: 'michael.thompson@email.com',
    phone: '(619) 555-1234',
    secondaryPhone: '(619) 555-1235',
    clientType: 'Buyer',
    status: 'Active',
    source: 'Referral',
    referredBy: 'Sarah Johnson',
    preApproved: true,
    preApprovalAmount: 950000,
    preApprovalLender: 'Wells Fargo',
    preApprovalExpiration: new Date('2025-10-15'),
    currentRent: 3500,
    desiredMoveDate: new Date('2025-09-01'),
    preferredCommunication: 'Email',
    notes: 'Looking for single family home with good schools. Wife is pregnant, need to move before baby arrives.',
    tags: ['First Time Buyer', 'Pre-Approved', 'Urgent'],
    createdAt: new Date('2025-06-01'),
    updatedAt: new Date(),
    lastContactDate: new Date('2025-07-10'),
    nextFollowUpDate: new Date('2025-07-20'),
    // Location preferences
    address: '789 Rental Street',
    city: 'San Diego',
    state: 'CA',
    zipCode: '92122',
    // Additional details
    occupation: 'Software Engineer',
    employer: 'Tech Corp',
    annualIncome: 185000,
    birthday: new Date('1988-06-15'),
    anniversaryDate: new Date('2015-09-20'),
    spouseName: 'Jennifer Thompson',
    children: ['Emma (5)'],
    pets: ['Max (Golden Retriever)'],
  },
  {
    id: '2',
    firstName: 'Elizabeth',
    lastName: 'Martinez',
    fullName: 'Elizabeth Martinez',
    email: 'liz.martinez@email.com',
    phone: '(858) 555-2345',
    secondaryPhone: null,
    clientType: 'Seller',
    status: 'Active',
    source: 'Website',
    referredBy: null,
    preApproved: false,
    preApprovalAmount: null,
    preApprovalLender: null,
    preApprovalExpiration: null,
    currentRent: null,
    desiredMoveDate: new Date('2025-08-01'),
    preferredCommunication: 'Phone',
    notes: 'Downsizing after kids moved out. Want to list current home and buy smaller condo near beach.',
    tags: ['Downsizing', 'Cash Buyer', 'Repeat Client'],
    createdAt: new Date('2025-05-15'),
    updatedAt: new Date(),
    lastContactDate: new Date('2025-07-12'),
    nextFollowUpDate: new Date('2025-07-18'),
    // Location preferences
    address: '456 Ocean View Drive',
    city: 'La Jolla',
    state: 'CA',
    zipCode: '92037',
    // Additional details
    occupation: 'Retired Teacher',
    employer: 'Retired',
    annualIncome: 85000,
    birthday: new Date('1958-03-22'),
    anniversaryDate: null,
    spouseName: null,
    children: ['David (28)', 'Maria (25)'],
    pets: [],
  },
  {
    id: '3',
    firstName: 'David',
    lastName: 'Chen',
    fullName: 'David Chen',
    email: 'david.chen@techstartup.com',
    phone: '(760) 555-3456',
    secondaryPhone: '(760) 555-3457',
    clientType: 'Buyer',
    status: 'Hot Lead',
    source: 'Open House',
    referredBy: null,
    preApproved: true,
    preApprovalAmount: 1500000,
    preApprovalLender: 'Chase Bank',
    preApprovalExpiration: new Date('2025-09-30'),
    currentRent: 4200,
    desiredMoveDate: new Date('2025-08-15'),
    preferredCommunication: 'Text',
    notes: 'Tech entrepreneur, all cash offer possible. Looking for modern home with home office space.',
    tags: ['Luxury Buyer', 'Cash Buyer', 'Investor'],
    createdAt: new Date('2025-07-01'),
    updatedAt: new Date(),
    lastContactDate: new Date('2025-07-15'),
    nextFollowUpDate: new Date('2025-07-17'),
    // Location preferences
    address: '321 Tech Park Blvd',
    city: 'Del Mar',
    state: 'CA',
    zipCode: '92014',
    // Additional details
    occupation: 'CEO/Founder',
    employer: 'InnovateTech Inc',
    annualIncome: 450000,
    birthday: new Date('1985-11-08'),
    anniversaryDate: new Date('2018-06-15'),
    spouseName: 'Linda Chen',
    children: [],
    pets: ['Whiskers (Cat)', 'Shadow (Cat)'],
  },
  {
    id: '4',
    firstName: 'Sarah',
    lastName: 'Williams',
    fullName: 'Sarah Williams',
    email: 'sarah.w@lawfirm.com',
    phone: '(619) 555-4567',
    secondaryPhone: null,
    clientType: 'Past Client',
    status: 'Inactive',
    source: 'Referral',
    referredBy: 'Mark Johnson',
    preApproved: false,
    preApprovalAmount: null,
    preApprovalLender: null,
    preApprovalExpiration: null,
    currentRent: null,
    desiredMoveDate: null,
    preferredCommunication: 'Email',
    notes: 'Purchased home in 2023. Very happy with service. Good source for referrals.',
    tags: ['Past Buyer', 'Referral Source'],
    createdAt: new Date('2023-03-15'),
    updatedAt: new Date('2023-08-20'),
    lastContactDate: new Date('2025-05-01'),
    nextFollowUpDate: new Date('2025-12-01'),
    // Location preferences
    address: '888 Sunset Way',
    city: 'Carlsbad',
    state: 'CA',
    zipCode: '92008',
    // Additional details
    occupation: 'Attorney',
    employer: 'Williams & Associates',
    annualIncome: 225000,
    birthday: new Date('1979-09-14'),
    anniversaryDate: new Date('2010-05-20'),
    spouseName: 'Robert Williams',
    children: ['Sophie (12)', 'James (10)'],
    pets: ['Bailey (Labrador)'],
  },
];

class ClientMock {
  // Mongoose-style query builder
  static find(filters = {}) {
    const query = new MockQueryBuilder(this, mockClients);
    if (filters) {
      Object.assign(query.filters, filters);
    }
    return query;
  }

  static async findAll(filters = {}) {
    try {
      let filtered = [...mockClients];

      // Apply client type filter
      if (filters.clientType && filters.clientType !== 'all') {
        filtered = filtered.filter((c) => c.clientType === filters.clientType);
      }

      // Apply status filter
      if (filters.status) {
        filtered = filtered.filter((c) => c.status === filters.status);
      }

      // Apply source filter
      if (filters.source) {
        filtered = filtered.filter((c) => c.source === filters.source);
      }

      // Apply tag filter
      if (filters.tag) {
        filtered = filtered.filter((c) => c.tags.includes(filters.tag));
      }

      // Apply search
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filtered = filtered.filter((c) => c.fullName.toLowerCase().includes(searchTerm)
          || c.email.toLowerCase().includes(searchTerm)
          || c.phone.includes(searchTerm)
          || c.notes.toLowerCase().includes(searchTerm));
      }

      // Apply sorting
      const sortField = filters.sort || 'createdAt';
      const sortOrder = filters.order === 'desc' ? -1 : 1;

      filtered.sort((a, b) => {
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
      const minimalClients = paginated.map((client) => ({
        id: client.id,
        fullName: client.fullName,
        firstName: client.firstName,
        lastName: client.lastName,
        email: client.email,
        phone: client.phone,
        clientType: client.clientType,
        status: client.status,
        source: client.source,
        tags: client.tags,
        preApproved: client.preApproved,
        preApprovalAmount: client.preApprovalAmount,
        lastContactDate: client.lastContactDate,
        nextFollowUpDate: client.nextFollowUpDate,
        createdAt: client.createdAt,
        updatedAt: client.updatedAt,
      }));

      return {
        clients: minimalClients,
        pagination: {
          total: filtered.length,
          page,
          pages: Math.ceil(filtered.length / limit),
          limit,
        },
      };
    } catch (error) {
      logger.error('Mock Client.findAll error:', error);
      throw error;
    }
  }

  static async findById(id) {
    const client = mockClients.find((c) => c.id === id);
    if (!client) return null;

    // Return comprehensive client data for detail view
    return {
      ...client,

      // Communication history
      communicationHistory: [
        {
          id: 1,
          date: new Date('2025-07-15'),
          type: 'Email',
          subject: 'New Listings Matching Your Criteria',
          notes: 'Sent 3 properties, client interested in 123 Main St',
          duration: null,
          outcome: 'Scheduled showing',
        },
        {
          id: 2,
          date: new Date('2025-07-10'),
          type: 'Phone',
          subject: 'Follow-up on weekend showings',
          notes: 'Discussed pros/cons of viewed properties. Client wants to see more options in La Jolla area.',
          duration: 15,
          outcome: 'Continue searching',
        },
        {
          id: 3,
          date: new Date('2025-07-05'),
          type: 'In-Person',
          subject: 'Property showings',
          notes: 'Showed 4 properties. Client loved 456 Oak Ave but concerned about HOA fees.',
          duration: 120,
          outcome: 'Researching HOA details',
        },
        {
          id: 4,
          date: new Date('2025-06-28'),
          type: 'Text',
          subject: 'Quick question about pre-approval',
          notes: 'Client asked about updating pre-approval amount. Referred to lender.',
          duration: null,
          outcome: 'Information provided',
        },
      ],

      // Properties data
      properties: {
        // Owned properties (for sellers)
        owned: client.clientType === 'Seller' ? [
          {
            id: 1,
            address: client.address,
            estimatedValue: 1250000,
            mortgageBalance: 450000,
            monthlyPayment: 3200,
            purchaseDate: new Date('2015-06-15'),
            purchasePrice: 750000,
          },
        ] : [],

        // Interested properties (for buyers)
        interested: client.clientType === 'Buyer' ? [
          {
            id: '1',
            address: '123 Main Street, San Diego, CA',
            listPrice: 850000,
            status: 'Active',
            addedDate: new Date('2025-07-12'),
            notes: 'Loves the kitchen, concerned about street noise',
            rating: 4,
          },
          {
            id: '2',
            address: '456 Oak Avenue, La Jolla, CA',
            listPrice: 1250000,
            status: 'Active',
            addedDate: new Date('2025-07-08'),
            notes: 'Perfect location, high HOA fees',
            rating: 3,
          },
          {
            id: '3',
            address: '789 Beach Drive, Carlsbad, CA',
            listPrice: 2100000,
            status: 'Pending',
            addedDate: new Date('2025-07-01'),
            notes: 'Dream home but over budget',
            rating: 5,
          },
        ] : [],

        // Viewed properties
        viewed: [
          {
            id: '1',
            address: '111 Vista Drive, Encinitas, CA',
            listPrice: 925000,
            viewedDate: new Date('2025-07-05'),
            feedback: 'Too small, no home office space',
          },
          {
            id: '2',
            address: '222 Garden Way, Solana Beach, CA',
            listPrice: 1100000,
            viewedDate: new Date('2025-07-05'),
            feedback: 'Loved it but someone else got offer accepted first',
          },
        ],
      },

      // Documents
      documents: [
        {
          id: 1,
          name: 'Pre-Approval Letter',
          type: 'financial',
          size: '156 KB',
          uploadedDate: new Date('2025-06-01').toISOString(),
          expirationDate: client.preApprovalExpiration?.toISOString() || null,
        },
        {
          id: 2,
          name: 'Proof of Funds',
          type: 'financial',
          size: '89 KB',
          uploadedDate: new Date('2025-06-15').toISOString(),
          expirationDate: null,
        },
        {
          id: 3,
          name: 'Buyer Representation Agreement',
          type: 'contract',
          size: '234 KB',
          uploadedDate: new Date('2025-06-01').toISOString(),
          expirationDate: new Date('2025-12-01').toISOString(),
        },
      ],

      // Tasks & reminders
      tasks: [
        {
          id: 1,
          title: 'Send new listings in La Jolla',
          dueDate: new Date('2025-07-20'),
          priority: 'high',
          status: 'pending',
          notes: 'Focus on 3-4 bedrooms, prefer ocean views',
        },
        {
          id: 2,
          title: 'Follow up on mortgage rate update',
          dueDate: new Date('2025-07-22'),
          priority: 'medium',
          status: 'pending',
          notes: 'Client checking with lender about rate lock',
        },
        {
          id: 3,
          title: 'Schedule weekend showings',
          dueDate: new Date('2025-07-18'),
          priority: 'high',
          status: 'completed',
          notes: 'Confirmed for Saturday 10am-2pm',
        },
      ],

      // Financial summary (for buyers)
      financialSummary: client.clientType === 'Buyer' ? {
        preApprovalAmount: client.preApprovalAmount,
        downPaymentAvailable: client.preApprovalAmount ? client.preApprovalAmount * 0.2 : 0,
        monthlyBudget: Math.round((client.annualIncome / 12) * 0.28), // 28% DTI
        currentRent: client.currentRent,
        creditScore: 750,
        debtToIncome: 22,
      } : null,

      // Preferences (for buyers)
      preferences: client.clientType === 'Buyer' ? {
        propertyTypes: ['Single Family', 'Townhouse'],
        bedrooms: { min: 3, max: 5 },
        bathrooms: { min: 2, max: 4 },
        priceRange: {
          min: client.preApprovalAmount ? client.preApprovalAmount * 0.8 : 0,
          max: client.preApprovalAmount || 0,
        },
        locations: ['La Jolla', 'Del Mar', 'Carmel Valley', 'Encinitas'],
        mustHaves: ['Home Office', 'Good Schools', 'Garage', 'Updated Kitchen'],
        niceToHaves: ['Pool', 'Ocean View', 'Large Yard'],
        dealBreakers: ['Busy Street', 'Major Repairs Needed', 'No Parking'],
      } : null,

      // Listing performance (for sellers)
      listingPerformance: client.clientType === 'Seller' && client.properties?.owned?.[0] ? {
        currentListing: {
          address: client.address,
          listPrice: 1250000,
          daysOnMarket: 15,
          showings: 8,
          offers: 1,
          views: 234,
          favorites: 18,
          priceReductions: 0,
        },
        marketAnalysis: {
          estimatedValue: 1250000,
          pricePerSqft: 521,
          neighborhoodAverage: 495,
          recentComps: [
            {
              address: '123 Nearby St',
              soldPrice: 1225000,
              soldDate: new Date('2025-06-15'),
              daysOnMarket: 12,
            },
            {
              address: '456 Similar Ave',
              soldPrice: 1275000,
              soldDate: new Date('2025-05-20'),
              daysOnMarket: 8,
            },
          ],
        },
      } : null,

      // Activity timeline
      activityTimeline: [
        {
          id: 1,
          date: new Date('2025-07-15'),
          type: 'communication',
          title: 'Sent property matches',
          description: 'Emailed 3 new listings matching criteria',
          icon: 'email',
        },
        {
          id: 2,
          date: new Date('2025-07-10'),
          type: 'meeting',
          title: 'Phone consultation',
          description: 'Discussed weekend showing feedback',
          icon: 'phone',
        },
        {
          id: 3,
          date: new Date('2025-07-05'),
          type: 'showing',
          title: 'Property tour',
          description: 'Showed 4 properties in La Jolla/Del Mar',
          icon: 'home',
        },
        {
          id: 4,
          date: new Date('2025-06-28'),
          type: 'document',
          title: 'Document uploaded',
          description: 'Updated pre-approval letter received',
          icon: 'document',
        },
        {
          id: 5,
          date: new Date('2025-06-15'),
          type: 'milestone',
          title: 'Pre-approval obtained',
          description: `Pre-approved for $${client.preApprovalAmount?.toLocaleString() || 0}`,
          icon: 'check',
        },
      ],

      // AI insights
      aiInsights: {
        engagementScore: 85,
        readinessToBuy: client.clientType === 'Buyer' ? 'High' : null,
        readinessToSell: client.clientType === 'Seller' ? 'Medium' : null,
        recommendedActions: [
          'Schedule follow-up for new listings',
          'Check on mortgage rate lock status',
          'Send market update report',
          'Invite to weekend open houses',
        ],
        personalityProfile: {
          communicationStyle: 'Direct and efficient',
          decisionMaking: 'Analytical',
          priorities: ['Location', 'Schools', 'Investment Value'],
          concerns: ['Timing', 'Market Conditions', 'Interest Rates'],
        },
      },

      // Related contacts
      relatedContacts: [
        ...(client.spouseName ? [{
          id: 'spouse-1',
          name: client.spouseName,
          relationship: 'Spouse',
          phone: client.secondaryPhone,
          email: null,
          notes: 'Decision maker',
        }] : []),
        ...(client.referredBy ? [{
          id: 'referrer-1',
          name: client.referredBy,
          relationship: 'Referrer',
          phone: null,
          email: null,
          notes: 'Sent referral bonus',
        }] : []),
      ],
    };
  }

  static async create(data) {
    try {
      const id = String(Math.max(...mockClients.map((c) => parseInt(c.id) || 0)) + 1);

      const newClient = {
        id,
        firstName: data.firstName,
        lastName: data.lastName,
        fullName: `${data.firstName} ${data.lastName}`,
        email: data.email,
        phone: data.phone,
        secondaryPhone: data.secondaryPhone || null,
        clientType: data.clientType || 'Lead',
        status: data.status || 'New',
        source: data.source || 'Website',
        referredBy: data.referredBy || null,
        preApproved: data.preApproved || false,
        preApprovalAmount: data.preApprovalAmount || null,
        preApprovalLender: data.preApprovalLender || null,
        preApprovalExpiration: data.preApprovalExpiration ? new Date(data.preApprovalExpiration) : null,
        currentRent: data.currentRent || null,
        desiredMoveDate: data.desiredMoveDate ? new Date(data.desiredMoveDate) : null,
        preferredCommunication: data.preferredCommunication || 'Email',
        notes: data.notes || '',
        tags: data.tags || [],
        createdAt: new Date(),
        updatedAt: new Date(),
        lastContactDate: new Date(),
        nextFollowUpDate: data.nextFollowUpDate ? new Date(data.nextFollowUpDate) : null,
        // Location
        address: data.address || '',
        city: data.city || '',
        state: data.state || 'CA',
        zipCode: data.zipCode || '',
        // Additional details
        occupation: data.occupation || '',
        employer: data.employer || '',
        annualIncome: data.annualIncome || null,
        birthday: data.birthday ? new Date(data.birthday) : null,
        anniversaryDate: data.anniversaryDate ? new Date(data.anniversaryDate) : null,
        spouseName: data.spouseName || null,
        children: data.children || [],
        pets: data.pets || [],
      };

      mockClients.push(newClient);

      logger.info('Mock client created:', {
        id: newClient.id,
        fullName: newClient.fullName,
        clientType: newClient.clientType,
      });

      return newClient;
    } catch (error) {
      logger.error('Mock Client.create error:', error);
      throw error;
    }
  }

  static async update(id, data) {
    try {
      const index = mockClients.findIndex((c) => c.id === id);
      if (index === -1) {
        return null;
      }

      const currentClient = mockClients[index];

      // Update the client
      mockClients[index] = {
        ...currentClient,
        ...data,
        fullName: data.firstName && data.lastName
          ? `${data.firstName} ${data.lastName}`
          : currentClient.fullName,
        updatedAt: new Date(),
      };

      // Update lastContactDate if specified
      if (data.updateLastContact) {
        mockClients[index].lastContactDate = new Date();
      }

      logger.info('Mock client updated:', {
        id,
        changes: Object.keys(data),
      });

      return mockClients[index];
    } catch (error) {
      logger.error('Mock Client.update error:', error);
      throw error;
    }
  }

  static async updateStatus(id, status, note) {
    try {
      const client = await this.update(id, { status });
      if (client && note) {
        logger.info('Client status updated with note:', { id, status, note });
      }
      return client;
    } catch (error) {
      logger.error('Mock Client.updateStatus error:', error);
      throw error;
    }
  }

  static async logCommunication(id, communicationData) {
    try {
      const client = mockClients.find((c) => c.id === id);
      if (!client) return null;

      // Update last contact date
      await this.update(id, {
        lastContactDate: new Date(),
        nextFollowUpDate: communicationData.nextFollowUpDate || null,
      });

      logger.info('Communication logged:', {
        clientId: id,
        type: communicationData.type,
        subject: communicationData.subject,
      });

      return {
        id: Date.now(),
        clientId: id,
        ...communicationData,
        createdAt: new Date(),
      };
    } catch (error) {
      logger.error('Mock Client.logCommunication error:', error);
      throw error;
    }
  }

  static async addTag(id, tag) {
    try {
      const client = mockClients.find((c) => c.id === id);
      if (!client) return null;

      if (!client.tags.includes(tag)) {
        client.tags.push(tag);
        client.updatedAt = new Date();
      }

      logger.info('Tag added to client:', { id, tag });
      return client;
    } catch (error) {
      logger.error('Mock Client.addTag error:', error);
      throw error;
    }
  }

  static async removeTag(id, tag) {
    try {
      const client = mockClients.find((c) => c.id === id);
      if (!client) return null;

      client.tags = client.tags.filter((t) => t !== tag);
      client.updatedAt = new Date();

      logger.info('Tag removed from client:', { id, tag });
      return client;
    } catch (error) {
      logger.error('Mock Client.removeTag error:', error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      const index = mockClients.findIndex((c) => c.id === id);
      if (index === -1) {
        throw new Error('Client not found');
      }

      const deletedClient = mockClients[index];
      mockClients.splice(index, 1);

      logger.info('Mock client deleted:', {
        id,
        fullName: deletedClient.fullName,
      });

      return deletedClient;
    } catch (error) {
      logger.error('Mock Client.delete error:', error);
      throw error;
    }
  }

  static async getStats() {
    const total = mockClients.length;
    const buyers = mockClients.filter((c) => c.clientType === 'Buyer').length;
    const sellers = mockClients.filter((c) => c.clientType === 'Seller').length;
    const active = mockClients.filter((c) => c.status === 'Active').length;
    const hotLeads = mockClients.filter((c) => c.status === 'Hot Lead').length;

    return {
      total,
      byType: {
        buyers,
        sellers,
        pastClients: mockClients.filter((c) => c.clientType === 'Past Client').length,
        leads: mockClients.filter((c) => c.clientType === 'Lead').length,
      },
      byStatus: {
        active,
        hotLeads,
        inactive: mockClients.filter((c) => c.status === 'Inactive').length,
        new: mockClients.filter((c) => c.status === 'New').length,
      },
      bySource: {
        referral: mockClients.filter((c) => c.source === 'Referral').length,
        website: mockClients.filter((c) => c.source === 'Website').length,
        openHouse: mockClients.filter((c) => c.source === 'Open House').length,
        other: mockClients.filter((c) => !['Referral', 'Website', 'Open House'].includes(c.source)).length,
      },
    };
  }
}

module.exports = ClientMock;
