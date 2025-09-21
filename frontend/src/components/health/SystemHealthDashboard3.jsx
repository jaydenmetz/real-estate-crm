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
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  Tooltip,
  CircularProgress,
  Snackbar,
  Divider
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
  FiberManualRecord,
  Security,
  Api,
  Cloud,
  DataUsage,
  Timer,
  Group,
  VpnKey,
  Shield,
  Psychology
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
    case 'passed':
      return '#4caf50'; // Green
    case 'degraded':
    case 'warning':
    case 'partial':
      return '#ff9800'; // Yellow/Orange
    case 'unhealthy':
    case 'error':
    case 'failed':
    case 'disconnected':
    case 'critical':
      return '#f44336'; // Red
    case 'not_configured':
    case 'disabled':
    case 'optional':
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

// Health Section Card
const HealthSectionCard = styled(Card)(({ status }) => ({
  position: 'relative',
  overflow: 'visible',
  backgroundColor: '#fff',
  borderLeft: `4px solid ${getStatusColor(status)}`,
  borderRadius: 12,
  boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: `0 8px 24px ${alpha(getStatusColor(status), 0.15)}`
  }
}));

// Status Dot Component
const StatusDot = ({ status, size = 12 }) => (
  <FiberManualRecord
    sx={{
      fontSize: size,
      color: getStatusColor(status)
    }}
  />
);

