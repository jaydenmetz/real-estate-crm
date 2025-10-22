import React, { useState, useEffect } from 'react';
import {
  Box,
  FormControl,
  Select,
  MenuItem,
  Typography,
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import BusinessIcon from '@mui/icons-material/Business';
import apiInstance from '../../../services/api.service';

const SelectorContainer = styled(Box)(({ theme }) => ({
  backgroundColor: 'white',
  borderRadius: theme.spacing(2),
  padding: theme.spacing(2, 3),
  marginBottom: theme.spacing(3),
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
}));

const TeamSelector = ({ selectedTeamId, onTeamChange, brokerId }) => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!brokerId) {
      setLoading(false);
      return;
    }

    const fetchTeams = async () => {
      try {
        setLoading(true);
        // Fetch all teams for this broker
        // Note: This endpoint needs to be created in backend
        const response = await apiInstance.get(`/teams?brokerId=${brokerId}`);

        if (response.data.success) {
          setTeams(response.data.data || []);

          // Auto-select first team if none selected
          if (!selectedTeamId && response.data.data.length > 0) {
            onTeamChange(response.data.data[0].team_id);
          }
        }
      } catch (err) {
        console.error('Error fetching teams:', err);
        setError('Failed to load teams');
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, [brokerId, selectedTeamId, onTeamChange]);

  if (!brokerId) {
    return null; // Only brokers see team selector
  }

  if (loading) {
    return (
      <SelectorContainer>
        <CircularProgress size={24} />
        <Typography>Loading teams...</Typography>
      </SelectorContainer>
    );
  }

  if (error) {
    return (
      <SelectorContainer>
        <Typography color="error">{error}</Typography>
      </SelectorContainer>
    );
  }

  if (teams.length === 0) {
    return (
      <SelectorContainer>
        <BusinessIcon sx={{ color: 'text.secondary' }} />
        <Typography color="text.secondary">No teams found</Typography>
      </SelectorContainer>
    );
  }

  return (
    <SelectorContainer>
      <BusinessIcon sx={{ color: 'primary.main' }} />
      <Typography variant="subtitle1" sx={{ fontWeight: 600, minWidth: 'fit-content' }}>
        Select Team:
      </Typography>
      <FormControl fullWidth>
        <Select
          value={selectedTeamId || ''}
          onChange={(e) => onTeamChange(e.target.value)}
          displayEmpty
          size="small"
        >
          <MenuItem value="" disabled>
            Choose a team
          </MenuItem>
          {teams.map((team) => (
            <MenuItem key={team.team_id} value={team.team_id}>
              {team.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </SelectorContainer>
  );
};

export default TeamSelector;
