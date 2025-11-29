import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Autocomplete, TextField, Chip, CircularProgress } from '@mui/material';
import { PersonAdd } from '@mui/icons-material';
import { clientsAPI } from '../../../../services/api.service';
import debounce from 'lodash/debounce';

/**
 * Inline Client Selector
 * Autocomplete search for clients with selected chips
 * Used within EditRepresentationAndClients component
 *
 * @param {array} value - Array of client IDs
 * @param {function} onChange - Callback when clients change (clientIds) => void
 * @param {string} label - Label for the selector (e.g., "Buyer", "Seller", "Buyer(s)")
 */
export const ClientSelector = ({ value = [], onChange, label = 'Client' }) => {
  const [selectedClients, setSelectedClients] = useState([]);
  const [clientSearch, setClientSearch] = useState('');
  const [clientOptions, setClientOptions] = useState([]);
  const [loadingClients, setLoadingClients] = useState(false);

  // Load selected clients when value changes
  useEffect(() => {
    const loadClients = async () => {
      if (!value || value.length === 0) {
        setSelectedClients([]);
        return;
      }

      try {
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
  }, [value]);

  // Debounced client search
  const searchClientsDebounced = useCallback(
    debounce(async (searchText) => {
      if (!searchText || searchText.length < 2) {
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
    if (selectedClients.some(c => c.id === client.id)) return;

    const newClients = [...selectedClients, client];
    setSelectedClients(newClients);
    onChange(newClients.map(c => c.id));
    setClientSearch('');
  };

  const handleRemoveClient = (clientId) => {
    const newClients = selectedClients.filter(c => c.id !== clientId);
    setSelectedClients(newClients);
    onChange(newClients.map(c => c.id));
  };

  return (
    <Box>
      {/* Selected Clients Chips */}
      {selectedClients.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {selectedClients.map((client) => (
            <Chip
              key={client.id}
              label={`${client.firstName} ${client.lastName}`}
              onDelete={() => handleRemoveClient(client.id)}
              sx={{
                backgroundColor: 'rgba(255,255,255,0.15)',
                color: 'white',
                '& .MuiChip-deleteIcon': {
                  color: 'rgba(255,255,255,0.7)',
                  '&:hover': {
                    color: 'white',
                  },
                },
              }}
            />
          ))}
        </Box>
      )}

      {/* Client Autocomplete Search */}
      <Autocomplete
        options={clientOptions.filter(opt => !selectedClients.some(c => c.id === opt.id))}
        loading={loadingClients}
        inputValue={clientSearch}
        onInputChange={(e, value) => setClientSearch(value)}
        getOptionLabel={(option) =>
          `${option.firstName} ${option.lastName}${option.email ? ' - ' + option.email : ''}`
        }
        onChange={handleAddClient}
        filterOptions={(x) => x}
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
            placeholder={`Search ${label.toLowerCase()}...`}
            variant="outlined"
            size="small"
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
              startAdornment: <PersonAdd sx={{ mr: 1, color: 'rgba(255,255,255,0.7)', fontSize: 20 }} />,
              endAdornment: (
                <>
                  {loadingClients ? <CircularProgress color="inherit" size={16} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
        noOptionsText={
          loadingClients ? 'Loading...' : clientSearch.length < 2 ? 'Type to search' : 'No clients found'
        }
      />
    </Box>
  );
};
