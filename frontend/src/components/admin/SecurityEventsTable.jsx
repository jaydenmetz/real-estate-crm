import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Typography,
  Box,
  CircularProgress,
  TextField,
  InputAdornment,
  IconButton
} from '@mui/material';
import { Search, Refresh } from '@mui/icons-material';
import apiInstance from '../../services/api.service';

const SecurityEventsTable = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await apiInstance.get('/admin/security-events?limit=100');
      if (response.success) {
        setEvents(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch security events:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(event =>
    event.event_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.ip_address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={5}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6" fontWeight="bold">
          Security Events (Latest 100)
        </Typography>
        <Box display="flex" gap={2}>
          <TextField
            size="small"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              )
            }}
          />
          <IconButton onClick={fetchEvents} color="primary">
            <Refresh />
          </IconButton>
        </Box>
      </Box>

      <TableContainer component={Paper} sx={{ maxWidth: '100%', overflowX: 'auto' }}>
        <Table size="small" sx={{ minWidth: 900 }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell sx={{ width: 180, whiteSpace: 'nowrap' }}><strong>Timestamp</strong></TableCell>
              <TableCell sx={{ width: 180 }}><strong>Event Type</strong></TableCell>
              <TableCell sx={{ minWidth: 180 }}><strong>User</strong></TableCell>
              <TableCell sx={{ width: 140, whiteSpace: 'nowrap' }}><strong>IP Address</strong></TableCell>
              <TableCell sx={{ width: 110 }}><strong>Severity</strong></TableCell>
              <TableCell sx={{ width: 90 }}><strong>Success</strong></TableCell>
              <TableCell sx={{ minWidth: 250 }}><strong>Message</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredEvents.map((event) => (
              <TableRow key={event.id} hover>
                <TableCell sx={{ whiteSpace: 'nowrap', fontSize: '0.875rem' }}>
                  {new Date(event.created_at).toLocaleString()}
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 180 }}>
                    {event.event_type}
                  </Typography>
                </TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 180 }}>
                  {event.email || 'N/A'}
                </TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{event.ip_address || 'N/A'}</TableCell>
                <TableCell>
                  <Chip
                    label={event.severity}
                    size="small"
                    color={
                      event.severity === 'critical' ? 'error' :
                      event.severity === 'warning' ? 'warning' : 'default'
                    }
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={event.success ? 'Yes' : 'No'}
                    size="small"
                    color={event.success ? 'success' : 'error'}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" noWrap sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {event.message}
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

export default SecurityEventsTable;