// Test Result Item
const TestResultItem = ({ label, value, status, detail }) => (
  <Box
    sx={{
      p: 1.5,
      borderRadius: 1,
      backgroundColor: getStatusBgColor(status),
      border: `1px solid ${alpha(getStatusColor(status), 0.2)}`,
      mb: 1
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <StatusDot status={status} size={10} />
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {label}
        </Typography>
      </Box>
      <Typography
        variant="body2"
        sx={{
          color: getStatusColor(status),
          fontWeight: 600
        }}
      >
        {value}
      </Typography>
    </Box>
    {detail && (
      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
        {detail}
      </Typography>
    )}
  </Box>
);

// Main Dashboard Component
const SystemHealthDashboard3 = () => {
  const [healthData, setHealthData] = useState(null);
  const [postgresData, setPostgresData] = useState(null);
  const [redisData, setRedisData] = useState(null);
  const [authData, setAuthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [copySuccess, setCopySuccess] = useState(false);

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
    setCopySuccess(true);
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
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  backgroundColor: getStatusBgColor(overallStatus),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {overallStatus === 'healthy' && <CheckCircle sx={{ fontSize: 32, color: getStatusColor(overallStatus) }} />}
                {overallStatus === 'degraded' && <Warning sx={{ fontSize: 32, color: getStatusColor(overallStatus) }} />}
                {overallStatus === 'unhealthy' && <ErrorIcon sx={{ fontSize: 32, color: getStatusColor(overallStatus) }} />}
              </Box>
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  System Health Audit
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Last updated: {lastRefresh.toLocaleTimeString()} • Uptime: {healthData?.uptime ? formatUptime(healthData.uptime) : 'N/A'}
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
              >
                Copy JSON
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Overall Status Summary */}
      {overallStatus !== 'healthy' && healthData?.recommendations?.length > 0 && (
        <Alert
          severity={overallStatus === 'degraded' ? 'warning' : 'error'}
          sx={{ mb: 3, borderRadius: 2 }}
        >
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            System Recommendations:
          </Typography>
          {healthData.recommendations.map((rec, idx) => (
            <Typography key={idx} variant="body2" sx={{ mt: 0.5 }}>
              • {rec.message}
            </Typography>
          ))}
        </Alert>
      )}

      {/* Health Check Sections */}
      <Grid container spacing={3}>
        {/* Database Health */}
        <Grid item xs={12} md={6}>
          <HealthSectionCard status={healthData?.checks?.postgresql?.status || 'unknown'}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Storage sx={{ color: getStatusColor(healthData?.checks?.postgresql?.status) }} />
                  <Typography variant="h6" fontWeight="bold">
                    Database Health
                  </Typography>
                </Box>
                <Chip
                  label={healthData?.checks?.postgresql?.status || 'Unknown'}
                  size="small"
                  sx={{
                    backgroundColor: getStatusBgColor(healthData?.checks?.postgresql?.status),
                    color: getStatusColor(healthData?.checks?.postgresql?.status),
                    fontWeight: 600
                  }}
                />
              </Box>

              <Stack spacing={1}>
                <TestResultItem
                  label="Connection Status"
                  value={healthData?.checks?.postgresql?.status === 'healthy' ? 'Connected' : 'Issues Detected'}
                  status={healthData?.checks?.postgresql?.status}
                />
                <TestResultItem
                  label="Response Time"
                  value={healthData?.checks?.postgresql?.responseTime || 'N/A'}
                  status={healthData?.checks?.postgresql?.responseTime && parseInt(healthData.checks.postgresql.responseTime) < 50 ? 'healthy' : 'warning'}
                />
                <TestResultItem
                  label="Active Connections"
                  value={`${healthData?.checks?.postgresql?.details?.activeConnections || 0} connections`}
                  status={healthData?.checks?.postgresql?.details?.activeConnections > 0 ? 'healthy' : 'warning'}
                />
                <TestResultItem
                  label="Database Size"
                  value={`${healthData?.checks?.postgresql?.details?.sizeInMB || 0} MB`}
                  status="healthy"
                />
              </Stack>
            </CardContent>
          </HealthSectionCard>
        </Grid>

        {/* Authentication & Security */}
        <Grid item xs={12} md={6}>
          <HealthSectionCard status={healthData?.checks?.authentication?.status || 'unknown'}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Shield sx={{ color: getStatusColor(healthData?.checks?.authentication?.status) }} />
                  <Typography variant="h6" fontWeight="bold">
                    Authentication & Security
                  </Typography>
                </Box>
                <Chip
                  label={healthData?.checks?.authentication?.status || 'Unknown'}
                  size="small"
                  sx={{
                    backgroundColor: getStatusBgColor(healthData?.checks?.authentication?.status),
                    color: getStatusColor(healthData?.checks?.authentication?.status),
                    fontWeight: 600
                  }}
                />
              </Box>

              <Stack spacing={1}>
                <TestResultItem
                  label="JWT Authentication"
                  value={healthData?.checks?.authentication?.details?.jwtConfigured ? 'Configured' : 'Not Configured'}
                  status={healthData?.checks?.authentication?.details?.jwtConfigured ? 'healthy' : 'error'}
                />
                <TestResultItem
                  label="Active Users"
                  value={`${healthData?.checks?.authentication?.details?.activeUsers || 0} users`}
                  status={healthData?.checks?.authentication?.details?.activeUsers > 0 ? 'healthy' : 'warning'}
                />
                <TestResultItem
                  label="API Keys"
                  value={`${healthData?.checks?.authentication?.details?.activeApiKeys || 0} active`}
                  status="healthy"
                  detail={`${healthData?.checks?.authentication?.details?.totalApiKeys || 0} total keys`}
                />
                <TestResultItem
                  label="Password Security"
                  value={authData?.security?.passwordHashAlgorithm || 'bcrypt'}
                  status={authData?.security?.passwordHashAlgorithm === 'bcrypt' ? 'healthy' : 'warning'}
                />
              </Stack>
            </CardContent>
          </HealthSectionCard>
        </Grid>

        {/* System Resources */}
        <Grid item xs={12} md={6}>
          <HealthSectionCard status={healthData?.checks?.system?.status || 'unknown'}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Speed sx={{ color: getStatusColor(healthData?.checks?.system?.status) }} />
                  <Typography variant="h6" fontWeight="bold">
                    System Resources
                  </Typography>
                </Box>
                <Chip
                  label={healthData?.checks?.system?.status || 'Unknown'}
                  size="small"
                  sx={{
                    backgroundColor: getStatusBgColor(healthData?.checks?.system?.status),
                    color: getStatusColor(healthData?.checks?.system?.status),
                    fontWeight: 600
                  }}
                />
              </Box>

              <Stack spacing={1}>
                <TestResultItem
                  label="Memory Usage"
                  value={`${healthData?.checks?.system?.details?.memoryUsage?.usedByAppMB || 0} MB`}
                  status={healthData?.checks?.system?.details?.memoryUsage?.usedByAppMB < 100 ? 'healthy' : 'warning'}
                  detail={`Total: ${healthData?.checks?.system?.details?.memoryUsage?.totalMB || 0} MB`}
                />
                <TestResultItem
                  label="CPU Cores"
                  value={`${healthData?.checks?.system?.details?.cpuCores || 0} cores`}
                  status="healthy"
                />
                <TestResultItem
                  label="Node.js Version"
                  value={healthData?.checks?.system?.details?.nodeVersion || 'Unknown'}
                  status={healthData?.checks?.system?.details?.nodeVersion ? 'healthy' : 'warning'}
                />
                <TestResultItem
                  label="Platform"
                  value={healthData?.checks?.system?.details?.platform || 'Unknown'}
                  status="healthy"
                />
              </Stack>
            </CardContent>
          </HealthSectionCard>
        </Grid>

        {/* API Endpoints */}
        <Grid item xs={12} md={6}>
          <HealthSectionCard status={healthData?.checks?.endpoints?.status || 'unknown'}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Api sx={{ color: getStatusColor(healthData?.checks?.endpoints?.status) }} />
                  <Typography variant="h6" fontWeight="bold">
                    API Endpoints
                  </Typography>
                </Box>
                <Chip
                  label={healthData?.checks?.endpoints?.status || 'Unknown'}
                  size="small"
                  sx={{
                    backgroundColor: getStatusBgColor(healthData?.checks?.endpoints?.status),
                    color: getStatusColor(healthData?.checks?.endpoints?.status),
                    fontWeight: 600
                  }}
                />
              </Box>

              <Stack spacing={1}>
                {healthData?.checks?.endpoints?.available?.map((endpoint, idx) => (
                  <TestResultItem
                    key={idx}
                    label={`${endpoint} Endpoint`}
                    value="Available"
                    status="healthy"
                  />
                ))}
                <TestResultItem
                  label="Authentication Required"
                  value="Yes (except /health)"
                  status="healthy"
                  detail={healthData?.checks?.endpoints?.note}
                />
              </Stack>
            </CardContent>
          </HealthSectionCard>
        </Grid>

        {/* Cache System */}
        <Grid item xs={12} md={6}>
          <HealthSectionCard status={redisData?.status || 'not_configured'}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Memory sx={{ color: getStatusColor(redisData?.status || 'not_configured') }} />
                  <Typography variant="h6" fontWeight="bold">
                    Cache System
                  </Typography>
                </Box>
                <Chip
                  label={redisData?.status === 'not_configured' ? 'Optional' : (redisData?.status || 'Unknown')}
                  size="small"
                  sx={{
                    backgroundColor: getStatusBgColor(redisData?.status || 'not_configured'),
                    color: getStatusColor(redisData?.status || 'not_configured'),
                    fontWeight: 600
                  }}
                />
              </Box>

              <Stack spacing={1}>
                <TestResultItem
                  label="Redis Status"
                  value={redisData?.status === 'not_configured' ? 'Not Configured' : 'Connected'}
                  status={redisData?.status || 'not_configured'}
                  detail="Optional - System works without cache"
                />
                {redisData?.benefits_if_enabled?.map((benefit, idx) => (
                  <TestResultItem
                    key={idx}
                    label="Potential Benefit"
                    value={benefit}
                    status="optional"
                  />
                ))}
              </Stack>
            </CardContent>
          </HealthSectionCard>
        </Grid>

        {/* Database Performance */}
        <Grid item xs={12} md={6}>
          <HealthSectionCard status={postgresData?.error ? 'warning' : 'healthy'}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <DataUsage sx={{ color: getStatusColor(postgresData?.error ? 'warning' : 'healthy') }} />
                  <Typography variant="h6" fontWeight="bold">
                    Database Performance
                  </Typography>
                </Box>
                <Chip
                  label={postgresData?.error ? 'Limited' : 'Healthy'}
                  size="small"
                  sx={{
                    backgroundColor: getStatusBgColor(postgresData?.error ? 'warning' : 'healthy'),
                    color: getStatusColor(postgresData?.error ? 'warning' : 'healthy'),
                    fontWeight: 600
                  }}
                />
              </Box>

              <Stack spacing={1}>
                {postgresData?.connections?.map((conn, idx) => (
                  <TestResultItem
                    key={idx}
                    label={`${conn.state || 'Unknown'} Connections`}
                    value={`${conn.count} connections`}
                    status={conn.state === 'active' || conn.state === 'idle' ? 'healthy' : 'warning'}
                  />
                ))}
                {postgresData?.largestTables?.slice(0, 3).map((table, idx) => (
                  <TestResultItem
                    key={idx}
                    label={table.tablename}
                    value={table.size}
                    status="healthy"
                  />
                ))}
              </Stack>
            </CardContent>
          </HealthSectionCard>
        </Grid>

        {/* User Management */}
        <Grid item xs={12} md={6}>
          <HealthSectionCard status="healthy">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Group sx={{ color: getStatusColor('healthy') }} />
                  <Typography variant="h6" fontWeight="bold">
                    User Management
                  </Typography>
                </Box>
                <Chip
                  label="Healthy"
                  size="small"
                  sx={{
                    backgroundColor: getStatusBgColor('healthy'),
                    color: getStatusColor('healthy'),
                    fontWeight: 600
                  }}
                />
              </Box>

              <Stack spacing={1}>
                {authData?.usersByRole?.map((role, idx) => (
                  <TestResultItem
                    key={idx}
                    label={role.role}
                    value={`${role.count} users`}
                    status={role.active > 0 ? 'healthy' : 'warning'}
                    detail={`${role.active} active`}
                  />
                ))}
              </Stack>
            </CardContent>
          </HealthSectionCard>
        </Grid>

        {/* Security Configuration */}
        <Grid item xs={12} md={6}>
          <HealthSectionCard status={authData?.security?.rateLimitingEnabled ? 'healthy' : 'warning'}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Security sx={{ color: getStatusColor(authData?.security?.rateLimitingEnabled ? 'healthy' : 'warning') }} />
                  <Typography variant="h6" fontWeight="bold">
                    Security Configuration
                  </Typography>
                </Box>
                <Chip
                  label={authData?.security?.rateLimitingEnabled ? 'Optimal' : 'Basic'}
                  size="small"
                  sx={{
                    backgroundColor: getStatusBgColor(authData?.security?.rateLimitingEnabled ? 'healthy' : 'warning'),
                    color: getStatusColor(authData?.security?.rateLimitingEnabled ? 'healthy' : 'warning'),
                    fontWeight: 600
                  }}
                />
              </Box>

              <Stack spacing={1}>
                <TestResultItem
                  label="Rate Limiting"
                  value={authData?.security?.rateLimitingEnabled ? 'Enabled' : 'Disabled'}
                  status={authData?.security?.rateLimitingEnabled ? 'healthy' : 'warning'}
                  detail="Recommended for production"
                />
                <TestResultItem
                  label="JWT Expiration"
                  value={authData?.security?.jwtExpirationTime || '30d'}
                  status="healthy"
                />
                <TestResultItem
                  label="API Key Length"
                  value={`${authData?.security?.apiKeyLength || 64} characters`}
                  status={authData?.security?.apiKeyLength >= 32 ? 'healthy' : 'warning'}
                />
                <TestResultItem
                  label="Session Storage"
                  value="JWT + PostgreSQL"
                  status="healthy"
                />
              </Stack>
            </CardContent>
          </HealthSectionCard>
        </Grid>

        {/* Error Tracking */}
        <Grid item xs={12}>
          <HealthSectionCard status="healthy">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BugReport sx={{ color: getStatusColor('healthy') }} />
                  <Typography variant="h6" fontWeight="bold">
                    Error Tracking (Sentry)
                  </Typography>
                </Box>
                <Chip
                  label="Configured"
                  size="small"
                  sx={{
                    backgroundColor: getStatusBgColor('healthy'),
                    color: getStatusColor('healthy'),
                    fontWeight: 600
                  }}
                />
              </Box>

              <SentryHealthCheck />
            </CardContent>
          </HealthSectionCard>
        </Grid>
      </Grid>

      {/* Copy Success Snackbar */}
      <Snackbar
        open={copySuccess}
        autoHideDuration={2000}
        onClose={() => setCopySuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setCopySuccess(false)} severity="success" sx={{ width: '100%' }}>
          Health data copied to clipboard!
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default SystemHealthDashboard3;