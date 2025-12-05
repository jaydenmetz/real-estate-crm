import React from 'react';
import { EditCommission } from '../../../../templates/Dashboard/lib/editors';

/**
 * Listing-specific Commission Editor
 * Wraps EditCommission with listing-specific context
 *
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Close handler
 * @param {function} onSave - Save handler (newValue) => void
 * @param {number} value - Current commission amount
 * @param {number} commissionPercentage - Current commission percentage
 * @param {string} commissionType - Commission type ('percentage' or 'flat')
 * @param {number} purchasePrice - List price for percentage calculation
 * @param {boolean} inline - If true, renders without EditorModal wrapper
 */
export const EditListingCommission = ({
  open,
  onClose,
  onSave,
  value,
  commissionPercentage,
  commissionType,
  purchasePrice,
  inline = false,
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
      color="#f59e0b"
      inline={inline}
    />
  );
};
