import React from 'react';
import { Box, Typography, Paper, LinearProgress, Chip } from '@mui/material';
import { Assessment, TrendingUp } from '@mui/icons-material';

/**
 * QualificationWidget - Displays lead qualification score and status
 */
const QualificationWidget = ({ entity, data, computed, loading, onClick }) => {
  const lead = entity;

  if (loading) {
    return (
      <Paper sx={{ p: 3, minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography>Loading...</Typography>
      </Paper>
    );
  }

  const qualificationScore = lead?.qualification_score || computed?.qualification_score || 0;
  const leadSource = lead?.lead_source || 'Unknown';
  const leadQuality = lead?.lead_quality || 'unqualified';
  const budget = lead?.budget || 0;
  const timeline = lead?.timeline || 'Not specified';

  const getQualityColor = (quality) => {
    switch (quality?.toLowerCase()) {
      case 'hot': return 'error';
      case 'warm': return 'warning';
      case 'cold': return 'info';
      default: return 'default';
    }
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
        <Assessment sx={{ color: 'success.main' }} />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Qualification
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            Qualification Score
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {qualificationScore}%
            </Typography>
            <Box sx={{ flex: 1 }}>
              <LinearProgress
                variant="determinate"
                value={qualificationScore}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
          </Box>
        </Box>

        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            Lead Quality
          </Typography>
          <Chip
            label={leadQuality.toUpperCase()}
            color={getQualityColor(leadQuality)}
            size="small"
          />
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Source
            </Typography>
            <Typography variant="body1">
              {leadSource}
            </Typography>
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary">
              Timeline
            </Typography>
            <Typography variant="body1">
              {timeline}
            </Typography>
          </Box>
        </Box>

        {budget > 0 && (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              Budget
            </Typography>
            <Typography variant="h6">
              ${budget.toLocaleString()}
            </Typography>
          </Box>
        )}
      </Box>

      {onClick && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
          Click for detailed qualification metrics
        </Typography>
      )}
    </Paper>
  );
};

export default QualificationWidget;
