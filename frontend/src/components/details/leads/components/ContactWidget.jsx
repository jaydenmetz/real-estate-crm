import React from 'react';
import { Box, Typography, Paper, Chip } from '@mui/material';
import { Phone, Email, LocationOn } from '@mui/icons-material';

/**
 * ContactWidget - Displays lead contact information
 */
const ContactWidget = ({ entity, data, computed, loading, onClick }) => {
  const lead = entity;

  if (loading) {
    return (
      <Paper sx={{ p: 3, minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography>Loading...</Typography>
      </Paper>
    );
  }

  const phone = lead?.phone || 'No phone';
  const email = lead?.email || 'No email';
  const address = lead?.address || lead?.location || '';
  const preferredContact = lead?.preferred_contact_method || 'email';

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
        <Phone sx={{ color: 'primary.main' }} />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Contact Information
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            Phone
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Phone sx={{ fontSize: '1rem', color: 'text.secondary' }} />
            <Typography variant="body1">
              {phone}
            </Typography>
          </Box>
        </Box>

        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            Email
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Email sx={{ fontSize: '1rem', color: 'text.secondary' }} />
            <Typography variant="body1">
              {email}
            </Typography>
          </Box>
        </Box>

        {address && (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              Location
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationOn sx={{ fontSize: '1rem', color: 'text.secondary' }} />
              <Typography variant="body1">
                {address}
              </Typography>
            </Box>
          </Box>
        )}

        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            Preferred Contact Method
          </Typography>
          <Chip
            label={preferredContact.toUpperCase()}
            size="small"
            color="primary"
            variant="outlined"
          />
        </Box>
      </Box>

      {onClick && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
          Click for detailed contact info
        </Typography>
      )}
    </Paper>
  );
};

export default ContactWidget;
