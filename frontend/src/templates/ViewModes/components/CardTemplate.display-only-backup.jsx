import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Avatar,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  alpha,
  useTheme,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Archive as ArchiveIcon,
  Unarchive as UnarchiveIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import {
  resolveField,
  buildFullName,
  getInitials,
  getStatusColor,
} from '../utils/fieldRenderers';

/**
 * CardTemplate - Generic card component for all dashboard view modes
 *
 * Eliminates duplicate code across Client/Lead/Listing/Appointment/Escrow cards
 * by using configuration-driven field mapping.
 *
 * @param {Object} data - The entity data object
 * @param {Object} config - Card configuration
 * @param {Object} config.avatar - Avatar configuration
 * @param {string|Object} config.avatar.field - Name field or custom config
 * @param {string} config.avatar.image - Image field path
 * @param {string} config.avatar.fallback - Fallback icon name
 * @param {Object} config.title - Title field configuration
 * @param {string|Object} config.subtitle - Subtitle field configuration
 * @param {Object} config.status - Status badge configuration
 * @param {string|Object} config.status.field - Status field path
 * @param {Object} config.status.colorMap - Status to color mapping
 * @param {Array} config.metrics - Array of metric field configs
 * @param {Array} config.footer - Array of footer field configs
 * @param {Object} config.actions - Action configuration
 * @param {Function} onClick - Card click handler
 * @param {Function} onArchive - Archive handler
 * @param {Function} onDelete - Delete handler
 * @param {Function} onRestore - Restore handler
 * @param {boolean} isArchived - Whether item is archived
 */
const CardTemplate = React.memo(({
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

  // Resolve all fields from config
  const title = config.title ? resolveField(data, config.title) : null;
  const subtitle = config.subtitle ? resolveField(data, config.subtitle) : null;

  // Status badge
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
      avatarContent = <Avatar src={imageUrl} sx={{ width: 56, height: 56 }} />;
    } else if (config.avatar.field) {
      const initials = typeof config.avatar.field === 'string'
        ? getInitials(data, { firstNameFields: [config.avatar.field] })
        : getInitials(data, config.avatar.field);

      avatarContent = (
        <Avatar sx={{
          width: 56,
          height: 56,
          bgcolor: statusColor || theme.palette.primary.main,
          fontSize: '1.25rem',
          fontWeight: 600
        }}>
          {initials}
        </Avatar>
      );
    } else if (config.avatar.fallback) {
      avatarContent = (
        <Avatar sx={{
          width: 56,
          height: 56,
          bgcolor: alpha(statusColor || theme.palette.primary.main, 0.1),
          color: statusColor || theme.palette.primary.main
        }}>
          {/* Icon would be rendered here based on fallback name */}
          {config.avatar.fallback.charAt(0)}
        </Avatar>
      );
    }
  }

  // Metrics grid
  const metrics = config.metrics?.map((metricConfig, index) => {
    const metric = resolveField(data, metricConfig);
    return (
      <Grid item xs={6} key={index}>
        <Typography variant="caption" color="text.secondary" display="block">
          {metricConfig.label || ''}
        </Typography>
        <Typography variant="body2" fontWeight={600}>
          {metric.formatted}
        </Typography>
      </Grid>
    );
  });

  // Footer items
  const footerItems = config.footer?.map((footerConfig, index) => {
    const footerField = resolveField(data, footerConfig);
    return (
      <Box key={index}>
        <Typography variant="caption" color="text.secondary" display="block">
          {footerConfig.label || ''}
        </Typography>
        <Typography variant="body2">
          {footerField.formatted}
        </Typography>
      </Box>
    );
  });

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.2s',
        cursor: onClick ? 'pointer' : 'default',
        opacity: isArchived ? 0.6 : 1,
        '&:hover': onClick ? {
          boxShadow: 4,
          transform: 'translateY(-2px)',
        } : {},
      }}
      onClick={onClick}
    >
      <CardContent sx={{ flexGrow: 1, position: 'relative' }}>
        {/* Quick Actions Menu */}
        {config.actions && (
          <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
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
          </Box>
        )}

        {/* Header: Avatar + Title/Subtitle + Status */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
          {avatarContent && (
            <Box sx={{ mr: 2 }}>
              {avatarContent}
            </Box>
          )}

          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            {title && (
              <Typography
                variant="h6"
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
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle.formatted}
              </Typography>
            )}
          </Box>

          {statusValue && (
            <Chip
              label={statusValue}
              size="small"
              sx={{
                ml: 1,
                backgroundColor: statusColor,
                color: 'white',
                fontWeight: 600,
                fontSize: '0.7rem',
              }}
            />
          )}
        </Box>

        {/* Metrics Grid */}
        {metrics && metrics.length > 0 && (
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {metrics}
          </Grid>
        )}

        {/* Footer Items */}
        {footerItems && footerItems.length > 0 && (
          <Box
            sx={{
              mt: 2,
              pt: 2,
              borderTop: 1,
              borderColor: 'divider',
              display: 'flex',
              gap: 2,
              flexWrap: 'wrap'
            }}
          >
            {footerItems}
          </Box>
        )}
      </CardContent>
    </Card>
  );
});

CardTemplate.displayName = 'CardTemplate';

export default CardTemplate;
