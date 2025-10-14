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
} from '@mui/material';
import { Search, Add, PersonAdd } from '@mui/icons-material';
import { contactsAPI } from '../../services/api.service';

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

  useEffect(() => {
    if (open) {
      fetchContacts();
    }
  }, [open, roleType]);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      // TODO: When contacts API is ready, filter by role if provided
      // const params = roleType ? { role: roleType } : {};
      // const response = await contactsAPI.getAll(params);

      // For now, return mock data until contacts table is ready
      const mockContacts = [
        {
          id: '1',
          full_name: 'John Michael Doe',
          email: 'john.doe@email.com',
          phone: '(661) 555-0100',
          company_name: 'ABC Realty',
          roles: [{ type: 'client' }, { type: 'buyer' }],
        },
        {
          id: '2',
          full_name: 'Jane Elizabeth Smith',
          email: 'jane.smith@email.com',
          phone: '(661) 555-0101',
          company_name: 'XYZ Lending',
          roles: [{ type: 'lender' }],
        },
        {
          id: '3',
          full_name: 'Robert Christopher Johnson',
          email: 'robert.j@email.com',
          phone: '(661) 555-0102',
          company_name: 'First American Title',
          roles: [{ type: 'escrow_officer' }],
        },
        {
          id: '4',
          full_name: 'Sarah Williams',
          email: 'sarah.w@coldwell.com',
          phone: '(661) 555-0103',
          company_name: 'Coldwell Banker',
          roles: [{ type: 'listing_agent' }],
        },
        {
          id: '5',
          full_name: 'Michael Davis',
          email: 'michael.d@email.com',
          phone: '(661) 555-0104',
          company_name: null,
          roles: [{ type: 'seller' }],
        },
      ];

      setContacts(mockContacts);
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredContacts = contacts.filter((contact) => {
    const query = searchQuery.toLowerCase();
    return (
      contact.full_name?.toLowerCase().includes(query) ||
      contact.email?.toLowerCase().includes(query) ||
      contact.company_name?.toLowerCase().includes(query)
    );
  });

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
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {contact.full_name || 'Unnamed Contact'}
                      </Typography>
                      {contact.roles && contact.roles.length > 0 && (
                        <Chip
                          label={contact.roles[0].type.replace(/_/g, ' ')}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.7rem',
                            textTransform: 'capitalize',
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
            {filteredContacts.length === 0 && (
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
          onClick={() => {
            // TODO: Open create contact modal
            console.log('Create new contact clicked');
          }}
          sx={{ mr: 'auto' }}
        >
          Create New
        </Button>
        <Button onClick={onClose}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};
