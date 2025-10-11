import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  TrendingUp,
  TrendingDown,
  AttachMoney,
  PersonAdd,
  CheckCircle,
  Add,
  Assessment,
  Phone,
  Email,
  Star,
  Cancel,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import CountUp from 'react-countup';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { leadsAPI } from '../../services/api.service';

const HeroSection = styled(Box)(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.spacing(3),
  overflow: 'hidden',
  background: 'linear-gradient(135deg, #9333EA 0%, #A855F7 100%)',
  color: 'white',
  padding: theme.spacing(4),
  marginBottom: theme.spacing(4),
  boxShadow: '0 20px 60px rgba(147, 51, 234, 0.3)',
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(3),
  },
}));

// Enhanced animated stat card component with goals and progress
const StatCard = ({ icon: Icon, title, value, prefix = '', suffix = '', color, delay = 0, trend, goal }) => {
  const theme = useTheme();

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
                {typeof value === 'string' ? (
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

const LeadsDashboard = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('new');
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('leadsViewMode') || 'small');
  const [sortBy, setSortBy] = useState('created_at');
  const [dateRangeFilter, setDateRangeFilter] = useState('1M'); // '1D', '1M', '1Y', 'YTD', or null for custom
  const [customStartDate, setCustomStartDate] = useState(null);
  const [customEndDate, setCustomEndDate] = useState(null);
  const [startDatePickerOpen, setStartDatePickerOpen] = useState(false);
  const [endDatePickerOpen, setEndDatePickerOpen] = useState(false);
  const [stats, setStats] = useState({
    totalLeads: 0,
    newLeads: 0,
    thisWeek: 0,
    thisMonth: 0,
    responseRate: 0,
    qualifiedLeads: 0,
    qualificationRate: 0,
    avgQualificationTime: 0,
    hotLeads: 0,
    convertedLeads: 0,
    conversionRate: 0,
    avgConversionTime: 0,
    totalValue: 0,
    lostLeads: 0,
    lostRate: 0,
    lostValue: 0,
    topLostReason: '',
    activeLeads: 0,
    avgLeadValue: 0,
  });

  useEffect(() => { localStorage.setItem('leadsViewMode', viewMode); }, [viewMode]);
  useEffect(() => { fetchLeads(); }, []);
  useEffect(() => {
    if (leads.length > 0) calculateStats(leads, selectedStatus);
    else calculateStats([], selectedStatus);
  }, [selectedStatus, leads, dateRangeFilter, customStartDate, customEndDate]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const response = await leadsAPI.getAll();
      if (response.success) {
        const data = response.data.leads || response.data || [];
        setLeads(data);
        calculateStats(data, selectedStatus);
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
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
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(now);
          endDate.setHours(23, 59, 59, 999);
          break;
        case '1M':
          // Last 30 days
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 30);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(now);
          endDate.setHours(23, 59, 59, 999);
          break;
        case '1Y':
          // Last 365 days
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 365);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(now);
          endDate.setHours(23, 59, 59, 999);
          break;
        case 'YTD':
          // Year to date
          startDate = new Date(now.getFullYear(), 0, 1);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(now);
          endDate.setHours(23, 59, 59, 999);
          break;
        default:
          return null;
      }
    }

    return { startDate, endDate };
  };

  const calculateStats = (data, statusFilter) => {
    if (!data || !Array.isArray(data)) {
      setStats({
        totalLeads: 0, newLeads: 0, thisWeek: 0, thisMonth: 0, responseRate: 0,
        qualifiedLeads: 0, qualificationRate: 0, avgQualificationTime: 0, hotLeads: 0,
        convertedLeads: 0, conversionRate: 0, avgConversionTime: 0, totalValue: 0,
        lostLeads: 0, lostRate: 0, lostValue: 0, topLostReason: '',
        activeLeads: 0, avgLeadValue: 0
      });
      return;
    }

    // Apply date range filtering to all data
    const dateRange = getDateRange();
    let dateFilteredData = data;
    if (dateRange) {
      dateFilteredData = data.filter(lead => {
        const createdDate = new Date(lead.createdAt || lead.created_at || 0);
        return createdDate >= dateRange.startDate && createdDate <= dateRange.endDate;
      });
    }

    // Filter by status
    let filtered = dateFilteredData.filter(l => {
      const status = (l.leadStatus || l.lead_status || '').toLowerCase();
      if (statusFilter === 'new') return status === 'new';
      if (statusFilter === 'qualified') return status === 'qualified';
      if (statusFilter === 'converted') return status === 'converted';
      if (statusFilter === 'lost') return status === 'lost';
      return true; // 'all' shows everything
    });

    // Calculate time-based stats for "new" leads
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const newLeadsData = dateFilteredData.filter(l => (l.leadStatus || l.lead_status || '').toLowerCase() === 'new');
    const thisWeek = newLeadsData.filter(l => {
      const createdDate = new Date(l.createdAt || l.created_at || 0);
      return createdDate >= startOfWeek;
    }).length;
    const thisMonth = newLeadsData.filter(l => {
      const createdDate = new Date(l.createdAt || l.created_at || 0);
      return createdDate >= startOfMonth;
    }).length;

    // Calculate response rate (mock data - would need actual response tracking)
    const responseRate = newLeadsData.length > 0 ? Math.round((thisWeek / newLeadsData.length) * 100) : 0;

    // Qualified leads stats
    const qualifiedLeadsData = dateFilteredData.filter(l => (l.leadStatus || l.lead_status || '').toLowerCase() === 'qualified');
    const qualificationRate = dateFilteredData.length > 0 ? Math.round((qualifiedLeadsData.length / dateFilteredData.length) * 100) : 0;
    const avgQualificationTime = 3; // Mock: 3 days average
    const hotLeads = qualifiedLeadsData.filter(l => (l.leadScore || l.lead_score || 0) >= 80).length;

    // Converted leads stats
    const convertedLeadsData = dateFilteredData.filter(l => (l.leadStatus || l.lead_status || '').toLowerCase() === 'converted');
    const conversionRate = dateFilteredData.length > 0 ? Math.round((convertedLeadsData.length / dateFilteredData.length) * 100) : 0;
    const avgConversionTime = 14; // Mock: 14 days average
    const totalValue = convertedLeadsData.reduce((sum, l) => sum + Number(l.estimatedValue || 0), 0);

    // Lost leads stats
    const lostLeadsData = dateFilteredData.filter(l => (l.leadStatus || l.lead_status || '').toLowerCase() === 'lost');
    const lostRate = dateFilteredData.length > 0 ? Math.round((lostLeadsData.length / dateFilteredData.length) * 100) : 0;
    const lostValue = lostLeadsData.reduce((sum, l) => sum + Number(l.estimatedValue || 0), 0);
    const topLostReason = 'Price too high'; // Mock data

    // All leads stats
    const activeLeads = dateFilteredData.filter(l => {
      const status = (l.leadStatus || l.lead_status || '').toLowerCase();
      return status !== 'lost' && status !== 'converted';
    }).length;
    const avgLeadValue = dateFilteredData.length > 0
      ? Math.round(dateFilteredData.reduce((sum, l) => sum + Number(l.estimatedValue || 0), 0) / dateFilteredData.length)
      : 0;

    setStats({
      totalLeads: filtered.length,
      newLeads: newLeadsData.length,
      thisWeek,
      thisMonth,
      responseRate,
      qualifiedLeads: qualifiedLeadsData.length,
      qualificationRate,
      avgQualificationTime,
      hotLeads,
      convertedLeads: convertedLeadsData.length,
      conversionRate,
      avgConversionTime,
      totalValue,
      lostLeads: lostLeadsData.length,
      lostRate,
      lostValue,
      topLostReason,
      activeLeads,
      avgLeadValue,
    });
  };

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh"><CircularProgress size={60} /></Box>;

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
                  Leads
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
                            const date = customStartDate || getDateRange()?.startDate;
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
                      <DatePicker
                        open={endDatePickerOpen}
                        onOpen={() => setEndDatePickerOpen(true)}
                        onClose={() => setEndDatePickerOpen(false)}
                        format="MMM d, yyyy"
                        value={(() => {
                          try {
                            const date = customEndDate || getDateRange()?.endDate;
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
                    case 'new':
                      return (
                        <>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={PersonAdd}
                              title="Total New Leads"
                              value={stats.newLeads || 0}
                              color="#ffffff"
                              delay={0}
                              goal={50}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={Phone}
                              title="This Week"
                              value={stats.thisWeek || 0}
                              color="#ffffff"
                              delay={1}
                              goal={10}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={Email}
                              title="This Month"
                              value={stats.thisMonth || 0}
                              color="#ffffff"
                              delay={2}
                              goal={30}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={TrendingUp}
                              title="Response Rate"
                              value={stats.responseRate || 0}
                              suffix="%"
                              color="#ffffff"
                              delay={3}
                              goal={80}
                            />
                          </Grid>
                        </>
                      );

                    case 'qualified':
                      return (
                        <>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={CheckCircle}
                              title="Total Qualified"
                              value={stats.qualifiedLeads || 0}
                              color="#ffffff"
                              delay={0}
                              goal={25}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={TrendingUp}
                              title="Qualification Rate"
                              value={stats.qualificationRate || 0}
                              suffix="%"
                              color="#ffffff"
                              delay={1}
                              goal={50}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={Assessment}
                              title="Avg Qualification Time"
                              value={stats.avgQualificationTime || 0}
                              suffix=" days"
                              color="#ffffff"
                              delay={2}
                              goal={5}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={Star}
                              title="Hot Leads"
                              value={stats.hotLeads || 0}
                              color="#ffffff"
                              delay={3}
                              goal={10}
                            />
                          </Grid>
                        </>
                      );

                    case 'converted':
                      return (
                        <>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={CheckCircle}
                              title="Total Converted"
                              value={stats.convertedLeads || 0}
                              color="#ffffff"
                              delay={0}
                              goal={15}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
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
                            <StatCard
                              icon={Assessment}
                              title="Avg Conversion Time"
                              value={stats.avgConversionTime || 0}
                              suffix=" days"
                              color="#ffffff"
                              delay={2}
                              goal={21}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={AttachMoney}
                              title="Total Value"
                              value={stats.totalValue || 0}
                              prefix="$"
                              color="#ffffff"
                              delay={3}
                              goal={500000}
                            />
                          </Grid>
                        </>
                      );

                    case 'lost':
                      return (
                        <>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={Cancel}
                              title="Total Lost"
                              value={stats.lostLeads || 0}
                              color="#ffffff"
                              delay={0}
                              goal={10}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={TrendingDown}
                              title="Lost Rate"
                              value={stats.lostRate || 0}
                              suffix="%"
                              color="#ffffff"
                              delay={1}
                              goal={20}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={AttachMoney}
                              title="Lost Value"
                              value={stats.lostValue || 0}
                              prefix="$"
                              color="#ffffff"
                              delay={2}
                              goal={100000}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={Assessment}
                              title="Top Lost Reason"
                              value={stats.topLostReason || 'N/A'}
                              color="#ffffff"
                              delay={3}
                            />
                          </Grid>
                        </>
                      );

                    case 'all':
                      return (
                        <>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={PersonAdd}
                              title="Total Leads"
                              value={stats.totalLeads || 0}
                              color="#ffffff"
                              delay={0}
                              goal={100}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={CheckCircle}
                              title="Active Leads"
                              value={stats.activeLeads || 0}
                              color="#ffffff"
                              delay={1}
                              goal={50}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={TrendingUp}
                              title="Conversion Rate"
                              value={stats.conversionRate || 0}
                              suffix="%"
                              color="#ffffff"
                              delay={2}
                              goal={30}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={6} xl={3}>
                            <StatCard
                              icon={AttachMoney}
                              title="Avg Lead Value"
                              value={stats.avgLeadValue || 0}
                              prefix="$"
                              color="#ffffff"
                              delay={3}
                              goal={25000}
                            />
                          </Grid>
                        </>
                      );

                    default:
                      return null;
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
                  onClick={() => navigate('/leads/new')}
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
                  Add New Lead
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
                  Lead Analytics
                </Button>
              </Box>
              </Box>

              {/* Right container: AI Lead Manager Card */}
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
                    background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.12) 0%, rgba(168, 85, 247, 0.08) 100%)',
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
                      background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.18) 0%, rgba(168, 85, 247, 0.12) 100%)',
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
                          fontWeight: 700,
                          mb: 1.5,
                          color: 'white',
                          fontSize: '1.25rem',
                        }}
                      >
                        AI Lead Manager
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'rgba(255, 255, 255, 0.85)',
                          mb: 2.5,
                          lineHeight: 1.6,
                          fontSize: '0.875rem',
                        }}
                      >
                        Hire an AI assistant to qualify leads, send follow-ups, and track conversion rates.
                      </Typography>
                      <Button
                        variant="contained"
                        size="small"
                        sx={{
                          backgroundColor: 'rgba(255, 255, 255, 0.2)',
                          color: 'white',
                          fontWeight: 600,
                          px: 3,
                          py: 1,
                          borderRadius: 2,
                          backdropFilter: 'blur(10px)',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.3)',
                          },
                        }}
                      >
                        Coming Soon
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
              </Box>
            </Box>
          </Box>
        </HeroSection>

        {/* Navigation/Filter Bar */}
        <Box sx={{ mb: 4, display: 'flex', gap: 2, alignItems: 'center' }}>
          <Paper sx={{ display: 'inline-flex' }}>
            <Tabs
              value={selectedStatus}
              onChange={(e, v) => setSelectedStatus(v)}
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 500,
                  minHeight: 56
                },
                '& .Mui-selected': {
                  fontWeight: 700
                }
              }}
            >
              <Tab label="New Leads" value="new" />
              <Tab label="Qualified Leads" value="qualified" />
              <Tab label="Converted Leads" value="converted" />
              <Tab label="Lost Leads" value="lost" />
              <Tab label="All Leads" value="all" />
            </Tabs>
          </Paper>
          <Box sx={{ ml: 'auto', display: 'flex', gap: 2, alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Sort By</InputLabel>
              <Select value={sortBy} label="Sort By" onChange={(e) => setSortBy(e.target.value)}>
                <MenuItem value="created_at">Date Created</MenuItem>
                <MenuItem value="last_contact">Last Contact</MenuItem>
                <MenuItem value="lead_source">Source</MenuItem>
                <MenuItem value="lead_score">Score</MenuItem>
                <MenuItem value="lead_status">Status</MenuItem>
              </Select>
            </FormControl>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(e, v) => v && setViewMode(v)}
              size="small"
              sx={{ '& .MuiToggleButton-root': { px: 2, py: 0.5, textTransform: 'none', fontWeight: 500 } }}
            >
              <ToggleButton value="small">
                <Box sx={{ display: 'flex', gap: 0.4 }}>
                  {[...Array(4)].map((_, i) => <Box key={i} sx={{ width: 4, height: 10, bgcolor: 'currentColor', borderRadius: 0.5 }} />)}
                </Box>
              </ToggleButton>
              <ToggleButton value="large">
                <Box sx={{ width: 24, height: 12, bgcolor: 'currentColor', borderRadius: 0.5 }} />
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Box>

        {/* Lead Cards Grid */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr', md: viewMode === 'small' ? 'repeat(2, 1fr)' : '1fr', lg: viewMode === 'small' ? 'repeat(4, 1fr)' : '1fr' }, gap: 3, width: '100%' }}>
          <AnimatePresence>
            {(() => {
              const filtered = leads.filter(l => {
                const status = (l.leadStatus || l.lead_status || '').toLowerCase();
                if (selectedStatus === 'new') return status === 'new';
                if (selectedStatus === 'qualified') return status === 'qualified';
                if (selectedStatus === 'converted') return status === 'converted';
                if (selectedStatus === 'lost') return status === 'lost';
                return true; // 'all'
              });
              const sorted = [...filtered].sort((a, b) => {
                if (sortBy === 'created_at') return new Date(b.createdAt || b.created_at || 0) - new Date(a.createdAt || a.created_at || 0);
                if (sortBy === 'last_contact') return new Date(b.lastContact || b.last_contact || 0) - new Date(a.lastContact || a.last_contact || 0);
                if (sortBy === 'lead_source') return (a.leadSource || a.lead_source || '').localeCompare(b.leadSource || b.lead_source || '');
                if (sortBy === 'lead_score') return Number(b.leadScore || b.lead_score || 0) - Number(a.leadScore || a.lead_score || 0);
                if (sortBy === 'lead_status') return (a.leadStatus || a.lead_status || '').localeCompare(b.leadStatus || b.lead_status || '');
                return 0;
              });
              if (sorted.length === 0) return (
                <Paper sx={{ p: 6, height: 240, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', background: t => alpha(t.palette.primary.main, 0.03), border: t => `1px solid ${alpha(t.palette.primary.main, 0.1)}`, gridColumn: '1 / -1' }}>
                  <Typography variant="h6" color="textSecondary">No {selectedStatus} leads found</Typography>
                  <Typography variant="body2" color="textSecondary">{selectedStatus === 'new' ? 'Add a new lead to get started' : `No ${selectedStatus} leads in the system`}</Typography>
                </Paper>
              );
              return sorted.map((l, i) => (
                <motion.div
                  key={l.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                  <Card
                    onClick={() => navigate(`/leads/${l.id}`)}
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
                      <Typography variant="h6" gutterBottom>
                        {`${l.firstName || l.first_name || ''} ${l.lastName || l.last_name || ''}`}
                      </Typography>
                      <Stack spacing={1}>
                        <Chip
                          label={l.leadStatus || l.lead_status || 'Unknown'}
                          size="small"
                          color="primary"
                        />
                        <Typography variant="body2" color="textSecondary">
                          Source: {l.leadSource || l.lead_source || 'N/A'}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Score: {l.leadScore || l.lead_score || 0}/100
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

export default LeadsDashboard;
