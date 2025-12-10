import React from 'react';
import { Box, Grid, Card, CardContent, Typography, Button } from '@mui/material';
import { motion } from 'framer-motion';
import { Add as AddIcon, Assessment as AssessmentIcon } from '@mui/icons-material';

/**
 * SpheresHeroLayout - Nested concentric spheres visualization for contacts
 *
 * Shows the contact hierarchy as nested rounded rectangles:
 * - Outer: Sphere of Influence (largest)
 * - Middle: Leads
 * - Inner: Clients (smallest)
 *
 * Used for the Contacts dashboard to visualize the relationship funnel.
 */
export const SpheresHeroLayout = ({
  config,
  onNewItem,
  sphereData = { sphere: 0, leads: 0, clients: 0 },
  onSphereClick,
  aiCoachConfig,
}) => {
  const { sphere = 0, leads = 0, clients = 0 } = sphereData;

  // Animation variants for the nested spheres
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const sphereVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <Grid container spacing={3} sx={{
      flexGrow: 1,
      margin: 0,
      width: '100%',
      '@media (min-width: 1017px) and (max-width: 1499px)': {
        justifyContent: 'center',
      },
    }}>
      {/* Spheres Visualization */}
      <Grid item
        xs={12}
        sx={{
          '@media (min-width: 1017px)': {
            width: aiCoachConfig ? '66.67%' : '100%',
            flexBasis: aiCoachConfig ? '66.67%' : '100%',
            maxWidth: aiCoachConfig ? '66.67%' : '100%',
          },
          '@media (min-width: 1500px)': {
            width: aiCoachConfig ? '75%' : '100%',
            flexBasis: aiCoachConfig ? '75%' : '100%',
            maxWidth: aiCoachConfig ? '75%' : '100%',
          },
        }}
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Nested Spheres Container */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
              py: 2,
            }}
          >
            {/* Outer Sphere - Sphere of Influence */}
            <motion.div variants={sphereVariants}>
              <Box
                onClick={() => onSphereClick?.('sphere')}
                sx={{
                  position: 'relative',
                  width: { xs: 280, sm: 340, md: 400 },
                  height: { xs: 280, sm: 340, md: 400 },
                  borderRadius: '24px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(8px)',
                  border: '2px solid rgba(255, 255, 255, 0.15)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  pt: 2,
                  cursor: onSphereClick ? 'pointer' : 'default',
                  transition: 'all 0.3s ease',
                  '&:hover': onSphereClick ? {
                    background: 'rgba(255, 255, 255, 0.12)',
                    border: '2px solid rgba(255, 255, 255, 0.25)',
                    transform: 'scale(1.02)',
                  } : {},
                }}
              >
                {/* Sphere Label */}
                <Typography
                  variant="caption"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    mb: 0.5,
                  }}
                >
                  Sphere of Influence
                </Typography>
                <Typography
                  variant="h4"
                  sx={{
                    color: 'white',
                    fontWeight: 700,
                    fontSize: { xs: '1.5rem', md: '2rem' },
                  }}
                >
                  {sphere.toLocaleString()}
                </Typography>

                {/* Middle Sphere - Leads */}
                <motion.div variants={sphereVariants}>
                  <Box
                    onClick={(e) => {
                      e.stopPropagation();
                      onSphereClick?.('leads');
                    }}
                    sx={{
                      position: 'relative',
                      width: { xs: 200, sm: 240, md: 280 },
                      height: { xs: 200, sm: 240, md: 280 },
                      borderRadius: '20px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(8px)',
                      border: '2px solid rgba(255, 255, 255, 0.2)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                      pt: 2,
                      mt: 1,
                      cursor: onSphereClick ? 'pointer' : 'default',
                      transition: 'all 0.3s ease',
                      '&:hover': onSphereClick ? {
                        background: 'rgba(255, 255, 255, 0.15)',
                        border: '2px solid rgba(255, 255, 255, 0.3)',
                        transform: 'scale(1.02)',
                      } : {},
                    }}
                  >
                    {/* Leads Label */}
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        mb: 0.5,
                      }}
                    >
                      Leads
                    </Typography>
                    <Typography
                      variant="h4"
                      sx={{
                        color: 'white',
                        fontWeight: 700,
                        fontSize: { xs: '1.5rem', md: '2rem' },
                      }}
                    >
                      {leads.toLocaleString()}
                    </Typography>

                    {/* Inner Sphere - Clients */}
                    <motion.div variants={sphereVariants}>
                      <Box
                        onClick={(e) => {
                          e.stopPropagation();
                          onSphereClick?.('clients');
                        }}
                        sx={{
                          position: 'relative',
                          width: { xs: 120, sm: 140, md: 160 },
                          height: { xs: 120, sm: 140, md: 160 },
                          borderRadius: '16px',
                          background: 'rgba(255, 255, 255, 0.15)',
                          backdropFilter: 'blur(8px)',
                          border: '2px solid rgba(255, 255, 255, 0.25)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mt: 2,
                          cursor: onSphereClick ? 'pointer' : 'default',
                          transition: 'all 0.3s ease',
                          '&:hover': onSphereClick ? {
                            background: 'rgba(255, 255, 255, 0.22)',
                            border: '2px solid rgba(255, 255, 255, 0.4)',
                            transform: 'scale(1.05)',
                          } : {},
                        }}
                      >
                        {/* Clients Label */}
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'rgba(255, 255, 255, 0.8)',
                            fontSize: '0.65rem',
                            fontWeight: 600,
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            mb: 0.5,
                          }}
                        >
                          Clients
                        </Typography>
                        <Typography
                          variant="h4"
                          sx={{
                            color: 'white',
                            fontWeight: 700,
                            fontSize: { xs: '1.25rem', md: '1.5rem' },
                          }}
                        >
                          {clients.toLocaleString()}
                        </Typography>
                      </Box>
                    </motion.div>
                  </Box>
                </motion.div>
              </Box>
            </motion.div>
          </Box>
        </motion.div>

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

      {/* AI Coach Card */}
      {aiCoachConfig && (
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
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card
                elevation={0}
                sx={{
                  width: '300px',
                  minHeight: '300px',
                  minWidth: '300px',
                  maxWidth: '300px',
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
                  cursor: aiCoachConfig.onHire ? 'pointer' : 'default',
                  '&:hover': aiCoachConfig.onHire ? {
                    border: '2px dashed rgba(255, 255, 255, 0.5)',
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0.12) 100%)',
                  } : {},
                }}
                onClick={aiCoachConfig.onHire}
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
                      <Typography sx={{ fontSize: '2rem' }}>🧠</Typography>
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
                      {aiCoachConfig.title || 'AI Coach'}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        mb: 2,
                        fontSize: '0.875rem',
                      }}
                    >
                      {aiCoachConfig.description || 'Get personalized coaching to grow your sphere of influence and convert more leads.'}
                    </Typography>
                    <Box
                      sx={{
                        display: 'inline-block',
                        px: 2,
                        py: 0.75,
                        borderRadius: 2,
                        background: aiCoachConfig.onHire
                          ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                          : 'rgba(255, 255, 255, 0.2)',
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
                        {aiCoachConfig.onHire ? 'Hire Coach' : 'Coming Soon'}
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
  );
};

export default SpheresHeroLayout;
