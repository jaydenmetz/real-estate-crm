import React from 'react';
import { EditCommission } from '../../../../templates/Dashboard/lib/editors';

/**
 * Listing-specific Commission Editor
 * Wraps EditCommission with listing-specific context and styling
 *
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Close handler
 * @param {function} onSave - Save handler (updates) => void - receives { listing_commission, buyer_commission, total_commission }
 * @param {number} value - Current commission dollar amount (calculated from percentage)
 * @param {number} commissionPercentage - Current commission percentage
 * @param {string} commissionType - Current commission type ('percentage' or 'flat')
 * @param {number} listPrice - List price for percentage calculation
 */
export const EditCommissionAmount = ({
  open,
  onClose,
  onSave,
  value,
  commissionPercentage,
  commissionType = 'percentage',
  listPrice
}) => {
  return (
    <EditCommission
      open={open}
      onClose={onClose}
      onSave={onSave}
      label="Commission"
      value={value}
      commissionPercentage={commissionPercentage}
      commissionType={commissionType}
      purchasePrice={listPrice}
      color="#6366f1" // Purple theme for commission
    />
  );
};
