import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Alert,
  Chip,
  Divider,
  IconButton,
  Collapse
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Error as ErrorIcon,
  BugReport as BugIcon,
  ContentCopy as CopyIcon,
  Refresh as RefreshIcon,
  Code as CodeIcon,
  Api as ApiIcon,
  Storage as DataIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const DebugContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  margin: theme.spacing(2),
  backgroundColor: '#1e1e1e',
  color: '#d4d4d4',
  fontFamily: 'Consolas, Monaco, "Courier New", monospace',
  borderRadius: theme.spacing(1),
  border: '1px solid #ff6b6b'
}));

const CodeBlock = styled(Box)(({ theme }) => ({
  backgroundColor: '#2d2d2d',
  padding: theme.spacing(2),
  borderRadius: theme.spacing(0.5),
  overflowX: 'auto',
  fontSize: '0.875rem',
  lineHeight: 1.6,
  border: '1px solid #3d3d3d',
  '& pre': {
    margin: 0,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word'
  }
}));

const ErrorHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(2),
  padding: theme.spacing(2),
  backgroundColor: 'rgba(255, 107, 107, 0.1)',
  borderRadius: theme.spacing(1),
  border: '1px solid rgba(255, 107, 107, 0.3)'
}));

const InfoRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  marginBottom: theme.spacing(1),
  '& .label': {
    minWidth: 150,
    fontWeight: 600,
    color: '#9ca3af',
    marginRight: theme.spacing(2)
  },
  '& .value': {
    flex: 1,
    color: '#e5e7eb',
    wordBreak: 'break-all'
  }
}));

