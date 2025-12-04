import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  IconButton,
  TextField,
  Autocomplete,
  CircularProgress,
} from '@mui/material';
import { Check, Close, PersonAdd, Delete, Person } from '@mui/icons-material';
import { ModalContainer } from '../../../common/modals/ModalContainer';
import { leadsAPI } from '../../../../services/api.service';
import debounce from 'lodash/debounce';
import NewLeadModal from '../../leads/modals/NewLeadModal';

/**
 * EditLeads - Lead selector for Clients (like EditClients for Escrows)
 * Searches leads database, allows selecting existing or adding new leads
 *
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Close handler
 * @param {function} onSave - Save handler (leads) => void
 * @param {array} value - Array of current lead objects or IDs
 * @param {string} color - Theme color
 * @param {boolean} inline - If true, hides action buttons (used in flow contexts)
 */
export const EditLeads = ({
  open,
  onClose,
  onSave,
  value = [],
  color = '#3b82f6', // Blue for leads
  inline = false,
}) => {
  // State for lead selection
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [leadSearch, setLeadSearch] = useState('');
  const [leadOptions, setLeadOptions] = useState([]);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [saving, setSaving] = useState(false);

  // State for NewLeadModal
  const [showNewLeadModal, setShowNewLeadModal] = useState(false);
  const [newLeadInitialName, setNewLeadInitialName] = useState({ firstName: '', lastName: '' });

  // Load selected leads when dialog opens
  useEffect(() => {
    const loadLeads = async () => {
      if (!open) {
        setSelectedLeads([]);
        setLeadSearch('');
        setLeadOptions([]);
        return;
      }

      if (!value || value.length === 0) {
        setSelectedLeads([]);
        return;
      }

      // Check if value contains full objects or just IDs
      const isFullObject = (item) => item && typeof item === 'object' && (item.firstName || item.first_name);

      if (isFullObject(value[0])) {
        // Already full objects - use directly
        const mappedLeads = value.map(l => ({
          id: l.id || l.lead_id,
          firstName: l.firstName || l.first_name,
          lastName: l.lastName || l.last_name,
          phone: l.phone || l.lead_phone,
          email: l.email || l.lead_email,
          temperature: l.temperature || l.status,
        }));
        setSelectedLeads(mappedLeads);
      } else {
        // Just IDs - fetch from API
        try {
          const leadPromises = value.map(id => leadsAPI.getById(id));
          const results = await Promise.all(leadPromises);
          const leads = results
            .filter(r => r.success && r.data)
            .map(r => ({
              id: r.data.lead_id || r.data.id,
              firstName: r.data.first_name,
              lastName: r.data.last_name,
              phone: r.data.phone || r.data.lead_phone,
              email: r.data.email || r.data.lead_email,
              temperature: r.data.temperature || r.data.status,
            }));
          setSelectedLeads(leads);
        } catch (error) {
          console.error('Error loading leads:', error);
          setSelectedLeads([]);
        }
      }
    };

    loadLeads();
  }, [open, value]);

  // Debounced lead search
  const searchLeadsDebounced = useCallback(
    debounce(async (searchText) => {
      if (!searchText || searchText.length < 1) {
        // No search text - load recent leads
        setLoadingLeads(true);
        try {
          const response = await leadsAPI.getAll({
            limit: 50,
            sortBy: 'created_at',
            sortOrder: 'desc'
          });

          const results = response.success && response.data
            ? (response.data.leads || response.data || [])
            : [];

          const transformedLeads = results.map(lead => ({
            id: lead.lead_id || lead.id,
            firstName: lead.first_name,
            lastName: lead.last_name,
            phone: lead.phone || lead.lead_phone,
            email: lead.email || lead.lead_email,
            temperature: lead.temperature || lead.status,
          }));

          setLeadOptions(transformedLeads);
        } catch (error) {
          console.error('Error loading recent leads:', error);
          setLeadOptions([]);
        } finally {
          setLoadingLeads(false);
        }
        return;
      }

      setLoadingLeads(true);
      try {
        const response = await leadsAPI.getAll({
          search: searchText,
          limit: 50
        });

        const results = response.success && response.data
          ? (response.data.leads || response.data || [])
          : [];

        const transformedLeads = results.map(lead => ({
          id: lead.lead_id || lead.id,
          firstName: lead.first_name,
          lastName: lead.last_name,
          phone: lead.phone || lead.lead_phone,
          email: lead.email || lead.lead_email,
          temperature: lead.temperature || lead.status,
        }));

        setLeadOptions(transformedLeads);
      } catch (error) {
        console.error('Error searching leads:', error);
        setLeadOptions([]);
      } finally {
        setLoadingLeads(false);
      }
    }, 150),
    []
  );

  useEffect(() => {
    if (open) {
      searchLeadsDebounced(leadSearch);
    }
  }, [leadSearch, searchLeadsDebounced, open]);

  // Handle opening NewLeadModal
  const handleOpenNewLeadModal = () => {
    const nameParts = (leadSearch?.trim() || '').split(/\s+/);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    setNewLeadInitialName({ firstName, lastName });
    setShowNewLeadModal(true);
    setLeadSearch('');
  };

  // Handle when a new lead is created
  const handleNewLeadCreated = async (leadId) => {
    try {
      const response = await leadsAPI.getById(leadId);
      if (response.success && response.data) {
        const newLead = {
          id: response.data.lead_id || response.data.id,
          firstName: response.data.first_name,
          lastName: response.data.last_name,
          phone: response.data.phone || response.data.lead_phone,
          email: response.data.email || response.data.lead_email,
          temperature: response.data.temperature || response.data.status,
        };
        setSelectedLeads(prev => [...prev, newLead]);
      }
    } catch (error) {
      console.error('Error fetching newly created lead:', error);
    } finally {
      setShowNewLeadModal(false);
      setNewLeadInitialName({ firstName: '', lastName: '' });
    }
  };

  const handleAddLead = (event, lead) => {
    if (!lead) return;

    // Handle "Add New Lead" option
    if (lead.isAddNew) {
      handleOpenNewLeadModal();
      return;
    }

    // Check if already selected
    if (selectedLeads.some(l => l.id === lead.id)) return;

    setSelectedLeads([...selectedLeads, lead]);
    setLeadSearch('');

    // In inline mode, immediately notify parent
    if (inline && onSave) {
      onSave([...selectedLeads, lead]);
    }
  };

  const handleRemoveLead = (leadId) => {
    const newLeads = selectedLeads.filter(l => l.id !== leadId);
    setSelectedLeads(newLeads);

    // In inline mode, immediately notify parent
    if (inline && onSave) {
      onSave(newLeads);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(selectedLeads);
      onClose();
    } catch (error) {
      console.error('Failed to save leads:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && selectedLeads.length > 0) {
      handleSave();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  // Get temperature color for lead
  const getTemperatureColor = (temp) => {
    const colors = {
      hot: '#ef4444',
      warm: '#f59e0b',
      cold: '#3b82f6',
      new: '#10b981',
    };
    return colors[temp?.toLowerCase()] || '#8b5cf6';
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
        {/* Header */}
        <Box sx={{ mb: 2 }}>
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
            {selectedLeads.length === 1 ? 'Lead' : 'Leads'}
          </Typography>

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
              {selectedLeads.length === 0
                ? 'Add Leads'
                : `${selectedLeads.length} Lead${selectedLeads.length !== 1 ? 's' : ''}`
              }
            </Typography>
          )}
        </Box>

        {/* Selected Leads List */}
        {selectedLeads.length > 0 && (
          <Box sx={{ mb: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
            {selectedLeads.map((lead) => (
              <Box
                key={lead.id}
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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      backgroundColor: getTemperatureColor(lead.temperature),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Person sx={{ fontSize: 18, color: 'white' }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" fontWeight={600} color="white">
                      {lead.firstName} {lead.lastName}
                    </Typography>
                    {(lead.phone || lead.email) && (
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                        {[lead.phone, lead.email].filter(Boolean).join(' • ')}
                      </Typography>
                    )}
                  </Box>
                </Box>
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveLead(lead.id);
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
          </Box>
        )}

        {/* Lead Search/Add */}
        <Autocomplete
          options={[
            ...leadOptions.filter(opt => !selectedLeads.some(l => l.id === opt.id)),
            { id: '__add_new__', isAddNew: true }
          ]}
          loading={loadingLeads}
          value={null}
          inputValue={leadSearch}
          onInputChange={(e, value, reason) => {
            if (reason === 'input') setLeadSearch(value);
          }}
          getOptionLabel={(option) =>
            option?.isAddNew ? '+ Add New Lead' : option ? `${option.firstName} ${option.lastName}${option.email ? ' - ' + option.email : ''}` : ''
          }
          isOptionEqualToValue={(option, value) => option?.id === value?.id}
          onChange={handleAddLead}
          clearOnBlur={false}
          blurOnSelect={true}
          filterOptions={(options) => {
            const filtered = options.filter(opt => !opt.isAddNew);
            const addNew = options.find(opt => opt.isAddNew);
            return addNew ? [...filtered, addNew] : filtered;
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
                    {leadSearch?.trim() ? `Add "${leadSearch.trim()}" as New Lead` : 'Add New Lead'}
                  </Typography>
                </Box>
              );
            }
            return (
              <Box
                component="li"
                key={key}
                {...otherProps}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  py: 1,
                }}
              >
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    backgroundColor: getTemperatureColor(option.temperature),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Person sx={{ fontSize: 18, color: 'white' }} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" fontWeight={600}>
                    {option.firstName} {option.lastName}
                  </Typography>
                  {(option.phone || option.email) && (
                    <Typography variant="caption" color="text.secondary">
                      {[option.phone, option.email].filter(Boolean).join(' • ')}
                    </Typography>
                  )}
                </Box>
              </Box>
            );
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Search or add leads..."
              variant="outlined"
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
                    {loadingLeads ? <CircularProgress color="inherit" size={20} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
          noOptionsText={loadingLeads ? 'Loading...' : 'No leads found'}
        />

        {/* Action Buttons - Only show in standalone mode */}
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

      {/* NewLeadModal */}
      <NewLeadModal
        open={showNewLeadModal}
        onClose={() => {
          setShowNewLeadModal(false);
          setNewLeadInitialName({ firstName: '', lastName: '' });
        }}
        onSuccess={handleNewLeadCreated}
      />
    </Box>
  );

  // Render with or without modal wrapper based on mode
  if (inline) {
    return content;
  }

  return (
    <ModalContainer open={open} onClose={onClose} color={color} maxWidth={520}>
      {content}
    </ModalContainer>
  );
};

export default EditLeads;
