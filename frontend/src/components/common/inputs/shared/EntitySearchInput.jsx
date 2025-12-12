import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Box, TextField, Autocomplete, CircularProgress, InputAdornment, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Search, Add as AddIcon } from '@mui/icons-material';
import debounce from 'lodash/debounce';

// Special marker for "Add New" option
const ADD_NEW_OPTION_ID = '__add_new__';

// Convert color names to hex values that MUI's alpha() function can process
const normalizeColor = (color) => {
  if (!color) return '#8b5cf6'; // Default purple
  // If already a valid format (starts with # or rgb), return as-is
  if (color.startsWith('#') || color.startsWith('rgb')) return color;
  // Map common color names to hex
  const colorMap = {
    white: '#ffffff',
    black: '#000000',
    red: '#ff0000',
    green: '#00ff00',
    blue: '#0000ff',
    purple: '#8b5cf6',
    orange: '#f97316',
    yellow: '#eab308',
    gray: '#6b7280',
    grey: '#6b7280',
  };
  return colorMap[color.toLowerCase()] || '#8b5cf6'; // Fallback to default purple
};

/**
 * Generic Entity Search Input Component
 * Reusable autocomplete for searching database entities (clients, leads, listings, contacts)
 *
 * Features:
 * - Shows 5 most recently created items by default (on focus)
 * - Debounced search starting from first character
 * - Customizable display labels and sublabels
 * - Themed to match modal backgrounds
 * - Returns full entity object on selection
 * - Built-in "Add New" option support
 * - Dynamic label that changes based on selection state
 *
 * @param {function} searchFn - Async function to search entities: (searchText) => Promise<array>
 * @param {function} getDisplayLabel - Function to get main display text: (entity) => string
 * @param {function} getSubLabel - Optional function to get secondary text: (entity) => string
 * @param {function} getOptionKey - Function to get unique key: (entity) => string|number
 * @param {object} value - Currently selected entity object
 * @param {function} onChange - Change handler: (entity) => void
 * @param {React.Component} icon - Icon component to show in input
 * @param {string} color - Theme color for styling
 * @param {string} placeholder - Placeholder text
 * @param {string} label - Static label (overrides dynamic labels if provided)
 * @param {string} initialLabel - Label shown before selection (e.g., "Select Lead")
 * @param {string} selectedLabel - Label shown after selection (e.g., "Client Name")
 * @param {boolean} disabled - Disabled state
 * @param {boolean} autoFocus - Auto focus on mount
 * @param {number} debounceMs - Debounce delay in ms (default: 300)
 * @param {number} minSearchLength - Minimum chars before searching (default: 1)
 * @param {function} onAddNew - Optional callback when "Add New" is clicked: (searchText) => void
 * @param {function} addNewLabel - Optional function to generate "Add New" label: (searchText) => string
 * @param {React.Component} addNewIcon - Optional icon for "Add New" option (default: AddIcon)
 * @param {function} fetchRecentFn - Optional async function to fetch recent items: () => Promise<array>
 */
