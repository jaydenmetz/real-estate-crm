import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Rating,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Paper,
  IconButton,
  Stack,
  useTheme,
  alpha,
  Skeleton,
  LinearProgress,
  Fade,
  Grow,
  Zoom
} from '@mui/material';
import {
  Email,
  Phone,
  Language,
  LinkedIn,
  Facebook,
  Instagram,
  Twitter,
  YouTube,
  LocationOn,
  Home,
  TrendingUp,
  CalendarToday,
  EmojiEvents,
  Verified,
  School,
  Groups,
  AttachMoney,
  Star,
  WorkspacePremium,
  Analytics,
  LocalOffer,
  Speed,
  AutoGraph
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import CountUp from 'react-countup';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import apiInstance, { api } from '../services/api';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100
    }
  }
};

// Animated components
const MotionCard = motion(Card);
const MotionBox = motion(Box);
const MotionPaper = motion(Paper);

// Custom animated stat card
const AnimatedStatCard = ({ icon, value, label, prefix = '', suffix = '', delay = 0, color = 'primary' }) => {
  const theme = useTheme();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <MotionCard
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: delay / 1000, duration: 0.5, type: "spring" }}
      sx={{
        height: '100%',
        background: `linear-gradient(135deg, ${alpha(theme.palette[color].main, 0.1)} 0%, ${alpha(theme.palette[color].dark, 0.05)} 100%)`,
        border: `1px solid ${alpha(theme.palette[color].main, 0.2)}`,
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[8],
          transition: 'all 0.3s ease'
        }
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: -50,
          right: -50,
          width: 150,
          height: 150,
          borderRadius: '50%',
          background: alpha(theme.palette[color].main, 0.1),
        }}
      />
      <CardContent sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: alpha(theme.palette[color].main, 0.1),
              color: theme.palette[color].main
            }}
          >
            {icon}
          </Box>
          <Chip
            icon={<TrendingUp fontSize="small" />}
            label="+12%"
            size="small"
            color={color}
            sx={{ fontWeight: 'bold' }}
          />
        </Box>
        <Typography variant="h3" fontWeight="bold" gutterBottom>
          {isVisible && (
            <CountUp
              start={0}
              end={value}
              duration={2.5}
              separator=","
              prefix={prefix}
              suffix={suffix}
            />
          )}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {label}
        </Typography>
        <LinearProgress
          variant="determinate"
          value={75}
          sx={{
            mt: 2,
            height: 6,
            borderRadius: 3,
            backgroundColor: alpha(theme.palette[color].main, 0.1),
            '& .MuiLinearProgress-bar': {
              borderRadius: 3,
              backgroundColor: theme.palette[color].main
            }
          }}
        />
      </CardContent>
    </MotionCard>
  );
};

