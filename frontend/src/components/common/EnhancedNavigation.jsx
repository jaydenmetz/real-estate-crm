import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Divider,
  ListItemIcon,
  ListItemText,
  Badge,
  Chip,
  Avatar,
  Tooltip,
  Popover,
  List,
  ListItem,
  ListItemButton,
  Paper,
  Grid,
  Card,
  CardActionArea,
  CardContent,
} from '@mui/material';
import {
  Dashboard,
  Business,
  Home,
  People,
  Event,
  TrendingUp,
  SmartToy,
  MoreVert,
  Storage,
  Notifications,
  AccountCircle,
  Settings,
  Analytics,
  Description,
  Phone,
  Email,
  AttachMoney,
  Gavel,
  LocalShipping,
  Assignment,
  Campaign,
  School,
  CardGiftcard,
  Timeline,
  FolderOpen,
  ContactPhone,
  Groups,
  Policy,
  Calculate,
  Receipt,
  Task,
  CheckCircle,
  Warning,
  LocationOn,
  Category,
  Label,
  AccountBalance,
  WorkHistory,
  EmojiEvents,
  Explore,
} from '@mui/icons-material';
import { NavLink, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import websocketService from '../../services/websocket';

// Additional database categories
const otherDataCategories = {
  transactions: {
    name: 'Transactions',
    icon: <AttachMoney />,
    color: '#2e7d32',
    databases: [
      { id: 'commissions', name: 'Commissions', icon: <Receipt />, path: '/data/commissions' },
      { id: 'referrals', name: 'Referrals', icon: <CardGiftcard />, path: '/data/referrals' },
      { id: 'expenses', name: 'Expenses', icon: <Receipt />, path: '/data/expenses' },
      { id: 'closings', name: 'Closings', icon: <Gavel />, path: '/data/closings' },
    ]
  },
  marketing: {
    name: 'Marketing',
    icon: <Campaign />,
    color: '#ed6c02',
    databases: [
      { id: 'campaigns', name: 'Campaigns', icon: <Campaign />, path: '/data/campaigns' },
      { id: 'open_houses', name: 'Open Houses', icon: <Home />, path: '/data/open-houses' },
      { id: 'social_media', name: 'Social Media', icon: <Groups />, path: '/data/social-media' },
      { id: 'email_templates', name: 'Email Templates', icon: <Email />, path: '/data/email-templates' },
    ]
  },
  education: {
    name: 'Education & Goals',
    icon: <School />,
    color: '#1976d2',
    databases: [
      { id: 'training', name: 'Training Records', icon: <School />, path: '/data/training' },
      { id: 'certifications', name: 'Certifications', icon: <EmojiEvents />, path: '/data/certifications' },
      { id: 'goals', name: 'Goals & KPIs', icon: <TrendingUp />, path: '/data/goals' },
      { id: 'achievements', name: 'Achievements', icon: <EmojiEvents />, path: '/data/achievements' },
    ]
  },
  operations: {
    name: 'Operations',
    icon: <Settings />,
    color: '#9c27b0',
    databases: [
      { id: 'vendors', name: 'Vendors', icon: <Business />, path: '/data/vendors' },
      { id: 'documents', name: 'Documents', icon: <Description />, path: '/data/documents' },
      { id: 'tasks', name: 'Tasks', icon: <Task />, path: '/data/tasks' },
      { id: 'checklists', name: 'Checklists', icon: <CheckCircle />, path: '/data/checklists' },
    ]
  },
  relationships: {
    name: 'Relationships',
    icon: <People />,
    color: '#f44336',
    databases: [
      { id: 'partners', name: 'Business Partners', icon: <Groups />, path: '/data/partners' },
      { id: 'lenders', name: 'Lenders', icon: <AccountBalance />, path: '/data/lenders' },
      { id: 'inspectors', name: 'Inspectors', icon: <Assignment />, path: '/data/inspectors' },
      { id: 'contractors', name: 'Contractors', icon: <WorkHistory />, path: '/data/contractors' },
    ]
  },
  analytics: {
    name: 'Analytics & Reports',
    icon: <Analytics />,
    color: '#00bcd4',
    databases: [
      { id: 'performance', name: 'Performance Metrics', icon: <Timeline />, path: '/data/performance' },
      { id: 'market_analysis', name: 'Market Analysis', icon: <Explore />, path: '/data/market-analysis' },
      { id: 'roi_tracking', name: 'ROI Tracking', icon: <Calculate />, path: '/data/roi' },
      { id: 'forecasts', name: 'Forecasts', icon: <TrendingUp />, path: '/data/forecasts' },
    ]
  }
};

const EnhancedNavigation = () => {
  const navigate = useNavigate();
  const [otherDataAnchor, setOtherDataAnchor] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [profileAnchor, setProfileAnchor] = useState(null);
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);

  // Fetch notifications
  const { data: notifications = [] } = useQuery(
    'notifications',
    () => websocketService.getNotifications(),
    { refetchInterval: 30000 }
  );

  // Get unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleOtherDataClick = (event) => {
    setOtherDataAnchor(event.currentTarget);
  };

  const handleCloseOtherData = () => {
    setOtherDataAnchor(null);
  };

  const navigationItems = [
    { path: '/', label: 'Dashboard', icon: <Dashboard /> },
    { path: '/escrows', label: 'Escrows', icon: <Business /> },
    { path: '/listings', label: 'Listings', icon: <Home /> },
    { path: '/clients', label: 'Clients', icon: <People /> },
    { path: '/appointments', label: 'Appointments', icon: <Event /> },
    { path: '/leads', label: 'Leads', icon: <TrendingUp /> },
    { path: '/ai-team', label: 'AI Team', icon: <SmartToy /> },
  ];

  return (
    <AppBar position="sticky" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        {/* Logo/Brand */}
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 3 }}>
          <Avatar sx={{ bgcolor: 'white', color: 'primary.main', mr: 1 }}>
            <Home />
          </Avatar>
          <Typography variant="h6" component="div" sx={{ display: { xs: 'none', sm: 'block' } }}>
            Real Estate CRM
          </Typography>
        </Box>

        {/* Main Navigation - Desktop */}
        <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
          {navigationItems.map((item) => (
            <Button
              key={item.path}
              component={NavLink}
              to={item.path}
              color="inherit"
              startIcon={item.icon}
              sx={{
                mx: 0.5,
                '&.active': {
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  borderBottom: '2px solid white',
                }
              }}
            >
              {item.label}
            </Button>
          ))}
          
          {/* Other Data Button */}
          <Button
            color="inherit"
            startIcon={<Storage />}
            endIcon={<MoreVert />}
            onClick={handleOtherDataClick}
            sx={{
              mx: 0.5,
              bgcolor: otherDataAnchor ? 'rgba(255, 255, 255, 0.1)' : 'transparent'
            }}
          >
            Other Data
          </Button>
        </Box>

        {/* Right Side Icons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* AI Team Status */}
          <Chip
            icon={<SmartToy />}
            label="12/14 Active"
            size="small"
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              display: { xs: 'none', sm: 'flex' }
            }}
          />

          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton
              color="inherit"
              onClick={(e) => setNotificationAnchor(e.currentTarget)}
            >
              <Badge badgeContent={unreadCount} color="error">
                <Notifications />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Profile */}
          <Tooltip title="Profile">
            <IconButton
              color="inherit"
              onClick={(e) => setProfileAnchor(e.currentTarget)}
            >
              <AccountCircle />
            </IconButton>
          </Tooltip>

          {/* Mobile Menu */}
          <IconButton
            color="inherit"
            onClick={(e) => setMobileMenuAnchor(e.currentTarget)}
            sx={{ display: { xs: 'flex', md: 'none' } }}
          >
            <MoreVert />
          </IconButton>
        </Box>
      </Toolbar>

      {/* Other Data Popover */}
      <Popover
        open={Boolean(otherDataAnchor)}
        anchorEl={otherDataAnchor}
        onClose={handleCloseOtherData}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        PaperProps={{
          sx: { width: 600, maxHeight: 500, overflow: 'auto' }
        }}
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Additional Databases
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Access specialized data and tracking systems
          </Typography>

          <Grid container spacing={3}>
            {Object.entries(otherDataCategories).map(([categoryId, category]) => (
              <Grid item xs={12} key={categoryId}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: 1,
                    color: category.color
                  }}
                >
                  {category.icon}
                  {category.name}
                </Typography>
                <Grid container spacing={1}>
                  {category.databases.map((db) => (
                    <Grid item xs={6} sm={3} key={db.id}>
                      <Card
                        variant="outlined"
                        sx={{
                          height: '100%',
                          transition: 'all 0.2s',
                          '&:hover': {
                            boxShadow: 2,
                            transform: 'translateY(-2px)'
                          }
                        }}
                      >
                        <CardActionArea
                          onClick={() => {
                            navigate(db.path);
                            handleCloseOtherData();
                          }}
                          sx={{ height: '100%', p: 1.5 }}
                        >
                          <Box sx={{ textAlign: 'center' }}>
                            <Avatar
                              sx={{
                                bgcolor: `${category.color}20`,
                                color: category.color,
                                width: 40,
                                height: 40,
                                mx: 'auto',
                                mb: 1
                              }}
                            >
                              {db.icon}
                            </Avatar>
                            <Typography variant="caption">
                              {db.name}
                            </Typography>
                          </Box>
                        </CardActionArea>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            ))}
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button
              startIcon={<Settings />}
              onClick={() => {
                navigate('/settings/databases');
                handleCloseOtherData();
              }}
            >
              Manage Databases
            </Button>
            <Button
              startIcon={<Analytics />}
              onClick={() => {
                navigate('/analytics');
                handleCloseOtherData();
              }}
            >
              View All Analytics
            </Button>
          </Box>
        </Box>
      </Popover>

      {/* Notifications Popover */}
      <Popover
        open={Boolean(notificationAnchor)}
        anchorEl={notificationAnchor}
        onClose={() => setNotificationAnchor(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: { width: 360, maxHeight: 400 }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Notifications
          </Typography>
          <List>
            {notifications.length === 0 ? (
              <ListItem>
                <ListItemText
                  primary="No new notifications"
                  secondary="You're all caught up!"
                />
              </ListItem>
            ) : (
              notifications.slice(0, 5).map((notification) => (
                <ListItem
                  key={notification.id}
                  button
                  onClick={() => {
                    // Handle notification click
                    setNotificationAnchor(null);
                  }}
                >
                  <ListItemIcon>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: notification.read ? 'grey.300' : 'primary.main' }}>
                      {notification.icon || <Notifications />}
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={notification.title}
                    secondary={notification.message}
                    primaryTypographyProps={{
                      variant: 'body2',
                      fontWeight: notification.read ? 'normal' : 'bold'
                    }}
                  />
                </ListItem>
              ))
            )}
          </List>
          {notifications.length > 5 && (
            <Button
              fullWidth
              onClick={() => {
                navigate('/notifications');
                setNotificationAnchor(null);
              }}
            >
              View All Notifications
            </Button>
          )}
        </Box>
      </Popover>

      {/* Profile Menu */}
      <Menu
        anchorEl={profileAnchor}
        open={Boolean(profileAnchor)}
        onClose={() => setProfileAnchor(null)}
      >
        <MenuItem onClick={() => {
          navigate('/profile');
          setProfileAnchor(null);
        }}>
          <ListItemIcon>
            <AccountCircle />
          </ListItemIcon>
          <ListItemText primary="My Profile" />
        </MenuItem>
        <MenuItem onClick={() => {
          navigate('/settings');
          setProfileAnchor(null);
        }}>
          <ListItemIcon>
            <Settings />
          </ListItemIcon>
          <ListItemText primary="Settings" />
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => {
          // Handle logout
          setProfileAnchor(null);
        }}>
          <ListItemText primary="Logout" />
        </MenuItem>
      </Menu>

      {/* Mobile Menu */}
      <Menu
        anchorEl={mobileMenuAnchor}
        open={Boolean(mobileMenuAnchor)}
        onClose={() => setMobileMenuAnchor(null)}
      >
        {navigationItems.map((item) => (
          <MenuItem
            key={item.path}
            onClick={() => {
              navigate(item.path);
              setMobileMenuAnchor(null);
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </MenuItem>
        ))}
        <MenuItem onClick={(e) => {
          handleOtherDataClick(e);
          setMobileMenuAnchor(null);
        }}>
          <ListItemIcon><Storage /></ListItemIcon>
          <ListItemText primary="Other Data" />
        </MenuItem>
      </Menu>
    </AppBar>
  );
};

export default EnhancedNavigation;