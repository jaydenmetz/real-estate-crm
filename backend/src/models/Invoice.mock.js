// Mock Invoice model for development and testing
const logger = require('../utils/logger');

// Mock invoice data
let mockInvoices = [
  {
    id: '1',
    invoiceNumber: 'INV-2025-0041',
    type: 'Commission',
    status: 'Paid',
    clientId: null,
    clientName: 'Jayden Metz Realty',
    clientEmail: 'jayden@luxuryrealty.com',
    clientPhone: '(858) 555-9999',
    billingAddress: {
      street: '123 Realty Plaza',
      city: 'San Diego',
      state: 'CA',
      zipCode: '92101'
    },
    issueDate: new Date('2025-07-01'),
    dueDate: new Date('2025-07-01'),
    paidDate: new Date('2025-07-01'),
    subtotal: 25000,
    tax: 0,
    discount: 0,
    total: 25000,
    amountPaid: 25000,
    balance: 0,
    currency: 'USD',
    paymentMethod: 'Check',
    paymentReference: 'CHK-12344',
    items: [
      {
        id: 1,
        description: 'Commission - ESC-2025-001 - 456 Ocean View Dr',
        quantity: 1,
        rate: 31250,
        brokerageFee: 6250,
        amount: 25000,
        type: 'commission'
      }
    ],
    notes: 'Listing side commission for July closing',
    terms: 'Due upon closing',
    attachments: [
      {
        id: 1,
        name: 'Settlement Statement',
        url: '/api/v1/documents/settlement-001',
        uploadDate: new Date('2025-07-01')
      }
    ],
    relatedTo: {
      type: 'escrow',
      id: '1',
      reference: 'ESC-2025-001'
    },
    createdBy: 'System',
    createdAt: new Date('2025-07-01'),
    updatedAt: new Date('2025-07-01')
  },
  {
    id: '2',
    invoiceNumber: 'INV-2025-0042',
    type: 'Commission',
    status: 'Paid',
    clientId: null,
    clientName: 'Jayden Metz Realty',
    clientEmail: 'jayden@luxuryrealty.com',
    clientPhone: '(858) 555-9999',
    billingAddress: {
      street: '123 Realty Plaza',
      city: 'San Diego',
      state: 'CA',
      zipCode: '92101'
    },
    issueDate: new Date('2025-07-26'),
    dueDate: new Date('2025-07-26'),
    paidDate: new Date('2025-07-26'),
    subtotal: 15937.50,
    tax: 0,
    discount: 2520, // Deductions
    total: 13417.50,
    amountPaid: 13417.50,
    balance: 0,
    currency: 'USD',
    paymentMethod: 'Check',
    paymentReference: 'CHK-12345',
    items: [
      {
        id: 1,
        description: 'Commission - ESC-2025-002 - 789 Sunset Blvd',
        quantity: 1,
        rate: 21250,
        brokerageFee: 5312.50,
        amount: 15937.50,
        type: 'commission'
      },
      {
        id: 2,
        description: 'Referral Fee - Sarah Johnson',
        quantity: 1,
        rate: -2125,
        amount: -2125,
        type: 'deduction'
      },
      {
        id: 3,
        description: 'Transaction Fee',
        quantity: 1,
        rate: -395,
        amount: -395,
        type: 'deduction'
      }
    ],
    notes: 'Buyer side commission with referral fee',
    terms: 'Due upon closing',
    attachments: [],
    relatedTo: {
      type: 'escrow',
      id: '2',
      reference: 'ESC-2025-002'
    },
    createdBy: 'System',
    createdAt: new Date('2025-07-26'),
    updatedAt: new Date('2025-07-26')
  },
  {
    id: '3',
    invoiceNumber: 'INV-2025-0043',
    type: 'Service',
    status: 'Pending',
    clientId: '1',
    clientName: 'Michael Thompson',
    clientEmail: 'michael.thompson@email.com',
    clientPhone: '(619) 555-1234',
    billingAddress: {
      street: '789 Buyer Lane',
      city: 'La Jolla',
      state: 'CA',
      zipCode: '92037'
    },
    issueDate: new Date('2025-07-15'),
    dueDate: new Date('2025-08-15'),
    paidDate: null,
    subtotal: 2500,
    tax: 206.25, // 8.25% CA tax
    discount: 0,
    total: 2706.25,
    amountPaid: 0,
    balance: 2706.25,
    currency: 'USD',
    paymentMethod: null,
    paymentReference: null,
    items: [
      {
        id: 1,
        description: 'Professional Photography Package',
        quantity: 1,
        rate: 500,
        amount: 500,
        type: 'service'
      },
      {
        id: 2,
        description: 'Virtual Tour Creation',
        quantity: 1,
        rate: 750,
        amount: 750,
        type: 'service'
      },
      {
        id: 3,
        description: 'Drone Photography',
        quantity: 1,
        rate: 350,
        amount: 350,
        type: 'service'
      },
      {
        id: 4,
        description: 'Premium Listing Marketing Package',
        quantity: 1,
        rate: 900,
        amount: 900,
        type: 'service'
      }
    ],
    notes: 'Marketing services for property listing',
    terms: 'Net 30',
    attachments: [],
    relatedTo: {
      type: 'listing',
      id: '1',
      reference: '123 Main Street'
    },
    createdBy: 'Jayden Metz',
    createdAt: new Date('2025-07-15'),
    updatedAt: new Date('2025-07-15')
  },
  {
    id: '4',
    invoiceNumber: 'INV-2025-0044',
    type: 'Service',
    status: 'Overdue',
    clientId: '2',
    clientName: 'Jennifer Wilson',
    clientEmail: 'jennifer.wilson@email.com',
    clientPhone: '(619) 555-6789',
    billingAddress: {
      street: '456 Seller Ave',
      city: 'Del Mar',
      state: 'CA',
      zipCode: '92014'
    },
    issueDate: new Date('2025-06-01'),
    dueDate: new Date('2025-06-30'),
    paidDate: null,
    subtotal: 150,
    tax: 12.38,
    discount: 0,
    total: 162.38,
    amountPaid: 0,
    balance: 162.38,
    currency: 'USD',
    paymentMethod: null,
    paymentReference: null,
    items: [
      {
        id: 1,
        description: 'Home Staging Consultation',
        quantity: 2,
        rate: 75,
        amount: 150,
        type: 'service'
      }
    ],
    notes: 'Initial staging consultation services',
    terms: 'Net 30',
    attachments: [],
    relatedTo: null,
    createdBy: 'Jayden Metz',
    createdAt: new Date('2025-06-01'),
    updatedAt: new Date('2025-07-10')
  }
];

