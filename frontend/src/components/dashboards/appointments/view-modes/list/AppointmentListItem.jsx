import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Chip,
  useTheme,
  alpha,
} from '@mui/material';
import {
  CalendarToday,
  AccessTime,
  LocationOn,
  Person,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { APPOINTMENT_STATUS_COLORS } from '../../constants/appointmentConstants';
import { formatDate as formatDateUtil } from '../../../../../utils/formatters';
import { QuickActionsMenu } from '../../../../common/QuickActionsMenu';

/**
 * AppointmentListItem - Full-width horizontal list view
 * Adapted from ClientListItem for appointments data structure
 */
const AppointmentListItem = ({ appointment, onUpdate, onDelete, onArchive, onRestore, isArchived = false }) => {
  const navigate = useNavigate();
  const theme = useTheme();

  // Click vs drag detection (for text selection)
  const [isDragging, setIsDragging] = useState(false);
  const [mouseDownPos, setMouseDownPos] = useState(null);

  // Extract appointment data (support both snake_case and camelCase)
  const {
    id,
    title,
    appointment_date,
    appointmentDate,
    appointment_time,
    appointmentTime,
    appointment_status,
    status,
    appointmentType,
    appointment_type,
    location,
    duration,
    client_name,
    clientName,
  } = appointment;

  // Normalize fields
  const appointmentTitle = title || 'Untitled Appointment';
  const date = appointment_date || appointmentDate;
  const time = appointment_time || appointmentTime;
  const appointmentStatus = appointment_status || status || 'scheduled';
  const type = appointmentType || appointment_type || 'showing';
  const clientDisplay = client_name || clientName;

  // Get status color
  const statusColor = APPOINTMENT_STATUS_COLORS[appointmentStatus] || '#9c27b0';

  // Handle row click - only navigate if not dragging (text selection)
  const handleRowMouseDown = useCallback((e) => {
    setMouseDownPos({ x: e.clientX, y: e.clientY });
    setIsDragging(false);
  }, []);

  const handleRowMouseMove = useCallback((e) => {
    if (mouseDownPos) {
      const distance = Math.sqrt(
        Math.pow(e.clientX - mouseDownPos.x, 2) + Math.pow(e.clientY - mouseDownPos.y, 2)
      );
      if (distance > 5) {
        setIsDragging(true);
      }
    }
  }, [mouseDownPos]);

  const handleRowClick = useCallback(() => {
    if (!isDragging) {
      navigate(`/appointments/${id}`);
    }
    setMouseDownPos(null);
  }, [isDragging, id, navigate]);

  return (
    <Box
      onMouseDown={handleRowMouseDown}
      onMouseMove={handleRowMouseMove}
      onClick={handleRowClick}
      sx={{
        display: 'flex',
        width: '100%',
        minHeight: 100,
        borderRadius: 3,
        overflow: 'hidden',
        cursor: 'pointer',
        position: 'relative',
        bgcolor: 'background.paper',
        border: `1px solid ${alpha(statusColor, 0.15)}`,
        boxShadow: `0 4px 16px ${alpha(statusColor, 0.08)}`,
        transition: 'all 0.2s',
        '&:hover': {
          boxShadow: `0 6px 24px ${alpha(statusColor, 0.15)}`,
          transform: 'translateY(-2px)',
        },
      }}
    >
      {/* Date/Time Section - 120px fixed width */}
      <Box
        sx={{
          width: 120,
          minWidth: 120,
          position: 'relative',
          background: `linear-gradient(135deg, ${statusColor} 0%, ${alpha(statusColor, 0.8)} 100%)`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          p: 2,
        }}
      >
        <CalendarToday sx={{ fontSize: 28, mb: 1 }} />
        {date && (
          <>
            <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.85rem', textAlign: 'center' }}>
              {formatDateUtil(date, 'MMM d')}
            </Typography>
            <Typography variant="caption" sx={{ fontSize: '0.7rem', opacity: 0.9 }}>
              {formatDateUtil(date, 'yyyy')}
            </Typography>
          </>
        )}
        {time && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
            <AccessTime sx={{ fontSize: 14 }} />
            <Typography variant="caption" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
              {time}
            </Typography>
          </Box>
        )}

        {/* Delete/Restore Button */}
        {(onArchive || onDelete || onRestore) && (
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              display: 'flex',
              gap: 0.5,
            }}
          >
            <Box
              sx={{
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                backdropFilter: 'blur(8px)',
                borderRadius: '50%',
              }}
            >
              <QuickActionsMenu
                item={appointment}
                onView={() => navigate(`/appointments/${id}`)}
                onShare={null}
                onArchive={onArchive}
                onRestore={onRestore}
                onDelete={onDelete}
                isArchived={isArchived}
                color="white"
              />
            </Box>
          </Box>
        )}
      </Box>

      {/* Content Area */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          p: 2,
          minWidth: 0,
        }}
      >
        {/* Header Row: Title + Status */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, minWidth: 0 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                fontSize: '1rem',
                color: theme.palette.text.primary,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {appointmentTitle}
            </Typography>
            <Chip
              label={type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
              size="small"
              sx={{
                fontSize: 10,
                fontWeight: 600,
                height: 20,
                background: alpha(statusColor, 0.1),
                color: statusColor,
              }}
            />
          </Box>
          <Chip
            label={appointmentStatus.charAt(0).toUpperCase() + appointmentStatus.slice(1).replace('_', ' ')}
            size="small"
            sx={{
              fontWeight: 700,
              fontSize: 11,
              ml: 2,
              background: `linear-gradient(135deg, ${statusColor} 0%, ${alpha(statusColor, 0.8)} 100%)`,
              color: 'white',
            }}
          />
        </Box>

        {/* Details Row */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
          {location && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <LocationOn sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
              <Typography
                variant="body2"
                sx={{
                  fontSize: '0.85rem',
                  color: theme.palette.text.secondary,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: 300,
                }}
              >
                {location}
              </Typography>
            </Box>
          )}
          {clientDisplay && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Person sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
              <Typography variant="body2" sx={{ fontSize: '0.85rem', color: theme.palette.text.secondary }}>
                {clientDisplay}
              </Typography>
            </Box>
          )}
          {duration && (
            <Typography variant="body2" sx={{ fontSize: '0.85rem', color: theme.palette.text.secondary }}>
              {duration} min
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default AppointmentListItem;
