import React from 'react';
import { Box, Typography, Grid, Card, CardContent } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleIcon from '@mui/icons-material/People';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ContactsIcon from '@mui/icons-material/Contacts';

const HeroSection = styled(Box)(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.spacing(3),
  overflow: 'hidden',
  background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
  color: 'white',
  padding: theme.spacing(4),
  marginBottom: theme.spacing(3),
  boxShadow: '0 20px 60px rgba(25, 118, 210, 0.3)',
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(3),
  },
}));

const StatCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.15)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  color: 'white',
  height: '100%',
}));

const BrokerHeroCard = ({ stats, loading }) => {
  if (loading) {
    return (
      <HeroSection>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Loading Brokerage Statistics...
        </Typography>
      </HeroSection>
    );
  }

  if (!stats) {
    return null;
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <HeroSection>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Brokerage Dashboard
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.9, mb: 3 }}>
          Company-wide performance metrics
        </Typography>
      </motion.div>

      {/* Stats Grid */}
      <Grid container spacing={2}>
        {/* Escrows */}
        <Grid item xs={12} sm={6} md={4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <StatCard>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <AssignmentIcon sx={{ mr: 1 }} />
                  <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
                    Escrows
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {stats.escrows?.active || 0}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Active • {stats.escrows?.total || 0} Total
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }}>
                  {formatCurrency(stats.escrows?.volume || 0)} Volume
                </Typography>
              </CardContent>
            </StatCard>
          </motion.div>
        </Grid>

        {/* Clients */}
        <Grid item xs={12} sm={6} md={4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <StatCard>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <ContactsIcon sx={{ mr: 1 }} />
                  <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
                    Clients
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {stats.clients?.active || 0}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Active • {stats.clients?.total || 0} Total
                </Typography>
              </CardContent>
            </StatCard>
          </motion.div>
        </Grid>

        {/* Listings */}
        <Grid item xs={12} sm={6} md={4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <StatCard>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <HomeWorkIcon sx={{ mr: 1 }} />
                  <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
                    Listings
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {stats.listings?.active || 0}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Active • {stats.listings?.total || 0} Total
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }}>
                  {formatCurrency(stats.listings?.inventoryValue || 0)} Inventory
                </Typography>
              </CardContent>
            </StatCard>
          </motion.div>
        </Grid>

        {/* Leads */}
        <Grid item xs={12} sm={6} md={4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <StatCard>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TrendingUpIcon sx={{ mr: 1 }} />
                  <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
                    Leads
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {stats.leads?.active || 0}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Active • {stats.leads?.total || 0} Total
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.7, display: 'block', mt: 1 }}>
                  (Public leads only)
                </Typography>
              </CardContent>
            </StatCard>
          </motion.div>
        </Grid>

        {/* Appointments */}
        <Grid item xs={12} sm={6} md={4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <StatCard>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <PeopleIcon sx={{ mr: 1 }} />
                  <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
                    Appointments
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {stats.appointments?.upcoming || 0}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Upcoming • {stats.appointments?.total || 0} Total
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.7, display: 'block', mt: 1 }}>
                  (Public leads only)
                </Typography>
              </CardContent>
            </StatCard>
          </motion.div>
        </Grid>

        {/* KPIs */}
        <Grid item xs={12} sm={6} md={4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <StatCard>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TrendingUpIcon sx={{ mr: 1 }} />
                  <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
                    Key Metrics
                  </Typography>
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" sx={{ opacity: 0.8, display: 'block' }}>
                      Conversion Rate
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {stats.kpis?.conversionRate || 0}%
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ opacity: 0.8, display: 'block' }}>
                      Show Rate
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {stats.kpis?.showRate || 0}%
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </StatCard>
          </motion.div>
        </Grid>
      </Grid>
    </HeroSection>
  );
};

export default BrokerHeroCard;
