import React from 'react';
import { SetDate } from '../../../common/editors/fields/SetDate';

/**
 * Listing-specific Expiration Date Editor (end date)
 * Wraps SetDate with listing-specific context and styling
 * Includes minDate validation to prevent expiration before listing date
 *
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Close handler
 * @param {function} onSave - Save handler (newDateValue) => void
 * @param {string|Date} value - Current expiration date
 * @param {string|Date} minDate - Minimum selectable date (listing_date)
 */
export const EditExpirationDate = ({ open, onClose, onSave, value, minDate }) => {
  return (
    <SetDate
      open={open}
      onClose={onClose}
      onSave={onSave}
      label="Expiration Date"
      value={value}
      minDate={minDate} // Prevent expiration before listing date
      color="#8b5cf6" // Purple theme for expiration date
    />
  );
};
