import React, { useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Box, Container, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { TrendingUp, Home, Users, Calendar, BarChart2, Globe } from 'lucide-react';
import TutorialNavigation from '../shared/TutorialNavigation';
import OnboardingService from '../../../services/onboarding.service';

const WelcomeStep = () => {
  const navigate = useNavigate();
  const { loadProgress } = useOutletContext();

  useEffect(() => {
    // Mark welcome as shown
    OnboardingService.completeStep('welcome')
      .then(() => loadProgress())
      .catch(console.error);
  }, []);

  const handleNext = () => {
    navigate('/onboarding/escrow');
  };

  const icons = [
    { Icon: TrendingUp, label: 'Escrow', delay: 0, color: '#10b981' },
    { Icon: Home, label: 'Listing', delay: 0.15, color: '#3b82f6' },
    { Icon: Users, label: 'Client', delay: 0.3, color: '#8b5cf6' },
    { Icon: Calendar, label: 'Appointment', delay: 0.45, color: '#f59e0b' },
    { Icon: BarChart2, label: 'Lead', delay: 0.6, color: '#ef4444' },
    { Icon: Globe, label: 'Marketplace', delay: 0.75, color: '#ec4899' },
  ];

  return (
    <Container maxWidth="md">
      <Box sx={{
        minHeight: 'calc(100vh - 120px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        py: 4,
      }}>
        {/* Hero Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Typography
            variant="h2"
            sx={{
              color: 'white',
              fontWeight: 700,
              textAlign: 'center',
              mb: 2,
              fontSize: { xs: '2rem', md: '3rem' },
            }}
          >
            Welcome to Your Real Estate Empire! 🎉
          </Typography>

          <Typography
            variant="h5"
            sx={{
              color: 'rgba(255,255,255,0.9)',
              textAlign: 'center',
              mb: 6,
              fontWeight: 400,
            }}
          >
            Every commission starts with a lead. Let me show you the path from first contact to closing day.
          </Typography>
        </motion.div>

        {/* Money Flow Animation */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: { xs: 1, md: 2 },
          flexWrap: 'wrap',
          mb: 6,
        }}>
          {icons.map(({ Icon, label, delay, color }, index) => (
            <React.Fragment key={label}>
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay, duration: 0.5, type: 'spring' }}
              >
                <Box sx={{
                  width: { xs: 60, md: 80 },
                  height: { xs: 60, md: 80 },
                  borderRadius: '16px',
                  background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 8px 32px ${color}40`,
                  gap: 0.5,
                }}>
                  <Icon size={28} color="white" />
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'white',
                      fontWeight: 600,
                      fontSize: { xs: '0.65rem', md: '0.75rem' },
                    }}
                  >
                    {label}
                  </Typography>
                </Box>
              </motion.div>
              {index < icons.length - 1 && (
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: delay + 0.3, duration: 0.3 }}
                >
                  <Box sx={{
                    width: { xs: 20, md: 40 },
                    height: 3,
                    background: 'rgba(255,255,255,0.4)',
                    borderRadius: 2,
                  }} />
                </motion.div>
              )}
            </React.Fragment>
          ))}
        </Box>

        {/* Subtitle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
        >
          <Typography
            variant="h6"
            sx={{
              color: 'white',
              textAlign: 'center',
              mb: 4,
              fontWeight: 500,
            }}
          >
            In the next 60 seconds, you'll see exactly how to turn leads into paychecks. Let's go! 🚀
          </Typography>
        </motion.div>

        {/* Navigation */}
        <TutorialNavigation
          currentStep={0}
          nextStep="Show Me How"
          onNext={handleNext}
          showBack={false}
        />
      </Box>
    </Container>
  );
};

export default WelcomeStep;
