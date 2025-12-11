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
import { motion } from 'framer-motion';
import { Add as AddIcon, Assessment as AssessmentIcon } from '@mui/icons-material';
import { EditDisplayStartDate, EditDisplayEndDate } from '../editors';
import { parseLocalDate } from '../../../utils/safeDateUtils';

// Import hero layout components
import { CardsHeroLayout } from './hero-layouts';
import { SpheresHeroLayout } from './hero-layouts';

// Shadow wrapper to apply drop-shadow without being clipped by overflow:hidden
const ShadowWrapper = styled(Box)({
  filter: 'drop-shadow(0 20px 40px rgba(0, 0, 0, 0.15))',
  marginBottom: '32px', // spacing(4) = 32px
});

// Styled Components matching ClientHeroCard
const HeroSection = styled(Box)(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.spacing(3),
  overflow: 'hidden',
  background: 'linear-gradient(135deg, #0891B2 0%, #06B6D4 100%)', // Default cyan, will be overridden
  color: 'white',
  padding: theme.spacing(4),
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
  allData = [], // Pass all data to calculate available years
  // NEW: Hero layout mode - 'cards' (default) or 'spheres'
  heroLayoutMode = 'cards',
  // Sphere-specific props (only used when heroLayoutMode='spheres')
  sphereData = null, // { sphere: number, leads: number, clients: number }
  onSphereClick = null,
  aiCoachConfig = null, // { title, description, onHire }
}) => {
  // State for date editor modals
  const [startDateEditorOpen, setStartDateEditorOpen] = useState(false);
  const [endDateEditorOpen, setEndDateEditorOpen] = useState(false);

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
    <ShadowWrapper>
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
            style={{ flexShrink: 1, minWidth: 0 }} // Allow title to shrink if needed
          >
            <Typography variant="h3" component="h1" sx={{
              fontWeight: 700,
              fontSize: { xs: '2rem', md: '3rem' } // 2 sizes: mobile (2rem) and desktop (3rem)
            }}>
              {config.title}
            </Typography>
          </motion.div>

          {/* Date Controls Container */}
          <Box sx={{
            display: 'flex',
            gap: 2,
            alignItems: 'center',
            flexWrap: 'wrap', // Allow wrapping for date range selector
            flexShrink: 0,
            marginLeft: 'auto',
            justifyContent: { xs: 'center', sm: 'flex-end' }, // Center on mobile, right-align on desktop
            width: { xs: '100%', sm: 'auto' }, // Full width on mobile to force wrapping
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

            {/* Date Range Editors */}
            <Box sx={{
              display: 'inline-flex', // Use inline-flex to maintain fixed width
              gap: 0.5,
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 1,
              px: 1.5,
              height: 36,
              border: '1px solid rgba(255, 255, 255, 0.2)',
              flexShrink: 0,
              flexGrow: 0,
              width: 'auto', // Fixed width based on content
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
              },
            }}>
              {/* Start Date Button */}
              <Typography
                onClick={() => setStartDateEditorOpen(true)}
                sx={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  textAlign: 'center',
                  cursor: 'pointer',
                  minWidth: '80px',
                  '&:hover': {
                    color: 'white',
                  },
                }}
              >
                {(() => {
                  const date = customStartDate || dateRange?.startDate;
                  if (!date) return 'Start';
                  try {
                    const d = typeof date === 'string' ? new Date(date) : date;
                    if (isNaN(d.getTime())) return 'Start';
                    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                  } catch (e) {
                    return 'Start';
                  }
                })()}
              </Typography>
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', mx: 0.5, flexShrink: 0 }}>→</Typography>
              {/* End Date Button */}
              <Typography
                onClick={() => setEndDateEditorOpen(true)}
                sx={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  textAlign: 'center',
                  cursor: 'pointer',
                  minWidth: '80px',
                  '&:hover': {
                    color: 'white',
                  },
                }}
              >
                {(() => {
                  const date = customEndDate || dateRange?.endDate;
                  if (!date) return 'End';
                  try {
                    const d = typeof date === 'string' ? new Date(date) : date;
                    if (isNaN(d.getTime())) return 'End';
                    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                  } catch (e) {
                    return 'End';
                  }
                })()}
              </Typography>
            </Box>

            {/* Date Editor Modals */}
            <EditDisplayStartDate
              open={startDateEditorOpen}
              onClose={() => setStartDateEditorOpen(false)}
              value={customStartDate || dateRange?.startDate}
              color={config.gradient?.match(/#[0-9A-Fa-f]{6}/)?.[0] || '#667eea'}
              maxDate={customEndDate || dateRange?.endDate} // Validation: Start date must be before end date
              onSave={(newDate) => {
                // Use parseLocalDate to prevent timezone shifting (off-by-one bug)
                const parsedDate = parseLocalDate(newDate);
                setCustomStartDate(parsedDate);
                if (parsedDate && customEndDate && detectPresetRange) {
                  const matched = detectPresetRange(parsedDate, customEndDate);
                  setDateRangeFilter(matched);
                } else {
                  setDateRangeFilter(null);
                }

                // Cascading logic: If end date is not set, open end date editor
                const currentEndDate = customEndDate || dateRange?.endDate;
                if (!currentEndDate) {
                  setStartDateEditorOpen(false);
                  setTimeout(() => {
                    setEndDateEditorOpen(true);
                  }, 300);
                }
              }}
            />
            <EditDisplayEndDate
              open={endDateEditorOpen}
              onClose={() => setEndDateEditorOpen(false)}
              value={customEndDate || dateRange?.endDate}
              color={config.gradient?.match(/#[0-9A-Fa-f]{6}/)?.[0] || '#667eea'}
              minDate={customStartDate || dateRange?.startDate} // Validation: End date must be after start date
              onSave={(newDate) => {
                // Use parseLocalDate to prevent timezone shifting (off-by-one bug)
                const parsedDate = parseLocalDate(newDate);
                setCustomEndDate(parsedDate);
                if (customStartDate && parsedDate && detectPresetRange) {
                  const matched = detectPresetRange(customStartDate, parsedDate);
                  setDateRangeFilter(matched);
                } else {
                  setDateRangeFilter(null);
                }

                // Cascading logic: Open start date editor if:
                // 1. Start date is null/empty, OR
                // 2. Start date is after the new end date (invalid)
                const currentStartDate = customStartDate || dateRange?.startDate;
                const startDateInvalid = currentStartDate && parsedDate && parseLocalDate(currentStartDate) > parsedDate;

                if (!currentStartDate || startDateInvalid) {
                  setEndDateEditorOpen(false);
                  setTimeout(() => {
                    setStartDateEditorOpen(true);
                  }, 300);
                }
              }}
            />
          </Box>
        </Box>

        {/* Main Content Row - Conditional Layout based on heroLayoutMode */}
        {heroLayoutMode === 'spheres' ? (
          <SpheresHeroLayout
            config={config}
            onNewItem={onNewItem}
            sphereData={sphereData}
            onSphereClick={onSphereClick}
            aiCoachConfig={aiCoachConfig}
          />
        ) : (
          <CardsHeroLayout
            config={config}
            stats={stats}
            statsConfig={statsConfig}
            selectedStatus={selectedStatus}
            onNewItem={onNewItem}
            StatCardComponent={StatCardComponent}
            allData={allData}
          />
        )}
      </Box>
    </HeroSection>
    </ShadowWrapper>
  );
};