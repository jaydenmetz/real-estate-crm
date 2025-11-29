import React, { useState } from 'react';
import { EditorModal } from '../../../common/modals/EditorModal';
import { Date } from '../../../common/setters/Date';

/**
 * Escrow-specific Acceptance Date Editor
 * Uses EditorModal + Date setter pattern
 *
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Close handler
 * @param {function} onSave - Save handler (newDateValue) => void
 * @param {string|Date} value - Current acceptance date
 */
export const EditAcceptanceDate = ({ open, onClose, onSave, value }) => {
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

  return (
    <EditorModal
      open={open}
      onClose={onClose}
      onSave={handleSave}
      color="#3b82f6"
    >
      <Date
        label="Acceptance Date"
        value={editValue}
        onChange={setEditValue}
        color="#3b82f6"
      />
    </EditorModal>
  );
};
