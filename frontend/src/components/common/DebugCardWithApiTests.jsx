import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  IconButton,
  Typography,
  Box,
  Collapse,
  Chip,
  Stack,
  Divider,
  Grid,
  Paper,
  Alert,
  Button,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  ContentCopy as CopyIcon,
  BugReport as BugIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Cancel as CancelIcon,
  Speed as SpeedIcon,
  Memory as MemoryIcon,
  Storage as StorageIcon,
  Api as ApiIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import authService from '../../services/auth.service';

const DebugContainer = styled(Card)(({ theme }) => ({
  margin: theme.spacing(2),
  backgroundColor: '#1a1a1a',
  color: '#e0e0e0',
  borderRadius: theme.spacing(1),
  border: '2px solid #764ba2',
  position: 'relative'
}));

const StatsGrid = styled(Grid)(({ theme }) => ({
  padding: theme.spacing(2)
}));

const StatCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: '#2d2d2d',
  color: '#e0e0e0',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1)
}));

const CodeBlock = styled(Box)(({ theme }) => ({
  backgroundColor: '#0d0d0d',
  padding: theme.spacing(1),
  borderRadius: theme.spacing(0.5),
  fontFamily: 'Consolas, Monaco, monospace',
  fontSize: '0.875rem',
  overflow: 'auto',
  maxHeight: 300,
  border: '1px solid #3d3d3d'
}));

const TestCard = styled(Card)(({ status }) => ({
  marginBottom: '16px',
  border: '2px solid',
  borderColor: status === 'success' ? '#4caf50' : 
               status === 'failed' ? '#f44336' : '#e0e0e0',
  backgroundColor: status === 'success' ? '#1a2e1a' : 
                   status === 'failed' ? '#2e1a1a' : '#1a1a1a',
  transition: 'all 0.3s ease'
}));

const TestItem = ({ test }) => {
  const [expanded, setExpanded] = useState(false);

  const StatusIcon = ({ status }) => {
    if (status === 'success') return <CheckIcon sx={{ color: '#4caf50' }} />;
    if (status === 'failed') return <CancelIcon sx={{ color: '#f44336' }} />;
    return <SpeedIcon sx={{ color: '#ff9800' }} />;
  };

  return (
    <TestCard status={test.status}>
      <CardContent onClick={() => setExpanded(!expanded)} sx={{ cursor: 'pointer', pb: expanded ? 0 : 2 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={2}>
            <StatusIcon status={test.status} />
            <Box>
              <Typography variant="subtitle1" fontWeight={600}>
                {test.name}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.7 }}>
                {test.description}
              </Typography>
            </Box>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            {test.latency && (
              <Chip 
                label={`${test.latency}ms`} 
                size="small" 
                sx={{ 
                  backgroundColor: test.latency < 200 ? '#1a2e1a' : 
                                  test.latency < 500 ? '#2e2e1a' : '#2e1a1a' 
                }}
              />
            )}
            <IconButton size="small">
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
        </Box>
      </CardContent>
      
      <Collapse in={expanded}>
        <Divider sx={{ backgroundColor: '#3d3d3d' }} />
        <CardContent>
          {test.curl && (
            <Box mb={2}>
              <Typography variant="subtitle2" sx={{ mb: 1, color: '#60a5fa' }}>
                API Request:
              </Typography>
              <CodeBlock>
                <pre style={{ margin: 0 }}>{test.curl}</pre>
              </CodeBlock>
            </Box>
          )}
          
          {test.response && (
            <Box mb={2}>
              <Typography variant="subtitle2" sx={{ mb: 1, color: '#10b981' }}>
                Response:
              </Typography>
              <CodeBlock>
                <pre style={{ margin: 0 }}>{JSON.stringify(test.response, null, 2)}</pre>
              </CodeBlock>
            </Box>
          )}
          
          {test.error && (
            <Alert severity="error" sx={{ backgroundColor: '#2e1a1a', color: '#ff6b6b' }}>
              {test.error}
            </Alert>
          )}
        </CardContent>
      </Collapse>
    </TestCard>
  );
};

