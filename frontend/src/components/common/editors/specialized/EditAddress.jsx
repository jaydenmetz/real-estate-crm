import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton, Menu, MenuItem, ListItemIcon, ListItemText, TextField, InputAdornment } from '@mui/material';
import { Check, Close, LocationOn, ContentCopy, Apple, Map, Tag } from '@mui/icons-material';
import { ModalDialog } from '../shared/ModalDialog';
import { AddressInput } from '../shared/AddressInput';
import { decodeHTML, cleanTextForStorage } from '../../../../utils/htmlEntities';

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
 * @param {boolean} inline - If true, hides action buttons (used in flow contexts)
 */
export const EditAddress = ({
  open,
  onClose,
  onSave,
  label = 'Address',
  value,
  color = '#10b981',
  inline = false,
}) => {
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [currentInputText, setCurrentInputText] = useState(''); // Track text input changes
  const [unitNumber, setUnitNumber] = useState(''); // Track unit number
  const [saving, setSaving] = useState(false);
  const [addressMenuAnchor, setAddressMenuAnchor] = useState(null);

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
      return value.display_address || value.property_address || value.address || '';
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

  // Check if user has selected a NEW address (different from database)
  const hasSelectedNewAddress = selectedAddress !== null && selectedAddress.property_address !== canonicalAddress;
  const hasUnsavedChanges = selectedAddress !== null || currentInputText.trim() !== displayAddress || unitNumber !== (displayAddress.match(/#(\d+)$/)?.[1] || '');

  // Reset when dialog closes or extract unit number from existing address
  useEffect(() => {
    if (!open) {
      setSelectedAddress(null);
      setCurrentInputText('');
      setUnitNumber('');
    } else {
      // Extract unit number from display address if it exists (e.g., "123 Main St #9")
      const display = getDisplayAddress();
      const unitMatch = display.match(/#(\d+)$/);
      if (unitMatch) {
        setUnitNumber(unitMatch[1]);
      }
    }
  }, [open]);

  // Handler for text input changes (before autocomplete selection)
  const handleInputChange = (text) => {
    setCurrentInputText(text);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Helper to add unit number to address if provided
      // Also ensures text is clean (no HTML entities)
      const addUnitNumber = (baseAddress) => {
        if (!unitNumber || !unitNumber.trim()) return cleanTextForStorage(baseAddress);
        // Remove existing unit number if present
        const cleaned = baseAddress.replace(/#\d+$/, '').trim();
        return cleanTextForStorage(`${cleaned} #${unitNumber.trim()}`);
      };

      // If user selected from autocomplete, use full address object
      if (selectedAddress) {
        // Add unit number to display_address if provided
        const updatedAddress = {
          ...selectedAddress,
          display_address: addUnitNumber(selectedAddress.display_address || selectedAddress.property_address),
        };
        await onSave(updatedAddress);
      }
      // If user just typed text without selecting, save as display_address only
      else if (currentInputText && currentInputText.trim() !== displayAddress) {
        // Create minimal address object with just display_address changed
        const addressUpdate = typeof value === 'object'
          ? {
              ...value,
              display_address: addUnitNumber(currentInputText.trim()),
            }
          : {
              property_address: value || '',
              display_address: addUnitNumber(currentInputText.trim()),
            };
        await onSave(addressUpdate);
      }
      // If only unit number changed
      else if (unitNumber !== (displayAddress.match(/#(\d+)$/)?.[1] || '')) {
        const baseAddress = selectedAddress?.display_address || selectedAddress?.property_address || currentInputText || displayAddress;
        const addressUpdate = typeof value === 'object'
          ? {
              ...value,
              display_address: addUnitNumber(baseAddress),
            }
          : {
              property_address: value || '',
              display_address: addUnitNumber(baseAddress),
            };
        await onSave(addressUpdate);
      } else {
        // No changes, just close
        onClose();
        return;
      }
      onClose();
    } catch (error) {
      console.error('Failed to save address:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      // Allow save on Enter if either autocomplete selected OR text changed
      if (selectedAddress || (currentInputText && currentInputText.trim() !== displayAddress)) {
        handleSave();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  // Address menu handlers
  const handleAddressClick = (e) => {
    e.stopPropagation();
    setAddressMenuAnchor(e.currentTarget);
  };

  const handleAddressMenuClose = () => {
    setAddressMenuAnchor(null);
  };

  const handleCopyAddress = () => {
    // Format: "display address, city, state zipcode"
    const parts = [];
    if (displayAddress) parts.push(displayAddress);

    const locationParts = [];
    if (typeof value === 'object') {
      if (value.city) locationParts.push(value.city);
      if (value.state) locationParts.push(value.state);
      if (value.zip_code) locationParts.push(value.zip_code);
    }

    if (locationParts.length > 0) {
      parts.push(locationParts.join(' '));
    }

    const formattedAddress = parts.join(', ');
    navigator.clipboard.writeText(formattedAddress);
    handleAddressMenuClose();
  };

  const handleOpenAppleMaps = () => {
    // Apple Maps URL scheme
    const query = encodeURIComponent(canonicalAddress || displayAddress);
    window.open(`maps://maps.apple.com/?q=${query}`, '_blank');
    handleAddressMenuClose();
  };

  const handleOpenGoogleMaps = () => {
    // Google Maps URL - works in browser and app
    const query = encodeURIComponent(canonicalAddress || displayAddress);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
    handleAddressMenuClose();
  };

  return (
    <ModalDialog open={open} onClose={onClose} color={color} maxWidth={520} hideBackdrop={inline}>
      <Box onClick={(e) => e.stopPropagation()}>
        {/* Address Display Section */}
        {/* In inline mode (NewEscrowModal): ONLY show "Selected Address" when user selects new address via autocomplete */}
        {/* In standalone edit mode: Show "Current Property Address" when database has existing address */}
        {(inline ? selectedAddress : canonicalAddress) && (
          <Box sx={{ mb: 3 }}>
            {(!hasSelectedNewAddress || inline) ? (
              /* Show single address box (current in standalone, selected in inline) */
              <>
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
                  {inline ? 'Selected Address' : 'Current Property Address'}
                </Typography>
                <Box
                  onClick={handleAddressClick}
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1,
                    cursor: 'pointer',
                    borderRadius: 2,
                    p: 1,
                    mx: -1,
                    // Always show border when address section is visible (both inline and standalone modes)
                    border: '2px solid rgba(255,255,255,0.3)',
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    transition: 'all 0.2s',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.12)',
                      borderColor: 'rgba(255,255,255,0.4)',
                    },
                  }}
                >
                  <LocationOn sx={{ color: 'white', mt: 0.5, fontSize: 24 }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: 'white',
                        fontSize: '1rem',
                        lineHeight: 1.4,
                      }}
                    >
                      {inline && selectedAddress
                        ? selectedAddress.formatted_address
                        : canonicalAddress}
                    </Typography>
                    {((inline && selectedAddress) || locationSubtitle) && (
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'rgba(255,255,255,0.7)',
                          display: 'block',
                          mt: 0.5,
                        }}
                      >
                        {inline && selectedAddress
                          ? [selectedAddress.city, selectedAddress.state, selectedAddress.zip_code].filter(Boolean).join(', ')
                          : locationSubtitle}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </>
            ) : (
            /* Show side-by-side comparison when new address selected */
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Current Address */}
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: 'rgba(255,255,255,0.5)',
                    mb: 0.5,
                    display: 'block',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  Current Address
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1,
                    borderRadius: 2,
                    p: 1,
                    mx: -1,
                    backgroundColor: 'rgba(0,0,0,0.15)',
                    opacity: 0.6,
                  }}
                >
                  <LocationOn sx={{ color: 'white', mt: 0.5, fontSize: 20 }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: 'white',
                        fontSize: '0.875rem',
                        lineHeight: 1.4,
                        textDecoration: 'line-through',
                      }}
                    >
                      {canonicalAddress}
                    </Typography>
                    {locationSubtitle && (
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'rgba(255,255,255,0.5)',
                          display: 'block',
                          mt: 0.25,
                          fontSize: '0.7rem',
                        }}
                      >
                        {locationSubtitle}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>

              {/* New Address */}
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: 'rgba(255,255,255,0.9)',
                    mb: 0.5,
                    display: 'block',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  {inline ? 'Selected Address' : 'New Property Address'}
                </Typography>
                <Box
                  onClick={handleAddressClick}
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1,
                    cursor: 'pointer',
                    borderRadius: 2,
                    p: 1,
                    mx: -1,
                    border: '2px solid rgba(255,255,255,0.5)',
                    backgroundColor: 'rgba(255,255,255,0.12)',
                    transition: 'all 0.2s',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.18)',
                      borderColor: 'rgba(255,255,255,0.7)',
                    },
                  }}
                >
                  <LocationOn sx={{ color: 'white', mt: 0.5, fontSize: 24 }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: 'white',
                        fontSize: '1rem',
                        lineHeight: 1.4,
                      }}
                    >
                      {selectedAddress.property_address}
                    </Typography>
                    {selectedAddress.city && (
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'rgba(255,255,255,0.8)',
                          display: 'block',
                          mt: 0.5,
                        }}
                      >
                        {[selectedAddress.city, selectedAddress.state, selectedAddress.zip_code].filter(Boolean).join(', ')}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>
            </Box>
          )}
        </Box>
        )}

        {/* Address Action Menu */}
        <Menu
            anchorEl={addressMenuAnchor}
            open={Boolean(addressMenuAnchor)}
            onClose={handleAddressMenuClose}
            onClick={(e) => e.stopPropagation()}
            slotProps={{
              paper: {
                sx: {
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 2,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                  minWidth: 200,
                },
              },
            }}
          >
            <MenuItem onClick={handleCopyAddress}>
              <ListItemIcon>
                <ContentCopy fontSize="small" />
              </ListItemIcon>
              <ListItemText>Copy address</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleOpenAppleMaps}>
              <ListItemIcon>
                <Apple fontSize="small" />
              </ListItemIcon>
              <ListItemText>Open in Apple Maps</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleOpenGoogleMaps}>
              <ListItemIcon>
                <Map fontSize="small" />
              </ListItemIcon>
              <ListItemText>Open in Google Maps</ListItemText>
            </MenuItem>
          </Menu>

        {/* Display Name Input (Editable) */}
        <Box sx={{ mb: 2 }}>
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
            {selectedAddress || canonicalAddress ? 'Display Name' : 'Street Address'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Box sx={{ flex: 1 }}>
              <AddressInput
                value={displayAddress.replace(/#\d+$/, '').trim()} // Remove unit number from display
                onChange={setSelectedAddress}
                onInputChange={handleInputChange}
                onKeyDown={handleKeyPress}
                disabled={saving}
                placeholder="Start typing address..."
                autoFocus={true}
                hideLabel={true} // Tell AddressInput not to show its own label
              />
            </Box>
            <Box sx={{ width: '75px' }}>
              <TextField
                value={unitNumber}
                onChange={(e) => setUnitNumber(e.target.value)}
                onKeyDown={handleKeyPress}
                disabled={saving}
                placeholder="#"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Tag sx={{ color: 'white', fontSize: 18 }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    borderRadius: 2,
                    minHeight: '60px',
                    paddingLeft: '8px',
                    '& fieldset': {
                      borderColor: 'rgba(255,255,255,0.3)',
                      borderWidth: 2,
                    },
                    '&:hover fieldset': {
                      borderColor: saving ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.5)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'white',
                    },
                    '&.Mui-disabled': {
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      '& fieldset': {
                        borderColor: 'rgba(255,255,255,0.1)',
                      },
                    },
                  },
                  '& .MuiInputBase-input': {
                    color: 'white',
                    fontSize: '15px',
                    fontWeight: 500,
                    '&::placeholder': {
                      color: 'rgba(255,255,255,0.5)',
                      opacity: 1,
                    },
                  },
                }}
              />
            </Box>
          </Box>
        </Box>

        {/* Action Buttons - Only show in standalone mode (not inline) */}
        {!inline && (
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
              disabled={
                saving ||
                (!selectedAddress &&
                 (!currentInputText || currentInputText.trim() === displayAddress) &&
                 unitNumber === (displayAddress.match(/#(\d+)$/)?.[1] || ''))
              }
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
        )}
      </Box>
    </ModalDialog>
  );
};
