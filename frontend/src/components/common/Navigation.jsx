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
  Collapse,
} from '@mui/material';
import {
  Dashboard,
  Business,
  Home,
  People,
  Event,
  TrendingUp,
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
  Groups,
  ExpandMore,
  ExpandLess,
  CheckCircle,
  Error,
  WifiOff,
} from '@mui/icons-material';
import UserMenu from './UserMenu';
import { useWebSocket } from '../../hooks/useWebSocket';

const EnhancedNavigation = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { isConnected, connectionStatus } = useWebSocket();

  const [dataMenuAnchor, setDataMenuAnchor] = useState(null);
  const [peopleMenuAnchor, setPeopleMenuAnchor] = useState(null);
  const [otherMenuAnchor, setOtherMenuAnchor] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [brandMenuAnchor, setBrandMenuAnchor] = useState(null);

  // Mobile drawer collapsible sections
  const [dataExpanded, setDataExpanded] = useState(false);
  const [peopleExpanded, setPeopleExpanded] = useState(false);
  const [otherExpanded, setOtherExpanded] = useState(false);

  const handleDataMenuClick = (event) => {
    setDataMenuAnchor(event.currentTarget);
  };

  const handlePeopleMenuClick = (event) => {
    setPeopleMenuAnchor(event.currentTarget);
  };

  const handleOtherMenuClick = (event) => {
    setOtherMenuAnchor(event.currentTarget);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Main navigation items (removed Listings)
  const mainNavItems = [
    { path: '/escrows', label: 'Escrows', icon: <Business /> },
    { path: '/clients', label: 'Clients', icon: <People /> },
    { path: '/appointments', label: 'Appointments', icon: <Event /> },
    { path: '/leads', label: 'Leads', icon: <TrendingUp /> },
  ];

  // Data menu items
  const dataMenuItems = [
    { path: '/listings', label: 'Listings', icon: <Home /> },
    { path: '/open-houses', label: 'Open Houses', icon: <Home /> },
    { path: '/lead-sources', label: 'Lead Sources', icon: <TrendingUp /> },
    { path: '/expenses', label: 'Expenses', icon: <AccountBalanceWallet /> },
    { path: '/listing-interest', label: 'Listing Interest', icon: <TrendingUp /> },
    { path: '/automations', label: 'Automations', icon: <Storage /> },
  ];

  // People menu items
  const peopleMenuItems = [
    { path: '/realtors', label: 'Realtors', icon: <People /> },
    { path: '/loan-officers', label: 'Loan Officers', icon: <People /> },
    { path: '/escrow-officers', label: 'Escrow Officers', icon: <People /> },
    { path: '/transaction-coordinators', label: 'Transaction Coordinators', icon: <People /> },
    { path: '/home-inspection-companies', label: 'Home Inspection Companies', icon: <Business /> },
    { path: '/termite-inspection-companies', label: 'Termite Inspection Companies', icon: <Business /> },
    { path: '/home-warranty-companies', label: 'Home Warranty Companies', icon: <Business /> },
    { path: '/nhd-companies', label: 'NHD Companies', icon: <Business /> },
    { path: '/vendors', label: 'Vendors', icon: <Business /> },
    { path: '/companies', label: 'Companies', icon: <Business /> },
  ];

  // Other menu items
  const otherMenuItems = [
    { path: '/commissions', label: 'Commission tracking', icon: <AttachMoney /> },
    { path: '/invoices', label: 'Invoice management', icon: <Receipt /> },
    { path: '/expense-tracking', label: 'Expense tracking', icon: <AccountBalanceWallet /> },
    { path: '/activity-log', label: 'Activity Log', icon: <Timeline /> },
    { path: '/all-notes', label: 'All Notes', icon: <Article /> },
    { path: '/reports', label: 'Reports', icon: <Assessment /> },
    { path: '/calendar', label: 'Calendar', icon: <CalendarMonth /> },
    { path: '/health', label: 'System Health', icon: <HealthAndSafety /> },
    { path: '/escrows/health', label: 'Escrows API Test', icon: <HealthAndSafety /> },
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

        {/* Data Section - Collapsible */}
        <ListItem disablePadding>
          <ListItemButton onClick={() => setDataExpanded(!dataExpanded)}>
            <ListItemIcon><Storage /></ListItemIcon>
            <ListItemText primary="Data" />
            {dataExpanded ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
        </ListItem>
        <Collapse in={dataExpanded} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {dataMenuItems.map((item) => (
              <ListItem key={item.path} disablePadding sx={{ pl: 4 }}>
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
        </Collapse>

        <Divider sx={{ my: 1 }} />

        {/* People Section - Collapsible */}
        <ListItem disablePadding>
          <ListItemButton onClick={() => setPeopleExpanded(!peopleExpanded)}>
            <ListItemIcon><Groups /></ListItemIcon>
            <ListItemText primary="People" />
            {peopleExpanded ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
        </ListItem>
        <Collapse in={peopleExpanded} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {peopleMenuItems.map((item) => (
              <ListItem key={item.path} disablePadding sx={{ pl: 4 }}>
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
        </Collapse>

        <Divider sx={{ my: 1 }} />

        {/* Other Section - Collapsible */}
        <ListItem disablePadding>
          <ListItemButton onClick={() => setOtherExpanded(!otherExpanded)}>
            <ListItemIcon><MoreVert /></ListItemIcon>
            <ListItemText primary="Other" />
            {otherExpanded ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
        </ListItem>
        <Collapse in={otherExpanded} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {otherMenuItems.map((item) => (
              <ListItem key={item.path} disablePadding sx={{ pl: 4 }}>
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
        </Collapse>
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

          {/* Logo/Brand - DROPDOWN MENU */}
          <Box
            onClick={(e) => setBrandMenuAnchor(e.currentTarget)}
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
              <Business />
            </Avatar>
            <Typography
              variant="h6"
              component="div"
              sx={{
                display: { xs: 'none', sm: 'block' },
                whiteSpace: 'nowrap',
              }}
            >
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

              {/* Other Dropdown - Keep as text button for now */}
              <Button
                color="inherit"
                startIcon={<MoreVert />}
                onClick={handleOtherMenuClick}
                sx={{ mx: 0.5 }}
              >
                Other
              </Button>
            </Box>
          )}

          <Box sx={{ flexGrow: 1 }} />

          {/* Right side icons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Data Dropdown - Icon Only */}
            {!isMobile && (
              <Tooltip title="Data">
                <IconButton
                  color="inherit"
                  onClick={handleDataMenuClick}
                >
                  <Storage />
                </IconButton>
              </Tooltip>
            )}

            {/* People Dropdown - Icon Only with Groups icon */}
            {!isMobile && (
              <Tooltip title="People">
                <IconButton
                  color="inherit"
                  onClick={handlePeopleMenuClick}
                >
                  <Groups />
                </IconButton>
              </Tooltip>
            )}

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

            {/* WebSocket Connection Status Indicator */}
            <Tooltip title={isConnected ? "Real-time sync active" : "Real-time sync disconnected"}>
              <Chip
                icon={isConnected ? <CheckCircle /> : <WifiOff />}
                label="Live"
                color={isConnected ? "success" : "default"}
                size="small"
                variant={isConnected ? "filled" : "outlined"}
                sx={{
                  mr: 1,
                  height: 24,
                  '& .MuiChip-icon': { fontSize: 16 }
                }}
              />
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

      {/* Data Menu */}
      <Menu
        anchorEl={dataMenuAnchor}
        open={Boolean(dataMenuAnchor)}
        onClose={() => setDataMenuAnchor(null)}
        onClick={() => setDataMenuAnchor(null)}
      >
        {dataMenuItems.map((item) => (
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

      {/* People Menu */}
      <Menu
        anchorEl={peopleMenuAnchor}
        open={Boolean(peopleMenuAnchor)}
        onClose={() => setPeopleMenuAnchor(null)}
        onClick={() => setPeopleMenuAnchor(null)}
      >
        {peopleMenuItems.map((item) => (
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

      {/* Other Menu */}
      <Menu
        anchorEl={otherMenuAnchor}
        open={Boolean(otherMenuAnchor)}
        onClose={() => setOtherMenuAnchor(null)}
        onClick={() => setOtherMenuAnchor(null)}
      >
        {otherMenuItems.map((item) => (
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

      {/* Brand Dropdown Menu */}
      <Menu
        anchorEl={brandMenuAnchor}
        open={Boolean(brandMenuAnchor)}
        onClose={() => setBrandMenuAnchor(null)}
        onClick={() => setBrandMenuAnchor(null)}
      >
        <MenuItem
          onClick={() => {
            navigate('/');
            setBrandMenuAnchor(null);
          }}
        >
          <ListItemIcon><Dashboard /></ListItemIcon>
          <ListItemText primary="Home Dashboard" />
        </MenuItem>
        <MenuItem
          onClick={() => {
            navigate('/health');
            setBrandMenuAnchor(null);
          }}
        >
          <ListItemIcon><HealthAndSafety /></ListItemIcon>
          <ListItemText primary="System Health" />
        </MenuItem>
      </Menu>

    </>
  );
};

export default EnhancedNavigation;