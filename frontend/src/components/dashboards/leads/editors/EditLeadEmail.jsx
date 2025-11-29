import React from 'react';
import { SetEmail } from '../../../common/editors/fields/SetEmail';

/**
 * Lead-specific Email Editor
 * Wraps SetEmail with lead-specific context and styling
 *
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Close handler
 * @param {function} onSave - Save handler (newValue) => void
 * @param {string} value - Current email address
 */
export const EditLeadEmail = ({ open, onClose, onSave, value }) => {
  return (
    <SetEmail
      open={open}
      onClose={onClose}
      onSave={onSave}
      label="Email Address"
      value={value}
      color="#ec4899" // Pink theme for leads
    />
  );
};
