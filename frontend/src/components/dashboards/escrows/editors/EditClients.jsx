import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, IconButton, List, ListItem, ListItemText, ListItemSecondaryAction, Chip, TextField, Autocomplete, CircularProgress, Button } from '@mui/material';
import { Check, Close, PersonAdd, Delete } from '@mui/icons-material';
import { ModalDialog } from '../../../common/editors/shared/ModalDialog';
import { clientsAPI } from '../../../../services/api.service';
import debounce from 'lodash/debounce';

/**
 * Clients Editor for Escrows
 * Allows adding/removing clients with dynamic labels based on representation type
 *
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Close handler
 * @param {function} onSave - Save handler (clientIds) => void
 * @param {array} value - Array of client IDs
 * @param {string} representationType - 'buyer' | 'seller' | 'dual'
 * @param {string} role - For dual agency: 'buyer' | 'seller'
 * @param {string} color - Theme color
 * @param {boolean} inline - If true, hides action buttons (used in flow contexts)
 */
export const EditClients = ({
  open,
  onClose,
  onSave,
  value = [],
  representationType = 'buyer',
  role, // Only used for dual agency
  color = '#10b981',
  inline = false,
}) => {
  const [selectedClients, setSelectedClients] = useState([]);
  const [clientSearch, setClientSearch] = useState('');
  const [clientOptions, setClientOptions] = useState([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [saving, setSaving] = useState(false);

  // Determine label based on representation type and role
  const getLabel = () => {
    if (representationType === 'dual') {
      return role === 'buyer' ? 'Buyer(s)' : 'Seller(s)';
    }
    return representationType === 'buyer' ? 'Buyer' : 'Seller';
  };

  const label = getLabel();

  // Load selected clients when dialog opens
  useEffect(() => {
    const loadClients = async () => {
      if (!open || !value || value.length === 0) {
        setSelectedClients([]);
        return;
      }

      try {
        // Fetch full client data for selected IDs
        const clientPromises = value.map(id => clientsAPI.getById(id));
        const results = await Promise.all(clientPromises);
        const clients = results
          .filter(r => r.success && r.data)
          .map(r => ({
            id: r.data.client_id || r.data.id,
            firstName: r.data.first_name,
            lastName: r.data.last_name,
            email: r.data.email,
          }));
        setSelectedClients(clients);
      } catch (error) {
        console.error('Error loading clients:', error);
        setSelectedClients([]);
      }
    };

    loadClients();
  }, [open, value]);

  // Debounced client search
  const searchClientsDebounced = useCallback(
    debounce(async (searchText) => {
      if (!searchText || searchText.length < 2) {
        // Load recent clients
        setLoadingClients(true);
        try {
          const response = await clientsAPI.getAll({
            limit: 5,
            sortBy: 'created_at',
            sortOrder: 'desc'
          });

          const results = response.success && response.data
            ? (response.data.clients || response.data || [])
            : [];

          const transformedClients = results.map(client => ({
            id: client.client_id || client.id,
            firstName: client.first_name,
            lastName: client.last_name,
            email: client.email,
          }));

          setClientOptions(transformedClients);
        } catch (error) {
          console.error('Error loading recent clients:', error);
          setClientOptions([]);
        } finally {
          setLoadingClients(false);
        }
        return;
      }

      setLoadingClients(true);
      try {
        const response = await clientsAPI.getAll({
          search: searchText,
          limit: 10
        });

        const results = response.success && response.data
          ? (response.data.clients || response.data || [])
          : [];

        const transformedClients = results.map(client => ({
          id: client.client_id || client.id,
          firstName: client.first_name,
          lastName: client.last_name,
          email: client.email,
        }));

        setClientOptions(transformedClients);
      } catch (error) {
        console.error('Error searching clients:', error);
        setClientOptions([]);
      } finally {
        setLoadingClients(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    searchClientsDebounced(clientSearch);
  }, [clientSearch, searchClientsDebounced]);

  const handleAddClient = (event, client) => {
    if (!client) return;

    // Check if already selected
    if (selectedClients.some(c => c.id === client.id)) return;

    setSelectedClients([...selectedClients, client]);
    setClientSearch('');
  };

  const handleRemoveClient = (clientId) => {
    setSelectedClients(selectedClients.filter(c => c.id !== clientId));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const clientIds = selectedClients.map(c => c.id);
      await onSave(clientIds);
      onClose();
    } catch (error) {
      console.error('Failed to save clients:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && selectedClients.length > 0) {
      handleSave();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  // Render content
  const content = (
    <Box onClick={(e) => e.stopPropagation()} onKeyDown={handleKeyPress}>
        {/* Label */}
        <Typography
          variant="caption"
          sx={{
            fontSize: 12,
            fontWeight: 700,
            color: 'rgba(255,255,255,0.9)',
            mb: 1,
            display: 'block',
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}
        >
          {label}
        </Typography>

        {/* Title - Hide in inline mode */}
        {!inline && (
          <Typography
            variant="h4"
            sx={{
              fontWeight: 900,
              color: 'white',
              mb: 3,
              letterSpacing: '-1px',
            }}
          >
            {selectedClients.length === 0
              ? `Add ${label}`
              : `${selectedClients.length} Selected`
            }
          </Typography>
        )}

        {/* Selected Clients List */}
        {selectedClients.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <List sx={{ bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2, py: 0 }}>
              {selectedClients.map((client, index) => (
                <ListItem
                  key={client.id}
                  sx={{
                    borderBottom: index < selectedClients.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none',
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography variant="body1" fontWeight={600} color="white">
                        {client.firstName} {client.lastName}
                      </Typography>
                    }
                    secondary={
                      client.email && (
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                          {client.email}
                        </Typography>
                      )
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      onClick={() => handleRemoveClient(client.id)}
                      size="small"
                      sx={{
                        color: 'rgba(255,255,255,0.7)',
                        '&:hover': {
                          color: 'white',
                          bgcolor: 'rgba(255,255,255,0.1)',
                        },
                      }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {/* Client Search/Add */}
        <Autocomplete
          options={clientOptions.filter(opt => !selectedClients.some(c => c.id === opt.id))}
          loading={loadingClients}
          inputValue={clientSearch}
          onInputChange={(e, value) => setClientSearch(value)}
          getOptionLabel={(option) =>
            `${option.firstName} ${option.lastName}${option.email ? ' - ' + option.email : ''}`
          }
          onChange={handleAddClient}
          filterOptions={(x) => x} // No local filtering - backend handles it
          renderOption={(props, option) => (
            <Box component="li" {...props}>
              <Box>
                <Typography variant="body2" fontWeight={600}>
                  {option.firstName} {option.lastName}
                </Typography>
                {option.email && (
                  <Typography variant="caption" color="text.secondary">
                    {option.email}
                  </Typography>
                )}
              </Box>
            </Box>
          )}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder={`Search or add ${label.toLowerCase()}...`}
              variant="outlined"
              autoFocus
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': {
                    borderColor: 'rgba(255,255,255,0.3)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255,255,255,0.5)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'white',
                  },
                },
                '& .MuiInputBase-input::placeholder': {
                  color: 'rgba(255,255,255,0.5)',
                  opacity: 1,
                },
              }}
              InputProps={{
                ...params.InputProps,
                startAdornment: <PersonAdd sx={{ mr: 1, color: 'rgba(255,255,255,0.7)' }} />,
                endAdornment: (
                  <>
                    {loadingClients ? <CircularProgress color="inherit" size={20} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
          noOptionsText={
            loadingClients ? 'Loading...' : clientSearch.length < 2 ? 'Type to search clients' : 'No clients found'
          }
        />

        {/* Action Buttons - Only show in standalone mode (not inline) */}
        {!inline && (
          <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'flex-end' }}>
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              disabled={saving}
              sx={{
                width: 48,
                height: 48,
                backgroundColor: 'rgba(255,255,255,0.15)',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.25)',
                },
                '&:disabled': {
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  color: 'rgba(255,255,255,0.3)',
                },
              }}
            >
              <Close />
            </IconButton>
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                handleSave();
              }}
              disabled={saving || selectedClients.length === 0}
              sx={{
                width: 48,
                height: 48,
                backgroundColor: 'white',
                color: color,
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.9)',
                },
                '&:disabled': {
                  backgroundColor: 'rgba(255,255,255,0.3)',
                  color: 'rgba(0,0,0,0.2)',
                },
              }}
            >
              <Check />
            </IconButton>
          </Box>
        )}
    </Box>
  );

  // Render with or without modal wrapper based on inline prop
  if (inline) {
    return content;
  }

  return (
    <ModalDialog open={open} onClose={onClose} color={color} maxWidth={500} hideBackdrop={false}>
      {content}
    </ModalDialog>
  );
};
