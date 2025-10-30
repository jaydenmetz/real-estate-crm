import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { LocationOn, Map } from '@mui/icons-material';

/**
 * LocationWidget - Displays appointment location and travel information
 */
const LocationWidget = ({ entity, data, computed, loading, onClick }) => {
  const appointment = entity;

  if (loading) {
    return (
      <Paper sx={{ p: 3, minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography>Loading...</Typography>
      </Paper>
    );
  }

  const location = appointment?.location || 'No location specified';
  const address = appointment?.address || '';
  const travelTime = appointment?.travel_time || computed?.travel_time || 0;

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
        <LocationOn sx={{ color: 'error.main' }} />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Location
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            Appointment Location
          </Typography>
          <Typography variant="h6">
            {location}
          </Typography>
          {address && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {address}
            </Typography>
          )}
        </Box>

        {travelTime > 0 && (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              Estimated Travel Time
            </Typography>
            <Typography variant="h6">
              {travelTime} minutes
            </Typography>
          </Box>
        )}

        {address && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
            <Map sx={{ fontSize: '1rem', color: 'primary.main' }} />
            <Typography
              variant="body2"
              sx={{ color: 'primary.main', cursor: 'pointer' }}
              onClick={(e) => {
                e.stopPropagation();
                window.open(`https://maps.google.com/?q=${encodeURIComponent(address)}`, '_blank');
              }}
            >
              Open in Google Maps
            </Typography>
          </Box>
        )}
      </Box>

      {onClick && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
          Click for detailed location info
        </Typography>
      )}
    </Paper>
  );
};

export default LocationWidget;
