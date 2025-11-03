import React, { useState, useEffect } from 'react';
import { Box, Typography, Avatar, Skeleton, Grid, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Users, Phone, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { ContactSelectionModal } from '../../../modals/ContactSelectionModal';
import PeopleModal from '../modals/PeopleModal';
import { escrowsAPI } from '../../../../services/api.service';

// White card with purple icon badge
const WhiteCard = styled(Box)(({ theme }) => ({
  backgroundColor: 'white',
  borderRadius: theme.spacing(2),
  border: '1px solid',
  borderColor: theme.palette.grey[200],
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
  padding: theme.spacing(3),
  height: 380, // Fixed height for 3 rows
  display: 'flex',
  flexDirection: 'column',
  cursor: 'pointer',
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

const ContactCell = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  padding: theme.spacing(1.5),
  borderRadius: theme.spacing(1.5),
  transition: 'all 0.2s',
  border: '1px solid transparent',
  minHeight: 72, // Fixed height for each cell
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
    sellerAgent: 'Listing Agent',
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

const EmptyContactCell = ({ label, onClick }) => (
  <ContactCell
    onClick={(e) => {
      e.stopPropagation(); // Prevent widget modal from opening
      onClick();
    }}
    sx={{
      opacity: 0.6,
      border: '2px dashed',
      borderColor: 'grey.300',
      cursor: 'pointer',
      '&:hover': {
        opacity: 1,
        borderColor: 'primary.main',
        backgroundColor: 'primary.50',
      },
    }}
  >
    <Avatar
      sx={{
        width: 40,
        height: 40,
        bgcolor: 'grey.300',
        fontSize: '0.875rem',
        fontWeight: 700,
      }}
    >
      ?
    </Avatar>
    <Box flex={1} minWidth={0}>
      <Typography
        variant="caption"
        color="text.secondary"
        fontWeight="600"
        textTransform="uppercase"
        sx={{ fontSize: '0.65rem', letterSpacing: 0.5 }}
      >
        {label}
      </Typography>
      <Typography
        variant="body2"
        fontWeight="500"
        color="text.secondary"
        sx={{ lineHeight: 1.3, mt: 0.25, fontStyle: 'italic' }}
        noWrap
      >
        Click to add
      </Typography>
    </Box>
  </ContactCell>
);

const ContactCellFilled = ({ contact, onClick, onRemove }) => (
  <ContactCell
    onClick={(e) => {
      e.stopPropagation(); // Prevent widget modal from opening
      if (onClick) onClick();
    }}
    sx={{ position: 'relative' }}
  >
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

    {/* Remove Button */}
    <IconButton
      size="small"
      onClick={(e) => {
        e.stopPropagation();
        if (onRemove) onRemove();
      }}
      sx={{
        width: 24,
        height: 24,
        position: 'absolute',
        top: 4,
        right: 4,
        opacity: 0.6,
        transition: 'all 0.2s',
        '&:hover': {
          opacity: 1,
          backgroundColor: 'error.light',
          color: 'white',
        },
      }}
    >
      <X size={14} />
    </IconButton>

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
  </ContactCell>
);

const PeopleWidget_White = ({ escrow, loading, onClick, onUpdate }) => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [peopleModalOpen, setPeopleModalOpen] = useState(false);
  const [people, setPeople] = useState({});
  const [loadingPeople, setLoadingPeople] = useState(true);

  // Fetch people from the API when escrow ID changes
  useEffect(() => {
    const fetchPeople = async () => {
      const escrowId = escrow?.details?.id || escrow?.id;

      if (!escrowId) {
        setPeople({});
        setLoadingPeople(false);
        return;
      }

      try {
        setLoadingPeople(true);
        const response = await escrowsAPI.getPeople(escrowId);
        if (response.success) {
          setPeople(response.data || {});
        }
      } catch (error) {
        console.error('Failed to fetch escrow people:', error);
        setPeople({});
      } finally {
        setLoadingPeople(false);
      }
    };

    fetchPeople();
  }, [escrow?.details?.id, escrow?.id]);

  if (loading || loadingPeople) {
    return (
      <WhiteCard>
        <Skeleton width="60%" height={28} sx={{ mb: 2.5 }} />
        <Grid container spacing={2}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Grid item xs={6} key={i}>
              <Skeleton width="100%" height={72} />
            </Grid>
          ))}
        </Grid>
      </WhiteCard>
    );
  }

  // Helper to get contact or null
  const getContact = (role) => {
    const contact = people[role];
    if (contact) {
      return {
        role,
        name: contact.full_name || `${contact.first_name || ''} ${contact.last_name || ''}`.trim(),
        email: contact.email,
        phone: contact.phone || contact.phone_secondary || contact.work_phone,
        company: contact.company,
        color: getColorForRole(role),
        formattedRole: getRoleLabel(role),
      };
    }
    return null;
  };

  // Count total contacts for badge
  const totalContacts = Object.keys(people).length;

  // Handle opening contact selector for a specific role
  const handleAddContact = (role) => {
    setSelectedRole(role);
    setContactModalOpen(true);
  };

  // Handle opening comprehensive people modal
  const handleOpenPeopleModal = () => {
    setPeopleModalOpen(true);
  };

  // Handle adding contact from comprehensive modal
  const handleAddContactFromModal = (role) => {
    // Close people modal
    setPeopleModalOpen(false);
    // Open contact selection for this role
    setSelectedRole(role);
    setContactModalOpen(true);
  };

  // Handle contact selection from modal
  const handleContactSelect = async (contact) => {
    const escrowId = escrow?.details?.id || escrow?.id;

    if (!selectedRole || !escrowId) {
      console.error('Cannot assign contact: missing role or escrow ID', { selectedRole, escrowId });
      return;
    }

    try {
      // Update people via API with contact ID
      const response = await escrowsAPI.updatePeople(escrowId, {
        [selectedRole]: contact.id, // Store contact ID, not inline data
      });

      if (response.success) {
        // Refresh people from API to get full contact objects
        const peopleResponse = await escrowsAPI.getPeople(escrowId);

        if (peopleResponse.success) {
          setPeople(peopleResponse.data || {});
        }

        // Also notify parent if onUpdate exists (for general escrow refresh)
        if (onUpdate) {
          await onUpdate({ people: response.data });
        }
      }
    } catch (error) {
      console.error('Failed to update escrow people:', error);
    }

    // Close modal
    setContactModalOpen(false);
    setSelectedRole(null);
  };

  // Handle removing contact from role
  const handleRemoveContact = async (role) => {
    const escrowId = escrow?.details?.id || escrow?.id;

    if (!role || !escrowId) {
      console.error('Cannot remove contact: missing role or escrow ID', { role, escrowId });
      return;
    }

    try {
      // Update people via API - set role to null to remove
      const response = await escrowsAPI.updatePeople(escrowId, {
        [role]: null, // Remove contact from this role
      });

      if (response.success) {
        // Refresh people from API to get updated objects
        const peopleResponse = await escrowsAPI.getPeople(escrowId);

        if (peopleResponse.success) {
          setPeople(peopleResponse.data || {});
        }

        // Also notify parent if onUpdate exists (for general escrow refresh)
        if (onUpdate) {
          await onUpdate({ people: response.data });
        }
      }
    } catch (error) {
      console.error('Failed to remove contact from escrow:', error);
    }
  };

  // Get role config for modal styling
  const getRoleConfig = (role) => {
    const color = getColorForRole(role);
    return {
      primary: color,
      secondary: color,
    };
  };

  return (
    <>
      <WhiteCard
        component={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        onClick={handleOpenPeopleModal}
      >
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <IconBadge>
              <Users size={18} style={{ color: 'white' }} />
            </IconBadge>
            <Typography variant="subtitle1" fontWeight="700" color="text.primary">
              People
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
            {totalContacts} contacts
          </Box>
        </Box>

        {/* Fixed 3x2 Grid */}
        <Grid container spacing={2}>
          {/* Row 1 */}
          <Grid item xs={6}>
            {getContact('buyer') ? (
              <ContactCellFilled
                contact={getContact('buyer')}
                onClick={() => handleAddContact('buyer')}
                onRemove={() => handleRemoveContact('buyer')}
              />
            ) : (
              <EmptyContactCell
                label="Buyer"
                onClick={() => handleAddContact('buyer')}
              />
            )}
          </Grid>
          <Grid item xs={6}>
            {getContact('seller') ? (
              <ContactCellFilled
                contact={getContact('seller')}
                onClick={() => handleAddContact('seller')}
                onRemove={() => handleRemoveContact('seller')}
              />
            ) : (
              <EmptyContactCell
                label="Seller"
                onClick={() => handleAddContact('seller')}
              />
            )}
          </Grid>

          {/* Row 2 */}
          <Grid item xs={6}>
            {getContact('buyerAgent') ? (
              <ContactCellFilled
                contact={getContact('buyerAgent')}
                onClick={() => handleAddContact('buyerAgent')}
                onRemove={() => handleRemoveContact('buyerAgent')}
              />
            ) : (
              <EmptyContactCell
                label="Buyer Agent"
                onClick={() => handleAddContact('buyerAgent')}
              />
            )}
          </Grid>
          <Grid item xs={6}>
            {getContact('sellerAgent') ? (
              <ContactCellFilled
                contact={getContact('sellerAgent')}
                onClick={() => handleAddContact('sellerAgent')}
                onRemove={() => handleRemoveContact('sellerAgent')}
              />
            ) : (
              <EmptyContactCell
                label="Listing Agent"
                onClick={() => handleAddContact('sellerAgent')}
              />
            )}
          </Grid>

          {/* Row 3 */}
          <Grid item xs={6}>
            {getContact('loanOfficer') ? (
              <ContactCellFilled
                contact={getContact('loanOfficer')}
                onClick={() => handleAddContact('loanOfficer')}
                onRemove={() => handleRemoveContact('loanOfficer')}
              />
            ) : (
              <EmptyContactCell
                label="Lender"
                onClick={() => handleAddContact('loanOfficer')}
              />
            )}
          </Grid>
          <Grid item xs={6}>
            {getContact('escrowOfficer') ? (
              <ContactCellFilled
                contact={getContact('escrowOfficer')}
                onClick={() => handleAddContact('escrowOfficer')}
                onRemove={() => handleRemoveContact('escrowOfficer')}
              />
            ) : (
              <EmptyContactCell
                label="Escrow Officer"
                onClick={() => handleAddContact('escrowOfficer')}
              />
            )}
          </Grid>
        </Grid>
      </WhiteCard>

      {/* Comprehensive People Modal */}
      <PeopleModal
        open={peopleModalOpen}
        onClose={() => setPeopleModalOpen(false)}
        people={people}
        onAddContact={handleAddContactFromModal}
      />

      {/* Contact Selection Modal */}
      {selectedRole && (
        <ContactSelectionModal
          open={contactModalOpen}
          onClose={() => {
            setContactModalOpen(false);
            setSelectedRole(null);
          }}
          onSelect={handleContactSelect}
          roleType={selectedRole}
          currentContactId={people[selectedRole]?.id}
          roleConfig={getRoleConfig(selectedRole)}
        />
      )}
    </>
  );
};

export default PeopleWidget_White;
