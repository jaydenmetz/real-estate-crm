import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Chip,
  useTheme,
  alpha,
  Avatar,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { CLIENT_STATUS_COLORS } from '../../constants/clientConstants';
import { formatCurrency, formatDate as formatDateUtil } from '../../../../../utils/formatters';
import { QuickActionsMenu } from '../../../../common/QuickActionsMenu';

/**
 * ClientTableRow - Compact table view (no large avatar)
 * Adapted from ListingTableRow for clients data structure
 */
const ClientTableRow = ({ client, onUpdate, onDelete, onArchive, onRestore, isArchived = false }) => {
  const navigate = useNavigate();
  const theme = useTheme();

  // Click vs drag detection (for text selection)
  const [isDragging, setIsDragging] = useState(false);
  const [mouseDownPos, setMouseDownPos] = useState(null);

  // Extract client data (support both snake_case and camelCase)
  const {
    id,
    firstName,
    first_name,
    lastName,
    last_name,
    email,
    phone,
    client_status,
    status,
    clientType,
    client_type,
    budget,
    max_budget,
    created_at,
    last_contact,
    last_contactDate,
  } = client;

  // Normalize fields
  const fullName = `${firstName || first_name || ''} ${lastName || last_name || ''}`.trim();
  const initials = `${(firstName || first_name || '?')[0]}${(lastName || last_name || '?')[0]}`.toUpperCase();
  const clientStatus = client_status || status || 'lead';
  const type = clientType || client_type || 'buyer';
  const budgetAmount = parseFloat(budget || max_budget || 0);
  const lastContact = last_contact || last_contactDate;

  // Get status color
  const statusColor = CLIENT_STATUS_COLORS[clientStatus] || '#6366f1';

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
      // If mouse moved more than 5px, consider it a drag (text selection)
      if (distance > 5) {
        setIsDragging(true);
      }
    }
  }, [mouseDownPos]);

  const handleRowClick = useCallback(() => {
    // Only navigate if user didn't drag (text selection)
    if (!isDragging) {
      navigate(`/clients/${id}`);
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
        gridTemplateColumns: 'auto 2fr 1.5fr 1.2fr 1fr 1fr 1fr 80px',
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
      {/* Avatar + Name */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          minWidth: 0,
        }}
      >
        <Avatar
          sx={{
            width: 40,
            height: 40,
            background: `linear-gradient(135deg, ${statusColor} 0%, ${alpha(statusColor, 0.8)} 100%)`,
            fontSize: '0.875rem',
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {initials}
        </Avatar>
        <Box sx={{ minWidth: 0, flex: 1 }}>
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
            {fullName}
          </Typography>
          <Chip
            label={type.charAt(0).toUpperCase() + type.slice(1)}
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
      </Box>

      {/* Email */}
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
          {email || '—'}
        </Typography>
      </Box>

      {/* Phone */}
      <Box>
        <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.85rem', color: theme.palette.text.secondary }}>
          {phone || '—'}
        </Typography>
      </Box>

      {/* Status */}
      <Box>
        <Chip
          label={clientStatus.charAt(0).toUpperCase() + clientStatus.slice(1)}
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

      {/* Budget */}
      <Box>
        <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.875rem', color: '#10b981' }}>
          {budgetAmount > 0 ? formatCurrency(budgetAmount) : '—'}
        </Typography>
      </Box>

      {/* Created Date */}
      <Box>
        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem', color: theme.palette.text.primary }}>
          {created_at ? formatDateUtil(created_at, 'MMM d, yyyy') : '—'}
        </Typography>
      </Box>

      {/* Last Contact */}
      <Box>
        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem', color: '#6366f1' }}>
          {lastContact ? formatDateUtil(lastContact, 'MMM d') : '—'}
        </Typography>
      </Box>

      {/* Actions */}
      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
        <QuickActionsMenu
          item={client}
          onView={() => navigate(`/clients/${id}`)}
          onShare={null} // Future feature
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

export default ClientTableRow;
