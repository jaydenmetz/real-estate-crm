import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  TextField,
  Button,
  Avatar,
  Typography,
  IconButton,
  InputAdornment,
  useTheme,
  alpha,
} from '@mui/material';
import { Search, Close, Add, Remove } from '@mui/icons-material';

/**
 * PeopleEditor - Modal for managing people in a role (similar to BadgeEditor)
 *
 * Features:
 * - Search existing contacts
 * - Add contacts to role
 * - Remove contacts from role
 * - Supports up to 6 people per role
 *
 * @param {boolean} open - Dialog open state
 * @param {Function} onClose - Close handler
 * @param {Function} onSave - Save handler (receives updated people array)
 * @param {string} roleName - Role display name (e.g., "Buyers", "Listing Agent Team")
 * @param {Array} currentPeople - Current people in this role
 * @param {Object} color - Color scheme { primary, secondary }
 * @param {Array} allContacts - All available contacts for search
 * @param {Function} getInitials - Helper to get initials
 */
const PeopleEditor = ({
  open,
  onClose,
  onSave,
  roleName,
  currentPeople = [],
  color,
  allContacts = [],
  getInitials,
}) => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPeople, setSelectedPeople] = useState([]);

  // Initialize with current people when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedPeople([...currentPeople]);
      setSearchQuery('');
    }
  }, [open, currentPeople]);

  // Filter contacts based on search
  const filteredContacts = allContacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Check if contact is already added
  const isAdded = (contactId) =>
    selectedPeople.some((person) => person.id === contactId);

  // Add contact to selected people
  const handleAddPerson = (contact) => {
    if (selectedPeople.length >= 6) {
      return; // Max 6 people
    }
    setSelectedPeople([...selectedPeople, contact]);
  };

  // Remove person from selected people
  const handleRemovePerson = (personId) => {
    setSelectedPeople(selectedPeople.filter((p) => p.id !== personId));
  };

  // Save and close
  const handleSave = () => {
    onSave(selectedPeople);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          maxHeight: '80vh',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 2,
          borderBottom: `2px solid ${alpha(color.primary, 0.1)}`,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 800, color: color.primary }}>
          Manage {roleName}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {/* Search Field */}
        <TextField
          fullWidth
          placeholder="Search contacts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: color.primary }} />
              </InputAdornment>
            ),
          }}
          sx={{
            mb: 3,
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              '&:hover fieldset': {
                borderColor: color.primary,
              },
              '&.Mui-focused fieldset': {
                borderColor: color.primary,
              },
            },
          }}
        />

        {/* Selected People */}
        {selectedPeople.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="overline"
              sx={{ fontSize: 11, fontWeight: 700, color: theme.palette.text.secondary }}
            >
              Selected ({selectedPeople.length}/6)
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
              {selectedPeople.map((person, index) => (
                <Box
                  key={person.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    p: 1.5,
                    borderRadius: 2,
                    background: alpha(color.primary, 0.05),
                    border: `1px solid ${alpha(color.primary, 0.1)}`,
                  }}
                >
                  <Avatar
                    sx={{
                      width: 40,
                      height: 40,
                      background: `linear-gradient(135deg, ${color.primary} 0%, ${color.secondary} 100%)`,
                      fontWeight: 700,
                    }}
                  >
                    {getInitials(person.name)}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {person.name}
                    </Typography>
                    {person.company && (
                      <Typography variant="caption" color="text.secondary">
                        {person.company}
                      </Typography>
                    )}
                  </Box>
                  <IconButton
                    size="small"
                    onClick={() => handleRemovePerson(person.id)}
                    sx={{ color: 'error.main' }}
                  >
                    <Remove />
                  </IconButton>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* Available Contacts */}
        <Box>
          <Typography
            variant="overline"
            sx={{ fontSize: 11, fontWeight: 700, color: theme.palette.text.secondary }}
          >
            Available Contacts
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1, maxHeight: 300, overflowY: 'auto' }}>
            {filteredContacts.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                No contacts found
              </Typography>
            ) : (
              filteredContacts.map((contact) => {
                const added = isAdded(contact.id);
                return (
                  <Box
                    key={contact.id}
                    onClick={() => !added && handleAddPerson(contact)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      p: 1.5,
                      borderRadius: 2,
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      cursor: added ? 'default' : 'pointer',
                      opacity: added ? 0.5 : 1,
                      '&:hover': {
                        background: added ? 'transparent' : alpha(color.primary, 0.03),
                      },
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        background: added
                          ? theme.palette.grey[300]
                          : `linear-gradient(135deg, ${color.primary} 0%, ${color.secondary} 100%)`,
                        fontWeight: 700,
                      }}
                    >
                      {getInitials(contact.name)}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {contact.name}
                      </Typography>
                      {contact.company && (
                        <Typography variant="caption" color="text.secondary">
                          {contact.company}
                        </Typography>
                      )}
                    </Box>
                    {!added && selectedPeople.length < 6 && (
                      <IconButton size="small" sx={{ color: color.primary }}>
                        <Add />
                      </IconButton>
                    )}
                  </Box>
                );
              })
            )}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
        <Button onClick={onClose} sx={{ color: theme.palette.text.secondary }}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          sx={{
            background: `linear-gradient(135deg, ${color.primary} 0%, ${color.secondary} 100%)`,
            fontWeight: 700,
            borderRadius: 2,
            px: 3,
          }}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PeopleEditor;
