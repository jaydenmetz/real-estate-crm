import React from 'react';
import { EditNumber } from '../../../common/editors/fields/EditNumber';

/**
 * Listing-specific Commission Amount Editor
 * Wraps EditNumber with listing-specific context and styling
 * Handles both listing and buyer commission percentages
 *
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Close handler
 * @param {function} onSave - Save handler (newValue) => void
 * @param {number} value - Current commission percentage
 * @param {string} label - Label (defaults to "Commission")
 */
export const EditCommissionAmount = ({ open, onClose, onSave, value, label = "Commission" }) => {
  return (
    <EditNumber
      open={open}
      onClose={onClose}
      onSave={onSave}
      label={label}
      value={value}
      color="#3b82f6" // Blue theme for listings
      suffix="%"
      min={0}
      max={100}
      step={0.1}
      decimals={2}
    />
  );
};
