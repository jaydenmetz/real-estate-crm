import React, { useState } from 'react';
import { Box, Typography, Button, Chip, Grid, Skeleton } from '@mui/material';
import {
  Settings as SettingsIcon,
  TrendingUp as TrendingUpIcon,
  AutoAwesome as AutoAwesomeIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import apiInstance from '../../../../../../services/api.service';
import AIManagerStatCard from './AIManagerStatCard';

/**
 * AIManagerPage - Full AI Contact Coach hero page for contacts
 *
 * Page 2 of the contacts hero carousel.
 * Shows AI coaching stats, relationship insights, and configuration options.
 *
 * Data is lazily loaded from /v1/contacts/manager when the page becomes visible.
 */
const AIManagerPage = ({ isVisible = true, onConfigureAI, onViewActivity }) => {
  const [dateFilter, setDateFilter] = useState('1_month');

  // Lazy load data only when visible
  const { data, isLoading } = useQuery({
    queryKey: ['contacts', 'manager', dateFilter],
    queryFn: async () => {
      const response = await apiInstance.get(`/contacts/manager?period=${dateFilter}`);
      return response.data;
    },
    enabled: isVisible, // Only fetch when page is visible
    staleTime: 30000, // Consider data fresh for 30 seconds
    refetchOnWindowFocus: false,
  });

  // Extract data from response with fallbacks
  const stats = data?.data?.stats || {
    total_contacts: 0,
    needs_followup: 0,
    engagement_score: 0,
    referral_potential: 0,
  };

  const quickItemsData = data?.data?.quick_items || {
    overdue_followups: 0,
    birthdays_this_week: 0,
    new_this_month: 0,
    inactive_contacts: 0,
  };

  const aiStatus = data?.data?.ai_status || {
    is_active: true,
    monitoring_all: true,
    next_summary: '5 PM',
  };

  // Quick info items built from API data
  const quickItems = [
    {
      icon: '⏰',
      text: 'overdue follow-ups',
      value: quickItemsData.overdue_followups,
      type: 'urgent',
    },
    {
      icon: '🎂',
      text: 'birthdays this week',
      value: quickItemsData.birthdays_this_week,
      type: 'info',
    },
    {
      icon: '✨',
      text: 'new this month',
      value: quickItemsData.new_this_month,
      type: 'success',
    },
    {
      icon: '😴',
      text: 'need re-engagement',
      value: quickItemsData.inactive_contacts,
      type: 'pending',
    },
  ];

  const getQuickItemColor = (type) => {
    switch (type) {
      case 'urgent':
        return { bg: 'rgba(255, 152, 0, 0.2)', border: 'rgba(255, 152, 0, 0.5)' };
      case 'pending':
        return { bg: 'rgba(100, 181, 246, 0.2)', border: 'rgba(100, 181, 246, 0.5)' };
      case 'info':
        return { bg: 'rgba(129, 199, 132, 0.2)', border: 'rgba(129, 199, 132, 0.5)' };
      case 'success':
        return { bg: 'rgba(77, 182, 172, 0.2)', border: 'rgba(77, 182, 172, 0.5)' };
      default:
        return { bg: 'rgba(255,255,255,0.1)', border: 'rgba(255,255,255,0.2)' };
    }
  };

  const dateFilters = [
    { value: '1_day', label: '1 DAY' },
    { value: '1_month', label: '1 MONTH' },
    { value: '1_year', label: '1 YEAR' },
    { value: 'ytd', label: 'YTD' },
  ];

  // Skeleton loader for stat cards
  const StatCardSkeleton = () => (
    <Box
      sx={{
        background: 'rgba(255,255,255,0.1)',
        borderRadius: 3,
        p: 2.5,
        height: 140,
      }}
    >
      <Skeleton
        variant="rounded"
        width={80}
        height={24}
        sx={{ bgcolor: 'rgba(255,255,255,0.2)', mb: 2 }}
      />
      <Skeleton
        variant="text"
        width={60}
        height={50}
        sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}
      />
      <Skeleton
        variant="text"
        width={80}
        height={20}
        sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}
      />
    </Box>
  );

  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, #7b1fa2 0%, #9c27b0 50%, #ab47bc 100%)',
        borderRadius: 4,
        p: 4,
        color: '#fff',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Header with title and date filters */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: '#fff',
          }}
        >
          AI Contact Coach
        </Typography>

        {/* Date filter buttons */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          {dateFilters.map((filter) => (
            <Button
              key={filter.value}
              onClick={() => setDateFilter(filter.value)}
              sx={{
                minWidth: 70,
                px: 2,
                py: 0.75,
                borderRadius: 2,
                fontSize: '0.75rem',
                fontWeight: 600,
                background:
                  dateFilter === filter.value
                    ? 'rgba(255,255,255,0.25)'
                    : 'rgba(255,255,255,0.1)',
                color: '#fff',
                border: '1px solid',
                borderColor:
                  dateFilter === filter.value
                    ? 'rgba(255,255,255,0.4)'
                    : 'rgba(255,255,255,0.2)',
                '&:hover': {
                  background: 'rgba(255,255,255,0.2)',
                },
              }}
            >
              {filter.label}
            </Button>
          ))}
        </Box>
      </Box>

      {/* Stats Row */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          {isLoading ? (
            <StatCardSkeleton />
          ) : (
            <AIManagerStatCard
              label="TOTAL CONTACTS"
              value={stats.total_contacts}
              subtext="In Sphere"
              icon="👥"
            />
          )}
        </Grid>
        <Grid item xs={6} sm={3}>
          {isLoading ? (
            <StatCardSkeleton />
          ) : (
            <AIManagerStatCard
              label="NEEDS FOLLOW-UP"
              value={stats.needs_followup}
              subtext="This Week"
              icon="📞"
              highlight={stats.needs_followup > 0}
              valueColor={stats.needs_followup > 0 ? '#ffd54f' : undefined}
            />
          )}
        </Grid>
        <Grid item xs={6} sm={3}>
          {isLoading ? (
            <StatCardSkeleton />
          ) : (
            <AIManagerStatCard
              label="ENGAGEMENT"
              value={`${stats.engagement_score}%`}
              subtext="Score"
              icon="💬"
            />
          )}
        </Grid>
        <Grid item xs={6} sm={3}>
          {isLoading ? (
            <StatCardSkeleton />
          ) : (
            <AIManagerStatCard
              label="REFERRAL POTENTIAL"
              value={stats.referral_potential}
              subtext="High Value"
              icon="⭐"
            />
          )}
        </Grid>
      </Grid>

      {/* Quick Info Strip */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1.5,
          mb: 3,
        }}
      >
        {isLoading ? (
          // Loading skeletons for chips
          [...Array(4)].map((_, i) => (
            <Skeleton
              key={i}
              variant="rounded"
              width={160}
              height={36}
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', borderRadius: 4 }}
            />
          ))
        ) : (
          quickItems.map((item, index) => {
            const colors = getQuickItemColor(item.type);
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
          })
        )}
      </Box>

      {/* Action Strip */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          py: 1.5,
          px: 2,
          background: 'rgba(255,255,255,0.08)',
          borderRadius: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AutoAwesomeIcon sx={{ fontSize: 18, color: 'rgba(255,255,255,0.8)' }} />
          <Typography sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem' }}>
            {aiStatus.monitoring_all
              ? 'Monitoring all contact relationships'
              : 'AI coaching paused'}
          </Typography>
        </Box>
        <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
          Next: <strong>Weekly summary at {aiStatus.next_summary}</strong>
        </Typography>
      </Box>

      {/* Footer Buttons */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          startIcon={<SettingsIcon />}
          onClick={onConfigureAI}
          sx={{
            background: 'rgba(255,255,255,0.2)',
            color: '#fff',
            fontWeight: 600,
            px: 3,
            py: 1.25,
            borderRadius: 2,
            textTransform: 'none',
            '&:hover': {
              background: 'rgba(255,255,255,0.3)',
            },
          }}
        >
          Configure AI
        </Button>
        <Button
          variant="outlined"
          startIcon={<TrendingUpIcon />}
          onClick={onViewActivity}
          sx={{
            borderColor: 'rgba(255,255,255,0.4)',
            color: '#fff',
            fontWeight: 600,
            px: 3,
            py: 1.25,
            borderRadius: 2,
            textTransform: 'none',
            '&:hover': {
              borderColor: 'rgba(255,255,255,0.6)',
              background: 'rgba(255,255,255,0.1)',
            },
          }}
        >
          View All Activity
        </Button>
      </Box>
    </Box>
  );
};

export default AIManagerPage;
