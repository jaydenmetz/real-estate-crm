import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Box, Typography, Grid, Card, CardContent, Paper, Button, Chip,
  CircularProgress, alpha, Stack, Tabs, Tab, ToggleButton, ToggleButtonGroup,
  Select, MenuItem, FormControl, InputLabel,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { TrendingUp, AttachMoney, PersonAdd, CheckCircle, Add, Assessment } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import CountUp from 'react-countup';
import { leadsAPI } from '../../services/api.service';

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

const LeadsDashboard = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('new');
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('leadsViewMode') || 'small');
  const [sortBy, setSortBy] = useState('created_at');
  const [stats, setStats] = useState({
    totalLeads: 0,
    newLeads: 0,
    qualifiedLeads: 0,
    conversionRate: 0,
  });

  useEffect(() => { localStorage.setItem('leadsViewMode', viewMode); }, [viewMode]);
  useEffect(() => { fetchLeads(); }, []);
  useEffect(() => {
    if (leads.length > 0) calculateStats(leads, selectedStatus);
    else calculateStats([], selectedStatus);
  }, [selectedStatus, leads]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const response = await leadsAPI.getAll();
      if (response.success) {
        const data = response.data.leads || response.data || [];
        setLeads(data);
        calculateStats(data, selectedStatus);
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data, statusFilter) => {
    if (!data || !Array.isArray(data)) {
      setStats({ totalLeads: 0, newLeads: 0, qualifiedLeads: 0, conversionRate: 0 });
      return;
    }
    let filtered = data.filter(l => {
      const status = (l.leadStatus || l.lead_status || '').toLowerCase();
      if (statusFilter === 'new') return status === 'new';
      if (statusFilter === 'contacted') return status === 'contacted';
      if (statusFilter === 'qualified') return status === 'qualified';
      if (statusFilter === 'converted') return status === 'converted';
      return true;
    });
    const newCount = data.filter(l => (l.leadStatus || l.lead_status || '').toLowerCase() === 'new').length;
    const qualifiedCount = data.filter(l => (l.leadStatus || l.lead_status || '').toLowerCase() === 'qualified').length;
    const convertedCount = data.filter(l => (l.leadStatus || l.lead_status || '').toLowerCase() === 'converted').length;
    const conversionRate = data.length > 0 ? Math.round((convertedCount / data.length) * 100) : 0;

    setStats({
      totalLeads: filtered.length,
      newLeads: newCount,
      qualifiedLeads: qualifiedCount,
      conversionRate,
    });
  };

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh"><CircularProgress size={60} /></Box>;

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <HeroSection>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 1 }}>Lead Management</Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>Track and manage all your leads in one place</Typography>
        </motion.div>
        <Grid container spacing={3}>
          {[
            { title: 'Total Leads', value: stats.totalLeads, icon: PersonAdd },
            { title: 'New Leads', value: stats.newLeads, icon: Add },
            { title: 'Qualified Leads', value: stats.qualifiedLeads, icon: CheckCircle },
            { title: 'Conversion Rate', value: stats.conversionRate, suffix: '%', icon: TrendingUp }
          ].map(({ title, value, suffix, icon: Icon }) => (
            <Grid item xs={12} sm={6} md={3} key={title}>
              <Box sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 2, p: 2.5, backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>{title}</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}><CountUp end={value || 0} duration={2} separator="," />{suffix || ''}</Typography>
                  </Box>
                  <Icon sx={{ fontSize: 40, opacity: 0.6 }} />
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
        <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
          <Button variant="contained" size="large" startIcon={<Add />} onClick={() => navigate('/leads/new')} sx={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', color: 'white', backdropFilter: 'blur(10px)', fontWeight: 600, px: 3, py: 1.5, borderRadius: 2, '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.3)' } }}>Add New Lead</Button>
          <Button variant="outlined" size="large" startIcon={<Assessment />} sx={{ color: 'white', borderColor: 'rgba(255, 255, 255, 0.5)', '&:hover': { borderColor: 'white', backgroundColor: 'rgba(255, 255, 255, 0.1)' } }}>Lead Analytics</Button>
        </Box>
      </HeroSection>
      <Box sx={{ mb: 4 }}>
        <Paper elevation={0} sx={{ backgroundColor: 'background.paper', borderRadius: 2, boxShadow: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', pr: 2 }}>
          <Tabs value={selectedStatus} onChange={(e, v) => setSelectedStatus(v)} sx={{ flex: 1, '& .MuiTab-root': { textTransform: 'none', fontSize: '1rem', fontWeight: 500, minHeight: 56 }, '& .Mui-selected': { fontWeight: 700 } }}>
            <Tab label="New Leads" value="new" />
            <Tab label="Contacted" value="contacted" />
            <Tab label="Qualified" value="qualified" />
            <Tab label="Converted" value="converted" />
          </Tabs>
          <Stack direction="row" spacing={2} alignItems="center">
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Sort By</InputLabel>
              <Select value={sortBy} label="Sort By" onChange={(e) => setSortBy(e.target.value)}>
                <MenuItem value="created_at">Date Created</MenuItem>
                <MenuItem value="last_contact">Last Contact</MenuItem>
                <MenuItem value="lead_source">Source</MenuItem>
                <MenuItem value="lead_score">Score</MenuItem>
                <MenuItem value="lead_status">Status</MenuItem>
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
            const filtered = leads.filter(l => {
              const status = (l.leadStatus || l.lead_status || '').toLowerCase();
              if (selectedStatus === 'new') return status === 'new';
              if (selectedStatus === 'contacted') return status === 'contacted';
              if (selectedStatus === 'qualified') return status === 'qualified';
              if (selectedStatus === 'converted') return status === 'converted';
              return true;
            });
            const sorted = [...filtered].sort((a, b) => {
              if (sortBy === 'created_at') return new Date(b.createdAt || b.created_at || 0) - new Date(a.createdAt || a.created_at || 0);
              if (sortBy === 'last_contact') return new Date(b.lastContact || b.last_contact || 0) - new Date(a.lastContact || a.last_contact || 0);
              if (sortBy === 'lead_source') return (a.leadSource || a.lead_source || '').localeCompare(b.leadSource || b.lead_source || '');
              if (sortBy === 'lead_score') return Number(b.leadScore || b.lead_score || 0) - Number(a.leadScore || a.lead_score || 0);
              if (sortBy === 'lead_status') return (a.leadStatus || a.lead_status || '').localeCompare(b.leadStatus || b.lead_status || '');
              return 0;
            });
            if (sorted.length === 0) return <Paper sx={{ p: 6, height: 240, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', background: t => alpha(t.palette.primary.main, 0.03), border: t => `1px solid ${alpha(t.palette.primary.main, 0.1)}`, gridColumn: '1 / -1' }}><Typography variant="h6" color="textSecondary">No {selectedStatus} leads found</Typography><Typography variant="body2" color="textSecondary">{selectedStatus === 'new' ? 'Add a new lead to get started' : `No ${selectedStatus} leads in the system`}</Typography></Paper>;
            return sorted.map((l, i) => <motion.div key={l.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3, delay: i * 0.05 }}><Card onClick={() => navigate(`/leads/${l.id}`)} sx={{ cursor: 'pointer', height: '100%', minHeight: 200, '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 }, transition: 'all 0.3s' }}><CardContent><Typography variant="h6" gutterBottom>{`${l.firstName || l.first_name || ''} ${l.lastName || l.last_name || ''}`}</Typography><Stack spacing={1}><Chip label={l.leadStatus || l.lead_status || 'Unknown'} size="small" color="primary" /><Typography variant="body2" color="textSecondary">Source: {l.leadSource || l.lead_source || 'N/A'}</Typography><Typography variant="body2" color="textSecondary">Score: {l.leadScore || l.lead_score || 0}/100</Typography></Stack></CardContent></Card></motion.div>);
          })()}
        </AnimatePresence>
      </Box>
    </Container>
  );
};

export default LeadsDashboard;
