import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  TextField,
  InputAdornment,
  Tooltip,
  Chip,
  Avatar,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Add,
  Delete,
  DragIndicator,
  LocationOn,
  Schedule,
  Timer,
  Check,
  Close,
  Home,
  AttachMoney,
  BedOutlined,
  BathtubOutlined,
  SquareFoot,
  LinkOff,
} from '@mui/icons-material';
import { ModalContainer } from '../../../common/modals/ModalContainer';
import { AddressInput } from '../../../common/inputs/shared/AddressInput';
import { ListingInput } from '../../../common/inputs/shared/ListingInput';

/**
 * Format time from 24h to 12h display
 */
const formatTime = (time) => {
  if (!time) return '';
  if (time.includes('AM') || time.includes('PM')) return time;
  const [hours, minutes] = time.split(':');
  const h = parseInt(hours);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

/**
 * Format price for display
 */
const formatPrice = (price) => {
  if (!price) return '';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

/**
 * Listing Preview Card - Shows when a listing is linked to a stop
 */
const ListingPreviewCard = ({ listing, onUnlink, color }) => {
  if (!listing) return null;

  return (
    <Box
      sx={{
        backgroundColor: alpha(color, 0.15),
        borderRadius: 2,
        p: 1.5,
        mb: 1.5,
        border: `1px solid ${alpha(color, 0.3)}`,
        display: 'flex',
        gap: 1.5,
      }}
    >
      {/* Listing Photo */}
      <Box
        sx={{
          width: 80,
          height: 60,
          borderRadius: 1,
          overflow: 'hidden',
          flexShrink: 0,
          backgroundColor: 'rgba(255,255,255,0.1)',
        }}
      >
        {listing.primary_photo ? (
          <Box
            component="img"
            src={listing.primary_photo}
            alt={listing.property_address}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Home sx={{ color: 'rgba(255,255,255,0.4)', fontSize: 28 }} />
          </Box>
        )}
      </Box>

      {/* Listing Info */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          sx={{
            color: 'white',
            fontWeight: 600,
            fontSize: '0.85rem',
            lineHeight: 1.2,
            mb: 0.5,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {listing.property_address || 'Unknown Address'}
        </Typography>

        {/* Price */}
        {listing.list_price && (
          <Typography
            sx={{
              color: alpha(color, 0.9),
              fontWeight: 700,
              fontSize: '0.9rem',
              mb: 0.5,
            }}
          >
            {formatPrice(listing.list_price)}
          </Typography>
        )}

        {/* Property Details */}
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          {listing.bedrooms && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
              <BedOutlined sx={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }} />
              <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.7rem' }}>
                {listing.bedrooms} bd
              </Typography>
            </Box>
          )}
          {listing.bathrooms && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
              <BathtubOutlined sx={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }} />
              <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.7rem' }}>
                {listing.bathrooms} ba
              </Typography>
            </Box>
          )}
          {listing.square_feet && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
              <SquareFoot sx={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }} />
              <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.7rem' }}>
                {listing.square_feet.toLocaleString()} sqft
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Unlink Button */}
      <Tooltip title="Unlink listing">
        <IconButton
          size="small"
          onClick={onUnlink}
          sx={{
            color: 'rgba(255,255,255,0.5)',
            alignSelf: 'flex-start',
            '&:hover': {
              color: '#ef4444',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
            },
          }}
        >
          <LinkOff fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

/**
 * Single Stop Item Component
 * Enhanced to support showings mode with listing selection
 */
const StopItem = ({
  stop,
  index,
  onUpdate,
  onDelete,
  color,
  isFirst,
  canDelete,
  isShowingMode = false,
}) => {
  const [localStop, setLocalStop] = useState(stop);

  // Sync local state when stop prop changes
  useEffect(() => {
    setLocalStop(stop);
  }, [stop]);

  const handleAddressSelect = (addressData) => {
    const updated = {
      ...localStop,
      location_address: addressData.property_address || addressData.display_address || '',
      city: addressData.city || '',
      state: addressData.state || '',
      zip_code: addressData.zip_code || '',
      latitude: addressData.latitude || null,
      longitude: addressData.longitude || null,
    };
    setLocalStop(updated);
    onUpdate(index, updated);
  };

  const handleTimeChange = (e) => {
    const updated = {
      ...localStop,
      scheduled_time: e.target.value,
    };
    setLocalStop(updated);
    onUpdate(index, updated);
  };

  const handleDurationChange = (e) => {
    const updated = {
      ...localStop,
      estimated_duration: parseInt(e.target.value) || 30,
    };
    setLocalStop(updated);
    onUpdate(index, updated);
  };

  // Handle listing selection for showings mode
  const handleListingSelect = (listing) => {
    if (!listing) {
      // Unlink listing
      const updated = {
        ...localStop,
        listing: null,
        listing_id: null,
      };
      setLocalStop(updated);
      onUpdate(index, updated);
      return;
    }

    // Link listing - also use its address
    const updated = {
      ...localStop,
      listing,
      listing_id: listing.id,
      location_address: listing.property_address || '',
      city: listing.city || '',
      state: listing.state || '',
      zip_code: listing.zip_code || '',
    };
    setLocalStop(updated);
    onUpdate(index, updated);
  };

  const handleUnlinkListing = () => {
    handleListingSelect(null);
  };

  return (
    <Box
      sx={{
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 2,
        p: 2,
        mb: 2,
        border: '1px solid rgba(255,255,255,0.15)',
        position: 'relative',
      }}
    >
      {/* Stop Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5, gap: 1 }}>
        <DragIndicator sx={{ color: 'rgba(255,255,255,0.4)', cursor: 'grab' }} />
        <Box
          sx={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            backgroundColor: alpha(color, 0.3),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '0.85rem',
            color: 'white',
          }}
        >
          {index + 1}
        </Box>
        <Typography
          sx={{
            flex: 1,
            fontSize: '0.85rem',
            fontWeight: 600,
            color: 'rgba(255,255,255,0.9)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          {isShowingMode
            ? (isFirst ? 'First Showing' : `Showing ${index + 1}`)
            : (isFirst ? 'Starting Location' : `Stop ${index + 1}`)}
        </Typography>
        {canDelete && (
          <Tooltip title="Remove stop">
            <IconButton
              size="small"
              onClick={() => onDelete(index)}
              sx={{
                color: 'rgba(255,255,255,0.5)',
                '&:hover': {
                  color: '#ef4444',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                },
              }}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Listing Selection for Showings Mode */}
      {isShowingMode && (
        <Box sx={{ mb: 2 }}>
          {localStop.listing ? (
            <ListingPreviewCard
              listing={localStop.listing}
              onUnlink={handleUnlinkListing}
              color={color}
            />
          ) : (
            <Box>
              <Typography
                variant="caption"
                sx={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.6)',
                  mb: 0.5,
                  display: 'block',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Select Listing
              </Typography>
              <ListingInput
                value={localStop.listing}
                onChange={handleListingSelect}
                placeholder="Search listings to show..."
                color={color}
              />
            </Box>
          )}
        </Box>
      )}

      {/* Address - Only show if not in showings mode OR if no listing selected */}
      {(!isShowingMode || !localStop.listing) && (
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="caption"
            sx={{
              fontSize: 10,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.6)',
              mb: 0.5,
              display: 'block',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            {isShowingMode ? 'Or Enter Address Manually' : 'Address'}
          </Typography>
          <AddressInput
            value={localStop.location_address || ''}
            onChange={handleAddressSelect}
            placeholder="Enter address..."
            hideLabel
            color={color}
          />
          {localStop.city && !localStop.listing && (
            <Typography
              sx={{
                fontSize: '0.75rem',
                color: 'rgba(255,255,255,0.6)',
                mt: 0.5,
                pl: 1,
              }}
            >
              {[localStop.city, localStop.state, localStop.zip_code].filter(Boolean).join(', ')}
            </Typography>
          )}
        </Box>
      )}

      {/* Time and Duration Row */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        {/* Time */}
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="caption"
            sx={{
              fontSize: 10,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.6)',
              mb: 0.5,
              display: 'block',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            Time
          </Typography>
          <TextField
            type="time"
            value={localStop.scheduled_time || ''}
            onChange={handleTimeChange}
            fullWidth
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Schedule sx={{ color: 'rgba(255,255,255,0.5)', fontSize: 18 }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderRadius: 1.5,
                '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.4)' },
                '&.Mui-focused fieldset': { borderColor: 'rgba(255,255,255,0.6)' },
              },
              '& .MuiInputBase-input': {
                color: 'white',
                fontSize: '0.875rem',
              },
            }}
          />
        </Box>

        {/* Duration */}
        <Box sx={{ width: 120 }}>
          <Typography
            variant="caption"
            sx={{
              fontSize: 10,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.6)',
              mb: 0.5,
              display: 'block',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            Duration
          </Typography>
          <TextField
            type="number"
            value={localStop.estimated_duration || 30}
            onChange={handleDurationChange}
            fullWidth
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Timer sx={{ color: 'rgba(255,255,255,0.5)', fontSize: 18 }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem' }}>
                    min
                  </Typography>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderRadius: 1.5,
                '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.4)' },
                '&.Mui-focused fieldset': { borderColor: 'rgba(255,255,255,0.6)' },
              },
              '& .MuiInputBase-input': {
                color: 'white',
                fontSize: '0.875rem',
              },
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

/**
 * EditStops - Multi-stop editor for appointments
 *
 * Features:
 * - Add/remove stops
 * - Address autocomplete per stop
 * - Time scheduling per stop
 * - Duration estimation
 * - Listing selection for showings mode
 * - Route optimization placeholder (for future map integration)
 *
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Close handler
 * @param {function} onSave - Save handler (stops) => void
 * @param {Array} value - Current stops array
 * @param {Object} data - Full appointment object
 * @param {boolean} inline - If true, renders without ModalContainer wrapper
 * @param {string} color - Theme color
 * @param {string} appointmentType - Type of appointment (showing, listing_presentation, etc.)
 */
export const EditStops = ({
  open,
  onClose,
  onSave,
  value = [],
  data,
  inline = false,
  color = '#3b82f6',
  appointmentType,
}) => {
  // Determine if this is a showing type appointment
  const isShowingMode = appointmentType === 'showing' ||
    appointmentType === 'Property Showing' ||
    data?.appointment_type === 'showing' ||
    data?.appointment_type === 'Property Showing' ||
    data?.type === 'showing';
  // Initialize with at least one stop
  const [stops, setStops] = useState(() => {
    if (value && value.length > 0) return [...value];
    // Create initial stop from appointment's location if available
    if (data?.location) {
      return [{
        stop_order: 1,
        location_address: data.location,
        city: data.first_stop_city || '',
        state: data.first_stop_state || '',
        zip_code: data.first_stop_zip || '',
        scheduled_time: data.start_time || '',
        estimated_duration: 30,
      }];
    }
    return [{
      stop_order: 1,
      location_address: '',
      city: '',
      state: '',
      zip_code: '',
      scheduled_time: '',
      estimated_duration: 30,
    }];
  });
  const [saving, setSaving] = useState(false);

  // Reset when dialog opens
  useEffect(() => {
    if (open) {
      if (value && value.length > 0) {
        setStops([...value]);
      } else if (data?.location) {
        setStops([{
          stop_order: 1,
          location_address: data.location,
          city: data.first_stop_city || '',
          state: data.first_stop_state || '',
          zip_code: data.first_stop_zip || '',
          scheduled_time: data.start_time || '',
          estimated_duration: 30,
        }]);
      }
    }
  }, [open, value, data]);

  const handleAddStop = () => {
    const newStop = {
      stop_order: stops.length + 1,
      location_address: '',
      city: '',
      state: '',
      zip_code: '',
      scheduled_time: '',
      estimated_duration: 30,
    };
    const updatedStops = [...stops, newStop];
    setStops(updatedStops);

    // In inline mode, immediately notify parent
    if (inline && onSave) {
      onSave(updatedStops);
    }
  };

  const handleUpdateStop = (index, updatedStop) => {
    const updatedStops = [...stops];
    updatedStops[index] = { ...updatedStop, stop_order: index + 1 };
    setStops(updatedStops);

    // In inline mode, immediately notify parent
    if (inline && onSave) {
      onSave(updatedStops);
    }
  };

  const handleDeleteStop = (index) => {
    if (stops.length <= 1) return; // Always keep at least one stop
    const updatedStops = stops.filter((_, i) => i !== index).map((stop, i) => ({
      ...stop,
      stop_order: i + 1,
    }));
    setStops(updatedStops);

    // In inline mode, immediately notify parent
    if (inline && onSave) {
      onSave(updatedStops);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(stops);
      onClose?.();
    } catch (error) {
      console.error('Failed to save stops:', error);
    } finally {
      setSaving(false);
    }
  };

  // Calculate total duration
  const totalDuration = stops.reduce((sum, stop) => sum + (stop.estimated_duration || 0), 0);
  const hours = Math.floor(totalDuration / 60);
  const mins = totalDuration % 60;
  const totalDurationText = hours > 0
    ? `${hours}h ${mins}m total`
    : `${mins} min total`;

  const content = (
    <Box sx={{ width: '100%', maxWidth: 500 }}>
      {/* Header */}
      <Box sx={{ mb: 2 }}>
        <Typography
          variant="h6"
          sx={{
            color: 'white',
            fontWeight: 700,
            fontSize: '1.1rem',
            mb: 0.5,
          }}
        >
          {isShowingMode ? 'Property Showings' : 'Appointment Stops'}
        </Typography>
        <Typography
          sx={{
            color: 'rgba(255,255,255,0.6)',
            fontSize: '0.8rem',
          }}
        >
          {stops.length} {isShowingMode
            ? (stops.length === 1 ? 'showing' : 'showings')
            : (stops.length === 1 ? 'stop' : 'stops')} | {totalDurationText}
        </Typography>
      </Box>

      {/* Stops List */}
      <Box sx={{ mb: 2 }}>
        {stops.map((stop, index) => (
          <StopItem
            key={stop.id || `stop-${index}`}
            stop={stop}
            index={index}
            onUpdate={handleUpdateStop}
            onDelete={handleDeleteStop}
            color={color}
            isFirst={index === 0}
            canDelete={stops.length > 1}
            isShowingMode={isShowingMode}
          />
        ))}
      </Box>

      {/* Add Stop Button */}
      <Box
        onClick={handleAddStop}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
          p: 1.5,
          borderRadius: 2,
          border: '2px dashed rgba(255,255,255,0.3)',
          cursor: 'pointer',
          transition: 'all 0.2s',
          mb: 3,
          '&:hover': {
            borderColor: 'rgba(255,255,255,0.5)',
            backgroundColor: 'rgba(255,255,255,0.05)',
          },
        }}
      >
        <Add sx={{ color: 'rgba(255,255,255,0.6)' }} />
        <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
          {isShowingMode ? 'Add Another Showing' : 'Add Another Stop'}
        </Typography>
      </Box>

      {/* Route Info Placeholder */}
      <Box
        sx={{
          backgroundColor: alpha(color, 0.15),
          borderRadius: 2,
          p: 2,
          mb: inline ? 0 : 3,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        <LocationOn sx={{ color: alpha(color, 0.8), fontSize: 24 }} />
        <Box>
          <Typography
            sx={{
              color: 'white',
              fontWeight: 600,
              fontSize: '0.875rem',
            }}
          >
            Smart Route Planning
          </Typography>
          <Typography
            sx={{
              color: 'rgba(255,255,255,0.6)',
              fontSize: '0.75rem',
            }}
          >
            Map integration with optimized routing coming soon
          </Typography>
        </Box>
      </Box>

      {/* Action Buttons - Only show in standalone mode */}
      {!inline && (
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
            disabled={saving || stops.every(s => !s.location_address)}
            sx={{
              width: 48,
              height: 48,
              backgroundColor: 'white',
              color: color,
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
      )}
    </Box>
  );

  if (inline) {
    return content;
  }

  return (
    <ModalContainer open={open} onClose={onClose} color={color} maxWidth={520}>
      {content}
    </ModalContainer>
  );
};

export default EditStops;
