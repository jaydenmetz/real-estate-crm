import React from 'react';
import {
  TableRow,
  TableCell,
  Chip,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Typography,
  useTheme,
  alpha,
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
  getInitials,
  getStatusColor,
} from '../utils/fieldRenderers';

/**
 * TableRowTemplate - Generic table row component
 *
 * Eliminates duplicate code across Client/Lead/Listing/Appointment/Escrow table views.
 * Provides a consistent table row layout with configurable columns.
 *
 * @param {Object} data - The entity data object
 * @param {Object} config - Table row configuration
 * @param {Object} config.avatar - Avatar configuration (optional, for first column)
 * @param {Array} config.columns - Array of column configurations
 * @param {Object} config.columns[].field - Field configuration (string or object)
 * @param {string} config.columns[].align - Column alignment ('left'|'center'|'right')
 * @param {number} config.columns[].width - Column width (optional)
 * @param {boolean} config.columns[].isStatus - Render as status chip
 * @param {Object} config.columns[].statusColorMap - Status color mapping (if isStatus)
 * @param {Object} config.status - Default status configuration for row styling
 * @param {Object} config.actions - Action configuration
 * @param {Function} onClick - Row click handler
 * @param {Function} onArchive - Archive handler
 * @param {Function} onDelete - Delete handler
 * @param {Function} onRestore - Restore handler
 * @param {boolean} isArchived - Whether item is archived
 * @param {boolean} hover - Enable hover effect (default: true)
 */
const TableRowTemplate = React.memo(({
  data,
  config,
  onClick,
  onArchive,
  onDelete,
  onRestore,
  isArchived = false,
  hover = true,
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

  // Get default status color for row highlighting
  let defaultStatusColor;
  if (config.status) {
    defaultStatusColor = getStatusColor(data, config.status.colorMap, {
      statusFields: Array.isArray(config.status.field)
        ? config.status.field
        : [config.status.field]
    });
  }

  // Avatar (if configured)
  let avatarContent;
  if (config.avatar) {
    const imageUrl = config.avatar.image
      ? resolveField(data, config.avatar.image).value
      : null;

    if (imageUrl) {
      avatarContent = <Avatar src={imageUrl} sx={{ width: 32, height: 32 }} />;
    } else if (config.avatar.field) {
      const initials = typeof config.avatar.field === 'string'
        ? getInitials(data, { firstNameFields: [config.avatar.field] })
        : getInitials(data, config.avatar.field);

      avatarContent = (
        <Avatar sx={{
          width: 32,
          height: 32,
          bgcolor: defaultStatusColor || theme.palette.primary.main,
          fontSize: '0.875rem',
          fontWeight: 600
        }}>
          {initials}
        </Avatar>
      );
    }
  }

  // Render columns
  const columnCells = config.columns?.map((columnConfig, index) => {
    const field = resolveField(data, columnConfig.field);
    const align = columnConfig.align || 'left';

    // Status chip rendering
    if (columnConfig.isStatus) {
      const statusColor = columnConfig.statusColorMap
        ? getStatusColor(data, columnConfig.statusColorMap, {
            statusFields: Array.isArray(columnConfig.field)
              ? columnConfig.field
              : [typeof columnConfig.field === 'string' ? columnConfig.field : columnConfig.field.field]
          })
        : defaultStatusColor;

      return (
        <TableCell key={index} align={align} width={columnConfig.width}>
          <Chip
            label={field.formatted}
            size="small"
            sx={{
              backgroundColor: statusColor,
              color: 'white',
              fontWeight: 600,
              fontSize: '0.7rem',
              height: 24,
            }}
          />
        </TableCell>
      );
    }

    // Special rendering for first column with avatar
    if (index === 0 && avatarContent) {
      return (
        <TableCell key={index} align={align} width={columnConfig.width}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {avatarContent}
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: columnConfig.bold ? 600 : 400,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {field.formatted}
              </Typography>
              {columnConfig.subtitle && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    display: 'block',
                  }}
                >
                  {resolveField(data, columnConfig.subtitle).formatted}
                </Typography>
              )}
            </Box>
          </Box>
        </TableCell>
      );
    }

    // Standard cell rendering
    return (
      <TableCell key={index} align={align} width={columnConfig.width}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: columnConfig.bold ? 600 : 400,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {field.formatted}
        </Typography>
      </TableCell>
    );
  });

  return (
    <TableRow
      hover={hover}
      onClick={onClick}
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        opacity: isArchived ? 0.6 : 1,
        '&:hover': hover && onClick ? {
          backgroundColor: alpha(defaultStatusColor || theme.palette.primary.main, 0.04),
        } : {},
        // Subtle left border with status color
        borderLeft: defaultStatusColor ? `3px solid ${defaultStatusColor}` : 'none',
      }}
    >
      {/* Columns */}
      {columnCells}

      {/* Actions Column */}
      {config.actions && (
        <TableCell align="right" width={60}>
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
        </TableCell>
      )}
    </TableRow>
  );
});

TableRowTemplate.displayName = 'TableRowTemplate';

export default TableRowTemplate;
