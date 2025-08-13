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
  IconButton,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  Divider,
  Stack,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  CheckCircle,
  Error,
  Warning,
  Info,
  Storage,
  Memory,
  Speed,
  Security,
  Refresh,
  ExpandMore,
  ExpandLess,
  Database,
  Cloud,
  Lock,
  Timer,
  TrendingUp,
  DataUsage,
  Psychology
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { apiCall } from '../../services/api.service';
import { motion } from 'framer-motion';

const StatusCard = styled(Card)(({ theme, status }) => ({
  border: `2px solid ${
    status === 'healthy' ? theme.palette.success.light :
    status === 'degraded' ? theme.palette.warning.light :
    status === 'unhealthy' ? theme.palette.error.light :
    theme.palette.grey[300]
  }`,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8]
  }
}));

const MetricBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.spacing(1),
  backgroundColor: theme.palette.grey[50],
  border: `1px solid ${theme.palette.grey[200]}`
}));

const StatusIcon = ({ status }) => {
  switch(status) {
    case 'healthy':
      return <CheckCircle color="success" />;
    case 'degraded':
      return <Warning color="warning" />;
    case 'unhealthy':
      return <Error color="error" />;
    default:
      return <Info color="disabled" />;
  }
};

const SystemHealthDashboard = ({ initialTab = 0 }) => {
  const [healthData, setHealthData] = useState(null);
  const [postgresData, setPostgresData] = useState(null);
  const [redisData, setRedisData] = useState(null);
  const [authData, setAuthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [expandedSections, setExpandedSections] = useState({});
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchHealthData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch all health endpoints in parallel
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
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchHealthData, 30000);
    return () => clearInterval(interval);
  }, []);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  if (loading && !healthData) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          System Health Monitor
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </Typography>
          <Button
            startIcon={<Refresh />}
            onClick={fetchHealthData}
            disabled={loading}
            size="small"
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to fetch health data: {error}
        </Alert>
      )}

      {/* Overall Status */}
      {healthData && (
        <StatusCard status={healthData.status} sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <StatusIcon status={healthData.status} />
              <Typography variant="h5" fontWeight="bold">
                System Status: {healthData.status?.toUpperCase()}
              </Typography>
              <Chip
                label={`Uptime: ${formatUptime(healthData.uptime || 0)}`}
                color="primary"
                size="small"
              />
            </Box>

            {healthData.recommendations?.length > 0 && (
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="subtitle2" fontWeight="bold">
                  Recommendations:
                </Typography>
                {healthData.recommendations.map((rec, idx) => (
                  <Typography key={idx} variant="body2">
                    • {rec.message}
                  </Typography>
                ))}
              </Alert>
            )}
          </CardContent>
        </StatusCard>
      )}

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
          <Tab icon={<Dashboard />} label="Overview" />
          <Tab icon={<Storage />} label="PostgreSQL" />
          <Tab icon={<Memory />} label="Redis Cache" />
          <Tab icon={<Lock />} label="Authentication" />
          <Tab icon={<Speed />} label="System Resources" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {activeTab === 0 && healthData?.checks && (
        <Grid container spacing={3}>
          {/* PostgreSQL Status */}
          <Grid item xs={12} md={6}>
            <StatusCard status={healthData.checks.postgresql?.status}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Database color="primary" />
                  <Typography variant="h6">PostgreSQL Database</Typography>
                </Box>
                <List dense>
                  <ListItem>
                    <ListItemText
                      primary="Status"
                      secondary={healthData.checks.postgresql?.status || 'Unknown'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Response Time"
                      secondary={healthData.checks.postgresql?.responseTime || 'N/A'}
                    />
                  </ListItem>
                  {healthData.checks.postgresql?.details && (
                    <>
                      <ListItem>
                        <ListItemText
                          primary="Database Size"
                          secondary={`${healthData.checks.postgresql.details.sizeInMB} MB`}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Active Connections"
                          secondary={healthData.checks.postgresql.details.activeConnections}
                        />
                      </ListItem>
                    </>
                  )}
                </List>
              </CardContent>
            </StatusCard>
          </Grid>

          {/* Redis Status */}
          <Grid item xs={12} md={6}>
            <StatusCard status={healthData.checks.redis?.status}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Memory color="warning" />
                  <Typography variant="h6">Redis Cache</Typography>
                </Box>
                <List dense>
                  <ListItem>
                    <ListItemText
                      primary="Status"
                      secondary={healthData.checks.redis?.status || 'Not Configured'}
                    />
                  </ListItem>
                  {healthData.checks.redis?.note && (
                    <ListItem>
                      <ListItemText
                        primary="Note"
                        secondary={healthData.checks.redis.note}
                      />
                    </ListItem>
                  )}
                  {healthData.checks.redis?.details && (
                    <ListItem>
                      <ListItemText
                        primary="Memory Usage"
                        secondary={healthData.checks.redis.details.usedMemory}
                      />
                    </ListItem>
                  )}
                </List>
              </CardContent>
            </StatusCard>
          </Grid>

          {/* Authentication Status */}
          <Grid item xs={12} md={6}>
            <StatusCard status={healthData.checks.authentication?.status}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Lock color="success" />
                  <Typography variant="h6">Authentication System</Typography>
                </Box>
                {healthData.checks.authentication?.details && (
                  <List dense>
                    <ListItem>
                      <ListItemText
                        primary="Storage"
                        secondary={healthData.checks.authentication.details.storageLocation}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Active Users"
                        secondary={healthData.checks.authentication.details.activeUsers}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Valid API Keys"
                        secondary={healthData.checks.authentication.details.validApiKeys}
                      />
                    </ListItem>
                  </List>
                )}
              </CardContent>
            </StatusCard>
          </Grid>

          {/* System Resources */}
          <Grid item xs={12} md={6}>
            <StatusCard status={healthData.checks.system?.status}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Speed color="info" />
                  <Typography variant="h6">System Resources</Typography>
                </Box>
                {healthData.checks.system?.details && (
                  <List dense>
                    <ListItem>
                      <ListItemText
                        primary="Platform"
                        secondary={`${healthData.checks.system.details.platform} (${healthData.checks.system.details.nodeVersion})`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Memory"
                        secondary={`${healthData.checks.system.details.memoryUsage?.usedByAppMB} MB / ${healthData.checks.system.details.memoryUsage?.totalMB} MB`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="CPU Cores"
                        secondary={healthData.checks.system.details.cpuCores}
                      />
                    </ListItem>
                  </List>
                )}
              </CardContent>
            </StatusCard>
          </Grid>
        </Grid>
      )}

      {/* PostgreSQL Tab */}
      {activeTab === 1 && postgresData && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Database Diagnostics
                </Typography>
                
                {postgresData.error ? (
                  <Alert severity="error">{postgresData.error}</Alert>
                ) : (
                  <Stack spacing={3}>
                    {/* Connection States */}
                    <MetricBox>
                      <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                        Connections by State
                      </Typography>
                      <List dense>
                        {postgresData.connections?.map((conn, idx) => (
                          <ListItem key={idx}>
                            <ListItemText
                              primary={conn.state || 'Unknown'}
                              secondary={`${conn.count} connections`}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </MetricBox>

                    {/* Largest Tables */}
                    <MetricBox>
                      <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                        Largest Tables
                      </Typography>
                      <List dense>
                        {postgresData.largestTables?.map((table, idx) => (
                          <ListItem key={idx}>
                            <ListItemText
                              primary={table.tablename}
                              secondary={`Size: ${table.size}, Inserts: ${table.inserts}, Updates: ${table.updates}`}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </MetricBox>
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Redis Tab */}
      {activeTab === 2 && redisData && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Redis Cache Status
                </Typography>
                
                {redisData.status === 'not_configured' ? (
                  <Alert severity="info">
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                      {redisData.message}
                    </Typography>
                    <Typography variant="body2" paragraph>
                      {redisData.explanation}
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      Benefits if enabled:
                    </Typography>
                    <List dense>
                      {redisData.benefits_if_enabled?.map((benefit, idx) => (
                        <ListItem key={idx}>
                          <ListItemText primary={benefit} />
                        </ListItem>
                      ))}
                    </List>
                  </Alert>
                ) : (
                  <Stack spacing={2}>
                    <MetricBox>
                      <Typography variant="subtitle2">Version: {redisData.version}</Typography>
                      <Typography variant="subtitle2">Keys: {redisData.keyCount}</Typography>
                      <Typography variant="subtitle2">Memory: {redisData.memory?.used}</Typography>
                    </MetricBox>
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Authentication Tab */}
      {activeTab === 3 && authData && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Authentication System
                </Typography>
                
                {authData.error ? (
                  <Alert severity="error">{authData.error}</Alert>
                ) : (
                  <Stack spacing={3}>
                    {/* Users by Role */}
                    <MetricBox>
                      <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                        Users by Role
                      </Typography>
                      <List dense>
                        {authData.usersByRole?.map((role, idx) => (
                          <ListItem key={idx}>
                            <ListItemText
                              primary={role.role}
                              secondary={`${role.count} users (${role.active} active)`}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </MetricBox>

                    {/* Auth Methods */}
                    <MetricBox>
                      <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                        Authentication Methods
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemText
                            primary="JWT Tokens"
                            secondary={authData.authMethods?.jwtEnabled ? 'Enabled' : 'Disabled'}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="API Keys"
                            secondary={`${authData.authMethods?.usersWithApiKeys} users have API keys`}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Session Storage"
                            secondary={authData.authMethods?.sessionStorage}
                          />
                        </ListItem>
                      </List>
                    </MetricBox>

                    {/* Security Settings */}
                    <MetricBox>
                      <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                        Security Settings
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemText
                            primary="Password Hashing"
                            secondary={authData.security?.passwordHashAlgorithm}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="JWT Expiration"
                            secondary={authData.security?.jwtExpirationTime}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="API Key Length"
                            secondary={`${authData.security?.apiKeyLength} characters`}
                          />
                        </ListItem>
                      </List>
                    </MetricBox>
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* System Resources Tab */}
      {activeTab === 4 && healthData?.checks?.system && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  System Resources
                </Typography>
                
                <Stack spacing={3}>
                  <MetricBox>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                      Memory Usage
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <LinearProgress
                        variant="determinate"
                        value={(healthData.checks.system.details.memoryUsage?.usedByAppMB / healthData.checks.system.details.memoryUsage?.totalMB) * 100}
                        sx={{ height: 10, borderRadius: 5 }}
                      />
                    </Box>
                    <Typography variant="body2">
                      App: {healthData.checks.system.details.memoryUsage?.usedByAppMB} MB
                    </Typography>
                    <Typography variant="body2">
                      Free: {healthData.checks.system.details.memoryUsage?.freeMB} MB
                    </Typography>
                    <Typography variant="body2">
                      Total: {healthData.checks.system.details.memoryUsage?.totalMB} MB
                    </Typography>
                  </MetricBox>

                  <MetricBox>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                      System Information
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText
                          primary="Platform"
                          secondary={healthData.checks.system.details.platform}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Node Version"
                          secondary={healthData.checks.system.details.nodeVersion}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="CPU Cores"
                          secondary={healthData.checks.system.details.cpuCores}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Load Average"
                          secondary={healthData.checks.system.details.loadAverage?.join(', ')}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="System Uptime"
                          secondary={formatUptime(healthData.checks.system.details.uptime?.system || 0)}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Process Uptime"
                          secondary={formatUptime(healthData.checks.system.details.uptime?.process || 0)}
                        />
                      </ListItem>
                    </List>
                  </MetricBox>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

// Import missing icon
const Dashboard = () => <DataUsage />;

export default SystemHealthDashboard;