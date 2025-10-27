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
  People,
  PersonAdd,
  TrendingUp,
  Schedule,
  CheckCircle,
  AttachMoney,
  TrendingDown,
  CalendarToday,
  Archive as ArchiveIcon,
  Storage,
} from '@mui/icons-material';
import ClientStatCard from './ClientStatCard';

// Styled Components - Cyan gradient for clients
const HeroSection = styled(Box)(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.spacing(3),
  overflow: 'hidden',
  background: 'linear-gradient(135deg, #0891B2 0%, #06B6D4 100%)',
  color: 'white',
  padding: theme.spacing(4),
  marginBottom: theme.spacing(4),
  boxShadow: '0 20px 60px rgba(8, 145, 178, 0.3)',
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(3),
  },
}));

const ClientHeroCard = ({
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
  setNewClientModalOpen,
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
                Clients
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
                            <ClientStatCard
                              icon={People}
                              title="Total Active Clients"
                              value={stats.totalClients || 0}
                              color="#ffffff"
                              delay={0}
                              goal={100}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <ClientStatCard
                              icon={PersonAdd}
                              title="New This Month"
                              value={stats.newThisMonth || 0}
                              color="#ffffff"
                              delay={1}
                              goal={10}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <ClientStatCard
                              icon={TrendingUp}
                              title="Total Client Value"
                              value={stats.totalClientValue || 0}
                              prefix="$"
                              suffix=""
                              color="#ffffff"
                              delay={2}
                              goal={5000000}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <ClientStatCard
                              icon={Schedule}
                              title="Avg Client Lifetime"
                              value={(stats.avgClientLifetime || 0) / 1000}
                              prefix="$"
                              suffix="K"
                              color="#ffffff"
                              delay={3}
                              showPrivacy={true}
                              goal={50}
                            />
                          </Grid>
                        </>
                      );

                    case 'lead':
                      return (
                        <>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <ClientStatCard
                              icon={CheckCircle}
                              title="Converted Leads"
                              value={stats.convertedLeads || 0}
                              color="#ffffff"
                              delay={0}
                              goal={25}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <ClientStatCard
                              icon={TrendingUp}
                              title="Conversion Rate"
                              value={stats.conversionRate || 0}
                              suffix="%"
                              color="#ffffff"
                              delay={1}
                              goal={30}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <ClientStatCard
                              icon={AttachMoney}
                              title="Potential Value"
                              value={stats.potentialValue || 0}
                              prefix="$"
                              suffix=""
                              color="#ffffff"
                              delay={2}
                              goal={2000000}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <ClientStatCard
                              icon={CalendarToday}
                              title="Avg Conversion Time"
                              value={stats.avgConversionTime || 0}
                              suffix=" days"
                              color="#ffffff"
                              delay={3}
                            />
                          </Grid>
                        </>
                      );

                    case 'inactive':
                      return (
                        <>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <ClientStatCard
                              icon={People}
                              title="Total Inactive"
                              value={stats.totalInactive || 0}
                              color="#ffffff"
                              delay={0}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <ClientStatCard
                              icon={TrendingDown}
                              title="Inactive Rate"
                              value={stats.inactiveRate || 0}
                              suffix="%"
                              color="#ffffff"
                              delay={1}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <ClientStatCard
                              icon={AttachMoney}
                              title="Lost Value"
                              value={stats.lostValue || 0}
                              prefix="$"
                              suffix=""
                              color="#ffffff"
                              delay={2}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <ClientStatCard
                              icon={Schedule}
                              title="Avg Days Inactive"
                              value={stats.avgDaysInactive || 0}
                              suffix=" days"
                              color="#ffffff"
                              delay={3}
                            />
                          </Grid>
                        </>
                      );

                    case 'archived':
                      return (
                        <>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <ClientStatCard
                              icon={ArchiveIcon}
                              title="Total Archived Clients"
                              value={archivedCount || 0}
                              color="#ffffff"
                              delay={0}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <ClientStatCard
                              icon={Storage}
                              title="Max Archived"
                              value={`${archivedCount || 0}/1000`}
                              color="#ffffff"
                              delay={1}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <ClientStatCard
                              icon={AttachMoney}
                              title="Total Lifetime Value"
                              value={stats.totalClientValue || 0}
                              prefix="$"
                              suffix=""
                              color="#ffffff"
                              delay={2}
                              showPrivacy={true}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <ClientStatCard
                              icon={CalendarToday}
                              title="Avg Client Age"
                              value={stats.avgClientLifetime ? `${Math.round(stats.avgClientLifetime / 365)}` : '0'}
                              suffix=" days"
                              color="#ffffff"
                              delay={3}
                            />
                          </Grid>
                        </>
                      );

                    default: // 'all' status
                      return (
                        <>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <ClientStatCard
                              icon={People}
                              title="Total Clients"
                              value={stats.totalClients || 0}
                              color="#ffffff"
                              delay={0}
                              goal={150}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <ClientStatCard
                              icon={CheckCircle}
                              title="Active Clients"
                              value={stats.activeClients || 0}
                              color="#ffffff"
                              delay={1}
                              goal={100}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <ClientStatCard
                              icon={AttachMoney}
                              title="Total Portfolio Value"
                              value={stats.totalPortfolioValue || 0}
                              prefix="$"
                              suffix=""
                              color="#ffffff"
                              delay={2}
                              showPrivacy={true}
                              goal={10000000}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <ClientStatCard
                              icon={TrendingUp}
                              title="Avg Transactions/Client"
                              value={stats.avgTransactionsPerClient || 0}
                              color="#ffffff"
                              delay={3}
                              goal={5}
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
                  onClick={() => setNewClientModalOpen(true)}
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
                  Add New Client
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
                  Client Analytics
                </Button>
              </Box>
            </Box>

            {/* Right container: AI Client Manager */}
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
                    background: 'linear-gradient(135deg, rgba(8, 145, 178, 0.12) 0%, rgba(6, 182, 212, 0.08) 100%)',
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
                      background: 'linear-gradient(135deg, rgba(8, 145, 178, 0.18) 0%, rgba(6, 182, 212, 0.12) 100%)',
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
                        AI Client Manager
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'rgba(255, 255, 255, 0.7)',
                          mb: 2,
                          fontSize: '0.875rem',
                        }}
                      >
                        Hire an AI assistant to manage client relationships, send reminders, and track touchpoints.
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

      {/* Conditional Date Controls - Show between hero and tabs when AI Manager wraps below */}
      <Box
        sx={{
          display: { xs: 'flex', sm: 'flex', md: 'none' },
          justifyContent: 'center',
          mb: 3,
          mt: -2,
        }}
      >
        {/* Compact rounded rectangle around date controls */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            background: 'linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)',
            borderRadius: 2,
            px: 2,
            py: 1.5,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          }}
        >
          {/* Mobile Date Controls - Same as desktop */}
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

          {/* Date Range Pickers */}
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
    </>
  );
};

export default ClientHeroCard;
