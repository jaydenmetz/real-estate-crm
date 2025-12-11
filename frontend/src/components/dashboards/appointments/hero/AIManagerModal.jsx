import React from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Button,
  IconButton,
  Stack,
  Chip,
  alpha,
  Divider,
} from '@mui/material';
import {
  Close as CloseIcon,
  AutoAwesome as AutoAwesomeIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';

/**
 * AIManagerModal - Fullscreen upsell modal for AI Appointment Manager
 *
 * Triggered when user clicks AIManagerTeaser or locked stats.
 * Features:
 * - Fullscreen dialog (like editor modals)
 * - Feature highlights
 * - "Add to Waitlist" CTA button
 * - Elegant design matching app theme
 */
const AIManagerModal = ({ open, onClose }) => {
  const features = [
    {
      title: 'Smart Scheduling',
      description: 'AI-powered scheduling that considers travel time, preferences, and availability',
    },
    {
      title: 'Automated Reminders',
      description: 'Send personalized reminders via text, email, or push notifications',
    },
    {
      title: 'No-Show Prevention',
      description: 'Predictive analytics to identify at-risk appointments and take proactive action',
    },
    {
      title: 'Calendar Optimization',
      description: 'Automatically suggest optimal time slots based on your productivity patterns',
    },
    {
      title: 'Client Preferences',
      description: 'Learn and remember client scheduling preferences for faster booking',
    },
    {
      title: 'Conflict Resolution',
      description: 'Intelligent rescheduling suggestions when conflicts arise',
    },
  ];

  const handleWaitlist = () => {
    // TODO: Connect to waitlist API
    console.log('Add to waitlist clicked');
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          background: 'linear-gradient(135deg, #0e7490 0%, #0891b2 50%, #06b6d4 100%)',
          maxWidth: 700,
          maxHeight: '90vh',
          m: 2,
          borderRadius: 3,
        },
      }}
    >
      {/* Close button */}
      <IconButton
        onClick={onClose}
        sx={{
          position: 'absolute',
          top: 24,
          right: 24,
          color: '#fff',
          zIndex: 1,
          '&:hover': {
            background: 'rgba(255,255,255,0.1)',
          },
        }}
      >
        <CloseIcon />
      </IconButton>

      <DialogContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 6,
          position: 'relative',
          overflow: 'auto',
        }}
      >
        {/* Hero Section */}
        <Box
          sx={{
            textAlign: 'center',
            maxWidth: 800,
            mb: 6,
          }}
        >
          {/* Crown Icon */}
          <Box
            sx={{
              width: 120,
              height: 120,
              borderRadius: '50%',
              background: (theme) => alpha(theme.palette.warning.main, 0.2),
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 4,
              border: '3px solid rgba(255,215,0,0.3)',
            }}
          >
            <AutoAwesomeIcon
              sx={{
                fontSize: 60,
                color: '#FFD700',
                filter: 'drop-shadow(0 4px 12px rgba(255,215,0,0.4))',
              }}
            />
          </Box>

          {/* Title */}
          <Typography
            variant="h2"
            sx={{
              color: '#fff',
              fontWeight: 700,
              mb: 2,
              fontSize: { xs: '2rem', md: '3rem' },
            }}
          >
            AI Appointment Manager
          </Typography>

          {/* Subtitle */}
          <Typography
            variant="h6"
            sx={{
              color: 'rgba(255,255,255,0.8)',
              fontWeight: 400,
              mb: 3,
              lineHeight: 1.6,
            }}
          >
            Automate your scheduling with intelligent AI assistance.
            <br />
            Let AI handle conflicts, reminders, and optimization.
          </Typography>

          {/* Beta badge */}
          <Chip
            label="Coming Soon"
            sx={{
              background: (theme) => alpha(theme.palette.warning.main, 0.2),
              color: '#FFD700',
              fontWeight: 600,
              border: '1px solid rgba(255,215,0,0.3)',
              px: 2,
            }}
          />
        </Box>

        <Divider
          sx={{
            width: '100%',
            maxWidth: 800,
            mb: 6,
            borderColor: 'rgba(255,255,255,0.1)',
          }}
        />

        {/* Features Grid */}
        <Box
          sx={{
            maxWidth: 900,
            width: '100%',
            mb: 6,
          }}
        >
          <Stack spacing={3}>
            {features.map((feature, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 2,
                  p: 3,
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: 2,
                  border: '1px solid rgba(255,255,255,0.1)',
                  transition: 'all 0.3s',
                  '&:hover': {
                    background: 'rgba(255,255,255,0.08)',
                    transform: 'translateX(8px)',
                  },
                }}
              >
                <CheckIcon
                  sx={{
                    color: '#4caf50',
                    fontSize: 28,
                    flexShrink: 0,
                    mt: 0.5,
                  }}
                />
                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      color: '#fff',
                      fontWeight: 600,
                      mb: 0.5,
                    }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'rgba(255,255,255,0.7)',
                      lineHeight: 1.6,
                    }}
                  >
                    {feature.description}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Stack>
        </Box>

        {/* CTA Section */}
        <Box
          sx={{
            textAlign: 'center',
            maxWidth: 600,
          }}
        >
          <Typography
            variant="body1"
            sx={{
              color: 'rgba(255,255,255,0.8)',
              mb: 3,
              lineHeight: 1.6,
            }}
          >
            Be among the first to experience AI-powered appointment management.
            <br />
            Join the waitlist to get early access and exclusive pricing.
          </Typography>

          <Button
            variant="contained"
            size="large"
            onClick={handleWaitlist}
            sx={{
              background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
              color: '#000',
              fontWeight: 700,
              fontSize: '1.1rem',
              px: 6,
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              boxShadow: '0 8px 24px rgba(255,215,0,0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #FFA500 0%, #FFD700 100%)',
                boxShadow: '0 12px 32px rgba(255,215,0,0.4)',
                transform: 'translateY(-2px)',
              },
            }}
          >
            Add Me to Waitlist
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default AIManagerModal;
