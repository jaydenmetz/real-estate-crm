import React from 'react';
import {
  Select,
  MenuItem,
} from '@mui/material';

/**
 * ScopeFilter - Team/User scope selector
 *
 * @param {Array} scopeOptions - Scope options from config
 * @param {string} selectedScope - Currently selected scope
 * @param {Function} onScopeChange - Handler for scope change
 */
const ScopeFilter = ({
  scopeOptions = [],
  selectedScope,
  onScopeChange,
}) => {
  if (scopeOptions.length === 0) return null;

  return (
    <>
      {/* Desktop */}
      <Select
        value={selectedScope}
        onChange={(e) => onScopeChange(e.target.value)}
        size="small"
        sx={{
          display: { xs: 'none', md: 'block' },
          minWidth: 160,
          height: 32,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: 2,
          fontWeight: 600,
          fontSize: '0.875rem',
          border: '1px solid',
          borderColor: 'divider',
          transition: 'all 0.2s',
          '&:hover': {
            borderColor: 'primary.main',
            backgroundColor: 'rgba(255, 255, 255, 1)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          },
          '& .MuiSelect-select': {
            py: 0.5,
            px: 1.5,
          },
          '& .MuiOutlinedInput-notchedOutline': {
            border: 'none',
          },
        }}
      >
        {scopeOptions.map(option => (
          <MenuItem key={option.value} value={option.value}>
            {option.fullLabel || option.label}
          </MenuItem>
        ))}
      </Select>

      {/* Mobile */}
      <Select
        value={selectedScope}
        onChange={(e) => onScopeChange(e.target.value)}
        size="small"
        sx={{
          display: { xs: 'block', md: 'none' },
          minWidth: 140,
          backgroundColor: 'white',
          borderRadius: 2,
          fontWeight: 600,
          fontSize: '0.875rem',
          '& .MuiSelect-select': {
            py: 1,
            px: 1.5,
          },
        }}
      >
        {scopeOptions.map(option => (
          <MenuItem key={option.value} value={option.value}>
            {option.fullLabel || option.label}
          </MenuItem>
        ))}
      </Select>
    </>
  );
};

export default ScopeFilter;
