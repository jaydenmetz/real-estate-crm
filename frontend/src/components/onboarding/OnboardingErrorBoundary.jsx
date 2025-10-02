import React from 'react';
import { Box, Container, Typography, Button, Paper } from '@mui/material';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

class OnboardingErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Onboarding Error:', error, errorInfo);
    this.setState({ errorInfo });

    // Log to error tracking service (Sentry, etc.)
    if (window.Sentry) {
      window.Sentry.captureException(error, {
        contexts: {
          onboarding: {
            step: this.props.step,
            component: errorInfo?.componentStack,
          }
        }
      });
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  handleSkip = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/?onboarding=skipped';
  };

  render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="md">
          <Box sx={{
            minHeight: 'calc(100vh - 120px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            py: 4
          }}>
            <Paper elevation={6} sx={{
              p: 4,
              textAlign: 'center',
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: 3,
              maxWidth: '500px'
            }}>
              <AlertTriangle size={64} color="#f59e0b" style={{ marginBottom: 16 }} />

              <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: '#1a1a1a' }}>
                Oops! Something went wrong
              </Typography>

              <Typography variant="body1" sx={{ color: '#666', mb: 3 }}>
                We encountered an issue while loading this step of the tutorial.
                Don't worry - your progress has been saved.
              </Typography>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <Box sx={{
                  mt: 2,
                  p: 2,
                  background: '#f5f5f5',
                  borderRadius: 2,
                  textAlign: 'left',
                  fontSize: '0.85rem',
                  fontFamily: 'monospace',
                  color: '#d32f2f',
                  overflow: 'auto',
                  maxHeight: '150px'
                }}>
                  <strong>Error:</strong> {this.state.error.toString()}
                </Box>
              )}

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 4 }}>
                <Button
                  variant="contained"
                  startIcon={<RefreshCw size={20} />}
                  onClick={this.handleRetry}
                  sx={{
                    background: 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)',
                    color: 'white',
                    px: 3,
                    py: 1.5,
                    '&:hover': {
                      background: 'linear-gradient(90deg, #2563eb 0%, #1d4ed8 100%)',
                    }
                  }}
                >
                  Try Again
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<Home size={20} />}
                  onClick={this.handleSkip}
                  sx={{
                    borderColor: '#3b82f6',
                    color: '#3b82f6',
                    px: 3,
                    py: 1.5,
                    '&:hover': {
                      borderColor: '#2563eb',
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    }
                  }}
                >
                  Skip Tutorial
                </Button>
              </Box>

              <Typography variant="caption" sx={{ display: 'block', mt: 3, color: '#999' }}>
                If this problem persists, please contact support
              </Typography>
            </Paper>
          </Box>
        </Container>
      );
    }

    return this.props.children;
  }
}

// HOC wrapper for functional components
export const withOnboardingErrorBoundary = (Component, step) => {
  return (props) => (
    <OnboardingErrorBoundary step={step}>
      <Component {...props} />
    </OnboardingErrorBoundary>
  );
};

export default OnboardingErrorBoundary;
