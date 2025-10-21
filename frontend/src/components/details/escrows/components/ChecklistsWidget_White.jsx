import React from 'react';
import { Box, Typography, LinearProgress, Skeleton } from '@mui/material';
import { styled } from '@mui/material/styles';
import { FileText } from 'lucide-react';
import { motion } from 'framer-motion';

// White card with orange icon badge (matched to People widget height)
const WhiteCard = styled(Box)(({ theme }) => ({
  backgroundColor: 'white',
  borderRadius: theme.spacing(2),
  border: '1px solid',
  borderColor: theme.palette.grey[200],
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
  padding: theme.spacing(3),
  minHeight: 380, // Matched to People widget
  maxHeight: 450,
  display: 'flex',
  flexDirection: 'column',
  cursor: 'pointer',
  transition: 'all 0.2s',
  '&:hover': {
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
    transform: 'translateY(-2px)',
  },
}));

const IconBadge = styled(Box)(({ theme }) => ({
  width: 32,
  height: 32,
  borderRadius: theme.spacing(1.5),
  background: 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
}));

const CategoryRow = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2.5),
  '&:last-of-type': {
    marginBottom: 0,
  },
}));

const ProgressBar = styled(LinearProgress)(({ value }) => ({
  height: 8,
  borderRadius: 4,
  backgroundColor: '#e5e7eb',
  '& .MuiLinearProgress-bar': {
    borderRadius: 4,
    background:
      value === 100
        ? 'linear-gradient(90deg, #10b981 0%, #34d399 100%)'
        : value >= 50
        ? 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)'
        : 'linear-gradient(90deg, #ef4444 0%, #f87171 100%)',
  },
}));

const Checkboxes = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(0.5),
  marginTop: theme.spacing(1),
}));

const Checkbox = styled(Box)(({ checked, theme }) => ({
  flex: 1,
  height: 4,
  borderRadius: 2,
  backgroundColor: checked ? theme.palette.success.main : theme.palette.grey[200],
  transition: 'background-color 0.2s',
}));

const getColorForCategory = (name) => {
  const colors = {
    'Loan Progress': { bg: '#3b82f6', text: '#1e40af' },
    'Property Tasks': { bg: '#8b5cf6', text: '#6d28d9' },
    'Administrative': { bg: '#f97316', text: '#c2410c' },
  };
  return colors[name] || { bg: '#9e9e9e', text: '#666' };
};

const ChecklistsWidget_White = ({ escrow, loading, onClick }) => {
  if (loading) {
    return (
      <WhiteCard>
        <Skeleton width="60%" height={28} sx={{ mb: 3 }} />
        {[1, 2, 3].map((i) => (
          <Box key={i} sx={{ mb: 2.5 }}>
            <Skeleton width="80%" height={16} sx={{ mb: 1 }} />
            <Skeleton width="100%" height={8} sx={{ borderRadius: 1 }} />
          </Box>
        ))}
      </WhiteCard>
    );
  }

  // Get checklists from JSONB structure
  const checklists = escrow?.checklists || {};

  const categories = [
    {
      name: 'Loan Progress',
      items: checklists.loan || {},
      total: 9,
    },
    {
      name: 'Property Tasks',
      items: checklists.house || {},
      total: 9,
    },
    {
      name: 'Administrative',
      items: checklists.admin || {},
      total: 5,
    },
  ];

  // Calculate overall progress
  let totalItems = 0;
  let completedItems = 0;

  categories.forEach(cat => {
    const items = Object.values(cat.items);
    totalItems += items.length;
    completedItems += items.filter(Boolean).length;
  });

  const overallProgress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return (
    <WhiteCard
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.25 }}
      onClick={onClick}
    >
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <IconBadge>
            <FileText size={18} style={{ color: 'white' }} />
          </IconBadge>
          <Typography variant="subtitle1" fontWeight="700" color="text.primary">
            Checklists
          </Typography>
        </Box>
        <Box
          sx={{
            backgroundColor: '#FFF7ED',
            color: '#ea580c',
            padding: '4px 12px',
            borderRadius: 2,
            fontSize: '0.75rem',
            fontWeight: 700,
          }}
        >
          {overallProgress}% complete
        </Box>
      </Box>

      {/* Categories */}
      <Box flex={1}>
        {categories.map((cat, idx) => {
          const items = Object.values(cat.items);
          const completed = items.filter(Boolean).length;
          const total = items.length;
          const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
          const colors = getColorForCategory(cat.name);

          return (
            <CategoryRow key={idx}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1} gap={2}>
                <Typography
                  variant="body2"
                  fontWeight="600"
                  color="text.primary"
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  {cat.name}
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="caption" fontWeight="700" sx={{ color: colors.text }}>
                    {completed}/{total}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ({percentage}%)
                  </Typography>
                </Box>
              </Box>
              <ProgressBar variant="determinate" value={percentage} />
              <Checkboxes>
                {Array.from({ length: total }).map((_, i) => (
                  <Checkbox key={i} checked={i < completed} />
                ))}
              </Checkboxes>
            </CategoryRow>
          );
        })}
      </Box>

      {/* Footer */}
      <Box
        mt={2}
        pt={2}
        borderTop={1}
        borderColor="divider"
        textAlign="center"
      >
        <Typography variant="caption" color="text.secondary" sx={{ '&:hover': { color: 'warning.main' } }}>
          Click to view full checklist →
        </Typography>
      </Box>
    </WhiteCard>
  );
};

export default ChecklistsWidget_White;
