import React from 'react';
import { EditableTextField } from './EditableTextField';
import { format, parseISO, isValid } from 'date-fns';

export const EditableDateField = ({ value, onSave, label, variant = 'body1', sx = {} }) => {
  const formatDate = (dateValue) => {
    if (!dateValue) return 'Not set';
    try {
      const date = typeof dateValue === 'string' ? parseISO(dateValue) : new Date(dateValue);
      if (!isValid(date)) return 'Invalid date';
      return format(date, 'MMM dd, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const formatForInput = (dateValue) => {
    if (!dateValue) return '';
    try {
      const date = typeof dateValue === 'string' ? parseISO(dateValue) : new Date(dateValue);
      if (!isValid(date)) return '';
      return format(date, 'yyyy-MM-dd');
    } catch (error) {
      return '';
    }
  };

  return (
    <EditableTextField
      value={formatForInput(value)}
      onSave={onSave}
      type="date"
      label={label}
      format={formatDate}
      variant={variant}
      sx={sx}
      placeholder="Select date"
      inputProps={{
        max: '2099-12-31',
      }}
    />
  );
};
