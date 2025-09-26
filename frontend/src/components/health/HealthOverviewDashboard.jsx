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
  Paper,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon,
  AccessTime as AccessTimeIcon,
  Speed as SpeedIcon,
  BugReport as BugReportIcon,
  Code as CodeIcon,
  PlayArrow as PlayArrowIcon,
  Home as HomeIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  CalendarMonth as CalendarIcon,
  TrendingUp as LeadsIcon,
  Assignment as EscrowIcon
} from '@mui/icons-material';

const HealthOverviewDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState({});
  const [healthData, setHealthData] = useState({});
  const [testResults, setTestResults] = useState({});

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5050';

  const modules = [
    {
      key: 'escrows',
      name: 'Escrows API Health Dashboard',
      icon: EscrowIcon,
      color: '#2196f3',
      endpoint: '/escrows'
    },
    {
      key: 'listings',
      name: 'Listings API Health Dashboard',
      icon: HomeIcon,
      color: '#4caf50',
      endpoint: '/listings'
    },
    {
      key: 'clients',
      name: 'Clients API Health Dashboard',
      icon: PeopleIcon,
      color: '#ff9800',
      endpoint: '/clients'
    },
    {
      key: 'appointments',
      name: 'Appointments API Health Dashboard',
      icon: CalendarIcon,
      color: '#9c27b0',
      endpoint: '/appointments'
    },
    {
      key: 'leads',
      name: 'Leads API Health Dashboard',
      icon: LeadsIcon,
      color: '#f44336',
      endpoint: '/leads'
    }
  ];

  const runFullHealthCheck = async (module) => {
    setRefreshing(prev => ({ ...prev, [module.key]: true }));

    let API_URL_BASE = API_URL;
    if (!API_URL_BASE.endsWith('/v1')) {
      API_URL_BASE = API_URL_BASE.replace(/\/$/, '') + '/v1';
    }

    const token = localStorage.getItem('crm_auth_token') ||
                  localStorage.getItem('authToken') ||
                  localStorage.getItem('token');

    const allTests = [];
    const grouped = { CORE: [], FILTERS: [], ERROR: [], EDGE: [], PERFORMANCE: [], WORKFLOW: [] };
    let createdId = null;
    const createdIds = [];

    try {
      // Core GET: List all
      const getAllTest = {
        name: 'List All',
        category: 'Critical',
        method: 'GET',
        endpoint: module.endpoint,
        status: 'pending'
      };

      const startTime1 = Date.now();
      try {
        const response = await fetch(`${API_URL_BASE}${module.endpoint}`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        const data = await response.json();
        getAllTest.responseTime = Date.now() - startTime1;
        getAllTest.status = response.ok && data.success ? 'success' : 'failed';
        getAllTest.response = data;
      } catch (error) {
        getAllTest.status = 'failed';
        getAllTest.error = error.message;
      }
      grouped.CORE.push(getAllTest);
      allTests.push(getAllTest);

      // Core POST: Create minimal
      let minimalData = {};
      if (module.key === 'escrows') {
        minimalData = { propertyAddress: `${Date.now()} Test Lane` };
      } else if (module.key === 'listings') {
        minimalData = {
          propertyAddress: `${Date.now()} Test Street`,
          listPrice: 500000,
          propertyType: 'Single Family'
        };
      } else if (module.key === 'clients') {
        minimalData = {
          firstName: 'Test',
          lastName: `Client_${Date.now()}`,
          email: `client_${Date.now()}@example.com`
        };
      } else if (module.key === 'appointments') {
        minimalData = {
          title: `Test Appointment ${Date.now()}`,
          startTime: new Date().toISOString(),
          endTime: new Date(Date.now() + 3600000).toISOString()
        };
      } else if (module.key === 'leads') {
        minimalData = {
          firstName: 'Test',
          lastName: `Lead_${Date.now()}`,
          email: `lead_${Date.now()}@example.com`,
          source: 'Website'
        };
      }

      const createTest = {
        name: 'Create (Minimal)',
        category: 'Critical',
        method: 'POST',
        endpoint: module.endpoint,
        status: 'pending',
        requestBody: minimalData
      };

      const startTime2 = Date.now();
      try {
        const response = await fetch(`${API_URL_BASE}${module.endpoint}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(minimalData)
        });
        const data = await response.json();
        createTest.responseTime = Date.now() - startTime2;
        createTest.status = response.ok && data.success ? 'success' : 'failed';
        createTest.response = data;
        if (data.success && data.data) {
          createdId = data.data.id || data.data._id;
          createdIds.push(createdId);
        }
      } catch (error) {
        createTest.status = 'failed';
        createTest.error = error.message;
      }
      grouped.CORE.push(createTest);
      allTests.push(createTest);

      // Error handling test
      const errorTest = {
        name: 'Get Non-Existent',
        category: 'Error Handling',
        method: 'GET',
        endpoint: `${module.endpoint}/00000000-0000-0000-0000-000000000000`,
        status: 'pending'
      };

      const startTime3 = Date.now();
      try {
        const response = await fetch(`${API_URL_BASE}${module.endpoint}/00000000-0000-0000-0000-000000000000`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        errorTest.responseTime = Date.now() - startTime3;
        errorTest.status = !response.ok && data.error ? 'success' : 'failed';
        errorTest.response = data;
      } catch (error) {
        errorTest.status = 'failed';
        errorTest.error = error.message;
      }
      grouped.ERROR.push(errorTest);
      allTests.push(errorTest);

      // Cleanup created items
      for (const id of createdIds) {
        if (module.key === 'escrows' || module.key === 'listings') {
          try {
            await fetch(`${API_URL_BASE}${module.endpoint}/${id}/archive`, {
              method: 'PUT',
              headers: { 'Authorization': `Bearer ${token}` }
            });
            await fetch(`${API_URL_BASE}${module.endpoint}/${id}`, {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${token}` }
            });
          } catch (e) {
            console.error('Cleanup error:', e);
          }
        } else if (module.key === 'clients') {
          try {
            await fetch(`${API_URL_BASE}${module.endpoint}/${id}`, {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${token}` }
            });
          } catch (e) {
            console.error('Cleanup error:', e);
          }
        }
      }

      // Calculate summary
      const passed = allTests.filter(t => t.status === 'success').length;
      const failed = allTests.filter(t => t.status === 'failed').length;
      const warnings = allTests.filter(t => t.status === 'warning').length;

      const result = {
        timestamp: new Date().toISOString(),
        endpoint: module.key,
        summary: {
          total: allTests.length,
          passed,
          failed,
          warnings
        },
        categories: {
          core: grouped.CORE.filter(t => t.status === 'success').length,
          filters: 0,
          errors: grouped.ERROR.filter(t => t.status === 'success').length,
          edge: 0,
          performance: 0,
          workflow: 0
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
        categories: {
          core: 0,
          filters: 0,
          errors: 0,
          edge: 0,
          performance: 0,
          workflow: 0
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
      setLoading(true);
      for (const module of modules) {
        await runFullHealthCheck(module);
      }
      setLoading(false);
    };
    fetchAllHealth();
  }, []);

  const getStatusColor = (passed, total) => {
    if (total === 0) return '#9e9e9e';
    const rate = (passed / total) * 100;
    if (rate === 100) return '#4caf50';
    if (rate >= 80) return '#ff9800';
    return '#f44336';
  };

  const getStatusIcon = (passed, total) => {
    if (total === 0) return null;
    const rate = (passed / total) * 100;
    if (rate === 100) return <CheckCircleIcon sx={{ fontSize: 20, color: '#4caf50' }} />;
    if (rate >= 80) return <WarningIcon sx={{ fontSize: 20, color: '#ff9800' }} />;
    return <ErrorIcon sx={{ fontSize: 20, color: '#f44336' }} />;
  };

  const formatResponseTime = (time) => {
    if (!time) return 'N/A';
    if (time < 100) return `${time}ms ⚡`;
    if (time < 500) return `${time}ms ✓`;
    return `${time}ms ⚠`;
  };

  const renderHealthCard = (module) => {
    const data = healthData[module.key] || { total: 0, passed: 0, failed: 0, warnings: 0 };
    const result = testResults[module.key];
    const Icon = module.icon;
    const isRefreshing = refreshing[module.key];

    // Calculate average response time
    const avgResponseTime = result?.tests
      ? Math.round(result.tests.reduce((sum, t) => sum + (t.responseTime || 0), 0) / result.tests.length)
      : 0;

    return (
      <Card
        key={module.key}
        sx={{
          mb: 3,
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: 4
          }
        }}
        onClick={() => navigate(`/${module.key}/health`)}
      >
        <Box sx={{ p: 3, backgroundColor: '#f8f9fa' }}>
          {/* Header */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Box display="flex" alignItems="center" gap={2}>
              <Icon sx={{ fontSize: 32, color: module.color }} />
              <Typography variant="h5" fontWeight="bold">
                {module.name}
              </Typography>
            </Box>
            <Box display="flex" gap={1}>
              <Tooltip title="Run Tests">
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    runFullHealthCheck(module);
                  }}
                  disabled={isRefreshing}
                  sx={{
                    backgroundColor: 'primary.main',
                    color: 'white',
                    '&:hover': { backgroundColor: 'primary.dark' }
                  }}
                >
                  {isRefreshing ? (
                    <CircularProgress size={20} sx={{ color: 'white' }} />
                  ) : (
                    <PlayArrowIcon />
                  )}
                </IconButton>
              </Tooltip>
              <Tooltip title="Refresh">
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    runFullHealthCheck(module);
                  }}
                  disabled={isRefreshing}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Summary Cards */}
          <Grid container spacing={2} mb={3}>
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" fontWeight="bold" color={getStatusColor(data.passed, data.total)}>
                  {data.total > 0 ? Math.round((data.passed / data.total) * 100) : 0}%
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Success Rate
                </Typography>
                {getStatusIcon(data.passed, data.total)}
              </Paper>
            </Grid>
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" fontWeight="bold">
                  {data.total}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Total Tests
                </Typography>
                <Box display="flex" justifyContent="center" gap={0.5} mt={1}>
                  <Chip label={`${data.passed} ✓`} size="small" sx={{ backgroundColor: '#e8f5e9', color: '#4caf50' }} />
                  <Chip label={`${data.failed} ✗`} size="small" sx={{ backgroundColor: '#ffebee', color: '#f44336' }} />
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" fontWeight="bold">
                  {formatResponseTime(avgResponseTime)}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Avg Response Time
                </Typography>
                <SpeedIcon sx={{ color: avgResponseTime < 100 ? '#4caf50' : avgResponseTime < 500 ? '#ff9800' : '#f44336' }} />
              </Paper>
            </Grid>
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" fontWeight="bold">
                  {result?.timestamp ? new Date(result.timestamp).toLocaleTimeString() : 'N/A'}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Last Run
                </Typography>
                <AccessTimeIcon sx={{ color: '#2196f3' }} />
              </Paper>
            </Grid>
          </Grid>

          {/* Category Breakdown */}
          {result?.categories && (
            <Box mb={3}>
              <Typography variant="subtitle2" fontWeight="bold" mb={2}>
                Test Categories
              </Typography>
              <Grid container spacing={1}>
                {Object.entries(result.categories).map(([category, count]) => (
                  <Grid item key={category}>
                    <Chip
                      label={`${category.charAt(0).toUpperCase() + category.slice(1)}: ${count}`}
                      size="small"
                      variant={count > 0 ? "filled" : "outlined"}
                      color={count > 0 ? "primary" : "default"}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Progress Bar */}
          <Box>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body2" color="textSecondary">
                Test Completion
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                {data.passed}/{data.total} passed
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={data.total > 0 ? (data.passed / data.total) * 100 : 0}
              sx={{
                height: 8,
                borderRadius: 1,
                backgroundColor: '#e0e0e0',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: getStatusColor(data.passed, data.total)
                }
              }}
            />
          </Box>

          {/* Method Badges */}
          <Box display="flex" gap={1} mt={2}>
            <Chip icon={<CodeIcon />} label="GET" size="small" color="success" />
            <Chip icon={<CodeIcon />} label="POST" size="small" color="info" />
            <Chip icon={<CodeIcon />} label="PUT" size="small" color="warning" />
            <Chip icon={<CodeIcon />} label="DELETE" size="small" color="error" />
            <Box flexGrow={1} />
            <Button
              variant="text"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/${module.key}/health`);
              }}
              sx={{ textTransform: 'none' }}
            >
              View Details →
            </Button>
          </Box>
        </Box>
      </Card>
    );
  };

  if (loading && Object.keys(healthData).length === 0) {
    return (
      <Container maxWidth={false} sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth={false} sx={{ py: 4, px: 3 }}>
      <Box mb={4}>
        <Typography variant="h4" fontWeight="bold" mb={1}>
          System Health Overview
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Comprehensive API health monitoring for all system modules
        </Typography>
      </Box>

      {modules.map(module => renderHealthCard(module))}
    </Container>
  );
};

export default HealthOverviewDashboard;