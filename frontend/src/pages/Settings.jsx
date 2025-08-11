import React, { useState } from 'react';
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
  Autocomplete
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
  WorkspacePremium
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api.service';
import { useAuth } from '../contexts/AuthContext';

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
            smsNotifications: data.data.sms_notifications || {}
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
    smsNotifications: {}
  });

  // Custom statistics state
  const [customStats, setCustomStats] = useState([
    { label: 'Client Satisfaction Rate', value: '98%', icon: 'star' },
    { label: 'Average Response Time', value: '< 1 hour', icon: 'speed' },
    { label: 'Repeat Clients', value: '65%', icon: 'people' }
  ]);

  // Update profile mutation
  const updateProfileMutation = useMutation(
    (data) => api.profilesAPI.updateMe({ profile: data }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('myProfile');
        setSnackbar({ open: true, message: 'Profile updated successfully!', severity: 'success' });
      },
      onError: () => {
        setSnackbar({ open: true, message: 'Failed to update profile', severity: 'error' });
      }
    }
  );

  // Update settings mutation
  const updateSettingsMutation = useMutation(
    (data) => api.settingsAPI.update(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('mySettings');
        setSnackbar({ open: true, message: 'Settings updated successfully!', severity: 'success' });
      }
    }
  );

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
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={handleSaveProfile}
                  sx={{ mt: 2 }}
                >
                  Save Privacy Settings
                </Button>
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