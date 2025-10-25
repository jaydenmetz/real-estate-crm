import React, { useState } from 'react';
import * as Sentry from '@sentry/react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Tabs,
  Tab,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Divider,
  Avatar,
  IconButton,
  Stack,
  Chip,
  Alert,
  Snackbar,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  useTheme,
  alpha,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Person,
  Public,
  Notifications,
  Security,
  Palette,
  PhotoCamera,
  Save,
  Preview,
  Edit,
  Add,
  Delete,
  LinkedIn,
  Facebook,
  Instagram,
  Twitter,
  YouTube,
  Language,
  EmojiEvents,
  TrendingUp,
  LocationOn,
  School,
  WorkspacePremium,
  Key,
  ContentCopy,
  Visibility,
  VisibilityOff,
  Shield,
  BusinessCenter
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api, apiKeysAPI } from '../services/api.service';
import { useAuth } from '../contexts/AuthContext';
import SecurityDashboard from '../components/settings/SecurityDashboard';
import OnboardingSettings from '../components/settings/OnboardingSettings';

// Tab panel component
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const Settings = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [previewMode, setPreviewMode] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Handle hash navigation
  React.useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash === 'profile') {
      setActiveTab(0);
    }
  }, []);

  // Fetch profile data
  const { data: profileData, isLoading } = useQuery(
    'myProfile',
    () => api.profilesAPI.getMe(),
    {
      onSuccess: (data) => {
        if (data?.data) {
          setFormData({
            // Profile fields
            displayName: data.data.display_name || '',
            professionalTitle: data.data.professional_title || '',
            bio: data.data.bio || '',
            licenseNumber: data.data.license_number || '',
            yearsExperience: data.data.years_experience || 0,
            specialties: data.data.specialties || [],
            serviceAreas: data.data.service_areas || [],
            languages: data.data.languages || ['English'],
            // Social links
            websiteUrl: data.data.website_url || '',
            linkedinUrl: data.data.linkedin_url || '',
            facebookUrl: data.data.facebook_url || '',
            instagramUrl: data.data.instagram_url || '',
            twitterUrl: data.data.twitter_url || '',
            youtubeUrl: data.data.youtube_url || '',
            // Privacy
            showEmail: data.data.show_email || true,
            showPhone: data.data.show_phone || true,
            showOffice: data.data.show_office || true,
            // Settings
            theme: data.data.theme || 'light',
            emailNotifications: data.data.email_notifications || {},
            smsNotifications: data.data.sms_notifications || {},
            // Transaction Defaults
            transactionDefaults: data.data.transaction_defaults || {
              brokerName: 'Josh Riley',
              brokerLicense: '01365477',
              brokerPhone: '',
              brokerEmail: 'josh@bhhsassociated.com',
              brokerageName: 'Associated Real Estate (Berkshire Hathaway HomeServices)',
              brokerageLicense: '01910265',
              brokerageAddress: '122 S Green St Ste 5, Tehachapi, CA 93561',
              brokeragePhone: '',
              transactionCoordinator: '',
              tcPhone: '',
              tcEmail: '',
              assistant: '',
              assistantPhone: '',
              assistantEmail: '',
              preferredEscrowCompany: '',
              preferredTitleCompany: '',
              preferredInspector: '',
              preferredAppraiser: '',
              preferredLender: ''
            }
          });
        }
      }
    }
  );

  // Fetch statistics
  const { data: statsData } = useQuery(
    'myStatistics',
    () => api.profilesAPI.getStatistics(user?.username, 'all')
  );

  // Form state
  const [formData, setFormData] = useState({
    displayName: '',
    professionalTitle: '',
    bio: '',
    licenseNumber: '',
    yearsExperience: 0,
    specialties: [],
    serviceAreas: [],
    languages: ['English'],
    websiteUrl: '',
    linkedinUrl: '',
    facebookUrl: '',
    instagramUrl: '',
    twitterUrl: '',
    youtubeUrl: '',
    showEmail: true,
    showPhone: true,
    showOffice: true,
    theme: 'light',
    emailNotifications: {},
    smsNotifications: {},
    // Transaction Defaults
    transactionDefaults: {
      brokerName: 'Josh Riley',
      brokerLicense: '01365477',
      brokerPhone: '',
      brokerEmail: 'josh@bhhsassociated.com',
      brokerageName: 'Associated Real Estate (Berkshire Hathaway HomeServices)',
      brokerageLicense: '01910265',
      brokerageAddress: '122 S Green St Ste 5, Tehachapi, CA 93561',
      brokeragePhone: '',
      transactionCoordinator: '',
      tcPhone: '',
      tcEmail: '',
      assistant: '',
      assistantPhone: '',
      assistantEmail: '',
      preferredEscrowCompany: '',
      preferredTitleCompany: '',
      preferredInspector: '',
      preferredAppraiser: '',
      preferredLender: ''
    }
  });

  // Custom statistics state
  const [customStats, setCustomStats] = useState([
    { label: 'Client Satisfaction Rate', value: '98%', icon: 'star' },
    { label: 'Average Response Time', value: '< 1 hour', icon: 'speed' },
    { label: 'Repeat Clients', value: '65%', icon: 'people' }
  ]);

  // API Keys state
  const [apiKeys, setApiKeys] = useState([]);
  const [showFullKey, setShowFullKey] = useState({});
  const [newKeyDialog, setNewKeyDialog] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyExpiry, setNewKeyExpiry] = useState(365);
  const [createdKey, setCreatedKey] = useState(null);
  const [copySuccess, setCopySuccess] = useState({});

  // Fetch API Keys - Direct fetch to bypass global error handlers
  const fetchApiKeys = async () => {
    try {
      // Use the API service which has correct URL and auth handling
      const response = await apiKeysAPI.getAll();
      // // console.log('API Keys fetched successfully:', response);
      return response;
    } catch (error) {
      console.error('Failed to fetch API keys:', error);

      // Handle specific error cases
      if (error.status === 404) {
        console.error('API Keys endpoint not found');
        if (activeTab === 8) {
          setSnackbar({ open: true, message: 'API Keys feature not available', severity: 'warning' });
        }
      } else if (error.status === 401) {
        console.error('Authentication required for API keys');
        // Don't show error if user is not on API keys tab
        if (activeTab === 8) {
          setSnackbar({ open: true, message: 'Please log in to manage API keys', severity: 'info' });
        }
      } else if (activeTab === 8) {
        // Only show generic error if user is on API keys tab
        setSnackbar({ open: true, message: 'Failed to load API keys', severity: 'error' });
      }

      setApiKeys([]);
      return { data: [] };
    }
  };

  const { data: apiKeysData, refetch: refetchApiKeys, isLoading: apiKeysLoading } = useQuery(
    'myApiKeys',
    fetchApiKeys,
    {
      onSuccess: (response) => {
        if (response?.data) {
          setApiKeys(response.data);
        }
      },
      onError: (error) => {
        // Silent fail - don't log out
        setApiKeys([]);
      },
      retry: false,
      enabled: activeTab === 8,
      staleTime: 60000,
      gcTime: 300000 // Renamed from cacheTime in v5
    }
  );

  // Update profile mutation (v5 object syntax)
  const updateProfileMutation = useMutation({
    mutationFn: (data) => api.profilesAPI.updateMe({ profile: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myProfile'] });
      setSnackbar({ open: true, message: 'Profile updated successfully!', severity: 'success' });
    },
    onError: () => {
      setSnackbar({ open: true, message: 'Failed to update profile', severity: 'error' });
    }
  });

  // Update settings mutation (v5 object syntax)
  const updateSettingsMutation = useMutation({
    mutationFn: (data) => api.settingsAPI.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mySettings'] });
      setSnackbar({ open: true, message: 'Settings updated successfully!', severity: 'success' });
    }
  });

  const handleChange = (field) => (event) => {
    setFormData({ ...formData, [field]: event.target.value });
  };

  const handleSwitchChange = (field) => (event) => {
    setFormData({ ...formData, [field]: event.target.checked });
  };

  const handleArrayChange = (field) => (event, newValue) => {
    setFormData({ ...formData, [field]: newValue });
  };

  const handleSaveProfile = () => {
    updateProfileMutation.mutate({
      display_name: formData.displayName,
      professional_title: formData.professionalTitle,
      bio: formData.bio,
      license_number: formData.licenseNumber,
      years_experience: formData.yearsExperience,
      specialties: formData.specialties,
      service_areas: formData.serviceAreas,
      languages: formData.languages,
      website_url: formData.websiteUrl,
      linkedin_url: formData.linkedinUrl,
      facebook_url: formData.facebookUrl,
      instagram_url: formData.instagramUrl,
      twitter_url: formData.twitterUrl,
      youtube_url: formData.youtubeUrl,
      show_email: formData.showEmail,
      show_phone: formData.showPhone,
      show_office: formData.showOffice
    });
  };

  const handleSaveSettings = () => {
    updateSettingsMutation.mutate({
      theme: formData.theme,
      emailNotifications: formData.emailNotifications,
      smsNotifications: formData.smsNotifications
    });
  };

  const handleAddCustomStat = () => {
    setCustomStats([...customStats, { label: '', value: '', icon: 'star' }]);
  };

  const handleUpdateCustomStat = (index, field, value) => {
    const newStats = [...customStats];
    newStats[index][field] = value;
    setCustomStats(newStats);
  };

  const handleDeleteCustomStat = (index) => {
    setCustomStats(customStats.filter((_, i) => i !== index));
  };

  const specialtyOptions = [
    'Luxury Homes',
    'Waterfront Properties',
    'Investment Properties',
    'First-Time Buyers',
    'Condominiums',
    'New Construction',
    'Historic Homes',
    'Vacation Homes',
    'Relocation',
    'Senior Living',
    'Commercial Real Estate',
    'Land Sales'
  ];

  const serviceAreaOptions = [
    'La Jolla',
    'Del Mar',
    'Carmel Valley',
    'Rancho Santa Fe',
    'Coronado',
    'Point Loma',
    'Mission Hills',
    'North Park',
    'Pacific Beach',
    'Ocean Beach',
    'Downtown San Diego',
    'Carlsbad'
  ];

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Loading settings...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header with Preview Toggle */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight="bold">
          Settings
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant={previewMode ? "contained" : "outlined"}
            startIcon={<Preview />}
            onClick={() => setPreviewMode(!previewMode)}
          >
            {previewMode ? 'Edit Mode' : 'Preview Mode'}
          </Button>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<Public />}
            onClick={() => {
              if (user?.username) {
                window.open(`/profile/${user.username}`, '_blank');
              } else {
                setSnackbar({ 
                  open: true, 
                  message: 'Username not found. Please refresh the page or re-login.', 
                  severity: 'warning' 
                });
              }
            }}
          >
            View Public Profile
          </Button>
        </Stack>
      </Box>

      {/* Preview Mode */}
      {previewMode ? (
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Profile Preview
          </Typography>
          <Divider sx={{ mb: 3 }} />
          {user?.username ? (
            <iframe
              src={`/profile/${user.username}`}
              style={{
                width: '100%',
                height: '800px',
                border: '1px solid #ddd',
                borderRadius: '8px'
              }}
              title="Profile Preview"
            />
          ) : (
            <Alert severity="warning">
              Username not found. Please refresh the page or re-login.
            </Alert>
          )}
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {/* Sidebar */}
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                <Avatar
                  sx={{
                    width: 100,
                    height: 100,
                    mb: 2,
                    bgcolor: 'primary.main',
                    fontSize: '2.5rem'
                  }}
                >
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </Avatar>
                <IconButton color="primary" component="label">
                  <PhotoCamera />
                  <input type="file" hidden accept="image/*" />
                </IconButton>
                <Typography variant="h6">{user?.firstName} {user?.lastName}</Typography>
                <Typography variant="body2" color="text.secondary">
                  @{user?.username}
                </Typography>
              </Box>

              <Tabs
                orientation="vertical"
                value={activeTab}
                onChange={(e, v) => setActiveTab(v)}
                sx={{ borderRight: 1, borderColor: 'divider' }}
              >
                <Tab icon={<Person />} label="Profile" />
                <Tab icon={<Public />} label="Public Info" />
                <Tab icon={<TrendingUp />} label="Statistics" />
                <Tab icon={<Notifications />} label="Notifications" />
                <Tab icon={<Palette />} label="Appearance" />
                <Tab icon={<Security />} label="Privacy" />
                <Tab icon={<BusinessCenter />} label="Transaction Defaults" />
                <Tab icon={<Shield />} label="Security" />
                <Tab icon={<Key />} label="API Keys" />
                <Tab icon={<School />} label="Onboarding" />
                <Tab icon={<WorkspacePremium />} label="Developer" />
              </Tabs>
            </Paper>
          </Grid>

          {/* Main Content */}
          <Grid item xs={12} md={9}>
            <Paper sx={{ p: 3 }}>
              {/* Profile Tab */}
              <TabPanel value={activeTab} index={0}>
                <Typography variant="h5" gutterBottom>
                  Basic Information
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Display Name"
                      value={formData.displayName}
                      onChange={handleChange('displayName')}
                      helperText="How your name appears on your public profile"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Professional Title"
                      value={formData.professionalTitle}
                      onChange={handleChange('professionalTitle')}
                      placeholder="e.g., Luxury Real Estate Specialist"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      label="Bio"
                      value={formData.bio}
                      onChange={handleChange('bio')}
                      helperText="Tell potential clients about yourself"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="License Number"
                      value={formData.licenseNumber}
                      onChange={handleChange('licenseNumber')}
                      placeholder="DRE# 01234567"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Years of Experience"
                      value={formData.yearsExperience}
                      onChange={handleChange('yearsExperience')}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      startIcon={<Save />}
                      onClick={handleSaveProfile}
                      disabled={updateProfileMutation.isLoading}
                    >
                      Save Profile
                    </Button>
                  </Grid>
                </Grid>
              </TabPanel>

              {/* Public Info Tab */}
              <TabPanel value={activeTab} index={1}>
                <Typography variant="h5" gutterBottom>
                  Professional Information
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Autocomplete
                      multiple
                      options={specialtyOptions}
                      value={formData.specialties}
                      onChange={handleArrayChange('specialties')}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Specialties"
                          placeholder="Add your areas of expertise"
                        />
                      )}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                          <Chip
                            variant="outlined"
                            label={option}
                            {...getTagProps({ index })}
                          />
                        ))
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Autocomplete
                      multiple
                      options={serviceAreaOptions}
                      value={formData.serviceAreas}
                      onChange={handleArrayChange('serviceAreas')}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Service Areas"
                          placeholder="Add neighborhoods you serve"
                        />
                      )}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                          <Chip
                            icon={<LocationOn />}
                            variant="outlined"
                            label={option}
                            {...getTagProps({ index })}
                          />
                        ))
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Social Media Links
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Website"
                      value={formData.websiteUrl}
                      onChange={handleChange('websiteUrl')}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Language />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="LinkedIn"
                      value={formData.linkedinUrl}
                      onChange={handleChange('linkedinUrl')}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LinkedIn />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Facebook"
                      value={formData.facebookUrl}
                      onChange={handleChange('facebookUrl')}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Facebook />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Instagram"
                      value={formData.instagramUrl}
                      onChange={handleChange('instagramUrl')}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Instagram />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      startIcon={<Save />}
                      onClick={handleSaveProfile}
                      disabled={updateProfileMutation.isLoading}
                    >
                      Save Public Information
                    </Button>
                  </Grid>
                </Grid>
              </TabPanel>

              {/* Statistics Tab */}
              <TabPanel value={activeTab} index={2}>
                <Typography variant="h5" gutterBottom>
                  Profile Statistics
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                {/* Current Statistics */}
                <Typography variant="h6" gutterBottom>
                  Current Performance
                </Typography>
                <Grid container spacing={2} sx={{ mb: 4 }}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card>
                      <CardContent>
                        <Typography color="text.secondary" gutterBottom>
                          Total Sales
                        </Typography>
                        <Typography variant="h4">
                          {statsData?.data?.statistics?.total_sales || 0}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card>
                      <CardContent>
                        <Typography color="text.secondary" gutterBottom>
                          Sales Volume
                        </Typography>
                        <Typography variant="h4">
                          ${((statsData?.data?.statistics?.sales_volume || 0) / 1000000).toFixed(1)}M
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card>
                      <CardContent>
                        <Typography color="text.secondary" gutterBottom>
                          Avg Days on Market
                        </Typography>
                        <Typography variant="h4">
                          {statsData?.data?.statistics?.avg_escrow_days || 0}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card>
                      <CardContent>
                        <Typography color="text.secondary" gutterBottom>
                          Cities Served
                        </Typography>
                        <Typography variant="h4">
                          {statsData?.data?.statistics?.cities_served || 0}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                {/* Custom Statistics */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Custom Statistics to Highlight
                  </Typography>
                  <Button
                    startIcon={<Add />}
                    onClick={handleAddCustomStat}
                  >
                    Add Statistic
                  </Button>
                </Box>
                <List>
                  {customStats.map((stat, index) => (
                    <ListItem key={index} sx={{ px: 0 }}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={5}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Label"
                            value={stat.label}
                            onChange={(e) => handleUpdateCustomStat(index, 'label', e.target.value)}
                            placeholder="e.g., Client Satisfaction Rate"
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Value"
                            value={stat.value}
                            onChange={(e) => handleUpdateCustomStat(index, 'value', e.target.value)}
                            placeholder="e.g., 98%"
                          />
                        </Grid>
                        <Grid item xs={12} sm={2}>
                          <FormControl fullWidth size="small">
                            <InputLabel>Icon</InputLabel>
                            <Select
                              value={stat.icon}
                              onChange={(e) => handleUpdateCustomStat(index, 'icon', e.target.value)}
                              label="Icon"
                            >
                              <MenuItem value="star">Star</MenuItem>
                              <MenuItem value="speed">Speed</MenuItem>
                              <MenuItem value="people">People</MenuItem>
                              <MenuItem value="trending">Trending</MenuItem>
                              <MenuItem value="award">Award</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={1}>
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteCustomStat(index)}
                          >
                            <Delete />
                          </IconButton>
                        </Grid>
                      </Grid>
                    </ListItem>
                  ))}
                </List>
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={handleSaveProfile}
                  sx={{ mt: 2 }}
                >
                  Save Statistics
                </Button>
              </TabPanel>

              {/* Notifications Tab */}
              <TabPanel value={activeTab} index={3}>
                <Typography variant="h5" gutterBottom>
                  Notification Preferences
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <Typography variant="h6" gutterBottom>
                  Email Notifications
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText
                      primary="New Lead"
                      secondary="Get notified when you receive a new lead"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={formData.emailNotifications.new_lead || false}
                        onChange={(e) => setFormData({
                          ...formData,
                          emailNotifications: {
                            ...formData.emailNotifications,
                            new_lead: e.target.checked
                          }
                        })}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Appointment Reminders"
                      secondary="Receive reminders for upcoming appointments"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={formData.emailNotifications.appointment_reminder || false}
                        onChange={(e) => setFormData({
                          ...formData,
                          emailNotifications: {
                            ...formData.emailNotifications,
                            appointment_reminder: e.target.checked
                          }
                        })}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={handleSaveSettings}
                  sx={{ mt: 2 }}
                >
                  Save Notification Settings
                </Button>
              </TabPanel>

              {/* Appearance Tab */}
              <TabPanel value={activeTab} index={4}>
                <Typography variant="h5" gutterBottom>
                  Appearance Settings
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <FormControl component="fieldset">
                  <Typography variant="h6" gutterBottom>
                    Theme
                  </Typography>
                  <Stack direction="row" spacing={2}>
                    <Button
                      variant={formData.theme === 'light' ? 'contained' : 'outlined'}
                      onClick={() => setFormData({ ...formData, theme: 'light' })}
                    >
                      Light
                    </Button>
                    <Button
                      variant={formData.theme === 'dark' ? 'contained' : 'outlined'}
                      onClick={() => setFormData({ ...formData, theme: 'dark' })}
                    >
                      Dark
                    </Button>
                    <Button
                      variant={formData.theme === 'auto' ? 'contained' : 'outlined'}
                      onClick={() => setFormData({ ...formData, theme: 'auto' })}
                    >
                      Auto
                    </Button>
                  </Stack>
                </FormControl>
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={handleSaveSettings}
                  sx={{ mt: 3 }}
                >
                  Save Appearance Settings
                </Button>
              </TabPanel>

              {/* Privacy Tab */}
              <TabPanel value={activeTab} index={5}>
                <Typography variant="h5" gutterBottom>
                  Privacy Settings
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <Typography variant="h6" gutterBottom>
                  Profile Visibility
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText
                      primary="Show Email"
                      secondary="Display your email on your public profile"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={formData.showEmail}
                        onChange={handleSwitchChange('showEmail')}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Show Phone"
                      secondary="Display your phone number on your public profile"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={formData.showPhone}
                        onChange={handleSwitchChange('showPhone')}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Show Office"
                      secondary="Display your office information on your public profile"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={formData.showOffice}
                        onChange={handleSwitchChange('showOffice')}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" gutterBottom>
                  Security & Audit Logs
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  View authentication and security-related events for your account
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<Security />}
                  onClick={() => navigate('/security-events')}
                  sx={{ mb: 2 }}
                >
                  View Security Events
                </Button>

                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={handleSaveProfile}
                  sx={{ mt: 2, display: 'block' }}
                >
                  Save Privacy Settings
                </Button>
              </TabPanel>

              {/* Transaction Defaults Tab */}
              <TabPanel value={activeTab} index={6}>
                <Typography variant="h5" gutterBottom>
                  Transaction Defaults
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Set your default contacts and vendors that will auto-fill when creating new escrows. These can be edited for each individual transaction.
                </Typography>

                {/* Broker Information */}
                <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                  Broker Information
                </Typography>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Broker Name"
                      value={formData.transactionDefaults.brokerName}
                      onChange={(e) => setFormData({
                        ...formData,
                        transactionDefaults: {
                          ...formData.transactionDefaults,
                          brokerName: e.target.value
                        }
                      })}
                      placeholder="e.g., Josh Riley"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Broker License Number"
                      value={formData.transactionDefaults.brokerLicense}
                      onChange={(e) => setFormData({
                        ...formData,
                        transactionDefaults: {
                          ...formData.transactionDefaults,
                          brokerLicense: e.target.value
                        }
                      })}
                      placeholder="e.g., 01365477"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Broker Phone"
                      value={formData.transactionDefaults.brokerPhone}
                      onChange={(e) => setFormData({
                        ...formData,
                        transactionDefaults: {
                          ...formData.transactionDefaults,
                          brokerPhone: e.target.value
                        }
                      })}
                      placeholder="e.g., (555) 123-4567"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Broker Email"
                      value={formData.transactionDefaults.brokerEmail}
                      onChange={(e) => setFormData({
                        ...formData,
                        transactionDefaults: {
                          ...formData.transactionDefaults,
                          brokerEmail: e.target.value
                        }
                      })}
                      placeholder="e.g., broker@example.com"
                    />
                  </Grid>
                </Grid>

                {/* Brokerage Information */}
                <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                  Brokerage Information
                </Typography>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Brokerage Name"
                      value={formData.transactionDefaults.brokerageName}
                      onChange={(e) => setFormData({
                        ...formData,
                        transactionDefaults: {
                          ...formData.transactionDefaults,
                          brokerageName: e.target.value
                        }
                      })}
                      placeholder="e.g., Associated Real Estate (Berkshire Hathaway HomeServices)"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Brokerage License"
                      value={formData.transactionDefaults.brokerageLicense}
                      onChange={(e) => setFormData({
                        ...formData,
                        transactionDefaults: {
                          ...formData.transactionDefaults,
                          brokerageLicense: e.target.value
                        }
                      })}
                      placeholder="e.g., 01910265"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Brokerage Phone"
                      value={formData.transactionDefaults.brokeragePhone}
                      onChange={(e) => setFormData({
                        ...formData,
                        transactionDefaults: {
                          ...formData.transactionDefaults,
                          brokeragePhone: e.target.value
                        }
                      })}
                      placeholder="e.g., (555) 123-4567"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Brokerage Address"
                      value={formData.transactionDefaults.brokerageAddress}
                      onChange={(e) => setFormData({
                        ...formData,
                        transactionDefaults: {
                          ...formData.transactionDefaults,
                          brokerageAddress: e.target.value
                        }
                      })}
                      placeholder="e.g., 122 S Green St Ste 5, Tehachapi, CA 93561"
                    />
                  </Grid>
                </Grid>

                {/* Transaction Coordinator */}
                <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                  Transaction Coordinator
                </Typography>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="TC Name"
                      value={formData.transactionDefaults.transactionCoordinator}
                      onChange={(e) => setFormData({
                        ...formData,
                        transactionDefaults: {
                          ...formData.transactionDefaults,
                          transactionCoordinator: e.target.value
                        }
                      })}
                      placeholder="e.g., Jane Smith"
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="TC Phone"
                      value={formData.transactionDefaults.tcPhone}
                      onChange={(e) => setFormData({
                        ...formData,
                        transactionDefaults: {
                          ...formData.transactionDefaults,
                          tcPhone: e.target.value
                        }
                      })}
                      placeholder="e.g., (555) 123-4567"
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="TC Email"
                      value={formData.transactionDefaults.tcEmail}
                      onChange={(e) => setFormData({
                        ...formData,
                        transactionDefaults: {
                          ...formData.transactionDefaults,
                          tcEmail: e.target.value
                        }
                      })}
                      placeholder="e.g., tc@example.com"
                    />
                  </Grid>
                </Grid>

                {/* Assistant */}
                <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                  Assistant
                </Typography>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Assistant Name"
                      value={formData.transactionDefaults.assistant}
                      onChange={(e) => setFormData({
                        ...formData,
                        transactionDefaults: {
                          ...formData.transactionDefaults,
                          assistant: e.target.value
                        }
                      })}
                      placeholder="e.g., John Doe"
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Assistant Phone"
                      value={formData.transactionDefaults.assistantPhone}
                      onChange={(e) => setFormData({
                        ...formData,
                        transactionDefaults: {
                          ...formData.transactionDefaults,
                          assistantPhone: e.target.value
                        }
                      })}
                      placeholder="e.g., (555) 123-4567"
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Assistant Email"
                      value={formData.transactionDefaults.assistantEmail}
                      onChange={(e) => setFormData({
                        ...formData,
                        transactionDefaults: {
                          ...formData.transactionDefaults,
                          assistantEmail: e.target.value
                        }
                      })}
                      placeholder="e.g., assistant@example.com"
                    />
                  </Grid>
                </Grid>

                {/* Preferred Vendors */}
                <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                  Preferred Vendors
                </Typography>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Preferred Escrow Company"
                      value={formData.transactionDefaults.preferredEscrowCompany}
                      onChange={(e) => setFormData({
                        ...formData,
                        transactionDefaults: {
                          ...formData.transactionDefaults,
                          preferredEscrowCompany: e.target.value
                        }
                      })}
                      placeholder="e.g., First American Title"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Preferred Title Company"
                      value={formData.transactionDefaults.preferredTitleCompany}
                      onChange={(e) => setFormData({
                        ...formData,
                        transactionDefaults: {
                          ...formData.transactionDefaults,
                          preferredTitleCompany: e.target.value
                        }
                      })}
                      placeholder="e.g., Chicago Title"
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Preferred Inspector"
                      value={formData.transactionDefaults.preferredInspector}
                      onChange={(e) => setFormData({
                        ...formData,
                        transactionDefaults: {
                          ...formData.transactionDefaults,
                          preferredInspector: e.target.value
                        }
                      })}
                      placeholder="e.g., ABC Inspections"
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Preferred Appraiser"
                      value={formData.transactionDefaults.preferredAppraiser}
                      onChange={(e) => setFormData({
                        ...formData,
                        transactionDefaults: {
                          ...formData.transactionDefaults,
                          preferredAppraiser: e.target.value
                        }
                      })}
                      placeholder="e.g., XYZ Appraisal"
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Preferred Lender"
                      value={formData.transactionDefaults.preferredLender}
                      onChange={(e) => setFormData({
                        ...formData,
                        transactionDefaults: {
                          ...formData.transactionDefaults,
                          preferredLender: e.target.value
                        }
                      })}
                      placeholder="e.g., ABC Mortgage"
                    />
                  </Grid>
                </Grid>

                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={handleSaveProfile}
                  sx={{ mt: 2 }}
                >
                  Save Transaction Defaults
                </Button>
              </TabPanel>

              {/* Security Tab */}
              <TabPanel value={activeTab} index={7}>
                <SecurityDashboard />
              </TabPanel>

              {/* API Keys Tab */}
              <TabPanel value={activeTab} index={8}>
                <Typography variant="h5" gutterBottom>
                  API Key Management
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <Alert severity="info" sx={{ mb: 3 }}>
                  API keys allow you to access the CRM API programmatically. Keep your keys secure and never share them publicly.
                </Alert>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                  <Typography variant="h6">
                    Your API Keys
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setNewKeyDialog(true)}
                  >
                    Create New Key
                  </Button>
                </Box>

                {apiKeys.length === 0 ? (
                  <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Key sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      No API Keys Yet
                    </Typography>
                    <Typography color="text.secondary" paragraph>
                      Create your first API key to start using the CRM API
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<Add />}
                      onClick={() => setNewKeyDialog(true)}
                    >
                      Create Your First Key
                    </Button>
                  </Paper>
                ) : (
                  <List>
                    {apiKeys.map((apiKey) => (
                      <ListItem key={apiKey.id} sx={{ bgcolor: 'background.paper', mb: 1, borderRadius: 1, border: 1, borderColor: 'divider' }}>
                        <ListItemIcon>
                          <Key color={apiKey.is_active ? 'primary' : 'disabled'} />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="subtitle1" fontWeight="bold">
                                {apiKey.name || 'Unnamed Key'}
                              </Typography>
                              {!apiKey.is_active && (
                                <Chip label="Revoked" size="small" color="error" />
                              )}
                              {apiKey.expires_at && new Date(apiKey.expires_at) < new Date() && (
                                <Chip label="Expired" size="small" color="warning" />
                              )}
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                                <Typography
                                  component="code"
                                  sx={{
                                    fontFamily: 'monospace',
                                    bgcolor: 'grey.100',
                                    p: 0.5,
                                    borderRadius: 1,
                                    fontSize: '0.875rem'
                                  }}
                                >
                                  {showFullKey[apiKey.id]
                                    ? apiKey.key || apiKey.key_prefix
                                    : apiKey.key_prefix}
                                </Typography>
                                <IconButton
                                  size="small"
                                  onClick={() => setShowFullKey({ ...showFullKey, [apiKey.id]: !showFullKey[apiKey.id] })}
                                >
                                  {showFullKey[apiKey.id] ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    const keyToCopy = apiKey.key || apiKey.key_prefix;
                                    navigator.clipboard.writeText(keyToCopy);
                                    setCopySuccess({ ...copySuccess, [apiKey.id]: true });
                                    setTimeout(() => {
                                      setCopySuccess({ ...copySuccess, [apiKey.id]: false });
                                    }, 2000);
                                  }}
                                >
                                  <ContentCopy color={copySuccess[apiKey.id] ? 'success' : 'inherit'} />
                                </IconButton>
                              </Box>
                              <Typography variant="caption" color="text.secondary">
                                Created: {new Date(apiKey.created_at).toLocaleDateString()} •
                                {apiKey.expires_at ? `Expires: ${new Date(apiKey.expires_at).toLocaleDateString()}` : 'No expiration'} •
                                Last used: {apiKey.last_used_at ? new Date(apiKey.last_used_at).toLocaleDateString() : 'Never'}
                              </Typography>
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            color="error"
                            onClick={async () => {
                              if (window.confirm(`Are you sure you want to revoke the key "${apiKey.name}"?`)) {
                                try {
                                  await apiKeysAPI.revoke(apiKey.id);
                                  refetchApiKeys();
                                  setSnackbar({ open: true, message: 'API key revoked successfully', severity: 'success' });
                                } catch (error) {
                                  console.error('Failed to revoke API key:', error);
                                  setSnackbar({ open: true, message: 'Failed to revoke API key', severity: 'error' });
                                }
                              }
                            }}
                            disabled={!apiKey.is_active}
                          >
                            <Delete />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                )}

                {/* Create New Key Dialog */}
                <Dialog open={newKeyDialog} onClose={() => setNewKeyDialog(false)} maxWidth="sm" fullWidth>
                  <DialogTitle>Create New API Key</DialogTitle>
                  <DialogContent>
                    <TextField
                      fullWidth
                      label="Key Name"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      placeholder="e.g., Production API Key"
                      margin="normal"
                      helperText="Give your key a descriptive name to remember its purpose"
                    />
                    <TextField
                      fullWidth
                      type="number"
                      label="Expiry (days)"
                      value={newKeyExpiry}
                      onChange={(e) => setNewKeyExpiry(parseInt(e.target.value))}
                      margin="normal"
                      helperText="Number of days until this key expires (0 for no expiration)"
                    />
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={() => {
                      setNewKeyDialog(false);
                      setNewKeyName('');
                      setNewKeyExpiry(365);
                    }}>
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      onClick={async () => {
                        try {
                          const response = await apiKeysAPI.create({
                            name: newKeyName,
                            expiresInDays: newKeyExpiry
                          });

                          if (response?.data?.key) {
                            setCreatedKey(response.data.key);
                            refetchApiKeys();
                            setNewKeyDialog(false);
                            setNewKeyName('');
                            setNewKeyExpiry(365);
                            setSnackbar({ open: true, message: 'API key created successfully', severity: 'success' });
                          } else {
                            setSnackbar({ open: true, message: 'API key created but no key returned', severity: 'warning' });
                          }
                        } catch (error) {
                          console.error('Error creating API key:', error);
                          const errorMessage = error?.message || 'Failed to create API key';
                          setSnackbar({ open: true, message: errorMessage, severity: 'error' });
                        }
                      }}
                      disabled={!newKeyName}
                    >
                      Create Key
                    </Button>
                  </DialogActions>
                </Dialog>

                {/* Show Created Key Dialog */}
                <Dialog open={!!createdKey} onClose={() => setCreatedKey(null)} maxWidth="md" fullWidth>
                  <DialogTitle>API Key Created Successfully</DialogTitle>
                  <DialogContent>
                    <Alert severity="warning" sx={{ mb: 2 }}>
                      Save this key now! For security reasons, you won't be able to see it again.
                    </Alert>
                    <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1, mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>Your new API key:</Typography>
                      <Typography
                        component="code"
                        sx={{
                          fontFamily: 'monospace',
                          display: 'block',
                          p: 1,
                          bgcolor: 'white',
                          border: 1,
                          borderColor: 'divider',
                          borderRadius: 1,
                          wordBreak: 'break-all'
                        }}
                      >
                        {createdKey}
                      </Typography>
                    </Box>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<ContentCopy />}
                      onClick={() => {
                        navigator.clipboard.writeText(createdKey);
                        setSnackbar({ open: true, message: 'API key copied to clipboard', severity: 'success' });
                      }}
                    >
                      Copy to Clipboard
                    </Button>
                  </DialogContent>
                  <DialogActions>
                    <Button variant="contained" onClick={() => setCreatedKey(null)}>
                      Done
                    </Button>
                  </DialogActions>
                </Dialog>
              </TabPanel>

              {/* Onboarding Tab */}
              <TabPanel value={activeTab} index={9}>
                <OnboardingSettings />
              </TabPanel>

              {/* Developer Tab */}
              <TabPanel value={activeTab} index={10}>
                <Typography variant="h5" gutterBottom>
                  Developer Tools
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <Alert severity="warning" sx={{ mb: 3 }}>
                  These tools are for testing and debugging purposes only.
                </Alert>

                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      🔍 Sentry Error Tracking Test
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Click the button below to trigger a test error that will be sent to Sentry.
                      This helps verify that error tracking is working correctly.
                    </Typography>
                    <Stack direction="row" spacing={2}>
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => {
                          throw new Error('This is your first Sentry error!');
                        }}
                        startIcon={<WorkspacePremium />}
                      >
                        Break the World (Frontend)
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={async () => {
                          try {
                            await api.request('/debug-sentry');
                            setSnackbar({
                              open: true,
                              message: 'Backend error triggered! Check Sentry dashboard.',
                              severity: 'info'
                            });
                          } catch (error) {
                            setSnackbar({
                              open: true,
                              message: 'Backend test endpoint called!',
                              severity: 'success'
                            });
                          }
                        }}
                      >
                        Test Backend Error
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      📊 System Information
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText
                          primary="Environment"
                          secondary={process.env.NODE_ENV}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="API URL"
                          secondary={process.env.REACT_APP_API_URL || 'https://api.jaydenmetz.com'}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Sentry Enabled"
                          secondary={process.env.REACT_APP_SENTRY_DSN ? 'Yes ✅' : 'No ❌'}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="User ID"
                          secondary={user?.id || 'Not logged in'}
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </TabPanel>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Settings;