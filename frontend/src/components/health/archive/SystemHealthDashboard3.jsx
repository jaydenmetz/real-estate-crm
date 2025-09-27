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
  Divider,
  IconButton,
  Collapse,
  Fade
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
  Psychology,
  ExpandMore as ExpandIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import { apiCall } from '../../services/api.service';
import SentryHealthCheck from './SentryHealthCheck';

// Page container with gradient background matching escrows health
const PageContainer = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  minHeight: '100vh',
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(3)
}));

// Section header matching escrows health style
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

// Health card with status border matching escrows style
const HealthCard = styled(Card)(({ status }) => ({
  marginBottom: '16px',
  border: '2px solid',
  borderColor: getStatusColor(status),
  backgroundColor: getStatusBgColor(status),
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.12)'
  }
}));

// Expand button with rotation
const ExpandButton = styled(IconButton)(({ expanded }) => ({
  transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
  transition: 'transform 0.3s'
}));

// Code block for JSON display
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

// Copy button overlay
const CopyButton = styled(IconButton)({
  position: 'absolute',
  top: 8,
  right: 8,
  color: '#888',
  '&:hover': {
    color: '#fff'
  }
});

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
  switch (status?.toLowerCase()) {
    case 'healthy':
    case 'success':
      return '#f1f8e9'; // Light green
    case 'degraded':
    case 'warning':
      return '#fff3e0'; // Light orange
    case 'unhealthy':
    case 'failed':
      return '#ffebee'; // Light red
    default:
      return '#fafafa'; // Light gray
  }
};

// Status icon component
const StatusIcon = ({ status, size = 28 }) => {
  const color = getStatusColor(status);
  switch (status?.toLowerCase()) {
    case 'healthy':
    case 'success':
    case 'passed':
      return <CheckCircle sx={{ color, fontSize: size }} />;
    case 'unhealthy':
    case 'failed':
    case 'error':
      return <CancelIcon sx={{ color, fontSize: size }} />;
    case 'degraded':
    case 'warning':
      return <Warning sx={{ color, fontSize: size }} />;
    default:
      return <Info sx={{ color, fontSize: size }} />;
  }
};

