import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Chip,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  LinearProgress,
  Checkbox,
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
  VisibilityOff as VisibilityOffIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import {
  resolveField,
  getInitials,
  getStatusColor,
} from '../../lib/utils/fieldRenderers';

/**
 * ListItemTemplate - Fully featured horizontal list item with editing
 *
 * Standard template for ALL dashboard list views with complete inline editing support.
 * Designed to match EscrowListItem's functionality while being config-driven.
 *
 * Layout: [Image] [Content Area with editable fields] [Actions]
 *
 * @param {Object} data - The entity data object
 * @param {Object} config - List item configuration
 *
 * @param {Object} config.image - Image/left section configuration
 * @param {Function|string} config.image.source - Image URL or function(data) => url
 * @param {string} config.image.fallbackIcon - Icon component for no image
 * @param {number} config.image.width - Image width in pixels (default: 200)
 *
 * @param {Object} config.progress - Progress bar overlay on image
 * @param {Function} config.progress.getValue - function(data) => percentage (0-100)
 * @param {Function} config.progress.getColor - function(data) => color
 *
 * @param {Object} config.status - Status chip configuration
 * @param {string|Function} config.status.field - Field path or function(data) => status
 * @param {Function} config.status.getConfig - function(status) => { label, color, bg }
 * @param {boolean} config.status.editable - If true, clicking opens menu
 * @param {Array} config.status.options - Status options for menu
 *
 * @param {Object} config.title - Main title configuration
 * @param {string|Function} config.title.field - Field path or function(data) => title
 * @param {boolean} config.title.editable - Click to edit
 * @param {Component} config.title.editor - Editor modal component
 * @param {Function} config.title.onSave - function(data, newValue) => updateObject
 *
 * @param {Object} config.subtitle - Subtitle configuration
 * @param {Function} config.subtitle.formatter - function(data) => formatted string
 *
 * @param {Array} config.metrics - Horizontal metric fields
 * [{
 *   label: string,
 *   field: string|Function,
 *   formatter: function(value, data) => formatted,
 *   editable: boolean,
 *   editor: Component,
 *   onSave: function(data, newValue) => updateObject,
 *   toggle: { maskFn, icon }  // Optional
 * }]
 *
 * @param {Function} onClick - Item click handler
 * @param {Function} onUpdate - Update handler: function(id, updates) => Promise
 * @param {Function} onArchive - Archive handler
 * @param {Function} onDelete - Delete handler
 * @param {Function} onRestore - Restore handler
 * @param {boolean} isArchived - Whether item is archived
 */
