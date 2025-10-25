// Mock Commission model for development and testing
const logger = require('../../../utils/logger');

// Mock commission data
const mockCommissions = [
  {
    id: '1',
    escrowId: '1',
    escrowNumber: 'ESC-2025-001',
    propertyAddress: '456 Ocean View Dr, La Jolla, CA 92037',
    transactionType: 'Sale',
    side: 'Listing',
    agentId: '1',
    agentName: 'Jayden Metz',
    salePrice: 1250000,
    commissionRate: 2.5,
    grossCommission: 31250,
    brokerageSplit: 80, // Agent gets 80%
    agentCommission: 25000,
    brokerageCommission: 6250,
    referralFee: 0,
    referralAgent: null,
    transactionFee: 395,
    netCommission: 24605,
    status: 'Pending',
    projectedPayoutDate: new Date('2025-08-15'),
    actualPayoutDate: null,
    invoiceId: null,
    notes: 'Standard listing side commission',
    taxWithheld: false,
    taxRate: 0,
    deductions: [],
    createdAt: new Date('2025-07-01'),
    updatedAt: new Date(),
  },
  {
    id: '2',
    escrowId: '2',
    escrowNumber: 'ESC-2025-002',
    propertyAddress: '789 Sunset Blvd, Del Mar, CA 92014',
    transactionType: 'Sale',
    side: 'Buyer',
    agentId: '1',
    agentName: 'Jayden Metz',
    salePrice: 850000,
    commissionRate: 2.5,
    grossCommission: 21250,
    brokerageSplit: 75, // Agent gets 75%
    agentCommission: 15937.50,
    brokerageCommission: 5312.50,
    referralFee: 2125, // 10% referral
    referralAgent: 'Sarah Johnson',
    transactionFee: 395,
    netCommission: 13417.50,
    status: 'Paid',
    projectedPayoutDate: new Date('2025-07-25'),
    actualPayoutDate: new Date('2025-07-26'),
    invoiceId: 'INV-2025-0042',
    notes: 'Referral from Sarah Johnson - 10% fee',
    taxWithheld: false,
    taxRate: 0,
    deductions: [
      { description: 'E&O Insurance', amount: 125 },
      { description: 'MLS Fees', amount: 50 },
    ],
    checkNumber: '12345',
    depositAccount: 'Business Checking ****1234',
    createdAt: new Date('2025-06-25'),
    updatedAt: new Date(),
  },
  {
    id: '3',
    escrowId: '3',
    escrowNumber: 'ESC-2025-003',
    propertyAddress: '321 Palm Ave, Coronado, CA 92118',
    transactionType: 'Sale',
    side: 'Listing',
    agentId: '1',
    agentName: 'Jayden Metz',
    salePrice: 1450000,
    commissionRate: 2.5,
    grossCommission: 36250,
    brokerageSplit: 85, // Agent gets 85%
    agentCommission: 30812.50,
    brokerageCommission: 5437.50,
    referralFee: 0,
    referralAgent: null,
    transactionFee: 395,
    netCommission: 30417.50,
    status: 'Processing',
    projectedPayoutDate: new Date('2025-07-20'),
    actualPayoutDate: null,
    invoiceId: null,
    notes: 'Luxury property - higher split',
    taxWithheld: true,
    taxRate: 30,
    deductions: [],
    createdAt: new Date('2025-06-20'),
    updatedAt: new Date(),
  },
];

