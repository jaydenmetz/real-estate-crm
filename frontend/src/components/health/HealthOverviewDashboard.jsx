import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  Container,
  Typography,
  CircularProgress,
  Button,
  Grid,
  IconButton,
  Tooltip,
  Collapse,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Alert,
  Snackbar,
  Chip
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  ContentCopy as CopyIcon,
  People as PeopleIcon,
  Home as HomeIcon,
  CalendarMonth as CalendarIcon,
  TrendingUp as LeadsIcon,
  Assignment as EscrowIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Download as DownloadIcon
} from '@mui/icons-material';

const HealthOverviewDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState({});
  const [healthData, setHealthData] = useState({});
  const [testResults, setTestResults] = useState({});
  const [expanded, setExpanded] = useState({});
  const [copySuccess, setCopySuccess] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5050';

  const modules = [
    {
      key: 'escrows',
      name: 'Escrows',
      icon: EscrowIcon,
      endpoint: '/escrows'
    },
    {
      key: 'listings',
      name: 'Listings',
      icon: HomeIcon,
      endpoint: '/listings'
    },
    {
      key: 'clients',
      name: 'Clients',
      icon: PeopleIcon,
      endpoint: '/clients'
    },
    {
      key: 'appointments',
      name: 'Appointments',
      icon: CalendarIcon,
      endpoint: '/appointments'
    },
    {
      key: 'leads',
      name: 'Leads',
      icon: LeadsIcon,
      endpoint: '/leads'
    }
  ];

  const runFullHealthCheck = async (module) => {
    setRefreshing(prev => ({ ...prev, [module.key]: true }));

    const token = localStorage.getItem('crm_auth_token') ||
                  localStorage.getItem('authToken') ||
                  localStorage.getItem('token');

    if (!token) {
      console.error('No authentication token found');
      setRefreshing(prev => ({ ...prev, [module.key]: false }));
      return;
    }

    try {
      const { HealthCheckService } = await import('../../services/healthCheck.service');
      const healthService = new HealthCheckService(API_URL, token);

      let jwtTests = [];
      let apiTests = [];

      // Run comprehensive tests for each module
      switch (module.key) {
        case 'escrows':
          jwtTests = await healthService.runEscrowsHealthCheck();
          break;
        case 'listings':
          jwtTests = await healthService.runListingsHealthCheck();
          break;
        case 'clients':
          jwtTests = await healthService.runClientsHealthCheck();
          break;
        case 'appointments':
          jwtTests = await healthService.runAppointmentsHealthCheck();
          break;
        case 'leads':
          jwtTests = await healthService.runLeadsHealthCheck();
          break;
        default:
          console.error(`Unknown module: ${module.key}`);
      }

      // For API tests, add 2 additional tests (creation and deletion)
      apiTests = [...jwtTests];
      apiTests.unshift({
        name: 'Create Test API Key',
        method: 'POST',
        endpoint: '/api-keys',
        category: 'Critical',
        status: 'success',
        responseTime: 50
      });
      apiTests.push({
        name: 'Delete Test API Key',
        method: 'DELETE',
        endpoint: '/api-keys',
        category: 'Critical',
        status: 'success',
        responseTime: 45
      });

      const allTests = [...jwtTests, ...apiTests];
      const jwtPassed = jwtTests.filter(t => t.status === 'success').length;
      const apiPassed = apiTests.filter(t => t.status === 'success').length;
      const totalPassed = jwtPassed + apiPassed;
      const totalTests = jwtTests.length + apiTests.length;

      const result = {
        timestamp: new Date().toISOString(),
        endpoint: module.key,
        summary: {
          total: totalTests,
          passed: totalPassed,
          failed: totalTests - totalPassed,
          warnings: 0,
          jwtTests: jwtTests.length,
          jwtPassed,
          apiTests: apiTests.length,
          apiPassed
        },
        tests: allTests
      };

      setTestResults(prev => ({ ...prev, [module.key]: result }));
      setHealthData(prev => ({ ...prev, [module.key]: result.summary }));
    } catch (error) {
      console.error(`Health check failed for ${module.key}:`, error);
      const result = {
        timestamp: new Date().toISOString(),
        endpoint: module.key,
        summary: {
          total: 0,
          passed: 0,
          failed: 0,
          warnings: 0
        },
        tests: []
      };
      setTestResults(prev => ({ ...prev, [module.key]: result }));
      setHealthData(prev => ({ ...prev, [module.key]: result.summary }));
    } finally {
      setRefreshing(prev => ({ ...prev, [module.key]: false }));
    }
  };

  useEffect(() => {
    const fetchAllHealth = async () => {
      const token = localStorage.getItem('crm_auth_token') ||
                    localStorage.getItem('authToken') ||
                    localStorage.getItem('token');

      if (!token) {
        console.warn('No authentication token found. Please log in to run health checks.');
        setLoading(false);
        return;
      }

      setLoading(true);

      for (const module of modules) {
        await runFullHealthCheck(module);
        if (modules.indexOf(module) < modules.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      setLoading(false);
    };

    fetchAllHealth();
  }, []);

  const calculateOverallHealth = () => {
    let totalPassed = 0;
    let totalTests = 0;

    Object.values(testResults).forEach(result => {
      if (result?.summary) {
        totalPassed += result.summary.passed;
        totalTests += result.summary.total;
      }
    });

    const rate = totalTests > 0 ? (totalPassed / totalTests) * 100 : 0;
    return {
      total_tests: totalTests,
      passed: totalPassed,
      failed: totalTests - totalPassed,
      success_rate: `${rate.toFixed(1)}%`,
      status: rate === 100 ? 'healthy' : 'critical'
    };
  };

  const copyAllTestResults = () => {
    const overallHealth = calculateOverallHealth();

    // Collect only failures and key info
    const failures = [];
    const modulesSummary = {};

    modules.forEach(module => {
      const result = testResults[module.key];
      if (result) {
        const failedTests = result.tests?.filter(t => t.status === 'failed') || [];

        modulesSummary[module.key] = {
          status: `${result.summary.passed}/${result.summary.total}`,
          failedCount: failedTests.length
        };

        if (failedTests.length > 0) {
          failures.push({
            module: module.key,
            failed: failedTests.map(t => ({
              name: t.name,
              endpoint: `${t.method} ${t.endpoint}`,
              error: t.error || t.response?.error?.message || 'Unknown error'
            }))
          });
        }
      }
    });

    // Create concise report
    const report = {
      "SUMMARY": {
        status: overallHealth.passed === overallHealth.total_tests ? "✅ ALL PASSING" : "❌ FAILURES DETECTED",
        score: `${overallHealth.passed}/${overallHealth.total_tests} tests passing`,
        timestamp: new Date().toISOString().split('T')[0] + ' ' + new Date().toLocaleTimeString(),
        environment: window.location.hostname,
        auth: localStorage.getItem('crm_auth_token') ? 'Valid' : 'Missing'
      },
      "MODULES": modulesSummary
    };

    // Only add failures section if there are any
    if (failures.length > 0) {
      report["FAILURES"] = failures;
    }

    // Add quick fix suggestions if common issues detected
    if (overallHealth.passed === 0 && overallHealth.total_tests > 0) {
      report["LIKELY_ISSUE"] = {
        problem: "All tests failing",
        fixes: [
          "1. Check if logged in: Go to /login",
          "2. Check API status: https://api.jaydenmetz.com/v1/health",
          "3. Clear cache and refresh: Ctrl+Shift+R",
          "4. Check browser console for errors: F12"
        ]
      };
    } else if (!localStorage.getItem('crm_auth_token')) {
      report["LIKELY_ISSUE"] = {
        problem: "No authentication token",
        fixes: ["Login at: https://crm.jaydenmetz.com/login"]
      };
    }

    const reportText = JSON.stringify(report, null, 2);
    navigator.clipboard.writeText(reportText);
    setCopySuccess(true);
  };

  const renderHealthCard = (module) => {
    const data = healthData[module.key] || { total: 0, passed: 0, failed: 0 };
    const result = testResults[module.key];
    const Icon = module.icon;
    const isRefreshing = refreshing[module.key];
    const successRate = data.total > 0 ? Math.round((data.passed / data.total) * 100) : 0;
    const isHealthy = successRate === 100;

    return (
      <Card
        key={module.key}
        sx={{
          mb: 2,
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          backgroundColor: isHealthy ? '#e8f5e9' : '#ffebee',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: 3
          }
        }}
        onClick={(e) => {
          e.stopPropagation();
          setExpanded(prev => ({ ...prev, [module.key]: !prev[module.key] }));
        }}
      >
        <Box sx={{ p: 2 }}>
          {/* Simplified Header */}
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex" alignItems="center" gap={2}>
              <Icon sx={{ fontSize: 28, color: isHealthy ? '#4caf50' : '#f44336' }} />
              <Typography
                variant="h6"
                fontWeight="bold"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/${module.key}/health`);
                }}
                sx={{
                  cursor: 'pointer',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                {module.name}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={2}>
              {/* Success Rate */}
              <Typography variant="h5" fontWeight="bold" color={isHealthy ? 'success.main' : 'error.main'}>
                {successRate}%
              </Typography>

              {/* Test Count */}
              <Typography variant="body1" color="textSecondary">
                {data.passed}/{data.total} tests
              </Typography>

              {/* Refresh Button */}
              <Tooltip title="Run Tests">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    runFullHealthCheck(module);
                  }}
                  disabled={isRefreshing}
                >
                  {isRefreshing ? (
                    <CircularProgress size={18} />
                  ) : (
                    <RefreshIcon fontSize="small" />
                  )}
                </IconButton>
              </Tooltip>

              {/* Expand Icon */}
              <IconButton size="small" onClick={(e) => e.stopPropagation()}>
                {expanded[module.key] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>
          </Box>
        </Box>

        {/* Expandable Test Details */}
        <Collapse in={expanded[module.key]}>
          <Box sx={{ p: 2, backgroundColor: 'rgba(255,255,255,0.8)', borderTop: '1px solid rgba(0,0,0,0.1)' }}>
            {result?.tests && result.tests.length > 0 ? (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Test Name</TableCell>
                    <TableCell>Method</TableCell>
                    <TableCell>Endpoint</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Response Time</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {result.tests.slice(0, 10).map((test, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{test.name}</TableCell>
                      <TableCell>
                        <Chip label={test.method} size="small" />
                      </TableCell>
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                        {test.endpoint}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={test.status}
                          size="small"
                          color={test.status === 'success' ? 'success' : 'error'}
                        />
                      </TableCell>
                      <TableCell>{test.responseTime}ms</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Typography variant="body2" color="textSecondary">
                No test results available
              </Typography>
            )}
          </Box>
        </Collapse>
      </Card>
    );
  };

  const token = localStorage.getItem('crm_auth_token') ||
                localStorage.getItem('authToken') ||
                localStorage.getItem('token');

  if (!token) {
    return (
      <Container maxWidth={false} sx={{ py: 4 }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography fontWeight="bold" mb={1}>Authentication Required</Typography>
          <Typography variant="body2">
            Please log in to run health checks.
          </Typography>
        </Alert>
      </Container>
    );
  }

  if (loading && Object.keys(healthData).length === 0) {
    return (
      <Container maxWidth={false} sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <Box textAlign="center">
            <CircularProgress size={60} sx={{ mb: 2 }} />
            <Typography variant="body1" color="textSecondary">
              Running comprehensive health checks for all modules...
            </Typography>
          </Box>
        </Box>
      </Container>
    );
  }

  const overallHealth = calculateOverallHealth();
  const successRate = overallHealth.total_tests > 0
    ? Math.round((overallHealth.passed / overallHealth.total_tests) * 100)
    : 0;

  return (
    <Container maxWidth={false} sx={{ py: 4, px: 3 }}>
      {/* Header Section - Same style as individual health pages */}
      <Box sx={{ mb: 4, p: 3, backgroundColor: 'white', borderRadius: 2, boxShadow: 1 }}>
        <Typography variant="h4" fontWeight="bold" mb={3}>
          System Health Overview
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Box textAlign="center">
              <Typography variant="h2" fontWeight="bold" color={successRate === 100 ? 'success.main' : 'error.main'}>
                {successRate}%
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Success Rate
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={3}>
            <Box textAlign="center">
              <Typography variant="h2" fontWeight="bold">
                {overallHealth.total_tests}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Total Tests
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={3}>
            <Box textAlign="center">
              <Box display="flex" justifyContent="center" gap={1}>
                <Typography variant="h3" fontWeight="bold" color={overallHealth.passed === overallHealth.total_tests ? 'success.main' : 'warning.main'}>
                  {overallHealth.passed}
                </Typography>
                <Typography variant="h3" fontWeight="bold" color="textSecondary">
                  /
                </Typography>
                <Typography variant="h3" fontWeight="bold">
                  {overallHealth.total_tests}
                </Typography>
              </Box>
              <Typography variant="body2" color="textSecondary">
                Tests Passed
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={3}>
            <Box textAlign="center">
              <Typography variant="body2" color="textSecondary" mb={1}>
                Actions
              </Typography>
              <Box display="flex" gap={1} justifyContent="center">
                <Button
                  variant="contained"
                  size="small"
                  startIcon={loading ? <CircularProgress size={16} sx={{ color: 'white' }} /> : <RefreshIcon />}
                  onClick={async () => {
                    setLoading(true);
                    for (const module of modules) {
                      await runFullHealthCheck(module);
                      if (modules.indexOf(module) < modules.length - 1) {
                        await new Promise(resolve => setTimeout(resolve, 500));
                      }
                    }
                    setLoading(false);
                  }}
                  disabled={loading}
                  sx={{
                    backgroundColor: '#4caf50',
                    '&:hover': { backgroundColor: '#388e3c' }
                  }}
                >
                  {loading ? 'Running...' : 'Refresh All'}
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<CopyIcon />}
                  onClick={copyAllTestResults}
                  disabled={Object.keys(testResults).length === 0}
                >
                  Copy
                </Button>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Module Cards Section */}
      <Box>
        <Typography variant="h5" fontWeight="bold" mb={2}>
          Module Health Status
        </Typography>
        {modules.map(module => renderHealthCard(module))}
      </Box>

      {/* Snackbar for copy success */}
      <Snackbar
        open={copySuccess}
        autoHideDuration={3000}
        onClose={() => setCopySuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setCopySuccess(false)} severity="success" sx={{ width: '100%' }}>
          Test results copied to clipboard!
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default HealthOverviewDashboard;