import React, { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Box, Container, Typography, Paper, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import { CheckCircle, Clock } from 'lucide-react';
import CountUp from 'react-countup';
import TutorialNavigation from '../shared/TutorialNavigation';
import OnboardingService from '../../../services/onboarding.service';

const EscrowStep = () => {
  const navigate = useNavigate();
  const { loadProgress } = useOutletContext();
  const [sampleData, setSampleData] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Load sample data
    OnboardingService.getSampleData()
      .then(data => setSampleData(data))
      .catch(console.error);

    // Mark step complete
    OnboardingService.completeStep('escrow')
      .then(() => loadProgress())
      .catch(console.error);

    // Trigger confetti when commission reveals
    const timer = setTimeout(() => setShowConfetti(true), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleNext = () => {
    navigate('/onboarding/listings');
  };

  const escrow = sampleData?.escrow;
  const commission = 14550;
  const daysIn = 18;
  const daysToClose = 12;
  const totalDays = 30;
  const progressPercent = (daysIn / totalDays) * 100;

  const contingencies = [
    { name: 'Inspection', status: 'completed', date: '5 days ago' },
    { name: 'Loan', status: 'in_progress', date: '7 days left' },
    { name: 'Appraisal', status: 'completed', value: '$490,000' },
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography
            variant="h3"
            sx={{
              color: 'white',
              fontWeight: 700,
              textAlign: 'center',
              mb: 2,
            }}
          >
            The Payday 💰
          </Typography>

          <Typography
            variant="h6"
            sx={{
              color: 'rgba(255,255,255,0.9)',
              textAlign: 'center',
              mb: 4,
            }}
          >
            This is your first escrow - commission coming your way!
          </Typography>
        </motion.div>

        {/* Escrow Card */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Paper
            elevation={8}
            sx={{
              p: 4,
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
              borderRadius: 4,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Property Address */}
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, color: '#1a1a1a' }}>
              {escrow?.property_address || '321 Valley Road, Tehachapi, CA'}
            </Typography>

            {/* Commission Amount */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                Your Commission
              </Typography>
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5, type: 'spring', stiffness: 100 }}
              >
                <Typography
                  variant="h2"
                  sx={{
                    fontWeight: 700,
                    background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  $<CountUp end={commission} duration={1.5} separator="," />
                </Typography>
              </motion.div>
            </Box>

            {/* Progress Ring */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ color: '#666' }}>Progress</Typography>
                <Typography variant="body2" sx={{ color: '#10b981', fontWeight: 600 }}>
                  {daysIn} days in • {daysToClose} days to close
                </Typography>
              </Box>
              <Box sx={{
                width: '100%',
                height: 12,
                background: '#e5e7eb',
                borderRadius: 6,
                overflow: 'hidden',
              }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ delay: 0.8, duration: 1.2, ease: 'easeOut' }}
                  style={{
                    height: '100%',
                    background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
                  }}
                />
              </Box>
            </Box>

            {/* Contingencies */}
            <Box>
              <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
                Contingencies
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {contingencies.map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1 + index * 0.15 }}
                  >
                    <Chip
                      icon={item.status === 'completed' ? <CheckCircle size={16} /> : <Clock size={16} />}
                      label={`${item.name} ${item.status === 'completed' ? '✓' : '⏳'}`}
                      sx={{
                        backgroundColor: item.status === 'completed' ? '#d1fae5' : '#fef3c7',
                        color: item.status === 'completed' ? '#065f46' : '#92400e',
                        fontWeight: 600,
                        px: 1,
                      }}
                    />
                  </motion.div>
                ))}
              </Box>
            </Box>
          </Paper>
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
        >
          <Typography
            variant="h6"
            sx={{
              color: 'white',
              textAlign: 'center',
              mt: 4,
              fontWeight: 500,
            }}
          >
            But escrows don't create themselves... they come from listings and clients.
          </Typography>
        </motion.div>

        {/* Navigation */}
        <TutorialNavigation
          currentStep={1}
          nextStep="Where Do Escrows Come From?"
          onNext={handleNext}
        />
      </Box>
    </Container>
  );
};

export default EscrowStep;
