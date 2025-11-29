import React from 'react';
import { SetPhone } from '../../../common/editors/fields/SetPhone';

/**
 * Lead-specific Phone Editor
 * Wraps SetPhone with lead-specific context and styling
 *
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Close handler
 * @param {function} onSave - Save handler (newValue) => void
 * @param {string} value - Current phone number
 */
export const EditLeadPhone = ({ open, onClose, onSave, value }) => {
  return (
    <SetPhone
      open={open}
      onClose={onClose}
      onSave={onSave}
      label="Phone Number"
      value={value}
      color="#ec4899" // Pink theme for leads
    />
  );
};
