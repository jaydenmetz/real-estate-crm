import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  LinearProgress,
  Chip
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  RadioButtonUnchecked as PendingIcon,
  AccountBalance as LoanIcon,
  Home as HouseIcon,
  Assignment as AdminIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Styled components with purple theme
const WidgetCard = styled(Paper)(({ theme }) => ({
  background: 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)',
  borderRadius: theme.spacing(1.5),
  padding: theme.spacing(2),
  border: '1px solid rgba(118, 75, 162, 0.1)',
  boxShadow: '0 2px 8px rgba(118, 75, 162, 0.08)'
}));

const ChecklistSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1.5),
  background: 'white',
  borderRadius: theme.spacing(1),
  border: '1px solid rgba(118, 75, 162, 0.08)',
  marginBottom: theme.spacing(1.5)
}));

const ChecklistItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0.5),
  borderRadius: theme.spacing(0.5),
  '&:hover': {
    backgroundColor: 'rgba(118, 75, 162, 0.03)'
  }
}));

const SectionHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(1)
}));

const SectionIcon = styled(Box)(({ theme, color }) => ({
  width: 28,
  height: 28,
  borderRadius: theme.spacing(0.75),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: color || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  '& .MuiSvgIcon-root': {
    fontSize: '1rem'
  }
}));

function ChecklistWidgetCompact({ data }) {
  if (!data) return null;

  const checklistLabels = {
    loan: {
      le: 'Loan Estimate',
      lockedRate: 'Rate Locked',
      appraisalOrdered: 'Appraisal Ordered',
      appraisalReceived: 'Appraisal Received',
      clearToClose: 'Clear to Close',
      cd: 'Closing Disclosure',
      loanDocsSigned: 'Loan Docs Signed',
      cashToClosePaid: 'Cash to Close',
      loanFunded: 'Loan Funded'
    },
    house: {
      homeInspectionOrdered: 'Inspection Ordered',
      emd: 'EMD Deposited',
      solarTransferInitiated: 'Solar Transfer',
      avid: 'AVID',
      homeInspectionReceived: 'Inspection Report',
      sellerDisclosures: 'Seller Disclosures',
      rr: 'Repair Request',
      recorded: 'Recorded'
    },
    admin: {
      mlsStatusUpdate: 'MLS Updated',
      tcEmail: 'TC Email Sent',
      tcGlideInvite: 'Glide Invite',
      addContactsToPhone: 'Contacts Added',
      addContactsToNotion: 'Notion Updated'
    }
  };

  const calculateProgress = (section) => {
    if (!data[section]) return { completed: 0, total: 0, percentage: 0 };
    const items = Object.values(data[section] || {});
    const completed = items.filter(Boolean).length;
    const total = items.length;
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    return { completed, total, percentage };
  };

  const sections = [
    {
      key: 'loan',
      title: 'Loan & Financing',
      icon: <LoanIcon />,
      color: 'linear-gradient(135deg, #667eea 0%, #5a67d8 100%)',
      items: data.loan || {}
    },
    {
      key: 'house',
      title: 'Property & Inspections',
      icon: <HouseIcon />,
      color: 'linear-gradient(135deg, #764ba2 0%, #6b46a2 100%)',
      items: data.house || {}
    },
    {
      key: 'admin',
      title: 'Administrative',
      icon: <AdminIcon />,
      color: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      items: data.admin || {}
    }
  ];

  const overallProgress = sections.reduce((acc, section) => {
    const progress = calculateProgress(section.key);
    acc.completed += progress.completed;
    acc.total += progress.total;
    return acc;
  }, { completed: 0, total: 0 });

  const overallPercentage = overallProgress.total > 0 
    ? (overallProgress.completed / overallProgress.total) * 100 
    : 0;

  return (
    <WidgetCard elevation={0}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight="600" color="#764ba2">
          Checklists
        </Typography>
        <Chip
          label={`${overallProgress.completed}/${overallProgress.total} Complete`}
          size="small"
          sx={{ 
            bgcolor: 'rgba(102, 126, 234, 0.1)',
            color: '#667eea',
            fontWeight: 'bold'
          }}
        />
      </Box>

      <LinearProgress
        variant="determinate"
        value={overallPercentage}
        sx={{
          height: 6,
          borderRadius: 3,
          bgcolor: 'rgba(118, 75, 162, 0.1)',
          '& .MuiLinearProgress-bar': {
            background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 3
          },
          mb: 2
        }}
      />

      <Grid container spacing={1.5}>
        {sections.map((section) => {
          const progress = calculateProgress(section.key);
          const itemEntries = Object.entries(section.items);
          
          // Show only first 3 items per section to save space
          const displayItems = itemEntries.slice(0, 3);
          const remainingCount = itemEntries.length - displayItems.length;
          
          return (
            <Grid item xs={12} sm={4} key={section.key}>
              <ChecklistSection>
                <SectionHeader>
                  <Box display="flex" alignItems="center" gap={1}>
                    <SectionIcon color={section.color}>
                      {section.icon}
                    </SectionIcon>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={600} color="#764ba2">
                        {section.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {progress.completed}/{progress.total} done
                      </Typography>
                    </Box>
                  </Box>
                </SectionHeader>
                
                <LinearProgress
                  variant="determinate"
                  value={progress.percentage}
                  sx={{
                    height: 4,
                    borderRadius: 2,
                    bgcolor: 'rgba(118, 75, 162, 0.1)',
                    '& .MuiLinearProgress-bar': {
                      background: section.color,
                      borderRadius: 2
                    },
                    mb: 1.5
                  }}
                />
                
                {displayItems.map(([key, value]) => (
                  <ChecklistItem key={key}>
                    {value ? (
                      <CheckIcon sx={{ fontSize: 16, color: '#667eea', mr: 1 }} />
                    ) : (
                      <PendingIcon sx={{ fontSize: 16, color: '#d1d5db', mr: 1 }} />
                    )}
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        textDecoration: value ? 'line-through' : 'none',
                        color: value ? 'text.secondary' : 'text.primary'
                      }}
                    >
                      {checklistLabels[section.key][key] || key}
                    </Typography>
                  </ChecklistItem>
                ))}
                
                {remainingCount > 0 && (
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 3, mt: 0.5, display: 'block' }}>
                    +{remainingCount} more items
                  </Typography>
                )}
              </ChecklistSection>
            </Grid>
          );
        })}
      </Grid>
    </WidgetCard>
  );
}

export default ChecklistWidgetCompact;