import React from 'react';
import { Box, Grid, Card, CardContent, Typography, Button } from '@mui/material';
import { motion } from 'framer-motion';
import { Add as AddIcon, Assessment as AssessmentIcon } from '@mui/icons-material';

/**
 * CardsHeroLayout - Traditional 4 stat cards layout for dashboards
 *
 * This is the default hero layout showing 4 stat cards in a responsive grid:
 * - <702px: 4×1 vertical stack
 * - 702-1016px: 2×2 grid
 * - 1017-1499px: 2×2 grid with AI assistant
 * - 1500px+: 1×4 row with AI assistant
 */
export const CardsHeroLayout = ({
  config,
  stats,
  statsConfig,
  selectedStatus,
  onNewItem,
  StatCardComponent,
  allData = [],
}) => {
  return (
    <Grid container spacing={3} sx={{
      flexGrow: 1,
      margin: 0,
      width: '100%',
      '@media (min-width: 1017px) and (max-width: 1499px)': {
        justifyContent: 'center',
      },
    }}>
      {/* Stats Cards Grid */}
      <Grid item
        xs={12}
        sx={{
          '@media (min-width: 1017px)': {
            width: config.showAIAssistant ? '66.67%' : '100%',
            flexBasis: config.showAIAssistant ? '66.67%' : '100%',
            maxWidth: config.showAIAssistant ? '66.67%' : '100%',
          },
          '@media (min-width: 1500px)': {
            width: config.showAIAssistant ? '75%' : '100%',
            flexBasis: config.showAIAssistant ? '75%' : '100%',
            maxWidth: config.showAIAssistant ? '75%' : '100%',
          },
        }}
      >
        <Box sx={{
          display: 'grid',
          gap: 3,
          width: '100%',
          gridTemplateColumns: '1fr',
          justifyContent: 'stretch',
          '@media (min-width: 702px)': {
            gridTemplateColumns: 'repeat(auto-fit, minmax(225px, 275px))',
            justifyContent: 'center',
          },
          '@media (min-width: 1017px) and (max-width: 1499px)': {
            gridTemplateColumns: 'repeat(2, minmax(225px, 275px))',
            justifyContent: 'center',
          },
          '@media (min-width: 1500px)': {
            gridTemplateColumns: 'repeat(4, minmax(225px, 275px))',
            justifyContent: 'flex-start',
          },
          '& > *': {
            width: '100%',
            justifySelf: 'stretch',
            '@media (min-width: 702px)': {
              minWidth: '225px',
              maxWidth: '275px',
              width: '100%',
              justifySelf: 'center',
            },
            '@media (min-width: 1017px) and (max-width: 1499px)': {
              justifySelf: 'center',
            },
            '@media (min-width: 1500px)': {
              justifySelf: 'start',
            },
          },
        }}>
          {/* Render stat cards based on tab selection */}
          {(() => {
            const rawTabSelection = selectedStatus?.includes(':')
              ? selectedStatus.split(':')[0]
              : selectedStatus;
            const tabSelection = rawTabSelection?.toLowerCase() || 'all';

            return statsConfig && statsConfig
              .filter(statCfg => !statCfg.visibleWhen || statCfg.visibleWhen.includes(tabSelection))
              .slice(0, 4)
              .map((statCfg, index) => {
                if (statCfg.component) {
                  const StatComponent = statCfg.component;
                  if (!StatComponent) {
                    console.error(`[CardsHeroLayout] Component undefined for stat: ${statCfg.id}`);
                    return (
                      <Box key={statCfg.id} sx={{ p: 2, bgcolor: 'error.light', color: 'error.dark' }}>
                        ERROR: {statCfg.id} component is undefined
                      </Box>
                    );
                  }
                  return (
                    <StatComponent
                      key={statCfg.id}
                      data={allData}
                      delay={index}
                      {...(statCfg.props || {})}
                    />
                  );
                }

                // Fallback to old calculation-based approach
                const prefixValue = statCfg.format === 'currency' ? '$' : (statCfg.prefix || '');
                const suffixValue = statCfg.format === 'percentage' ? '%' : (statCfg.suffix || '');
                const statValue = stats?.[statCfg.id]?.value || 0;
                let valueColor = statCfg.valueColor;
                if (valueColor === 'dynamic') {
                  valueColor = statValue >= 0 ? '#4caf50' : '#f44336';
                }

                return StatCardComponent && (
                  <StatCardComponent
                    key={statCfg.id}
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
                );
              });
          })()}
        </Box>

        {/* Action Buttons Row */}
        <Box sx={{
          mt: 3,
          display: 'flex',
          gap: 2,
          justifyContent: { xs: 'center', md: 'center', lg: 'flex-start' },
          '@media (max-width: 1016px)': {
            justifyContent: 'center',
          },
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
                height: 44,
                minWidth: 220,
                px: 3,
                whiteSpace: 'nowrap',
              }}
            >
              {config.analyticsButtonLabel || `${config.entitySingular?.toUpperCase()} ANALYTICS`}
            </Button>
          )}
        </Box>
      </Grid>

      {/* AI Assistant Card (if enabled) */}
      {config.showAIAssistant && (
        <Grid item
          xs={12}
          sx={{
            '@media (max-width: 701px)': {
              width: '100%',
              flexBasis: '100%',
              maxWidth: '100%',
            },
            '@media (min-width: 702px) and (max-width: 1016px)': {
              width: '100%',
              flexBasis: '100%',
              maxWidth: '100%',
            },
            '@media (min-width: 1017px) and (max-width: 1499px)': {
              width: '33.33%',
              flexBasis: '33.33%',
              maxWidth: '33.33%',
            },
            '@media (min-width: 1500px)': {
              width: '25%',
              flexBasis: '25%',
              maxWidth: '25%',
            },
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              {config.aiAssistantWidget ? (
                React.createElement(config.aiAssistantWidget)
              ) : (
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
              )}
            </motion.div>
          </Box>
        </Grid>
      )}
    </Grid>
  );
};

export default CardsHeroLayout;
