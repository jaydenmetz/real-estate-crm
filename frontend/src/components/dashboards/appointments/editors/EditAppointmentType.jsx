import React, { useState, useEffect } from 'react';
import { Box, Typography, ToggleButtonGroup, ToggleButton, Divider, TextField, InputAdornment } from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  AccountBalance,
  People,
  Assignment,
  Home,
  LocationOn,
  Phone,
  Videocam,
  MoreHoriz,
  Check,
  Close,
  MyLocation,
  Search,
} from '@mui/icons-material';
import { ModalContainer } from '../../../common/modals/ModalContainer';
import { AddressInput } from '../../../common/inputs/shared/AddressInput';
import { IconButton } from '@mui/material';
import {
  APPOINTMENT_TYPES,
  APPOINTMENT_TYPE_LABELS,
  MEETING_MODES,
  MEETING_MODE_LABELS,
  VIRTUAL_MEETING_TYPES,
  VIRTUAL_MEETING_TYPE_LABELS,
} from '../../../../constants/appointmentConfig';

// Icon mapping for appointment types
const TYPE_ICONS = {
  [APPOINTMENT_TYPES.LOAN_PRE_APPROVAL]: AccountBalance,
  [APPOINTMENT_TYPES.BUYER_CONSULTATION]: People,
  [APPOINTMENT_TYPES.LISTING_PRESENTATION]: Assignment,
  [APPOINTMENT_TYPES.SHOWING]: Home,
};

// Color mapping for appointment types
const TYPE_COLORS = {
  [APPOINTMENT_TYPES.LOAN_PRE_APPROVAL]: '#10b981',
  [APPOINTMENT_TYPES.BUYER_CONSULTATION]: '#3b82f6',
  [APPOINTMENT_TYPES.LISTING_PRESENTATION]: '#f59e0b',
  [APPOINTMENT_TYPES.SHOWING]: '#8b5cf6',
};

// Virtual meeting type icons
const VIRTUAL_TYPE_ICONS = {
  [VIRTUAL_MEETING_TYPES.PHONE_CALL]: Phone,
  [VIRTUAL_MEETING_TYPES.VIDEO_CALL]: Videocam,
  [VIRTUAL_MEETING_TYPES.OTHER]: MoreHoriz,
};

/**
 * EditAppointmentType - Appointment type selector with meeting mode and location
 *
 * Structure:
 * 1. Appointment Type (4 options): Loan Pre-Approval, Buyer Consultation, Listing Presentation, Showing
 * 2. Meeting Mode: In Person / Virtual
 * 3. If In Person: Current Address toggle + Address input + Display Name
 * 4. If Virtual: Phone Call / Video Call / Other
 *
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Close handler
 * @param {function} onSave - Save handler
 * @param {string} appointmentType - Current appointment type
 * @param {string} meetingMode - Current meeting mode (in_person/virtual)
 * @param {string} virtualMeetingType - Current virtual meeting type
 * @param {object} initialStop - First stop data { location_address, city, state, zip_code }
 * @param {string} displayName - Display name for the location
 * @param {string} color - Theme color
 */
