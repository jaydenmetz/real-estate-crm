import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Avatar,
  IconButton,
  Divider,
  Button,
  alpha,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { X, Phone, Mail, Building2, Plus, Users, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: theme.spacing(3),
    maxWidth: 1000,
    width: '100%',
    maxHeight: '90vh',
    overflow: 'hidden',
  },
}));

const GradientHeader = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
  padding: theme.spacing(3),
  color: 'white',
  position: 'relative',
}));

const TeamSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
}));

const TeamHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(2),
  paddingBottom: theme.spacing(1.5),
  borderBottom: `2px solid ${theme.palette.grey[200]}`,
}));

const ContactCard = styled(Box)(({ theme, isEmpty }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  padding: theme.spacing(2),
  borderRadius: theme.spacing(2),
  border: isEmpty ? '2px dashed' : '1px solid',
  borderColor: isEmpty ? theme.palette.grey[300] : theme.palette.grey[200],
  backgroundColor: isEmpty ? alpha(theme.palette.primary.main, 0.02) : 'white',
  cursor: 'pointer',
  transition: 'all 0.2s',
  minHeight: 84,
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: isEmpty ? alpha(theme.palette.primary.main, 0.05) : alpha(theme.palette.primary.main, 0.03),
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  },
}));

const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const getColorForRole = (role) => {
  const colors = {
    // Buyer's Team
    buyer: '#10b981',
    buyer2: '#10b981',
    buyer3: '#10b981',
    buyerAgent: '#3b82f6',
    buyerAgent2: '#3b82f6',
    associateBuyerAgent: '#3b82f6',
    buyerBroker: '#1e40af',
    buyerTeamTC: '#059669',
    loanOfficer: '#ec4899',
    loanProcessor: '#db2777',

    // Listing Team
    seller: '#f59e0b',
    listingAgent: '#8b5cf6',
    listingAgent2: '#8b5cf6',
    sellerAgent: '#8b5cf6',
    associateListingAgent: '#7c3aed',
    listingBroker: '#6b21a8',
    listingTeamTC: '#d97706',

    // Vendors
    escrowOfficer: '#6366f1',
    escrowAgent: '#6366f1',
    titleOfficer: '#06b6d4',
    titleAgent: '#06b6d4',
    homeInspector: '#8b5cf6',
    appraiser: '#f97316',
    photographerVideographer: '#14b8a6',
    photographer: '#14b8a6',
    videographer: '#14b8a6',
    stager: '#a855f7',
    contractor: '#ef4444',
    handyman: '#dc2626',
    other: '#6b7280',
  };
  return colors[role] || '#6b7280';
};

const getRoleLabel = (role) => {
  const labels = {
    // Buyer's Team
    buyer: 'Buyer',
    buyer2: 'Buyer 2',
    buyer3: 'Buyer 3',
    buyerAgent: 'Buyer Agent',
    buyerAgent2: 'Buyer Agent 2',
    associateBuyerAgent: 'Associate Buyer Agent',
    buyerBroker: 'Buyer Broker',
    buyerTeamTC: 'Buyer Team / TC',
    loanOfficer: 'Loan Officer',
    loanProcessor: 'Loan Processor',

    // Listing Team
    seller: 'Seller',
    listing: 'Listing',
    listingAgent: 'Listing Agent',
    listingAgent2: 'Listing Agent 2',
    sellerAgent: 'Listing Agent',
    associateListingAgent: 'Associate Listing Agent',
    listingBroker: 'Listing Broker',
    listingTeamTC: 'Listing Team / TC',

    // Vendors
    escrowOfficer: 'Escrow Officer',
    escrowAgent: 'Escrow Agent',
    titleOfficer: 'Title Officer',
    titleAgent: 'Title Agent',
    homeInspector: 'Home Inspector',
    appraiser: 'Appraiser',
    photographerVideographer: 'Photographer/Videographer',
    photographer: 'Photographer',
    videographer: 'Videographer',
    stager: 'Stager',
    contractor: 'Contractor',
    handyman: 'Handyman',
    other: 'Other',
  };
  return labels[role] || role;
};

