import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Box, Typography, IconButton, List, ListItem, ListItemText, ListItemSecondaryAction, Chip, TextField, Autocomplete, CircularProgress, Button, ToggleButtonGroup, ToggleButton, Divider } from '@mui/material';
import { Check, Close, PersonAdd, Delete, Person, Home, Group } from '@mui/icons-material';
import { ModalContainer as ModalDialog } from '../../../common/modals/ModalContainer';
import { clientsAPI } from '../../../../services/api.service';
import debounce from 'lodash/debounce';

/**
 * Unified Clients Editor for Escrows
 * Handles three modes:
 * 1. Combined Mode (showRepresentationType=true): Shows representation type selector + client fields
 * 2. Role-Specific Mode (role prop): Shows client selector for specific role (buyer/seller)
 * 3. Standalone Mode: Shows client selector based on representation type
 *
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Close handler
 * @param {function} onSave - Save handler (clientIds) => void OR ({ buyerClients, sellerClients, representationType }) => void
 * @param {array} value - Array of client IDs (for role-specific mode)
 * @param {object} values - Object with buyerClients, sellerClients, representationType (for combined mode)
 * @param {string} representationType - 'buyer' | 'seller' | 'dual' (for standalone/role mode)
 * @param {string} role - For dual agency: 'buyer' | 'seller' (for role-specific mode)
 * @param {string} color - Theme color
 * @param {boolean} inline - If true, hides action buttons (used in flow contexts)
 * @param {boolean} showRepresentationType - If true, shows representation type selector (combined mode)
 * @param {function} onRepresentationTypeChange - Callback for representation type changes (combined mode)
 */
