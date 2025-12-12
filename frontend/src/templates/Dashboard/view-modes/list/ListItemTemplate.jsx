import React, { useState, useCallback, useEffect } from 'react';
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
  CheckBox as CheckBoxIcon,
} from '@mui/icons-material';
import {
  resolveField,
  getInitials,
  getStatusColor,
} from '../../lib/utils/fieldRenderers';
import { decodeHTML } from '../../../../utils/htmlEntities';
import { usePrivacy } from '../../../../contexts/PrivacyContext';

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

  // Privacy context for master toggle
  let masterHidden = false;
  try {
    const privacy = usePrivacy();
    masterHidden = privacy?.masterHidden || false;
  } catch (e) {
    // Context not available (not wrapped in PrivacyProvider)
    // This is fine - just means no master toggle control
  }

  // Modal states
  const [openEditors, setOpenEditors] = useState({});
  const [toggleStates, setToggleStates] = useState({});

  // Sync individual toggle states when master toggle changes
  // This makes the stat card toggle act as a "bulk set" for all items
  // Only applies to metrics with toggle.privacyLinked: true
  useEffect(() => {
    const newToggleStates = {};
    config.metrics?.forEach((metric, idx) => {
      if (metric.toggle?.privacyLinked) {
        newToggleStates[`metric_${idx}`] = !masterHidden;
      }
    });
    setToggleStates(newToggleStates);
  }, [masterHidden, config.metrics]);

  // Status menu state
  const [statusMenuAnchor, setStatusMenuAnchor] = useState(null);

  // Quick actions menu state
  const [actionsMenuAnchor, setActionsMenuAnchor] = useState(null);

  // Resolve image source early so we can use it in useEffect
  const imageSource = typeof config.image?.source === 'function'
    ? config.image.source(data)
    : config.image?.source;

  // Image loading state - tracks if image failed to load
  const [imageError, setImageError] = useState(false);

  // Reset image error when imageSource changes
  useEffect(() => {
    setImageError(false);
  }, [imageSource]);

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

  // Quick actions menu handlers
  const handleActionsMenuOpen = useCallback((e) => {
    e.stopPropagation();
    setActionsMenuAnchor(e.currentTarget);
  }, []);

  const handleActionsMenuClose = useCallback((e) => {
    e?.stopPropagation();
    setActionsMenuAnchor(null);
  }, []);

  const handleAction = useCallback((e, action) => {
    e.stopPropagation();
    handleActionsMenuClose();
    if (action) action();
  }, [handleActionsMenuClose]);

  // Note: imageSource is resolved earlier (before useEffect that resets imageError)

  // Resolve status
  const statusValue = typeof config.status?.field === 'function'
    ? config.status.field(data)
    : resolveField(data, config.status?.field)?.raw;

  const statusConfig = config.status?.getConfig?.(statusValue) || {};

  // Resolve title (decode HTML entities like &amp; → &)
  const titleValue = decodeHTML(
    typeof config.title?.field === 'function'
      ? config.title.field(data)
      : resolveField(data, config.title?.field)?.formatted
  );

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
              background: 'linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            {/* Actual image element - hidden when error occurs */}
            {imageSource && !imageError && (
              <img
                src={imageSource}
                alt=""
                onError={() => setImageError(true)}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            )}
            {/* Fallback icon - shown when no image or image fails to load */}
            {(!imageSource || imageError) && config.image.fallbackIcon && (
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

              {/* Subtitle/Location - Now inside clickable title area */}
              {subtitleValue && (
                <Typography
                  variant="body2"
                  sx={{
                    color: theme.palette.text.secondary,
                    fontSize: '0.875rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    mt: 0.5,
                  }}
                >
                  {subtitleValue}
                </Typography>
              )}
            </Box>

            {/* Status Chip */}
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

            {/* Quick Actions Menu Button */}
            {(onArchive || onDelete || onRestore || onClick) && (
              <Box sx={{ ml: 1.5 }}>
                <IconButton
                  size="small"
                  onClick={handleActionsMenuOpen}
                  sx={{
                    color: 'text.secondary',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.08),
                    },
                  }}
                >
                  <MoreVertIcon />
                </IconButton>
                <Menu
                  anchorEl={actionsMenuAnchor}
                  open={Boolean(actionsMenuAnchor)}
                  onClose={handleActionsMenuClose}
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
                    <>
                      {onRestore && (
                        <MenuItem onClick={(e) => handleAction(e, () => onRestore(data))}>
                          <ListItemIcon>
                            <UnarchiveIcon sx={{ fontSize: 18 }} />
                          </ListItemIcon>
                          <ListItemText primary="Restore" />
                        </MenuItem>
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
                    </>
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
                </Menu>
              </Box>
            )}
          </Box>

          {/* Metrics Row */}
          {config.metrics && config.metrics.length > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mt: 1 }}>
              {config.metrics.map((metric, idx) => {
                const metricValue = typeof metric.field === 'function'
                  ? metric.field(data)
                  : resolveField(data, metric.field)?.raw;

                const formattedValue = metric.formatter
                  ? metric.formatter(metricValue, data)
                  : metricValue;

                // Toggle state: true = show value, false/undefined = mask value
                // Individual items are always independently controllable
                // Master toggle sets initial state for privacyLinked metrics only
                const defaultToggled = metric.toggle?.privacyLinked ? !masterHidden : true;
                const isToggled = toggleStates[`metric_${idx}`] ?? defaultToggled;
                const shouldMask = !isToggled; // Only individual toggle matters
                const displayValue = metric.toggle && shouldMask
                  ? metric.toggle.maskFn(metricValue)
                  : formattedValue;

                // Check if this metric has a custom renderer
                const hasCustomRenderer = !!metric.customRenderer;

                return (
                  <Box
                    key={idx}
                    onClick={(e) => {
                      // Custom renderers handle their own click events
                      if (!hasCustomRenderer && metric.editable && onUpdate && !isDragging) {
                        e.stopPropagation();
                        openEditor(`metric_${idx}`);
                      }
                    }}
                    sx={{
                      // All metrics get outer wrapper styling (including customRenderers)
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
                      {typeof metric.label === 'function' ? metric.label(data) : metric.label}
                    </Typography>
                    {/* For custom renderers, render directly without inner Box wrapper */}
                    {hasCustomRenderer ? (
                      metric.customRenderer(data, () => openEditor(`metric_${idx}`))
                    ) : (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {metric.toggle && (
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              // Always allow individual toggle
                              handleToggle(`metric_${idx}`, e);
                            }}
                            sx={{
                              p: 0.25,
                              cursor: 'pointer',
                            }}
                          >
                            {shouldMask ? (
                              <VisibilityIcon sx={{ fontSize: 14 }} />
                            ) : (
                              <VisibilityOffIcon sx={{ fontSize: 14 }} />
                            )}
                          </IconButton>
                        )}
                        <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '0.95rem', whiteSpace: 'nowrap' }}>
                          {displayValue}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                );
              })}
            </Box>
          )}

          {/* Footer Row (Lead Contacts, Attendees, etc.) */}
          {config.footer?.fields && config.footer.fields.length > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mt: 1.5, pt: 1.5, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
              {config.footer.fields.map((field, idx) => {
                const fieldValue = typeof field.field === 'function'
                  ? field.field(data)
                  : resolveField(data, field.field)?.raw;

                const formattedValue = field.formatter
                  ? field.formatter(fieldValue, data)
                  : fieldValue;

                const hasCustomRenderer = !!field.customRenderer;

                return (
                  <Box
                    key={`footer_${idx}`}
                    onClick={(e) => {
                      if (!hasCustomRenderer && field.editable && onUpdate && !isDragging) {
                        e.stopPropagation();
                        openEditor(`footer_${idx}`);
                      }
                    }}
                    sx={{
                      cursor: field.editable && onUpdate ? 'pointer' : 'default',
                      transition: 'all 0.2s',
                      borderRadius: 1,
                      px: 1,
                      py: 0.5,
                      mx: -1,
                      '&:hover': field.editable && onUpdate ? {
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
                        display: 'block',
                        mb: 0.5,
                      }}
                    >
                      {typeof field.label === 'function' ? field.label(data) : field.label}
                    </Typography>
                    {hasCustomRenderer ? (
                      field.customRenderer(data, () => openEditor(`footer_${idx}`))
                    ) : (
                      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                        {formattedValue}
                      </Typography>
                    )}
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

      {/* Footer Field Editor Modals */}
      {config.footer?.fields?.map((field, idx) => {
        if (!field.editor) return null;

        const editorProps = field.editorProps
          ? field.editorProps(data)
          : {
              value: typeof field.field === 'function' ? field.field(data) : resolveField(data, field.field)?.raw,
              data: data,
            };

        return (
          <field.editor
            key={`footer_${idx}`}
            open={openEditors[`footer_${idx}`] || false}
            onClose={() => closeEditor(`footer_${idx}`)}
            onSave={async (newValue) => {
              if (onUpdate && field.onSave) {
                const updates = field.onSave(data, newValue);
                await onUpdate(data.id, updates);
              }
              closeEditor(`footer_${idx}`);
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
