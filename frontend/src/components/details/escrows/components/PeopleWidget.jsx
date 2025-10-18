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
  Divider,
  Skeleton
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

const PeopleWidget = ({ escrow, loading, onClick }) => {
  // Extract people data (supports both formats)
  const people = escrow?.people || {};

  // Map people object to contacts array
  const contacts = Object.entries(people)
    .filter(([role, person]) => person && (person.name || person.contactId))
    .map(([role, person], index) => ({
      id: person.contactId || `temp-${index}`,
      name: person.name || 'Unknown',
      role: formatRole(role),
      phone: person.phone || '',
      email: person.email || '',
      color: getRoleColorHex(role)
    }));

  function formatRole(roleKey) {
    const roleMap = {
      buyer: 'Buyer',
      buyerAgent: 'Buyer Agent',
      seller: 'Seller',
      sellerAgent: 'Seller Agent',
      escrowOfficer: 'Escrow Officer',
      titleOfficer: 'Title Officer',
      loanOfficer: 'Loan Officer',
      homeInspector: 'Inspector',
      appraiser: 'Appraiser',
      transactionCoordinator: 'TC',
      referralAgent: 'Referral'
    };
    return roleMap[roleKey] || roleKey;
  }

  function getRoleColorHex(role) {
    const colorMap = {
      buyer: '#4A90E2',
      seller: '#E24A90',
      loanOfficer: '#90E24A',
      escrowOfficer: '#E2904A',
      titleOfficer: '#9B59B6',
      homeInspector: '#3498DB',
      buyerAgent: '#1ABC9C',
      sellerAgent: '#E74C3C',
      appraiser: '#F39C12',
      transactionCoordinator: '#34495E',
      referralAgent: '#16A085'
    };
    return colorMap[role] || '#95A5A6';
  }

  const getRoleColor = (role) => {
    if (!role) return 'default';
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

  if (loading) {
    return (
      <CompactCard>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
          <Skeleton width="30%" height={24} />
          <Skeleton width="15%" height={22} />
        </Box>
        {[1, 2, 3, 4].map((i) => (
          <Box key={i} display="flex" alignItems="center" gap={1} mb={1.5}>
            <Skeleton variant="circular" width={36} height={36} />
            <Box flex={1}>
              <Skeleton width="60%" height={18} />
              <Skeleton width="40%" height={14} sx={{ mt: 0.5 }} />
            </Box>
          </Box>
        ))}
      </CompactCard>
    );
  }

  return (
    <CompactCard
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      onClick={onClick}
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
