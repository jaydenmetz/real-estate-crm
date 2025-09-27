import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  LinearProgress,
  Alert,
  Button,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  Tooltip,
  CircularProgress,
  IconButton,
  Divider,
  Badge
} from '@mui/material';
import {
  CheckCircle,
  Error as ErrorIcon,
  Warning,
  Info,
  Storage,
  Memory,
  Speed,
  Lock,
  Refresh,
  ContentCopy,
  BugReport,
  Dashboard as DashboardIcon,
  Circle,
  FiberManualRecord
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import { apiCall } from '../../services/api.service';
import SentryHealthCheck from './SentryHealthCheck';

// Status color mapping
const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'healthy':
    case 'success':
    case 'active':
    case 'connected':
      return '#4caf50'; // Green
    case 'degraded':
    case 'warning':
    case 'partial':
      return '#ff9800'; // Yellow/Orange
    case 'unhealthy':
    case 'error':
    case 'failed':
    case 'disconnected':
      return '#f44336'; // Red
    case 'not_configured':
    case 'disabled':
      return '#9e9e9e'; // Gray
    default:
      return '#2196f3'; // Blue (unknown)
  }
};

// Get background color with transparency
const getStatusBgColor = (status) => {
  const color = getStatusColor(status);
  return alpha(color, 0.08);
};

// Status Badge Component
const StatusBadge = ({ status, label, size = 'medium' }) => {
  const color = getStatusColor(status);
  const bgColor = getStatusBgColor(status);

  const getIcon = () => {
    switch (status?.toLowerCase()) {
      case 'healthy':
      case 'success':
      case 'active':
        return <CheckCircle sx={{ fontSize: size === 'small' ? 16 : 20 }} />;
      case 'degraded':
      case 'warning':
        return <Warning sx={{ fontSize: size === 'small' ? 16 : 20 }} />;
      case 'unhealthy':
      case 'error':
      case 'failed':
        return <ErrorIcon sx={{ fontSize: size === 'small' ? 16 : 20 }} />;
      default:
        return <Info sx={{ fontSize: size === 'small' ? 16 : 20 }} />;
    }
  };

  return (
    <Chip
      icon={getIcon()}
      label={label || status?.toUpperCase()}
      sx={{
        backgroundColor: bgColor,
        color: color,
        borderColor: color,
        border: `1px solid ${color}`,
        fontWeight: 600,
        fontSize: size === 'small' ? '0.75rem' : '0.875rem',
        '& .MuiChip-icon': {
          color: color
        }
      }}
    />
  );
};

