import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { Error as ErrorIcon } from '@mui/icons-material';
import CopyButton from './CopyButton';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

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
          <Paper sx={{ p: 4, maxWidth: 600, textAlign: 'center' }}>
            <ErrorIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
            <Typography variant="h4" gutterBottom>
              Oops! Something went wrong
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
              <Typography variant="body1" color="text.secondary">
                {this.state.error && this.state.error.toString()}
              </Typography>
              {this.state.error && (
                <CopyButton 
                  text={this.state.error.toString()} 
                  label="Copy error message" 
                />
              )}
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
                <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                  <CopyButton 
                    text={this.state.errorInfo.componentStack} 
                    label="Copy component stack" 
                  />
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

    return this.props.children;
  }
}

export default ErrorBoundary;