// Invoice counter for generating numbers
let invoiceCounter = 44;

class InvoiceMock {
  static async findAll(filters = {}) {
    try {
      let filtered = [...mockInvoices];
      
      // Apply status filter
      if (filters.status && filters.status !== 'all') {
        filtered = filtered.filter(i => i.status === filters.status);
      }
      
      // Apply type filter
      if (filters.type) {
        filtered = filtered.filter(i => i.type === filters.type);
      }
      
      // Apply client filter
      if (filters.clientId) {
        filtered = filtered.filter(i => i.clientId === filters.clientId);
      }
      
      // Apply date range filter
      if (filters.startDate || filters.endDate) {
        const startDate = filters.startDate ? new Date(filters.startDate) : new Date('1900-01-01');
        const endDate = filters.endDate ? new Date(filters.endDate) : new Date('2100-12-31');
        filtered = filtered.filter(i => 
          i.issueDate >= startDate && i.issueDate <= endDate
        );
      }
      
      // Apply overdue filter
      if (filters.overdue === 'true') {
        const today = new Date();
        filtered = filtered.filter(i => 
          i.status === 'Pending' && i.dueDate < today
        );
      }
      
      // Apply search
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filtered = filtered.filter(i => 
          i.invoiceNumber.toLowerCase().includes(searchTerm) ||
          i.clientName.toLowerCase().includes(searchTerm) ||
          i.items.some(item => item.description.toLowerCase().includes(searchTerm))
        );
      }
      
      // Apply sorting
      const sortField = filters.sort || 'issueDate';
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
      const minimalInvoices = paginated.map(invoice => ({
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        type: invoice.type,
        status: invoice.status,
        clientName: invoice.clientName,
        issueDate: invoice.issueDate,
        dueDate: invoice.dueDate,
        total: invoice.total,
        amountPaid: invoice.amountPaid,
        balance: invoice.balance,
        createdAt: invoice.createdAt,
        updatedAt: invoice.updatedAt
      }));
      
      return {
        invoices: minimalInvoices,
        pagination: {
          total: filtered.length,
          page,
          pages: Math.ceil(filtered.length / limit),
          limit
        }
      };
    } catch (error) {
      logger.error('Mock Invoice.findAll error:', error);
      throw error;
    }
  }

  static async findById(id) {
    const invoice = mockInvoices.find(i => i.id === id);
    if (!invoice) return null;
    
    // Return comprehensive invoice data for detail view
    return {
      ...invoice,
      
      // Payment history
      paymentHistory: invoice.amountPaid > 0 ? [
        {
          id: 1,
          date: invoice.paidDate,
          amount: invoice.amountPaid,
          method: invoice.paymentMethod,
          reference: invoice.paymentReference,
          notes: 'Full payment received'
        }
      ] : [],
      
      // Activity log
      activityLog: [
        {
          date: invoice.createdAt,
          action: 'Invoice Created',
          user: invoice.createdBy,
          details: `Invoice ${invoice.invoiceNumber} created`
        },
        {
          date: invoice.issueDate,
          action: 'Invoice Issued',
          user: 'System',
          details: 'Invoice sent to client'
        },
        ...(invoice.status === 'Paid' ? [{
          date: invoice.paidDate,
          action: 'Payment Received',
          user: 'System',
          details: `Payment of $${invoice.amountPaid} received`
        }] : []),
        ...(invoice.status === 'Overdue' ? [{
          date: new Date(invoice.dueDate.getTime() + 24 * 60 * 60 * 1000),
          action: 'Invoice Overdue',
          user: 'System',
          details: 'Invoice marked as overdue'
        }] : [])
      ],
      
      // Related documents
      relatedDocuments: invoice.relatedTo ? [
        {
          id: 1,
          type: invoice.relatedTo.type,
          reference: invoice.relatedTo.reference,
          url: `/api/v1/${invoice.relatedTo.type}s/${invoice.relatedTo.id}`
        }
      ] : [],
      
      // Email history
      emailHistory: [
        {
          date: invoice.issueDate,
          subject: `Invoice ${invoice.invoiceNumber} - ${invoice.clientName}`,
          recipient: invoice.clientEmail,
          status: 'Sent',
          opened: true,
          openedDate: new Date(invoice.issueDate.getTime() + 2 * 60 * 60 * 1000)
        },
        ...(invoice.status === 'Overdue' ? [{
          date: new Date(invoice.dueDate.getTime() + 7 * 24 * 60 * 60 * 1000),
          subject: `Reminder: Invoice ${invoice.invoiceNumber} Overdue`,
          recipient: invoice.clientEmail,
          status: 'Sent',
          opened: true,
          openedDate: new Date(invoice.dueDate.getTime() + 7.5 * 24 * 60 * 60 * 1000)
        }] : [])
      ]
    };
  }

  static async getStats() {
    try {
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth();
      const today = new Date();
      
      // Calculate stats
      const totalOutstanding = mockInvoices
        .filter(i => i.status === 'Pending' || i.status === 'Overdue')
        .reduce((sum, i) => sum + i.balance, 0);
      
      const totalOverdue = mockInvoices
        .filter(i => i.status === 'Overdue')
        .reduce((sum, i) => sum + i.balance, 0);
      
      const ytdInvoices = mockInvoices.filter(i => 
        new Date(i.issueDate).getFullYear() === currentYear
      );
      
      const monthlyInvoices = mockInvoices.filter(i => {
        const date = new Date(i.issueDate);
        return date.getFullYear() === currentYear && date.getMonth() === currentMonth;
      });
      
      const avgDaysToPayment = mockInvoices
        .filter(i => i.status === 'Paid' && i.paidDate)
        .map(i => Math.ceil((i.paidDate - i.issueDate) / (1000 * 60 * 60 * 24)))
        .reduce((sum, days, _, arr) => sum + days / arr.length, 0);
      
      return {
        outstanding: {
          total: totalOutstanding,
          count: mockInvoices.filter(i => i.status === 'Pending' || i.status === 'Overdue').length,
          overdue: totalOverdue,
          overdueCount: mockInvoices.filter(i => i.status === 'Overdue').length
        },
        ytd: {
          total: ytdInvoices.reduce((sum, i) => sum + i.total, 0),
          paid: ytdInvoices.filter(i => i.status === 'Paid').reduce((sum, i) => sum + i.total, 0),
          count: ytdInvoices.length,
          avgInvoiceValue: ytdInvoices.length > 0 
            ? ytdInvoices.reduce((sum, i) => sum + i.total, 0) / ytdInvoices.length 
            : 0
        },
        monthly: {
          total: monthlyInvoices.reduce((sum, i) => sum + i.total, 0),
          paid: monthlyInvoices.filter(i => i.status === 'Paid').reduce((sum, i) => sum + i.total, 0),
          count: monthlyInvoices.length
        },
        performance: {
          avgDaysToPayment: Math.round(avgDaysToPayment),
          paymentRate: mockInvoices.length > 0 
            ? (mockInvoices.filter(i => i.status === 'Paid').length / mockInvoices.length) * 100 
            : 0,
          byType: {
            commission: mockInvoices.filter(i => i.type === 'Commission').length,
            service: mockInvoices.filter(i => i.type === 'Service').length
          }
        }
      };
    } catch (error) {
      logger.error('Mock Invoice.getStats error:', error);
      throw error;
    }
  }

  static async create(data) {
    try {
      const id = String(Math.max(...mockInvoices.map(i => parseInt(i.id) || 0)) + 1);
      invoiceCounter++;
      const invoiceNumber = `INV-${new Date().getFullYear()}-${String(invoiceCounter).padStart(4, '0')}`;
      
      // Calculate totals
      const subtotal = data.items.reduce((sum, item) => sum + item.amount, 0);
      const tax = data.taxRate ? subtotal * (data.taxRate / 100) : 0;
      const total = subtotal + tax - (data.discount || 0);
      
      const newInvoice = {
        id,
        invoiceNumber,
        type: data.type || 'Service',
        status: 'Pending',
        clientId: data.clientId,
        clientName: data.clientName,
        clientEmail: data.clientEmail,
        clientPhone: data.clientPhone,
        billingAddress: data.billingAddress,
        issueDate: data.issueDate || new Date(),
        dueDate: data.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        paidDate: null,
        subtotal,
        tax,
        discount: data.discount || 0,
        total,
        amountPaid: 0,
        balance: total,
        currency: data.currency || 'USD',
        paymentMethod: null,
        paymentReference: null,
        items: data.items,
        notes: data.notes || '',
        terms: data.terms || 'Net 30',
        attachments: [],
        relatedTo: data.relatedTo || null,
        createdBy: data.createdBy || 'System',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      mockInvoices.push(newInvoice);
      
      logger.info('Mock invoice created:', {
        id: newInvoice.id,
        invoiceNumber: newInvoice.invoiceNumber,
        total: newInvoice.total
      });
      
      return newInvoice;
    } catch (error) {
      logger.error('Mock Invoice.create error:', error);
      throw error;
    }
  }

  static async update(id, data) {
    try {
      const index = mockInvoices.findIndex(i => i.id === id);
      if (index === -1) {
        return null;
      }
      
      // Recalculate totals if items changed
      if (data.items) {
        data.subtotal = data.items.reduce((sum, item) => sum + item.amount, 0);
        const taxRate = data.taxRate || (mockInvoices[index].tax / mockInvoices[index].subtotal * 100);
        data.tax = data.subtotal * (taxRate / 100);
        data.total = data.subtotal + data.tax - (data.discount || mockInvoices[index].discount || 0);
        data.balance = data.total - (data.amountPaid || mockInvoices[index].amountPaid || 0);
      }
      
      mockInvoices[index] = {
        ...mockInvoices[index],
        ...data,
        updatedAt: new Date()
      };
      
      logger.info('Mock invoice updated:', {
        id,
        changes: Object.keys(data)
      });
      
      return mockInvoices[index];
    } catch (error) {
      logger.error('Mock Invoice.update error:', error);
      throw error;
    }
  }

  static async recordPayment(id, paymentData) {
    try {
      const invoice = mockInvoices.find(i => i.id === id);
      if (!invoice) {
        throw new Error('Invoice not found');
      }
      
      const amountPaid = invoice.amountPaid + paymentData.amount;
      const balance = invoice.total - amountPaid;
      const status = balance <= 0 ? 'Paid' : 'Pending';
      
      return await this.update(id, {
        amountPaid,
        balance,
        status,
        paidDate: status === 'Paid' ? paymentData.date || new Date() : null,
        paymentMethod: paymentData.method,
        paymentReference: paymentData.reference
      });
    } catch (error) {
      logger.error('Mock Invoice.recordPayment error:', error);
      throw error;
    }
  }

  static async sendReminder(id) {
    try {
      const invoice = mockInvoices.find(i => i.id === id);
      if (!invoice) {
        throw new Error('Invoice not found');
      }
      
      logger.info('Mock invoice reminder sent:', {
        id,
        invoiceNumber: invoice.invoiceNumber,
        recipient: invoice.clientEmail
      });
      
      return {
        success: true,
        message: `Reminder sent to ${invoice.clientEmail}`,
        sentAt: new Date()
      };
    } catch (error) {
      logger.error('Mock Invoice.sendReminder error:', error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      const index = mockInvoices.findIndex(i => i.id === id);
      if (index === -1) {
        throw new Error('Invoice not found');
      }
      
      const deletedInvoice = mockInvoices[index];
      mockInvoices.splice(index, 1);
      
      logger.info('Mock invoice deleted:', {
        id,
        invoiceNumber: deletedInvoice.invoiceNumber
      });
      
      return { success: true, deletedId: id };
    } catch (error) {
      logger.error('Mock Invoice.delete error:', error);
      throw error;
    }
  }
}

module.exports = InvoiceMock;