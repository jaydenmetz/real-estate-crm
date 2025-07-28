import React, { useState, useEffect, useMemo } from 'react';
import {
  Paper,
  Typography,
  Box,
  Chip,
  Divider,
  Collapse,
  IconButton,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Tooltip,
  Badge
} from '@mui/material';
import {
  BugReport,
  ExpandMore,
  ExpandLess,
  CheckCircle,
  Error as ErrorIcon,
  Warning,
  Info,
  Memory,
  Speed,
  Timeline,
  Code,
  DataObject,
  Refresh,
  AccessTime,
  TrendingUp,
  CloudDownload,
  Visibility,
  VisibilityOff,
  Assessment,
  QueryStats
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import CopyButton from './CopyButton';
import { getSafeTimestamp } from '../../utils/safeDateUtils';

const EnhancedDetailDebugger = ({ 
  pageName = 'Unknown Page',
  id,
  isLoading,
  isError,
  error,
  data,
  additionalInfo = {}
}) => {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [performanceMetrics, setPerformanceMetrics] = useState({});
  const [renderCount, setRenderCount] = useState(0);
  const [stateHistory, setStateHistory] = useState([]);
  const [showSensitiveData, setShowSensitiveData] = useState(false);

  // Only show for admin
  if (!user || user.username !== 'admin') {
    return null;
  }

  // Track renders
  useEffect(() => {
    setRenderCount(prev => prev + 1);
  }, []);

  // Track state changes
  useEffect(() => {
    const timestamp = new Date().toISOString();
    setStateHistory(prev => [...prev, {
      timestamp,
      state: { isLoading, isError, hasData: !!data },
      dataSize: data ? JSON.stringify(data).length : 0
    }].slice(-10)); // Keep last 10 state changes
  }, [isLoading, isError, data]);

  // Calculate performance metrics
  useEffect(() => {
    if (typeof window !== 'undefined' && window.performance) {
      const navigation = performance.getEntriesByType('navigation')[0];
      const paint = performance.getEntriesByName('first-contentful-paint')[0];
      
      setPerformanceMetrics({
        pageLoadTime: navigation?.loadEventEnd - navigation?.fetchStart,
        domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.fetchStart,
        firstContentfulPaint: paint?.startTime,
        memoryUsage: performance.memory ? {
          used: (performance.memory.usedJSHeapSize / 1048576).toFixed(2),
          total: (performance.memory.totalJSHeapSize / 1048576).toFixed(2),
          limit: (performance.memory.jsHeapSizeLimit / 1048576).toFixed(2)
        } : null
      });
    }
  }, []);

  // Enhanced data analysis
  const dataAnalysis = useMemo(() => {
    if (!data) return null;

    const analyze = (obj, path = '') => {
      const analysis = {
        totalKeys: 0,
        totalValues: 0,
        nullValues: 0,
        emptyArrays: 0,
        emptyObjects: 0,
        deepestLevel: 0,
        largestArray: { path: '', size: 0 },
        dataTypes: {}
      };

      const traverse = (current, currentPath, level = 0) => {
        analysis.deepestLevel = Math.max(analysis.deepestLevel, level);

        if (Array.isArray(current)) {
          if (current.length === 0) analysis.emptyArrays++;
          if (current.length > analysis.largestArray.size) {
            analysis.largestArray = { path: currentPath, size: current.length };
          }
          current.forEach((item, index) => traverse(item, `${currentPath}[${index}]`, level + 1));
        } else if (current && typeof current === 'object') {
          const keys = Object.keys(current);
          analysis.totalKeys += keys.length;
          if (keys.length === 0) analysis.emptyObjects++;
          
          keys.forEach(key => {
            const value = current[key];
            const newPath = currentPath ? `${currentPath}.${key}` : key;
            
            if (value === null) analysis.nullValues++;
            analysis.totalValues++;
            
            const type = Array.isArray(value) ? 'array' : typeof value;
            analysis.dataTypes[type] = (analysis.dataTypes[type] || 0) + 1;
            
            traverse(value, newPath, level + 1);
          });
        }
      };

      traverse(obj, path);
      return analysis;
    };

    return analyze(data);
  }, [data]);

  // Get status summary
  const getStatusSummary = () => {
    if (isLoading) return { icon: <AccessTime color="info" />, text: 'Loading...', color: 'info' };
    if (isError) return { icon: <ErrorIcon color="error" />, text: 'Error', color: 'error' };
    if (!data) return { icon: <Warning color="warning" />, text: 'No Data', color: 'warning' };
    return { icon: <CheckCircle color="success" />, text: 'Loaded', color: 'success' };
  };

  const status = getStatusSummary();

  // Export debug data
  const exportDebugData = () => {
    const debugData = {
      timestamp: new Date().toISOString(),
      page: pageName,
      id,
      status: { isLoading, isError, hasData: !!data },
      error: error ? { message: error.message, stack: error.stack } : null,
      dataAnalysis,
      performanceMetrics,
      renderCount,
      stateHistory,
      additionalInfo,
      environment: {
        userAgent: navigator.userAgent,
        viewport: { width: window.innerWidth, height: window.innerHeight },
        url: window.location.href
      }
    };
    
    const blob = new Blob([JSON.stringify(debugData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debug-${pageName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.json`;
    a.click();
  };

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Box display="flex" alignItems="center" gap={1}>
          <BugReport color="primary" />
          <Typography variant="h6">Enhanced Page Debugger</Typography>
          <Chip label={pageName} size="small" color="primary" variant="outlined" />
          <Chip 
            icon={status.icon} 
            label={status.text} 
            size="small" 
            color={status.color} 
          />
        </Box>
        <Box display="flex" gap={1}>
          <Tooltip title="Export debug data">
            <IconButton onClick={exportDebugData} size="small">
              <CloudDownload />
            </IconButton>
          </Tooltip>
          <IconButton onClick={() => setExpanded(!expanded)} size="small">
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Box>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={1} mb={2}>
        <Grid item xs={6} sm={3}>
          <Card variant="outlined">
            <CardContent sx={{ p: 1.5 }}>
              <Box display="flex" alignItems="center" gap={0.5}>
                <Timeline fontSize="small" color="primary" />
                <Typography variant="caption" color="text.secondary">Render Count</Typography>
              </Box>
              <Typography variant="h6">{renderCount}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card variant="outlined">
            <CardContent sx={{ p: 1.5 }}>
              <Box display="flex" alignItems="center" gap={0.5}>
                <Memory fontSize="small" color="primary" />
                <Typography variant="caption" color="text.secondary">Memory Usage</Typography>
              </Box>
              <Typography variant="h6">
                {performanceMetrics.memoryUsage?.used || '0'}MB
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card variant="outlined">
            <CardContent sx={{ p: 1.5 }}>
              <Box display="flex" alignItems="center" gap={0.5}>
                <Speed fontSize="small" color="primary" />
                <Typography variant="caption" color="text.secondary">Page Load</Typography>
              </Box>
              <Typography variant="h6">
                {performanceMetrics.pageLoadTime ? `${performanceMetrics.pageLoadTime}ms` : '-'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card variant="outlined">
            <CardContent sx={{ p: 1.5 }}>
              <Box display="flex" alignItems="center" gap={0.5}>
                <DataObject fontSize="small" color="primary" />
                <Typography variant="caption" color="text.secondary">Data Size</Typography>
              </Box>
              <Typography variant="h6">
                {data ? `${(JSON.stringify(data).length / 1024).toFixed(1)}KB` : '0KB'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Collapse in={expanded}>
        <Divider sx={{ mb: 2 }} />
        
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 2 }}>
          <Tab label="Component State" />
          <Tab label="Data Analysis" />
          <Tab label="Performance" />
          <Tab label="State History" />
          <Tab label={
            <Badge badgeContent={Object.keys(additionalInfo).length} color="primary">
              Additional Info
            </Badge>
          } />
        </Tabs>

        {/* Component State Tab */}
        {activeTab === 0 && (
          <Box>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>Current State</Typography>
                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell>Loading</TableCell>
                        <TableCell>{isLoading ? 'Yes' : 'No'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Error</TableCell>
                        <TableCell>{isError ? 'Yes' : 'No'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Has Data</TableCell>
                        <TableCell>{data ? 'Yes' : 'No'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Entity ID</TableCell>
                        <TableCell>{id || 'N/A'}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
              
              <Grid item xs={12} md={6}>
                {error && (
                  <Alert severity="error">
                    <Typography variant="subtitle2" gutterBottom>Error Details</Typography>
                    <Typography variant="body2">{error.message}</Typography>
                    {error.stack && (
                      <Box mt={1}>
                        <details>
                          <summary>Stack Trace</summary>
                          <pre style={{ fontSize: '0.75rem', overflow: 'auto' }}>{error.stack}</pre>
                        </details>
                      </Box>
                    )}
                  </Alert>
                )}
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Data Analysis Tab */}
        {activeTab === 1 && (
          <Box>
            {dataAnalysis ? (
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>Data Structure Analysis</Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon><QueryStats fontSize="small" /></ListItemIcon>
                      <ListItemText 
                        primary="Total Keys" 
                        secondary={dataAnalysis.totalKeys}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><DataObject fontSize="small" /></ListItemIcon>
                      <ListItemText 
                        primary="Nesting Depth" 
                        secondary={`${dataAnalysis.deepestLevel} levels`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><Warning fontSize="small" color="warning" /></ListItemIcon>
                      <ListItemText 
                        primary="Null Values" 
                        secondary={dataAnalysis.nullValues}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><Info fontSize="small" /></ListItemIcon>
                      <ListItemText 
                        primary="Largest Array" 
                        secondary={`${dataAnalysis.largestArray.size} items at ${dataAnalysis.largestArray.path || 'root'}`}
                      />
                    </ListItem>
                  </List>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>Data Types Distribution</Typography>
                  <Box>
                    {Object.entries(dataAnalysis.dataTypes).map(([type, count]) => (
                      <Box key={type} display="flex" alignItems="center" gap={1} mb={1}>
                        <Typography variant="body2" sx={{ width: 80 }}>{type}:</Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={(count / dataAnalysis.totalValues) * 100} 
                          sx={{ flex: 1 }}
                        />
                        <Typography variant="caption">{count}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Grid>
              </Grid>
            ) : (
              <Alert severity="info">No data to analyze</Alert>
            )}
            
            {data && (
              <Box mt={2}>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                  <Typography variant="subtitle2">Raw Data</Typography>
                  <Box display="flex" gap={1}>
                    <IconButton 
                      size="small" 
                      onClick={() => setShowSensitiveData(!showSensitiveData)}
                    >
                      {showSensitiveData ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                    <CopyButton text={JSON.stringify(data, null, 2)} size="small" />
                  </Box>
                </Box>
                <Paper variant="outlined" sx={{ p: 1, maxHeight: 300, overflow: 'auto' }}>
                  <pre style={{ margin: 0, fontSize: '0.75rem' }}>
                    {showSensitiveData ? 
                      JSON.stringify(data, null, 2) : 
                      JSON.stringify(data, (key, value) => {
                        // Hide potentially sensitive data
                        if (key.toLowerCase().includes('password') || 
                            key.toLowerCase().includes('token') || 
                            key.toLowerCase().includes('secret')) {
                          return '[HIDDEN]';
                        }
                        return value;
                      }, 2)
                    }
                  </pre>
                </Paper>
              </Box>
            )}
          </Box>
        )}

        {/* Performance Tab */}
        {activeTab === 2 && (
          <Box>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>Page Performance</Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon><Speed fontSize="small" /></ListItemIcon>
                    <ListItemText 
                      primary="Page Load Time" 
                      secondary={`${performanceMetrics.pageLoadTime || 0}ms`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><Timeline fontSize="small" /></ListItemIcon>
                    <ListItemText 
                      primary="DOM Content Loaded" 
                      secondary={`${performanceMetrics.domContentLoaded || 0}ms`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><Assessment fontSize="small" /></ListItemIcon>
                    <ListItemText 
                      primary="First Contentful Paint" 
                      secondary={`${performanceMetrics.firstContentfulPaint?.toFixed(0) || 0}ms`}
                    />
                  </ListItem>
                </List>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>Memory Usage</Typography>
                {performanceMetrics.memoryUsage ? (
                  <Box>
                    <Box mb={2}>
                      <Typography variant="body2">
                        Used: {performanceMetrics.memoryUsage.used}MB / {performanceMetrics.memoryUsage.total}MB
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={(performanceMetrics.memoryUsage.used / performanceMetrics.memoryUsage.total) * 100}
                        color={performanceMetrics.memoryUsage.used / performanceMetrics.memoryUsage.total > 0.8 ? 'error' : 'primary'}
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      Heap Limit: {performanceMetrics.memoryUsage.limit}MB
                    </Typography>
                  </Box>
                ) : (
                  <Alert severity="info">Memory API not available</Alert>
                )}
              </Grid>
            </Grid>
          </Box>
        )}

        {/* State History Tab */}
        {activeTab === 3 && (
          <Box>
            <Typography variant="subtitle2" gutterBottom>State Change History</Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Time</TableCell>
                    <TableCell>Loading</TableCell>
                    <TableCell>Error</TableCell>
                    <TableCell>Has Data</TableCell>
                    <TableCell>Data Size</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stateHistory.slice().reverse().map((entry, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        <Typography variant="caption">
                          {new Date(entry.timestamp).toLocaleTimeString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={entry.state.isLoading ? 'Yes' : 'No'} 
                          size="small"
                          color={entry.state.isLoading ? 'info' : 'default'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={entry.state.isError ? 'Yes' : 'No'} 
                          size="small"
                          color={entry.state.isError ? 'error' : 'default'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={entry.state.hasData ? 'Yes' : 'No'} 
                          size="small"
                          color={entry.state.hasData ? 'success' : 'default'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>{(entry.dataSize / 1024).toFixed(1)}KB</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Additional Info Tab */}
        {activeTab === 4 && (
          <Box>
            {Object.keys(additionalInfo).length > 0 ? (
              <Paper variant="outlined" sx={{ p: 2 }}>
                <pre style={{ margin: 0, fontSize: '0.75rem', overflow: 'auto' }}>
                  {JSON.stringify(additionalInfo, null, 2)}
                </pre>
              </Paper>
            ) : (
              <Alert severity="info">No additional info provided</Alert>
            )}
          </Box>
        )}
      </Collapse>
    </Paper>
  );
};

export default EnhancedDetailDebugger;