import React from 'react';
import { EditPhone } from '../../../common/editors/fields/EditPhone';

/**
 * Lead-specific Phone Editor
 * Wraps EditPhone with lead-specific context and styling
 *
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Close handler
 * @param {function} onSave - Save handler (newValue) => void
 * @param {string} value - Current phone number
 */
export const EditLeadPhone = ({ open, onClose, onSave, value }) => {
  return (
    <EditPhone
      open={open}
      onClose={onClose}
      onSave={onSave}
      label="Phone Number"
      value={value}
      color="#ec4899" // Pink theme for leads
    />
  );
};
