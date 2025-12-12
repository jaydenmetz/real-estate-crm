import React, { useState, useCallback, useEffect } from 'react';
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
  ListItemIcon,
  ListItemText,
  LinearProgress,
  alpha,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Archive as ArchiveIcon,
  Unarchive as UnarchiveIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import {
  resolveField,
  buildFullName,
  getInitials,
  getStatusColor,
} from '../../lib/utils/fieldRenderers';
import { decodeHTML } from '../../../../utils/htmlEntities';
import { usePrivacy } from '../../../../contexts/PrivacyContext';

/**
 * CardTemplate - Fully featured card component with editing capabilities
 *
 * Standard template for ALL dashboard cards with complete inline editing support.
 * Designed to match EscrowCard's functionality while being config-driven.
 *
 * @param {Object} data - The entity data object
 * @param {Object} config - Card configuration
 *
 * @param {Object} config.image - Image/header configuration
 * @param {Function|string} config.image.source - Image URL or function(data) => url
 * @param {string} config.image.fallbackIcon - Icon component name for no image
 * @param {string} config.image.aspectRatio - CSS aspect ratio (e.g., '3 / 2')
 *
 * @param {Object} config.status - Status chip configuration
 * @param {string|Function} config.status.field - Field path or function(data) => status
 * @param {Function} config.status.getConfig - function(status) => { label, color, bg }
 * @param {boolean} config.status.editable - If true, clicking opens status menu
 * @param {Array} config.status.options - Status options for menu [{ value, label, icon, color }]
 *
 * @param {Object} config.privacy - Privacy/access level chips
 * @param {string} config.privacy.field - Field path for access level
 * @param {Object} config.privacy.options - { private: {...}, team: {...}, broker: {...} }
 *
 * @param {Object} config.title - Main title configuration
 * @param {string|Function} config.title.field - Field path or function(data) => title
 * @param {boolean} config.title.editable - If true, click to edit
 * @param {Component} config.title.editor - Editor modal component
 * @param {Function} config.title.onSave - function(data, newValue) => updateObject
 *
 * @param {Object} config.subtitle - Subtitle configuration
 * @param {string|Function|Array} config.subtitle.fields - Field(s) to display
 * @param {Function} config.subtitle.formatter - function(data) => formatted string
 *
 * @param {Array} config.metrics - Metric badges configuration
 * [{
 *   label: string,
 *   field: string|Function,
 *   formatter: function(value, data) => formatted,
 *   color: { primary, secondary, bg },
 *   editable: boolean,
 *   editor: Component,
 *   onSave: function(data, newValue) => updateObject,
 *   toggle: { // Optional show/hide toggle
 *     maskFn: function(value) => masked,
 *     icon: { show: Component, hide: Component }
 *   }
 * }]
 *
 * @param {Object} config.footer - Footer configuration
 * @param {Array} config.footer.fields - Footer field configurations
 * [{
 *   label: string,
 *   field: string|Function,
 *   formatter: function(value, data) => formatted,
 *   editable: boolean,
 *   editor: Component,
 *   onSave: function(data, newValue) => updateObject
 * }]
 * @param {Object} config.footer.progress - Progress bar config
 * @param {string|Function} config.footer.progress.field - Progress value field
 * @param {Function} config.footer.progress.formatter - function(data) => { value, label, showBar }
 *
 * @param {Object} config.actions - Quick actions configuration
 * @param {string} config.actions.position - 'top-right' | 'bottom-right'
 *
 * @param {Function} onClick - Card click handler
 * @param {Function} onUpdate - Update handler: function(id, updates) => Promise
 * @param {Function} onArchive - Archive handler
 * @param {Function} onDelete - Delete handler
 * @param {Function} onRestore - Restore handler
 * @param {boolean} isArchived - Whether item is archived
 */
