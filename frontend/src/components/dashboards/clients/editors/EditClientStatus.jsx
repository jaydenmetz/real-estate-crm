import React from 'react';
import { EditSelect } from '../../../common/editors/fields/EditSelect';
import { CLIENT_STATUS, CLIENT_STATUS_LABELS } from '../constants/clientConstants';

/**
 * Client-specific Status Editor
 * Wraps EditSelect with client-specific context and styling
 * Provides dropdown for changing client status
 *
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Close handler
 * @param {function} onSave - Save handler (newValue) => void
 * @param {string} value - Current client status
 */
export const EditClientStatus = ({ open, onClose, onSave, value }) => {
  // Convert status constants to options array
  const statusOptions = Object.values(CLIENT_STATUS)
    .filter(status => status !== CLIENT_STATUS.ARCHIVED) // Don't allow direct archive via status change
    .map(status => ({
      value: status,
      label: CLIENT_STATUS_LABELS[status]
    }));

  return (
    <EditSelect
      open={open}
      onClose={onClose}
      onSave={onSave}
      label="Client Status"
      value={value}
      options={statusOptions}
      color="#8b5cf6" // Purple theme for clients
    />
  );
};
