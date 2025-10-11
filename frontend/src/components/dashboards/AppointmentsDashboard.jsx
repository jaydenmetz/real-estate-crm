import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  Button,
  Chip,
  CircularProgress,
  alpha,
  Stack,
  Tabs,
  Tab,
  ToggleButton,
  ToggleButtonGroup,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  useTheme,
  IconButton,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  TrendingUp,
  TrendingDown,
  Event,
  CalendarToday,
  CheckCircle,
  Add,
  Assessment,
  Cancel,
  Schedule,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import CountUp from 'react-countup';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { appointmentsAPI } from '../../services/api.service';

// Styled Components
const HeroSection = styled(Box)(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.spacing(3),
  overflow: 'hidden',
  background: 'linear-gradient(135deg, #F57C00 0%, #FFB74D 100%)',
  color: 'white',
  padding: theme.spacing(4),
  marginBottom: theme.spacing(4),
  boxShadow: '0 20px 60px rgba(245, 124, 0, 0.3)',
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(3),
  },
}));

// Enhanced animated stat card component with new layout structure
const StatCard = ({ icon: Icon, title, value, prefix = '', suffix = '', color, delay = 0, trend, showPrivacy = false, goal }) => {
  const theme = useTheme();
  const [showValue, setShowValue] = useState(false);

  // Mask value for privacy
  const maskValue = (val) => {
    return '***';
  };

  // Calculate percentage difference from goal
  const percentageToGoal = goal && typeof value === 'number' && typeof goal === 'number'
    ? ((value / goal - 1) * 100).toFixed(1)
    : null;
  const isAboveGoal = percentageToGoal && parseFloat(percentageToGoal) >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.4,
        delay: delay * 0.08,
        ease: [0.34, 1.56, 0.64, 1]
      }}
    >
      <Card
        elevation={0}
        sx={{
          height: 200, // Fixed height for consistency
          position: 'relative',
          overflow: 'hidden',
          background: `linear-gradient(135deg, ${alpha(color, 0.15)} 0%, ${alpha(color, 0.08)} 100%)`,
          backdropFilter: 'blur(10px)',
          border: `1px solid ${alpha(color, 0.3)}`,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-8px) scale(1.02)',
            boxShadow: `0 20px 40px ${alpha(color, 0.25)}`,
            border: `1px solid ${alpha(color, 0.5)}`,
          },
        }}
      >
        <CardContent sx={{ position: 'relative', zIndex: 1, p: 2.5, '&:last-child': { pb: 2.5 }, display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
          {/* Top: Title with enhanced styling */}
          <Box sx={{ mb: 2, minHeight: 40, display: 'flex', alignItems: 'center' }}>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  letterSpacing: 0.3,
                  textTransform: 'uppercase',
                  fontSize: '0.8125rem',
                  color: 'rgba(255, 255, 255, 0.95)',
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 100%)',
                  px: 2,
                  py: 0.75,
                  borderRadius: '8px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  whiteSpace: 'nowrap',
                  backdropFilter: 'blur(10px)',
                }}
              >
                {title}
              </Typography>
            </Box>
          </Box>

          {/* Middle: Count on left, Icon on right */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: 1, my: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, minWidth: 0 }}>
              {showPrivacy && (
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowValue(!showValue);
                  }}
                  sx={{
                    width: 28,
                    height: 28,
                    color: 'rgba(255,255,255,0.8)',
                    flexShrink: 0,
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      color: 'white',
                    },
                  }}
                >
                  {showValue ? (
                    <VisibilityOff sx={{ fontSize: 18 }} />
                  ) : (
                    <Visibility sx={{ fontSize: 18 }} />
                  )}
                </IconButton>
              )}
              <Typography
                variant="h3"
                component="div"
                sx={{
                  fontWeight: 700,
                  color: 'white',
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 0.5,
                  fontSize: 'clamp(1.5rem, 4vw, 2.25rem)',
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {showPrivacy && !showValue ? (
                  <span>{maskValue(value)}</span>
                ) : typeof value === 'string' ? (
                  // Custom string value (no CountUp animation)
                  <>
                    {prefix && <span style={{ fontSize: 'clamp(0.9rem, 2.5vw, 1.5rem)' }}>{prefix}</span>}
                    <span>{value}</span>
                    {suffix && <span style={{ fontSize: 'clamp(0.9rem, 2.5vw, 1.5rem)' }}>{suffix}</span>}
                  </>
                ) : (
                  // Numeric value with CountUp animation
                  <>
                    {prefix && <span style={{ fontSize: 'clamp(0.9rem, 2.5vw, 1.5rem)' }}>{prefix}</span>}
                    <CountUp
                      end={value}
                      duration={2.5}
                      separator=","
                      decimals={0}
                    />
                    {suffix && <span style={{ fontSize: 'clamp(0.9rem, 2.5vw, 1.5rem)' }}>{suffix}</span>}
                  </>
                )}
              </Typography>
            </Box>

            <Box
              sx={{
                position: 'relative',
                width: 56,
                height: 56,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.15)',
                  border: '2px solid rgba(255,255,255,0.2)',
                }}
              />
              <Icon sx={{ fontSize: 32, color: 'rgba(255,255,255,0.9)', zIndex: 1 }} />
            </Box>
          </Box>

          {/* Bottom: Goal section with white background */}
          {goal && (
            <Box
              sx={{
                mt: 2,
                mx: -2.5,
                mb: -2.5,
                px: 2.5,
                py: 1,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)',
                borderTop: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '0 0 8px 8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500, fontSize: '0.75rem' }}>
                  Goal:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#475569', fontSize: '0.875rem' }}>
                  {prefix}{typeof goal === 'number' ? goal.toLocaleString() : goal}{suffix}
                </Typography>
              </Box>

              {percentageToGoal && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {isAboveGoal ? (
                    <TrendingUp sx={{ fontSize: 18, color: '#10b981' }} />
                  ) : (
                    <TrendingDown sx={{ fontSize: 18, color: '#ef4444' }} />
                  )}
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color: isAboveGoal ? '#10b981' : '#ef4444',
                      fontSize: '0.875rem',
                    }}
                  >
                    ({isAboveGoal ? '+' : ''}{percentageToGoal}%)
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

const AppointmentsDashboard = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('upcoming');
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('appointmentsViewMode') || 'small');
  const [sortBy, setSortBy] = useState('appointment_date');
  const [dateRangeFilter, setDateRangeFilter] = useState('1M');
  const [customStartDate, setCustomStartDate] = useState(null);
  const [customEndDate, setCustomEndDate] = useState(null);
  const [startDatePickerOpen, setStartDatePickerOpen] = useState(false);
  const [endDatePickerOpen, setEndDatePickerOpen] = useState(false);
  const [stats, setStats] = useState({
    totalUpcoming: 0,
    thisWeek: 0,
    thisMonth: 0,
    noShowRate: 0,
    totalCompleted: 0,
    completedThisMonth: 0,
    successRate: 0,
    avgDuration: 0,
    totalCancelled: 0,
    cancellationRate: 0,
    lastMinuteCancellations: 0,
    rescheduled: 0,
    totalAppointments: 0,
    upcomingAppointments: 0,
    completionRate: 0,
    avgPerWeek: 0,
  });

  useEffect(() => { localStorage.setItem('appointmentsViewMode', viewMode); }, [viewMode]);
  useEffect(() => { fetchAppointments(); }, []);
  useEffect(() => {
    if (appointments.length > 0) calculateStats(appointments, selectedStatus);
    else calculateStats([], selectedStatus);
  }, [selectedStatus, appointments, customStartDate, customEndDate, dateRangeFilter]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await appointmentsAPI.getAll();
      if (response.success) {
        const data = response.data.appointments || response.data || [];
        setAppointments(data);
        calculateStats(data, selectedStatus);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper to check if two dates are the same day
  const isSameDay = (date1, date2) => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  };

  // Check if custom dates match a preset range
  const detectPresetRange = (start, end) => {
    if (!start || !end) return null;

    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    // Normalize the input dates to compare (ignore time)
    const startDay = new Date(start);
    startDay.setHours(0, 0, 0, 0);
    const endDay = new Date(end);
    endDay.setHours(0, 0, 0, 0);

    // Check 1D (today)
    if (isSameDay(startDay, today) && isSameDay(endDay, today)) {
      return '1D';
    }

    // Check 1M (last 30 days) - end should be today
    const oneMonthAgo = new Date(today);
    oneMonthAgo.setDate(today.getDate() - 30);
    if (isSameDay(startDay, oneMonthAgo) && isSameDay(endDay, today)) {
      return '1M';
    }

    // Check 1Y (last 365 days) - end should be today
    const oneYearAgo = new Date(today);
    oneYearAgo.setDate(today.getDate() - 365);
    if (isSameDay(startDay, oneYearAgo) && isSameDay(endDay, today)) {
      return '1Y';
    }

    // Check YTD (year to date) - end should be today
    const ytdStart = new Date(now.getFullYear(), 0, 1);
    if (isSameDay(startDay, ytdStart) && isSameDay(endDay, today)) {
      return 'YTD';
    }

    return null;
  };

  // Calculate date range based on filter or custom dates
  const getDateRange = () => {
    const now = new Date();
    let startDate, endDate;

    // Use custom dates if both are set
    if (customStartDate && customEndDate) {
      startDate = customStartDate;
      endDate = customEndDate;

      // Auto-detect if custom dates match a preset
      const matchedPreset = detectPresetRange(startDate, endDate);
      if (matchedPreset && dateRangeFilter !== matchedPreset) {
        setDateRangeFilter(matchedPreset);
      } else if (!matchedPreset && dateRangeFilter !== null) {
        setDateRangeFilter(null);
      }
    } else {
      // Use preset ranges
      switch(dateRangeFilter) {
        case '1D':
          // Today from 12:00 AM to 11:59 PM
          startDate = new Date(now);
          startDate.setHours(0, 0, 0, 0); // Midnight
          endDate = new Date(now);
          endDate.setHours(23, 59, 59, 999); // End of day
          break;
        case '1M':
          // Last 30 days
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 30);
          endDate = now;
          break;
        case '1Y':
          // Last 365 days
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 365);
          endDate = now;
          break;
        case 'YTD':
          // Year to date
          startDate = new Date(now.getFullYear(), 0, 1);
          endDate = now;
          break;
        default:
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 30);
          endDate = now;
      }
    }

    // Validate dates before formatting
    const validStart = startDate instanceof Date && !isNaN(startDate.getTime()) ? startDate : new Date();
    const validEnd = endDate instanceof Date && !isNaN(endDate.getTime()) ? endDate : new Date();

    return {
      startDate: validStart,
      endDate: validEnd,
      label: `${validStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${validEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
    };
  };

  const dateRange = getDateRange();

  const calculateStats = (data, statusFilter) => {
    if (!data || !Array.isArray(data)) {
      setStats({
        totalUpcoming: 0, thisWeek: 0, thisMonth: 0, noShowRate: 0,
        totalCompleted: 0, completedThisMonth: 0, successRate: 0, avgDuration: 0,
        totalCancelled: 0, cancellationRate: 0, lastMinuteCancellations: 0, rescheduled: 0,
        totalAppointments: 0, upcomingAppointments: 0, completionRate: 0, avgPerWeek: 0,
      });
      return;
    }

    const now = new Date();
    const { startDate, endDate } = dateRange;

    // Filter by date range
    const dateFiltered = data.filter(a => {
      const apptDate = new Date(a.appointmentDate || a.appointment_date);
      return apptDate >= startDate && apptDate <= endDate;
    });

    // Filter by status
    let filtered = dateFiltered.filter(a => {
      const apptDate = new Date(a.appointmentDate || a.appointment_date);
      const status = (a.appointmentStatus || a.appointment_status || '').toLowerCase();

      if (statusFilter === 'upcoming') return apptDate >= now && status !== 'cancelled';
      if (statusFilter === 'completed') return status === 'completed';
      if (statusFilter === 'cancelled') return status === 'cancelled';
      return true; // 'all'
    });

    const totalAll = dateFiltered.length;
    const totalCompleted = dateFiltered.filter(a => (a.appointmentStatus || a.appointment_status || '').toLowerCase() === 'completed').length;
    const totalCancelled = dateFiltered.filter(a => (a.appointmentStatus || a.appointment_status || '').toLowerCase() === 'cancelled').length;
    const totalUpcoming = dateFiltered.filter(a => {
      const apptDate = new Date(a.appointmentDate || a.appointment_date);
      return apptDate >= now && (a.appointmentStatus || a.appointment_status || '').toLowerCase() !== 'cancelled';
    }).length;

    // Week calculation
    const oneWeekFromNow = new Date(now);
    oneWeekFromNow.setDate(now.getDate() + 7);
    const thisWeek = dateFiltered.filter(a => {
      const apptDate = new Date(a.appointmentDate || a.appointment_date);
      return apptDate >= now && apptDate <= oneWeekFromNow;
    }).length;

    // Month calculation
    const oneMonthFromNow = new Date(now);
    oneMonthFromNow.setDate(now.getDate() + 30);
    const thisMonth = dateFiltered.filter(a => {
      const apptDate = new Date(a.appointmentDate || a.appointment_date);
      return apptDate >= now && apptDate <= oneMonthFromNow;
    }).length;

    const completedThisMonth = dateFiltered.filter(a => {
      const apptDate = new Date(a.appointmentDate || a.appointment_date);
      const monthAgo = new Date(now);
      monthAgo.setDate(now.getDate() - 30);
      return (a.appointmentStatus || a.appointment_status || '').toLowerCase() === 'completed' && apptDate >= monthAgo && apptDate <= now;
    }).length;

    // Calculate rates
    const noShowRate = totalAll > 0 ? ((totalCancelled / totalAll) * 100).toFixed(1) : 0;
    const successRate = totalAll > 0 ? ((totalCompleted / totalAll) * 100).toFixed(1) : 0;
    const cancellationRate = totalAll > 0 ? ((totalCancelled / totalAll) * 100).toFixed(1) : 0;
    const completionRate = totalAll > 0 ? ((totalCompleted / totalAll) * 100).toFixed(1) : 0;

    // Last minute cancellations (within 24 hours)
    const lastMinuteCancellations = dateFiltered.filter(a => {
      const apptDate = new Date(a.appointmentDate || a.appointment_date);
      const cancelledWithin24h = now - apptDate < 86400000; // 24 hours in ms
      return (a.appointmentStatus || a.appointment_status || '').toLowerCase() === 'cancelled' && cancelledWithin24h;
    }).length;

    // Avg duration (mock calculation)
    const avgDuration = 45; // minutes

    // Avg per week
    const daysDiff = (endDate - startDate) / (1000 * 60 * 60 * 24);
    const avgPerWeek = daysDiff > 0 ? Math.round((totalAll / daysDiff) * 7) : 0;

    setStats({
      // Upcoming stats
      totalUpcoming: totalUpcoming,
      thisWeek: thisWeek,
      thisMonth: thisMonth,
      noShowRate: noShowRate,
      // Completed stats
      totalCompleted: totalCompleted,
      completedThisMonth: completedThisMonth,
      successRate: successRate,
      avgDuration: avgDuration,
      // Cancelled stats
      totalCancelled: totalCancelled,
      cancellationRate: cancellationRate,
      lastMinuteCancellations: lastMinuteCancellations,
      rescheduled: Math.floor(totalCancelled * 0.6), // Mock 60% rescheduled
      // All stats
      totalAppointments: filtered.length,
      upcomingAppointments: totalUpcoming,
      completionRate: completionRate,
      avgPerWeek: avgPerWeek,
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>

        {/* Hero Section with Stats */}
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
                  Appointments
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
                    <ToggleButton value="1D">1D</ToggleButton>
                    <ToggleButton value="1M">1M</ToggleButton>
                    <ToggleButton value="1Y">1Y</ToggleButton>
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
                    case 'upcoming':
                      return (
                        <>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={Event}
                              title="Total Upcoming"
                              value={stats.totalUpcoming || 0}
                              color="#ffffff"
                              delay={0}
                              goal={20}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={CalendarToday}
                              title="This Week"
                              value={stats.thisWeek || 0}
                              color="#ffffff"
                              delay={1}
                              goal={5}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={Schedule}
                              title="This Month"
                              value={stats.thisMonth || 0}
                              color="#ffffff"
                              delay={2}
                              goal={15}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={Assessment}
                              title="No-Show Rate"
                              value={stats.noShowRate || 0}
                              suffix="%"
                              color="#ffffff"
                              delay={3}
                              goal={5}
                            />
                          </Grid>
                        </>
                      );

                    case 'completed':
                      return (
                        <>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={CheckCircle}
                              title="Total Completed"
                              value={stats.totalCompleted || 0}
                              color="#ffffff"
                              delay={0}
                              goal={100}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={CalendarToday}
                              title="Completed This Month"
                              value={stats.completedThisMonth || 0}
                              color="#ffffff"
                              delay={1}
                              goal={25}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={TrendingUp}
                              title="Success Rate"
                              value={stats.successRate || 0}
                              suffix="%"
                              color="#ffffff"
                              delay={2}
                              goal={95}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={Schedule}
                              title="Avg Duration"
                              value={stats.avgDuration || 0}
                              suffix=" min"
                              color="#ffffff"
                              delay={3}
                              goal={60}
                            />
                          </Grid>
                        </>
                      );

                    case 'cancelled':
                      return (
                        <>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={Cancel}
                              title="Total Cancelled"
                              value={stats.totalCancelled || 0}
                              color="#ffffff"
                              delay={0}
                              goal={10}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={Assessment}
                              title="Cancellation Rate"
                              value={stats.cancellationRate || 0}
                              suffix="%"
                              color="#ffffff"
                              delay={1}
                              goal={15}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={Schedule}
                              title="Last-Minute Cancellations"
                              value={stats.lastMinuteCancellations || 0}
                              color="#ffffff"
                              delay={2}
                              goal={5}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={Event}
                              title="Rescheduled"
                              value={stats.rescheduled || 0}
                              color="#ffffff"
                              delay={3}
                              goal={8}
                            />
                          </Grid>
                        </>
                      );

                    case 'all':
                    default:
                      return (
                        <>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={Event}
                              title="Total Appointments"
                              value={stats.totalAppointments || 0}
                              color="#ffffff"
                              delay={0}
                              goal={150}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={CalendarToday}
                              title="Upcoming Appointments"
                              value={stats.upcomingAppointments || 0}
                              color="#ffffff"
                              delay={1}
                              goal={30}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={TrendingUp}
                              title="Completion Rate"
                              value={stats.completionRate || 0}
                              suffix="%"
                              color="#ffffff"
                              delay={2}
                              goal={90}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={Assessment}
                              title="Avg Per Week"
                              value={stats.avgPerWeek || 0}
                              color="#ffffff"
                              delay={3}
                              goal={10}
                            />
                          </Grid>
                        </>
                      );
                  }
                })()}
                </Grid>

              {/* Action Buttons Row - Aligned to bottom */}
              <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                <Button
                  variant="contained"
                  size="medium"
                  startIcon={<Add />}
                  onClick={() => navigate('/appointments/new')}
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
                  Schedule Appointment
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
                  Appointment Analytics
                </Button>
              </Box>
              </Box>

              {/* Right container: AI Assistant */}
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
                    background: 'linear-gradient(135deg, rgba(122, 62, 0, 0.12) 0%, rgba(163, 93, 0, 0.08) 100%)',
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
                      background: 'linear-gradient(135deg, rgba(122, 62, 0, 0.18) 0%, rgba(163, 93, 0, 0.12) 100%)',
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
                        AI Appointment Manager
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'rgba(255, 255, 255, 0.7)',
                          mb: 2,
                          fontSize: '0.875rem',
                        }}
                      >
                        Hire an AI assistant to schedule appointments, send reminders, and manage your calendar.
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

        {/* Navigation/Filter Bar */}
        <Box sx={{ mb: 4, display: 'flex', gap: 2, alignItems: 'center' }}>
          <Paper sx={{ display: 'inline-flex' }}>
            <Tabs value={selectedStatus} onChange={(e, v) => setSelectedStatus(v)} sx={{ '& .MuiTab-root': { textTransform: 'none', fontSize: '1rem', fontWeight: 500, minHeight: 56 }, '& .Mui-selected': { fontWeight: 700 } }}>
              <Tab label="Upcoming Appointments" value="upcoming" />
              <Tab label="Completed Appointments" value="completed" />
              <Tab label="Cancelled Appointments" value="cancelled" />
              <Tab label="All Appointments" value="all" />
            </Tabs>
          </Paper>
          <Box sx={{ ml: 'auto', display: 'flex', gap: 2, alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Sort By</InputLabel>
              <Select value={sortBy} label="Sort By" onChange={(e) => setSortBy(e.target.value)}>
                <MenuItem value="appointment_date">Appointment Date</MenuItem>
                <MenuItem value="created_at">Date Created</MenuItem>
                <MenuItem value="client_name">Client Name</MenuItem>
                <MenuItem value="appointment_type">Type</MenuItem>
                <MenuItem value="appointment_status">Status</MenuItem>
              </Select>
            </FormControl>
            <ToggleButtonGroup value={viewMode} exclusive onChange={(e, v) => v && setViewMode(v)} size="small" sx={{ '& .MuiToggleButton-root': { px: 2, py: 0.5, textTransform: 'none', fontWeight: 500 } }}>
              <ToggleButton value="small"><Box sx={{ display: 'flex', gap: 0.4 }}>{[...Array(4)].map((_, i) => <Box key={i} sx={{ width: 4, height: 10, bgcolor: 'currentColor', borderRadius: 0.5 }} />)}</Box></ToggleButton>
              <ToggleButton value="large"><Box sx={{ width: 24, height: 12, bgcolor: 'currentColor', borderRadius: 0.5 }} /></ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Box>

        {/* Appointments Grid */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr', md: viewMode === 'small' ? 'repeat(2, 1fr)' : '1fr', lg: viewMode === 'small' ? 'repeat(4, 1fr)' : '1fr' }, gap: 3, width: '100%' }}>
          <AnimatePresence>
            {(() => {
              const now = new Date();
              const { startDate, endDate } = dateRange;

              // Filter by date range first
              const dateFiltered = appointments.filter(a => {
                const apptDate = new Date(a.appointmentDate || a.appointment_date);
                return apptDate >= startDate && apptDate <= endDate;
              });

              // Then filter by status
              const filtered = dateFiltered.filter(a => {
                const apptDate = new Date(a.appointmentDate || a.appointment_date);
                const status = (a.appointmentStatus || a.appointment_status || '').toLowerCase();

                if (selectedStatus === 'upcoming') return apptDate >= now && status !== 'cancelled';
                if (selectedStatus === 'completed') return status === 'completed';
                if (selectedStatus === 'cancelled') return status === 'cancelled';
                return true; // 'all'
              });

              const sorted = [...filtered].sort((a, b) => {
                if (sortBy === 'appointment_date') return new Date(b.appointmentDate || b.appointment_date) - new Date(a.appointmentDate || a.appointment_date);
                if (sortBy === 'created_at') return new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at);
                if (sortBy === 'client_name') return (a.clientName || '').localeCompare(b.clientName || '');
                if (sortBy === 'appointment_type') return (a.appointmentType || '').localeCompare(b.appointmentType || '');
                if (sortBy === 'appointment_status') return (a.appointmentStatus || '').localeCompare(b.appointmentStatus || '');
                return 0;
              });

              if (sorted.length === 0) return <Paper sx={{ p: 6, height: 240, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', background: t => alpha(t.palette.primary.main, 0.03), border: t => `1px solid ${alpha(t.palette.primary.main, 0.1)}`, gridColumn: '1 / -1' }}><Typography variant="h6" color="textSecondary">No {selectedStatus} appointments found</Typography></Paper>;

              return sorted.map((a, i) => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                  <Card
                    onClick={() => navigate(`/appointments/${a.id}`)}
                    sx={{
                      cursor: 'pointer',
                      height: '100%',
                      minHeight: 200,
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 6
                      },
                      transition: 'all 0.3s'
                    }}
                  >
                    <CardContent>
                      <Typography variant="h6" gutterBottom>{a.appointmentType || 'Appointment'}</Typography>
                      <Stack spacing={1}>
                        <Chip
                          label={a.appointmentStatus || 'Unknown'}
                          size="small"
                          color={
                            (a.appointmentStatus || '').toLowerCase() === 'completed' ? 'success' :
                            (a.appointmentStatus || '').toLowerCase() === 'cancelled' ? 'error' :
                            'primary'
                          }
                        />
                        <Typography variant="body2" color="textSecondary">
                          Client: {a.clientName || 'N/A'}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Date: {new Date(a.appointmentDate || a.appointment_date).toLocaleDateString()}
                        </Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                </motion.div>
              ));
            })()}
          </AnimatePresence>
        </Box>

      </Container>
    </>
  );
};

export default AppointmentsDashboard;