const CardTemplate = React.memo(({
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
  // Privacy toggle control
  disableMasterPrivacy = false, // Set to true in preview mode to disable global privacy toggle
}) => {
  const theme = useTheme();

  // Privacy context for master toggle
  let masterHidden = false;
  if (!disableMasterPrivacy) {
    try {
      const privacy = usePrivacy();
      masterHidden = privacy?.masterHidden || false;
    } catch (e) {
      // Context not available (not wrapped in PrivacyProvider)
      // This is fine - just means no master toggle control
    }
  }

  // Modal states - one state per potential editor
  const [openEditors, setOpenEditors] = useState({});
  const [toggleStates, setToggleStates] = useState({});

  // Status menu state
  const [statusMenuAnchor, setStatusMenuAnchor] = useState(null);

  // Quick actions menu state
  const [actionsMenuAnchor, setActionsMenuAnchor] = useState(null);

  // Reset toggle states when data changes (so updated values are shown, not masked)
  useEffect(() => {
    // Reset toggle states when data ID changes
    setToggleStates({});
  }, [data?.id]);

  // Sync individual toggle states when master toggle changes
  // This makes the stat card toggle act as a "bulk set" for all cards
  // Only applies to metrics with toggle.privacyLinked: true
  useEffect(() => {
    // Set all privacy-linked toggles to match the master state
    // masterHidden = true means hide, so we want isToggled = false (masked)
    // masterHidden = false means show, so we want isToggled = true (shown)
    const newToggleStates = {};
    config.metrics?.forEach((metric, idx) => {
      if (metric.toggle?.privacyLinked) {
        newToggleStates[`metric_${idx}`] = !masterHidden;
      }
    });
    setToggleStates(newToggleStates);
  }, [masterHidden, config.metrics]);

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

  // Click vs drag detection (for text selection)
  const [isDragging, setIsDragging] = useState(false);
  const [mouseDownPos, setMouseDownPos] = useState(null);

  // Handle card click - only navigate if not dragging (text selection)
  const handleCardMouseDown = useCallback((e) => {
    setMouseDownPos({ x: e.clientX, y: e.clientY });
    setIsDragging(false);
  }, []);

  const handleCardMouseMove = useCallback((e) => {
    if (mouseDownPos) {
      const distance = Math.sqrt(
        Math.pow(e.clientX - mouseDownPos.x, 2) + Math.pow(e.clientY - mouseDownPos.y, 2)
      );
      if (distance > 5) {
        setIsDragging(true);
      }
    }
  }, [mouseDownPos]);

  const handleCardClick = useCallback((e) => {
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

  // Toggle handler (for show/hide features like commission)
  const handleToggle = useCallback((toggleKey, e, metricIndex) => {
    e?.stopPropagation();
    const newToggleState = !toggleStates[toggleKey];
    setToggleStates(prev => ({ ...prev, [toggleKey]: newToggleState }));

    // If this is a commission toggle and we have an onUpdate callback, sync to parent
    if (onUpdate && metricIndex !== undefined && config.metrics?.[metricIndex]) {
      const metric = config.metrics[metricIndex];
      // Check if this metric has an onToggle handler
      if (metric.toggle?.onToggle) {
        const updates = metric.toggle.onToggle(data, newToggleState);
        onUpdate(updates);
      }
    }
  }, [toggleStates, onUpdate, config.metrics, data]);

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
    // Get current status value dynamically (can't use statusValue due to declaration order)
    const currentStatus = typeof config.status?.field === 'function'
      ? config.status.field(data)
      : data?.[config.status?.field];

    console.log('[CardTemplate] Status change requested:', {
      currentStatus,
      newStatus,
      dataId: data.id,
      fullData: data
    });

    if (onUpdate && config.status?.onSave) {
      try {
        const updates = config.status.onSave(data, newStatus);
        console.log('[CardTemplate] Calling onUpdate with:', { id: data.id, updates });
        await onUpdate(data.id, updates);
        console.log('[CardTemplate] onUpdate completed successfully');
      } catch (error) {
        console.error('[CardTemplate] Failed to update status:', error);
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
  let subtitleValue = '';
  if (config.subtitle) {
    if (config.subtitle.formatter) {
      subtitleValue = config.subtitle.formatter(data);
    } else if (Array.isArray(config.subtitle.fields)) {
      subtitleValue = config.subtitle.fields
        .map(f => resolveField(data, f)?.formatted)
        .filter(Boolean)
        .join(config.subtitle.separator || ', ');
    } else {
      subtitleValue = resolveField(data, config.subtitle.field)?.formatted;
    }
  }

  return (
    <>
      <Box sx={{ width: '320px', maxWidth: '320px', flexShrink: 0 }}>
        <Card
          onMouseDown={handleCardMouseDown}
          onMouseMove={handleCardMouseMove}
          onClick={handleCardClick}
          sx={{
            width: '100%',
            cursor: 'pointer',
            borderRadius: 4,
            overflow: 'hidden',
            position: 'relative',
            '&::before': statusConfig.color ? {
              content: '""',
              position: 'absolute',
              inset: -1,
              borderRadius: 4,
              padding: '1px',
              background: `linear-gradient(135deg, ${alpha(statusConfig.color, 0.2)}, ${alpha(statusConfig.color, 0.05)}, transparent)`,
              WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              WebkitMaskComposite: 'xor',
              maskComposite: 'exclude',
              pointerEvents: 'none',
            } : {},
            boxShadow: statusConfig.color
              ? `0 8px 32px ${alpha(statusConfig.color, 0.12)}, 0 2px 8px ${alpha(statusConfig.color, 0.08)}`
              : 3,
            '&:hover': {
              boxShadow: statusConfig.color
                ? `0 12px 48px ${alpha(statusConfig.color, 0.2)}, 0 4px 12px ${alpha(statusConfig.color, 0.15)}`
                : 6,
              transform: 'translateY(-2px)',
            },
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Image/Header Section */}
          {config.image && (
            <Box
              sx={{
                aspectRatio: config.image.aspectRatio || '3 / 2',
                width: '100%',
                position: 'relative',
                background: 'linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '50%',
                  background: 'linear-gradient(to top, rgba(0,0,0,0.4), transparent)',
                  zIndex: 2,
                },
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
                    zIndex: 1,
                  }}
                />
              )}
              {/* Fallback icon - shown when no image or image fails to load */}
              {(!imageSource || imageError) && config.image.fallbackIcon && (
                <Box component={config.image.fallbackIcon} sx={{ fontSize: 80, color: alpha('#757575', 0.5), zIndex: 1 }} />
              )}

              {/* Status Chip - Top Left */}
              {config.status && (
                <Chip
                  label={statusConfig.label || statusValue}
                  size="small"
                  onClick={handleStatusClick}
                  sx={{
                    position: 'absolute',
                    top: 10,
                    left: 10, // Checkbox is now outside card, no position adjustment needed
                    fontWeight: 700,
                    fontSize: 11,
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                    background: statusConfig.bg,
                    color: 'white',
                    border: '2px solid rgba(255,255,255,0.3)',
                    backdropFilter: 'blur(10px)',
                    zIndex: 3,
                    cursor: config.status.editable && onUpdate ? 'pointer' : 'default',
                    transition: 'all 0.2s',
                    '&:hover': config.status.editable && onUpdate ? {
                      transform: 'scale(1.05)',
                      boxShadow: `0 4px 12px ${alpha(statusConfig.color, 0.4)}`,
                    } : {},
                    '& .MuiChip-label': { px: 1.5, py: 0.5 },
                  }}
                />
              )}

              {/* Quick Actions - Top Right */}
              {(onArchive || onDelete || onRestore) && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    zIndex: 3,
                    opacity: 0,
                    transition: 'opacity 0.2s',
                    '&:hover': { opacity: 1 },
                    '.MuiCard-root:hover &': { opacity: 1 },
                  }}
                >
                  <IconButton
                    size="small"
                    onClick={handleActionsMenuOpen}
                    sx={{ color: 'text.secondary' }}
                  >
                    <MoreVertIcon />
                  </IconButton>
                  <Menu
                    anchorEl={actionsMenuAnchor}
                    open={Boolean(actionsMenuAnchor)}
                    onClose={handleActionsMenuClose}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {onClick && (
                      <MenuItem onClick={(e) => handleAction(e, () => onClick(data))}>
                        <VisibilityIcon sx={{ mr: 1, fontSize: 18 }} />
                        View Details
                      </MenuItem>
                    )}
                    {isArchived ? (
                      <>
                        {onRestore && (
                          <MenuItem onClick={(e) => handleAction(e, () => onRestore(data))}>
                            <UnarchiveIcon sx={{ mr: 1, fontSize: 18 }} />
                            Restore
                          </MenuItem>
                        )}
                        {onDelete && (
                          <MenuItem
                            onClick={(e) => handleAction(e, () => onDelete(data))}
                            sx={{ color: 'error.main' }}
                          >
                            <DeleteIcon sx={{ mr: 1, fontSize: 18 }} />
                            Delete
                          </MenuItem>
                        )}
                      </>
                    ) : (
                      onArchive && (
                        <MenuItem onClick={(e) => handleAction(e, () => onArchive(data))}>
                          <ArchiveIcon sx={{ mr: 1, fontSize: 18 }} />
                          Archive
                        </MenuItem>
                      )
                    )}
                  </Menu>
                </Box>
              )}

              {/* Privacy/Access Chips - Top Right (if no actions) */}
              {config.privacy && !onArchive && !onDelete && !onRestore && (
                <Box sx={{ position: 'absolute', top: 10, right: 10, zIndex: 3 }}>
                  {/* Privacy chips rendered based on config */}
                </Box>
              )}
            </Box>
          )}

          {/* Card Content */}
          <CardContent sx={{
            p: 1.25,
            '&:last-child': { pb: 1.25 },
            flex: 1,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            {/* Title + Subtitle - Always combined in single hover container */}
            {config.title && (
              <Box sx={{ mb: 1 }}>
                <Box
                  onClick={(e) => {
                    if (config.title.editable && onUpdate) {
                      e.stopPropagation();
                      openEditor('title');
                    }
                  }}
                  sx={{
                    cursor: config.title.editable && onUpdate ? 'pointer' : 'default',
                    transition: 'all 0.2s',
                    borderRadius: 1,
                    px: 0.5,
                    py: 0.25,
                    '&:hover': config.title.editable && onUpdate ? {
                      backgroundColor: 'action.hover',
                    } : {},
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 800,
                      fontSize: '0.9rem',
                      color: theme.palette.text.primary,
                      lineHeight: 1.2,
                    }}
                  >
                    {titleValue}
                  </Typography>
                  {subtitleValue && (
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: '0.7rem',
                        color: theme.palette.text.secondary,
                        lineHeight: 1.3,
                        display: 'block',
                        mt: 0.25,
                      }}
                    >
                      {subtitleValue}
                    </Typography>
                  )}
                </Box>
              </Box>
            )}

            {/* Metrics Grid */}
            {config.metrics && config.metrics.length > 0 && (
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1, mb: 1 }}>
                {config.metrics.map((metric, idx) => {
                  const metricValue = typeof metric.field === 'function'
                    ? metric.field(data)
                    : resolveField(data, metric.field)?.raw;

                  const formattedValue = metric.formatter
                    ? metric.formatter(metricValue, data)
                    : metricValue;

                  // Toggle state: true = show value, false/undefined = mask value
                  // Individual cards are always independently controllable
                  // Master toggle sets initial state for privacyLinked metrics only
                  const defaultToggled = metric.toggle?.privacyLinked ? !masterHidden : true;
                  const isToggled = toggleStates[`metric_${idx}`] ?? defaultToggled;
                  const shouldMask = !isToggled; // Only individual toggle matters
                  const displayValue = metric.toggle && shouldMask
                    ? metric.toggle.maskFn(metricValue)
                    : formattedValue;

                  // Defensive: Provide default colors if not defined in config
                  const metricColor = metric.color || {
                    primary: theme.palette.primary.main,
                    secondary: theme.palette.primary.dark,
                    bg: alpha(theme.palette.primary.main, 0.1),
                  };

                  return (
                    <Box
                      key={idx}
                      onClick={(e) => {
                        if (metric.editable && onUpdate) {
                          e.stopPropagation();
                          openEditor(`metric_${idx}`);
                        }
                      }}
                      sx={{
                        p: 0.75,
                        borderRadius: 1.5,
                        background: `linear-gradient(135deg, ${alpha(metricColor.primary, 0.08)} 0%, ${alpha(metricColor.secondary, 0.12)} 100%)`,
                        border: `1px solid ${alpha(metricColor.primary, 0.15)}`,
                        cursor: metric.editable && onUpdate ? 'pointer' : 'default',
                        transition: 'all 0.2s',
                        position: 'relative',
                        '&:hover': metric.editable && onUpdate ? {
                          background: `linear-gradient(135deg, ${alpha(metricColor.primary, 0.12)} 0%, ${alpha(metricColor.secondary, 0.16)} 100%)`,
                          transform: 'scale(1.05)',
                        } : {},
                      }}
                    >
                      <Typography variant="caption" sx={{ fontSize: 9, fontWeight: 600, color: metricColor.secondary, mb: 0.25, display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {metric.label}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {metric.toggle && (
                          <Box
                            onClick={(e) => {
                              // Always allow individual card toggle
                              handleToggle(`metric_${idx}`, e, idx);
                            }}
                            sx={{
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: 20,
                              height: 20,
                              borderRadius: 1,
                              transition: 'all 0.2s',
                              flexShrink: 0,
                              '&:hover': {
                                background: alpha(metricColor.primary, 0.1),
                              },
                            }}
                          >
                            {shouldMask ? (
                              <VisibilityIcon sx={{ fontSize: 14, color: metricColor.primary }} />
                            ) : (
                              <VisibilityOffIcon sx={{ fontSize: 14, color: metricColor.primary }} />
                            )}
                          </Box>
                        )}
                        <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1rem', color: metricColor.primary, letterSpacing: '-0.5px' }}>
                          {displayValue}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            )}

            {/* Footer */}
            {config.footer && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mt: 'auto',
                  pt: 1,
                  px: 1,
                  borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  gap: 0.5,
                }}
              >
                {config.footer.fields?.map((field, idx) => {
                  const fieldValue = typeof field.field === 'function'
                    ? field.field(data)
                    : resolveField(data, field.field)?.raw;

                  // Support custom renderer for complex components (e.g., ClientCircles)
                  const hasCustomRenderer = field.customRenderer && typeof field.customRenderer === 'function';

                  const formattedValue = hasCustomRenderer
                    ? null // Custom renderer will handle display
                    : field.formatter
                      ? field.formatter(fieldValue, data)
                      : fieldValue;

                  // Resolve label (support function or string)
                  const fieldLabel = typeof field.label === 'function' ? field.label(data) : field.label;

                  // Add spacing between date fields (non-custom-renderer fields)
                  const isLastField = idx === config.footer.fields.length - 1;
                  const needsRightPadding = !hasCustomRenderer && !isLastField;

                  return (
                    <Box key={idx} sx={{ display: 'flex', flexDirection: 'column', alignItems: hasCustomRenderer ? 'center' : 'flex-start', gap: 0.25, width: field.width || 'auto', minWidth: 0, flex: field.width ? `0 0 ${field.width}` : '1 1 auto', overflowY: 'visible', pr: isLastField ? 0.5 : (needsRightPadding ? 1.5 : 0) }}>
                      <Typography variant="caption" sx={{ fontSize: 9, fontWeight: 600, color: theme.palette.text.secondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {fieldLabel}
                      </Typography>
                      {hasCustomRenderer ? (
                        // Custom renderer handles its own styling (e.g., ClientCircles)
                        // No wrapper padding - let the component handle its own layout
                        field.customRenderer(data, () => openEditor(`footer_${idx}`))
                      ) : field.editable && onUpdate ? (
                        <Box
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditor(`footer_${idx}`);
                          }}
                          sx={{
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            borderRadius: 1,
                            py: 0.25,
                            display: 'flex',
                            alignItems: 'center',
                            minHeight: 30, // Match ClientCircles height (26px circles + padding)
                            '&:hover': {
                              backgroundColor: 'action.hover',
                            },
                          }}
                        >
                          <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.875rem', color: theme.palette.text.primary, whiteSpace: 'nowrap' }}>
                            {formattedValue}
                          </Typography>
                        </Box>
                      ) : (
                        <Box sx={{ display: 'flex', alignItems: 'center', minHeight: 30 }}>
                          <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.875rem', color: theme.palette.text.primary, whiteSpace: 'nowrap' }}>
                            {formattedValue}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  );
                })}

                {/* Progress indicator */}
                {config.footer.progress && (
                  <Box sx={{ width: config.footer.progress.width || '33.33%', display: 'flex', flexDirection: 'column', gap: 0.25, alignItems: 'flex-end' }}>
                    {config.footer.progress.formatter && (() => {
                      const progressData = config.footer.progress.formatter(data);
                      return (
                        <>
                          <Typography variant="caption" sx={{ fontSize: 9, fontWeight: 600, color: theme.palette.text.secondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            {progressData.label}
                          </Typography>
                          {progressData.showBar ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                              <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.75rem', color: theme.palette.text.primary }}>
                                {progressData.value}%
                              </Typography>
                              <LinearProgress
                                variant="determinate"
                                value={progressData.value}
                                sx={{
                                  width: 40,
                                  height: 4,
                                  borderRadius: 2,
                                  backgroundColor: alpha(theme.palette.mode === 'dark' ? '#fff' : '#000', 0.08),
                                  '& .MuiLinearProgress-bar': {
                                    backgroundColor: '#10b981',
                                    borderRadius: 2,
                                  }
                                }}
                              />
                            </Box>
                          ) : (
                            <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.75rem' }}>
                              {progressData.displayValue}
                            </Typography>
                          )}
                        </>
                      );
                    })()}
                  </Box>
                )}
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* Editor Modals - Rendered from config */}
      {config.title?.editor && (() => {
        const titleEditorProps = config.title.editorProps
          ? config.title.editorProps(data)
          : { value: titleValue, data: data };

        return (
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
            {...titleEditorProps}
          />
        );
      })()}

      {/* Subtitle Editor Modal */}
      {config.subtitle?.editor && (() => {
        const subtitleEditorProps = config.subtitle.editorProps
          ? config.subtitle.editorProps(data)
          : { value: subtitleValue, data: data };

        return (
          <config.subtitle.editor
            open={openEditors.subtitle || false}
            onClose={() => closeEditor('subtitle')}
            onSave={async (newValue) => {
              if (onUpdate && config.subtitle.onSave) {
                const updates = config.subtitle.onSave(data, newValue);
                await onUpdate(data.id, updates);
              }
              closeEditor('subtitle');
            }}
            {...subtitleEditorProps}
          />
        );
      })()}

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
              console.log('[CardTemplate] Metric onSave called:', { metric: metric.label, newValue, dataId: data?.id, hasOnUpdate: !!onUpdate });
              if (onUpdate && metric.onSave) {
                const updates = metric.onSave(data, newValue);
                console.log('[CardTemplate] Calling onUpdate with:', { id: data.id, updates });
                await onUpdate(data.id, updates);
              }
              closeEditor(`metric_${idx}`);
            }}
            {...editorProps}
          />
        );
      })}

      {config.footer?.fields?.map((field, idx) => {
        if (!field.editor) return null;

        // Use custom editorProps if provided, otherwise default props
        const editorProps = field.editorProps
          ? field.editorProps(data)
          : {
              value: typeof field.field === 'function' ? field.field(data) : resolveField(data, field.field)?.raw,
            };

        return (
          <field.editor
            key={`footer_${idx}`}
            open={openEditors[`footer_${idx}`] || false}
            onClose={() => closeEditor(`footer_${idx}`)}
            onSave={async (newValue) => {
              console.log('[CardTemplate] Footer onSave called:', { field: field.label, newValue, dataId: data?.id, hasOnUpdate: !!onUpdate });
              if (onUpdate && field.onSave) {
                const updates = field.onSave(data, newValue);
                console.log('[CardTemplate] Calling onUpdate with:', { id: data.id, updates });
                await onUpdate(data.id, updates);
              }
              closeEditor(`footer_${idx}`);
            }}
            data={data}
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

CardTemplate.displayName = 'CardTemplate';

export default CardTemplate;
