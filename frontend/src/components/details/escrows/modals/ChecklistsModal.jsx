import React from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  IconButton,
  LinearProgress,
  Checkbox,
} from '@mui/material';
import { X as CloseIcon, FileText } from 'lucide-react';
import { styled } from '@mui/material/styles';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: theme.spacing(2),
    maxWidth: 800,
    width: '100%',
    overflow: 'hidden',
  },
}));

const HeaderGradient = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)', // Orange gradient
  color: 'white',
  padding: theme.spacing(3),
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}));

const CategorySection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  padding: theme.spacing(2),
  borderRadius: theme.spacing(2),
  border: `1px solid ${theme.palette.grey[200]}`,
  backgroundColor: theme.palette.background.paper,
}));

const ChecklistItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1.5),
  borderRadius: theme.spacing(1),
  transition: 'background-color 0.2s',
  '&:hover': {
    backgroundColor: theme.palette.grey[50],
  },
}));

const ProgressBar = styled(LinearProgress)(({ value }) => ({
  height: 8,
  borderRadius: 4,
  '& .MuiLinearProgress-bar': {
    background:
      value === 100
        ? 'linear-gradient(90deg, #10b981 0%, #34d399 100%)' // Green
        : value >= 50
        ? 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)' // Orange
        : 'linear-gradient(90deg, #ef4444 0%, #f87171 100%)', // Red
  },
}));

const ChecklistsModal = ({ open, onClose, escrow, onUpdate }) => {
  if (!escrow) return null;

  const checklists = escrow?.checklists || {};

  // Define checklist categories with all items
  const categories = [
    {
      name: 'Loan Progress',
      color: '#3b82f6',
      items: [
        { key: 'le', label: 'Lender Engaged', completed: checklists.loan?.le || false },
        { key: 'lockedRate', label: 'Rate Locked', completed: checklists.loan?.lockedRate || false },
        { key: 'appraisal', label: 'Appraisal Ordered', completed: checklists.loan?.appraisal || false },
        { key: 'appraisalComplete', label: 'Appraisal Complete', completed: checklists.loan?.appraisalComplete || false },
        { key: 'titleOrdered', label: 'Title Ordered', completed: checklists.loan?.titleOrdered || false },
        { key: 'loanDocs', label: 'Loan Docs Received', completed: checklists.loan?.loanDocs || false },
        { key: 'finalApproval', label: 'Final Approval', completed: checklists.loan?.finalApproval || false },
        { key: 'fundingCleared', label: 'Funding Cleared', completed: checklists.loan?.fundingCleared || false },
        { key: 'loanFunded', label: 'Loan Funded', completed: checklists.loan?.loanFunded || false },
      ],
    },
    {
      name: 'Property Tasks',
      color: '#10b981',
      items: [
        { key: 'emd', label: 'EMD Deposited', completed: checklists.house?.emd || false },
        { key: 'inspection', label: 'Inspection Scheduled', completed: checklists.house?.inspection || false },
        { key: 'inspectionComplete', label: 'Inspection Complete', completed: checklists.house?.inspectionComplete || false },
        { key: 'repairs', label: 'Repairs Negotiated', completed: checklists.house?.repairs || false },
        { key: 'repairsComplete', label: 'Repairs Complete', completed: checklists.house?.repairsComplete || false },
        { key: 'finalWalkthrough', label: 'Final Walkthrough', completed: checklists.house?.finalWalkthrough || false },
        { key: 'utilities', label: 'Utilities Transferred', completed: checklists.house?.utilities || false },
        { key: 'insurance', label: 'Insurance Confirmed', completed: checklists.house?.insurance || false },
        { key: 'keysReceived', label: 'Keys Received', completed: checklists.house?.keysReceived || false },
      ],
    },
    {
      name: 'Administrative',
      color: '#f59e0b',
      items: [
        { key: 'mlsStatusUpdate', label: 'MLS Status Updated', completed: checklists.admin?.mlsStatusUpdate || false },
        { key: 'contractSigned', label: 'Contract Signed', completed: checklists.admin?.contractSigned || false },
        { key: 'disclosures', label: 'Disclosures Complete', completed: checklists.admin?.disclosures || false },
        { key: 'escrowOpened', label: 'Escrow Opened', completed: checklists.admin?.escrowOpened || false },
        { key: 'recorded', label: 'Deed Recorded', completed: checklists.admin?.recorded || false },
      ],
    },
  ];

  // Calculate overall progress
  const allItems = categories.flatMap(cat => cat.items);
  const completedCount = allItems.filter(item => item.completed).length;
  const totalCount = allItems.length;
  const overallProgress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleCheckboxChange = async (categoryKey, itemKey, currentValue) => {
    if (!onUpdate) return;

    const newValue = !currentValue;
    const updatedChecklists = {
      ...checklists,
      [categoryKey]: {
        ...checklists[categoryKey],
        [itemKey]: newValue,
      },
    };

    await onUpdate({ checklists: updatedChecklists });
  };

  return (
    <StyledDialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <HeaderGradient>
        <Box display="flex" alignItems="center" gap={2}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FileText size={24} />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight="700">
              Checklists
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {completedCount} of {totalCount} tasks complete
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={onClose}
          sx={{
            color: 'white',
            '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
          }}
        >
          <CloseIcon size={24} />
        </IconButton>
      </HeaderGradient>

      <DialogContent sx={{ p: 3 }}>
        {/* Overall Progress */}
        <Box mb={4}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="subtitle1" fontWeight="700">
              Overall Progress
            </Typography>
            <Typography variant="h6" fontWeight="700" color="primary">
              {overallProgress}%
            </Typography>
          </Box>
          <ProgressBar variant="determinate" value={overallProgress} />
        </Box>

        {/* Categories */}
        {categories.map((category, catIdx) => {
          const categoryKey = category.name === 'Loan Progress' ? 'loan' : category.name === 'Property Tasks' ? 'house' : 'admin';
          const completed = category.items.filter(item => item.completed).length;
          const total = category.items.length;
          const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

          return (
            <CategorySection key={catIdx}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Box>
                  <Typography variant="h6" fontWeight="700" sx={{ color: category.color }}>
                    {category.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {completed} of {total} complete
                  </Typography>
                </Box>
                <Box
                  sx={{
                    backgroundColor: `${category.color}15`,
                    color: category.color,
                    px: 2,
                    py: 0.5,
                    borderRadius: 2,
                    fontWeight: 700,
                    fontSize: '0.875rem',
                  }}
                >
                  {percentage}%
                </Box>
              </Box>

              <ProgressBar variant="determinate" value={percentage} sx={{ mb: 2 }} />

              {category.items.map((item, itemIdx) => (
                <ChecklistItem key={itemIdx}>
                  <Checkbox
                    checked={item.completed}
                    onChange={() => handleCheckboxChange(categoryKey, item.key, item.completed)}
                    sx={{
                      color: category.color,
                      '&.Mui-checked': {
                        color: category.color,
                      },
                    }}
                  />
                  <Typography
                    variant="body2"
                    sx={{
                      textDecoration: item.completed ? 'line-through' : 'none',
                      opacity: item.completed ? 0.6 : 1,
                      fontWeight: item.completed ? 400 : 500,
                    }}
                  >
                    {item.label}
                  </Typography>
                </ChecklistItem>
              ))}
            </CategorySection>
          );
        })}
      </DialogContent>
    </StyledDialog>
  );
};

export default ChecklistsModal;
