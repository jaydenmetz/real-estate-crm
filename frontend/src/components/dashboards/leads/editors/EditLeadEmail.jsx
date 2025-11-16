import React from 'react';
import { EditEmail } from '../../../common/editors/fields/EditEmail';

/**
 * Lead-specific Email Editor
 * Wraps EditEmail with lead-specific context and styling
 *
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Close handler
 * @param {function} onSave - Save handler (newValue) => void
 * @param {string} value - Current email address
 */
export const EditLeadEmail = ({ open, onClose, onSave, value }) => {
  return (
    <EditEmail
      open={open}
      onClose={onClose}
      onSave={onSave}
      label="Email Address"
      value={value}
      color="#ec4899" // Pink theme for leads
    />
  );
};