function DebugError({ 
  error, 
  apiEndpoint, 
  requestData, 
  responseData, 
  additionalInfo,
  onRetry 
}) {
  const [showFullError, setShowFullError] = useState(false);
  const [copiedSection, setCopiedSection] = useState(null);

  const copyToClipboard = (text, section) => {
    navigator.clipboard.writeText(typeof text === 'object' ? JSON.stringify(text, null, 2) : text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const formatJSON = (obj) => {
    if (!obj) return 'null';
    if (typeof obj === 'string') return obj;
    return JSON.stringify(obj, null, 2);
  };

  // Get environment info
  const envInfo = {
    environment: process.env.NODE_ENV,
    apiBaseUrl: window.location.hostname === 'localhost' 
      ? 'http://localhost:5050' 
      : 'https://api.jaydenmetz.com',
    currentUrl: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString()
  };

  return (
    <DebugContainer elevation={3}>
      <ErrorHeader>
        <ErrorIcon sx={{ fontSize: 32, color: '#ff6b6b' }} />
        <Box flex={1}>
          <Typography variant="h5" sx={{ color: '#ff6b6b', fontWeight: 600 }}>
            Debug Error Information
          </Typography>
          <Typography variant="body2" sx={{ color: '#9ca3af', mt: 0.5 }}>
            {error?.message || 'An error occurred while fetching data'}
          </Typography>
        </Box>
        {onRetry && (
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={onRetry}
            sx={{ 
              bgcolor: '#764ba2',
              '&:hover': { bgcolor: '#5a3a80' }
            }}
          >
            Retry
          </Button>
        )}
      </ErrorHeader>

      {/* Quick Info */}
      <Alert severity="error" sx={{ mb: 2, bgcolor: 'rgba(255, 107, 107, 0.05)' }}>
        <Typography variant="subtitle2" fontWeight="600" gutterBottom>
          Quick Diagnosis:
        </Typography>
        <Typography variant="body2">
          {error?.message?.includes('non-JSON') && 
            "The API returned HTML instead of JSON. This usually means the endpoint doesn't exist or the backend server is not running."}
          {error?.message?.includes('NetworkError') && 
            "Network error - the backend server might be down or unreachable."}
          {error?.message?.includes('404') && 
            "404 Not Found - the requested resource doesn't exist."}
          {error?.message?.includes('500') && 
            "500 Server Error - the backend encountered an error."}
          {!error?.message && 
            "Unknown error - check the details below for more information."}
        </Typography>
      </Alert>

      {/* API Endpoint Info */}
      <Accordion defaultExpanded sx={{ bgcolor: '#2d2d2d', mb: 1 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#9ca3af' }} />}>
          <ApiIcon sx={{ mr: 1, color: '#60a5fa' }} />
          <Typography sx={{ color: '#60a5fa', fontWeight: 600 }}>
            API Request Details
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <InfoRow>
            <span className="label">Endpoint:</span>
            <span className="value">{apiEndpoint || 'Unknown'}</span>
          </InfoRow>
          <InfoRow>
            <span className="label">Full URL:</span>
            <span className="value">{`${envInfo.apiBaseUrl}${apiEndpoint}`}</span>
          </InfoRow>
          <InfoRow>
            <span className="label">Method:</span>
            <span className="value">GET</span>
          </InfoRow>
          <InfoRow>
            <span className="label">Expected API Base:</span>
            <span className="value">{envInfo.apiBaseUrl}</span>
          </InfoRow>
          {requestData && (
            <Box mt={2}>
              <Typography variant="subtitle2" sx={{ color: '#9ca3af', mb: 1 }}>
                Request Data:
              </Typography>
              <CodeBlock>
                <pre>{formatJSON(requestData)}</pre>
              </CodeBlock>
            </Box>
          )}
        </AccordionDetails>
      </Accordion>

      {/* Response Data */}
      {responseData && (
        <Accordion sx={{ bgcolor: '#2d2d2d', mb: 1 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#9ca3af' }} />}>
            <DataIcon sx={{ mr: 1, color: '#10b981' }} />
            <Typography sx={{ color: '#10b981', fontWeight: 600 }}>
              Response Data
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box position="relative">
              <IconButton
                size="small"
                onClick={() => copyToClipboard(responseData, 'response')}
                sx={{ position: 'absolute', top: 0, right: 0, color: '#9ca3af' }}
              >
                <CopyIcon fontSize="small" />
              </IconButton>
              {copiedSection === 'response' && (
                <Chip 
                  label="Copied!" 
                  size="small" 
                  sx={{ position: 'absolute', top: 8, right: 40 }}
                />
              )}
              <CodeBlock>
                <pre>{formatJSON(responseData)}</pre>
              </CodeBlock>
            </Box>
          </AccordionDetails>
        </Accordion>
      )}

      {/* Error Stack */}
      <Accordion sx={{ bgcolor: '#2d2d2d', mb: 1 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#9ca3af' }} />}>
          <BugIcon sx={{ mr: 1, color: '#ff6b6b' }} />
          <Typography sx={{ color: '#ff6b6b', fontWeight: 600 }}>
            Error Details
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <InfoRow>
            <span className="label">Error Type:</span>
            <span className="value">{error?.name || 'Error'}</span>
          </InfoRow>
          <InfoRow>
            <span className="label">Message:</span>
            <span className="value">{error?.message || 'No message'}</span>
          </InfoRow>
          {error?.stack && (
            <Box mt={2}>
              <Typography variant="subtitle2" sx={{ color: '#9ca3af', mb: 1 }}>
                Stack Trace:
              </Typography>
              <CodeBlock>
                <pre style={{ fontSize: '0.75rem' }}>{error.stack}</pre>
              </CodeBlock>
            </Box>
          )}
        </AccordionDetails>
      </Accordion>

      {/* Environment Info */}
      <Accordion sx={{ bgcolor: '#2d2d2d', mb: 1 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#9ca3af' }} />}>
          <CodeIcon sx={{ mr: 1, color: '#a78bfa' }} />
          <Typography sx={{ color: '#a78bfa', fontWeight: 600 }}>
            Environment Information
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          {Object.entries(envInfo).map(([key, value]) => (
            <InfoRow key={key}>
              <span className="label">{key}:</span>
              <span className="value">{value}</span>
            </InfoRow>
          ))}
        </AccordionDetails>
      </Accordion>

      {/* Additional Info */}
      {additionalInfo && (
        <Accordion sx={{ bgcolor: '#2d2d2d' }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#9ca3af' }} />}>
            <Typography sx={{ color: '#fbbf24', fontWeight: 600 }}>
              Additional Information
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <CodeBlock>
              <pre>{formatJSON(additionalInfo)}</pre>
            </CodeBlock>
          </AccordionDetails>
        </Accordion>
      )}

      {/* Action Buttons */}
      <Box mt={3} display="flex" gap={2}>
        <Button
          variant="outlined"
          onClick={() => window.location.reload()}
          sx={{ 
            borderColor: '#9ca3af',
            color: '#9ca3af',
            '&:hover': {
              borderColor: '#e5e7eb',
              bgcolor: 'rgba(229, 231, 235, 0.1)'
            }
          }}
        >
          Reload Page
        </Button>
        <Button
          variant="outlined"
          onClick={() => copyToClipboard(JSON.stringify({
            error: {
              message: error?.message,
              stack: error?.stack
            },
            api: {
              endpoint: apiEndpoint,
              fullUrl: `${envInfo.apiBaseUrl}${apiEndpoint}`
            },
            environment: envInfo,
            response: responseData
          }, null, 2), 'all')}
          sx={{ 
            borderColor: '#9ca3af',
            color: '#9ca3af',
            '&:hover': {
              borderColor: '#e5e7eb',
              bgcolor: 'rgba(229, 231, 235, 0.1)'
            }
          }}
        >
          Copy All Debug Info
        </Button>
        {copiedSection === 'all' && (
          <Chip 
            label="Copied all debug info!" 
            color="success"
            sx={{ alignSelf: 'center' }}
          />
        )}
      </Box>
    </DebugContainer>
  );
}

export default DebugError;