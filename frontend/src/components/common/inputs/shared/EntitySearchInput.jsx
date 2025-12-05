import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Box, TextField, Autocomplete, CircularProgress, InputAdornment, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Search } from '@mui/icons-material';
import debounce from 'lodash/debounce';

/**
 * Generic Entity Search Input Component
 * Reusable autocomplete for searching database entities (clients, leads, listings, contacts)
 *
 * Features:
 * - Debounced search with configurable delay
 * - Customizable display labels and sublabels
 * - Themed to match modal backgrounds
 * - Returns full entity object on selection
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
 * @param {string} label - Optional label above input
 * @param {boolean} disabled - Disabled state
 * @param {boolean} autoFocus - Auto focus on mount
 * @param {number} debounceMs - Debounce delay in ms (default: 300)
 * @param {number} minSearchLength - Minimum chars before searching (default: 2)
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
  disabled = false,
  autoFocus = false,
  debounceMs = 300,
  minSearchLength = 2,
  noOptionsText = 'No results found',
  renderOption: customRenderOption,
}) => {
  const inputRef = useRef(null);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

  // Auto focus
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [autoFocus]);

  // Debounced search
  const debouncedSearch = useMemo(
    () => debounce(async (text) => {
      if (!text || text.length < minSearchLength) {
        setOptions([]);
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
    [searchFn, debounceMs, minSearchLength]
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
      setOptions([]); // Clear dropdown
      setSearchText(getDisplayLabel(selectedEntity)); // Show selected name
      onChange(selectedEntity);
    } else if (!selectedEntity) {
      onChange(null);
    }
  }, [onChange, getDisplayLabel]);

  // Default option renderer
  const defaultRenderOption = (props, option) => {
    const { key, ...otherProps } = props;
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
          <Icon sx={{ color: color, fontSize: 22 }} />
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

  return (
    <Box sx={{ width: '100%' }}>
      {label && (
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
          {label}
        </Typography>
      )}

      <Autocomplete
        options={options}
        loading={loading}
        loadingText={<span style={{ color: 'rgba(0,0,0,0.6)' }}>Searching...</span>}
        inputValue={searchText}
        onInputChange={handleInputChange}
        onChange={handleSelect}
        value={value}
        disabled={disabled}
        filterOptions={(x) => x} // Don't filter - server handles it
        getOptionLabel={(option) => typeof option === 'string' ? option : getDisplayLabel(option)}
        isOptionEqualToValue={(option, val) => getOptionKey(option) === getOptionKey(val)}
        noOptionsText={searchText.length >= minSearchLength ? noOptionsText : `Type ${minSearchLength}+ characters to search...`}
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

export default EntitySearchInput;
