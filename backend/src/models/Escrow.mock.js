// Mock Escrow model for development and testing
const logger = require('../utils/logger');

// In-memory storage for mock data
let mockEscrows = [
  {
    id: '1',
    escrowNumber: 'ESC-2025-001',
    propertyAddress: '456 Ocean View Dr, La Jolla, CA 92037',
    propertyType: 'Single Family',
    propertyImage: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400',
    purchasePrice: 1250000,
    escrowStatus: 'Active',
    currentStage: 'Inspection',
    closingDate: new Date('2025-07-30'),
    daysToClose: 22,
    grossCommission: 31250,
    buyers: [{ name: 'Michael & Sarah Chen' }],
    sellers: [{ name: 'Robert Johnson' }],
    acceptanceDate: new Date('2025-06-30'),
    earnestMoneyDeposit: 12500,
    downPayment: 250000,
    loanAmount: 1000000,
    commissionPercentage: 2.5,
    createdAt: new Date('2025-06-30'),
    updatedAt: new Date()
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
    closingDate: new Date('2025-07-15'),
    daysToClose: 7,
    grossCommission: 21250,
    buyers: [{ name: 'Emily Davis' }],
    sellers: [{ name: 'The Andersons' }],
    acceptanceDate: new Date('2025-06-15'),
    earnestMoneyDeposit: 8500,
    downPayment: 170000,
    loanAmount: 680000,
    commissionPercentage: 2.5,
    createdAt: new Date('2025-06-15'),
    updatedAt: new Date()
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
    closingDate: new Date('2025-07-10'),
    daysToClose: 2,
    grossCommission: 36250,
    buyers: [{ name: 'David & Lisa Park' }],
    sellers: [{ name: 'William Thompson' }],
    acceptanceDate: new Date('2025-06-10'),
    earnestMoneyDeposit: 14500,
    downPayment: 290000,
    loanAmount: 1160000,
    commissionPercentage: 2.5,
    createdAt: new Date('2025-06-10'),
    updatedAt: new Date()
  }
];

class EscrowMock {
  static async findAll(filters = {}) {
    try {
      let filtered = [...mockEscrows];
      
      // Apply status filter
      if (filters.status && filters.status !== 'all') {
        filtered = filtered.filter(e => e.escrowStatus === filters.status);
      }
      
      // Apply price filters
      if (filters.minPrice) {
        filtered = filtered.filter(e => e.purchasePrice >= parseFloat(filters.minPrice));
      }
      if (filters.maxPrice) {
        filtered = filtered.filter(e => e.purchasePrice <= parseFloat(filters.maxPrice));
      }
      
      // Apply pagination
      const page = parseInt(filters.page) || 1;
      const limit = parseInt(filters.limit) || 20;
      const offset = (page - 1) * limit;
      const paginated = filtered.slice(offset, offset + limit);
      
      return {
        escrows: paginated,
        pagination: {
          total: filtered.length,
          page,
          pages: Math.ceil(filtered.length / limit),
          limit
        }
      };
    } catch (error) {
      logger.error('Mock Escrow.findAll error:', error);
      throw error;
    }
  }

  static async findById(id) {
    return mockEscrows.find(e => e.id === id) || null;
  }

  static async create(data) {
    try {
      // Generate unique ID and escrow number
      const id = String(Math.max(...mockEscrows.map(e => parseInt(e.id) || 0)) + 1);
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
        updatedAt: new Date()
      };
      
      mockEscrows.push(newEscrow);
      
      logger.info('Mock escrow created:', {
        id: newEscrow.id,
        escrowNumber: newEscrow.escrowNumber,
        propertyAddress: newEscrow.propertyAddress,
        purchasePrice: newEscrow.purchasePrice
      });
      
      return newEscrow;
    } catch (error) {
      logger.error('Mock Escrow.create error:', error);
      throw error;
    }
  }

  static async update(id, data) {
    try {
      const index = mockEscrows.findIndex(e => e.id === id);
      if (index === -1) {
        return null;
      }
      
      // Update the escrow
      mockEscrows[index] = {
        ...mockEscrows[index],
        ...data,
        updatedAt: new Date()
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
        changes: Object.keys(data)
      });
      
      return mockEscrows[index];
    } catch (error) {
      logger.error('Mock Escrow.update error:', error);
      throw error;
    }
  }

  static async delete(id, deletedBy, reason) {
    try {
      const index = mockEscrows.findIndex(e => e.id === id);
      if (index === -1) {
        throw new Error('Escrow not found');
      }
      
      const deletedEscrow = mockEscrows[index];
      mockEscrows.splice(index, 1);
      
      logger.info('Mock escrow deleted:', {
        id,
        deletedBy,
        reason,
        escrowNumber: deletedEscrow.escrowNumber
      });
      
      return {
        id: `del_req_${Date.now()}`,
        escrowId: id,
        escrowNumber: deletedEscrow.escrowNumber,
        requestedBy: deletedBy,
        reason,
        status: 'approved',
        approvedAt: new Date(),
        approvedBy: 'System'
      };
    } catch (error) {
      logger.error('Mock Escrow.delete error:', error);
      throw error;
    }
  }

  static async updateChecklist(escrowId, item, value, note) {
    try {
      const escrow = mockEscrows.find(e => e.id === escrowId);
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
        updatedAt: new Date()
      };
      
      escrow.updatedAt = new Date();
      
      logger.info('Mock escrow checklist updated:', {
        escrowId,
        item,
        value,
        note
      });
      
      return escrow.checklist;
    } catch (error) {
      logger.error('Mock Escrow.updateChecklist error:', error);
      throw error;
    }
  }
}

module.exports = EscrowMock;