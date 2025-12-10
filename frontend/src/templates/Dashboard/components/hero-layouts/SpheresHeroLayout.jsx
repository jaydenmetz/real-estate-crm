import React from 'react';
import { Box, Grid, Card, CardContent, Typography, Button } from '@mui/material';
import { motion } from 'framer-motion';
import { Add as AddIcon, Assessment as AssessmentIcon, People, Handshake } from '@mui/icons-material';

/**
 * SpheresHeroLayout - Horizontal nested spheres visualization for contacts
 *
 * Shows the contact hierarchy as horizontally nested rounded rectangles:
 * - Left: Sphere of Influence (largest, contains all)
 * - Right nested: Leads (medium, contains clients)
 * - Innermost right: Clients (smallest, green circle)
 *
 * Labels appear at top-left of each section with values at bottom.
 */
export const SpheresHeroLayout = ({
  config,
  onNewItem,
  sphereData = { sphere: 0, leads: 0, clients: 0 },
  onSphereClick,
  aiCoachConfig,
}) => {
  const { sphere = 0, leads = 0, clients = 0 } = sphereData;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
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

  return (
    <Grid container spacing={2} sx={{
      flexGrow: 1,
      margin: 0,
      width: '100%',
      flexWrap: 'nowrap',
      '@media (max-width: 500px)': {
        flexWrap: 'wrap',
      },
    }}>
      {/* Spheres Visualization */}
      <Grid item
        sx={{
          flex: '1 1 auto',
          minWidth: 0,
          '@media (max-width: 500px)': {
            width: '100%',
            flexBasis: '100%',
            maxWidth: '100%',
          },
        }}
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Horizontal Nested Spheres */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'stretch',
              width: '100%',
              height: 200,
            }}
          >
            {/* Outer Container - Sphere of Influence */}
            <motion.div variants={sphereVariants} style={{ flex: '1 1 auto', display: 'flex', maxWidth: 575, minWidth: 280, width: '100%' }}>
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
                        fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                        lineHeight: 1,
                        letterSpacing: '-0.02em',
                      }}
                    >
                      {sphere.toLocaleString()}
                    </Typography>
                    <People sx={{ color: 'rgba(255,255,255,0.6)', fontSize: { xs: 20, md: 24 } }} />
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
                              fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' },
                              lineHeight: 1,
                              letterSpacing: '-0.02em',
                            }}
                          >
                            {leads.toLocaleString()}
                          </Typography>
                          <Typography sx={{ fontSize: { xs: 16, md: 20 } }}>🤝</Typography>
                        </Box>
                      </Box>

                      {/* Right Side - Clients Circle */}
                      <Box
                        sx={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          p: 1,
                        }}
                      >
                        <motion.div variants={sphereVariants}>
                          <Box
                            onClick={(e) => {
                              e.stopPropagation();
                              onSphereClick?.('clients');
                            }}
                            sx={{
                              width: { xs: 80, sm: 100, md: 120 },
                              height: { xs: 80, sm: 100, md: 120 },
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
                                fontSize: '0.55rem',
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
                                fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
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

        {/* Action Buttons Row */}
        <Box sx={{
          mt: 3,
          display: 'flex',
          gap: 2,
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
      {/* AI Coach Card - 300x300 Manager Slot */}
      {aiCoachConfig && (
        <Grid item
          sx={{
            flex: '0 0 auto',
            '@media (max-width: 500px)': {
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
            },
          }}
        >
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
        </Grid>
      )}
    </Grid>
  );
};

export default SpheresHeroLayout;
