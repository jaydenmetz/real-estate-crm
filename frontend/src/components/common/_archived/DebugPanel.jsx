// frontend/src/components/common/DebugPanel.jsx

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  Chip,
  Collapse,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableContainer,
  Paper,
  Divider,
  Stack,
  Alert,
  Tooltip,
  Badge,
  CircularProgress,
  LinearProgress,
} from '@mui/material';
import {
  BugReport,
  ExpandMore,
  ExpandLess,
  Api,
  Storage,
  ContentCopy,
  Visibility,
  VisibilityOff,
  CheckCircle,
  Error,
  Warning,
  Info,
  Refresh,
  Download,
  Code,
  DataObject,
  NetworkCheck,
  CloudQueue,
  AccessTime,
  Memory,
  Speed,
  DeveloperMode,
  Terminal,
  KeyboardArrowDown,
  KeyboardArrowRight,
} from '@mui/icons-material';
import { alpha, styled } from '@mui/material/styles';
import { format } from 'date-fns';
import CopyButton from './CopyButton';
import networkMonitor from '../../services/networkMonitor';

const StyledAccordion = styled(Accordion)(({ theme }) => ({
  background: alpha(theme.palette.background.paper, 0.8),
  backdropFilter: 'blur(10px)',
  borderRadius: '12px !important',
  border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
  marginBottom: theme.spacing(2),
  '&:before': {
    display: 'none',
  },
  '&.Mui-expanded': {
    margin: theme.spacing(2, 0),
  },
}));

