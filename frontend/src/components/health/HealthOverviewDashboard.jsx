import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Container,
  Grid,
  Typography,
  CircularProgress,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon,
  Home as HomeIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  CalendarMonth as CalendarIcon,
  TrendingUp as LeadsIcon,
  Assignment as EscrowIcon
} from '@mui/icons-material';

const HealthOverviewDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [healthData, setHealthData] = useState({
    escrows: { total: 0, passed: 0, failed: 0, warnings: 0 },
    listings: { total: 0, passed: 0, failed: 0, warnings: 0 },
    clients: { total: 0, passed: 0, failed: 0, warnings: 0 },
    appointments: { total: 0, passed: 0, failed: 0, warnings: 0 },
    leads: { total: 0, passed: 0, failed: 0, warnings: 0 }
  });

  const modules = [
    {
      key: 'escrows',
      name: 'Escrows',
      icon: EscrowIcon,
      color: '#2196f3',
      description: 'Transaction management system'
    },
    {
      key: 'listings',
      name: 'Listings',
      icon: HomeIcon,
      color: '#4caf50',
      description: 'Property inventory management'
    },
    {
      key: 'clients',
      name: 'Clients',
      icon: PeopleIcon,
      color: '#ff9800',
      description: 'Contact and relationship management'
    },
    {
      key: 'appointments',
      name: 'Appointments',
      icon: CalendarIcon,
      color: '#9c27b0',
      description: 'Calendar and scheduling'
    },
    {
      key: 'leads',
      name: 'Leads',
      icon: LeadsIcon,
      color: '#f44336',
      description: 'Lead qualification pipeline'
    }
  ];

  const runHealthCheck = async (endpoint) => {
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5050';
    const token = localStorage.getItem('crm_auth_token') ||
                  localStorage.getItem('authToken') ||
                  localStorage.getItem('token');

    try {
      // Run a minimal set of tests for overview
      const tests = [];

      // Test 1: List all
      const listResponse = await fetch(`${API_URL}/v1/${endpoint}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const listData = await listResponse.json();
      tests.push({ passed: listResponse.ok && listData.success });

      // Test 2: Create (minimal)
      if (endpoint === 'escrows') {
        const createResponse = await fetch(`${API_URL}/v1/${endpoint}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ propertyAddress: `Test ${Date.now()}` })
        });
        const createData = await createResponse.json();
        tests.push({ passed: createResponse.ok && createData.success });

        // Clean up
        if (createData.success && createData.data?.id) {
          await fetch(`${API_URL}/v1/${endpoint}/${createData.data.id}/archive`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          await fetch(`${API_URL}/v1/${endpoint}/${createData.data.id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
        }
      }

      // Test 3: Error handling
      const errorResponse = await fetch(`${API_URL}/v1/${endpoint}/00000000-0000-0000-0000-000000000000`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const errorData = await errorResponse.json();
      tests.push({ passed: !errorResponse.ok && errorData.error });

      // Calculate results
      const passed = tests.filter(t => t.passed).length;
      const failed = tests.filter(t => !t.passed).length;

      return {
        total: tests.length,
        passed,
        failed,
        warnings: 0,
        successRate: Math.round((passed / tests.length) * 100)
      };
    } catch (error) {
      console.error(`Health check failed for ${endpoint}:`, error);
      return {
        total: 3,
        passed: 0,
        failed: 3,
        warnings: 0,
        successRate: 0
      };
    }
  };

  const fetchHealthData = async () => {
    setRefreshing(true);
    const results = {};

    for (const module of modules) {
      results[module.key] = await runHealthCheck(module.key);
    }

    setHealthData(results);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchHealthData();
  }, []);

  const getHealthStatus = (data) => {
    const successRate = data.total > 0 ? (data.passed / data.total) * 100 : 0;
    if (successRate === 100) return 'success';
    if (successRate >= 80) return 'warning';
    return 'error';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return '#4caf50';
      case 'warning': return '#ff9800';
      case 'error': return '#f44336';
      default: return '#9e9e9e';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircleIcon sx={{ fontSize: 48, color: '#4caf50' }} />;
      case 'warning': return <WarningIcon sx={{ fontSize: 48, color: '#ff9800' }} />;
      case 'error': return <ErrorIcon sx={{ fontSize: 48, color: '#f44336' }} />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box mb={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4" fontWeight="bold">
            System Health Overview
          </Typography>
          <Tooltip title="Refresh all health checks">
            <IconButton
              onClick={fetchHealthData}
              disabled={refreshing}
              sx={{
                backgroundColor: 'primary.main',
                color: 'white',
                '&:hover': { backgroundColor: 'primary.dark' }
              }}
            >
              <RefreshIcon sx={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
            </IconButton>
          </Tooltip>
        </Box>
        <Typography variant="body1" color="textSecondary">
          Click on any module card to view detailed health diagnostics
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {modules.map((module) => {
          const data = healthData[module.key];
          const status = getHealthStatus(data);
          const Icon = module.icon;
          const successRate = data.total > 0 ? Math.round((data.passed / data.total) * 100) : 0;

          return (
            <Grid item xs={12} md={6} lg={4} key={module.key}>
              <Card
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  borderTop: `4px solid ${getStatusColor(status)}`,
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                  }
                }}
                onClick={() => navigate(`/${module.key}/health`)}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <Icon sx={{ fontSize: 32, color: module.color }} />
                      <Box>
                        <Typography variant="h6" fontWeight="bold">
                          {module.name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {module.description}
                        </Typography>
                      </Box>
                    </Box>
                    {getStatusIcon(status)}
                  </Box>

                  <Box mb={2}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="body2" color="textSecondary">
                        Health Score
                      </Typography>
                      <Typography
                        variant="h4"
                        fontWeight="bold"
                        sx={{ color: getStatusColor(status) }}
                      >
                        {successRate}%
                      </Typography>
                    </Box>
                    <Box sx={{ width: '100%', height: 8, backgroundColor: '#e0e0e0', borderRadius: 1, overflow: 'hidden' }}>
                      <Box
                        sx={{
                          width: `${successRate}%`,
                          height: '100%',
                          backgroundColor: getStatusColor(status),
                          transition: 'width 0.5s ease'
                        }}
                      />
                    </Box>
                  </Box>

                  <Grid container spacing={1}>
                    <Grid item xs={4}>
                      <Box textAlign="center" p={1} borderRadius={1} sx={{ backgroundColor: '#e8f5e9' }}>
                        <Typography variant="h6" fontWeight="bold" color="#4caf50">
                          {data.passed}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Passed
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box textAlign="center" p={1} borderRadius={1} sx={{ backgroundColor: '#ffebee' }}>
                        <Typography variant="h6" fontWeight="bold" color="#f44336">
                          {data.failed}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Failed
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box textAlign="center" p={1} borderRadius={1} sx={{ backgroundColor: '#fff3e0' }}>
                        <Typography variant="h6" fontWeight="bold" color="#ff9800">
                          {data.warnings}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Warnings
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  <Box mt={2} display="flex" justifyContent="space-between" alignItems="center">
                    <Chip
                      label={`${data.total} Total Tests`}
                      size="small"
                      variant="outlined"
                    />
                    <Typography variant="caption" color="primary" fontWeight="bold">
                      View Details →
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </Container>
  );
};

export default HealthOverviewDashboard;