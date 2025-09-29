import React, { useState } from 'react';
import { IconButton, Tooltip, Snackbar, Box } from '@mui/material';
import { ContentCopy, Check, Close } from '@mui/icons-material';
import { keyframes } from '@mui/system';

// Animation for success
const successPulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
`;

// Animation for failure
const failureShake = keyframes`
  0% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  50% { transform: translateX(5px); }
  75% { transform: translateX(-5px); }
  100% { transform: translateX(0); }
`;

const CopyButton = ({ text, label = "Copy to clipboard", onClick }) => {
  const [status, setStatus] = useState('idle'); // 'idle', 'success', 'error'
  const [showSnackbar, setShowSnackbar] = useState(false);

  const handleCopy = async (e) => {
    e.stopPropagation();
    if (onClick) onClick(e);
    try {
      await navigator.clipboard.writeText(text);
      setStatus('success');
      setShowSnackbar(true);
      setTimeout(() => {
        setStatus('idle');
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      setStatus('error');
      setTimeout(() => {
        setStatus('idle');
      }, 2000);
    }
  };

  return (
    <>
      <Tooltip title={status === 'success' ? "Copied!" : status === 'error' ? "Failed to copy" : label}>
        <IconButton
          size="small"
          onClick={handleCopy}
          sx={{
            ml: 1,
            color: status === 'success' ? 'success.main' : status === 'error' ? 'error.main' : 'inherit',
            animation: status === 'success' ? `${successPulse} 0.3s ease-in-out` :
                      status === 'error' ? `${failureShake} 0.3s ease-in-out` : 'none',
            transition: 'color 0.2s ease-in-out',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {status === 'success' ? (
              <Check fontSize="small" />
            ) : status === 'error' ? (
              <Close fontSize="small" />
            ) : (
              <ContentCopy fontSize="small" />
            )}
          </Box>
        </IconButton>
      </Tooltip>
      <Snackbar
        open={showSnackbar && status === 'success'}
        autoHideDuration={2000}
        onClose={() => setShowSnackbar(false)}
        message="Copied to clipboard"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </>
  );
};

export default CopyButton;