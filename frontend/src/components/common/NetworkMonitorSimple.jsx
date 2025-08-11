import React, { useState, useEffect, useMemo } from 'react';
import {
  Paper,
  Typography,
  Box,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Collapse,
  Alert,
  Tabs,
  Tab,
  Badge,
  LinearProgress,
  Tooltip,
  Button,
  Grid,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  NetworkCheck,
  ExpandMore,
  ExpandLess,
  CheckCircle,
  Error as ErrorIcon,
  AccessTime,
  Speed,
  TrendingUp,
  TrendingDown,
  FilterList,
  Refresh,
  Clear,
  ContentCopy,
  Warning,
  CloudDownload,
  CloudUpload,
  Cached,
  QueryStats,
  DataUsage
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import networkMonitor from '../../services/networkMonitor.service.service';
import CopyButton from './CopyButton';

const NetworkMonitorSimple = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [filter, setFilter] = useState('all'); // all, success, error, pending
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  
  // Only show for system admin
  if (!user || user.username !== 'admin') {
    return null;
  }

  useEffect(() => {
    networkMonitor.enable();
    
    const unsubscribe = networkMonitor.subscribe((newRequests) => {
      if (autoRefresh) {
        setRequests(newRequests);
      }
    });

    setRequests(networkMonitor.getRequests());
    return unsubscribe;
  }, [autoRefresh]);

  // Calculate enhanced stats
  const enhancedStats = useMemo(() => {
    const stats = networkMonitor.getStats();
    const errors = networkMonitor.getErrors();
    
    // Group by endpoint
    const endpointStats = {};
    requests.forEach(req => {
      let endpoint = 'unknown';
      try {
        if (req.url) {
          // Handle both absolute and relative URLs
          if (req.url.startsWith('http://') || req.url.startsWith('https://')) {
            endpoint = new URL(req.url).pathname;
          } else {
            // For relative URLs, just use as-is
            endpoint = req.url;
          }
        }
      } catch (e) {
        // If URL parsing fails, use the raw URL or 'unknown'
        endpoint = req.url || 'unknown';
      }
      
      if (!endpointStats[endpoint]) {
        endpointStats[endpoint] = { count: 0, totalDuration: 0, errors: 0 };
      }
      endpointStats[endpoint].count++;
      endpointStats[endpoint].totalDuration += req.duration || 0;
      if (!req.success) endpointStats[endpoint].errors++;
    });
    
    // Find slowest requests
    const slowestRequests = [...requests]
      .filter(r => r.duration)
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 5);
    
    // Calculate percentiles
    const durations = requests.filter(r => r.duration).map(r => r.duration).sort((a, b) => a - b);
    const p50 = durations[Math.floor(durations.length * 0.5)] || 0;
    const p95 = durations[Math.floor(durations.length * 0.95)] || 0;
    const p99 = durations[Math.floor(durations.length * 0.99)] || 0;
    
    // Request methods breakdown
    const methodCounts = requests.reduce((acc, req) => {
      acc[req.method] = (acc[req.method] || 0) + 1;
      return acc;
    }, {});
    
    // Status code breakdown
    const statusCodes = requests.reduce((acc, req) => {
      const range = req.statusCode ? `${Math.floor(req.statusCode / 100)}xx` : 'pending';
      acc[range] = (acc[range] || 0) + 1;
      return acc;
    }, {});
    
    return {
      ...stats,
      endpointStats,
      slowestRequests,
      percentiles: { p50, p95, p99 },
      methodCounts,
      statusCodes,
      errorDetails: errors.map(e => {
        let endpoint = 'unknown';
        try {
          if (e.url) {
            if (e.url.startsWith('http://') || e.url.startsWith('https://')) {
              endpoint = new URL(e.url).pathname;
            } else {
              endpoint = e.url;
            }
          }
        } catch (err) {
          endpoint = e.url || 'unknown';
        }
        return {
          ...e,
          endpoint,
          errorType: e.error?.status || e.error?.code || 'Unknown'
        };
      })
    };
  }, [requests]);

  // Filter requests based on selected filter
  const filteredRequests = useMemo(() => {
    switch (filter) {
      case 'success':
        return requests.filter(r => r.success === true);
      case 'error':
        return requests.filter(r => r.success === false);
      case 'pending':
        return requests.filter(r => r.status === 'pending');
      default:
        return requests;
    }
  }, [requests, filter]);

  const recentRequests = filteredRequests.slice(0, 10);

  const getStatusIcon = (request) => {
    if (request.status === 'pending') return <AccessTime fontSize="small" color="info" />;
    if (request.success === false) return <ErrorIcon fontSize="small" color="error" />;
    if (request.duration > 1000) return <Warning fontSize="small" color="warning" />;
    return <CheckCircle fontSize="small" color="success" />;
  };

  const formatUrl = (url) => {
    if (!url) return 'unknown';
    
    try {
      // Only try to parse if it's a full URL
      if (url.startsWith('http://') || url.startsWith('https://')) {
        const urlObj = new URL(url);
        return urlObj.pathname;
      }
      // For relative URLs, return as-is
      return url;
    } catch {
      // If parsing fails, return the original URL
      return url;
    }
  };

  const formatDuration = (duration) => {
    if (!duration) return '-';
    if (duration < 1000) return `${duration}ms`;
    return `${(duration / 1000).toFixed(2)}s`;
  };

  const getMethodColor = (method) => {
    const colors = {
      GET: 'primary',
      POST: 'secondary',
      PUT: 'warning',
      DELETE: 'error',
      PATCH: 'info'
    };
    return colors[method] || 'default';
  };

  const handleClear = () => {
    networkMonitor.clear();
    setRequests([]);
  };

  const handleRefresh = () => {
    setRequests(networkMonitor.getRequests());
  };

  const exportData = () => {
    const data = {
      timestamp: new Date().toISOString(),
      stats: enhancedStats,
      requests: requests,
      environment: window.location.hostname
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `network-log-${Date.now()}.json`;
    a.click();
  };

  return (
    <Paper sx={{ p: 2, mb: 2, bgcolor: 'background.paper' }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Box display="flex" alignItems="center" gap={1}>
          <NetworkCheck color="primary" />
          <Typography variant="h6">Enhanced Network Monitor</Typography>
          <Chip label="ADMIN" size="small" color="error" />
          {autoRefresh && <Chip label="Auto-refresh ON" size="small" color="success" variant="outlined" />}
        </Box>
        <Box display="flex" gap={1}>
          <Tooltip title="Export network data">
            <IconButton onClick={exportData} size="small">
              <CloudDownload />
            </IconButton>
          </Tooltip>
          <Tooltip title="Refresh">
            <IconButton onClick={handleRefresh} size="small">
              <Refresh />
            </IconButton>
          </Tooltip>
          <Tooltip title="Clear all">
            <IconButton onClick={handleClear} size="small" color="error">
              <Clear />
            </IconButton>
          </Tooltip>
          <IconButton onClick={() => setExpanded(!expanded)} size="small">
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Box>
      </Box>

      {/* Quick Stats Overview */}
      <Grid container spacing={1} mb={2}>
        <Grid item xs={6} sm={3}>
          <Card variant="outlined">
            <CardContent sx={{ p: 1.5 }}>
              <Typography variant="caption" color="text.secondary">Total Requests</Typography>
              <Typography variant="h6">{enhancedStats.total}</Typography>
              <LinearProgress 
                variant="determinate" 
                value={Math.min(enhancedStats.total, 100)} 
                sx={{ mt: 0.5 }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card variant="outlined" sx={{ borderColor: enhancedStats.errors > 0 ? 'error.main' : 'divider' }}>
            <CardContent sx={{ p: 1.5 }}>
              <Typography variant="caption" color="text.secondary">Error Rate</Typography>
              <Typography variant="h6" color={enhancedStats.errorRate > 10 ? 'error' : 'inherit'}>
                {enhancedStats.errorRate}%
              </Typography>
              <Box display="flex" alignItems="center" gap={0.5}>
                {enhancedStats.errors > 0 ? <TrendingUp color="error" fontSize="small" /> : <TrendingDown color="success" fontSize="small" />}
                <Typography variant="caption">{enhancedStats.errors} errors</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card variant="outlined">
            <CardContent sx={{ p: 1.5 }}>
              <Typography variant="caption" color="text.secondary">Avg Response</Typography>
              <Typography variant="h6">{formatDuration(enhancedStats.avgDuration)}</Typography>
              <Box display="flex" gap={0.5}>
                <Chip label={`P50: ${enhancedStats.percentiles.p50}ms`} size="small" variant="outlined" />
                <Chip label={`P95: ${enhancedStats.percentiles.p95}ms`} size="small" variant="outlined" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card variant="outlined">
            <CardContent sx={{ p: 1.5 }}>
              <Typography variant="caption" color="text.secondary">Active Requests</Typography>
              <Typography variant="h6" color={enhancedStats.pending > 0 ? 'info' : 'inherit'}>
                {enhancedStats.pending}
              </Typography>
              {enhancedStats.pending > 0 && (
                <LinearProgress sx={{ mt: 0.5 }} />
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Collapse in={expanded}>
        <Divider sx={{ mb: 2 }} />
        
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 2 }}>
          <Tab label={<Badge badgeContent={recentRequests.length} color="primary">Requests</Badge>} />
          <Tab label={<Badge badgeContent={enhancedStats.errorDetails.length} color="error">Errors</Badge>} />
          <Tab label="Performance" />
          <Tab label="Endpoints" />
        </Tabs>

        {/* Requests Tab */}
        {activeTab === 0 && (
          <Box>
            <Box display="flex" gap={1} mb={2}>
              <Chip 
                label="All" 
                onClick={() => setFilter('all')}
                color={filter === 'all' ? 'primary' : 'default'}
                variant={filter === 'all' ? 'filled' : 'outlined'}
              />
              <Chip 
                label="Success" 
                onClick={() => setFilter('success')}
                color={filter === 'success' ? 'success' : 'default'}
                variant={filter === 'success' ? 'filled' : 'outlined'}
              />
              <Chip 
                label="Errors" 
                onClick={() => setFilter('error')}
                color={filter === 'error' ? 'error' : 'default'}
                variant={filter === 'error' ? 'filled' : 'outlined'}
              />
              <Chip 
                label="Pending" 
                onClick={() => setFilter('pending')}
                color={filter === 'pending' ? 'info' : 'default'}
                variant={filter === 'pending' ? 'filled' : 'outlined'}
              />
            </Box>

            {recentRequests.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Status</TableCell>
                      <TableCell>Method</TableCell>
                      <TableCell>Endpoint</TableCell>
                      <TableCell>Status Code</TableCell>
                      <TableCell>Duration</TableCell>
                      <TableCell>Size</TableCell>
                      <TableCell>Time</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentRequests.map((request, index) => (
                      <TableRow key={request.id || index} hover>
                        <TableCell>{getStatusIcon(request)}</TableCell>
                        <TableCell>
                          <Chip label={request.method} size="small" color={getMethodColor(request.method)} />
                        </TableCell>
                        <TableCell>
                          <Tooltip title={request.url}>
                            <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                              {formatUrl(request.url)}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={request.statusCode || 'Pending'} 
                            size="small"
                            color={request.statusCode >= 400 ? 'error' : request.statusCode >= 300 ? 'warning' : 'success'}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" color={request.duration > 1000 ? 'error' : 'inherit'}>
                            {formatDuration(request.duration)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption">
                            {request.responseSize ? `${(request.responseSize / 1024).toFixed(1)}KB` : '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Tooltip title={new Date(request.timestamp).toLocaleString()}>
                            <Typography variant="caption">
                              {new Date(request.timestamp).toLocaleTimeString()}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Tooltip title="Copy request details">
                            <IconButton 
                              size="small" 
                              onClick={() => {
                                navigator.clipboard.writeText(JSON.stringify(request, null, 2));
                              }}
                            >
                              <ContentCopy fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Alert severity="info">No {filter !== 'all' ? filter : ''} requests captured yet</Alert>
            )}
          </Box>
        )}

        {/* Errors Tab */}
        {activeTab === 1 && (
          <Box>
            {enhancedStats.errorDetails.length > 0 ? (
              <List>
                {enhancedStats.errorDetails.map((error, index) => (
                  <ListItem key={index} divider>
                    <ListItemIcon>
                      <ErrorIcon color="error" />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Chip label={error.method} size="small" color="error" />
                          <Typography variant="body2">{error.endpoint}</Typography>
                          <Chip label={error.errorType} size="small" variant="outlined" color="error" />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="caption" color="error">
                            {error.error?.message || 'Unknown error'}
                          </Typography>
                          <Typography variant="caption" display="block">
                            {new Date(error.timestamp).toLocaleString()}
                          </Typography>
                        </Box>
                      }
                    />
                    <CopyButton text={JSON.stringify(error, null, 2)} size="small" />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Alert severity="success">No errors detected! 🎉</Alert>
            )}
          </Box>
        )}

        {/* Performance Tab */}
        {activeTab === 2 && (
          <Box>
            <Typography variant="subtitle2" gutterBottom>Response Time Distribution</Typography>
            <Grid container spacing={2} mb={3}>
              <Grid item xs={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="caption" color="text.secondary">P50 (Median)</Typography>
                    <Typography variant="h6">{enhancedStats.percentiles.p50}ms</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="caption" color="text.secondary">P95</Typography>
                    <Typography variant="h6">{enhancedStats.percentiles.p95}ms</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="caption" color="text.secondary">P99</Typography>
                    <Typography variant="h6">{enhancedStats.percentiles.p99}ms</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Typography variant="subtitle2" gutterBottom>Slowest Requests</Typography>
            <List dense>
              {enhancedStats.slowestRequests.map((req, idx) => (
                <ListItem key={idx}>
                  <ListItemText
                    primary={`${req.method} ${formatUrl(req.url)}`}
                    secondary={`${formatDuration(req.duration)} - ${new Date(req.timestamp).toLocaleTimeString()}`}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {/* Endpoints Tab */}
        {activeTab === 3 && (
          <Box>
            <Typography variant="subtitle2" gutterBottom>Endpoint Statistics</Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Endpoint</TableCell>
                    <TableCell align="right">Requests</TableCell>
                    <TableCell align="right">Errors</TableCell>
                    <TableCell align="right">Avg Duration</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(enhancedStats.endpointStats)
                    .sort((a, b) => b[1].count - a[1].count)
                    .map(([endpoint, stats]) => (
                      <TableRow key={endpoint}>
                        <TableCell>
                          <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                            {endpoint}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">{stats.count}</TableCell>
                        <TableCell align="right">
                          {stats.errors > 0 && (
                            <Chip label={stats.errors} size="small" color="error" />
                          )}
                        </TableCell>
                        <TableCell align="right">
                          {formatDuration(Math.round(stats.totalDuration / stats.count))}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box mt={3}>
              <Typography variant="subtitle2" gutterBottom>Request Methods</Typography>
              <Box display="flex" gap={1} flexWrap="wrap">
                {Object.entries(enhancedStats.methodCounts).map(([method, count]) => (
                  <Chip 
                    key={method}
                    label={`${method}: ${count}`}
                    color={getMethodColor(method)}
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>

            <Box mt={2}>
              <Typography variant="subtitle2" gutterBottom>Status Codes</Typography>
              <Box display="flex" gap={1} flexWrap="wrap">
                {Object.entries(enhancedStats.statusCodes).map(([range, count]) => (
                  <Chip 
                    key={range}
                    label={`${range}: ${count}`}
                    color={range === '2xx' ? 'success' : range === '4xx' || range === '5xx' ? 'error' : 'default'}
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>
          </Box>
        )}
      </Collapse>
    </Paper>
  );
};

export default NetworkMonitorSimple;