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
  DialogActions
} from '@mui/material';
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
import networkMonitor from '../../services/networkMonitor';

const NetworkMonitorComponent = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  
  const isAdmin = user && (user.role === 'admin' || user.role === 'system_admin');
  const showDebugInfo = user?.preferences?.showDebugInfo;
  
  // Don't show unless admin or in development
  if (!isAdmin && process.env.NODE_ENV !== 'development') {
    return null;
  }

  useEffect(() => {
    // Subscribe to network monitor updates
    const unsubscribe = networkMonitor.subscribe((newRequests) => {
      if (autoRefresh) {
        setRequests(newRequests);
      }
    });

    // Initial load
    setRequests(networkMonitor.getRequests());

    return unsubscribe;
  }, [autoRefresh]);

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

  return (
    <>
      <Paper 
        sx={{ 
          p: 2, 
          mb: 3, 
          bgcolor: 'info.light',
          border: '2px solid',
          borderColor: 'info.main'
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <NetworkCheck />
            <Typography variant="h6">Network Activity Monitor</Typography>
            <Chip label="Admin Debug Tool" size="small" color="warning" />
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <FormControlLabel
              control={
                <Switch 
                  checked={autoRefresh} 
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  size="small"
                />
              }
              label="Auto-refresh"
            />
            <IconButton size="small" onClick={handleRefresh}>
              <Refresh />
            </IconButton>
            <IconButton size="small" onClick={handleClear}>
              <Clear />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>
        </Box>

        {/* Stats Overview */}
        <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
          <Chip 
            label={`Total: ${stats.total}`} 
            size="small" 
            color="primary"
          />
          <Chip 
            label={`Errors: ${stats.errors}`} 
            size="small" 
            color={stats.errors > 0 ? 'error' : 'default'}
          />
          <Chip 
            label={`Error Rate: ${stats.errorRate}%`} 
            size="small" 
            color={stats.errorRate > 10 ? 'error' : stats.errorRate > 5 ? 'warning' : 'success'}
          />
          <Chip 
            label={`Avg: ${stats.avgDuration}ms`} 
            size="small" 
            color={stats.avgDuration > 1000 ? 'error' : stats.avgDuration > 500 ? 'warning' : 'success'}
          />
          <Chip 
            label={`Pending: ${stats.pending}`} 
            size="small" 
            color={stats.pending > 0 ? 'info' : 'default'}
          />
        </Box>

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
                        <Typography color="text.secondary">
                          No network requests captured yet
                        </Typography>
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
      </Paper>

      <RequestDetailDialog />
    </>
  );
};

export default NetworkMonitorComponent;