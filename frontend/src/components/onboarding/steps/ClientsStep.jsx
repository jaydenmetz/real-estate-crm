import React, { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Box, Container, Typography, Paper } from '@mui/material';
import { motion } from 'framer-motion';
import { Users, Home as HomeIcon, DollarSign } from 'lucide-react';
import TutorialNavigation from '../shared/TutorialNavigation';
import OnboardingService from '../../../services/onboarding.service';

const ClientsStep = () => {
  const navigate = useNavigate();
  const { loadProgress } = useOutletContext();
  const [sampleData, setSampleData] = useState(null);

  useEffect(() => {
    OnboardingService.getSampleData().then(data => setSampleData(data)).catch(console.error);
    OnboardingService.completeStep('clients').then(() => loadProgress()).catch(console.error);
  }, []);

  const handleNext = () => navigate('/onboarding/appointments');
  const client = sampleData?.client;
  const lead = sampleData?.lead;

  return (
    <Container maxWidth="md">
      <Box sx={{ minHeight: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column', justifyContent: 'center', py: 4 }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Typography variant="h3" sx={{ color: 'white', fontWeight: 700, textAlign: 'center', mb: 2 }}>
            The Relationships 🤝
          </Typography>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)', textAlign: 'center', mb: 4 }}>
            Connect the dots between sellers and buyers
          </Typography>
        </motion.div>

        <Box sx={{ display: 'flex', gap: 3, mb: 4 }}>
          <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }} style={{ flex: 1 }}>
            <Paper elevation={8} sx={{ p: 3, background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', borderRadius: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <HomeIcon size={32} color="#92400e" />
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#92400e' }}>Seller</Typography>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: '#78350f' }}>
                {client?.first_name} {client?.last_name}
              </Typography>
              <Box sx={{ color: '#92400e' }}>
                <Typography variant="body2">🏠 Property: $575K</Typography>
                <Typography variant="body2">⏰ Timeline: List in 2 weeks</Typography>
                <Typography variant="body2">📍 Relocation</Typography>
              </Box>
            </Paper>
          </motion.div>

          <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.4 }} style={{ flex: 1 }}>
            <Paper elevation={8} sx={{ p: 3, background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)', borderRadius: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <DollarSign size={32} color="#1e40af" />
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e40af' }}>Buyer</Typography>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: '#1e3a8a' }}>
                {lead?.first_name} {lead?.last_name}
              </Typography>
              <Box sx={{ color: '#1e40af' }}>
                <Typography variant="body2">💰 Pre-approved: $525K</Typography>
                <Typography variant="body2">⏰ Timeline: 30-60 days</Typography>
                <Typography variant="body2">🔥 Hot Lead</Typography>
              </Box>
            </Paper>
          </motion.div>
        </Box>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
          <Typography variant="h6" sx={{ color: 'white', textAlign: 'center', mt: 2 }}>
            Mark wants to sell for $575K. Sarah can buy up to $525K. Not a perfect match, but this is how deals happen - you connect the dots. But clients start as appointments...
          </Typography>
        </motion.div>

        <TutorialNavigation currentStep={3} nextStep="How Do I Get Clients?" onNext={handleNext} />
      </Box>
    </Container>
  );
};

export default ClientsStep;
