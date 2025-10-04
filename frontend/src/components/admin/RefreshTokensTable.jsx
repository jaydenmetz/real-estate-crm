import React, { useState, useEffect } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Chip, Typography, Box, CircularProgress, IconButton
} from '@mui/material';
import { Refresh } from '@mui/icons-material';
import apiInstance from '../../services/api.service';

const RefreshTokensTable = () => {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTokens();
  }, []);

  const fetchTokens = async () => {
    setLoading(true);
    try {
      const response = await apiInstance.get('/admin/refresh-tokens');
      if (response.success) {
        setTokens(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch refresh tokens:', error);
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
        <Typography variant="h6" fontWeight="bold">Refresh Tokens ({tokens.length})</Typography>
        <IconButton onClick={fetchTokens} color="primary"><Refresh /></IconButton>
      </Box>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell><strong>User</strong></TableCell>
              <TableCell><strong>IP Address</strong></TableCell>
              <TableCell><strong>User Agent</strong></TableCell>
              <TableCell><strong>Expires</strong></TableCell>
              <TableCell><strong>Created</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tokens.map((token) => (
              <TableRow key={token.id} hover>
                <TableCell>{token.user_email || 'N/A'}</TableCell>
                <TableCell>{token.ip_address || 'N/A'}</TableCell>
                <TableCell>
                  <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                    {token.user_agent || 'N/A'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={new Date(token.expires_at).toLocaleDateString()}
                    size="small"
                    color={new Date(token.expires_at) < new Date() ? 'error' : 'success'}
                  />
                </TableCell>
                <TableCell>{new Date(token.created_at).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default RefreshTokensTable;
