import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  FormControl,
  Select,
  MenuItem,
  ButtonGroup,
  Button,
  Divider,
  Stack,
  Chip
} from '@mui/material';
import {
  TrendingUp,
  People,
  Gavel,
  Domain,
  EventNote,
  AttachMoney,
  Star
} from '@mui/icons-material';
import { useAuth } from '../../../contexts/AuthContext';
import apiInstance from '../../../services/api.service';

/**
 * AgentHomeDashboard
 *
 * Home dashboard for agent/user role showing personal statistics
 * with date range filtering (1 day, 1 month, 1 year, YTD)
 */
const AgentHomeDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('1month');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const getDateRange = () => {
    const now = new Date();
    let startDate, endDate;

    switch(dateRange) {
      case '1day':
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(now);
        endDate.setHours(23, 59, 59, 999);
        break;
      case '1month':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 30);
        endDate = now;
        break;
      case '1year':
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        endDate = now;
        break;
      case 'ytd':
        startDate = new Date(selectedYear, 0, 1);
        endDate = selectedYear === now.getFullYear() ? now : new Date(selectedYear, 11, 31, 23, 59, 59);
        break;
      default:
        return null;
    }

    return { startDate: startDate.toISOString(), endDate: endDate.toISOString() };
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const dateRangeParams = getDateRange();

        const params = new URLSearchParams();
        if (dateRangeParams) {
          params.append('startDate', dateRangeParams.startDate);
          params.append('endDate', dateRangeParams.endDate);
        }

        const response = await apiInstance.get(`/stats/agent?${params.toString()}`);

        if (response.success) {
          setStats(response.data);
        }
      } catch (error) {
        console.error('Error fetching agent stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [dateRange, selectedYear]);

  const yearOptions = [];
  const currentYear = new Date().getFullYear();
  for (let i = 0; i < 6; i++) {
    yearOptions.push(currentYear - i);
  }

  const StatCard = ({ title, value, icon, color, prefix = '' }) => (
    <Card sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
      <CardContent>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
          <Box sx={{ bgcolor: color, p: 1, borderRadius: 1, display: 'flex' }}>
            {icon}
          </Box>
          <Typography variant="h4" fontWeight="bold">
            {loading ? '...' : `${prefix}${value?.toLocaleString() || 0}`}
          </Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ width: '100%', minHeight: 'calc(100vh - 64px)', backgroundColor: '#f8f9fa', py: 3 }}>
      <Container maxWidth="xl">
        <Box mb={3}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
            <Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                My Dashboard
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Your personal statistics and performance
              </Typography>
            </Box>
            <Chip label="AGENT" color="success" sx={{ fontWeight: 'bold' }} />
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Stack direction="row" spacing={2} alignItems="center">
            <ButtonGroup variant="outlined" size="small">
              <Button
                variant={dateRange === '1day' ? 'contained' : 'outlined'}
                onClick={() => setDateRange('1day')}
              >
                1 Day
              </Button>
              <Button
                variant={dateRange === '1month' ? 'contained' : 'outlined'}
                onClick={() => setDateRange('1month')}
              >
                1 Month
              </Button>
              <Button
                variant={dateRange === '1year' ? 'contained' : 'outlined'}
                onClick={() => setDateRange('1year')}
              >
                1 Year
              </Button>
              <Button
                variant={dateRange === 'ytd' ? 'contained' : 'outlined'}
                onClick={() => setDateRange('ytd')}
              >
                YTD
              </Button>
            </ButtonGroup>

            {dateRange === 'ytd' && (
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                >
                  {yearOptions.map(year => (
                    <MenuItem key={year} value={year}>{year}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Stack>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <StatCard
              title="My Active Escrows"
              value={stats?.myActiveEscrows}
              icon={<Gavel sx={{ color: 'white' }} />}
              color="success.main"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <StatCard
              title="My Active Listings"
              value={stats?.myActiveListings}
              icon={<Domain sx={{ color: 'white' }} />}
              color="warning.main"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <StatCard
              title="My Clients"
              value={stats?.myClients}
              icon={<People sx={{ color: 'white' }} />}
              color="info.main"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <StatCard
              title="My Appointments"
              value={stats?.myAppointments}
              icon={<EventNote sx={{ color: 'white' }} />}
              color="error.main"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <StatCard
              title="My Active Leads"
              value={stats?.myActiveLeads}
              icon={<TrendingUp sx={{ color: 'white' }} />}
              color="primary.dark"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <StatCard
              title="My Total Volume"
              value={stats?.myTotalVolume}
              icon={<AttachMoney sx={{ color: 'white' }} />}
              color="success.dark"
              prefix="$"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <StatCard
              title="Closed Deals"
              value={stats?.myClosedDeals}
              icon={<Star sx={{ color: 'white' }} />}
              color="secondary.main"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <StatCard
              title="Pending Escrows"
              value={stats?.myPendingEscrows}
              icon={<Gavel sx={{ color: 'white' }} />}
              color="primary.main"
            />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default AgentHomeDashboard;
