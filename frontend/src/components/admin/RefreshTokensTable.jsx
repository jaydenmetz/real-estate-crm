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
      <TableContainer component={Paper} sx={{ maxWidth: '100%', overflowX: 'auto' }}>
        <Table size="small" sx={{ minWidth: 800 }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell sx={{ minWidth: 200 }}><strong>User</strong></TableCell>
              <TableCell sx={{ width: 140, whiteSpace: 'nowrap' }}><strong>IP Address</strong></TableCell>
              <TableCell sx={{ minWidth: 250 }}><strong>User Agent</strong></TableCell>
              <TableCell sx={{ width: 140, whiteSpace: 'nowrap' }}><strong>Expires</strong></TableCell>
              <TableCell sx={{ width: 120, whiteSpace: 'nowrap' }}><strong>Created</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tokens.map((token) => (
              <TableRow key={token.id} hover>
                <TableCell sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 200 }}>
                  {token.user_email || 'N/A'}
                </TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{token.ip_address || 'N/A'}</TableCell>
                <TableCell>
                  <Typography variant="body2" noWrap sx={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {token.user_agent || 'N/A'}
                  </Typography>
                </TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                  <Chip
                    label={new Date(token.expires_at).toLocaleDateString()}
                    size="small"
                    color={new Date(token.expires_at) < new Date() ? 'error' : 'success'}
                  />
                </TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap', fontSize: '0.875rem' }}>
                  {new Date(token.created_at).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default RefreshTokensTable;
