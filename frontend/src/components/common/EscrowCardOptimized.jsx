import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
  Stack,
  Collapse,
  useTheme,
  alpha,
  Divider,
} from '@mui/material';
import {
  CalendarToday,
  AttachMoney,
  TrendingUp,
  ExpandMore,
  Phone,
  Email,
  Description,
  CheckCircle,
  Warning,
  Timer,
  LocationOn,
  Person,
  Groups,
  Visibility,
  MoreVert,
  Archive as ArchiveIcon,
  Restore as RestoreIcon,
  DeleteForever as DeleteForeverIcon,
  DeleteOutline,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format, differenceInDays, isValid } from 'date-fns';

const EscrowCardOptimized = ({ escrow, index = 0, showCommission = true, onQuickAction, isArchived = false }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Parse escrow data
  const purchasePrice = parseFloat(escrow.purchasePrice) || 0;
  const commission = parseFloat(escrow.myCommission) || 0;
  const checklistProgress = parseInt(escrow.checklistProgress) || 0;
  
  // Calculate days to close
  const closingDate = escrow.scheduledCoeDate || escrow.closingDate;
  let daysToClose = escrow.daysToClose;
  let isUrgent = false;
  let isPastDue = false;
  
  if (closingDate) {
    try {
      const closeDate = new Date(closingDate);
      if (isValid(closeDate)) {
        daysToClose = differenceInDays(closeDate, new Date());
        isUrgent = daysToClose <= 7 && daysToClose > 0;
        isPastDue = daysToClose < 0;
      }
    } catch (e) {
      // Use provided daysToClose
    }
  }

  // Status configuration
  const getStatusConfig = (status) => {
    const configs = {
      'Active': { color: 'success', icon: CheckCircle, bg: theme.palette.success.main },
      'Pending': { color: 'warning', icon: Timer, bg: theme.palette.warning.main },
      'Closed': { color: 'default', icon: CheckCircle, bg: theme.palette.grey[500] },
      'Cancelled': { color: 'error', icon: Warning, bg: theme.palette.error.main },
    };
    return configs[status] || configs['Pending'];
  };

  const statusConfig = getStatusConfig(escrow.escrowStatus);

  // Format currency
  const formatCurrency = (value) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toLocaleString()}`;
  };

  // Handle card click
  const handleCardClick = (e) => {
    if (!e.target.closest('.no-navigate')) {
      navigate(`/escrows/${escrow.id}`);
    }
  };

  // Handle quick actions
  const handleQuickAction = (action, e) => {
    e.stopPropagation();
    if (onQuickAction) {
      onQuickAction(action, escrow);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ y: -4 }}
    >
      <Card
        onClick={handleCardClick}
        sx={{
          cursor: 'pointer',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'visible',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          '&:hover': {
            boxShadow: `0 20px 40px ${alpha(statusConfig.bg, 0.15)}`,
            borderColor: alpha(statusConfig.bg, 0.3),
            '& .quick-actions': {
              opacity: 1,
            },
            '& .property-image': {
              transform: 'scale(1.05)',
            },
          },
        }}
      >
        {/* Status Indicator Bar */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: `linear-gradient(90deg, ${statusConfig.bg} 0%, ${alpha(statusConfig.bg, 0.6)} 100%)`,
          }}
        />

        {/* Urgent/Past Due Badge */}
        {(isUrgent || isPastDue) && (
          <Box
            sx={{
              position: 'absolute',
              top: 12,
              left: 12,
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              px: 1.5,
              py: 0.5,
              borderRadius: 2,
              bgcolor: isPastDue ? 'error.main' : 'warning.main',
              color: 'white',
              fontSize: '0.75rem',
              fontWeight: 'bold',
              boxShadow: 2,
            }}
          >
            <Warning sx={{ fontSize: 16 }} />
            {isPastDue ? 'PAST DUE' : 'URGENT'}
          </Box>
        )}

        <Box sx={{ display: 'flex', height: '100%' }}>
          {/* Property Image */}
          <CardMedia
            component="div"
            sx={{
              width: 140,
              minHeight: 200,
              position: 'relative',
              overflow: 'hidden',
              bgcolor: 'grey.100',
            }}
          >
            {!imageError && escrow.propertyImage ? (
              <Box
                component="img"
                src={escrow.propertyImage}
                alt={escrow.propertyAddress}
                onError={() => setImageError(true)}
                className="property-image"
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'transform 0.3s ease',
                }}
              />
            ) : (
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `linear-gradient(135deg, ${alpha(statusConfig.bg, 0.1)} 0%, ${alpha(statusConfig.bg, 0.05)} 100%)`,
                }}
              >
                <LocationOn sx={{ fontSize: 48, color: 'grey.400' }} />
              </Box>
            )}
            
            {/* Progress Overlay */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                bgcolor: alpha('#000', 0.7),
                color: 'white',
                p: 1,
              }}
            >
              <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                {checklistProgress}% Complete
              </Typography>
              <LinearProgress
                variant="determinate"
                value={checklistProgress}
                sx={{
                  mt: 0.5,
                  height: 3,
                  borderRadius: 1.5,
                  bgcolor: alpha('#fff', 0.2),
                  '& .MuiLinearProgress-bar': {
                    bgcolor: checklistProgress > 75 ? 'success.main' : 'warning.main',
                  },
                }}
              />
            </Box>
          </CardMedia>

          {/* Main Content */}
          <CardContent sx={{ flex: 1, p: 2, pb: 1, position: 'relative' }}>
            {/* Archive/Delete/Restore Icons - Top Right Corner */}
            <Box
              className="quick-actions no-navigate"
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                opacity: 0,
                transition: 'opacity 0.2s',
                zIndex: 15,  // Higher than Past Due badge
                display: 'flex',
                gap: 1,
              }}
            >
              {!isArchived ? (
                <IconButton
                  size="small"
                  onClick={(e) => handleQuickAction('archive', e)}
                  sx={{
                    bgcolor: 'background.paper',
                    boxShadow: 2,
                    '&:hover': {
                      bgcolor: alpha('#ff9800', 0.1),
                      '& .MuiSvgIcon-root': {
                        color: '#ff9800',
                      }
                    },
                  }}
                >
                  <DeleteOutline sx={{ fontSize: 20 }} />
                </IconButton>
              ) : (
                <>
                  {/* Restore Button - Green */}
                  <Tooltip title="Restore to Active">
                    <IconButton
                      size="small"
                      onClick={(e) => handleQuickAction('restore', e)}
                      sx={{
                        bgcolor: '#4caf50',
                        boxShadow: 2,
                        '&:hover': {
                          bgcolor: '#45a049',
                        },
                      }}
                    >
                      <RestoreIcon sx={{ fontSize: 20, color: 'white' }} />
                    </IconButton>
                  </Tooltip>
                  {/* Permanent Delete - Red */}
                  <Tooltip title="⚠️ Permanently Delete - This cannot be undone!">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        if (window.confirm('⚠️ WARNING: This will permanently delete this escrow and cannot be undone. Are you sure?')) {
                          handleQuickAction('delete', e);
                        } else {
                          e.stopPropagation();
                        }
                      }}
                      sx={{
                        bgcolor: '#f44336',
                        boxShadow: 2,
                        '&:hover': {
                          bgcolor: '#da190b',
                        },
                      }}
                    >
                      <DeleteForeverIcon sx={{ fontSize: 20, color: 'white' }} />
                    </IconButton>
                  </Tooltip>
                </>
              )}
            </Box>

            <Stack spacing={1.5}>
              {/* Header: Address & ID */}
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 0.5 }}>
                  <Box sx={{ flex: 1, mr: 1 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        fontSize: '1.1rem',
                        lineHeight: 1.2,
                        mb: 0.25,
                        color: 'text.primary',
                      }}
                    >
                      {escrow.propertyAddress}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'text.secondary',
                        fontSize: '0.75rem',
                        letterSpacing: 0.5,
                      }}
                    >
                      {escrow.escrowNumber || escrow.displayId}
                    </Typography>
                  </Box>

                  {/* Quick Actions - Hidden now since we have the trash icon */}
                  <Stack
                    direction="row"
                    spacing={0.5}
                    className="quick-actions no-navigate"
                    sx={{
                      display: 'none', // Hide the old quick actions
                    }}
                  >
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={(e) => handleQuickAction('view', e)}
                        sx={{
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) },
                        }}
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {!isArchived ? (
                      <Tooltip title="Archive">
                        <IconButton
                          size="small"
                          onClick={(e) => handleQuickAction('archive', e)}
                          sx={{
                            bgcolor: alpha('#ff9800', 0.1),
                            '&:hover': { bgcolor: alpha('#ff9800', 0.2) },
                          }}
                        >
                          <ArchiveIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <>
                        <Tooltip title="Restore">
                          <IconButton
                            size="small"
                            onClick={(e) => handleQuickAction('restore', e)}
                            sx={{
                              bgcolor: alpha('#4caf50', 0.1),
                              '&:hover': { bgcolor: alpha('#4caf50', 0.2) },
                            }}
                          >
                            <RestoreIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Permanently">
                          <IconButton
                            size="small"
                            onClick={(e) => handleQuickAction('delete', e)}
                            sx={{
                              bgcolor: alpha('#f44336', 0.1),
                              '&:hover': { bgcolor: alpha('#f44336', 0.2) },
                            }}
                          >
                            <DeleteForeverIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                    <Tooltip title="More Options">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpanded(!expanded);
                        }}
                        sx={{ 
                          bgcolor: alpha(theme.palette.grey[500], 0.1),
                          '&:hover': { bgcolor: alpha(theme.palette.grey[500], 0.2) },
                        }}
                      >
                        <MoreVert fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Box>

                {/* Status & Timeline */}
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip
                    label={escrow.escrowStatus}
                    size="small"
                    color={statusConfig.color}
                    sx={{
                      height: 22,
                      fontSize: '0.7rem',
                      fontWeight: 600,
                    }}
                  />
                  <Divider orientation="vertical" flexItem />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <CalendarToday sx={{ fontSize: 14, color: 'text.secondary' }} />
                    <Typography
                      variant="caption"
                      sx={{
                        color: isPastDue ? 'error.main' : isUrgent ? 'warning.main' : 'text.secondary',
                        fontWeight: isUrgent || isPastDue ? 600 : 400,
                      }}
                    >
                      {isPastDue
                        ? `${Math.abs(daysToClose)} days overdue`
                        : daysToClose > 0
                        ? `Closes in ${daysToClose} days`
                        : 'Closing soon'}
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              {/* Financial Grid */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: showCommission ? '1fr 1fr' : '1fr',
                  gap: 2,
                  py: 1,
                  borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                }}
              >
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.25 }}>
                    <AttachMoney sx={{ fontSize: 14, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">
                      Purchase Price
                    </Typography>
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      fontSize: '1.25rem',
                      color: 'text.primary',
                    }}
                  >
                    {formatCurrency(purchasePrice)}
                  </Typography>
                </Box>
                
                {showCommission && (
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.25 }}>
                      <TrendingUp sx={{ fontSize: 14, color: 'success.main' }} />
                      <Typography variant="caption" color="text.secondary">
                        My Commission
                      </Typography>
                    </Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        fontSize: '1.25rem',
                        color: 'success.main',
                      }}
                    >
                      {formatCurrency(commission)}
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Parties - Compact View */}
              <Box sx={{ display: 'flex', gap: 2 }}>
                {escrow.buyers && escrow.buyers.length > 0 && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Person sx={{ fontSize: 14, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary" noWrap>
                      B: {escrow.buyers[0]?.name || escrow.buyers.join(', ')}
                    </Typography>
                  </Box>
                )}
                {escrow.sellers && escrow.sellers.length > 0 && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Groups sx={{ fontSize: 14, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary" noWrap>
                      S: {escrow.sellers[0]?.name || escrow.sellers.join(', ')}
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Upcoming Deadlines Indicator */}
              {escrow.upcomingDeadlines > 0 && (
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.5,
                    px: 1,
                    py: 0.25,
                    borderRadius: 1,
                    bgcolor: alpha(theme.palette.warning.main, 0.1),
                    alignSelf: 'flex-start',
                  }}
                >
                  <Timer sx={{ fontSize: 14, color: 'warning.main' }} />
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'warning.dark',
                      fontWeight: 500,
                      fontSize: '0.7rem',
                    }}
                  >
                    {escrow.upcomingDeadlines} upcoming deadline{escrow.upcomingDeadlines > 1 ? 's' : ''}
                  </Typography>
                </Box>
              )}
            </Stack>

            {/* Expanded Details */}
            <Collapse in={expanded} className="no-navigate">
              <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                <Stack spacing={1}>
                  <Typography variant="caption" color="text.secondary">
                    Quick Actions
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Chip
                      icon={<Phone sx={{ fontSize: 14 }} />}
                      label="Call Officer"
                      size="small"
                      onClick={(e) => handleQuickAction('call', e)}
                      sx={{ cursor: 'pointer' }}
                    />
                    <Chip
                      icon={<Email sx={{ fontSize: 14 }} />}
                      label="Email"
                      size="small"
                      onClick={(e) => handleQuickAction('email', e)}
                      sx={{ cursor: 'pointer' }}
                    />
                    <Chip
                      icon={<Description sx={{ fontSize: 14 }} />}
                      label="Documents"
                      size="small"
                      onClick={(e) => handleQuickAction('documents', e)}
                      sx={{ cursor: 'pointer' }}
                    />
                  </Stack>
                </Stack>
              </Box>
            </Collapse>
          </CardContent>
        </Box>
      </Card>
    </motion.div>
  );
};

export default EscrowCardOptimized;