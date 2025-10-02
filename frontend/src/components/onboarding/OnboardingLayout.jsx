import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Box, LinearProgress, IconButton, Typography } from '@mui/material';
import { Close, Replay } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import OnboardingService from '../../services/onboarding.service';

const OnboardingLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  const steps = [
    { id: 'welcome', path: '/onboarding/welcome', label: 'Welcome' },
    { id: 'escrow', path: '/onboarding/escrow', label: 'Escrow' },
    { id: 'listings', path: '/onboarding/listings', label: 'Listings' },
    { id: 'clients', path: '/onboarding/clients', label: 'Clients' },
    { id: 'appointments', path: '/onboarding/appointments', label: 'Appointments' },
    { id: 'leads', path: '/onboarding/leads', label: 'Leads' },
    { id: 'marketplace', path: '/onboarding/marketplace', label: 'Marketplace' },
    { id: 'features', path: '/onboarding/features', label: 'Features' },
  ];

  const currentStepIndex = steps.findIndex(step => location.pathname === step.path);
  const progressPercentage = ((currentStepIndex + 1) / steps.length) * 100;

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const data = await OnboardingService.getProgress();
      setProgress(data);
    } catch (error) {
      console.error('Failed to load progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    try {
      await OnboardingService.skipTutorial();
      navigate('/');
    } catch (error) {
      console.error('Failed to skip tutorial:', error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LinearProgress sx={{ width: '50%' }} />
      </Box>
    );
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Progress Bar */}
      <Box sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(10px)',
      }}>
        <Box sx={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}>
          <Typography variant="body2" sx={{ color: '#667eea', fontWeight: 600, minWidth: '100px' }}>
            {currentStepIndex >= 0 ? `Step ${currentStepIndex + 1} of ${steps.length}` : 'Loading...'}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={progressPercentage}
            sx={{
              flex: 1,
              height: 8,
              borderRadius: 4,
              backgroundColor: '#e0e0e0',
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
                background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
              }
            }}
          />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              size="small"
              onClick={handleSkip}
              sx={{
                color: '#666',
                '&:hover': {
                  color: '#667eea',
                  backgroundColor: 'rgba(102, 126, 234, 0.1)',
                }
              }}
            >
              <Close />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Content Area */}
      <Box sx={{ pt: 10 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet context={{ progress, loadProgress, steps, currentStepIndex }} />
          </motion.div>
        </AnimatePresence>
      </Box>

      {/* Background Decoration */}
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.1,
        pointerEvents: 'none',
        background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.2) 0%, transparent 50%)',
      }} />
    </Box>
  );
};

export default OnboardingLayout;
