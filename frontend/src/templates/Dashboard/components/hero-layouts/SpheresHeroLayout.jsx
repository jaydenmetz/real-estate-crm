import React from 'react';
import { Box, Grid, Card, CardContent, Typography, Button } from '@mui/material';
import { motion } from 'framer-motion';
import { Add as AddIcon, Assessment as AssessmentIcon, People, Handshake } from '@mui/icons-material';

/**
 * SpheresHeroLayout - Contacts hero with stat cards and spheres visualization
 *
 * Layout Structure:
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ Row 1: [Stat Card 1] [Stat Card 2] [Stat Card 3] [Stat Card 4] │ AI    │
 * │                                                                 │Manager│
 * │ Row 2: [Buttons Container]  [Spheres Visualization Container]  │ Card  │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * Stat Cards: Total Contacts | New This Month | Total Portfolio | Lifetime Value
 * Spheres: Nested visualization showing Sphere > Leads > Clients hierarchy
 */
export const SpheresHeroLayout = ({
  config,
  onNewItem,
  sphereData = { sphere: 0, leads: 0, clients: 0 },
  onSphereClick,
  aiCoachConfig,
  // NEW: Stat cards support
  statCards = null, // Array of { component: Component, props: {} }
  allData = [], // Data for stat card calculations
}) => {
  const { sphere = 0, leads = 0, clients = 0 } = sphereData;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.05,
      },
    },
  };

  const sphereVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15,
      },
    },
  };

  // Check if we have stat cards to render
  const hasStatCards = statCards && statCards.length > 0;

  return (
    <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
      {/* Main Content Area (Stat Cards + Buttons + Spheres) */}
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

        {/* Row 2: Buttons (centered in left area) + Spheres (right, fixed width) */}
        <Box sx={{
          display: 'flex',
          gap: 0,
          alignItems: 'center',
          overflowX: 'auto',
          overflowY: 'hidden',
          pb: 1, // Space for scrollbar
          // Custom scrollbar styling
          '&::-webkit-scrollbar': {
            height: 6,
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: 3,
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(255, 255, 255, 0.3)',
            borderRadius: 3,
            '&:hover': {
              background: 'rgba(255, 255, 255, 0.5)',
            },
          },
        }}>
          {/* Buttons Container - Takes remaining space, centers buttons within */}
          <Box sx={{
            flex: '1 1 auto',
            display: 'flex',
            flexDirection: 'row',
            gap: 1.5,
            alignItems: 'center',
            justifyContent: 'center', // Center buttons in the available space
            minWidth: 'fit-content',
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

          {/* Spheres Visualization Container - Fixed width, aligned right */}
          <Box sx={{
            flex: '0 0 auto', // Don't grow or shrink
            width: 450, // Fixed width for spheres
            minWidth: 320, // Minimum width before horizontal scroll kicks in
          }}>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              style={{ height: '100%', width: '100%' }}
            >
              {/* Horizontal Nested Spheres */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  alignItems: 'stretch',
                  width: '100%',
                  height: hasStatCards ? 160 : 200,
                }}
              >
                {/* Outer Container - Sphere of Influence */}
                <motion.div variants={sphereVariants} style={{ flex: '1 1 auto', display: 'flex', width: '100%' }}>
                  <Box
                    onClick={() => onSphereClick?.('sphere')}
                    sx={{
                      position: 'relative',
                      flex: 1,
                      height: '100%',
                      borderRadius: '16px',
                      background: 'rgba(0, 0, 0, 0.25)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      display: 'flex',
                      flexDirection: 'row',
                      cursor: onSphereClick ? 'pointer' : 'default',
                      transition: 'all 0.3s ease',
                      overflow: 'hidden',
                      '&:hover': onSphereClick ? {
                        background: 'rgba(0, 0, 0, 0.3)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                      } : {},
                    }}
                  >
                    {/* Left Side - Sphere Info */}
                    <Box
                      sx={{
                        flex: '0 0 auto',
                        width: { xs: '40%', sm: '35%', md: '30%' },
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        p: { xs: 1.5, md: 2 },
                      }}
                    >
                      {/* Top Label */}
                      <Box
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 0.5,
                          bgcolor: 'rgba(100, 116, 139, 0.8)',
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 1,
                          width: 'fit-content',
                        }}
                      >
                        <Typography
                          sx={{
                            color: 'white',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase',
                          }}
                        >
                          SPHERE
                        </Typography>
                      </Box>

                      {/* Bottom Value */}
                      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                        <Typography
                          sx={{
                            color: 'white',
                            fontWeight: 800,
                            fontSize: hasStatCards
                              ? { xs: '1.75rem', sm: '2rem', md: '2.5rem' }
                              : { xs: '2rem', sm: '2.5rem', md: '3rem' },
                            lineHeight: 1,
                            letterSpacing: '-0.02em',
                          }}
                        >
                          {sphere.toLocaleString()}
                        </Typography>
                        <People sx={{ color: 'rgba(255,255,255,0.6)', fontSize: { xs: 18, md: 22 } }} />
                      </Box>
                    </Box>

                    {/* Right Side - Leads Container */}
                    <Box
                      sx={{
                        flex: 1,
                        display: 'flex',
                        p: { xs: 1, md: 1.5 },
                      }}
                    >
                      <motion.div variants={sphereVariants} style={{ flex: 1, display: 'flex' }}>
                        <Box
                          onClick={(e) => {
                            e.stopPropagation();
                            onSphereClick?.('leads');
                          }}
                          sx={{
                            position: 'relative',
                            flex: 1,
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, rgba(180, 140, 80, 0.4) 0%, rgba(160, 120, 60, 0.3) 100%)',
                            border: '2px solid rgba(200, 160, 100, 0.5)',
                            display: 'flex',
                            flexDirection: 'row',
                            cursor: onSphereClick ? 'pointer' : 'default',
                            transition: 'all 0.3s ease',
                            overflow: 'hidden',
                            '&:hover': onSphereClick ? {
                              background: 'linear-gradient(135deg, rgba(180, 140, 80, 0.5) 0%, rgba(160, 120, 60, 0.4) 100%)',
                              border: '2px solid rgba(200, 160, 100, 0.7)',
                            } : {},
                          }}
                        >
                          {/* Left Side - Leads Info */}
                          <Box
                            sx={{
                              flex: '0 0 auto',
                              width: { xs: '50%', md: '45%' },
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between',
                              p: { xs: 1, md: 1.5 },
                            }}
                          >
                            {/* Top Label */}
                            <Box
                              sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 0.5,
                                bgcolor: 'rgba(180, 140, 80, 0.9)',
                                px: 1.5,
                                py: 0.5,
                                borderRadius: 1,
                                width: 'fit-content',
                              }}
                            >
                              <Typography
                                sx={{
                                  color: 'white',
                                  fontSize: '0.65rem',
                                  fontWeight: 700,
                                  letterSpacing: '0.05em',
                                  textTransform: 'uppercase',
                                }}
                              >
                                LEADS
                              </Typography>
                            </Box>

                            {/* Bottom Value */}
                            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                              <Typography
                                sx={{
                                  color: 'white',
                                  fontWeight: 800,
                                  fontSize: hasStatCards
                                    ? { xs: '1.5rem', sm: '1.75rem', md: '2rem' }
                                    : { xs: '1.75rem', sm: '2rem', md: '2.5rem' },
                                  lineHeight: 1,
                                  letterSpacing: '-0.02em',
                                }}
                              >
                                {leads.toLocaleString()}
                              </Typography>
                              <Typography sx={{ fontSize: { xs: 14, md: 18 } }}>🤝</Typography>
                            </Box>
                          </Box>

                          {/* Right Side - Clients Circle */}
                          <Box
                            sx={{
                              flex: '0 0 auto',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              p: 0.5,
                              pr: 1,
                            }}
                          >
                            <motion.div variants={sphereVariants}>
                              <Box
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSphereClick?.('clients');
                                }}
                                sx={{
                                  width: hasStatCards
                                    ? { xs: 60, sm: 70, md: 80 }
                                    : { xs: 70, sm: 85, md: 100 },
                                  height: hasStatCards
                                    ? { xs: 60, sm: 70, md: 80 }
                                    : { xs: 70, sm: 85, md: 100 },
                                  borderRadius: '50%',
                                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                  border: '3px solid rgba(16, 185, 129, 0.6)',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: onSphereClick ? 'pointer' : 'default',
                                  transition: 'all 0.3s ease',
                                  boxShadow: '0 4px 20px rgba(16, 185, 129, 0.3)',
                                  '&:hover': onSphereClick ? {
                                    transform: 'scale(1.05)',
                                    boxShadow: '0 6px 30px rgba(16, 185, 129, 0.4)',
                                  } : {},
                                }}
                              >
                                <Typography
                                  sx={{
                                    color: 'rgba(255, 255, 255, 0.9)',
                                    fontSize: { xs: '0.45rem', md: '0.5rem' },
                                    fontWeight: 700,
                                    letterSpacing: '0.1em',
                                    textTransform: 'uppercase',
                                    mb: 0.25,
                                  }}
                                >
                                  CLIENTS
                                </Typography>
                                <Typography
                                  sx={{
                                    color: 'white',
                                    fontWeight: 800,
                                    fontSize: hasStatCards
                                      ? { xs: '0.9rem', sm: '1rem', md: '1.25rem' }
                                      : { xs: '1rem', sm: '1.25rem', md: '1.5rem' },
                                    lineHeight: 1,
                                  }}
                                >
                                  {clients.toLocaleString()}
                                </Typography>
                              </Box>
                            </motion.div>
                          </Box>
                        </Box>
                      </motion.div>
                    </Box>
                  </Box>
                </motion.div>
              </Box>
            </motion.div>
          </Box>
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
