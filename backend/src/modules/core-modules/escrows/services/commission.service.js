/**
 * Commission Calculation Service
 *
 * Handles all commission-related calculations for escrows
 * Supports multiple schema versions (net_commission, my_commission, buyer_side_commission)
 */

/**
 * Calculate gross commission from purchase price and percentage
 * @param {number} purchasePrice - Property purchase price
 * @param {number} percentage - Commission percentage (e.g., 2.5 for 2.5%)
 * @returns {number} Gross commission amount
 */
function calculateGrossCommission(purchasePrice, percentage) {
  if (!purchasePrice || !percentage) return 0;
  return (purchasePrice * percentage) / 100;
}

/**
 * Build dynamic commission field SQL based on database schema
 * Supports backward compatibility with multiple schema versions
 *
 * @param {object} schema - Schema info from schema.service.js
 * @returns {string} SQL expression for commission calculation
 */
function buildCommissionField(schema) {
  // Priority order:
  // 1. my_commission (preferred, most specific)
  // 2. net_commission (common in production)
  // 3. buyer_side_commission * purchase_price / 100 (calculated)
  // 4. buyer_side_commission (flat amount)
  // 5. 0 (fallback)

  if (schema.hasMyCommission && schema.hasBuyerSideCommission) {
    return 'COALESCE(my_commission, net_commission, buyer_side_commission * purchase_price / 100, buyer_side_commission, 0)';
  }

  if (schema.hasMyCommission) {
    return 'COALESCE(my_commission, net_commission, 0)';
  }

  if (schema.hasNetCommission && schema.hasBuyerSideCommission) {
    return 'COALESCE(net_commission, buyer_side_commission * purchase_price / 100, buyer_side_commission, 0)';
  }

  if (schema.hasNetCommission) {
    return 'COALESCE(net_commission, 0)';
  }

  if (schema.hasBuyerSideCommission) {
    return 'COALESCE(buyer_side_commission * purchase_price / 100, buyer_side_commission, 0)';
  }

  return '0';
}

/**
 * Calculate net commission after splits
 * @param {number} grossCommission - Total commission before splits
 * @param {number} agentSplit - Agent's percentage of commission (e.g., 70 for 70%)
 * @param {number} brokerSplit - Broker's percentage of commission (e.g., 30 for 30%)
 * @returns {object} { agentCommission, brokerCommission }
 */
function calculateCommissionSplits(grossCommission, agentSplit = 100, brokerSplit = 0) {
  if (!grossCommission) {
    return { agentCommission: 0, brokerCommission: 0 };
  }

  const agentCommission = (grossCommission * agentSplit) / 100;
  const brokerCommission = (grossCommission * brokerSplit) / 100;

  return {
    agentCommission: Math.round(agentCommission * 100) / 100, // Round to 2 decimals
    brokerCommission: Math.round(brokerCommission * 100) / 100
  };
}

/**
 * Validate commission percentage
 * @param {number} percentage - Commission percentage to validate
 * @returns {boolean} True if valid
 */
function isValidCommissionPercentage(percentage) {
  if (typeof percentage !== 'number') return false;
  if (percentage < 0 || percentage > 100) return false;
  return true;
}

/**
 * Format commission for display
 * @param {number} amount - Commission amount
 * @returns {string} Formatted currency string
 */
function formatCommission(amount) {
  if (!amount || isNaN(amount)) return '$0.00';
  return `$${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

module.exports = {
  calculateGrossCommission,
  buildCommissionField,
  calculateCommissionSplits,
  isValidCommissionPercentage,
  formatCommission
};
