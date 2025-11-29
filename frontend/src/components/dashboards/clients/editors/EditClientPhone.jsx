import React, { useState } from 'react';
import { EditorModal } from '../../../common/modals/EditorModal';
import { Phone } from '../../../common/setters/Phone';

export const EditClientPhone = ({ open, onClose, onSave, value }) => {
  const [editValue, setEditValue] = useState(value);

  return (
    <EditorModal open={open} onClose={onClose} onSave={() => onSave(editValue)} color="#10b981">
      <Phone label="Phone Number" value={editValue} onChange={setEditValue} color="#10b981" />
    </EditorModal>
  );
};
