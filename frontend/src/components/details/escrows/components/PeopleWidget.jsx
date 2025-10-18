import React, { useState } from 'react';
import {
  Box,
  Card,
  Typography,
  Grid,
  Avatar,
  Chip,
  IconButton,
  Stack,
  Divider,
  Button,
  Tooltip,
  Paper
} from '@mui/material';
import {
  Person,
  Business,
  Phone,
  Email,
  Home,
  Badge,
  AccountBalance,
  Gavel,
  Engineering,
  Assessment,
  Edit,
  Add,
  GroupAdd,
  LocationOn,
  CalendarToday,
  AttachMoney
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';

const WidgetContainer = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  padding: theme.spacing(3),
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  background: 'white',
  position: 'relative',
  overflow: 'visible'
}));

const PersonCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2.5),
  borderRadius: theme.spacing(1.5),
  border: `1px solid ${theme.palette.divider}`,
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    boxShadow: '0 6px 20px rgba(118, 75, 162, 0.15)',
    borderColor: theme.palette.primary.light,
    transform: 'translateY(-2px)'
  }
}));

const RoleChip = styled(Chip)(({ theme, rolecolor }) => ({
  fontWeight: 600,
  fontSize: '0.75rem',
  height: 24,
  backgroundColor: theme.palette[rolecolor]?.[50] || theme.palette.grey[100],
  color: theme.palette[rolecolor]?.main || theme.palette.text.primary,
  '& .MuiChip-icon': {
    fontSize: '1rem',
    color: 'inherit'
  }
}));

const ContactInfo = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  color: theme.palette.text.secondary,
  fontSize: '0.875rem',
  marginTop: theme.spacing(0.5)
}));

const HeaderSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
}));

