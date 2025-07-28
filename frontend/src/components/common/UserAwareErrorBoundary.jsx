import React from 'react';
import { Container, Paper, Typography, Button, Box, Alert, Divider } from '@mui/material';
import { Home, Refresh, Email, BugReport } from '@mui/icons-material';
import authService from '../../services/auth.service';
import CopyButton from './CopyButton';
import { safeFormatDate } from '../../utils/safeDateUtils';

class UserAwareErrorBoundary extends React.Component {
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
    console.error(`[${this.props.pageName || 'App'} Error]:`, error);
    console.error('Error Info:', errorInfo);
    
    this.setState(prevState => ({ 
      error, 
      errorInfo,
      errorCount: prevState.errorCount + 1
    }));

    // Log to error tracking service in production
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to error tracking service like Sentry
      console.error('Production error logged:', {
        error: error.toString(),
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        user: authService.getCurrentUser()?.username,
        page: this.props.pageName
      });
    }
  }

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  formatFullError = () => {
    const user = authService.getCurrentUser();
    const { error, errorInfo, errorCount } = this.state;
    const pageName = this.props.pageName || 'Application';
    
    let errorReport = `❌ ${pageName} Error (Admin View)\n`;
    errorReport += `${error?.toString() || 'An unexpected error occurred'}\n`;
    errorReport += `Page: ${pageName}\n`;
    errorReport += `User: ${user?.username || 'Unknown'} (Admin)\n`;
    errorReport += `Error Count: ${errorCount}\n`;
    errorReport += `Time: ${safeFormatDate(new Date(), 'MM/dd/yyyy HH:mm:ss')}\n\n`;
    
    if (error?.stack) {
      errorReport += `Stack Trace:\n${error.stack}\n\n`;
    }
    
    if (errorInfo?.componentStack) {
      errorReport += `Component Stack:\n${errorInfo.componentStack}`;
    }
    
    return errorReport;
  };

  render() {
    if (this.state.hasError) {
      const user = authService.getCurrentUser();
      // Only show detailed error for system admin (username 'admin')
      const showDetailedError = user?.username === 'admin';

      // Friendly error page for regular users
      if (!showDetailedError) {
        return (
          <Box
            sx={{
              minHeight: '100vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'background.default',
              p: 2
            }}
          >
            <Container maxWidth="sm">
              <Paper 
                elevation={3} 
                sx={{ 
                  p: 5, 
                  textAlign: 'center',
                  borderRadius: 2
                }}
              >
                <Box sx={{ mb: 3 }}>
                  <BugReport sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
                  <Typography variant="h4" gutterBottom>
                    Oops! Something went wrong
                  </Typography>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    We're sorry, but this page encountered an unexpected error.
                    Don't worry, your data is safe.
                  </Typography>
                </Box>

                <Box sx={{ mb: 4 }}>
                  <Button
                    variant="contained"
                    startIcon={<Refresh />}
                    onClick={this.handleReload}
                    sx={{ mr: 2 }}
                  >
                    Reload Page
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Home />}
                    href="/"
                  >
                    Go Home
                  </Button>
                </Box>

                <Divider sx={{ my: 3 }} />

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  If this problem persists, please contact support:
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Email sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="body1">
                    <a 
                      href="mailto:support@jaydenmetz.com" 
                      style={{ color: 'inherit', textDecoration: 'none' }}
                    >
                      support@jaydenmetz.com
                    </a>
                  </Typography>
                </Box>

                {/* Error ID for support reference */}
                <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="caption" color="text.disabled">
                    Error ID: {Date.now()}-{Math.random().toString(36).substr(2, 9)}
                  </Typography>
                  <CopyButton 
                    text={`Error ID: ${Date.now()}-${Math.random().toString(36).substr(2, 9)}`} 
                    label="Copy error ID" 
                  />
                </Box>
              </Paper>
            </Container>
          </Box>
        );
      }

      // Detailed error page for admins
      return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
          <Paper sx={{ p: 4, bgcolor: 'error.light', color: 'error.contrastText', position: 'relative' }}>
            {/* Single copy button for entire error report */}
            <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
              <CopyButton 
                text={this.formatFullError()} 
                label="Copy full error report" 
              />
            </Box>
            
            <Typography variant="h4" gutterBottom sx={{ pr: 8 }}>
              ❌ {this.props.pageName || 'Application'} Error (Admin View)
            </Typography>
            
            <Alert severity="error" sx={{ mb: 3, bgcolor: 'white' }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    {this.state.error?.toString()}
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    Page: {this.props.pageName || 'Unknown'}<br />
                    User: {user?.username} (Admin)<br />
                    Error Count: {this.state.errorCount}<br />
                    Time: {safeFormatDate(new Date(), 'MM/dd/yyyy HH:mm:ss')}
                  </Typography>
                </Box>
              </Box>
            </Alert>

            <Box sx={{ mb: 3, position: 'relative' }}>
              <Typography variant="h6" gutterBottom>
                Stack Trace:
              </Typography>
              <Paper 
                sx={{ 
                  p: 2, 
                  bgcolor: 'grey.900', 
                  color: 'grey.100',
                  overflow: 'auto',
                  maxHeight: '300px',
                  position: 'relative'
                }}
              >
                <pre style={{ fontSize: '12px', margin: 0 }}>
                  {this.state.error?.stack}
                </pre>
                <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                  <CopyButton 
                    text={this.state.error?.stack || ''} 
                    label="Copy stack trace" 
                  />
                </Box>
              </Paper>
            </Box>

            <details style={{ marginBottom: '16px' }}>
              <summary style={{ cursor: 'pointer', marginBottom: '8px' }}>
                <Typography variant="subtitle1" component="span">
                  Component Stack (Click to expand)
                </Typography>
              </summary>
              <Box sx={{ position: 'relative' }}>
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
                <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                  <CopyButton 
                    text={this.state.errorInfo?.componentStack || ''} 
                    label="Copy component stack" 
                  />
                </Box>
              </Box>
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
                onClick={this.handleReload}
                sx={{ borderColor: 'white', color: 'white' }}
              >
                Reload Page
              </Button>
              <Button 
                variant="outlined" 
                onClick={() => window.history.back()}
                sx={{ borderColor: 'white', color: 'white' }}
              >
                Go Back
              </Button>
            </Box>

            <Typography variant="body2" sx={{ mt: 3, opacity: 0.8 }}>
              This detailed error view is only visible to administrators. 
              Regular users see a friendly error message.
            </Typography>
          </Paper>
        </Container>
      );
    }

    return this.props.children || null;
  }
}

export default UserAwareErrorBoundary;