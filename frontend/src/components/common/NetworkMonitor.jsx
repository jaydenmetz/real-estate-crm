import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  Chip,
  Divider,
  IconButton,
  Collapse,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Tabs,
  Tab,
  Badge,
  FormControlLabel,
  Switch,
  Button,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardHeader,
  CardContent,
  Grid,
  Fade
} from '@mui/material';
import { styled, keyframes, alpha } from '@mui/material/styles';
import {
  NetworkCheck,
  Refresh,
  Clear,
  ExpandMore,
  ExpandLess,
  Error as ErrorIcon,
  CheckCircle,
  AccessTime,
  Storage,
  BugReport,
  ContentCopy,
  FilterList,
  Visibility
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import CopyButton from './CopyButton';
import networkMonitor from '../../services/networkMonitor.service';

const NetworkMonitorComponent = () => {
  const { user } = useAuth();
  
  // Only show for system admin (username 'admin') or in development
  const isSystemAdmin = user && user.username === 'admin';
  if (!isSystemAdmin && process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  const [requests, setRequests] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  
  const isAdmin = user && (user.role === 'admin' || user.role === 'system_admin');
  const showDebugInfo = user?.preferences?.showDebugInfo;

  useEffect(() => {
    // Ensure network monitor is enabled when component mounts
    // This helps catch cases where user auth completed after initial page load
    if (isSystemAdmin || process.env.NODE_ENV === 'development') {
      networkMonitor.enable();
      // console.log('🔍 NetworkMonitor component ensuring monitor is enabled');
    }

    // Subscribe to network monitor updates
    const unsubscribe = networkMonitor.subscribe((newRequests) => {
      if (autoRefresh) {
        setRequests(newRequests);
      }
    });

    // Initial load
    setRequests(networkMonitor.getRequests());

    return unsubscribe;
  }, [autoRefresh, isSystemAdmin]);

  const stats = networkMonitor.getStats();
  const errors = networkMonitor.getErrors();
  const recentRequests = requests.slice(0, 10);

  const handleClear = () => {
    networkMonitor.clear();
    setRequests([]);
  };

  const handleRefresh = () => {
    setRequests(networkMonitor.getRequests());
  };

  const getStatusColor = (request) => {
    if (request.status === 'pending') return 'info';
    if (request.success === false) return 'error';
    if (request.statusCode >= 200 && request.statusCode < 300) return 'success';
    return 'warning';
  };

  const getStatusIcon = (request) => {
    if (request.status === 'pending') return <AccessTime fontSize="small" />;
    if (request.success === false) return <ErrorIcon fontSize="small" />;
    return <CheckCircle fontSize="small" />;
  };

  const formatUrl = (url) => {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname + urlObj.search;
    } catch {
      return url;
    }
  };

  const formatDuration = (duration) => {
    if (!duration) return '-';
    if (duration < 1000) return `${duration}ms`;
    return `${(duration / 1000).toFixed(1)}s`;
  };

  const showRequestDetail = (request) => {
    setSelectedRequest(request);
    setShowDetailDialog(true);
  };

  const NetworkRequestRow = ({ request }) => (
    <TableRow 
      hover 
      onClick={() => showRequestDetail(request)}
      sx={{ cursor: 'pointer' }}
    >
      <TableCell>
        <Box display="flex" alignItems="center" gap={1}>
          {getStatusIcon(request)}
          <Chip 
            label={request.method} 
            size="small" 
            color={request.method === 'GET' ? 'primary' : request.method === 'POST' ? 'secondary' : 'default'}
          />
        </Box>
      </TableCell>
      <TableCell>
        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
          {formatUrl(request.url)}
        </Typography>
      </TableCell>
      <TableCell>
        <Chip 
          label={request.statusCode || 'Pending'} 
          size="small"
          color={getStatusColor(request)}
        />
      </TableCell>
      <TableCell>
        <Typography variant="body2">
          {formatDuration(request.duration)}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography variant="caption" color="text.secondary">
          {new Date(request.timestamp).toLocaleTimeString()}
        </Typography>
      </TableCell>
    </TableRow>
  );

  const RequestDetailDialog = () => (
    <Dialog 
      open={showDetailDialog} 
      onClose={() => setShowDetailDialog(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">Network Request Details</Typography>
          <Box display="flex" gap={1}>
            <CopyButton 
              text={JSON.stringify(selectedRequest, null, 2)}
              label="Copy Request"
              size="small"
            />
            <IconButton 
              size="small" 
              onClick={() => setShowDetailDialog(false)}
            >
              <ExpandLess />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent>
        {selectedRequest && (
          <Box>
            {/* Request Info */}
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>Request Information</Typography>
              <Box display="flex" gap={2} flexWrap="wrap" mb={2}>
                <Chip label={selectedRequest.method} color="primary" />
                <Chip 
                  label={selectedRequest.statusCode || 'Pending'} 
                  color={getStatusColor(selectedRequest)}
                />
                <Chip label={formatDuration(selectedRequest.duration)} />
                <Chip label={selectedRequest.type} variant="outlined" />
              </Box>
              <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                {selectedRequest.url}
              </Typography>
            </Paper>

            {/* Error Details */}
            {selectedRequest.error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>Error Details</Typography>
                <Typography variant="body2">
                  <strong>Message:</strong> {selectedRequest.error.message}
                </Typography>
                {selectedRequest.error.status && (
                  <Typography variant="body2">
                    <strong>Status:</strong> {selectedRequest.error.status}
                  </Typography>
                )}
                {selectedRequest.error.stack && (
                  <details style={{ marginTop: 8 }}>
                    <summary>Stack Trace</summary>
                    <Box 
                      component="pre" 
                      sx={{ 
                        fontSize: '0.75rem', 
                        bgcolor: 'grey.100', 
                        p: 1, 
                        borderRadius: 1,
                        mt: 1,
                        overflow: 'auto',
                        maxHeight: 200
                      }}
                    >
                      {selectedRequest.error.stack}
                    </Box>
                  </details>
                )}
              </Alert>
            )}

            {/* Expected vs Actual Response */}
            {selectedRequest.error && (
              <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle1" color="error" gutterBottom>
                  Expected vs Actual Response
                </Typography>
                <Box display="flex" gap={2}>
                  <Box flex={1}>
                    <Typography variant="subtitle2" color="success.main" gutterBottom>
                      Expected Response Format:
                    </Typography>
                    <Box 
                      component="pre" 
                      sx={{ 
                        fontSize: '0.75rem', 
                        bgcolor: 'success.light', 
                        color: 'success.contrastText',
                        p: 1, 
                        borderRadius: 1,
                        overflow: 'auto',
                        maxHeight: 150
                      }}
                    >
{`{
  "success": true,
  "data": {
    // Expected data structure
  },
  "timestamp": "ISO string"
}`}
                    </Box>
                  </Box>
                  <Box flex={1}>
                    <Typography variant="subtitle2" color="error" gutterBottom>
                      Actual Response:
                    </Typography>
                    <Box 
                      component="pre" 
                      sx={{ 
                        fontSize: '0.75rem', 
                        bgcolor: 'error.light', 
                        color: 'error.contrastText',
                        p: 1, 
                        borderRadius: 1,
                        overflow: 'auto',
                        maxHeight: 150
                      }}
                    >
                      {selectedRequest.responseText || 'No response body'}
                    </Box>
                  </Box>
                </Box>
              </Paper>
            )}

            {/* Request/Response Bodies */}
            {selectedRequest.body && (
              <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>Request Body</Typography>
                <Box 
                  component="pre" 
                  sx={{ 
                    fontSize: '0.75rem', 
                    bgcolor: 'grey.100', 
                    p: 1, 
                    borderRadius: 1,
                    overflow: 'auto',
                    maxHeight: 200
                  }}
                >
                  {typeof selectedRequest.body === 'string' 
                    ? selectedRequest.body 
                    : JSON.stringify(selectedRequest.body, null, 2)
                  }
                </Box>
              </Paper>
            )}

            {selectedRequest.responseBody && (
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>Response Body</Typography>
                <Box 
                  component="pre" 
                  sx={{ 
                    fontSize: '0.75rem', 
                    bgcolor: 'grey.100', 
                    p: 1, 
                    borderRadius: 1,
                    overflow: 'auto',
                    maxHeight: 200
                  }}
                >
                  {typeof selectedRequest.responseBody === 'string' 
                    ? selectedRequest.responseBody 
                    : JSON.stringify(selectedRequest.responseBody, null, 2)
                  }
                </Box>
              </Paper>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShowDetailDialog(false)}>Close</Button>
      </DialogActions>
    </Dialog>
  );

  // Styled components for stunning design
  const NetworkCard = styled(Card)(({ theme }) => ({
    background: theme?.palette ? `linear-gradient(135deg, 
      ${alpha(theme.palette.info?.main || '#2196f3', 0.08)} 0%, 
      ${alpha(theme.palette.primary?.main || '#1976d2', 0.08)} 50%, 
      ${alpha(theme.palette.secondary?.main || '#dc004e', 0.08)} 100%
    )` : 'rgba(0, 0, 0, 0.05)',
    border: theme?.palette ? `2px solid ${alpha(theme.palette.info?.main || '#2196f3', 0.3)}` : '2px solid rgba(0, 0, 0, 0.1)',
    borderRadius: '16px',
    boxShadow: theme?.palette ? `0 8px 32px ${alpha(theme.palette.common?.black || '#000000', 0.1)}` : '0 8px 32px rgba(0, 0, 0, 0.1)',
    backdropFilter: 'blur(10px)',
    transition: 'all 0.3s ease-in-out',
    '&:hover': {
      boxShadow: theme?.palette ? `0 12px 40px ${alpha(theme.palette.common?.black || '#000000', 0.15)}` : '0 12px 40px rgba(0, 0, 0, 0.15)',
      transform: 'translateY(-2px)',
    }
  }));

  const pulse = keyframes`
    0% { opacity: 0.6; }
    50% { opacity: 1; }
    100% { opacity: 0.6; }
  `;

  const StatsChip = styled(Chip)(({ theme, variant: chipVariant }) => {
    const colors = theme?.palette ? {
      success: { bg: theme.palette.success?.main || '#4caf50', color: theme.palette.success?.contrastText || '#fff' },
      error: { bg: theme.palette.error?.main || '#f44336', color: theme.palette.error?.contrastText || '#fff' },
      warning: { bg: theme.palette.warning?.main || '#ff9800', color: theme.palette.warning?.contrastText || '#000' },
      info: { bg: theme.palette.info?.main || '#2196f3', color: theme.palette.info?.contrastText || '#fff' },
      primary: { bg: theme.palette.primary?.main || '#1976d2', color: theme.palette.primary?.contrastText || '#fff' },
    } : {
      success: { bg: '#4caf50', color: '#fff' },
      error: { bg: '#f44336', color: '#fff' },
      warning: { bg: '#ff9800', color: '#000' },
      info: { bg: '#2196f3', color: '#fff' },
      primary: { bg: '#1976d2', color: '#fff' },
    };
    
    const color = colors[chipVariant] || colors.primary;
    
    return {
      backgroundColor: color.bg,
      color: color.color,
      fontWeight: 600,
      fontSize: '0.75rem',
      '&.loading': {
        animation: `${pulse} 1.5s ease-in-out infinite`,
      }
    };
  });

  try {
    return (
      <Fade in timeout={600}>
        <NetworkCard sx={{ mb: 3 }}>
        <CardHeader
          avatar={
            <Box sx={{ 
              background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
              borderRadius: '12px',
              p: 1.5,
              color: 'white'
            }}>
              <NetworkCheck />
            </Box>
          }
          title={
            <Box display="flex" alignItems="center" gap={1.5}>
              <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: '-0.5px' }}>
                Network Activity Monitor
              </Typography>
              <Chip 
                label="ADMIN TOOL" 
                sx={{
                  background: 'linear-gradient(45deg, #ff6b6b, #ee5a24)',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '0.75rem'
                }}
                size="small"
              />
            </Box>
          }
          action={
            <Box display="flex" alignItems="center" gap={1}>
              <FormControlLabel
                control={
                  <Switch 
                    checked={autoRefresh} 
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    size="small"
                    sx={{
                      '& .MuiSwitch-thumb': {
                        background: 'linear-gradient(45deg, #667eea, #764ba2)',
                      },
                      '& .MuiSwitch-track': {
                        backgroundColor: 'rgba(102, 126, 234, 0.3)',
                      }
                    }}
                  />
                }
                label="Auto-refresh"
                sx={{ mr: 1 }}
              />
              <IconButton 
                size="small" 
                onClick={handleRefresh}
                sx={{
                  background: 'linear-gradient(45deg, #74b9ff, #0984e3)',
                  color: 'white',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #0984e3, #74b9ff)',
                  }
                }}
              >
                <Refresh />
              </IconButton>
              <IconButton 
                size="small" 
                onClick={handleClear}
                sx={{
                  background: 'linear-gradient(45deg, #fd79a8, #e84393)',
                  color: 'white',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #e84393, #fd79a8)',
                  }
                }}
              >
                <Clear />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => setExpanded(!expanded)}
                sx={{
                  background: 'linear-gradient(45deg, #00b894, #00cec9)',
                  color: 'white',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #00cec9, #00b894)',
                  }
                }}
              >
                {expanded ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            </Box>
          }
          sx={{ pb: 1 }}
        />

        <CardContent>
          {/* Stats Overview */}
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <BugReport color="primary" />
            Network Statistics
          </Typography>
          
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6} sm={2.4}>
              <Card sx={{ background: 'linear-gradient(135deg, rgba(63, 81, 181, 0.1), rgba(103, 58, 183, 0.1))' }}>
                <CardContent sx={{ p: 2, textAlign: 'center', '&:last-child': { pb: 2 } }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {stats.total}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Total Requests
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={6} sm={2.4}>
              <Card sx={{ 
                background: stats.errors > 0 
                  ? 'linear-gradient(135deg, rgba(244, 67, 54, 0.1), rgba(233, 30, 99, 0.1))'
                  : 'linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(139, 195, 74, 0.1))'
              }}>
                <CardContent sx={{ p: 2, textAlign: 'center', '&:last-child': { pb: 2 } }}>
                  <Typography variant="h4" sx={{ 
                    fontWeight: 700, 
                    color: stats.errors > 0 ? 'error.main' : 'success.main'
                  }}>
                    {stats.errors}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Errors
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={6} sm={2.4}>
              <Card sx={{ 
                background: stats.errorRate > 10 
                  ? 'linear-gradient(135deg, rgba(244, 67, 54, 0.1), rgba(233, 30, 99, 0.1))'
                  : stats.errorRate > 5 
                    ? 'linear-gradient(135deg, rgba(255, 152, 0, 0.1), rgba(255, 193, 7, 0.1))'
                    : 'linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(139, 195, 74, 0.1))'
              }}>
                <CardContent sx={{ p: 2, textAlign: 'center', '&:last-child': { pb: 2 } }}>
                  <Typography variant="h4" sx={{ 
                    fontWeight: 700, 
                    color: stats.errorRate > 10 ? 'error.main' : stats.errorRate > 5 ? 'warning.main' : 'success.main'
                  }}>
                    {stats.errorRate.toFixed(1)}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Error Rate
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={6} sm={2.4}>
              <Card sx={{ 
                background: stats.avgDuration > 1000 
                  ? 'linear-gradient(135deg, rgba(244, 67, 54, 0.1), rgba(233, 30, 99, 0.1))'
                  : stats.avgDuration > 500 
                    ? 'linear-gradient(135deg, rgba(255, 152, 0, 0.1), rgba(255, 193, 7, 0.1))'
                    : 'linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(139, 195, 74, 0.1))'
              }}>
                <CardContent sx={{ p: 2, textAlign: 'center', '&:last-child': { pb: 2 } }}>
                  <Typography variant="h4" sx={{ 
                    fontWeight: 700, 
                    color: stats.avgDuration > 1000 ? 'error.main' : stats.avgDuration > 500 ? 'warning.main' : 'success.main'
                  }}>
                    {stats.avgDuration}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Avg Duration (ms)
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={6} sm={2.4}>
              <Card sx={{ 
                background: stats.pending > 0 
                  ? 'linear-gradient(135deg, rgba(33, 150, 243, 0.1), rgba(3, 169, 244, 0.1))'
                  : 'linear-gradient(135deg, rgba(158, 158, 158, 0.1), rgba(189, 189, 189, 0.1))'
              }}>
                <CardContent sx={{ p: 2, textAlign: 'center', '&:last-child': { pb: 2 } }}>
                  <Typography variant="h4" sx={{ 
                    fontWeight: 700, 
                    color: stats.pending > 0 ? 'info.main' : 'text.secondary',
                    ...(stats.pending > 0 && {
                      animation: `${pulse} 1.5s ease-in-out infinite`,
                    })
                  }}>
                    {stats.pending}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Pending
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Collapse in={expanded}>
            <Divider sx={{ mb: 2 }} />
          
          <Tabs value={selectedTab} onChange={(e, val) => setSelectedTab(val)} sx={{ mb: 2 }}>
            <Tab 
              label={
                <Badge badgeContent={recentRequests.length} color="primary">
                  Recent Requests
                </Badge>
              } 
            />
            <Tab 
              label={
                <Badge badgeContent={errors.length} color="error">
                  Errors Only
                </Badge>
              } 
            />
          </Tabs>

          {selectedTab === 0 && (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Method</TableCell>
                    <TableCell>URL</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Duration</TableCell>
                    <TableCell>Time</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentRequests.map((request) => (
                    <NetworkRequestRow key={request.id} request={request} />
                  ))}
                  {recentRequests.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Box py={2}>
                          <Typography color="text.secondary" gutterBottom>
                            No network requests captured yet
                          </Typography>
                          <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                            This usually means monitoring started after page load.
                          </Typography>
                          <Button 
                            size="small" 
                            variant="outlined" 
                            onClick={() => window.location.reload()}
                            sx={{ mt: 1 }}
                          >
                            Refresh Page to Capture Requests
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {selectedTab === 1 && (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Method</TableCell>
                    <TableCell>URL</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Duration</TableCell>
                    <TableCell>Time</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {errors.map((request) => (
                    <NetworkRequestRow key={request.id} request={request} />
                  ))}
                  {errors.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Typography color="success.main">
                          No errors detected! 🎉
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          </Collapse>
        </CardContent>
      </NetworkCard>

      <RequestDetailDialog />
    </Fade>
    );
  } catch (error) {
    console.error('NetworkMonitor render error:', error);
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        NetworkMonitor component error - check console for details
      </Alert>
    );
  }
};

export default NetworkMonitorComponent;