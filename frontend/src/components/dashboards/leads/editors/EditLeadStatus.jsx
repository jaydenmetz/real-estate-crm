import React, { useState } from 'react';
import { EditorModal } from '../../../common/modals/EditorModal';
import { Select } from '../../../common/setters/Select';
import { LEAD_STATUS, LEAD_STATUS_LABELS } from '../../../../constants/leadConfig';

/**
 * Lead Status Editor
 * Uses the standard EditorModal + Select setter pattern
 *
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Close handler
 * @param {function} onSave - Save handler (newStatus) => void
 * @param {string} value - Current lead status
 */
export const EditLeadStatus = ({ open, onClose, onSave, value }) => {
  const [editValue, setEditValue] = useState(value);

  // Convert status constants to options array
  const statusOptions = Object.values(LEAD_STATUS).map(status => ({
    value: status,
    label: LEAD_STATUS_LABELS[status]
  }));

  return (
    <EditorModal
      open={open}
      onClose={onClose}
      onSave={() => onSave(editValue)}
      color="#10b981" // Green for leads
    >
      <Select
        label="Lead Status"
        value={editValue}
        onChange={setEditValue}
        options={statusOptions}
        color="#10b981"
      />
    </EditorModal>
  );
};