export const EditClients = ({
  open,
  onClose,
  onSave,
  value = [],
  values, // For combined mode: { buyerClients, sellerClients, representationType }
  representationType = 'buyer',
  role, // Only used for dual agency role-specific mode
  color = '#10b981',
  inline = false,
  showRepresentationType = false,
  onRepresentationTypeChange,
}) => {
  // State for combined mode (representation type + clients)
  const [selectedType, setSelectedType] = useState(representationType);

  // State for client selection
  const [buyerClients, setBuyerClients] = useState([]);
  const [sellerClients, setSellerClients] = useState([]);
  const [selectedClients, setSelectedClients] = useState([]);
  const [clientSearch, setClientSearch] = useState('');
  const [clientOptions, setClientOptions] = useState([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [saving, setSaving] = useState(false);

  // Ref to track if we've already loaded initial data (prevents resetting on parent re-renders)
  const hasLoadedInitialData = useRef(false);
  // Refs to capture values/value at the time modal opens (prevents stale closure issues)
  const valuesRef = useRef(null);
  const valueRef = useRef(null);

  // Initialize from props - only when modal opens (not on every values change)
  // This prevents the local state from being reset when parent re-renders
  useEffect(() => {
    if (open) {
      if (showRepresentationType && values) {
        setSelectedType(values.representationType || 'buyer');
        // Note: buyerClients/sellerClients are loaded in the loadClients useEffect below
      } else {
        setSelectedType(representationType);
      }
    }
  }, [open]); // Only depend on 'open' to prevent resetting on parent re-renders

  // Determine label based on mode
  const getLabel = () => {
    if (showRepresentationType) {
      // Combined mode - labels determined by selectedType
      if (selectedType === 'dual') {
        return role === 'buyer' ? 'Buyer(s)' : 'Seller(s)';
      }
      return selectedType === 'buyer' ? 'Buyer' : 'Seller';
    }

    // Role-specific or standalone mode
    if (representationType === 'dual' && role) {
      return role === 'buyer' ? 'Buyer(s)' : 'Seller(s)';
    }
    return representationType === 'buyer' ? 'Buyer' : 'Seller';
  };

  const label = getLabel();

  // Handle representation type change (combined mode)
  const handleTypeChange = (event, newType) => {
    if (newType !== null) {
      setSelectedType(newType);
      if (onRepresentationTypeChange) {
        onRepresentationTypeChange(newType);
      }
    }
  };

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      // Reset state when modal closes
      setSelectedClients([]);
      setBuyerClients([]);
      setSellerClients([]);
      hasLoadedInitialData.current = false;
    }
  }, [open]);

  // Capture values/value in refs when they change (so the load effect can access them)
  useEffect(() => {
    valuesRef.current = values;
    valueRef.current = value;
  }, [values, value]);

  // Load selected clients when dialog opens (separate effect to avoid infinite loop)
  useEffect(() => {
    const loadClients = async () => {
      // Only run when modal is open and we haven't loaded yet
      if (!open || hasLoadedInitialData.current) {
        return;
      }

      // Mark as loaded immediately to prevent re-runs
      hasLoadedInitialData.current = true;

      // Use refs to get the current values (captured above)
      const currentValues = valuesRef.current;
      const currentValue = valueRef.current;

      if (showRepresentationType && currentValues) {
        // Combined mode: Load buyer and seller clients
        try {
          const buyerData = currentValues.buyerClients || [];
          const sellerData = currentValues.sellerClients || [];

          // Check if buyerData/sellerData are full client objects or just IDs
          const isFullObject = (item) => item && typeof item === 'object' && (item.firstName || item.first_name);

          if (buyerData.length > 0) {
            if (isFullObject(buyerData[0])) {
              // Already full objects - use directly
              setBuyerClients(buyerData.map(c => ({
                id: c.id || c.client_id,
                firstName: c.firstName || c.first_name,
                lastName: c.lastName || c.last_name,
                email: c.email,
              })));
            } else {
              // Just IDs - fetch from API
              const buyerPromises = buyerData.map(id => clientsAPI.getById(id));
              const buyerResults = await Promise.all(buyerPromises);
              const buyers = buyerResults
                .filter(r => r.success && r.data)
                .map(r => ({
                  id: r.data.client_id || r.data.id,
                  firstName: r.data.first_name,
                  lastName: r.data.last_name,
                  email: r.data.email,
                }));
              setBuyerClients(buyers);
            }
          }

          if (sellerData.length > 0) {
            if (isFullObject(sellerData[0])) {
              // Already full objects - use directly
              setSellerClients(sellerData.map(c => ({
                id: c.id || c.client_id,
                firstName: c.firstName || c.first_name,
                lastName: c.lastName || c.last_name,
                email: c.email,
              })));
            } else {
              // Just IDs - fetch from API
              const sellerPromises = sellerData.map(id => clientsAPI.getById(id));
              const sellerResults = await Promise.all(sellerPromises);
              const sellers = sellerResults
                .filter(r => r.success && r.data)
                .map(r => ({
                  id: r.data.client_id || r.data.id,
                  firstName: r.data.first_name,
                  lastName: r.data.last_name,
                  email: r.data.email,
                }));
              setSellerClients(sellers);
            }
          }
        } catch (error) {
          console.error('Error loading clients:', error);
          setBuyerClients([]);
          setSellerClients([]);
        }
      } else if (currentValue && currentValue.length > 0) {
        // Role-specific or standalone mode: Load single client list
        try {
          // Check if value contains full objects or just IDs
          const isFullObject = (item) => item && typeof item === 'object' && (item.firstName || item.first_name);

          if (isFullObject(currentValue[0])) {
            // Already full objects - use directly
            const mappedClients = currentValue.map(c => ({
              id: c.id || c.client_id,
              firstName: c.firstName || c.first_name,
              lastName: c.lastName || c.last_name,
              email: c.email,
            }));
            setSelectedClients(mappedClients);
          } else {
            // Just IDs - fetch from API
            const clientPromises = currentValue.map(id => clientsAPI.getById(id));
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
          }
        } catch (error) {
          console.error('Error loading clients:', error);
          setSelectedClients([]);
        }
      }
    };

    loadClients();
  }, [open, showRepresentationType]); // values/value are captured via refs

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
    setSelectedClients(prev => prev.filter(c => c.id !== clientId));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (showRepresentationType) {
        // Combined mode: Save all data together with full client objects
        await onSave({
          buyerClients: buyerClients, // Send full client objects, not just IDs
          sellerClients: sellerClients, // Send full client objects, not just IDs
          representationType: selectedType,
        });
      } else {
        // Role-specific or standalone mode: Return proper structure based on representation type
        // CardTemplate expects { buyers: [...], sellers: [...] } structure
        const clientsData = {
          buyers: representationType === 'buyer' || representationType === 'dual' ? selectedClients : [],
          sellers: representationType === 'seller' || representationType === 'dual' ? selectedClients : [],
        };

        // If dual representation is passed via editorProps, use buyerClients/sellerClients
        if (representationType === 'dual' && (buyerClients.length > 0 || sellerClients.length > 0)) {
          clientsData.buyers = buyerClients;
          clientsData.sellers = sellerClients;
        }

        await onSave(clientsData);
      }
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

  // Render client selector for a specific role
  const renderClientSelector = (currentRole) => {
    const roleLabel = currentRole === 'buyer' ? 'Buyer(s)' : 'Seller(s)';
    const roleClients = currentRole === 'buyer' ? buyerClients : sellerClients;
    const roleColor = currentRole === 'buyer' ? '#10b981' : '#f59e0b';

    return (
      <Box key={currentRole}>
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
          {roleLabel}
        </Typography>

        {/* Selected Clients List */}
        {roleClients.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <List sx={{ bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2, py: 0 }}>
              {roleClients.map((client, index) => (
                <ListItem
                  key={client.id}
                  sx={{
                    borderBottom: index < roleClients.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none',
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
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      const clientIdToRemove = client.id;
                      if (currentRole === 'buyer') {
                        setBuyerClients(prev => prev.filter(c => c.id !== clientIdToRemove));
                      } else {
                        setSellerClients(prev => prev.filter(c => c.id !== clientIdToRemove));
                      }
                    }}
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
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {/* Client Search/Add */}
        <Autocomplete
          options={clientOptions.filter(opt => !roleClients.some(c => c.id === opt.id))}
          loading={loadingClients}
          value={null}
          inputValue={clientSearch}
          onInputChange={(e, value, reason) => {
            // Only update search on user input, not on selection/reset
            if (reason === 'input') {
              setClientSearch(value);
            }
          }}
          getOptionLabel={(option) =>
            option ? `${option.firstName} ${option.lastName}${option.email ? ' - ' + option.email : ''}` : ''
          }
          isOptionEqualToValue={(option, value) => option?.id === value?.id}
          onChange={(event, client) => {
            if (!client) return;
            if (roleClients.some(c => c.id === client.id)) return;

            if (currentRole === 'buyer') {
              setBuyerClients([...buyerClients, client]);
            } else {
              setSellerClients([...sellerClients, client]);
            }
            // Clear search after adding
            setClientSearch('');
          }}
          clearOnBlur={false}
          blurOnSelect={true}
          filterOptions={(x) => x}
          renderOption={(props, option) => {
            const { key, ...otherProps } = props;
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
              placeholder={`Search or add ${roleLabel.toLowerCase()}...`}
              variant="outlined"
              autoFocus={!showRepresentationType}
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
      </Box>
    );
  };

  // Render content
  const content = (
    <Box
      onClick={(e) => e.stopPropagation()}
      onKeyDown={handleKeyPress}
      sx={{
        display: 'flex',
        justifyContent: 'center',
        width: '100%',
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 500 }}>
      {/* Representation Type Selector (Combined Mode Only) */}
      {showRepresentationType && (
        <>
          <Box sx={{ mb: 3 }}>
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
              Representation Type
            </Typography>

            <Typography
              variant="h4"
              sx={{
                fontWeight: 900,
                color: 'white',
                mb: 2,
                letterSpacing: '-1px',
              }}
            >
              Who do you represent?
            </Typography>

            <ToggleButtonGroup
              value={selectedType}
              exclusive
              onChange={handleTypeChange}
              fullWidth
              sx={{
                gap: 1.5,
                '& .MuiToggleButtonGroup-grouped': {
                  border: 'none',
                  '&:not(:first-of-type)': {
                    marginLeft: 0,
                    borderRadius: 2,
                  },
                  '&:first-of-type': {
                    borderRadius: 2,
                  },
                },
                '& .MuiToggleButton-root': {
                  color: 'rgba(255,255,255,0.7)',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  borderColor: 'rgba(255,255,255,0.2)',
                  fontWeight: 600,
                  py: 2.5,
                  px: 2,
                  fontSize: '0.95rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                  textTransform: 'none',
                  borderRadius: 2,
                  transition: 'all 0.2s',
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(255,255,255,0.25)',
                    color: 'white',
                    borderColor: 'rgba(255,255,255,0.5)',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.35)',
                    },
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.15)',
                  },
                },
              }}
            >
              <ToggleButton value="buyer">
                <Person sx={{ fontSize: 28 }} />
                <Typography variant="body2" fontWeight={600}>
                  Buyer
                </Typography>
              </ToggleButton>

              <ToggleButton value="seller">
                <Home sx={{ fontSize: 28 }} />
                <Typography variant="body2" fontWeight={600}>
                  Seller
                </Typography>
              </ToggleButton>

              <ToggleButton value="dual">
                <Group sx={{ fontSize: 28 }} />
                <Typography variant="body2" fontWeight={600}>
                  Dual
                </Typography>
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.2)' }} />
        </>
      )}

      {/* Client Selectors - Dynamic based on mode */}
      {showRepresentationType ? (
        // Combined mode: Show client selectors based on selectedType
        <>
          {selectedType === 'dual' ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {renderClientSelector('buyer')}
              <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
              {renderClientSelector('seller')}
            </Box>
          ) : (
            renderClientSelector(selectedType)
          )}

          {/* Action Buttons for Combined Mode */}
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
        </>
      ) : (
        // Role-specific or standalone mode: Show single client selector
        <>
          {/* Representation Type Header - Match combined mode style */}
          <Box sx={{ mb: 3 }}>
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
              {label.toUpperCase()}
            </Typography>

            {/* Title - Hide in inline mode */}
            {!inline && (
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 900,
                  color: 'white',
                  mb: 0,
                  letterSpacing: '-1px',
                }}
              >
                {selectedClients.length === 0
                  ? `Add ${label === 'Buyer' || label === 'Buyer(s)' ? 'Buyers' : label === 'Seller' || label === 'Seller(s)' ? 'Sellers' : 'Clients'}`
                  : `${selectedClients.length} ${label === 'Buyer' || label === 'Buyer(s)' ? 'Buyer' : label === 'Seller' || label === 'Seller(s)' ? 'Seller' : 'Client'}${selectedClients.length !== 1 ? 's' : ''}`
                }
              </Typography>
            )}
          </Box>

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
          value={null}
          inputValue={clientSearch}
          onInputChange={(e, value, reason) => {
            // Only update search on user input, not on selection/reset
            if (reason === 'input') {
              setClientSearch(value);
            }
          }}
          getOptionLabel={(option) =>
            option ? `${option.firstName} ${option.lastName}${option.email ? ' - ' + option.email : ''}` : ''
          }
          onChange={handleAddClient}
          clearOnBlur={false}
          blurOnSelect={true}
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
        </>
      )}
      </Box>
    </Box>
  );

  // Render with or without modal wrapper based on mode
  if (inline) {
    // Inline mode (used in NewEscrowModal flow): Return content directly without modal wrapper
    // This applies to BOTH role-specific mode AND combined representation type mode
    return content;
  }

  // Standalone mode: Wrap in ModalDialog
  const modalColor = showRepresentationType ? '#3b82f6' : color;
  const modalWidth = showRepresentationType ? 600 : 500;

  return (
    <ModalDialog
      open={open}
      onClose={onClose}
      color={modalColor}
      maxWidth={modalWidth}
    >
      {content}
    </ModalDialog>
  );
};
