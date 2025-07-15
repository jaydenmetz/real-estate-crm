import React from 'react';
import { Paper, Typography, Alert, Box, Chip, Divider } from '@mui/material';
import CopyButton from './CopyButton';
import { getSafeTimestamp } from '../../utils/safeDateUtils';

const DetailPageDebugger = ({ 
  pageName, 
  id, 
  isLoading, 
  isError, 
  error, 
  data, 
  additionalInfo = {} 
}) => {
  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

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
        <Typography variant="h6">
          🔍 Debug Panel: {pageName}
        </Typography>
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
          <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
            <CopyButton 
              text={`Error: ${error.message || 'Unknown error'}${error.status ? `\nStatus: ${error.status}` : ''}`} 
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