// Mock Escrow model for development and testing
const logger = require('../../../../utils/logger');

// In-memory storage for mock data
const mockEscrows = [
  {
    id: '1',
    escrowNumber: 'ESC-2025-001',
    propertyAddress: '456 Ocean View Dr, La Jolla, CA 92037',
    propertyType: 'Single Family',
    propertyImage: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400',
    purchasePrice: 1250000,
    escrowStatus: 'Active',
    currentStage: 'Inspection',
    closingDate: new Date('2025-08-15'),
    daysToClose: 30,
    grossCommission: 31250,
    buyers: [{
      name: 'Michael & Sarah Chen',
      email: 'chen.family@email.com',
      phone: '(858) 555-1234',
    }],
    sellers: [{
      name: 'Robert Johnson',
      email: 'rjohnson@email.com',
      phone: '(858) 555-5678',
    }],
    acceptanceDate: new Date('2025-07-01'),
    earnestMoneyDeposit: 37500,
    downPayment: 250000,
    loanAmount: 1000000,
    commissionPercentage: 2.5,
    escrowCompany: 'Pacific Escrow Services',
    escrowOfficer: 'Jennifer Martinez',
    titleCompany: 'First American Title',
    lender: 'Wells Fargo Home Mortgage',
    createdAt: new Date('2025-07-01'),
    updatedAt: new Date(),
  },
  {
    id: '2',
    escrowNumber: 'ESC-2025-002',
    propertyAddress: '789 Sunset Blvd, Del Mar, CA 92014',
    propertyType: 'Condo',
    propertyImage: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400',
    purchasePrice: 850000,
    escrowStatus: 'Pending',
    currentStage: 'Appraisal',
    closingDate: new Date('2025-07-25'),
    daysToClose: 8,
    grossCommission: 21250,
    buyers: [{
      name: 'Emily Davis',
      email: 'emily.davis@email.com',
      phone: '(760) 555-2345',
    }],
    sellers: [{
      name: 'Thomas & Margaret Anderson',
      email: 'andersons@email.com',
      phone: '(760) 555-6789',
    }],
    acceptanceDate: new Date('2025-06-25'),
    earnestMoneyDeposit: 25500,
    downPayment: 170000,
    loanAmount: 680000,
    commissionPercentage: 2.5,
    escrowCompany: 'Coastal Escrow',
    escrowOfficer: 'Maria Rodriguez',
    titleCompany: 'Chicago Title',
    lender: 'Bank of America',
    createdAt: new Date('2025-06-25'),
    updatedAt: new Date(),
  },
  {
    id: '3',
    escrowNumber: 'ESC-2025-003',
    propertyAddress: '321 Palm Ave, Coronado, CA 92118',
    propertyType: 'Townhouse',
    propertyImage: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400',
    purchasePrice: 1450000,
    escrowStatus: 'Closing',
    currentStage: 'Final Walkthrough',
    closingDate: new Date('2025-07-20'),
    daysToClose: 3,
    grossCommission: 36250,
    buyers: [{
      name: 'David & Lisa Park',
      email: 'park.family@email.com',
      phone: '(619) 555-3456',
    }],
    sellers: [{
      name: 'William Thompson',
      email: 'w.thompson@email.com',
      phone: '(619) 555-7890',
    }],
    acceptanceDate: new Date('2025-06-20'),
    earnestMoneyDeposit: 43500,
    downPayment: 290000,
    loanAmount: 1160000,
    commissionPercentage: 2.5,
    escrowCompany: 'Premier Escrow Services',
    escrowOfficer: 'James Wilson',
    titleCompany: 'Stewart Title',
    lender: 'Chase Home Finance',
    createdAt: new Date('2025-06-20'),
    updatedAt: new Date(),
  },
];

