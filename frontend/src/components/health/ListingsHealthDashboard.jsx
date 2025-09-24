import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Chip,
  LinearProgress,
  Paper,
  IconButton,
  Collapse,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Snackbar,
  Divider
} from '@mui/material';
import {
  PlayArrow as PlayArrowIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  ContentCopy as ContentCopyIcon,
  Home as HomeIcon,
  AttachMoney as MoneyIcon,
  Schedule as ScheduleIcon,
  Assessment as AssessmentIcon,
  Gavel as GavelIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'https://api.jaydenmetz.com/v1';

// Styled components matching escrows health dashboard
const PageContainer = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  minHeight: '100vh',
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(3)
}));

const StyledCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  borderRadius: theme.spacing(2),
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  marginBottom: theme.spacing(3),
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 48px rgba(0, 0, 0, 0.15)'
  }
}));

const StatusChip = styled(Chip)(({ status }) => ({
  fontWeight: 'bold',
  ...(status === 'healthy' && {
    backgroundColor: '#4caf50',
    color: 'white'
  }),
  ...(status === 'degraded' && {
    backgroundColor: '#ff9800',
    color: 'white'
  }),
  ...(status === 'critical' && {
    backgroundColor: '#f44336',
    color: 'white'
  })
}));

const MetricCard = styled(Paper)(({ theme, color }) => ({
  padding: theme.spacing(2),
  textAlign: 'center',
  background: `linear-gradient(135deg, ${color}20 0%, ${color}10 100%)`,
  borderLeft: `4px solid ${color}`,
  height: '100%',
  transition: 'transform 0.2s ease',
  '&:hover': {
    transform: 'scale(1.02)'
  }
}));

function ListingsHealthDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [healthData, setHealthData] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    database: true,
    crud: true,
    analytics: true,
    compliance: true
  });

  const [testResults, setTestResults] = useState({
    database: null,
    crud: null,
    analytics: null,
    compliance: null
  });

  const fetchHealthData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const apiKey = localStorage.getItem('apiKey');

      const headers = {
        'Content-Type': 'application/json'
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else if (apiKey) {
        headers['X-API-Key'] = apiKey;
      }

      const response = await fetch(`${API_URL}/listings/health`, { headers });

      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }

      const data = await response.json();
      setHealthData(data.data);

      // Auto-run all tests
      await runAllTests(headers);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const runAllTests = async (headers) => {
    const tests = ['db', 'crud', 'analytics', 'compliance'];

    for (const test of tests) {
      try {
        const response = await fetch(`${API_URL}/listings/health/${test}`, { headers });
        const data = await response.json();

        setTestResults(prev => ({
          ...prev,
          [test === 'db' ? 'database' : test]: data.success ? data.data : { error: data.error }
        }));
      } catch (err) {
        setTestResults(prev => ({
          ...prev,
          [test === 'db' ? 'database' : test]: { error: err.message }
        }));
      }
    }
  };

  const runCRUDTest = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const apiKey = localStorage.getItem('apiKey');

      const headers = {
        'Content-Type': 'application/json'
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else if (apiKey) {
        headers['X-API-Key'] = apiKey;
      }

      const response = await fetch(`${API_URL}/listings/health/crud?testMode=false`, { headers });
      const data = await response.json();

      if (data.success) {
        setTestResults(prev => ({ ...prev, crud: data.data }));
        setSuccessMessage('CRUD test completed successfully!');
      } else {
        throw new Error(data.error?.message || 'CRUD test failed');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    const dataToExport = {
      health: healthData,
      tests: testResults,
      timestamp: new Date().toISOString()
    };

    navigator.clipboard.writeText(JSON.stringify(dataToExport, null, 2));
    setSuccessMessage('Health data copied to clipboard!');
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy':
      case 'compliant':
      case 'connected':
        return <CheckCircleIcon color="success" />;
      case 'degraded':
      case 'warning':
        return <WarningIcon style={{ color: '#ff9800' }} />;
      case 'critical':
      case 'non-compliant':
        return <ErrorIcon color="error" />;
      default:
        return <WarningIcon color="disabled" />;
    }
  };

  const getHealthScore = () => {
    if (!healthData) return 0;
    return healthData.score || 0;
  };

  const getHealthColor = (score) => {
    if (score >= 90) return '#4caf50';
    if (score >= 70) return '#ff9800';
    return '#f44336';
  };

  useEffect(() => {
    fetchHealthData();
  }, [fetchHealthData]);

  return (
    <PageContainer>
      <Box sx={{ maxWidth: 1400, margin: '0 auto', px: 3 }}>
        {/* Header */}
        <StyledCard>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box display="flex" alignItems="center" gap={2}>
                <HomeIcon fontSize="large" color="primary" />
                <Typography variant="h4" fontWeight="bold">
                  Listings Health Dashboard
                </Typography>
              </Box>
              <Box display="flex" gap={2}>
                <Button
                  variant="outlined"
                  startIcon={<ContentCopyIcon />}
                  onClick={copyToClipboard}
                  disabled={!healthData}
                >
                  Export JSON
                </Button>
                <Button
                  variant="contained"
                  startIcon={<RefreshIcon />}
                  onClick={fetchHealthData}
                  disabled={loading}
                >
                  Refresh
                </Button>
              </Box>
            </Box>

            {/* Overall Health Score */}
            {healthData && (
              <Box display="flex" alignItems="center" gap={3}>
                <Box position="relative" display="inline-flex">
                  <CircularProgress
                    variant="determinate"
                    value={getHealthScore()}
                    size={80}
                    thickness={5}
                    style={{ color: getHealthColor(getHealthScore()) }}
                  />
                  <Box
                    top={0}
                    left={0}
                    bottom={0}
                    right={0}
                    position="absolute"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Typography variant="h6" component="div" fontWeight="bold">
                      {getHealthScore()}%
                    </Typography>
                  </Box>
                </Box>
                <Box>
                  <StatusChip
                    label={healthData.overall_health?.toUpperCase()}
                    status={healthData.overall_health}
                    size="large"
                  />
                  <Typography variant="caption" display="block" mt={1}>
                    Last checked: {new Date(healthData.timestamp).toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            )}
          </CardContent>
        </StyledCard>

        {/* Metrics Summary */}
        {healthData?.metrics && (
          <Grid container spacing={2} mb={3}>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard color="#2196f3">
                <HomeIcon fontSize="large" style={{ color: '#2196f3' }} />
                <Typography variant="h4" fontWeight="bold">
                  {healthData.metrics.active || 0}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Active Listings
                </Typography>
              </MetricCard>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard color="#4caf50">
                <MoneyIcon fontSize="large" style={{ color: '#4caf50' }} />
                <Typography variant="h4" fontWeight="bold">
                  ${Math.round(healthData.metrics.avg_price / 1000)}K
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Avg. Price
                </Typography>
              </MetricCard>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard color="#ff9800">
                <ScheduleIcon fontSize="large" style={{ color: '#ff9800' }} />
                <Typography variant="h4" fontWeight="bold">
                  {healthData.metrics.avg_dom || 0}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Avg. Days on Market
                </Typography>
              </MetricCard>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard color="#9c27b0">
                <AssessmentIcon fontSize="large" style={{ color: '#9c27b0' }} />
                <Typography variant="h4" fontWeight="bold">
                  {healthData.metrics.total_listings || 0}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Total Listings
                </Typography>
              </MetricCard>
            </Grid>
          </Grid>
        )}

        {/* Database Health */}
        <StyledCard>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight="bold">
                Database Health
              </Typography>
              <IconButton onClick={() => toggleSection('database')} size="small">
                {expandedSections.database ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>

            <Collapse in={expandedSections.database}>
              {testResults.database && (
                <Box>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    {getStatusIcon(testResults.database.status)}
                    <StatusChip
                      label={testResults.database.status?.toUpperCase() || 'UNKNOWN'}
                      status={testResults.database.status}
                    />
                    {testResults.database.latency_ms && (
                      <Typography variant="body2" color="textSecondary">
                        Latency: {testResults.database.latency_ms}ms
                      </Typography>
                    )}
                  </Box>
                  {testResults.database.connections && (
                    <Typography variant="body2">
                      Connections: {testResults.database.connections.total_connections} total, {testResults.database.connections.active_queries} active
                    </Typography>
                  )}
                  {testResults.database.version && (
                    <Typography variant="caption" color="textSecondary">
                      {testResults.database.version}
                    </Typography>
                  )}
                </Box>
              )}
            </Collapse>
          </CardContent>
        </StyledCard>

        {/* CRUD Operations */}
        <StyledCard>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight="bold">
                CRUD Operations Test
              </Typography>
              <Box display="flex" gap={2}>
                <Button
                  variant="contained"
                  startIcon={<PlayArrowIcon />}
                  onClick={runCRUDTest}
                  disabled={loading}
                  size="small"
                >
                  Run Test
                </Button>
                <IconButton onClick={() => toggleSection('crud')} size="small">
                  {expandedSections.crud ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>
            </Box>

            <Collapse in={expandedSections.crud}>
              {testResults.crud && (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Operation</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Time (ms)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(testResults.crud.operations || {}).map(([op, success]) => (
                      <TableRow key={op}>
                        <TableCell>{op.toUpperCase()}</TableCell>
                        <TableCell>
                          {success ? (
                            <CheckCircleIcon color="success" fontSize="small" />
                          ) : (
                            <ErrorIcon color="error" fontSize="small" />
                          )}
                        </TableCell>
                        <TableCell>{testResults.crud.timings?.[op] || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Collapse>
          </CardContent>
        </StyledCard>

        {/* Analytics */}
        <StyledCard>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight="bold">
                Listing Analytics
              </Typography>
              <IconButton onClick={() => toggleSection('analytics')} size="small">
                {expandedSections.analytics ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>

            <Collapse in={expandedSections.analytics}>
              {testResults.analytics && (
                <Grid container spacing={2}>
                  {testResults.analytics.inventory && (
                    <>
                      <Grid item xs={6} md={3}>
                        <Typography variant="body2" color="textSecondary">Active</Typography>
                        <Typography variant="h6">{testResults.analytics.inventory.active_listings || 0}</Typography>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Typography variant="body2" color="textSecondary">Pending</Typography>
                        <Typography variant="h6">{testResults.analytics.inventory.pending_listings || 0}</Typography>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Typography variant="body2" color="textSecondary">Sold</Typography>
                        <Typography variant="h6">{testResults.analytics.inventory.sold_listings || 0}</Typography>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Typography variant="body2" color="textSecondary">New This Week</Typography>
                        <Typography variant="h6">{testResults.analytics.inventory.new_this_week || 0}</Typography>
                      </Grid>
                    </>
                  )}

                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                  </Grid>

                  {testResults.analytics.property_types && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" fontWeight="bold" mb={1}>
                        Property Type Distribution
                      </Typography>
                      {testResults.analytics.property_types.map((type, index) => (
                        <Box key={index} display="flex" justifyContent="space-between" mb={1}>
                          <Typography variant="body2">{type.property_type || 'Unknown'}</Typography>
                          <Chip label={type.count} size="small" />
                        </Box>
                      ))}
                    </Grid>
                  )}
                </Grid>
              )}
            </Collapse>
          </CardContent>
        </StyledCard>

        {/* Compliance */}
        <StyledCard>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight="bold">
                Compliance Check
              </Typography>
              <IconButton onClick={() => toggleSection('compliance')} size="small">
                {expandedSections.compliance ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>

            <Collapse in={expandedSections.compliance}>
              {testResults.compliance && (
                <Box>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    {getStatusIcon(testResults.compliance.status)}
                    <StatusChip
                      label={testResults.compliance.status?.toUpperCase() || 'UNKNOWN'}
                      status={testResults.compliance.status}
                    />
                    {testResults.compliance.issues > 0 && (
                      <Typography variant="body2" color="error">
                        {testResults.compliance.issues} issues found
                      </Typography>
                    )}
                  </Box>

                  {testResults.compliance.details && (
                    <Box>
                      {testResults.compliance.details.missing_required_fields?.length > 0 && (
                        <Alert severity="warning" sx={{ mb: 2 }}>
                          <Typography variant="subtitle2">
                            Listings with missing fields: {testResults.compliance.details.missing_required_fields.length}
                          </Typography>
                        </Alert>
                      )}

                      {testResults.compliance.details.expired_listings?.count > 0 && (
                        <Alert severity="warning" sx={{ mb: 2 }}>
                          <Typography variant="subtitle2">
                            Expired active listings: {testResults.compliance.details.expired_listings.count}
                          </Typography>
                        </Alert>
                      )}

                      {testResults.compliance.details.stale_listings?.count > 0 && (
                        <Alert severity="info" sx={{ mb: 2 }}>
                          <Typography variant="subtitle2">
                            Stale listings (no updates in 30 days): {testResults.compliance.details.stale_listings.count}
                          </Typography>
                        </Alert>
                      )}
                    </Box>
                  )}
                </Box>
              )}
            </Collapse>
          </CardContent>
        </StyledCard>

        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {/* Success Message */}
        <Snackbar
          open={!!successMessage}
          autoHideDuration={3000}
          onClose={() => setSuccessMessage('')}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert severity="success" onClose={() => setSuccessMessage('')}>
            {successMessage}
          </Alert>
        </Snackbar>

        {/* Loading Overlay */}
        {loading && (
          <Box
            position="fixed"
            top={0}
            left={0}
            right={0}
            bottom={0}
            display="flex"
            alignItems="center"
            justifyContent="center"
            bgcolor="rgba(0, 0, 0, 0.5)"
            zIndex={9999}
          >
            <CircularProgress size={60} />
          </Box>
        )}
      </Box>
    </PageContainer>
  );
}

export default ListingsHealthDashboard;