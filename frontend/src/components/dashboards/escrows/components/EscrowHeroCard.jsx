import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  ToggleButton,
  ToggleButtonGroup,
  Button,
  Grid,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { motion } from 'framer-motion';
import {
  Add,
  Assessment,
  Home,
  CheckCircle,
  TrendingUp,
  AttachMoney,
  Archive as ArchiveIcon,
  Storage,
} from '@mui/icons-material';
import EscrowStatCard from './EscrowStatCard';

// Styled Components - Blue gradient for escrows
const HeroSection = styled(Box)(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.spacing(3),
  overflow: 'hidden',
  background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)', // Blue gradient
  color: 'white',
  padding: theme.spacing(4),
  marginBottom: theme.spacing(4),
  boxShadow: '0 20px 60px rgba(25, 118, 210, 0.3)',
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(3),
  },
}));

const EscrowHeroCard = ({
  dateRangeFilter,
  setDateRangeFilter,
  customStartDate,
  setCustomStartDate,
  customEndDate,
  setCustomEndDate,
  dateRange,
  detectPresetRange,
  selectedStatus,
  stats,
  archivedCount,
  setNewEscrowModalOpen,
}) => {
  // Local state for date pickers - must be defined here, not in parent
  const [startDatePickerOpen, setStartDatePickerOpen] = useState(false);
  const [endDatePickerOpen, setEndDatePickerOpen] = useState(false);

  return (
    <>
      <HeroSection>
        {/* Wrapper for header and main content */}
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

          {/* Header Row - Full width above both containers */}
          <Box sx={{
            display: 'flex',
            gap: 3,
            alignItems: 'center',
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            mb: 3,
            width: '100%',
          }}>
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              style={{ flexShrink: 0 }}
            >
              <Typography variant="h3" component="h1" sx={{ fontWeight: 700 }}>
                Escrows
              </Typography>
            </motion.div>

            {/* Date Controls Container - always show in header, right-aligned */}
            <Box sx={{
              display: 'flex',
              gap: 2,
              alignItems: 'center',
              flexWrap: 'nowrap',
              flexShrink: 0,
              marginLeft: 'auto',
            }}>
              {/* Date Buttons */}
              <ToggleButtonGroup
                value={dateRangeFilter}
                exclusive
                onChange={(e, newValue) => {
                  if (newValue !== null) {
                    setDateRangeFilter(newValue);
                    setCustomStartDate(null);
                    setCustomEndDate(null);
                  }
                }}
                size="small"
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 1,
                  flexShrink: 0,
                  flexGrow: 0,
                  height: 36,
                  '& .MuiToggleButton-root': {
                    color: 'rgba(255, 255, 255, 0.8)',
                    borderColor: 'transparent',
                    fontSize: { xs: '0.75rem', md: '0.875rem' },
                    fontWeight: 600,
                    px: { xs: 1.5, md: 2 },
                    py: 0,
                    height: 36,
                    minWidth: 'auto',
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      color: 'white',
                      borderColor: 'transparent',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.3)',
                      },
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      borderColor: 'transparent',
                    },
                  },
                }}
              >
                <ToggleButton value="1D">1 Day</ToggleButton>
                <ToggleButton value="1M">1 Month</ToggleButton>
                <ToggleButton value="1Y">1 Year</ToggleButton>
                <ToggleButton value="YTD">YTD</ToggleButton>
              </ToggleButtonGroup>

              {/* Date Range Pickers - No Labels */}
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <Box sx={{
                  display: 'flex',
                  gap: 0.5,
                  alignItems: 'center',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 1,
                  px: 0.5,
                  height: 36,
                  border: '1px solid transparent',
                  flexShrink: 0,
                  flexGrow: 0,
                }}>
                  <DatePicker
                    open={startDatePickerOpen}
                    onOpen={() => setStartDatePickerOpen(true)}
                    onClose={() => setStartDatePickerOpen(false)}
                    format="MMM d, yyyy"
                    value={(() => {
                      try {
                        const date = customStartDate || dateRange?.startDate;
                        if (!date) return null;
                        if (typeof date === 'string') {
                          const parsed = new Date(date);
                          if (isNaN(parsed.getTime())) return null;
                          return parsed;
                        }
                        if (!(date instanceof Date)) return null;
                        if (isNaN(date.getTime())) return null;
                        return date;
                      } catch (e) {
                        console.error('DatePicker value error:', e);
                        return null;
                      }
                    })()}
                    onChange={(newDate) => {
                      setCustomStartDate(newDate);
                      if (newDate && customEndDate) {
                        const matched = detectPresetRange(newDate, customEndDate);
                        setDateRangeFilter(matched);
                      } else {
                        setDateRangeFilter(null);
                      }
                    }}
                    slotProps={{
                      textField: {
                        size: 'small',
                        placeholder: 'Start',
                        onClick: () => setStartDatePickerOpen(true),
                        sx: {
                          width: { xs: 105, md: 115 },
                          '& .MuiInputBase-root': {
                            backgroundColor: 'transparent',
                            borderColor: 'rgba(255, 255, 255, 0.3)',
                            height: 36,
                            paddingRight: '8px !important',
                          },
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                              borderColor: 'transparent',
                            },
                            '&:hover fieldset': {
                              borderColor: 'transparent',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: 'transparent',
                            },
                          },
                          '& .MuiInputBase-input': {
                            fontSize: { xs: '0.75rem', md: '0.875rem' },
                            fontWeight: 600,
                            cursor: 'pointer',
                            textAlign: 'center',
                            color: 'rgba(255, 255, 255, 0.9)',
                            padding: '6px 8px',
                          },
                          '& .MuiInputAdornment-root': {
                            display: 'none',
                          },
                          '& .MuiInputLabel-root': {
                            display: 'none',
                          },
                          '& .MuiOutlinedInput-notchedOutline legend': {
                            display: 'none',
                          },
                        },
                      },
                      openPickerButton: {
                        sx: { display: 'none' },
                      },
                    }}
                  />
                  <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', mx: 0.5, flexShrink: 0 }}>→</Typography>
                  <DatePicker
                    open={endDatePickerOpen}
                    onOpen={() => setEndDatePickerOpen(true)}
                    onClose={() => setEndDatePickerOpen(false)}
                    format="MMM d, yyyy"
                    value={(() => {
                      try {
                        const date = customEndDate || dateRange?.endDate;
                        if (!date) return null;
                        if (typeof date === 'string') {
                          const parsed = new Date(date);
                          if (isNaN(parsed.getTime())) return null;
                          return parsed;
                        }
                        if (!(date instanceof Date)) return null;
                        if (isNaN(date.getTime())) return null;
                        return date;
                      } catch (e) {
                        console.error('DatePicker value error:', e);
                        return null;
                      }
                    })()}
                    onChange={(newDate) => {
                      setCustomEndDate(newDate);
                      if (customStartDate && newDate) {
                        const matched = detectPresetRange(customStartDate, newDate);
                        setDateRangeFilter(matched);
                      } else {
                        setDateRangeFilter(null);
                      }
                    }}
                    slotProps={{
                      textField: {
                        size: 'small',
                        placeholder: 'End',
                        onClick: () => setEndDatePickerOpen(true),
                        sx: {
                          width: { xs: 105, md: 115 },
                          '& .MuiInputBase-root': {
                            backgroundColor: 'transparent',
                            borderColor: 'rgba(255, 255, 255, 0.3)',
                            height: 36,
                            paddingRight: '8px !important',
                          },
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                              borderColor: 'transparent',
                            },
                            '&:hover fieldset': {
                              borderColor: 'transparent',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: 'transparent',
                            },
                          },
                          '& .MuiInputBase-input': {
                            fontSize: { xs: '0.75rem', md: '0.875rem' },
                            fontWeight: 600,
                            cursor: 'pointer',
                            textAlign: 'center',
                            color: 'rgba(255, 255, 255, 0.9)',
                            padding: '6px 8px',
                          },
                          '& .MuiInputAdornment-root': {
                            display: 'none',
                          },
                          '& .MuiInputLabel-root': {
                            display: 'none',
                          },
                          '& .MuiOutlinedInput-notchedOutline legend': {
                            display: 'none',
                          },
                        },
                      },
                      openPickerButton: {
                        sx: { display: 'none' },
                      },
                    }}
                  />
                </Box>
              </LocalizationProvider>
            </Box>
          </Box>

          {/* Main Content Row - Left and Right Containers */}
          <Box sx={{
            display: 'flex',
            gap: 3,
            alignItems: 'stretch',
            flexDirection: { xs: 'column', md: 'row' },
            height: '100%',
          }}>
            {/* Left container: Stats Grid */}
            <Box sx={{
              flex: '1 1 auto',
              display: 'flex',
              flexDirection: 'column',
              minWidth: 0,
            }}>
              {/* Stats Grid - White Cards - Dynamic based on selected tab */}
              <Grid container spacing={2}>
                {(() => {
                  switch(selectedStatus) {
                    case 'active':
                      return (
                        <>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <EscrowStatCard
                              icon={Home}
                              title="Total Escrows"
                              value={stats.total || 0}
                              color="#ffffff"
                              delay={0}
                              goal={50}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <EscrowStatCard
                              icon={CheckCircle}
                              title="Active Escrows"
                              value={stats.active || 0}
                              color="#ffffff"
                              delay={1}
                              goal={30}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <EscrowStatCard
                              icon={AttachMoney}
                              title="Active Volume"
                              value={stats.activeVolume || 0}
                              prefix="$"
                              suffix=""
                              color="#ffffff"
                              delay={2}
                              showPrivacy={true}
                              goal={10000000}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <EscrowStatCard
                              icon={TrendingUp}
                              title="Closed Volume"
                              value={stats.closedVolume || 0}
                              prefix="$"
                              suffix=""
                              color="#ffffff"
                              delay={3}
                              showPrivacy={true}
                              goal={20000000}
                            />
                          </Grid>
                        </>
                      );

                    case 'archived':
                      return (
                        <>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <EscrowStatCard
                              icon={ArchiveIcon}
                              title="Total Archived Escrows"
                              value={archivedCount || 0}
                              color="#ffffff"
                              delay={0}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <EscrowStatCard
                              icon={Storage}
                              title="Max Archived"
                              value={`${archivedCount || 0}/1000`}
                              color="#ffffff"
                              delay={1}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <EscrowStatCard
                              icon={AttachMoney}
                              title="Total Volume"
                              value={stats.activeVolume || 0}
                              prefix="$"
                              suffix=""
                              color="#ffffff"
                              delay={2}
                              showPrivacy={true}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <EscrowStatCard
                              icon={Home}
                              title="Avg Escrow Value"
                              value={stats.total > 0 ? (stats.activeVolume || 0) / stats.total : 0}
                              prefix="$"
                              suffix=""
                              color="#ffffff"
                              delay={3}
                              showPrivacy={true}
                            />
                          </Grid>
                        </>
                      );

                    default: // 'all' status
                      return (
                        <>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <EscrowStatCard
                              icon={Home}
                              title="Total Escrows"
                              value={stats.total || 0}
                              color="#ffffff"
                              delay={0}
                              goal={100}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <EscrowStatCard
                              icon={CheckCircle}
                              title="Active Escrows"
                              value={stats.active || 0}
                              color="#ffffff"
                              delay={1}
                              goal={50}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <EscrowStatCard
                              icon={AttachMoney}
                              title="Active Volume"
                              value={stats.activeVolume || 0}
                              prefix="$"
                              suffix=""
                              color="#ffffff"
                              delay={2}
                              showPrivacy={true}
                              goal={15000000}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <EscrowStatCard
                              icon={TrendingUp}
                              title="Closed Volume"
                              value={stats.closedVolume || 0}
                              prefix="$"
                              suffix=""
                              color="#ffffff"
                              delay={3}
                              showPrivacy={true}
                              goal={30000000}
                            />
                          </Grid>
                        </>
                      );
                  }
                })()}
              </Grid>

              {/* Flexible spacer to push buttons to bottom */}
              <Box sx={{ flexGrow: 1, minHeight: '20px' }} />

              {/* Action Buttons Row - Aligned to bottom */}
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  size="medium"
                  startIcon={<Add />}
                  onClick={() => setNewEscrowModalOpen(true)}
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    backdropFilter: 'blur(10px)',
                    fontWeight: 600,
                    px: 3,
                    py: 1,
                    borderRadius: 2,
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.3)',
                    }
                  }}
                >
                  Add New Escrow
                </Button>
                <Button
                  variant="outlined"
                  size="medium"
                  startIcon={<Assessment />}
                  sx={{
                    color: 'white',
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    px: 3,
                    py: 1,
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    }
                  }}
                >
                  Escrow Analytics
                </Button>
              </Box>
            </Box>

            {/* Right container: AI Escrow Manager */}
            <Box sx={{
              width: { xs: '100%', md: '280px', lg: '320px' },
              minWidth: { md: '280px' },
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}>
              {/* Spacer */}
              <Box sx={{ flexGrow: 1 }} />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Card
                  elevation={0}
                  sx={{
                    aspectRatio: { xs: 'auto', md: '1 / 1' },
                    minHeight: { xs: 250, md: 320 },
                    position: 'relative',
                    overflow: 'hidden',
                    background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.12) 0%, rgba(66, 165, 245, 0.08) 100%)',
                    backdropFilter: 'blur(10px)',
                    border: '2px dashed rgba(255, 255, 255, 0.3)',
                    borderRadius: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      border: '2px dashed rgba(255, 255, 255, 0.5)',
                      background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.18) 0%, rgba(66, 165, 245, 0.12) 100%)',
                    }
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <Box>
                      <Box
                        sx={{
                          width: 64,
                          height: 64,
                          borderRadius: '50%',
                          background: 'rgba(255, 255, 255, 0.15)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto',
                          mb: 2,
                        }}
                      >
                        <Typography sx={{ fontSize: '2rem' }}>🤖</Typography>
                      </Box>
                      <Typography
                        variant="h6"
                        sx={{
                          color: 'rgba(255, 255, 255, 0.95)',
                          fontWeight: 700,
                          mb: 1,
                          letterSpacing: '0.02em',
                        }}
                      >
                        AI Escrow Manager
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'rgba(255, 255, 255, 0.7)',
                          mb: 2,
                          fontSize: '0.875rem',
                        }}
                      >
                        Hire an AI assistant to manage escrows, track deadlines, and automate document workflows.
                      </Typography>
                      <Box
                        sx={{
                          display: 'inline-block',
                          px: 2,
                          py: 0.75,
                          borderRadius: 2,
                          background: 'rgba(255, 255, 255, 0.2)',
                          backdropFilter: 'blur(5px)',
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'white',
                            fontWeight: 600,
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            fontSize: '0.75rem',
                          }}
                        >
                          Coming Soon
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
              {/* Spacer */}
              <Box sx={{ flexGrow: 1 }} />
            </Box>
          </Box>
        </Box>
      </HeroSection>
    </>
  );
};

export default EscrowHeroCard;
