import { useState, useEffect, useCallback } from 'react';
import { api, apiKeysAPI } from '../../services/api.service';
import { formatCurlCommand } from '../../utils/formatCurl';
import websocketService from '../../services/websocket.service';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  Grid,
  Paper,
  IconButton,
  Collapse,
  Chip,
  Tooltip,
  Snackbar,
  Alert,
  Stack,
  Tabs,
  Tab,
  TextField,
  Button
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Cancel as ErrorIcon,
  ExpandMore as ExpandIcon,
  ContentCopy as CopyIcon,
  Refresh as RefreshIcon,
  PlayArrow as PlayIcon,
  Warning as WarningIcon,
  Speed as SpeedIcon,
  Search as SearchIcon,
  BugReport as BugIcon,
  Add as AddIcon,
  Edit as EditIcon,
  VpnKey as ApiKeyIcon,
  Token as JwtIcon,
  Dashboard as DashboardIcon,
  WifiTethering as WebSocketIcon,
  PowerSettingsNew as PowerIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Styled Components
export const PageContainer = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  minHeight: '100vh',
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(3)
}));

export const TestCard = styled(Card)(({ status }) => ({
  marginBottom: '16px',
  border: '2px solid',
  borderColor: status === 'success' ? '#4caf50' :
               status === 'failed' ? '#f44336' :
               status === 'warning' ? '#ff9800' :
               status === 'running' ? '#9e9e9e' : '#e0e0e0',
  backgroundColor: status === 'success' ? '#f1f8e9' :
                   status === 'failed' ? '#ffebee' :
                   status === 'warning' ? '#fff3e0' :
                   status === 'running' ? '#f5f5f5' : '#fafafa',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.12)'
  }
}));

export const ExpandButton = styled(IconButton)(({ expanded }) => ({
  transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
  transition: 'transform 0.3s'
}));

export const CodeBlock = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: '#1e1e1e',
  color: '#d4d4d4',
  fontFamily: 'Monaco, Consolas, "Courier New", monospace',
  fontSize: '0.875rem',
  overflow: 'auto',
  borderRadius: theme.spacing(1),
  position: 'relative',
  marginTop: theme.spacing(2),
  maxHeight: '400px'
}));

export const CopyButton = styled(IconButton)({
  position: 'absolute',
  top: 8,
  right: 8,
  color: '#888',
  '&:hover': {
    color: '#fff'
  }
});

export const StyledTabs = styled(Tabs)(({ theme }) => ({
  backgroundColor: 'white',
  borderRadius: theme.spacing(1),
  marginBottom: theme.spacing(3),
  '& .MuiTabs-indicator': {
    backgroundColor: theme.palette.primary.main,
    height: 3
  }
}));

export const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '1rem',
  marginRight: theme.spacing(1),
  minHeight: 64,
  '&.Mui-selected': {
    color: theme.palette.primary.main
  }
}));

export const AuthInputBox = styled(Box)(({ theme }) => ({
  backgroundColor: 'white',
  borderRadius: theme.spacing(1),
  padding: theme.spacing(2),
  marginBottom: theme.spacing(3),
  border: '1px solid #e0e0e0'
}));

