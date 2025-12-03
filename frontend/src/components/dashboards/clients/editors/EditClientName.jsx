import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  IconButton,
  TextField,
  Autocomplete,
  CircularProgress,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Check,
  Close,
  Person,
  ContentCopy,
  Email,
  Phone,
} from '@mui/icons-material';
import { ModalContainer } from '../../../common/modals/ModalContainer';
import { leadsAPI } from '../../../../services/api.service';
import debounce from 'lodash/debounce';

/**
 * Client Name Editor with Lead Search
 * Similar pattern to EditPropertyAddress with Google Maps autocomplete
 *
 * Features:
 * - Search leads database with autocomplete
 * - Shows "Selected Lead" when lead is chosen (like "Selected Address")
 * - Asks for "Legal Name" (display name) after selection
 * - Shows lead contact info (phone, email) in subtitle
 *
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Close handler
 * @param {function} onSave - Save handler (clientData) => void
 * @param {string} value - Current client name (display name)
 * @param {object} data - Full client object (contains lead_id, first_name, last_name, phone, email, etc.)
 * @param {boolean} inline - If true, hides action buttons (used in flow contexts)
 * @param {string} color - Theme color (default: purple for clients)
 */
export const EditClientName = ({
  open,
  onClose,
  onSave,
  value,
  data, // Full client object from CardTemplate
  inline = false,
  color = '#8b5cf6', // Purple for clients
}) => {
  // State for lead selection
  const [selectedLead, setSelectedLead] = useState(null);
  const [leadSearch, setLeadSearch] = useState('');
  const [leadOptions, setLeadOptions] = useState([]);
  const [loadingLeads, setLoadingLeads] = useState(false);

  // State for legal name (editable display name)
  const [legalName, setLegalName] = useState('');

  const [saving, setSaving] = useState(false);
  const [leadMenuAnchor, setLeadMenuAnchor] = useState(null);

  // Extract current values from data object
  const getCurrentName = () => {
    if (!data) return value || '';
    const firstName = data.firstName || data.first_name || '';
    const lastName = data.lastName || data.last_name || '';
    return `${firstName} ${lastName}`.trim() || value || '';
  };

  const getCurrentPhone = () => {
    if (!data) return '';
    return data.phone || data.client_phone || '';
  };

  const getCurrentEmail = () => {
    if (!data) return '';
    return data.email || data.client_email || '';
  };

  const currentName = getCurrentName();
  const currentPhone = getCurrentPhone();
  const currentEmail = getCurrentEmail();

  // Check if user has selected a new lead
  const hasSelectedNewLead = selectedLead !== null;

  // Reset state when modal opens/closes
  useEffect(() => {
    if (open) {
      setSelectedLead(null);
      setLegalName(currentName);
      setLeadSearch('');
    }
  }, [open]);

  // Update legalName when currentName changes (but only if no lead selected)
  useEffect(() => {
    if (!selectedLead) {
      setLegalName(currentName);
    }
  }, [currentName, selectedLead]);

  // Debounced lead search - like Google Address autocomplete
  const searchLeadsDebounced = useCallback(
    debounce(async (searchText) => {
      if (!searchText || searchText.length < 1) {
        // No search text - load recent leads
        setLoadingLeads(true);
        try {
          const response = await leadsAPI.getAll({
            limit: 30,
            sortBy: 'created_at',
            sortOrder: 'desc'
          });

          const results = response.success && response.data
            ? (response.data.leads || response.data || [])
            : [];

          const transformedLeads = results.map(lead => ({
            id: lead.lead_id || lead.id,
            firstName: lead.first_name || lead.firstName || '',
            lastName: lead.last_name || lead.lastName || '',
            phone: lead.phone || lead.lead_phone || '',
            email: lead.email || lead.lead_email || '',
            temperature: lead.temperature || lead.status || 'new',
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

      // Search starts on first character
      setLoadingLeads(true);
      try {
        const response = await leadsAPI.getAll({
          search: searchText,
          limit: 30
        });

        const results = response.success && response.data
          ? (response.data.leads || response.data || [])
          : [];

        const transformedLeads = results.map(lead => ({
          id: lead.lead_id || lead.id,
          firstName: lead.first_name || lead.firstName || '',
          lastName: lead.last_name || lead.lastName || '',
          phone: lead.phone || lead.lead_phone || '',
          email: lead.email || lead.lead_email || '',
          temperature: lead.temperature || lead.status || 'new',
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

  // Handle lead selection from autocomplete
  const handleLeadSelect = (event, lead) => {
    if (!lead) return;

    setSelectedLead(lead);
    // Pre-fill legal name with lead's name
    const fullName = `${lead.firstName} ${lead.lastName}`.trim();
    setLegalName(fullName);
    setLeadSearch('');

    // In inline mode, immediately notify parent
    if (inline && onSave) {
      onSave({
        lead_id: lead.id,
        first_name: lead.firstName,
        last_name: lead.lastName,
        phone: lead.phone,
        email: lead.email,
        display_name: fullName,
      });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Parse legal name into first/last
      const nameParts = legalName.trim().split(/\s+/);
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      if (selectedLead) {
        // Save with lead data
        await onSave({
          lead_id: selectedLead.id,
          first_name: firstName,
          last_name: lastName,
          phone: selectedLead.phone,
          email: selectedLead.email,
          display_name: legalName.trim(),
        });
      } else {
        // Just update the name
        await onSave({
          first_name: firstName,
          last_name: lastName,
          display_name: legalName.trim(),
        });
      }
      onClose();
    } catch (error) {
      console.error('Failed to save client:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && (selectedLead || legalName !== currentName)) {
      handleSave();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  // Lead menu handlers
  const handleLeadClick = (e) => {
    e.stopPropagation();
    setLeadMenuAnchor(e.currentTarget);
  };

  const handleLeadMenuClose = () => {
    setLeadMenuAnchor(null);
  };

  const handleCopyName = () => {
    const name = selectedLead
      ? `${selectedLead.firstName} ${selectedLead.lastName}`.trim()
      : currentName;
    navigator.clipboard.writeText(name);
    handleLeadMenuClose();
  };

  const handleCopyPhone = () => {
    const phone = selectedLead?.phone || currentPhone;
    if (phone) navigator.clipboard.writeText(phone);
    handleLeadMenuClose();
  };

  const handleCopyEmail = () => {
    const email = selectedLead?.email || currentEmail;
    if (email) navigator.clipboard.writeText(email);
    handleLeadMenuClose();
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
        {/* Selected Lead Section */}
        {(inline ? selectedLead : (currentName || selectedLead)) && (
          <Box sx={{ mb: 2 }}>
            {(!hasSelectedNewLead || inline) ? (
              /* Show single lead box (current in standalone, selected in inline) */
              <>
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: 'rgba(255,255,255,0.7)',
                    mb: 0.5,
                    display: 'block',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  {inline ? 'Selected Lead' : 'Current Client'}
                </Typography>
                <Box
                  onClick={handleLeadClick}
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 0.75,
                    cursor: 'pointer',
                    borderRadius: 1.5,
                    p: 0.75,
                    mx: inline ? 0 : -1,
                    border: '2px solid rgba(255,255,255,0.3)',
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    transition: 'all 0.2s',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.12)',
                      borderColor: 'rgba(255,255,255,0.4)',
                    },
                  }}
                >
                  <Person sx={{ color: 'white', mt: 0.25, fontSize: 20 }} />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: 700,
                        color: 'white',
                        fontSize: '0.9rem',
                        lineHeight: 1.3,
                        wordBreak: 'break-word',
                      }}
                    >
                      {inline && selectedLead
                        ? `${selectedLead.firstName} ${selectedLead.lastName}`.trim()
                        : currentName}
                    </Typography>
                    {((inline && selectedLead) || currentPhone || currentEmail) && (
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'rgba(255,255,255,0.7)',
                          display: 'block',
                          mt: 0.25,
                          fontSize: '0.75rem',
                        }}
                      >
                        {inline && selectedLead
                          ? [selectedLead.phone, selectedLead.email].filter(Boolean).join(' • ')
                          : [currentPhone, currentEmail].filter(Boolean).join(' • ')}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </>
            ) : (
              /* Show side-by-side comparison when new lead selected */
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Current Client */}
                {currentName && (
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: 'rgba(255,255,255,0.5)',
                        mb: 0.5,
                        display: 'block',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}
                    >
                      Current Client
                    </Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 1,
                        borderRadius: 2,
                        p: 1,
                        mx: -1,
                        backgroundColor: 'rgba(0,0,0,0.15)',
                        opacity: 0.6,
                      }}
                    >
                      <Person sx={{ color: 'white', mt: 0.5, fontSize: 20 }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: 'white',
                            fontSize: '0.875rem',
                            lineHeight: 1.4,
                            textDecoration: 'line-through',
                          }}
                        >
                          {currentName}
                        </Typography>
                        {(currentPhone || currentEmail) && (
                          <Typography
                            variant="caption"
                            sx={{
                              color: 'rgba(255,255,255,0.5)',
                              display: 'block',
                              mt: 0.25,
                              fontSize: '0.7rem',
                            }}
                          >
                            {[currentPhone, currentEmail].filter(Boolean).join(' • ')}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Box>
                )}

                {/* Selected Lead */}
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: 'rgba(255,255,255,0.9)',
                      mb: 0.5,
                      display: 'block',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    Selected Lead
                  </Typography>
                  <Box
                    onClick={handleLeadClick}
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 1,
                      cursor: 'pointer',
                      borderRadius: 2,
                      p: 1,
                      mx: -1,
                      border: '2px solid rgba(255,255,255,0.5)',
                      backgroundColor: 'rgba(255,255,255,0.12)',
                      transition: 'all 0.2s',
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.18)',
                        borderColor: 'rgba(255,255,255,0.7)',
                      },
                    }}
                  >
                    <Person sx={{ color: 'white', mt: 0.5, fontSize: 24 }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 700,
                          color: 'white',
                          fontSize: '1rem',
                          lineHeight: 1.4,
                        }}
                      >
                        {`${selectedLead.firstName} ${selectedLead.lastName}`.trim()}
                      </Typography>
                      {(selectedLead.phone || selectedLead.email) && (
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'rgba(255,255,255,0.8)',
                            display: 'block',
                            mt: 0.5,
                          }}
                        >
                          {[selectedLead.phone, selectedLead.email].filter(Boolean).join(' • ')}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Box>
              </Box>
            )}
          </Box>
        )}

        {/* Lead Action Menu */}
        <Menu
          anchorEl={leadMenuAnchor}
          open={Boolean(leadMenuAnchor)}
          onClose={handleLeadMenuClose}
          onClick={(e) => e.stopPropagation()}
          slotProps={{
            paper: {
              sx: {
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: 2,
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                minWidth: 200,
              },
            },
          }}
        >
          <MenuItem onClick={handleCopyName}>
            <ListItemIcon>
              <ContentCopy fontSize="small" />
            </ListItemIcon>
            <ListItemText>Copy name</ListItemText>
          </MenuItem>
          {(selectedLead?.phone || currentPhone) && (
            <MenuItem onClick={handleCopyPhone}>
              <ListItemIcon>
                <Phone fontSize="small" />
              </ListItemIcon>
              <ListItemText>Copy phone</ListItemText>
            </MenuItem>
          )}
          {(selectedLead?.email || currentEmail) && (
            <MenuItem onClick={handleCopyEmail}>
              <ListItemIcon>
                <Email fontSize="small" />
              </ListItemIcon>
              <ListItemText>Copy email</ListItemText>
            </MenuItem>
          )}
        </Menu>

        {/* Lead Search Autocomplete */}
        <Box sx={{ mb: 1.5 }}>
          <Typography
            variant="caption"
            sx={{
              fontSize: 10,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.7)',
              mb: 0.75,
              display: 'block',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            Search Leads
          </Typography>
          <Autocomplete
            options={leadOptions}
            getOptionLabel={(option) =>
              `${option.firstName} ${option.lastName}`.trim() || 'Unknown'
            }
            filterOptions={(x) => x} // Disable client-side filtering (server handles it)
            loading={loadingLeads}
            inputValue={leadSearch}
            onInputChange={(event, newValue) => setLeadSearch(newValue)}
            onChange={handleLeadSelect}
            isOptionEqualToValue={(option, value) => option.id === value?.id}
            noOptionsText={leadSearch ? "No leads found" : "Start typing to search..."}
            renderOption={(props, option) => {
              const { key, ...otherProps } = props;
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
                    <Typography
                      sx={{
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        color: 'text.primary',
                      }}
                    >
                      {`${option.firstName} ${option.lastName}`.trim() || 'Unknown'}
                    </Typography>
                    {(option.phone || option.email) && (
                      <Typography
                        sx={{
                          fontSize: '0.75rem',
                          color: 'text.secondary',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
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
                placeholder="Search by name, phone, or email..."
                autoFocus
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loadingLeads ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    borderRadius: 2,
                    '& fieldset': {
                      borderColor: 'rgba(255,255,255,0.3)',
                      borderWidth: 2,
                    },
                    '&:hover fieldset': {
                      borderColor: saving ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.5)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'white',
                    },
                  },
                  '& .MuiInputBase-input': {
                    color: 'white',
                    fontSize: '15px',
                    fontWeight: 500,
                    '&::placeholder': {
                      color: 'rgba(255,255,255,0.5)',
                      opacity: 1,
                    },
                  },
                  '& .MuiAutocomplete-popupIndicator': {
                    color: 'rgba(255,255,255,0.5)',
                  },
                  '& .MuiAutocomplete-clearIndicator': {
                    color: 'rgba(255,255,255,0.5)',
                  },
                }}
              />
            )}
            slotProps={{
              paper: {
                sx: {
                  backgroundColor: color,
                  borderRadius: 2,
                  mt: 1,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                  '& .MuiAutocomplete-option': {
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.1)',
                    },
                    '&[aria-selected="true"]': {
                      backgroundColor: 'rgba(255,255,255,0.15)',
                    },
                  },
                  '& .MuiAutocomplete-noOptions': {
                    color: 'rgba(255,255,255,0.7)',
                  },
                  '& .MuiAutocomplete-loading': {
                    color: 'rgba(255,255,255,0.7)',
                  },
                },
              },
            }}
          />
        </Box>

        {/* Legal Name Input */}
        <Box sx={{ mb: 1.5 }}>
          <Typography
            variant="caption"
            sx={{
              fontSize: 10,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.7)',
              mb: 0.75,
              display: 'block',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            Legal Name
          </Typography>
          <TextField
            fullWidth
            value={legalName}
            onChange={(e) => setLegalName(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={saving}
            placeholder="Enter legal name..."
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255,255,255,0.15)',
                borderRadius: 2,
                '& fieldset': {
                  borderColor: 'rgba(255,255,255,0.3)',
                  borderWidth: 2,
                },
                '&:hover fieldset': {
                  borderColor: saving ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.5)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'white',
                },
                '&.Mui-disabled': {
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  '& fieldset': {
                    borderColor: 'rgba(255,255,255,0.1)',
                  },
                },
              },
              '& .MuiInputBase-input': {
                color: 'white',
                fontSize: '15px',
                fontWeight: 500,
                '&::placeholder': {
                  color: 'rgba(255,255,255,0.5)',
                  opacity: 1,
                },
              },
            }}
          />
        </Box>

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
              disabled={saving || (!selectedLead && legalName === currentName)}
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
