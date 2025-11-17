import React, { useState, useCallback } from 'react';
import {
  TableRow,
  TableCell,
  Chip,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
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
  VisibilityOff as VisibilityOffIcon,
  CheckCircle,
  Cancel,
} from '@mui/icons-material';
import {
  resolveField,
  getInitials,
  getStatusColor,
} from '../utils/fieldRenderers';

/**
 * TableRowTemplate - Fully featured table row with editing
 *
 * Standard template for ALL dashboard table views with complete inline editing support.
 * Designed to match EscrowTableRow's functionality while being config-driven.
 *
 * Grid-based layout: Multiple columns defined by config.columns[]
 *
 * @param {Object} data - The entity data object
 * @param {Object} config - Table row configuration
 *
 * @param {Array} config.columns - Column configurations
 * [{
 *   label: string,
 *   field: string|Function,
 *   formatter: function(value, data) => formatted,
 *   align: 'left'|'center'|'right',
 *   width: string (e.g., '2fr', '1fr', '100px'),
 *   editable: boolean,
 *   editor: Component,
 *   editorProps: function(data) => props object,
 *   onSave: function(data, newValue) => updateObject,
 *   toggle: { maskFn, icon },  // Optional
 *   isStatus: boolean,  // Render as status chip
 *   statusOptions: Array,  // For editable status
 * }]
 *
 * @param {string} config.gridTemplateColumns - CSS grid template (e.g., '2fr 1fr 1fr 80px')
 * @param {Object} config.statusConfig - Optional status config for row highlighting
 * @param {Function} config.statusConfig.getConfig - function(data) => { color, bg }
 *
 * @param {Function} onClick - Row click handler
 * @param {Function} onUpdate - Update handler: function(id, updates) => Promise
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
  onUpdate,
  onArchive,
  onDelete,
  onRestore,
  isArchived = false,
  hover = true,
}) => {
  const theme = useTheme();

  // Modal states
  const [openEditors, setOpenEditors] = useState({});
  const [toggleStates, setToggleStates] = useState({});

  // Actions menu state
  const [anchorEl, setAnchorEl] = useState(null);

  // Status menu state
  const [statusMenuAnchor, setStatusMenuAnchor] = useState(null);

  // Click vs drag detection
  const [isDragging, setIsDragging] = useState(false);
  const [mouseDownPos, setMouseDownPos] = useState(null);

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
    if (!isDragging && onClick) {
      onClick(data);
    }
    setMouseDownPos(null);
  }, [isDragging, onClick, data]);

  // Editor modal handlers
  const openEditor = useCallback((editorKey) => {
    setOpenEditors(prev => ({ ...prev, [editorKey]: true }));
  }, []);

  const closeEditor = useCallback((editorKey) => {
    setOpenEditors(prev => ({ ...prev, [editorKey]: false }));
  }, []);

  // Toggle handler
  const handleToggle = useCallback((toggleKey, e) => {
    e?.stopPropagation();
    setToggleStates(prev => ({ ...prev, [toggleKey]: !prev[toggleKey] }));
  }, []);

  // Status menu handlers
  const handleStatusClick = useCallback((e, column) => {
    e.stopPropagation();
    if (column.editable && column.statusOptions && onUpdate) {
      setStatusMenuAnchor(e.currentTarget);
    }
  }, [onUpdate]);

  const handleStatusClose = useCallback(() => {
    setStatusMenuAnchor(null);
  }, []);

  const handleStatusChange = useCallback(async (column, newStatus) => {
    if (onUpdate && column.onSave) {
      try {
        const updates = column.onSave(data, newStatus);
        await onUpdate(data.id, updates);
      } catch (error) {
        console.error('Failed to update status:', error);
      }
    }
    handleStatusClose();
  }, [data, onUpdate, handleStatusClose]);

  // Resolve status config for row styling
  const statusConfig = config.statusConfig?.getConfig
    ? config.statusConfig.getConfig(data)
    : { color: theme.palette.primary.main, bg: alpha(theme.palette.primary.main, 0.1) };

  return (
    <>
      <Box
        onMouseDown={handleRowMouseDown}
        onMouseMove={handleRowMouseMove}
        onClick={handleRowClick}
        sx={{
          display: 'grid',
          gridTemplateColumns: config.gridTemplateColumns || 'repeat(auto-fit, minmax(0, 1fr)) 80px',
          gap: 2,
          alignItems: 'center',
          width: '100%',
          minHeight: 60,
          px: 2,
          py: 1.5,
          borderRadius: 2,
          cursor: onClick ? 'pointer' : 'default',
          position: 'relative',
          bgcolor: 'background.paper',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          transition: 'all 0.2s',
          opacity: isArchived ? 0.6 : 1,
          mb: 1,
          '&:hover': hover ? {
            bgcolor: alpha(statusConfig.color, 0.03),
            border: `1px solid ${alpha(statusConfig.color, 0.2)}`,
            boxShadow: `0 2px 8px ${alpha(statusConfig.color, 0.1)}`,
          } : {},
        }}
      >
        {/* Render columns */}
        {config.columns?.map((column, idx) => {
          const columnValue = typeof column.field === 'function'
            ? column.field(data)
            : resolveField(data, column.field)?.raw;

          const formattedValue = column.formatter
            ? column.formatter(columnValue, data)
            : columnValue;

          // Toggle logic
          const isToggled = toggleStates[`column_${idx}`];
          const displayValue = column.toggle && !isToggled
            ? column.toggle.maskFn(columnValue)
            : formattedValue;

          // Status chip rendering
          if (column.isStatus) {
            return (
              <Box key={idx} sx={{ textAlign: column.align || 'left' }}>
                <Chip
                  label={formattedValue}
                  size="small"
                  onClick={(e) => handleStatusClick(e, column)}
                  sx={{
                    fontWeight: 600,
                    fontSize: 10,
                    height: 24,
                    background: statusConfig.bg,
                    color: 'white',
                    cursor: column.editable && column.statusOptions && onUpdate ? 'pointer' : 'default',
                    '&:hover': column.editable && column.statusOptions && onUpdate ? {
                      transform: 'scale(1.05)',
                    } : {},
                  }}
                />
              </Box>
            );
          }

          // Editable cell rendering
          return (
            <Box
              key={idx}
              onClick={(e) => {
                if (column.editable && onUpdate && !isDragging) {
                  e.stopPropagation();
                  openEditor(`column_${idx}`);
                }
              }}
              sx={{
                minWidth: 0,
                textAlign: column.align || 'left',
                cursor: column.editable && onUpdate ? 'pointer' : 'default',
                transition: 'all 0.2s',
                borderRadius: 1,
                px: 1,
                py: 0.5,
                mx: -1,
                '&:hover': column.editable && onUpdate ? {
                  backgroundColor: column.hoverColor || 'action.hover',
                } : {},
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: column.align || 'flex-start' }}>
                {column.toggle && (
                  <IconButton
                    onClick={(e) => handleToggle(`column_${idx}`, e)}
                    sx={{ width: 20, height: 20, p: 0 }}
                  >
                    {isToggled ? (
                      <VisibilityOffIcon sx={{ fontSize: 14 }} />
                    ) : (
                      <VisibilityIcon sx={{ fontSize: 14 }} />
                    )}
                  </IconButton>
                )}
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: column.bold ? 700 : 600,
                    fontSize: column.fontSize || '0.875rem',
                    color: column.color || theme.palette.text.primary,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {displayValue}
                </Typography>
              </Box>
              {column.subtitle && (
                <Typography
                  variant="caption"
                  sx={{
                    color: theme.palette.text.secondary,
                    fontSize: '0.75rem',
                    display: 'block',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {typeof column.subtitle === 'function' ? column.subtitle(data) : resolveField(data, column.subtitle)?.formatted}
                </Typography>
              )}
            </Box>
          );
        })}

        {/* Actions Menu */}
        {(onArchive || onDelete || onRestore) && (
          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
            <IconButton
              size="small"
              onClick={handleMenuOpen}
              sx={{ color: 'text.secondary' }}
            >
              <MoreVertIcon />
            </IconButton>
          </Box>
        )}
      </Box>

      {/* Editor Modals */}
      {config.columns?.map((column, idx) => {
        if (!column.editor) return null;

        // Use custom editorProps if provided, otherwise default props
        const editorProps = column.editorProps
          ? column.editorProps(data)
          : {
              value: typeof column.field === 'function' ? column.field(data) : resolveField(data, column.field)?.raw,
              data: data,
            };

        return (
          <column.editor
            key={`column_${idx}`}
            open={openEditors[`column_${idx}`] || false}
            onClose={() => closeEditor(`column_${idx}`)}
            onSave={async (newValue) => {
              if (onUpdate && column.onSave) {
                const updates = column.onSave(data, newValue);
                await onUpdate(data.id, updates);
              }
              closeEditor(`column_${idx}`);
            }}
            {...editorProps}
          />
        );
      })}

      {/* Status Change Menu */}
      {config.columns?.find(c => c.isStatus && c.editable && c.statusOptions) && (
        <Menu
          anchorEl={statusMenuAnchor}
          open={Boolean(statusMenuAnchor)}
          onClose={handleStatusClose}
          PaperProps={{
            sx: {
              borderRadius: 2,
              mt: 1,
              minWidth: 180,
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            },
          }}
        >
          {config.columns
            .find(c => c.isStatus && c.editable && c.statusOptions)
            ?.statusOptions.map((option) => (
              <MenuItem
                key={option.value}
                onClick={() => {
                  const column = config.columns.find(c => c.isStatus && c.editable && c.statusOptions);
                  handleStatusChange(column, option.value);
                }}
                sx={{
                  '&:hover': { background: alpha(option.color, 0.1) },
                }}
              >
                <ListItemIcon>
                  <Box component={option.icon} sx={{ color: option.color }} />
                </ListItemIcon>
                <ListItemText primary={option.label} />
              </MenuItem>
            ))}
        </Menu>
      )}

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
        PaperProps={{
          sx: {
            borderRadius: 2,
            mt: 1,
            minWidth: 160,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          },
        }}
      >
        {onClick && (
          <MenuItem onClick={(e) => handleAction(e, () => onClick(data))}>
            <ListItemIcon>
              <VisibilityIcon sx={{ fontSize: 18 }} />
            </ListItemIcon>
            <ListItemText primary="View Details" />
          </MenuItem>
        )}
        {isArchived ? (
          onRestore && (
            <MenuItem onClick={(e) => handleAction(e, () => onRestore(data))}>
              <ListItemIcon>
                <UnarchiveIcon sx={{ fontSize: 18 }} />
              </ListItemIcon>
              <ListItemText primary="Restore" />
            </MenuItem>
          )
        ) : (
          onArchive && (
            <MenuItem onClick={(e) => handleAction(e, () => onArchive(data))}>
              <ListItemIcon>
                <ArchiveIcon sx={{ fontSize: 18 }} />
              </ListItemIcon>
              <ListItemText primary="Archive" />
            </MenuItem>
          )
        )}
        {onDelete && (
          <MenuItem
            onClick={(e) => handleAction(e, () => onDelete(data))}
            sx={{ color: 'error.main' }}
          >
            <ListItemIcon>
              <DeleteIcon sx={{ fontSize: 18, color: 'error.main' }} />
            </ListItemIcon>
            <ListItemText primary="Delete" />
          </MenuItem>
        )}
      </Menu>
    </>
  );
});

TableRowTemplate.displayName = 'TableRowTemplate';

export default TableRowTemplate;
