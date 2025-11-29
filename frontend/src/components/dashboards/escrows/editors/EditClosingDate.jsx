import React, { useState } from 'react';
import { EditorModal } from '../../../common/modals/EditorModal';
import { Date } from '../../../common/setters/Date';

export const EditClosingDate = ({ open, onClose, onSave, value }) => {
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
    <EditorModal open={open} onClose={onClose} onSave={handleSave} color="#10b981">
      <Date label="Closing Date" value={editValue} onChange={setEditValue} color="#10b981" />
    </EditorModal>
  );
};