class EscrowMock {
  static async findAll(filters = {}) {
    try {
      let filtered = [...mockEscrows];

      // Apply status filter
      if (filters.status && filters.status !== 'all') {
        filtered = filtered.filter((e) => e.escrowStatus === filters.status);
      }

      // Apply price filters
      if (filters.minPrice) {
        filtered = filtered.filter((e) => e.purchasePrice >= parseFloat(filters.minPrice));
      }
      if (filters.maxPrice) {
        filtered = filtered.filter((e) => e.purchasePrice <= parseFloat(filters.maxPrice));
      }

      // Apply pagination
      const page = parseInt(filters.page) || 1;
      const limit = parseInt(filters.limit) || 20;
      const offset = (page - 1) * limit;
      const paginated = filtered.slice(offset, offset + limit);

      // Return minimal data for list view
      const minimalEscrows = paginated.map((escrow) => ({
        id: escrow.id,
        escrowNumber: escrow.escrowNumber,
        propertyAddress: escrow.propertyAddress,
        propertyType: escrow.propertyType,
        propertyImage: escrow.propertyImage,
        purchasePrice: escrow.purchasePrice,
        escrowStatus: escrow.escrowStatus,
        currentStage: escrow.currentStage,
        closingDate: escrow.closingDate,
        daysToClose: escrow.daysToClose,
        grossCommission: escrow.grossCommission,
        buyers: escrow.buyers.map((b) => ({ name: b.name })),
        sellers: escrow.sellers.map((s) => ({ name: s.name })),
        createdAt: escrow.createdAt,
        updatedAt: escrow.updatedAt,
      }));

      return {
        escrows: minimalEscrows,
        pagination: {
          total: filtered.length,
          page,
          pages: Math.ceil(filtered.length / limit),
          limit,
        },
      };
    } catch (error) {
      logger.error('Mock Escrow.findAll error:', error);
      throw error;
    }
  }

