/**
 * Commissions Service
 *
 * Business logic for commission management:
 * - Commission calculations and splits
 * - Agent commission tracking
 * - Payment status management
 * - Commission reporting
 *
 * Extracted from commissions.controller.js for DDD compliance.
 */

const Commission = require('../models/Commission.mock');

/**
 * Get all commissions with filtering
 * @param {Object} filters - Query filters
 * @param {Object} user - Authenticated user
 * @returns {Promise<Object>} Paginated commission results
 */
exports.getAllCommissions = async (filters, user) => {
  const {
    status,
    agentId,
    side,
    startDate,
    endDate,
    page = 1,
    limit = 20,
    sort,
    order
  } = filters;

  const result = await Commission.findAll({
    status,
    agentId,
    side,
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
 * Get commission by ID
 * @param {string} id - Commission ID
 * @param {Object} user - Authenticated user
 * @returns {Promise<Object>} Commission details
 */
exports.getCommissionById = async (id, user) => {
  const commission = await Commission.findById(id);

  if (!commission) {
    const error = new Error('Commission not found');
    error.code = 'NOT_FOUND';
    throw error;
  }

  return commission;
};

/**
 * Create commission record
 * @param {Object} data - Commission data
 * @param {Object} user - Authenticated user
 * @returns {Promise<Object>} Created commission
 */
exports.createCommission = async (data, user) => {
  const {
    escrowId,
    agentId,
    side,
    percentage,
    amount,
    status = 'pending',
    notes
  } = data;

  // Validate commission data
  if (!escrowId || !agentId || !side) {
    const error = new Error('Missing required fields: escrowId, agentId, side');
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  // Validate side
  if (!['listing', 'buyer'].includes(side)) {
    const error = new Error('Invalid side. Must be "listing" or "buyer"');
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  // Create commission
  const commission = await Commission.create({
    escrowId,
    agentId,
    side,
    percentage,
    amount,
    status,
    notes,
    createdBy: user.id
  });

  return commission;
};

/**
 * Update commission
 * @param {string} id - Commission ID
 * @param {Object} data - Update data
 * @param {Object} user - Authenticated user
 * @returns {Promise<Object>} Updated commission
 */
exports.updateCommission = async (id, data, user) => {
  // Check exists
  await exports.getCommissionById(id, user);

  const {
    percentage,
    amount,
    status,
    notes,
    paidDate
  } = data;

  const updateData = {};

  if (percentage !== undefined) updateData.percentage = percentage;
  if (amount !== undefined) updateData.amount = amount;
  if (status !== undefined) updateData.status = status;
  if (notes !== undefined) updateData.notes = notes;
  if (paidDate !== undefined) updateData.paidDate = paidDate;

  // Auto-set paidDate when status changes to paid
  if (status === 'paid' && !paidDate) {
    updateData.paidDate = new Date().toISOString();
  }

  const commission = await Commission.update(id, updateData);
  return commission;
};

/**
 * Delete commission
 * @param {string} id - Commission ID
 * @param {Object} user - Authenticated user
 * @returns {Promise<void>}
 */
exports.deleteCommission = async (id, user) => {
  // Check exists
  await exports.getCommissionById(id, user);

  await Commission.delete(id);
};

/**
 * Calculate commission split
 * @param {number} totalCommission - Total commission amount
 * @param {Array} splits - Array of split percentages
 * @returns {Array} Calculated split amounts
 */
exports.calculateCommissionSplit = (totalCommission, splits) => {
  if (!Array.isArray(splits) || splits.length === 0) {
    return [{ percentage: 100, amount: totalCommission }];
  }

  // Validate split percentages total 100%
  const totalPercentage = splits.reduce((sum, split) => sum + split.percentage, 0);
  if (Math.abs(totalPercentage - 100) > 0.01) {
    const error = new Error('Split percentages must total 100%');
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  // Calculate amounts
  return splits.map(split => ({
    ...split,
    amount: (totalCommission * split.percentage) / 100
  }));
};

/**
 * Get commission summary by agent
 * @param {string} agentId - Agent ID
 * @param {Object} filters - Date filters
 * @param {Object} user - Authenticated user
 * @returns {Promise<Object>} Commission summary
 */
exports.getCommissionSummary = async (agentId, filters, user) => {
  const { startDate, endDate } = filters;

  const commissions = await Commission.findAll({
    agentId,
    startDate,
    endDate
  });

  const summary = {
    totalCommissions: commissions.data.length,
    totalAmount: 0,
    paidAmount: 0,
    pendingAmount: 0,
    byStatus: {},
    bySide: {
      listing: { count: 0, amount: 0 },
      buyer: { count: 0, amount: 0 }
    }
  };

  commissions.data.forEach(comm => {
    summary.totalAmount += comm.amount;

    if (comm.status === 'paid') {
      summary.paidAmount += comm.amount;
    } else {
      summary.pendingAmount += comm.amount;
    }

    // By status
    if (!summary.byStatus[comm.status]) {
      summary.byStatus[comm.status] = { count: 0, amount: 0 };
    }
    summary.byStatus[comm.status].count++;
    summary.byStatus[comm.status].amount += comm.amount;

    // By side
    if (comm.side) {
      summary.bySide[comm.side].count++;
      summary.bySide[comm.side].amount += comm.amount;
    }
  });

  return summary;
};
