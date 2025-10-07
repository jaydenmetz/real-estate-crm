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
  Event,
  CalendarToday,
  CheckCircle,
  Add,
  Assessment,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import CountUp from 'react-countup';
import { appointmentsAPI } from '../../services/api.service';

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

const AppointmentsDashboard = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('upcoming');
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('appointmentsViewMode') || 'small');
  const [sortBy, setSortBy] = useState('appointment_date');
  const [stats, setStats] = useState({
    totalAppointments: 0,
    upcomingAppointments: 0,
    completedThisMonth: 0,
    avgPerWeek: 0,
  });

  useEffect(() => { localStorage.setItem('appointmentsViewMode', viewMode); }, [viewMode]);
  useEffect(() => { fetchAppointments(); }, []);
  useEffect(() => {
    if (appointments.length > 0) calculateStats(appointments, selectedStatus);
    else calculateStats([], selectedStatus);
  }, [selectedStatus, appointments]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await appointmentsAPI.getAll();
      if (response.success) {
        const data = response.data.appointments || response.data || [];
        setAppointments(data);
        calculateStats(data, selectedStatus);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data, statusFilter) => {
    if (!data || !Array.isArray(data)) {
      setStats({ totalAppointments: 0, upcomingAppointments: 0, completedThisMonth: 0, avgPerWeek: 0 });
      return;
    }
    const now = new Date();
    let filtered = data.filter(a => {
      const apptDate = new Date(a.appointmentDate || a.appointment_date);
      if (statusFilter === 'upcoming') return apptDate >= now;
      if (statusFilter === 'completed') return (a.appointmentStatus || a.appointment_status) === 'Completed';
      if (statusFilter === 'cancelled') return (a.appointmentStatus || a.appointment_status) === 'Cancelled';
      if (statusFilter === 'past') return apptDate < now;
      return true;
    });
    setStats({
      totalAppointments: filtered.length,
      upcomingAppointments: filtered.length,
      completedThisMonth: Math.floor(filtered.length / 2),
      avgPerWeek: Math.floor(filtered.length / 4),
    });
  };

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh"><CircularProgress size={60} /></Box>;

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <HeroSection>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 1 }}>Appointment Management</Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>Track and manage all your appointments in one place</Typography>
        </motion.div>
        <Grid container spacing={3}>
          {[
            { title: 'Total Appointments', value: stats.totalAppointments, icon: Event },
            { title: 'Upcoming', value: stats.upcomingAppointments, icon: CalendarToday },
            { title: 'Completed This Month', value: stats.completedThisMonth, icon: CheckCircle },
            { title: 'Avg Per Week', value: stats.avgPerWeek, icon: TrendingUp }
          ].map(({ title, value, icon: Icon }) => (
            <Grid item xs={12} sm={6} md={3} key={title}>
              <Box sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 2, p: 2.5, backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>{title}</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}><CountUp end={value || 0} duration={2} separator="," /></Typography>
                  </Box>
                  <Icon sx={{ fontSize: 40, opacity: 0.6 }} />
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
        <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
          <Button variant="contained" size="large" startIcon={<Add />} onClick={() => navigate('/appointments/new')} sx={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', color: 'white', backdropFilter: 'blur(10px)', fontWeight: 600, px: 3, py: 1.5, borderRadius: 2, '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.3)' } }}>Schedule Appointment</Button>
          <Button variant="outlined" size="large" startIcon={<Assessment />} sx={{ color: 'white', borderColor: 'rgba(255, 255, 255, 0.5)', '&:hover': { borderColor: 'white', backgroundColor: 'rgba(255, 255, 255, 0.1)' } }}>Appointment Analytics</Button>
        </Box>
      </HeroSection>
      <Box sx={{ mb: 4 }}>
        <Paper elevation={0} sx={{ backgroundColor: 'background.paper', borderRadius: 2, boxShadow: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', pr: 2 }}>
          <Tabs value={selectedStatus} onChange={(e, v) => setSelectedStatus(v)} sx={{ flex: 1, '& .MuiTab-root': { textTransform: 'none', fontSize: '1rem', fontWeight: 500, minHeight: 56 }, '& .Mui-selected': { fontWeight: 700 } }}>
            <Tab label="Upcoming" value="upcoming" />
            <Tab label="Completed" value="completed" />
            <Tab label="Cancelled" value="cancelled" />
            <Tab label="Past" value="past" />
          </Tabs>
          <Stack direction="row" spacing={2} alignItems="center">
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Sort By</InputLabel>
              <Select value={sortBy} label="Sort By" onChange={(e) => setSortBy(e.target.value)}>
                <MenuItem value="appointment_date">Appointment Date</MenuItem>
                <MenuItem value="created_at">Date Created</MenuItem>
                <MenuItem value="client_name">Client Name</MenuItem>
                <MenuItem value="appointment_type">Type</MenuItem>
                <MenuItem value="appointment_status">Status</MenuItem>
              </Select>
            </FormControl>
            <ToggleButtonGroup value={viewMode} exclusive onChange={(e, v) => v && setViewMode(v)} size="small" sx={{ '& .MuiToggleButton-root': { px: 2, py: 0.5, textTransform: 'none', fontWeight: 500 } }}>
              <ToggleButton value="small"><Box sx={{ display: 'flex', gap: 0.4 }}>{[...Array(4)].map((_, i) => <Box key={i} sx={{ width: 4, height: 10, bgcolor: 'currentColor', borderRadius: 0.5 }} />)}</Box></ToggleButton>
              <ToggleButton value="large"><Box sx={{ width: 24, height: 12, bgcolor: 'currentColor', borderRadius: 0.5 }} /></ToggleButton>
            </ToggleButtonGroup>
          </Stack>
        </Paper>
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr', md: viewMode === 'small' ? 'repeat(2, 1fr)' : '1fr', lg: viewMode === 'small' ? 'repeat(4, 1fr)' : '1fr' }, gap: 3, width: '100%' }}>
        <AnimatePresence>
          {(() => {
            const now = new Date();
            const filtered = appointments.filter(a => {
              const date = new Date(a.appointmentDate || a.appointment_date);
              if (selectedStatus === 'upcoming') return date >= now;
              if (selectedStatus === 'completed') return (a.appointmentStatus || a.appointment_status) === 'Completed';
              if (selectedStatus === 'cancelled') return (a.appointmentStatus || a.appointment_status) === 'Cancelled';
              if (selectedStatus === 'past') return date < now;
              return true;
            });
            const sorted = [...filtered].sort((a, b) => {
              if (sortBy === 'appointment_date') return new Date(b.appointmentDate || b.appointment_date) - new Date(a.appointmentDate || a.appointment_date);
              if (sortBy === 'created_at') return new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at);
              if (sortBy === 'client_name') return (a.clientName || '').localeCompare(b.clientName || '');
              if (sortBy === 'appointment_type') return (a.appointmentType || '').localeCompare(b.appointmentType || '');
              if (sortBy === 'appointment_status') return (a.appointmentStatus || '').localeCompare(b.appointmentStatus || '');
              return 0;
            });
            if (sorted.length === 0) return <Paper sx={{ p: 6, height: 240, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', background: t => alpha(t.palette.primary.main, 0.03), border: t => `1px solid ${alpha(t.palette.primary.main, 0.1)}`, gridColumn: '1 / -1' }}><Typography variant="h6" color="textSecondary">No {selectedStatus} appointments found</Typography></Paper>;
            return sorted.map((a, i) => <motion.div key={a.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3, delay: i * 0.05 }}><Card onClick={() => navigate(`/appointments/${a.id}`)} sx={{ cursor: 'pointer', height: '100%', minHeight: 200, '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 }, transition: 'all 0.3s' }}><CardContent><Typography variant="h6" gutterBottom>{a.appointmentType || 'Appointment'}</Typography><Stack spacing={1}><Chip label={a.appointmentStatus || 'Unknown'} size="small" color="primary" /><Typography variant="body2" color="textSecondary">Client: {a.clientName || 'N/A'}</Typography><Typography variant="body2" color="textSecondary">Date: {new Date(a.appointmentDate || a.appointment_date).toLocaleDateString()}</Typography></Stack></CardContent></Card></motion.div>);
          })()}
        </AnimatePresence>
      </Box>
    </Container>
  );
};

export default AppointmentsDashboard;
