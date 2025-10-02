import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Box, LinearProgress, IconButton, Typography } from '@mui/material';
import { Close, Replay } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
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

  const goToNextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      navigate(steps[currentStepIndex + 1].path);
    }
  };

  const goToPreviousStep = () => {
    if (currentStepIndex > 0) {
      navigate(steps[currentStepIndex - 1].path);
    }
  };

  // Swipe gesture handlers for mobile
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => goToNextStep(),
    onSwipedRight: () => goToPreviousStep(),
    preventScrollOnSwipe: false,
    trackMouse: false, // Only track touch, not mouse
    delta: 50, // Minimum swipe distance (50px)
  });

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        goToNextStep();
      } else if (e.key === 'ArrowLeft') {
        goToPreviousStep();
      } else if (e.key === 'Escape') {
        handleSkip();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStepIndex]);

  if (loading) {
    return (
      <Box sx={{ width: '100%', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LinearProgress sx={{ width: '50%' }} />
      </Box>
    );
  }

  return (
    <Box
      {...swipeHandlers}
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
        overflow: 'hidden',
        touchAction: 'pan-y', // Allow vertical scrolling, enable horizontal swipes
      }}
      role="main"
      aria-label="Onboarding Tutorial"
    >
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
          padding: { xs: '12px 16px', sm: '16px 24px' },
          display: 'flex',
          alignItems: 'center',
          gap: { xs: 1, sm: 2 },
        }}>
          <Typography
            variant="body2"
            sx={{
              color: '#667eea',
              fontWeight: 600,
              minWidth: { xs: '60px', sm: '100px' },
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
            }}
          >
            {currentStepIndex >= 0 ? `Step ${currentStepIndex + 1} of ${steps.length}` : 'Loading...'}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={progressPercentage}
            sx={{
              flex: 1,
              height: { xs: 6, sm: 8 },
              borderRadius: 4,
              backgroundColor: '#e0e0e0',
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
                background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
              }
            }}
            aria-label={`Tutorial progress: ${Math.round(progressPercentage)}%`}
          />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              size="small"
              onClick={handleSkip}
              sx={{
                color: '#666',
                minWidth: '44px',
                minHeight: '44px',
                '&:hover': {
                  color: '#667eea',
                  backgroundColor: 'rgba(102, 126, 234, 0.1)',
                }
              }}
              aria-label="Skip tutorial (or press Escape)"
            >
              <Close />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Content Area */}
      <Box sx={{ pt: { xs: 8, sm: 10 } }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet context={{ progress, loadProgress, steps, currentStepIndex, goToNextStep, goToPreviousStep }} />
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

      {/* Mobile Swipe Hint (only show on first step, mobile only) */}
      {currentStepIndex === 0 && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            display: { xs: 'block', md: 'none' },
            zIndex: 1000,
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2, duration: 0.5 }}
          >
            <Typography
              variant="caption"
              sx={{
                color: 'rgba(255,255,255,0.9)',
                background: 'rgba(0,0,0,0.3)',
                padding: '8px 16px',
                borderRadius: '20px',
                backdropFilter: 'blur(10px)',
              }}
            >
              Swipe left/right or use arrow keys
            </Typography>
          </motion.div>
        </Box>
      )}
    </Box>
  );
};

export default OnboardingLayout;
