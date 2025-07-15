import React from 'react';
import { Container, Alert, Typography, Button, Box, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CopyButton from './CopyButton';

class DetailPageErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error(`[${this.props.pageName} ErrorBoundary] Caught error:`, error);
    console.error(`[${this.props.pageName} ErrorBoundary] Error info:`, errorInfo);
    
    this.setState(prevState => ({ 
      error, 
      errorInfo,
      errorCount: prevState.errorCount + 1
    }));

    // Log to console with structured format
    console.group(`🚨 ${this.props.pageName} Error Details`);
    console.error('Error:', error.toString());
    console.error('Stack:', error.stack);
    console.error('Component Stack:', errorInfo.componentStack);
    console.error('Props at error:', this.props);
    console.groupEnd();
  }

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
  };

  formatFullError() {
    const { error, errorInfo, errorCount } = this.state;
    const { pageName } = this.props;
    
    return `❌ ${pageName} Crashed
Something went wrong while rendering this page
${error?.toString()}

Debug Information:
Page: ${pageName}
Error Count: ${errorCount}
URL: ${window.location.href}
Time: ${new Date().toLocaleString()}
Stack Trace (Click to expand)
${error?.stack || 'No stack trace available'}
Component Stack (Click to expand)
${errorInfo?.componentStack || 'No component stack available'}`;
  }

  render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
          <Paper sx={{ p: 4, bgcolor: 'error.light', color: 'error.contrastText', position: 'relative' }}>
            {/* Single copy button in top right */}
            <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
              <CopyButton 
                text={this.formatFullError()} 
                label="Copy error report" 
              />
            </Box>
            
            <Typography variant="h4" gutterBottom>
              ❌ {this.props.pageName} Crashed
            </Typography>
            
            <Alert severity="error" sx={{ mb: 3, bgcolor: 'white' }}>
              <Typography variant="h6" gutterBottom>
                Something went wrong while rendering this page
              </Typography>
              <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                {this.state.error?.toString()}
              </Typography>
            </Alert>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Debug Information:
              </Typography>
              <Paper sx={{ p: 2, bgcolor: 'grey.100', color: 'text.primary' }}>
                <Typography variant="body2" component="div">
                  <strong>Page:</strong> {this.props.pageName}<br />
                  <strong>Error Count:</strong> {this.state.errorCount}<br />
                  <strong>URL:</strong> {window.location.href}<br />
                  <strong>Time:</strong> {new Date().toLocaleString()}
                </Typography>
              </Paper>
            </Box>

            <details style={{ marginBottom: '16px' }}>
              <summary style={{ cursor: 'pointer', marginBottom: '8px' }}>
                <Typography variant="subtitle2" component="span">
                  Stack Trace (Click to expand)
                </Typography>
              </summary>
              <Paper 
                sx={{ 
                  p: 2, 
                  bgcolor: 'grey.900', 
                  color: 'grey.100',
                  overflow: 'auto',
                  maxHeight: '300px'
                }}
              >
                <pre style={{ fontSize: '12px', margin: 0 }}>
                  {this.state.error?.stack}
                </pre>
              </Paper>
            </details>

            <details style={{ marginBottom: '16px' }}>
              <summary style={{ cursor: 'pointer', marginBottom: '8px' }}>
                <Typography variant="subtitle2" component="span">
                  Component Stack (Click to expand)
                </Typography>
              </summary>
              <Paper 
                sx={{ 
                  p: 2, 
                  bgcolor: 'grey.900', 
                  color: 'grey.100',
                  overflow: 'auto',
                  maxHeight: '300px'
                }}
              >
                <pre style={{ fontSize: '12px', margin: 0 }}>
                  {this.state.errorInfo?.componentStack}
                </pre>
              </Paper>
            </details>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button 
                variant="contained" 
                onClick={this.handleReset}
                sx={{ bgcolor: 'white', color: 'error.main' }}
              >
                Try Again
              </Button>
              <Button 
                variant="outlined" 
                onClick={() => window.history.back()}
                sx={{ borderColor: 'white', color: 'white' }}
              >
                Go Back
              </Button>
            </Box>
          </Paper>
        </Container>
      );
    }

    return this.props.children;
  }
}

// Functional wrapper to use hooks
const DetailPageErrorBoundaryWrapper = ({ pageName, children }) => {
  return (
    <DetailPageErrorBoundary pageName={pageName}>
      {children}
    </DetailPageErrorBoundary>
  );
};

export default DetailPageErrorBoundaryWrapper;