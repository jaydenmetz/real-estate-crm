import React from 'react';
import { Box, Typography, Button, Switch, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';

// Styled Components
const SidebarContainer = styled(Box)(({ theme }) => ({
  width: 288,
  backgroundColor: 'white',
  borderLeft: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  overflowY: 'auto',
  flexShrink: 0,
  [theme.breakpoints.down('lg')]: {
    display: 'none', // Hide on smaller screens
  },
}));

const WidgetCard = styled(Paper)(({ gradient }) => ({
  background: gradient || 'linear-gradient(to bottom right, #ecfdf5, #d1fae5)',
  borderRadius: 12,
  padding: 20,
  border: gradient?.includes('green')
    ? '1px solid #bbf7d0'
    : gradient?.includes('blue')
    ? '1px solid #bfdbfe'
    : '1px solid #fed7aa',
  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
}));

const WidgetHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(2),
}));

const IconCircle = styled(Box)(({ gradient }) => ({
  width: 32,
  height: 32,
  background: gradient || 'linear-gradient(to bottom right, #10b981, #059669)',
  borderRadius: 8,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
  fontSize: '1.125rem',
}));

const AutomationRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingTop: theme.spacing(1),
  paddingBottom: theme.spacing(1),
}));

const GreenSwitch = styled(Switch)(({ theme }) => ({
  '& .MuiSwitch-switchBase.Mui-checked': {
    color: '#10b981',
    '&:hover': {
      backgroundColor: 'rgba(16, 185, 129, 0.08)',
    },
  },
  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
    backgroundColor: '#10b981',
  },
}));

const QuickActionButton = styled(Button)(({ theme }) => ({
  width: '100%',
  textAlign: 'left',
  justifyContent: 'flex-start',
  textTransform: 'none',
  fontWeight: 500,
  fontSize: '0.875rem',
  padding: theme.spacing(1.25, 2),
  backgroundColor: 'white',
  color: theme.palette.text.primary,
  border: '1px solid #bfdbfe',
  borderRadius: 8,
  transition: 'all 0.2s',
  '&:hover': {
    backgroundColor: '#eff6ff',
    borderColor: '#93c5fd',
  },
}));

const HealthPercentage = styled(Box)(({ theme }) => ({
  fontSize: '2.5rem',
  fontWeight: 700,
  color: '#10b981',
  textAlign: 'center',
  marginBottom: theme.spacing(1),
}));

const HealthIndicator = styled(Box)(({ type }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  fontSize: '0.75rem',
  color: type === 'success' ? '#15803d' : '#a16207',
  marginBottom: 4,
}));

const EscrowRightSidebar = ({
  escrowId,
  automations = {
    contingencyReminders: true,
    documentTracking: true,
    closingReminders: false,
  },
  onToggleAutomation,
  dealHealth = {
    percentage: 85,
    indicators: [
      { type: 'success', text: 'All documents received' },
      { type: 'warning', text: 'Appraisal pending' },
    ],
  },
  onQuickAction,
}) => {
  return (
    <SidebarContainer>
      {/* Automations Card */}
      <WidgetCard gradient="linear-gradient(to bottom right, #ecfdf5, #d1fae5)">
        <WidgetHeader>
          <IconCircle gradient="linear-gradient(to bottom right, #10b981, #059669)">
            ⚡
          </IconCircle>
          <Typography fontWeight={600} color="text.primary">
            Automations
          </Typography>
        </WidgetHeader>

        <Box display="flex" flexDirection="column">
          <AutomationRow>
            <Typography variant="body2" color="text.primary">
              Contingency reminders
            </Typography>
            <GreenSwitch
              checked={automations.contingencyReminders}
              onChange={() => onToggleAutomation?.('contingencyReminders')}
              size="small"
            />
          </AutomationRow>

          <AutomationRow>
            <Typography variant="body2" color="text.primary">
              Document tracking
            </Typography>
            <GreenSwitch
              checked={automations.documentTracking}
              onChange={() => onToggleAutomation?.('documentTracking')}
              size="small"
            />
          </AutomationRow>

          <AutomationRow>
            <Typography variant="body2" color="text.primary">
              Closing reminders
            </Typography>
            <GreenSwitch
              checked={automations.closingReminders}
              onChange={() => onToggleAutomation?.('closingReminders')}
              size="small"
            />
          </AutomationRow>
        </Box>
      </WidgetCard>

      {/* Quick Actions Card */}
      <WidgetCard gradient="linear-gradient(to bottom right, #eff6ff, #dbeafe)">
        <WidgetHeader>
          <IconCircle gradient="linear-gradient(to bottom right, #3b82f6, #2563eb)">
            ⚡
          </IconCircle>
          <Typography fontWeight={600} color="text.primary">
            Quick Actions
          </Typography>
        </WidgetHeader>

        <Box display="flex" flexDirection="column" gap={1}>
          <QuickActionButton onClick={() => onQuickAction?.('requestDocuments')}>
            📨 Request Documents
          </QuickActionButton>
          <QuickActionButton onClick={() => onQuickAction?.('sendUpdate')}>
            📤 Send Update
          </QuickActionButton>
          <QuickActionButton onClick={() => onQuickAction?.('scheduleCall')}>
            📞 Schedule Call
          </QuickActionButton>
          <QuickActionButton onClick={() => onQuickAction?.('addTask')}>
            ➕ Add Task
          </QuickActionButton>
        </Box>
      </WidgetCard>

      {/* Deal Health Card */}
      <WidgetCard gradient="linear-gradient(to bottom right, #fff7ed, #fed7aa)">
        <WidgetHeader>
          <IconCircle gradient="linear-gradient(to bottom right, #f97316, #ea580c)">
            🎯
          </IconCircle>
          <Typography fontWeight={600} color="text.primary">
            Deal Health
          </Typography>
        </WidgetHeader>

        <Box textAlign="center" py={2}>
          <HealthPercentage>{dealHealth.percentage}%</HealthPercentage>
          <Typography variant="body2" color="text.secondary" mb={2}>
            On track for close
          </Typography>
        </Box>

        <Box display="flex" flexDirection="column" gap={0.5}>
          {dealHealth.indicators?.map((indicator, index) => (
            <HealthIndicator key={index} type={indicator.type}>
              <span>{indicator.type === 'success' ? '✓' : '⚠'}</span>
              <span>{indicator.text}</span>
            </HealthIndicator>
          ))}
        </Box>
      </WidgetCard>
    </SidebarContainer>
  );
};

export default EscrowRightSidebar;
