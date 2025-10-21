import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  Grid,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  IconButton,
  Chip
} from '@mui/material';
import { Close, Person, PersonAdd, Delete, Link as LinkIcon } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import apiInstance from '../../../../services/api.service';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: theme.spacing(2),
    maxWidth: 600,
    width: '100%',
  },
}));

const Header = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(2, 3),
  background: 'linear-gradient(135deg, #4A90E2 0%, #5B9FED 100%)',
  color: 'white',
}));

const RoleBadge = styled(Chip)(({ theme }) => ({
  fontWeight: 600,
  fontSize: '0.75rem',
}));

/**
 * PeopleDetailModal - Contact editor with linking to contacts table
 * Phase 6: Edit escrow people with ability to link/create contacts
 */
const PeopleDetailModal = ({ open, onClose, escrow, selectedRole, onUpdate }) => {
  const [person, setPerson] = useState({
    contactId: null,
    name: '',
    email: '',
    phone: '',
    company: ''
  });
  const [role, setRole] = useState('buyer');
  const [searchResults, setSearchResults] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [createNewContact, setCreateNewContact] = useState(false);

  useEffect(() => {
    if (escrow?.people && selectedRole) {
      const existingPerson = escrow.people[selectedRole] || {};
      setPerson({
        contactId: existingPerson.contactId || null,
        name: existingPerson.name || '',
        email: existingPerson.email || '',
        phone: existingPerson.phone || '',
        company: existingPerson.company || ''
      });
      setRole(selectedRole);
    }
  }, [escrow, selectedRole]);

  const roles = [
    { value: 'buyer', label: 'Buyer', color: 'primary' },
    { value: 'seller', label: 'Seller', color: 'secondary' },
    { value: 'buyerAgent', label: 'Buyer Agent', color: 'success' },
    { value: 'sellerAgent', label: 'Seller Agent', color: 'warning' },
    { value: 'loanOfficer', label: 'Loan Officer', color: 'info' },
    { value: 'escrowOfficer', label: 'Escrow Officer', color: 'default' },
    { value: 'titleOfficer', label: 'Title Officer', color: 'default' },
    { value: 'homeInspector', label: 'Home Inspector', color: 'default' },
    { value: 'appraiser', label: 'Appraiser', color: 'default' },
    { value: 'transactionCoordinator', label: 'Transaction Coordinator', color: 'default' },
    { value: 'referralAgent', label: 'Referral Agent', color: 'default' }
  ];

  const handleSearchContacts = async (searchTerm) => {
    if (!searchTerm || searchTerm.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      // Search contacts table
      const response = await apiInstance.get(`/contacts/search?q=${encodeURIComponent(searchTerm)}`);
      if (response.data?.success) {
        setSearchResults(response.data.data || []);
      }
    } catch (err) {
      console.error('Error searching contacts:', err);
    }
  };

  const handleLinkContact = (contact) => {
    setPerson({
      contactId: contact.id,
      name: contact.name || `${contact.first_name} ${contact.last_name}`,
      email: contact.email || '',
      phone: contact.phone || '',
      company: contact.company || ''
    });
    setCreateNewContact(false);
  };

  const handleRemoveFromEscrow = async () => {
    if (!escrow?.id || !role) return;

    setSaving(true);
    setError(null);

    try {
      const updatedPeople = { ...escrow.people };
      delete updatedPeople[role];

      const response = await apiInstance.put(`/escrows/${escrow.id}/people`, updatedPeople);

      if (response.data?.success) {
        if (onUpdate) {
          onUpdate({ people: updatedPeople });
        }
        onClose();
      } else {
        setError(response.data?.error?.message || 'Failed to remove contact');
      }
    } catch (err) {
      console.error('Error removing contact:', err);
      setError(err.response?.data?.error?.message || 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    if (!escrow?.id) return;

    // Validation
    if (!person.name) {
      setError('Name is required');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // If creating new contact, add to contacts table first
      let contactId = person.contactId;

      if (createNewContact && !contactId) {
        const contactResponse = await apiInstance.post('/contacts', {
          name: person.name,
          email: person.email,
          phone: person.phone,
          company: person.company,
          type: 'escrow_contact'
        });

        if (contactResponse.data?.success) {
          contactId = contactResponse.data.data.id;
        }
      }

      // Update escrow people
      const updatedPeople = {
        ...escrow.people,
        [role]: {
          contactId: contactId,
          name: person.name,
          email: person.email,
          phone: person.phone,
          company: person.company
        }
      };

      const response = await apiInstance.put(`/escrows/${escrow.id}/people`, updatedPeople);

      if (response.data?.success) {
        if (onUpdate) {
          onUpdate({ people: updatedPeople });
        }
        onClose();
      } else {
        setError(response.data?.error?.message || 'Failed to save contact');
      }
    } catch (err) {
      console.error('Error saving contact:', err);
      setError(err.response?.data?.error?.message || 'An error occurred while saving');
    } finally {
      setSaving(false);
    }
  };

  const getRoleColor = (roleValue) => {
    return roles.find(r => r.value === roleValue)?.color || 'default';
  };

  return (
    <StyledDialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <Header>
        <Box display="flex" alignItems="center" gap={1}>
          <Person />
          <Typography variant="h6" fontWeight="700">
            Edit Contact
          </Typography>
        </Box>
        <Button
          onClick={onClose}
          sx={{ color: 'white', minWidth: 'auto', p: 0.5 }}
        >
          <Close />
        </Button>
      </Header>

      <DialogContent sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Role Selection */}
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Role</InputLabel>
          <Select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            label="Role"
          >
            {roles.map((r) => (
              <MenuItem key={r.value} value={r.value}>
                <Box display="flex" alignItems="center" gap={1}>
                  {r.label}
                  <RoleBadge label={r.label} size="small" color={r.color} />
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Search Existing Contacts */}
        {!person.contactId && (
          <Box sx={{ mb: 2, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="caption" fontWeight="600" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
              LINK TO EXISTING CONTACT
            </Typography>
            <Autocomplete
              freeSolo
              options={searchResults}
              getOptionLabel={(option) => option.name || `${option.first_name} ${option.last_name}`}
              onInputChange={(e, value) => handleSearchContacts(value)}
              onChange={(e, value) => value && handleLinkContact(value)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  size="small"
                  placeholder="Search contacts by name..."
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: <LinkIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              )}
              renderOption={(props, option) => (
                <li {...props}>
                  <Box>
                    <Typography variant="body2" fontWeight="600">
                      {option.name || `${option.first_name} ${option.last_name}`}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {option.email} • {option.phone}
                    </Typography>
                  </Box>
                </li>
              )}
            />
          </Box>
        )}

        {/* Contact Information */}
        <Typography variant="caption" fontWeight="600" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
          CONTACT INFORMATION
        </Typography>

        {person.contactId && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography variant="caption">
                Linked to contact #{person.contactId}
              </Typography>
              <Button
                size="small"
                onClick={() => setPerson({ ...person, contactId: null })}
              >
                Unlink
              </Button>
            </Box>
          </Alert>
        )}

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Name"
              required
              value={person.name}
              onChange={(e) => setPerson({ ...person, name: e.target.value })}
              placeholder="Enter full name"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={person.email}
              onChange={(e) => setPerson({ ...person, email: e.target.value })}
              placeholder="email@example.com"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Phone"
              type="tel"
              value={person.phone}
              onChange={(e) => setPerson({ ...person, phone: e.target.value })}
              placeholder="(555) 123-4567"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Company (optional)"
              value={person.company}
              onChange={(e) => setPerson({ ...person, company: e.target.value })}
              placeholder="Company name"
            />
          </Grid>
        </Grid>

        {!person.contactId && (
          <Box sx={{ mt: 2 }}>
            <Button
              startIcon={<PersonAdd />}
              size="small"
              onClick={() => setCreateNewContact(!createNewContact)}
              variant={createNewContact ? 'contained' : 'outlined'}
            >
              {createNewContact ? 'Creating new contact' : 'Create new contact'}
            </Button>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1, justifyContent: 'space-between' }}>
        <Button
          onClick={handleRemoveFromEscrow}
          color="error"
          startIcon={<Delete />}
          disabled={saving}
        >
          Remove
        </Button>
        <Box display="flex" gap={1}>
          <Button onClick={onClose} variant="outlined" disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Contact'}
          </Button>
        </Box>
      </DialogActions>
    </StyledDialog>
  );
};

export default PeopleDetailModal;
