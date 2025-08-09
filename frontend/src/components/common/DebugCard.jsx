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
  Button
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  ContentCopy as CopyIcon,
  BugReport as BugIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Speed as SpeedIcon,
  Memory as MemoryIcon,
  Storage as StorageIcon,
  Api as ApiIcon
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

function DebugCard({ pageType = 'dashboard', pageData = {} }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState({
    api: { status: 'checking', latency: 0 },
    database: { status: 'checking', connections: 0 },
    auth: { status: 'checking', token: false, user: null },
    performance: { loadTime: 0, memoryUsage: 0 },
    tests: { passed: 0, failed: 0, total: 0 }
  });

  // Only show for system admins
  const currentUser = authService.getCurrentUser();
  const isSystemAdmin = currentUser?.role === 'system_admin' || currentUser?.role === 'admin';
  
  if (!isSystemAdmin) {
    return null;
  }

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

      // Page-specific stats
      if (pageType === 'health') {
        // Extract test results from health dashboard
        const testElements = document.querySelectorAll('[data-testid="test-result"]');
        let passed = 0, failed = 0;
        testElements.forEach(el => {
          if (el.dataset.status === 'passed') passed++;
          else if (el.dataset.status === 'failed') failed++;
        });
        
        setStats(prev => ({
          ...prev,
          tests: {
            passed,
            failed,
            total: passed + failed,
            percentage: passed + failed > 0 ? Math.round((passed / (passed + failed)) * 100) : 0
          }
        }));
      }
    };

    gatherStats();
    // Refresh stats every 5 seconds when expanded
    const interval = expanded ? setInterval(gatherStats, 5000) : null;
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [expanded, pageType, currentUser]);

  const copyDebugInfo = () => {
    const debugData = {
      timestamp: new Date().toISOString(),
      page: {
        type: pageType,
        url: window.location.href,
        data: pageData
      },
      stats,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        apiUrl: process.env.REACT_APP_API_URL,
        userAgent: navigator.userAgent,
        screen: `${window.screen.width}x${window.screen.height}`,
        viewport: `${window.innerWidth}x${window.innerHeight}`
      },
      localStorage: {
        keys: Object.keys(localStorage),
        authToken: !!localStorage.getItem('crm_auth_token'),
        user: localStorage.getItem('crm_user_data')
      },
      // Get all visible text content from the page
      pageContent: document.body.innerText.substring(0, 10000)
    };

    const debugText = `
=== DEBUG INFORMATION ===
Generated: ${debugData.timestamp}
Page: ${pageType} (${window.location.pathname})

=== SYSTEM STATS ===
API Status: ${stats.api.status} (${stats.api.latency}ms)
Auth Status: ${stats.auth.status}
User: ${stats.auth.user?.username} (${stats.auth.user?.role})
Token Location: ${stats.auth.tokenLocation}
Memory Usage: ${stats.performance.memoryUsage}MB / ${stats.performance.memoryLimit}MB
Page Load Time: ${stats.performance.loadTime}ms

${pageType === 'health' ? `
=== TEST RESULTS ===
Passed: ${stats.tests.passed}
Failed: ${stats.tests.failed}
Total: ${stats.tests.total}
Success Rate: ${stats.tests.percentage}%
` : ''}

=== PAGE DATA ===
${JSON.stringify(pageData, null, 2)}

=== ENVIRONMENT ===
${JSON.stringify(debugData.environment, null, 2)}

=== PAGE CONTENT ===
${debugData.pageContent}
`;

    navigator.clipboard.writeText(debugText);
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
            {pageType === 'health' && (
              <Chip
                icon={<CheckIcon sx={{ color: '#4caf50' }} />}
                label={`${stats.tests.passed}/${stats.tests.total} Tests`}
                size="small"
                sx={{ backgroundColor: '#2d2d2d' }}
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

            {/* Test Results (if on health page) */}
            {pageType === 'health' && (
              <Grid item xs={12} md={3}>
                <StatCard elevation={0}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <CheckIcon sx={{ color: '#4caf50' }} />
                    <Typography variant="subtitle2" fontWeight={600}>
                      Test Results
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
              onClick={() => console.log({ stats, pageData })}
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

export default DebugCard;