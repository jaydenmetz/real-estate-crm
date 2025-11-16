import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Chip,
  useTheme,
  alpha,
  Avatar,
  LinearProgress,
} from '@mui/material';
import {
  Email,
  Phone,
  TrendingUp,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { LEAD_STATUS_COLORS } from '../../constants/leadConstants';
import { formatDate as formatDateUtil } from '../../../../../utils/formatters';
import { QuickActionsMenu } from '../../../../common/QuickActionsMenu';

/**
 * LeadListItem - Full-width horizontal list view with avatar on left
 * Adapted from ClientListItem for leads data structure
 */
const LeadListItem = ({ lead, onUpdate, onDelete, onArchive, onRestore, isArchived = false }) => {
  const navigate = useNavigate();
  const theme = useTheme();

  // Click vs drag detection (for text selection)
  const [isDragging, setIsDragging] = useState(false);
  const [mouseDownPos, setMouseDownPos] = useState(null);

  // Extract lead data (support both snake_case and camelCase)
  const {
    id,
    firstName,
    first_name,
    lastName,
    last_name,
    email,
    phone,
    lead_status,
    status,
    leadType,
    lead_type,
    source,
    priority,
    score = 0,
    created_at,
    last_contact,
  } = lead;

  // Normalize fields
  const fullName = `${firstName || first_name || ''} ${lastName || last_name || ''}`.trim();
  const initials = `${(firstName || first_name || '?')[0]}${(lastName || last_name || '?')[0]}`.toUpperCase();
  const leadStatus = lead_status || status || 'new';
  const type = leadType || lead_type || 'buyer';
  const leadScore = parseInt(score) || 0;

  // Get status color
  const statusColor = LEAD_STATUS_COLORS[leadStatus] || '#ec4899';

  // Handle row click
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
      navigate(`/leads/${id}`);
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
        minHeight: 120,
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
      {/* Avatar Section - 120px fixed width */}
      <Box
        sx={{
          width: 120,
          minWidth: 120,
          position: 'relative',
          background: 'linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Avatar
          sx={{
            width: 70,
            height: 70,
            background: `linear-gradient(135deg, ${statusColor} 0%, ${alpha(statusColor, 0.8)} 100%)`,
            fontSize: '1.75rem',
            fontWeight: 700,
            border: `3px solid rgba(255,255,255,0.9)`,
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          }}
        >
          {initials}
        </Avatar>

        {/* Lead Score Badge */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 8,
            left: 8,
            right: 8,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
            <TrendingUp sx={{ fontSize: 12, color: 'white' }} />
            <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'white', fontWeight: 600 }}>
              Score: {leadScore}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={leadScore}
            sx={{
              height: 4,
              borderRadius: 2,
              backgroundColor: 'rgba(255,255,255,0.3)',
              '& .MuiLinearProgress-bar': {
                background: `linear-gradient(90deg, ${statusColor} 0%, #10b981 100%)`,
              },
            }}
          />
        </Box>

        {/* Delete/Restore Button */}
        {(onArchive || onDelete || onRestore) && (
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
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
                item={lead}
                onView={() => navigate(`/leads/${id}`)}
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
        {/* Header Row: Name + Status */}
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
              {fullName}
            </Typography>
            <Chip
              label={type.charAt(0).toUpperCase() + type.slice(1)}
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
            label={leadStatus.charAt(0).toUpperCase() + leadStatus.slice(1)}
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

        {/* Contact Info Row */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2 }}>
          {email && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Email sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
              <Typography
                variant="body2"
                sx={{
                  fontSize: '0.85rem',
                  color: theme.palette.text.secondary,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: 250,
                }}
              >
                {email}
              </Typography>
            </Box>
          )}
          {phone && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Phone sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
              <Typography variant="body2" sx={{ fontSize: '0.85rem', color: theme.palette.text.secondary }}>
                {phone}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Metrics Row */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mt: 'auto' }}>
          {/* Source */}
          {source && (
            <Box>
              <Typography variant="caption" sx={{ fontSize: 10, fontWeight: 600, color: theme.palette.text.secondary, textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>
                Source
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '0.95rem', color: theme.palette.text.primary }}>
                {source.charAt(0).toUpperCase() + source.slice(1).replace('_', ' ')}
              </Typography>
            </Box>
          )}

          {/* Created Date */}
          {created_at && (
            <Box>
              <Typography variant="caption" sx={{ fontSize: 10, fontWeight: 600, color: theme.palette.text.secondary, textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>
                Created
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '0.95rem', color: theme.palette.text.primary }}>
                {formatDateUtil(created_at, 'MMM d, yyyy')}
              </Typography>
            </Box>
          )}

          {/* Last Contact */}
          {last_contact && (
            <Box>
              <Typography variant="caption" sx={{ fontSize: 10, fontWeight: 600, color: theme.palette.text.secondary, textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>
                Last Contact
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#6366f1' }}>
                {formatDateUtil(last_contact, 'MMM d, yyyy')}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default LeadListItem;
