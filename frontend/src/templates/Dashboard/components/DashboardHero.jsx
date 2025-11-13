import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  Grid,
  Card,
  CardContent,
  Select,
  MenuItem
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { motion } from 'framer-motion';
import { Add as AddIcon, Assessment as AssessmentIcon } from '@mui/icons-material';

// Styled Components matching ClientHeroCard
const HeroSection = styled(Box)(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.spacing(3),
  overflow: 'hidden',
  background: 'linear-gradient(135deg, #0891B2 0%, #06B6D4 100%)', // Default cyan, will be overridden
  color: 'white',
  padding: theme.spacing(4),
  marginBottom: theme.spacing(4),
  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(3),
  },
}));

export const DashboardHero = ({
  config,
  stats,
  statsConfig,
  selectedStatus,
  onNewItem,
  dateRangeFilter,
  setDateRangeFilter,
  customStartDate,
  setCustomStartDate,
  customEndDate,
  setCustomEndDate,
  dateRange,
  detectPresetRange,
  selectedYear,
  setSelectedYear,
  StatCardComponent,
  allData = [] // Pass all data to calculate available years
}) => {
  // Local state for date pickers
  const [startDatePickerOpen, setStartDatePickerOpen] = useState(false);
  const [endDatePickerOpen, setEndDatePickerOpen] = useState(false);

  // Calculate available years from data
  const getAvailableYears = () => {
    const currentYear = new Date().getFullYear();
    const defaultYears = [currentYear, currentYear - 1, currentYear - 2];

    // Defensive check - ensure allData is an array
    if (!allData || !Array.isArray(allData) || allData.length === 0) {
      return defaultYears;
    }

    try {
      // Find earliest year from created_at or closing_date
      const years = allData
        .map(item => {
          if (!item) return null;

          const dates = [
            item.created_at,
            item.createdAt,
            item.closing_date,
            item.closingDate
          ].filter(Boolean);

          if (dates.length === 0) return null;

          const earliestDate = dates
            .map(d => new Date(d))
            .filter(d => !isNaN(d.getTime()))
            .sort((a, b) => a - b)[0];

          return earliestDate ? earliestDate.getFullYear() : null;
        })
        .filter(year => year !== null && typeof year === 'number');

      if (years.length === 0) {
        return defaultYears;
      }

      const earliestYear = Math.min(...years);

      // Sanity check - don't go back more than 50 years
      const validEarliestYear = Math.max(earliestYear, currentYear - 50);

      // Generate array of years from current to earliest
      const yearRange = [];
      for (let year = currentYear; year >= validEarliestYear; year--) {
        yearRange.push(year);
      }

      return yearRange.length > 0 ? yearRange : defaultYears;
    } catch (error) {
      console.error('Error calculating available years:', error);
      return defaultYears;
    }
  };

  const availableYears = getAvailableYears();

  return (
    <HeroSection sx={{
      background: config.gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      {/* Wrapper for header and main content */}
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

        {/* Header Row - Full width */}
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
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ flexShrink: 0 }}
          >
            <Typography variant="h3" component="h1" sx={{ fontWeight: 700 }}>
              {config.title}
            </Typography>
          </motion.div>

          {/* Date Controls Container */}
          <Box sx={{
            display: 'flex',
            gap: 2,
            alignItems: 'center',
            flexWrap: 'nowrap',
            flexShrink: 0,
            marginLeft: 'auto',
          }}>
            {/* Date Range Buttons */}
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
              <ToggleButton value="1D">1 DAY</ToggleButton>
              <ToggleButton value="1M">1 MONTH</ToggleButton>
              <ToggleButton value="1Y">1 YEAR</ToggleButton>
              <ToggleButton value="YTD">YTD</ToggleButton>
            </ToggleButtonGroup>

            {/* Year Selector Dropdown (only show when YTD is selected) */}
            {dateRangeFilter === 'YTD' && setSelectedYear && (
              <Select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                size="small"
                sx={{
                  height: 36,
                  minWidth: 100,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  borderRadius: 1,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'transparent',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                  },
                  '& .MuiSelect-icon': {
                    color: 'white',
                  },
                  '& .MuiSelect-select': {
                    fontSize: { xs: '0.75rem', md: '0.875rem' },
                    fontWeight: 600,
                    py: 0.75,
                  },
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      bgcolor: 'background.paper',
                      maxHeight: 300,
                      '& .MuiMenuItem-root': {
                        fontSize: '0.875rem',
                        '&:hover': {
                          backgroundColor: 'rgba(0, 0, 0, 0.08)',
                        },
                        '&.Mui-selected': {
                          backgroundColor: 'rgba(0, 0, 0, 0.12)',
                          '&:hover': {
                            backgroundColor: 'rgba(0, 0, 0, 0.16)',
                          },
                        },
                      },
                    },
                  },
                }}
              >
                {availableYears && Array.isArray(availableYears) && availableYears.map(year => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            )}

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
                    if (newDate && customEndDate && detectPresetRange) {
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
                          '& fieldset': { borderColor: 'transparent' },
                          '&:hover fieldset': { borderColor: 'transparent' },
                          '&.Mui-focused fieldset': { borderColor: 'transparent' },
                        },
                        '& .MuiInputBase-input': {
                          fontSize: { xs: '0.75rem', md: '0.875rem' },
                          fontWeight: 600,
                          cursor: 'pointer',
                          textAlign: 'center',
                          color: 'rgba(255, 255, 255, 0.9)',
                          padding: '6px 8px',
                        },
                        '& .MuiInputAdornment-root': { display: 'none' },
                        '& .MuiInputLabel-root': { display: 'none' },
                        '& .MuiOutlinedInput-notchedOutline legend': { display: 'none' },
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
                    if (customStartDate && newDate && detectPresetRange) {
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
                          '& fieldset': { borderColor: 'transparent' },
                          '&:hover fieldset': { borderColor: 'transparent' },
                          '&.Mui-focused fieldset': { borderColor: 'transparent' },
                        },
                        '& .MuiInputBase-input': {
                          fontSize: { xs: '0.75rem', md: '0.875rem' },
                          fontWeight: 600,
                          cursor: 'pointer',
                          textAlign: 'center',
                          color: 'rgba(255, 255, 255, 0.9)',
                          padding: '6px 8px',
                        },
                        '& .MuiInputAdornment-root': { display: 'none' },
                        '& .MuiInputLabel-root': { display: 'none' },
                        '& .MuiOutlinedInput-notchedOutline legend': { display: 'none' },
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

        {/* Main Content Row - Stats Grid + Action Buttons */}
        <Grid container spacing={3} sx={{ flexGrow: 1 }}>

          {/* Stats Cards Grid */}
          <Grid item xs={12} lg={config.showAIAssistant ? 9 : 12}>
            <Grid container spacing={3}>
              {/* Render stat cards based on selected status */}
              {statsConfig && statsConfig
                .filter(statCfg => !statCfg.visibleWhen || statCfg.visibleWhen.includes(selectedStatus))
                .slice(0, 4) // Max 4 stat cards
                .map((statCfg, index) => {
                  // Check if this is a component-based stat (new approach)
                  if (statCfg.component) {
                    const StatComponent = statCfg.component;
                    return (
                      <Grid item xs={12} sm={6} md={6} xl={3} key={statCfg.id}>
                        <StatComponent
                          data={allData}
                          delay={index}
                          {...(statCfg.props || {})}
                        />
                      </Grid>
                    );
                  }

                  // Fallback to old calculation-based approach (for backward compatibility)
                  const prefixValue = statCfg.format === 'currency' ? '$' : (statCfg.prefix || '');
                  const suffixValue = statCfg.format === 'percentage' ? '%' : (statCfg.suffix || '');
                  const statValue = stats?.[statCfg.id]?.value || 0;
                  let valueColor = statCfg.valueColor;
                  if (valueColor === 'dynamic') {
                    valueColor = statValue >= 0 ? '#4caf50' : '#f44336';
                  }

                  return (
                    <Grid item xs={12} sm={6} md={6} xl={3} key={statCfg.id}>
                      {StatCardComponent && (
                        <StatCardComponent
                          icon={statCfg.icon}
                          title={statCfg.label}
                          value={statValue}
                          prefix={prefixValue}
                          suffix={suffixValue}
                          color={statCfg.color || "#ffffff"}
                          backgroundColor={statCfg.backgroundColor}
                          textColor={statCfg.textColor || null}
                          valueColor={valueColor}
                          delay={index}
                          goal={statCfg.goal}
                          trend={stats?.[statCfg.id]?.trend}
                        />
                      )}
                    </Grid>
                  );
                })}
            </Grid>

            {/* Action Buttons Row */}
            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              {onNewItem && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={onNewItem}
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)',
                    '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.3)' },
                  }}
                >
                  {config.addButtonLabel || `NEW ${config.entitySingular?.toUpperCase()}`}
                </Button>
              )}
              {config.showAnalyticsButton && (
                <Button
                  variant="outlined"
                  startIcon={<AssessmentIcon />}
                  sx={{
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    color: 'white',
                    '&:hover': {
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  {config.analyticsButtonLabel || `${config.entitySingular?.toUpperCase()} ANALYTICS`}
                </Button>
              )}
            </Box>
          </Grid>

          {/* AI Assistant Card (if enabled) */}
          {config.showAIAssistant && (
            <Grid item xs={12} lg={3}>
              <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card
                    elevation={0}
                    sx={{
                      width: '300px',
                      height: '300px',
                      minWidth: '300px',
                      minHeight: '300px',
                      maxWidth: '300px',
                      maxHeight: '300px',
                      position: 'relative',
                      overflow: 'hidden',
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.08) 100%)',
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
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0.12) 100%)',
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
                          {config.aiAssistantLabel || 'AI Assistant'}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: 'rgba(255, 255, 255, 0.7)',
                            mb: 2,
                            fontSize: '0.875rem',
                          }}
                        >
                          {config.aiAssistantDescription || 'Hire an AI assistant to automate workflows.'}
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
              </Box>
            </Grid>
          )}
        </Grid>
      </Box>
    </HeroSection>
  );
};