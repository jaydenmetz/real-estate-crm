import React from 'react';
import { EditableTextField } from './EditableTextField';

export const EditableNumberField = ({
  value,
  onSave,
  label,
  prefix = '$',
  suffix = '',
  decimals = 2,
  variant = 'body1',
  sx = {},
  min = 0,
  max,
}) => {
  const formatNumber = (numValue) => {
    if (numValue === null || numValue === undefined || numValue === '') {
      return 'Not set';
    }

    const num = typeof numValue === 'string' ? parseFloat(numValue) : numValue;

    if (isNaN(num)) return 'Invalid';

    const formatted = num.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });

    return `${prefix}${formatted}${suffix}`;
  };

  const formatForInput = (numValue) => {
    if (numValue === null || numValue === undefined || numValue === '') {
      return '';
    }

    const num = typeof numValue === 'string' ? parseFloat(numValue) : numValue;

    if (isNaN(num)) return '';

    return num.toString();
  };

  const handleSave = async (inputValue) => {
    const numValue = parseFloat(inputValue);
    if (isNaN(numValue)) {
      throw new Error('Invalid number');
    }
    await onSave(numValue);
  };

  return (
    <EditableTextField
      value={formatForInput(value)}
      onSave={handleSave}
      type="number"
      label={label}
      format={formatNumber}
      variant={variant}
      sx={sx}
      placeholder="Enter amount"
      inputProps={{
        min,
        max,
        step: decimals === 0 ? 1 : Math.pow(10, -decimals),
      }}
    />
  );
};
