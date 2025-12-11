import React from 'react';
import { Box, Chip, Typography, Skeleton } from '@mui/material';

/**
 * AIManagerQuickItems - Standardized AI workload/activity chips
 *
 * These 4 chips are CONSISTENT across all AI Manager dashboards to enable
 * apples-to-apples comparison of AI activity across entities.
 *
 * Standard KPIs:
 * 1. Tasks Queued - Actions the AI will take automatically
 * 2. Reminders Scheduled - Outbound automation (texts/emails/calls)
 * 3. Actions Today - What AI did today (productivity proof)
 * 4. Alerts for You - Items flagged for human review
 *
 * @param {object} data - Quick items data from API
 * @param {boolean} isLoading - Loading state
 */
const AIManagerQuickItems = ({ data = {}, isLoading = false }) => {
  // Standardized quick items with defaults
  const quickItems = [
    {
      icon: '📋',
      text: 'tasks queued',
      value: data.tasks_queued ?? 0,
      type: 'tasks',
    },
    {
      icon: '📤',
      text: 'reminders scheduled',
      value: data.reminders_scheduled ?? 0,
      type: 'reminders',
    },
    {
      icon: '⚡',
      text: 'actions today',
      value: data.actions_today ?? 0,
      type: 'actions',
    },
    {
      icon: '🔔',
      text: 'alerts for you',
      value: data.alerts_for_you ?? 0,
      type: 'alerts',
    },
  ];

  // Color mapping for each chip type
  const getChipColor = (type) => {
    switch (type) {
      case 'tasks':
        // Blue - info/pending work
        return { bg: 'rgba(100, 181, 246, 0.2)', border: 'rgba(100, 181, 246, 0.5)' };
      case 'reminders':
        // Teal - automation/outbound
        return { bg: 'rgba(77, 182, 172, 0.2)', border: 'rgba(77, 182, 172, 0.5)' };
      case 'actions':
        // Green - success/completed
        return { bg: 'rgba(129, 199, 132, 0.2)', border: 'rgba(129, 199, 132, 0.5)' };
      case 'alerts':
        // Orange - needs attention
        return { bg: 'rgba(255, 152, 0, 0.2)', border: 'rgba(255, 152, 0, 0.5)' };
      default:
        return { bg: 'rgba(255,255,255,0.1)', border: 'rgba(255,255,255,0.2)' };
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
        {[...Array(4)].map((_, i) => (
          <Skeleton
            key={i}
            variant="rounded"
            width={160}
            height={36}
            sx={{ bgcolor: 'rgba(255,255,255,0.2)', borderRadius: 4 }}
          />
        ))}
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
      {quickItems.map((item, index) => {
        const colors = getChipColor(item.type);
        return (
          <Chip
            key={index}
            icon={<span style={{ fontSize: '1rem', marginLeft: 8 }}>{item.icon}</span>}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography
                  component="span"
                  sx={{ fontWeight: 700, fontSize: '0.85rem' }}
                >
                  {item.value}
                </Typography>
                <Typography component="span" sx={{ fontSize: '0.85rem' }}>
                  {item.text}
                </Typography>
              </Box>
            }
            sx={{
              background: colors.bg,
              border: `1px solid ${colors.border}`,
              color: '#fff',
              height: 36,
              '& .MuiChip-icon': {
                color: '#fff',
              },
            }}
          />
        );
      })}
    </Box>
  );
};

export default AIManagerQuickItems;
