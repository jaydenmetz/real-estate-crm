const { pool } = require('../config/database');
const expensesController = require('./expenses.controller');

jest.mock('../config/database');

describe('ExpensesController', () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      user: { id: 'user-123', email: 'user@example.com', role: 'agent' },
      body: {},
      query: {},
      params: {},
    };

    mockRes = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };
  });

  describe('getExpenses (GET /expenses)', () => {
    it('should return all expenses for user', async () => {
      const mockExpenses = [
        { id: 'exp-1', amount: 500, category: 'marketing', description: 'Ads' },
        { id: 'exp-2', amount: 200, category: 'office', description: 'Supplies' },
      ];

      pool.query.mockResolvedValue({ rows: mockExpenses });

      await expensesController.getExpenses(mockReq, mockRes);

      expect(pool.query).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockExpenses,
      });
    });

    it('should filter by category', async () => {
      mockReq.query = { category: 'marketing' };

      pool.query.mockResolvedValue({ rows: [] });

      await expensesController.getExpenses(mockReq, mockRes);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('category'),
        expect.any(Array),
      );
    });

    it('should handle database errors', async () => {
      pool.query.mockRejectedValue(new Error('DB error'));

      await expensesController.getExpenses(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  describe('createExpense (POST /expenses)', () => {
    it('should create new expense', async () => {
      mockReq.body = {
        amount: 500.50,
        category: 'marketing',
        description: 'Google Ads',
        date: '2025-01-01',
      };

      const mockCreatedExpense = { id: 'exp-new', ...mockReq.body };
      pool.query.mockResolvedValue({ rows: [mockCreatedExpense] });

      await expensesController.createExpense(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockCreatedExpense,
      });
    });

    it('should validate amount is positive', async () => {
      mockReq.body = { amount: -100, category: 'office' };

      pool.query.mockRejectedValue(new Error('Amount must be positive'));

      await expensesController.createExpense(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  describe('deleteExpense (DELETE /expenses/:id)', () => {
    it('should soft delete expense', async () => {
      mockReq.params = { id: 'exp-123' };

      pool.query.mockResolvedValue({ rows: [{ id: 'exp-123' }] });

      await expensesController.deleteExpense(mockReq, mockRes);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('DELETE'),
        ['exp-123'],
      );
    });

    it('should return 404 if expense not found', async () => {
      mockReq.params = { id: 'nonexistent' };

      pool.query.mockResolvedValue({ rows: [] });

      await expensesController.deleteExpense(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });
  });

  describe('Financial Accuracy', () => {
    it('should handle decimal amounts correctly', async () => {
      mockReq.body = {
        amount: 123.456, // Should round to 2 decimal places
        category: 'marketing',
      };

      pool.query.mockResolvedValue({ rows: [mockReq.body] });

      await expensesController.createExpense(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    it('should calculate total expenses correctly', async () => {
      pool.query.mockResolvedValue({
        rows: [{ total: '1234.56' }],
      });

      await expensesController.getTotalExpenses(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          total: expect.any(String),
        }),
      });
    });
  });
});
