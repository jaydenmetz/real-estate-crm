import React, { useState, useEffect } from 'react';
import { Box, Grid, Card, CardContent, Typography, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import apiInstance from '../../services/api.service';

/**
 * Simple Database Panel - Clean view of all tables
 * Click any table → Full table view with CRUD
 */
const SimpleDatabasePanel = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      // Get all tables with counts from backend
      const response = await apiInstance.get('/admin/database/tables');
      if (response.success) {
        setTables(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch tables:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTableClick = (tableName) => {
    navigate(`/admin/database/${tableName}`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Database Tables
      </Typography>
      <Typography variant="body2" color="textSecondary" gutterBottom>
        Click any table to view and manage data
      </Typography>

      <Grid container spacing={2} mt={2}>
        {tables.map((table) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={table.name}>
            <Card
              sx={{
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: 6,
                  transform: 'translateY(-4px)',
                  transition: 'all 0.2s'
                }
              }}
              onClick={() => handleTableClick(table.name)}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {table.name}
                </Typography>
                <Typography variant="h3" color="primary">
                  {table.row_count.toLocaleString()}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  rows
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default SimpleDatabasePanel;
