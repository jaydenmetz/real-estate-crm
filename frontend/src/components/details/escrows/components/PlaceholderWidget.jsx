import React from 'react';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

// Full-width white card placeholder
const WhiteCard = styled(Box)(({ theme }) => ({
  backgroundColor: 'white',
  borderRadius: theme.spacing(2),
  border: '1px solid',
  borderColor: theme.palette.grey[200],
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
  padding: theme.spacing(4),
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 120,
  transition: 'all 0.2s',
  '&:hover': {
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
    borderColor: theme.palette.primary.light,
  },
}));

const IconBox = styled(Box)(({ theme }) => ({
  width: 48,
  height: 48,
  borderRadius: theme.spacing(2),
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(2),
  animation: 'float 3s ease-in-out infinite',
  '@keyframes float': {
    '0%, 100%': {
      transform: 'translateY(0px)',
    },
    '50%': {
      transform: 'translateY(-10px)',
    },
  },
}));

const PlaceholderWidget = () => {
  return (
    <WhiteCard
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
    >
      <IconBox>
        <Sparkles size={24} style={{ color: 'white' }} />
      </IconBox>
      <Typography variant="h6" fontWeight="700" color="text.primary" gutterBottom>
        Coming Soon
      </Typography>
      <Typography variant="body2" color="text.secondary" align="center">
        More widgets and features will be added here
      </Typography>
    </WhiteCard>
  );
};

export default PlaceholderWidget;