export const EditAppointmentType = ({
  open,
  onClose,
  onSave,
  appointmentType = APPOINTMENT_TYPES.SHOWING,
  meetingMode: initialMeetingMode = MEETING_MODES.IN_PERSON,
  virtualMeetingType: initialVirtualType = VIRTUAL_MEETING_TYPES.VIDEO_CALL,
  initialStop = {},
  displayName: initialDisplayName = '',
  color = '#0891b2',
}) => {
  const [selectedType, setSelectedType] = useState(appointmentType);
  const [meetingMode, setMeetingMode] = useState(initialMeetingMode);
  const [virtualMeetingType, setVirtualMeetingType] = useState(initialVirtualType);
  const [useCurrentAddress, setUseCurrentAddress] = useState(false);
  const [locationData, setLocationData] = useState({
    location_address: initialStop?.location_address || '',
    city: initialStop?.city || '',
    state: initialStop?.state || '',
    zip_code: initialStop?.zip_code || '',
    latitude: initialStop?.latitude || null,
    longitude: initialStop?.longitude || null,
  });
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [saving, setSaving] = useState(false);

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedType(appointmentType || APPOINTMENT_TYPES.SHOWING);
      setMeetingMode(initialMeetingMode || MEETING_MODES.IN_PERSON);
      setVirtualMeetingType(initialVirtualType || VIRTUAL_MEETING_TYPES.VIDEO_CALL);
      setUseCurrentAddress(false);
      setLocationData({
        location_address: initialStop?.location_address || '',
        city: initialStop?.city || '',
        state: initialStop?.state || '',
        zip_code: initialStop?.zip_code || '',
        latitude: initialStop?.latitude || null,
        longitude: initialStop?.longitude || null,
      });
      setDisplayName(initialDisplayName || '');
    }
  }, [open, appointmentType, initialMeetingMode, initialVirtualType, initialStop, initialDisplayName]);

  const handleTypeChange = (event, newType) => {
    if (newType !== null) {
      setSelectedType(newType);
    }
  };

  const handleMeetingModeChange = (event, newMode) => {
    if (newMode !== null) {
      setMeetingMode(newMode);
    }
  };

  const handleVirtualTypeChange = (event, newType) => {
    if (newType !== null) {
      setVirtualMeetingType(newType);
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
    // Auto-populate display name from address if empty
    if (!displayName && addressData.property_address) {
      setDisplayName(addressData.property_address);
    }
  };

  const handleUseCurrentLocation = () => {
    setUseCurrentAddress(true);
    // Get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          // For now, just set coordinates - could integrate with geocoding API
          setLocationData(prev => ({
            ...prev,
            latitude,
            longitude,
            location_address: 'Current Location',
          }));
          setDisplayName('Current Location');
        },
        (error) => {
          console.error('Error getting location:', error);
          setUseCurrentAddress(false);
        }
      );
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        appointment_type: selectedType,
        appointmentType: selectedType,
        meeting_mode: meetingMode,
        meetingMode: meetingMode,
        virtual_meeting_type: meetingMode === MEETING_MODES.VIRTUAL ? virtualMeetingType : null,
        virtualMeetingType: meetingMode === MEETING_MODES.VIRTUAL ? virtualMeetingType : null,
        // Location data (only for in-person)
        location: meetingMode === MEETING_MODES.IN_PERSON ? locationData.location_address : null,
        location_address: meetingMode === MEETING_MODES.IN_PERSON ? locationData.location_address : null,
        city: meetingMode === MEETING_MODES.IN_PERSON ? locationData.city : null,
        state: meetingMode === MEETING_MODES.IN_PERSON ? locationData.state : null,
        zip_code: meetingMode === MEETING_MODES.IN_PERSON ? locationData.zip_code : null,
        latitude: meetingMode === MEETING_MODES.IN_PERSON ? locationData.latitude : null,
        longitude: meetingMode === MEETING_MODES.IN_PERSON ? locationData.longitude : null,
        display_name: displayName,
        displayName: displayName,
      });
      onClose?.();
    } catch (error) {
      console.error('Failed to save appointment type:', error);
    } finally {
      setSaving(false);
    }
  };

  const currentTypeColor = TYPE_COLORS[selectedType] || color;

  const renderTypeButton = (type) => {
    const Icon = TYPE_ICONS[type] || Home;
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
        <Icon sx={{ fontSize: 28, color: isSelected ? typeColor : 'inherit' }} />
        <Typography
          sx={{
            fontSize: '0.7rem',
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
    <Box sx={{ width: '100%', maxWidth: 480 }}>
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

        <ToggleButtonGroup
          value={selectedType}
          exclusive
          onChange={handleTypeChange}
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 1,
            '& .MuiToggleButtonGroup-grouped': {
              border: 'none',
              borderRadius: '8px !important',
              m: 0,
            },
          }}
        >
          {Object.values(APPOINTMENT_TYPES).map(renderTypeButton)}
        </ToggleButtonGroup>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 3 }} />

      {/* Meeting Mode Toggle */}
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
          Meeting Type
        </Typography>

        <ToggleButtonGroup
          value={meetingMode}
          exclusive
          onChange={handleMeetingModeChange}
          sx={{
            display: 'flex',
            gap: 1,
            '& .MuiToggleButtonGroup-grouped': {
              border: 'none',
              borderRadius: '8px !important',
              m: 0,
              flex: 1,
            },
          }}
        >
          <ToggleButton
            value={MEETING_MODES.IN_PERSON}
            sx={{
              py: 1.5,
              backgroundColor: meetingMode === MEETING_MODES.IN_PERSON
                ? alpha(currentTypeColor, 0.2)
                : 'rgba(255,255,255,0.05)',
              color: meetingMode === MEETING_MODES.IN_PERSON ? 'white' : 'rgba(255,255,255,0.7)',
              '&.Mui-selected': {
                backgroundColor: alpha(currentTypeColor, 0.2),
                border: `2px solid ${alpha(currentTypeColor, 0.5)}`,
              },
            }}
          >
            <LocationOn sx={{ mr: 1, fontSize: 20 }} />
            <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, textTransform: 'none' }}>
              In Person
            </Typography>
          </ToggleButton>

          <ToggleButton
            value={MEETING_MODES.VIRTUAL}
            sx={{
              py: 1.5,
              backgroundColor: meetingMode === MEETING_MODES.VIRTUAL
                ? alpha(currentTypeColor, 0.2)
                : 'rgba(255,255,255,0.05)',
              color: meetingMode === MEETING_MODES.VIRTUAL ? 'white' : 'rgba(255,255,255,0.7)',
              '&.Mui-selected': {
                backgroundColor: alpha(currentTypeColor, 0.2),
                border: `2px solid ${alpha(currentTypeColor, 0.5)}`,
              },
            }}
          >
            <Videocam sx={{ mr: 1, fontSize: 20 }} />
            <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, textTransform: 'none' }}>
              Virtual
            </Typography>
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* In Person: Address Section */}
      {meetingMode === MEETING_MODES.IN_PERSON && (
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
            Meeting Location
          </Typography>

          {/* Current Location Button */}
          <Box
            onClick={handleUseCurrentLocation}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              p: 1.5,
              mb: 1.5,
              borderRadius: 2,
              backgroundColor: useCurrentAddress
                ? alpha(currentTypeColor, 0.15)
                : 'rgba(255,255,255,0.05)',
              border: useCurrentAddress
                ? `2px solid ${alpha(currentTypeColor, 0.4)}`
                : '2px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': {
                backgroundColor: alpha(currentTypeColor, 0.1),
              },
            }}
          >
            <MyLocation sx={{ color: currentTypeColor, fontSize: 22 }} />
            <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem', fontWeight: 500 }}>
              Use Current Location
            </Typography>
          </Box>

          {/* Address Search */}
          <Box sx={{ mb: 2 }}>
            <AddressInput
              value={locationData.location_address}
              onChange={handleAddressChange}
              placeholder="Search for an address..."
              hideLabel
              color={currentTypeColor}
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
          </Box>

          {/* Display Name */}
          <Box>
            <Typography
              sx={{
                color: 'rgba(255,255,255,0.5)',
                fontSize: '0.65rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                mb: 0.5,
              }}
            >
              Display Name (Optional)
            </Typography>
            <TextField
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g., Coffee Shop, Client's Office..."
              fullWidth
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  borderRadius: 1.5,
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                  '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.4)' },
                  '&.Mui-focused fieldset': { borderColor: currentTypeColor },
                },
                '& .MuiInputBase-input': {
                  color: 'white',
                  fontSize: '0.875rem',
                },
              }}
            />
          </Box>
        </Box>
      )}

      {/* Virtual: Meeting Type Selection */}
      {meetingMode === MEETING_MODES.VIRTUAL && (
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
            Virtual Meeting Type
          </Typography>

          <ToggleButtonGroup
            value={virtualMeetingType}
            exclusive
            onChange={handleVirtualTypeChange}
            sx={{
              display: 'flex',
              gap: 1,
              '& .MuiToggleButtonGroup-grouped': {
                border: 'none',
                borderRadius: '8px !important',
                m: 0,
                flex: 1,
              },
            }}
          >
            {Object.values(VIRTUAL_MEETING_TYPES).map((type) => {
              const Icon = VIRTUAL_TYPE_ICONS[type];
              const isSelected = virtualMeetingType === type;
              return (
                <ToggleButton
                  key={type}
                  value={type}
                  sx={{
                    flexDirection: 'column',
                    gap: 0.5,
                    py: 1.5,
                    backgroundColor: isSelected
                      ? alpha(currentTypeColor, 0.2)
                      : 'rgba(255,255,255,0.05)',
                    color: isSelected ? 'white' : 'rgba(255,255,255,0.7)',
                    '&.Mui-selected': {
                      backgroundColor: alpha(currentTypeColor, 0.2),
                      border: `2px solid ${alpha(currentTypeColor, 0.5)}`,
                    },
                  }}
                >
                  <Icon sx={{ fontSize: 24, color: isSelected ? currentTypeColor : 'inherit' }} />
                  <Typography
                    sx={{
                      fontSize: '0.7rem',
                      fontWeight: isSelected ? 700 : 500,
                      textTransform: 'none',
                    }}
                  >
                    {VIRTUAL_MEETING_TYPE_LABELS[type]}
                  </Typography>
                </ToggleButton>
              );
            })}
          </ToggleButtonGroup>
        </Box>
      )}

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
            color: currentTypeColor,
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
    <ModalContainer open={open} onClose={onClose} color={currentTypeColor} maxWidth={500}>
      {content}
    </ModalContainer>
  );
};

export default EditAppointmentType;
