import React, { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Box, Container, Typography, Paper } from '@mui/material';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, Flame } from 'lucide-react';
import TutorialNavigation from '../inputs/TutorialNavigation';
import OnboardingService from '../../../services/onboarding.service';

const LeadsStep = () => {
  const navigate = useNavigate();
  const { loadProgress } = useOutletContext();
  const [sampleData, setSampleData] = useState(null);

  useEffect(() => {
    OnboardingService.getSampleData().then(data => setSampleData(data)).catch(console.error);
    OnboardingService.completeStep('leads').then(() => loadProgress()).catch(console.error);
  }, []);

  const handleNext = () => navigate('/onboarding/marketplace');
  const lead = sampleData?.lead;

  const stages = [
    { label: 'New', count: 3, color: '#6b7280' },
    { label: 'Contacted', count: 2, color: '#3b82f6' },
    { label: 'Hot', count: 1, color: '#ef4444' },
    { label: 'Won', count: 0, color: '#10b981' },
  ];

  return (
    <Container maxWidth="md">
      <Box sx={{ minHeight: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column', justifyContent: 'center', py: 4 }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Typography variant="h3" sx={{ color: 'white', fontWeight: 700, textAlign: 'center', mb: 2 }}>
            The Engine 🚀
          </Typography>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)', textAlign: 'center', mb: 4 }}>
            Sarah started as a lead from your open house
          </Typography>
        </motion.div>

        {/* Lead Pipeline */}
        <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
          {stages.map((stage, index) => (
            <motion.div key={stage.label} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: index * 0.15 }} style={{ flex: 1 }}>
              <Paper elevation={4} sx={{ p: 2, textAlign: 'center', background: stage.color, color: 'white' }}>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>{stage.count}</Typography>
                <Typography variant="body2">{stage.label}</Typography>
              </Paper>
            </motion.div>
          ))}
        </Box>

        {/* Sarah's Card */}
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.6 }}>
          <Paper elevation={8} sx={{ p: 4, background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)', borderRadius: 4, border: '2px solid #ef4444' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Flame size={40} color="#dc2626" />
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#7f1d1d' }}>
                  {lead?.first_name} {lead?.last_name}
                </Typography>
                <Typography variant="body2" sx={{ color: '#991b1b' }}>Hot Lead 🔥</Typography>
              </Box>
            </Box>
            <Box sx={{ color: '#7f1d1d' }}>
              <Typography variant="body1">📍 Source: {lead?.source || 'Open House - 123 Oak Street'}</Typography>
              <Typography variant="body1">💰 Budget: $450-525K</Typography>
              <Typography variant="body1">📅 Next: Property Showing Tomorrow</Typography>
            </Box>
          </Paper>
        </motion.div>

        {/* Flow Visualization */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>
          <Box sx={{ mt: 3, p: 2, background: 'rgba(255,255,255,0.1)', borderRadius: 2, backdropFilter: 'blur(10px)' }}>
            <Typography variant="body1" sx={{ color: 'white', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              Lead → Appointment → Client → Escrow → <DollarSign size={20} /><strong>$14,550</strong>
            </Typography>
          </Box>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}>
          <Typography variant="h6" sx={{ color: 'white', textAlign: 'center', mt: 3 }}>
            Sarah started as a lead from your open house. Now she's hot, has an appointment tomorrow, and could close in 45 days. Every lead is a potential payday - you just need more of them.
          </Typography>
        </motion.div>

        <TutorialNavigation currentStep={5} nextStep="How Do I Get More Leads?" onNext={handleNext} />
      </Box>
    </Container>
  );
};

export default LeadsStep;
