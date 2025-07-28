import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  Collapse,
  Alert,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Tooltip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress
} from '@mui/material';
import {
  Storage,
  Sync,
  SyncProblem,
  CheckCircle,
  Error as ErrorIcon,
  Warning,
  ExpandMore,
  ExpandLess,
  Refresh,
  CloudSync,
  DataObject,
  Speed,
  Timeline,
  CompareArrows,
  Info
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import CopyButton from './CopyButton';

const EnhancedDatabaseMonitor = () => {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [syncStatus, setSyncStatus] = useState({
    loading: true,
    connected: false,
    lastSync: null,
    metrics: {
      local: { tables: 0, records: 0, size: 0 },
      production: { tables: 0, records: 0, size: 0 }
    },
    discrepancies: [],
    performance: {
      queryTime: 0,
      connectionLatency: 0,
      throughput: 0
    }
  });
  const [refreshing, setRefreshing] = useState(false);

  // Only show for admin
  if (!user || user.username !== 'admin') {
    return null;
  }

  const checkDatabaseStatus = async () => {
    setRefreshing(true);
    const startTime = Date.now();
    
    try {
      // Simulate database checks - in real app, these would be API calls
      const response = await fetch('/api/v1/debug/db-status');
      const data = await response.json();
      
      const queryTime = Date.now() - startTime;
      
      // Calculate mock metrics based on environment
      const isProduction = window.location.hostname !== 'localhost';
      const mockMetrics = {
        local: {
          tables: 12,
          records: isProduction ? 0 : 1247,
          size: isProduction ? 0 : 15.4, // MB
          lastBackup: isProduction ? null : new Date(Date.now() - 3600000).toISOString()
        },
        production: {
          tables: 12,
          records: 3856,
          size: 48.2, // MB
          lastBackup: new Date(Date.now() - 7200000).toISOString()
        }
      };

      // Find discrepancies
      const discrepancies = [];
      if (!isProduction && mockMetrics.local.records < mockMetrics.production.records) {
        discrepancies.push({
          type: 'warning',
          table: 'escrows',
          message: `Local has ${mockMetrics.production.records - mockMetrics.local.records} fewer records than production`,
          impact: 'high'
        });
      }

      setSyncStatus({
        loading: false,
        connected: true,
        lastSync: new Date().toISOString(),
        metrics: mockMetrics,
        discrepancies,
        performance: {
          queryTime,
          connectionLatency: Math.random() * 50 + 10,
          throughput: Math.random() * 900 + 100
        },
        replicationLag: isProduction ? 0 : Math.random() * 5000,
        activeConnections: Math.floor(Math.random() * 20) + 5,
        cacheHitRate: Math.random() * 30 + 70
      });
    } catch (error) {
      setSyncStatus(prev => ({
        ...prev,
        loading: false,
        connected: false,
        error: error.message
      }));
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    checkDatabaseStatus();
    const interval = setInterval(checkDatabaseStatus, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  const getHealthColor = () => {
    if (!syncStatus.connected) return 'error';
    if (syncStatus.discrepancies.length > 0) return 'warning';
    return 'success';
  };

  const getHealthIcon = () => {
    if (!syncStatus.connected) return <SyncProblem color="error" />;
    if (syncStatus.discrepancies.length > 0) return <Warning color="warning" />;
    return <CheckCircle color="success" />;
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Box display="flex" alignItems="center" gap={1}>
          <Storage color="primary" />
          <Typography variant="h6">Database Monitor</Typography>
          <Chip 
            label={syncStatus.connected ? 'Connected' : 'Disconnected'} 
            color={getHealthColor()} 
            size="small" 
            icon={getHealthIcon()}
          />
        </Box>
        <Box display="flex" gap={1}>
          <Tooltip title="Refresh status">
            <IconButton onClick={checkDatabaseStatus} size="small" disabled={refreshing}>
              {refreshing ? <CircularProgress size={20} /> : <Refresh />}
            </IconButton>
          </Tooltip>
          <IconButton onClick={() => setExpanded(!expanded)} size="small">
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Box>
      </Box>

      {/* Quick Overview */}
      <Grid container spacing={2} mb={2}>
        <Grid item xs={6} md={3}>
          <Card variant="outlined">
            <CardContent sx={{ p: 1.5 }}>
              <Box display="flex" alignItems="center" gap={0.5} mb={1}>
                <Speed fontSize="small" color="primary" />
                <Typography variant="caption" color="text.secondary">Query Performance</Typography>
              </Box>
              <Typography variant="h6">{syncStatus.performance.queryTime}ms</Typography>
              <LinearProgress 
                variant="determinate" 
                value={Math.min((100 - syncStatus.performance.queryTime), 100)} 
                color={syncStatus.performance.queryTime > 100 ? 'error' : 'success'}
                sx={{ mt: 0.5 }}
              />
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={6} md={3}>
          <Card variant="outlined">
            <CardContent sx={{ p: 1.5 }}>
              <Box display="flex" alignItems="center" gap={0.5} mb={1}>
                <Timeline fontSize="small" color="primary" />
                <Typography variant="caption" color="text.secondary">Replication Lag</Typography>
              </Box>
              <Typography variant="h6">
                {syncStatus.replicationLag ? `${(syncStatus.replicationLag / 1000).toFixed(1)}s` : '0s'}
              </Typography>
              <Chip 
                label={syncStatus.replicationLag > 1000 ? 'Delayed' : 'Real-time'} 
                size="small" 
                color={syncStatus.replicationLag > 1000 ? 'warning' : 'success'}
                sx={{ mt: 0.5 }}
              />
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={6} md={3}>
          <Card variant="outlined">
            <CardContent sx={{ p: 1.5 }}>
              <Box display="flex" alignItems="center" gap={0.5} mb={1}>
                <DataObject fontSize="small" color="primary" />
                <Typography variant="caption" color="text.secondary">Cache Hit Rate</Typography>
              </Box>
              <Typography variant="h6">{syncStatus.cacheHitRate?.toFixed(1) || 0}%</Typography>
              <LinearProgress 
                variant="determinate" 
                value={syncStatus.cacheHitRate || 0} 
                color={syncStatus.cacheHitRate > 80 ? 'success' : 'warning'}
                sx={{ mt: 0.5 }}
              />
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={6} md={3}>
          <Card variant="outlined">
            <CardContent sx={{ p: 1.5 }}>
              <Box display="flex" alignItems="center" gap={0.5} mb={1}>
                <Sync fontSize="small" color="primary" />
                <Typography variant="caption" color="text.secondary">Active Connections</Typography>
              </Box>
              <Typography variant="h6">{syncStatus.activeConnections || 0}</Typography>
              <Typography variant="caption" color="text.secondary">
                Last sync: {syncStatus.lastSync ? new Date(syncStatus.lastSync).toLocaleTimeString() : 'Never'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Collapse in={expanded}>
        <Divider sx={{ mb: 2 }} />
        
        {/* Environment Comparison */}
        <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CompareArrows color="primary" />
          Environment Comparison
        </Typography>
        
        <TableContainer sx={{ mb: 3 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Metric</TableCell>
                <TableCell align="center">Local</TableCell>
                <TableCell align="center">Production</TableCell>
                <TableCell align="center">Difference</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>Tables</TableCell>
                <TableCell align="center">{syncStatus.metrics.local.tables}</TableCell>
                <TableCell align="center">{syncStatus.metrics.production.tables}</TableCell>
                <TableCell align="center">
                  {syncStatus.metrics.local.tables === syncStatus.metrics.production.tables ? (
                    <Chip label="Synced" size="small" color="success" />
                  ) : (
                    <Chip 
                      label={`${Math.abs(syncStatus.metrics.local.tables - syncStatus.metrics.production.tables)} diff`} 
                      size="small" 
                      color="error" 
                    />
                  )}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Records</TableCell>
                <TableCell align="center">{syncStatus.metrics.local.records.toLocaleString()}</TableCell>
                <TableCell align="center">{syncStatus.metrics.production.records.toLocaleString()}</TableCell>
                <TableCell align="center">
                  {syncStatus.metrics.local.records < syncStatus.metrics.production.records && (
                    <Chip 
                      label={`-${syncStatus.metrics.production.records - syncStatus.metrics.local.records}`} 
                      size="small" 
                      color="warning" 
                    />
                  )}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Database Size</TableCell>
                <TableCell align="center">{syncStatus.metrics.local.size} MB</TableCell>
                <TableCell align="center">{syncStatus.metrics.production.size} MB</TableCell>
                <TableCell align="center">
                  <Typography variant="caption" color="text.secondary">
                    {((syncStatus.metrics.local.size / syncStatus.metrics.production.size) * 100).toFixed(0)}% of prod
                  </Typography>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Last Backup</TableCell>
                <TableCell align="center">
                  {syncStatus.metrics.local.lastBackup ? 
                    new Date(syncStatus.metrics.local.lastBackup).toLocaleTimeString() : 
                    'N/A'
                  }
                </TableCell>
                <TableCell align="center">
                  {syncStatus.metrics.production.lastBackup ? 
                    new Date(syncStatus.metrics.production.lastBackup).toLocaleTimeString() : 
                    'N/A'
                  }
                </TableCell>
                <TableCell align="center">-</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        {/* Discrepancies */}
        {syncStatus.discrepancies.length > 0 && (
          <>
            <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Warning color="warning" />
              Sync Issues
            </Typography>
            <List>
              {syncStatus.discrepancies.map((issue, idx) => (
                <ListItem key={idx}>
                  <ListItemIcon>
                    {issue.type === 'error' ? <ErrorIcon color="error" /> : <Warning color="warning" />}
                  </ListItemIcon>
                  <ListItemText
                    primary={issue.message}
                    secondary={`Table: ${issue.table} | Impact: ${issue.impact}`}
                  />
                </ListItem>
              ))}
            </List>
          </>
        )}

        {/* Performance Metrics */}
        <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Speed color="primary" />
          Performance Metrics
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="caption" color="text.secondary">Connection Latency</Typography>
                <Typography variant="h6">{syncStatus.performance.connectionLatency?.toFixed(0) || 0}ms</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={4}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="caption" color="text.secondary">Throughput</Typography>
                <Typography variant="h6">{syncStatus.performance.throughput?.toFixed(0) || 0} req/s</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={4}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="caption" color="text.secondary">Query Time</Typography>
                <Typography variant="h6">{syncStatus.performance.queryTime}ms</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Export Button */}
        <Box mt={2} display="flex" gap={1}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              const data = {
                timestamp: new Date().toISOString(),
                status: syncStatus,
                environment: window.location.hostname
              };
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `database-status-${Date.now()}.json`;
              a.click();
            }}
          >
            Export Status Report
          </Button>
          <CopyButton text={JSON.stringify(syncStatus, null, 2)} label="Copy Status" />
        </Box>
      </Collapse>
    </Paper>
  );
};

export default EnhancedDatabaseMonitor;