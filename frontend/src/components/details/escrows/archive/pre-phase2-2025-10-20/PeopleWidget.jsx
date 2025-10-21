import React from 'react';
import { Box, Card, Typography, Avatar, Skeleton } from '@mui/material';
import { Person, Phone, Email } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { getInitials as getInitialsUtil } from '../../../../utils/formatters';

// Beautiful gradient card showing only 4 key contacts
const CompactCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  padding: theme.spacing(2.5),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  cursor: 'pointer',
  transition: 'all 0.2s',
  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  color: 'white',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
    transform: 'translateY(-4px)',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    bottom: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.1)',
    pointerEvents: 'none',
  },
}));

const ContactBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  padding: theme.spacing(1.5),
  borderRadius: theme.spacing(1.5),
  backgroundColor: 'rgba(255, 255, 255, 0.15)',
  backdropFilter: 'blur(10px)',
  marginBottom: theme.spacing(1.5),
  '&:last-of-type': {
    marginBottom: 0,
  },
}));

const PeopleWidget = ({ escrow, loading, onClick }) => {
  if (loading) {
    return (
      <CompactCard>
        <Skeleton width="60%" height={28} sx={{ mb: 2.5, bgcolor: 'rgba(255,255,255,0.2)' }} />
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} width="100%" height={60} sx={{ mb: 1.5, bgcolor: 'rgba(255,255,255,0.15)' }} />
        ))}
      </CompactCard>
    );
  }

  // FIXED: Use flat database fields instead of nested people object
  // Build contacts from flat database columns
  const allContacts = [];

  if (escrow?.buyer_name) {
    allContacts.push({
      role: 'buyer',
      name: escrow.buyer_name,
      phone: escrow.buyer_phone || '',
      email: escrow.buyer_email || '',
      color: '#4A90E2',
      formattedRole: 'Buyer',
      priority: 1,
    });
  }

  if (escrow?.seller_name) {
    allContacts.push({
      role: 'seller',
      name: escrow.seller_name,
      phone: escrow.seller_phone || '',
      email: escrow.seller_email || '',
      color: '#E24A90',
      formattedRole: 'Seller',
      priority: 2,
    });
  }

  if (escrow?.lender_name) {
    allContacts.push({
      role: 'lender',
      name: escrow.lender_name,
      phone: escrow.lender_phone || '',
      email: escrow.lender_email || '',
      color: '#90E24A',
      formattedRole: 'Lender',
      priority: 3,
    });
  }

  if (escrow?.escrow_company) {
    allContacts.push({
      role: 'escrowOfficer',
      name: escrow.escrow_company,
      phone: escrow.escrow_phone || '',
      email: escrow.escrow_email || '',
      color: '#E2904A',
      formattedRole: 'Escrow Officer',
      priority: 4,
    });
  }

  if (escrow?.title_company) {
    allContacts.push({
      role: 'titleOfficer',
      name: escrow.title_company,
      phone: escrow.title_phone || '',
      email: escrow.title_email || '',
      color: '#4AE290',
      formattedRole: 'Title Officer',
      priority: 5,
    });
  }

  if (escrow?.agent_name) {
    allContacts.push({
      role: 'agent',
      name: escrow.agent_name,
      phone: escrow.agent_phone || '',
      email: escrow.agent_email || '',
      color: '#904AE2',
      formattedRole: 'Agent',
      priority: 6,
    });
  }

  // Show only top 4 contacts
  const topContacts = allContacts.slice(0, 4);

  return (
    <CompactCard
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      onClick={onClick}
    >
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2.5}>
        <Typography variant="h6" fontWeight="700" sx={{ color: 'white' }}>
          People
        </Typography>
        <Box
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            padding: '4px 12px',
            borderRadius: 2,
          }}
        >
          <Typography variant="caption" fontWeight="700">
            {allContacts.length} contacts
          </Typography>
        </Box>
      </Box>

      {/* Top 4 Contacts */}
      <Box flex={1}>
        {topContacts.length > 0 ? (
          topContacts.map((contact, index) => (
            <ContactBox key={index}>
              <Avatar
                sx={{
                  width: 44,
                  height: 44,
                  bgcolor: contact.color,
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                }}
              >
                {getInitialsUtil(contact.name)}
              </Avatar>

              <Box flex={1}>
                <Typography
                  variant="body2"
                  fontWeight="700"
                  sx={{ color: 'white', lineHeight: 1.3 }}
                >
                  {contact.name}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    fontSize: '0.65rem',
                  }}
                >
                  {contact.formattedRole}
                </Typography>
                {contact.phone && (
                  <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                    <Phone sx={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.7)' }} />
                    <Typography
                      variant="caption"
                      sx={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.7rem' }}
                    >
                      {contact.phone}
                    </Typography>
                  </Box>
                )}
              </Box>
            </ContactBox>
          ))
        ) : (
          <Box
            sx={{
              textAlign: 'center',
              py: 4,
              color: 'rgba(255, 255, 255, 0.7)',
            }}
          >
            <Person sx={{ fontSize: 48, opacity: 0.5, mb: 1 }} />
            <Typography variant="body2">No contacts added yet</Typography>
          </Box>
        )}
      </Box>

      {/* Footer */}
      <Box
        mt={2}
        pt={2}
        borderTop="1px solid rgba(255, 255, 255, 0.2)"
        textAlign="center"
      >
        <Typography variant="caption" fontWeight="600" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
          Click to view all {allContacts.length} contacts
        </Typography>
      </Box>
    </CompactCard>
  );
};

export default PeopleWidget;
