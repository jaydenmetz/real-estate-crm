import React, { useState } from 'react';
import { EditorModal } from '../../../common/modals/EditorModal';
import { DateSetter } from '../../../common/setters/Date';

/**
 * Escrow-specific Acceptance Date Editor
 * Uses EditorModal + Date setter pattern
 *
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Close handler
 * @param {function} onSave - Save handler (newDateValue) => void
 * @param {string|Date} value - Current acceptance date
 * @param {boolean} inline - If true, renders without EditorModal wrapper
 */
export const EditAcceptanceDate = ({ open, onClose, onSave, value, inline = false }) => {
  const [editValue, setEditValue] = useState(value);

  const handleSave = async () => {
    // Format date to YYYY-MM-DD string
    if (editValue) {
      const year = editValue.getFullYear();
      const month = String(editValue.getMonth() + 1).padStart(2, '0');
      const day = String(editValue.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;
      await onSave(dateString);
    }
  };

  const content = (
    <DateSetter
      label="Acceptance Date"
      value={editValue}
      onChange={setEditValue}
      color="#3b82f6"
      showCurrentValue={!inline}
    />
  );

  if (inline) {
    return content;
  }

  return (
    <EditorModal
      open={open}
      onClose={onClose}
      onSave={handleSave}
      color="#3b82f6"
    >
      {content}
    </EditorModal>
  );
};
