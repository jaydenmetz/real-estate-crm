import React, { useState } from 'react';
import { EditorModal } from '../../../common/modals/EditorModal';
import { Select } from '../../../common/setters/Select';
import { LEAD_SOURCES, LEAD_SOURCE_LABELS } from '../../../../constants/leadConfig';

/**
 * Lead Source Editor
 * Uses the standard EditorModal + Select setter pattern
 *
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Close handler
 * @param {function} onSave - Save handler (newSource) => void
 * @param {string} value - Current lead source
 */
export const EditLeadSource = ({ open, onClose, onSave, value }) => {
  const [editValue, setEditValue] = useState(value);

  // Convert source constants to options array
  const sourceOptions = Object.values(LEAD_SOURCES).map(source => ({
    value: source,
    label: LEAD_SOURCE_LABELS[source]
  }));

  return (
    <EditorModal
      open={open}
      onClose={onClose}
      onSave={() => onSave(editValue)}
      color="#10b981" // Green for leads
    >
      <Select
        label="Lead Source"
        value={editValue}
        onChange={setEditValue}
        options={sourceOptions}
        color="#10b981"
      />
    </EditorModal>
  );
};
