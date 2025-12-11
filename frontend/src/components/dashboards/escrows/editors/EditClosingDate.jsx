import React, { useState } from 'react';
import { EditorModal } from '../../../common/modals/EditorModal';
import { DateSetter } from '../../../common/setters/Date';
import { toLocalDateString } from '../../../../utils/safeDateUtils';

/**
 * Closing Date Editor
 * Uses EditorModal + Date setter pattern
 *
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Close handler
 * @param {function} onSave - Save handler (newDateValue) => void
 * @param {string|Date} value - Current closing date
 * @param {boolean} inline - If true, renders without EditorModal wrapper
 */
export const EditClosingDate = ({ open, onClose, onSave, value, inline = false }) => {
  const [editValue, setEditValue] = useState(value);

  const handleSave = async () => {
    if (editValue) {
      // Use centralized utility to prevent timezone shifting
      const dateString = toLocalDateString(editValue);
      if (dateString) {
        await onSave(dateString);
      }
    }
  };

  // Handler that updates local state AND calls onSave in inline mode
  const handleChange = (newDate) => {
    setEditValue(newDate);
    // In inline mode, immediately notify parent of changes
    if (inline && onSave && newDate) {
      // Use centralized utility to prevent timezone shifting
      const dateString = toLocalDateString(newDate);
      if (dateString) {
        onSave(dateString);
      }
    }
  };

  const content = (
    <DateSetter
      label="Closing Date"
      value={editValue}
      onChange={handleChange}
      color="#10b981"
      showCurrentValue={!inline}
    />
  );

  if (inline) {
    return content;
  }

  return (
    <EditorModal open={open} onClose={onClose} onSave={handleSave} color="#10b981">
      {content}
    </EditorModal>
  );
};
