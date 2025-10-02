import React, { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Box, Container, Typography, Paper, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import { Home, Eye, DollarSign } from 'lucide-react';
import TutorialNavigation from '../shared/TutorialNavigation';
import OnboardingService from '../../../services/onboarding.service';

const ListingsStep = () => {
  const navigate = useNavigate();
  const { loadProgress } = useOutletContext();
  const [sampleData, setSampleData] = useState(null);

  useEffect(() => {
    OnboardingService.getSampleData().then(data => setSampleData(data)).catch(console.error);
    OnboardingService.completeStep('listings').then(() => loadProgress()).catch(console.error);
  }, []);

  const handleNext = () => navigate('/onboarding/clients');
  const listing = sampleData?.listing;

  return (
    <Container maxWidth="md">
      <Box sx={{ minHeight: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column', justifyContent: 'center', py: 4 }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Typography variant="h3" sx={{ color: 'white', fontWeight: 700, textAlign: 'center', mb: 2 }}>
            The Inventory 🏠
          </Typography>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)', textAlign: 'center', mb: 4 }}>
            Every listing is a money-making opportunity
          </Typography>
        </motion.div>

        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }}>
          <Paper elevation={8} sx={{ p: 4, background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)', borderRadius: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Home size={40} color="#3b82f6" />
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
                  {listing?.property_address || '789 Mountain View Drive'}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  {listing?.city || 'Tehachapi'}, CA
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#10b981' }}>
                  ${listing?.list_price?.toLocaleString() || '599,000'}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666' }}>List Price</Typography>
              </Box>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#3b82f6' }}>
                  {listing?.bedrooms || 4}BD | {listing?.bathrooms || 3}BA
                </Typography>
                <Typography variant="body2" sx={{ color: '#666' }}>{listing?.square_feet?.toLocaleString() || '2,450'} sqft</Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Chip icon={<Eye size={16} />} label="12 Showings Scheduled" sx={{ backgroundColor: '#dbeafe', color: '#1e40af', fontWeight: 600 }} />
              <Chip icon={<DollarSign size={16} />} label="3 Offers Expected" sx={{ backgroundColor: '#d1fae5', color: '#065f46', fontWeight: 600 }} />
              <Chip label="5 Days Active" sx={{ backgroundColor: '#fef3c7', color: '#92400e', fontWeight: 600 }} />
            </Box>
          </Paper>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
          <Typography variant="h6" sx={{ color: 'white', textAlign: 'center', mt: 4 }}>
            This listing has 12 showings scheduled - any could be your next buyer. But listings come from clients...
          </Typography>
        </motion.div>

        <TutorialNavigation currentStep={2} nextStep="Show Me Clients" onNext={handleNext} />
      </Box>
    </Container>
  );
};

export default ListingsStep;
