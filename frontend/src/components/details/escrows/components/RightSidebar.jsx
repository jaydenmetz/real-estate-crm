import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  LinearProgress,
  Switch,
  FormControlLabel,
  Chip,
  Divider,
  Skeleton
} from '@mui/material';
import {
  CheckCircle,
  Warning,
  Error as ErrorIcon,
  AutoAwesome,
  Lock
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import apiInstance from '../../../../services/api.service';

// PHASE 5: Right Sidebar (200px wide, Deal Health + Automations + AI)
const SidebarContainer = styled(Box)(({ theme }) => ({
  width: 200,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  [theme.breakpoints.down('md')]: {
    width: '100%',
  },
}));

const SectionCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  padding: theme.spacing(2),
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
}));

const HealthScoreCircle = styled(Box)(({ theme, score }) => {
  const getColor = () => {
    if (score >= 80) return theme.palette.success.main;
    if (score >= 60) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  return {
    width: 80,
    height: 80,
    borderRadius: '50%',
    background: `conic-gradient(
      ${getColor()} ${score * 3.6}deg,
      ${theme.palette.grey[200]} ${score * 3.6}deg
    )`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto',
    position: 'relative',
    '&::before': {
      content: '""',
      position: 'absolute',
      width: 64,
      height: 64,
      borderRadius: '50%',
      backgroundColor: 'white',
    },
  };
});

const HealthIndicator = styled(Box)(({ theme, status }) => {
  const getColor = () => {
    if (status === 'success') return theme.palette.success.main;
    if (status === 'warning') return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  const getIcon = () => {
    if (status === 'success') return <CheckCircle sx={{ fontSize: 14 }} />;
    if (status === 'warning') return <Warning sx={{ fontSize: 14 }} />;
    return <ErrorIcon sx={{ fontSize: 14 }} />;
  };

  return {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    padding: theme.spacing(0.5, 0),
    color: getColor(),
    fontSize: '0.7rem',
    '& svg': {
      color: getColor(),
    },
  };
});

const PremiumCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  padding: theme.spacing(2),
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  textAlign: 'center',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -50,
    right: -50,
    width: 100,
    height: 100,
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '50%',
  },
}));

