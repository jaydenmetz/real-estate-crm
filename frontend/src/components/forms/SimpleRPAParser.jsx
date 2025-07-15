import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  LinearProgress,
} from '@mui/material';
import {
  CloudUpload,
  Description,
  Close,
  CheckCircle,
} from '@mui/icons-material';
import { api } from '../../services/api';
import CopyButton from '../common/CopyButton';

const SimpleRPAParser = ({ onDataExtracted, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [extractedData, setExtractedData] = useState(null);

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setProgress(0);

    try {
      // Create FormData to send the PDF file
      const formData = new FormData();
      formData.append('rpa', file);
      
      setProgress(30);

      // Send to backend for processing
      const response = await api.post('/escrows/parse-rpa', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(30 + (percent * 0.4)); // 30-70% for upload
        }
      });

      setProgress(90);
      const data = response.data.extractedData || {};
      
      // Ensure we have at least empty buyer/seller arrays
      if (!data.buyers || data.buyers.length === 0) {
        data.buyers = [{ name: '', email: '', phone: '', lender: '', preApproved: false }];
      }
      if (!data.sellers || data.sellers.length === 0) {
        data.sellers = [{ name: '', email: '', phone: '' }];
      }

      setProgress(100);
      setExtractedData(data);
      
      // Auto-populate the form after a brief delay
      setTimeout(() => {
        onDataExtracted(data);
        setLoading(false);
      }, 500);
      
    } catch (err) {
      console.error('Error processing PDF:', err);
      setError(
        err.response?.data?.error || 
        'Failed to process PDF. Please ensure it\'s a valid RPA document or try the manual entry.'
      );
      setLoading(false);
      setProgress(0);
    }
  }, [onDataExtracted]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false,
    disabled: loading
  });

  return (
    <Box sx={{ mb: 3 }}>
      <Paper
        {...getRootProps()}
        sx={{
          p: 3,
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'grey.300',
          backgroundColor: isDragActive ? 'primary.50' : 'background.paper',
          cursor: loading ? 'default' : 'pointer',
          transition: 'all 0.3s ease',
          position: 'relative',
          '&:hover': {
            borderColor: loading ? 'grey.300' : 'primary.main',
            backgroundColor: loading ? 'background.paper' : 'primary.50',
          }
        }}
      >
        <input {...getInputProps()} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h6" color="primary">
            Auto-Fill from RPA
          </Typography>
          <IconButton size="small" onClick={onClose}>
            <Close />
          </IconButton>
        </Box>

        {loading ? (
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress size={40} sx={{ mb: 2 }} />
            <Typography variant="body1" gutterBottom>
              Processing RPA document...
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              sx={{ mb: 1, maxWidth: 300, mx: 'auto' }}
            />
            <Typography variant="caption" color="text.secondary">
              {progress < 70 ? 'Uploading and extracting text...' : 'Parsing escrow data...'}
            </Typography>
          </Box>
        ) : extractedData ? (
          <Box sx={{ textAlign: 'center' }}>
            <CheckCircle color="success" sx={{ fontSize: 48, mb: 2 }} />
            <Typography variant="h6" color="success.main" gutterBottom>
              RPA Data Extracted Successfully!
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              The form has been auto-populated with data from your RPA
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
              {extractedData.propertyAddress && <Chip label="Property Address" color="success" size="small" />}
              {extractedData.purchasePrice && <Chip label="Purchase Price" color="success" size="small" />}
              {extractedData.buyers?.length > 0 && extractedData.buyers[0].name && <Chip label="Buyers" color="success" size="small" />}
              {extractedData.sellers?.length > 0 && extractedData.sellers[0].name && <Chip label="Sellers" color="success" size="small" />}
              {extractedData.closingDate && <Chip label="Closing Date" color="success" size="small" />}
            </Box>
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center' }}>
            <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              {isDragActive ? 'Drop your RPA here...' : 'Drag & drop your Fully Executed RPA'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Upload a PDF of your Residential Purchase Agreement to auto-fill escrow details
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              <Description fontSize="small" />
              <Typography variant="caption">PDF files only</Typography>
            </Box>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2, position: 'relative' }}>
            {error}
            <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
              <CopyButton 
                text={error} 
                label="Copy error message" 
              />
            </Box>
          </Alert>
        )}
      </Paper>
    </Box>
  );
};

export default SimpleRPAParser;