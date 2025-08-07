import React from 'react';
import {
  Box,
  Typography,
  Avatar,
  Chip,
  Grid,
  Paper
} from '@mui/material';
import {
  Person as PersonIcon,
  Business as BusinessIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Groups as GroupsIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Styled components with purple theme
const WidgetCard = styled(Paper)(({ theme }) => ({
  background: 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)',
  borderRadius: theme.spacing(1.5),
  padding: theme.spacing(2),
  border: '1px solid rgba(118, 75, 162, 0.1)',
  boxShadow: '0 2px 8px rgba(118, 75, 162, 0.08)'
}));

const PersonCard = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1),
  background: 'white',
  borderRadius: theme.spacing(1),
  border: '1px solid rgba(118, 75, 162, 0.08)',
  marginBottom: theme.spacing(1),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5)
}));

const RoleLabel = styled(Typography)(({ theme }) => ({
  fontSize: '0.7rem',
  fontWeight: 600,
  color: theme.palette.grey[500],
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  marginBottom: theme.spacing(0.5)
}));

const ContactInfo = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  fontSize: '0.75rem',
  color: theme.palette.grey[600],
  '& .MuiSvgIcon-root': {
    fontSize: '0.875rem'
  }
}));

function PeopleWidgetCompact({ data }) {
  if (!data) data = {};

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const renderPerson = (role, label, person) => {
    const isEmpty = !person || !person.name;
    
    if (isEmpty) return null;

    return (
      <Grid item xs={12} sm={6} md={4} key={role}>
        <RoleLabel>{label}</RoleLabel>
        <PersonCard>
          <Avatar
            sx={{
              width: 32,
              height: 32,
              bgcolor: '#764ba2',
              fontSize: '0.75rem'
            }}
          >
            {getInitials(person.name)}
          </Avatar>
          <Box flex={1} minWidth={0}>
            <Typography variant="body2" fontWeight={500} noWrap>
              {person.name}
            </Typography>
            {person.email && (
              <ContactInfo>
                <EmailIcon />
                <Typography variant="caption" noWrap>{person.email}</Typography>
              </ContactInfo>
            )}
          </Box>
        </PersonCard>
      </Grid>
    );
  };

  const peopleList = [
    { key: 'buyer', label: 'Buyer' },
    { key: 'seller', label: 'Seller' },
    { key: 'buyerAgent', label: 'Buyer Agent' },
    { key: 'sellerAgent', label: 'Listing Agent' },
    { key: 'loanOfficer', label: 'Lender' },
    { key: 'escrowOfficer', label: 'Escrow' }
  ];

  const filledCount = peopleList.filter(p => data[p.key]?.name).length;

  return (
    <WidgetCard elevation={0}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight="600" color="#764ba2">
          People
        </Typography>
        <Chip
          icon={<GroupsIcon />}
          label={`${filledCount}/6`}
          size="small"
          sx={{ 
            bgcolor: 'rgba(118, 75, 162, 0.1)',
            color: '#764ba2'
          }}
        />
      </Box>

      <Grid container spacing={1.5}>
        {peopleList.map(({ key, label }) => 
          renderPerson(key, label, data[key])
        )}
      </Grid>
    </WidgetCard>
  );
}

export default PeopleWidgetCompact;