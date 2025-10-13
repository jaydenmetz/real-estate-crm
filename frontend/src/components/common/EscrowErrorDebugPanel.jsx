import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Alert,
  Stack,
  LinearProgress,
  Grid,
  Tooltip,
  Card,
  CardContent
} from '@mui/material';
import {
  ContentCopy,
  CheckCircle,
  Error as ErrorIcon,
  Warning,
  CheckCircleOutline,
  Cancel,
  BugReport,
  Api as ApiIcon,
  Security,
  Code,
  AccessTime,
  Person,
  CloudOff,
  Cloud
} from '@mui/icons-material';

const EscrowErrorDebugPanel = ({ error, escrowId }) => {
  const [copied, setCopied] = useState(false);
  const [apiHealthData, setApiHealthData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [debugData, setDebugData] = useState({});
  const [authRefreshAttempted, setAuthRefreshAttempted] = useState(false);
  const hasAttemptedRefresh = useRef(false);

  // Comprehensive escrow API endpoints to test
  const apiEndpoints = [
    { category: 'Core', name: 'Health Check', path: '/health', method: 'GET', critical: true },
    { category: 'Core', name: 'Auth Test', path: '/auth/test', method: 'GET', critical: true },
    { category: 'Escrow', name: 'Escrow Details', path: `/escrows/${escrowId}`, method: 'GET', critical: true },
    { category: 'Escrow', name: 'Escrow List', path: '/escrows', method: 'GET', critical: false },
    { category: 'Escrow', name: 'Escrow Timeline', path: `/escrows/${escrowId}/timeline`, method: 'GET', critical: false },
    { category: 'Escrow', name: 'Escrow People', path: `/escrows/${escrowId}/people`, method: 'GET', critical: false },
    { category: 'Escrow', name: 'Escrow Financials', path: `/escrows/${escrowId}/financials`, method: 'GET', critical: false },
    { category: 'Escrow', name: 'Escrow Checklists', path: `/escrows/${escrowId}/checklists`, method: 'GET', critical: false },
    { category: 'Escrow', name: 'Escrow Property', path: `/escrows/${escrowId}/property-details`, method: 'GET', critical: false },
    { category: 'Escrow', name: 'Escrow Documents', path: `/escrows/${escrowId}/documents`, method: 'GET', critical: false },
    { category: 'Related', name: 'Listings', path: '/listings', method: 'GET', critical: false },
    { category: 'Related', name: 'Clients', path: '/clients', method: 'GET', critical: false },
    { category: 'Related', name: 'Appointments', path: '/appointments', method: 'GET', critical: false },
    { category: 'Related', name: 'Leads', path: '/leads', method: 'GET', critical: false },
    { category: 'Analytics', name: 'Escrow Analytics', path: `/analytics/escrow/${escrowId}`, method: 'GET', critical: false }
  ];

  useEffect(() => {
    collectDebugData();
    testAllEndpoints();
    
    // Auto-attempt auth refresh if we have an "Endpoint not found" error
    if (!hasAttemptedRefresh.current && error?.message === 'Endpoint not found') {
      hasAttemptedRefresh.current = true;
      attemptAuthRefresh();
    }
  }, [escrowId, error]);

  const attemptAuthRefresh = async () => {
    try {
      console.log('Attempting automatic authentication refresh...');
      setAuthRefreshAttempted(true);
      
      // Try emergency login
      const response = await fetch('https://api.jaydenmetz.com/v1/auth/emergency-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@jaydenmetz.com',
          password: 'AdminPassword123'
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.token) {
          // PHASE 1: Save token with standardized key only
          const token = data.data.token;
          localStorage.setItem('authToken', token);

          if (data.data.user) {
            localStorage.setItem('user', JSON.stringify(data.data.user));
          }

          console.log('Authentication refreshed successfully, reloading page...');
          setTimeout(() => window.location.reload(), 1000);
        }
      }
    } catch (err) {
      console.error('Failed to auto-refresh authentication:', err);
    }
  };

  const collectDebugData = () => {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    
    const data = {
      timestamp: new Date().toISOString(),
      error: {
        message: error?.message || 'Unknown error',
        stack: error?.stack || 'No stack trace available',
        name: error?.name || 'Error',
        code: error?.code || 'UNKNOWN'
      },
      request: {
        escrowId,
        endpoint: `/v1/escrows/${escrowId}`,
        fullUrl: `https://api.jaydenmetz.com/v1/escrows/${escrowId}`,
        method: 'GET'
      },
      authentication: {
        hasJWTToken: !!localStorage.getItem('crm_auth_token'),
        hasAPIKey: !!localStorage.getItem('test_api_key'),
        tokenLength: localStorage.getItem('crm_auth_token')?.length || 0,
        apiKeyPresent: !!localStorage.getItem('test_api_key'),
        user: {
          id: user?.id || 'N/A',
          email: user?.email || 'N/A',
          role: user?.role || 'N/A',
          isAdmin: user?.role === 'admin' || user?.role === 'system_admin'
        },
        tokenLocations: {
          crm_auth_token: !!localStorage.getItem('crm_auth_token'),
          authToken: !!localStorage.getItem('authToken'),
          token: !!localStorage.getItem('token'),
          test_api_key: !!localStorage.getItem('test_api_key')
        }
      },
      environment: {
        nodeEnv: process.env.NODE_ENV || 'production',
        apiBaseUrl: 'https://api.jaydenmetz.com',
        apiVersion: 'v1',
        currentUrl: window.location.href,
        userAgent: navigator.userAgent,
        browserInfo: {
          language: navigator.language,
          platform: navigator.platform,
          cookiesEnabled: navigator.cookieEnabled,
          onLine: navigator.onLine
        }
      },
      localStorage: {
        totalKeys: Object.keys(localStorage).length,
        keys: Object.keys(localStorage),
        hasAuthData: !!(localStorage.getItem('crm_auth_token') || localStorage.getItem('user'))
      }
    };
    
    setDebugData(data);
  };

  const testAllEndpoints = async () => {
    setLoading(true);
    const results = [];
    const token = localStorage.getItem('crm_auth_token');
    const apiKey = localStorage.getItem('test_api_key');
    
    for (const endpoint of apiEndpoints) {
      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else if (apiKey) {
        headers['X-API-Key'] = apiKey;
      }
      
      const startTime = performance.now();
      
      try {
        const response = await fetch(`https://api.jaydenmetz.com/v1${endpoint.path}`, {
          method: endpoint.method,
          headers,
          signal: AbortSignal.timeout(5000)
        });
        
        const endTime = performance.now();
        const responseTime = Math.round(endTime - startTime);
        
        let responseData = null;
        try {
          const text = await response.text();
          if (text) {
            responseData = JSON.parse(text);
          }
        } catch (e) {
          // Response wasn't JSON
        }
        
        results.push({
          ...endpoint,
          status: response.status,
          statusText: response.statusText,
          healthy: response.ok,
          responseTime,
          hasData: !!responseData,
          error: null,
          timestamp: new Date().toISOString()
        });
      } catch (err) {
        const endTime = performance.now();
        const responseTime = Math.round(endTime - startTime);
        
        results.push({
          ...endpoint,
          status: 0,
          statusText: 'Network Error',
          healthy: false,
          responseTime,
          hasData: false,
          error: err.message,
          timestamp: new Date().toISOString()
        });
      }
    }
    
    setApiHealthData(results);
    setLoading(false);
  };

  const handleCopyDebugData = () => {
    const fullReport = {
      ...debugData,
      apiHealthSummary: {
        totalEndpoints: apiHealthData.length,
        healthyEndpoints: apiHealthData.filter(e => e.healthy).length,
        failedEndpoints: apiHealthData.filter(e => !e.healthy).length,
        criticalFailures: apiHealthData.filter(e => e.critical && !e.healthy).length,
        averageResponseTime: Math.round(
          apiHealthData.reduce((acc, e) => acc + (e.responseTime || 0), 0) / apiHealthData.length
        )
      },
      apiHealthDetails: apiHealthData,
      reportGeneratedAt: new Date().toISOString()
    };
    
    navigator.clipboard.writeText(JSON.stringify(fullReport, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusIcon = (healthy, status) => {
    if (healthy) {
      return <CheckCircleOutline sx={{ color: '#10b981', fontSize: 18 }} />;
    } else if (status === 401 || status === 403) {
      return <Warning sx={{ color: '#f59e0b', fontSize: 18 }} />;
    } else {
      return <Cancel sx={{ color: '#ef4444', fontSize: 18 }} />;
    }
  };

  const getStatusColor = (status) => {
    if (status >= 200 && status < 300) return '#10b981';
    if (status === 401 || status === 403) return '#f59e0b';
    if (status >= 400 && status < 500) return '#ef4444';
    if (status >= 500) return '#dc2626';
    return '#6b7280';
  };

  const healthyCount = apiHealthData.filter(e => e.healthy).length;
  const totalCount = apiHealthData.length;
  const healthPercentage = totalCount > 0 ? (healthyCount / totalCount) * 100 : 0;

  return (
    <Box sx={{ maxWidth: 1600, margin: '0 auto', p: 3 }}>
      <Paper 
        elevation={0}
        sx={{ 
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: 2,
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <Box sx={{ 
          p: 3, 
          backgroundColor: '#f9fafb',
          borderBottom: '1px solid #e5e7eb',
          position: 'relative'
        }}>
          <Tooltip title={copied ? "Copied!" : "Copy All Debug Data"}>
            <IconButton
              onClick={handleCopyDebugData}
              sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                '&:hover': {
                  backgroundColor: '#f3f4f6'
                }
              }}
            >
              {copied ? <CheckCircle sx={{ color: '#10b981' }} /> : <ContentCopy />}
            </IconButton>
          </Tooltip>

          <Stack direction="row" spacing={2} alignItems="center">
            <BugReport sx={{ fontSize: 32, color: '#ef4444' }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, color: '#111827' }}>
                Escrow Debug Console
              </Typography>
              <Typography variant="body2" sx={{ color: '#6b7280', mt: 0.5 }}>
                Comprehensive diagnostic information for escrow {escrowId}
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* Content */}
        <Box sx={{ p: 3 }}>
          {/* Error Summary */}
          <Alert 
            severity="error" 
            icon={<ErrorIcon />}
            sx={{ 
              mb: 3,
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              '& .MuiAlert-icon': {
                color: '#dc2626'
              }
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#991b1b', mb: 0.5 }}>
              {error?.message || 'Failed to load escrow details'}
            </Typography>
            {error?.code && (
              <Typography variant="body2" sx={{ color: '#7f1d1d' }}>
                Error Code: {error.code}
              </Typography>
            )}
            {authRefreshAttempted && (
              <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#10b981' }}>
                ✓ Authentication refresh attempted - page will reload if successful
              </Typography>
            )}
          </Alert>

          {/* Quick Stats */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card variant="outlined" sx={{ backgroundColor: '#f9fafb' }}>
                <CardContent sx={{ p: 2 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Security sx={{ color: debugData.authentication?.hasJWTToken ? '#10b981' : '#ef4444' }} />
                    <Box>
                      <Typography variant="caption" sx={{ color: '#6b7280' }}>
                        Authentication
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {debugData.authentication?.hasJWTToken ? 'JWT Present' : 'No Token'}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card variant="outlined" sx={{ backgroundColor: '#f9fafb' }}>
                <CardContent sx={{ p: 2 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Person sx={{ color: '#3b82f6' }} />
                    <Box>
                      <Typography variant="caption" sx={{ color: '#6b7280' }}>
                        User
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {debugData.authentication?.user?.email || 'Not logged in'}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card variant="outlined" sx={{ backgroundColor: '#f9fafb' }}>
                <CardContent sx={{ p: 2 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    {navigator.onLine ? <Cloud sx={{ color: '#10b981' }} /> : <CloudOff sx={{ color: '#ef4444' }} />}
                    <Box>
                      <Typography variant="caption" sx={{ color: '#6b7280' }}>
                        Network
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {navigator.onLine ? 'Online' : 'Offline'}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card variant="outlined" sx={{ backgroundColor: '#f9fafb' }}>
                <CardContent sx={{ p: 2 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <ApiIcon sx={{ color: healthPercentage > 50 ? '#10b981' : '#ef4444' }} />
                    <Box>
                      <Typography variant="caption" sx={{ color: '#6b7280' }}>
                        API Health
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {healthyCount}/{totalCount} Healthy
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* API Health Table */}
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#111827' }}>
            API Endpoint Health Status
          </Typography>
          
          {loading ? (
            <Box sx={{ mb: 3 }}>
              <LinearProgress />
              <Typography variant="body2" sx={{ mt: 1, color: '#6b7280', textAlign: 'center' }}>
                Testing API endpoints...
              </Typography>
            </Box>
          ) : (
            <TableContainer 
              component={Paper} 
              variant="outlined" 
              sx={{ 
                mb: 3,
                backgroundColor: '#ffffff',
                '& .MuiTable-root': {
                  minWidth: 650
                }
              }}
            >
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f9fafb' }}>
                    <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Category</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Endpoint</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Path</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Response Time</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Health</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {apiHealthData.map((endpoint, index) => (
                    <TableRow 
                      key={index}
                      sx={{ 
                        '&:nth-of-type(odd)': { backgroundColor: '#f9fafb' },
                        '&:hover': { backgroundColor: '#f3f4f6' }
                      }}
                    >
                      <TableCell>
                        <Chip 
                          label={endpoint.category} 
                          size="small" 
                          variant="outlined"
                          sx={{ 
                            borderColor: '#e5e7eb',
                            color: '#6b7280'
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          {endpoint.critical && (
                            <Tooltip title="Critical Endpoint">
                              <Warning sx={{ fontSize: 14, color: '#f59e0b' }} />
                            </Tooltip>
                          )}
                          <Typography variant="body2" sx={{ fontWeight: endpoint.critical ? 600 : 400 }}>
                            {endpoint.name}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#6b7280' }}>
                          {endpoint.path}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              backgroundColor: getStatusColor(endpoint.status)
                            }}
                          />
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: getStatusColor(endpoint.status),
                              fontWeight: 500
                            }}
                          >
                            {endpoint.status} {endpoint.statusText}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <AccessTime sx={{ fontSize: 14, color: '#6b7280' }} />
                          <Typography variant="caption" sx={{ color: '#6b7280' }}>
                            {endpoint.responseTime}ms
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        {getStatusIcon(endpoint.healthy, endpoint.status)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Authentication Details */}
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#111827' }}>
            Authentication Details
          </Typography>
          
          <Paper variant="outlined" sx={{ p: 2, mb: 3, backgroundColor: '#f9fafb' }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: '#6b7280' }}>JWT Token:</Typography>
                    <Chip 
                      label={debugData.authentication?.hasJWTToken ? 'Present' : 'Missing'}
                      size="small"
                      color={debugData.authentication?.hasJWTToken ? 'success' : 'error'}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: '#6b7280' }}>API Key:</Typography>
                    <Chip 
                      label={debugData.authentication?.hasAPIKey ? 'Present' : 'Missing'}
                      size="small"
                      color={debugData.authentication?.hasAPIKey ? 'success' : 'default'}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: '#6b7280' }}>Token Length:</Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      {debugData.authentication?.tokenLength} chars
                    </Typography>
                  </Box>
                </Stack>
              </Grid>
              <Grid item xs={12} md={6}>
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: '#6b7280' }}>User Email:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {debugData.authentication?.user?.email}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: '#6b7280' }}>User Role:</Typography>
                    <Chip 
                      label={debugData.authentication?.user?.role}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: '#6b7280' }}>Is Admin:</Typography>
                    <Typography variant="body2">
                      {debugData.authentication?.user?.isAdmin ? '✓ Yes' : '✗ No'}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>
            </Grid>
          </Paper>

          {/* Environment Info */}
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#111827' }}>
            Environment Information
          </Typography>
          
          <Paper variant="outlined" sx={{ p: 2, backgroundColor: '#f9fafb' }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: '#6b7280' }}>API Base:</Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      {debugData.environment?.apiBaseUrl}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: '#6b7280' }}>Environment:</Typography>
                    <Typography variant="body2">{debugData.environment?.nodeEnv}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: '#6b7280' }}>Browser Online:</Typography>
                    <Typography variant="body2">{debugData.environment?.browserInfo?.onLine ? 'Yes' : 'No'}</Typography>
                  </Box>
                </Stack>
              </Grid>
              <Grid item xs={12} md={6}>
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: '#6b7280' }}>Platform:</Typography>
                    <Typography variant="body2">{debugData.environment?.browserInfo?.platform}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: '#6b7280' }}>Language:</Typography>
                    <Typography variant="body2">{debugData.environment?.browserInfo?.language}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: '#6b7280' }}>Timestamp:</Typography>
                    <Typography variant="body2">{new Date(debugData.timestamp).toLocaleTimeString()}</Typography>
                  </Box>
                </Stack>
              </Grid>
            </Grid>
          </Paper>
        </Box>
      </Paper>
    </Box>
  );
};

export default EscrowErrorDebugPanel;