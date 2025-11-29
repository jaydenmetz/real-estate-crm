import React, { useState } from 'react';
import { EditorModal } from '../../../common/modals/EditorModal';
import { Currency } from '../../../common/setters/Currency';

export const EditClientBudget = ({ open, onClose, onSave, value }) => {
  const [editValue, setEditValue] = useState(value);

  return (
    <EditorModal open={open} onClose={onClose} onSave={() => onSave(parseFloat(editValue))} color="#10b981">
      <Currency label="Budget" value={editValue} onChange={setEditValue} color="#10b981" />
    </EditorModal>
  );
};
