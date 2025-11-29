import React, { useState } from 'react';
import { EditorModal } from '../../../components/common/modals/EditorModal';
import { Date } from '../../../components/common/setters/Date';

export const EditDisplayStartDate = ({ open, onClose, onSave, value }) => {
  const [editValue, setEditValue] = useState(value);

  const handleSave = async () => {
    if (editValue) {
      const year = editValue.getFullYear();
      const month = String(editValue.getMonth() + 1).padStart(2, '0');
      const day = String(editValue.getDate()).padStart(2, '0');
      await onSave(`${year}-${month}-${day}`);
    }
  };

  return (
    <EditorModal open={open} onClose={onClose} onSave={handleSave} color="#3b82f6">
      <Date label="Display Start Date" value={editValue} onChange={setEditValue} color="#3b82f6" />
    </EditorModal>
  );
};
