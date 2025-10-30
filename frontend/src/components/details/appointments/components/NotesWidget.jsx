import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { Description } from '@mui/icons-material';

/**
 * NotesWidget - Displays appointment notes and agenda
 */
const NotesWidget = ({ entity, data, computed, loading, onClick }) => {
  const appointment = entity;

  if (loading) {
    return (
      <Paper sx={{ p: 3, minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography>Loading...</Typography>
      </Paper>
    );
  }

  const notes = appointment?.notes || appointment?.description || 'No notes available';
  const agenda = appointment?.agenda || '';
  const noteCount = appointment?.note_count || 0;

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
        <Description sx={{ color: 'warning.main' }} />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Notes & Agenda
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {agenda && (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              Agenda
            </Typography>
            <Typography variant="body1">
              {agenda}
            </Typography>
          </Box>
        )}

        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            Notes
          </Typography>
          <Typography
            variant="body2"
            sx={{
              whiteSpace: 'pre-wrap',
              maxHeight: 150,
              overflow: 'auto',
              color: notes === 'No notes available' ? 'text.disabled' : 'text.primary'
            }}
          >
            {notes}
          </Typography>
        </Box>

        {noteCount > 0 && (
          <Typography variant="caption" color="text.secondary">
            {noteCount} note{noteCount !== 1 ? 's' : ''} total
          </Typography>
        )}
      </Box>

      {onClick && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
          Click to view/edit notes
        </Typography>
      )}
    </Paper>
  );
};

export default NotesWidget;
