import React from 'react';
import { Box, Card, CardContent, Typography, Button } from '@mui/material';
import { Add as AddIcon, Assessment as AssessmentIcon, Handshake } from '@mui/icons-material';

/**
 * SpheresHeroLayout - Contacts hero with stat cards and buttons
 *
 * Layout Structure:
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ Row 1: [Stat Card 1] [Stat Card 2] [Stat Card 3] [Stat Card 4] │ AI    │
 * │                                                                 │Manager│
 * │ Row 2: [Buttons - top left]                                    │ Card  │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * Stat Cards: Total Contacts | New This Month | Total Portfolio | Lifetime Value
 */
export const SpheresHeroLayout = ({
  config,
  onNewItem,
  aiCoachConfig,
  // Stat cards support
  statCards = null, // Array of { component: Component, props: {} }
  allData = [], // Data for stat card calculations
}) => {
  // Check if we have stat cards to render
  const hasStatCards = statCards && statCards.length > 0;

  return (
    <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
      {/* Main Content Area (Stat Cards + Buttons) */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Row 1: Stat Cards */}
        {hasStatCards && (
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 2,
            '@media (max-width: 1200px)': {
              gridTemplateColumns: 'repeat(2, 1fr)',
            },
            '@media (max-width: 600px)': {
              gridTemplateColumns: '1fr',
            },
          }}>
            {statCards.map((StatCardConfig, index) => {
              const { component: StatCard, props = {} } = StatCardConfig;
              return (
                <Box key={index} sx={{ minWidth: 0 }}>
                  <StatCard
                    data={allData}
                    delay={index}
                    {...props}
                  />
                </Box>
              );
            })}
          </Box>
        )}

        {/* Row 2: Buttons - Top left like other dashboards */}
        <Box sx={{
          display: 'flex',
          gap: 1.5,
          alignItems: 'flex-start',
          justifyContent: 'flex-start',
        }}>
          {onNewItem && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={onNewItem}
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.3)' },
                height: 44,
                minWidth: 180,
                px: 3,
                whiteSpace: 'nowrap',
              }}
            >
              {config?.addButtonLabel || config?.dashboard?.hero?.addButtonLabel || 'ADD NEW CONTACT'}
            </Button>
          )}
          {(config?.showAnalyticsButton || config?.dashboard?.hero?.showAnalyticsButton) && (
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
                height: 44,
                minWidth: 200,
                px: 3,
                whiteSpace: 'nowrap',
              }}
            >
              {config?.analyticsButtonLabel || config?.dashboard?.hero?.analyticsButtonLabel || 'CONTACT ANALYTICS'}
            </Button>
          )}
        </Box>
      </Box>

      {/* AI Manager Card - Fixed 300x300 */}
      {aiCoachConfig && (
        <Box sx={{
          flex: '0 0 auto',
          '@media (max-width: 1100px)': {
            display: 'none',
          },
        }}>
          <Card
            sx={{
              width: 300,
              height: 300,
              background: 'rgba(0, 0, 0, 0.25)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              {/* Brain Icon */}
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  bgcolor: 'rgba(139, 92, 246, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2,
                }}
              >
                <Typography sx={{ fontSize: '2rem' }}>🧠</Typography>
              </Box>

              {/* Title */}
              <Typography
                variant="h6"
                sx={{
                  color: 'white',
                  fontWeight: 700,
                  mb: 1,
                }}
              >
                {aiCoachConfig.title || 'AI Coach'}
              </Typography>

              {/* Description */}
              <Typography
                variant="body2"
                sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  mb: 2,
                  lineHeight: 1.5,
                }}
              >
                {aiCoachConfig.description || 'Get personalized coaching to grow your business.'}
              </Typography>

              {/* Coming Soon Badge or Action Button */}
              {aiCoachConfig.onHire ? (
                <Button
                  variant="contained"
                  onClick={aiCoachConfig.onHire}
                  startIcon={<Handshake />}
                  sx={{
                    bgcolor: 'rgba(139, 92, 246, 0.8)',
                    '&:hover': { bgcolor: 'rgba(139, 92, 246, 1)' },
                  }}
                >
                  Hire Coach
                </Button>
              ) : (
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.5,
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    px: 2,
                    py: 0.75,
                    borderRadius: 2,
                  }}
                >
                  <Typography
                    sx={{
                      color: 'rgba(255, 255, 255, 0.6)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      letterSpacing: '0.05em',
                    }}
                  >
                    COMING SOON
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      )}
    </Box>
  );
};

export default SpheresHeroLayout;
