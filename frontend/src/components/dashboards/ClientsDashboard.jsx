import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  Button,
  Chip,
  CircularProgress,
  useTheme,
  alpha,
  Stack,
  Tabs,
  Tab,
  ToggleButton,
  ToggleButtonGroup,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  TrendingUp,
  AttachMoney,
  People,
  CheckCircle,
  Add,
  Assessment,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import CountUp from 'react-countup';
import { clientsAPI } from '../../services/api.service';
import { useAuth } from '../../contexts/AuthContext';

// Styled Components
const HeroSection = styled(Box)(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.spacing(3),
  overflow: 'hidden',
  background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
  color: 'white',
  padding: theme.spacing(6),
  marginBottom: theme.spacing(4),
  boxShadow: '0 20px 60px rgba(25, 118, 210, 0.3)',
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(4),
  },
}));

const ClientsDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('active');
  const [viewMode, setViewMode] = useState(() => {
    const saved = localStorage.getItem('clientsViewMode');
    return saved || 'small';
  });
  const [sortBy, setSortBy] = useState('created_at'); // Sort field
  const [stats, setStats] = useState({
    totalClients: 0,
    activeClients: 0,
    totalTransactions: 0,
    avgClientValue: 0,
  });

  // Save view mode to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('clientsViewMode', viewMode);
  }, [viewMode]);

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    if (clients.length > 0) {
      calculateStats(clients, selectedStatus);
    } else {
      calculateStats([], selectedStatus);
    }
  }, [selectedStatus, clients]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      console.log('Fetching clients...');

      const response = await clientsAPI.getAll();
      console.log('API Response:', response);

      if (response.success) {
        const clientData = response.data.clients || response.data || [];
        console.log('Clients received:', clientData.length);
        setClients(clientData);
        calculateStats(clientData, selectedStatus);
      } else {
        console.error('API returned success: false', response);
      }
    } catch (error) {
      console.error('Error fetching clients:', error.message);
      console.error('Full error:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (clientData, statusFilter = 'active') => {
    if (!clientData || !Array.isArray(clientData)) {
      setStats({
        totalClients: 0,
        activeClients: 0,
        totalTransactions: 0,
        avgClientValue: 0,
      });
      return;
    }

    let filteredClients = [];

    // Filter based on selected status
    switch (statusFilter) {
      case 'active':
        filteredClients = clientData.filter(c =>
          c.clientStatus === 'Active' || c.client_status === 'Active' ||
          c.clientStatus === 'active' || c.client_status === 'active'
        );
        break;
      case 'lead':
        filteredClients = clientData.filter(c =>
          c.clientStatus === 'Lead' || c.client_status === 'Lead' ||
          c.clientStatus === 'lead' || c.client_status === 'lead'
        );
        break;
      case 'past':
        filteredClients = clientData.filter(c =>
          c.clientStatus === 'Past Client' || c.client_status === 'Past Client' ||
          c.clientStatus === 'past_client' || c.client_status === 'past_client'
        );
        break;
      case 'inactive':
        filteredClients = clientData.filter(c =>
          c.clientStatus === 'Inactive' || c.client_status === 'Inactive' ||
          c.clientStatus === 'inactive' || c.client_status === 'inactive'
        );
        break;
      default:
        filteredClients = clientData;
    }

    // Calculate stats
    const totalTransactions = filteredClients.reduce((sum, c) => sum + Number(c.totalTransactions || c.total_transactions || 0), 0);
    const totalValue = filteredClients.reduce((sum, c) => sum + Number(c.totalValue || c.total_value || 0), 0);
    const avgClientValue = filteredClients.length > 0 ? totalValue / filteredClients.length : 0;

    setStats({
      totalClients: filteredClients.length,
      activeClients: filteredClients.length,
      totalTransactions,
      avgClientValue,
    });
  };

  const handleClientClick = (clientId) => {
    console.log('Client clicked - ID:', clientId);
    navigate(`/clients/${clientId}`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>

        {/* Hero Section with Stats */}
        <HeroSection>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
              Client Management
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
              Track and manage all your client relationships in one place
            </Typography>
          </motion.div>

          {/* Stats Grid */}
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 2,
                p: 2.5,
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>
                      Total Clients
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      <CountUp end={stats.totalClients || 0} duration={2} separator="," />
                    </Typography>
                  </Box>
                  <People sx={{ fontSize: 40, opacity: 0.6 }} />
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 2,
                p: 2.5,
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>
                      Active Clients
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      <CountUp end={stats.activeClients || 0} duration={2} separator="," />
                    </Typography>
                  </Box>
                  <CheckCircle sx={{ fontSize: 40, opacity: 0.6 }} />
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 2,
                p: 2.5,
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>
                      Total Transactions
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      <CountUp end={stats.totalTransactions || 0} duration={2} separator="," />
                    </Typography>
                  </Box>
                  <TrendingUp sx={{ fontSize: 40, opacity: 0.6 }} />
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 2,
                p: 2.5,
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>
                      Avg Client Value
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      $<CountUp
                        end={(stats.avgClientValue || 0) / 1000}
                        duration={2}
                        separator=","
                        decimals={0}
                        suffix="K"
                      />
                    </Typography>
                  </Box>
                  <AttachMoney sx={{ fontSize: 40, opacity: 0.6 }} />
                </Box>
              </Box>
            </Grid>
          </Grid>

          {/* Action Buttons */}
          <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<Add />}
              onClick={() => navigate('/clients/new')}
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                backdropFilter: 'blur(10px)',
                fontWeight: 600,
                px: 3,
                py: 1.5,
                borderRadius: 2,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                }
              }}
            >
              Add New Client
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={<Assessment />}
              sx={{
                color: 'white',
                borderColor: 'rgba(255, 255, 255, 0.5)',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                }
              }}
            >
              Client Analytics
            </Button>
          </Box>
        </HeroSection>

      {/* Status Tabs with View Mode Toggle */}
      <Box sx={{ mb: 4 }}>
        <Paper
          elevation={0}
          sx={{
            backgroundColor: 'background.paper',
            borderRadius: 2,
            boxShadow: 1,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pr: 2,
          }}
        >
          <Tabs
            value={selectedStatus}
            onChange={(e, newValue) => setSelectedStatus(newValue)}
            sx={{
              flex: 1,
              '& .MuiTab-root': {
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 500,
                minHeight: 56,
              },
              '& .Mui-selected': {
                fontWeight: 700,
              },
            }}
          >
            <Tab label="Active Clients" value="active" />
            <Tab label="Leads" value="lead" />
            <Tab label="Past Clients" value="past" />
            <Tab label="Inactive" value="inactive" />
          </Tabs>

          <Stack direction="row" spacing={2} alignItems="center">
            {/* Sort Selector */}
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                label="Sort By"
                onChange={(e) => setSortBy(e.target.value)}
              >
                <MenuItem value="created_at">Date Added</MenuItem>
                <MenuItem value="last_contact">Last Contact</MenuItem>
                <MenuItem value="name">Name</MenuItem>
                <MenuItem value="total_value">Total Value</MenuItem>
                <MenuItem value="client_status">Status</MenuItem>
              </Select>
            </FormControl>

            {/* View Mode Selector */}
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(e, newView) => newView && setViewMode(newView)}
              size="small"
              aria-label="View mode selection"
              sx={{
                '& .MuiToggleButton-root': {
                  px: 2,
                  py: 0.5,
                  textTransform: 'none',
                  fontWeight: 500,
                },
              }}
            >
              <ToggleButton value="small" aria-label="Grid view" title="Grid view">
                <Box sx={{ display: 'flex', gap: 0.4 }}>
                  <Box sx={{ width: 4, height: 10, bgcolor: 'currentColor', borderRadius: 0.5 }} />
                  <Box sx={{ width: 4, height: 10, bgcolor: 'currentColor', borderRadius: 0.5 }} />
                  <Box sx={{ width: 4, height: 10, bgcolor: 'currentColor', borderRadius: 0.5 }} />
                  <Box sx={{ width: 4, height: 10, bgcolor: 'currentColor', borderRadius: 0.5 }} />
                </Box>
              </ToggleButton>
              <ToggleButton value="large" aria-label="Full width view" title="Full width view">
                <Box sx={{ width: 24, height: 12, bgcolor: 'currentColor', borderRadius: 0.5 }} />
              </ToggleButton>
            </ToggleButtonGroup>
          </Stack>
        </Paper>
      </Box>

        {/* Clients Grid - Placeholder for now */}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: '1fr',
            md: viewMode === 'small' ? 'repeat(2, 1fr)' : '1fr',
            lg: viewMode === 'small' ? 'repeat(4, 1fr)' : '1fr',
          },
          gap: 3,
          width: '100%',
        }}>
          <AnimatePresence>
            {(() => {
              const filteredClients = clients.filter(c => {
                switch (selectedStatus) {
                  case 'active':
                    return c.clientStatus === 'Active' || c.client_status === 'Active' ||
                           c.clientStatus === 'active' || c.client_status === 'active';
                  case 'lead':
                    return c.clientStatus === 'Lead' || c.client_status === 'Lead' ||
                           c.clientStatus === 'lead' || c.client_status === 'lead';
                  case 'past':
                    return c.clientStatus === 'Past Client' || c.client_status === 'Past Client' ||
                           c.clientStatus === 'past_client' || c.client_status === 'past_client';
                  case 'inactive':
                    return c.clientStatus === 'Inactive' || c.client_status === 'Inactive' ||
                           c.clientStatus === 'inactive' || c.client_status === 'inactive';
                  default:
                    return true;
                }
              });

              // Sort clients based on sortBy state
              const sortedClients = [...filteredClients].sort((a, b) => {
                let aVal, bVal;

                switch(sortBy) {
                  case 'created_at':
                    aVal = new Date(a.createdAt || a.created_at || 0);
                    bVal = new Date(b.createdAt || b.created_at || 0);
                    return bVal - aVal; // Newest first
                  case 'last_contact':
                    aVal = new Date(a.lastContact || a.last_contact || 0);
                    bVal = new Date(b.lastContact || b.last_contact || 0);
                    return bVal - aVal; // Most recent first
                  case 'name':
                    aVal = `${a.firstName || a.first_name || ''} ${a.lastName || a.last_name || ''}`.toLowerCase();
                    bVal = `${b.firstName || b.first_name || ''} ${b.lastName || b.last_name || ''}`.toLowerCase();
                    return aVal.localeCompare(bVal); // A-Z
                  case 'total_value':
                    aVal = Number(a.totalValue || a.total_value || 0);
                    bVal = Number(b.totalValue || b.total_value || 0);
                    return bVal - aVal; // Highest first
                  case 'client_status':
                    aVal = (a.clientStatus || a.client_status || '').toLowerCase();
                    bVal = (b.clientStatus || b.client_status || '').toLowerCase();
                    return aVal.localeCompare(bVal); // A-Z
                  default:
                    return 0;
                }
              });

              if (!sortedClients || sortedClients.length === 0) {
                return (
                  <Paper
                    sx={{
                      p: 6,
                      height: 240,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      background: theme => alpha(theme.palette.primary.main, 0.03),
                      border: theme => `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                      gridColumn: '1 / -1',
                    }}
                  >
                    <Typography variant="h6" color="textSecondary" gutterBottom>
                      No {selectedStatus} clients found
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {selectedStatus === 'active' ? 'Add a new client to get started' : `No ${selectedStatus} clients in the system`}
                    </Typography>
                  </Paper>
                );
              } else {
                return sortedClients.map((client, index) => (
                  <motion.div
                    key={client.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card
                      onClick={() => handleClientClick(client.id)}
                      sx={{
                        cursor: 'pointer',
                        height: '100%',
                        minHeight: 200,
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: 6,
                        },
                        transition: 'all 0.3s',
                      }}
                    >
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {`${client.firstName || client.first_name || ''} ${client.lastName || client.last_name || ''}`}
                        </Typography>
                        <Stack spacing={1}>
                          <Chip
                            label={client.clientStatus || client.client_status || 'Unknown'}
                            size="small"
                            color="primary"
                          />
                          <Typography variant="body2" color="textSecondary">
                            Email: {client.email || 'N/A'}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Phone: {client.phone || 'N/A'}
                          </Typography>
                        </Stack>
                      </CardContent>
                    </Card>
                  </motion.div>
                ));
              }
            })()}
          </AnimatePresence>
        </Box>

      </Container>
    </>
  );
};

export default ClientsDashboard;
