import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Box, Typography, Grid, Card, CardContent, Paper, Button, Chip,
  CircularProgress, alpha, Stack, Tabs, Tab, ToggleButton, ToggleButtonGroup,
  Select, MenuItem, FormControl, InputLabel, useTheme,
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
  background: 'linear-gradient(135deg, #9333EA 0%, #A855F7 100%)',
  color: 'white',
  padding: theme.spacing(6),
  marginBottom: theme.spacing(4),
  boxShadow: '0 20px 60px rgba(147, 51, 234, 0.3)',
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(4),
  },
}));

// Enhanced animated stat card component with gradient animations
const StatCard = ({ icon: Icon, title, value, prefix = '', suffix = '', color, delay = 0, trend }) => {
  const theme = useTheme();
  return (
    <Grid item xs={12} sm={6} md={3}>
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{
          duration: 0.4,
          delay: delay * 0.08,
          ease: [0.34, 1.56, 0.64, 1]
        }}
      >
        <Card
          elevation={0}
          sx={{
            height: '100%',
            minHeight: 140,
            position: 'relative',
            overflow: 'hidden',
            background: `linear-gradient(135deg, ${alpha(color, 0.15)} 0%, ${alpha(color, 0.08)} 100%)`,
            backdropFilter: 'blur(10px)',
            border: `1px solid ${alpha(color, 0.3)}`,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-8px) scale(1.02)',
              boxShadow: `0 20px 40px ${alpha(color, 0.25)}`,
              border: `1px solid ${alpha(color, 0.5)}`,
            },
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: `linear-gradient(90deg, ${color} 0%, ${alpha(color, 0.6)} 100%)`,
            },
          }}
        >
          <CardContent sx={{ position: 'relative', zIndex: 1, p: 2.5, '&:last-child': { pb: 2.5 } }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography
                  color="textSecondary"
                  gutterBottom
                  variant="body2"
                  sx={{ fontWeight: 500, letterSpacing: 0.5 }}
                >
                  {title}
                </Typography>
                <Typography
                  variant="h3"
                  component="div"
                  sx={{
                    fontWeight: 'bold',
                    color,
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: 0.5,
                  }}
                >
                  <span style={{ fontSize: '0.7em' }}>{prefix}</span>
                  <CountUp
                    end={value}
                    duration={2.5}
                    separator=","
                    decimals={suffix === 'M' || suffix === 'K' ? 1 : 0}
                  />
                  <span style={{ fontSize: '0.7em' }}>{suffix}</span>
                </Typography>
                {trend && (
                  <Box display="flex" alignItems="center" gap={0.5} mt={1}>
                    <TrendingUp sx={{ fontSize: 16, color: '#4caf50' }} />
                    <Typography variant="caption" color="success.main">
                      {trend}% from last month
                    </Typography>
                  </Box>
                )}
              </Box>
              <Box
                sx={{
                  position: 'relative',
                  width: 80,
                  height: 80,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${alpha(color, 0.15)} 0%, transparent 70%)`,
                    animation: 'pulse 2s infinite',
                    '@keyframes pulse': {
                      '0%': { transform: 'scale(0.8)', opacity: 1 },
                      '50%': { transform: 'scale(1.2)', opacity: 0.5 },
                      '100%': { transform: 'scale(0.8)', opacity: 1 },
                    },
                  }}
                />
                <Icon sx={{ fontSize: 48, color, zIndex: 1 }} />
              </Box>
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    </Grid>
  );
};

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
          <StatCard icon={PersonAdd} title="Total Leads" value={stats.totalLeads || 0} color="#f59e0b" delay={0} />
          <StatCard icon={Add} title="New Leads" value={stats.newLeads || 0} color="#ef4444" delay={1} />
          <StatCard icon={CheckCircle} title="Qualified Leads" value={stats.qualifiedLeads || 0} color="#10b981" delay={2} />
          <StatCard icon={TrendingUp} title="Conversion Rate" value={stats.conversionRate || 0} suffix="%" color="#8b5cf6" delay={3} />
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
