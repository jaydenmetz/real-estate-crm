import React from 'react';
import {
  Box,
  Typography,
  Chip,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  alpha,
  useTheme,
  Paper,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Archive as ArchiveIcon,
  Unarchive as UnarchiveIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import {
  resolveField,
  getInitials,
  getStatusColor,
} from '../utils/fieldRenderers';

/**
 * ListItemTemplate - Generic horizontal list item component
 *
 * Eliminates duplicate code across Client/Lead/Listing/Appointment/Escrow list views.
 * Provides a consistent horizontal layout with avatar, content, and actions.
 *
 * @param {Object} data - The entity data object
 * @param {Object} config - List item configuration
 * @param {Object} config.avatar - Avatar configuration (same as CardTemplate)
 * @param {Object} config.title - Title field configuration
 * @param {string|Object} config.subtitle - Subtitle field configuration
 * @param {Object} config.status - Status badge configuration
 * @param {Array} config.primaryFields - Main content fields (left side)
 * @param {Array} config.secondaryFields - Secondary fields (right side)
 * @param {Object} config.sidebar - Optional sidebar configuration (like appointments date/time)
 * @param {Object} config.actions - Action configuration
 * @param {Function} onClick - Item click handler
 * @param {Function} onArchive - Archive handler
 * @param {Function} onDelete - Delete handler
 * @param {Function} onRestore - Restore handler
 * @param {boolean} isArchived - Whether item is archived
 */
const ListItemTemplate = React.memo(({
  data,
  config,
  onClick,
  onArchive,
  onDelete,
  onRestore,
  isArchived = false,
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenuOpen = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (event) => {
    event?.stopPropagation();
    setAnchorEl(null);
  };

  const handleAction = (event, action) => {
    event.stopPropagation();
    handleMenuClose();
    action?.();
  };

  // Resolve fields
  const title = config.title ? resolveField(data, config.title) : null;
  const subtitle = config.subtitle ? resolveField(data, config.subtitle) : null;

  // Status
  let statusValue, statusColor;
  if (config.status) {
    const statusField = resolveField(data, config.status.field);
    statusValue = statusField.formatted;
    statusColor = getStatusColor(data, config.status.colorMap, {
      statusFields: Array.isArray(config.status.field)
        ? config.status.field
        : [config.status.field]
    });
  }

  // Avatar
  let avatarContent;
  if (config.avatar) {
    const imageUrl = config.avatar.image
      ? resolveField(data, config.avatar.image).value
      : null;

    if (imageUrl) {
      avatarContent = <Avatar src={imageUrl} sx={{ width: 48, height: 48 }} />;
    } else if (config.avatar.field) {
      const initials = typeof config.avatar.field === 'string'
        ? getInitials(data, { firstNameFields: [config.avatar.field] })
        : getInitials(data, config.avatar.field);

      avatarContent = (
        <Avatar sx={{
          width: 48,
          height: 48,
          bgcolor: statusColor || theme.palette.primary.main,
          fontSize: '1rem',
          fontWeight: 600
        }}>
          {initials}
        </Avatar>
      );
    }
  }

  // Primary fields (main content area)
  const primaryFields = config.primaryFields?.map((fieldConfig, index) => {
    const field = resolveField(data, fieldConfig);
    return (
      <Box key={index} sx={{ minWidth: 0 }}>
        {fieldConfig.label && (
          <Typography variant="caption" color="text.secondary" display="block">
            {fieldConfig.label}
          </Typography>
        )}
        <Typography
          variant="body2"
          sx={{
            fontWeight: fieldConfig.bold ? 600 : 400,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {field.formatted}
        </Typography>
      </Box>
    );
  });

  // Secondary fields (right side metadata)
  const secondaryFields = config.secondaryFields?.map((fieldConfig, index) => {
    const field = resolveField(data, fieldConfig);
    return (
      <Box key={index} sx={{ textAlign: 'right' }}>
        {fieldConfig.label && (
          <Typography variant="caption" color="text.secondary" display="block">
            {fieldConfig.label}
          </Typography>
        )}
        <Typography
          variant="body2"
          sx={{
            fontWeight: fieldConfig.bold ? 600 : 400,
          }}
        >
          {field.formatted}
        </Typography>
      </Box>
    );
  });

  // Sidebar (for special left-side content like appointment date/time)
  let sidebarContent;
  if (config.sidebar) {
    const sidebarFields = config.sidebar.fields?.map((fieldConfig, index) => {
      const field = resolveField(data, fieldConfig);
      return (
        <Box key={index} sx={{ textAlign: 'center' }}>
          {fieldConfig.icon && (
            <Box sx={{ mb: 0.5 }}>
              {/* Icon would be rendered here */}
            </Box>
          )}
          <Typography
            variant={fieldConfig.variant || 'body2'}
            sx={{
              fontWeight: fieldConfig.bold ? 700 : 400,
              fontSize: fieldConfig.fontSize || undefined,
            }}
          >
            {field.formatted}
          </Typography>
        </Box>
      );
    });

    sidebarContent = (
      <Box
        sx={{
          width: config.sidebar.width || 120,
          background: config.sidebar.gradient
            ? `linear-gradient(135deg, ${statusColor} 0%, ${alpha(statusColor, 0.8)} 100%)`
            : statusColor || theme.palette.primary.main,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          padding: 2,
        }}
      >
        {sidebarFields}
      </Box>
    );
  }

  return (
    <Paper
      sx={{
        mb: 1.5,
        display: 'flex',
        transition: 'all 0.2s',
        cursor: onClick ? 'pointer' : 'default',
        opacity: isArchived ? 0.6 : 1,
        overflow: 'hidden',
        '&:hover': onClick ? {
          boxShadow: 3,
          transform: 'translateX(4px)',
        } : {},
      }}
      onClick={onClick}
    >
      {/* Sidebar (if configured) */}
      {sidebarContent}

      {/* Main Content */}
      <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, p: 2, minWidth: 0 }}>
        {/* Avatar */}
        {avatarContent && (
          <Box sx={{ mr: 2, flexShrink: 0 }}>
            {avatarContent}
          </Box>
        )}

        {/* Title + Subtitle */}
        <Box sx={{ flexGrow: 1, minWidth: 0, mr: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            {title && (
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 600,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {title.formatted}
              </Typography>
            )}
            {statusValue && (
              <Chip
                label={statusValue}
                size="small"
                sx={{
                  backgroundColor: statusColor,
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '0.7rem',
                  height: 20,
                }}
              />
            )}
          </Box>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {subtitle.formatted}
            </Typography>
          )}

          {/* Primary Fields */}
          {primaryFields && primaryFields.length > 0 && (
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              {primaryFields}
            </Box>
          )}
        </Box>

        {/* Secondary Fields */}
        {secondaryFields && secondaryFields.length > 0 && (
          <Box sx={{ display: 'flex', gap: 2, flexShrink: 0 }}>
            {secondaryFields}
          </Box>
        )}

        {/* Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 1, flexShrink: 0 }}>
          {onClick && (
            <IconButton size="small" sx={{ color: 'text.secondary' }}>
              <ChevronRightIcon />
            </IconButton>
          )}

          {config.actions && (
            <>
              <IconButton
                size="small"
                onClick={handleMenuOpen}
                sx={{ color: 'text.secondary' }}
              >
                <MoreVertIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                onClick={(e) => e.stopPropagation()}
              >
                {config.actions.view && (
                  <MenuItem onClick={(e) => handleAction(e, onClick)}>
                    <VisibilityIcon sx={{ mr: 1, fontSize: 18 }} />
                    View Details
                  </MenuItem>
                )}
                {isArchived ? (
                  config.actions.restore && onRestore && (
                    <MenuItem onClick={(e) => handleAction(e, () => onRestore(data))}>
                      <UnarchiveIcon sx={{ mr: 1, fontSize: 18 }} />
                      Restore
                    </MenuItem>
                  )
                ) : (
                  config.actions.archive && onArchive && (
                    <MenuItem onClick={(e) => handleAction(e, () => onArchive(data))}>
                      <ArchiveIcon sx={{ mr: 1, fontSize: 18 }} />
                      Archive
                    </MenuItem>
                  )
                )}
                {config.actions.delete && onDelete && (
                  <MenuItem
                    onClick={(e) => handleAction(e, () => onDelete(data))}
                    sx={{ color: 'error.main' }}
                  >
                    <DeleteIcon sx={{ mr: 1, fontSize: 18 }} />
                    Delete
                  </MenuItem>
                )}
              </Menu>
            </>
          )}
        </Box>
      </Box>
    </Paper>
  );
});

ListItemTemplate.displayName = 'ListItemTemplate';

export default ListItemTemplate;
