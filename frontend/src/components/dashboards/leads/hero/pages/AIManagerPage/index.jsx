import React, { useState } from 'react';
import { Box, Typography, Button, Grid, MenuItem, Select } from '@mui/material';
import {
  AutoAwesome as AutoAwesomeIcon,
  Psychology as PsychologyIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import apiInstance from '../../../../../../services/api.service';
import AIManagerStatCard from './AIManagerStatCard';
import AIManagerQuickItems from '../../../../../common/ai/AIManagerQuickItems';

/**
 * AIManagerPage - Page 2 of the leads hero carousel
 *
 * Displays AI Lead Nurturing Manager statistics and controls:
 * - AI-Scored leads count
 * - Hot Leads (high probability conversion)
 * - Pending Follow-ups
 * - Conversion Rate
 *
 * Features:
 * - Lazy loading with React Query (only fetches when visible)
 * - Period filter (Today, 7 days, 30 days, All)
 * - Real-time stat updates
 *
 * Color Theme: Green (#10b981) - representing growth and nurturing
 */
const AIManagerPage = ({ isVisible, onConfigureAI, onViewActivity }) => {
  const [dateFilter, setDateFilter] = useState('7d');

  // Fetch AI manager stats - only when page is visible
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['leads', 'manager', dateFilter],
    queryFn: async () => {
      const response = await apiInstance.get(`/leads/manager?period=${dateFilter}`);
      return response.data;
    },
    enabled: isVisible, // Only fetch when page is visible
    staleTime: 30000, // 30 seconds
  });

  // Default stats when loading or no data
  const stats = data?.stats || {
    aiScored: 0,
    hotLeads: 0,
    pendingFollowups: 0,
    conversionRate: 0,
  };

  // Standardized quick items data (used by AIManagerQuickItems component)
  const quickItemsData = data?.quick_items || {
    tasks_queued: 0,
    reminders_scheduled: 0,
    actions_today: 0,
    alerts_for_you: 0,
  };

  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, #047857 0%, #10b981 50%, #34d399 100%)',
        borderRadius: 3,
        p: 4,
        minHeight: 340,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background decoration */}
      <Box
        sx={{
          position: 'absolute',
          top: -100,
          right: -100,
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -50,
          left: -50,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.03)',
          pointerEvents: 'none',
        }}
      />

      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          mb: 4,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 2,
              background: 'rgba(255,255,255,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <PsychologyIcon sx={{ fontSize: 32, color: '#FFD700' }} />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700 }}>
              AI Lead Nurturing Manager
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              Intelligent scoring & automated nurturing
            </Typography>
          </Box>
        </Box>

        {/* Period Filter */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            size="small"
            sx={{
              color: '#fff',
              '.MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255,255,255,0.3)',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255,255,255,0.5)',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#fff',
              },
              '.MuiSvgIcon-root': {
                color: '#fff',
              },
            }}
          >
            <MenuItem value="today">Today</MenuItem>
            <MenuItem value="7d">Last 7 Days</MenuItem>
            <MenuItem value="30d">Last 30 Days</MenuItem>
            <MenuItem value="all">All Time</MenuItem>
          </Select>
          <Button
            size="small"
            onClick={() => refetch()}
            sx={{
              color: '#fff',
              minWidth: 40,
              '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
            }}
          >
            <RefreshIcon />
          </Button>
        </Box>
      </Box>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 3, position: 'relative', zIndex: 1 }}>
        <Grid item xs={6} md={3}>
          <AIManagerStatCard
            title="AI-Scored"
            value={stats.aiScored}
            subtitle="Leads analyzed"
            loading={isLoading}
            color="#10b981"
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <AIManagerStatCard
            title="Hot Leads"
            value={stats.hotLeads}
            subtitle="High conversion"
            loading={isLoading}
            color="#ef4444"
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <AIManagerStatCard
            title="Pending Follow-ups"
            value={stats.pendingFollowups}
            subtitle="Need attention"
            loading={isLoading}
            color="#f59e0b"
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <AIManagerStatCard
            title="Conversion Rate"
            value={`${stats.conversionRate}%`}
            subtitle="This period"
            loading={isLoading}
            color="#6366f1"
          />
        </Grid>
      </Grid>

      {/* Quick Info Strip - Standardized across all AI Managers */}
      <Box sx={{ mb: 3, position: 'relative', zIndex: 1 }}>
        <AIManagerQuickItems data={quickItemsData} isLoading={isLoading} />
      </Box>

      {/* Action Buttons */}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Button
          variant="contained"
          startIcon={<SettingsIcon />}
          onClick={onConfigureAI}
          sx={{
            bgcolor: 'rgba(255,255,255,0.2)',
            color: '#fff',
            '&:hover': {
              bgcolor: 'rgba(255,255,255,0.3)',
            },
          }}
        >
          Configure AI
        </Button>
        <Button
          variant="outlined"
          startIcon={<AutoAwesomeIcon />}
          onClick={onViewActivity}
          sx={{
            borderColor: 'rgba(255,255,255,0.4)',
            color: '#fff',
            '&:hover': {
              borderColor: '#fff',
              bgcolor: 'rgba(255,255,255,0.1)',
            },
          }}
        >
          View AI Activity
        </Button>
      </Box>
    </Box>
  );
};

export default AIManagerPage;