  static async findById(id) {
    const escrow = mockEscrows.find((e) => e.id === id);
    if (!escrow) return null;

    // Return comprehensive escrow data structure
    return {
      ...escrow,
      // Fix status field name mismatch
      status: escrow.escrowStatus,

      // Property details
      property: {
        type: escrow.propertyType || 'Single Family',
        bedrooms: 4,
        bathrooms: 3,
        sqft: 2800,
        yearBuilt: 2018,
        lot: '0.25 acres',
        images: [
          'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
          'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
          'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800',
          'https://images.unsplash.com/photo-1600607687644-aac73f2ae48b?w=800',
        ],
      },

      // Enhanced buyer/seller information
      buyer: {
        name: escrow.buyers?.[0]?.name || 'Unknown Buyer',
        email: escrow.buyers?.[0]?.email || 'buyer@email.com',
        phone: escrow.buyers?.[0]?.phone || '(555) 123-4567',
        agent: 'Sarah Johnson',
        agentPhone: '(555) 234-5678',
        agentEmail: 'sarah@realty.com',
      },
      seller: {
        name: escrow.sellers?.[0]?.name || 'Unknown Seller',
        email: escrow.sellers?.[0]?.email || 'seller@email.com',
        phone: escrow.sellers?.[0]?.phone || '(555) 345-6789',
        agent: 'Mike Davis',
        agentPhone: '(555) 456-7890',
        agentEmail: 'mike@realty.com',
      },

      // Financial details
      commissionSplit: {
        listing: escrow.grossCommission * 0.5,
        selling: escrow.grossCommission * 0.5,
      },

      // Comprehensive checklist
      checklist: {
        'Pre-Contract': {
          'Property listed': true,
          'Marketing materials prepared': true,
          'Showings scheduled': true,
          'Offers received': true,
          'Offer accepted': true,
        },
        'Contract to Close': {
          'Escrow opened': true,
          'Earnest money deposited': escrow.earnestMoneyDeposit > 0,
          'Inspection scheduled': escrow.currentStage !== 'Contract',
          'Inspection completed': ['Appraisal', 'Loan Processing', 'Final Walkthrough', 'Closing'].includes(escrow.currentStage),
          'Repairs negotiated': false,
          'Loan application': ['Loan Processing', 'Final Walkthrough', 'Closing'].includes(escrow.currentStage),
          'Appraisal ordered': ['Appraisal', 'Loan Processing', 'Final Walkthrough', 'Closing'].includes(escrow.currentStage),
          'Title search': false,
          'Insurance obtained': false,
          'Final walkthrough': escrow.currentStage === 'Final Walkthrough' || escrow.currentStage === 'Closing',
        },
        Closing: {
          'Documents prepared': escrow.currentStage === 'Closing',
          'Funds confirmed': false,
          'Documents signed': false,
          'Keys transferred': false,
          'Commission paid': false,
        },
      },

      // Timeline
      timeline: [
        {
          date: escrow.acceptanceDate,
          event: 'Escrow Opened',
          status: 'completed',
          icon: 'CheckCircle',
        },
        {
          date: new Date(escrow.acceptanceDate.getTime() + 3 * 24 * 60 * 60 * 1000),
          event: 'Initial Deposit Received',
          status: escrow.earnestMoneyDeposit > 0 ? 'completed' : 'pending',
          icon: 'AttachMoney',
        },
        {
          date: new Date(escrow.acceptanceDate.getTime() + 7 * 24 * 60 * 60 * 1000),
          event: 'Inspection Period Begins',
          status: ['Inspection', 'Appraisal', 'Loan Processing', 'Final Walkthrough', 'Closing'].includes(escrow.currentStage) ? 'completed' : 'pending',
          icon: 'Build',
        },
        {
          date: new Date(escrow.acceptanceDate.getTime() + 10 * 24 * 60 * 60 * 1000),
          event: 'Inspection Completed',
          status: ['Appraisal', 'Loan Processing', 'Final Walkthrough', 'Closing'].includes(escrow.currentStage) ? 'completed' : 'pending',
          icon: 'Task',
        },
        {
          date: new Date(escrow.acceptanceDate.getTime() + 14 * 24 * 60 * 60 * 1000),
          event: 'Loan Application Submitted',
          status: ['Loan Processing', 'Final Walkthrough', 'Closing'].includes(escrow.currentStage) ? 'completed' : 'pending',
          icon: 'AccountBalance',
        },
        {
          date: new Date(escrow.acceptanceDate.getTime() + 17 * 24 * 60 * 60 * 1000),
          event: 'Appraisal Scheduled',
          status: ['Appraisal', 'Loan Processing', 'Final Walkthrough', 'Closing'].includes(escrow.currentStage) ? 'completed' : escrow.currentStage === 'Appraisal' ? 'in-progress' : 'pending',
          icon: 'Assessment',
        },
        {
          date: new Date(escrow.acceptanceDate.getTime() + 21 * 24 * 60 * 60 * 1000),
          event: 'Loan Approval',
          status: ['Final Walkthrough', 'Closing'].includes(escrow.currentStage) ? 'completed' : 'pending',
          icon: 'VerifiedUser',
        },
        {
          date: new Date(escrow.closingDate.getTime() - 2 * 24 * 60 * 60 * 1000),
          event: 'Final Walkthrough',
          status: escrow.currentStage === 'Closing' ? 'completed' : escrow.currentStage === 'Final Walkthrough' ? 'in-progress' : 'pending',
          icon: 'Visibility',
        },
        {
          date: escrow.closingDate,
          event: 'Closing Date',
          status: escrow.escrowStatus === 'Closed' ? 'completed' : 'pending',
          icon: 'Gavel',
        },
      ],

      // Documents
      documents: [
        {
          id: 1,
          name: 'Purchase Agreement',
          type: 'Contract',
          uploadDate: escrow.acceptanceDate,
          status: 'Signed',
          size: '2.4 MB',
        },
        {
          id: 2,
          name: 'Disclosure Package',
          type: 'Disclosure',
          uploadDate: new Date(escrow.acceptanceDate.getTime() + 1 * 24 * 60 * 60 * 1000),
          status: 'Reviewed',
          size: '5.8 MB',
        },
        {
          id: 3,
          name: 'Inspection Report',
          type: 'Report',
          uploadDate: new Date(escrow.acceptanceDate.getTime() + 10 * 24 * 60 * 60 * 1000),
          status: ['Inspection', 'Appraisal', 'Loan Processing', 'Final Walkthrough', 'Closing'].includes(escrow.currentStage) ? 'Complete' : 'Pending',
          size: '8.2 MB',
        },
        {
          id: 4,
          name: 'Loan Application',
          type: 'Financial',
          uploadDate: new Date(escrow.acceptanceDate.getTime() + 14 * 24 * 60 * 60 * 1000),
          status: ['Loan Processing', 'Final Walkthrough', 'Closing'].includes(escrow.currentStage) ? 'Submitted' : 'Pending',
          size: '3.1 MB',
        },
        {
          id: 5,
          name: 'Title Report',
          type: 'Title',
          uploadDate: new Date(escrow.acceptanceDate.getTime() + 20 * 24 * 60 * 60 * 1000),
          status: 'Under Review',
          size: '4.5 MB',
        },
      ],

      // AI Agents
      aiAgents: [
        {
          id: 1,
          name: 'Document Analyzer',
          type: 'document',
          status: 'active',
          confidence: 98,
          lastAction: 'Analyzed purchase agreement for completeness',
          icon: 'Description',
          tasksCompleted: 145,
          efficiency: 99.2,
        },
        {
          id: 2,
          name: 'Timeline Monitor',
          type: 'timeline',
          status: 'active',
          confidence: 95,
          lastAction: 'Sent reminder for upcoming appraisal',
          icon: 'Schedule',
          tasksCompleted: 89,
          efficiency: 97.5,
        },
        {
          id: 3,
          name: 'Compliance Guard',
          type: 'compliance',
          status: 'idle',
          confidence: 100,
          lastAction: 'All current requirements met',
          icon: 'VerifiedUser',
          tasksCompleted: 67,
          efficiency: 100,
        },
        {
          id: 4,
          name: 'Communication Hub',
          type: 'communication',
          status: 'active',
          confidence: 92,
          lastAction: 'Coordinating appraisal appointment',
          icon: 'Forum',
          tasksCompleted: 234,
          efficiency: 94.8,
        },
      ],

      // Recent Activity
      recentActivity: [
        {
          id: 1,
          type: 'document',
          action: 'Title report uploaded',
          user: 'Title Company',
          timestamp: '2 hours ago',
          priority: 'medium',
        },
        {
          id: 2,
          type: 'ai',
          action: 'AI detected potential timeline delay in loan processing',
          user: 'Timeline Monitor',
          timestamp: '3 hours ago',
          priority: 'high',
        },
        {
          id: 3,
          type: 'communication',
          action: 'Buyer agent confirmed appraisal appointment',
          user: 'Sarah Johnson',
          timestamp: '5 hours ago',
          priority: 'low',
        },
        {
          id: 4,
          type: 'task',
          action: 'Inspection contingency removed',
          user: escrow.buyers?.[0]?.name || 'Buyer',
          timestamp: '1 day ago',
          priority: 'medium',
        },
      ],

      // Market Data
      marketData: {
        avgDaysOnMarket: 28,
        medianPrice: 1150000,
        pricePerSqft: Math.round(escrow.purchasePrice / 2800),
        inventoryLevel: 'Low',
        demandLevel: 'High',
        similarSales: [
          {
            address: '456 Pine St',
            price: escrow.purchasePrice * 0.95,
            soldDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
            daysOnMarket: 15,
          },
          {
            address: '123 Elm Ave',
            price: escrow.purchasePrice * 0.98,
            soldDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
            daysOnMarket: 22,
          },
          {
            address: '789 Maple Dr',
            price: escrow.purchasePrice * 0.96,
            soldDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            daysOnMarket: 31,
          },
        ],
      },
    };
  }

