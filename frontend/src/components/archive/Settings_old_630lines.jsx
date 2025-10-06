import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Tabs,
  Tab,
  TextField,
  Switch,
  FormControlLabel,
  Button,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Alert,
  IconButton,
  InputAdornment,
  Card,
  CardContent,
  CardActions,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Person,
  Notifications,
  Security,
  Palette,
  Language,
  Storage,
  CloudUpload,
  Save,
  Visibility,
  VisibilityOff,
  Add,
  Delete,
  Edit,
  Check,
  Close,
  Info,
  Warning,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';

const Settings = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [activeTab, setActiveTab] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [apiKeyDialog, setApiKeyDialog] = useState(false);
  const [newApiKey, setNewApiKey] = useState('');

  // Profile settings state
  const [profile, setProfile] = useState({
    firstName: 'Jayden',
    lastName: 'Metz',
    email: 'jaydenmetz@email.com',
    phone: '(555) 123-4567',
    brokerLicense: 'CA-BR-123456',
    mlsId: 'MLS-789012',
    company: 'Metz Real Estate Group',
    website: 'https://jaydenmetz.com',
  });

  // Notification settings state
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    newLeadAlert: true,
    appointmentReminder: true,
    escrowUpdates: true,
    marketingCampaigns: false,
    systemUpdates: true,
    reminderTime: '30',
  });

  // Security settings state
  const [security, setSecurity] = useState({
    twoFactorEnabled: false,
    sessionTimeout: '30',
    passwordExpiry: '90',
    apiKeys: [
      { id: 1, name: 'Production API', created: '2025-01-15', lastUsed: '2025-07-16' },
      { id: 2, name: 'Mobile App', created: '2025-03-20', lastUsed: '2025-07-15' },
    ],
  });

  // Appearance settings state
  const [appearance, setAppearance] = useState({
    theme: 'light',
    primaryColor: '#1976d2',
    fontSize: 'medium',
    compactMode: false,
    showAnimations: true,
  });

  // Integration settings state
  const [integrations, setIntegrations] = useState({
    googleCalendar: true,
    outlook: false,
    zapier: true,
    mailchimp: false,
    docusign: true,
    mlsSync: true,
    syncFrequency: '15',
  });

  const handleProfileChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    setUnsavedChanges(true);
  };

  const handleNotificationChange = (field, value) => {
    setNotifications(prev => ({ ...prev, [field]: value }));
    setUnsavedChanges(true);
  };

  const handleSecurityChange = (field, value) => {
    setSecurity(prev => ({ ...prev, [field]: value }));
    setUnsavedChanges(true);
  };

  const handleAppearanceChange = (field, value) => {
    setAppearance(prev => ({ ...prev, [field]: value }));
    setUnsavedChanges(true);
  };

  const handleIntegrationChange = (field, value) => {
    setIntegrations(prev => ({ ...prev, [field]: value }));
    setUnsavedChanges(true);
  };

  const handleSaveChanges = () => {
    // Here you would typically make API calls to save settings
    enqueueSnackbar('Settings saved successfully', { variant: 'success' });
    setUnsavedChanges(false);
  };

  const handleAddApiKey = () => {
    if (newApiKey.trim()) {
      const newKey = {
        id: Date.now(),
        name: newApiKey,
        created: new Date().toISOString().split('T')[0],
        lastUsed: 'Never',
      };
      setSecurity(prev => ({
        ...prev,
        apiKeys: [...prev.apiKeys, newKey],
      }));
      setNewApiKey('');
      setApiKeyDialog(false);
      enqueueSnackbar('API key created successfully', { variant: 'success' });
    }
  };

  const handleDeleteApiKey = (id) => {
    setSecurity(prev => ({
      ...prev,
      apiKeys: prev.apiKeys.filter(key => key.id !== id),
    }));
    enqueueSnackbar('API key deleted', { variant: 'info' });
  };

  const tabPanels = [
    // Profile Tab
    <Box key="profile" sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Profile Information
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="First Name"
            value={profile.firstName}
            onChange={(e) => handleProfileChange('firstName', e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Last Name"
            value={profile.lastName}
            onChange={(e) => handleProfileChange('lastName', e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={profile.email}
            onChange={(e) => handleProfileChange('email', e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Phone"
            value={profile.phone}
            onChange={(e) => handleProfileChange('phone', e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Broker License"
            value={profile.brokerLicense}
            onChange={(e) => handleProfileChange('brokerLicense', e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="MLS ID"
            value={profile.mlsId}
            onChange={(e) => handleProfileChange('mlsId', e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Company"
            value={profile.company}
            onChange={(e) => handleProfileChange('company', e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Website"
            value={profile.website}
            onChange={(e) => handleProfileChange('website', e.target.value)}
          />
        </Grid>
      </Grid>
    </Box>,

    // Notifications Tab
    <Box key="notifications" sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Notification Preferences
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Delivery Methods
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={notifications.emailNotifications}
              onChange={(e) => handleNotificationChange('emailNotifications', e.target.checked)}
            />
          }
          label="Email Notifications"
        />
        <FormControlLabel
          control={
            <Switch
              checked={notifications.smsNotifications}
              onChange={(e) => handleNotificationChange('smsNotifications', e.target.checked)}
            />
          }
          label="SMS Notifications"
        />
        <FormControlLabel
          control={
            <Switch
              checked={notifications.pushNotifications}
              onChange={(e) => handleNotificationChange('pushNotifications', e.target.checked)}
            />
          }
          label="Push Notifications"
        />
      </Box>

      <Divider sx={{ my: 3 }} />

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Notification Types
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={notifications.newLeadAlert}
              onChange={(e) => handleNotificationChange('newLeadAlert', e.target.checked)}
            />
          }
          label="New Lead Alerts"
        />
        <FormControlLabel
          control={
            <Switch
              checked={notifications.appointmentReminder}
              onChange={(e) => handleNotificationChange('appointmentReminder', e.target.checked)}
            />
          }
          label="Appointment Reminders"
        />
        <FormControlLabel
          control={
            <Switch
              checked={notifications.escrowUpdates}
              onChange={(e) => handleNotificationChange('escrowUpdates', e.target.checked)}
            />
          }
          label="Escrow Status Updates"
        />
        <FormControlLabel
          control={
            <Switch
              checked={notifications.marketingCampaigns}
              onChange={(e) => handleNotificationChange('marketingCampaigns', e.target.checked)}
            />
          }
          label="Marketing Campaign Results"
        />
        <FormControlLabel
          control={
            <Switch
              checked={notifications.systemUpdates}
              onChange={(e) => handleNotificationChange('systemUpdates', e.target.checked)}
            />
          }
          label="System Updates"
        />
      </Box>

      <Box>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Reminder Time</InputLabel>
          <Select
            value={notifications.reminderTime}
            onChange={(e) => handleNotificationChange('reminderTime', e.target.value)}
          >
            <MenuItem value="15">15 minutes before</MenuItem>
            <MenuItem value="30">30 minutes before</MenuItem>
            <MenuItem value="60">1 hour before</MenuItem>
            <MenuItem value="1440">1 day before</MenuItem>
          </Select>
        </FormControl>
      </Box>
    </Box>,

    // Security Tab
    <Box key="security" sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Security Settings
      </Typography>

      <Box sx={{ mb: 3 }}>
        <FormControlLabel
          control={
            <Switch
              checked={security.twoFactorEnabled}
              onChange={(e) => handleSecurityChange('twoFactorEnabled', e.target.checked)}
            />
          }
          label="Two-Factor Authentication"
        />
        {security.twoFactorEnabled && (
          <Alert severity="info" sx={{ mt: 1 }}>
            Two-factor authentication is enabled. You'll receive a code via SMS when logging in.
          </Alert>
        )}
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Session Timeout</InputLabel>
            <Select
              value={security.sessionTimeout}
              onChange={(e) => handleSecurityChange('sessionTimeout', e.target.value)}
            >
              <MenuItem value="15">15 minutes</MenuItem>
              <MenuItem value="30">30 minutes</MenuItem>
              <MenuItem value="60">1 hour</MenuItem>
              <MenuItem value="120">2 hours</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Password Expiry</InputLabel>
            <Select
              value={security.passwordExpiry}
              onChange={(e) => handleSecurityChange('passwordExpiry', e.target.value)}
            >
              <MenuItem value="30">30 days</MenuItem>
              <MenuItem value="60">60 days</MenuItem>
              <MenuItem value="90">90 days</MenuItem>
              <MenuItem value="never">Never</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle1">API Keys</Typography>
          <Button
            startIcon={<Add />}
            onClick={() => setApiKeyDialog(true)}
            variant="outlined"
            size="small"
          >
            Add API Key
          </Button>
        </Box>
        <List>
          {security.apiKeys.map((key) => (
            <ListItem key={key.id}>
              <ListItemText
                primary={key.name}
                secondary={`Created: ${key.created} | Last used: ${key.lastUsed}`}
              />
              <ListItemSecondaryAction>
                <IconButton edge="end" onClick={() => handleDeleteApiKey(key.id)}>
                  <Delete />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>,

    // Appearance Tab
    <Box key="appearance" sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Appearance Settings
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Theme</InputLabel>
            <Select
              value={appearance.theme}
              onChange={(e) => handleAppearanceChange('theme', e.target.value)}
            >
              <MenuItem value="light">Light</MenuItem>
              <MenuItem value="dark">Dark</MenuItem>
              <MenuItem value="auto">Auto (System)</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Primary Color"
            type="color"
            value={appearance.primaryColor}
            onChange={(e) => handleAppearanceChange('primaryColor', e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Palette />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Font Size</InputLabel>
            <Select
              value={appearance.fontSize}
              onChange={(e) => handleAppearanceChange('fontSize', e.target.value)}
            >
              <MenuItem value="small">Small</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="large">Large</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={appearance.compactMode}
                onChange={(e) => handleAppearanceChange('compactMode', e.target.checked)}
              />
            }
            label="Compact Mode"
          />
          <FormControlLabel
            control={
              <Switch
                checked={appearance.showAnimations}
                onChange={(e) => handleAppearanceChange('showAnimations', e.target.checked)}
              />
            }
            label="Show Animations"
          />
        </Grid>
      </Grid>
    </Box>,

    // Integrations Tab
    <Box key="integrations" sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Third-Party Integrations
      </Typography>

      <Grid container spacing={2}>
        {Object.entries({
          googleCalendar: 'Google Calendar',
          outlook: 'Microsoft Outlook',
          zapier: 'Zapier',
          mailchimp: 'Mailchimp',
          docusign: 'DocuSign',
          mlsSync: 'MLS Sync',
        }).map(([key, label]) => (
          <Grid item xs={12} sm={6} key={key}>
            <Card variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle1">{label}</Typography>
                  <Switch
                    checked={integrations[key]}
                    onChange={(e) => handleIntegrationChange(key, e.target.checked)}
                  />
                </Box>
                {integrations[key] && (
                  <Chip
                    label="Connected"
                    color="success"
                    size="small"
                    sx={{ mt: 1 }}
                  />
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {integrations.mlsSync && (
        <Box sx={{ mt: 3 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Sync Frequency</InputLabel>
            <Select
              value={integrations.syncFrequency}
              onChange={(e) => handleIntegrationChange('syncFrequency', e.target.value)}
            >
              <MenuItem value="5">Every 5 minutes</MenuItem>
              <MenuItem value="15">Every 15 minutes</MenuItem>
              <MenuItem value="30">Every 30 minutes</MenuItem>
              <MenuItem value="60">Every hour</MenuItem>
            </Select>
          </FormControl>
        </Box>
      )}
    </Box>,
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Settings
        </Typography>
        {unsavedChanges && (
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleSaveChanges}
          >
            Save Changes
          </Button>
        )}
      </Box>

      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab icon={<Person />} label="Profile" />
          <Tab icon={<Notifications />} label="Notifications" />
          <Tab icon={<Security />} label="Security" />
          <Tab icon={<Palette />} label="Appearance" />
          <Tab icon={<Storage />} label="Integrations" />
        </Tabs>

        {tabPanels[activeTab]}
      </Paper>

      {/* API Key Dialog */}
      <Dialog open={apiKeyDialog} onClose={() => setApiKeyDialog(false)}>
        <DialogTitle>Create New API Key</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="API Key Name"
            fullWidth
            value={newApiKey}
            onChange={(e) => setNewApiKey(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApiKeyDialog(false)}>Cancel</Button>
          <Button onClick={handleAddApiKey} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Settings;