function DebugCardWithApiTests({ pageType = 'dashboard', pageData = {} }) {
  const [expanded, setExpanded] = useState(false);
  const [apiTestsExpanded, setApiTestsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState({
    api: { status: 'checking', latency: 0 },
    database: { status: 'checking', connections: 0 },
    auth: { status: 'checking', token: false, user: null },
    performance: { loadTime: 0, memoryUsage: 0 },
    tests: { passed: 0, failed: 0, total: 0 }
  });
  const [apiTests, setApiTests] = useState([]);
  const [testingInProgress, setTestingInProgress] = useState(false);

  // Only show for system admins
  const currentUser = authService.getCurrentUser();
  const isSystemAdmin = currentUser?.role === 'system_admin' || currentUser?.role === 'admin';
  
  if (!isSystemAdmin) {
    return null;
  }

  // Run API tests for escrow detail page
  const runEscrowDetailApiTests = async () => {
    if (pageType !== 'escrow-detail' || !pageData.id) return;
    
    setTestingInProgress(true);
    const tests = [];
    const API_URL = process.env.REACT_APP_API_URL || 'https://api.jaydenmetz.com';
    const token = localStorage.getItem('crm_auth_token') || 
                 localStorage.getItem('authToken') ||
                 localStorage.getItem('token');
    
    // Test 1: Get Escrow Details
    const escrowTest = {
      name: 'Get Escrow Details',
      description: `Fetch escrow data for ID: ${pageData.id}`,
      status: 'pending',
      curl: `curl -X GET "${API_URL}/v1/escrows/${pageData.id}" -H "Authorization: Bearer ${token ? '***' : 'NO_TOKEN'}"`,
      response: null,
      error: null,
      latency: 0
    };
    
    try {
      const startTime = Date.now();
      const response = await fetch(`${API_URL}/v1/escrows/${pageData.id}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      escrowTest.latency = Date.now() - startTime;
      const data = await response.json();
      escrowTest.status = response.ok && data.success ? 'success' : 'failed';
      escrowTest.response = data;
      if (!response.ok || !data.success) {
        escrowTest.error = data.error?.message || 'Failed to fetch escrow';
      }
    } catch (error) {
      escrowTest.status = 'failed';
      escrowTest.error = error.message;
    }
    tests.push(escrowTest);
    
    // Test 2: Get Escrow Timeline
    const timelineTest = {
      name: 'Get Escrow Timeline',
      description: 'Fetch timeline events for the escrow',
      status: 'pending',
      curl: `curl -X GET "${API_URL}/v1/escrows/${pageData.id}/timeline" -H "Authorization: Bearer ${token ? '***' : 'NO_TOKEN'}"`,
      response: null,
      error: null,
      latency: 0
    };
    
    try {
      const startTime = Date.now();
      const response = await fetch(`${API_URL}/v1/escrows/${pageData.id}/timeline`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      timelineTest.latency = Date.now() - startTime;
      const data = await response.json();
      timelineTest.status = response.ok && data.success ? 'success' : 'failed';
      timelineTest.response = data;
      if (!response.ok || !data.success) {
        timelineTest.error = data.error?.message || 'Failed to fetch timeline';
      }
    } catch (error) {
      timelineTest.status = 'failed';
      timelineTest.error = error.message;
    }
    tests.push(timelineTest);
    
    // Test 3: Get Escrow People
    const peopleTest = {
      name: 'Get Escrow People',
      description: 'Fetch people associated with the escrow',
      status: 'pending',
      curl: `curl -X GET "${API_URL}/v1/escrows/${pageData.id}/people" -H "Authorization: Bearer ${token ? '***' : 'NO_TOKEN'}"`,
      response: null,
      error: null,
      latency: 0
    };
    
    try {
      const startTime = Date.now();
      const response = await fetch(`${API_URL}/v1/escrows/${pageData.id}/people`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      peopleTest.latency = Date.now() - startTime;
      const data = await response.json();
      peopleTest.status = response.ok && data.success ? 'success' : 'failed';
      peopleTest.response = data;
      if (!response.ok || !data.success) {
        peopleTest.error = data.error?.message || 'Failed to fetch people';
      }
    } catch (error) {
      peopleTest.status = 'failed';
      peopleTest.error = error.message;
    }
    tests.push(peopleTest);
    
    // Test 4: Get Escrow Financials
    const financialsTest = {
      name: 'Get Escrow Financials',
      description: 'Fetch financial information for the escrow',
      status: 'pending',
      curl: `curl -X GET "${API_URL}/v1/escrows/${pageData.id}/financials" -H "Authorization: Bearer ${token ? '***' : 'NO_TOKEN'}"`,
      response: null,
      error: null,
      latency: 0
    };
    
    try {
      const startTime = Date.now();
      const response = await fetch(`${API_URL}/v1/escrows/${pageData.id}/financials`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      financialsTest.latency = Date.now() - startTime;
      const data = await response.json();
      financialsTest.status = response.ok && data.success ? 'success' : 'failed';
      financialsTest.response = data;
      if (!response.ok || !data.success) {
        financialsTest.error = data.error?.message || 'Failed to fetch financials';
      }
    } catch (error) {
      financialsTest.status = 'failed';
      financialsTest.error = error.message;
    }
    tests.push(financialsTest);
    
    // Test 5: Get Escrow Checklists
    const checklistsTest = {
      name: 'Get Escrow Checklists',
      description: 'Fetch checklists for the escrow',
      status: 'pending',
      curl: `curl -X GET "${API_URL}/v1/escrows/${pageData.id}/checklists" -H "Authorization: Bearer ${token ? '***' : 'NO_TOKEN'}"`,
      response: null,
      error: null,
      latency: 0
    };
    
    try {
      const startTime = Date.now();
      const response = await fetch(`${API_URL}/v1/escrows/${pageData.id}/checklists`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      checklistsTest.latency = Date.now() - startTime;
      const data = await response.json();
      checklistsTest.status = response.ok && data.success ? 'success' : 'failed';
      checklistsTest.response = data;
      if (!response.ok || !data.success) {
        checklistsTest.error = data.error?.message || 'Failed to fetch checklists';
      }
    } catch (error) {
      checklistsTest.status = 'failed';
      checklistsTest.error = error.message;
    }
    tests.push(checklistsTest);
    
    // Test 6: Get Escrow Documents
    const documentsTest = {
      name: 'Get Escrow Documents',
      description: 'Fetch documents associated with the escrow',
      status: 'pending',
      curl: `curl -X GET "${API_URL}/v1/documents?entityType=escrow&entityId=${pageData.id}" -H "Authorization: Bearer ${token ? '***' : 'NO_TOKEN'}"`,
      response: null,
      error: null,
      latency: 0
    };
    
    try {
      const startTime = Date.now();
      const response = await fetch(`${API_URL}/v1/documents?entityType=escrow&entityId=${pageData.id}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      documentsTest.latency = Date.now() - startTime;
      const data = await response.json();
      documentsTest.status = response.ok && data.success ? 'success' : 'failed';
      documentsTest.response = data;
      if (!response.ok || !data.success) {
        documentsTest.error = data.error?.message || 'Failed to fetch documents';
      }
    } catch (error) {
      documentsTest.status = 'failed';
      documentsTest.error = error.message;
    }
    tests.push(documentsTest);
    
    // Test 7: Get Escrow Notes
    const notesTest = {
      name: 'Get Escrow Notes',
      description: 'Fetch notes for the escrow',
      status: 'pending',
      curl: `curl -X GET "${API_URL}/v1/escrows/${pageData.id}/notes" -H "Authorization: Bearer ${token ? '***' : 'NO_TOKEN'}"`,
      response: null,
      error: null,
      latency: 0
    };
    
    try {
      const startTime = Date.now();
      const response = await fetch(`${API_URL}/v1/escrows/${pageData.id}/notes`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      notesTest.latency = Date.now() - startTime;
      const data = await response.json();
      notesTest.status = response.ok && data.success ? 'success' : 'failed';
      notesTest.response = data;
      if (!response.ok || !data.success) {
        notesTest.error = data.error?.message || 'Failed to fetch notes';
      }
    } catch (error) {
      notesTest.status = 'failed';
      notesTest.error = error.message;
    }
    tests.push(notesTest);
    
    // Update stats
    const passedTests = tests.filter(t => t.status === 'success').length;
    const failedTests = tests.filter(t => t.status === 'failed').length;
    
    setStats(prev => ({
      ...prev,
      tests: {
        passed: passedTests,
        failed: failedTests,
        total: tests.length,
        percentage: Math.round((passedTests / tests.length) * 100)
      }
    }));
    
    setApiTests(tests);
    setTestingInProgress(false);
  };

  useEffect(() => {
    // Gather debug stats
    const gatherStats = async () => {
      // Check API health
      try {
        const startTime = Date.now();
        const response = await fetch('/api/health');
        const latency = Date.now() - startTime;
        
        setStats(prev => ({
          ...prev,
          api: {
            status: response.ok ? 'healthy' : 'error',
            latency,
            endpoint: window.location.hostname === 'localhost' 
              ? 'http://localhost:5050' 
              : 'https://api.jaydenmetz.com'
          }
        }));
      } catch (error) {
        setStats(prev => ({
          ...prev,
          api: { status: 'error', latency: 0, error: error.message }
        }));
      }

      // Check authentication
      const token = localStorage.getItem('crm_auth_token') || 
                   localStorage.getItem('authToken') ||
                   localStorage.getItem('token');
      
      setStats(prev => ({
        ...prev,
        auth: {
          status: token ? 'authenticated' : 'unauthenticated',
          token: !!token,
          user: currentUser,
          tokenLocation: token ? (
            localStorage.getItem('crm_auth_token') ? 'crm_auth_token' :
            localStorage.getItem('authToken') ? 'authToken' : 'token'
          ) : 'none'
        }
      }));

      // Performance metrics
      if (performance && performance.memory) {
        setStats(prev => ({
          ...prev,
          performance: {
            loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
            memoryUsage: Math.round(performance.memory.usedJSHeapSize / 1048576),
            memoryLimit: Math.round(performance.memory.jsHeapSizeLimit / 1048576)
          }
        }));
      }
    };

    gatherStats();
    
    // Run API tests if on escrow-detail page
    if (pageType === 'escrow-detail' && pageData.id && expanded) {
      runEscrowDetailApiTests();
    }
  }, [expanded, pageType, pageData.id, currentUser]);

  const copyDebugInfo = () => {
    const debugData = {
      timestamp: new Date().toISOString(),
      page: {
        type: pageType,
        url: window.location.href,
        data: pageData
      },
      stats,
      apiTests: apiTests.map(test => ({
        name: test.name,
        status: test.status,
        latency: test.latency,
        error: test.error
      })),
      environment: {
        nodeEnv: process.env.NODE_ENV,
        apiUrl: process.env.REACT_APP_API_URL,
        userAgent: navigator.userAgent,
        screen: `${window.screen.width}x${window.screen.height}`,
        viewport: `${window.innerWidth}x${window.innerHeight}`
      }
    };

    navigator.clipboard.writeText(JSON.stringify(debugData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy':
      case 'authenticated':
        return <CheckIcon sx={{ color: '#4caf50', fontSize: 16 }} />;
      case 'error':
      case 'unauthenticated':
        return <ErrorIcon sx={{ color: '#f44336', fontSize: 16 }} />;
      default:
        return <SpeedIcon sx={{ color: '#ff9800', fontSize: 16 }} />;
    }
  };

  return (
    <DebugContainer elevation={3}>
      {/* Copy Button - Always visible in top right */}
      <IconButton
        onClick={copyDebugInfo}
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          zIndex: 10,
          backgroundColor: copied ? '#4caf50' : '#764ba2',
          color: 'white',
          '&:hover': {
            backgroundColor: copied ? '#45a049' : '#5a3a80'
          }
        }}
      >
        {copied ? <CheckIcon /> : <CopyIcon />}
      </IconButton>
      {copied && (
        <Chip
          label="Copied!"
          size="small"
          sx={{
            position: 'absolute',
            top: 8,
            right: 56,
            backgroundColor: '#4caf50',
            color: 'white'
          }}
        />
      )}

      {/* Header */}
      <CardContent sx={{ pb: expanded ? 0 : 2 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <IconButton
            onClick={() => setExpanded(!expanded)}
            sx={{ color: '#764ba2' }}
          >
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
          <BugIcon sx={{ color: '#764ba2' }} />
          <Typography variant="h6" sx={{ flex: 1, fontWeight: 600 }}>
            System Admin Debug Panel
          </Typography>
          
          {/* Quick stats chips */}
          <Stack direction="row" spacing={1}>
            <Chip
              icon={getStatusIcon(stats.api.status)}
              label={`API: ${stats.api.latency}ms`}
              size="small"
              sx={{ backgroundColor: '#2d2d2d' }}
            />
            <Chip
              icon={getStatusIcon(stats.auth.status)}
              label={stats.auth.user?.username || 'No User'}
              size="small"
              sx={{ backgroundColor: '#2d2d2d' }}
            />
            {pageType === 'escrow-detail' && apiTests.length > 0 && (
              <Chip
                icon={<CheckIcon sx={{ color: stats.tests.failed === 0 ? '#4caf50' : '#f44336' }} />}
                label={`${stats.tests.passed}/${stats.tests.total} APIs`}
                size="small"
                sx={{ 
                  backgroundColor: stats.tests.failed === 0 ? '#1a2e1a' : '#2e1a1a',
                  color: stats.tests.failed === 0 ? '#4caf50' : '#ff6b6b'
                }}
              />
            )}
          </Stack>
        </Stack>
      </CardContent>

      {/* Expanded Content */}
      <Collapse in={expanded}>
        <Divider sx={{ backgroundColor: '#3d3d3d' }} />
        <CardContent>
          <StatsGrid container spacing={2}>
            {/* API Stats */}
            <Grid item xs={12} md={3}>
              <StatCard elevation={0}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <ApiIcon sx={{ color: '#60a5fa' }} />
                  <Typography variant="subtitle2" fontWeight={600}>
                    API Status
                  </Typography>
                </Stack>
                <Typography variant="body2">
                  Status: {stats.api.status}
                </Typography>
                <Typography variant="body2">
                  Latency: {stats.api.latency}ms
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.75rem', opacity: 0.7 }}>
                  {stats.api.endpoint}
                </Typography>
              </StatCard>
            </Grid>

            {/* Auth Stats */}
            <Grid item xs={12} md={3}>
              <StatCard elevation={0}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <StorageIcon sx={{ color: '#10b981' }} />
                  <Typography variant="subtitle2" fontWeight={600}>
                    Authentication
                  </Typography>
                </Stack>
                <Typography variant="body2">
                  Status: {stats.auth.status}
                </Typography>
                <Typography variant="body2">
                  User: {stats.auth.user?.username}
                </Typography>
                <Typography variant="body2">
                  Role: {stats.auth.user?.role}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.75rem', opacity: 0.7 }}>
                  Token: {stats.auth.tokenLocation}
                </Typography>
              </StatCard>
            </Grid>

            {/* Performance Stats */}
            <Grid item xs={12} md={3}>
              <StatCard elevation={0}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <MemoryIcon sx={{ color: '#f59e0b' }} />
                  <Typography variant="subtitle2" fontWeight={600}>
                    Performance
                  </Typography>
                </Stack>
                <Typography variant="body2">
                  Load Time: {stats.performance.loadTime}ms
                </Typography>
                <Typography variant="body2">
                  Memory: {stats.performance.memoryUsage}MB
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.75rem', opacity: 0.7 }}>
                  Limit: {stats.performance.memoryLimit}MB
                </Typography>
              </StatCard>
            </Grid>

            {/* API Test Results (for escrow detail) */}
            {pageType === 'escrow-detail' && (
              <Grid item xs={12} md={3}>
                <StatCard elevation={0}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <CheckIcon sx={{ color: stats.tests.failed === 0 ? '#4caf50' : '#f44336' }} />
                    <Typography variant="subtitle2" fontWeight={600}>
                      API Tests
                    </Typography>
                  </Stack>
                  <Typography variant="body2" sx={{ color: '#4caf50' }}>
                    Passed: {stats.tests.passed}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#f44336' }}>
                    Failed: {stats.tests.failed}
                  </Typography>
                  <Typography variant="body2">
                    Success: {stats.tests.percentage}%
                  </Typography>
                </StatCard>
              </Grid>
            )}

            {/* Page Data Preview */}
            {Object.keys(pageData).length > 0 && (
              <Grid item xs={12}>
                <StatCard elevation={0}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Page Data Preview
                  </Typography>
                  <CodeBlock>
                    <pre>{JSON.stringify(pageData, null, 2)}</pre>
                  </CodeBlock>
                </StatCard>
              </Grid>
            )}

            {/* API Tests Section for Escrow Detail */}
            {pageType === 'escrow-detail' && (
              <Grid item xs={12}>
                <Accordion 
                  expanded={apiTestsExpanded} 
                  onChange={(e, isExpanded) => setApiTestsExpanded(isExpanded)}
                  sx={{ backgroundColor: '#2d2d2d', color: '#e0e0e0' }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#764ba2' }} />}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <ApiIcon sx={{ color: '#764ba2' }} />
                      <Typography variant="h6" fontWeight={600}>
                        Escrow Detail API Health Check
                      </Typography>
                      {apiTests.length > 0 && (
                        <Chip
                          label={`${stats.tests.passed}/${stats.tests.total} Passing`}
                          sx={{
                            backgroundColor: stats.tests.failed === 0 ? '#1a2e1a' : '#2e1a1a',
                            color: stats.tests.failed === 0 ? '#4caf50' : '#ff6b6b',
                            fontWeight: 600
                          }}
                        />
                      )}
                    </Stack>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="body2" sx={{ opacity: 0.7 }}>
                          Testing all API endpoints used on this escrow detail page
                        </Typography>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<RefreshIcon />}
                          onClick={runEscrowDetailApiTests}
                          disabled={testingInProgress}
                          sx={{ borderColor: '#764ba2', color: '#764ba2' }}
                        >
                          {testingInProgress ? 'Testing...' : 'Rerun Tests'}
                        </Button>
                      </Stack>
                      
                      {testingInProgress && <LinearProgress sx={{ mb: 2 }} />}
                      
                      {apiTests.length > 0 ? (
                        apiTests.map((test, index) => (
                          <TestItem key={index} test={test} />
                        ))
                      ) : (
                        <Alert severity="info" sx={{ backgroundColor: '#1a1a2e', color: '#60a5fa' }}>
                          Click "Rerun Tests" to check all API endpoints for this escrow
                        </Alert>
                      )}
                    </Box>
                  </AccordionDetails>
                </Accordion>
              </Grid>
            )}
          </StatsGrid>

          {/* Action Buttons */}
          <Box mt={2} display="flex" gap={2}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => window.location.reload()}
              sx={{ borderColor: '#764ba2', color: '#764ba2' }}
            >
              Reload Page
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={() => console.log({ stats, pageData, apiTests })}
              sx={{ borderColor: '#764ba2', color: '#764ba2' }}
            >
              Log to Console
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={copyDebugInfo}
              startIcon={<CopyIcon />}
              sx={{ borderColor: '#764ba2', color: '#764ba2' }}
            >
              Copy All Debug Info
            </Button>
          </Box>
        </CardContent>
      </Collapse>
    </DebugContainer>
  );
}

export default DebugCardWithApiTests;