import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Chip,
  Stack,
  Divider,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Collapse,
} from '@mui/material';
import {
  ExpandMore,
  Error as ErrorIcon,
  BugReport,
  ContentCopy,
  Refresh,
  Code,
  Warning,
  CheckCircle,
  Info,
  GitHub,
  Storage,
  Memory,
  Speed,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import CopyButton from '../ui/CopyButton';

const ErrorContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  maxWidth: 1200,
  margin: '40px auto',
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.spacing(2),
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
}));

const CodeBlock = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.grey[900],
  color: theme.palette.common.white,
  padding: theme.spacing(2),
  borderRadius: theme.spacing(1),
  fontFamily: 'Monaco, Consolas, "Courier New", monospace',
  fontSize: '0.875rem',
  overflow: 'auto',
  maxHeight: 400,
  '& pre': {
    margin: 0,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
}));

class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
      expanded: {
        stack: true,
        component: true,
        diagnostics: false,
        suggestions: true,
      },
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console for development
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Update state with error details
    this.setState(prevState => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }));

    // You could also log to an error reporting service here
    // logErrorToService(error, errorInfo);
  }

  handleExpandChange = (panel) => (event, isExpanded) => {
    this.setState(prevState => ({
      expanded: {
        ...prevState.expanded,
        [panel]: isExpanded,
      },
    }));
  };

  getCommonIssues = () => {
    const { error } = this.state;
    const errorMessage = error?.message || '';
    const issues = [];

    // Check for common React errors
    if (errorMessage.includes('Cannot read properties of undefined')) {
      const match = errorMessage.match(/reading '(\w+)'/);
      const property = match ? match[1] : 'unknown';
      issues.push({
        type: 'error',
        title: 'Undefined Property Access',
        description: `Trying to access property '${property}' on an undefined object`,
        suggestions: [
          'Add null/undefined checks before accessing object properties',
          'Ensure data is loaded before rendering components',
          'Check if async data is properly handled with loading states',
          'Verify that all required props are being passed to components',
        ],
      });
    }

    if (errorMessage.includes('Cannot read properties of null')) {
      issues.push({
        type: 'error',
        title: 'Null Property Access',
        description: 'Trying to access a property on a null value',
        suggestions: [
          'Add null checks before accessing object properties',
          'Initialize state with default values instead of null',
          'Check API responses for null values',
        ],
      });
    }

    if (errorMessage.includes('is not a function')) {
      issues.push({
        type: 'error',
        title: 'Invalid Function Call',
        description: 'Attempting to call something that is not a function',
        suggestions: [
          'Verify the import path is correct',
          'Check if the function exists on the object',
          'Ensure props are of the expected type',
          'Look for typos in function names',
        ],
      });
    }

    if (errorMessage.includes('ResizeObserver')) {
      issues.push({
        type: 'warning',
        title: 'ResizeObserver Loop Error',
        description: 'Common browser warning that can usually be safely ignored',
        suggestions: [
          'This is often caused by third-party libraries',
          'Usually does not affect functionality',
          'Can be suppressed if needed',
        ],
      });
    }

    if (errorMessage.includes('Network request failed') || errorMessage.includes('fetch')) {
      issues.push({
        type: 'error',
        title: 'Network Error',
        description: 'Failed to fetch data from the server',
        suggestions: [
          'Check if the backend server is running',
          'Verify API endpoints are correct',
          'Check for CORS issues',
          'Ensure authentication tokens are valid',
        ],
      });
    }

    if (errorMessage.includes('style')) {
      issues.push({
        type: 'error',
        title: 'Style Property Access Error',
        description: 'Trying to access style property on undefined element',
        suggestions: [
          'Check if DOM element exists before accessing style',
          'Ensure refs are properly initialized',
          'Verify third-party components are properly imported',
          'Add mounted checks for chart/visualization components',
        ],
      });
    }

    return issues;
  };

  generateDebugReport = () => {
    const { error, errorInfo, errorCount } = this.state;
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const timestamp = new Date().toISOString();
    
    const report = {
      '❌ Application Error (Admin View)': {
        message: error?.message || 'Unknown error',
        page: window.location.pathname,
        user: `${user.username || 'unknown'} (${user.role || 'Unknown Role'})`,
        errorCount: errorCount,
        time: new Date().toLocaleString(),
      },
      'Stack Trace': error?.stack || 'No stack trace available',
      'Component Stack': errorInfo?.componentStack || 'No component stack available',
      'Browser Info': {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        onLine: navigator.onLine,
        cookieEnabled: navigator.cookieEnabled,
      },
      'Window Info': {
        location: window.location.href,
        referrer: document.referrer,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        windowSize: `${window.innerWidth}x${window.innerHeight}`,
        pixelRatio: window.devicePixelRatio,
      },
      'Application State': {
        authenticated: !!localStorage.getItem('token'),
        user: user,
        theme: localStorage.getItem('theme') || 'default',
        env: process.env.NODE_ENV,
        apiUrl: process.env.REACT_APP_API_URL || 'not set',
      },
      'Common Issues Detected': this.getCommonIssues(),
      'Debug Timestamp': timestamp,
    };

    return report;
  };

  formatForCopy = () => {
    const report = this.generateDebugReport();
    const { error, errorInfo } = this.state;
    
    let formatted = `❌ Application Error (Admin View)\n`;
    formatted += `${error?.name || 'Error'}: ${error?.message || 'Unknown error'}\n`;
    formatted += `Page: ${window.location.pathname}\n`;
    formatted += `User: ${report['❌ Application Error (Admin View)'].user}\n`;
    formatted += `Error Count: ${report['❌ Application Error (Admin View)'].errorCount}\n`;
    formatted += `Time: ${report['❌ Application Error (Admin View)'].time}\n\n`;
    
    formatted += `Stack Trace:\n${error?.stack || 'No stack trace available'}\n\n`;
    
    formatted += `Component Stack:\n${errorInfo?.componentStack || 'No component stack available'}\n\n`;
    
    // Add common issues if any were detected
    const issues = this.getCommonIssues();
    if (issues.length > 0) {
      formatted += `Detected Issues:\n`;
      issues.forEach(issue => {
        formatted += `\n- ${issue.title}: ${issue.description}\n`;
        formatted += `  Suggestions:\n`;
        issue.suggestions.forEach(suggestion => {
          formatted += `    • ${suggestion}\n`;
        });
      });
    }
    
    return formatted;
  };

  render() {
    const { hasError, error, errorInfo, expanded } = this.state;
    const { children } = this.props;

    if (!hasError) {
      return children || null;
    }

    const commonIssues = this.getCommonIssues();
    const debugReport = this.generateDebugReport();

    return (
      <ErrorContainer elevation={3}>
        <Stack spacing={3}>
          {/* Header */}
          <Box>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
              <ErrorIcon color="error" sx={{ fontSize: 40 }} />
              <Box flex={1}>
                <Typography variant="h4" color="error" gutterBottom>
                  Application Error
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  {error?.message || 'An unexpected error occurred'}
                </Typography>
              </Box>
              <Stack direction="row" spacing={1}>
                <CopyButton
                  text={this.formatForCopy()}
                  variant="contained"
                  color="primary"
                  size="large"
                  startIcon={<ContentCopy />}
                >
                  Copy Error Report
                </CopyButton>
                <Button
                  variant="outlined"
                  onClick={() => window.location.reload()}
                  startIcon={<Refresh />}
                >
                  Reload Page
                </Button>
              </Stack>
            </Stack>

            {/* Quick Stats */}
            <Stack direction="row" spacing={2}>
              <Chip
                icon={<BugReport />}
                label={`Error #${this.state.errorCount}`}
                color="error"
                variant="outlined"
              />
              <Chip
                icon={<Memory />}
                label={error?.name || 'Unknown Error'}
                color="default"
                variant="outlined"
              />
              <Chip
                icon={<Speed />}
                label={new Date().toLocaleTimeString()}
                color="default"
                variant="outlined"
              />
            </Stack>
          </Box>

          <Divider />

          {/* Common Issues Alert */}
          {commonIssues.length > 0 && (
            <Accordion
              expanded={expanded.suggestions}
              onChange={this.handleExpandChange('suggestions')}
              sx={{ backgroundColor: 'action.hover' }}
            >
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Info color="info" />
                  <Typography variant="h6">
                    Detected Issues & Suggestions ({commonIssues.length})
                  </Typography>
                </Stack>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={2}>
                  {commonIssues.map((issue, index) => (
                    <Alert
                      key={index}
                      severity={issue.type}
                      icon={issue.type === 'error' ? <ErrorIcon /> : <Warning />}
                    >
                      <Typography variant="subtitle2" fontWeight="bold">
                        {issue.title}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5, mb: 1 }}>
                        {issue.description}
                      </Typography>
                      <List dense sx={{ pl: 2 }}>
                        {issue.suggestions.map((suggestion, idx) => (
                          <ListItem key={idx} sx={{ py: 0 }}>
                            <ListItemText
                              primary={`• ${suggestion}`}
                              primaryTypographyProps={{ variant: 'body2' }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Alert>
                  ))}
                </Stack>
              </AccordionDetails>
            </Accordion>
          )}

          {/* Stack Trace */}
          <Accordion
            expanded={expanded.stack}
            onChange={this.handleExpandChange('stack')}
          >
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Code />
                <Typography variant="h6">Stack Trace</Typography>
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <CodeBlock>
                <pre>{error?.stack || 'No stack trace available'}</pre>
              </CodeBlock>
            </AccordionDetails>
          </Accordion>

          {/* Component Stack */}
          <Accordion
            expanded={expanded.component}
            onChange={this.handleExpandChange('component')}
          >
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Storage />
                <Typography variant="h6">Component Stack</Typography>
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <CodeBlock>
                <pre>{errorInfo?.componentStack || 'No component stack available'}</pre>
              </CodeBlock>
            </AccordionDetails>
          </Accordion>

          {/* Diagnostics */}
          <Accordion
            expanded={expanded.diagnostics}
            onChange={this.handleExpandChange('diagnostics')}
          >
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Speed />
                <Typography variant="h6">Diagnostics</Typography>
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <CodeBlock>
                <pre>{JSON.stringify(debugReport, null, 2)}</pre>
              </CodeBlock>
            </AccordionDetails>
          </Accordion>

          {/* Footer */}
          <Box sx={{ pt: 2 }}>
            <Typography variant="body2" color="text.secondary" align="center">
              This error has been logged. You can copy the full error report above to share with developers.
            </Typography>
          </Box>
        </Stack>
      </ErrorContainer>
    );
  }
}

export default GlobalErrorBoundary;