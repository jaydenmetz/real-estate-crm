import React, { useState, useEffect } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, Box, CircularProgress, IconButton
} from '@mui/material';
import { Refresh } from '@mui/icons-material';
import apiInstance from '../../services/api.service';

const AuditLogsTable = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await apiInstance.get('/admin/audit-logs?limit=100');
      if (response.success) {
        setLogs(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Box display="flex" justifyContent="center" py={5}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" mb={3}>
        <Typography variant="h6" fontWeight="bold">Audit Logs (Latest 100)</Typography>
        <IconButton onClick={fetchLogs} color="primary"><Refresh /></IconButton>
      </Box>
      <TableContainer component={Paper} sx={{ maxWidth: '100%', overflowX: 'auto' }}>
        <Table size="small" sx={{ minWidth: 900 }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell sx={{ width: 180, whiteSpace: 'nowrap' }}><strong>Timestamp</strong></TableCell>
              <TableCell sx={{ minWidth: 180 }}><strong>User</strong></TableCell>
              <TableCell sx={{ width: 100 }}><strong>Action</strong></TableCell>
              <TableCell sx={{ width: 120 }}><strong>Table</strong></TableCell>
              <TableCell sx={{ width: 100, whiteSpace: 'nowrap' }}><strong>Record ID</strong></TableCell>
              <TableCell sx={{ minWidth: 300 }}><strong>Changes</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id} hover>
                <TableCell sx={{ whiteSpace: 'nowrap', fontSize: '0.875rem' }}>
                  {new Date(log.created_at).toLocaleString()}
                </TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 180 }}>
                  {log.user_email || 'System'}
                </TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{log.action}</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{log.table_name}</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                    {log.record_id?.substring(0, 8)}...
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" noWrap sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {JSON.stringify(log.changes)}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AuditLogsTable;
