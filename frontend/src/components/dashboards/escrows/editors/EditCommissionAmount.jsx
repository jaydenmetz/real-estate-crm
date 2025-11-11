import React from 'react';
import { EditCommission } from '../../../common/editors/specialized/EditCommission';

/**
 * Escrow-specific Commission Editor
 * Wraps EditCommission with escrow-specific context and styling
 *
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Close handler
 * @param {function} onSave - Save handler (updates) => void - receives { my_commission, commission_percentage, commission_type }
 * @param {number} value - Current commission dollar amount (my_commission)
 * @param {number} commissionPercentage - Current commission percentage
 * @param {string} commissionType - Current commission type ('percentage' or 'flat')
 * @param {number} purchasePrice - Purchase price for percentage calculation
 */
export const EditCommissionAmount = ({
  open,
  onClose,
  onSave,
  value,
  commissionPercentage,
  commissionType = 'percentage',
  purchasePrice
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
      purchasePrice={purchasePrice}
      color="#10b981" // Green theme for commission
    />
  );
};