// TestSection Component
export const TestSection = ({ title, tests, icon: Icon, expanded, onToggle }) => {
  if (!tests || tests.length === 0) return null;

  const passedCount = tests.filter(t => t.status === 'success').length;
  const failedCount = tests.filter(t => t.status === 'failed').length;
  const warningCount = tests.filter(t => t.status === 'warning').length;

  return (
    <Box mb={3}>
      <Paper
        elevation={3}
        onClick={onToggle}
        sx={{
          p: 2,
          cursor: 'pointer',
          backgroundColor: '#f5f5f5',
          '&:hover': { backgroundColor: '#eeeeee' }
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            {Icon && <Icon />}
            <Typography variant="h6" fontWeight="bold">
              {title}
            </Typography>
            <Chip label={`${tests.length} tests`} size="small" />
            {passedCount > 0 && (
              <Chip
                icon={<CheckIcon />}
                label={passedCount}
                size="small"
                color="success"
                variant="outlined"
              />
            )}
            {failedCount > 0 && (
              <Chip
                icon={<ErrorIcon />}
                label={failedCount}
                size="small"
                color="error"
                variant="outlined"
              />
            )}
            {warningCount > 0 && (
              <Chip
                icon={<WarningIcon />}
                label={warningCount}
                size="small"
                color="warning"
                variant="outlined"
              />
            )}
          </Box>
          <ExpandButton expanded={expanded}>
            <ExpandIcon />
          </ExpandButton>
        </Box>
      </Paper>
      <Collapse in={expanded}>
        <Box mt={2}>
          {tests.map((test, index) => (
            <TestResult key={index} test={test} />
          ))}
        </Box>
      </Collapse>
    </Box>
  );
};

// TestResult Component
export const TestResult = ({ test }) => {
  const [expanded, setExpanded] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const getIcon = () => {
    switch(test.status) {
      case 'success': return <CheckIcon sx={{ color: '#4caf50' }} />;
      case 'failed': return <ErrorIcon sx={{ color: '#f44336' }} />;
      case 'warning': return <WarningIcon sx={{ color: '#ff9800' }} />;
      default: return null;
    }
  };

  const getMethodColor = (method) => {
    switch(method) {
      case 'GET': return 'success';
      case 'POST': return 'primary';
      case 'PUT': return 'warning';
      case 'DELETE': return 'error';
      default: return 'default';
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const formatResponse = () => {
    if (test.response) {
      return JSON.stringify(test.response, null, 2);
    }
    return '';
  };

  return (
    <TestCard status={test.status}>
      <CardContent onClick={() => setExpanded(!expanded)} sx={{ cursor: 'pointer' }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={2}>
            {getIcon()}
            <Typography variant="subtitle1" fontWeight="bold">
              {test.name}
            </Typography>
            {test.method && (
              <Chip
                label={test.method}
                size="small"
                color={getMethodColor(test.method)}
              />
            )}
            <Chip
              label={test.category}
              size="small"
              variant="outlined"
            />
            {test.responseTime && (
              <Chip
                icon={<SpeedIcon />}
                label={`${test.responseTime}ms`}
                size="small"
                variant="outlined"
                color={test.responseTime < 200 ? 'success' : test.responseTime < 500 ? 'warning' : 'error'}
              />
            )}
          </Box>
          <ExpandButton expanded={expanded}>
            <ExpandIcon />
          </ExpandButton>
        </Box>

        {test.description && (
          <Typography variant="body2" color="textSecondary" mt={1}>
            {test.description}
          </Typography>
        )}
      </CardContent>

      <Collapse in={expanded}>
        <Box
          sx={{ p: 2, backgroundColor: 'rgba(0,0,0,0.02)' }}
          onClick={(e) => e.stopPropagation()}>

          {/* WebSocket tests show request code instead of endpoint/curl */}
          {test.category === 'REALTIME' && test.request ? (
            <>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                {test.name.includes('Connection') ? 'Connection Code:' : 'Event Listener:'}
              </Typography>
              <CodeBlock>
                <CopyButton size="small" onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(test.request);
                }}>
                  <CopyIcon fontSize="small" />
                </CopyButton>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{test.request}</pre>
              </CodeBlock>
            </>
          ) : (
            <>
              <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                Endpoint:
              </Typography>
              <Typography variant="body2" component="code" sx={{ fontFamily: 'monospace' }}>
                {test.endpoint}
              </Typography>

              {test.curl && (
                <>
                  <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                    cURL Command:
                  </Typography>
                  <CodeBlock>
                    <CopyButton size="small" onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(formatCurlCommand(test.curl));
                    }}>
                      <CopyIcon fontSize="small" />
                    </CopyButton>
                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{formatCurlCommand(test.curl)}</pre>
                  </CodeBlock>
                </>
              )}
            </>
          )}

          {test.requestBody && (
            <>
              <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                Request Body:
              </Typography>
              <CodeBlock>
                <CopyButton size="small" onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(JSON.stringify(test.requestBody, null, 2));
                }}>
                  <CopyIcon fontSize="small" />
                </CopyButton>
                <pre style={{ margin: 0 }}>{JSON.stringify(test.requestBody, null, 2)}</pre>
              </CodeBlock>
            </>
          )}

          {test.response && (
            <>
              <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                Response:
              </Typography>
              <CodeBlock>
                <CopyButton size="small" onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(formatResponse());
                }}>
                  <CopyIcon fontSize="small" />
                </CopyButton>
                <pre style={{ margin: 0 }}>{formatResponse()}</pre>
              </CodeBlock>
            </>
          )}

          {test.error && (
            <>
              <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, fontWeight: 'bold', color: '#f44336' }}>
                Error:
              </Typography>
              <Typography variant="body2" color="error">
                {test.error}
              </Typography>
            </>
          )}
        </Box>
      </Collapse>
    </TestCard>
  );
};

