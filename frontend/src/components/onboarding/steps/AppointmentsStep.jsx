import React, { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Box, Container, Typography, Paper, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import { Calendar, MapPin, CheckSquare } from 'lucide-react';
import TutorialNavigation from '../shared/TutorialNavigation';
import OnboardingService from '../../../services/onboarding.service';

const AppointmentsStep = () => {
  const navigate = useNavigate();
  const { loadProgress } = useOutletContext();
  const [sampleData, setSampleData] = useState(null);

  useEffect(() => {
    OnboardingService.getSampleData().then(data => setSampleData(data)).catch(console.error);
    OnboardingService.completeStep('appointments').then(() => loadProgress()).catch(console.error);
  }, []);

  const handleNext = () => navigate('/onboarding/leads');
  const appointment = sampleData?.appointment;

  return (
    <Container maxWidth="md">
      <Box sx={{ minHeight: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column', justifyContent: 'center', py: 4 }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Typography variant="h3" sx={{ color: 'white', fontWeight: 700, textAlign: 'center', mb: 2 }}>
            The Pipeline 📅
          </Typography>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)', textAlign: 'center', mb: 4 }}>
            Tomorrow at 2 PM - your showing with Sarah
          </Typography>
        </motion.div>

        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }}>
          <Paper elevation={8} sx={{ p: 4, background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)', borderRadius: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Calendar size={40} color="#f59e0b" />
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
                  {appointment?.title || 'Property Showing - Sarah Thompson'}
                </Typography>
                <Typography variant="body1" sx={{ color: '#666' }}>
                  Tomorrow at 2:00 PM • 1 hour
                </Typography>
              </Box>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <MapPin size={20} color="#3b82f6" />
                <Typography variant="body1" sx={{ color: '#1a1a1a' }}>
                  {appointment?.location || '456 Pine Avenue, Tehachapi, CA 93561'}
                </Typography>
              </Box>
            </Box>

            <Box>
              <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>Preparation Checklist</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {['Showing sheets prepared', 'CMA completed', 'Follow-up scheduled'].map((item, index) => (
                  <motion.div key={item} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + index * 0.15 }}>
                    <Chip icon={<CheckSquare size={16} />} label={item} sx={{ backgroundColor: '#d1fae5', color: '#065f46', fontWeight: 600, justifyContent: 'flex-start', width: '100%' }} />
                  </motion.div>
                ))}
              </Box>
            </Box>
          </Paper>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
          <Typography variant="h6" sx={{ color: 'white', textAlign: 'center', mt: 4 }}>
            Tomorrow at 2 PM, you're showing properties to Sarah. One showing could become a client. One client could become a commission. But appointments come from leads...
          </Typography>
        </motion.div>

        <TutorialNavigation currentStep={4} nextStep="Where Do Appointments Come From?" onNext={handleNext} />
      </Box>
    </Container>
  );
};

export default AppointmentsStep;