// Individual health section component
const HealthSection = ({ title, icon, status, data, detail }) => {
  const [expanded, setExpanded] = useState(false);

  const copyData = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
  };

  return (
    <HealthCard status={status}>
      <CardContent>
        <Box
          onClick={() => setExpanded(!expanded)}
          sx={{ cursor: 'pointer' }}
        >
          <Grid container alignItems="center" spacing={2}>
            <Grid item xs="auto">
              <StatusIcon status={status} />
            </Grid>
            <Grid item xs>
              <Stack direction="row" alignItems="center" spacing={1}>
                {icon}
                <Typography variant="h6" fontWeight="600">
                  {title}
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                {detail}
              </Typography>
            </Grid>
            <Grid item xs="auto">
              <Stack direction="row" alignItems="center" spacing={1}>
                <Chip
                  label={status?.toUpperCase() || 'UNKNOWN'}
                  size="small"
                  sx={{
                    backgroundColor: getStatusColor(status),
                    color: '#fff',
                    fontWeight: 'bold'
                  }}
                />
                <ExpandButton expanded={expanded}>
                  <ExpandIcon />
                </ExpandButton>
              </Stack>
            </Grid>
          </Grid>
        </Box>

        <Collapse in={expanded}>
          <Divider sx={{ my: 2 }} />
          <CodeBlock>
            <CopyButton onClick={copyData}>
              <ContentCopy fontSize="small" />
            </CopyButton>
            <pre style={{ margin: 0 }}>
              {JSON.stringify(data, null, 2)}
            </pre>
          </CodeBlock>
        </Collapse>
      </CardContent>
    </HealthCard>
  );
};

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
      timestamp: lastRefresh.toISOString(),
      system: healthData,
      postgresql: postgresData,
      redis: redisData,
      authentication: authData
    };

    navigator.clipboard.writeText(JSON.stringify(allHealthData, null, 2));
    setCopySuccess(true);
  };

  if (loading && !healthData) {
    return (
      <PageContainer>
        <Container maxWidth="lg">
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
            <CircularProgress size={60} sx={{ color: '#fff' }} />
          </Box>
        </Container>
      </PageContainer>
    );
  }

  const overallStatus = healthData?.status || 'unknown';

  return (
    <PageContainer>
      <Container maxWidth="lg">
        <Fade in={true}>
          <Box>
            {/* Header Section */}
            <Paper
              elevation={0}
              sx={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
                borderRadius: 3,
                p: 4,
                mb: 4,
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <Grid container alignItems="center" spacing={3}>
                <Grid item xs>
                  <Typography variant="h4" fontWeight="bold" gutterBottom>
                    System Health Dashboard
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Real-time monitoring of all system components
                  </Typography>
                  <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                    <Chip
                      icon={<Timer />}
                      label={`Last updated: ${lastRefresh.toLocaleTimeString()}`}
                      size="small"
                      variant="outlined"
                    />
                    <Chip
                      icon={<StatusIcon status={overallStatus} size={16} />}
                      label={`Overall: ${overallStatus.toUpperCase()}`}
                      size="small"
                      sx={{
                        backgroundColor: getStatusColor(overallStatus),
                        color: '#fff',
                        fontWeight: 'bold'
                      }}
                    />
                    {healthData?.uptime && (
                      <Chip
                        icon={<Speed />}
                        label={`Uptime: ${formatUptime(healthData.uptime)}`}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Stack>
                </Grid>
                <Grid item xs="auto">
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="contained"
                      startIcon={<ContentCopy />}
                      onClick={copyAllData}
                      sx={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #5a71e5 0%, #6b4298 100%)',
                        }
                      }}
                    >
                      Copy All Data
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Refresh />}
                      onClick={fetchHealthData}
                      disabled={loading}
                    >
                      Refresh
                    </Button>
                  </Stack>
                </Grid>
              </Grid>

              {/* Quick Stats */}
              {healthData?.checks && (
                <Grid container spacing={2} sx={{ mt: 2 }}>
                  {Object.entries(healthData.checks).map(([key, check]) => (
                    <Grid item xs={6} sm={3} key={key}>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          backgroundColor: getStatusBgColor(check.status),
                          border: `1px solid ${alpha(getStatusColor(check.status), 0.3)}`
                        }}
                      >
                        <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                          {key.replace('_', ' ').toUpperCase()}
                        </Typography>
                        <Typography variant="h6" fontWeight="bold" color={getStatusColor(check.status)}>
                          {check.status?.toUpperCase()}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Paper>

            {/* Error Alert */}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {/* Health Sections */}
            {healthData?.checks?.postgresql && (
              <HealthSection
                title="PostgreSQL Database"
                icon={<Storage />}
                status={healthData.checks.postgresql.status}
                data={healthData.checks.postgresql}
                detail={`${healthData.checks.postgresql.details?.database || 'N/A'} | ${healthData.checks.postgresql.details?.activeConnections || 0} connections | ${healthData.checks.postgresql.details?.sizeInMB || 0} MB`}
              />
            )}

            {healthData?.checks?.redis && (
              <HealthSection
                title="Redis Cache"
                icon={<Memory />}
                status={healthData.checks.redis.status}
                data={healthData.checks.redis}
                detail={healthData.checks.redis.note || `Version ${healthData.checks.redis.details?.version || 'N/A'} | ${healthData.checks.redis.details?.usedMemory || 'N/A'}`}
              />
            )}

            {healthData?.checks?.authentication && (
              <HealthSection
                title="Authentication System"
                icon={<Lock />}
                status={healthData.checks.authentication.status}
                data={healthData.checks.authentication}
                detail={`${healthData.checks.authentication.details?.activeUsers || 0} active users | ${healthData.checks.authentication.details?.activeApiKeys || 0} API keys`}
              />
            )}

            {healthData?.checks?.system && (
              <HealthSection
                title="System Resources"
                icon={<Speed />}
                status={healthData.checks.system.status}
                data={healthData.checks.system}
                detail={`${healthData.checks.system.details?.platform || 'N/A'} | ${healthData.checks.system.details?.memoryUsage?.usedByAppMB || 0} MB used | ${healthData.checks.system.details?.cpuCores || 0} cores`}
              />
            )}

            {healthData?.checks?.endpoints && (
              <HealthSection
                title="API Endpoints"
                icon={<Api />}
                status={healthData.checks.endpoints.status}
                data={healthData.checks.endpoints}
                detail={healthData.checks.endpoints.note || `${healthData.checks.endpoints.available?.length || 0} endpoints available`}
              />
            )}

            {/* PostgreSQL Details */}
            {postgresData && !postgresData.error && (
              <HealthSection
                title="PostgreSQL Diagnostics"
                icon={<Storage />}
                status="healthy"
                data={postgresData}
                detail="Detailed database performance metrics"
              />
            )}

            {/* Redis Details */}
            {redisData && !redisData.error && (
              <HealthSection
                title="Redis Diagnostics"
                icon={<Memory />}
                status={redisData.status === 'connected' ? 'healthy' : 'not_configured'}
                data={redisData}
                detail={redisData.message || "Cache system diagnostics"}
              />
            )}

            {/* Auth Details */}
            {authData && !authData.error && (
              <HealthSection
                title="Authentication Diagnostics"
                icon={<Security />}
                status="healthy"
                data={authData}
                detail="User and API key statistics"
              />
            )}

            {/* Sentry Integration */}
            <Box sx={{ mt: 3 }}>
              <SentryHealthCheck />
            </Box>

            {/* Recommendations */}
            {healthData?.recommendations && healthData.recommendations.length > 0 && (
              <Card sx={{ mt: 3, borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Recommendations
                  </Typography>
                  <List>
                    {healthData.recommendations.map((rec, index) => (
                      <ListItem key={index}>
                        <ListItemText
                          primary={rec.message}
                          secondary={`Priority: ${rec.priority} | ${rec.impact || rec.action || ''}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            )}
          </Box>
        </Fade>
      </Container>

      {/* Success Snackbar */}
      <Snackbar
        open={copySuccess}
        autoHideDuration={3000}
        onClose={() => setCopySuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setCopySuccess(false)} severity="success">
          Health data copied to clipboard!
        </Alert>
      </Snackbar>
    </PageContainer>
  );
};

export default SystemHealthDashboard3;