  static async create(data) {
    try {
      // Generate unique ID and escrow number
      const id = String(Math.max(...mockEscrows.map((e) => parseInt(e.id) || 0)) + 1);
      const year = new Date().getFullYear();
      const month = String(new Date().getMonth() + 1).padStart(2, '0');
      const count = mockEscrows.length + 1;
      const escrowNumber = `ESC-${year}-${month}-${count.toString().padStart(3, '0')}`;

      // Calculate financial details
      const purchasePrice = parseFloat(data.purchasePrice) || 0;
      const commissionPercentage = parseFloat(data.commissionPercentage) || 2.5;
      const grossCommission = purchasePrice * (commissionPercentage / 100);
      const netCommission = grossCommission * 0.9; // Assuming 10% brokerage split

      // Calculate days to close
      const closingDate = new Date(data.closingDate);
      const today = new Date();
      const daysToClose = Math.ceil((closingDate - today) / (1000 * 60 * 60 * 24));

      const newEscrow = {
        id,
        escrowNumber,
        propertyAddress: data.propertyAddress,
        propertyType: data.propertyType || 'Single Family',
        propertyImage: 'https://images.unsplash.com/photo-1560184897-ae75f418493e?w=400',
        purchasePrice,
        escrowStatus: data.escrowStatus || 'Active',
        currentStage: data.currentStage || 'Contract',
        closingDate,
        daysToClose,
        grossCommission,
        netCommission,
        buyers: data.buyers || [],
        sellers: data.sellers || [],
        acceptanceDate: new Date(data.acceptanceDate),
        earnestMoneyDeposit: parseFloat(data.earnestMoneyDeposit) || purchasePrice * 0.01,
        downPayment: parseFloat(data.downPayment) || purchasePrice * 0.2,
        loanAmount: parseFloat(data.loanAmount) || purchasePrice * 0.8,
        commissionPercentage,
        escrowCompany: data.escrowCompany || '',
        escrowOfficer: data.escrowOfficer || '',
        titleCompany: data.titleCompany || '',
        lender: data.lender || '',
        listingAgent: data.listingAgent || {},
        buyerAgent: data.buyerAgent || {},
        inspectionDeadline: data.inspectionDeadline ? new Date(data.inspectionDeadline) : null,
        appraisalDeadline: data.appraisalDeadline ? new Date(data.appraisalDeadline) : null,
        loanContingencyDeadline: data.loanContingencyDeadline ? new Date(data.loanContingencyDeadline) : null,
        notes: data.notes || '',
        createdBy: data.createdBy || 'System',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockEscrows.push(newEscrow);

      logger.info('Mock escrow created:', {
        id: newEscrow.id,
        escrowNumber: newEscrow.escrowNumber,
        propertyAddress: newEscrow.propertyAddress,
        purchasePrice: newEscrow.purchasePrice,
      });

      return newEscrow;
    } catch (error) {
      logger.error('Mock Escrow.create error:', error);
      throw error;
    }
  }

  static async update(id, data) {
    try {
      const index = mockEscrows.findIndex((e) => e.id === id);
      if (index === -1) {
        return null;
      }

      // Update the escrow
      mockEscrows[index] = {
        ...mockEscrows[index],
        ...data,
        updatedAt: new Date(),
      };

      // Recalculate financial details if needed
      if (data.purchasePrice || data.commissionPercentage) {
        const purchasePrice = parseFloat(data.purchasePrice) || mockEscrows[index].purchasePrice;
        const commissionPercentage = parseFloat(data.commissionPercentage) || mockEscrows[index].commissionPercentage;
        const grossCommission = purchasePrice * (commissionPercentage / 100);
        const netCommission = grossCommission * 0.9;

        mockEscrows[index].purchasePrice = purchasePrice;
        mockEscrows[index].commissionPercentage = commissionPercentage;
        mockEscrows[index].grossCommission = grossCommission;
        mockEscrows[index].netCommission = netCommission;
      }

      // Recalculate days to close if closing date changed
      if (data.closingDate) {
        const closingDate = new Date(data.closingDate);
        const today = new Date();
        const daysToClose = Math.ceil((closingDate - today) / (1000 * 60 * 60 * 24));

        mockEscrows[index].closingDate = closingDate;
        mockEscrows[index].daysToClose = daysToClose;
      }

      logger.info('Mock escrow updated:', {
        id,
        changes: Object.keys(data),
      });

      return mockEscrows[index];
    } catch (error) {
      logger.error('Mock Escrow.update error:', error);
      throw error;
    }
  }

  static async delete(id, deletedBy, reason) {
    try {
      const index = mockEscrows.findIndex((e) => e.id === id);
      if (index === -1) {
        throw new Error('Escrow not found');
      }

      const deletedEscrow = mockEscrows[index];
      mockEscrows.splice(index, 1);

      logger.info('Mock escrow deleted:', {
        id,
        deletedBy,
        reason,
        escrowNumber: deletedEscrow.escrowNumber,
      });

      return {
        id: `del_req_${Date.now()}`,
        escrowId: id,
        escrowNumber: deletedEscrow.escrowNumber,
        requestedBy: deletedBy,
        reason,
        status: 'approved',
        approvedAt: new Date(),
        approvedBy: 'System',
      };
    } catch (error) {
      logger.error('Mock Escrow.delete error:', error);
      throw error;
    }
  }

  static async updateChecklist(escrowId, item, value, note) {
    try {
      const escrow = mockEscrows.find((e) => e.id === escrowId);
      if (!escrow) {
        throw new Error('Escrow not found');
      }

      // Initialize checklist if it doesn't exist
      if (!escrow.checklist) {
        escrow.checklist = {};
      }

      // Update the checklist item
      escrow.checklist[item] = {
        completed: value,
        note: note || '',
        updatedAt: new Date(),
      };

      escrow.updatedAt = new Date();

      logger.info('Mock escrow checklist updated:', {
        escrowId,
        item,
        value,
        note,
      });

      return escrow.checklist;
    } catch (error) {
      logger.error('Mock Escrow.updateChecklist error:', error);
      throw error;
    }
  }
}

module.exports = EscrowMock;