export const EntitySearchInput = ({
  searchFn,
  getDisplayLabel,
  getSubLabel,
  getOptionKey = (entity) => entity.id,
  value,
  onChange,
  icon: Icon = Search,
  color = '#8b5cf6',
  placeholder = 'Search...',
  label,
  initialLabel,
  selectedLabel,
  disabled = false,
  autoFocus = false,
  debounceMs = 300,
  minSearchLength = 1,
  noOptionsText = 'No results found',
  renderOption: customRenderOption,
  // "Add New" functionality
  onAddNew,
  addNewLabel = (text) => `Add "${text}" as New`,
  addNewIcon: AddNewIcon = AddIcon,
  // Recent items functionality
  fetchRecentFn,
}) => {
  const inputRef = useRef(null);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [recentItems, setRecentItems] = useState([]);
  const [hasFetched, setHasFetched] = useState(false);

  // Auto focus
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [autoFocus]);

  // Fetch recent items (5 most recently created) - called once on first focus or mount
  const fetchRecentItems = useCallback(async () => {
    if (hasFetched) return; // Only fetch once

    try {
      setLoading(true);
      // Use custom fetchRecentFn if provided, otherwise use searchFn with empty string
      const fetchFn = fetchRecentFn || searchFn;
      const results = await fetchFn('');
      const recent = (results || []).slice(0, 5); // Limit to 5 most recent
      setRecentItems(recent);
      setOptions(recent);
      setHasFetched(true);
    } catch (error) {
      console.error('EntitySearchInput fetch recent error:', error);
      setRecentItems([]);
    } finally {
      setLoading(false);
    }
  }, [searchFn, fetchRecentFn, hasFetched]);

  // Debounced search - triggers on first character
  const debouncedSearch = useMemo(
    () => debounce(async (text) => {
      // If no search text, show recent items
      if (!text || text.length < minSearchLength) {
        setOptions(recentItems);
        setLoading(false);
        return;
      }

      try {
        const results = await searchFn(text);
        setOptions(results || []);
      } catch (error) {
        console.error('EntitySearchInput search error:', error);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    }, debounceMs),
    [searchFn, debounceMs, minSearchLength, recentItems]
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const handleInputChange = useCallback((event, newValue, reason) => {
    if (reason === 'input') {
      setSearchText(newValue);
      setLoading(true);
      debouncedSearch(newValue);
    } else if (reason === 'clear') {
      setSearchText('');
      setOptions([]);
      onChange(null);
    }
  }, [debouncedSearch, onChange]);

  const handleSelect = useCallback((event, selectedEntity) => {
    if (selectedEntity && typeof selectedEntity !== 'string') {
      // Check if this is the "Add New" option
      if (selectedEntity.id === ADD_NEW_OPTION_ID && onAddNew) {
        onAddNew(searchText.trim());
        return;
      }

      setOptions([]); // Clear dropdown
      setSearchText(getDisplayLabel(selectedEntity)); // Show selected name
      onChange(selectedEntity);
    } else if (!selectedEntity) {
      onChange(null);
    }
  }, [onChange, getDisplayLabel, onAddNew, searchText]);

  // Normalize color for use with MUI's alpha() function
  const safeColor = normalizeColor(color);

  // Default option renderer
  const defaultRenderOption = (props, option) => {
    const { key, ...otherProps } = props;

    // Handle "Add New" option
    if (option.id === ADD_NEW_OPTION_ID) {
      return (
        <Box
          component="li"
          key={key}
          {...otherProps}
          sx={{
            py: 1.5,
            borderTop: '1px solid rgba(0,0,0,0.1)',
            backgroundColor: alpha(safeColor, 0.05),
            '&:hover': {
              backgroundColor: alpha(safeColor, 0.1),
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <AddNewIcon sx={{ color: safeColor, fontSize: 22 }} />
            <Typography sx={{ fontWeight: 600, fontSize: '0.9rem', color: safeColor }}>
              {addNewLabel(searchText.trim())}
            </Typography>
          </Box>
        </Box>
      );
    }

    const displayLabel = getDisplayLabel(option);
    const subLabel = getSubLabel ? getSubLabel(option) : null;

    return (
      <Box
        component="li"
        key={key}
        {...otherProps}
        sx={{ py: 1.5 }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Icon sx={{ color: safeColor, fontSize: 22 }} />
          <Box>
            <Typography sx={{ fontWeight: 600, fontSize: '0.9rem', color: 'text.primary' }}>
              {displayLabel}
            </Typography>
            {subLabel && (
              <Typography sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                {subLabel}
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
    );
  };

  // Compute options with "Add New" appended when applicable
  const optionsWithAddNew = useMemo(() => {
    // Add "Add New" option if:
    // 1. onAddNew callback is provided
    // 2. There's search text with content
    // 3. Search is not loading
    if (onAddNew && searchText.trim().length > 0 && !loading) {
      return [...options, { id: ADD_NEW_OPTION_ID, isAddNew: true }];
    }
    return options;
  }, [options, onAddNew, searchText, loading]);

  // Compute display label: static label > dynamic (initial/selected) > null
  const displayLabel = useMemo(() => {
    // Static label takes precedence
    if (label) return label;
    // Dynamic labels based on selection state
    if (initialLabel || selectedLabel) {
      return value ? (selectedLabel || initialLabel) : (initialLabel || selectedLabel);
    }
    return null;
  }, [label, initialLabel, selectedLabel, value]);

  return (
    <Box sx={{ width: '100%' }}>
      {displayLabel && (
        <Typography
          variant="caption"
          sx={{
            fontSize: 11,
            fontWeight: 600,
            color: 'rgba(255,255,255,0.7)',
            mb: 1,
            display: 'block',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          {displayLabel}
        </Typography>
      )}

      <Autocomplete
        options={optionsWithAddNew}
        loading={loading}
        loadingText={<span style={{ color: 'rgba(0,0,0,0.6)' }}>Searching...</span>}
        inputValue={searchText}
        onInputChange={handleInputChange}
        onChange={handleSelect}
        onOpen={fetchRecentItems}
        value={value}
        disabled={disabled}
        filterOptions={(x) => x} // Don't filter - server handles it
        getOptionLabel={(option) => {
          if (typeof option === 'string') return option;
          if (option.id === ADD_NEW_OPTION_ID) return addNewLabel(searchText.trim());
          return getDisplayLabel(option);
        }}
        isOptionEqualToValue={(option, val) => {
          // Handle "Add New" option
          if (option?.id === ADD_NEW_OPTION_ID || val?.id === ADD_NEW_OPTION_ID) return false;
          return getOptionKey(option) === getOptionKey(val);
        }}
        noOptionsText={noOptionsText}
        renderOption={customRenderOption || defaultRenderOption}
        renderInput={(params) => (
          <TextField
            {...params}
            inputRef={inputRef}
            placeholder={placeholder}
            size="small"
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <InputAdornment position="start">
                  <Icon sx={{ color: 'rgba(255,255,255,0.5)', fontSize: 20 }} />
                </InputAdornment>
              ),
              endAdornment: (
                <>
                  {loading ? <CircularProgress color="inherit" size={18} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderRadius: 2,
                '& fieldset': { borderColor: 'rgba(255,255,255,0.2)', borderWidth: 1 },
                '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.4)' },
                '&.Mui-focused fieldset': { borderColor: 'rgba(255,255,255,0.6)' },
                '&.Mui-disabled': {
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                },
              },
              '& .MuiInputBase-input': {
                color: 'white',
                fontSize: '0.9rem',
                '&::placeholder': { color: 'rgba(255,255,255,0.4)', opacity: 1 },
              },
              '& .MuiAutocomplete-endAdornment .MuiSvgIcon-root': {
                color: 'rgba(255,255,255,0.5)',
              },
            }}
          />
        )}
        slotProps={{
          paper: {
            sx: {
              backgroundColor: '#fff',
              borderRadius: 2,
              mt: 1,
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            },
          },
        }}
      />
    </Box>
  );
};

// Export the constant for external use (e.g., custom renderOption implementations)
export { ADD_NEW_OPTION_ID };

export default EntitySearchInput;
