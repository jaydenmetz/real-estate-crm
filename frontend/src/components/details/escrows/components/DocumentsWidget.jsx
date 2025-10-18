import React, { useState } from 'react';
import {
  Box,
  Card,
  Typography,
  LinearProgress,
  Stack,
  Chip,
  IconButton,
  Tooltip,
  Paper,
  Collapse
} from '@mui/material';
import {
  Description,
  CheckCircle,
  PendingActions,
  Warning,
  ExpandMore,
  ExpandLess,
  CloudUpload,
  Folder
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import useResponsiveLayout from '../../../../hooks/useResponsiveLayout';

const WidgetContainer = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  padding: theme.spacing(3),
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  background: 'white',
  height: '100%',
  display: 'flex',
  flexDirection: 'column'
}));

const DocumentCategoryCard = styled(Paper)(({ theme, status }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.spacing(1.5),
  border: `2px solid ${
    status === 'complete' ? theme.palette.success.light :
    status === 'partial' ? theme.palette.warning.light :
    theme.palette.error.light
  }`,
  backgroundColor:
    status === 'complete' ? theme.palette.success.light + '10' :
    status === 'partial' ? theme.palette.warning.light + '10' :
    theme.palette.error.light + '10',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.1)'
  }
}));

const ProgressBar = styled(LinearProgress)(({ theme }) => ({
  height: 8,
  borderRadius: 4,
  backgroundColor: theme.palette.grey[200],
  '& .MuiLinearProgress-bar': {
    borderRadius: 4,
    background: 'linear-gradient(90deg, #4A90E2 0%, #5B9FED 100%)' // Blue gradient (escrows theme)
  }
}));

const DocumentsWidget = ({ data = {}, expanded, onExpand, onUpdate }) => {
  const { spacing } = useResponsiveLayout();
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Mock document categories - will be replaced with real data
  const documentCategories = [
    {
      id: 'purchase',
      name: 'Purchase Agreement',
      total: 5,
      uploaded: 5,
      status: 'complete',
      icon: <Description />
    },
    {
      id: 'disclosures',
      name: 'Disclosures',
      total: 8,
      uploaded: 6,
      status: 'partial',
      icon: <Folder />
    },
    {
      id: 'inspection',
      name: 'Inspection Reports',
      total: 4,
      uploaded: 2,
      status: 'partial',
      icon: <Description />
    },
    {
      id: 'loan',
      name: 'Loan Documents',
      total: 10,
      uploaded: 3,
      status: 'partial',
      icon: <Folder />
    },
    {
      id: 'closing',
      name: 'Closing Documents',
      total: 6,
      uploaded: 0,
      status: 'missing',
      icon: <Description />
    }
  ];

  const totalDocuments = documentCategories.reduce((sum, cat) => sum + cat.total, 0);
  const uploadedDocuments = documentCategories.reduce((sum, cat) => sum + cat.uploaded, 0);
  const completionPercentage = Math.round((uploadedDocuments / totalDocuments) * 100);

  const getStatusColor = (status) => {
    switch (status) {
      case 'complete':
        return 'success';
      case 'partial':
        return 'warning';
      case 'missing':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'complete':
        return <CheckCircle sx={{ fontSize: 20, color: 'success.main' }} />;
      case 'partial':
        return <PendingActions sx={{ fontSize: 20, color: 'warning.main' }} />;
      case 'missing':
        return <Warning sx={{ fontSize: 20, color: 'error.main' }} />;
      default:
        return null;
    }
  };

  return (
    <WidgetContainer
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #4A90E2 0%, #5B9FED 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Description sx={{ color: 'white', fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight="600" color="text.primary">
              Documents
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {uploadedDocuments} of {totalDocuments} uploaded
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onExpand} size="small">
          {expanded ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      </Box>

      {/* Overall Progress */}
      <Box mb={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="body2" color="text.secondary">
            Overall Completion
          </Typography>
          <Typography variant="h6" fontWeight="700" color="primary.main">
            {completionPercentage}%
          </Typography>
        </Box>
        <ProgressBar variant="determinate" value={completionPercentage} />
      </Box>

      {/* Document Categories */}
      <Stack spacing={2} sx={{ flex: 1, overflow: 'auto' }}>
        {documentCategories.map((category) => (
          <DocumentCategoryCard
            key={category.id}
            status={category.status}
            onClick={() => setSelectedCategory(category.id)}
            component={motion.div}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box display="flex" alignItems="center" gap={1.5} flex={1}>
                {getStatusIcon(category.status)}
                <Box flex={1}>
                  <Typography variant="body2" fontWeight="600" color="text.primary">
                    {category.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {category.uploaded}/{category.total} documents
                  </Typography>
                </Box>
              </Box>
              <Chip
                label={category.status === 'complete' ? 'Complete' : category.status === 'partial' ? 'In Progress' : 'Missing'}
                size="small"
                color={getStatusColor(category.status)}
                sx={{ fontWeight: 600, fontSize: '0.7rem' }}
              />
            </Box>

            {/* Progress bar for each category */}
            <Box mt={1.5}>
              <ProgressBar
                variant="determinate"
                value={(category.uploaded / category.total) * 100}
              />
            </Box>
          </DocumentCategoryCard>
        ))}
      </Stack>

      {/* Expanded content */}
      <Collapse in={expanded} timeout="auto">
        <Box mt={3} pt={3} borderTop={1} borderColor="divider">
          <Typography variant="body2" color="text.secondary" mb={2}>
            Document templates will be customized based on escrow type
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Chip icon={<CloudUpload />} label="Upload Documents" size="small" clickable />
            <Chip icon={<Folder />} label="View All" size="small" clickable variant="outlined" />
          </Stack>
        </Box>
      </Collapse>
    </WidgetContainer>
  );
};

export default DocumentsWidget;