const PersonSection = ({ title, icon: Icon, people = [], roleColor = 'primary' }) => {
  if (!people || people.length === 0) return null;

  const ensureArray = (data) => {
    if (Array.isArray(data)) return data;
    if (typeof data === 'object' && data !== null) return [data];
    return [];
  };

  const peopleArray = ensureArray(people);

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Icon sx={{ color: `${roleColor}.main`, fontSize: 20 }} />
        <Typography variant="subtitle1" fontWeight={600}>
          {title}
        </Typography>
        <Chip label={peopleArray.length} size="small" sx={{ ml: 'auto' }} />
      </Box>
      <Grid container spacing={2}>
        {peopleArray.map((person, index) => (
          <Grid item xs={12} md={6} key={index}>
            <PersonCard elevation={0}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Avatar
                  sx={{
                    width: 48,
                    height: 48,
                    bgcolor: `${roleColor}.100`,
                    color: `${roleColor}.main`
                  }}
                >
                  {person.name ? person.name.charAt(0).toUpperCase() : <Person />}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body1" fontWeight={600}>
                    {person.name || 'Unknown'}
                  </Typography>
                  {person.company && (
                    <ContactInfo>
                      <Business sx={{ fontSize: 16 }} />
                      <Typography variant="caption">{person.company}</Typography>
                    </ContactInfo>
                  )}
                  {person.phone && (
                    <ContactInfo>
                      <Phone sx={{ fontSize: 16 }} />
                      <Typography variant="caption">{person.phone}</Typography>
                    </ContactInfo>
                  )}
                  {person.email && (
                    <ContactInfo>
                      <Email sx={{ fontSize: 16 }} />
                      <Typography variant="caption">{person.email}</Typography>
                    </ContactInfo>
                  )}
                  {person.license && (
                    <ContactInfo>
                      <Badge sx={{ fontSize: 16 }} />
                      <Typography variant="caption">License: {person.license}</Typography>
                    </ContactInfo>
                  )}
                </Box>
              </Box>
            </PersonCard>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

const PeopleWidget = ({ data = {}, onEdit }) => {
  const [selectedRole, setSelectedRole] = useState('all');

  // Extract people by role
  const buyers = data.buyers || [];
  const sellers = data.sellers || [];
  const agents = data.agents || [];
  const lenders = data.lenders || [];
  const escrowOfficers = data.escrowOfficers || data.escrow_officers || [];
  const titleOfficers = data.titleOfficers || data.title_officers || [];
  const inspectors = data.inspectors || [];
  const appraisers = data.appraisers || [];
  const attorneys = data.attorneys || [];
  const contractors = data.contractors || [];

  // Count total people
  const totalPeople = 
    buyers.length + sellers.length + agents.length + lenders.length +
    escrowOfficers.length + titleOfficers.length + inspectors.length +
    appraisers.length + attorneys.length + contractors.length;

  const roleCategories = [
    { id: 'principals', title: 'Principals', sections: [
      { title: 'Buyers', icon: Person, people: buyers, roleColor: 'primary' },
      { title: 'Sellers', icon: Home, people: sellers, roleColor: 'success' }
    ]},
    { id: 'representatives', title: 'Representatives', sections: [
      { title: 'Agents', icon: Badge, people: agents, roleColor: 'info' },
      { title: 'Attorneys', icon: Gavel, people: attorneys, roleColor: 'error' }
    ]},
    { id: 'financial', title: 'Financial', sections: [
      { title: 'Lenders', icon: AccountBalance, people: lenders, roleColor: 'warning' },
      { title: 'Escrow Officers', icon: Business, people: escrowOfficers, roleColor: 'secondary' },
      { title: 'Title Officers', icon: Gavel, people: titleOfficers, roleColor: 'primary' }
    ]},
    { id: 'services', title: 'Services', sections: [
      { title: 'Inspectors', icon: Assessment, people: inspectors, roleColor: 'info' },
      { title: 'Appraisers', icon: AttachMoney, people: appraisers, roleColor: 'success' },
      { title: 'Contractors', icon: Engineering, people: contractors, roleColor: 'warning' }
    ]}
  ];

  const filteredCategories = selectedRole === 'all' 
    ? roleCategories 
    : roleCategories.filter(cat => cat.id === selectedRole);

  return (
    <WidgetContainer
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <HeaderSection>
        <Box>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            People & Contacts
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {totalPeople} participants in this transaction
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button
            startIcon={<GroupAdd />}
            variant="outlined"
            size="small"
            onClick={() => onEdit?.('people')}
          >
            Add Person
          </Button>
          <IconButton size="small" onClick={() => onEdit?.('people')}>
            <Edit />
          </IconButton>
        </Stack>
      </HeaderSection>

      {/* Role Filter Chips */}
      <Box sx={{ mb: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Chip
          label="All"
          onClick={() => setSelectedRole('all')}
          color={selectedRole === 'all' ? 'primary' : 'default'}
          variant={selectedRole === 'all' ? 'filled' : 'outlined'}
        />
        {roleCategories.map(cat => (
          <Chip
            key={cat.id}
            label={cat.title}
            onClick={() => setSelectedRole(cat.id)}
            color={selectedRole === cat.id ? 'primary' : 'default'}
            variant={selectedRole === cat.id ? 'filled' : 'outlined'}
          />
        ))}
      </Box>

      {/* People Sections */}
      <Stack spacing={4}>
        {filteredCategories.map(category => {
          const hasContent = category.sections.some(section => section.people.length > 0);
          if (!hasContent) return null;

          return (
            <Box key={category.id}>
              <Typography
                variant="overline"
                sx={{
                  color: 'text.secondary',
                  fontWeight: 600,
                  letterSpacing: 1,
                  display: 'block',
                  mb: 2
                }}
              >
                {category.title}
              </Typography>
              <Stack spacing={3}>
                {category.sections.map((section, idx) => (
                  section.people.length > 0 && (
                    <PersonSection
                      key={idx}
                      title={section.title}
                      icon={section.icon}
                      people={section.people}
                      roleColor={section.roleColor}
                    />
                  )
                ))}
              </Stack>
            </Box>
          );
        })}
      </Stack>

      {totalPeople === 0 && (
        <Box
          sx={{
            py: 6,
            textAlign: 'center',
            color: 'text.secondary'
          }}
        >
          <Person sx={{ fontSize: 48, mb: 2, opacity: 0.3 }} />
          <Typography variant="body1">
            No participants added yet
          </Typography>
          <Button
            startIcon={<Add />}
            variant="contained"
            sx={{ mt: 2 }}
            onClick={() => onEdit?.('people')}
          >
            Add First Participant
          </Button>
        </Box>
      )}
    </WidgetContainer>
  );
};

export default PeopleWidget;