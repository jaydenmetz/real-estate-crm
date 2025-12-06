import React, { useState, useEffect } from 'react';
import { Box, Typography, ToggleButtonGroup, ToggleButton, Divider } from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Home,
  Person,
  Gavel,
  Search,
  Phone,
  Videocam,
  Event,
  FollowTheSigns,
  Assignment,
  MoreHoriz,
} from '@mui/icons-material';
import { ModalContainer } from '../../../common/modals/ModalContainer';
import { AddressInput } from '../../../common/inputs/shared/AddressInput';
import { Check, Close } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { APPOINTMENT_TYPES, APPOINTMENT_TYPE_LABELS } from '../../../../constants/appointmentConfig';

// Icon mapping for appointment types
const TYPE_ICONS = {
  [APPOINTMENT_TYPES.SHOWING]: Home,
  [APPOINTMENT_TYPES.CONSULTATION]: Person,
  [APPOINTMENT_TYPES.LISTING_PRESENTATION]: Assignment,
  [APPOINTMENT_TYPES.OPEN_HOUSE]: Event,
  [APPOINTMENT_TYPES.INSPECTION]: Search,
  [APPOINTMENT_TYPES.CLOSING]: Gavel,
  [APPOINTMENT_TYPES.FOLLOW_UP]: FollowTheSigns,
  [APPOINTMENT_TYPES.PHONE_CALL]: Phone,
  [APPOINTMENT_TYPES.VIDEO_CALL]: Videocam,
  [APPOINTMENT_TYPES.OTHER]: MoreHoriz,
};

// Color mapping for appointment types
const TYPE_COLORS = {
  [APPOINTMENT_TYPES.SHOWING]: '#3b82f6',
  [APPOINTMENT_TYPES.CONSULTATION]: '#10b981',
  [APPOINTMENT_TYPES.LISTING_PRESENTATION]: '#f59e0b',
  [APPOINTMENT_TYPES.OPEN_HOUSE]: '#8b5cf6',
  [APPOINTMENT_TYPES.INSPECTION]: '#06b6d4',
  [APPOINTMENT_TYPES.CLOSING]: '#ec4899',
  [APPOINTMENT_TYPES.FOLLOW_UP]: '#14b8a6',
  [APPOINTMENT_TYPES.PHONE_CALL]: '#6366f1',
  [APPOINTMENT_TYPES.VIDEO_CALL]: '#a855f7',
  [APPOINTMENT_TYPES.OTHER]: '#6b7280',
};

/**
 * EditAppointmentType - Combined appointment type and initial location editor
 *
 * Features:
 * - Toggle button group for appointment type selection
 * - Address input for initial meeting location
 * - Type-specific behavior (showings get listing search, etc.)
 *
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Close handler
 * @param {function} onSave - Save handler ({ appointmentType, location, city, state, zipCode }) => void
 * @param {string} appointmentType - Current appointment type
 * @param {object} initialStop - First stop data { location_address, city, state, zip_code }
 * @param {string} color - Theme color
 */