const RightSidebar = ({ escrow, loading, onUpdate }) => {
  const [automations, setAutomations] = useState({
    contingencyReminders: true,
    documentTracking: true,
    closingReminders: false
  });

  useEffect(() => {
    if (escrow?.automations) {
      setAutomations({
        contingencyReminders: escrow.automations.contingencyReminders !== false,
        documentTracking: escrow.automations.documentTracking !== false,
        closingReminders: escrow.automations.closingReminders === true
      });
    }
  }, [escrow]);

  // Calculate Deal Health Score
  const calculateHealthScore = () => {
    if (!escrow) return 0;

    let score = 0;

    // Checklist completion (50% weight)
    const checklistProgress = escrow.details?.checklistProgress || 0;
    score += checklistProgress * 0.5;

    // Days until close (30% weight)
    const closingDate = escrow.details?.closingDate || escrow.close_date;
    if (closingDate) {
      const daysUntilClose = Math.ceil((new Date(closingDate) - new Date()) / (1000 * 60 * 60 * 24));
      if (daysUntilClose > 30) score += 30;
      else if (daysUntilClose > 0) score += daysUntilClose;
    } else {
      score += 15; // Neutral if no date set
    }

    // Missing documents (20% weight)
    const documents = escrow.documents || [];
    const expectedDocs = 33; // Total expected documents across all categories
    const documentScore = Math.min((documents.length / expectedDocs) * 20, 20);
    score += documentScore;

    return Math.round(score);
  };

  const healthScore = calculateHealthScore();

  // Get health indicators
  const getHealthIndicators = () => {
    const indicators = [];
    const documents = escrow?.documents || [];
    const timeline = escrow?.timeline || {};

    // Documents check
    if (documents.length >= 25) {
      indicators.push({ status: 'success', text: 'All docs received' });
    } else if (documents.length >= 10) {
      indicators.push({ status: 'warning', text: 'Some docs missing' });
    } else {
      indicators.push({ status: 'error', text: 'Docs incomplete' });
    }

    // Appraisal check
    if (timeline.appraisalDate) {
      const appraisalDate = new Date(timeline.appraisalDate);
      const today = new Date();
      if (appraisalDate < today) {
        indicators.push({ status: 'success', text: 'Appraisal complete' });
      } else {
        indicators.push({ status: 'warning', text: 'Appraisal pending' });
      }
    } else {
      indicators.push({ status: 'warning', text: 'Appraisal not scheduled' });
    }

    // Contingency check
    if (timeline.allContingenciesRemovalDate) {
      const contingencyDate = new Date(timeline.allContingenciesRemovalDate);
      const today = new Date();
      if (contingencyDate < today) {
        indicators.push({ status: 'error', text: 'Contingency overdue' });
      } else {
        indicators.push({ status: 'success', text: 'Contingencies on track' });
      }
    }

    return indicators.slice(0, 3);
  };

  const handleAutomationToggle = async (key) => {
    const newAutomations = {
      ...automations,
      [key]: !automations[key]
    };
    setAutomations(newAutomations);

    if (!escrow?.id) return;

    try {
      await apiInstance.put(`/escrows/${escrow.id}`, {
        automations: newAutomations
      });
      if (onUpdate) onUpdate({ automations: newAutomations });
    } catch (error) {
      console.error('Failed to update automations:', error);
      // Revert on error
      setAutomations(automations);
    }
  };

  if (loading) {
    return (
      <SidebarContainer>
        <SectionCard>
          <Skeleton variant="circular" width={80} height={80} sx={{ mx: 'auto', mb: 2 }} />
          <Skeleton width="60%" height={20} sx={{ mx: 'auto', mb: 1 }} />
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} width="100%" height={18} sx={{ mb: 0.5 }} />
          ))}
        </SectionCard>
        <SectionCard>
          <Skeleton width="50%" height={20} sx={{ mb: 1 }} />
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} width="100%" height={36} sx={{ mb: 1 }} />
          ))}
        </SectionCard>
      </SidebarContainer>
    );
  }

  const healthIndicators = getHealthIndicators();

  return (
    <SidebarContainer
      component={motion.div}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Deal Health Score */}
      <SectionCard>
        <Typography variant="caption" fontWeight="700" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
          DEAL HEALTH
        </Typography>

        <HealthScoreCircle score={healthScore}>
          <Typography
            variant="h4"
            fontWeight="700"
            sx={{ position: 'relative', zIndex: 1 }}
          >
            {healthScore}%
          </Typography>
        </HealthScoreCircle>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', textAlign: 'center', mt: 1, mb: 2 }}
        >
          {healthScore >= 80 ? 'Excellent' : healthScore >= 60 ? 'Good' : 'Needs Attention'}
        </Typography>

        <Divider sx={{ my: 1.5 }} />

        {healthIndicators.map((indicator, index) => (
          <HealthIndicator key={index} status={indicator.status}>
            {indicator.status === 'success' && <CheckCircle />}
            {indicator.status === 'warning' && <Warning />}
            {indicator.status === 'error' && <ErrorIcon />}
            <Typography variant="caption" fontWeight="600">
              {indicator.text}
            </Typography>
          </HealthIndicator>
        ))}
      </SectionCard>

      {/* Automations */}
      <SectionCard>
        <Typography variant="caption" fontWeight="700" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
          AUTOMATIONS
        </Typography>

        <FormControlLabel
          control={
            <Switch
              size="small"
              checked={automations.contingencyReminders}
              onChange={() => handleAutomationToggle('contingencyReminders')}
            />
          }
          label={
            <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
              Contingency Reminders
            </Typography>
          }
          sx={{ display: 'flex', mb: 1 }}
        />

        <FormControlLabel
          control={
            <Switch
              size="small"
              checked={automations.documentTracking}
              onChange={() => handleAutomationToggle('documentTracking')}
            />
          }
          label={
            <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
              Document Tracking
            </Typography>
          }
          sx={{ display: 'flex', mb: 1 }}
        />

        <FormControlLabel
          control={
            <Switch
              size="small"
              checked={automations.closingReminders}
              onChange={() => handleAutomationToggle('closingReminders')}
            />
          }
          label={
            <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
              Closing Reminders
            </Typography>
          }
          sx={{ display: 'flex' }}
        />
      </SectionCard>

      {/* AI Assistant (Coming Soon) */}
      <PremiumCard>
        <AutoAwesome sx={{ fontSize: 32, mb: 1, opacity: 0.9 }} />
        <Typography variant="body2" fontWeight="700" sx={{ mb: 0.5 }}>
          AI Assistant
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.9, fontSize: '0.65rem' }}>
          Get instant insights and suggestions
        </Typography>
        <Chip
          icon={<Lock sx={{ fontSize: 14 }} />}
          label="Coming Soon"
          size="small"
          sx={{
            mt: 1.5,
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            fontWeight: 600,
            fontSize: '0.65rem',
            height: 20
          }}
        />
      </PremiumCard>
    </SidebarContainer>
  );
};

export default RightSidebar;