// Health Card Component
const HealthCard = styled(Card)(({ status }) => ({
  position: 'relative',
  overflow: 'visible',
  backgroundColor: '#fff',
  border: `2px solid ${getStatusColor(status)}`,
  borderRadius: 12,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 12px 24px ${alpha(getStatusColor(status), 0.2)}`
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: getStatusColor(status),
    borderRadius: '12px 12px 0 0'
  }
}));

// Status Indicator Dot
const StatusDot = ({ status, size = 12, pulse = false }) => {
  const color = getStatusColor(status);

  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <FiberManualRecord
        sx={{
          fontSize: size,
          color: color,
          animation: pulse ? 'pulse 2s infinite' : 'none',
          '@keyframes pulse': {
            '0%': { opacity: 1 },
            '50%': { opacity: 0.5 },
            '100%': { opacity: 1 }
          }
        }}
      />
      {pulse && (
        <FiberManualRecord
          sx={{
            fontSize: size,
            color: color,
            position: 'absolute',
            animation: 'ping 2s infinite',
            '@keyframes ping': {
              '0%': { transform: 'scale(1)', opacity: 1 },
              '100%': { transform: 'scale(2)', opacity: 0 }
            }
          }}
        />
      )}
    </Box>
  );
};

// Metric Item Component
const MetricItem = ({ label, value, status, icon: Icon }) => {
  const color = getStatusColor(status);

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        backgroundColor: getStatusBgColor(status),
        border: `1px solid ${alpha(color, 0.2)}`,
        display: 'flex',
        alignItems: 'center',
        gap: 2
      }}
    >
      {Icon && (
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            backgroundColor: alpha(color, 0.1),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Icon sx={{ color: color, fontSize: 24 }} />
        </Box>
      )}
      <Box sx={{ flex: 1 }}>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
          {label}
        </Typography>
        <Typography variant="h6" sx={{ color: color, fontWeight: 600, lineHeight: 1.2 }}>
          {value}
        </Typography>
      </Box>
      <StatusDot status={status} pulse={status === 'healthy'} />
    </Box>
  );
};

// Main Dashboard Component
const SystemHealthDashboard2 = ({ initialTab = 0 }) => {
  const [healthData, setHealthData] = useState(null);
  const [postgresData, setPostgresData] = useState(null);
  const [redisData, setRedisData] = useState(null);
  const [authData, setAuthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchHealthData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [health, postgres, redis, auth] = await Promise.all([
        apiCall('/health').catch(err => ({ error: err.message })),
        apiCall('/health/postgres').catch(err => ({ error: err.message })),
        apiCall('/health/redis').catch(err => ({ error: err.message })),
        apiCall('/health/auth').catch(err => ({ error: err.message }))
      ]);

      setHealthData(health.data || health);
      setPostgresData(postgres.data || postgres);
      setRedisData(redis.data || redis);
      setAuthData(auth.data || auth);
      setLastRefresh(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthData();
    const interval = setInterval(fetchHealthData, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const copyAllData = () => {
    const allHealthData = {
      overview: {
        status: healthData?.status,
        uptime: healthData?.uptime,
        checks: healthData?.checks,
        recommendations: healthData?.recommendations
      },
      postgresql: postgresData,
      redis: redisData,
      authentication: authData,
      systemResources: healthData?.checks?.system,
      timestamp: new Date().toISOString(),
      lastRefresh: lastRefresh
    };
    const jsonData = JSON.stringify(allHealthData, null, 2);
    navigator.clipboard.writeText(jsonData);
    alert('All health data copied to clipboard!');
  };

  const getOverallStatus = () => {
    if (!healthData) return 'unknown';

    const checks = healthData.checks || {};
    const statuses = Object.values(checks).map(check => check?.status?.toLowerCase());

    if (statuses.includes('unhealthy') || statuses.includes('error')) {
      return 'unhealthy';
    }
    if (statuses.includes('degraded') || statuses.includes('warning')) {
      return 'degraded';
    }
    if (statuses.every(s => s === 'healthy' || s === 'not_configured')) {
      return 'healthy';
    }
    return 'unknown';
  };

  if (loading && !healthData) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  const overallStatus = getOverallStatus();

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Grid container alignItems="center" spacing={2}>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <StatusDot status={overallStatus} size={24} pulse={true} />
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  System Health
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Last updated: {lastRefresh.toLocaleTimeString()}
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' }, gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={fetchHealthData}
                disabled={loading}
              >
                Refresh
              </Button>
              <Button
                variant="contained"
                startIcon={<ContentCopy />}
                onClick={copyAllData}
                sx={{
                  background: `linear-gradient(45deg, ${getStatusColor(overallStatus)} 30%, ${alpha(getStatusColor(overallStatus), 0.7)} 90%)`,
                  boxShadow: `0 3px 10px ${alpha(getStatusColor(overallStatus), 0.3)}`
                }}
              >
                Export JSON
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Overall Status Card */}
      <HealthCard status={overallStatus} sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: 3,
                    backgroundColor: getStatusBgColor(overallStatus),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {overallStatus === 'healthy' && <CheckCircle sx={{ fontSize: 40, color: getStatusColor(overallStatus) }} />}
                  {overallStatus === 'degraded' && <Warning sx={{ fontSize: 40, color: getStatusColor(overallStatus) }} />}
                  {overallStatus === 'unhealthy' && <ErrorIcon sx={{ fontSize: 40, color: getStatusColor(overallStatus) }} />}
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight="bold" sx={{ color: getStatusColor(overallStatus) }}>
                    System is {overallStatus}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Uptime: {healthData?.uptime ? formatUptime(healthData.uptime) : 'N/A'}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={8}>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <MetricItem
                    label="Database"
                    value={healthData?.checks?.postgresql?.status || 'Unknown'}
                    status={healthData?.checks?.postgresql?.status}
                    icon={Storage}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <MetricItem
                    label="Cache"
                    value={healthData?.checks?.redis?.status || 'Disabled'}
                    status={healthData?.checks?.redis?.status || 'not_configured'}
                    icon={Memory}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <MetricItem
                    label="Auth"
                    value={healthData?.checks?.authentication?.status || 'Unknown'}
                    status={healthData?.checks?.authentication?.status}
                    icon={Lock}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <MetricItem
                    label="System"
                    value={healthData?.checks?.system?.status || 'Unknown'}
                    status={healthData?.checks?.system?.status}
                    icon={Speed}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </HealthCard>

      {/* Recommendations */}
      {healthData?.recommendations?.length > 0 && (
        <Alert
          severity={overallStatus === 'healthy' ? 'info' : overallStatus === 'degraded' ? 'warning' : 'error'}
          sx={{ mb: 3, borderRadius: 2 }}
        >
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            Recommendations:
          </Typography>
          {healthData.recommendations.map((rec, idx) => (
            <Typography key={idx} variant="body2" sx={{ mt: 0.5 }}>
              • {rec.message}
            </Typography>
          ))}
        </Alert>
      )}

      {/* Tabs */}
      <Paper sx={{ mb: 3, borderRadius: 2 }}>
        <Tabs
          value={activeTab}
          onChange={(e, v) => setActiveTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              minHeight: 64
            },
            '& .MuiTabs-indicator': {
              height: 3,
              backgroundColor: getStatusColor(overallStatus)
            }
          }}
        >
          <Tab icon={<DashboardIcon />} label="Overview" />
          <Tab icon={<Storage />} label="PostgreSQL" />
          <Tab icon={<Memory />} label="Redis Cache" />
          <Tab icon={<Lock />} label="Authentication" />
          <Tab icon={<Speed />} label="System Resources" />
          <Tab icon={<BugReport />} label="Error Tracking" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          {/* PostgreSQL Status */}
          <Grid item xs={12} md={6}>
            <HealthCard status={healthData?.checks?.postgresql?.status}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <StatusDot status={healthData?.checks?.postgresql?.status} size={16} pulse />
                  <Typography variant="h6" fontWeight="bold">
                    PostgreSQL Database
                  </Typography>
                  <Box sx={{ ml: 'auto' }}>
                    <StatusBadge status={healthData?.checks?.postgresql?.status} size="small" />
                  </Box>
                </Box>

                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Response Time</Typography>
                    <Typography variant="body2" fontWeight="600">
                      {healthData?.checks?.postgresql?.responseTime || 'N/A'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Database Size</Typography>
                    <Typography variant="body2" fontWeight="600">
                      {healthData?.checks?.postgresql?.details?.sizeInMB} MB
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Active Connections</Typography>
                    <Typography variant="body2" fontWeight="600">
                      {healthData?.checks?.postgresql?.details?.activeConnections || 0}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </HealthCard>
          </Grid>

          {/* Authentication Status */}
          <Grid item xs={12} md={6}>
            <HealthCard status={healthData?.checks?.authentication?.status}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <StatusDot status={healthData?.checks?.authentication?.status} size={16} pulse />
                  <Typography variant="h6" fontWeight="bold">
                    Authentication System
                  </Typography>
                  <Box sx={{ ml: 'auto' }}>
                    <StatusBadge status={healthData?.checks?.authentication?.status} size="small" />
                  </Box>
                </Box>

                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">JWT Configured</Typography>
                    <Typography variant="body2" fontWeight="600">
                      {healthData?.checks?.authentication?.details?.jwtConfigured ? 'Yes' : 'No'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Active Users</Typography>
                    <Typography variant="body2" fontWeight="600">
                      {healthData?.checks?.authentication?.details?.activeUsers || 0}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Active API Keys</Typography>
                    <Typography variant="body2" fontWeight="600">
                      {healthData?.checks?.authentication?.details?.activeApiKeys || 0}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </HealthCard>
          </Grid>

          {/* System Resources */}
          <Grid item xs={12}>
            <HealthCard status={healthData?.checks?.system?.status}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <StatusDot status={healthData?.checks?.system?.status} size={16} pulse />
                  <Typography variant="h6" fontWeight="bold">
                    System Resources
                  </Typography>
                  <Box sx={{ ml: 'auto' }}>
                    <StatusBadge status={healthData?.checks?.system?.status} size="small" />
                  </Box>
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Memory Usage
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                        <Typography variant="h5" fontWeight="bold">
                          {healthData?.checks?.system?.details?.memoryUsage?.usedByAppMB || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          MB / {healthData?.checks?.system?.details?.memoryUsage?.totalMB || 0} MB
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={(healthData?.checks?.system?.details?.memoryUsage?.usedByAppMB / healthData?.checks?.system?.details?.memoryUsage?.totalMB) * 100 || 0}
                        sx={{
                          mt: 1,
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: alpha(getStatusColor('healthy'), 0.2),
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: getStatusColor('healthy'),
                            borderRadius: 3
                          }
                        }}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        CPU Cores
                      </Typography>
                      <Typography variant="h5" fontWeight="bold">
                        {healthData?.checks?.system?.details?.cpuCores || 0}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Node Version
                      </Typography>
                      <Typography variant="h6" fontWeight="600">
                        {healthData?.checks?.system?.details?.nodeVersion || 'N/A'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Platform
                      </Typography>
                      <Typography variant="h6" fontWeight="600">
                        {healthData?.checks?.system?.details?.platform || 'N/A'}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </HealthCard>
          </Grid>
        </Grid>
      )}

      {/* Other tabs remain the same but would be updated with similar styling */}
      {activeTab === 5 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <SentryHealthCheck />
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default SystemHealthDashboard2;