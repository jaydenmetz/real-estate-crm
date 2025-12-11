import React, { useState, useEffect } from 'react';
import { EditorModal } from '../../../common/modals/EditorModal';
import { DateSetter } from '../../../common/setters/Date';
import { toLocalDateString } from '../../../../utils/safeDateUtils';

/**
 * Listing Date Editor
 * Uses EditorModal + DateSetter pattern
 *
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Close handler
 * @param {function} onSave - Save handler (dateString) => void
 * @param {string|Date} value - Current listing date
 * @param {boolean} inline - If true, renders without EditorModal wrapper
 */
export const EditListingDate = ({ open, onClose, onSave, value, inline = false }) => {
  const [editValue, setEditValue] = useState(value);

  // Reset editValue when value prop changes
  useEffect(() => {
    setEditValue(value);
  }, [value]);

  // Handler for date changes
  const handleChange = (newDate) => {
    setEditValue(newDate);
    // In inline mode, immediately notify parent of changes
    if (inline && onSave) {
      // Use centralized utility to prevent timezone shifting
      const dateString = toLocalDateString(newDate);
      if (dateString) {
        onSave(dateString);
      }
    }
  };

  const handleSave = async () => {
    if (editValue) {
      // Use centralized utility to prevent timezone shifting
      const dateString = toLocalDateString(editValue);
      if (dateString) {
        await onSave(dateString);
      }
    }
  };

  const content = (
    <DateSetter
      label="Listing Date"
      value={editValue}
      onChange={handleChange}
      color="#f59e0b"
      showCurrentValue={!inline}
    />
  );

  if (inline) {
    return content;
  }

  return (
    <EditorModal open={open} onClose={onClose} onSave={handleSave} color="#f59e0b">
      {content}
    </EditorModal>
  );
};
