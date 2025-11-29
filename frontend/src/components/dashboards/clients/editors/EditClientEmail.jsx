import React from 'react';
import { SetEmail } from '../../../common/editors/fields/SetEmail';

/**
 * Client-specific Email Editor
 * Wraps SetEmail with client-specific context and styling
 * Includes email validation
 *
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Close handler
 * @param {function} onSave - Save handler (newValue) => void
 * @param {string} value - Current email address
 */
export const EditClientEmail = ({ open, onClose, onSave, value }) => {
  return (
    <SetEmail
      open={open}
      onClose={onClose}
      onSave={onSave}
      label="Email Address"
      value={value}
      color="#8b5cf6" // Purple theme for clients
    />
  );
};
