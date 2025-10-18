import React, { useState, useEffect } from 'react';
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
  Tooltip
} from '@mui/material';
import {
  ContentCopy,
  CheckCircle,
  Error as ErrorIcon,
  Warning,
  CheckCircleOutline,
  Cancel
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const EscrowDebugPanel = ({ error, escrowId }) => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [apiHealthData, setApiHealthData] = useState([]);
  const [debugData, setDebugData] = useState({});

  // Define all escrow-related API endpoints
  const escrowEndpoints = [
    { name: 'Escrow Details', path: `/escrows/${escrowId}`, method: 'GET' },
    { name: 'Escrow Timeline', path: `/escrows/${escrowId}/timeline`, method: 'GET' },
    { name: 'Escrow People', path: `/escrows/${escrowId}/people`, method: 'GET' },
    { name: 'Escrow Financials', path: `/escrows/${escrowId}/financials`, method: 'GET' },
    { name: 'Escrow Checklists', path: `/escrows/${escrowId}/checklists`, method: 'GET' },
    { name: 'Escrow Property', path: `/escrows/${escrowId}/property-details`, method: 'GET' },
    { name: 'Escrow Documents', path: `/escrows/${escrowId}/documents`, method: 'GET' },
    { name: 'Escrow Notes', path: `/escrows/${escrowId}/notes`, method: 'GET' },
    { name: 'Escrow Analytics', path: `/analytics/escrow/${escrowId}`, method: 'GET' },
    { name: 'Health Check', path: '/health', method: 'GET' },
    { name: 'Escrows List', path: '/escrows', method: 'GET' },
    { name: 'Auth Test', path: '/auth/test', method: 'GET' }
  ];

  useEffect(() => {
    collectDebugData();
    checkApiHealth();
  }, [escrowId]);

  const collectDebugData = () => {
    const data = {
      timestamp: new Date().toISOString(),
      error: {
        message: error?.message || 'Unknown error',
        stack: error?.stack || 'No stack trace available',
        name: error?.name || 'Error'
      },
      api: {
        endpoint: `/v1/escrows/${escrowId}`,
        fullUrl: `https://api.jaydenmetz.com/v1/escrows/${escrowId}`,
        method: 'GET'
      },
      authentication: {
        hasJWTToken: !!localStorage.getItem('crm_auth_token'),
        hasAPIKey: !!localStorage.getItem('test_api_key'),
        tokenLocations: {
          crm_auth_token: !!localStorage.getItem('crm_auth_token'),
          authToken: !!localStorage.getItem('authToken'),
          token: !!localStorage.getItem('token'),
          sessionToken: !!localStorage.getItem('sessionToken')
        },
        user: user || JSON.parse(localStorage.getItem('user') || '{}')
      },
      environment: {
        environment: process.env.NODE_ENV || 'production',
        apiBaseUrl: 'https://api.jaydenmetz.com',
        reactAppApiUrl: process.env.REACT_APP_API_URL || 'https://api.jaydenmetz.com/v1',
        currentUrl: window.location.href,
        userAgent: navigator.userAgent
      },
      localStorage: {
        keys: Object.keys(localStorage),
        tokenLength: localStorage.getItem('crm_auth_token')?.length || 0,
        userDataPresent: !!localStorage.getItem('user')
      },
      escrowDetails: {
        escrowId,
        urlParams: window.location.pathname,
        queryString: window.location.search
      }
    };
    
    setDebugData(data);
  };

  const checkApiHealth = async () => {
    const healthChecks = [];
    const token = localStorage.getItem('crm_auth_token');
    const apiKey = localStorage.getItem('test_api_key');
    
    for (const endpoint of escrowEndpoints) {
      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else if (apiKey) {
        headers['X-API-Key'] = apiKey;
      }
      
      try {
        const startTime = Date.now();
        const response = await fetch(`https://api.jaydenmetz.com/v1${endpoint.path}`, {
          method: endpoint.method,
          headers,
          signal: AbortSignal.timeout(5000) // 5 second timeout
        });
        const responseTime = Date.now() - startTime;
        
        healthChecks.push({
          name: endpoint.name,
          endpoint: endpoint.path,
          method: endpoint.method,
          status: response.status,
          statusText: response.statusText,
          healthy: response.ok,
          responseTime: `${responseTime}ms`,
          error: null
        });
      } catch (err) {
        healthChecks.push({
          name: endpoint.name,
          endpoint: endpoint.path,
          method: endpoint.method,
          status: 0,
          statusText: 'Failed',
          healthy: false,
          responseTime: 'N/A',
          error: err.message
        });
      }
    }
    
    setApiHealthData(healthChecks);
  };

  const handleCopyDebugData = () => {
    const fullDebugReport = {
      ...debugData,
      apiHealth: apiHealthData,
      reportGeneratedAt: new Date().toISOString()
    };
    
    navigator.clipboard.writeText(JSON.stringify(fullDebugReport, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusIcon = (healthy, status) => {
    if (healthy) {
      return <CheckCircleOutline sx={{ color: 'success.main', fontSize: 20 }} />;
    } else if (status === 401 || status === 403) {
      return <Warning sx={{ color: 'warning.main', fontSize: 20 }} />;
    } else {
      return <Cancel sx={{ color: 'error.main', fontSize: 20 }} />;
    }
  };

  const getStatusChipColor = (status) => {
    if (status >= 200 && status < 300) return 'success';
    if (status >= 400 && status < 500) return 'warning';
    if (status >= 500) return 'error';
    return 'default';
  };

  return (
    <Paper 
      elevation={0}
      sx={{ 
        p: 3,
        backgroundColor: '#ffffff',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        position: 'relative'
      }}
    >
      {/* Copy Button */}
      <Tooltip title={copied ? "Copied!" : "Copy All Debug Data"}>
        <IconButton
          onClick={handleCopyDebugData}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            backgroundColor: copied ? 'success.light' : 'action.hover',
            '&:hover': {
              backgroundColor: copied ? 'success.light' : 'action.selected'
            }
          }}
        >
          {copied ? <CheckCircle color="success" /> : <ContentCopy />}
        </IconButton>
      </Tooltip>

      {/* Header */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'text.primary' }}>
        Escrow Debug Information
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Comprehensive debug data for escrow ID: <code style={{ backgroundColor: '#f5f5f5', padding: '2px 6px', borderRadius: 4 }}>{escrowId}</code>
      </Typography>

      {/* Error Information */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: 'error.main' }}>
          Error Details
        </Typography>
        <Alert severity="error" sx={{ backgroundColor: '#fff5f5', border: '1px solid', borderColor: 'error.light' }}>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {error?.message || 'Failed to load escrow details'}
          </Typography>
          {error?.stack && (
            <Typography variant="caption" component="pre" sx={{ 
              mt: 1, 
              fontFamily: 'monospace',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              color: 'text.secondary'
            }}>
              {error.stack.substring(0, 200)}...
            </Typography>
          )}
        </Alert>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Authentication Status */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
          Authentication Status
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Chip 
            label={`JWT Token: ${debugData.authentication?.hasJWTToken ? 'Present' : 'Missing'}`}
            color={debugData.authentication?.hasJWTToken ? 'success' : 'error'}
            variant="outlined"
            size="small"
          />
          <Chip 
            label={`API Key: ${debugData.authentication?.hasAPIKey ? 'Present' : 'Missing'}`}
            color={debugData.authentication?.hasAPIKey ? 'success' : 'default'}
            variant="outlined"
            size="small"
          />
          <Chip 
            label={`User: ${debugData.authentication?.user?.email || 'Not logged in'}`}
            variant="outlined"
            size="small"
          />
          <Chip 
            label={`Role: ${debugData.authentication?.user?.role || 'N/A'}`}
            variant="outlined"
            size="small"
            color="primary"
          />
        </Stack>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* API Health Status */}
      <Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
          API Endpoint Health
        </Typography>
        
        <TableContainer component={Paper} variant="outlined" sx={{ backgroundColor: '#fafafa' }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Endpoint</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Method</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Response</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Time</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {apiHealthData.length > 0 ? (
                apiHealthData.map((check, index) => (
                  <TableRow key={index} sx={{ 
                    '&:nth-of-type(odd)': { backgroundColor: '#fafafa' },
                    '&:hover': { backgroundColor: '#f0f0f0' }
                  }}>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        {getStatusIcon(check.healthy, check.status)}
                        <Typography variant="body2">{check.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
                        {check.endpoint}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={check.method} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={`${check.status} ${check.statusText}`}
                        size="small"
                        color={getStatusChipColor(check.status)}
                        variant={check.healthy ? 'filled' : 'outlined'}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {check.responseTime}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      Checking API endpoints...
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Environment Details */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
          Environment Details
        </Typography>
        <Paper variant="outlined" sx={{ p: 2, backgroundColor: '#fafafa' }}>
          <Stack spacing={0.5}>
            <Typography variant="body2">
              <strong>API Base:</strong> {debugData.environment?.apiBaseUrl}
            </Typography>
            <Typography variant="body2">
              <strong>Environment:</strong> {debugData.environment?.environment}
            </Typography>
            <Typography variant="body2">
              <strong>Current URL:</strong> {debugData.environment?.currentUrl}
            </Typography>
            <Typography variant="body2">
              <strong>Timestamp:</strong> {debugData.timestamp}
            </Typography>
          </Stack>
        </Paper>
      </Box>

      {/* Footer Note */}
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 3, textAlign: 'center' }}>
        This debug panel is visible to admin users only. Click the copy button to export all debug data.
      </Typography>
    </Paper>
  );
};

export default EscrowDebugPanel;