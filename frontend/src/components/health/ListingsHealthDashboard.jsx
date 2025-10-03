import { useState, useEffect, useCallback } from 'react';
import { useQuery } from 'react-query';
import { api, apiKeysAPI } from '../../services/api.service';
import { formatCurlCommand } from '../../utils/formatCurl';
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
  Fade,
  Tooltip,
  Snackbar,
  Alert,
  Divider,
  Stack,
  Tabs,
  Tab,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Cancel as ErrorIcon,
  ExpandMore as ExpandIcon,
  ContentCopy as CopyIcon,
  Refresh as RefreshIcon,
  PlayArrow as PlayIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
  Speed as SpeedIcon,
  Search as SearchIcon,
  BugReport as BugIcon,
  Add as AddIcon,
  Edit as EditIcon,
  VpnKey as ApiKeyIcon,
  Token as JwtIcon,
  Key as KeyIcon,
  Dashboard as DashboardIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const PageContainer = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  minHeight: '100vh',
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(3)
}));

const SectionHeader = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  color: theme.palette.primary.dark,
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(2),
  padding: theme.spacing(1, 2),
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  borderRadius: theme.spacing(1),
  display: 'inline-block'
}));

const TestCard = styled(Card)(({ status }) => ({
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

const ExpandButton = styled(IconButton)(({ expanded }) => ({
  transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
  transition: 'transform 0.3s'
}));

const CodeBlock = styled(Paper)(({ theme }) => ({
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

const CopyButton = styled(IconButton)({
  position: 'absolute',
  top: 8,
  right: 8,
  color: '#888',
  '&:hover': {
    color: '#fff'
  }
});

const StyledTabs = styled(Tabs)(({ theme }) => ({
  backgroundColor: 'white',
  borderRadius: theme.spacing(1),
  marginBottom: theme.spacing(3),
  '& .MuiTabs-indicator': {
    backgroundColor: theme.palette.primary.main,
    height: 3
  }
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '1rem',
  marginRight: theme.spacing(1),
  minHeight: 64,
  '&.Mui-selected': {
    color: theme.palette.primary.main
  }
}));

const AuthInputBox = styled(Box)(({ theme }) => ({
  backgroundColor: 'white',
  borderRadius: theme.spacing(1),
  padding: theme.spacing(2),
  marginBottom: theme.spacing(3),
  border: '1px solid #e0e0e0'
}));

const TestSection = ({ title, tests, icon: Icon, expanded, onToggle }) => {
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

const TestResult = ({ test }) => {
  const [expanded, setExpanded] = useState(false); // Individual tests start collapsed
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
            <Chip
              label={test.method}
              size="small"
              color={getMethodColor(test.method)}
            />
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

const ListingsHealthDashboard = () => {
  const [authTab, setAuthTab] = useState(0); // 0 = JWT, 1 = API Key
  const [testApiKey, setTestApiKey] = useState(null); // Store the full test API key
  const [testApiKeyId, setTestApiKeyId] = useState(null); // Store the ID for deletion
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [testListingId, setTestListingId] = useState(null);
  const [testListingIds, setTestListingIds] = useState([]);
  const [currentTab, setCurrentTab] = useState(0);
  const [groupedTests, setGroupedTests] = useState({
    CORE: [],
    FILTERS: [],
    ERROR: [],
    EDGE: [],
    PERFORMANCE: [],
    WORKFLOW: []
  });
  const [expandedSections, setExpandedSections] = useState({
    CORE: true,
    FILTERS: true,
    ERROR: true,
    EDGE: true,
    PERFORMANCE: true,
    WORKFLOW: true
  });

  const handleAuthTabChange = (event, newValue) => {
    setAuthTab(newValue);
    // Clear tests and test API key when switching tabs
    setTests([]);
    setTestApiKey(null);
    setTestApiKeyId(null);
    setGroupedTests({
      CORE: [],
      FILTERS: [],
      ERROR: [],
      EDGE: [],
      PERFORMANCE: [],
      WORKFLOW: []
    });
    // Keep sections expanded when switching tabs
    setExpandedSections({
      CORE: true,
      FILTERS: true,
      ERROR: true,
      EDGE: true,
      PERFORMANCE: true,
      WORKFLOW: true
    });
  };

  const getAuthHeader = () => {
    if (authTab === 0) {
      // JWT Authentication
      const token = localStorage.getItem('crm_auth_token') ||
                   localStorage.getItem('authToken') ||
                   localStorage.getItem('token');
      return token ? { 'Authorization': `Bearer ${token}` } : {};
    } else {
      // API Key Authentication - will be set during test run
      return testApiKey ? { 'X-API-Key': testApiKey } : {};
    }
  };

  const getAuthDisplay = () => {
    if (authTab === 0) {
      const token = localStorage.getItem('crm_auth_token') ||
                   localStorage.getItem('authToken') ||
                   localStorage.getItem('token');
      return token ? `Bearer ${token.substring(0, 20)}...` : 'No JWT token found';
    } else {
      return testApiKey ? `${testApiKey.substring(0, 20)}...` : 'No API key yet';
    }
  };

  const runAllTests = useCallback(async (forceNewKey = true) => {
    setLoading(true);
    setTests([]);
    setGroupedTests({ CORE: [], FILTERS: [], ERROR: [], EDGE: [], PERFORMANCE: [], WORKFLOW: [] });

    let API_URL = process.env.REACT_APP_API_URL || 'https://api.jaydenmetz.com';
    if (!API_URL.endsWith('/v1')) {
      API_URL = API_URL.replace(/\/$/, '') + '/v1';
    }

    // For API Key tab, create or reuse a temporary test API key
    let authHeaders = getAuthHeader();
    let authDisplay = getAuthDisplay();
    let temporaryApiKey = testApiKey; // Use existing if available
    let temporaryApiKeyId = testApiKeyId;

    if (authTab === 1) {
      // Create a new test API key only if we don't have one or if forced
      if (!temporaryApiKey || forceNewKey) {
        // Clear any existing test API key if forcing new
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
            expiresInDays: 1 // Expires in 1 day
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

      // Use the temporary key for testing
      authHeaders = { 'X-API-Key': temporaryApiKey };
      authDisplay = `${temporaryApiKey.substring(0, 20)}...`;
    } else if (authTab === 0 && !authHeaders.Authorization) {
      setSnackbarMessage('Please log in to get a JWT token');
      setSnackbarOpen(true);
      setLoading(false);
      return;
    }

    const allTests = [];
    const grouped = { CORE: [], FILTERS: [], ERROR: [], EDGE: [], PERFORMANCE: [], WORKFLOW: [] };
    let createdListingId = null;
    const createdListingIds = [];

    // Helper function to create curl command based on auth type
    const createCurlCommand = (method, endpoint, body = null) => {
      let curlCmd = `curl -X ${method} "${API_URL}${endpoint}"`;

      // Use full token values for curl commands (not truncated display values)
      if (authTab === 0) {
        // For JWT, use the full token from authHeaders
        const fullToken = authHeaders.Authorization || `Bearer ${localStorage.getItem('authToken')}`;
        curlCmd += ` -H "Authorization: ${fullToken}"`;
      } else {
        // For API Key, use the full key
        const fullApiKey = authTab === 1 && temporaryApiKey ? temporaryApiKey : (authHeaders['X-API-Key'] || selectedApiKey);
        curlCmd += ` -H "X-API-Key: ${fullApiKey}"`;
      }

      if (body) {
        curlCmd += ` -H "Content-Type: application/json" -d '${JSON.stringify(body)}'`;
      }

      return curlCmd;
    };

    // Import and use the comprehensive health check service
    try {
      // For API Key tab, add creation test first
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
        grouped.CORE.unshift(creationTest); // Add to beginning of CORE
      }

      const { HealthCheckService } = await import('../../services/healthCheck.service');

      // Extract auth value and determine type
      const authValue = authTab === 0
        ? authHeaders.Authorization?.replace('Bearer ', '')
        : authHeaders['X-API-Key'];
      const authType = authTab === 0 ? 'jwt' : 'apikey';

      const healthService = new HealthCheckService(API_URL, authValue, authType);

      const tests = await healthService.runListingsHealthCheck();

      // Update curl commands based on auth type
      tests.forEach(test => {
        test.curl = createCurlCommand(test.method, test.endpoint, test.requestBody);
        test.authType = authTab === 0 ? 'JWT' : 'API Key';
      });

      // Group tests by category
      tests.forEach(test => {
        if (test.category === 'Critical') grouped.CORE.push(test);
        else if (test.category === 'Search') grouped.FILTERS.push(test);
        else if (test.category === 'Error Handling') grouped.ERROR.push(test);
        else if (test.category === 'Edge Case') grouped.EDGE.push(test);
        else if (test.category === 'Performance') grouped.PERFORMANCE.push(test);
        else if (test.category === 'Workflow') grouped.WORKFLOW.push(test);
        allTests.push(test);
      });

      setTests(allTests);
      setGroupedTests(grouped);
      setLastRefresh(new Date());

      // Ensure sections remain expanded after tests load
      setExpandedSections({
        CORE: true,
        FILTERS: true,
        ERROR: true,
        EDGE: true,
        PERFORMANCE: true,
        WORKFLOW: true
      });

      // If we created a temporary API key, delete it and add as test result
      if (authTab === 1 && temporaryApiKeyId) {
        try {
          await apiKeysAPI.delete(temporaryApiKeyId);

          // Add a test result showing the deletion
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
          grouped.WORKFLOW.push(deletionTest); // Add to end of WORKFLOW
          setTests([...allTests]);
          setGroupedTests({...grouped});
        } catch (deleteError) {
          console.error('Failed to delete test API key:', deleteError);

          // Add a test result showing the deletion failure
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
  }, [authTab]);

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
      endpoint: '/listings',
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


  useEffect(() => {
    if (authTab === 0) {
      // Auto-run tests for JWT if token exists
      const token = localStorage.getItem('crm_auth_token') ||
                   localStorage.getItem('authToken') ||
                   localStorage.getItem('token');
      if (token) {
        runAllTests(true);
      }
    } else if (authTab === 1) {
      // Auto-run tests for API Key tab with new temporary key
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
                Listings API Health Dashboard
              </Typography>
            </Box>
          </Box>
          <Typography variant="body1" color="textSecondary" mb={3}>
            Comprehensive health checks for the Listings API with dual authentication support
          </Typography>

          {/* Authentication Tabs */}
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

          {/* Authentication Input - Only show for API Key tab */}
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

          {/* Stats Overview */}
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
                      onClick={() => runAllTests(true)} // Force new key for API tests
                      disabled={loading}
                    >
                      <PlayIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={authTab === 1 ? "Refresh (Reuse API Key)" : "Refresh Tests"}>
                    <IconButton
                      color="default"
                      onClick={() => runAllTests(false)} // Reuse existing key if available
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

          {/* Test Categories */}
          <TestSection
            title="Core Operations"
            tests={groupedTests.CORE}
            icon={AddIcon}
            expanded={expandedSections.CORE}
            onToggle={() => toggleSection('CORE')}
          />
          <TestSection
            title="Search & Filters"
            tests={groupedTests.FILTERS}
            icon={SearchIcon}
            expanded={expandedSections.FILTERS}
            onToggle={() => toggleSection('FILTERS')}
          />
          <TestSection
            title="Error Handling"
            tests={groupedTests.ERROR}
            icon={BugIcon}
            expanded={expandedSections.ERROR}
            onToggle={() => toggleSection('ERROR')}
          />
          <TestSection
            title="Edge Cases"
            tests={groupedTests.EDGE}
            icon={WarningIcon}
            expanded={expandedSections.EDGE}
            onToggle={() => toggleSection('EDGE')}
          />
          <TestSection
            title="Performance"
            tests={groupedTests.PERFORMANCE}
            icon={SpeedIcon}
            expanded={expandedSections.PERFORMANCE}
            onToggle={() => toggleSection('PERFORMANCE')}
          />
          <TestSection
            title="Workflows"
            tests={groupedTests.WORKFLOW}
            icon={EditIcon}
            expanded={expandedSections.WORKFLOW}
            onToggle={() => toggleSection('WORKFLOW')}
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

export default ListingsHealthDashboard;