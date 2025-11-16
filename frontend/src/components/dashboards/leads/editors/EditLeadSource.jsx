import React from 'react';
import { EditSelect } from '../../../common/editors/fields/EditSelect';
import { LEAD_SOURCES, LEAD_SOURCE_LABELS } from '../constants/leadConstants';

/**
 * Lead-specific Source Editor
 * Wraps EditSelect with lead-specific context and styling
 *
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Close handler
 * @param {function} onSave - Save handler (newValue) => void
 * @param {string} value - Current lead source
 */
export const EditLeadSource = ({ open, onClose, onSave, value }) => {
  // Convert source constants to options array
  const sourceOptions = Object.values(LEAD_SOURCES).map(source => ({
    value: source,
    label: LEAD_SOURCE_LABELS[source]
  }));

  return (
    <EditSelect
      open={open}
      onClose={onClose}
      onSave={onSave}
      label="Lead Source"
      value={value}
      options={sourceOptions}
      color="#ec4899" // Pink theme for leads
    />
  );
};