const EmptyContactCard = ({ role, onAdd }) => (
  <ContactCard
    isEmpty
    component={motion.div}
    whileHover={{ scale: 1.01 }}
    onClick={onAdd}
  >
    <Avatar
      sx={{
        width: 56,
        height: 56,
        bgcolor: alpha(getColorForRole(role), 0.1),
        color: getColorForRole(role),
        border: `2px dashed ${getColorForRole(role)}`,
      }}
    >
      <Plus size={24} />
    </Avatar>
    <Box flex={1}>
      <Typography
        variant="caption"
        color="text.secondary"
        fontWeight="600"
        textTransform="uppercase"
        sx={{ fontSize: '0.65rem', letterSpacing: 0.5, display: 'block', mb: 0.5 }}
      >
        {getRoleLabel(role)}
      </Typography>
      <Typography variant="body2" fontWeight="600" color="primary" sx={{ fontStyle: 'italic' }}>
        Click to add contact
      </Typography>
    </Box>
  </ContactCard>
);

const FilledContactCard = ({ contact, role, onEdit }) => (
  <ContactCard
    component={motion.div}
    whileHover={{ scale: 1.01 }}
    onClick={onEdit}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.2 }}
  >
    <Avatar
      sx={{
        width: 56,
        height: 56,
        bgcolor: getColorForRole(role),
        fontWeight: 700,
        fontSize: '1.1rem',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
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
        sx={{ fontSize: '0.65rem', letterSpacing: 0.5, display: 'block', mb: 0.5 }}
      >
        {getRoleLabel(role)}
      </Typography>
      <Typography variant="body1" fontWeight="700" color="text.primary" noWrap sx={{ mb: 0.5 }}>
        {contact.name}
      </Typography>
      <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
        {contact.phone && (
          <Box display="flex" alignItems="center" gap={0.5}>
            <Phone size={12} style={{ color: '#9ca3af' }} />
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
              {contact.phone}
            </Typography>
          </Box>
        )}
        {contact.email && (
          <Box display="flex" alignItems="center" gap={0.5}>
            <Mail size={12} style={{ color: '#9ca3af' }} />
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }} noWrap>
              {contact.email}
            </Typography>
          </Box>
        )}
      </Box>
      {contact.company && (
        <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
          <Building2 size={12} style={{ color: '#9ca3af' }} />
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }} noWrap>
            {contact.company}
          </Typography>
        </Box>
      )}
    </Box>
  </ContactCard>
);

/**
 * Comprehensive People Modal
 * Displays all contacts organized by teams: Buyer's Team, Listing Team, Vendors
 * @param {boolean} open - Modal open state
 * @param {function} onClose - Close handler
 * @param {object} people - All people data from escrow
 * @param {function} onAddContact - Handler for adding/editing contact (role) => void
 */
