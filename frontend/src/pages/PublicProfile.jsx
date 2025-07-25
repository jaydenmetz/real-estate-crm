import React from 'react';
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
  Skeleton
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
  AttachMoney
} from '@mui/icons-material';
import apiInstance, { api } from '../services/api';

// Custom styled components
const HeroSection = ({ children }) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        position: 'relative',
        height: 400,
        background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
        color: 'white',
        mb: 4
      }}
    >
      {children}
    </Box>
  );
};

const StatCard = ({ icon, value, label, prefix = '' }) => (
  <Paper
    elevation={0}
    sx={{
      p: 3,
      textAlign: 'center',
      background: (theme) => alpha(theme.palette.primary.main, 0.08),
      borderRadius: 2
    }}
  >
    <Box sx={{ mb: 2, color: 'primary.main' }}>{icon}</Box>
    <Typography variant="h4" fontWeight="bold">
      {prefix}{value?.toLocaleString() || '0'}
    </Typography>
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
  </Paper>
);

const PublicProfile = () => {
  const { username } = useParams();
  const theme = useTheme();

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['publicProfile', username],
    queryFn: async () => {
      console.log('Fetching profile for:', username);
      console.log('Auth token present:', apiInstance.hasToken());
      try {
        const response = await api.profilesAPI.getPublic(username);
        console.log('Profile response:', response);
        // API returns {success: true, data: {...}}
        if (response && response.success && response.data) {
          return response.data;
        }
        throw new Error('Invalid response format');
      } catch (err) {
        console.error('Profile fetch error:', err);
        console.error('Error status:', err.status);
        throw err;
      }
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Skeleton variant="rectangular" height={400} sx={{ mb: 4 }} />
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map(i => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Skeleton variant="rectangular" height={150} />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  if (error) {
    console.error('Profile error:', error);
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Error Loading Profile
        </Typography>
        <Typography color="text.secondary">
          {error.message || 'An error occurred while loading the profile.'}
        </Typography>
      </Container>
    );
  }

  if (!profile) {
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

  // We now return data directly from the query
  const data = profile;

  return (
    <>
      {/* Hero Section with Cover Photo */}
      <HeroSection>
        {data.coverPhoto && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `url(${data.coverPhoto})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: 0.3
            }}
          />
        )}
        
        <Container maxWidth="lg" sx={{ height: '100%', position: 'relative' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-end',
              height: '100%',
              pb: 4
            }}
          >
            <Avatar
              src={data.profilePhoto}
              sx={{
                width: 160,
                height: 160,
                border: '4px solid white',
                bgcolor: 'primary.main',
                fontSize: '3rem'
              }}
            >
              {data.displayName?.charAt(0)}
            </Avatar>
            
            <Box sx={{ ml: 3, flex: 1 }}>
              <Typography variant="h3" fontWeight="bold">
                {data.displayName}
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                {data.professionalTitle}
              </Typography>
              {data.professional.licenseNumber && (
                <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Verified fontSize="small" />
                  <Typography variant="body2">
                    {data.professional.licenseNumber}
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Contact Buttons */}
            <Stack direction="row" spacing={2}>
              {data.contact.email && (
                <Button
                  variant="contained"
                  color="inherit"
                  startIcon={<Email />}
                  href={`mailto:${data.contact.email}`}
                  sx={{ bgcolor: 'white', color: 'primary.main' }}
                >
                  Email
                </Button>
              )}
              {data.contact.phone && (
                <Button
                  variant="outlined"
                  color="inherit"
                  startIcon={<Phone />}
                  href={`tel:${data.contact.phone}`}
                  sx={{ borderColor: 'white', color: 'white' }}
                >
                  Call
                </Button>
              )}
            </Stack>
          </Box>
        </Container>
      </HeroSection>

      <Container maxWidth="lg" sx={{ pb: 8 }}>
        {/* Statistics Overview */}
        <Grid container spacing={3} sx={{ mb: 6 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={<Home fontSize="large" />}
              value={data.statistics.totalSales}
              label="Properties Sold"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={<AttachMoney fontSize="large" />}
              value={data.statistics.totalVolume}
              prefix="$"
              label="Total Sales Volume"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={<CalendarToday fontSize="large" />}
              value={data.statistics.avgDaysOnMarket}
              label="Avg Days on Market"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={<TrendingUp fontSize="large" />}
              value={data.statistics.avgSaleToListRatio}
              label="Sale to List %"
              prefix=""
            />
          </Grid>
        </Grid>

        <Grid container spacing={4}>
          {/* Left Column */}
          <Grid item xs={12} md={8}>
            {/* About Section */}
            {data.bio && (
              <Card sx={{ mb: 4 }}>
                <CardContent>
                  <Typography variant="h5" gutterBottom fontWeight="bold">
                    About
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {data.bio}
                  </Typography>
                </CardContent>
              </Card>
            )}

            {/* Recent Sales */}
            {data.recentSales?.length > 0 && (
              <Card sx={{ mb: 4 }}>
                <CardContent>
                  <Typography variant="h5" gutterBottom fontWeight="bold">
                    Recent Transactions
                  </Typography>
                  <List>
                    {data.recentSales.map((sale, index) => (
                      <React.Fragment key={index}>
                        <ListItem alignItems="flex-start">
                          <ListItemIcon>
                            <Home color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary={sale.property_address}
                            secondary={
                              <>
                                {sale.city} • {new Date(sale.closing_date).toLocaleDateString()} • 
                                {sale.transaction_type === 'sale' ? ' Seller Representation' : ' Buyer Representation'}
                              </>
                            }
                          />
                        </ListItem>
                        {index < data.recentSales.length - 1 && <Divider variant="inset" component="li" />}
                      </React.Fragment>
                    ))}
                  </List>
                </CardContent>
              </Card>
            )}

            {/* Testimonials */}
            {data.testimonials?.length > 0 && (
              <Card>
                <CardContent>
                  <Typography variant="h5" gutterBottom fontWeight="bold">
                    Client Testimonials
                  </Typography>
                  <Stack spacing={3}>
                    {data.testimonials.map((testimonial, index) => (
                      <Paper key={index} sx={{ p: 3, bgcolor: 'grey.50' }}>
                        <Rating value={testimonial.rating} readOnly sx={{ mb: 2 }} />
                        <Typography variant="body1" paragraph fontStyle="italic">
                          "{testimonial.testimonial_text}"
                        </Typography>
                        <Typography variant="subtitle2" color="text.secondary">
                          — {testimonial.client_name}, {testimonial.client_type}
                          {testimonial.transaction_date && 
                            ` (${new Date(testimonial.transaction_date).getFullYear()})`
                          }
                        </Typography>
                      </Paper>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            )}
          </Grid>

          {/* Right Column */}
          <Grid item xs={12} md={4}>
            {/* Professional Info */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Professional Information
                </Typography>
                
                {data.professional.yearsExperience && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Experience
                    </Typography>
                    <Typography variant="body1">
                      {data.professional.yearsExperience} years
                    </Typography>
                  </Box>
                )}

                {data.professional.specialties?.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Specialties
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {data.professional.specialties.map((specialty, i) => (
                        <Chip key={i} label={specialty} size="small" />
                      ))}
                    </Box>
                  </Box>
                )}

                {data.professional.serviceAreas?.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Service Areas
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {data.professional.serviceAreas.map((area, i) => (
                        <Chip 
                          key={i} 
                          label={area} 
                          size="small" 
                          icon={<LocationOn />}
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Box>
                )}

                {data.professional.languages?.length > 0 && (
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Languages
                    </Typography>
                    <Typography variant="body1">
                      {data.professional.languages.join(', ')}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Achievements & Awards */}
            {(data.achievements?.length > 0 || data.awards?.length > 0) && (
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    Achievements & Awards
                  </Typography>
                  <List dense>
                    {data.achievements?.map((achievement, i) => (
                      <ListItem key={`achievement-${i}`}>
                        <ListItemIcon>
                          <EmojiEvents color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={achievement.title}
                          secondary={`${achievement.issuer} • ${achievement.year}`}
                        />
                      </ListItem>
                    ))}
                    {data.awards?.map((award, i) => (
                      <ListItem key={`award-${i}`}>
                        <ListItemIcon>
                          <EmojiEvents color="secondary" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={award.title}
                          secondary={award.year}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            )}

            {/* Social Links */}
            {Object.values(data.social || {}).some(v => v) && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    Connect
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {data.social.website && (
                      <IconButton href={data.social.website} target="_blank">
                        <Language />
                      </IconButton>
                    )}
                    {data.social.linkedin && (
                      <IconButton href={data.social.linkedin} target="_blank">
                        <LinkedIn />
                      </IconButton>
                    )}
                    {data.social.facebook && (
                      <IconButton href={data.social.facebook} target="_blank">
                        <Facebook />
                      </IconButton>
                    )}
                    {data.social.instagram && (
                      <IconButton href={data.social.instagram} target="_blank">
                        <Instagram />
                      </IconButton>
                    )}
                    {data.social.twitter && (
                      <IconButton href={data.social.twitter} target="_blank">
                        <Twitter />
                      </IconButton>
                    )}
                    {data.social.youtube && (
                      <IconButton href={data.social.youtube} target="_blank">
                        <YouTube />
                      </IconButton>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default PublicProfile;