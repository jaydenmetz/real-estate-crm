import React from 'react';
import {
  Box,
  Card,
  Typography,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Skeleton
} from '@mui/material';
import {
  Description,
  CheckCircle,
  Warning,
  Error,
  ExpandMore
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';

const CompactCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  padding: theme.spacing(2),
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
  background: 'white',
  height: '100%',
  maxHeight: 400,
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
    transform: 'translateY(-2px)'
  }
}));

const DocumentRow = styled(ListItem)(({ theme }) => ({
  padding: theme.spacing(0.75, 0),
  minHeight: 'auto'
}));

const ProgressBar = styled(LinearProgress)(({ theme }) => ({
  height: 6,
  borderRadius: 3,
  backgroundColor: theme.palette.grey[200],
  '& .MuiLinearProgress-bar': {
    borderRadius: 3,
    background: 'linear-gradient(90deg, #4A90E2 0%, #5B9FED 100%)'
  }
}));

const DocumentsWidget = ({ escrow, loading, onClick }) => {
  // Extract documents data (supports both formats)
  const documents = escrow?.documents || [];

  // Group documents by category
  const categoryCounts = {
    'Purchase Agreement': { uploaded: 0, total: 5 },
    'Disclosures': { uploaded: 0, total: 8 },
    'Inspection Reports': { uploaded: 0, total: 4 },
    'Loan Documents': { uploaded: 0, total: 10 },
    'Closing Documents': { uploaded: 0, total: 6 }
  };

  documents.forEach(doc => {
    const category = doc.category || 'Uncategorized';
    if (categoryCounts[category]) {
      categoryCounts[category].uploaded++;
    }
  });

  const categories = [
    { id: 1, name: 'Purchase Agreement', icon: '📄', ...categoryCounts['Purchase Agreement'] },
    { id: 2, name: 'Disclosures', icon: '📋', ...categoryCounts['Disclosures'] },
    { id: 3, name: 'Inspection Reports', icon: '🏠', ...categoryCounts['Inspection Reports'] },
    { id: 4, name: 'Loan Documents', icon: '💰', ...categoryCounts['Loan Documents'] },
    { id: 5, name: 'Closing Documents', icon: '📝', ...categoryCounts['Closing Documents'] }
  ].map(cat => ({
    ...cat,
    status: cat.uploaded === 0 ? 'missing' : cat.uploaded === cat.total ? 'complete' : 'partial'
  }));

  const totalUploaded = categories.reduce((sum, cat) => sum + cat.uploaded, 0);
  const totalDocuments = categories.reduce((sum, cat) => sum + cat.total, 0);
  const progressPercent = totalDocuments > 0 ? Math.round((totalUploaded / totalDocuments) * 100) : 0;

  const getStatusIcon = (status) => {
    switch (status) {
      case 'complete':
        return <CheckCircle sx={{ fontSize: 18, color: 'success.main' }} />;
      case 'partial':
        return <Warning sx={{ fontSize: 18, color: 'warning.main' }} />;
      case 'missing':
        return <Error sx={{ fontSize: 18, color: 'error.main' }} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <CompactCard>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
          <Skeleton width="35%" height={24} />
          <Skeleton width="15%" height={22} />
        </Box>
        <Skeleton width="100%" height={6} sx={{ mb: 2, borderRadius: 3 }} />
        {[1, 2, 3, 4, 5].map((i) => (
          <Box key={i} display="flex" alignItems="center" gap={1} mb={1}>
            <Skeleton width={24} height={24} />
            <Box flex={1}>
              <Skeleton width="70%" height={16} />
              <Skeleton width="20%" height={12} sx={{ mt: 0.5 }} />
            </Box>
            <Skeleton variant="circular" width={18} height={18} />
          </Box>
        ))}
      </CompactCard>
    );
  }

  return (
    <CompactCard
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.25 }}
      onClick={onClick}
    >
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
        <Box display="flex" alignItems="center" gap={1}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1.5,
              background: 'linear-gradient(135deg, #4A90E2 0%, #5B9FED 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Description sx={{ color: 'white', fontSize: 18 }} />
          </Box>
          <Typography variant="subtitle1" fontWeight="600" color="text.primary">
            Documents
          </Typography>
        </Box>
        <Chip
          label={`${totalUploaded}/${totalDocuments}`}
          size="small"
          color={progressPercent === 100 ? 'success' : progressPercent > 50 ? 'warning' : 'error'}
          sx={{ height: 22, fontSize: '0.75rem', fontWeight: 600 }}
        />
      </Box>

      {/* Overall Progress */}
      <Box mb={2}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
          <Typography variant="caption" color="text.secondary">
            Overall Progress
          </Typography>
          <Typography variant="caption" fontWeight="600" color="primary.main">
            {progressPercent}%
          </Typography>
        </Box>
        <ProgressBar variant="determinate" value={progressPercent} />
      </Box>

      {/* Document Categories */}
      <List dense sx={{ flex: 1, overflow: 'auto', py: 0 }}>
        {categories.map((category) => (
          <DocumentRow key={category.id}>
            <ListItemIcon sx={{ minWidth: 32 }}>
              <Typography fontSize="1.25rem">{category.icon}</Typography>
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography variant="body2" color="text.primary">
                  {category.name}
                </Typography>
              }
              secondary={
                <Typography variant="caption" color="text.secondary">
                  {category.uploaded}/{category.total}
                </Typography>
              }
            />
            {getStatusIcon(category.status)}
          </DocumentRow>
        ))}
      </List>

      {/* Footer */}
      <Box
        mt={1}
        pt={1}
        borderTop={1}
        borderColor="divider"
        display="flex"
        justifyContent="center"
        alignItems="center"
        gap={0.5}
      >
        <Typography variant="caption" color="text.secondary">
          View Full Checklist
        </Typography>
        <ExpandMore sx={{ fontSize: 16, color: 'text.secondary' }} />
      </Box>
    </CompactCard>
  );
};

export default DocumentsWidget;
