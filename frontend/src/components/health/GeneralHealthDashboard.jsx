import { useState, useEffect, useCallback } from 'react';
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
  Alert
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Cancel as ErrorIcon,
  ExpandMore as ExpandIcon,
  ContentCopy as CopyIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const PageContainer = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
  minHeight: '100vh',
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(3)
}));

const TestCard = styled(Card)(({ status }) => ({
  marginBottom: '16px',
  border: '2px solid',
  borderColor: status === 'success' ? '#4caf50' : 
               status === 'failed' ? '#f44336' : '#e0e0e0',
  backgroundColor: status === 'success' ? '#f1f8e9' : 
                   status === 'failed' ? '#ffebee' : '#fafafa',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
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
  marginTop: theme.spacing(2)
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

const StatusIcon = ({ status }) => {
  if (status === 'success') {
    return <CheckIcon sx={{ color: '#4caf50', fontSize: 28 }} />;
  }
  if (status === 'failed') {
    return <ErrorIcon sx={{ color: '#f44336', fontSize: 28 }} />;
  }
  return null;
};

const TestItem = ({ test }) => {
  const [expanded, setExpanded] = useState(false);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const formatCurl = () => {
    if (!test.curl) return '';
    
    // Format curl command for readability
    const parts = test.curl.split(' ');
    let formatted = 'curl';
    let currentLine = 'curl';
    
    for (let i = 1; i < parts.length; i++) {
      if (parts[i].startsWith('-')) {
        formatted += ' \\\n  ' + parts[i];
        currentLine = '  ' + parts[i];
      } else {
        formatted += ' ' + parts[i];
        currentLine += ' ' + parts[i];
      }
    }
    
    return formatted;
  };

  const formatResponse = () => {
    if (!test.response) return 'No response';
    
    try {
      // If it's a string, try to parse it as JSON for pretty printing
      const parsed = typeof test.response === 'string' 
        ? JSON.parse(test.response) 
        : test.response;
      return JSON.stringify(parsed, null, 2);
    } catch {
      // If not JSON, return as is
      return test.response;
    }
  };

  return (
    <TestCard status={test.status}>
      <CardContent onClick={() => setExpanded(!expanded)} sx={{ cursor: 'pointer' }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={2}>
            <StatusIcon status={test.status} />
            <Box>
              <Typography variant="h6" fontWeight="bold">
                {test.name}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {test.description}
              </Typography>
            </Box>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Chip 
              label={test.status === 'success' ? 'PASSED' : test.status === 'failed' ? 'FAILED' : 'PENDING'}
              size="small"
              sx={{
                backgroundColor: test.status === 'success' ? '#4caf50' : 
                               test.status === 'failed' ? '#f44336' : '#9e9e9e',
                color: 'white',
                fontWeight: 'bold'
              }}
            />
            <ExpandButton expanded={expanded}>
              <ExpandIcon />
            </ExpandButton>
          </Box>
        </Box>
      </CardContent>
      
      <Collapse in={expanded}>
        <Box sx={{ px: 2, pb: 2 }}>
          {test.curl && (
            <>
              <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                CURL Request:
              </Typography>
              <CodeBlock>
                <CopyButton size="small" onClick={() => copyToClipboard(test.curl)}>
                  <CopyIcon fontSize="small" />
                </CopyButton>
                <pre style={{ margin: 0 }}>{formatCurl()}</pre>
              </CodeBlock>
            </>
          )}
          
          {test.response && (
            <>
              <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                Response:
              </Typography>
              <CodeBlock>
                <CopyButton size="small" onClick={() => copyToClipboard(formatResponse())}>
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

const HealthCheckDashboard = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const runAllTests = useCallback(async () => {
    setLoading(true);
    let API_URL = process.env.REACT_APP_API_URL || 'https://api.jaydenmetz.com';
    // Ensure API URL has /v1 suffix
    if (!API_URL.endsWith('/v1')) {
      API_URL = API_URL.replace(/\/$/, '') + '/v1';
    }
    
    // Get auth token - try multiple locations
    const token = localStorage.getItem('crm_auth_token') || 
                 localStorage.getItem('authToken') ||
                 localStorage.getItem('token') ||
                 sessionStorage.getItem('crm_auth_token') ||
                 sessionStorage.getItem('token');

    const testSuite = [];

    // Test 1: JWT Authentication
    const jwtTest = {
      name: 'JWT Authentication',
      description: 'Verify JWT token is valid and can authenticate',
      status: 'pending',
      curl: `curl -X GET "${API_URL}/escrows" -H "Authorization: Bearer ${token || 'YOUR_JWT_TOKEN'}"`,
      response: null,
      error: null
    };

    try {
      const response = await fetch(`${API_URL}/escrows`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const data = await response.json();
      jwtTest.status = response.ok && data.success ? 'success' : 'failed';
      jwtTest.response = data;
      if (!response.ok || !data.success) {
        jwtTest.error = data.error?.message || 'Authentication failed';
      }
    } catch (error) {
      jwtTest.status = 'failed';
      jwtTest.error = error.message;
    }
    testSuite.push(jwtTest);
    setTests([...testSuite]);

    // Test 2: Create API Key
    let apiKey = null;
    const createKeyTest = {
      name: 'Create API Key',
      description: 'Generate a new API key for testing',
      status: 'pending',
      curl: `curl -X POST "${API_URL}/api-keys" -H "Authorization: Bearer ${token || 'YOUR_JWT_TOKEN'}" -H "Content-Type: application/json" -d '{"name":"Health Check Test","expiresInDays":1}'`,
      response: null,
      error: null
    };

    if (token) {
      try {
        const response = await fetch(`${API_URL}/api-keys`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: `Health Check ${new Date().toISOString()}`,
            expiresInDays: 1
          })
        });
        const data = await response.json();
        createKeyTest.status = response.ok && data.success ? 'success' : 'failed';
        createKeyTest.response = data;
        if (data.success) {
          apiKey = data.data.key;
        } else {
          createKeyTest.error = data.error?.message || 'Failed to create API key';
        }
      } catch (error) {
        createKeyTest.status = 'failed';
        createKeyTest.error = error.message;
      }
    } else {
      createKeyTest.status = 'failed';
      createKeyTest.error = 'No JWT token available';
    }
    testSuite.push(createKeyTest);
    setTests([...testSuite]);

    // Test 3: API Key Authentication
    const apiKeyTest = {
      name: 'API Key Authentication',
      description: 'Test authentication using API key',
      status: 'pending',
      curl: `curl -X GET "${API_URL}/escrows/health/auth" -H "X-API-Key: ${apiKey || 'YOUR_API_KEY'}"`,
      response: null,
      error: null
    };

    if (apiKey) {
      try {
        const response = await fetch(`${API_URL}/escrows/health/auth`, {
          headers: { 'X-API-Key': apiKey }
        });
        const data = await response.json();
        apiKeyTest.status = response.ok && data.success ? 'success' : 'failed';
        apiKeyTest.response = data;
        if (!response.ok || !data.success) {
          apiKeyTest.error = data.error?.message || 'API key authentication failed';
        }
      } catch (error) {
        apiKeyTest.status = 'failed';
        apiKeyTest.error = error.message;
      }
    } else {
      apiKeyTest.status = 'failed';
      apiKeyTest.error = 'No API key available for testing';
    }
    testSuite.push(apiKeyTest);
    setTests([...testSuite]);

    // Test 4: Database Connection
    const dbTest = {
      name: 'Database Connection',
      description: 'Verify database connectivity',
      status: 'pending',
      curl: `curl -X GET "${API_URL}/escrows/health/db" -H "X-API-Key: ${apiKey || 'YOUR_API_KEY'}"`,
      response: null,
      error: null
    };

    const authHeader = apiKey ? { 'X-API-Key': apiKey } : token ? { 'Authorization': `Bearer ${token}` } : {};
    if (apiKey || token) {
      try {
        const response = await fetch(`${API_URL}/escrows/health/db`, {
          headers: authHeader
        });
        const data = await response.json();
        dbTest.status = response.ok && data.success ? 'success' : 'failed';
        dbTest.response = data;
        if (!response.ok || !data.success) {
          dbTest.error = data.error?.message || 'Database connection failed';
        }
      } catch (error) {
        dbTest.status = 'failed';
        dbTest.error = error.message;
      }
    } else {
      dbTest.status = 'failed';
      dbTest.error = 'No authentication available';
    }
    testSuite.push(dbTest);
    setTests([...testSuite]);

    // Test 5: Full CRUD Operations
    const crudTest = {
      name: 'CRUD Operations',
      description: 'Test create, read, update, delete operations',
      status: 'pending',
      curl: `curl -X GET "${API_URL}/escrows/health" -H "X-API-Key: ${apiKey || 'YOUR_API_KEY'}"`,
      response: null,
      error: null
    };

    if (apiKey || token) {
      try {
        const response = await fetch(`${API_URL}/escrows/health`, {
          headers: authHeader
        });
        const data = await response.json();
        crudTest.status = response.ok && data.success ? 'success' : 'failed';
        crudTest.response = data;
        if (!response.ok || !data.success) {
          crudTest.error = data.error?.message || 'CRUD operations test failed';
        }
      } catch (error) {
        crudTest.status = 'failed';
        crudTest.error = error.message;
      }
    } else {
      crudTest.status = 'failed';
      crudTest.error = 'No authentication available';
    }
    testSuite.push(crudTest);
    setTests([...testSuite]);

    // Test 6: Security Check (Should Fail)
    const securityTest = {
      name: 'Security Check',
      description: 'Verify unauthorized requests are blocked',
      status: 'pending',
      curl: `curl -X GET "${API_URL}/escrows"`,
      response: null,
      error: null
    };

    try {
      const response = await fetch(`${API_URL}/escrows`);
      const data = await response.json();
      // This should fail (401) for the test to pass
      securityTest.status = response.status === 401 ? 'success' : 'failed';
      securityTest.response = data;
      if (response.status !== 401) {
        securityTest.error = 'Security issue: Unauthorized access was not blocked';
      }
    } catch (error) {
      securityTest.status = 'failed';
      securityTest.error = error.message;
    }
    testSuite.push(securityTest);
    setTests([...testSuite]);

    setLoading(false);
    setLastRefresh(new Date().toLocaleString());
  }, []);

  // Run tests on mount and refresh
  useEffect(() => {
    runAllTests();
  }, [runAllTests]);

  const successCount = tests.filter(t => t.status === 'success').length;
  const failedCount = tests.filter(t => t.status === 'failed').length;

  const copyAllData = () => {
    const allData = {
      dashboard: 'API Health Check Dashboard',
      lastRefresh: lastRefresh || 'Not yet refreshed',
      summary: {
        totalTests: tests.length,
        passed: successCount,
        failed: failedCount
      },
      tests: tests.map(test => ({
        name: test.name,
        description: test.description,
        status: test.status,
        curl: test.curl,
        response: test.response,
        error: test.error
      }))
    };

    const formattedData = JSON.stringify(allData, null, 2);
    navigator.clipboard.writeText(formattedData).then(() => {
      setSnackbarMessage('All test data copied to clipboard!');
      setSnackbarOpen(true);
    }).catch(err => {
      console.error('Failed to copy:', err);
      setSnackbarMessage('Failed to copy data to clipboard');
      setSnackbarOpen(true);
    });
  };

  return (
    <PageContainer>
      <Container maxWidth="lg">
        <Paper sx={{ p: 3, mb: 3, background: 'white' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                API Health Check Dashboard
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Auto-refreshes on page reload • Last refresh: {lastRefresh || 'Loading...'}
              </Typography>
            </Box>
            <Box display="flex" gap={1}>
              <Tooltip title="Copy All Data">
                <IconButton 
                  onClick={copyAllData} 
                  disabled={loading || tests.length === 0}
                  sx={{ 
                    backgroundColor: '#f5f5f5',
                    '&:hover': { backgroundColor: '#e0e0e0' }
                  }}
                >
                  <CopyIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Refresh Tests">
                <IconButton 
                  onClick={runAllTests} 
                  disabled={loading}
                  sx={{ 
                    backgroundColor: '#f5f5f5',
                    '&:hover': { backgroundColor: '#e0e0e0' }
                  }}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#f5f5f5' }}>
                <Typography variant="h4" fontWeight="bold">{tests.length}</Typography>
                <Typography variant="body2" color="textSecondary">Total Tests</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#e8f5e9' }}>
                <Typography variant="h4" fontWeight="bold" color="#4caf50">
                  {successCount}
                </Typography>
                <Typography variant="body2" color="textSecondary">Passed</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#ffebee' }}>
                <Typography variant="h4" fontWeight="bold" color="#f44336">
                  {failedCount}
                </Typography>
                <Typography variant="body2" color="textSecondary">Failed</Typography>
              </Paper>
            </Grid>
          </Grid>
        </Paper>

        {loading && <LinearProgress sx={{ mb: 2 }} />}

        <Fade in={!loading}>
          <Box>
            {tests.map((test, index) => (
              <TestItem key={index} test={test} />
            ))}
          </Box>
        </Fade>
      </Container>
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </PageContainer>
  );
};

export default HealthCheckDashboard;