import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  LinearProgress,
  Chip,
  Grid,
  Alert,
  Paper,
  IconButton,
  Collapse,
  TextField,
  InputAdornment,
  Skeleton
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Cancel as ErrorIcon,
  Warning as WarningIcon,
  PlayArrow as RunIcon,
  Refresh as RefreshIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Storage as DatabaseIcon,
  VpnKey as ApiKeyIcon,
  ContentCopy as CopyIcon,
  Visibility as ShowIcon,
  VisibilityOff as HideIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';

const GradientBackground = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  minHeight: '100vh',
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(8)
}));

const StyledCard = styled(Card)(({ theme, status }) => ({
  marginBottom: theme.spacing(2),
  transition: 'all 0.3s ease',
  border: '1px solid',
  borderColor: status === 'passed' ? '#4caf50' : 
               status === 'failed' ? '#f44336' : 
               status === 'running' ? '#2196f3' : '#e0e0e0',
  boxShadow: status === 'running' ? '0 0 20px rgba(33, 150, 243, 0.3)' : theme.shadows[2],
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[8]
  }
}));

const StatusChip = styled(Chip)(({ status }) => ({
  fontWeight: 'bold',
  ...(status === 'passed' && {
    backgroundColor: '#4caf50',
    color: 'white'
  }),
  ...(status === 'failed' && {
    backgroundColor: '#f44336',
    color: 'white'
  }),
  ...(status === 'running' && {
    backgroundColor: '#2196f3',
    color: 'white'
  }),
  ...(status === 'pending' && {
    backgroundColor: '#9e9e9e',
    color: 'white'
  })
}));

const PulseAnimation = styled(Box)(() => ({
  '@keyframes pulse': {
    '0%': {
      boxShadow: '0 0 0 0 rgba(33, 150, 243, 0.7)'
    },
    '70%': {
      boxShadow: '0 0 0 10px rgba(33, 150, 243, 0)'
    },
    '100%': {
      boxShadow: '0 0 0 0 rgba(33, 150, 243, 0)'
    }
  },
  animation: 'pulse 2s infinite'
}));

const TestResult = ({ test, index }) => {
  const [expanded, setExpanded] = useState(false);
  
  const getIcon = () => {
    switch (test.status) {
      case 'passed': return <CheckIcon sx={{ color: '#4caf50' }} />;
      case 'failed': return <ErrorIcon sx={{ color: '#f44336' }} />;
      case 'running': return <PulseAnimation><SpeedIcon sx={{ color: '#2196f3' }} /></PulseAnimation>;
      default: return <WarningIcon sx={{ color: '#ff9800' }} />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <StyledCard status={test.status}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={2}>
              {getIcon()}
              <Typography variant="h6" fontWeight="bold">
                {test.name.replace(/_/g, ' ')}
              </Typography>
              <StatusChip 
                label={test.status.toUpperCase()} 
                status={test.status}
                size="small"
              />
            </Box>
            {test.details && (
              <IconButton onClick={() => setExpanded(!expanded)} size="small">
                {expanded ? <CollapseIcon /> : <ExpandIcon />}
              </IconButton>
            )}
          </Box>
          
          {test.message && (
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1, ml: 6 }}>
              {test.message}
            </Typography>
          )}
          
          {test.error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {test.error}
            </Alert>
          )}
          
          <Collapse in={expanded}>
            {test.details && (
              <Paper sx={{ mt: 2, p: 2, bgcolor: 'grey.50' }}>
                <pre style={{ margin: 0, fontSize: '0.85rem', overflow: 'auto' }}>
                  {JSON.stringify(test.details, null, 2)}
                </pre>
              </Paper>
            )}
          </Collapse>
        </CardContent>
      </StyledCard>
    </motion.div>
  );
};

