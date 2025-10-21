import React from 'react';
import { Box, Typography, Avatar, Skeleton } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Users, Phone } from 'lucide-react';
import { motion } from 'framer-motion';

// White card with purple icon badge
const WhiteCard = styled(Box)(({ theme }) => ({
  backgroundColor: 'white',
  borderRadius: theme.spacing(2),
  border: '1px solid',
  borderColor: theme.palette.grey[200],
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
  padding: theme.spacing(3),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  cursor: 'pointer',
  overflow: 'hidden', // Prevent content overflow
  transition: 'all 0.2s',
  '&:hover': {
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
    transform: 'translateY(-2px)',
  },
}));

const IconBadge = styled(Box)(({ theme }) => ({
  width: 32,
  height: 32,
  borderRadius: theme.spacing(1.5),
  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
}));

const ContactRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  padding: theme.spacing(1.5),
  borderRadius: theme.spacing(1.5),
  transition: 'all 0.2s',
  border: '1px solid transparent',
  '&:hover': {
    backgroundColor: theme.palette.grey[50],
    borderColor: theme.palette.grey[200],
  },
}));

const getColorForRole = (role) => {
  const colors = {
    buyer: '#4A90E2',
    seller: '#E24A90',
    buyerAgent: '#904AE2',
    sellerAgent: '#E2904A',
    loanOfficer: '#90E24A',
    escrowOfficer: '#4AE290',
    titleOfficer: '#E2904A',
    homeInspector: '#4A90E2',
  };
  return colors[role] || '#9e9e9e';
};

const getRoleLabel = (role) => {
  const labels = {
    buyer: 'Buyer',
    seller: 'Seller',
    buyerAgent: 'Buyer Agent',
    sellerAgent: 'Seller Agent',
    loanOfficer: 'Lender',
    escrowOfficer: 'Escrow Officer',
    titleOfficer: 'Title Officer',
    homeInspector: 'Inspector',
  };
  return labels[role] || role;
};

const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const PeopleWidget_White = ({ escrow, loading, onClick }) => {
  if (loading) {
    return (
      <WhiteCard>
        <Skeleton width="60%" height={28} sx={{ mb: 2.5 }} />
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} width="100%" height={60} sx={{ mb: 1.5 }} />
        ))}
      </WhiteCard>
    );
  }

  // Get people from JSONB structure
  const people = escrow?.people || {};

  // Build contacts array
  const allContacts = [];

  Object.keys(people).forEach(role => {
    if (people[role]?.name) {
      allContacts.push({
        role,
        ...people[role],
        color: getColorForRole(role),
        formattedRole: getRoleLabel(role),
      });
    }
  });

  // Show only top 4 contacts
  const topContacts = allContacts.slice(0, 4);

  return (
    <WhiteCard
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      onClick={onClick}
    >
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <IconBadge>
            <Users size={18} style={{ color: 'white' }} />
          </IconBadge>
          <Typography variant="subtitle1" fontWeight="700" color="text.primary">
            Key People
          </Typography>
        </Box>
        <Box
          sx={{
            backgroundColor: '#F3E8FF',
            color: '#9333ea',
            padding: '4px 12px',
            borderRadius: 2,
            fontSize: '0.75rem',
            fontWeight: 700,
          }}
        >
          {allContacts.length} contacts
        </Box>
      </Box>

      {/* Contacts */}
      <Box flex={1}>
        {topContacts.length > 0 ? (
          topContacts.map((contact, idx) => (
            <ContactRow key={idx}>
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: contact.color,
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
              >
                {getInitials(contact.name)}
              </Avatar>

              <Box flex={1} minWidth={0}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight="600"
                  textTransform="uppercase"
                  sx={{ fontSize: '0.65rem', letterSpacing: 0.5 }}
                >
                  {contact.formattedRole}
                </Typography>
                <Typography
                  variant="body2"
                  fontWeight="700"
                  color="text.primary"
                  sx={{ lineHeight: 1.3, mt: 0.25 }}
                  noWrap
                >
                  {contact.name}
                </Typography>
              </Box>

              {contact.phone && (
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    backgroundColor: 'grey.100',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                    '&:hover': {
                      backgroundColor: 'grey.200',
                    },
                  }}
                >
                  <Phone size={14} style={{ color: '#666' }} />
                </Box>
              )}
            </ContactRow>
          ))
        ) : (
          <Box textAlign="center" py={4}>
            <Users size={32} style={{ color: '#ccc', marginBottom: 8 }} />
            <Typography variant="body2" color="text.secondary">
              No contacts added yet
            </Typography>
          </Box>
        )}
      </Box>

      {/* Footer */}
      <Box
        mt={2}
        pt={2}
        borderTop={1}
        borderColor="divider"
        textAlign="center"
      >
        <Typography variant="caption" color="text.secondary" sx={{ '&:hover': { color: 'secondary.main' } }}>
          Click to view all {allContacts.length} contacts →
        </Typography>
      </Box>
    </WhiteCard>
  );
};

export default PeopleWidget_White;
