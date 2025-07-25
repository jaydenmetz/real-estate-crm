import React, { useState } from 'react';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Collapse,
  IconButton,
  Paper,
  Typography,
  Chip,
  Divider,
  Stack
} from '@mui/material';
import {
  ExpandMore,
  ExpandLess,
  BugReport,
  ContentCopy,
  CheckCircle,
  Error as ErrorIcon,
  Info
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const AdminErrorDisplay = ({ error, errorId }) => {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const isAdmin = user && (user.role === 'admin' || user.role === 'system_admin');
  
  if (!error || !isAdmin) {
    // Regular error display for non-admin users
    return (
      <Alert severity="error">
        <AlertTitle>Error</AlertTitle>
        {error?.message || 'An unexpected error occurred'}
        {errorId && (
          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
            Error ID: {errorId}
          </Typography>
        )}
      </Alert>
    );
  }
  
  const handleCopyError = () => {
    const errorData = {
      errorId,
      timestamp: new Date().toISOString(),
      ...error
    };
    
    navigator.clipboard.writeText(JSON.stringify(errorData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <Paper elevation={3} sx={{ p: 2, bgcolor: 'error.light', color: 'error.contrastText' }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
        <Box display="flex" alignItems="center" gap={1}>
          <BugReport />
          <Typography variant="h6">Debug Error Information</Typography>
          <Chip 
            label="Admin Only" 
            size="small" 
            color="warning"
            icon={<Info fontSize="small" />}
          />
        </Box>
        <Box>
          <IconButton 
            size="small" 
            onClick={handleCopyError}
            sx={{ color: 'inherit' }}
          >
            {copied ? <CheckCircle /> : <ContentCopy />}
          </IconButton>
          <IconButton
            size="small"
            onClick={() => setExpanded(!expanded)}
            sx={{ color: 'inherit' }}
          >
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Box>
      </Box>
      
      <Stack spacing={1}>
        <Box>
          <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>
            Error Message:
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            {error.message}
          </Typography>
        </Box>
        
        {error.code && (
          <Box display="flex" gap={1} alignItems="center">
            <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>
              Error Code:
            </Typography>
            <Chip label={error.code} size="small" sx={{ bgcolor: 'rgba(0,0,0,0.2)' }} />
          </Box>
        )}
        
        {errorId && (
          <Box display="flex" gap={1} alignItems="center">
            <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>
              Error ID:
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
              {errorId}
            </Typography>
          </Box>
        )}
      </Stack>
      
      <Collapse in={expanded}>
        <Divider sx={{ my: 2, borderColor: 'rgba(0,0,0,0.2)' }} />
        
        {error.details && (
          <Box mb={2}>
            <Typography variant="subtitle2" sx={{ opacity: 0.8, mb: 1 }}>
              Error Details:
            </Typography>
            <Paper 
              sx={{ 
                p: 1, 
                bgcolor: 'rgba(0,0,0,0.1)',
                maxHeight: 200,
                overflowY: 'auto'
              }}
            >
              <pre style={{ margin: 0, fontSize: '0.85rem' }}>
                {JSON.stringify(error.details, null, 2)}
              </pre>
            </Paper>
          </Box>
        )}
        
        {error.stack && (
          <Box>
            <Typography variant="subtitle2" sx={{ opacity: 0.8, mb: 1 }}>
              Stack Trace:
            </Typography>
            <Paper 
              sx={{ 
                p: 1, 
                bgcolor: 'rgba(0,0,0,0.1)',
                maxHeight: 300,
                overflowY: 'auto'
              }}
            >
              <pre style={{ 
                margin: 0, 
                fontSize: '0.75rem',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}>
                {error.stack}
              </pre>
            </Paper>
          </Box>
        )}
        
        <Box mt={2}>
          <Typography variant="caption" sx={{ opacity: 0.7 }}>
            This detailed error information is only visible to admin users.
          </Typography>
        </Box>
      </Collapse>
    </Paper>
  );
};

export default AdminErrorDisplay;