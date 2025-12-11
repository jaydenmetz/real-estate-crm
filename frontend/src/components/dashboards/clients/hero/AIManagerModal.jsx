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
 * AIManagerModal - Fullscreen upsell modal for AI Client Manager
 *
 * Triggered when user clicks AIManagerTeaser or locked stats.
 * Features:
 * - Fullscreen dialog (like editor modals)
 * - Feature highlights for client management
 * - "Add to Waitlist" CTA button
 * - Purple theme matching clients
 */
const AIManagerModal = ({ open, onClose }) => {
  const features = [
    {
      title: 'Smart Lead Nurturing',
      description: 'AI-powered follow-up sequences that convert leads to clients automatically',
    },
    {
      title: 'Client Lifecycle Tracking',
      description: 'Monitor client journey from first contact through referral generation',
    },
    {
      title: 'Automated Birthday & Anniversary Reminders',
      description: 'Never miss an opportunity to strengthen client relationships',
    },
    {
      title: 'Intelligent Segmentation',
      description: 'Automatically group clients by behavior, value, and engagement level',
    },
    {
      title: 'Predictive Engagement Scoring',
      description: 'Know which clients are ready to transact or refer before they reach out',
    },
    {
      title: 'Multi-Channel Outreach',
      description: 'Coordinate email, SMS, and call campaigns from a single dashboard',
    },
  ];

  const handleWaitlist = () => {
    // TODO: Connect to waitlist API
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
          background: 'linear-gradient(135deg, #5b21b6 0%, #7c3aed 50%, #8b5cf6 100%)',
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
            AI Client Manager
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
            Transform your client relationships with intelligent automation.
            <br />
            Let AI handle nurturing while you focus on closing deals.
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
            Be among the first to experience AI-powered client management.
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
