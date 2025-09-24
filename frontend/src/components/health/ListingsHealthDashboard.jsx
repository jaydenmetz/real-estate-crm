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
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
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
  Speed as SpeedIcon,
  Security as SecurityIcon,
  Storage as StorageIcon
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

const TestResultRow = styled(TableRow)(({ status }) => ({
  '& .MuiTableCell-root': {
    ...(status === 'passed' && {
      backgroundColor: 'rgba(76, 175, 80, 0.1)'
    }),
    ...(status === 'failed' && {
      backgroundColor: 'rgba(244, 67, 54, 0.1)'
    }),
    ...(status === 'skipped' && {
      backgroundColor: 'rgba(255, 152, 0, 0.1)'
    })
  }
}));

function ListingsHealthDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [healthData, setHealthData] = useState(null);
  const [testResults, setTestResults] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    tests: true,
    database: false,
    analytics: false,
    compliance: false
  });

  const [dbHealth, setDbHealth] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [complianceData, setComplianceData] = useState(null);

  // Automatically run all tests on mount
  const runAllHealthChecks = useCallback(async () => {
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

      // Run main health check
      const healthResponse = await fetch(`${API_URL}/listings/health`, { headers });
      if (!healthResponse.ok) {
        throw new Error(`Health check failed: ${healthResponse.status}`);
      }
      const healthData = await healthResponse.json();
      setTestResults(healthData.data);

      // Run database check
      const dbResponse = await fetch(`${API_URL}/listings/health/db`, { headers });
      if (dbResponse.ok) {
        const dbData = await dbResponse.json();
        setDbHealth(dbData.data);
      }

      // Run analytics
      const analyticsResponse = await fetch(`${API_URL}/listings/health/analytics`, { headers });
      if (analyticsResponse.ok) {
        const analytics = await analyticsResponse.json();
        setAnalyticsData(analytics.data);
      }

      // Run compliance check
      const complianceResponse = await fetch(`${API_URL}/listings/health/compliance`, { headers });
      if (complianceResponse.ok) {
        const compliance = await complianceResponse.json();
        setComplianceData(compliance.data);
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Copy all data to clipboard
  const copyToClipboard = () => {
    const dataToExport = {
      timestamp: new Date().toISOString(),
      tests: testResults,
      database: dbHealth,
      analytics: analyticsData,
      compliance: complianceData
    };

    navigator.clipboard.writeText(JSON.stringify(dataToExport, null, 2))
      .then(() => setSuccessMessage('Health data copied to clipboard!'))
      .catch(err => setError('Failed to copy to clipboard'));
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getTestIcon = (status) => {
    switch (status) {
      case 'passed':
        return <CheckCircleIcon style={{ color: '#4caf50' }} />;
      case 'failed':
        return <ErrorIcon style={{ color: '#f44336' }} />;
      case 'skipped':
        return <WarningIcon style={{ color: '#ff9800' }} />;
      default:
        return <CircularProgress size={20} />;
    }
  };

  const getOverallStatus = () => {
    if (!testResults?.summary) return 'unknown';
    if (testResults.summary.failed > 0) return 'critical';
    if (testResults.summary.skipped > 2) return 'degraded';
    return 'healthy';
  };

  const getHealthScore = () => {
    if (!testResults?.summary) return 0;
    const { total, passed } = testResults.summary;
    return total > 0 ? Math.round((passed / total) * 100) : 0;
  };

  const getHealthColor = (score) => {
    if (score >= 90) return '#4caf50';
    if (score >= 70) return '#ff9800';
    return '#f44336';
  };

  // Run tests on component mount
  useEffect(() => {
    runAllHealthChecks();
  }, [runAllHealthChecks]);

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
                  disabled={!testResults}
                >
                  Copy JSON
                </Button>
                <Button
                  variant="contained"
                  startIcon={<RefreshIcon />}
                  onClick={runAllHealthChecks}
                  disabled={loading}
                >
                  Refresh All
                </Button>
              </Box>
            </Box>

            {/* Overall Health Score */}
            {testResults && (
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
                    label={getOverallStatus().toUpperCase()}
                    status={getOverallStatus()}
                    size="large"
                  />
                  <Typography variant="caption" display="block" mt={1}>
                    Last checked: {new Date(testResults.timestamp).toLocaleString()}
                  </Typography>
                  {testResults.user && (
                    <Typography variant="caption" display="block">
                      User: {testResults.user} ({testResults.authMethod})
                    </Typography>
                  )}
                </Box>
              </Box>
            )}
          </CardContent>
        </StyledCard>

        {/* Test Summary Cards */}
        {testResults?.summary && (
          <Grid container spacing={2} mb={3}>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard color="#4caf50">
                <CheckCircleIcon fontSize="large" style={{ color: '#4caf50' }} />
                <Typography variant="h4" fontWeight="bold">
                  {testResults.summary.passed}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Tests Passed
                </Typography>
              </MetricCard>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard color="#f44336">
                <ErrorIcon fontSize="large" style={{ color: '#f44336' }} />
                <Typography variant="h4" fontWeight="bold">
                  {testResults.summary.failed}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Tests Failed
                </Typography>
              </MetricCard>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard color="#ff9800">
                <WarningIcon fontSize="large" style={{ color: '#ff9800' }} />
                <Typography variant="h4" fontWeight="bold">
                  {testResults.summary.skipped}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Tests Skipped
                </Typography>
              </MetricCard>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard color="#2196f3">
                <SpeedIcon fontSize="large" style={{ color: '#2196f3' }} />
                <Typography variant="h4" fontWeight="bold">
                  {testResults.summary.executionTime}ms
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Execution Time
                </Typography>
              </MetricCard>
            </Grid>
          </Grid>
        )}

        {/* Test Results Table */}
        <StyledCard>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight="bold">
                Automated Test Results
              </Typography>
              <IconButton onClick={() => toggleSection('tests')} size="small">
                {expandedSections.tests ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>

            <Collapse in={expandedSections.tests}>
              {testResults?.tests && (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell width="40">Status</TableCell>
                      <TableCell>Test Name</TableCell>
                      <TableCell>Details</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {testResults.tests.map((test, index) => (
                      <TestResultRow key={index} status={test.status}>
                        <TableCell>{getTestIcon(test.status)}</TableCell>
                        <TableCell>
                          <Typography fontWeight={test.status === 'failed' ? 'bold' : 'normal'}>
                            {test.name.replace(/_/g, ' ')}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {test.error && (
                            <Typography variant="caption" color="error">
                              {test.error}
                            </Typography>
                          )}
                          {test.message && (
                            <Typography variant="caption">
                              {test.message}
                            </Typography>
                          )}
                          {test.listingId && (
                            <Typography variant="caption">
                              Listing ID: {test.listingId}
                            </Typography>
                          )}
                          {test.mlsNumber && (
                            <Typography variant="caption">
                              MLS: {test.mlsNumber}
                            </Typography>
                          )}
                        </TableCell>
                      </TestResultRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Collapse>
          </CardContent>
        </StyledCard>

        {/* Database Health */}
        <StyledCard>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box display="flex" alignItems="center" gap={2}>
                <StorageIcon />
                <Typography variant="h6" fontWeight="bold">
                  Database Health
                </Typography>
              </Box>
              <IconButton onClick={() => toggleSection('database')} size="small">
                {expandedSections.database ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>

            <Collapse in={expandedSections.database}>
              {dbHealth && (
                <Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body2" color="textSecondary">Status</Typography>
                      <Box display="flex" alignItems="center" gap={1}>
                        {dbHealth.status === 'connected' ? (
                          <CheckCircleIcon style={{ color: '#4caf50' }} />
                        ) : (
                          <ErrorIcon style={{ color: '#f44336' }} />
                        )}
                        <Typography variant="h6">{dbHealth.status}</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body2" color="textSecondary">Latency</Typography>
                      <Typography variant="h6">{dbHealth.latency || 'N/A'}ms</Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body2" color="textSecondary">Connections</Typography>
                      <Typography variant="h6">
                        {dbHealth.connections?.total_connections || 'N/A'}
                      </Typography>
                    </Grid>
                  </Grid>
                  {dbHealth.database && (
                    <Typography variant="caption" color="textSecondary" display="block" mt={2}>
                      {dbHealth.database.version}
                    </Typography>
                  )}
                </Box>
              )}
            </Collapse>
          </CardContent>
        </StyledCard>

        {/* Analytics */}
        <StyledCard>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box display="flex" alignItems="center" gap={2}>
                <AssessmentIcon />
                <Typography variant="h6" fontWeight="bold">
                  Listing Analytics
                </Typography>
              </Box>
              <IconButton onClick={() => toggleSection('analytics')} size="small">
                {expandedSections.analytics ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>

            <Collapse in={expandedSections.analytics}>
              {analyticsData && (
                <Grid container spacing={2}>
                  {analyticsData.inventory && (
                    <>
                      <Grid item xs={6} md={3}>
                        <Typography variant="body2" color="textSecondary">Active</Typography>
                        <Typography variant="h6">{analyticsData.inventory.active_listings || 0}</Typography>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Typography variant="body2" color="textSecondary">Pending</Typography>
                        <Typography variant="h6">{analyticsData.inventory.pending_listings || 0}</Typography>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Typography variant="body2" color="textSecondary">Sold</Typography>
                        <Typography variant="h6">{analyticsData.inventory.sold_listings || 0}</Typography>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Typography variant="body2" color="textSecondary">New This Week</Typography>
                        <Typography variant="h6">{analyticsData.inventory.new_this_week || 0}</Typography>
                      </Grid>
                    </>
                  )}

                  {analyticsData.pricing && (
                    <>
                      <Grid item xs={12}>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="subtitle2" fontWeight="bold" mb={1}>
                          Pricing Metrics
                        </Typography>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Typography variant="body2" color="textSecondary">Avg Price</Typography>
                        <Typography variant="h6">
                          ${Math.round((analyticsData.pricing.avg_active_price || 0) / 1000)}K
                        </Typography>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Typography variant="body2" color="textSecondary">Median Price</Typography>
                        <Typography variant="h6">
                          ${Math.round((analyticsData.pricing.median_active_price || 0) / 1000)}K
                        </Typography>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Typography variant="body2" color="textSecondary">$/SqFt</Typography>
                        <Typography variant="h6">
                          ${Math.round(analyticsData.pricing.avg_price_per_sqft || 0)}
                        </Typography>
                      </Grid>
                    </>
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
              <Box display="flex" alignItems="center" gap={2}>
                <SecurityIcon />
                <Typography variant="h6" fontWeight="bold">
                  Compliance Check
                </Typography>
              </Box>
              <IconButton onClick={() => toggleSection('compliance')} size="small">
                {expandedSections.compliance ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>

            <Collapse in={expandedSections.compliance}>
              {complianceData && (
                <Box>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    {complianceData.status === 'compliant' ? (
                      <CheckCircleIcon style={{ color: '#4caf50' }} />
                    ) : (
                      <WarningIcon style={{ color: '#ff9800' }} />
                    )}
                    <StatusChip
                      label={complianceData.status?.toUpperCase() || 'UNKNOWN'}
                      status={complianceData.status === 'compliant' ? 'healthy' : 'degraded'}
                    />
                    {complianceData.issues > 0 && (
                      <Typography variant="body2" color="error">
                        {complianceData.issues} issues found
                      </Typography>
                    )}
                  </Box>

                  {complianceData.details && (
                    <List dense>
                      {complianceData.details.missing_required_fields?.length > 0 && (
                        <ListItem>
                          <ListItemIcon>
                            <WarningIcon color="warning" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Missing Required Fields"
                            secondary={`${complianceData.details.missing_required_fields.length} listings have incomplete data`}
                          />
                        </ListItem>
                      )}

                      {complianceData.details.expired_listings?.count > 0 && (
                        <ListItem>
                          <ListItemIcon>
                            <ErrorIcon color="error" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Expired Active Listings"
                            secondary={`${complianceData.details.expired_listings.count} listings over 180 days old`}
                          />
                        </ListItem>
                      )}

                      {complianceData.details.stale_listings?.count > 0 && (
                        <ListItem>
                          <ListItemIcon>
                            <WarningIcon style={{ color: '#ff9800' }} />
                          </ListItemIcon>
                          <ListItemText
                            primary="Stale Listings"
                            secondary={`${complianceData.details.stale_listings.count} listings not updated in 30+ days`}
                          />
                        </ListItem>
                      )}

                      {complianceData.details.price_anomalies?.length > 0 && (
                        <ListItem>
                          <ListItemIcon>
                            <WarningIcon style={{ color: '#ff9800' }} />
                          </ListItemIcon>
                          <ListItemText
                            primary="Price Anomalies"
                            secondary={`${complianceData.details.price_anomalies.length} listings with unusual pricing`}
                          />
                        </ListItem>
                      )}
                    </List>
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