import React from 'react';
import {
  Box,
  Card,
  Typography,
  Chip,
  IconButton,
  Collapse,
  Grid,
  Stack,
  alpha,
  Tooltip as MuiTooltip,
} from '@mui/material';
import {
  BugReport,
  ExpandLess,
  ExpandMore,
  Refresh,
  Analytics,
  DataObject,
  NetworkCheck,
  Info,
  Warning,
  Error as ErrorIcon,
} from '@mui/icons-material';
import CopyButton from '../../common/CopyButton';
import networkMonitor from '../../../services/networkMonitor.service';

/**
 * EscrowDebugPanel - Debug information panel for admin users
 *
 * This component provides:
 * - System information display
 * - Network activity monitoring
 * - Escrow data statistics
 * - Debug data export functionality
 * - Performance metrics
 *
 * Extracted from EscrowsDashboard.jsx during Phase 6 refactoring
 * @since 1.0.5
 */
const EscrowDebugPanel = ({
  user,
  debugExpanded,
  setDebugExpanded,
  networkData,
  setNetworkData,
  escrows,
  stats,
  selectedStatus,
  viewMode,
}) => {
  // Only show for admin users
  if (user?.username !== 'admin') {
    return null;
  }

  return (
    <Box sx={{ mb: 4 }}>
      {/* Summary Debug Card */}
      <Card
        onClick={() => setDebugExpanded(!debugExpanded)}
        sx={(theme) => ({
          background: `linear-gradient(135deg,
            ${alpha(theme.palette.primary.main, 0.08)} 0%,
            ${alpha(theme.palette.secondary.main, 0.08)} 50%,
            ${alpha(theme.palette.error.main, 0.08)} 100%
          )`,
          border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
          borderRadius: '16px',
          boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.1)}`,
          overflow: 'hidden',
          position: 'relative',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: `0 12px 40px ${alpha(theme.palette.common.black, 0.15)}`,
            transform: 'translateY(-2px)',
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: `linear-gradient(90deg,
              ${theme.palette.primary.main} 0%,
              ${theme.palette.secondary.main} 33%,
              ${theme.palette.error.main} 66%,
              ${theme.palette.warning.main} 100%
            )`,
          }
        })}
      >
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={(theme) => ({
                  p: 1.5,
                  borderRadius: '12px',
                  background: `linear-gradient(135deg, ${theme.palette.error.main}, ${theme.palette.error.dark})`,
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 4px 12px ${alpha(theme.palette.error.main, 0.3)}`
                })}
              >
                <BugReport />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: '-0.5px' }}>
                Debug Panel: Escrows Dashboard
              </Typography>
              <Chip
                label={process.env.NODE_ENV === 'production' ? '🔴 PRODUCTION' : '🟢 LOCAL'}
                sx={{
                  background: process.env.NODE_ENV === 'production'
                    ? 'linear-gradient(45deg, #ff6b6b, #ee5a24)'
                    : 'linear-gradient(45deg, #00b894, #00cec9)',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '0.75rem'
                }}
              />
              <Chip
                label="Admin Only"
                sx={{
                  background: 'linear-gradient(45deg, #fdcb6e, #e17055)',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '0.75rem'
                }}
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {debugExpanded ? <ExpandLess /> : <ExpandMore />}
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  setNetworkData({
                    stats: networkMonitor.getStats(),
                    requests: networkMonitor.getRequests(),
                    errors: networkMonitor.getErrors()
                  });
                }}
                sx={(theme) => ({
                  color: theme.palette.primary.main,
                  '&:hover': {
                    background: alpha(theme.palette.primary.main, 0.1)
                  }
                })}
              >
                <MuiTooltip title="Refresh Network Data">
                  <Refresh />
                </MuiTooltip>
              </IconButton>
              <CopyButton
                text={JSON.stringify({
                  pageInfo: {
                    url: window.location.href,
                    timestamp: new Date().toISOString(),
                    user: user?.username,
                    userAgent: navigator.userAgent,
                    screenResolution: `${window.screen.width}x${window.screen.height}`
                  },
                  escrowsData: {
                    totalEscrows: escrows.length,
                    activeEscrows: escrows.filter(e => e.escrowStatus === 'Active Under Contract' || e.escrowStatus === 'active under contract').length,
                    stats: stats,
                    escrowsSample: escrows.slice(0, 3).map(e => ({
                      id: e.id,
                      propertyAddress: e.propertyAddress,
                      status: e.escrowStatus,
                      salePrice: e.salePrice,
                      acceptanceDate: e.acceptanceDate
                    })),
                    selectedStatus: selectedStatus,
                    viewMode: viewMode
                  },
                  networkActivity: {
                    stats: networkData.stats,
                    recentRequests: networkData.requests.slice(-5),
                    errorCount: networkData.stats?.errors || 0,
                    allRequests: networkData.requests,
                    allErrors: networkData.errors
                  },
                  browserInfo: {
                    location: window.location,
                    localStorage: {
                      hasUser: !!localStorage.getItem('user'),
                      userKeys: Object.keys(localStorage)
                    }
                  }
                }, null, 2)}
                label="📋 Copy Debug Summary"
                variant="contained"
                sx={{
                  background: 'linear-gradient(45deg, #667eea, #764ba2)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #764ba2, #667eea)',
                  }
                }}
              />
            </Box>
          </Box>
        </Box>
      </Card>

      {/* Detailed Debug Panel */}
      <Collapse in={debugExpanded}>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          {/* Dashboard Statistics */}
          <Grid item xs={12} md={6}>
            <Card sx={{
              background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(139, 195, 74, 0.1))',
              border: '1px solid rgba(76, 175, 80, 0.3)',
              borderRadius: '12px'
            }}>
              <Box sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Analytics /> Escrows Statistics
                </Typography>
                <Stack spacing={1.5}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">Total Escrows</Typography>
                    <Chip label={escrows.length} size="small" />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">Active Status</Typography>
                    <Chip label={selectedStatus} size="small" color="primary" />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">View Mode</Typography>
                    <Chip label={viewMode} size="small" color="secondary" />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">Active Escrows</Typography>
                    <Chip
                      label={escrows.filter(e =>
                        e.escrowStatus === 'Active Under Contract' ||
                        e.escrowStatus === 'active under contract'
                      ).length}
                      size="small"
                      color="success"
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">Total Volume</Typography>
                    <Chip
                      label={`$${stats.totalVolume?.toLocaleString() || 0}`}
                      size="small"
                      sx={{ backgroundColor: 'rgba(33, 150, 243, 0.2)' }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">Projected Commission</Typography>
                    <Chip
                      label={`$${stats.projectedCommission?.toLocaleString() || 0}`}
                      size="small"
                      sx={{ backgroundColor: 'rgba(255, 193, 7, 0.2)' }}
                    />
                  </Box>
                </Stack>
              </Box>
            </Card>
          </Grid>

          {/* Raw Data */}
          <Grid item xs={12} md={6}>
            <Card sx={{
              background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.1), rgba(3, 169, 244, 0.1))',
              border: '1px solid rgba(33, 150, 243, 0.3)',
              borderRadius: '12px'
            }}>
              <Box sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <DataObject /> Raw Data Export
                </Typography>
                <Stack spacing={2}>
                  <CopyButton
                    text={JSON.stringify(escrows, null, 2)}
                    label="📄 Copy All Escrows JSON"
                    fullWidth
                    variant="outlined"
                  />
                  <CopyButton
                    text={JSON.stringify(stats, null, 2)}
                    label="📊 Copy Stats JSON"
                    fullWidth
                    variant="outlined"
                  />
                  <CopyButton
                    text={escrows.map(e => `${e.propertyAddress}\t${e.escrowStatus}\t$${e.salePrice}`).join('\n')}
                    label="📋 Copy as TSV"
                    fullWidth
                    variant="outlined"
                  />
                  <CopyButton
                    text={`Total Escrows: ${escrows.length}\nActive: ${escrows.filter(e => e.escrowStatus === 'Active Under Contract').length}\nTotal Volume: $${stats.totalVolume?.toLocaleString()}`}
                    label="📝 Copy Summary Text"
                    fullWidth
                    variant="outlined"
                  />
                </Stack>
              </Box>
            </Card>
          </Grid>

          {/* Network Activity */}
          <Grid item xs={12}>
            <Card sx={{
              background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.1), rgba(255, 87, 34, 0.1))',
              border: '1px solid rgba(255, 152, 0, 0.3)',
              borderRadius: '12px'
            }}>
              <Box sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <NetworkCheck /> Network Activity
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Chip
                      icon={<Info />}
                      label={`Total: ${networkData.stats?.total || 0}`}
                      size="small"
                      sx={{ backgroundColor: 'rgba(33, 150, 243, 0.2)' }}
                    />
                    <Chip
                      icon={<Warning />}
                      label={`Errors: ${networkData.stats?.errors || 0}`}
                      size="small"
                      sx={{ backgroundColor: 'rgba(255, 152, 0, 0.2)' }}
                    />
                    <Chip
                      icon={<ErrorIcon />}
                      label={`Failed: ${networkData.stats?.failed || 0}`}
                      size="small"
                      sx={{ backgroundColor: 'rgba(244, 67, 54, 0.2)' }}
                    />
                  </Box>
                </Box>
                <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                  <Stack spacing={1}>
                    {networkData.requests?.slice(-10).reverse().map((request, index) => (
                      <Box
                        key={index}
                        sx={{
                          p: 1,
                          borderRadius: 1,
                          backgroundColor: request.status >= 400 ? 'rgba(244, 67, 54, 0.1)' : 'rgba(76, 175, 80, 0.1)',
                          border: `1px solid ${request.status >= 400 ? 'rgba(244, 67, 54, 0.3)' : 'rgba(76, 175, 80, 0.3)'}`,
                          fontFamily: 'monospace',
                          fontSize: '0.75rem'
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>
                            {request.method} {request.url}
                          </Typography>
                          <Chip
                            label={request.status}
                            size="small"
                            color={request.status >= 400 ? 'error' : 'success'}
                            sx={{ height: 20, fontSize: '0.7rem' }}
                          />
                        </Box>
                        {request.error && (
                          <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                            {request.error}
                          </Typography>
                        )}
                      </Box>
                    ))}
                    {networkData.requests?.length === 0 && (
                      <Typography variant="caption" color="text.secondary" align="center">
                        No network requests yet. Refresh to see latest activity.
                      </Typography>
                    )}
                  </Stack>
                </Box>
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Collapse>
    </Box>
  );
};

export default EscrowDebugPanel;