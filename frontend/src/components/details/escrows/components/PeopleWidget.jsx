import React from 'react';
import {
  Box,
  Card,
  Typography,
  Avatar,
  IconButton,
  Chip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Person,
  Phone,
  Add,
  ExpandMore
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';

const CompactCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  padding: theme.spacing(2),
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
  background: 'white',
  height: '100%',
  maxHeight: 400,
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
    transform: 'translateY(-2px)'
  }
}));

const CompactListItem = styled(ListItem)(({ theme }) => ({
  padding: theme.spacing(1, 0),
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    borderRadius: theme.spacing(1),
    padding: theme.spacing(1)
  }
}));

const RoleBadge = styled(Chip)(({ theme }) => ({
  height: 20,
  fontSize: '0.65rem',
  fontWeight: 600
}));

const PeopleWidget = ({ data = {}, expanded, onExpand, onUpdate }) => {
  // Mock contacts - Phase 2 will connect to database
  const contacts = [
    {
      id: 1,
      name: 'John Smith',
      role: 'Buyer',
      phone: '(555) 123-4567',
      email: 'john@example.com',
      color: '#4A90E2'
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      role: 'Seller',
      phone: '(555) 234-5678',
      email: 'sarah@example.com',
      color: '#E24A90'
    },
    {
      id: 3,
      name: 'Mike Chen',
      role: 'Lender',
      phone: '(555) 345-6789',
      email: 'mike@loanbank.com',
      color: '#90E24A'
    },
    {
      id: 4,
      name: 'Lisa Brown',
      role: 'Title Officer',
      phone: '(555) 456-7890',
      email: 'lisa@titleco.com',
      color: '#E2904A'
    }
  ];

  const getRoleColor = (role) => {
    switch (role.toLowerCase()) {
      case 'buyer':
        return 'primary';
      case 'seller':
        return 'secondary';
      case 'lender':
        return 'success';
      case 'title officer':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <CompactCard
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onExpand}
    >
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
        <Box display="flex" alignItems="center" gap={1}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1.5,
              background: 'linear-gradient(135deg, #4A90E2 0%, #5B9FED 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Person sx={{ color: 'white', fontSize: 18 }} />
          </Box>
          <Typography variant="subtitle1" fontWeight="600" color="text.primary">
            People
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={0.5}>
          <Chip
            label={contacts.length}
            size="small"
            sx={{
              height: 22,
              fontSize: '0.75rem',
              fontWeight: 600,
              backgroundColor: 'primary.light',
              color: 'primary.dark'
            }}
          />
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); }}>
            <Add fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* Compact Contact List */}
      <List dense sx={{ flex: 1, overflow: 'auto', py: 0 }}>
        {contacts.map((contact, index) => (
          <React.Fragment key={contact.id}>
            {index > 0 && <Divider variant="inset" component="li" sx={{ ml: 6 }} />}
            <CompactListItem>
              <ListItemAvatar>
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: contact.color,
                    fontSize: '0.875rem',
                    fontWeight: 600
                  }}
                >
                  {getInitials(contact.name)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                    <Typography variant="body2" fontWeight="600" color="text.primary">
                      {contact.name}
                    </Typography>
                    <RoleBadge
                      label={contact.role}
                      size="small"
                      color={getRoleColor(contact.role)}
                    />
                  </Box>
                }
                secondary={
                  <Box display="flex" gap={0.5} alignItems="center" mt={0.5}>
                    <Phone sx={{ fontSize: 12, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">
                      {contact.phone}
                    </Typography>
                  </Box>
                }
              />
            </CompactListItem>
          </React.Fragment>
        ))}
      </List>

      {/* Footer - Click to expand */}
      <Box
        mt={1}
        pt={1}
        borderTop={1}
        borderColor="divider"
        display="flex"
        justifyContent="center"
        alignItems="center"
        gap={0.5}
      >
        <Typography variant="caption" color="text.secondary">
          View All Details
        </Typography>
        <ExpandMore sx={{ fontSize: 16, color: 'text.secondary' }} />
      </Box>
    </CompactCard>
  );
};

export default PeopleWidget;
