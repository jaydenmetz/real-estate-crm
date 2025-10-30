import React from 'react';
import { Box, Typography, Paper, Avatar, AvatarGroup, Chip } from '@mui/material';
import { People, Person } from '@mui/icons-material';

/**
 * ParticipantsWidget - Displays appointment participants and attendees
 */
const ParticipantsWidget = ({ entity, data, computed, loading, onClick }) => {
  const appointment = entity;

  if (loading) {
    return (
      <Paper sx={{ p: 3, minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography>Loading...</Typography>
      </Paper>
    );
  }

  const participants = appointment?.participants || [];
  const attendees = appointment?.attendees || [];
  const clientName = appointment?.client_name || 'No client assigned';
  const agentName = appointment?.agent_name || 'Unassigned';

  return (
    <Paper
      sx={{
        p: 3,
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick ? { boxShadow: 6 } : {},
        transition: 'box-shadow 0.2s'
      }}
      onClick={onClick}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <People sx={{ color: 'info.main' }} />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Participants
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Client
          </Typography>
          <Chip
            icon={<Person />}
            label={clientName}
            color="primary"
            variant="outlined"
          />
        </Box>

        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Agent
          </Typography>
          <Chip
            icon={<Person />}
            label={agentName}
            color="secondary"
            variant="outlined"
          />
        </Box>

        {participants.length > 0 && (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Additional Participants ({participants.length})
            </Typography>
            <AvatarGroup max={4}>
              {participants.map((participant, idx) => (
                <Avatar key={idx} alt={participant.name}>
                  {participant.name?.charAt(0).toUpperCase()}
                </Avatar>
              ))}
            </AvatarGroup>
          </Box>
        )}

        {attendees.length > 0 && (
          <Box>
            <Typography variant="body2" color="text.secondary">
              Total Attendees: {attendees.length + 2}
            </Typography>
          </Box>
        )}
      </Box>

      {onClick && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
          Click for participant details
        </Typography>
      )}
    </Paper>
  );
};

export default ParticipantsWidget;