// Main Base Component
const HealthDashboardBase = ({
  moduleName,
  moduleTitle,
  healthCheckMethod,
  categoryIcons = {}
}) => {
  const [authTab, setAuthTab] = useState(0);
  const [testApiKey, setTestApiKey] = useState(null);
  const [testApiKeyId, setTestApiKeyId] = useState(null);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [groupedTests, setGroupedTests] = useState({
    CORE: [],
    FILTERS: [],
    ERROR: [],
    EDGE: [],
    PERFORMANCE: [],
    WORKFLOW: [],
    REALTIME: []
  });
  const [expandedSections, setExpandedSections] = useState({
    CORE: true,
    FILTERS: true,
    ERROR: true,
    EDGE: true,
    PERFORMANCE: true,
    WORKFLOW: true,
    REALTIME: true
  });
  const [wsConnected, setWsConnected] = useState(false);
  const [wsSocketId, setWsSocketId] = useState(null);
  const [wsTransport, setWsTransport] = useState(null);
  const [wsLastEvent, setWsLastEvent] = useState(null);

  const defaultIcons = {
    CORE: AddIcon,
    FILTERS: SearchIcon,
    ERROR: BugIcon,
    EDGE: WarningIcon,
    PERFORMANCE: SpeedIcon,
    WORKFLOW: EditIcon,
    REALTIME: WebSocketIcon
  };

  const icons = { ...defaultIcons, ...categoryIcons };

  // WebSocket monitoring
  useEffect(() => {
    const checkWSStatus = () => {
      if (websocketService.socket?.connected) {
        setWsConnected(true);
        setWsSocketId(websocketService.socket.id);
        setWsTransport(websocketService.socket.io.engine.transport.name);
      } else {
        setWsConnected(false);
        setWsSocketId(null);
        setWsTransport(null);
      }
    };

    // Check immediately
    checkWSStatus();

    // Listen for WebSocket events
    const unsubscribeConnection = websocketService.on('connection', () => {
      checkWSStatus();
    });

    const unsubscribeDataUpdate = websocketService.on('data:update', (data) => {
      setWsLastEvent({
        type: 'data:update',
        entityType: data.entityType,
        action: data.action,
        timestamp: new Date().toISOString()
      });
    });

    // Check status every 5 seconds
    const interval = setInterval(checkWSStatus, 5000);

    return () => {
      clearInterval(interval);
      if (unsubscribeConnection) unsubscribeConnection();
      if (unsubscribeDataUpdate) unsubscribeDataUpdate();
    };
  }, []);

  const handleWSToggle = async () => {
    if (wsConnected) {
      websocketService.disconnect();
      setWsConnected(false);
      setWsSocketId(null);
      setWsTransport(null);
      setSnackbarMessage('WebSocket disconnected');
      setSnackbarOpen(true);
    } else {
      try {
        await websocketService.connect();
        setSnackbarMessage('WebSocket connected');
        setSnackbarOpen(true);
      } catch (error) {
        setSnackbarMessage('Failed to connect WebSocket: ' + error.message);
        setSnackbarOpen(true);
      }
    }
  };

  const handleAuthTabChange = (event, newValue) => {
    setAuthTab(newValue);
    setTests([]);
    setTestApiKey(null);
    setTestApiKeyId(null);
    setGroupedTests({
      CORE: [],
      FILTERS: [],
      ERROR: [],
      EDGE: [],
      PERFORMANCE: [],
      WORKFLOW: [],
      REALTIME: []
    });
    setExpandedSections({
      CORE: true,
      FILTERS: true,
      ERROR: true,
      EDGE: true,
      PERFORMANCE: true,
      WORKFLOW: true,
      REALTIME: true
    });
  };

  const getAuthHeader = () => {
    if (authTab === 0) {
      // Get token from authService (memory) instead of localStorage (Phase 4)
      const authService = require('../../services/auth.service').default;
      const token = authService.token;
      return token ? { 'Authorization': `Bearer ${token}` } : {};
    } else {
      return testApiKey ? { 'X-API-Key': testApiKey } : {};
    }
  };

  const getAuthDisplay = () => {
    if (authTab === 0) {
      // Get token from authService (memory) instead of localStorage (Phase 4)
      const authService = require('../../services/auth.service').default;
      const token = authService.token;
      return token ? `Bearer ${token.substring(0, 20)}...` : 'No JWT token found';
    } else {
      return testApiKey ? `${testApiKey.substring(0, 20)}...` : 'No API key yet';
    }
  };

  const runAllTests = useCallback(async (forceNewKey = true) => {
    setLoading(true);
    setTests([]);
    setGroupedTests({ CORE: [], FILTERS: [], ERROR: [], EDGE: [], PERFORMANCE: [], WORKFLOW: [], REALTIME: [] });

    let API_URL = process.env.REACT_APP_API_URL || 'https://api.jaydenmetz.com';
    if (!API_URL.endsWith('/v1')) {
      API_URL = API_URL.replace(/\/$/, '') + '/v1';
    }

    let authHeaders = getAuthHeader();
    let temporaryApiKey = testApiKey;
    let temporaryApiKeyId = testApiKeyId;

    if (authTab === 1) {
      if (!temporaryApiKey || forceNewKey) {
        if (forceNewKey && testApiKeyId) {
          try {
            await apiKeysAPI.delete(testApiKeyId);
          } catch (err) {
            console.log('Could not delete previous test key:', err);
          }
          setTestApiKey(null);
          setTestApiKeyId(null);
        }

        try {
          const response = await apiKeysAPI.create({
            name: `Test Key - ${new Date().toISOString()}`,
            expiresInDays: 1
          });

          if (response?.data?.key) {
            temporaryApiKey = response.data.key;
            temporaryApiKeyId = response.data.id;
            setTestApiKey(temporaryApiKey);
            setTestApiKeyId(temporaryApiKeyId);
          } else {
            throw new Error('Failed to create test API key');
          }
        } catch (error) {
          console.error('Failed to create test API key:', error);
          setSnackbarMessage('Failed to create test API key: ' + error.message);
          setSnackbarOpen(true);
          setLoading(false);
          return;
        }
      }

      authHeaders = { 'X-API-Key': temporaryApiKey };
    } else if (authTab === 0 && !authHeaders.Authorization) {
      setSnackbarMessage('Please log in to get a JWT token');
      setSnackbarOpen(true);
      setLoading(false);
      return;
    }

    const allTests = [];
    const grouped = { CORE: [], FILTERS: [], ERROR: [], EDGE: [], PERFORMANCE: [], WORKFLOW: [], REALTIME: [] };

    const createCurlCommand = (method, endpoint, body = null) => {
      let curlCmd = `curl -X ${method} "${API_URL}${endpoint}"`;

      if (authTab === 0) {
        const fullToken = authHeaders.Authorization || `Bearer ${localStorage.getItem('authToken')}`;
        curlCmd += ` -H "Authorization: ${fullToken}"`;
      } else {
        const fullApiKey = temporaryApiKey;
        curlCmd += ` -H "X-API-Key: ${fullApiKey}"`;
      }

      if (body) {
        curlCmd += ` -H "Content-Type: application/json" -d '${JSON.stringify(body)}'`;
      }

      return curlCmd;
    };

    try {
      if (authTab === 1 && temporaryApiKey) {
        const creationTest = {
          name: 'Create Test API Key',
          method: 'POST',
          endpoint: '/api-keys',
          category: 'Setup',
          status: 'success',
          description: 'Temporary test API key created successfully',
          responseTime: 50,
          response: { success: true, key: `${temporaryApiKey.substring(0, 12)}...${temporaryApiKey.slice(-4)}` },
          curl: `curl -X POST "${API_URL}/api-keys" -H "Authorization: Bearer YOUR_JWT_TOKEN" -H "Content-Type: application/json" -d '{"name":"Test Key","expiresInDays":1}'`,
          authType: 'JWT'
        };
        allTests.push(creationTest);
        grouped.CORE.unshift(creationTest);
      }

      const { HealthCheckService } = await import('../../services/healthCheck.service');

      const authValue = authTab === 0
        ? authHeaders.Authorization?.replace('Bearer ', '')
        : authHeaders['X-API-Key'];
      const authType = authTab === 0 ? 'jwt' : 'apikey';

      const healthService = new HealthCheckService(API_URL, authValue, authType);

      const tests = await healthService[healthCheckMethod]();

      tests.forEach(test => {
        test.curl = createCurlCommand(test.method, test.endpoint, test.requestBody);
        test.authType = authTab === 0 ? 'JWT' : 'API Key';
      });

      tests.forEach(test => {
        if (test.category === 'Critical') grouped.CORE.push(test);
        else if (test.category === 'Search') grouped.FILTERS.push(test);
        else if (test.category === 'Error Handling') grouped.ERROR.push(test);
        else if (test.category === 'Edge Case') grouped.EDGE.push(test);
        else if (test.category === 'Performance') grouped.PERFORMANCE.push(test);
        else if (test.category === 'Workflow') grouped.WORKFLOW.push(test);
        else if (test.category === 'REALTIME') grouped.REALTIME.push(test);
        allTests.push(test);
      });

      setTests(allTests);
      setGroupedTests(grouped);
      setLastRefresh(new Date());

      setExpandedSections({
        CORE: true,
        FILTERS: true,
        ERROR: true,
        EDGE: true,
        PERFORMANCE: true,
        WORKFLOW: true,
        REALTIME: true
      });

      if (authTab === 1 && temporaryApiKeyId) {
        try {
          await apiKeysAPI.delete(temporaryApiKeyId);

          const deletionTest = {
            name: 'Delete Test API Key',
            method: 'DELETE',
            endpoint: `/api-keys/${temporaryApiKeyId}`,
            category: 'Cleanup',
            status: 'success',
            description: 'Temporary test API key has been deleted',
            responseTime: 45,
            response: { success: true, message: 'Test API key deleted successfully' },
            curl: `curl -X DELETE "${API_URL}/api-keys/${temporaryApiKeyId}" -H "Authorization: Bearer YOUR_JWT_TOKEN"`,
            authType: 'JWT'
          };

          allTests.push(deletionTest);
          grouped.WORKFLOW.push(deletionTest);
          setTests([...allTests]);
          setGroupedTests({...grouped});
        } catch (deleteError) {
          console.error('Failed to delete test API key:', deleteError);

          const deletionTest = {
            name: 'Delete Test API Key',
            method: 'DELETE',
            endpoint: `/api-keys/${temporaryApiKeyId}`,
            category: 'Cleanup',
            status: 'failed',
            description: 'Failed to delete temporary test API key',
            error: deleteError.message,
            curl: `curl -X DELETE "${API_URL}/api-keys/${temporaryApiKeyId}" -H "Authorization: Bearer YOUR_JWT_TOKEN"`,
            authType: 'JWT'
          };

          allTests.push(deletionTest);
          grouped.WORKFLOW.push(deletionTest);
          setTests([...allTests]);
          setGroupedTests({...grouped});
        }
      }
    } catch (error) {
      console.error('Test execution failed:', error);
      setSnackbarMessage('Failed to run tests: ' + error.message);
      setSnackbarOpen(true);
    }

    setLoading(false);
  }, [authTab, healthCheckMethod]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const copyFullReport = () => {
    const report = {
      timestamp: lastRefresh?.toISOString(),
      authentication: {
        type: authTab === 0 ? 'JWT' : 'API Key',
        details: authTab === 0
          ? {
              method: 'Bearer Token (JWT)',
              tokenPresent: !!localStorage.getItem('authToken'),
              tokenPreview: localStorage.getItem('authToken')?.substring(0, 20) + '...'
            }
          : {
              method: 'X-API-Key Header',
              keyUsed: testApiKey ? `${testApiKey.substring(0, 12)}...${testApiKey.slice(-4)}` : 'None',
              temporaryKey: true
            }
      },
      endpoint: `/${moduleName}`,
      summary: {
        total: tests.length,
        passed: tests.filter(t => t.status === 'success').length,
        failed: tests.filter(t => t.status === 'failed').length,
        warnings: tests.filter(t => t.status === 'warning').length
      },
      tests: tests
    };

    navigator.clipboard.writeText(JSON.stringify(report, null, 2));
    setSnackbarMessage('Full report with authentication details copied to clipboard!');
    setSnackbarOpen(true);
  };

  // Run tests on initial page load
  useEffect(() => {
    runAllTests(true);
  }, []); // Empty dependency array = run once on mount

  // Run tests when switching between JWT/API Key tabs
  useEffect(() => {
    if (authTab === 0) {
      const token = localStorage.getItem('authToken');
      if (token) {
        runAllTests(true);
      }
    } else if (authTab === 1) {
      runAllTests(true);
    }
  }, [authTab]);

  const totalTests = tests.length;
  const passedTests = tests.filter(t => t.status === 'success').length;
  const failedTests = tests.filter(t => t.status === 'failed').length;
  const warningTests = tests.filter(t => t.status === 'warning').length;
  const successRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;

  return (
    <PageContainer>
      <Container maxWidth="xl">
        <Paper elevation={3} sx={{ p: 3, mb: 3, backgroundColor: 'rgba(255, 255, 255, 0.98)' }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Box display="flex" alignItems="center" gap={2}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<DashboardIcon />}
                onClick={() => window.location.href = '/health'}
                sx={{ textTransform: 'none' }}
              >
                System Health
              </Button>
              <Typography variant="h4" fontWeight="bold">
                {moduleTitle} API Health Dashboard
              </Typography>
            </Box>
          </Box>
          <Typography variant="body1" color="textSecondary" mb={3}>
            Comprehensive health checks for the {moduleTitle} API with dual authentication support
          </Typography>

          <StyledTabs value={authTab} onChange={handleAuthTabChange}>
            <StyledTab
              icon={<JwtIcon />}
              label="JWT Authentication"
              iconPosition="start"
            />
            <StyledTab
              icon={<ApiKeyIcon />}
              label="API Key Authentication"
              iconPosition="start"
            />
          </StyledTabs>

          {authTab === 1 ? (
            <AuthInputBox>
              <Box>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  API Key Testing
                </Typography>
                <Typography variant="body2" color="textSecondary" mb={1}>
                  Automatically creating a temporary test API key, running tests, and deleting it when complete.
                </Typography>
                {testApiKey && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                      Test API Key (Full):
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      value={testApiKey}
                      variant="outlined"
                      size="small"
                      sx={{
                        mt: 1,
                        '& .MuiInputBase-input': {
                          fontFamily: 'monospace',
                          fontSize: '0.85rem',
                          wordBreak: 'break-all',
                          whiteSpace: 'pre-wrap'
                        }
                      }}
                      InputProps={{
                        readOnly: true
                      }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      This temporary key was created for testing and will be deleted after tests complete.
                    </Typography>
                  </Alert>
                )}
              </Box>
            </AuthInputBox>
          ) : null}

          {/* WebSocket Status Toggle Section */}
          <Paper
            elevation={2}
            sx={{
              p: 2,
              mb: 3,
              border: '2px solid',
              borderColor: wsConnected ? 'success.main' : 'error.main',
              backgroundColor: wsConnected ? 'success.50' : 'error.50'
            }}
          >
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box display="flex" alignItems="center" gap={2}>
                <WebSocketIcon
                  sx={{
                    fontSize: 40,
                    color: wsConnected ? 'success.main' : 'error.main'
                  }}
                />
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    WebSocket Real-Time Connection
                  </Typography>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Chip
                      label={wsConnected ? 'Connected' : 'Disconnected'}
                      color={wsConnected ? 'success' : 'error'}
                      size="small"
                      icon={wsConnected ? <CheckIcon /> : <ErrorIcon />}
                    />
                    {wsConnected && wsSocketId && (
                      <Typography variant="caption" color="text.secondary">
                        Socket ID: {wsSocketId.substring(0, 12)}...
                      </Typography>
                    )}
                    {wsConnected && wsTransport && (
                      <Chip
                        label={`Transport: ${wsTransport}`}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Stack>
                  {wsLastEvent && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      Last Event: {wsLastEvent.entityType} {wsLastEvent.action} at {new Date(wsLastEvent.timestamp).toLocaleTimeString()}
                    </Typography>
                  )}
                </Box>
              </Box>
              <Button
                variant="contained"
                color={wsConnected ? 'error' : 'success'}
                startIcon={<PowerIcon />}
                onClick={handleWSToggle}
                sx={{ minWidth: 140 }}
              >
                {wsConnected ? 'Disconnect' : 'Connect'}
              </Button>
            </Box>
          </Paper>

          <Grid container spacing={3} mb={3}>
            <Grid item xs={12} sm={3}>
              <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h3" fontWeight="bold" color={successRate === 100 ? 'success.main' : 'error.main'}>
                  {successRate}%
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Success Rate
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h3" fontWeight="bold">
                  {totalTests}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Total Tests
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
                <Stack direction="row" spacing={1} justifyContent="center">
                  <Chip icon={<CheckIcon />} label={passedTests} color="success" />
                  <Chip icon={<ErrorIcon />} label={failedTests} color="error" />
                  {warningTests > 0 && <Chip icon={<WarningIcon />} label={warningTests} color="warning" />}
                </Stack>
                <Typography variant="body2" color="textSecondary" mt={1}>
                  Test Results
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
                <Stack direction="row" spacing={1} justifyContent="center">
                  <Tooltip title={authTab === 1 ? "Run All Tests (New API Key)" : "Run All Tests"}>
                    <IconButton
                      color="primary"
                      onClick={() => runAllTests(true)}
                      disabled={loading}
                    >
                      <PlayIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={authTab === 1 ? "Refresh (Reuse API Key)" : "Refresh Tests"}>
                    <IconButton
                      color="default"
                      onClick={() => runAllTests(false)}
                      disabled={loading}
                    >
                      <RefreshIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Copy Report">
                    <IconButton
                      color="default"
                      onClick={copyFullReport}
                      disabled={tests.length === 0}
                    >
                      <CopyIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>
                <Typography variant="body2" color="textSecondary">
                  Actions
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {loading && (
            <Box mb={3}>
              <LinearProgress />
              <Typography variant="body2" color="textSecondary" align="center" mt={1}>
                Running tests with {authTab === 0 ? 'JWT' : 'API Key'} authentication...
              </Typography>
            </Box>
          )}

          <TestSection
            title="Core Operations"
            tests={groupedTests.CORE}
            icon={icons.CORE}
            expanded={expandedSections.CORE}
            onToggle={() => toggleSection('CORE')}
          />
          <TestSection
            title="Search & Filters"
            tests={groupedTests.FILTERS}
            icon={icons.FILTERS}
            expanded={expandedSections.FILTERS}
            onToggle={() => toggleSection('FILTERS')}
          />
          <TestSection
            title="Error Handling"
            tests={groupedTests.ERROR}
            icon={icons.ERROR}
            expanded={expandedSections.ERROR}
            onToggle={() => toggleSection('ERROR')}
          />
          <TestSection
            title="Edge Cases"
            tests={groupedTests.EDGE}
            icon={icons.EDGE}
            expanded={expandedSections.EDGE}
            onToggle={() => toggleSection('EDGE')}
          />
          <TestSection
            title="Performance"
            tests={groupedTests.PERFORMANCE}
            icon={icons.PERFORMANCE}
            expanded={expandedSections.PERFORMANCE}
            onToggle={() => toggleSection('PERFORMANCE')}
          />
          <TestSection
            title="Workflows"
            tests={groupedTests.WORKFLOW}
            icon={icons.WORKFLOW}
            expanded={expandedSections.WORKFLOW}
            onToggle={() => toggleSection('WORKFLOW')}
          />
          <TestSection
            title="Real-Time WebSocket"
            tests={groupedTests.REALTIME}
            icon={icons.REALTIME}
            expanded={expandedSections.REALTIME}
            onToggle={() => toggleSection('REALTIME')}
          />

          {lastRefresh && (
            <Typography variant="caption" color="textSecondary" display="block" mt={3} textAlign="center">
              Last refreshed: {lastRefresh.toLocaleString()} ({authTab === 0 ? 'JWT' : 'API Key'} Mode)
            </Typography>
          )}
        </Paper>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%' }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Container>
    </PageContainer>
  );
};

export default HealthDashboardBase;
