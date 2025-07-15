import React, { useState } from 'react';
import { IconButton, Tooltip, Snackbar } from '@mui/material';
import { ContentCopy, Check } from '@mui/icons-material';

const CopyButton = ({ text, label = "Copy to clipboard" }) => {
  const [copied, setCopied] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setShowSnackbar(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <>
      <Tooltip title={copied ? "Copied!" : label}>
        <IconButton 
          size="small" 
          onClick={handleCopy}
          sx={{ 
            ml: 1,
            color: copied ? 'success.main' : 'inherit'
          }}
        >
          {copied ? <Check fontSize="small" /> : <ContentCopy fontSize="small" />}
        </IconButton>
      </Tooltip>
      <Snackbar
        open={showSnackbar}
        autoHideDuration={2000}
        onClose={() => setShowSnackbar(false)}
        message="Copied to clipboard"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </>
  );
};

export default CopyButton;