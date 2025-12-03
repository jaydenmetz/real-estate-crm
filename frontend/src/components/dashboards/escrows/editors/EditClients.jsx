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

  // State for which client type is currently being searched (null = not searching, 'buyer' or 'seller' = active search)
  const [activeSearchRole, setActiveSearchRole] = useState(null);

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
        const repType = values.representationType || 'buyer';
        setSelectedType(repType);
        // Note: buyerClients/sellerClients are loaded in the loadClients useEffect below
      } else {
        setSelectedType(representationType);
      }
      // Reset active search when modal opens
      setActiveSearchRole(null);
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
      // Reset active search when representation type changes
      setActiveSearchRole(null);
      setClientSearch('');
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

  // Debounced client search - like Google Address autocomplete
  // Searches on first character, returns up to 50 results
  const searchClientsDebounced = useCallback(
    debounce(async (searchText) => {
      if (!searchText || searchText.length < 1) {
        // No search text - load recent clients (up to 50)
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

      // Search starts on first character (like Google autocomplete)
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
        }));

        setClientOptions(transformedClients);
      } catch (error) {
        console.error('Error searching clients:', error);
        setClientOptions([]);
      } finally {
        setLoadingClients(false);
      }
    }, 150), // Faster debounce for responsive autocomplete
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
        // Combined mode: Inline "Add" placeholders that transform into search inputs
        <>
          {/* Render client list with inline add for each role based on selectedType */}
          {selectedType === 'dual' ? (
            // Dual mode: Show both buyer and seller sections
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Buyers Section */}
              <Box>
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
                  Buyer{buyerClients.length !== 1 ? 's' : ''}
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {/* Existing buyers */}
                  {buyerClients.map((client) => (
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
                          setBuyerClients(prev => prev.filter(c => c.id !== client.id));
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

                  {/* Add Buyer - Dotted placeholder or search input (max 6 buyers) */}
                  {buyerClients.length < 6 && (activeSearchRole === 'buyer' ? (
                    <Autocomplete
                      open
                      options={[
                        ...clientOptions.filter(opt => !buyerClients.some(c => c.id === opt.id)).slice(0, 3),
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
                          // TODO: Open create client modal
                          console.log('Add new client clicked');
                          return;
                        }
                        if (!buyerClients.some(c => c.id === client.id)) {
                          setBuyerClients([...buyerClients, client]);
                        }
                        setClientSearch('');
                        setActiveSearchRole(null);
                      }}
                      onBlur={() => {
                        setTimeout(() => {
                          setActiveSearchRole(null);
                          setClientSearch('');
                        }, 200);
                      }}
                      clearOnBlur={false}
                      blurOnSelect={true}
                      filterOptions={(options) => {
                        // Keep all regular options, always keep "Add New" at the end
                        const filtered = options.filter(opt => !opt.isAddNew);
                        const addNew = options.find(opt => opt.isAddNew);
                        return addNew ? [...filtered, addNew] : filtered;
                      }}
                      slotProps={{
                        popper: {
                          placement: 'bottom-start',
                          modifiers: [{ name: 'flip', enabled: false }],
                        },
                        listbox: {
                          sx: { maxHeight: 220 }, // 3 clients + Add New (~52px each)
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
                                Add New Client
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
                      onClick={() => setActiveSearchRole('buyer')}
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
                        Add Buyer
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>

              <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

              {/* Sellers Section */}
              <Box>
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
                  Seller{sellerClients.length !== 1 ? 's' : ''}
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {/* Existing sellers */}
                  {sellerClients.map((client) => (
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
                          setSellerClients(prev => prev.filter(c => c.id !== client.id));
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
                  {sellerClients.length < 6 && (activeSearchRole === 'seller' ? (
                    <Autocomplete
                      open
                      options={[
                        ...clientOptions.filter(opt => !sellerClients.some(c => c.id === opt.id)).slice(0, 3),
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
                          // TODO: Open create client modal
                          console.log('Add new client clicked');
                          return;
                        }
                        if (!sellerClients.some(c => c.id === client.id)) {
                          setSellerClients([...sellerClients, client]);
                        }
                        setClientSearch('');
                        setActiveSearchRole(null);
                      }}
                      onBlur={() => {
                        setTimeout(() => {
                          setActiveSearchRole(null);
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
                          modifiers: [{ name: 'flip', enabled: false }],
                        },
                        listbox: {
                          sx: { maxHeight: 220 }, // 3 clients + Add New (~52px each)
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
                                Add New Client
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
                      onClick={() => setActiveSearchRole('seller')}
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
              </Box>
            </Box>
          ) : (
            // Single mode (buyer or seller): Show single section with inline add
            <Box>
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
                {selectedType === 'buyer' ? 'Buyer' : 'Seller'}{(selectedType === 'buyer' ? buyerClients : sellerClients).length !== 1 ? 's' : ''}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {/* Existing clients */}
                {(selectedType === 'buyer' ? buyerClients : sellerClients).map((client) => (
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
                        if (selectedType === 'buyer') {
                          setBuyerClients(prev => prev.filter(c => c.id !== client.id));
                        } else {
                          setSellerClients(prev => prev.filter(c => c.id !== client.id));
                        }
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

                {/* Add Client - Dotted placeholder or search input (max 6 clients) */}
                {(selectedType === 'buyer' ? buyerClients : sellerClients).length < 6 && (activeSearchRole === selectedType ? (
                  <Autocomplete
                    open
                    options={[
                      ...clientOptions.filter(opt => !(selectedType === 'buyer' ? buyerClients : sellerClients).some(c => c.id === opt.id)).slice(0, 3),
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
                        // TODO: Open create client modal
                        console.log('Add new client clicked');
                        return;
                      }
                      if (selectedType === 'buyer') {
                        if (!buyerClients.some(c => c.id === client.id)) {
                          setBuyerClients([...buyerClients, client]);
                        }
                      } else {
                        if (!sellerClients.some(c => c.id === client.id)) {
                          setSellerClients([...sellerClients, client]);
                        }
                      }
                      setClientSearch('');
                      setActiveSearchRole(null);
                    }}
                    onBlur={() => {
                      setTimeout(() => {
                        setActiveSearchRole(null);
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
                        modifiers: [{ name: 'flip', enabled: false }],
                      },
                      listbox: {
                        sx: { maxHeight: 220 }, // 3 clients + Add New (~52px each)
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
                              Add New Client
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
                    onClick={() => setActiveSearchRole(selectedType)}
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
                      Add {selectedType === 'buyer' ? 'Buyer' : 'Seller'}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
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
            loadingClients ? 'Loading...' : 'No clients found'
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
