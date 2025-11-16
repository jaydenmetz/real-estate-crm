import React from 'react';
import { EditEmail } from '../../../common/editors/fields/EditEmail';

/**
 * Client-specific Email Editor
 * Wraps EditEmail with client-specific context and styling
 * Includes email validation
 *
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Close handler
 * @param {function} onSave - Save handler (newValue) => void
 * @param {string} value - Current email address
 */
export const EditClientEmail = ({ open, onClose, onSave, value }) => {
  return (
    <EditEmail
      open={open}
      onClose={onClose}
      onSave={onSave}
      label="Email Address"
      value={value}
      color="#8b5cf6" // Purple theme for clients
    />
  );
};
