import React, { useState } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Avatar,
  LinearProgress,
  Card,
  CardContent,
  Tooltip,
  Link,
} from '@mui/material';
import {
  Add,
  Search,
  FilterList,
  MoreVert,
  Phone,
  Email,
  Person,
  TrendingUp,
  AccessTime,
  Star,
  StarBorder,
  CheckCircle,
  Warning,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { format } from 'date-fns';
import { safeFormatDate } from '../../utils/safeDateUtils';
import StatsCard from '../common/StatsCard';
import { leadsAPI } from '../../services/api';

const LeadsDashboard = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);

  // Fetch leads data
  const { data: leads = [], isLoading } = useQuery(
    ['leads', selectedFilter, searchTerm],
    () => leadsAPI.getAll({ 
      status: selectedFilter === 'all' ? undefined : selectedFilter,
      search: searchTerm 
    }),
    { refetchInterval: 30000 }
  );

  // Mock data for demonstration
  const mockLeads = [
    {
      id: 1,
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      phone: '(555) 123-4567',
      status: 'hot',
      source: 'Website',
      assignedTo: 'Alex AI',
      createdAt: new Date('2024-01-15'),
      lastContact: new Date('2024-01-18'),
      score: 95,
      interested_in: 'Buying',
      budget: '$500,000 - $750,000',
      timeline: '1-3 months',
      notes: 'Looking for 4BR in Roseville area',
      starred: true,
    },
    {
      id: 2,
      name: 'Michael Chen',
      email: 'mchen@email.com',
      phone: '(555) 234-5678',
      status: 'warm',
      source: 'Referral',
      assignedTo: 'You',
      createdAt: new Date('2024-01-10'),
      lastContact: new Date('2024-01-16'),
      score: 75,
      interested_in: 'Selling',
      budget: 'N/A',
      timeline: '3-6 months',
      notes: 'Wants to downsize, owns property in Lincoln',
      starred: false,
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      email: 'emily.r@email.com',
      phone: '(555) 345-6789',
      status: 'cold',
      source: 'Open House',
      assignedTo: 'Buyer Manager AI',
      createdAt: new Date('2024-01-05'),
      lastContact: new Date('2024-01-05'),
      score: 45,
      interested_in: 'Buying',
      budget: '$300,000 - $400,000',
      timeline: '6+ months',
      notes: 'First-time buyer, needs pre-approval',
      starred: false,
    },
  ];

  const displayLeads = leads.length > 0 ? leads : mockLeads;

  const stats = {
    total: displayLeads.length,
    hot: displayLeads.filter(l => l.status === 'hot').length,
    warm: displayLeads.filter(l => l.status === 'warm').length,
    cold: displayLeads.filter(l => l.status === 'cold').length,
    newThisWeek: displayLeads.filter(l => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(l.createdAt) > weekAgo;
    }).length,
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'hot': return 'error';
      case 'warm': return 'warning';
      case 'cold': return 'info';
      default: return 'default';
    }
  };

  const getScoreIcon = (score) => {
    if (score >= 80) return <TrendingUp color="error" />;
    if (score >= 60) return <TrendingUp color="warning" />;
    return <TrendingUp color="action" />;
  };

  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = (filter) => {
    setFilterAnchorEl(null);
    if (filter) {
      setSelectedFilter(filter);
    }
  };

  const handleMenuClick = (event, lead) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
    setSelectedLead(lead);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedLead(null);
  };

  const handleLeadClick = (leadId) => {
    navigate(`/leads/${leadId}`);
  };

  const handleAddLead = () => {
    // Navigate to lead creation or open a modal
    navigate('/leads/new');
  };

  const filteredLeads = displayLeads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.phone.includes(searchTerm);
    const matchesFilter = selectedFilter === 'all' || lead.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Leads Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddLead}
          >
            Add New Lead
          </Button>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Total Leads"
              value={stats.total}
              icon={<Person />}
              color="#1976d2"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Hot Leads"
              value={stats.hot}
              icon={<TrendingUp />}
              color="#d32f2f"
              trend={`${Math.round((stats.hot / stats.total) * 100)}% of total`}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Warm Leads"
              value={stats.warm}
              icon={<AccessTime />}
              color="#f57c00"
              trend={`${Math.round((stats.warm / stats.total) * 100)}% of total`}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="New This Week"
              value={stats.newThisWeek}
              icon={<Star />}
              color="#388e3c"
            />
          </Grid>
        </Grid>

        {/* Search and Filter Bar */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search leads by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="outlined"
              startIcon={<FilterList />}
              onClick={handleFilterClick}
            >
              Filter: {selectedFilter === 'all' ? 'All' : selectedFilter}
            </Button>
            <Menu
              anchorEl={filterAnchorEl}
              open={Boolean(filterAnchorEl)}
              onClose={() => handleFilterClose(null)}
            >
              <MenuItem onClick={() => handleFilterClose('all')}>All Leads</MenuItem>
              <MenuItem onClick={() => handleFilterClose('hot')}>Hot Leads</MenuItem>
              <MenuItem onClick={() => handleFilterClose('warm')}>Warm Leads</MenuItem>
              <MenuItem onClick={() => handleFilterClose('cold')}>Cold Leads</MenuItem>
            </Menu>
          </Box>
        </Paper>

        {/* Leads Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox"></TableCell>
                <TableCell>Lead</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Score</TableCell>
                <TableCell>Source</TableCell>
                <TableCell>Interest</TableCell>
                <TableCell>Timeline</TableCell>
                <TableCell>Assigned To</TableCell>
                <TableCell>Last Contact</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={10} align="center">
                    <LinearProgress />
                  </TableCell>
                </TableRow>
              ) : filteredLeads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align="center">
                    <Typography color="textSecondary">No leads found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredLeads.map((lead) => (
                  <TableRow 
                    key={lead.id} 
                    hover
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell padding="checkbox">
                      <IconButton size="small">
                        {lead.starred ? <Star color="primary" /> : <StarBorder />}
                      </IconButton>
                    </TableCell>
                    <TableCell onClick={() => handleLeadClick(lead.id)}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {lead.name.split(' ').map(n => n[0]).join('')}
                        </Avatar>
                        <Box>
                          <Link
                            component="button"
                            variant="subtitle2"
                            onClick={(e) => {
                              e.preventDefault();
                              handleLeadClick(lead.id);
                            }}
                            sx={{ 
                              textAlign: 'left',
                              textDecoration: 'none',
                              color: 'primary.main',
                              '&:hover': {
                                textDecoration: 'underline'
                              }
                            }}
                          >
                            {lead.name}
                          </Link>
                          <Typography variant="caption" display="block" color="textSecondary">
                            {lead.email}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {lead.phone}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell onClick={() => handleLeadClick(lead.id)}>
                      <Chip
                        label={lead.status.toUpperCase()}
                        color={getStatusColor(lead.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell onClick={() => handleLeadClick(lead.id)}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getScoreIcon(lead.score)}
                        <Typography variant="body2">{lead.score}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell onClick={() => handleLeadClick(lead.id)}>{lead.source}</TableCell>
                    <TableCell onClick={() => handleLeadClick(lead.id)}>
                      <Typography variant="body2">{lead.interested_in}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        {lead.budget}
                      </Typography>
                    </TableCell>
                    <TableCell onClick={() => handleLeadClick(lead.id)}>{lead.timeline}</TableCell>
                    <TableCell onClick={() => handleLeadClick(lead.id)}>
                      <Chip
                        label={lead.assignedTo}
                        size="small"
                        variant="outlined"
                        color={lead.assignedTo.includes('AI') ? 'secondary' : 'default'}
                      />
                    </TableCell>
                    <TableCell onClick={() => handleLeadClick(lead.id)}>
                      <Typography variant="body2">
                        {safeFormatDate(lead.lastContact, 'MMM dd')}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {safeFormatDate(lead.lastContact, 'h:mm a')}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <Tooltip title="Call">
                          <IconButton size="small" color="primary">
                            <Phone />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Email">
                          <IconButton size="small" color="primary">
                            <Email />
                          </IconButton>
                        </Tooltip>
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuClick(e, lead)}
                        >
                          <MoreVert />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Action Menu */}
        <Menu
          anchorEl={menuAnchorEl}
          open={Boolean(menuAnchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => {
            handleLeadClick(selectedLead?.id);
            handleMenuClose();
          }}>
            View Details
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>Edit Lead</MenuItem>
          <MenuItem onClick={handleMenuClose}>Change Status</MenuItem>
          <MenuItem onClick={handleMenuClose}>Assign To</MenuItem>
          <MenuItem onClick={handleMenuClose}>Add Note</MenuItem>
          <MenuItem onClick={handleMenuClose}>Convert to Client</MenuItem>
          <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
            Delete Lead
          </MenuItem>
        </Menu>
      </Box>
    </Container>
  );
};

export default LeadsDashboard;