class CommissionMock {
  static async findAll(filters = {}) {
    try {
      let filtered = [...mockCommissions];

      // Apply status filter
      if (filters.status && filters.status !== 'all') {
        filtered = filtered.filter((c) => c.status === filters.status);
      }

      // Apply agent filter
      if (filters.agentId) {
        filtered = filtered.filter((c) => c.agentId === filters.agentId);
      }

      // Apply side filter
      if (filters.side) {
        filtered = filtered.filter((c) => c.side === filters.side);
      }

      // Apply date range filter
      if (filters.startDate || filters.endDate) {
        const startDate = filters.startDate ? new Date(filters.startDate) : new Date('1900-01-01');
        const endDate = filters.endDate ? new Date(filters.endDate) : new Date('2100-12-31');
        filtered = filtered.filter((c) => {
          const payoutDate = c.actualPayoutDate || c.projectedPayoutDate;
          return payoutDate >= startDate && payoutDate <= endDate;
        });
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
      const minimalCommissions = paginated.map((commission) => ({
        id: commission.id,
        escrowId: commission.escrowId,
        escrowNumber: commission.escrowNumber,
        propertyAddress: commission.propertyAddress,
        side: commission.side,
        agentName: commission.agentName,
        salePrice: commission.salePrice,
        grossCommission: commission.grossCommission,
        netCommission: commission.netCommission,
        status: commission.status,
        projectedPayoutDate: commission.projectedPayoutDate,
        actualPayoutDate: commission.actualPayoutDate,
        createdAt: commission.createdAt,
        updatedAt: commission.updatedAt,
      }));

      return {
        commissions: minimalCommissions,
        pagination: {
          total: filtered.length,
          page,
          pages: Math.ceil(filtered.length / limit),
          limit,
        },
      };
    } catch (error) {
      logger.error('Mock Commission.findAll error:', error);
      throw error;
    }
  }

  static async findById(id) {
    const commission = mockCommissions.find((c) => c.id === id);
    if (!commission) return null;

    // Return comprehensive commission data for detail view
    return {
      ...commission,

      // Calculate breakdown
      breakdown: {
        salePrice: commission.salePrice,
        commissionRate: commission.commissionRate,
        grossCommission: commission.grossCommission,
        brokerageSplit: `${commission.brokerageSplit}/${100 - commission.brokerageSplit}`,
        agentCommission: commission.agentCommission,
        brokerageCommission: commission.brokerageCommission,
        referralFee: commission.referralFee,
        transactionFee: commission.transactionFee,
        deductions: commission.deductions,
        taxWithheld: commission.taxWithheld ? (commission.netCommission * commission.taxRate / 100) : 0,
        netCommission: commission.netCommission,
      },

      // Related transaction details
      transaction: {
        escrowId: commission.escrowId,
        escrowNumber: commission.escrowNumber,
        propertyAddress: commission.propertyAddress,
        closingDate: commission.projectedPayoutDate,
        buyers: ['Michael & Sarah Chen'],
        sellers: ['Robert Johnson'],
        otherAgent: commission.side === 'Listing' ? 'Sarah Johnson (Buyer Agent)' : 'Mike Davis (Listing Agent)',
      },

      // Payment history
      paymentHistory: commission.status === 'Paid' ? [
        {
          date: commission.actualPayoutDate,
          type: 'Commission Payout',
          amount: commission.netCommission,
          method: 'Check',
          reference: commission.checkNumber,
          account: commission.depositAccount,
        },
      ] : [],

      // Documents
      documents: [
        {
          id: 1,
          name: 'Commission Agreement',
          type: 'agreement',
          uploadDate: commission.createdAt,
          url: `/api/v1/documents/commission-agreement-${commission.id}`,
        },
        {
          id: 2,
          name: 'Settlement Statement',
          type: 'settlement',
          uploadDate: commission.projectedPayoutDate,
          url: `/api/v1/documents/settlement-${commission.id}`,
        },
      ],

      // Audit trail
      auditTrail: [
        {
          date: commission.createdAt,
          action: 'Commission Created',
          user: 'System',
          details: 'Commission record created from escrow',
        },
        {
          date: new Date(commission.createdAt.getTime() + 5 * 24 * 60 * 60 * 1000),
          action: 'Split Confirmed',
          user: 'Broker Admin',
          details: `Confirmed ${commission.brokerageSplit}% split`,
        },
      ],
    };
  }

  static async getStats(agentId = null) {
    try {
      let commissions = [...mockCommissions];

      if (agentId) {
        commissions = commissions.filter((c) => c.agentId === agentId);
      }

      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth();

      // Calculate YTD stats
      const ytdCommissions = commissions.filter((c) => new Date(c.projectedPayoutDate).getFullYear() === currentYear);

      // Calculate monthly stats
      const monthlyCommissions = commissions.filter((c) => {
        const date = new Date(c.projectedPayoutDate);
        return date.getFullYear() === currentYear && date.getMonth() === currentMonth;
      });

      return {
        ytd: {
          totalGross: ytdCommissions.reduce((sum, c) => sum + c.grossCommission, 0),
          totalNet: ytdCommissions.reduce((sum, c) => sum + c.netCommission, 0),
          totalTransactions: ytdCommissions.length,
          averageCommission: ytdCommissions.length > 0
            ? ytdCommissions.reduce((sum, c) => sum + c.netCommission, 0) / ytdCommissions.length
            : 0,
          byStatus: {
            pending: ytdCommissions.filter((c) => c.status === 'Pending').length,
            processing: ytdCommissions.filter((c) => c.status === 'Processing').length,
            paid: ytdCommissions.filter((c) => c.status === 'Paid').length,
          },
        },
        monthly: {
          totalGross: monthlyCommissions.reduce((sum, c) => sum + c.grossCommission, 0),
          totalNet: monthlyCommissions.reduce((sum, c) => sum + c.netCommission, 0),
          totalTransactions: monthlyCommissions.length,
        },
        pipeline: {
          pending: commissions.filter((c) => c.status === 'Pending').reduce((sum, c) => sum + c.netCommission, 0),
          processing: commissions.filter((c) => c.status === 'Processing').reduce((sum, c) => sum + c.netCommission, 0),
        },
        averageSplit: commissions.length > 0
          ? commissions.reduce((sum, c) => sum + c.brokerageSplit, 0) / commissions.length
          : 0,
      };
    } catch (error) {
      logger.error('Mock Commission.getStats error:', error);
      throw error;
    }
  }

  static async create(data) {
    try {
      const id = String(Math.max(...mockCommissions.map((c) => parseInt(c.id) || 0)) + 1);

      // Calculate commission amounts
      const grossCommission = data.salePrice * (data.commissionRate / 100);
      const agentCommission = grossCommission * (data.brokerageSplit / 100);
      const brokerageCommission = grossCommission - agentCommission;
      const totalDeductions = (data.deductions || []).reduce((sum, d) => sum + d.amount, 0);
      const netCommission = agentCommission - data.referralFee - data.transactionFee - totalDeductions;

      const newCommission = {
        id,
        ...data,
        grossCommission,
        agentCommission,
        brokerageCommission,
        netCommission,
        status: data.status || 'Pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCommissions.push(newCommission);

      logger.info('Mock commission created:', {
        id: newCommission.id,
        escrowNumber: newCommission.escrowNumber,
        netCommission: newCommission.netCommission,
      });

      return newCommission;
    } catch (error) {
      logger.error('Mock Commission.create error:', error);
      throw error;
    }
  }

  static async update(id, data) {
    try {
      const index = mockCommissions.findIndex((c) => c.id === id);
      if (index === -1) {
        return null;
      }

      // Recalculate if necessary
      if (data.salePrice || data.commissionRate || data.brokerageSplit) {
        const current = mockCommissions[index];
        const salePrice = data.salePrice || current.salePrice;
        const commissionRate = data.commissionRate || current.commissionRate;
        const brokerageSplit = data.brokerageSplit || current.brokerageSplit;

        data.grossCommission = salePrice * (commissionRate / 100);
        data.agentCommission = data.grossCommission * (brokerageSplit / 100);
        data.brokerageCommission = data.grossCommission - data.agentCommission;

        const totalDeductions = (data.deductions || current.deductions || [])
          .reduce((sum, d) => sum + d.amount, 0);
        data.netCommission = data.agentCommission
          - (data.referralFee || current.referralFee)
          - (data.transactionFee || current.transactionFee)
          - totalDeductions;
      }

      mockCommissions[index] = {
        ...mockCommissions[index],
        ...data,
        updatedAt: new Date(),
      };

      logger.info('Mock commission updated:', {
        id,
        changes: Object.keys(data),
      });

      return mockCommissions[index];
    } catch (error) {
      logger.error('Mock Commission.update error:', error);
      throw error;
    }
  }

  static async updateStatus(id, status, paymentDetails = {}) {
    try {
      const commission = await this.update(id, {
        status,
        ...(status === 'Paid' && {
          actualPayoutDate: paymentDetails.payoutDate || new Date(),
          checkNumber: paymentDetails.checkNumber,
          depositAccount: paymentDetails.depositAccount,
          invoiceId: paymentDetails.invoiceId,
        }),
      });

      return commission;
    } catch (error) {
      logger.error('Mock Commission.updateStatus error:', error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      const index = mockCommissions.findIndex((c) => c.id === id);
      if (index === -1) {
        throw new Error('Commission not found');
      }

      const deletedCommission = mockCommissions[index];
      mockCommissions.splice(index, 1);

      logger.info('Mock commission deleted:', {
        id,
        escrowNumber: deletedCommission.escrowNumber,
      });

      return { success: true, deletedId: id };
    } catch (error) {
      logger.error('Mock Commission.delete error:', error);
      throw error;
    }
  }
}

module.exports = CommissionMock;
