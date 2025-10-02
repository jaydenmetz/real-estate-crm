import React, { useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Box, Container, Typography, Paper, Button } from '@mui/material';
import { motion } from 'framer-motion';
import { Home, TrendingUp, Users, Bell, FileText, Smartphone, CheckCircle } from 'lucide-react';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import OnboardingService from '../../../services/onboarding.service';

const FeaturesStep = () => {
  const navigate = useNavigate();
  const { width, height } = useWindowSize();
  const { loadProgress } = useOutletContext();
  const [showConfetti, setShowConfetti] = React.useState(false);

  useEffect(() => {
    OnboardingService.completeStep('features').then(() => loadProgress()).catch(console.error);
    setTimeout(() => setShowConfetti(true), 500);
  }, []);

  const handleComplete = async () => {
    navigate('/?welcome=true');
  };

  const features = [
    { Icon: Home, label: 'Track Open Houses', color: '#3b82f6' },
    { Icon: TrendingUp, label: 'Analyze Lead Sources', color: '#10b981' },
    { Icon: Users, label: 'Team Collaboration', color: '#8b5cf6' },
    { Icon: Smartphone, label: 'Mobile App', color: '#f59e0b' },
    { Icon: Bell, label: 'Smart Notifications', color: '#ef4444' },
    { Icon: FileText, label: 'Document Automation', color: '#06b6d4' },
  ];

  return (
    <Container maxWidth="md">
      {showConfetti && <Confetti width={width} height={height} recycle={false} numberOfPieces={500} />}

      <Box sx={{ minHeight: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column', justifyContent: 'center', py: 4 }}>
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring' }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <CheckCircle size={80} color="#10b981" />
            <Typography variant="h3" sx={{ color: 'white', fontWeight: 700, mt: 2, mb: 1 }}>
              You're All Set! 🎉
            </Typography>
            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)' }}>
              This is just the beginning
            </Typography>
          </Box>
        </motion.div>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2, mb: 4 }}>
          {features.map(({ Icon, label, color }, index) => (
            <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
              <Paper elevation={4} sx={{ p: 3, textAlign: 'center', background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`, border: `2px solid ${color}30`, borderRadius: 3, '&:hover': { transform: 'translateY(-4px)', boxShadow: 8, transition: 'all 0.3s' } }}>
                <Icon size={40} color={color} style={{ marginBottom: 8 }} />
                <Typography variant="body1" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
                  {label}
                </Typography>
              </Paper>
            </motion.div>
          ))}
        </Box>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
          <Typography variant="h6" sx={{ color: 'white', textAlign: 'center', mb: 3 }}>
            Explore at your own pace - you've got this.
          </Typography>
        </motion.div>

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button variant="contained" size="large" onClick={handleComplete} sx={{ background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)', color: 'white', px: 6, py: 2, fontSize: '1.1rem', fontWeight: 700, boxShadow: '0 4px 20px rgba(16, 185, 129, 0.4)' }}>
              Go to Dashboard
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button variant="outlined" size="large" onClick={() => navigate('/onboarding/welcome')} sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)', px: 4, py: 2 }}>
              Replay Tutorial
            </Button>
          </motion.div>
        </Box>
      </Box>
    </Container>
  );
};

export default FeaturesStep;
