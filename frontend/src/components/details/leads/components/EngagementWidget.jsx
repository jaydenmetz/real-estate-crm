import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { Timeline, Chat, Visibility } from '@mui/icons-material';

/**
 * EngagementWidget - Displays lead engagement metrics and activity
 */
const EngagementWidget = ({ entity, data, computed, loading, onClick }) => {
  const lead = entity;

  if (loading) {
    return (
      <Paper sx={{ p: 3, minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography>Loading...</Typography>
      </Paper>
    );
  }

  const interactions = lead?.interaction_count || lead?.interactions || 0;
  const lastContact = lead?.last_contact_date || lead?.last_contacted;
  const emailOpens = lead?.email_opens || 0;
  const linkClicks = lead?.link_clicks || 0;
  const engagementScore = computed?.engagement_score || 0;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

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
        <Timeline sx={{ color: 'info.main' }} />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Engagement
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            Last Contact
          </Typography>
          <Typography variant="h6">
            {formatDate(lastContact)}
          </Typography>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              <Chat sx={{ fontSize: '1rem', verticalAlign: 'middle', mr: 0.5 }} />
              Interactions
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {interactions}
            </Typography>
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary">
              <Visibility sx={{ fontSize: '1rem', verticalAlign: 'middle', mr: 0.5 }} />
              Email Opens
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {emailOpens}
            </Typography>
          </Box>
        </Box>

        {linkClicks > 0 && (
          <Box>
            <Typography variant="body2" color="text.secondary">
              Link Clicks
            </Typography>
            <Typography variant="h6">
              {linkClicks}
            </Typography>
          </Box>
        )}

        {engagementScore > 0 && (
          <Box>
            <Typography variant="body2" color="text.secondary">
              Engagement Score
            </Typography>
            <Typography variant="h6" sx={{ color: 'success.main' }}>
              {engagementScore}/100
            </Typography>
          </Box>
        )}
      </Box>

      {onClick && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
          Click for full engagement history
        </Typography>
      )}
    </Paper>
  );
};

export default EngagementWidget;