const StatusChip = ({ status, count }) => {
  const getColor = () => {
    switch (status) {
      case 'success': return 'success';
      case 'error': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Chip
      size="small"
      label={`${status}: ${count}`}
      color={getColor()}
      sx={{ fontSize: '0.75rem' }}
    />
  );
};

const DebugPanel = ({ 
  pageTitle = 'Debug Panel',
  apiRequests = [],
  databases = [],
  customData = {},
  user,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showResponses, setShowResponses] = useState({});
  const [networkStats, setNetworkStats] = useState({});
  const [realtimeRequests, setRealtimeRequests] = useState([]);

  useEffect(() => {
    // Update network stats every second
    const interval = setInterval(() => {
      setNetworkStats(networkMonitor.getStats());
      setRealtimeRequests(networkMonitor.getRequests().slice(-10).reverse());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const toggleResponseVisibility = (requestId) => {
    setShowResponses(prev => ({
      ...prev,
      [requestId]: !prev[requestId]
    }));
  };

  const getDebugData = () => ({
    timestamp: new Date().toISOString(),
    page: {
      title: pageTitle,
      url: window.location.href,
      user: user?.username,
    },
    apiRequests: apiRequests.map(req => ({
      url: req.url,
      method: req.method,
      status: req.status,
      duration: req.duration,
      timestamp: req.timestamp,
      response: req.response,
    })),
    databases: databases.map(db => ({
      name: db.name,
      recordCount: db.recordCount,
      lastSync: db.lastSync,
      status: db.status,
    })),
    network: {
      stats: networkStats,
      recentRequests: realtimeRequests.slice(0, 5),
    },
    system: {
      userAgent: navigator.userAgent,
      screen: `${window.screen.width}x${window.screen.height}`,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      memory: performance.memory ? {
        usedJSHeapSize: `${(performance.memory.usedJSHeapSize / 1048576).toFixed(2)} MB`,
        totalJSHeapSize: `${(performance.memory.totalJSHeapSize / 1048576).toFixed(2)} MB`,
        limit: `${(performance.memory.jsHeapSizeLimit / 1048576).toFixed(2)} MB`,
      } : 'N/A',
    },
    customData,
  });

  const getMethodColor = (method) => {
    switch (method?.toUpperCase()) {
      case 'GET': return 'info';
      case 'POST': return 'success';
      case 'PUT': return 'warning';
      case 'DELETE': return 'error';
      default: return 'default';
    }
  };

  const getStatusColor = (status) => {
    if (status >= 200 && status < 300) return 'success.main';
    if (status >= 300 && status < 400) return 'warning.main';
    if (status >= 400) return 'error.main';
    return 'text.secondary';
  };

  if (user?.username !== 'admin') return null;

  return (
    <Box sx={{ mt: 4 }}>
      {/* Header Card */}
      <Card
        sx={{
          background: `linear-gradient(135deg, 
            ${alpha('#667eea', 0.1)} 0%, 
            ${alpha('#764ba2', 0.1)} 100%
          )`,
          border: `2px solid ${alpha('#667eea', 0.3)}`,
          borderRadius: '16px',
          boxShadow: `0 8px 32px ${alpha('#000', 0.1)}`,
          backdropFilter: 'blur(10px)',
          mb: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{
              background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
              borderRadius: '12px',
              p: 1.5,
              color: 'white'
            }}>
              <DeveloperMode />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: '-0.5px' }}>
              {pageTitle}
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
              size="small"
            />
            <Badge badgeContent={realtimeRequests.length} color="primary">
              <Chip
                icon={<NetworkCheck />}
                label="Live"
                size="small"
                sx={{
                  background: alpha('#2196f3', 0.1),
                  '& .MuiChip-icon': { color: '#2196f3' }
                }}
              />
            </Badge>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setExpanded(!expanded)}
              startIcon={expanded ? <ExpandLess /> : <ExpandMore />}
              sx={{
                borderColor: alpha('#667eea', 0.5),
                color: '#667eea',
                '&:hover': {
                  borderColor: '#667eea',
                  background: alpha('#667eea', 0.1)
                }
              }}
            >
              {expanded ? 'Hide' : 'Show'} Debug Info
            </Button>
            <CopyButton
              text={JSON.stringify(getDebugData(), null, 2)}
              label="📋 Copy All Debug Data"
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
        <Box sx={{ px: 3, pb: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <StatusChip status="success" count={networkStats.successful || 0} />
            <StatusChip status="error" count={networkStats.errors || 0} />
            <StatusChip status="pending" count={networkStats.pending || 0} />
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
              Total: {networkStats.total || 0} requests | Avg: {networkStats.avgDuration || 0}ms
            </Typography>
          </Stack>
        </Box>
      </Card>

      {/* Detailed Debug Panel */}
      <Collapse in={expanded}>
        <Grid container spacing={3}>
          {/* API Requests Section */}
          <Grid item xs={12} lg={7}>
            <StyledAccordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                  <Api color="primary" />
                  <Typography variant="h6">API Requests</Typography>
                  <Chip label={`${apiRequests.length + realtimeRequests.length} total`} size="small" sx={{ ml: 'auto', mr: 2 }} />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                {/* Static API Requests */}
                {apiRequests.length > 0 && (
                  <>
                    <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                      Page API Calls
                    </Typography>
                    <List dense>
                      {apiRequests.map((request, index) => (
                        <ListItem
                          key={index}
                          sx={{
                            border: `1px solid ${alpha('#000', 0.1)}`,
                            borderRadius: '8px',
                            mb: 1,
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                          }}
                        >
                          <Box sx={{ display: 'flex', width: '100%', alignItems: 'center', mb: 1 }}>
                            <Chip
                              label={request.method}
                              size="small"
                              color={getMethodColor(request.method)}
                              sx={{ mr: 1 }}
                            />
                            <Typography variant="body2" sx={{ flex: 1, fontFamily: 'monospace' }}>
                              {request.url}
                            </Typography>
                            <Chip
                              label={`${request.status}`}
                              size="small"
                              sx={{
                                color: getStatusColor(request.status),
                                borderColor: getStatusColor(request.status),
                              }}
                              variant="outlined"
                            />
                            <Typography variant="caption" sx={{ ml: 1 }}>
                              {request.duration}ms
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() => toggleResponseVisibility(`static-${index}`)}
                              sx={{ ml: 1 }}
                            >
                              {showResponses[`static-${index}`] ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </Box>
                          <Collapse in={showResponses[`static-${index}`]}>
                            <Box
                              sx={{
                                width: '100%',
                                background: alpha('#000', 0.05),
                                borderRadius: '4px',
                                p: 1,
                                mt: 1,
                              }}
                            >
                              <Typography variant="caption" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                                {JSON.stringify(request.response, null, 2)}
                              </Typography>
                            </Box>
                          </Collapse>
                        </ListItem>
                      ))}
                    </List>
                    <Divider sx={{ my: 2 }} />
                  </>
                )}

                {/* Realtime Requests */}
                <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                  Recent Network Activity (Live)
                </Typography>
                <List dense>
                  {realtimeRequests.map((request, index) => (
                    <ListItem
                      key={request.id || index}
                      sx={{
                        border: `1px solid ${alpha('#000', 0.1)}`,
                        borderRadius: '8px',
                        mb: 1,
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        background: request.status >= 400 ? alpha('#f44336', 0.05) : 'transparent',
                      }}
                    >
                      <Box sx={{ display: 'flex', width: '100%', alignItems: 'center', mb: 1 }}>
                        <Chip
                          label={request.method}
                          size="small"
                          color={getMethodColor(request.method)}
                          sx={{ mr: 1 }}
                        />
                        <Typography variant="body2" sx={{ flex: 1, fontFamily: 'monospace' }}>
                          {request.url}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                          {format(new Date(request.timestamp), 'HH:mm:ss')}
                        </Typography>
                        <Chip
                          label={`${request.status}`}
                          size="small"
                          sx={{
                            color: getStatusColor(request.status),
                            borderColor: getStatusColor(request.status),
                          }}
                          variant="outlined"
                        />
                        <Typography variant="caption" sx={{ ml: 1 }}>
                          {request.duration}ms
                        </Typography>
                      </Box>
                    </ListItem>
                  ))}
                </List>
              </AccordionDetails>
            </StyledAccordion>

            {/* Databases Section */}
            <StyledAccordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                  <Storage color="secondary" />
                  <Typography variant="h6">Database Connections</Typography>
                  <Chip label={`${databases.length} databases`} size="small" sx={{ ml: 'auto', mr: 2 }} />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  {databases.map((db, index) => (
                    <Grid item xs={12} sm={6} key={index}>
                      <Card sx={{ p: 2, background: alpha(db.status === 'connected' ? '#4caf50' : '#f44336', 0.05) }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <CloudQueue sx={{ mr: 1, color: db.status === 'connected' ? 'success.main' : 'error.main' }} />
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {db.name}
                          </Typography>
                        </Box>
                        <Stack spacing={0.5}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="caption" color="text.secondary">Records:</Typography>
                            <Typography variant="caption">{db.recordCount || 'N/A'}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="caption" color="text.secondary">Last Sync:</Typography>
                            <Typography variant="caption">{db.lastSync || 'Never'}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="caption" color="text.secondary">Status:</Typography>
                            <Chip 
                              label={db.status} 
                              size="small" 
                              color={db.status === 'connected' ? 'success' : 'error'}
                              sx={{ height: 16, fontSize: '0.7rem' }}
                            />
                          </Box>
                          {db.sampleData && (
                            <Box sx={{ mt: 1 }}>
                              <Typography variant="caption" sx={{ fontFamily: 'monospace', display: 'block' }}>
                                Sample: {JSON.stringify(db.sampleData, null, 2).slice(0, 100)}...
                              </Typography>
                            </Box>
                          )}
                        </Stack>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </AccordionDetails>
            </StyledAccordion>
          </Grid>

          {/* System Info Section */}
          <Grid item xs={12} lg={5}>
            <StyledAccordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Memory color="warning" />
                  <Typography variant="h6">System Information</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell>Environment</TableCell>
                        <TableCell>{process.env.NODE_ENV}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>User</TableCell>
                        <TableCell>{user?.username} ({user?.role})</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Page URL</TableCell>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                          {window.location.href}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Screen Resolution</TableCell>
                        <TableCell>{window.screen.width}x{window.screen.height}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Viewport</TableCell>
                        <TableCell>{window.innerWidth}x{window.innerHeight}</TableCell>
                      </TableRow>
                      {performance.memory && (
                        <>
                          <TableRow>
                            <TableCell>JS Heap Used</TableCell>
                            <TableCell>
                              {(performance.memory.usedJSHeapSize / 1048576).toFixed(2)} MB
                              <LinearProgress 
                                variant="determinate" 
                                value={(performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100}
                                sx={{ mt: 0.5 }}
                              />
                            </TableCell>
                          </TableRow>
                        </>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Custom Data Section */}
                {Object.keys(customData).length > 0 && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>Custom Debug Data</Typography>
                    <Box sx={{
                      background: alpha('#000', 0.05),
                      borderRadius: '4px',
                      p: 1,
                      fontFamily: 'monospace',
                      fontSize: '0.875rem',
                      overflow: 'auto',
                      maxHeight: 300,
                    }}>
                      <pre>{JSON.stringify(customData, null, 2)}</pre>
                    </Box>
                  </>
                )}
              </AccordionDetails>
            </StyledAccordion>

            {/* Quick Actions */}
            <Card sx={{ p: 2, mt: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Quick Actions</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Button
                  size="small"
                  startIcon={<Refresh />}
                  onClick={() => window.location.reload()}
                  variant="outlined"
                >
                  Reload Page
                </Button>
                <Button
                  size="small"
                  startIcon={<Terminal />}
                  onClick={() => console.log(getDebugData())}
                  variant="outlined"
                >
                  Log to Console
                </Button>
                <Button
                  size="small"
                  startIcon={<Download />}
                  onClick={() => {
                    const blob = new Blob([JSON.stringify(getDebugData(), null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `debug-${pageTitle.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.json`;
                    a.click();
                  }}
                  variant="outlined"
                >
                  Export Debug
                </Button>
              </Stack>
            </Card>
          </Grid>
        </Grid>
      </Collapse>
    </Box>
  );
};

export default DebugPanel;