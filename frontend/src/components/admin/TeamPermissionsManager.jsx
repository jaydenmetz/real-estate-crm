import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Tooltip,
  Button,
} from '@mui/material';
import {
  Save,
  Cancel,
  Edit,
  Delete as DeleteIcon,
  AdminPanelSettings,
  Visibility,
  MonetizationOn,
  GroupWork,
  Business as BusinessIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import apiInstance from '../../services/api.service';

/**
 * TeamPermissionsManager - Manage user permissions within a team
 *
 * Allows team_owner, broker, and system_admin to:
 * - View all team members and their permissions
 * - Grant/revoke permissions (can_delete, can_edit_team_data, etc.)
 * - Promote team members to admin roles
 *
 * Props:
 * - teamId: UUID of team to manage
 * - onPermissionsChanged: () => void (callback after changes)
 */
const TeamPermissionsManager = ({ teamId, onPermissionsChanged }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [teamMembers, setTeamMembers] = useState([]);
  const [editingUserId, setEditingUserId] = useState(null);
  const [editedPermissions, setEditedPermissions] = useState({});

  useEffect(() => {
    if (teamId) {
      fetchTeamMembers();
    }
  }, [teamId]);

  const fetchTeamMembers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiInstance.get(`/teams/${teamId}/members`);
      if (response.success) {
        setTeamMembers(response.data || []);
      } else {
        setError('Failed to load team members');
      }
    } catch (err) {
      setError('Error loading team members: ' + (err.response?.data?.error?.message || err.message));
      console.error('Error fetching team members:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditPermissions = (userId, currentPermissions) => {
    setEditingUserId(userId);
    setEditedPermissions(currentPermissions || {
      can_delete: false,
      can_edit_team_data: false,
      can_view_financials: true,
      can_manage_team: false,
      is_broker_admin: false,
      is_team_admin: false,
    });
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
    setEditedPermissions({});
  };

  const handlePermissionToggle = (permission) => {
    setEditedPermissions({
      ...editedPermissions,
      [permission]: !editedPermissions[permission],
    });
  };

  const handleSavePermissions = async (userId) => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const response = await apiInstance.put(`/teams/${teamId}/members/${userId}/permissions`, {
        permissions: editedPermissions,
      });

      if (response.success) {
        setSuccess('Permissions updated successfully');
        setEditingUserId(null);
        setEditedPermissions({});
        fetchTeamMembers();
        if (onPermissionsChanged) {
          onPermissionsChanged();
        }
      } else {
        setError('Failed to update permissions');
      }
    } catch (err) {
      setError('Error updating permissions: ' + (err.response?.data?.error?.message || err.message));
      console.error('Error saving permissions:', err);
    } finally {
      setSaving(false);
    }
  };

  const permissionColumns = [
    { key: 'can_delete', label: 'Delete', icon: <DeleteIcon />, tooltip: 'Can permanently delete records' },
    { key: 'can_edit_team_data', label: 'Edit Team Data', icon: <GroupWork />, tooltip: 'Can edit team-owned records' },
    { key: 'can_view_financials', label: 'View $', icon: <MonetizationOn />, tooltip: 'Can view commission and financial data' },
    { key: 'can_manage_team', label: 'Manage Team', icon: <AdminPanelSettings />, tooltip: 'Can manage team settings and members' },
    { key: 'is_team_admin', label: 'Team Admin', icon: <GroupWork />, tooltip: 'Full admin access within team' },
    { key: 'is_broker_admin', label: 'Broker Admin', icon: <BusinessIcon />, tooltip: 'Broker-level administrative access' },
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Role</TableCell>
              {permissionColumns.map((col) => (
                <TableCell key={col.key} align="center">
                  <Tooltip title={col.tooltip}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                      {col.icon}
                      <Typography variant="caption">{col.label}</Typography>
                    </Box>
                  </Tooltip>
                </TableCell>
              ))}
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {teamMembers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={permissionColumns.length + 3} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                    No team members found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              teamMembers.map((member) => {
                const isEditing = editingUserId === member.id;
                const permissions = isEditing ? editedPermissions : (member.permissions || {});

                return (
                  <TableRow key={member.id}>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {member.first_name} {member.last_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {member.email}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={member.role}
                        size="small"
                        color={
                          member.role === 'team_owner' ? 'secondary' :
                          member.role === 'broker' ? 'error' :
                          'default'
                        }
                      />
                    </TableCell>
                    {permissionColumns.map((col) => (
                      <TableCell key={col.key} align="center">
                        <Checkbox
                          checked={permissions[col.key] || false}
                          onChange={() => isEditing && handlePermissionToggle(col.key)}
                          disabled={!isEditing || member.role === 'broker' || member.role === 'system_admin'}
                        />
                      </TableCell>
                    ))}
                    <TableCell align="center">
                      {isEditing ? (
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <Tooltip title="Save">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleSavePermissions(member.id)}
                              disabled={saving}
                            >
                              {saving ? <CircularProgress size={20} /> : <Save />}
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Cancel">
                            <IconButton
                              size="small"
                              onClick={handleCancelEdit}
                              disabled={saving}
                            >
                              <Cancel />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      ) : (
                        <Tooltip title="Edit Permissions">
                          <IconButton
                            size="small"
                            onClick={() => handleEditPermissions(member.id, member.permissions)}
                            disabled={member.id === user?.id || member.role === 'broker' || member.role === 'system_admin'}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          size="small"
          onClick={fetchTeamMembers}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>
    </Box>
  );
};

export default TeamPermissionsManager;
