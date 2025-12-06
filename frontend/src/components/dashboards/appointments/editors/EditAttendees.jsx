import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Box, Typography, IconButton, TextField, Autocomplete, CircularProgress, Chip } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Check, Close, PersonAdd, Delete, Person, PersonOutline } from '@mui/icons-material';
import { ModalContainer as ModalDialog } from '../../../common/modals/ModalContainer';
import { clientsAPI, leadsAPI } from '../../../../services/api.service';
import debounce from 'lodash/debounce';
import NewClientModal from '../../clients/modals/NewClientModal';
import NewLeadModal from '../../leads/modals/NewLeadModal';

/**
 * EditAttendees - Multi-type attendee editor for appointments
 * Supports clients and leads as attendees
 *
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Close handler
 * @param {function} onSave - Save handler (attendees) => void
 * @param {array} value - Array of attendee objects
 * @param {Object} data - Full appointment data
 * @param {string} color - Theme color
 * @param {boolean} inline - Render inline without modal wrapper
 */
export const EditAttendees = ({
  open,
  onClose,
  onSave,
  value = [],
  data,
  color = '#3b82f6',
  inline = false,
}) => {
  const [attendees, setAttendees] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);

  // State for modals
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [showNewLeadModal, setShowNewLeadModal] = useState(false);
  const [newPersonInitialName, setNewPersonInitialName] = useState({ firstName: '', lastName: '' });

  const hasLoadedInitialData = useRef(false);
  const valueRef = useRef(null);

  // Initialize when modal opens
  useEffect(() => {
    if (open) {
      setShowSearchInput(false);
    }
  }, [open]);

  // Reset when modal closes
  useEffect(() => {
    if (!open) {
      setAttendees([]);
      hasLoadedInitialData.current = false;
    }
  }, [open]);

  // Capture value in ref when it changes
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  // Load attendees when dialog opens
  useEffect(() => {
    if (!open || hasLoadedInitialData.current) return;

    hasLoadedInitialData.current = true;
    const currentValue = valueRef.current;

    if (currentValue && currentValue.length > 0) {
      // Map existing attendees to consistent format
      const mappedAttendees = currentValue.map(a => ({
        id: a.id,
        attendee_type: a.attendee_type || 'client',
        client_id: a.client_id,
        lead_id: a.lead_id,
        display_name: a.resolved_name || a.display_name || `${a.first_name || ''} ${a.last_name || ''}`.trim(),
        email: a.resolved_email || a.email,
        is_primary: a.is_primary || false,
      }));
      setAttendees(mappedAttendees);
    }
  }, [open]);

  // Auto-save when attendees change in inline mode
  useEffect(() => {
    if (inline && attendees.length >= 0) {
      onSave(attendees);
    }
  }, [attendees, inline, onSave]);

  // Debounced search for clients and leads
  const searchPeopleDebounced = useCallback(
    debounce(async (text) => {
      setLoading(true);
      try {
        // Search both clients and leads in parallel
        const [clientsResponse, leadsResponse] = await Promise.all([
          clientsAPI.getAll({
            search: text || undefined,
            limit: text ? 10 : 5,
            sortBy: 'created_at',
            sortOrder: 'desc',
          }),
          leadsAPI.getAll({
            search: text || undefined,
            limit: text ? 10 : 5,
            sortBy: 'created_at',
            sortOrder: 'desc',
          }),
        ]);

        const clients = (clientsResponse.success && clientsResponse.data
          ? (clientsResponse.data.clients || clientsResponse.data || [])
          : []
        ).map(c => ({
          type: 'client',
          id: c.client_id || c.id,
          display_name: `${c.first_name || ''} ${c.last_name || ''}`.trim() || 'Unknown',
          email: c.email,
          phone: c.phone,
        }));

        const leads = (leadsResponse.success && leadsResponse.data
          ? (leadsResponse.data.leads || leadsResponse.data || [])
          : []
        ).map(l => ({
          type: 'lead',
          id: l.id,
          display_name: `${l.first_name || ''} ${l.last_name || ''}`.trim() || l.email || 'Unknown',
          email: l.email,
          phone: l.phone,
        }));

        setSearchResults([...clients, ...leads]);
      } catch (error) {
        console.error('Error searching people:', error);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    }, 150),
    []
  );

  useEffect(() => {
    searchPeopleDebounced(searchText);
  }, [searchText, searchPeopleDebounced]);

  // Handle adding an attendee
  const handleAddAttendee = (person) => {
    if (!person || person.isAddClient || person.isAddLead) return;

    // Check if already added
    const alreadyAdded = attendees.some(a =>
      (person.type === 'client' && a.client_id === person.id) ||
      (person.type === 'lead' && a.lead_id === person.id)
    );

    if (alreadyAdded) return;

    const newAttendee = {
      attendee_type: person.type,
      client_id: person.type === 'client' ? person.id : null,
      lead_id: person.type === 'lead' ? person.id : null,
      display_name: person.display_name,
      email: person.email,
      is_primary: attendees.length === 0, // First attendee is primary
    };

    setAttendees(prev => [...prev, newAttendee]);
    setSearchText('');
    setShowSearchInput(false);
  };

  // Handle removing an attendee
  const handleRemoveAttendee = (index) => {
    setAttendees(prev => {
      const updated = prev.filter((_, i) => i !== index);
      // If removed primary and there are others, make first one primary
      if (updated.length > 0 && !updated.some(a => a.is_primary)) {
        updated[0].is_primary = true;
      }
      return updated;
    });
  };

  // Handle setting primary attendee
  const handleSetPrimary = (index) => {
    setAttendees(prev =>
      prev.map((a, i) => ({
        ...a,
        is_primary: i === index,
      }))
    );
  };

  // Handle opening new client modal
  const handleOpenNewClientModal = () => {
    const nameParts = (searchText?.trim() || '').split(/\s+/);
    setNewPersonInitialName({
      firstName: nameParts[0] || '',
      lastName: nameParts.slice(1).join(' ') || '',
    });
    setShowNewClientModal(true);
    setSearchText('');
    setShowSearchInput(false);
  };

  // Handle opening new lead modal
  const handleOpenNewLeadModal = () => {
    const nameParts = (searchText?.trim() || '').split(/\s+/);
    setNewPersonInitialName({
      firstName: nameParts[0] || '',
      lastName: nameParts.slice(1).join(' ') || '',
    });
    setShowNewLeadModal(true);
    setSearchText('');
    setShowSearchInput(false);
  };

  // Handle new client created
  const handleNewClientCreated = async (clientId) => {
    try {
      const response = await clientsAPI.getById(clientId);
      if (response.success && response.data) {
        const newAttendee = {
          attendee_type: 'client',
          client_id: response.data.client_id || response.data.id,
          lead_id: null,
          display_name: `${response.data.first_name || ''} ${response.data.last_name || ''}`.trim(),
          email: response.data.email,
          is_primary: attendees.length === 0,
        };
        setAttendees(prev => [...prev, newAttendee]);
      }
    } catch (error) {
      console.error('Error fetching new client:', error);
    } finally {
      setShowNewClientModal(false);
    }
  };

  // Handle new lead created
  const handleNewLeadCreated = async (leadId) => {
    try {
      const response = await leadsAPI.getById(leadId);
      if (response.success && response.data) {
        const newAttendee = {
          attendee_type: 'lead',
          client_id: null,
          lead_id: response.data.id,
          display_name: `${response.data.first_name || ''} ${response.data.last_name || ''}`.trim(),
          email: response.data.email,
          is_primary: attendees.length === 0,
        };
        setAttendees(prev => [...prev, newAttendee]);
      }
    } catch (error) {
      console.error('Error fetching new lead:', error);
    } finally {
      setShowNewLeadModal(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(attendees);
      onClose?.();
    } catch (error) {
      console.error('Failed to save attendees:', error);
    } finally {
      setSaving(false);
    }
  };

  // Filter out already added people from search results
  const filteredResults = searchResults.filter(person =>
    !attendees.some(a =>
      (person.type === 'client' && a.client_id === person.id) ||
      (person.type === 'lead' && a.lead_id === person.id)
    )
  );

  const content = (
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
        Attendee{attendees.length !== 1 ? 's' : ''} ({attendees.length})
      </Typography>

      {/* Attendees List */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {attendees.map((attendee, index) => (
          <Box
            key={`${attendee.attendee_type}-${attendee.client_id || attendee.lead_id || index}`}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              bgcolor: 'rgba(255,255,255,0.1)',
              borderRadius: 2,
              px: 2,
              py: 1.5,
              border: attendee.is_primary ? `2px solid ${alpha(color, 0.5)}` : '2px solid transparent',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
              {attendee.attendee_type === 'client' ? (
                <Person sx={{ color: '#8b5cf6', fontSize: 20 }} />
              ) : (
                <PersonOutline sx={{ color: '#3b82f6', fontSize: 20 }} />
              )}
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" fontWeight={600} color="white">
                    {attendee.display_name}
                  </Typography>
                  <Chip
                    label={attendee.attendee_type}
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: '0.65rem',
                      bgcolor: attendee.attendee_type === 'client'
                        ? alpha('#8b5cf6', 0.2)
                        : alpha('#3b82f6', 0.2),
                      color: 'white',
                    }}
                  />
                  {attendee.is_primary && (
                    <Chip
                      label="primary"
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: '0.65rem',
                        bgcolor: alpha(color, 0.3),
                        color: 'white',
                      }}
                    />
                  )}
                </Box>
                {attendee.email && (
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                    {attendee.email}
                  </Typography>
                )}
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {!attendee.is_primary && (
                <IconButton
                  onClick={() => handleSetPrimary(index)}
                  size="small"
                  sx={{
                    color: 'rgba(255,255,255,0.5)',
                    '&:hover': { color: color, bgcolor: 'rgba(255,255,255,0.1)' },
                  }}
                  title="Set as primary"
                >
                  <Check fontSize="small" />
                </IconButton>
              )}
              <IconButton
                onClick={() => handleRemoveAttendee(index)}
                size="small"
                sx={{
                  color: 'rgba(255,255,255,0.5)',
                  '&:hover': { color: '#ef4444', bgcolor: 'rgba(255,255,255,0.1)' },
                }}
              >
                <Delete fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        ))}

        {/* Add Attendee */}
        {attendees.length < 10 && (showSearchInput ? (
          <Autocomplete
            open
            options={[
              ...filteredResults.slice(0, 6),
              { isAddClient: true },
              { isAddLead: true },
            ]}
            loading={loading}
            value={null}
            inputValue={searchText}
            onInputChange={(e, value, reason) => {
              if (reason === 'input') setSearchText(value);
            }}
            getOptionLabel={(option) => {
              if (option.isAddClient) return '+ Add New Client';
              if (option.isAddLead) return '+ Add New Lead';
              return option ? `${option.display_name}${option.email ? ' - ' + option.email : ''}` : '';
            }}
            isOptionEqualToValue={(option, value) => option?.id === value?.id}
            onChange={(event, selected) => {
              if (!selected) return;
              if (selected.isAddClient) {
                handleOpenNewClientModal();
                return;
              }
              if (selected.isAddLead) {
                handleOpenNewLeadModal();
                return;
              }
              handleAddAttendee(selected);
            }}
            onBlur={() => {
              setTimeout(() => {
                setShowSearchInput(false);
                setSearchText('');
              }, 200);
            }}
            clearOnBlur={false}
            blurOnSelect={true}
            filterOptions={(options) => {
              const people = options.filter(o => !o.isAddClient && !o.isAddLead);
              const addOptions = options.filter(o => o.isAddClient || o.isAddLead);
              return [...people, ...addOptions];
            }}
            renderOption={(props, option) => {
              const { key, ...otherProps } = props;
              if (option.isAddClient || option.isAddLead) {
                return (
                  <Box
                    component="li"
                    key={key}
                    {...otherProps}
                    sx={{
                      borderTop: option.isAddClient ? '1px solid' : 'none',
                      borderColor: 'divider',
                      color: option.isAddClient ? '#8b5cf6' : '#3b82f6',
                      fontWeight: 600,
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                  >
                    <PersonAdd sx={{ mr: 1, fontSize: 18 }} />
                    <Typography variant="body2" fontWeight={600}>
                      {searchText?.trim()
                        ? `Add "${searchText.trim()}" as New ${option.isAddClient ? 'Client' : 'Lead'}`
                        : `Add New ${option.isAddClient ? 'Client' : 'Lead'}`}
                    </Typography>
                  </Box>
                );
              }
              return (
                <Box component="li" key={key} {...otherProps}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    {option.type === 'client' ? (
                      <Person sx={{ color: '#8b5cf6', fontSize: 20 }} />
                    ) : (
                      <PersonOutline sx={{ color: '#3b82f6', fontSize: 20 }} />
                    )}
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {option.display_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.type} {option.email ? `- ${option.email}` : ''}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              );
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Search clients or leads..."
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
                      {loading ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
            noOptionsText={loading ? 'Loading...' : 'No people found'}
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
              Add Attendee
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Action Buttons - Only show when NOT inline */}
      {!inline && (
        <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'flex-end' }}>
          <IconButton
            onClick={onClose}
            disabled={saving}
            sx={{
              width: 48,
              height: 48,
              backgroundColor: 'rgba(255,255,255,0.15)',
              color: 'white',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.25)' },
            }}
          >
            <Close />
          </IconButton>
          <IconButton
            onClick={handleSave}
            disabled={saving}
            sx={{
              width: 48,
              height: 48,
              backgroundColor: 'white',
              color: color,
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.9)' },
            }}
          >
            <Check />
          </IconButton>
        </Box>
      )}
    </Box>
  );

  // Modals
  const modals = (
    <>
      <NewClientModal
        open={showNewClientModal}
        onClose={() => {
          setShowNewClientModal(false);
          setNewPersonInitialName({ firstName: '', lastName: '' });
        }}
        onSuccess={handleNewClientCreated}
        initialData={newPersonInitialName}
      />
      <NewLeadModal
        open={showNewLeadModal}
        onClose={() => {
          setShowNewLeadModal(false);
          setNewPersonInitialName({ firstName: '', lastName: '' });
        }}
        onSuccess={handleNewLeadCreated}
        initialData={newPersonInitialName}
      />
    </>
  );

  if (inline) {
    return (
      <>
        {content}
        {modals}
      </>
    );
  }

  return (
    <>
      <ModalDialog open={open} onClose={onClose} color={color} maxWidth={500}>
        {content}
      </ModalDialog>
      {modals}
    </>
  );
};

export default EditAttendees;
