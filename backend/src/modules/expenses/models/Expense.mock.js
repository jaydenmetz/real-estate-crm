// Mock Expense model for development and testing
const logger = require('../utils/logger');

// Mock expense data
const mockExpenses = [
  {
    id: '1',
    category: 'Marketing',
    subcategory: 'Online Advertising',
    vendor: 'Google Ads',
    description: 'PPC Campaign for Luxury Listings',
    amount: 1250.00,
    date: new Date('2025-07-01'),
    paymentMethod: 'Credit Card',
    paymentReference: 'CC-****1234',
    status: 'Paid',
    taxDeductible: true,
    receipt: {
      id: 1,
      filename: 'google-ads-receipt-july.pdf',
      url: '/api/v1/documents/receipt-1',
      uploadDate: new Date('2025-07-02'),
    },
    notes: 'Monthly Google Ads spend for luxury property campaigns',
    tags: ['advertising', 'digital', 'luxury'],
    relatedTo: {
      type: 'listing',
      id: '3',
      reference: '789 Sunset Boulevard',
    },
    recurring: {
      enabled: true,
      frequency: 'monthly',
      endDate: new Date('2025-12-31'),
    },
    createdBy: 'Jayden Metz',
    approvedBy: null,
    createdAt: new Date('2025-07-01'),
    updatedAt: new Date('2025-07-01'),
  },
  {
    id: '2',
    category: 'Transportation',
    subcategory: 'Vehicle',
    vendor: 'Shell Gas Station',
    description: 'Gas for property showings',
    amount: 85.43,
    date: new Date('2025-07-10'),
    paymentMethod: 'Credit Card',
    paymentReference: 'CC-****1234',
    status: 'Paid',
    taxDeductible: true,
    receipt: {
      id: 2,
      filename: 'shell-receipt-07102025.jpg',
      url: '/api/v1/documents/receipt-2',
      uploadDate: new Date('2025-07-10'),
    },
    notes: 'Weekly gas expense',
    tags: ['gas', 'auto', 'mileage'],
    mileage: {
      start: 45123,
      end: 45389,
      total: 266,
      rate: 0.655, // 2025 IRS rate
      deduction: 174.23,
    },
    relatedTo: null,
    recurring: null,
    createdBy: 'Jayden Metz',
    approvedBy: null,
    createdAt: new Date('2025-07-10'),
    updatedAt: new Date('2025-07-10'),
  },
  {
    id: '3',
    category: 'Professional Services',
    subcategory: 'Photography',
    vendor: 'Premier Property Photos',
    description: 'Professional photography for new listing',
    amount: 750.00,
    date: new Date('2025-07-05'),
    paymentMethod: 'Check',
    paymentReference: 'CHK-1856',
    status: 'Paid',
    taxDeductible: true,
    receipt: {
      id: 3,
      filename: 'photography-invoice-123.pdf',
      url: '/api/v1/documents/receipt-3',
      uploadDate: new Date('2025-07-06'),
    },
    notes: 'Photography package including drone shots',
    tags: ['photography', 'listing', 'marketing'],
    relatedTo: {
      type: 'listing',
      id: '1',
      reference: '123 Main Street',
    },
    recurring: null,
    reimbursable: true,
    reimbursedTo: 'client',
    reimbursementStatus: 'pending',
    createdBy: 'Jayden Metz',
    approvedBy: null,
    createdAt: new Date('2025-07-05'),
    updatedAt: new Date('2025-07-05'),
  },
  {
    id: '4',
    category: 'Office Supplies',
    subcategory: 'Technology',
    vendor: 'Apple Store',
    description: 'iPad Pro for client presentations',
    amount: 1299.00,
    date: new Date('2025-06-15'),
    paymentMethod: 'Credit Card',
    paymentReference: 'CC-****5678',
    status: 'Paid',
    taxDeductible: true,
    receipt: {
      id: 4,
      filename: 'apple-receipt-ipad.pdf',
      url: '/api/v1/documents/receipt-4',
      uploadDate: new Date('2025-06-15'),
    },
    notes: 'Business equipment for client presentations and document signing',
    tags: ['technology', 'equipment', 'business'],
    relatedTo: null,
    recurring: null,
    depreciable: true,
    depreciationSchedule: {
      method: 'straight-line',
      years: 3,
      annualDepreciation: 433.00,
    },
    createdBy: 'Jayden Metz',
    approvedBy: 'Broker Admin',
    createdAt: new Date('2025-06-15'),
    updatedAt: new Date('2025-06-16'),
  },
  {
    id: '5',
    category: 'Professional Development',
    subcategory: 'Education',
    vendor: 'NAR Conference',
    description: 'Annual Realtor Conference Registration',
    amount: 599.00,
    date: new Date('2025-07-20'),
    paymentMethod: 'Credit Card',
    paymentReference: 'CC-****1234',
    status: 'Pending',
    taxDeductible: true,
    receipt: null,
    notes: 'NAR Annual Conference in Las Vegas',
    tags: ['education', 'conference', 'professional'],
    relatedTo: null,
    recurring: null,
    createdBy: 'Jayden Metz',
    approvedBy: null,
    createdAt: new Date('2025-07-15'),
    updatedAt: new Date('2025-07-15'),
  },
];