export const PeopleModal = ({ open, onClose, people = {}, onAddContact }) => {
  const [buyerTeamMenuAnchor, setBuyerTeamMenuAnchor] = useState(null);
  const [listingTeamMenuAnchor, setListingTeamMenuAnchor] = useState(null);

  // Define core roles (always shown) and additional roles (shown in "Add to Team" menu)
  const BUYERS_TEAM_CORE = ['buyer', 'buyerAgent', 'loanOfficer'];
  const BUYERS_TEAM_ADDITIONAL = [
    'buyer2',
    'buyer3',
    'buyerAgent2',
    'associateBuyerAgent',
    'buyerBroker',
    'buyerTeamTC',
    'loanProcessor',
  ];

  const LISTING_TEAM_CORE = ['seller', 'sellerAgent'];
  const LISTING_TEAM_ADDITIONAL = [
    'listing',
    'listingAgent2',
    'associateListingAgent',
    'listingBroker',
    'listingTeamTC',
  ];

  const VENDORS = [
    'escrowOfficer',
    'escrowAgent',
    'titleOfficer',
    'titleAgent',
    'homeInspector',
    'appraiser',
    'photographer',
    'videographer',
    'photographerVideographer',
    'stager',
    'contractor',
    'handyman',
    'other',
  ];

  // Helper to get contact data
  const getContact = (role) => {
    const contact = people[role];
    if (contact) {
      return {
        role,
        name: contact.full_name || `${contact.first_name || ''} ${contact.last_name || ''}`.trim(),
        email: contact.email,
        phone: contact.phone || contact.phone_secondary || contact.work_phone,
        company: contact.company,
      };
    }
    return null;
  };

  // Get all assigned roles for a team (core + additional)
  const getBuyersTeamRoles = () => {
    const assignedAdditional = BUYERS_TEAM_ADDITIONAL.filter(role => people[role]);
    return [...BUYERS_TEAM_CORE, ...assignedAdditional];
  };

  const getListingTeamRoles = () => {
    const assignedAdditional = LISTING_TEAM_ADDITIONAL.filter(role => people[role]);
    return [...LISTING_TEAM_CORE, ...assignedAdditional];
  };

  // Get available roles for "Add to Team" menu (not already assigned)
  const getAvailableBuyerRoles = () => {
    return BUYERS_TEAM_ADDITIONAL.filter(role => !people[role]);
  };

  const getAvailableListingRoles = () => {
    return LISTING_TEAM_ADDITIONAL.filter(role => !people[role]);
  };

  // Count total contacts
  const totalContacts = Object.keys(people).length;

  const handleAddBuyerRole = (role) => {
    setBuyerTeamMenuAnchor(null);
    onAddContact(role);
  };

  const handleAddListingRole = (role) => {
    setListingTeamMenuAnchor(null);
    onAddContact(role);
  };

  return (
    <StyledDialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      TransitionProps={{
        timeout: 300,
      }}
    >
      {/* Header */}
      <GradientHeader>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={2}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                backgroundColor: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(10px)',
              }}
            >
              <Users size={24} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight="700" sx={{ mb: 0.5 }}>
                Transaction People
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {totalContacts} contact{totalContacts !== 1 ? 's' : ''} assigned
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={onClose}
            sx={{
              color: 'white',
              backgroundColor: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.2)',
              },
            }}
          >
            <X size={20} />
          </IconButton>
        </Box>
      </GradientHeader>

      {/* Content */}
      <DialogContent sx={{ p: 4, maxHeight: 'calc(90vh - 120px)', overflow: 'auto' }}>
        {/* Buyer's Team */}
        <TeamSection>
          <TeamHeader>
            <Box display="flex" alignItems="center" gap={1.5}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
                }}
              />
              <Typography variant="h6" fontWeight="700" color="text.primary">
                Buyer's Team
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={2}>
              <Typography variant="caption" color="text.secondary" fontWeight="600">
                {getBuyersTeamRoles().filter(role => people[role]).length} / {getBuyersTeamRoles().length} assigned
              </Typography>
              {getAvailableBuyerRoles().length > 0 && (
                <Button
                  size="small"
                  startIcon={<UserPlus size={16} />}
                  onClick={(e) => setBuyerTeamMenuAnchor(e.currentTarget)}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                  }}
                >
                  Add to Team
                </Button>
              )}
            </Box>
          </TeamHeader>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: 2,
            }}
          >
            {getBuyersTeamRoles().map((role) => {
              const contact = getContact(role);
              return (
                <Box key={role}>
                  {contact ? (
                    <FilledContactCard
                      contact={contact}
                      role={role}
                      onEdit={() => onAddContact(role)}
                    />
                  ) : (
                    <EmptyContactCard role={role} onAdd={() => onAddContact(role)} />
                  )}
                </Box>
              );
            })}
          </Box>
        </TeamSection>

        {/* Buyer Team Add Menu */}
        <Menu
          anchorEl={buyerTeamMenuAnchor}
          open={Boolean(buyerTeamMenuAnchor)}
          onClose={() => setBuyerTeamMenuAnchor(null)}
          PaperProps={{
            sx: {
              mt: 1,
              minWidth: 220,
              borderRadius: 2,
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            },
          }}
        >
          <Box sx={{ px: 2, py: 1, borderBottom: '1px solid', borderColor: 'grey.200' }}>
            <Typography variant="caption" color="text.secondary" fontWeight="600">
              Add Role to Buyer's Team
            </Typography>
          </Box>
          {getAvailableBuyerRoles().map((role) => (
            <MenuItem
              key={role}
              onClick={() => handleAddBuyerRole(role)}
              sx={{ py: 1.5 }}
            >
              <ListItemIcon>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: getColorForRole(role),
                  }}
                />
              </ListItemIcon>
              <ListItemText
                primary={getRoleLabel(role)}
                primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }}
              />
            </MenuItem>
          ))}
        </Menu>

        <Divider sx={{ my: 4 }} />

        {/* Listing Team */}
        <TeamSection>
          <TeamHeader>
            <Box display="flex" alignItems="center" gap={1.5}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #f59e0b 0%, #8b5cf6 100%)',
                }}
              />
              <Typography variant="h6" fontWeight="700" color="text.primary">
                Listing Team
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={2}>
              <Typography variant="caption" color="text.secondary" fontWeight="600">
                {getListingTeamRoles().filter(role => people[role]).length} / {getListingTeamRoles().length} assigned
              </Typography>
              {getAvailableListingRoles().length > 0 && (
                <Button
                  size="small"
                  startIcon={<UserPlus size={16} />}
                  onClick={(e) => setListingTeamMenuAnchor(e.currentTarget)}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                  }}
                >
                  Add to Team
                </Button>
              )}
            </Box>
          </TeamHeader>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: 2,
            }}
          >
            {getListingTeamRoles().map((role) => {
              const contact = getContact(role);
              return (
                <Box key={role}>
                  {contact ? (
                    <FilledContactCard
                      contact={contact}
                      role={role}
                      onEdit={() => onAddContact(role)}
                    />
                  ) : (
                    <EmptyContactCard role={role} onAdd={() => onAddContact(role)} />
                  )}
                </Box>
              );
            })}
          </Box>
        </TeamSection>

        {/* Listing Team Add Menu */}
        <Menu
          anchorEl={listingTeamMenuAnchor}
          open={Boolean(listingTeamMenuAnchor)}
          onClose={() => setListingTeamMenuAnchor(null)}
          PaperProps={{
            sx: {
              mt: 1,
              minWidth: 220,
              borderRadius: 2,
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            },
          }}
        >
          <Box sx={{ px: 2, py: 1, borderBottom: '1px solid', borderColor: 'grey.200' }}>
            <Typography variant="caption" color="text.secondary" fontWeight="600">
              Add Role to Listing Team
            </Typography>
          </Box>
          {getAvailableListingRoles().map((role) => (
            <MenuItem
              key={role}
              onClick={() => handleAddListingRole(role)}
              sx={{ py: 1.5 }}
            >
              <ListItemIcon>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: getColorForRole(role),
                  }}
                />
              </ListItemIcon>
              <ListItemText
                primary={getRoleLabel(role)}
                primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }}
              />
            </MenuItem>
          ))}
        </Menu>

        <Divider sx={{ my: 4 }} />

        {/* Vendors */}
        <TeamSection>
          <TeamHeader>
            <Box display="flex" alignItems="center" gap={1.5}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                }}
              />
              <Typography variant="h6" fontWeight="700" color="text.primary">
                Vendors & Services
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary" fontWeight="600">
              {VENDORS.filter(role => people[role]).length} / {VENDORS.length} available
            </Typography>
          </TeamHeader>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: 2,
            }}
          >
            {VENDORS.map((role) => {
              const contact = getContact(role);
              return contact ? (
                <Box key={role}>
                  <FilledContactCard
                    contact={contact}
                    role={role}
                    onEdit={() => onAddContact(role)}
                  />
                </Box>
              ) : null;
            })}
            {/* Show empty states for commonly used vendors */}
            {!people.escrowOfficer && (
              <EmptyContactCard role="escrowOfficer" onAdd={() => onAddContact('escrowOfficer')} />
            )}
            {!people.titleOfficer && (
              <EmptyContactCard role="titleOfficer" onAdd={() => onAddContact('titleOfficer')} />
            )}
            {!people.homeInspector && (
              <EmptyContactCard role="homeInspector" onAdd={() => onAddContact('homeInspector')} />
            )}
            {!people.appraiser && (
              <EmptyContactCard role="appraiser" onAdd={() => onAddContact('appraiser')} />
            )}
          </Box>
        </TeamSection>
      </DialogContent>
    </StyledDialog>
  );
};