const HealthCheckDashboard = () => {
  const { isAuthenticated } = useAuth();
  const [tests, setTests] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [jwtToken, setJwtToken] = useState('');
  const [summary, setSummary] = useState(null);
  const [lastRun, setLastRun] = useState(null);
  const [hasRun, setHasRun] = useState(false);

  useEffect(() => {
    // Get JWT token from localStorage using the correct key
    const token = localStorage.getItem('crm_auth_token');
    if (token) {
      setJwtToken(token);
    } else if (isAuthenticated) {
      // If authenticated through context but token not in expected location
      // Try to get it from the auth service
      const authToken = localStorage.getItem('crm_auth_token') || 
                       localStorage.getItem('token') ||
                       sessionStorage.getItem('crm_auth_token');
      if (authToken) {
        setJwtToken(authToken);
      }
    }
  }, [isAuthenticated]);

  // Auto-run tests on mount and when JWT token is available
  useEffect(() => {
    if (jwtToken && !hasRun && !isRunning) {
      runTests();
      setHasRun(true);
    }
  }, [jwtToken]); // eslint-disable-line react-hooks/exhaustive-deps

  const runTests = async () => {
    setIsRunning(true);
    setTests([]);
    setSummary(null);
    
    const API_URL = process.env.REACT_APP_API_URL || 'https://api.jaydenmetz.com/v1';
    const testResults = [];

    // Test 1: JWT Authentication
    const jwtTest = { name: 'JWT_AUTHENTICATION', status: 'running' };
    setTests([jwtTest]);
    
    try {
      const response = await fetch(`${API_URL}/escrows`, {
        headers: { 'Authorization': `Bearer ${jwtToken}` }
      });
      const data = await response.json();
      
      jwtTest.status = data.success ? 'passed' : 'failed';
      jwtTest.message = data.success ? 'JWT token validated successfully' : data.error?.message;
    } catch (error) {
      jwtTest.status = 'failed';
      jwtTest.error = error.message;
    }
    testResults.push({ ...jwtTest });
    setTests([...testResults]);

    // Test 2: Create API Key
    const createKeyTest = { name: 'CREATE_API_KEY', status: 'running' };
    testResults.push(createKeyTest);
    setTests([...testResults]);
    
    let newApiKey = '';
    try {
      const response = await fetch(`${API_URL}/api-keys`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: `Health Check Key ${new Date().toISOString()}`,
          expiresInDays: 1
        })
      });
      const data = await response.json();
      
      if (data.success) {
        newApiKey = data.data.key;
        setApiKey(newApiKey);
        createKeyTest.status = 'passed';
        createKeyTest.message = `Created key: ${data.data.key_prefix}`;
        createKeyTest.details = { id: data.data.id, prefix: data.data.key_prefix };
      } else {
        createKeyTest.status = 'failed';
        createKeyTest.error = data.error?.message;
      }
    } catch (error) {
      createKeyTest.status = 'failed';
      createKeyTest.error = error.message;
    }
    testResults[1] = { ...createKeyTest };
    setTests([...testResults]);

    // Test 3: API Key Authentication
    if (newApiKey) {
      const apiKeyTest = { name: 'API_KEY_AUTHENTICATION', status: 'running' };
      testResults.push(apiKeyTest);
      setTests([...testResults]);
      
      try {
        const response = await fetch(`${API_URL}/escrows/health/auth`, {
          headers: { 'X-API-Key': newApiKey }
        });
        const data = await response.json();
        
        if (data.success) {
          apiKeyTest.status = 'passed';
          apiKeyTest.message = `Authenticated as: ${data.data.user}`;
          apiKeyTest.details = data.data;
        } else {
          apiKeyTest.status = 'failed';
          apiKeyTest.error = data.error?.message;
        }
      } catch (error) {
        apiKeyTest.status = 'failed';
        apiKeyTest.error = error.message;
      }
      testResults[2] = { ...apiKeyTest };
      setTests([...testResults]);
    }

    // Test 4: Database Connection
    const dbTest = { name: 'DATABASE_CONNECTION', status: 'running' };
    testResults.push(dbTest);
    setTests([...testResults]);
    
    try {
      const response = await fetch(`${API_URL}/escrows/health/db`, {
        headers: { 'X-API-Key': newApiKey || apiKey }
      });
      const data = await response.json();
      
      if (data.success) {
        dbTest.status = 'passed';
        dbTest.message = `Connected to: ${data.data.database}`;
        dbTest.details = data.data;
      } else {
        dbTest.status = 'failed';
        dbTest.error = data.error?.message;
      }
    } catch (error) {
      dbTest.status = 'failed';
      dbTest.error = error.message;
    }
    testResults[3] = { ...dbTest };
    setTests([...testResults]);

    // Test 5: Full Health Check
    const healthTest = { name: 'COMPREHENSIVE_HEALTH_CHECK', status: 'running' };
    testResults.push(healthTest);
    setTests([...testResults]);
    
    try {
      const response = await fetch(`${API_URL}/escrows/health`, {
        headers: { 'X-API-Key': newApiKey || apiKey }
      });
      const data = await response.json();
      
      if (data.success) {
        healthTest.status = 'passed';
        healthTest.message = `All ${data.data.summary?.total} tests passed`;
        healthTest.details = data.data;
      } else {
        healthTest.status = data.data?.summary?.failed > 0 ? 'failed' : 'passed';
        healthTest.message = `${data.data?.summary?.passed || 0} passed, ${data.data?.summary?.failed || 0} failed`;
        healthTest.details = data.data;
      }
    } catch (error) {
      healthTest.status = 'failed';
      healthTest.error = error.message;
    }
    testResults[4] = { ...healthTest };
    setTests([...testResults]);

    // Test 6: Unauthorized Access (should fail)
    const unauthTest = { name: 'UNAUTHORIZED_ACCESS_BLOCKED', status: 'running' };
    testResults.push(unauthTest);
    setTests([...testResults]);
    
    try {
      const response = await fetch(`${API_URL}/escrows`);
      
      if (response.status === 401) {
        unauthTest.status = 'passed';
        unauthTest.message = 'Correctly rejected unauthorized request';
      } else {
        unauthTest.status = 'failed';
        unauthTest.error = 'Security issue: Allowed unauthorized access';
      }
    } catch (error) {
      unauthTest.status = 'failed';
      unauthTest.error = error.message;
    }
    testResults[5] = { ...unauthTest };
    setTests([...testResults]);

    // Calculate summary
    const summaryData = {
      total: testResults.length,
      passed: testResults.filter(t => t.status === 'passed').length,
      failed: testResults.filter(t => t.status === 'failed').length,
      success: testResults.every(t => t.status === 'passed')
    };
    setSummary(summaryData);
    setLastRun(new Date().toLocaleString());
    setIsRunning(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <GradientBackground>
      <Container maxWidth="lg">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Paper sx={{ p: 4, mb: 4, background: 'rgba(255,255,255,0.95)' }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={6}>
                <Typography variant="h3" fontWeight="bold" gutterBottom>
                  <SecurityIcon sx={{ fontSize: 40, mr: 2, verticalAlign: 'middle', color: '#667eea' }} />
                  API Health Check
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  Comprehensive testing suite for API authentication and endpoints
                </Typography>
                <Typography variant="caption" color="primary" display="block" mt={1}>
                  <strong>Auto-runs on page load • Refresh page to re-test</strong>
                </Typography>
                {lastRun && (
                  <Typography variant="caption" color="textSecondary" display="block" mt={0.5}>
                    Last run: {lastRun}
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12} md={6} textAlign="right">
                <Button
                  variant="contained"
                  size="large"
                  startIcon={isRunning ? <RefreshIcon /> : hasRun ? <RefreshIcon /> : <RunIcon />}
                  onClick={runTests}
                  disabled={isRunning || !jwtToken}
                  sx={{
                    background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                    color: 'white',
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem'
                  }}
                >
                  {isRunning ? 'Running Tests...' : hasRun ? 'Re-run Tests' : 'Run All Tests'}
                </Button>
              </Grid>
            </Grid>

            {!jwtToken && !isRunning && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                {isAuthenticated 
                  ? 'Initializing authentication token...' 
                  : 'Please log in first to run health checks'}
              </Alert>
            )}
            
            {isRunning && !summary && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Running automated health checks...
              </Alert>
            )}

            {summary && (
              <Grid container spacing={2} sx={{ mt: 3 }}>
                <Grid item xs={12} sm={3}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#f5f5f5' }}>
                    <Typography variant="h4" fontWeight="bold">{summary.total}</Typography>
                    <Typography variant="body2" color="textSecondary">Total Tests</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#e8f5e9' }}>
                    <Typography variant="h4" fontWeight="bold" color="#4caf50">
                      {summary.passed}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">Passed</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#ffebee' }}>
                    <Typography variant="h4" fontWeight="bold" color="#f44336">
                      {summary.failed}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">Failed</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Paper sx={{ 
                    p: 2, 
                    textAlign: 'center', 
                    bgcolor: summary.success ? '#e8f5e9' : '#ffebee' 
                  }}>
                    <Typography 
                      variant="h4" 
                      fontWeight="bold" 
                      color={summary.success ? '#4caf50' : '#f44336'}
                    >
                      {summary.success ? '✓' : '✗'}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {summary.success ? 'All Passed' : 'Has Failures'}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            )}
          </Paper>
        </motion.div>

        {isRunning && (
          <Box sx={{ mb: 4 }}>
            <LinearProgress />
          </Box>
        )}

        <AnimatePresence>
          {tests.length === 0 && isRunning ? (
            // Show skeleton loaders while initializing
            <>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} sx={{ mb: 2 }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Skeleton variant="circular" width={24} height={24} />
                      <Skeleton variant="text" width={200} height={32} />
                      <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 2 }} />
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            tests.map((test, index) => (
              <TestResult key={test.name} test={test} index={index} />
            ))
          )}
        </AnimatePresence>

        {apiKey && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Paper sx={{ p: 3, mt: 4, background: 'rgba(255,255,255,0.95)' }}>
              <Typography variant="h6" gutterBottom>
                <ApiKeyIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Generated API Key
              </Typography>
              <TextField
                fullWidth
                value={apiKey}
                type={showApiKey ? 'text' : 'password'}
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowApiKey(!showApiKey)}>
                        {showApiKey ? <HideIcon /> : <ShowIcon />}
                      </IconButton>
                      <IconButton onClick={() => copyToClipboard(apiKey)}>
                        <CopyIcon />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                sx={{ mb: 2 }}
              />
              <Typography variant="caption" color="textSecondary">
                This key was created for testing and will expire in 24 hours
              </Typography>
            </Paper>
          </motion.div>
        )}

        <Paper sx={{ p: 3, mt: 4, background: 'rgba(255,255,255,0.95)' }}>
          <Typography variant="h6" gutterBottom>
            <DatabaseIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Test Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="textSecondary" paragraph>
                <strong>Endpoints Tested:</strong>
              </Typography>
              <Typography variant="body2" component="div">
                • /v1/auth/login - JWT authentication<br />
                • /v1/api-keys - API key management<br />
                • /v1/escrows/health/auth - Auth verification<br />
                • /v1/escrows/health/db - Database connection<br />
                • /v1/escrows/health - Full CRUD operations<br />
                • /v1/escrows - Data access with auth
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="textSecondary" paragraph>
                <strong>Security Features:</strong>
              </Typography>
              <Typography variant="body2" component="div">
                • Dual authentication (JWT + API Keys)<br />
                • 64-character hex API keys (no prefix)<br />
                • SHA-256 key hashing<br />
                • User/team scoped permissions<br />
                • Key expiration and revocation<br />
                • Rate limiting and CORS protection
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </GradientBackground>
  );
};

export default HealthCheckDashboard;