// Expense categories
const expenseCategories = {
  Marketing: [
    'Online Advertising',
    'Print Advertising',
    'Signs & Banners',
    'Photography',
    'Virtual Tours',
    'Direct Mail',
    'Social Media',
    'Website',
    'Other',
  ],
  Transportation: [
    'Vehicle',
    'Gas',
    'Parking',
    'Tolls',
    'Public Transit',
    'Uber/Lyft',
    'Other',
  ],
  'Office Supplies': [
    'Technology',
    'Furniture',
    'Stationery',
    'Software',
    'Printing',
    'Other',
  ],
  'Professional Services': [
    'Legal',
    'Accounting',
    'Photography',
    'Staging',
    'Inspection',
    'Other',
  ],
  'Professional Development': [
    'Education',
    'Conferences',
    'Training',
    'Certifications',
    'Memberships',
    'Other',
  ],
  'Client Entertainment': [
    'Meals',
    'Events',
    'Gifts',
    'Other',
  ],
  Communication: [
    'Phone',
    'Internet',
    'Postage',
    'Other',
  ],
  Insurance: [
    'E&O',
    'General Liability',
    'Auto',
    'Health',
    'Other',
  ],
  'Fees & Licenses': [
    'MLS',
    'License Renewal',
    'Association Dues',
    'Transaction Fees',
    'Other',
  ],
};

