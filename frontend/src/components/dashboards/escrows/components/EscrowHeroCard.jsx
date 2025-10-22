import React, { useState } from 'react';
import {
  Box,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Select,
  MenuItem,
  FormControl
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { motion } from 'framer-motion';
import { useAuth } from '../../../../contexts/AuthContext';

// Styled Components - Keep exact same styling
const HeroSection = styled(Box)(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.spacing(3),
  overflow: 'hidden',
  background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
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
  scope,
  setScope,
  children // For the stats cards that go inside
}) => {
  const { user } = useAuth();

  // Local state for date pickers - must be defined here, not in parent
  const [startDatePickerOpen, setStartDatePickerOpen] = useState(false);
  const [endDatePickerOpen, setEndDatePickerOpen] = useState(false);

  // Generate title based on scope
  const getTitle = () => {
    switch (scope) {
      case 'user':
        const firstName = user?.firstName || user?.username?.split(' ')[0] || 'User';
        return `${firstName}'s Escrows`;
      case 'team':
        return 'Team Escrows';
      case 'brokerage':
        return 'Brokerage Escrows';
      default:
        return 'Escrows';
    }
  };

  return (
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
          {/* Header with Scope Dropdown */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ flexShrink: 0 }}
          >
            <FormControl variant="standard">
              <Select
                value={scope}
                onChange={(e) => setScope(e.target.value)}
                disableUnderline
                renderValue={(value) => (
                  <Typography
                    variant="h3"
                    component="h1"
                    sx={{
                      fontWeight: 700,
                      color: 'white',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    {getTitle()}
                  </Typography>
                )}
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  padding: '12px 20px',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  '& .MuiSelect-select': {
                    padding: '0 !important',
                    paddingRight: '32px !important',
                    '&:focus': {
                      backgroundColor: 'transparent',
                    },
                  },
                  '& .MuiSvgIcon-root': {
                    color: 'white',
                    right: '12px',
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.25)',
                    borderColor: 'rgba(255, 255, 255, 0.4)',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
                  },
                  transition: 'all 0.2s ease',
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      mt: 1,
                      borderRadius: 2,
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                      bgcolor: 'rgba(30, 60, 114, 0.95)',
                      backdropFilter: 'blur(10px)',
                    },
                  },
                }}
              >
                <MenuItem
                  value="user"
                  sx={{
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.25)',
                      },
                    },
                  }}
                >
                  <Typography variant="body1" sx={{ fontWeight: 700, color: 'white', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {user?.firstName || user?.username?.split(' ')[0] || 'User'}'s Escrows
                  </Typography>
                </MenuItem>
                <MenuItem
                  value="team"
                  sx={{
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.25)',
                      },
                    },
                  }}
                >
                  <Typography variant="body1" sx={{ fontWeight: 700, color: 'white', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Team Escrows
                  </Typography>
                </MenuItem>
                <MenuItem
                  value="brokerage"
                  sx={{
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.25)',
                      },
                    },
                  }}
                >
                  <Typography variant="body1" sx={{ fontWeight: 700, color: 'white', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Brokerage Escrows
                  </Typography>
                </MenuItem>
              </Select>
            </FormControl>
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

        {/* Main Content Row - This is where the stats cards and other content go */}
        <Box sx={{
          display: 'flex',
          gap: 3,
          alignItems: 'stretch',
          flexDirection: { xs: 'column', md: 'row' },
          height: '100%',
        }}>
          {/* Children will be rendered here (stats cards, etc.) */}
          {children}
        </Box>
      </Box>
    </HeroSection>
  );
};

export default EscrowHeroCard;