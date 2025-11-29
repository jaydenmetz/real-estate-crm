import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Chip,
} from '@mui/material';
import {
  Person,
  Settings,
  Logout,
  Dashboard,
  Security,
  Help,
  Code,
  Public,
  Edit,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const UserMenu = () => {
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleClose();
    await logout();
    navigate('/login');
  };

  const handleSettings = () => {
    handleClose();
    navigate('/settings');
  };

  const handleProfile = () => {
    handleClose();
    navigate('/profile');
  };

  const getInitials = () => {
    if (!user) return '?';
    // Check different possible user object structures
    const firstName = user.profile?.firstName || user.firstName || '';
    const lastName = user.profile?.lastName || user.lastName || '';
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    return user.username ? user.username[0].toUpperCase() : '?';
  };

  if (!user) return null;

  return (
    <>
      <IconButton
        onClick={handleClick}
        size="small"
        sx={{ ml: 2 }}
        aria-controls={open ? 'user-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
      >
        <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main' }}>
          {getInitials()}
        </Avatar>
      </IconButton>
      
      <Menu
        anchorEl={anchorEl}
        id="user-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            minWidth: 280,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {/* User Info */}
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            {user.profile?.firstName || user.firstName || ''} {user.profile?.lastName || user.lastName || ''}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            @{user.username}
          </Typography>
          <Box sx={{ mt: 1 }}>
            <Chip 
              label={user.role} 
              size="small" 
              color={isAdmin() ? 'error' : 'primary'}
              variant="outlined"
            />
            {user.preferences?.showDebugInfo && (
              <Chip 
                label="Debug Mode" 
                size="small" 
                color="warning"
                variant="outlined"
                sx={{ ml: 1 }}
              />
            )}
          </Box>
        </Box>
        
        <Divider />
        
        {/* Menu Items */}
        <MenuItem onClick={handleProfile}>
          <ListItemIcon>
            <Person fontSize="small" />
          </ListItemIcon>
          <ListItemText>My Profile</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={() => {
          handleClose();
          navigate(`/profile/${user.username}`);
        }}>
          <ListItemIcon>
            <Public fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Public Profile</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={() => {
          handleClose();
          navigate('/settings#profile');
        }}>
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Profile</ListItemText>
        </MenuItem>
        
        <Divider />
        
        <MenuItem onClick={handleSettings}>
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          <ListItemText>Settings</ListItemText>
        </MenuItem>
        
        {isAdmin() && (
          <>
            <Divider />
            <MenuItem onClick={() => navigate('/admin')}>
              <ListItemIcon>
                <Security fontSize="small" />
              </ListItemIcon>
              <ListItemText>Admin Panel</ListItemText>
            </MenuItem>
          </>
        )}
        
        <Divider />
        
        {/* API Key Info */}
        {user.apiKey && (
          <Box sx={{ px: 2, py: 1 }}>
            <Typography variant="caption" color="text.secondary" display="block">
              API Key
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Code fontSize="small" sx={{ color: 'text.secondary' }} />
              <Typography 
                variant="caption" 
                sx={{ 
                  fontFamily: 'monospace',
                  bgcolor: 'grey.100',
                  px: 1,
                  py: 0.5,
                  borderRadius: 1
                }}
              >
                {user.apiKey.substring(0, 15)}...
              </Typography>
            </Box>
          </Box>
        )}
        
        <Divider />
        
        <MenuItem onClick={() => navigate('/help')}>
          <ListItemIcon>
            <Help fontSize="small" />
          </ListItemIcon>
          <ListItemText>Help & Support</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          <ListItemText>Logout</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export default UserMenu;