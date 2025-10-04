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
  IconButton,
  Tooltip
} from '@mui/material';
import { Search, Refresh, CheckCircle, Cancel } from '@mui/icons-material';
import apiInstance from '../../services/api.service';

const ApiKeysTable = () => {
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    setLoading(true);
    try {
      const response = await apiInstance.get('/admin/api-keys');
      if (response.success) {
        setApiKeys(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch API keys:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredKeys = apiKeys.filter(key =>
    key.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    key.user_email?.toLowerCase().includes(searchTerm.toLowerCase())
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
          API Keys ({apiKeys.length})
        </Typography>
        <Box display="flex" gap={2}>
          <TextField
            size="small"
            placeholder="Search API keys..."
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
          <Tooltip title="Refresh">
            <IconButton onClick={fetchApiKeys} color="primary">
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell><strong>ID</strong></TableCell>
              <TableCell><strong>Name</strong></TableCell>
              <TableCell><strong>User</strong></TableCell>
              <TableCell><strong>Active</strong></TableCell>
              <TableCell><strong>Last Used</strong></TableCell>
              <TableCell><strong>Expires</strong></TableCell>
              <TableCell><strong>Created</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredKeys.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography color="textSecondary">No API keys found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredKeys.map((key) => (
                <TableRow key={key.id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                      {key.id.substring(0, 8)}...
                    </Typography>
                  </TableCell>
                  <TableCell>{key.name}</TableCell>
                  <TableCell>{key.user_email || 'Unknown'}</TableCell>
                  <TableCell>
                    {key.is_active ? (
                      <CheckCircle sx={{ color: 'success.main' }} />
                    ) : (
                      <Cancel sx={{ color: 'error.main' }} />
                    )}
                  </TableCell>
                  <TableCell>
                    {key.last_used_at ? new Date(key.last_used_at).toLocaleString() : 'Never'}
                  </TableCell>
                  <TableCell>
                    {key.expires_at ? (
                      <Chip
                        label={new Date(key.expires_at).toLocaleDateString()}
                        size="small"
                        color={new Date(key.expires_at) < new Date() ? 'error' : 'success'}
                      />
                    ) : (
                      <Chip label="Never" size="small" />
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(key.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ApiKeysTable;
