import React, { useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Box, Container, Typography, Paper } from '@mui/material';
import { motion } from 'framer-motion';
import { Globe, TrendingUp, DollarSign, Users } from 'lucide-react';
import CountUp from 'react-countup';
import TutorialNavigation from '../shared/TutorialNavigation';
import OnboardingService from '../../../services/onboarding.service';

const MarketplaceStep = () => {
  const navigate = useNavigate();
  const { loadProgress } = useOutletContext();

  useEffect(() => {
    OnboardingService.completeStep('marketplace').then(() => loadProgress()).catch(console.error);
  }, []);

  const handleNext = () => navigate('/onboarding/features');

  const roiSteps = [
    { icon: Users, label: '10 leads', value: 10 },
    { icon: TrendingUp, label: '2 appointments', value: 2 },
    { icon: DollarSign, label: '1 escrow', value: 1 },
    { icon: DollarSign, label: '$15,000', value: 15000, isCurrency: true },
  ];

  return (
    <Container maxWidth="md">
      <Box sx={{ minHeight: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column', justifyContent: 'center', py: 4 }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Typography variant="h3" sx={{ color: 'white', fontWeight: 700, textAlign: 'center', mb: 2 }}>
            The Growth 🌐
          </Typography>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)', textAlign: 'center', mb: 4 }}>
            Scale your business with the marketplace
          </Typography>
        </motion.div>

        {/* Featured Package */}
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }}>
          <Paper elevation={8} sx={{ p: 4, background: 'linear-gradient(135deg, #ffffff 0%, #f3e8ff 100%)', borderRadius: 4, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Globe size={40} color="#8b5cf6" />
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
                  Tehachapi Buyer Leads
                </Typography>
                <Typography variant="body1" sx={{ color: '#666' }}>
                  10 qualified leads per month
                </Typography>
              </Box>
            </Box>
            <Typography variant="h3" sx={{ fontWeight: 700, color: '#8b5cf6', mb: 2 }}>
              $299<Typography component="span" variant="body1" sx={{ color: '#666' }}>/month</Typography>
            </Typography>
          </Paper>
        </motion.div>

        {/* ROI Calculator */}
        <Paper elevation={8} sx={{ p: 4, background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)', borderRadius: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#065f46', mb: 3, textAlign: 'center' }}>
            ROI Calculator
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 3 }}>
            {roiSteps.map(({ icon: Icon, label, value, isCurrency }, index) => (
              <React.Fragment key={label}>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 + index * 0.2, type: 'spring' }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Box sx={{ width: 60, height: 60, borderRadius: '50%', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1, mx: 'auto' }}>
                      <Icon size={28} color="white" />
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#065f46' }}>
                      {isCurrency ? '$' : ''}<CountUp end={value} duration={1.5} separator="," delay={0.5 + index * 0.2} />
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#047857' }}>{label}</Typography>
                  </Box>
                </motion.div>
                {index < roiSteps.length - 1 && (
                  <Typography variant="h4" sx={{ color: '#065f46' }}>→</Typography>
                )}
              </React.Fragment>
            ))}
          </Box>
          <Typography variant="body1" sx={{ color: '#065f46', textAlign: 'center', fontWeight: 600 }}>
            Sarah Thompson came from a marketplace lead!
          </Typography>
        </Paper>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}>
          <Typography variant="h6" sx={{ color: 'white', textAlign: 'center', mt: 4 }}>
            You've seen the path: Leads → Appointments → Clients → Listings → Escrows → Paychecks. The marketplace brings you qualified leads so you can focus on closing.
          </Typography>
        </motion.div>

        <TutorialNavigation currentStep={6} nextStep="What Else Can I Do?" onNext={handleNext} />
      </Box>
    </Container>
  );
};

export default MarketplaceStep;
