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
 */
export const EditListingCommission = ({ open, onClose, onSave, value }) => {
  return (
    <EditCommission
      open={open}
      onClose={onClose}
      onSave={onSave}
      label="Commission"
      value={value}
      color="#f59e0b" // Amber theme for commission
    />
  );
};
