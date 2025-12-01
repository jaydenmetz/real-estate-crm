import React, { useState } from 'react';
import { Box, Typography, Button, Chip, Grid, alpha } from '@mui/material';
import {
  Settings as SettingsIcon,
  TrendingUp as TrendingUpIcon,
  AutoAwesome as AutoAwesomeIcon,
} from '@mui/icons-material';
import AIManagerStatCard from './AIManagerStatCard';

/**
 * AIManagerPage - Full AI Manager hero page for escrows
 *
 * Page 2 of the escrows hero carousel.
 * Shows AI monitoring stats, quick action items, and configuration options.
 */
const AIManagerPage = ({ escrowsData = [], onConfigureAI, onViewActivity }) => {
  const [dateFilter, setDateFilter] = useState('1_month');

  // Calculate stats from escrow data (or use demo data)
  const stats = {
    aiManaged: escrowsData.length || 8,
    dueIn48h: 2,
    docsPending: 4,
    compliance: 97,
  };

  // Quick info items
  const quickItems = [
    {
      icon: '⏰',
      text: 'deadlines in 48h',
      value: 2,
      type: 'urgent',
    },
    {
      icon: '📄',
      text: 'docs awaiting signature',
      value: 4,
      type: 'pending',
    },
    {
      icon: '📞',
      text: 'follow-up needed',
      value: 1,
      type: 'info',
    },
    {
      icon: '✉️',
      text: 'reminders sent today',
      value: 4,
      type: 'success',
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
          <AIManagerStatCard
            label="AI-MANAGED"
            value={stats.aiManaged}
            subtext="Escrows"
            icon="📋"
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <AIManagerStatCard
            label="DUE IN 48H"
            value={stats.dueIn48h}
            subtext="Deadlines"
            icon="⏰"
            highlight={true}
            valueColor="#ffd54f"
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <AIManagerStatCard
            label="DOCS PENDING"
            value={stats.docsPending}
            subtext="Signatures"
            icon="📄"
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <AIManagerStatCard
            label="COMPLIANCE"
            value={`${stats.compliance}%`}
            subtext="On-Time"
            icon="✅"
          />
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
        {quickItems.map((item, index) => {
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
        })}
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
            Currently monitoring all escrows
          </Typography>
        </Box>
        <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
          Next: <strong>Daily summary at 5 PM</strong>
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
