/**
 * Expenses Service
 *
 * Business logic for expense management:
 * - Expense tracking and categorization
 * - Receipt management
 * - Expense reporting
 *
 * Extracted from expenses.controller.js for DDD compliance.
 */

const Expense = require('../models/Expense.mock');

/**
 * Get all expenses with filtering
 * @param {Object} filters - Query filters
 * @param {Object} user - Authenticated user
 * @returns {Promise<Object>} Paginated expense results
 */
exports.getAllExpenses = async (filters, user) => {
  const {
    category,
    status,
    startDate,
    endDate,
    page = 1,
    limit = 20,
    sort,
    order
  } = filters;

  const result = await Expense.findAll({
    category,
    status,
    startDate,
    endDate,
    page,
    limit,
    sort,
    order
  });

  return result;
};

/**
 * Get expense by ID
 * @param {string} id - Expense ID
 * @param {Object} user - Authenticated user
 * @returns {Promise<Object>} Expense details
 */
exports.getExpenseById = async (id, user) => {
  const expense = await Expense.findById(id);

  if (!expense) {
    const error = new Error('Expense not found');
    error.code = 'NOT_FOUND';
    throw error;
  }

  return expense;
};

/**
 * Create expense
 * @param {Object} data - Expense data
 * @param {Object} user - Authenticated user
 * @returns {Promise<Object>} Created expense
 */
exports.createExpense = async (data, user) => {
  const {
    description,
    amount,
    category,
    date,
    vendor,
    receiptUrl,
    notes,
    reimbursable = false
  } = data;

  // Validate required fields
  if (!description || amount === undefined || !category) {
    const error = new Error('Missing required fields: description, amount, category');
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  // Validate amount
  if (amount <= 0) {
    const error = new Error('Amount must be greater than 0');
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  const expense = await Expense.create({
    description,
    amount,
    category,
    date: date || new Date().toISOString(),
    vendor,
    receiptUrl,
    notes,
    reimbursable,
    status: 'pending',
    createdBy: user.id
  });

  return expense;
};

/**
 * Update expense
 * @param {string} id - Expense ID
 * @param {Object} data - Update data
 * @param {Object} user - Authenticated user
 * @returns {Promise<Object>} Updated expense
 */
exports.updateExpense = async (id, data, user) => {
  // Check exists
  await exports.getExpenseById(id, user);

  const {
    description,
    amount,
    category,
    date,
    vendor,
    receiptUrl,
    notes,
    reimbursable,
    status,
    approvedBy,
    approvedDate
  } = data;

  const updateData = {};

  if (description !== undefined) updateData.description = description;
  if (amount !== undefined) {
    if (amount <= 0) {
      const error = new Error('Amount must be greater than 0');
      error.code = 'VALIDATION_ERROR';
      throw error;
    }
    updateData.amount = amount;
  }
  if (category !== undefined) updateData.category = category;
  if (date !== undefined) updateData.date = date;
  if (vendor !== undefined) updateData.vendor = vendor;
  if (receiptUrl !== undefined) updateData.receiptUrl = receiptUrl;
  if (notes !== undefined) updateData.notes = notes;
  if (reimbursable !== undefined) updateData.reimbursable = reimbursable;
  if (status !== undefined) updateData.status = status;
  if (approvedBy !== undefined) updateData.approvedBy = approvedBy;
  if (approvedDate !== undefined) updateData.approvedDate = approvedDate;

  // Auto-set approvedDate when status changes to approved
  if (status === 'approved' && !approvedDate) {
    updateData.approvedBy = user.id;
    updateData.approvedDate = new Date().toISOString();
  }

  const expense = await Expense.update(id, updateData);
  return expense;
};

/**
 * Delete expense
 * @param {string} id - Expense ID
 * @param {Object} user - Authenticated user
 * @returns {Promise<void>}
 */
exports.deleteExpense = async (id, user) => {
  // Check exists
  await exports.getExpenseById(id, user);

  await Expense.delete(id);
};

/**
 * Get expense summary by category
 * @param {Object} filters - Date filters
 * @param {Object} user - Authenticated user
 * @returns {Promise<Object>} Expense summary
 */
exports.getExpenseSummary = async (filters, user) => {
  const { startDate, endDate } = filters;

  const expenses = await Expense.findAll({
    startDate,
    endDate
  });

  const summary = {
    totalExpenses: expenses.data.length,
    totalAmount: 0,
    reimbursableAmount: 0,
    byCategory: {},
    byStatus: {},
    byMonth: {}
  };

  expenses.data.forEach(expense => {
    summary.totalAmount += expense.amount;

    if (expense.reimbursable) {
      summary.reimbursableAmount += expense.amount;
    }

    // By category
    if (!summary.byCategory[expense.category]) {
      summary.byCategory[expense.category] = { count: 0, amount: 0 };
    }
    summary.byCategory[expense.category].count++;
    summary.byCategory[expense.category].amount += expense.amount;

    // By status
    if (!summary.byStatus[expense.status]) {
      summary.byStatus[expense.status] = { count: 0, amount: 0 };
    }
    summary.byStatus[expense.status].count++;
    summary.byStatus[expense.status].amount += expense.amount;

    // By month
    const month = new Date(expense.date).toISOString().substring(0, 7); // YYYY-MM
    if (!summary.byMonth[month]) {
      summary.byMonth[month] = { count: 0, amount: 0 };
    }
    summary.byMonth[month].count++;
    summary.byMonth[month].amount += expense.amount;
  });

  return summary;
};