const ListItemTemplate = React.memo(({
  data,
  config,
  onClick,
  onUpdate,
  onArchive,
  onDelete,
  onRestore,
  isArchived = false,
  // Multi-select props
  isSelectable = false,
  isSelected = false,
  onSelect,
}) => {
  const theme = useTheme();

  // Modal states
  const [openEditors, setOpenEditors] = useState({});
  const [toggleStates, setToggleStates] = useState({});

  // Status menu state
  const [statusMenuAnchor, setStatusMenuAnchor] = useState(null);

  // Click vs drag detection
  const [isDragging, setIsDragging] = useState(false);
  const [mouseDownPos, setMouseDownPos] = useState(null);

  // Handle row click - only navigate if not dragging
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
  const handleStatusClick = useCallback((e) => {
    e.stopPropagation();
    if (config.status?.editable && onUpdate) {
      setStatusMenuAnchor(e.currentTarget);
    }
  }, [config.status, onUpdate]);

  const handleStatusClose = useCallback(() => {
    setStatusMenuAnchor(null);
  }, []);

  const handleStatusChange = useCallback(async (newStatus) => {
    if (onUpdate && config.status?.onSave) {
      try {
        const updates = config.status.onSave(data, newStatus);
        await onUpdate(data.id, updates);
      } catch (error) {
        console.error('Failed to update status:', error);
      }
    }
    handleStatusClose();
  }, [data, config.status, onUpdate, handleStatusClose]);

  // Resolve image source
  const imageSource = typeof config.image?.source === 'function'
    ? config.image.source(data)
    : config.image?.source;

  // Resolve status
  const statusValue = typeof config.status?.field === 'function'
    ? config.status.field(data)
    : resolveField(data, config.status?.field)?.raw;

  const statusConfig = config.status?.getConfig?.(statusValue) || {};

  // Resolve title
  const titleValue = typeof config.title?.field === 'function'
    ? config.title.field(data)
    : resolveField(data, config.title?.field)?.formatted;

  // Resolve subtitle
  const subtitleValue = config.subtitle?.formatter ? config.subtitle.formatter(data) : '';

  // Resolve progress
  const progressValue = config.progress?.getValue ? config.progress.getValue(data) : 0;
  const progressColor = config.progress?.getColor ? config.progress.getColor(data) : statusConfig.bg;

  return (
    <>
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
          border: statusConfig.color ? `1px solid ${alpha(statusConfig.color, 0.15)}` : `1px solid ${alpha(theme.palette.divider, 0.15)}`,
          boxShadow: statusConfig.color ? `0 4px 16px ${alpha(statusConfig.color, 0.08)}` : 2,
          transition: 'all 0.2s',
          mb: 1.5,
          '&:hover': {
            boxShadow: statusConfig.color ? `0 6px 24px ${alpha(statusConfig.color, 0.15)}` : 4,
            transform: 'translateY(-2px)',
          },
        }}
      >
        {/* Multi-Select Checkbox - Left Side (appears on hover) */}
        {isSelectable && (
          <Box
            sx={{
              position: 'absolute',
              left: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 4,
              opacity: isSelected ? 1 : 0,
              transition: 'opacity 0.2s',
              'Box:hover &': { opacity: 1 },
            }}
          >
            <Checkbox
              checked={isSelected}
              onChange={(e) => {
                e.stopPropagation();
                onSelect?.(data);
              }}
              onClick={(e) => e.stopPropagation()}
              sx={{
                backgroundColor: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: '4px',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,1)',
                },
                '& .MuiSvgIcon-root': {
                  fontSize: 20,
                },
              }}
            />
          </Box>
        )}

        {/* Image Section */}
        {config.image && (
          <Box
            sx={{
              width: config.image.width || 200,
              minWidth: config.image.width || 200,
              position: 'relative',
              background: imageSource
                ? `url(${imageSource})`
                : 'linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              ml: isSelectable ? 5 : 0, // Shift right if checkbox present
              transition: 'margin-left 0.2s',
            }}
          >
            {!imageSource && config.image.fallbackIcon && (
              <Box component={config.image.fallbackIcon} sx={{ fontSize: 60, color: alpha('#757575', 0.5) }} />
            )}

            {/* Progress Overlay */}
            {config.progress && (
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 6,
                  backgroundColor: 'rgba(0,0,0,0.3)',
                }}
              >
                <Box
                  sx={{
                    height: '100%',
                    width: `${progressValue}%`,
                    background: progressColor,
                    transition: 'width 0.5s ease-in-out',
                  }}
                />
              </Box>
            )}

            {/* Quick Actions on Image */}
            {(onArchive || onDelete || onRestore) && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  opacity: 0,
                  transition: 'opacity 0.2s',
                  '&:hover': { opacity: 1 },
                  'Box:hover &': { opacity: 1 },
                }}
              >
                {/* QuickActionsMenu would go here */}
              </Box>
            )}
          </Box>
        )}

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
            <Box
              onClick={(e) => {
                if (config.title?.editable && onUpdate) {
                  e.stopPropagation();
                  openEditor('title');
                }
              }}
              sx={{
                flex: 1,
                minWidth: 0,
                cursor: config.title?.editable && onUpdate ? 'pointer' : 'default',
                transition: 'all 0.2s',
                borderRadius: 1,
                px: 1,
                py: 0.5,
                mx: -1,
                '&:hover': config.title?.editable && onUpdate ? {
                  backgroundColor: 'action.hover',
                } : {},
              }}
            >
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
                {titleValue}
              </Typography>
            </Box>

            {config.status && (
              <Chip
                label={statusConfig.label || statusValue}
                size="small"
                onClick={handleStatusClick}
                sx={{
                  fontWeight: 700,
                  fontSize: 11,
                  ml: 2,
                  background: statusConfig.bg,
                  color: 'white',
                  cursor: config.status.editable && onUpdate ? 'pointer' : 'default',
                  '&:hover': config.status.editable && onUpdate ? {
                    transform: 'scale(1.05)',
                  } : {},
                }}
              />
            )}
          </Box>

          {/* Subtitle/Location */}
          {subtitleValue && (
            <Typography
              variant="body2"
              sx={{
                color: theme.palette.text.secondary,
                mb: 2,
                fontSize: '0.875rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {subtitleValue}
            </Typography>
          )}

          {/* Metrics Row */}
          {config.metrics && config.metrics.length > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mt: 'auto' }}>
              {config.metrics.map((metric, idx) => {
                const metricValue = typeof metric.field === 'function'
                  ? metric.field(data)
                  : resolveField(data, metric.field)?.raw;

                const formattedValue = metric.formatter
                  ? metric.formatter(metricValue, data)
                  : metricValue;

                const isToggled = toggleStates[`metric_${idx}`];
                const displayValue = metric.toggle && !isToggled
                  ? metric.toggle.maskFn(metricValue)
                  : formattedValue;

                return (
                  <Box
                    key={idx}
                    onClick={(e) => {
                      if (metric.editable && onUpdate && !isDragging) {
                        e.stopPropagation();
                        openEditor(`metric_${idx}`);
                      }
                    }}
                    sx={{
                      cursor: metric.editable && onUpdate ? 'pointer' : 'default',
                      transition: 'all 0.2s',
                      borderRadius: 1,
                      px: 1,
                      py: 0.5,
                      mx: -1,
                      '&:hover': metric.editable && onUpdate ? {
                        backgroundColor: 'action.hover',
                      } : {},
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: 10,
                        fontWeight: 600,
                        color: theme.palette.text.secondary,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {metric.label}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {metric.toggle && (
                        <IconButton
                          size="small"
                          onClick={(e) => handleToggle(`metric_${idx}`, e)}
                          sx={{ p: 0.25 }}
                        >
                          {isToggled ? (
                            <VisibilityOffIcon sx={{ fontSize: 14 }} />
                          ) : (
                            <VisibilityIcon sx={{ fontSize: 14 }} />
                          )}
                        </IconButton>
                      )}
                      <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '0.95rem', whiteSpace: 'nowrap' }}>
                        {displayValue}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>
      </Box>

      {/* Editor Modals */}
      {config.title?.editor && (
        <config.title.editor
          open={openEditors.title || false}
          onClose={() => closeEditor('title')}
          onSave={async (newValue) => {
            if (onUpdate && config.title.onSave) {
              const updates = config.title.onSave(data, newValue);
              await onUpdate(data.id, updates);
            }
            closeEditor('title');
          }}
          value={titleValue}
          data={data}
        />
      )}

      {config.metrics?.map((metric, idx) => {
        if (!metric.editor) return null;

        // Use custom editorProps if provided, otherwise default props
        const editorProps = metric.editorProps
          ? metric.editorProps(data)
          : {
              value: typeof metric.field === 'function' ? metric.field(data) : resolveField(data, metric.field)?.raw,
              data: data,
            };

        return (
          <metric.editor
            key={`metric_${idx}`}
            open={openEditors[`metric_${idx}`] || false}
            onClose={() => closeEditor(`metric_${idx}`)}
            onSave={async (newValue) => {
              if (onUpdate && metric.onSave) {
                const updates = metric.onSave(data, newValue);
                await onUpdate(data.id, updates);
              }
              closeEditor(`metric_${idx}`);
            }}
            {...editorProps}
          />
        );
      })}

      {/* Status Change Menu */}
      {config.status?.editable && config.status?.options && (
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
          {config.status.options.map((option) => (
            <MenuItem
              key={option.value}
              onClick={() => handleStatusChange(option.value)}
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
    </>
  );
});

ListItemTemplate.displayName = 'ListItemTemplate';

export default ListItemTemplate;
