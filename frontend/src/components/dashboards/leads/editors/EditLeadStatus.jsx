import React from 'react';
import { EditSelect } from '../../../common/editors/fields/EditSelect';
import { LEAD_STATUS, LEAD_STATUS_LABELS } from '../constants/leadConstants';

/**
 * Lead-specific Status Editor
 * Wraps EditSelect with lead-specific context and styling
 *
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Close handler
 * @param {function} onSave - Save handler (newValue) => void
 * @param {string} value - Current lead status
 */
export const EditLeadStatus = ({ open, onClose, onSave, value }) => {
  // Convert status constants to options array
  const statusOptions = Object.values(LEAD_STATUS)
    .filter(status => status !== LEAD_STATUS.ARCHIVED) // Don't allow direct archive via status change
    .map(status => ({
      value: status,
      label: LEAD_STATUS_LABELS[status]
    }));

  return (
    <EditSelect
      open={open}
      onClose={onClose}
      onSave={onSave}
      label="Lead Status"
      value={value}
      options={statusOptions}
      color="#ec4899" // Pink theme for leads
    />
  );
};
