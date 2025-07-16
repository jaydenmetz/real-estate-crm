import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Divider,
  Grid,
  Card,
  CardContent,
  Avatar,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Chip,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  InputAdornment,
  Tooltip,
  useTheme,
  alpha,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Person,
  Notifications,
  Security,
  Palette,
  Language,
  Email,
  Phone,
  LocationOn,
  CameraAlt,
  Save,
  Cancel,
  Check,
  Info,
  Warning,
  Visibility,
  VisibilityOff,
  Key,
  Sync,
  CloudUpload,
  Download,
  Delete,
  Edit,
  AddCircle,
  Business,
  AttachMoney,
  CalendarToday,
  SmartToy,
  Storage,
  Speed,
  BugReport,
  Code,
  Webhook,
  Api,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useSnackbar } from 'notistack';

// Styled Components
const SettingsCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  boxShadow: theme.shadows[2],
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: theme.shadows[4],
  },
}));

const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: 120,
  height: 120,
  border: `4px solid ${theme.palette.background.paper}`,
  boxShadow: theme.shadows[3],
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: theme.shadows[6],
  },
}));

const TabPanel = ({ children, value, index, ...other }) => {
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
};

const Settings = () => {
  const [tabValue, setTabValue] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();

  // Form states
  const [profile, setProfile] = useState({
    firstName: 'Jayden',
    lastName: 'Metz',
    email: 'jayden@realestate.com',
    phone: '(555) 123-4567',
    address: 'San Diego, CA',
    bio: 'Real estate professional specializing in luxury properties.',
    licenseNumber: 'DRE #01234567',
    brokerageName: 'Luxury Real Estate Group',
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    marketingEmails: false,
    theme: 'light',
    language: 'en',
    timezone: 'America/Los_Angeles',
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',
    showCommissions: true,
    autoBackup: true,
  });

  const [aiSettings, setAiSettings] = useState({
    aiAssistant: true,
    autoSuggestions: true,
    smartInsights: true,
    voiceCommands: false,
    aiResponseSpeed: 'balanced',
    dataPrivacy: 'standard',
  });

  const [integrations, setIntegrations] = useState([
    { id: 1, name: 'Zillow', status: 'connected', icon: <Business />, lastSync: '2 hours ago' },
    { id: 2, name: 'MLS', status: 'connected', icon: <Storage />, lastSync: '1 hour ago' },
    { id: 3, name: 'DocuSign', status: 'disconnected', icon: <Edit />, lastSync: 'Never' },
    { id: 4, name: 'Google Calendar', status: 'connected', icon: <CalendarToday />, lastSync: '5 minutes ago' },
  ]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSaveProfile = () => {
    setIsEditing(false);
    enqueueSnackbar('Profile updated successfully', { variant: 'success' });
  };

  const handleSavePreferences = () => {
    enqueueSnackbar('Preferences saved successfully', { variant: 'success' });
  };

  const handleSaveAISettings = () => {
    enqueueSnackbar('AI settings updated successfully', { variant: 'success' });
  };

  const handleConnectIntegration = (id) => {
    setIntegrations(integrations.map(integration =>
      integration.id === id
        ? { ...integration, status: 'connected', lastSync: 'Just now' }
        : integration
    ));
    enqueueSnackbar('Integration connected successfully', { variant: 'success' });
  };

  const handleDisconnectIntegration = (id) => {
    setIntegrations(integrations.map(integration =>
      integration.id === id
        ? { ...integration, status: 'disconnected', lastSync: 'Never' }
        : integration
    ));
    enqueueSnackbar('Integration disconnected', { variant: 'info' });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
          Settings
        </Typography>

        <Paper sx={{ borderRadius: 2 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              '& .MuiTab-root': {
                minHeight: 64,
                textTransform: 'none',
              },
            }}
          >
            <Tab icon={<Person />} label="Profile" />
            <Tab icon={<Notifications />} label="Notifications" />
            <Tab icon={<SmartToy />} label="AI Assistant" />
            <Tab icon={<Api />} label="Integrations" />
            <Tab icon={<Security />} label="Security" />
            <Tab icon={<Palette />} label="Appearance" />
          </Tabs>

          <Box sx={{ p: 3 }}>
            {/* Profile Tab */}
            <TabPanel value={tabValue} index={0}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <SettingsCard>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Box sx={{ position: 'relative', display: 'inline-block' }}>
                        <ProfileAvatar src="/api/placeholder/120/120" />
                        <IconButton
                          sx={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            bgcolor: 'primary.main',
                            color: 'white',
                            '&:hover': { bgcolor: 'primary.dark' },
                          }}
                          size="small"
                        >
                          <CameraAlt />
                        </IconButton>
                      </Box>
                      <Typography variant="h6" sx={{ mt: 2 }}>
                        {profile.firstName} {profile.lastName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {profile.email}
                      </Typography>
                      <Chip
                        label="Premium Member"
                        color="primary"
                        size="small"
                        sx={{ mt: 1 }}
                      />
                    </CardContent>
                  </SettingsCard>
                </Grid>

                <Grid item xs={12} md={8}>
                  <SettingsCard>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                        <Typography variant="h6">Personal Information</Typography>
                        {!isEditing ? (
                          <Button
                            startIcon={<Edit />}
                            onClick={() => setIsEditing(true)}
                          >
                            Edit
                          </Button>
                        ) : (
                          <Box>
                            <Button
                              startIcon={<Cancel />}
                              onClick={() => setIsEditing(false)}
                              sx={{ mr: 1 }}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="contained"
                              startIcon={<Save />}
                              onClick={handleSaveProfile}
                            >
                              Save
                            </Button>
                          </Box>
                        )}
                      </Box>

                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="First Name"
                            value={profile.firstName}
                            onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                            disabled={!isEditing}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Last Name"
                            value={profile.lastName}
                            onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                            disabled={!isEditing}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Email"
                            value={profile.email}
                            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                            disabled={!isEditing}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Email />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Phone"
                            value={profile.phone}
                            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                            disabled={!isEditing}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Phone />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Location"
                            value={profile.address}
                            onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                            disabled={!isEditing}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <LocationOn />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Bio"
                            value={profile.bio}
                            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                            disabled={!isEditing}
                            multiline
                            rows={3}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="License Number"
                            value={profile.licenseNumber}
                            onChange={(e) => setProfile({ ...profile, licenseNumber: e.target.value })}
                            disabled={!isEditing}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Brokerage"
                            value={profile.brokerageName}
                            onChange={(e) => setProfile({ ...profile, brokerageName: e.target.value })}
                            disabled={!isEditing}
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </SettingsCard>
                </Grid>
              </Grid>
            </TabPanel>

            {/* Notifications Tab */}
            <TabPanel value={tabValue} index={1}>
              <SettingsCard>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Notification Preferences
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <Email />
                      </ListItemIcon>
                      <ListItemText
                        primary="Email Notifications"
                        secondary="Receive notifications via email"
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          edge="end"
                          checked={preferences.emailNotifications}
                          onChange={(e) => setPreferences({ ...preferences, emailNotifications: e.target.checked })}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    <Divider variant="inset" component="li" />
                    <ListItem>
                      <ListItemIcon>
                        <Phone />
                      </ListItemIcon>
                      <ListItemText
                        primary="SMS Notifications"
                        secondary="Receive text message alerts"
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          edge="end"
                          checked={preferences.smsNotifications}
                          onChange={(e) => setPreferences({ ...preferences, smsNotifications: e.target.checked })}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    <Divider variant="inset" component="li" />
                    <ListItem>
                      <ListItemIcon>
                        <Notifications />
                      </ListItemIcon>
                      <ListItemText
                        primary="Push Notifications"
                        secondary="Browser and mobile app notifications"
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          edge="end"
                          checked={preferences.pushNotifications}
                          onChange={(e) => setPreferences({ ...preferences, pushNotifications: e.target.checked })}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    <Divider variant="inset" component="li" />
                    <ListItem>
                      <ListItemIcon>
                        <Email />
                      </ListItemIcon>
                      <ListItemText
                        primary="Marketing Emails"
                        secondary="Receive promotional content and updates"
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          edge="end"
                          checked={preferences.marketingEmails}
                          onChange={(e) => setPreferences({ ...preferences, marketingEmails: e.target.checked })}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  </List>
                  <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="contained"
                      startIcon={<Save />}
                      onClick={handleSavePreferences}
                    >
                      Save Preferences
                    </Button>
                  </Box>
                </CardContent>
              </SettingsCard>
            </TabPanel>

            {/* AI Assistant Tab */}
            <TabPanel value={tabValue} index={2}>
              <SettingsCard>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    AI Assistant Settings
                  </Typography>
                  <Alert severity="info" sx={{ mb: 3 }}>
                    Configure how your AI assistant helps you manage your real estate business.
                  </Alert>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <SmartToy />
                      </ListItemIcon>
                      <ListItemText
                        primary="AI Assistant"
                        secondary="Enable AI-powered assistance"
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          edge="end"
                          checked={aiSettings.aiAssistant}
                          onChange={(e) => setAiSettings({ ...aiSettings, aiAssistant: e.target.checked })}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    <Divider variant="inset" component="li" />
                    <ListItem>
                      <ListItemIcon>
                        <Speed />
                      </ListItemIcon>
                      <ListItemText
                        primary="Smart Suggestions"
                        secondary="Get AI-powered recommendations"
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          edge="end"
                          checked={aiSettings.autoSuggestions}
                          onChange={(e) => setAiSettings({ ...aiSettings, autoSuggestions: e.target.checked })}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    <Divider variant="inset" component="li" />
                    <ListItem>
                      <ListItemIcon>
                        <Info />
                      </ListItemIcon>
                      <ListItemText
                        primary="Smart Insights"
                        secondary="Analyze data and provide insights"
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          edge="end"
                          checked={aiSettings.smartInsights}
                          onChange={(e) => setAiSettings({ ...aiSettings, smartInsights: e.target.checked })}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  </List>

                  <Box sx={{ mt: 3 }}>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>AI Response Speed</InputLabel>
                      <Select
                        value={aiSettings.aiResponseSpeed}
                        label="AI Response Speed"
                        onChange={(e) => setAiSettings({ ...aiSettings, aiResponseSpeed: e.target.value })}
                      >
                        <MenuItem value="fast">Fast (Less accurate)</MenuItem>
                        <MenuItem value="balanced">Balanced</MenuItem>
                        <MenuItem value="accurate">Accurate (Slower)</MenuItem>
                      </Select>
                    </FormControl>

                    <FormControl fullWidth>
                      <InputLabel>Data Privacy Level</InputLabel>
                      <Select
                        value={aiSettings.dataPrivacy}
                        label="Data Privacy Level"
                        onChange={(e) => setAiSettings({ ...aiSettings, dataPrivacy: e.target.value })}
                      >
                        <MenuItem value="strict">Strict (No data sharing)</MenuItem>
                        <MenuItem value="standard">Standard (Anonymous data)</MenuItem>
                        <MenuItem value="open">Open (Help improve AI)</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>

                  <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="contained"
                      startIcon={<Save />}
                      onClick={handleSaveAISettings}
                    >
                      Save AI Settings
                    </Button>
                  </Box>
                </CardContent>
              </SettingsCard>
            </TabPanel>

            {/* Integrations Tab */}
            <TabPanel value={tabValue} index={3}>
              <Grid container spacing={3}>
                {integrations.map((integration) => (
                  <Grid item xs={12} sm={6} md={4} key={integration.id}>
                    <SettingsCard>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), mr: 2 }}>
                            {integration.icon}
                          </Avatar>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="h6">{integration.name}</Typography>
                            <Chip
                              label={integration.status}
                              color={integration.status === 'connected' ? 'success' : 'default'}
                              size="small"
                            />
                          </Box>
                        </Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Last sync: {integration.lastSync}
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                          {integration.status === 'connected' ? (
                            <Button
                              fullWidth
                              variant="outlined"
                              color="error"
                              startIcon={<Delete />}
                              onClick={() => handleDisconnectIntegration(integration.id)}
                            >
                              Disconnect
                            </Button>
                          ) : (
                            <Button
                              fullWidth
                              variant="contained"
                              startIcon={<AddCircle />}
                              onClick={() => handleConnectIntegration(integration.id)}
                            >
                              Connect
                            </Button>
                          )}
                        </Box>
                      </CardContent>
                    </SettingsCard>
                  </Grid>
                ))}
              </Grid>
            </TabPanel>

            {/* Security Tab */}
            <TabPanel value={tabValue} index={4}>
              <SettingsCard>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Security Settings
                  </Typography>
                  <Alert severity="warning" sx={{ mb: 3 }}>
                    Keep your account secure by using a strong password and enabling two-factor authentication.
                  </Alert>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Current Password"
                        type={showPassword ? 'text' : 'password'}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Key />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowPassword(!showPassword)}
                                edge="end"
                              >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="New Password"
                        type="password"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Confirm New Password"
                        type="password"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        variant="contained"
                        startIcon={<Security />}
                      >
                        Update Password
                      </Button>
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 4 }} />

                  <Typography variant="h6" gutterBottom>
                    Two-Factor Authentication
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <Security />
                      </ListItemIcon>
                      <ListItemText
                        primary="Two-Factor Authentication"
                        secondary="Add an extra layer of security to your account"
                      />
                      <ListItemSecondaryAction>
                        <Button variant="outlined">
                          Enable 2FA
                        </Button>
                      </ListItemSecondaryAction>
                    </ListItem>
                  </List>
                </CardContent>
              </SettingsCard>
            </TabPanel>

            {/* Appearance Tab */}
            <TabPanel value={tabValue} index={5}>
              <SettingsCard>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Appearance & Display
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Theme</InputLabel>
                        <Select
                          value={preferences.theme}
                          label="Theme"
                          onChange={(e) => setPreferences({ ...preferences, theme: e.target.value })}
                        >
                          <MenuItem value="light">Light</MenuItem>
                          <MenuItem value="dark">Dark</MenuItem>
                          <MenuItem value="auto">Auto (System)</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Language</InputLabel>
                        <Select
                          value={preferences.language}
                          label="Language"
                          onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                        >
                          <MenuItem value="en">English</MenuItem>
                          <MenuItem value="es">Spanish</MenuItem>
                          <MenuItem value="fr">French</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Date Format</InputLabel>
                        <Select
                          value={preferences.dateFormat}
                          label="Date Format"
                          onChange={(e) => setPreferences({ ...preferences, dateFormat: e.target.value })}
                        >
                          <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                          <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                          <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Currency</InputLabel>
                        <Select
                          value={preferences.currency}
                          label="Currency"
                          onChange={(e) => setPreferences({ ...preferences, currency: e.target.value })}
                        >
                          <MenuItem value="USD">USD ($)</MenuItem>
                          <MenuItem value="EUR">EUR (€)</MenuItem>
                          <MenuItem value="GBP">GBP (£)</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={preferences.showCommissions}
                            onChange={(e) => setPreferences({ ...preferences, showCommissions: e.target.checked })}
                          />
                        }
                        label="Show commission amounts in dashboards"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={preferences.autoBackup}
                            onChange={(e) => setPreferences({ ...preferences, autoBackup: e.target.checked })}
                          />
                        }
                        label="Enable automatic data backup"
                      />
                    </Grid>
                  </Grid>
                  <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="contained"
                      startIcon={<Save />}
                      onClick={handleSavePreferences}
                    >
                      Save Appearance Settings
                    </Button>
                  </Box>
                </CardContent>
              </SettingsCard>
            </TabPanel>
          </Box>
        </Paper>
      </motion.div>
    </Container>
  );
};

export default Settings;