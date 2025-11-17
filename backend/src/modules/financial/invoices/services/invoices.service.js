/**
 * Invoices Service
 *
 * Business logic for invoice management:
 * - Invoice generation and tracking
 * - Payment status management
 * - Invoice line items
 *
 * Extracted from invoices.controller.js for DDD compliance.
 */

const Invoice = require('../models/Invoice.mock');

/**
 * Get all invoices with filtering
 * @param {Object} filters - Query filters
 * @param {Object} user - Authenticated user
 * @returns {Promise<Object>} Paginated invoice results
 */
exports.getAllInvoices = async (filters, user) => {
  const {
    status,
    customerId,
    startDate,
    endDate,
    page = 1,
    limit = 20,
    sort,
    order
  } = filters;

  const result = await Invoice.findAll({
    status,
    customerId,
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
 * Get invoice by ID
 * @param {string} id - Invoice ID
 * @param {Object} user - Authenticated user
 * @returns {Promise<Object>} Invoice details
 */
exports.getInvoiceById = async (id, user) => {
  const invoice = await Invoice.findById(id);

  if (!invoice) {
    const error = new Error('Invoice not found');
    error.code = 'NOT_FOUND';
    throw error;
  }

  return invoice;
};

/**
 * Create invoice
 * @param {Object} data - Invoice data
 * @param {Object} user - Authenticated user
 * @returns {Promise<Object>} Created invoice
 */
exports.createInvoice = async (data, user) => {
  const {
    invoiceNumber,
    customerId,
    customerName,
    dueDate,
    lineItems = [],
    notes
  } = data;

  // Validate required fields
  if (!customerId || !customerName) {
    const error = new Error('Missing required fields: customerId, customerName');
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  // Calculate totals
  const subtotal = lineItems.reduce((sum, item) => {
    return sum + (item.quantity * item.unitPrice);
  }, 0);

  const tax = subtotal * 0.0725; // 7.25% tax (configurable)
  const total = subtotal + tax;

  const invoice = await Invoice.create({
    invoiceNumber,
    customerId,
    customerName,
    dueDate,
    lineItems,
    subtotal,
    tax,
    total,
    status: 'draft',
    notes,
    createdBy: user.id
  });

  return invoice;
};

/**
 * Update invoice
 * @param {string} id - Invoice ID
 * @param {Object} data - Update data
 * @param {Object} user - Authenticated user
 * @returns {Promise<Object>} Updated invoice
 */
exports.updateInvoice = async (id, data, user) => {
  // Check exists
  await exports.getInvoiceById(id, user);

  const {
    status,
    dueDate,
    lineItems,
    notes,
    paidDate
  } = data;

  const updateData = {};

  if (status !== undefined) updateData.status = status;
  if (dueDate !== undefined) updateData.dueDate = dueDate;
  if (notes !== undefined) updateData.notes = notes;
  if (paidDate !== undefined) updateData.paidDate = paidDate;

  // Recalculate totals if line items changed
  if (lineItems !== undefined) {
    const subtotal = lineItems.reduce((sum, item) => {
      return sum + (item.quantity * item.unitPrice);
    }, 0);

    const tax = subtotal * 0.0725;
    const total = subtotal + tax;

    updateData.lineItems = lineItems;
    updateData.subtotal = subtotal;
    updateData.tax = tax;
    updateData.total = total;
  }

  // Auto-set paidDate when status changes to paid
  if (status === 'paid' && !paidDate) {
    updateData.paidDate = new Date().toISOString();
  }

  const invoice = await Invoice.update(id, updateData);
  return invoice;
};

/**
 * Delete invoice
 * @param {string} id - Invoice ID
 * @param {Object} user - Authenticated user
 * @returns {Promise<void>}
 */
exports.deleteInvoice = async (id, user) => {
  // Check exists
  await exports.getInvoiceById(id, user);

  await Invoice.delete(id);
};

/**
 * Send invoice to customer
 * @param {string} id - Invoice ID
 * @param {Object} user - Authenticated user
 * @returns {Promise<Object>} Updated invoice
 */
exports.sendInvoice = async (id, user) => {
  // Check exists
  const invoice = await exports.getInvoiceById(id, user);

  // Update status to sent
  const updated = await Invoice.update(id, {
    status: 'sent',
    sentDate: new Date().toISOString()
  });

  // TODO: Send email notification (integrate with email service)

  return updated;
};
