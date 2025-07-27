import React, { useState, useEffect } from 'react';
import { Paper, Typography, Alert, Box, Chip, Divider, Collapse, IconButton, CircularProgress, Grid } from '@mui/material';
import { ExpandMore, ExpandLess, BugReport, Storage, CheckCircle, Error as ErrorIcon, Refresh } from '@mui/icons-material';
import CopyButton from './CopyButton';
import { getSafeTimestamp } from '../../utils/safeDateUtils';
import { useAuth } from '../../contexts/AuthContext';
import apiInstance from '../../services/api';

const DetailPageDebugger = ({ 
  pageName, 
  id, 
  isLoading, 
  isError, 
  error, 
  data, 
  additionalInfo = {} 
}) => {
  const { user } = useAuth();
  const [expandedSections, setExpandedSections] = useState({});
  const [dbStatus, setDbStatus] = useState({
    loading: false,
    local: null,
    railway: null,
    lastChecked: null
  });
  
  const isAdmin = user && (user.role === 'admin' || user.role === 'system_admin');
  
  // Show in development OR for admin users (always show for admin)
  if (process.env.NODE_ENV !== 'development' && !isAdmin) {
    return null;
  }
  
  // Function to check database status
  const checkDatabaseStatus = async () => {
    setDbStatus(prev => ({ ...prev, loading: true }));
    
    try {
      // Check local database (development)
      if (process.env.NODE_ENV === 'development') {
        try {
          const localResponse = await fetch('http://localhost:5050/v1/debug/db-status');
          const localData = await localResponse.json();
          setDbStatus(prev => ({ ...prev, local: localData }));
        } catch (err) {
          setDbStatus(prev => ({ ...prev, local: { error: 'Local DB unreachable' } }));
        }
      }
      
      // Check Railway database (production)
      try {
        const railwayResponse = await apiInstance.get('/debug/db-status');
        setDbStatus(prev => ({ 
          ...prev, 
          railway: railwayResponse,
          lastChecked: new Date().toISOString()
        }));
      } catch (err) {
        setDbStatus(prev => ({ 
          ...prev, 
          railway: { error: 'Railway DB unreachable' }
        }));
      }
    } finally {
      setDbStatus(prev => ({ ...prev, loading: false }));
    }
  };
  
  // Auto-check on mount for admins
  useEffect(() => {
    if (isAdmin) {
      checkDatabaseStatus();
    }
  }, [isAdmin]);

  const debugInfo = {
    page: pageName,
    routeId: id,
    timestamp: getSafeTimestamp(),
    url: window.location.href,
    pathname: window.location.pathname,
    reactRouterWorking: !!id,
    componentMounted: true,
    loadingState: isLoading,
    errorState: isError,
    hasData: !!data,
    dataType: data ? typeof data : 'undefined',
    errorMessage: error?.message,
    errorStatus: error?.status,
    errorCode: error?.code,
    errorId: error?.errorId,
    errorDetails: isAdmin ? error?.details : undefined,
    errorStack: isAdmin ? error?.stack : undefined,
    userRole: user?.role,
    environment: process.env.NODE_ENV,
    ...additionalInfo
  };

  const getStatusColor = () => {
    if (isLoading) return 'info';
    if (isError) return 'error';
    if (data) return 'success';
    return 'warning';
  };

  const getStatusText = () => {
    if (isLoading) return 'Loading...';
    if (isError) return 'Error Occurred';
    if (data) return 'Data Loaded';
    return 'No Data';
  };

  return (
    <Paper 
      sx={{ 
        p: 2, 
        mb: 3, 
        bgcolor: 'grey.50',
        border: '2px dashed',
        borderColor: 'grey.400'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BugReport />
          <Typography variant="h6">
            Debug Panel: {pageName}
          </Typography>
          {isAdmin && (
            <Chip 
              label="Admin View" 
              color="warning" 
              size="small"
            />
          )}
        </Box>
        <Chip 
          label={getStatusText()} 
          color={getStatusColor()} 
          size="small"
        />
      </Box>
      
      <Divider sx={{ mb: 2 }} />
      
      {/* Quick Status */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Quick Status:
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip 
            label={`ID: ${id || 'MISSING'}`} 
            size="small" 
            color={id ? 'default' : 'error'}
          />
          <Chip 
            label={`React Router: ${id ? '✓' : '✗'}`} 
            size="small" 
            color={id ? 'success' : 'error'}
          />
          <Chip 
            label={`Component: ✓`} 
            size="small" 
            color="success"
          />
          <Chip 
            label={`Data: ${data ? '✓' : '✗'}`} 
            size="small" 
            color={data ? 'success' : 'warning'}
          />
        </Box>
      </Box>

      {/* Database Status - Admin Only */}
      {isAdmin && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.100' }} elevation={0}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Storage color="action" />
              <Typography variant="subtitle1" fontWeight="medium">
                Database Status
              </Typography>
            </Box>
            <IconButton 
              size="small" 
              onClick={checkDatabaseStatus}
              disabled={dbStatus.loading}
            >
              {dbStatus.loading ? <CircularProgress size={20} /> : <Refresh />}
            </IconButton>
          </Box>
          
          <Grid container spacing={2}>
            {/* Local Database */}
            {process.env.NODE_ENV === 'development' && (
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }} variant="outlined">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    {dbStatus.local?.error ? (
                      <ErrorIcon color="error" fontSize="small" />
                    ) : dbStatus.local ? (
                      <CheckCircle color="success" fontSize="small" />
                    ) : (
                      <CircularProgress size={16} />
                    )}
                    <Typography variant="subtitle2">
                      Local Database
                    </Typography>
                  </Box>
                  
                  {dbStatus.local && !dbStatus.local.error && (
                    <Box sx={{ fontSize: '0.75rem' }}>
                      <Typography variant="caption" display="block">
                        Status: {dbStatus.local.data?.status || 'Connected'}
                      </Typography>
                      {dbStatus.local.data?.recordCounts && (
                        <>
                          <Typography variant="caption" display="block">
                            Escrows: {dbStatus.local.data.recordCounts.escrows || 0}
                          </Typography>
                          <Typography variant="caption" display="block">
                            Listings: {dbStatus.local.data.recordCounts.listings || 0}
                          </Typography>
                          <Typography variant="caption" display="block">
                            Clients: {dbStatus.local.data.recordCounts.clients || 0}
                          </Typography>
                        </>
                      )}
                    </Box>
                  )}
                  
                  {dbStatus.local?.error && (
                    <Typography variant="caption" color="error">
                      {dbStatus.local.error}
                    </Typography>
                  )}
                </Paper>
              </Grid>
            )}
            
            {/* Railway Database */}
            <Grid item xs={12} md={process.env.NODE_ENV === 'development' ? 6 : 12}>
              <Paper sx={{ p: 2 }} variant="outlined">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  {dbStatus.railway?.error ? (
                    <ErrorIcon color="error" fontSize="small" />
                  ) : dbStatus.railway ? (
                    <CheckCircle color="success" fontSize="small" />
                  ) : (
                    <CircularProgress size={16} />
                  )}
                  <Typography variant="subtitle2">
                    Railway Database (Production)
                  </Typography>
                </Box>
                
                {dbStatus.railway && !dbStatus.railway.error && (
                  <Box sx={{ fontSize: '0.75rem' }}>
                    <Typography variant="caption" display="block">
                      Status: {dbStatus.railway.data?.status || 'Connected'}
                    </Typography>
                    {dbStatus.railway.data?.environment && (
                      <Typography variant="caption" display="block">
                        Environment: {dbStatus.railway.data.environment}
                      </Typography>
                    )}
                    {dbStatus.railway.data?.recordCounts && (
                      <>
                        <Typography variant="caption" display="block">
                          Teams: {dbStatus.railway.data.recordCounts.teams || 0}
                        </Typography>
                        <Typography variant="caption" display="block">
                          Users: {dbStatus.railway.data.recordCounts.users || 0}
                        </Typography>
                        <Typography variant="caption" display="block">
                          Escrows: {dbStatus.railway.data.recordCounts.escrows || 0}
                        </Typography>
                        <Typography variant="caption" display="block">
                          Listings: {dbStatus.railway.data.recordCounts.listings || 0}
                        </Typography>
                      </>
                    )}
                  </Box>
                )}
                
                {dbStatus.railway?.error && (
                  <Typography variant="caption" color="error">
                    {dbStatus.railway.error}
                  </Typography>
                )}
              </Paper>
            </Grid>
          </Grid>
          
          {dbStatus.lastChecked && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Last checked: {new Date(dbStatus.lastChecked).toLocaleTimeString()}
            </Typography>
          )}
        </Paper>
      )}

      {/* Error Details */}
      {error && (
        <Alert severity="error" sx={{ mb: 2, position: 'relative' }}>
          <Typography variant="subtitle2" gutterBottom>
            Error Details:
          </Typography>
          <Typography variant="body2">
            Message: {error.message || 'Unknown error'}
          </Typography>
          {error.status && (
            <Typography variant="body2">
              Status: {error.status}
            </Typography>
          )}
          {error.code && (
            <Typography variant="body2">
              Code: {error.code}
            </Typography>
          )}
          {error.errorId && (
            <Typography variant="body2">
              Error ID: {error.errorId}
            </Typography>
          )}
          
          {/* Admin-only error details */}
          {isAdmin && error.details && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Full Error Details (Admin Only):
              </Typography>
              <Box 
                component="pre" 
                sx={{ 
                  bgcolor: 'error.dark', 
                  color: 'error.contrastText',
                  p: 1, 
                  borderRadius: 1,
                  fontSize: '11px',
                  overflow: 'auto',
                  maxHeight: '200px'
                }}
              >
                {JSON.stringify(error.details, null, 2)}
              </Box>
            </Box>
          )}
          
          {/* Stack trace for admins */}
          {isAdmin && error.stack && (
            <details style={{ marginTop: '8px' }}>
              <summary style={{ cursor: 'pointer' }}>
                <Typography variant="caption" component="span">
                  Stack Trace (Admin Only)
                </Typography>
              </summary>
              <Box 
                component="pre" 
                sx={{ 
                  bgcolor: 'grey.900', 
                  color: 'grey.100',
                  p: 1, 
                  borderRadius: 1,
                  fontSize: '10px',
                  overflow: 'auto',
                  maxHeight: '150px',
                  mt: 1
                }}
              >
                {error.stack}
              </Box>
            </details>
          )}
          
          <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
            <CopyButton 
              text={JSON.stringify({
                message: error.message,
                status: error.status,
                code: error.code,
                errorId: error.errorId,
                details: isAdmin ? error.details : undefined,
                stack: isAdmin ? error.stack : undefined
              }, null, 2)} 
              label="Copy error details" 
            />
          </Box>
        </Alert>
      )}

      {/* Full Debug Info */}
      <details>
        <summary style={{ cursor: 'pointer', marginBottom: '8px' }}>
          <Typography variant="subtitle2" component="span">
            Full Debug Information
          </Typography>
        </summary>
        <Box sx={{ position: 'relative' }}>
          <Box 
            component="pre" 
            sx={{ 
              bgcolor: 'grey.100', 
              p: 1, 
              borderRadius: 1,
              fontSize: '12px',
              overflow: 'auto',
              maxHeight: '300px'
            }}
          >
            {JSON.stringify(debugInfo, null, 2)}
          </Box>
          <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
            <CopyButton 
              text={JSON.stringify(debugInfo, null, 2)} 
              label="Copy debug info" 
            />
          </Box>
        </Box>
      </details>

      {/* Recommendations */}
      {!id && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            ⚠️ No ID parameter received from React Router
          </Typography>
          <Typography variant="body2">
            Possible causes:
            <ul style={{ margin: '4px 0' }}>
              <li>Route not properly configured in App.jsx</li>
              <li>Navigation not passing ID parameter</li>
              <li>URL structure mismatch</li>
            </ul>
          </Typography>
        </Alert>
      )}

      {isError && !data && (
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            💡 API Error but no fallback data
          </Typography>
          <Typography variant="body2">
            The component should show mock data when API fails.
            Check the error handling in the React Query hook.
          </Typography>
        </Alert>
      )}
    </Paper>
  );
};

export default DetailPageDebugger;