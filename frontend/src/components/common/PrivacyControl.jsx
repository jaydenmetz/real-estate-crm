/**
 * PrivacyControl Component
 * Phase 6: Reusable privacy and sharing controls for all "New" modals
 *
 * Usage:
 * <PrivacyControl
 *   isPrivate={formData.isPrivate}
 *   accessLevel={formData.accessLevel}
 *   onPrivateChange={(value) => setFormData({ ...formData, isPrivate: value })}
 *   onAccessLevelChange={(value) => setFormData({ ...formData, accessLevel: value })}
 * />
 */

import React from 'react';
import {
  Box,
  Typography,
  FormControl,
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  FormHelperText,
  InputLabel,
} from '@mui/material';
import {
  Lock,
  LockOpen,
} from '@mui/icons-material';

const PrivacyControl = ({
  isPrivate,
  accessLevel,
  onPrivateChange,
  onAccessLevelChange,
}) => {
  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {isPrivate ? <Lock fontSize="small" /> : <LockOpen fontSize="small" />}
        Privacy & Sharing
      </Typography>

      {/* Privacy Toggle */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={isPrivate}
              onChange={(e) => onPrivateChange(e.target.checked)}
              color="error"
            />
          }
          label={
            <Box>
              <Typography variant="body2" fontWeight={500}>
                Private
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {isPrivate ? 'Only you can see this record' : 'Share with team or broker'}
              </Typography>
            </Box>
          }
        />
      </Box>

      {/* Access Level Dropdown (only shown when NOT private) */}
      {!isPrivate && (
        <FormControl fullWidth>
          <InputLabel>Sharing Level</InputLabel>
          <Select
            value={accessLevel}
            onChange={(e) => onAccessLevelChange(e.target.value)}
            label="Sharing Level"
          >
            <MenuItem value="team">
              <Box>
                <Typography variant="body2">Team</Typography>
                <Typography variant="caption" color="text.secondary">
                  Visible to all team members
                </Typography>
              </Box>
            </MenuItem>
            <MenuItem value="broker">
              <Box>
                <Typography variant="body2">Broker</Typography>
                <Typography variant="caption" color="text.secondary">
                  Visible to all users in your brokerage
                </Typography>
              </Box>
            </MenuItem>
          </Select>
          <FormHelperText>
            {accessLevel === 'team'
              ? 'Your team members can view and edit this record'
              : 'All users in your brokerage can view and edit this record'}
          </FormHelperText>
        </FormControl>
      )}
    </Box>
  );
};

export default PrivacyControl;
