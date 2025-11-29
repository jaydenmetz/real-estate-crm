import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { Error as ErrorIcon } from '@mui/icons-material';
import * as Sentry from '@sentry/react';
import CopyButton from './CopyButton';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null, eventId: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);

    // Send error to Sentry with React context and get event ID
    const eventId = Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack
        }
      },
      tags: {
        component: 'ErrorBoundary',
        location: window.location.pathname
      },
      level: 'error'
    });

    this.setState({
      error: error,
      errorInfo: errorInfo,
      eventId: eventId
    });
  }

  formatFullError = () => {
    const { error, errorInfo } = this.state;
    let errorReport = `❌ Something went wrong\n`;
    errorReport += `${error?.toString() || 'An unexpected error occurred'}\n\n`;
    
    if (process.env.NODE_ENV === 'development' && errorInfo?.componentStack) {
      errorReport += `Component Stack:\n${errorInfo.componentStack}`;
    }
    
    return errorReport;
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          p: 3
        }}>
          <Paper sx={{ p: 4, maxWidth: 600, textAlign: 'center', position: 'relative' }}>
            {/* Single copy button for entire error report */}
            <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
              <CopyButton 
                text={this.formatFullError()} 
                label="Copy full error report" 
              />
            </Box>
            
            <ErrorIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
            <Typography variant="h4" gutterBottom>
              Oops! Something went wrong
            </Typography>
            <Box sx={{ mb: 3 }}>
              <Typography variant="body1" color="text.secondary">
                {this.state.error && this.state.error.toString()}
              </Typography>
            </Box>
            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <Box sx={{ position: 'relative' }}>
                <Box sx={{ 
                  mt: 2, 
                  p: 2, 
                  bgcolor: 'grey.100', 
                  borderRadius: 1,
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  fontFamily: 'monospace',
                  overflow: 'auto',
                  maxHeight: 200
                }}>
                  {this.state.errorInfo.componentStack}
                </Box>
              </Box>
            )}
            <Button
              variant="contained"
              onClick={() => window.location.reload()}
              sx={{ mt: 3 }}
            >
              Reload Page
            </Button>
          </Paper>
        </Box>
      );
    }

    return this.props.children || null;
  }
}

export default ErrorBoundary;