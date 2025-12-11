import React from 'react';
import {
  Dialog,
  Box,
  Typography,
  IconButton,
  Button,
  Chip,
  Grid,
  alpha,
} from '@mui/material';
import {
  Close as CloseIcon,
  AutoAwesome as AutoAwesomeIcon,
  Psychology as PsychologyIcon,
  TrendingUp as TrendingUpIcon,
  Email as EmailIcon,
  Notifications as NotificationsIcon,
  Assessment as AssessmentIcon,
  Speed as SpeedIcon,
  Groups as GroupsIcon,
} from '@mui/icons-material';

/**
 * AIManagerModal - Fullscreen upsell modal for AI Lead Nurturing Manager
 *
 * Displays premium AI features for lead management:
 * - Intelligent Lead Scoring
 * - Automated Nurture Campaigns
 * - Smart Follow-up Reminders
 * - Conversion Predictions
 * - Engagement Analytics
 *
 * Color Theme: Green (#10b981) - representing growth and nurturing
 */
const AIManagerModal = ({ open, onClose }) => {
  const features = [
    {
      icon: <PsychologyIcon sx={{ fontSize: 32 }} />,
      title: 'Intelligent Lead Scoring',
      description: 'AI analyzes behavior patterns to automatically score and prioritize your leads',
    },
    {
      icon: <EmailIcon sx={{ fontSize: 32 }} />,
      title: 'Automated Nurture Campaigns',
      description: 'Personalized email sequences that adapt based on lead engagement and interests',
    },
    {
      icon: <NotificationsIcon sx={{ fontSize: 32 }} />,
      title: 'Smart Follow-up Reminders',
      description: 'Never miss an opportunity with AI-timed reminders based on optimal contact windows',
    },
    {
      icon: <TrendingUpIcon sx={{ fontSize: 32 }} />,
      title: 'Conversion Predictions',
      description: 'Machine learning predicts which leads are most likely to convert and when',
    },
    {
      icon: <AssessmentIcon sx={{ fontSize: 32 }} />,
      title: 'Engagement Analytics',
      description: 'Deep insights into lead behavior, preferences, and conversion pathways',
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 32 }} />,
      title: 'Response Time Optimization',
      description: 'AI suggests the best times to reach out for maximum response rates',
    },
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          background: 'linear-gradient(135deg, #047857 0%, #10b981 50%, #34d399 100%)',
          maxWidth: 700,
          maxHeight: '90vh',
          m: 2,
          borderRadius: 3,
        },
      }}
    >
      <Box
        sx={{
          minHeight: 400,
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'auto',
        }}
      >
        {/* Close Button */}
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 24,
            right: 24,
            color: '#fff',
            bgcolor: 'rgba(255,255,255,0.1)',
            '&:hover': {
              bgcolor: 'rgba(255,255,255,0.2)',
            },
          }}
        >
          <CloseIcon />
        </IconButton>

        {/* Main Content */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            px: 4,
            py: 8,
          }}
        >
          {/* Header */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              mb: 2,
            }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AutoAwesomeIcon sx={{ fontSize: 36, color: '#FFD700' }} />
            </Box>
            <Typography
              variant="h3"
              sx={{
                color: '#fff',
                fontWeight: 700,
                fontSize: { xs: '1.75rem', md: '2.5rem' },
              }}
            >
              AI Lead Nurturing Manager
            </Typography>
          </Box>

          <Chip
            label="Coming Soon"
            sx={{
              bgcolor: 'rgba(255,215,0,0.2)',
              color: '#FFD700',
              fontWeight: 600,
              fontSize: 14,
              mb: 3,
              px: 2,
            }}
          />

          <Typography
            variant="h6"
            sx={{
              color: 'rgba(255,255,255,0.9)',
              textAlign: 'center',
              maxWidth: 700,
              mb: 6,
              fontWeight: 400,
              lineHeight: 1.6,
            }}
          >
            Transform your lead management with AI-powered nurturing that automatically
            scores, engages, and converts leads while you focus on closing deals.
          </Typography>

          {/* Features Grid */}
          <Grid container spacing={3} sx={{ maxWidth: 1200 }}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Box
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    height: '100%',
                    transition: 'all 0.3s',
                    '&:hover': {
                      background: 'rgba(255,255,255,0.15)',
                      transform: 'translateY(-4px)',
                    },
                  }}
                >
                  <Box sx={{ color: '#fff', mb: 2 }}>{feature.icon}</Box>
                  <Typography
                    variant="h6"
                    sx={{ color: '#fff', fontWeight: 600, mb: 1 }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.6 }}
                  >
                    {feature.description}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>

          {/* Stats Preview */}
          <Box
            sx={{
              display: 'flex',
              gap: 4,
              mt: 6,
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h3" sx={{ color: '#fff', fontWeight: 700 }}>
                3x
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                Higher Conversion
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h3" sx={{ color: '#fff', fontWeight: 700 }}>
                70%
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                Time Saved
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h3" sx={{ color: '#fff', fontWeight: 700 }}>
                95%
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                Follow-up Rate
              </Typography>
            </Box>
          </Box>

          {/* CTA Button */}
          <Button
            variant="contained"
            size="large"
            startIcon={<GroupsIcon />}
            sx={{
              mt: 6,
              px: 6,
              py: 2,
              borderRadius: 3,
              fontSize: 18,
              fontWeight: 600,
              background: '#fff',
              color: '#047857',
              '&:hover': {
                background: 'rgba(255,255,255,0.9)',
                transform: 'scale(1.02)',
              },
            }}
          >
            Join the Waitlist
          </Button>

          <Typography
            variant="body2"
            sx={{
              color: 'rgba(255,255,255,0.6)',
              mt: 2,
            }}
          >
            Be the first to know when AI Lead Manager launches
          </Typography>
        </Box>
      </Box>
    </Dialog>
  );
};

export default AIManagerModal;
