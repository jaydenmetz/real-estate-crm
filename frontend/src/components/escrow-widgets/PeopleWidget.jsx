import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Chip,
  Stack,
  IconButton
} from '@mui/material';
import { People, Phone, Email, Business } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const WidgetCard = styled(Card)(({ theme }) => ({
  height: '100%',
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  borderRadius: theme.spacing(2),
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 4px 16px rgba(0,0,0,0.12)'
  }
}));

const ContactCard = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: '#f8f9fa',
  borderRadius: theme.spacing(1.5),
  marginBottom: theme.spacing(1.5),
  '&:last-child': {
    marginBottom: 0
  }
}));

const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name[0].toUpperCase();
};

const PeopleWidget = ({ viewMode = 'medium', data = {} }) => {
  const buyer = data?.buyer || {};
  const seller = data?.seller || {};
  const buyerAgent = data?.buyer_agent || data?.buyerAgent || {};
  const sellerAgent = data?.seller_agent || data?.sellerAgent || {};
  const lender = data?.lender || {};
  const titleCompany = data?.title_company || data?.titleCompany || {};

  const renderContact = (role, contact, showDetails = false) => {
    const name = contact?.name || contact?.contact_name || 'Not specified';
    const phone = contact?.phone || contact?.phone_number;
    const email = contact?.email;
    const company = contact?.company;

    return (
      <ContactCard key={role}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          <Avatar
            sx={{
              bgcolor: '#764ba2',
              width: showDetails ? 48 : 40,
              height: showDetails ? 48 : 40
            }}
          >
            {getInitials(name)}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              {role}
            </Typography>
            <Typography
              variant={showDetails ? 'subtitle1' : 'body2'}
              sx={{ fontWeight: 600, mb: showDetails ? 0.5 : 0 }}
            >
              {name}
            </Typography>

            {showDetails && (
              <>
                {company && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                    <Business sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">
                      {company}
                    </Typography>
                  </Box>
                )}
                {phone && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                    <Phone sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">
                      {phone}
                    </Typography>
                  </Box>
                )}
                {email && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Email sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">
                      {email}
                    </Typography>
                  </Box>
                )}
              </>
            )}
          </Box>
        </Box>
      </ContactCard>
    );
  };

  return (
    <WidgetCard>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <People sx={{ color: '#764ba2' }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            People & Contacts
          </Typography>
        </Box>

        {viewMode === 'small' && (
          <Stack spacing={1}>
            {renderContact('Buyer', buyer)}
            {renderContact('Seller', seller)}
          </Stack>
        )}

        {viewMode === 'medium' && (
          <Stack spacing={1.5}>
            {renderContact('Buyer', buyer, true)}
            {renderContact('Seller', seller, true)}
            {buyerAgent?.name && renderContact("Buyer's Agent", buyerAgent, false)}
            {sellerAgent?.name && renderContact("Seller's Agent", sellerAgent, false)}
          </Stack>
        )}

        {viewMode === 'large' && (
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
              Primary Contacts
            </Typography>
            <Stack spacing={1.5} sx={{ mb: 3 }}>
              {renderContact('Buyer', buyer, true)}
              {renderContact('Seller', seller, true)}
            </Stack>

            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
              Agents
            </Typography>
            <Stack spacing={1.5} sx={{ mb: 3 }}>
              {buyerAgent?.name && renderContact("Buyer's Agent", buyerAgent, true)}
              {sellerAgent?.name && renderContact("Seller's Agent", sellerAgent, true)}
            </Stack>

            {(lender?.name || titleCompany?.name) && (
              <>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
                  Other Parties
                </Typography>
                <Stack spacing={1.5}>
                  {lender?.name && renderContact('Lender', lender, true)}
                  {titleCompany?.name && renderContact('Title Company', titleCompany, true)}
                </Stack>
              </>
            )}
          </Box>
        )}
      </CardContent>
    </WidgetCard>
  );
};

export default PeopleWidget;
