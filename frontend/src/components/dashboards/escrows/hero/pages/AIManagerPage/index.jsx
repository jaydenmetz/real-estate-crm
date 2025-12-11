import React, { useState } from 'react';
import { Box, Typography, Button, Grid, Skeleton } from '@mui/material';
import {
  Settings as SettingsIcon,
  TrendingUp as TrendingUpIcon,
  AutoAwesome as AutoAwesomeIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import apiInstance from '../../../../../../services/api.service';
import AIManagerStatCard from './AIManagerStatCard';
import AIManagerQuickItems from '../../../../../common/ai/AIManagerQuickItems';

/**
 * AIManagerPage - Full AI Manager hero page for escrows
 *
 * Page 2 of the escrows hero carousel.
 * Shows AI monitoring stats, quick action items, and configuration options.
 *
 * Data is lazily loaded from /v1/escrows/manager when the page becomes visible.
 */
const AIManagerPage = ({ isVisible = true, onConfigureAI, onViewActivity }) => {
  const [dateFilter, setDateFilter] = useState('1_month');

  // Lazy load data only when visible
  const { data, isLoading, error } = useQuery({
    queryKey: ['escrows', 'manager', dateFilter],
    queryFn: async () => {
      const response = await apiInstance.get(`/escrows/manager?period=${dateFilter}`);
      return response.data;
    },
    enabled: isVisible, // Only fetch when page is visible
    staleTime: 30000, // Consider data fresh for 30 seconds
    refetchOnWindowFocus: false,
  });

  // Extract data from response
  const stats = data?.data?.stats || {
    managed_count: 0,
    due_in_48h: 0,
    docs_pending: 0,
    compliance_rate: 100,
  };

  // Standardized quick items data (used by AIManagerQuickItems component)
  const quickItemsData = data?.data?.quick_items || {
    tasks_queued: 0,
    reminders_scheduled: 0,
    actions_today: 0,
    alerts_for_you: 0,
  };

  const aiStatus = data?.data?.ai_status || {
    is_active: true,
    monitoring_all: true,
    next_summary: '5 PM',
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
        background: 'linear-gradient(135deg, #4a90d9 0%, #5ba0e8 50%, #6bb0f0 100%)',
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
          AI Escrow Manager
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
              label="AI-MANAGED"
              value={stats.managed_count}
              subtext="Escrows"
              icon="📋"
            />
          )}
        </Grid>
        <Grid item xs={6} sm={3}>
          {isLoading ? (
            <StatCardSkeleton />
          ) : (
            <AIManagerStatCard
              label="DUE IN 48H"
              value={stats.due_in_48h}
              subtext="Deadlines"
              icon="⏰"
              highlight={stats.due_in_48h > 0}
              valueColor={stats.due_in_48h > 0 ? '#ffd54f' : undefined}
            />
          )}
        </Grid>
        <Grid item xs={6} sm={3}>
          {isLoading ? (
            <StatCardSkeleton />
          ) : (
            <AIManagerStatCard
              label="DOCS PENDING"
              value={stats.docs_pending}
              subtext="Signatures"
              icon="📄"
            />
          )}
        </Grid>
        <Grid item xs={6} sm={3}>
          {isLoading ? (
            <StatCardSkeleton />
          ) : (
            <AIManagerStatCard
              label="COMPLIANCE"
              value={`${stats.compliance_rate}%`}
              subtext="On-Time"
              icon="✅"
            />
          )}
        </Grid>
      </Grid>

      {/* Quick Info Strip - Standardized across all AI Managers */}
      <Box sx={{ mb: 3 }}>
        <AIManagerQuickItems data={quickItemsData} isLoading={isLoading} />
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
              ? 'Currently monitoring all escrows'
              : 'AI monitoring paused'}
          </Typography>
        </Box>
        <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
          Next: <strong>Daily summary at {aiStatus.next_summary}</strong>
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
