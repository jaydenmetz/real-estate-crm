import React from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Avatar,
  Divider,
} from '@mui/material';
import { Close, Person, Phone, Email as EmailIcon } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import EditableField from '../components/EditableField';
import { getInitials as getInitialsUtil, formatPhone, parsePhone } from '../../../../utils/formatters';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: theme.spacing(2),
    maxWidth: 900,
    width: '100%',
  },
}));

const HeaderGradient = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  color: 'white',
  padding: theme.spacing(3),
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}));

const ContactCard = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2.5),
  borderRadius: theme.spacing(2),
  border: `1px solid ${theme.palette.divider}`,
  marginBottom: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  '&:hover': {
    borderColor: theme.palette.primary.main,
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
  },
}));

const RoleHeader = styled(Box)(({ theme, roleColor }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  marginBottom: theme.spacing(2),
  paddingBottom: theme.spacing(1.5),
  borderBottom: `2px solid ${roleColor}40`,
}));

const FieldRow = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '120px 1fr',
  alignItems: 'center',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(1.5),
  '&:last-child': {
    marginBottom: 0,
  },
}));

const PeopleModal = ({ open, onClose, escrow, onUpdate }) => {
  const people = escrow?.people || {};

  // Define role configuration
  const roles = [
    { key: 'buyer', label: 'Buyer', color: '#4A90E2', icon: Person },
    { key: 'seller', label: 'Seller', color: '#E24A90', icon: Person },
    { key: 'buyerAgent', label: "Buyer's Agent", color: '#1ABC9C', icon: Person },
    { key: 'sellerAgent', label: 'Listing Agent', color: '#E74C3C', icon: Person },
    { key: 'loanOfficer', label: 'Loan Officer', color: '#90E24A', icon: Person },
    { key: 'escrowOfficer', label: 'Escrow Officer', color: '#E2904A', icon: Person },
  ];

  // Handle field update
  const handleUpdateField = async (roleKey, field, value) => {
    if (onUpdate) {
      const roleData = people[roleKey] || {};
      await onUpdate({
        people: {
          ...people,
          [roleKey]: {
            ...roleData,
            [field]: value,
          },
        },
      });
    }
  };

  return (
    <StyledDialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <HeaderGradient>
        <Box>
          <Typography variant="h5" fontWeight="700">
            People & Contacts
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', mt: 0.5 }}>
            Manage all transaction participants
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <Close />
        </IconButton>
      </HeaderGradient>

      <DialogContent sx={{ p: 3 }}>
        <Typography variant="caption" color="text.secondary" fontWeight="600" sx={{ mb: 3, display: 'block' }}>
          Click any field to edit contact information
        </Typography>

        {roles.map((role) => {
          const contact = people[role.key] || {};
          const name = contact.name || '';
          const phone = contact.phone || '';
          const email = contact.email || '';

          return (
            <ContactCard key={role.key}>
              <RoleHeader roleColor={role.color}>
                <Avatar
                  sx={{
                    width: 56,
                    height: 56,
                    bgcolor: role.color,
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  }}
                >
                  {name ? getInitialsUtil(name) : <Person />}
                </Avatar>
                <Box flex={1}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: role.color,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: 1,
                      fontSize: '0.7rem',
                    }}
                  >
                    {role.label}
                  </Typography>
                  <EditableField
                    value={name}
                    onSave={(value) => handleUpdateField(role.key, 'name', value)}
                    type="text"
                    format={(val) => val || ''}
                    displayClass="MuiTypography-root MuiTypography-h6"
                    placeholder="Click to add name"
                    disabled={!onUpdate}
                  />
                </Box>
              </RoleHeader>

              <Box sx={{ pl: 9 }}>
                {/* Phone */}
                <FieldRow>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Phone sx={{ fontSize: 18, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary" fontWeight="600">
                      Phone
                    </Typography>
                  </Box>
                  <EditableField
                    value={phone}
                    onSave={(value) => handleUpdateField(role.key, 'phone', value)}
                    type="text"
                    format={(val) => formatPhone(val) || ''}
                    parse={parsePhone}
                    displayClass="MuiTypography-root MuiTypography-body2"
                    placeholder="Click to add phone"
                    disabled={!onUpdate}
                  />
                </FieldRow>

                {/* Email */}
                <FieldRow>
                  <Box display="flex" alignItems="center" gap={1}>
                    <EmailIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary" fontWeight="600">
                      Email
                    </Typography>
                  </Box>
                  <EditableField
                    value={email}
                    onSave={(value) => handleUpdateField(role.key, 'email', value)}
                    type="text"
                    format={(val) => val || ''}
                    displayClass="MuiTypography-root MuiTypography-body2"
                    placeholder="Click to add email"
                    disabled={!onUpdate}
                  />
                </FieldRow>
              </Box>
            </ContactCard>
          );
        })}

        <Box mt={3} p={2} sx={{ backgroundColor: 'grey.50', borderRadius: 2 }}>
          <Typography variant="caption" color="text.secondary">
            <strong>Tip:</strong> Click any field to edit. Changes are saved automatically when you click away or press Enter.
          </Typography>
        </Box>
      </DialogContent>
    </StyledDialog>
  );
};

export default PeopleModal;
