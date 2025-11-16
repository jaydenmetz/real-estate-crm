import React from 'react';
import { EditText } from '../../../common/editors/fields/EditText';

/**
 * Client-specific Name Editor
 * Wraps EditText with client-specific context and styling
 * Used for editing full name or first/last name separately
 *
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Close handler
 * @param {function} onSave - Save handler (newValue) => void
 * @param {string} value - Current name value
 * @param {string} label - Field label (e.g., "First Name", "Last Name", "Full Name")
 */
export const EditClientName = ({ open, onClose, onSave, value, label = "Client Name" }) => {
  return (
    <EditText
      open={open}
      onClose={onClose}
      onSave={onSave}
      label={label}
      value={value}
      color="#8b5cf6" // Purple theme for clients
    />
  );
};
