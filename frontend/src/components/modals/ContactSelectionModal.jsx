import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Box,
  Typography,
  Chip,
  InputAdornment,
  CircularProgress,
  Button,
  DialogActions,
  alpha,
} from '@mui/material';
import { Search, Add, PersonAdd } from '@mui/icons-material';
import { contactsAPI } from '../../services/api.service';
import { NewContactModal } from './NewContactModal';

/**
 * Contact Selection Modal
 * Allows selecting a contact from the database to assign to a role in an escrow
 * @param {boolean} open - Modal open state
 * @param {function} onClose - Close handler
 * @param {function} onSelect - Selection handler (contact) => void
 * @param {string} roleType - Role being assigned (buyer, seller, buyer_agent, etc.)
 * @param {string} currentContactId - Currently selected contact ID
 * @param {object} roleConfig - Color and display config for the role
 */
export const ContactSelectionModal = ({
  open,
  onClose,
  onSelect,
  roleType,
  currentContactId,
  roleConfig = { primary: '#6366f1', secondary: '#8b5cf6' },
}) => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newContactModalOpen, setNewContactModalOpen] = useState(false);

  useEffect(() => {
    if (open) {
      fetchContacts();
    }
  }, [open, roleType]);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      // Fetch all contacts from the API
      const response = await contactsAPI.getAll();

      if (response.success && response.data) {
        let allContacts = response.data;

        // Sort by role type - prioritize contacts matching the role first
        if (roleType) {
          allContacts = allContacts.sort((a, b) => {
            // Convert roleType to match database format (e.g., 'buyerAgent' -> 'agent')
            const targetType = roleType === 'buyerAgent' || roleType === 'sellerAgent' ? 'agent' :
                               roleType === 'escrowOfficer' ? 'title_officer' :
                               roleType === 'loanOfficer' ? 'lender' :
                               roleType;

            const aMatches = a.contact_type === targetType;
            const bMatches = b.contact_type === targetType;

            if (aMatches && !bMatches) return -1;
            if (!aMatches && bMatches) return 1;
            return 0;
          });
        }

        // Normalize the data structure
        const normalizedContacts = allContacts.map(contact => ({
          id: contact.id,
          full_name: contact.full_name || `${contact.first_name || ''} ${contact.last_name || ''}`.trim(),
          email: contact.email,
          phone: contact.phone,
          company_name: contact.company,
          contact_type: contact.contact_type,
          roles: [{ type: contact.contact_type }], // For backwards compatibility
        }));

        setContacts(normalizedContacts);
      } else {
        setContacts([]);
      }
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredContacts = contacts
    .filter((contact) => {
      const query = searchQuery.toLowerCase();
      return (
        contact.full_name?.toLowerCase().includes(query) ||
        contact.email?.toLowerCase().includes(query) ||
        contact.company_name?.toLowerCase().includes(query)
      );
    })
    .slice(0, 5); // Limit to top 5 results

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleLabel = (roleType) => {
    const labels = {
      buyer: 'Buyer',
      seller: 'Seller',
      buyer_agent: 'Buyer Agent',
      listing_agent: 'Listing Agent',
      seller_agent: 'Listing Agent',
      lender: 'Lender',
      escrow_officer: 'Escrow Officer',
    };
    return labels[roleType] || roleType?.replace(/_/g, ' ');
  };

  const getRoleColor = (roleType) => {
    const colors = {
      buyer: { primary: '#10b981', secondary: '#059669' },
      seller: { primary: '#f59e0b', secondary: '#d97706' },
      buyer_agent: { primary: '#3b82f6', secondary: '#2563eb' },
      listing_agent: { primary: '#8b5cf6', secondary: '#7c3aed' },
      seller_agent: { primary: '#8b5cf6', secondary: '#7c3aed' },
      lender: { primary: '#ec4899', secondary: '#db2777' },
      escrow_officer: { primary: '#6366f1', secondary: '#4f46e5' },
    };
    return colors[roleType] || { primary: '#6b7280', secondary: '#4b5563' };
  };

  const handleNewContactSave = async (newContact) => {
    // Close new contact modal
    setNewContactModalOpen(false);

    // Add to contacts list
    setContacts((prev) => [newContact, ...prev]);

    // Auto-select the new contact
    onSelect(newContact);

    // Close selection modal
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonAdd sx={{ color: roleConfig.primary }} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Select {getRoleLabel(roleType)}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          placeholder="Search by name, email, or company..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2, mt: 1 }}
        />

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <List sx={{ maxHeight: 400, overflow: 'auto' }}>
            {filteredContacts.map((contact) => (
              <ListItemButton
                key={contact.id}
                onClick={() => onSelect(contact)}
                selected={contact.id === currentContactId}
                sx={{
                  borderRadius: 2,
                  mb: 1,
                  border: '1px solid',
                  borderColor: contact.id === currentContactId
                    ? roleConfig.primary
                    : 'transparent',
                  '&:hover': {
                    borderColor: roleConfig.primary,
                  },
                }}
              >
                <ListItemAvatar>
                  <Avatar
                    sx={{
                      background: `linear-gradient(135deg, ${roleConfig.primary} 0%, ${roleConfig.secondary} 100%)`,
                      fontWeight: 700,
                    }}
                  >
                    {getInitials(contact.full_name)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {contact.full_name || 'Unnamed Contact'}
                      </Typography>
                      {contact.roles && contact.roles.length > 0 && (
                        <Chip
                          label={getRoleLabel(contact.roles[0].type)}
                          size="small"
                          sx={{
                            height: 22,
                            fontSize: '0.7rem',
                            textTransform: 'capitalize',
                            fontWeight: 600,
                            background: `linear-gradient(135deg, ${getRoleColor(contact.roles[0].type).primary} 0%, ${getRoleColor(contact.roles[0].type).secondary} 100%)`,
                            color: 'white',
                            border: '1px solid rgba(255,255,255,0.3)',
                          }}
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <>
                      {contact.company_name && (
                        <Typography variant="caption" display="block" sx={{ color: 'text.secondary' }}>
                          {contact.company_name}
                        </Typography>
                      )}
                      {contact.email && (
                        <Typography variant="caption" display="block" sx={{ color: 'text.secondary' }}>
                          {contact.email}
                        </Typography>
                      )}
                      {contact.phone && (
                        <Typography variant="caption" display="block" sx={{ color: 'text.secondary' }}>
                          {contact.phone}
                        </Typography>
                      )}
                    </>
                  }
                />
              </ListItemButton>
            ))}

            {/* Add New Contact - 6th item */}
            {searchQuery && (
              <ListItemButton
                onClick={() => setNewContactModalOpen(true)}
                sx={{
                  borderRadius: 2,
                  mb: 1,
                  border: '2px dashed',
                  borderColor: alpha(roleConfig.primary, 0.3),
                  background: alpha(roleConfig.primary, 0.03),
                  '&:hover': {
                    borderColor: roleConfig.primary,
                    background: alpha(roleConfig.primary, 0.08),
                  },
                }}
              >
                <ListItemAvatar>
                  <Avatar
                    sx={{
                      background: `linear-gradient(135deg, ${roleConfig.primary} 0%, ${roleConfig.secondary} 100%)`,
                    }}
                  >
                    <Add />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant="body1" sx={{ fontWeight: 600, color: roleConfig.primary }}>
                      Add New Contact
                    </Typography>
                  }
                  secondary={
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Create a new {getRoleLabel(roleType).toLowerCase()} contact
                    </Typography>
                  }
                />
              </ListItemButton>
            )}

            {filteredContacts.length === 0 && !searchQuery && (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No contacts found
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                  Try adjusting your search or create a new contact
                </Typography>
              </Box>
            )}
          </List>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          startIcon={<Add />}
          onClick={() => setNewContactModalOpen(true)}
          sx={{ mr: 'auto' }}
        >
          Create New
        </Button>
        <Button onClick={onClose}>
          Cancel
        </Button>
      </DialogActions>

      {/* New Contact Modal */}
      <NewContactModal
        open={newContactModalOpen}
        onClose={() => setNewContactModalOpen(false)}
        onSave={handleNewContactSave}
        roleType={roleType}
        roleConfig={roleConfig}
      />
    </Dialog>
  );
};
