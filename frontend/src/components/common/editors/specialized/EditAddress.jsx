import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { Check, Close, LocationOn } from '@mui/icons-material';
import { ModalDialog } from '../shared/ModalDialog';
import { AddressInput } from '../shared/AddressInput';

/**
 * Specialized Address Editor
 * Google Places autocomplete with full address parsing
 *
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Close handler
 * @param {function} onSave - Save handler (addressData) => void - receives full address object
 * @param {string} label - Field label (default: "Address")
 * @param {string} value - Current address value (full formatted address)
 * @param {string} color - Theme color
 */
export const EditAddress = ({
  open,
  onClose,
  onSave,
  label = 'Address',
  value,
  color = '#10b981',
}) => {
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [saving, setSaving] = useState(false);

  // Extract canonical address (source of truth for geocoding)
  const getCanonicalAddress = () => {
    if (!value) return '';
    if (typeof value === 'object') {
      return value.property_address || value.address || '';
    }
    return value;
  };

  // Extract display address (what user sees in view modes)
  const getDisplayAddress = () => {
    if (!value) return '';
    if (typeof value === 'object') {
      return value.property_address_display || value.property_address || value.address || '';
    }
    return value;
  };

  // Extract location subtitle from value object (city, state, zip)
  const getLocationSubtitle = () => {
    if (!value || typeof value !== 'object') return null;

    const parts = [];
    if (value.city) parts.push(value.city);
    if (value.state) parts.push(value.state);
    if (value.zip_code) parts.push(value.zip_code);
    return parts.length > 0 ? parts.join(', ') : null;
  };

  const canonicalAddress = getCanonicalAddress();
  const displayAddress = getDisplayAddress();
  const locationSubtitle = getLocationSubtitle();

  // Reset when dialog closes
  useEffect(() => {
    if (!open) {
      setSelectedAddress(null);
    }
  }, [open]);

  const handleSave = async () => {
    if (!selectedAddress) {
      return;
    }

    setSaving(true);
    try {
      // Pass the full address object to parent
      // Includes: property_address, city, state, zip_code, county, latitude, longitude
      await onSave(selectedAddress);
      onClose();
    } catch (error) {
      console.error('Failed to save address:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && selectedAddress) {
      handleSave();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <ModalDialog open={open} onClose={onClose} color={color}>
      <Box onClick={(e) => e.stopPropagation()}>
        {/* Canonical Address (Read-Only Display) */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="caption"
            sx={{
              fontSize: 11,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.7)',
              mb: 0.5,
              display: 'block',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            Property Address (Geocoded)
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
            <LocationOn sx={{ color: 'white', mt: 0.5, fontSize: 24 }} />
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: 'white',
                  fontSize: '1rem',
                  lineHeight: 1.4,
                }}
              >
                {selectedAddress?.property_address || canonicalAddress || 'No address set'}
              </Typography>
              {/* Show location from selected OR existing data */}
              {(selectedAddress || locationSubtitle) && (
                <Typography
                  variant="caption"
                  sx={{
                    color: 'rgba(255,255,255,0.7)',
                    display: 'block',
                    mt: 0.5,
                  }}
                >
                  {selectedAddress && selectedAddress.city && selectedAddress.state
                    ? `${selectedAddress.city}, ${selectedAddress.state}${selectedAddress.zip_code ? ' ' + selectedAddress.zip_code : ''}`
                    : locationSubtitle || 'Select an address from suggestions'}
                </Typography>
              )}
            </Box>
          </Box>
        </Box>

        {/* Display Name Input (Editable) */}
        <Typography
          variant="caption"
          sx={{
            fontSize: 11,
            fontWeight: 600,
            color: 'rgba(255,255,255,0.7)',
            mb: 1,
            display: 'block',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          Display Name (shown in views)
        </Typography>
        <AddressInput
          value={displayAddress} // Pass extracted string address, not full object
          onChange={setSelectedAddress}
          onKeyDown={handleKeyPress}
          disabled={saving}
          placeholder="Start typing address or customize display name..."
          autoFocus={true}
        />

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'flex-end' }}>
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            disabled={saving}
            sx={{
              width: 48,
              height: 48,
              backgroundColor: 'rgba(255,255,255,0.15)',
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.25)',
              },
              '&:disabled': {
                backgroundColor: 'rgba(255,255,255,0.05)',
                color: 'rgba(255,255,255,0.3)',
              },
            }}
          >
            <Close />
          </IconButton>
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              handleSave();
            }}
            disabled={saving || !selectedAddress}
            sx={{
              width: 48,
              height: 48,
              backgroundColor: 'white',
              color: color,
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.9)',
              },
              '&:disabled': {
                backgroundColor: 'rgba(255,255,255,0.3)',
                color: 'rgba(0,0,0,0.2)',
              },
            }}
          >
            <Check />
          </IconButton>
        </Box>
      </Box>
    </ModalDialog>
  );
};
