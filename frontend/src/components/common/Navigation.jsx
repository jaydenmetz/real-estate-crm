import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
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
  Avatar,
  Tooltip,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemButton,
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
  Notifications,
  AccountCircle,
  Settings,
  Menu as MenuIcon,
  AttachMoney,
  Receipt,
  Campaign,
  Shield,
  Email,
  LocationOn,
  Description,
  Assignment,
  Analytics,
  Logout,
} from '@mui/icons-material';

import { useAuth } from '../../contexts/AuthContext';

const Navigation = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);

  // Check if user is admin
  const isAdmin = user && (user.role === 'system_admin' || user.role === 'admin');
  const [otherDataAnchor, setOtherDataAnchor] = useState(null);
  const [profileAnchor, setProfileAnchor] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);

  const mainNavItems = [
    { path: '/', label: 'Dashboard', icon: <Dashboard /> },
    { path: '/escrows', label: 'Escrows', icon: <Business /> },
    { path: '/listings', label: 'Listings', icon: <Home /> },
    { path: '/clients', label: 'Clients', icon: <People /> },
    { path: '/appointments', label: 'Appointments', icon: <Event /> },
    { path: '/leads', label: 'Leads', icon: <TrendingUp /> },
    { path: '/virtual-office', label: 'Virtual Office', icon: <SmartToy /> },
  ];

  const otherDataItems = [
    {
      category: 'Financial',
      items: [
        { path: '/commissions', label: 'Commission Tracking', icon: <AttachMoney /> },
        { path: '/expenses', label: 'Expense Management', icon: <Receipt /> },
        { path: '/invoices', label: 'Invoices', icon: <Description /> },
      ]
    },
    {
      category: 'Marketing',
      items: [
        { path: '/campaigns', label: 'Marketing Campaigns', icon: <Campaign /> },
        { path: '/social-media', label: 'Social Media', icon: <Email /> },
        { path: '/email-templates', label: 'Email Templates', icon: <Email /> },
      ]
    },
    {
      category: 'System',
      items: [
        { path: '/documents', label: 'Documents', icon: <Description /> },
        { path: '/analytics', label: 'Analytics', icon: <Analytics /> },
        { path: '/settings', label: 'Settings', icon: <Settings /> },
      ]
    },
    {
      category: 'Admin',
      items: [
        { path: '/admin', label: 'Admin Panel', icon: <Shield />, adminOnly: true },
      ]
    },
  ];

  const handleOtherDataClick = (event) => {
    setOtherDataAnchor(event.currentTarget);
  };

  const handleOtherDataClose = (path) => {
    setOtherDataAnchor(null);
    if (path) {
      navigate(path);
    }
  };

  const handleProfileClick = (event) => {
    setProfileAnchor(event.currentTarget);
  };

  const handleProfileClose = (action) => {
    setProfileAnchor(null);
    if (action === 'profile') {
      navigate('/profile');
    } else if (action === 'settings') {
      navigate('/settings');
    } else if (action === 'logout') {
      // Handle logout
      console.log('Logout');
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Mobile Drawer Content
  const drawer = (
    <Box sx={{ width: 250 }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Home sx={{ color: 'primary.main' }} />
        <Typography variant="h6">Real Estate CRM</Typography>
      </Box>
      <Divider />
      <List>
        {mainNavItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              onClick={() => {
                navigate(item.path);
                setMobileOpen(false);
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
        <Divider sx={{ my: 1 }} />
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => {
              navigate('/other-data');
              setMobileOpen(false);
            }}
          >
            <ListItemIcon><MoreVert /></ListItemIcon>
            <ListItemText primary="More Features" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="sticky" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
        <Toolbar>
          {/* Mobile Menu Button */}
          {isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Logo/Brand */}
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 3 }}>
            <Avatar sx={{ bgcolor: 'white', color: 'primary.main', mr: 1 }}>
              <Home />
            </Avatar>
            <Typography variant="h6" component="div" sx={{ display: { xs: 'none', sm: 'block' } }}>
              Real Estate CRM
            </Typography>
          </Box>

          {/* Desktop Navigation */}
          {!isMobile && (
            <Box sx={{ flexGrow: 1, display: 'flex' }}>
              {mainNavItems.map((item) => (
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
              
              {/* Other Data Dropdown */}
              <Button
                color="inherit"
                startIcon={<MoreVert />}
                onClick={handleOtherDataClick}
                sx={{ mx: 0.5 }}
              >
                Data
              </Button>
            </Box>
          )}

          <Box sx={{ flexGrow: 1 }} />

          {/* Right side icons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Notifications */}
            <Tooltip title="Notifications">
              <IconButton color="inherit" onClick={(e) => setNotificationAnchor(e.currentTarget)}>
                <Badge badgeContent={3} color="error">
                  <Notifications />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* Profile */}
            <Tooltip title="Account">
              <IconButton color="inherit" onClick={handleProfileClick}>
                <AccountCircle />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 250 },
        }}
      >
        {drawer}
      </Drawer>

      {/* Other Data Menu */}
      <Menu
        anchorEl={otherDataAnchor}
        open={Boolean(otherDataAnchor)}
        onClose={() => handleOtherDataClose()}
        PaperProps={{ sx: { width: 320, maxHeight: 400 } }}
      >
        {otherDataItems.map((category, index) => {
          // Filter out admin-only items if user is not admin
          const visibleItems = category.items.filter(item => !item.adminOnly || isAdmin);
          if (visibleItems.length === 0) return null;

          return (
            <Box key={index}>
              {index > 0 && <Divider />}
              <MenuItem disabled>
                <Typography variant="caption" color="text.secondary">
                  {category.category}
                </Typography>
              </MenuItem>
              {visibleItems.map((item) => (
                <MenuItem key={item.path} onClick={() => handleOtherDataClose(item.path)}>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText>{item.label}</ListItemText>
                </MenuItem>
              ))}
            </Box>
          );
        })}
        <Divider />
        <MenuItem onClick={() => handleOtherDataClose('/other-data')}>
          <ListItemIcon><MoreVert /></ListItemIcon>
          <ListItemText>View All Features</ListItemText>
        </MenuItem>
      </Menu>

      {/* Profile Menu */}
      <Menu
        anchorEl={profileAnchor}
        open={Boolean(profileAnchor)}
        onClose={() => handleProfileClose()}
      >
        <MenuItem onClick={() => handleProfileClose('profile')}>
          <ListItemIcon><AccountCircle /></ListItemIcon>
          <ListItemText>My Profile</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleProfileClose('settings')}>
          <ListItemIcon><Settings /></ListItemIcon>
          <ListItemText>Settings</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => handleProfileClose('logout')}>
          <ListItemIcon><Logout /></ListItemIcon>
          <ListItemText>Logout</ListItemText>
        </MenuItem>
      </Menu>

      {/* Simple Notifications Menu */}
      <Menu
        anchorEl={notificationAnchor}
        open={Boolean(notificationAnchor)}
        onClose={() => setNotificationAnchor(null)}
      >
        <MenuItem>
          <Typography variant="body2">New lead: Sarah Johnson</Typography>
        </MenuItem>
        <MenuItem>
          <Typography variant="body2">Inspection scheduled for 123 Main St</Typography>
        </MenuItem>
        <MenuItem>
          <Typography variant="body2">Offer accepted on 456 Oak Ave</Typography>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => {
          setNotificationAnchor(null);
          navigate('/notifications');
        }}>
          <Typography variant="body2" color="primary">View all notifications</Typography>
        </MenuItem>
      </Menu>
    </>
  );
};

export default Navigation;