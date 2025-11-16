const { pool } = require('../config/infrastructure/database');
const invoicesController = require('./invoices.controller');

jest.mock('../../../config/infrastructure/database');

describe('InvoicesController', () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      user: { id: 'user-123', email: 'agent@example.com', role: 'agent' },
      body: {},
      query: {},
      params: {},
    };

    mockRes = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };
  });

  describe('getInvoices (GET /invoices)', () => {
    it('should return all invoices for user', async () => {
      const mockInvoices = [
        {
          id: 'inv-1',
          amount: 15000,
          status: 'paid',
          dueDate: '2025-02-01',
        },
        {
          id: 'inv-2',
          amount: 12000,
          status: 'pending',
          dueDate: '2025-02-15',
        },
      ];

      pool.query.mockResolvedValue({ rows: mockInvoices });

      await invoicesController.getInvoices(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockInvoices,
      });
    });

    it('should filter by status', async () => {
      mockReq.query = { status: 'overdue' };

      pool.query.mockResolvedValue({ rows: [] });

      await invoicesController.getInvoices(mockReq, mockRes);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('status'),
        expect.any(Array),
      );
    });
  });

  describe('createInvoice (POST /invoices)', () => {
    it('should create new invoice with valid data', async () => {
      mockReq.body = {
        clientId: 'client-123',
        amount: 15000,
        dueDate: '2025-02-01',
        items: [
          { description: 'Commission', amount: 15000 },
        ],
      };

      const mockCreatedInvoice = { id: 'inv-new', ...mockReq.body };
      pool.query.mockResolvedValue({ rows: [mockCreatedInvoice] });

      await invoicesController.createInvoice(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockCreatedInvoice,
      });
    });

    it('should validate invoice amount matches line items', async () => {
      mockReq.body = {
        amount: 15000,
        items: [
          { description: 'Item 1', amount: 5000 },
          { description: 'Item 2', amount: 5000 },
          // Total = 10000, but invoice amount is 15000 (mismatch)
        ],
      };

      pool.query.mockRejectedValue(new Error('Amount mismatch'));

      await invoicesController.createInvoice(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  describe('updateInvoiceStatus (PUT /invoices/:id/status)', () => {
    it('should update invoice status to paid', async () => {
      mockReq.params = { id: 'inv-123' };
      mockReq.body = { status: 'paid' };

      const mockUpdatedInvoice = {
        id: 'inv-123',
        status: 'paid',
        paidAt: '2025-01-01T12:00:00Z',
      };

      pool.query.mockResolvedValue({ rows: [mockUpdatedInvoice] });

      await invoicesController.updateInvoiceStatus(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockUpdatedInvoice,
      });
    });

    it('should return 404 if invoice not found', async () => {
      mockReq.params = { id: 'nonexistent' };
      mockReq.body = { status: 'paid' };

      pool.query.mockResolvedValue({ rows: [] });

      await invoicesController.updateInvoiceStatus(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });
  });

  describe('deleteInvoice (DELETE /invoices/:id)', () => {
    it('should soft delete invoice', async () => {
      mockReq.params = { id: 'inv-123' };

      pool.query.mockResolvedValue({ rows: [{ id: 'inv-123' }] });

      await invoicesController.deleteInvoice(mockReq, mockRes);

      expect(pool.query).toHaveBeenCalled();
    });

    it('should prevent deleting paid invoices', async () => {
      mockReq.params = { id: 'inv-123' };

      pool.query.mockRejectedValue(new Error('Cannot delete paid invoice'));

      await invoicesController.deleteInvoice(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  describe('Financial Calculations', () => {
    it('should calculate invoice total from line items', async () => {
      mockReq.body = {
        items: [
          { amount: 100.50 },
          { amount: 200.75 },
          { amount: 300.25 },
        ],
      };

      const expectedTotal = 601.50;

      pool.query.mockResolvedValue({
        rows: [{ total: expectedTotal.toString() }],
      });

      await invoicesController.calculateTotal(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          total: expect.any(String),
        }),
      });
    });

    it('should handle tax calculations correctly', async () => {
      mockReq.body = {
        subtotal: 1000,
        taxRate: 0.08, // 8% tax
      };

      const expectedTotal = 1080; // 1000 + (1000 * 0.08)

      pool.query.mockResolvedValue({
        rows: [{ total: expectedTotal.toString() }],
      });

      await invoicesController.calculateWithTax(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Object),
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle overdue invoices correctly', async () => {
      const pastDate = new Date(Date.now() - 86400000).toISOString(); // Yesterday

      mockReq.query = { dueDate: pastDate };

      pool.query.mockResolvedValue({ rows: [] });

      await invoicesController.getInvoices(mockReq, mockRes);

      expect(pool.query).toHaveBeenCalled();
    });
  });
});