class ExpenseMock {
  static async findAll(filters = {}) {
    try {
      let filtered = [...mockExpenses];

      // Apply category filter
      if (filters.category && filters.category !== 'all') {
        filtered = filtered.filter((e) => e.category === filters.category);
      }

      // Apply status filter
      if (filters.status) {
        filtered = filtered.filter((e) => e.status === filters.status);
      }

      // Apply date range filter
      if (filters.startDate || filters.endDate) {
        const startDate = filters.startDate ? new Date(filters.startDate) : new Date('1900-01-01');
        const endDate = filters.endDate ? new Date(filters.endDate) : new Date('2100-12-31');
        filtered = filtered.filter((e) => e.date >= startDate && e.date <= endDate);
      }

      // Apply tax deductible filter
      if (filters.taxDeductible !== undefined) {
        filtered = filtered.filter((e) => e.taxDeductible === (filters.taxDeductible === 'true'));
      }

      // Apply search
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filtered = filtered.filter((e) => e.vendor.toLowerCase().includes(searchTerm)
          || e.description.toLowerCase().includes(searchTerm)
          || e.notes.toLowerCase().includes(searchTerm)
          || e.tags.some((tag) => tag.toLowerCase().includes(searchTerm)));
      }

      // Apply sorting
      const sortField = filters.sort || 'date';
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
      const minimalExpenses = paginated.map((expense) => ({
        id: expense.id,
        category: expense.category,
        subcategory: expense.subcategory,
        vendor: expense.vendor,
        description: expense.description,
        amount: expense.amount,
        date: expense.date,
        status: expense.status,
        taxDeductible: expense.taxDeductible,
        hasReceipt: !!expense.receipt,
        tags: expense.tags,
        createdAt: expense.createdAt,
        updatedAt: expense.updatedAt,
      }));

      return {
        expenses: minimalExpenses,
        pagination: {
          total: filtered.length,
          page,
          pages: Math.ceil(filtered.length / limit),
          limit,
        },
      };
    } catch (error) {
      logger.error('Mock Expense.findAll error:', error);
      throw error;
    }
  }

  static async findById(id) {
    const expense = mockExpenses.find((e) => e.id === id);
    if (!expense) return null;

    // Return comprehensive expense data for detail view
    return {
      ...expense,

      // Category information
      categoryInfo: {
        main: expense.category,
        sub: expense.subcategory,
        allSubcategories: expenseCategories[expense.category] || [],
      },

      // Tax information
      taxInfo: {
        deductible: expense.taxDeductible,
        category: expense.category,
        estimatedDeduction: expense.taxDeductible ? expense.amount : 0,
        mileageDeduction: expense.mileage ? expense.mileage.deduction : 0,
        totalDeduction: expense.taxDeductible
          ? (expense.amount + (expense.mileage?.deduction || 0)) : 0,
      },

      // Reimbursement details
      reimbursement: expense.reimbursable ? {
        status: expense.reimbursementStatus,
        to: expense.reimbursedTo,
        amount: expense.amount,
        requestDate: expense.createdAt,
        approvalDate: expense.approvedBy ? expense.updatedAt : null,
      } : null,

      // Related expenses (same vendor or category)
      relatedExpenses: mockExpenses
        .filter((e) => e.id !== id
          && (e.vendor === expense.vendor
           || (e.category === expense.category && e.subcategory === expense.subcategory)))
        .slice(0, 5)
        .map((e) => ({
          id: e.id,
          vendor: e.vendor,
          description: e.description,
          amount: e.amount,
          date: e.date,
        })),

      // Audit trail
      auditTrail: [
        {
          date: expense.createdAt,
          action: 'Expense Created',
          user: expense.createdBy,
          details: `Created expense for ${expense.vendor}`,
        },
        ...(expense.approvedBy ? [{
          date: expense.updatedAt,
          action: 'Expense Approved',
          user: expense.approvedBy,
          details: 'Expense approved for reimbursement',
        }] : []),
        ...(expense.receipt ? [{
          date: expense.receipt.uploadDate,
          action: 'Receipt Uploaded',
          user: expense.createdBy,
          details: `Uploaded ${expense.receipt.filename}`,
        }] : []),
      ],
    };
  }

  static async getStats(filters = {}) {
    try {
      let expenses = [...mockExpenses];

      // Apply year filter
      const year = filters.year || new Date().getFullYear();
      expenses = expenses.filter((e) => new Date(e.date).getFullYear() === parseInt(year));

      // Calculate stats by category
      const byCategory = {};
      Object.keys(expenseCategories).forEach((cat) => {
        const catExpenses = expenses.filter((e) => e.category === cat);
        byCategory[cat] = {
          total: catExpenses.reduce((sum, e) => sum + e.amount, 0),
          count: catExpenses.length,
          deductible: catExpenses.filter((e) => e.taxDeductible).reduce((sum, e) => sum + e.amount, 0),
        };
      });

      // Calculate monthly breakdown
      const monthlyBreakdown = Array.from({ length: 12 }, (_, i) => {
        const monthExpenses = expenses.filter((e) => new Date(e.date).getMonth() === i);
        return {
          month: i + 1,
          total: monthExpenses.reduce((sum, e) => sum + e.amount, 0),
          count: monthExpenses.length,
        };
      });

      // Calculate YTD totals
      const ytd = {
        total: expenses.reduce((sum, e) => sum + e.amount, 0),
        count: expenses.length,
        deductible: expenses.filter((e) => e.taxDeductible).reduce((sum, e) => sum + e.amount, 0),
        nonDeductible: expenses.filter((e) => !e.taxDeductible).reduce((sum, e) => sum + e.amount, 0),
        avgPerMonth: expenses.length > 0
          ? expenses.reduce((sum, e) => sum + e.amount, 0) / 12 : 0,
        avgPerExpense: expenses.length > 0
          ? expenses.reduce((sum, e) => sum + e.amount, 0) / expenses.length : 0,
      };

      // Top vendors
      const vendorTotals = {};
      expenses.forEach((e) => {
        vendorTotals[e.vendor] = (vendorTotals[e.vendor] || 0) + e.amount;
      });
      const topVendors = Object.entries(vendorTotals)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([vendor, total]) => ({ vendor, total }));

      // Mileage stats
      const mileageExpenses = expenses.filter((e) => e.mileage);
      const totalMileage = mileageExpenses.reduce((sum, e) => sum + (e.mileage?.total || 0), 0);
      const mileageDeduction = mileageExpenses.reduce((sum, e) => sum + (e.mileage?.deduction || 0), 0);

      return {
        ytd,
        byCategory,
        monthlyBreakdown,
        topVendors,
        mileage: {
          totalMiles: totalMileage,
          totalDeduction: mileageDeduction,
          currentRate: 0.655,
        },
        pending: {
          count: mockExpenses.filter((e) => e.status === 'Pending').length,
          total: mockExpenses.filter((e) => e.status === 'Pending').reduce((sum, e) => sum + e.amount, 0),
        },
        reimbursable: {
          pending: expenses.filter((e) => e.reimbursable && e.reimbursementStatus === 'pending')
            .reduce((sum, e) => sum + e.amount, 0),
          approved: expenses.filter((e) => e.reimbursable && e.reimbursementStatus === 'approved')
            .reduce((sum, e) => sum + e.amount, 0),
        },
      };
    } catch (error) {
      logger.error('Mock Expense.getStats error:', error);
      throw error;
    }
  }

  static async getCategories() {
    return expenseCategories;
  }

  static async create(data) {
    try {
      const id = String(Math.max(...mockExpenses.map((e) => parseInt(e.id) || 0)) + 1);

      const newExpense = {
        id,
        category: data.category,
        subcategory: data.subcategory,
        vendor: data.vendor,
        description: data.description,
        amount: parseFloat(data.amount),
        date: new Date(data.date),
        paymentMethod: data.paymentMethod,
        paymentReference: data.paymentReference || null,
        status: data.status || 'Pending',
        taxDeductible: data.taxDeductible !== false,
        receipt: data.receipt || null,
        notes: data.notes || '',
        tags: data.tags || [],
        relatedTo: data.relatedTo || null,
        recurring: data.recurring || null,
        mileage: data.mileage || null,
        reimbursable: data.reimbursable || false,
        reimbursedTo: data.reimbursedTo || null,
        reimbursementStatus: data.reimbursable ? 'pending' : null,
        depreciable: data.depreciable || false,
        depreciationSchedule: data.depreciationSchedule || null,
        createdBy: data.createdBy || 'System',
        approvedBy: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockExpenses.push(newExpense);

      logger.info('Mock expense created:', {
        id: newExpense.id,
        vendor: newExpense.vendor,
        amount: newExpense.amount,
      });

      return newExpense;
    } catch (error) {
      logger.error('Mock Expense.create error:', error);
      throw error;
    }
  }

  static async update(id, data) {
    try {
      const index = mockExpenses.findIndex((e) => e.id === id);
      if (index === -1) {
        return null;
      }

      mockExpenses[index] = {
        ...mockExpenses[index],
        ...data,
        updatedAt: new Date(),
      };

      logger.info('Mock expense updated:', {
        id,
        changes: Object.keys(data),
      });

      return mockExpenses[index];
    } catch (error) {
      logger.error('Mock Expense.update error:', error);
      throw error;
    }
  }

  static async uploadReceipt(id, receiptData) {
    try {
      const expense = await this.update(id, {
        receipt: {
          id: Date.now(),
          filename: receiptData.filename,
          url: receiptData.url,
          uploadDate: new Date(),
        },
      });

      return expense;
    } catch (error) {
      logger.error('Mock Expense.uploadReceipt error:', error);
      throw error;
    }
  }

  static async approve(id, approvedBy) {
    try {
      const expense = await this.update(id, {
        status: 'Paid',
        approvedBy,
        reimbursementStatus: 'approved',
      });

      return expense;
    } catch (error) {
      logger.error('Mock Expense.approve error:', error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      const index = mockExpenses.findIndex((e) => e.id === id);
      if (index === -1) {
        throw new Error('Expense not found');
      }

      const deletedExpense = mockExpenses[index];
      mockExpenses.splice(index, 1);

      logger.info('Mock expense deleted:', {
        id,
        vendor: deletedExpense.vendor,
      });

      return { success: true, deletedId: id };
    } catch (error) {
      logger.error('Mock Expense.delete error:', error);
      throw error;
    }
  }

  static async generateReport(filters) {
    try {
      const expenses = await this.findAll({ ...filters, limit: 1000 });
      const stats = await this.getStats(filters);

      return {
        period: {
          start: filters.startDate || `${filters.year || new Date().getFullYear()}-01-01`,
          end: filters.endDate || `${filters.year || new Date().getFullYear()}-12-31`,
        },
        summary: stats.ytd,
        byCategory: stats.byCategory,
        expenses: expenses.expenses,
        generatedAt: new Date(),
        generatedBy: filters.userId || 'System',
      };
    } catch (error) {
      logger.error('Mock Expense.generateReport error:', error);
      throw error;
    }
  }
}

module.exports = ExpenseMock;
