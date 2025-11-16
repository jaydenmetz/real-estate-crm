import React from 'react';
import { EditSelect } from '../../../common/editors/fields/EditSelect';
import { LISTING_STATUS, LISTING_STATUS_LABELS } from '../constants/listingConstants';

/**
 * Listing-specific Status Editor
 * Wraps EditSelect with listing-specific context and styling
 * Provides dropdown for changing listing status
 *
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Close handler
 * @param {function} onSave - Save handler (newValue) => void
 * @param {string} value - Current listing status
 */
export const EditListingStatus = ({ open, onClose, onSave, value }) => {
  // Convert status constants to options array
  const statusOptions = Object.values(LISTING_STATUS)
    .filter(status => status !== LISTING_STATUS.ARCHIVED) // Don't allow direct archive via status change
    .map(status => ({
      value: status,
      label: LISTING_STATUS_LABELS[status]
    }));

  return (
    <EditSelect
      open={open}
      onClose={onClose}
      onSave={onSave}
      label="Listing Status"
      value={value}
      options={statusOptions}
      color="#3b82f6" // Blue theme for listings
    />
  );
};
