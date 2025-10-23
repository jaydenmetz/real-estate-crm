import React, { useState, useEffect } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Business, Group, Person } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import apiInstance from '../../services/api.service';

/**
 * AdminEntitySelector - Multi-level entity selector for admin dashboards
 *
 * Allows system_admin and brokers to view data at different scopes:
 * - Brokerage level (all teams under a broker)
 * - Team level (specific team)
 * - User level (specific agent)
 *
 * Props:
 * - onScopeChange: (scope, entityId, entityName) => void
 * - defaultScope: 'brokerage' | 'team' | 'user'
 */
const AdminEntitySelector = ({ onScopeChange, defaultScope = 'brokerage' }) => {
  const { user } = useAuth();
  const [scope, setScope] = useState(defaultScope);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Entity lists
  const [brokers, setBrokers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);

  // Selected entities
  const [selectedBroker, setSelectedBroker] = useState(user?.broker_id || '');
  const [selectedTeam, setSelectedTeam] = useState(user?.team_id || '');
  const [selectedUser, setSelectedUser] = useState('');

  // Fetch brokers (system_admin only)
  useEffect(() => {
    if (user?.role === 'system_admin') {
      fetchBrokers();
    }
  }, [user]);

  // Fetch teams when broker is selected
  useEffect(() => {
    if (selectedBroker) {
      fetchTeams(selectedBroker);
    }
  }, [selectedBroker]);

  // Fetch users when team is selected
  useEffect(() => {
    if (selectedTeam) {
      fetchUsers(selectedTeam);
    }
  }, [selectedTeam]);

  // Notify parent when selection changes
  useEffect(() => {
    if (scope === 'brokerage' && selectedBroker) {
      const broker = brokers.find(b => b.id === selectedBroker);
      onScopeChange('brokerage', selectedBroker, broker?.name || 'Brokerage');
    } else if (scope === 'team' && selectedTeam) {
      const team = teams.find(t => t.team_id === selectedTeam);
      onScopeChange('team', selectedTeam, team?.name || 'Team');
    } else if (scope === 'user' && selectedUser) {
      const selectedUserObj = users.find(u => u.id === selectedUser);
      onScopeChange('user', selectedUser, `${selectedUserObj?.first_name || ''} ${selectedUserObj?.last_name || ''}`.trim());
    }
  }, [scope, selectedBroker, selectedTeam, selectedUser]);

  const fetchBrokers = async () => {
    setLoading(true);
    try {
      const response = await apiInstance.get('/brokers');
      if (response.success) {
        setBrokers(response.data || []);
      }
    } catch (err) {
      setError('Failed to load brokers');
      console.error('Error fetching brokers:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async (brokerId) => {
    setLoading(true);
    try {
      const response = await apiInstance.get(`/brokers/${brokerId}/teams`);
      if (response.success) {
        setTeams(response.data || []);
      }
    } catch (err) {
      setError('Failed to load teams');
      console.error('Error fetching teams:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async (teamId) => {
    setLoading(true);
    try {
      const response = await apiInstance.get(`/teams/${teamId}/users`);
      if (response.success) {
        setUsers(response.data || []);
      }
    } catch (err) {
      setError('Failed to load users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleScopeChange = (newScope) => {
    setScope(newScope);
    // Reset downstream selections when changing scope
    if (newScope === 'brokerage') {
      setSelectedTeam('');
      setSelectedUser('');
    } else if (newScope === 'team') {
      setSelectedUser('');
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {error && (
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Scope Selector */}
      <FormControl fullWidth>
        <InputLabel>View Scope</InputLabel>
        <Select
          value={scope}
          onChange={(e) => handleScopeChange(e.target.value)}
          label="View Scope"
        >
          <MenuItem value="brokerage">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Business fontSize="small" />
              <Typography>Brokerage Level</Typography>
            </Box>
          </MenuItem>
          <MenuItem value="team">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Group fontSize="small" />
              <Typography>Team Level</Typography>
            </Box>
          </MenuItem>
          <MenuItem value="user">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Person fontSize="small" />
              <Typography>User Level</Typography>
            </Box>
          </MenuItem>
        </Select>
      </FormControl>

      {/* Broker Selector (system_admin only) */}
      {user?.role === 'system_admin' && (
        <FormControl fullWidth>
          <InputLabel>Broker</InputLabel>
          <Select
            value={selectedBroker}
            onChange={(e) => setSelectedBroker(e.target.value)}
            label="Broker"
            disabled={loading}
          >
            {brokers.map((broker) => (
              <MenuItem key={broker.id} value={broker.id}>
                {broker.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {/* Team Selector */}
      {(scope === 'team' || scope === 'user') && (
        <FormControl fullWidth>
          <InputLabel>Team</InputLabel>
          <Select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            label="Team"
            disabled={loading || !selectedBroker}
          >
            {teams.map((team) => (
              <MenuItem key={team.team_id} value={team.team_id}>
                {team.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {/* User Selector */}
      {scope === 'user' && (
        <FormControl fullWidth>
          <InputLabel>User</InputLabel>
          <Select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            label="User"
            disabled={loading || !selectedTeam}
          >
            {users.map((u) => (
              <MenuItem key={u.id} value={u.id}>
                {u.first_name} {u.last_name} ({u.email})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {/* Loading Indicator */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}

      {/* Current Selection Display */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
        <Typography variant="caption" color="text.secondary">
          Current View:
        </Typography>
        {scope === 'brokerage' && selectedBroker && (
          <Chip
            icon={<Business />}
            label={brokers.find(b => b.id === selectedBroker)?.name || 'Brokerage'}
            size="small"
            color="secondary"
          />
        )}
        {scope === 'team' && selectedTeam && (
          <Chip
            icon={<Group />}
            label={teams.find(t => t.team_id === selectedTeam)?.name || 'Team'}
            size="small"
            color="primary"
          />
        )}
        {scope === 'user' && selectedUser && (
          <Chip
            icon={<Person />}
            label={`${users.find(u => u.id === selectedUser)?.first_name || ''} ${users.find(u => u.id === selectedUser)?.last_name || ''}`.trim()}
            size="small"
            color="info"
          />
        )}
      </Box>
    </Box>
  );
};

export default AdminEntitySelector;
