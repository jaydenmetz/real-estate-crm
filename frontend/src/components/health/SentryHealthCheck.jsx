import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Alert,
  Stack,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Paper,
  IconButton,
  Collapse,
  TextField,
} from '@mui/material';
import {
  CheckCircle,
  Error as ErrorIcon,
  Warning,
  BugReport,
  Speed,
  Memory,
  NavigateBefore,
  NavigateNext,
  Refresh,
  ExpandMore,
  ExpandLess,
  Send,
} from '@mui/icons-material';
import * as Sentry from '@sentry/react';
import { format } from 'date-fns';

const SentryHealthCheck = () => {
  const [testResults, setTestResults] = useState({});
  const [testing, setTesting] = useState(false);
  const [expanded, setExpanded] = useState({});
  const [customMessage, setCustomMessage] = useState('Test message from health check');

  const toggleExpanded = (key) => {
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const runSentryTests = async () => {
    setTesting(true);
    const results = {};

    // Test 1: Check Sentry initialization
    results.initialization = {
      name: 'Sentry Initialization',
      status: 'testing',
      details: 'Checking if Sentry is properly initialized...'
    };
    setTestResults({ ...results });

    try {
      const client = Sentry.getClient();
      const dsn = client?.getDsn();

      results.initialization = {
        name: 'Sentry Initialization',
        status: dsn ? 'success' : 'error',
        details: dsn ? `DSN: ${dsn.host}` : 'Sentry not initialized',
        data: {
          environment: client?.getOptions()?.environment || 'unknown',
          release: client?.getOptions()?.release || 'unknown',
          tracesSampleRate: client?.getOptions()?.tracesSampleRate || 0,
          replaysSessionSampleRate: client?.getOptions()?.replaysSessionSampleRate || 0,
        }
      };
    } catch (error) {
      results.initialization = {
        name: 'Sentry Initialization',
        status: 'error',
        details: error.message
      };
    }
    setTestResults({ ...results });

    // Test 2: User Context
    results.userContext = {
      name: 'User Context',
      status: 'testing',
      details: 'Checking user context...'
    };
    setTestResults({ ...results });

    try {
      const user = Sentry.getCurrentScope()?.getUser();
      results.userContext = {
        name: 'User Context',
        status: user && user.id ? 'success' : 'warning',
        details: user && user.id ? 'User context is set' : 'No user context set',
        data: user || {}
      };
    } catch (error) {
      results.userContext = {
        name: 'User Context',
        status: 'error',
        details: error.message
      };
    }
    setTestResults({ ...results });

    // Test 3: Send Test Error
    results.errorCapture = {
      name: 'Error Capture',
      status: 'testing',
      details: 'Sending test error...'
    };
    setTestResults({ ...results });

    try {
      const eventId = Sentry.captureException(new Error('Sentry Health Check - Test Error'), {
        tags: {
          test: 'health_check',
          timestamp: new Date().toISOString()
        },
        level: 'warning'
      });

      results.errorCapture = {
        name: 'Error Capture',
        status: eventId ? 'success' : 'error',
        details: eventId ? `Event sent: ${eventId}` : 'Failed to send error',
        eventId
      };
    } catch (error) {
      results.errorCapture = {
        name: 'Error Capture',
        status: 'error',
        details: error.message
      };
    }
    setTestResults({ ...results });

    // Test 4: Send Test Message
    results.messageCapture = {
      name: 'Message Capture',
      status: 'testing',
      details: 'Sending test message...'
    };
    setTestResults({ ...results });

    try {
      const eventId = Sentry.captureMessage('Sentry Health Check - Test Message', 'info');

      results.messageCapture = {
        name: 'Message Capture',
        status: eventId ? 'success' : 'error',
        details: eventId ? `Message sent: ${eventId}` : 'Failed to send message',
        eventId
      };
    } catch (error) {
      results.messageCapture = {
        name: 'Message Capture',
        status: 'error',
        details: error.message
      };
    }
    setTestResults({ ...results });

    // Test 5: Breadcrumbs
    results.breadcrumbs = {
      name: 'Breadcrumbs',
      status: 'testing',
      details: 'Adding test breadcrumb...'
    };
    setTestResults({ ...results });

    try {
      Sentry.addBreadcrumb({
        category: 'health_check',
        message: 'Health check breadcrumb',
        level: 'info',
        data: {
          timestamp: new Date().toISOString(),
          source: 'SentryHealthCheck'
        }
      });

      results.breadcrumbs = {
        name: 'Breadcrumbs',
        status: 'success',
        details: 'Breadcrumb added successfully'
      };
    } catch (error) {
      results.breadcrumbs = {
        name: 'Breadcrumbs',
        status: 'error',
        details: error.message
      };
    }
    setTestResults({ ...results });

    // Test 6: Custom Context
    results.customContext = {
      name: 'Custom Context',
      status: 'testing',
      details: 'Setting custom context...'
    };
    setTestResults({ ...results });

    try {
      Sentry.setContext('health_check', {
        test_run: new Date().toISOString(),
        component: 'SentryHealthCheck',
        version: '1.0.0'
      });

      results.customContext = {
        name: 'Custom Context',
        status: 'success',
        details: 'Custom context set successfully'
      };
    } catch (error) {
      results.customContext = {
        name: 'Custom Context',
        status: 'error',
        details: error.message
      };
    }
    setTestResults({ ...results });

    // Test 7: Performance Transaction
    results.performance = {
      name: 'Performance Monitoring',
      status: 'testing',
      details: 'Creating test transaction...'
    };
    setTestResults({ ...results });

    try {
      const transaction = Sentry.startTransaction({
        op: 'test',
        name: 'HealthCheck.testTransaction',
      });

      const span = transaction.startChild({
        op: 'test',
        description: 'Test span for health check',
      });

      // Simulate some work
      await new Promise(resolve => setTimeout(resolve, 100));

      span.finish();
      transaction.finish();

      results.performance = {
        name: 'Performance Monitoring',
        status: 'success',
        details: 'Transaction created and sent',
        data: {
          transactionName: 'HealthCheck.testTransaction',
          duration: '~100ms'
        }
      };
    } catch (error) {
      results.performance = {
        name: 'Performance Monitoring',
        status: 'error',
        details: error.message
      };
    }
    setTestResults({ ...results });

    // Test 8: Check Integrations
    results.integrations = {
      name: 'Integrations',
      status: 'testing',
      details: 'Checking integrations...'
    };
    setTestResults({ ...results });

    try {
      const client = Sentry.getClient();
      const integrations = client?.getIntegrations() || {};
      const integrationNames = Object.keys(integrations);

      results.integrations = {
        name: 'Integrations',
        status: integrationNames.length > 0 ? 'success' : 'warning',
        details: `${integrationNames.length} integrations active`,
        data: integrationNames
      };
    } catch (error) {
      results.integrations = {
        name: 'Integrations',
        status: 'error',
        details: error.message
      };
    }

    setTesting(false);
    setTestResults(results);
  };

  const sendCustomEvent = () => {
    if (customMessage.trim()) {
      const eventId = Sentry.captureMessage(customMessage, 'info');
      alert(`Custom message sent! Event ID: ${eventId}`);
    }
  };

  const triggerTestError = () => {
    try {
      throw new Error('Manual test error from Sentry Health Check');
    } catch (error) {
      Sentry.captureException(error);
      alert('Test error triggered and sent to Sentry!');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle color="success" />;
      case 'error':
        return <ErrorIcon color="error" />;
      case 'warning':
        return <Warning color="warning" />;
      case 'testing':
        return <LinearProgress sx={{ width: 20, height: 20 }} />;
      default:
        return <BugReport color="disabled" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'success.main';
      case 'error':
        return 'error.main';
      case 'warning':
        return 'warning.main';
      default:
        return 'text.secondary';
    }
  };

  const calculateScore = () => {
    const total = Object.keys(testResults).length;
    if (total === 0) return 0;

    const successful = Object.values(testResults).filter(r => r.status === 'success').length;
    return Math.round((successful / total) * 100);
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <BugReport sx={{ fontSize: 32, color: 'primary.main' }} />
            <Box>
              <Typography variant="h5" fontWeight="bold">
                Sentry Error Tracking
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Monitor error tracking and performance monitoring
              </Typography>
            </Box>
          </Box>
          {Object.keys(testResults).length > 0 && (
            <Chip
              label={`Score: ${calculateScore()}%`}
              color={calculateScore() >= 80 ? 'success' : calculateScore() >= 50 ? 'warning' : 'error'}
              size="large"
              sx={{ fontWeight: 'bold', fontSize: '1rem' }}
            />
          )}
        </Box>

        <Stack spacing={3}>
          {/* Test Controls */}
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Button
                variant="contained"
                startIcon={testing ? null : <Refresh />}
                onClick={runSentryTests}
                disabled={testing}
                fullWidth
              >
                {testing ? 'Running Tests...' : 'Run Sentry Tests'}
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={triggerTestError}
                fullWidth
              >
                Trigger Test Error
              </Button>
            </Stack>
          </Paper>

          {/* Custom Message Sender */}
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Send Custom Message
            </Typography>
            <Stack direction="row" spacing={1}>
              <TextField
                fullWidth
                size="small"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Enter a test message"
              />
              <Button
                variant="outlined"
                startIcon={<Send />}
                onClick={sendCustomEvent}
                disabled={!customMessage.trim()}
              >
                Send
              </Button>
            </Stack>
          </Paper>

          {/* Test Results */}
          {Object.keys(testResults).length > 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Test Results
              </Typography>
              <List sx={{ bgcolor: 'background.paper' }}>
                {Object.entries(testResults).map(([key, result], index) => (
                  <React.Fragment key={key}>
                    {index > 0 && <Divider />}
                    <ListItem>
                      <ListItemIcon>
                        {getStatusIcon(result.status)}
                      </ListItemIcon>
                      <ListItemText
                        primary={result.name}
                        secondary={result.details}
                        primaryTypographyProps={{ fontWeight: 'medium' }}
                        secondaryTypographyProps={{
                          color: getStatusColor(result.status),
                          component: 'div'
                        }}
                      />
                      {result.data && (
                        <IconButton onClick={() => toggleExpanded(key)} size="small">
                          {expanded[key] ? <ExpandLess /> : <ExpandMore />}
                        </IconButton>
                      )}
                    </ListItem>
                    {result.data && (
                      <Collapse in={expanded[key]} timeout="auto" unmountOnExit>
                        <Box sx={{ pl: 9, pr: 2, pb: 2 }}>
                          <Paper variant="outlined" sx={{ p: 1.5 }}>
                            <pre style={{
                              margin: 0,
                              fontSize: '0.85rem',
                              whiteSpace: 'pre-wrap',
                              wordBreak: 'break-word'
                            }}>
                              {JSON.stringify(result.data, null, 2)}
                            </pre>
                          </Paper>
                        </Box>
                      </Collapse>
                    )}
                  </React.Fragment>
                ))}
              </List>
            </Box>
          )}

          {/* Status Summary */}
          {Object.keys(testResults).length > 0 && (
            <Alert
              severity={calculateScore() >= 80 ? 'success' : calculateScore() >= 50 ? 'warning' : 'error'}
              sx={{ mt: 2 }}
            >
              <Typography variant="subtitle2" fontWeight="bold">
                Overall Status: {calculateScore()}% Healthy
              </Typography>
              <Typography variant="body2">
                {Object.values(testResults).filter(r => r.status === 'success').length} of {Object.keys(testResults).length} tests passed
              </Typography>
            </Alert>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default SentryHealthCheck;