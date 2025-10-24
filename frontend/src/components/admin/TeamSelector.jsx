import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Typography,
  Box,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  Divider,
  Button,
  Avatar,
  Paper
} from '@mui/material';
import {
  Business,
  Search,
  AdminPanelSettings,
  People,
  Home,
  Close,
  CheckCircle
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import apiInstance from '../../services/api.service';

const TeamSelector = ({ open, onClose, onSelectTeam }) => {
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);
  const [filteredTeams, setFilteredTeams] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState(null);

  useEffect(() => {
    if (open) {
      fetchTeams();
    }
  }, [open]);

  useEffect(() => {
    // Filter teams based on search
    const filtered = teams.filter(team => 
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.subdomain.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredTeams(filtered);
  }, [searchQuery, teams]);

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const response = await apiInstance.get('/teams');
      if (response.success) {
        setTeams(response.data.teams);
        setFilteredTeams(response.data.teams);
      }
    } catch (error) {
      console.error('Failed to fetch teams:', error);
      // Use mock data for now
      const mockTeams = [
        {
          team_id: '1',
          name: 'Jayden Metz Real Estate',
          subdomain: 'jaydenmetz',
          owner_name: 'Jayden Metz',
          user_count: 1,
          escrow_count: 3,
          created_at: '2025-01-25'
        },
        {
          team_id: '2',
          name: 'Demo Real Estate Team',
          subdomain: 'demo',
          owner_name: 'Demo User',
          user_count: 3,
          escrow_count: 0,
          created_at: '2025-01-25'
        }
      ];
      setTeams(mockTeams);
      setFilteredTeams(mockTeams);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTeam = (team) => {
    setSelectedTeam(team);
    onSelectTeam(team);
    onClose();
  };

  const getTeamStats = (team) => {
    const stats = [];
    if (team.user_count) stats.push(`${team.user_count} users`);
    if (team.escrow_count) stats.push(`${team.escrow_count} escrows`);
    return stats.join(' • ');
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: '80vh'
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={2}>
            <AdminPanelSettings color="primary" />
            <Typography variant="h6">Select Team to View</Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {/* Admin Notice */}
        <Paper 
          sx={{ 
            p: 2, 
            mb: 3, 
            bgcolor: 'primary.main',
            color: 'primary.contrastText'
          }}
        >
          <Typography variant="body2">
            <strong>System Admin Mode:</strong> You can view and manage data for any team below.
            Select a team to access their CRM data.
          </Typography>
        </Paper>

        {/* Search */}
        <TextField
          fullWidth
          placeholder="Search teams..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            )
          }}
        />

        <Divider sx={{ mb: 2 }} />

        {/* Teams List */}
        <List sx={{ pt: 0 }}>
          {/* Own Data Option */}
          <ListItem disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              onClick={() => handleSelectTeam(null)}
              sx={{
                borderRadius: 1,
                border: 1,
                borderColor: 'divider',
                mb: 1,
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'primary.light',
                  '& .MuiListItemText-primary': {
                    color: 'primary.main'
                  }
                }
              }}
            >
              <ListItemIcon>
                <Home color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="System Overview"
                secondary="View aggregate data across all teams"
              />
            </ListItemButton>
          </ListItem>

          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, px: 1 }}>
            Available Teams
          </Typography>

          {loading ? (
            <Typography align="center" sx={{ py: 4 }}>Loading teams...</Typography>
          ) : filteredTeams.length === 0 ? (
            <Typography align="center" sx={{ py: 4 }} color="text.secondary">
              No teams found
            </Typography>
          ) : (
            filteredTeams.map((team) => (
              <ListItem key={team.team_id} disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  onClick={() => handleSelectTeam(team)}
                  selected={selectedTeam?.team_id === team.team_id}
                  sx={{
                    borderRadius: 1,
                    border: 1,
                    borderColor: 'divider',
                    '&:hover': {
                      borderColor: 'primary.main',
                      bgcolor: 'action.hover'
                    },
                    '&.Mui-selected': {
                      borderColor: 'primary.main',
                      bgcolor: 'primary.light'
                    }
                  }}
                >
                  <ListItemIcon>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                      <Business />
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="subtitle1" fontWeight={500}>
                          {team.name}
                        </Typography>
                        {selectedTeam?.team_id === team.team_id && (
                          <CheckCircle color="primary" fontSize="small" />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {team.subdomain}.jaydenmetz.com • Owner: {team.owner_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {getTeamStats(team)}
                        </Typography>
                      </Box>
                    }
                  />
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                    <Chip 
                      label={`${team.user_count || 0} users`} 
                      size="small" 
                      icon={<People fontSize="small" />}
                    />
                    <Typography variant="caption" color="text.secondary">
                      Created {new Date(team.created_at).toLocaleDateString()}
                    </Typography>
                  </Box>
                </ListItemButton>
              </ListItem>
            ))
          )}
        </List>

        {/* Add Team Button */}
        <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<Business />}
            onClick={() => {
              // TODO: Implement add team functionality
              // // console.log('Add new team');
            }}
          >
            Add New Team
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default TeamSelector;