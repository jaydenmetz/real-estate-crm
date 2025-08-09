import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Button,
  Box,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Avatar,
  Badge,
  Tooltip,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  useTheme,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  Chip,
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
  Settings,
  ExitToApp,
  Storage,
  Article,
  Timeline,
  CalendarMonth,
  Assessment,
  Menu as MenuIcon,
  AttachMoney,
  Receipt,
  AccountBalanceWallet,
  HealthAndSafety,
} from '@mui/icons-material';
import UserMenu from './UserMenu';

const EnhancedNavigation = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [otherDataAnchor, setOtherDataAnchor] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationAnchor, setNotificationAnchor] = useState(null);

  const handleOtherDataClick = (event) => {
    setOtherDataAnchor(event.currentTarget);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Main navigation items
  const mainNavItems = [
    { path: '/escrows', label: 'Escrows', icon: <Business /> },
    { path: '/listings', label: 'Listings', icon: <Home /> },
    { path: '/clients', label: 'Clients', icon: <People /> },
    { path: '/appointments', label: 'Appointments', icon: <Event /> },
    { path: '/leads', label: 'Leads', icon: <TrendingUp /> },
  ];

  // Other data menu items
  const otherDataItems = [
    { path: '/commissions', label: 'Commission tracking', icon: <AttachMoney /> },
    { path: '/invoices', label: 'Invoice management', icon: <Receipt /> },
    { path: '/expenses', label: 'Expense tracking', icon: <AccountBalanceWallet /> },
    { path: '/ai-agents', label: 'AI Agents', icon: <SmartToy /> },
    { path: '/activity-log', label: 'Activity Log', icon: <Timeline /> },
    { path: '/all-notes', label: 'All Notes', icon: <Article /> },
    { path: '/reports', label: 'Reports', icon: <Assessment /> },
    { path: '/calendar', label: 'Calendar', icon: <CalendarMonth /> },
    { path: '/escrows/health', label: 'API Health Check', icon: <HealthAndSafety /> },
  ];

  // Mock notifications
  const notifications = [
    { id: 1, text: 'New lead from Zillow', time: '5m ago', read: false },
    { id: 2, text: 'Escrow closing reminder', time: '1h ago', read: false },
    { id: 3, text: 'Client message received', time: '2h ago', read: true },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  // Mobile drawer content
  const drawer = (
    <Box sx={{ width: 250, pt: 2 }}>
      <List>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => {
              navigate('/');
              setMobileOpen(false);
            }}
          >
            <ListItemIcon><Dashboard /></ListItemIcon>
            <ListItemText primary="Home" />
          </ListItemButton>
        </ListItem>
        
        <Divider sx={{ my: 1 }} />
        
        {mainNavItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              component={NavLink}
              to={item.path}
              onClick={() => setMobileOpen(false)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
        
        <Divider sx={{ my: 1 }} />
        
        {otherDataItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              component={NavLink}
              to={item.path}
              onClick={() => setMobileOpen(false)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
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

          {/* Logo/Brand - CLICKABLE TO VIRTUAL OFFICE */}
          <Box 
            component={NavLink}
            to="/"
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mr: 3,
              textDecoration: 'none',
              color: 'inherit',
              cursor: 'pointer',
              '&:hover': {
                opacity: 0.85,
              }
            }}
          >
            <Avatar sx={{ bgcolor: 'white', color: 'primary.main', mr: 1 }}>
              <SmartToy />
            </Avatar>
            <Typography variant="h6" component="div" sx={{ display: { xs: 'none', sm: 'block' } }}>
              Real Estate CRM
            </Typography>
          </Box>

          {/* Environment Indicator */}
          {window.location.hostname === 'localhost' && (
            <Chip 
              label="LOCAL" 
              size="small" 
              sx={{ 
                bgcolor: '#10B981', 
                color: 'white',
                fontWeight: 'bold',
                mr: 2,
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%': { opacity: 1 },
                  '50%': { opacity: 0.7 },
                  '100%': { opacity: 1 },
                }
              }} 
            />
          )}

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
                More
              </Button>
            </Box>
          )}

          <Box sx={{ flexGrow: 1 }} />

          {/* Right side icons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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

            {/* Settings */}
            <Tooltip title="Settings">
              <IconButton 
                color="inherit"
                component={NavLink}
                to="/settings"
              >
                <Settings />
              </IconButton>
            </Tooltip>

            {/* User Menu */}
            <UserMenu />
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
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
        onClose={() => setOtherDataAnchor(null)}
        onClick={() => setOtherDataAnchor(null)}
      >
        {otherDataItems.map((item) => (
          <MenuItem
            key={item.path}
            component={NavLink}
            to={item.path}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </MenuItem>
        ))}
      </Menu>

      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationAnchor}
        open={Boolean(notificationAnchor)}
        onClose={() => setNotificationAnchor(null)}
        PaperProps={{
          sx: { width: 320, maxHeight: 400 }
        }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="h6">Notifications</Typography>
        </Box>
        <Divider />
        {notifications.map((notif) => (
          <MenuItem 
            key={notif.id}
            onClick={() => setNotificationAnchor(null)}
            sx={{ py: 1.5 }}
          >
            <ListItemText 
              primary={notif.text}
              secondary={notif.time}
              primaryTypographyProps={{
                fontWeight: notif.read ? 'normal' : 'bold'
              }}
            />
          </MenuItem>
        ))}
        <Divider />
        <MenuItem 
          onClick={() => {
            navigate('/notifications');
            setNotificationAnchor(null);
          }}
          sx={{ justifyContent: 'center' }}
        >
          View All Notifications
        </MenuItem>
      </Menu>

    </>
  );
};

export default EnhancedNavigation;