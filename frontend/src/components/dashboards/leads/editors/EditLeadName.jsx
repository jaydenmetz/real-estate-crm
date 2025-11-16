import React from 'react';
import { EditText } from '../../../common/editors/fields/EditText';

/**
 * Lead-specific Name Editor
 * Wraps EditText with lead-specific context and styling
 *
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Close handler
 * @param {function} onSave - Save handler (newValue) => void
 * @param {string} value - Current name value
 * @param {string} label - Field label (e.g., "First Name", "Last Name")
 */
export const EditLeadName = ({ open, onClose, onSave, value, label = "Lead Name" }) => {
  return (
    <EditText
      open={open}
      onClose={onClose}
      onSave={onSave}
      label={label}
      value={value}
      color="#ec4899" // Pink theme for leads
    />
  );
};
