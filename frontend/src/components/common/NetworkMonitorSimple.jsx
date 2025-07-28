import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Collapse,
  Alert
} from '@mui/material';
import {
  NetworkCheck,
  ExpandMore,
  ExpandLess,
  CheckCircle,
  Error as ErrorIcon,
  AccessTime
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import networkMonitor from '../../services/networkMonitor';

const NetworkMonitorSimple = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [expanded, setExpanded] = useState(false);
  
  // Only show for system admin
  if (!user || user.username !== 'admin') {
    return null;
  }

  useEffect(() => {
    networkMonitor.enable();
    
    const unsubscribe = networkMonitor.subscribe((newRequests) => {
      setRequests(newRequests);
    });

    setRequests(networkMonitor.getRequests());
    return unsubscribe;
  }, []);

  const stats = networkMonitor.getStats();
  const recentRequests = requests.slice(0, 5);

  const getStatusIcon = (request) => {
    if (request.status === 'pending') return <AccessTime fontSize="small" />;
    if (request.success === false) return <ErrorIcon fontSize="small" color="error" />;
    return <CheckCircle fontSize="small" color="success" />;
  };

  const formatUrl = (url) => {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname;
    } catch {
      return url;
    }
  };

  return (
    <Paper sx={{ p: 2, mb: 2, bgcolor: 'background.paper' }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Box display="flex" alignItems="center" gap={1}>
          <NetworkCheck color="primary" />
          <Typography variant="h6">Network Monitor</Typography>
          <Chip label="ADMIN" size="small" color="error" />
        </Box>
        <IconButton onClick={() => setExpanded(!expanded)} size="small">
          {expanded ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      </Box>

      {/* Stats */}
      <Box display="flex" gap={2} mb={2}>
        <Chip label={`Total: ${stats.total}`} variant="outlined" />
        <Chip label={`Errors: ${stats.errors}`} color={stats.errors > 0 ? 'error' : 'default'} variant="outlined" />
        <Chip label={`Error Rate: ${stats.errorRate}%`} color={stats.errorRate > 10 ? 'error' : 'default'} variant="outlined" />
        <Chip label={`Avg: ${stats.avgDuration}ms`} variant="outlined" />
      </Box>

      <Collapse in={expanded}>
        {recentRequests.length > 0 ? (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Status</TableCell>
                  <TableCell>Method</TableCell>
                  <TableCell>URL</TableCell>
                  <TableCell>Duration</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentRequests.map((request, index) => (
                  <TableRow key={request.id || index}>
                    <TableCell>{getStatusIcon(request)}</TableCell>
                    <TableCell>
                      <Chip label={request.method} size="small" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">{formatUrl(request.url)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">
                        {request.duration ? `${request.duration}ms` : '-'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Alert severity="info">No network requests captured yet</Alert>
        )}
      </Collapse>
    </Paper>
  );
};

export default NetworkMonitorSimple;