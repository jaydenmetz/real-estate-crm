import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Chip,
  useTheme,
  alpha,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { APPOINTMENT_STATUS_COLORS } from '../../constants/appointmentConstants';
import { formatDate as formatDateUtil } from '../../../../../utils/formatters';
import { QuickActionsMenu } from '../../../../common/ui/QuickActionsMenu';

/**
 * AppointmentTableRow - Compact table view
 * Adapted from ClientTableRow for appointments data structure
 */
const AppointmentTableRow = ({ appointment, onUpdate, onDelete, onArchive, onRestore, isArchived = false }) => {
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
        display: 'grid',
        gridTemplateColumns: '2fr 1fr 1fr 1.5fr 1fr 1fr 80px',
        gap: 2,
        alignItems: 'center',
        width: '100%',
        minHeight: 60,
        px: 2,
        py: 1.5,
        borderRadius: 2,
        cursor: 'pointer',
        position: 'relative',
        bgcolor: 'background.paper',
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        transition: 'all 0.2s',
        '&:hover': {
          bgcolor: alpha(statusColor, 0.03),
          border: `1px solid ${alpha(statusColor, 0.2)}`,
          boxShadow: `0 2px 8px ${alpha(statusColor, 0.1)}`,
        },
      }}
    >
      {/* Title + Type */}
      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="body1"
          sx={{
            fontWeight: 700,
            fontSize: '0.9rem',
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
            fontSize: 9,
            fontWeight: 600,
            height: 18,
            mt: 0.5,
            background: alpha(statusColor, 0.1),
            color: statusColor,
          }}
        />
      </Box>

      {/* Date */}
      <Box>
        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem', color: theme.palette.text.primary }}>
          {date ? formatDateUtil(date, 'MMM d, yyyy') : '—'}
        </Typography>
      </Box>

      {/* Time */}
      <Box>
        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem', color: theme.palette.text.primary }}>
          {time || '—'}
        </Typography>
      </Box>

      {/* Location */}
      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 500,
            fontSize: '0.85rem',
            color: theme.palette.text.secondary,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {location || '—'}
        </Typography>
      </Box>

      {/* Client */}
      <Box>
        <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.85rem', color: theme.palette.text.secondary }}>
          {clientDisplay || '—'}
        </Typography>
      </Box>

      {/* Status */}
      <Box>
        <Chip
          label={appointmentStatus.charAt(0).toUpperCase() + appointmentStatus.slice(1).replace('_', ' ')}
          size="small"
          sx={{
            fontWeight: 600,
            fontSize: 10,
            height: 24,
            background: `linear-gradient(135deg, ${statusColor} 0%, ${alpha(statusColor, 0.8)} 100%)`,
            color: 'white',
          }}
        />
      </Box>

      {/* Actions */}
      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
        <QuickActionsMenu
          item={appointment}
          onView={() => navigate(`/appointments/${id}`)}
          onShare={null}
          onArchive={onArchive}
          onRestore={onRestore}
          onDelete={onDelete}
          isArchived={isArchived}
          color={theme.palette.text.secondary}
        />
      </Box>
    </Box>
  );
};

export default AppointmentTableRow;
