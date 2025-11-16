import React from 'react';
import { EditPhone } from '../../../common/editors/fields/EditPhone';

/**
 * Client-specific Phone Editor
 * Wraps EditPhone with client-specific context and styling
 * Includes phone number formatting and validation
 *
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Close handler
 * @param {function} onSave - Save handler (newValue) => void
 * @param {string} value - Current phone number
 */
export const EditClientPhone = ({ open, onClose, onSave, value }) => {
  return (
    <EditPhone
      open={open}
      onClose={onClose}
      onSave={onSave}
      label="Phone Number"
      value={value}
      color="#8b5cf6" // Purple theme for clients
    />
  );
};
