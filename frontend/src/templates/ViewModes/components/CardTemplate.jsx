import React, { useState, useCallback } from 'react';
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
} from '../utils/fieldRenderers';

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
}) => {
  const theme = useTheme();

  // Modal states - one state per potential editor
  const [openEditors, setOpenEditors] = useState({});
  const [toggleStates, setToggleStates] = useState({});

  // Status menu state
  const [statusMenuAnchor, setStatusMenuAnchor] = useState(null);

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
            transition: 'box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
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
                background: imageSource
                  ? `url(${imageSource})`
                  : 'linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '50%',
                  background: 'linear-gradient(to top, rgba(0,0,0,0.4), transparent)',
                },
              }}
            >
              {!imageSource && config.image.fallbackIcon && (
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
                    left: 10,
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
                  {/* QuickActionsMenu component would go here */}
                  {/* For now, simplified version */}
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
            {/* Title - Editable */}
            {config.title && (
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
                  mb: 1,
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

                  const isToggled = toggleStates[`metric_${idx}`];
                  const displayValue = metric.toggle && !isToggled
                    ? metric.toggle.maskFn(metricValue)
                    : formattedValue;

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
                        background: `linear-gradient(135deg, ${alpha(metric.color.primary, 0.08)} 0%, ${alpha(metric.color.secondary, 0.12)} 100%)`,
                        border: `1px solid ${alpha(metric.color.primary, 0.15)}`,
                        cursor: metric.editable && onUpdate ? 'pointer' : 'default',
                        transition: 'all 0.2s',
                        position: 'relative',
                        '&:hover': metric.editable && onUpdate ? {
                          background: `linear-gradient(135deg, ${alpha(metric.color.primary, 0.12)} 0%, ${alpha(metric.color.secondary, 0.16)} 100%)`,
                          transform: 'scale(1.05)',
                        } : {},
                      }}
                    >
                      <Typography variant="caption" sx={{ fontSize: 9, fontWeight: 600, color: metric.color.secondary, mb: 0.25, display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {metric.label}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {metric.toggle && (
                          <Box
                            onClick={(e) => handleToggle(`metric_${idx}`, e)}
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
                                background: alpha(metric.color.primary, 0.1),
                              },
                            }}
                          >
                            {isToggled ? (
                              <VisibilityOffIcon sx={{ fontSize: 14, color: metric.color.primary }} />
                            ) : (
                              <VisibilityIcon sx={{ fontSize: 14, color: metric.color.primary }} />
                            )}
                          </Box>
                        )}
                        <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1rem', color: metric.color.primary, letterSpacing: '-0.5px' }}>
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
                  gap: 1,
                }}
              >
                {config.footer.fields?.map((field, idx) => {
                  const fieldValue = typeof field.field === 'function'
                    ? field.field(data)
                    : resolveField(data, field.field)?.raw;

                  const formattedValue = field.formatter
                    ? field.formatter(fieldValue, data)
                    : fieldValue;

                  return (
                    <Box key={idx} sx={{ display: 'flex', flexDirection: 'column', gap: 0.25, width: field.width || '33.33%' }}>
                      <Typography variant="caption" sx={{ fontSize: 9, fontWeight: 600, color: theme.palette.text.secondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {field.label}
                      </Typography>
                      {field.editable && onUpdate ? (
                        <Box
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditor(`footer_${idx}`);
                          }}
                          sx={{
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            borderRadius: 1,
                            px: 0.5,
                            py: 0.25,
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
                        <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.875rem', color: theme.palette.text.primary, whiteSpace: 'nowrap' }}>
                          {formattedValue}
                        </Typography>
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

      {config.metrics?.map((metric, idx) =>
        metric.editor ? (
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
            value={typeof metric.field === 'function' ? metric.field(data) : resolveField(data, metric.field)?.raw}
            data={data}
          />
        ) : null
      )}

      {config.footer?.fields?.map((field, idx) =>
        field.editor ? (
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
            value={typeof field.field === 'function' ? field.field(data) : resolveField(data, field.field)?.raw}
            data={data}
          />
        ) : null
      )}

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
