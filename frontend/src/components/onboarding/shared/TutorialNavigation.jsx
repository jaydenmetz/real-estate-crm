import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button } from '@mui/material';
import { ArrowBack, ArrowForward } from '@mui/icons-material';
import { motion } from 'framer-motion';

const TutorialNavigation = ({ currentStep, nextStep, onNext, showBack = true }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (currentStep > 0) {
      const steps = ['welcome', 'escrow', 'listings', 'clients', 'appointments', 'leads', 'marketplace', 'features'];
      navigate(`/onboarding/${steps[currentStep - 1]}`);
    }
  };

  return (
    <Box sx={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      mt: 4,
      gap: 2,
      px: { xs: 2, sm: 0 },
    }}>
      {showBack && currentStep > 0 ? (
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={handleBack}
            sx={{
              color: 'white',
              borderColor: 'rgba(255,255,255,0.3)',
              minHeight: '44px',
              minWidth: '44px',
              px: { xs: 2, sm: 3 },
              py: { xs: 1.5, sm: 1 },
              fontSize: { xs: '0.9rem', sm: '1rem' },
              '&:hover': {
                borderColor: 'rgba(255,255,255,0.6)',
                backgroundColor: 'rgba(255,255,255,0.1)',
              }
            }}
            aria-label="Go back to previous step (or swipe right, press left arrow)"
          >
            Back
          </Button>
        </motion.div>
      ) : <Box />}

      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={{
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatDelay: 1,
        }}
      >
        <Button
          variant="contained"
          endIcon={<ArrowForward />}
          onClick={onNext}
          sx={{
            background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
            color: 'white',
            minHeight: '44px',
            minWidth: '44px',
            px: { xs: 3, sm: 4 },
            py: { xs: 1.5, sm: 1.5 },
            fontSize: { xs: '1rem', sm: '1.1rem' },
            fontWeight: 600,
            boxShadow: '0 4px 20px rgba(16, 185, 129, 0.4)',
            '&:hover': {
              background: 'linear-gradient(90deg, #059669 0%, #047857 100%)',
              boxShadow: '0 6px 25px rgba(16, 185, 129, 0.5)',
            }
          }}
          aria-label={`Continue to ${nextStep || 'next step'} (or swipe left, press right arrow)`}
        >
          {nextStep || 'Continue'}
        </Button>
      </motion.div>
    </Box>
  );
};

export default TutorialNavigation;
