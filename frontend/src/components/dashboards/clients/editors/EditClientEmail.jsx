import React, { useState } from 'react';
import { EditorModal } from '../../../common/modals/EditorModal';
import { Email } from '../../../common/setters/Email';
import { parseEmailForStorage } from '../../../../utils/validators';

export const EditClientEmail = ({ open, onClose, onSave, value }) => {
  const [editValue, setEditValue] = useState(value);

  return (
    <EditorModal open={open} onClose={onClose} onSave={() => onSave(parseEmailForStorage(editValue))} color="#8b5cf6">
      <Email label="Email Address" value={editValue} onChange={setEditValue} color="#8b5cf6" />
    </EditorModal>
  );
};