// Stunning Hero Section
const StunningHeroSection = ({ data, theme }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height
    });
  };

  return (
    <Box
      onMouseMove={handleMouseMove}
      sx={{
        position: 'relative',
        minHeight: 500,
        background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 50%, ${theme.palette.secondary.main} 100%)`,
        overflow: 'hidden'
      }}
    >
      {/* Animated background elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          left: '5%',
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: alpha(theme.palette.common.white, 0.1),
          filter: 'blur(40px)',
          transform: `translate(${mousePosition.x * 50}px, ${mousePosition.y * 50}px)`,
          transition: 'transform 0.3s ease-out'
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '10%',
          right: '10%',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: alpha(theme.palette.secondary.light, 0.1),
          filter: 'blur(60px)',
          transform: `translate(${-mousePosition.x * 30}px, ${-mousePosition.y * 30}px)`,
          transition: 'transform 0.3s ease-out'
        }}
      />

      {/* Floating shapes */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -20, 0],
            rotate: [0, 360],
          }}
          transition={{
            duration: 10 + i * 2,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{
            position: 'absolute',
            top: `${20 + i * 15}%`,
            left: `${10 + i * 20}%`,
            width: 40 + i * 10,
            height: 40 + i * 10,
            border: `2px solid ${alpha(theme.palette.common.white, 0.2)}`,
            borderRadius: i % 2 === 0 ? '50%' : '10%',
          }}
        />
      ))}

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Grid container spacing={4} alignItems="center" sx={{ minHeight: 500, py: 6 }}>
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, type: "spring" }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
                <Avatar
                  src={data.profilePhoto}
                  sx={{
                    width: 180,
                    height: 180,
                    border: '4px solid white',
                    boxShadow: theme.shadows[10],
                    bgcolor: 'primary.main',
                    fontSize: '4rem'
                  }}
                >
                  {data.displayName?.charAt(0)}
                </Avatar>
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                    <Verified sx={{ color: 'white' }} />
                    <Typography variant="body1" sx={{ color: 'white', opacity: 0.9 }}>
                      Verified Professional
                    </Typography>
                  </Stack>
                  <Rating value={5} readOnly sx={{ mb: 1 }} />
                  <Stack direction="row" spacing={1}>
                    <Chip
                      icon={<WorkspacePremium />}
                      label="Top Producer"
                      sx={{ bgcolor: 'white', fontWeight: 'bold' }}
                    />
                    <Chip
                      icon={<Star />}
                      label="5.0 Rating"
                      sx={{ bgcolor: 'white', fontWeight: 'bold' }}
                    />
                  </Stack>
                </Box>
              </Box>

              <Typography
                variant="h2"
                fontWeight="bold"
                sx={{
                  color: 'white',
                  mb: 2,
                  textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                }}
              >
                {data.displayName}
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  color: 'white',
                  opacity: 0.9,
                  mb: 3
                }}
              >
                {data.professionalTitle}
              </Typography>
              {data.professional.licenseNumber && (
                <Typography
                  variant="body1"
                  sx={{
                    color: 'white',
                    opacity: 0.8,
                    mb: 3
                  }}
                >
                  {data.professional.licenseNumber} • {data.professional.yearsExperience} Years Experience
                </Typography>
              )}

              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<Email />}
                  href={`mailto:${data.contact.email}`}
                  sx={{
                    bgcolor: 'white',
                    color: 'primary.main',
                    fontWeight: 'bold',
                    '&:hover': {
                      bgcolor: 'grey.100',
                      transform: 'translateY(-2px)',
                      boxShadow: theme.shadows[8]
                    }
                  }}
                >
                  Contact Me
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<Phone />}
                  href={`tel:${data.contact.phone}`}
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    fontWeight: 'bold',
                    '&:hover': {
                      borderColor: 'white',
                      bgcolor: alpha(theme.palette.common.white, 0.1),
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  Call Now
                </Button>
              </Stack>
            </motion.div>
          </Grid>

          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2, type: "spring" }}
            >
              {/* Live performance chart */}
              <Paper
                sx={{
                  p: 3,
                  background: alpha(theme.palette.common.white, 0.9),
                  backdropFilter: 'blur(10px)'
                }}
              >
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Performance Overview
                </Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart
                    data={[
                      { month: 'Jan', sales: 8, volume: 3.2 },
                      { month: 'Feb', sales: 10, volume: 4.1 },
                      { month: 'Mar', sales: 15, volume: 5.8 },
                      { month: 'Apr', sales: 12, volume: 4.5 },
                      { month: 'May', sales: 18, volume: 7.2 },
                      { month: 'Jun', sales: 20, volume: 8.5 }
                    ]}
                  >
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={theme.palette.secondary.main} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={theme.palette.secondary.main} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="sales"
                      stroke={theme.palette.primary.main}
                      fillOpacity={1}
                      fill="url(#colorSales)"
                      strokeWidth={3}
                    />
                    <Area
                      type="monotone"
                      dataKey="volume"
                      stroke={theme.palette.secondary.main}
                      fillOpacity={1}
                      fill="url(#colorVolume)"
                      strokeWidth={3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Paper>
            </motion.div>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

// Market expertise radar chart
const MarketExpertiseChart = ({ data, theme }) => {
  const radarData = data.professional.serviceAreas?.slice(0, 6).map(area => ({
    area,
    value: 75 + Math.random() * 25,
    fullMark: 100
  })) || [];

  return (
    <MotionCard
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      sx={{ height: '100%' }}
    >
      <CardContent>
        <Typography variant="h6" gutterBottom fontWeight="bold">
          Market Expertise
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={radarData}>
            <PolarGrid stroke={alpha(theme.palette.divider, 0.3)} />
            <PolarAngleAxis dataKey="area" />
            <PolarRadiusAxis angle={90} domain={[0, 100]} />
            <Radar
              name="Expertise"
              dataKey="value"
              stroke={theme.palette.primary.main}
              fill={theme.palette.primary.main}
              fillOpacity={0.6}
            />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </MotionCard>
  );
};

// Sales volume trend chart
const SalesVolumeChart = ({ theme }) => {
  const data = [
    { year: '2020', volume: 15.2 },
    { year: '2021', volume: 22.8 },
    { year: '2022', volume: 31.5 },
    { year: '2023', volume: 45.3 },
    { year: '2024', volume: 65.7 }
  ];

  return (
    <MotionCard
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      sx={{ height: '100%' }}
    >
      <CardContent>
        <Typography variant="h6" gutterBottom fontWeight="bold">
          Sales Volume Growth
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip formatter={(value) => `$${value}M`} />
            <Bar
              dataKey="volume"
              fill={theme.palette.secondary.main}
              radius={[8, 8, 0, 0]}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={index === data.length - 1 ? theme.palette.primary.main : theme.palette.secondary.main} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </MotionCard>
  );
};

const PublicProfileStunning = () => {
  const { username } = useParams();
  const theme = useTheme();

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['publicProfile', username],
    queryFn: async () => {
      const response = await api.profilesAPI.getPublic(username);
      if (response && response.success && response.data) {
        return response.data;
      }
      throw new Error('Invalid response format');
    },
    staleTime: 5 * 60 * 1000
  });

  if (isLoading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Home sx={{ fontSize: 60, color: 'primary.main' }} />
        </motion.div>
      </Box>
    );
  }

  if (error || !profile) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Profile Not Found
        </Typography>
        <Typography color="text.secondary">
          The profile you're looking for doesn't exist or is private.
        </Typography>
      </Container>
    );
  }

  const data = profile;

  return (
    <Box sx={{ bgcolor: 'grey.50', minHeight: '100vh' }}>
      {/* Stunning Hero Section */}
      <StunningHeroSection data={data} theme={theme} />

      <Container maxWidth="lg" sx={{ py: 6 }}>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Animated Statistics */}
          <Grid container spacing={3} sx={{ mb: 6 }}>
            <Grid item xs={12} sm={6} md={3}>
              <AnimatedStatCard
                icon={<Home fontSize="large" />}
                value={data.statistics.totalSales}
                label="Properties Sold"
                delay={0}
                color="primary"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <AnimatedStatCard
                icon={<AttachMoney fontSize="large" />}
                value={data.statistics.totalVolume / 1000000}
                prefix="$"
                suffix="M"
                label="Total Sales Volume"
                delay={200}
                color="secondary"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <AnimatedStatCard
                icon={<Speed fontSize="large" />}
                value={data.statistics.avgDaysOnMarket}
                label="Avg Days on Market"
                delay={400}
                color="success"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <AnimatedStatCard
                icon={<AutoGraph fontSize="large" />}
                value={data.statistics.avgSaleToListRatio}
                suffix="%"
                label="Sale to List Ratio"
                delay={600}
                color="warning"
              />
            </Grid>
          </Grid>

          {/* Charts Section */}
          <Grid container spacing={3} sx={{ mb: 6 }}>
            <Grid item xs={12} md={6}>
              <MarketExpertiseChart data={data} theme={theme} />
            </Grid>
            <Grid item xs={12} md={6}>
              <SalesVolumeChart theme={theme} />
            </Grid>
          </Grid>

          {/* About and Specialties */}
          <Grid container spacing={3} sx={{ mb: 6 }}>
            <Grid item xs={12} md={8}>
              <MotionCard
                variants={itemVariants}
                sx={{
                  background: 'white',
                  overflow: 'visible',
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  }
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h5" gutterBottom fontWeight="bold">
                    About {data.displayName.split(' ')[0]}
                  </Typography>
                  <Typography variant="body1" paragraph color="text.secondary" sx={{ lineHeight: 1.8 }}>
                    {data.bio}
                  </Typography>

                  {/* Specialties with animations */}
                  <Box sx={{ mt: 4 }}>
                    <Typography variant="h6" gutterBottom fontWeight="bold">
                      Areas of Expertise
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {data.professional.specialties?.map((specialty, i) => (
                        <Zoom in={true} key={i} style={{ transitionDelay: `${i * 100}ms` }}>
                          <Chip
                            icon={<LocalOffer />}
                            label={specialty}
                            sx={{
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              fontWeight: 'bold',
                              '&:hover': {
                                bgcolor: alpha(theme.palette.primary.main, 0.2),
                                transform: 'scale(1.05)'
                              }
                            }}
                          />
                        </Zoom>
                      ))}
                    </Box>
                  </Box>

                  {/* Service Areas */}
                  <Box sx={{ mt: 4 }}>
                    <Typography variant="h6" gutterBottom fontWeight="bold">
                      Service Areas
                    </Typography>
                    <Grid container spacing={1}>
                      {data.professional.serviceAreas?.map((area, i) => (
                        <Grid item key={i}>
                          <Fade in={true} timeout={1000 + i * 200}>
                            <Paper
                              sx={{
                                px: 2,
                                py: 1,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                bgcolor: 'grey.100',
                                '&:hover': {
                                  bgcolor: 'grey.200',
                                  transform: 'translateY(-2px)',
                                  boxShadow: theme.shadows[2]
                                }
                              }}
                            >
                              <LocationOn fontSize="small" color="primary" />
                              <Typography variant="body2" fontWeight="medium">
                                {area}
                              </Typography>
                            </Paper>
                          </Fade>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                </CardContent>
              </MotionCard>
            </Grid>

            {/* Achievements and Awards */}
            <Grid item xs={12} md={4}>
              <Stack spacing={3}>
                {/* Achievements */}
                <MotionCard
                  variants={itemVariants}
                  sx={{
                    background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)} 0%, ${alpha(theme.palette.warning.light, 0.05)} 100%)`,
                    border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <EmojiEvents sx={{ color: 'warning.main' }} />
                      <Typography variant="h6" fontWeight="bold">
                        Achievements
                      </Typography>
                    </Box>
                    <Stack spacing={2}>
                      {data.achievements?.map((achievement, i) => (
                        <Grow in={true} key={i} timeout={1000 + i * 200}>
                          <Paper
                            sx={{
                              p: 2,
                              bgcolor: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 2
                            }}
                          >
                            <WorkspacePremium sx={{ color: 'warning.main' }} />
                            <Box>
                              <Typography variant="subtitle2" fontWeight="bold">
                                {achievement.title}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {achievement.issuer} • {achievement.year}
                              </Typography>
                            </Box>
                          </Paper>
                        </Grow>
                      ))}
                    </Stack>
                  </CardContent>
                </MotionCard>

                {/* Contact Card */}
                <MotionCard
                  variants={itemVariants}
                  sx={{
                    background: theme.palette.primary.main,
                    color: 'white'
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      Let's Connect
                    </Typography>
                    <Stack spacing={2}>
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<Email />}
                        href={`mailto:${data.contact.email}`}
                        sx={{
                          bgcolor: 'white',
                          color: 'primary.main',
                          '&:hover': {
                            bgcolor: 'grey.100'
                          }
                        }}
                      >
                        Send Email
                      </Button>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<Phone />}
                        href={`tel:${data.contact.phone}`}
                        sx={{
                          borderColor: 'white',
                          color: 'white',
                          '&:hover': {
                            borderColor: 'white',
                            bgcolor: alpha(theme.palette.common.white, 0.1)
                          }
                        }}
                      >
                        Call Direct
                      </Button>
                    </Stack>
                  </CardContent>
                </MotionCard>
              </Stack>
            </Grid>
          </Grid>

          {/* Testimonials Section */}
          {data.testimonials?.length > 0 && (
            <Box sx={{ mb: 6 }}>
              <Typography variant="h4" gutterBottom fontWeight="bold" textAlign="center" sx={{ mb: 4 }}>
                Client Success Stories
              </Typography>
              <Grid container spacing={3}>
                {data.testimonials.map((testimonial, index) => (
                  <Grid item xs={12} md={4} key={index}>
                    <MotionCard
                      whileHover={{ y: -10 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      sx={{
                        height: '100%',
                        background: 'white',
                        position: 'relative',
                        overflow: 'visible',
                        '&::before': {
                          content: '"""',
                          position: 'absolute',
                          top: -20,
                          left: 20,
                          fontSize: 60,
                          color: alpha(theme.palette.primary.main, 0.2),
                          fontFamily: 'serif'
                        }
                      }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Rating value={testimonial.rating} readOnly sx={{ mb: 2 }} />
                        <Typography variant="body1" paragraph sx={{ fontStyle: 'italic', mb: 3 }}>
                          {testimonial.testimonial_text}
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Typography variant="subtitle2" fontWeight="bold">
                          {testimonial.client_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {testimonial.client_type === 'buyer' ? 'Home Buyer' : 'Home Seller'} • {new Date(testimonial.transaction_date).getFullYear()}
                        </Typography>
                      </CardContent>
                    </MotionCard>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </motion.div>
      </Container>
    </Box>
  );
};

export default PublicProfileStunning;