export const EditAppointmentType = ({
  open,
  onClose,
  onSave,
  appointmentType = APPOINTMENT_TYPES.SHOWING,
  initialStop = {},
  color = '#0891b2',
}) => {
  const [selectedType, setSelectedType] = useState(appointmentType);
  const [locationData, setLocationData] = useState({
    location_address: initialStop?.location_address || '',
    city: initialStop?.city || '',
    state: initialStop?.state || '',
    zip_code: initialStop?.zip_code || '',
    latitude: initialStop?.latitude || null,
    longitude: initialStop?.longitude || null,
  });
  const [saving, setSaving] = useState(false);

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedType(appointmentType || APPOINTMENT_TYPES.SHOWING);
      setLocationData({
        location_address: initialStop?.location_address || '',
        city: initialStop?.city || '',
        state: initialStop?.state || '',
        zip_code: initialStop?.zip_code || '',
        latitude: initialStop?.latitude || null,
        longitude: initialStop?.longitude || null,
      });
    }
  }, [open, appointmentType, initialStop]);

  const handleTypeChange = (event, newType) => {
    if (newType !== null) {
      setSelectedType(newType);
    }
  };

  const handleAddressChange = (addressData) => {
    setLocationData({
      location_address: addressData.property_address || addressData.display_address || '',
      city: addressData.city || '',
      state: addressData.state || '',
      zip_code: addressData.zip_code || '',
      latitude: addressData.latitude || null,
      longitude: addressData.longitude || null,
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        appointment_type: selectedType,
        appointmentType: selectedType,
        // Initial stop location
        location: locationData.location_address,
        location_address: locationData.location_address,
        city: locationData.city,
        state: locationData.state,
        zip_code: locationData.zip_code,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
      });
      onClose?.();
    } catch (error) {
      console.error('Failed to save appointment type:', error);
    } finally {
      setSaving(false);
    }
  };

  // Group types for better UX
  const primaryTypes = [
    APPOINTMENT_TYPES.SHOWING,
    APPOINTMENT_TYPES.CONSULTATION,
    APPOINTMENT_TYPES.LISTING_PRESENTATION,
  ];
  const secondaryTypes = [
    APPOINTMENT_TYPES.OPEN_HOUSE,
    APPOINTMENT_TYPES.INSPECTION,
    APPOINTMENT_TYPES.CLOSING,
  ];
  const virtualTypes = [
    APPOINTMENT_TYPES.PHONE_CALL,
    APPOINTMENT_TYPES.VIDEO_CALL,
    APPOINTMENT_TYPES.FOLLOW_UP,
    APPOINTMENT_TYPES.OTHER,
  ];

  const renderTypeButton = (type) => {
    const Icon = TYPE_ICONS[type] || MoreHoriz;
    const typeColor = TYPE_COLORS[type] || '#6b7280';
    const isSelected = selectedType === type;

    return (
      <ToggleButton
        key={type}
        value={type}
        sx={{
          flex: 1,
          flexDirection: 'column',
          gap: 0.5,
          py: 1.5,
          px: 1,
          borderRadius: 2,
          border: 'none',
          backgroundColor: isSelected ? alpha(typeColor, 0.2) : 'rgba(255,255,255,0.05)',
          color: isSelected ? 'white' : 'rgba(255,255,255,0.7)',
          transition: 'all 0.2s',
          '&:hover': {
            backgroundColor: isSelected ? alpha(typeColor, 0.25) : 'rgba(255,255,255,0.1)',
          },
          '&.Mui-selected': {
            backgroundColor: alpha(typeColor, 0.2),
            border: `2px solid ${alpha(typeColor, 0.5)}`,
            '&:hover': {
              backgroundColor: alpha(typeColor, 0.25),
            },
          },
        }}
      >
        <Icon sx={{ fontSize: 24, color: isSelected ? typeColor : 'inherit' }} />
        <Typography
          sx={{
            fontSize: '0.65rem',
            fontWeight: isSelected ? 700 : 500,
            textTransform: 'none',
            lineHeight: 1.2,
            textAlign: 'center',
          }}
        >
          {APPOINTMENT_TYPE_LABELS[type]}
        </Typography>
      </ToggleButton>
    );
  };

  const content = (
    <Box sx={{ width: '100%', maxWidth: 500 }}>
      {/* Appointment Type Selection */}
      <Box sx={{ mb: 3 }}>
        <Typography
          sx={{
            color: 'rgba(255,255,255,0.6)',
            fontSize: '0.7rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            mb: 1.5,
          }}
        >
          Appointment Type
        </Typography>

        {/* Primary Types */}
        <ToggleButtonGroup
          value={selectedType}
          exclusive
          onChange={handleTypeChange}
          sx={{
            display: 'flex',
            gap: 1,
            mb: 1,
            '& .MuiToggleButtonGroup-grouped': {
              border: 'none',
              '&:not(:first-of-type)': { borderRadius: 2, ml: 0 },
              '&:first-of-type': { borderRadius: 2 },
            },
          }}
        >
          {primaryTypes.map(renderTypeButton)}
        </ToggleButtonGroup>

        {/* Secondary Types */}
        <ToggleButtonGroup
          value={selectedType}
          exclusive
          onChange={handleTypeChange}
          sx={{
            display: 'flex',
            gap: 1,
            mb: 1,
            '& .MuiToggleButtonGroup-grouped': {
              border: 'none',
              '&:not(:first-of-type)': { borderRadius: 2, ml: 0 },
              '&:first-of-type': { borderRadius: 2 },
            },
          }}
        >
          {secondaryTypes.map(renderTypeButton)}
        </ToggleButtonGroup>

        {/* Virtual/Other Types */}
        <ToggleButtonGroup
          value={selectedType}
          exclusive
          onChange={handleTypeChange}
          sx={{
            display: 'flex',
            gap: 1,
            '& .MuiToggleButtonGroup-grouped': {
              border: 'none',
              '&:not(:first-of-type)': { borderRadius: 2, ml: 0 },
              '&:first-of-type': { borderRadius: 2 },
            },
          }}
        >
          {virtualTypes.map(renderTypeButton)}
        </ToggleButtonGroup>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 3 }} />

      {/* Initial Location */}
      <Box sx={{ mb: 3 }}>
        <Typography
          sx={{
            color: 'rgba(255,255,255,0.6)',
            fontSize: '0.7rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            mb: 1,
          }}
        >
          {selectedType === APPOINTMENT_TYPES.PHONE_CALL || selectedType === APPOINTMENT_TYPES.VIDEO_CALL
            ? 'Meeting Notes (Optional)'
            : 'Initial Meeting Location'}
        </Typography>

        {selectedType !== APPOINTMENT_TYPES.PHONE_CALL && selectedType !== APPOINTMENT_TYPES.VIDEO_CALL ? (
          <>
            <AddressInput
              value={locationData.location_address}
              onChange={handleAddressChange}
              placeholder="Where will you meet?"
              hideLabel
              color={TYPE_COLORS[selectedType] || color}
            />
            {locationData.city && (
              <Typography
                sx={{
                  fontSize: '0.75rem',
                  color: 'rgba(255,255,255,0.6)',
                  mt: 0.5,
                  pl: 1,
                }}
              >
                {[locationData.city, locationData.state, locationData.zip_code].filter(Boolean).join(', ')}
              </Typography>
            )}
          </>
        ) : (
          <Typography
            sx={{
              color: 'rgba(255,255,255,0.5)',
              fontSize: '0.85rem',
              fontStyle: 'italic',
              p: 2,
              backgroundColor: 'rgba(255,255,255,0.05)',
              borderRadius: 2,
            }}
          >
            No physical location needed for {APPOINTMENT_TYPE_LABELS[selectedType]}
          </Typography>
        )}
      </Box>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <IconButton
          onClick={onClose}
          disabled={saving}
          sx={{
            width: 48,
            height: 48,
            backgroundColor: 'rgba(255,255,255,0.15)',
            color: 'white',
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.25)' },
          }}
        >
          <Close />
        </IconButton>
        <IconButton
          onClick={handleSave}
          disabled={saving}
          sx={{
            width: 48,
            height: 48,
            backgroundColor: 'white',
            color: TYPE_COLORS[selectedType] || color,
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.9)' },
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
  );

  return (
    <ModalContainer open={open} onClose={onClose} color={TYPE_COLORS[selectedType] || color} maxWidth={520}>
      {content}
    </ModalContainer>
  );
};

export default EditAppointmentType;
