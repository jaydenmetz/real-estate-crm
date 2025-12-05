import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Box, Typography, IconButton, TextField, Autocomplete, CircularProgress } from '@mui/material';
import { Check, Close, PersonAdd, Delete } from '@mui/icons-material';
import { ModalContainer as ModalDialog } from '../../../common/modals/ModalContainer';
import { clientsAPI } from '../../../../services/api.service';
import debounce from 'lodash/debounce';
import { NewClientModal } from '../../clients/modals/NewClientModal';

/**
 * EditSellers - Simplified client editor for listings (sellers only)
 * Based on EditClients but without buyer/representation type complexity
 *
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Close handler
 * @param {function} onSave - Save handler (sellers) => void
 * @param {array} value - Array of seller client objects
 * @param {string} color - Theme color (orange for sellers)
 * @param {boolean} inline - Render inline without modal wrapper (for step modals)
 */
export const EditSellers = ({
  open,
  onClose,
  onSave,
  value = [],
  color = '#f97316', // Orange for sellers
  inline = false,
}) => {
  // State for seller clients
  const [sellers, setSellers] = useState([]);
  const [clientSearch, setClientSearch] = useState('');
  const [clientOptions, setClientOptions] = useState([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);

  // State for NewClientModal
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [newClientInitialName, setNewClientInitialName] = useState({ firstName: '', lastName: '' });

  // Ref to track if we've already loaded initial data
  const hasLoadedInitialData = useRef(false);
  const valueRef = useRef(null);

  // Initialize from props when modal opens
  useEffect(() => {
    if (open) {
      setShowSearchInput(false);
    }
  }, [open]);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setSellers([]);
      hasLoadedInitialData.current = false;
    }
  }, [open]);

  // Capture value in ref when it changes
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  // Load sellers when dialog opens
  useEffect(() => {
    const loadSellers = async () => {
      if (!open || hasLoadedInitialData.current) return;

      hasLoadedInitialData.current = true;
      const currentValue = valueRef.current;

      if (currentValue && currentValue.length > 0) {
        try {
          const isFullObject = (item) => item && typeof item === 'object' && (item.firstName || item.first_name || item.name);

          if (isFullObject(currentValue[0])) {
            // Already full objects
            const mappedSellers = currentValue.map(c => ({
              id: c.id || c.client_id,
              firstName: c.firstName || c.first_name || (c.name ? c.name.split(' ')[0] : ''),
              lastName: c.lastName || c.last_name || (c.name ? c.name.split(' ').slice(1).join(' ') : ''),
              email: c.email,
              phone: c.phone,
            }));
            setSellers(mappedSellers);
          } else {
            // Just IDs - fetch from API
            const sellerPromises = currentValue.map(id => clientsAPI.getById(id));
            const results = await Promise.all(sellerPromises);
            const fetchedSellers = results
              .filter(r => r.success && r.data)
              .map(r => ({
                id: r.data.client_id || r.data.id,
                firstName: r.data.first_name,
                lastName: r.data.last_name,
                email: r.data.email,
                phone: r.data.phone,
              }));
            setSellers(fetchedSellers);
          }
        } catch (error) {
          console.error('Error loading sellers:', error);
          setSellers([]);
        }
      }
    };

    loadSellers();
  }, [open]);

  // Auto-save when sellers change in inline mode
  useEffect(() => {
    if (inline && sellers.length >= 0) {
      onSave(sellers);
    }
  }, [sellers, inline, onSave]);

  // Debounced client search
  const searchClientsDebounced = useCallback(
    debounce(async (searchText) => {
      if (!searchText || searchText.length < 1) {
        setLoadingClients(true);
        try {
          const response = await clientsAPI.getAll({
            limit: 50,
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
            phone: client.phone,
          }));

          setClientOptions(transformedClients);
        } catch (error) {
          console.error('Error loading clients:', error);
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
          limit: 50
        });

        const results = response.success && response.data
          ? (response.data.clients || response.data || [])
          : [];

        const transformedClients = results.map(client => ({
          id: client.client_id || client.id,
          firstName: client.first_name,
          lastName: client.last_name,
          email: client.email,
          phone: client.phone,
        }));

        setClientOptions(transformedClients);
      } catch (error) {
        console.error('Error searching clients:', error);
        setClientOptions([]);
      } finally {
        setLoadingClients(false);
      }
    }, 150),
    []
  );

  useEffect(() => {
    searchClientsDebounced(clientSearch);
  }, [clientSearch, searchClientsDebounced]);

  // Handle opening the NewClientModal
  const handleOpenNewClientModal = () => {
    const nameParts = (clientSearch?.trim() || '').split(/\s+/);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    setNewClientInitialName({ firstName, lastName });
    setShowNewClientModal(true);
    setClientSearch('');
    setShowSearchInput(false);
  };

  // Handle when a new client is successfully created
  const handleNewClientCreated = async (clientId) => {
    try {
      const response = await clientsAPI.getById(clientId);
      if (response.success && response.data) {
        const newClient = {
          id: response.data.client_id || response.data.id,
          firstName: response.data.first_name,
          lastName: response.data.last_name,
          email: response.data.email,
          phone: response.data.phone,
        };
        setSellers(prev => [...prev, newClient]);
      }
    } catch (error) {
      console.error('Error fetching newly created client:', error);
    } finally {
      setShowNewClientModal(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(sellers);
      onClose();
    } catch (error) {
      console.error('Failed to save sellers:', error);
    } finally {
      setSaving(false);
    }
  };

  const content = (
    <Box
      onClick={(e) => e.stopPropagation()}
      sx={{
        display: 'flex',
        justifyContent: 'center',
        width: '100%',
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 500 }}>
        {/* Header */}
        <Typography
          variant="caption"
          sx={{
            fontSize: 11,
            fontWeight: 700,
            color: 'rgba(255,255,255,0.7)',
            mb: 1,
            display: 'block',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          Seller{sellers.length !== 1 ? 's' : ''}
        </Typography>

        {/* Sellers List */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {sellers.map((client) => (
            <Box
              key={client.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                bgcolor: 'rgba(255,255,255,0.1)',
                borderRadius: 2,
                px: 2,
                py: 1.5,
              }}
            >
              <Box>
                <Typography variant="body2" fontWeight={600} color="white">
                  {client.firstName} {client.lastName}
                </Typography>
                {client.email && (
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                    {client.email}
                  </Typography>
                )}
              </Box>
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  setSellers(prev => prev.filter(c => c.id !== client.id));
                }}
                size="small"
                sx={{
                  color: 'rgba(255,255,255,0.5)',
                  '&:hover': { color: 'white', bgcolor: 'rgba(255,255,255,0.1)' },
                }}
              >
                <Delete fontSize="small" />
              </IconButton>
            </Box>
          ))}

          {/* Add Seller - Dotted placeholder or search input (max 6 sellers) */}
          {sellers.length < 6 && (showSearchInput ? (
            <Autocomplete
              open
              options={[
                ...clientOptions.filter(opt => !sellers.some(c => c.id === opt.id)).slice(0, 3),
                { id: '__add_new__', isAddNew: true }
              ]}
              loading={loadingClients}
              value={null}
              inputValue={clientSearch}
              onInputChange={(e, value, reason) => {
                if (reason === 'input') setClientSearch(value);
              }}
              getOptionLabel={(option) =>
                option?.isAddNew ? '+ Add New Client' : option ? `${option.firstName} ${option.lastName}${option.email ? ' - ' + option.email : ''}` : ''
              }
              isOptionEqualToValue={(option, value) => option?.id === value?.id}
              onChange={(event, client) => {
                if (!client) return;
                if (client.isAddNew) {
                  handleOpenNewClientModal();
                  return;
                }
                if (!sellers.some(c => c.id === client.id)) {
                  setSellers([...sellers, client]);
                }
                setClientSearch('');
                setShowSearchInput(false);
              }}
              onBlur={() => {
                setTimeout(() => {
                  setShowSearchInput(false);
                  setClientSearch('');
                }, 200);
              }}
              clearOnBlur={false}
              blurOnSelect={true}
              filterOptions={(options) => {
                const filtered = options.filter(opt => !opt.isAddNew);
                const addNew = options.find(opt => opt.isAddNew);
                return addNew ? [...filtered, addNew] : filtered;
              }}
              slotProps={{
                popper: {
                  placement: 'bottom-start',
                  modifiers: [
                    { name: 'flip', options: { fallbackPlacements: ['top-start'] } },
                    { name: 'preventOverflow', options: { boundary: 'viewport', padding: 8 } },
                  ],
                },
                listbox: {
                  sx: { maxHeight: 220 },
                },
              }}
              renderOption={(props, option) => {
                const { key, ...otherProps } = props;
                if (option.isAddNew) {
                  return (
                    <Box
                      component="li"
                      key={key}
                      {...otherProps}
                      sx={{
                        borderTop: '1px solid',
                        borderColor: 'divider',
                        color: 'primary.main',
                        fontWeight: 600,
                        '&:hover': { bgcolor: 'action.hover' },
                      }}
                    >
                      <PersonAdd sx={{ mr: 1, fontSize: 18 }} />
                      <Typography variant="body2" fontWeight={600}>
                        {clientSearch?.trim() ? `Add "${clientSearch.trim()}" as New Client` : 'Add New Client'}
                      </Typography>
                    </Box>
                  );
                }
                return (
                  <Box component="li" key={key} {...otherProps}>
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
                );
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Search clients..."
                  variant="outlined"
                  size="small"
                  autoFocus
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      bgcolor: 'rgba(255,255,255,0.1)',
                      borderRadius: 2,
                      '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                      '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                      '&.Mui-focused fieldset': { borderColor: 'white' },
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
              noOptionsText={loadingClients ? 'Loading...' : 'No clients found'}
            />
          ) : (
            <Box
              onClick={() => setShowSearchInput(true)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                border: '2px dashed rgba(255,255,255,0.3)',
                borderRadius: 2,
                px: 2,
                py: 1.5,
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: 'rgba(255,255,255,0.5)',
                  bgcolor: 'rgba(255,255,255,0.05)',
                },
              }}
            >
              <PersonAdd sx={{ fontSize: 18, color: 'rgba(255,255,255,0.5)' }} />
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>
                Add Seller
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Action Buttons - Only show when NOT inline (modal handles navigation in inline mode) */}
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
              disabled={saving}
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
    </Box>
  );

  // Inline mode: render content directly without modal wrapper
  if (inline) {
    return (
      <>
        {content}
        <NewClientModal
          open={showNewClientModal}
          onClose={() => {
            setShowNewClientModal(false);
            setNewClientInitialName({ firstName: '', lastName: '' });
          }}
          onSuccess={handleNewClientCreated}
          initialData={newClientInitialName}
        />
      </>
    );
  }

  return (
    <>
      <ModalDialog
        open={open}
        onClose={onClose}
        color={color}
        maxWidth={500}
      >
        {content}
      </ModalDialog>
      <NewClientModal
        open={showNewClientModal}
        onClose={() => {
          setShowNewClientModal(false);
          setNewClientInitialName({ firstName: '', lastName: '' });
        }}
        onSuccess={handleNewClientCreated}
        initialData={newClientInitialName}
      />
    </>
  );
};
